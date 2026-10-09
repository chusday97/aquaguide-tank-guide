import assert from 'node:assert/strict';
import { assertContentImportCommitTarget, getSupabaseProjectRef } from './content-import/target-guard';

assert.equal(getSupabaseProjectRef('https://ydiygvhuqpogmqlcvgob.supabase.co'), 'ydiygvhuqpogmqlcvgob');
assert.equal(getSupabaseProjectRef('not-a-url'), null);
assert.equal(getSupabaseProjectRef(undefined), null);

assert.equal(assertContentImportCommitTarget({
  SUPABASE_URL: 'https://ydiygvhuqpogmqlcvgob.supabase.co',
  CONTENT_IMPORT_EXPECTED_PROJECT_REF: 'ydiygvhuqpogmqlcvgob',
}), 'ydiygvhuqpogmqlcvgob');

assert.equal(assertContentImportCommitTarget({
  VITE_SUPABASE_URL: 'https://preview-ref.supabase.co',
  CONTENT_IMPORT_EXPECTED_PROJECT_REF: 'preview-ref',
}), 'preview-ref');

assert.throws(() => assertContentImportCommitTarget({
  SUPABASE_URL: 'https://wrong-project.supabase.co',
  CONTENT_IMPORT_EXPECTED_PROJECT_REF: 'ydiygvhuqpogmqlcvgob',
}), /target mismatch/);

assert.throws(() => assertContentImportCommitTarget({
  SUPABASE_URL: 'https://ydiygvhuqpogmqlcvgob.supabase.co',
}), /CONTENT_IMPORT_EXPECTED_PROJECT_REF is required/);

assert.throws(() => assertContentImportCommitTarget({
  SUPABASE_URL: 'invalid',
  CONTENT_IMPORT_EXPECTED_PROJECT_REF: 'ydiygvhuqpogmqlcvgob',
}), /Unable to resolve/);

console.log('content import target guard PASS');
