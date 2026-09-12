import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

const root = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-local-admin-'));
process.env.ADMIN_LOCAL_FILE_MODE = 'true';
process.env.ADMIN_LOCAL_FILE_ROOT = root;
process.env.ADMIN_RUNTIME_SNAPSHOT_ROOT = path.join(root, 'public');
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


  const compatibilityV2 = {
    schemaVersion: 2,
    reviewedProfiles: Array.from({ length: 7 }, (_, index) => ({ catalogKey: `sp-test-${index + 1}` })),
    reviewedPairRules: Array.from({ length: 4 }, (_, index) => ({ catalogKeys: [`sp-test-${index + 1}`, `sp-test-${index + 2}`] })),
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
  const reviewedCompatibilityV2 = {
    ...compatibilityV2,
    reviewedProfiles: compatibilityV2.reviewedProfiles.map((row, index) => ({ ...row, reviewStatus: 'reviewed', behaviorTraits: [], predationTargets: [], confidence: 'medium', citations: [{ id: `profile-evidence-${index}`, title: 'Evidence', publisher: 'Test', url: 'https://example.com', sourceType: 'peer_reviewed', reviewStatus: 'reviewed', version: 1 }], requiredFacts: ['water'], stageRiskRules: [], version: 1 })),
    reviewedPairRules: compatibilityV2.reviewedPairRules.map((row, index) => ({ ...row, reviewStatus: 'reviewed', verdict: 'caution', riskType: 'test', reason: 'test', mitigation: [], basis: 'pair_rule', confidence: 'medium', citations: [{ id: `pair-evidence-${index}`, title: 'Evidence', publisher: 'Test', url: 'https://example.com', sourceType: 'peer_reviewed', reviewStatus: 'reviewed', version: 1 }], version: 1 })),
  };
  assert.equal((await putState(started.base, 'compatibility', reviewedCompatibilityV2)).response.status, 200);
  const runtimeSnapshot = await requestJson(started.base, '/runtime-snapshot', { method: 'POST' });
  assert.equal(runtimeSnapshot.response.status, 201);
  assert.deepEqual(runtimeSnapshot.payload.data.counts, { species: 1, care: 1, profiles: 7, pairRules: 4 });
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
  assert.equal(exported.compatibility.profiles.length, 7);
  assert.equal(exported.compatibility.pairRules.length, 4);

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

  process.env.ADMIN_LOCAL_FILE_MODE = 'false';
  const disabled = await requestJson(started.base, '/status');
  assert.equal(disabled.response.status, 404);
  assert.equal(disabled.payload.error.code, 'NOT_FOUND');

  console.log('local file admin: versioned envelope + legacy migration + integrity + backup/restore + restart + fail-closed future schema PASS');
} finally {
  if (active) await closeServer(active).catch(() => undefined);
  await rm(root, { recursive: true, force: true });
}
