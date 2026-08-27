import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ApiError } from '../apps/api/src/http';
import { throwLivestockAdditionRpcError } from '../apps/api/src/livestock-addition-error';

const expectApiError = (message: string, status: number, code: string) => {
  assert.throws(
    () => throwLivestockAdditionRpcError({ code: 'P0001', message }),
    (error: unknown) => error instanceof ApiError && error.status === status && error.code === code,
  );
};

expectApiError('AQUARIUM_NOT_FOUND', 404, 'NOT_FOUND');
expectApiError('SPECIES_NOT_FOUND', 404, 'NOT_FOUND');
expectApiError('DUPLICATE_OPERATION_KEY', 409, 'DUPLICATE_RESOURCE');
expectApiError('DUPLICATE_BATCH_ID', 409, 'DUPLICATE_RESOURCE');
expectApiError('unexpected database failure', 503, 'DEPENDENCY_UNAVAILABLE');

const routeSource = readFileSync(new URL('../apps/api/src/routes/aquariums.ts', import.meta.url), 'utf8');
assert.match(routeSource, /readPublishedCatalogDecision/);
assert.match(routeSource, /const serverDecision = await readPublishedCatalogDecision/);
assert.match(routeSource, /serverDecision\.status !== confirmation\.status/);
assert.match(routeSource, /if \(parsed\.data\.intent === 'planned_addition'\)/);
assert.match(routeSource, /if \(serverDecision\.status === 'not_recommended'\)/);
assert.match(routeSource, /if \(serverDecision\.status === 'insufficient_data'\)/);

console.log('livestock addition API errors verified: not-found, duplicate and dependency failures keep distinct semantics');
