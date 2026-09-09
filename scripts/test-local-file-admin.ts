import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
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
const putState = (base: string, partition: string, state: unknown) => requestJson(base, `/state/${partition}`, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state),
});

let active: Server | null = null;
try {
  let started = await startServer();
  active = started.server;
  const status = await requestJson(started.base, '/status');
  assert.equal(status.response.status, 200);
  assert.equal(status.payload.data.enabled, true);
  assert.equal(status.payload.data.root, root);
  assert.equal(status.payload.data.localFileFormatVersion, 1);
  assert.deepEqual(status.payload.data.partitions, { business: false, compatibility: false, 'care-seo': false });

  // Existing Durable Local File installs used raw store JSON. First read must migrate it in place to a versioned envelope.
  const businessState = { schemaVersion: 1, species: [{ id: 'demo' }], care: [], updatedAt: 'test' };
  await writeFile(path.join(root, 'business.json'), `${JSON.stringify(businessState)}\n`, 'utf8');
  const legacyRead = await requestJson(started.base, '/state/business');
  assert.equal(legacyRead.response.status, 200);
  assert.deepEqual(legacyRead.payload.data.state, businessState);
  const migratedDisk = JSON.parse(await readFile(path.join(root, 'business.json'), 'utf8'));
  assert.equal(migratedDisk.localFileFormatVersion, 1);
  assert.equal(migratedDisk.partition, 'business');
  assert.equal(migratedDisk.stateSchemaVersion, 1);
  assert.deepEqual(migratedDisk.state, businessState);

  const written = await putState(started.base, 'business', businessState);
  assert.equal(written.response.status, 200);
  assert.equal(written.payload.data.persisted, true);
  const futureState = await putState(started.base, 'business', { ...businessState, schemaVersion: 2 });
  assert.equal(futureState.response.status, 409);
  assert.equal(futureState.payload.error.code, 'MIGRATION_REJECTED');

  const invalidPartition = await requestJson(started.base, '/state/not-a-partition');
  assert.equal(invalidPartition.response.status, 400);
  assert.equal(invalidPartition.payload.error.code, 'VALIDATION_ERROR');

  const imageBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00]);
  const assetId = 'local-asset-test-001';
  const imagePut = await requestJson(started.base, `/assets/${assetId}`, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: imageBytes,
  });
  assert.equal(imagePut.response.status, 201);
  assert.equal(imagePut.payload.data.byteSize, imageBytes.length);
  const invalidAsset = await requestJson(started.base, '/assets/not-local-asset', {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: imageBytes,
  });
  assert.equal(invalidAsset.response.status, 400);
  const invalidMime = await requestJson(started.base, '/assets/local-asset-test-bad-mime', {
    method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: Buffer.from('not-image'),
  });
  assert.equal(invalidMime.response.status, 400);

  const integrity = await requestJson(started.base, '/integrity');
  assert.equal(integrity.response.status, 200);
  assert.equal(integrity.payload.data.healthy, true);
  assert.equal(integrity.payload.data.assets.orphaned, 1);
  assert(integrity.payload.data.issues.some((issue: any) => issue.code === 'ORPHAN_ASSET'));

  const backup = await requestJson(started.base, '/backups', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'unit-test' }),
  });
  assert.equal(backup.response.status, 201);
  assert.match(backup.payload.data.id, /^backup-\d{13,17}$/);
  assert.equal(backup.payload.data.healthyAtBackup, true);
  const backupId = backup.payload.data.id as string;
  const backups = await requestJson(started.base, '/backups');
  assert.equal(backups.response.status, 200);
  assert.equal(backups.payload.data.backups[0].id, backupId);

  const changedState = { ...businessState, species: [{ id: 'changed-after-backup' }], updatedAt: 'changed' };
  assert.equal((await putState(started.base, 'business', changedState)).response.status, 200);
  assert.equal((await requestJson(started.base, `/assets/${assetId}`, { method: 'DELETE' })).response.status, 200);
  assert.equal((await fetch(`${started.base}/assets/${assetId}`)).status, 404);

  const restored = await requestJson(started.base, `/backups/${backupId}/restore`, { method: 'POST' });
  assert.equal(restored.response.status, 200);
  assert.equal(restored.payload.data.backupId, backupId);
  assert.match(restored.payload.data.safetyBackupId, /^backup-\d{13,17}$/);
  assert.equal(restored.payload.data.integrity.healthy, true);
  assert.deepEqual((await requestJson(started.base, '/state/business')).payload.data.state, businessState);
  const restoredImage = await fetch(`${started.base}/assets/${assetId}`);
  assert.equal(restoredImage.status, 200);
  assert.deepEqual(Buffer.from(await restoredImage.arrayBuffer()), imageBytes);

  const entriesBeforeRestart = await readdir(root);
  assert(entriesBeforeRestart.includes('business.json'));
  assert(entriesBeforeRestart.includes('assets'));
  assert(entriesBeforeRestart.includes('backups'));
  assert.equal(entriesBeforeRestart.some(name => name.includes('.tmp-') || name.includes('.restore-')), false);

  await closeServer(started.server);
  active = null;
  started = await startServer();
  active = started.server;
  assert.deepEqual((await requestJson(started.base, '/state/business')).payload.data.state, businessState);
  assert.equal((await fetch(`${started.base}/assets/${assetId}`)).status, 200);

  // A newer disk format must fail closed instead of being interpreted by older code.
  const currentDisk = await readFile(path.join(root, 'business.json'));
  await writeFile(path.join(root, 'business.json'), `${JSON.stringify({ localFileFormatVersion: 99, partition: 'business', stateSchemaVersion: 1, savedAt: 'future', state: businessState })}\n`);
  const futureDisk = await requestJson(started.base, '/state/business');
  assert.equal(futureDisk.response.status, 409);
  assert.equal(futureDisk.payload.error.code, 'MIGRATION_REJECTED');
  await writeFile(path.join(root, 'business.json'), currentDisk);
  assert.equal((await requestJson(started.base, '/state/business')).response.status, 200);

  process.env.ADMIN_LOCAL_FILE_MODE = 'false';
  const disabled = await requestJson(started.base, '/status');
  assert.equal(disabled.response.status, 404);
  assert.equal(disabled.payload.error.code, 'NOT_FOUND');

  console.log('local file admin: versioned envelope + legacy migration + integrity + backup/restore + restart + fail-closed future schema PASS');
} finally {
  if (active) await closeServer(active).catch(() => undefined);
  await rm(root, { recursive: true, force: true });
}
