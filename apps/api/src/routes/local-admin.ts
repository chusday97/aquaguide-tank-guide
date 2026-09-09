import express, { Router } from 'express';
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApiError, asyncRoute, sendData } from '../http';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '../../../..');
const partitions = new Set(['business', 'compatibility', 'care-seo']);
const supportedMime = new Set(['image/png', 'image/jpeg', 'image/webp']);
const maxAssetBytes = 20 * 1024 * 1024;

const isEnabled = () => (
  process.env.ADMIN_LOCAL_FILE_MODE === 'true'
  && process.env.NODE_ENV !== 'production'
  && !process.env.VERCEL
);

const localRoot = () => path.resolve(process.env.ADMIN_LOCAL_FILE_ROOT || path.join(repoRoot, '.local/aqua-admin'));
const requireEnabled = () => {
  if (!isEnabled()) throw new ApiError(404, 'NOT_FOUND', 'Local Admin file persistence is not enabled.');
};
const safePartition = (value: string) => {
  if (!partitions.has(value)) throw new ApiError(400, 'VALIDATION_ERROR', 'Unknown Local Admin partition.');
  return value;
};
const safeAssetId = (value: string) => {
  if (!/^local-asset-[A-Za-z0-9-]+$/.test(value)) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid Local asset id.');
  return value;
};
const stateFile = (partition: string) => path.join(localRoot(), `${safePartition(partition)}.json`);
const assetFile = (assetId: string) => path.join(localRoot(), 'assets', `${safeAssetId(assetId)}.blob`);
const assetMetaFile = (assetId: string) => path.join(localRoot(), 'assets', `${safeAssetId(assetId)}.json`);

const atomicJsonWrite = async (filePath: string, value: unknown) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temp, filePath);
};
const readJsonOrNull = async (filePath: string) => {
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as unknown;
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return null;
    throw error;
  }
};

export const localAdminFileRouter = Router();

localAdminFileRouter.get('/status', asyncRoute(async (request, response) => {
  requireEnabled();
  const root = localRoot();
  const present: Record<string, boolean> = {};
  for (const partition of partitions) {
    try { await stat(stateFile(partition)); present[partition] = true; } catch { present[partition] = false; }
  }
  return sendData(request, response, { enabled: true, root, partitions: present });
}));

localAdminFileRouter.get('/state/:partition', asyncRoute(async (request, response) => {
  requireEnabled();
  const partition = safePartition(request.params.partition);
  const value = await readJsonOrNull(stateFile(partition));
  if (value === null) throw new ApiError(404, 'NOT_FOUND', `Local Admin partition ${partition} has not been initialized.`);
  return sendData(request, response, { partition, state: value });
}));

localAdminFileRouter.put('/state/:partition', asyncRoute(async (request, response) => {
  requireEnabled();
  const partition = safePartition(request.params.partition);
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Local Admin partition state must be a JSON object.');
  }
  await atomicJsonWrite(stateFile(partition), request.body);
  return sendData(request, response, { partition, persisted: true });
}));

localAdminFileRouter.put(
  '/assets/:assetId',
  express.raw({ type: ['image/png', 'image/jpeg', 'image/webp'], limit: '20mb' }),
  asyncRoute(async (request, response) => {
    requireEnabled();
    const assetId = safeAssetId(request.params.assetId);
    const mimeType = request.header('content-type')?.split(';')[0].trim() || '';
    if (!supportedMime.has(mimeType)) throw new ApiError(400, 'VALIDATION_ERROR', 'Only PNG, JPEG and WebP Local assets are supported.');
    if (!Buffer.isBuffer(request.body) || request.body.length === 0) throw new ApiError(400, 'VALIDATION_ERROR', 'Local asset body is empty.');
    if (request.body.length > maxAssetBytes) throw new ApiError(413, 'PAYLOAD_TOO_LARGE', '图片不能超过 20MB。');
    const directory = path.dirname(assetFile(assetId));
    await mkdir(directory, { recursive: true });
    await writeFile(assetFile(assetId), request.body);
    await atomicJsonWrite(assetMetaFile(assetId), { mimeType, byteSize: request.body.length, updatedAt: new Date().toISOString() });
    return sendData(request, response, { assetId, persisted: true, mimeType, byteSize: request.body.length }, 201);
  }),
);

localAdminFileRouter.get('/assets/:assetId', asyncRoute(async (request, response) => {
  requireEnabled();
  const assetId = safeAssetId(request.params.assetId);
  const metadata = await readJsonOrNull(assetMetaFile(assetId)) as { mimeType?: string } | null;
  if (!metadata) throw new ApiError(404, 'NOT_FOUND', 'Local asset metadata was not found.');
  try {
    const body = await readFile(assetFile(assetId));
    response.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).send(body);
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') throw new ApiError(404, 'NOT_FOUND', 'Local asset was not found.');
    throw error;
  }
}));

localAdminFileRouter.delete('/assets/:assetId', asyncRoute(async (request, response) => {
  requireEnabled();
  const assetId = safeAssetId(request.params.assetId);
  const { unlink } = await import('node:fs/promises');
  await Promise.all([
    unlink(assetFile(assetId)).catch(error => {
      if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') throw error;
    }),
    unlink(assetMetaFile(assetId)).catch(error => {
      if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') throw error;
    }),
  ]);
  return sendData(request, response, { assetId, removed: true });
}));
