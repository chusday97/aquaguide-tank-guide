import express, { Router } from 'express';
import { cp, mkdir, readFile, readdir, rename, rm, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApiError, asyncRoute, sendData } from '../http';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '../../../..');
const partitionNames = ['business', 'compatibility', 'care-seo'] as const;
type LocalAdminPartition = typeof partitionNames[number];
const partitions = new Set<string>(partitionNames);
const supportedStateSchemaVersion: Record<LocalAdminPartition, number> = { business: 1, compatibility: 1, 'care-seo': 1 };
const localFileFormatVersion = 1;
const backupFormatVersion = 1;
const supportedMime = new Set(['image/png', 'image/jpeg', 'image/webp']);
const maxAssetBytes = 20 * 1024 * 1024;

type JsonRecord = Record<string, unknown>;
type LocalFileEnvelope = {
  localFileFormatVersion: number;
  partition: LocalAdminPartition;
  stateSchemaVersion: number;
  savedAt: string;
  state: JsonRecord;
};
type IntegrityIssue = { severity: 'error' | 'warning'; code: string; message: string };
type IntegrityReport = {
  healthy: boolean;
  checkedAt: string;
  partitions: Record<LocalAdminPartition, boolean>;
  assets: { referenced: number; metadata: number; blobs: number; orphaned: number };
  issues: IntegrityIssue[];
};
type BackupManifest = {
  backupFormatVersion: number;
  localFileFormatVersion: number;
  id: string;
  createdAt: string;
  reason: string;
  healthyAtBackup: boolean;
  errorCount: number;
  warningCount: number;
};

const isEnabled = () => (
  process.env.ADMIN_LOCAL_FILE_MODE === 'true'
  && process.env.NODE_ENV !== 'production'
  && !process.env.VERCEL
);
const localRoot = () => path.resolve(process.env.ADMIN_LOCAL_FILE_ROOT || path.join(repoRoot, '.local/aqua-admin'));
const requireEnabled = () => {
  if (!isEnabled()) throw new ApiError(404, 'NOT_FOUND', 'Local Admin file persistence is not enabled.');
};
const safePartition = (value: string): LocalAdminPartition => {
  if (!partitions.has(value)) throw new ApiError(400, 'VALIDATION_ERROR', 'Unknown Local Admin partition.');
  return value as LocalAdminPartition;
};
const safeAssetId = (value: string) => {
  if (!/^local-asset-[A-Za-z0-9-]+$/.test(value)) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid Local asset id.');
  return value;
};
const safeBackupId = (value: string) => {
  if (!/^backup-\d{13,17}$/.test(value)) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid Local Admin backup id.');
  return value;
};
const asRecord = (value: unknown): JsonRecord | null => (
  value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null
);
const pathExists = async (filePath: string) => {
  try { await stat(filePath); return true; } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return false;
    throw error;
  }
};
const stateFile = (root: string, partition: LocalAdminPartition) => path.join(root, `${partition}.json`);
const assetDirectory = (root: string) => path.join(root, 'assets');
const assetFile = (root: string, assetId: string) => path.join(assetDirectory(root), `${safeAssetId(assetId)}.blob`);
const assetMetaFile = (root: string, assetId: string) => path.join(assetDirectory(root), `${safeAssetId(assetId)}.json`);
const backupsDirectory = (root: string) => path.join(root, 'backups');
const backupDirectory = (root: string, backupId: string) => path.join(backupsDirectory(root), safeBackupId(backupId));

const atomicJsonWrite = async (filePath: string, value: unknown) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temp, filePath);
};
const atomicBufferWrite = async (filePath: string, value: Buffer) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(temp, value);
  await rename(temp, filePath);
};
const readJsonOrNull = async (filePath: string) => {
  try { return JSON.parse(await readFile(filePath, 'utf8')) as unknown; }
  catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return null;
    throw error;
  }
};
const validateState = (partition: LocalAdminPartition, value: unknown) => {
  const record = asRecord(value);
  if (!record) throw new ApiError(409, 'MIGRATION_REJECTED', `Local ${partition} state is not a JSON object.`);
  const schemaVersion = Number(record.schemaVersion);
  const supported = supportedStateSchemaVersion[partition];
  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new ApiError(409, 'MIGRATION_REJECTED', `Local ${partition} state is missing a valid schemaVersion.`);
  }
  if (schemaVersion > supported) {
    throw new ApiError(409, 'MIGRATION_REJECTED', `Local ${partition} schema v${schemaVersion} is newer than this app supports (v${supported}); refusing to overwrite newer data.`);
  }
  if (schemaVersion !== supported) {
    throw new ApiError(409, 'MIGRATION_REJECTED', `Local ${partition} schema v${schemaVersion} requires an explicit migration before it can be opened.`);
  }
  return record;
};
const envelopeFor = (partition: LocalAdminPartition, state: JsonRecord): LocalFileEnvelope => ({
  localFileFormatVersion,
  partition,
  stateSchemaVersion: Number(state.schemaVersion),
  savedAt: new Date().toISOString(),
  state,
});
const decodeStateFile = (partition: LocalAdminPartition, value: unknown) => {
  const record = asRecord(value);
  if (!record) throw new ApiError(409, 'MIGRATION_REJECTED', `Local ${partition} file is invalid.`);
  if (!('localFileFormatVersion' in record)) {
    const state = validateState(partition, record);
    return { state, envelope: envelopeFor(partition, state), migratedLegacy: true };
  }
  const formatVersion = Number(record.localFileFormatVersion);
  if (formatVersion > localFileFormatVersion) {
    throw new ApiError(409, 'MIGRATION_REJECTED', `Local File format v${formatVersion} is newer than this app supports (v${localFileFormatVersion}).`);
  }
  if (formatVersion !== localFileFormatVersion) {
    throw new ApiError(409, 'MIGRATION_REJECTED', `Local File format v${formatVersion} requires an explicit migration.`);
  }
  if (record.partition !== partition) throw new ApiError(409, 'MIGRATION_REJECTED', `Local File partition mismatch: expected ${partition}.`);
  const state = validateState(partition, record.state);
  if (Number(record.stateSchemaVersion) !== Number(state.schemaVersion)) {
    throw new ApiError(409, 'MIGRATION_REJECTED', `Local ${partition} envelope/state schema versions do not match.`);
  }
  return { state, envelope: record as unknown as LocalFileEnvelope, migratedLegacy: false };
};
const readPartitionState = async (root: string, partition: LocalAdminPartition, migrateLegacy = false) => {
  let raw: unknown;
  try { raw = await readJsonOrNull(stateFile(root, partition)); }
  catch {
    throw new ApiError(409, 'MIGRATION_REJECTED', `Local ${partition} JSON cannot be parsed; refusing seed fallback or overwrite.`);
  }
  if (raw === null) return null;
  const decoded = decodeStateFile(partition, raw);
  if (decoded.migratedLegacy && migrateLegacy) await atomicJsonWrite(stateFile(root, partition), decoded.envelope);
  return decoded.state;
};
const writePartitionState = async (root: string, partition: LocalAdminPartition, value: unknown) => {
  const state = validateState(partition, value);
  await atomicJsonWrite(stateFile(root, partition), envelopeFor(partition, state));
};

const collectReferencedAssets = (value: unknown, result = new Set<string>()) => {
  if (!value || typeof value !== 'object') return result;
  if (Array.isArray(value)) { value.forEach(item => collectReferencedAssets(item, result)); return result; }
  const record = value as JsonRecord;
  if (record.storageBucket === 'local-file' && typeof record.id === 'string') result.add(record.id);
  Object.values(record).forEach(item => collectReferencedAssets(item, result));
  return result;
};
const inspectRoot = async (root: string): Promise<IntegrityReport> => {
  const issues: IntegrityIssue[] = [];
  const present: Record<LocalAdminPartition, boolean> = { business: false, compatibility: false, 'care-seo': false };
  const states: Partial<Record<LocalAdminPartition, JsonRecord>> = {};
  for (const partition of partitionNames) {
    try {
      const state = await readPartitionState(root, partition, false);
      present[partition] = state !== null;
      if (state) states[partition] = state;
    } catch (error) {
      present[partition] = true;
      issues.push({ severity: 'error', code: `INVALID_${partition.toUpperCase().replace('-', '_')}`, message: error instanceof Error ? error.message : `Invalid ${partition} state.` });
    }
  }

  const metadataIds = new Set<string>();
  const blobIds = new Set<string>();
  try {
    const entries = await readdir(assetDirectory(root), { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (/^local-asset-[A-Za-z0-9-]+\.json$/.test(entry.name)) metadataIds.add(entry.name.slice(0, -5));
      if (/^local-asset-[A-Za-z0-9-]+\.blob$/.test(entry.name)) blobIds.add(entry.name.slice(0, -5));
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') throw error;
  }
  for (const id of new Set([...metadataIds, ...blobIds])) {
    if (!metadataIds.has(id) || !blobIds.has(id)) {
      issues.push({ severity: 'error', code: 'ASSET_PAIR_MISSING', message: `${id} 缺少 ${metadataIds.has(id) ? 'blob' : 'metadata'} 文件。` });
      continue;
    }
    try {
      const metadata = asRecord(await readJsonOrNull(assetMetaFile(root, id)));
      const bytes = await stat(assetFile(root, id));
      if (!metadata || !supportedMime.has(String(metadata.mimeType || ''))) {
        issues.push({ severity: 'error', code: 'ASSET_META_INVALID', message: `${id} 图片 metadata 无效。` });
      } else if (Number(metadata.byteSize) !== bytes.size) {
        issues.push({ severity: 'error', code: 'ASSET_SIZE_MISMATCH', message: `${id} 图片 metadata byteSize 与 blob 不一致。` });
      }
    } catch (error) {
      issues.push({ severity: 'error', code: 'ASSET_READ_FAILED', message: `${id} 图片文件无法完整读取：${error instanceof Error ? error.message : 'unknown error'}` });
    }
  }

  const referenced = collectReferencedAssets(states.business);
  for (const id of referenced) {
    if (!metadataIds.has(id) || !blobIds.has(id)) issues.push({ severity: 'error', code: 'REFERENCED_ASSET_MISSING', message: `Business state 引用了不存在的本地图片 ${id}。` });
  }
  const orphaned = [...metadataIds].filter(id => blobIds.has(id) && !referenced.has(id));
  for (const id of orphaned) issues.push({ severity: 'warning', code: 'ORPHAN_ASSET', message: `${id} 存在于磁盘，但当前 Business state 未引用。` });

  const compatibility = states.compatibility;
  if (compatibility) {
    const profiles = Array.isArray(compatibility.reviewedProfiles) ? compatibility.reviewedProfiles.length : -1;
    const pairs = Array.isArray(compatibility.reviewedPairRules) ? compatibility.reviewedPairRules.length : -1;
    if (profiles !== 7 || pairs !== 4) issues.push({ severity: 'error', code: 'COMPATIBILITY_BASELINE_INCOMPLETE', message: `Compatibility reviewed baseline 应为 7 Profiles / 4 Pair Rules，当前为 ${profiles}/${pairs}。` });
  }

  const careSeo = states['care-seo'];
  const business = states.business;
  if (careSeo && Array.isArray(careSeo.revisions)) {
    const meta = asRecord(business?.publishedCareMeta) || {};
    for (const revision of careSeo.revisions as unknown[]) {
      const row = asRecord(revision);
      if (!row) continue;
      const catalogKey = typeof row.sourceCareCatalogKey === 'string' ? row.sourceCareCatalogKey : '';
      const sourceVersion = Number(row.sourceCareVersion);
      const current = asRecord(meta[catalogKey]);
      const currentVersion = Number(current?.sourceVersion);
      if (!catalogKey || !Number.isInteger(sourceVersion) || sourceVersion < 1) {
        issues.push({ severity: 'error', code: 'CARE_SEO_SOURCE_INVALID', message: 'Care SEO revision 缺少有效 Published Care source/version。' });
      } else if (!business || !Number.isInteger(currentVersion) || currentVersion < sourceVersion) {
        issues.push({ severity: 'error', code: 'CARE_SEO_SOURCE_MISSING', message: `Care SEO ${catalogKey} v${sourceVersion} 找不到对应的 Published Care source version。` });
      }
    }
  }

  const errorCount = issues.filter(issue => issue.severity === 'error').length;
  return {
    healthy: errorCount === 0,
    checkedAt: new Date().toISOString(),
    partitions: present,
    assets: { referenced: referenced.size, metadata: metadataIds.size, blobs: blobIds.size, orphaned: orphaned.length },
    issues,
  };
};

const readBackupManifest = async (root: string, backupId: string) => {
  const manifest = asRecord(await readJsonOrNull(path.join(backupDirectory(root, backupId), 'manifest.json')));
  if (!manifest) throw new ApiError(404, 'NOT_FOUND', `Local Admin backup ${backupId} was not found.`);
  if (Number(manifest.backupFormatVersion) !== backupFormatVersion) {
    throw new ApiError(409, 'MIGRATION_REJECTED', `Backup ${backupId} uses unsupported backup format v${String(manifest.backupFormatVersion)}.`);
  }
  return manifest as unknown as BackupManifest;
};
const copyActiveData = async (sourceRoot: string, destinationRoot: string) => {
  await mkdir(destinationRoot, { recursive: true });
  for (const partition of partitionNames) {
    const source = stateFile(sourceRoot, partition);
    if (await pathExists(source)) await cp(source, stateFile(destinationRoot, partition));
  }
  if (await pathExists(assetDirectory(sourceRoot))) await cp(assetDirectory(sourceRoot), assetDirectory(destinationRoot), { recursive: true });
};
const createBackup = async (reason: string, requireHealthy: boolean) => {
  const root = localRoot();
  const integrity = await inspectRoot(root);
  if (requireHealthy && !integrity.healthy) {
    throw new ApiError(409, 'MIGRATION_REJECTED', '当前 Local Admin 数据存在完整性错误；请先处理错误，再创建正常备份。');
  }
  let stamp = Date.now();
  let id = `backup-${stamp}`;
  while (await pathExists(backupDirectory(root, id))) {
    stamp += 1;
    id = `backup-${stamp}`;
  }
  const destination = backupDirectory(root, id);
  await copyActiveData(root, destination);
  const manifest: BackupManifest = {
    backupFormatVersion,
    localFileFormatVersion,
    id,
    createdAt: new Date().toISOString(),
    reason,
    healthyAtBackup: integrity.healthy,
    errorCount: integrity.issues.filter(issue => issue.severity === 'error').length,
    warningCount: integrity.issues.filter(issue => issue.severity === 'warning').length,
  };
  await atomicJsonWrite(path.join(destination, 'manifest.json'), manifest);
  return manifest;
};
const listBackups = async () => {
  const root = localRoot();
  let entries: string[] = [];
  try { entries = await readdir(backupsDirectory(root)); }
  catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return [];
    throw error;
  }
  const results: BackupManifest[] = [];
  for (const id of entries.filter(name => /^backup-\d{13,17}$/.test(name)).sort().reverse()) {
    try { results.push(await readBackupManifest(root, id)); } catch { /* invalid backup remains on disk but is not offered for restore */ }
  }
  return results;
};
const applyBackupDirectory = async (source: string) => {
  const root = localRoot();
  const tempAssets = path.join(root, `.restore-assets-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  await rm(tempAssets, { recursive: true, force: true });
  try {
    if (await pathExists(assetDirectory(source))) await cp(assetDirectory(source), tempAssets, { recursive: true });
    for (const partition of partitionNames) {
      const sourceFile = stateFile(source, partition);
      const targetFile = stateFile(root, partition);
      if (await pathExists(sourceFile)) await atomicBufferWrite(targetFile, await readFile(sourceFile));
      else await unlink(targetFile).catch(error => { if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') throw error; });
    }
    await rm(assetDirectory(root), { recursive: true, force: true });
    if (await pathExists(tempAssets)) await rename(tempAssets, assetDirectory(root));
  } catch (error) {
    await rm(tempAssets, { recursive: true, force: true });
    throw error;
  }
};
const restoreBackup = async (backupId: string) => {
  const root = localRoot();
  const id = safeBackupId(backupId);
  await readBackupManifest(root, id);
  const source = backupDirectory(root, id);
  const targetIntegrity = await inspectRoot(source);
  if (!targetIntegrity.healthy) throw new ApiError(409, 'MIGRATION_REJECTED', `Backup ${id} 未通过完整性校验，拒绝恢复。`);
  const safety = await createBackup('pre-restore-safety', false);
  try {
    await applyBackupDirectory(source);
    const restoredIntegrity = await inspectRoot(root);
    if (!restoredIntegrity.healthy) throw new ApiError(409, 'MIGRATION_REJECTED', '恢复后完整性校验失败。');
    return { backupId: id, safetyBackupId: safety.id, integrity: restoredIntegrity };
  } catch (error) {
    try { await applyBackupDirectory(backupDirectory(root, safety.id)); }
    catch { throw new ApiError(500, 'INTERNAL_ERROR', `恢复 ${id} 失败，且 safety backup ${safety.id} 自动回滚失败；请停止写入并人工检查本地文件。`); }
    if (error instanceof ApiError) {
      throw new ApiError(error.status, error.code, `${error.message} 已自动回滚到恢复前 safety backup ${safety.id}。`);
    }
    throw new ApiError(500, 'INTERNAL_ERROR', `恢复 ${id} 过程中发生文件系统错误；已自动回滚到恢复前 safety backup ${safety.id}。`);
  }
};

export const localAdminFileRouter = Router();

localAdminFileRouter.get('/status', asyncRoute(async (request, response) => {
  requireEnabled();
  const root = localRoot();
  const present: Record<LocalAdminPartition, boolean> = { business: false, compatibility: false, 'care-seo': false };
  for (const partition of partitionNames) present[partition] = await pathExists(stateFile(root, partition));
  return sendData(request, response, { enabled: true, root, localFileFormatVersion, partitions: present });
}));
localAdminFileRouter.get('/integrity', asyncRoute(async (request, response) => {
  requireEnabled();
  return sendData(request, response, await inspectRoot(localRoot()));
}));
localAdminFileRouter.get('/backups', asyncRoute(async (request, response) => {
  requireEnabled();
  return sendData(request, response, { backups: await listBackups() });
}));
localAdminFileRouter.post('/backups', asyncRoute(async (request, response) => {
  requireEnabled();
  const reason = typeof request.body?.reason === 'string' && request.body.reason.trim() ? request.body.reason.trim().slice(0, 120) : 'manual';
  return sendData(request, response, await createBackup(reason, true), 201);
}));
localAdminFileRouter.post('/backups/:backupId/restore', asyncRoute(async (request, response) => {
  requireEnabled();
  return sendData(request, response, await restoreBackup(request.params.backupId));
}));

localAdminFileRouter.get('/state/:partition', asyncRoute(async (request, response) => {
  requireEnabled();
  const partition = safePartition(request.params.partition);
  const value = await readPartitionState(localRoot(), partition, true);
  if (value === null) throw new ApiError(404, 'NOT_FOUND', `Local Admin partition ${partition} has not been initialized.`);
  return sendData(request, response, { partition, state: value, localFileFormatVersion });
}));
localAdminFileRouter.put('/state/:partition', asyncRoute(async (request, response) => {
  requireEnabled();
  const partition = safePartition(request.params.partition);
  await writePartitionState(localRoot(), partition, request.body);
  return sendData(request, response, { partition, persisted: true, localFileFormatVersion });
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
    await atomicBufferWrite(assetFile(localRoot(), assetId), request.body);
    await atomicJsonWrite(assetMetaFile(localRoot(), assetId), { mimeType, byteSize: request.body.length, updatedAt: new Date().toISOString() });
    return sendData(request, response, { assetId, persisted: true, mimeType, byteSize: request.body.length }, 201);
  }),
);
localAdminFileRouter.get('/assets/:assetId', asyncRoute(async (request, response) => {
  requireEnabled();
  const assetId = safeAssetId(request.params.assetId);
  const metadata = await readJsonOrNull(assetMetaFile(localRoot(), assetId)) as { mimeType?: string } | null;
  if (!metadata) throw new ApiError(404, 'NOT_FOUND', 'Local asset metadata was not found.');
  try {
    const body = await readFile(assetFile(localRoot(), assetId));
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
  await Promise.all([
    unlink(assetFile(localRoot(), assetId)).catch(error => { if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') throw error; }),
    unlink(assetMetaFile(localRoot(), assetId)).catch(error => { if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') throw error; }),
  ]);
  return sendData(request, response, { assetId, removed: true });
}));
