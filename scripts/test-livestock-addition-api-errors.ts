import assert from 'node:assert/strict';
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

console.log('livestock addition API errors verified: not-found, duplicate and dependency failures keep distinct semantics');
