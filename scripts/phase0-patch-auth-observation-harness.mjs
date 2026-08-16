import { readFile, writeFile } from 'node:fs/promises';

const path = 'scripts/verify-auth-two-device-cloud.mjs';
const source = await readFile(path, 'utf8');

if (source.includes('✓ observation recovered cross-device from canonical event')) {
  console.log('Observation acceptance block already present; no patch needed');
  process.exit(0);
}

const anchor = `  console.log('✓ feeding state recovered cross-device from canonical event');

  // Account-level care favorite + tank-scoped care operation are both exercised through the actual Care detail UI.`;
const matches = source.split(anchor).length - 1;
if (matches !== 1) {
  throw new Error(`Expected exactly one post-feeding harness anchor, found ${matches}`);
}

const replacement = `  console.log('✓ feeding state recovered cross-device from canonical event');

  // Record a real normal observation through the aquarium quick action. Device B must rebuild
  // the canonical observation event from cloud state without copying AquaGuide business storage.
  await switchAquariumFromUi(pageA, secondAquarium);
  await pageA.getByText('记录观察', { exact: true }).click();
  const observationDialog = pageA.getByRole('dialog');
  await observationDialog.getByText('观察鱼的状态', { exact: true }).waitFor({ state: 'visible', timeout: 10_000 });
  await observationDialog.getByRole('button', { name: '没有异常，记录观察', exact: true }).click();
  await waitForCareEvent(pageA, { aquariumId: secondAquarium.id, eventType: 'observation', sourceType: 'observation_record' });

  const deviceAObservation = (await getCareEvents(pageA)).find(event =>
    event.aquariumId === secondAquarium.id
    && event.eventType === 'observation'
    && event.sourceType === 'observation_record'
    && event.payload?.localDate === today
  );
  assert.ok(deviceAObservation, 'device A must persist today observation as a canonical event');
  assert.equal(deviceAObservation.payload?.status, 'normal', 'the normal UI action must persist status=normal');

  await freshCloudHydrate(pageB, [firstAquarium, secondAquarium]);
  await waitForCareEvent(pageB, { aquariumId: secondAquarium.id, eventType: 'observation', sourceType: 'observation_record' });
  const deviceBObservationEvents = (await getCareEvents(pageB)).filter(event =>
    event.eventType === 'observation' && event.sourceType === 'observation_record' && event.payload?.localDate === today
  );
  assert.ok(
    deviceBObservationEvents.some(event => event.aquariumId === secondAquarium.id && event.payload?.status === 'normal'),
    'device B must recover the normal observation for tank B from cloud state',
  );
  assert.equal(
    deviceBObservationEvents.some(event => event.aquariumId === firstAquarium.id),
    false,
    'tank A must not inherit tank B observation events',
  );
  console.log('✓ observation recovered cross-device from canonical event');

  // Account-level care favorite + tank-scoped care operation are both exercised through the actual Care detail UI.`;

const next = source.replace(anchor, replacement);
if (next === source) throw new Error('Auth observation harness patch made no change');
await writeFile(path, next, 'utf8');
console.log('Inserted real observation UI acceptance into two-device harness');
