import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  buildIdentityBulkReview,
  type IdentityBulkBaseItem,
  type VariantIdentityResearchReportLike,
} from '../src/services/compatibility/identity-bulk-research.service';

const arg = (name: string) => {
  const prefix = '--' + name + '=';
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const basePath = arg('base') || 'evaluation/product/compatibility-identity-bulk-base-resolution.v1.json';
const variantPath = arg('variant') || 'evaluation/product/compatibility-identity-bulk-variant-research.v1.json';
const outputPath = arg('output') || 'evaluation/product/compatibility-identity-bulk-review.v1.json';

const base = JSON.parse(readFileSync(basePath, 'utf8')) as {
  generatedAt: string;
  items: IdentityBulkBaseItem[];
};
const variant = JSON.parse(readFileSync(variantPath, 'utf8')) as VariantIdentityResearchReportLike;
const report = buildIdentityBulkReview(base, variant, new Date().toISOString());

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ output: outputPath, ...report.summary, promotionAllowed: false, writesAuthority: false }, null, 2));
