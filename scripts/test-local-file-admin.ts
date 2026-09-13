import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { spawn } from 'node:child_process';

const root = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-local-admin-'));
process.env.ADMIN_LOCAL_FILE_MODE = 'true';
process.env.ADMIN_LOCAL_FILE_ROOT = root;
process.env.ADMIN_RUNTIME_SNAPSHOT_ROOT = path.join(root, 'public');
process.env.NODE_ENV = 'test';
delete process.env.VERCEL;

const { localCompatibilityAdminStore } = await import('../src/services/admin/local-compatibility-admin.store');
const canonicalCompatibilityBootstrap = await localCompatibilityAdminStore.getBootstrap();
const fixtureProfileCount = canonicalCompatibilityBootstrap.profiles.length;
const fixturePairRuleCount = canonicalCompatibilityBootstrap.pairRules.length;
const rootLeasePath = path.join(root, '.aqua-admin-owner.json');
await writeFile(rootLeasePath, `${JSON.stringify({ version: 1, pid: 99_999_999, token: 'stale-owner', acquiredAt: 'stale' })}\n`, 'utf8');

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
let leaseChild: ReturnType<typeof spawn> | null = null;
let recoveryChild: ReturnType<typeof spawn> | null = null;
let recoveryRoot: string | null = null;
let corruptRecoveryChild: ReturnType<typeof spawn> | null = null;
let corruptRecoveryRoot: string | null = null;
try {
  let started = await startServer();
  active = started.server;
  const status = await requestJson(started.base, '/status');
  assert.equal(status.response.status, 200);
  assert.equal(status.payload.data.enabled, true);
  assert.equal(status.payload.data.root, root);
  assert.equal(status.payload.data.localFileFormatVersion, 1);
  assert.deepEqual(status.payload.data.partitions, { business: false, compatibility: false, 'care-seo': false });
  const recoveredLease = JSON.parse(await readFile(rootLeasePath, 'utf8'));
  assert.equal(recoveredLease.pid, process.pid, 'A stale Local Admin root lease must be reclaimed by the live process.');
  assert.equal(recoveredLease.version, 2);
  assert.equal(typeof recoveredLease.processStartIdentity, 'string');
  assert.notEqual(recoveredLease.token, 'stale-owner');

  const leaseChildCode = `(async()=>{const {createApiApp}=await import('./apps/api/src/app');const server=createApiApp().listen(0,'127.0.0.1',()=>console.log('READY '+server.address().port));process.on('SIGTERM',()=>server.close(()=>process.exit(0)));})()`;
  leaseChild = spawn(process.execPath, ['./node_modules/tsx/dist/cli.mjs', '-e', leaseChildCode], {
    cwd: process.cwd(), env: { ...process.env }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  const leaseChildPort = await new Promise<number>((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => reject(new Error(`Timed out starting second Local Admin process: ${stderr}`)), 10_000);
    leaseChild!.stdout!.on('data', chunk => {
      stdout += String(chunk);
      const match = stdout.match(/READY (\d+)/);
      if (match) { clearTimeout(timeout); resolve(Number(match[1])); }
    });
    leaseChild!.stderr!.on('data', chunk => { stderr += String(chunk); });
    leaseChild!.once('exit', code => { clearTimeout(timeout); reject(new Error(`Second Local Admin process exited before READY (${code}): ${stderr}`)); });
  });
  const secondOwner = await requestJson(`http://127.0.0.1:${leaseChildPort}/api/v1/local-admin`, '/status');
  assert.equal(secondOwner.response.status, 409, 'A second process must not share one Durable Local File root.');
  assert.equal(secondOwner.payload.error.code, 'VERSION_CONFLICT');
  leaseChild.kill('SIGTERM');
  await new Promise<void>(resolve => leaseChild!.once('exit', () => resolve()));
  leaseChild = null;

  // If the live owner's lease file is removed externally, the old owner must stop serving once another process acquires the root.
  await rm(rootLeasePath, { force: true });
  leaseChild = spawn(process.execPath, ['./node_modules/tsx/dist/cli.mjs', '-e', leaseChildCode], {
    cwd: process.cwd(), env: { ...process.env }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  const replacementOwnerPort = await new Promise<number>((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => reject(new Error(`Timed out starting replacement Local Admin owner: ${stderr}`)), 10_000);
    leaseChild!.stdout!.on('data', chunk => {
      stdout += String(chunk);
      const match = stdout.match(/READY (\d+)/);
      if (match) { clearTimeout(timeout); resolve(Number(match[1])); }
    });
    leaseChild!.stderr!.on('data', chunk => { stderr += String(chunk); });
    leaseChild!.once('exit', code => { clearTimeout(timeout); reject(new Error(`Replacement Local Admin owner exited before READY (${code}): ${stderr}`)); });
  });
  const replacementOwner = await requestJson(`http://127.0.0.1:${replacementOwnerPort}/api/v1/local-admin`, '/status');
  assert.equal(replacementOwner.response.status, 200, 'A new process may atomically acquire a root whose lease file was externally removed.');
  const displacedOwner = await requestJson(started.base, '/status');
  assert.equal(displacedOwner.response.status, 409, 'The old process must fail closed after its on-disk lease is displaced.');
  assert.equal(displacedOwner.payload.error.code, 'VERSION_CONFLICT');
  leaseChild.kill('SIGTERM');
  await new Promise<void>(resolve => leaseChild!.once('exit', () => resolve()));
  leaseChild = null;
  const reacquiredOwner = await requestJson(started.base, '/status');
  assert.equal(reacquiredOwner.response.status, 200, 'The original process may reacquire the root after the replacement owner exits.');
  assert.equal(JSON.parse(await readFile(rootLeasePath, 'utf8')).pid, process.pid);

  // A stale lease must be reclaimable even when its old PID has been reused by an unrelated live process.
  const pidReuseRoot = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-local-admin-pid-reuse-'));
  const unrelatedProcess = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
  await new Promise<void>((resolve, reject) => {
    unrelatedProcess.once('spawn', resolve);
    unrelatedProcess.once('error', reject);
  });
  assert.equal(typeof unrelatedProcess.pid, 'number');
  await writeFile(path.join(pidReuseRoot, '.aqua-admin-owner.json'), `${JSON.stringify({
    version: 2, pid: unrelatedProcess.pid, token: 'dead-reused-pid-owner', acquiredAt: '2000-01-01T00:00:00.000Z',
    processStartIdentity: 'stale-process-start-identity',
  })}\n`, 'utf8');
  const pidReuseAdmin = spawn(process.execPath, ['./node_modules/tsx/dist/cli.mjs', '-e', leaseChildCode], {
    cwd: process.cwd(),
    env: { ...process.env, ADMIN_LOCAL_FILE_ROOT: pidReuseRoot, ADMIN_RUNTIME_SNAPSHOT_ROOT: path.join(pidReuseRoot, 'public') },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const pidReusePort = await new Promise<number>((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => reject(new Error(`Timed out starting PID-reuse Local Admin process: ${stderr}`)), 10_000);
    pidReuseAdmin.stdout!.on('data', chunk => {
      stdout += String(chunk);
      const match = stdout.match(/READY (\d+)/);
      if (match) { clearTimeout(timeout); resolve(Number(match[1])); }
    });
    pidReuseAdmin.stderr!.on('data', chunk => { stderr += String(chunk); });
    pidReuseAdmin.once('exit', code => { clearTimeout(timeout); reject(new Error(`PID-reuse Local Admin process exited before READY (${code}): ${stderr}`)); });
  });
  const pidReuseStatus = await requestJson(`http://127.0.0.1:${pidReusePort}/api/v1/local-admin`, '/status');
  assert.equal(pidReuseStatus.response.status, 200, 'A reused live PID with a different process-start identity must not permanently lock the root.');
  pidReuseAdmin.kill('SIGTERM');
  await new Promise<void>(resolve => pidReuseAdmin.once('exit', () => resolve()));
  unrelatedProcess.kill('SIGTERM');
  await new Promise<void>(resolve => unrelatedProcess.once('exit', () => resolve()));
  assert.rejects(readFile(path.join(pidReuseRoot, '.aqua-admin-owner.json'), 'utf8'));
  await rm(pidReuseRoot, { recursive: true, force: true });

  // A fresh process must roll back an interrupted restore before exposing the mixed active root.
  recoveryRoot = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-local-admin-restore-recovery-'));
  const safetyBackupId = `backup-${Date.now()}`;
  const targetBackupId = `backup-${Date.now() + 10_000}`;
  const safetyDirectory = path.join(recoveryRoot, 'backups', safetyBackupId);
  await mkdir(safetyDirectory, { recursive: true });
  const safetyBusiness = { schemaVersion: 1, species: [{ id: 'safety-a' }], care: [], updatedAt: 'safety-a' };
  const partialBusiness = { schemaVersion: 1, species: [{ id: 'target-b' }], care: [], updatedAt: 'target-b' };
  const safetyCare = { schemaVersion: 1, revisions: [], marker: 'safety-a' };
  const envelope = (partition: string, state: Record<string, unknown>) => ({
    localFileFormatVersion: 1, partition, stateSchemaVersion: Number(state.schemaVersion), savedAt: '2026-09-13T00:00:00.000Z', state,
  });
  await writeFile(path.join(safetyDirectory, 'business.json'), `${JSON.stringify(envelope('business', safetyBusiness))}\n`, 'utf8');
  await writeFile(path.join(safetyDirectory, 'care-seo.json'), `${JSON.stringify(envelope('care-seo', safetyCare))}\n`, 'utf8');
  await writeFile(path.join(safetyDirectory, 'manifest.json'), `${JSON.stringify({
    backupFormatVersion: 1, localFileFormatVersion: 1, id: safetyBackupId, createdAt: '2026-09-13T00:00:00.000Z',
    reason: 'pre-restore-safety', healthyAtBackup: true, errorCount: 0, warningCount: 0,
  })}\n`, 'utf8');
  await writeFile(path.join(recoveryRoot, 'business.json'), `${JSON.stringify(envelope('business', partialBusiness))}\n`, 'utf8');
  await writeFile(path.join(recoveryRoot, 'care-seo.json'), `${JSON.stringify(envelope('care-seo', safetyCare))}\n`, 'utf8');
  await writeFile(path.join(recoveryRoot, '.restore-transaction.json'), `${JSON.stringify({
    version: 1, targetBackupId, safetyBackupId, startedAt: '2026-09-13T00:00:01.000Z',
  })}\n`, 'utf8');
  await mkdir(path.join(recoveryRoot, '.restore-assets-crashed-process'), { recursive: true });
  await writeFile(path.join(recoveryRoot, '.restore-assets-crashed-process', 'partial.blob'), 'partial', 'utf8');
  recoveryChild = spawn(process.execPath, ['./node_modules/tsx/dist/cli.mjs', '-e', leaseChildCode], {
    cwd: process.cwd(),
    env: { ...process.env, ADMIN_LOCAL_FILE_ROOT: recoveryRoot, ADMIN_RUNTIME_SNAPSHOT_ROOT: path.join(recoveryRoot, 'public') },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const recoveryPort = await new Promise<number>((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => reject(new Error(`Timed out starting restore-recovery Local Admin process: ${stderr}`)), 10_000);
    recoveryChild!.stdout!.on('data', chunk => {
      stdout += String(chunk);
      const match = stdout.match(/READY (\d+)/);
      if (match) { clearTimeout(timeout); resolve(Number(match[1])); }
    });
    recoveryChild!.stderr!.on('data', chunk => { stderr += String(chunk); });
    recoveryChild!.once('exit', code => { clearTimeout(timeout); reject(new Error(`Restore-recovery Local Admin process exited before READY (${code}): ${stderr}`)); });
  });
  const recoveryBase = `http://127.0.0.1:${recoveryPort}/api/v1/local-admin`;
  const recoveredStatus = await requestJson(recoveryBase, '/status');
  assert.equal(recoveredStatus.response.status, 200, 'Startup must recover an interrupted restore before serving Local Admin.');
  const recoveredBusiness = await requestJson(recoveryBase, '/state/business');
  const recoveredCare = await requestJson(recoveryBase, '/state/care-seo');
  assert.equal(recoveredBusiness.payload.data.state.updatedAt, 'safety-a');
  assert.equal(recoveredCare.payload.data.state.marker, 'safety-a');
  assert.equal((await readdir(recoveryRoot)).some(name => name.startsWith('.restore-assets-')), false);
  await assert.rejects(readFile(path.join(recoveryRoot, '.restore-transaction.json'), 'utf8'));
  recoveryChild.kill('SIGTERM');
  await new Promise<void>(resolve => recoveryChild!.once('exit', () => resolve()));
  recoveryChild = null;
  await rm(recoveryRoot, { recursive: true, force: true });
  recoveryRoot = null;

  // Interrupted-restore recovery must reject a corrupted safety backup and keep the journal for operator recovery.
  corruptRecoveryRoot = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-local-admin-corrupt-recovery-'));
  const corruptSafetyBackupId = `backup-${Date.now() + 20_000}`;
  const corruptSafetyDirectory = path.join(corruptRecoveryRoot, 'backups', corruptSafetyBackupId);
  await mkdir(path.join(corruptSafetyDirectory, 'assets'), { recursive: true });
  await writeFile(path.join(corruptSafetyDirectory, 'business.json'), `${JSON.stringify(envelope('business', safetyBusiness))}\n`, 'utf8');
  await writeFile(path.join(corruptSafetyDirectory, 'manifest.json'), `${JSON.stringify({
    backupFormatVersion: 1, localFileFormatVersion: 1, id: corruptSafetyBackupId, createdAt: '2026-09-13T00:00:02.000Z',
    reason: 'pre-restore-safety', healthyAtBackup: true, errorCount: 0, warningCount: 0,
  })}\n`, 'utf8');
  await writeFile(path.join(corruptSafetyDirectory, 'assets', 'local-asset-corrupt-recovery.json'), `${JSON.stringify({
    id: 'local-asset-corrupt-recovery', mimeType: 'image/png', byteSize: 123,
  })}\n`, 'utf8');
  await writeFile(path.join(corruptRecoveryRoot, 'business.json'), `${JSON.stringify(envelope('business', partialBusiness))}\n`, 'utf8');
  const corruptJournalPath = path.join(corruptRecoveryRoot, '.restore-transaction.json');
  await writeFile(corruptJournalPath, `${JSON.stringify({
    version: 1, targetBackupId: `backup-${Date.now() + 30_000}`, safetyBackupId: corruptSafetyBackupId, startedAt: '2026-09-13T00:00:03.000Z',
  })}\n`, 'utf8');
  corruptRecoveryChild = spawn(process.execPath, ['./node_modules/tsx/dist/cli.mjs', '-e', leaseChildCode], {
    cwd: process.cwd(),
    env: { ...process.env, ADMIN_LOCAL_FILE_ROOT: corruptRecoveryRoot, ADMIN_RUNTIME_SNAPSHOT_ROOT: path.join(corruptRecoveryRoot, 'public') },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const corruptRecoveryPort = await new Promise<number>((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => reject(new Error(`Timed out starting corrupt restore-recovery process: ${stderr}`)), 10_000);
    corruptRecoveryChild!.stdout!.on('data', chunk => {
      stdout += String(chunk);
      const match = stdout.match(/READY (\d+)/);
      if (match) { clearTimeout(timeout); resolve(Number(match[1])); }
    });
    corruptRecoveryChild!.stderr!.on('data', chunk => { stderr += String(chunk); });
    corruptRecoveryChild!.once('exit', code => { clearTimeout(timeout); reject(new Error(`Corrupt restore-recovery process exited before READY (${code}): ${stderr}`)); });
  });
  const corruptRecovery = await requestJson(`http://127.0.0.1:${corruptRecoveryPort}/api/v1/local-admin`, '/status');
  assert.equal(corruptRecovery.response.status, 500, 'Startup must fail closed when the recorded safety backup is corrupt.');
  assert.equal(corruptRecovery.payload.error.code, 'INTERNAL_ERROR');
  assert.equal(JSON.parse(await readFile(corruptJournalPath, 'utf8')).safetyBackupId, corruptSafetyBackupId,
    'A failed automatic recovery must keep its journal for operator inspection/retry.');
  const unchangedPartial = JSON.parse(await readFile(path.join(corruptRecoveryRoot, 'business.json'), 'utf8'));
  assert.equal(unchangedPartial.state.updatedAt, 'target-b', 'A corrupt safety backup must not overwrite the active root before validation.');
  corruptRecoveryChild.kill('SIGTERM');
  await new Promise<void>(resolve => corruptRecoveryChild!.once('exit', () => resolve()));
  corruptRecoveryChild = null;
  await rm(corruptRecoveryRoot, { recursive: true, force: true });
  corruptRecoveryRoot = null;

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


  const compatibilityV2 = {
    schemaVersion: 2,
    reviewedProfiles: structuredClone(canonicalCompatibilityBootstrap.profiles),
    reviewedPairRules: structuredClone(canonicalCompatibilityBootstrap.pairRules),
    profileRevisions: [], pairRevisions: [], authoritySequence: 1, updatedAt: 'test',
  };
  const compatibilityWrite = await putState(started.base, 'compatibility', compatibilityV2);
  assert.equal(compatibilityWrite.response.status, 200);
  assert.equal(compatibilityWrite.payload.data.persisted, true);
  const compatibilityFuture = await putState(started.base, 'compatibility', { ...compatibilityV2, schemaVersion: 3 });
  assert.equal(compatibilityFuture.response.status, 409);
  assert.equal(compatibilityFuture.payload.error.code, 'MIGRATION_REJECTED');

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

  const concurrentAssetId = 'local-asset-concurrent-put';
  for (let round = 0; round < 24; round += 1) {
    const pngBytes = Buffer.alloc(97 + round, 0x41);
    const webpBytes = Buffer.alloc(211 + round, 0x42);
    const concurrentWrites = await Promise.all([
      requestJson(started.base, `/assets/${concurrentAssetId}`, { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: pngBytes }),
      requestJson(started.base, `/assets/${concurrentAssetId}`, { method: 'PUT', headers: { 'Content-Type': 'image/webp' }, body: webpBytes }),
    ]);
    assert.equal(concurrentWrites.every(result => result.response.status === 201), true);
    const storedBlob = await readFile(path.join(root, 'assets', `${concurrentAssetId}.blob`));
    const storedMeta = JSON.parse(await readFile(path.join(root, 'assets', `${concurrentAssetId}.json`), 'utf8'));
    const isPngPair = storedMeta.mimeType === 'image/png' && storedMeta.byteSize === pngBytes.length && storedBlob.equals(pngBytes);
    const isWebpPair = storedMeta.mimeType === 'image/webp' && storedMeta.byteSize === webpBytes.length && storedBlob.equals(webpBytes);
    assert.equal(isPngPair || isWebpPair, true, 'Concurrent writes to one asset id must leave one complete blob/metadata pair.');
  }
  assert.equal((await requestJson(started.base, `/assets/${concurrentAssetId}`, { method: 'DELETE' })).response.status, 200);

  // Concurrent reads of one asset id must never combine metadata from one version with blob bytes from another.
  const readRaceAssetId = 'local-asset-concurrent-read';
  const readRacePng = Buffer.alloc(192 * 1024 + 7, 0x31);
  const readRaceWebp = Buffer.alloc(640 * 1024 + 19, 0x32);
  assert.equal((await requestJson(started.base, `/assets/${readRaceAssetId}`, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: readRacePng,
  })).response.status, 201);
  const readRaceWriter = (async () => {
    for (let index = 0; index < 48; index += 1) {
      const useWebp = index % 2 === 0;
      const result = await requestJson(started.base, `/assets/${readRaceAssetId}`, {
        method: 'PUT', headers: { 'Content-Type': useWebp ? 'image/webp' : 'image/png' }, body: useWebp ? readRaceWebp : readRacePng,
      });
      assert.equal(result.response.status, 201);
    }
  })();
  const readRaceReader = (async () => {
    for (let index = 0; index < 240; index += 1) {
      const response = await fetch(`${started.base}/assets/${readRaceAssetId}`);
      assert.equal(response.status, 200);
      const body = Buffer.from(await response.arrayBuffer());
      const mimeType = response.headers.get('content-type')?.split(';')[0] || '';
      const isPngRead = mimeType === 'image/png' && body.equals(readRacePng);
      const isWebpRead = mimeType === 'image/webp' && body.equals(readRaceWebp);
      assert.equal(isPngRead || isWebpRead, true, 'Concurrent asset GET must return one complete blob/metadata version.');
    }
  })();
  await Promise.all([readRaceWriter, readRaceReader]);
  assert.equal((await requestJson(started.base, `/assets/${readRaceAssetId}`, { method: 'DELETE' })).response.status, 200);

  // Integrity is a cross-file snapshot and must not report false asset errors during a queued rewrite.
  const integrityRaceAssetId = 'local-asset-integrity-race';
  const integrityRacePng = Buffer.alloc(128 * 1024 + 3, 0x61);
  const integrityRaceWebp = Buffer.alloc(448 * 1024 + 29, 0x62);
  assert.equal((await requestJson(started.base, `/assets/${integrityRaceAssetId}`, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: integrityRacePng,
  })).response.status, 201);
  const integrityRaceWriter = (async () => {
    for (let index = 0; index < 24; index += 1) {
      const useWebp = index % 2 === 0;
      const result = await requestJson(started.base, `/assets/${integrityRaceAssetId}`, {
        method: 'PUT', headers: { 'Content-Type': useWebp ? 'image/webp' : 'image/png' }, body: useWebp ? integrityRaceWebp : integrityRacePng,
      });
      assert.equal(result.response.status, 201);
    }
  })();
  const integrityRaceReader = (async () => {
    for (let index = 0; index < 80; index += 1) {
      const result = await requestJson(started.base, '/integrity');
      assert.equal(result.response.status, 200);
      assert.equal(result.payload.data.healthy, true, 'Integrity snapshot must wait for an in-flight asset pair write.');
      assert.equal(result.payload.data.issues.some((issue: any) => issue.code === 'ASSET_SIZE_MISMATCH' || issue.code === 'ASSET_PAIR_MISSING'), false);
    }
  })();
  await Promise.all([integrityRaceWriter, integrityRaceReader]);
  assert.equal((await requestJson(started.base, `/assets/${integrityRaceAssetId}`, { method: 'DELETE' })).response.status, 200);

  // If metadata commit fails after the blob was written, the new blob must be removed/restored.
  const pairFailureId = 'local-asset-pair-failure';
  const pairFailureMeta = path.join(root, 'assets', `${pairFailureId}.json`);
  const pairFailureBlob = path.join(root, 'assets', `${pairFailureId}.blob`);
  await mkdir(pairFailureMeta);
  const pairFailure = await requestJson(started.base, `/assets/${pairFailureId}`, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: imageBytes,
  });
  assert.equal(pairFailure.response.status, 500);
  await assert.rejects(stat(pairFailureBlob), (error: NodeJS.ErrnoException) => error.code === 'ENOENT',
    'Failed asset metadata commit must not leave a newly written blob behind.');
  await rm(pairFailureMeta, { recursive: true, force: true });

  // The same failure while overwriting an existing asset must restore its previous blob.
  const originalAssetMeta = await readFile(path.join(root, 'assets', `${assetId}.json`));
  await rm(path.join(root, 'assets', `${assetId}.json`));
  await mkdir(path.join(root, 'assets', `${assetId}.json`));
  const overwriteFailure = await requestJson(started.base, `/assets/${assetId}`, {
    method: 'PUT', headers: { 'Content-Type': 'image/webp' }, body: Buffer.concat([imageBytes, Buffer.from('new')]),
  });
  assert.equal(overwriteFailure.response.status, 500);
  assert.deepEqual(await readFile(path.join(root, 'assets', `${assetId}.blob`)), imageBytes,
    'Failed asset metadata commit must restore the previous blob when overwriting an asset.');
  await rm(path.join(root, 'assets', `${assetId}.json`), { recursive: true, force: true });
  await writeFile(path.join(root, 'assets', `${assetId}.json`), originalAssetMeta);

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

  // A backup manifest must remain bound to its own directory id or the UI can restore a different backup than the one it displays.
  const mismatchedManifestBackup = await requestJson(started.base, '/backups', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'manifest-id-mismatch' }),
  });
  assert.equal(mismatchedManifestBackup.response.status, 201);
  const mismatchedManifestBackupId = String(mismatchedManifestBackup.payload.data.id);
  const mismatchedManifestPath = path.join(root, 'backups', mismatchedManifestBackupId, 'manifest.json');
  const mismatchedManifest = JSON.parse(await readFile(mismatchedManifestPath, 'utf8'));
  mismatchedManifest.id = backupId;
  await writeFile(mismatchedManifestPath, `${JSON.stringify(mismatchedManifest)}\n`, 'utf8');
  const backupsAfterManifestMismatch = await requestJson(started.base, '/backups');
  assert.equal(backupsAfterManifestMismatch.response.status, 200);
  assert.equal(backupsAfterManifestMismatch.payload.data.backups.filter((item: any) => item.id === backupId).length, 1,
    'A mismatched manifest id must not create a duplicate/restorable alias for another backup.');
  const mismatchedManifestRestore = await requestJson(started.base, `/backups/${mismatchedManifestBackupId}/restore`, { method: 'POST' });
  assert.equal(mismatchedManifestRestore.response.status, 409, 'Direct restore must reject a backup whose manifest id does not match its directory.');
  assert.equal(mismatchedManifestRestore.payload.error.code, 'MIGRATION_REJECTED');

  // A backup whose manifest is valid but whose copied authority is corrupt must not be offered as restorable.
  const corruptListedBackup = await requestJson(started.base, '/backups', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'corrupt-list-candidate' }),
  });
  assert.equal(corruptListedBackup.response.status, 201);
  const corruptListedBackupId = String(corruptListedBackup.payload.data.id);
  await rm(path.join(root, 'backups', corruptListedBackupId, 'assets', `${assetId}.blob`));
  const filteredBackups = await requestJson(started.base, '/backups');
  assert.equal(filteredBackups.response.status, 200);
  assert.equal(filteredBackups.payload.data.backups.some((item: any) => item.id === corruptListedBackupId), false,
    'A corrupt backup must not be offered in the restorable backup list.');
  const corruptRestore = await requestJson(started.base, `/backups/${corruptListedBackupId}/restore`, { method: 'POST' });
  assert.equal(corruptRestore.response.status, 409, 'Direct restore must still reject a corrupt backup even when its id is known.');
  assert.equal(corruptRestore.payload.error.code, 'MIGRATION_REJECTED');

  const concurrentBackups = await Promise.all(Array.from({ length: 24 }, (_, index) => requestJson(started.base, '/backups', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: `concurrent-${index}` }),
  })));
  assert.equal(concurrentBackups.every(result => result.response.status === 201), true,
    'Concurrent backups must all succeed independently.');
  const concurrentBackupIds = concurrentBackups.map(result => String(result.payload.data.id));
  assert.equal(new Set(concurrentBackupIds).size, concurrentBackupIds.length,
    'Every successful concurrent backup must receive a unique backup id.');

  // Backup must snapshot one complete authority state even while the same asset is being rewritten.
  const backupRaceAssetId = 'local-asset-backup-race';
  const backupRacePng = Buffer.alloc(256 * 1024 + 17, 0x41);
  const backupRaceWebp = Buffer.alloc(768 * 1024 + 31, 0x42);
  assert.equal((await requestJson(started.base, `/assets/${backupRaceAssetId}`, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: backupRacePng,
  })).response.status, 201);
  for (let round = 0; round < 8; round += 1) {
    const backupPromise = requestJson(started.base, '/backups', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: `asset-race-${round}` }),
    });
    const rewritePromise = (async () => {
      for (let index = 0; index < 6; index += 1) {
        const useWebp = index % 2 === 0;
        const result = await requestJson(started.base, `/assets/${backupRaceAssetId}`, {
          method: 'PUT', headers: { 'Content-Type': useWebp ? 'image/webp' : 'image/png' }, body: useWebp ? backupRaceWebp : backupRacePng,
        });
        assert.equal(result.response.status, 201);
      }
    })();
    const [raceBackup] = await Promise.all([backupPromise, rewritePromise]);
    assert.equal(raceBackup.response.status, 201, 'Backup must not fail while asset writes are queued.');
    const raceBackupId = String(raceBackup.payload.data.id);
    const raceMeta = JSON.parse(await readFile(path.join(root, 'backups', raceBackupId, 'assets', `${backupRaceAssetId}.json`), 'utf8'));
    const raceBlob = await readFile(path.join(root, 'backups', raceBackupId, 'assets', `${backupRaceAssetId}.blob`));
    const isPngBackup = raceMeta.mimeType === 'image/png' && raceMeta.byteSize === backupRacePng.length && raceBlob.equals(backupRacePng);
    const isWebpBackup = raceMeta.mimeType === 'image/webp' && raceMeta.byteSize === backupRaceWebp.length && raceBlob.equals(backupRaceWebp);
    assert.equal(isPngBackup || isWebpBackup, true, 'Concurrent backup must contain one complete asset version.');
  }
  assert.equal((await requestJson(started.base, `/assets/${backupRaceAssetId}`, { method: 'DELETE' })).response.status, 200);

  // A mid-copy filesystem failure must not leave a hidden partial backup directory.
  const blobPath = path.join(root, 'assets', `${assetId}.blob`);
  const backupEntriesBeforeFailure = (await readdir(path.join(root, 'backups'))).sort();
  let failedBackup: Awaited<ReturnType<typeof requestJson>>;
  await chmod(blobPath, 0o000);
  try {
    failedBackup = await requestJson(started.base, '/backups', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'forced-copy-failure' }),
    });
  } finally {
    await chmod(blobPath, 0o600);
  }
  assert.equal(failedBackup.response.status, 500);
  assert.equal(failedBackup.payload.error.code, 'INTERNAL_ERROR');
  assert.deepEqual((await readdir(path.join(root, 'backups'))).sort(), backupEntriesBeforeFailure,
    'Failed backup must remove its partial backup directory.');

  const changedState = { ...businessState, species: [{ id: 'changed-after-backup' }], updatedAt: 'changed' };
  assert.equal((await putState(started.base, 'business', changedState)).response.status, 200);

  // If metadata deletion fails after blob deletion, the previous blob must be restored.
  const deleteMetaPath = path.join(root, 'assets', `${assetId}.json`);
  const deleteBlobPath = path.join(root, 'assets', `${assetId}.blob`);
  const deleteMetaBytes = await readFile(deleteMetaPath);
  await rm(deleteMetaPath);
  await mkdir(deleteMetaPath);
  const deleteFailure = await requestJson(started.base, `/assets/${assetId}`, { method: 'DELETE' });
  assert.equal(deleteFailure.response.status, 500);
  assert.deepEqual(await readFile(deleteBlobPath), imageBytes,
    'Failed asset metadata deletion must restore the previous blob.');
  await rm(deleteMetaPath, { recursive: true, force: true });
  await writeFile(deleteMetaPath, deleteMetaBytes);

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

  const publishedSpeciesInput = {
    catalogKey: 'sp-published', name: 'Published Fish', scientificName: 'Published fishus', category: 'Fish', difficulty: 'Easy',
    waterTemperatureText: '24-26°C', phLevelText: '6.5-7.5', waterChangeCycleDays: 7, description: 'Published description', diet: 'Omnivore',
    tankSizeText: '40 L', temperament: 'Peaceful', sizeClass: 'Small', isCustom: false, searchTerms: ['Published Fish'],
  };
  const publishedCareInput = {
    catalogKey: 'care-published', title: 'Published Care', category: 'Routine', urgency: '日常', summary: 'Published care summary',
    symptoms: ['symptom'], steps: [{ instruction: 'step', actionKind: 'immediate' }], avoidActions: [], observeItems: [], diagnoseWhen: ['check'], nextStep: 'next', keywords: ['care'],
  };
  const exportBusinessState = {
    schemaVersion: 1,
    species: [{ id: 'local-species-sp-published', ...publishedSpeciesInput, status: 'published', version: 2 }, { id: 'draft-only', ...publishedSpeciesInput, catalogKey: 'sp-draft-only', status: 'draft', version: 9 }],
    care: [{ id: 'local-care-care-published', ...publishedCareInput, status: 'published', version: 3, careArticleSteps: [{ id: 'step-1', position: 1, instruction: 'step', actionKind: 'immediate' }] }],
    publishedSpecies: { 'sp-published': publishedSpeciesInput },
    publishedCare: { 'care-published': publishedCareInput },
    publishedCareMeta: { 'care-published': { sourceVersion: 3, publishedAt: '2026-09-11T00:00:00.000Z' } },
    publishedSpeciesAssets: { 'sp-published': [{ id: assetId, variant: 'detail', storageBucket: 'local-file', storagePath: assetId, assetVersion: 1, isCurrent: true, mimeType: 'image/png' }] }, publishedCareAssets: {},
    releaseEvents: [
      { authority: 'product_care', domain: 'product', resourceKey: 'sp-published', status: 'published', version: 2, occurredAt: '2026-09-11T00:00:00.000Z' },
      { authority: 'product_care', domain: 'product', resourceKey: 'sp-draft-only', status: 'draft', version: 9, occurredAt: '2026-09-11T00:00:00.000Z' },
    ],
    updatedAt: '2026-09-11T00:00:00.000Z',
  };
  assert.equal((await putState(started.base, 'business', exportBusinessState)).response.status, 200);
  const reviewedCompatibilityV2 = compatibilityV2;
  assert.equal((await putState(started.base, 'compatibility', reviewedCompatibilityV2)).response.status, 200);
  const runtimeSnapshot = await requestJson(started.base, '/runtime-snapshot', { method: 'POST' });
  assert.equal(runtimeSnapshot.response.status, 201);
  assert.deepEqual(runtimeSnapshot.payload.data.counts, { species: 1, care: 1, profiles: fixtureProfileCount, pairRules: fixturePairRuleCount });
  assert.equal(runtimeSnapshot.payload.data.gitCommitRequired, true);
  assert.equal(runtimeSnapshot.payload.data.deploymentTriggered, false);
  // Concurrent runtime exports must use isolated staging directories and all succeed.
  const concurrentExports = await Promise.all(Array.from({ length: 32 }, () => requestJson(started.base, '/runtime-snapshot', { method: 'POST' })));
  assert.equal(concurrentExports.every(result => result.response.status === 201), true,
    'Concurrent runtime snapshot exports must not collide on staging directories.');
  assert.equal((await readdir(path.join(root, 'public'))).some(name => name.startsWith('runtime-assets.tmp-')), false,
    'Concurrent runtime exports must clean all staging directories.');

  const exported = JSON.parse(await readFile(path.join(root, 'public/runtime-authority.json'), 'utf8'));
  assert.equal(exported.authority, 'local-file-git');
  assert.equal(exported.productCare.species.length, 1);
  assert.equal(exported.productCare.species[0].input.catalogKey, 'sp-published');
  const exportedAssetUrl = exported.productCare.species[0].assets[0].url;
  assert.match(exportedAssetUrl, new RegExp(`^/runtime-assets/${assetId}-v1-[0-9a-f]{12}\.png$`));
  const exportedAssetFile = path.basename(exportedAssetUrl);
  assert.deepEqual(Buffer.from(await readFile(path.join(root, 'public/runtime-assets', exportedAssetFile))), imageBytes);
  assert.equal(JSON.stringify(exported).includes('sp-draft-only'), false);
  assert.equal(exported.productCare.careArticles[0].input.catalogKey, 'care-published');
  assert.equal(exported.compatibility.authority, 'reviewed-git');
  assert.equal(exported.compatibility.profiles.length, fixtureProfileCount);
  assert.equal(exported.compatibility.pairRules.length, fixturePairRuleCount);

  const manifestPath = path.join(root, 'public/runtime-authority.json');
  const savedManifestPath = `${manifestPath}.saved`;
  await rename(manifestPath, savedManifestPath);
  await mkdir(manifestPath);
  const changedImageBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x01]);
  await writeFile(path.join(root, 'assets', `${assetId}.blob`), changedImageBytes);
  const failedBusinessState = structuredClone(exportBusinessState);
  failedBusinessState.publishedSpeciesAssets['sp-published'][0].assetVersion = 2;
  assert.equal((await putState(started.base, 'business', failedBusinessState)).response.status, 200);
  const failedRuntimeSnapshot = await requestJson(started.base, '/runtime-snapshot', { method: 'POST' });
  assert.equal(failedRuntimeSnapshot.response.status, 500);
  assert.equal((await readdir(path.join(root, 'public'))).some(name => name.startsWith('runtime-authority.json.tmp-')), false,
    'Failed atomic manifest replacement must clean its temporary JSON file.');
  assert.deepEqual((await readdir(path.join(root, 'public/runtime-assets'))).sort(), [exportedAssetFile]);
  assert.deepEqual(Buffer.from(await readFile(path.join(root, 'public/runtime-assets', exportedAssetFile))), imageBytes);
  await rm(manifestPath, { recursive: true, force: true });
  await rename(savedManifestPath, manifestPath);

  // Runtime export must read one complete published asset version while asset rewrites are queued.
  const runtimeRacePng = Buffer.alloc(128 * 1024 + 13, 0x51);
  const runtimeRaceWebp = Buffer.alloc(512 * 1024 + 29, 0x52);
  assert.equal((await requestJson(started.base, `/assets/${assetId}`, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: runtimeRacePng,
  })).response.status, 201);
  assert.equal((await putState(started.base, 'business', exportBusinessState)).response.status, 200);
  for (let round = 0; round < 8; round += 1) {
    const exportPromise = requestJson(started.base, '/runtime-snapshot', { method: 'POST' });
    const rewritePromise = (async () => {
      for (let index = 0; index < 6; index += 1) {
        const useWebp = index % 2 === 0;
        const result = await requestJson(started.base, `/assets/${assetId}`, {
          method: 'PUT', headers: { 'Content-Type': useWebp ? 'image/webp' : 'image/png' }, body: useWebp ? runtimeRaceWebp : runtimeRacePng,
        });
        assert.equal(result.response.status, 201);
      }
    })();
    const [raceExport] = await Promise.all([exportPromise, rewritePromise]);
    assert.equal(raceExport.response.status, 201, 'Runtime snapshot must not fail while published asset writes are queued.');
    const raceManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const raceAsset = raceManifest.productCare.species[0].assets[0];
    const raceAssetBody = await readFile(path.join(root, 'public', raceAsset.url));
    const isPngRuntime = raceAsset.mimeType === 'image/png' && raceAsset.byteSize === runtimeRacePng.length && raceAsset.url.endsWith('.png') && raceAssetBody.equals(runtimeRacePng);
    const isWebpRuntime = raceAsset.mimeType === 'image/webp' && raceAsset.byteSize === runtimeRaceWebp.length && raceAsset.url.endsWith('.webp') && raceAssetBody.equals(runtimeRaceWebp);
    assert.equal(isPngRuntime || isWebpRuntime, true, 'Concurrent runtime snapshot must contain one complete published asset version.');
  }

  // Restore must not expose a new Business reference before the matching asset set is visible.
  const restoreVisibilityAssetA = 'local-asset-restore-visibility-a';
  const restoreVisibilityAssetB = 'local-asset-restore-visibility-b';
  const restoreVisibilityBytesA = Buffer.alloc(4096, 0x71);
  const restoreVisibilityBytesB = Buffer.alloc(4097, 0x72);
  const restoreVisibilityBusiness = (assetId: string) => ({
    schemaVersion: 1,
    species: [{ id: 'restore-visibility-species', image: { id: assetId, storageBucket: 'local-file', storagePath: assetId } }],
    care: [],
    updatedAt: assetId,
  });
  assert.equal((await requestJson(started.base, `/assets/${restoreVisibilityAssetB}`, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: restoreVisibilityBytesB,
  })).response.status, 201);
  assert.equal((await putState(started.base, 'business', restoreVisibilityBusiness(restoreVisibilityAssetB))).response.status, 200);
  assert.equal((await putState(started.base, 'care-seo', { schemaVersion: 1, revisions: [], padding: 'x'.repeat(2_600_000) })).response.status, 200);
  const restoreVisibilityBackup = await requestJson(started.base, '/backups', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'restore-visibility' }),
  });
  assert.equal(restoreVisibilityBackup.response.status, 201);
  const restoreVisibilityBackupId = String(restoreVisibilityBackup.payload.data.id);
  assert.equal((await requestJson(started.base, `/assets/${restoreVisibilityAssetA}`, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: restoreVisibilityBytesA,
  })).response.status, 201);
  assert.equal((await putState(started.base, 'business', restoreVisibilityBusiness(restoreVisibilityAssetA))).response.status, 200);
  assert.equal((await requestJson(started.base, `/assets/${restoreVisibilityAssetB}`, { method: 'DELETE' })).response.status, 200);
  assert.equal((await putState(started.base, 'care-seo', { schemaVersion: 1, revisions: [], padding: 'a' })).response.status, 200);
  const visibilityRestore = requestJson(started.base, `/backups/${restoreVisibilityBackupId}/restore`, { method: 'POST' });
  const visibilityReaders = Promise.all(Array.from({ length: 24 }, async () => {
    const state = await requestJson(started.base, '/state/business');
    assert.equal(state.response.status, 200);
    const referencedAsset = String(state.payload.data.state.species?.[0]?.image?.id || '');
    assert([restoreVisibilityAssetA, restoreVisibilityAssetB].includes(referencedAsset));
    const assetResponse = await fetch(`${started.base}/assets/${referencedAsset}`);
    assert.equal(assetResponse.status, 200, 'A visible Business state must never reference an asset hidden by an in-flight restore.');
  }));
  const [restoreVisibilityResult] = await Promise.all([visibilityRestore, visibilityReaders]);
  assert.equal(restoreVisibilityResult.response.status, 200);
  const restoredVisibilityState = await requestJson(started.base, '/state/business');
  assert.equal(restoredVisibilityState.payload.data.state.species[0].image.id, restoreVisibilityAssetB);
  assert.equal((await fetch(`${started.base}/assets/${restoreVisibilityAssetB}`)).status, 200);
  assert.equal((await fetch(`${started.base}/assets/${restoreVisibilityAssetA}`)).status, 200,
    'Restore keeps the superseded asset reachable so a reader holding the pre-restore Business state cannot observe a dangling reference.');
  const restoreVisibilityIntegrity = await requestJson(started.base, '/integrity');
  assert.equal(restoreVisibilityIntegrity.response.status, 200);
  assert(restoreVisibilityIntegrity.payload.data.issues.some((issue: any) => issue.code === 'ORPHAN_ASSET' && issue.message.includes(restoreVisibilityAssetA)),
    'Superseded restore assets remain visible but must be explicitly reported as integrity-audited orphans.');

  // A failed restore may only claim automatic rollback success after validating both the safety backup and rolled-back root.
  const rollbackAssetA = 'local-asset-rollback-validation-a';
  const rollbackAssetB = 'local-asset-rollback-validation-b';
  const rollbackBusiness = (assetId: string) => ({
    schemaVersion: 1, species: [{ id: `species-${assetId}`, image: { storageBucket: 'local-file', id: assetId } }], care: [], updatedAt: assetId,
  });
  assert.equal((await requestJson(started.base, `/assets/${rollbackAssetA}`, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: Buffer.alloc(1024, 0x41),
  })).response.status, 201);
  assert.equal((await putState(started.base, 'business', rollbackBusiness(rollbackAssetA))).response.status, 200);
  assert.equal((await putState(started.base, 'care-seo', { schemaVersion: 1, revisions: [], marker: 'rollback-a' })).response.status, 200);
  assert.equal((await requestJson(started.base, `/assets/${rollbackAssetB}`, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: Buffer.alloc(2048, 0x42),
  })).response.status, 201);
  assert.equal((await putState(started.base, 'business', rollbackBusiness(rollbackAssetB))).response.status, 200);
  assert.equal((await putState(started.base, 'care-seo', { schemaVersion: 1, revisions: [], marker: 'rollback-b' })).response.status, 200);
  const rollbackTarget = await requestJson(started.base, '/backups', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'rollback-integrity-target' }),
  });
  assert.equal(rollbackTarget.response.status, 201);
  const rollbackTargetId = String(rollbackTarget.payload.data.id);
  const rollbackTargetDirectory = path.join(root, 'backups', rollbackTargetId);
  const rollbackHugeOrphan = 'local-asset-rollback-window';
  await writeFile(path.join(rollbackTargetDirectory, 'assets', `${rollbackHugeOrphan}.blob`), Buffer.alloc(32 * 1024 * 1024, 0x5a));
  await writeFile(path.join(rollbackTargetDirectory, 'assets', `${rollbackHugeOrphan}.json`), `${JSON.stringify({
    id: rollbackHugeOrphan, mimeType: 'image/png', byteSize: 32 * 1024 * 1024,
  })}\n`, 'utf8');
  assert.equal((await requestJson(started.base, `/assets/${rollbackAssetA}`, {
    method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: Buffer.alloc(1024, 0x41),
  })).response.status, 201);
  assert.equal((await putState(started.base, 'business', rollbackBusiness(rollbackAssetA))).response.status, 200);
  assert.equal((await putState(started.base, 'care-seo', { schemaVersion: 1, revisions: [], marker: 'rollback-a' })).response.status, 200);
  assert.equal((await requestJson(started.base, `/assets/${rollbackAssetB}`, { method: 'DELETE' })).response.status, 200);
  const rollbackJournalPath = path.join(root, '.restore-transaction.json');
  let rollbackSafetyId = '';
  const rollbackSabotage = (async () => {
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline) {
      try {
        const journal = JSON.parse(await readFile(rollbackJournalPath, 'utf8'));
        rollbackSafetyId = String(journal.safetyBackupId);
        await rm(path.join(root, 'backups', rollbackSafetyId, 'assets', `${rollbackAssetA}.blob`), { force: true });
        await chmod(path.join(rollbackTargetDirectory, 'care-seo.json'), 0o000);
        return;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
    throw new Error('Timed out waiting for restore journal in rollback-integrity regression.');
  })();
  const failedRollbackRestore = requestJson(started.base, `/backups/${rollbackTargetId}/restore`, { method: 'POST' });
  const [failedRollbackResult] = await Promise.all([failedRollbackRestore, rollbackSabotage]);
  await chmod(path.join(rollbackTargetDirectory, 'care-seo.json'), 0o600).catch(() => undefined);
  assert.equal(failedRollbackResult.response.status, 500);
  assert.match(String(failedRollbackResult.payload.error.message), /自动回滚失败/);
  assert.equal(typeof JSON.parse(await readFile(rollbackJournalPath, 'utf8')).safetyBackupId, 'string',
    'A failed rollback integrity check must retain the restore journal for crash recovery/operator inspection.');
  assert.equal(rollbackSafetyId.length > 0, true);

  process.env.ADMIN_LOCAL_FILE_MODE = 'false';
  const disabled = await requestJson(started.base, '/status');
  assert.equal(disabled.response.status, 404);
  assert.equal(disabled.payload.error.code, 'NOT_FOUND');

  console.log('local file admin: versioned envelope + legacy migration + integrity + backup/restore + restart + fail-closed future schema PASS');
} finally {
  if (corruptRecoveryChild) { corruptRecoveryChild.kill('SIGTERM'); await new Promise<void>(resolve => corruptRecoveryChild!.once('exit', () => resolve())).catch(() => undefined); }
  if (corruptRecoveryRoot) await rm(corruptRecoveryRoot, { recursive: true, force: true }).catch(() => undefined);
  if (recoveryChild) { recoveryChild.kill('SIGTERM'); await new Promise<void>(resolve => recoveryChild!.once('exit', () => resolve())).catch(() => undefined); }
  if (recoveryRoot) await rm(recoveryRoot, { recursive: true, force: true }).catch(() => undefined);
  if (leaseChild) { leaseChild.kill('SIGTERM'); await new Promise<void>(resolve => leaseChild!.once('exit', () => resolve())).catch(() => undefined); }
  if (active) await closeServer(active).catch(() => undefined);
  await rm(root, { recursive: true, force: true });
}
