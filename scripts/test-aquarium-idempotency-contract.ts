import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const routes = readFileSync(resolve(import.meta.dirname, '../apps/api/src/routes/aquariums.ts'), 'utf8');
const repository = readFileSync(resolve(import.meta.dirname, '../src/services/repository/api-aquaguide.repository.ts'), 'utf8');

const mutationRoute = /aquariumsRouter\.(post|patch|put|delete)\('([^']+)'/g;
const matches = [...routes.matchAll(mutationRoute)];
assert.ok(matches.length >= 10, 'expected the aquarium router mutation surface');

for (let index = 0; index < matches.length; index += 1) {
  const match = matches[index];
  const start = match.index!;
  const end = matches[index + 1]?.index ?? routes.length;
  const block = routes.slice(start, end);
  const endpoint = `${match[1].toUpperCase()} ${match[2]}`;
  const usesGenericLedger = block.includes('beginIdempotentWrite(request)');
  const usesAtomicOperationKey = block.includes('operation_key:') && (
    block.includes('getRequestHash(request)') || block.includes('operation_request_hash:')
  );
  assert.equal(
    usesGenericLedger || usesAtomicOperationKey,
    true,
    `${endpoint} must actually consume Idempotency-Key, not merely rely on router middleware`,
  );
  if (usesGenericLedger) {
    assert.match(
      block,
      /finishIdempotentWrite\(request, idempotency,/,
      `${endpoint} must record successful generic idempotency state`,
    );
  }
}

const saveStart = repository.indexOf('async saveAquarium');
const saveEnd = repository.indexOf('async removeLivestock', saveStart);
assert.ok(saveStart >= 0 && saveEnd > saveStart);
const saveAquarium = repository.slice(saveStart, saveEnd);
assert.doesNotMatch(
  saveAquarium,
  /createIdempotencyKey\(/,
  'legacy aggregate save must not generate a fresh idempotency key on every retry',
);
for (const prefix of [
  'aquarium-save-update:',
  'aquarium-save-create:',
  'aquarium-save-species-update:',
  'aquarium-save-species-create:',
  'aquarium-save-batch-create:',
  'aquarium-save-species-delete:',
  'aquarium-save-equipment:',
]) {
  assert.ok(saveAquarium.includes(prefix), `saveAquarium must use stable operation key prefix ${prefix}`);
}

console.log(`aquarium idempotency contract passed: ${matches.length} mutation routes consume replay state and aggregate retries use stable keys`);
