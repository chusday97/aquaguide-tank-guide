import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  buildCompatibilityIdentityReviewQueue,
  type CompatibilityIdentityMigrationAudit,
} from '../src/services/compatibility/identity-review-queue.service';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const inputPath = arg('input') || 'docs/compatibility_identity_migration_audit.json';
const outputPath = arg('output') || 'evaluation/product/compatibility-identity-review-queue.v1.json';
const audit = JSON.parse(readFileSync(inputPath, 'utf8')) as CompatibilityIdentityMigrationAudit;
const manifest = buildCompatibilityIdentityReviewQueue(audit, new Date().toISOString(), inputPath);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(JSON.stringify({
  output: outputPath,
  ...manifest.summary,
  promotionAllowed: manifest.promotionAllowed,
  writesAuthority: manifest.writesAuthority,
}, null, 2));
