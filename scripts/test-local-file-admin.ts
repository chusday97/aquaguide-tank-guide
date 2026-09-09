import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

const root = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-local-admin-'));
process.env.ADMIN_LOCAL_FILE_MODE = 'true';
process.env.ADMIN_LOCAL_FILE_ROOT = root;
process.env.NODE_ENV = 'test';
delete process.env.VERCEL;

const { createApiApp } = await import('../apps/api/src/app');
const app = createApiApp();

const startServer = async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const port = (server.address() as AddressInfo).port;
  return { server, base: `http://127.0.0.1:${port}/api/v1/local-admin` };
};
const closeServer = async (server: Server) => new Promise<void>((resolve, reject) => {
  server.close(error => error ? reject(error) : resolve());
});
const requestJson = async (base: string, suffix: string, init?: RequestInit) => {
  const response = await fetch(`${base}${suffix}`, init);
  const payload = await response.json().catch(() => null) as any;
  return { response, payload };
};

let active: Server | null = null;
try {
  let started = await startServer();
  active = started.server;

  const status = await requestJson(started.base, '/status');
  assert.equal(status.response.status, 200);
  assert.equal(status.payload.data.enabled, true);
  assert.equal(status.payload.data.root, root);
  assert.equal(status.payload.data.partitions.business, false);
  assert.equal(status.payload.data.partitions.compatibility, false);
  assert.equal(status.payload.data.partitions['care-seo'], false);

  const businessState = { schemaVersion: 1, species: [{ id: 'demo' }], care: [], updatedAt: 'test' };
  const written = await requestJson(started.base, '/state/business', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(businessState),
  });
  assert.equal(written.response.status, 200);
  assert.equal(written.payload.data.persisted, true);
  assert.deepEqual(JSON.parse(await readFile(path.join(root, 'business.json'), 'utf8')), businessState);

  const readBack = await requestJson(started.base, '/state/business');
  assert.equal(readBack.response.status, 200);
  assert.deepEqual(readBack.payload.data.state, businessState);

  const invalidPartition = await requestJson(started.base, '/state/not-a-partition');
  assert.equal(invalidPartition.response.status, 400);
  assert.equal(invalidPartition.payload.error.code, 'VALIDATION_ERROR');

  const imageBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00]);
  const assetId = 'local-asset-test-001';
  const imagePut = await requestJson(started.base, `/assets/${assetId}`, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: imageBytes,
  });
  assert.equal(imagePut.response.status, 201);
  assert.equal(imagePut.payload.data.mimeType, 'image/png');
  assert.equal(imagePut.payload.data.byteSize, imageBytes.length);

  const imageGet = await fetch(`${started.base}/assets/${assetId}`);
  assert.equal(imageGet.status, 200);
  assert.equal(imageGet.headers.get('content-type'), 'image/png');
  assert.deepEqual(Buffer.from(await imageGet.arrayBuffer()), imageBytes);

  const invalidAsset = await requestJson(started.base, '/assets/not-local-asset', {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: imageBytes,
  });
  assert.equal(invalidAsset.response.status, 400);
  assert.equal(invalidAsset.payload.error.code, 'VALIDATION_ERROR');

  const invalidMime = await requestJson(started.base, '/assets/local-asset-test-bad-mime', {
    method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: Buffer.from('not-image'),
  });
  assert.equal(invalidMime.response.status, 400);

  const entriesBeforeRestart = await readdir(root);
  assert(entriesBeforeRestart.includes('business.json'));
  assert(entriesBeforeRestart.includes('assets'));
  assert.equal(entriesBeforeRestart.some(name => name.includes('.tmp-')), false);

  await closeServer(started.server);
  active = null;

  // Re-open the API on a new listener and prove the same disk state survives the server lifecycle.
  started = await startServer();
  active = started.server;
  const afterRestart = await requestJson(started.base, '/state/business');
  assert.equal(afterRestart.response.status, 200);
  assert.deepEqual(afterRestart.payload.data.state, businessState);
  const imageAfterRestart = await fetch(`${started.base}/assets/${assetId}`);
  assert.equal(imageAfterRestart.status, 200);
  assert.deepEqual(Buffer.from(await imageAfterRestart.arrayBuffer()), imageBytes);

  const imageDelete = await requestJson(started.base, `/assets/${assetId}`, { method: 'DELETE' });
  assert.equal(imageDelete.response.status, 200);
  assert.equal(imageDelete.payload.data.removed, true);
  assert.equal((await fetch(`${started.base}/assets/${assetId}`)).status, 404);

  process.env.ADMIN_LOCAL_FILE_MODE = 'false';
  const disabled = await requestJson(started.base, '/status');
  assert.equal(disabled.response.status, 404);
  assert.equal(disabled.payload.error.code, 'NOT_FOUND');

  console.log('local file admin: atomic JSON + durable restart + asset lifecycle + fail-closed guard PASS');
} finally {
  if (active) await closeServer(active).catch(() => undefined);
  await rm(root, { recursive: true, force: true });
}
