import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { buildCompatibilityTaxonResearchPlan } from '../src/services/compatibility/compatibility-field-coverage.service';
import {
  buildCompatibilityVariantBridgeReviewManifest,
} from '../src/services/compatibility/variant-bridge-review.service';
import type { CompatibilityResearchReviewManifest } from '../src/services/compatibility/research-review-queue.service';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const queuePath = arg('queue') || 'evaluation/product/compatibility-research-review-queue.v1.json';
const output = arg('output') || 'evaluation/product/compatibility-variant-bridge-review.v1.json';

const queue = JSON.parse(readFileSync(queuePath, 'utf8')) as CompatibilityResearchReviewManifest;
const manifest = buildCompatibilityVariantBridgeReviewManifest(
  queue,
  buildCompatibilityTaxonResearchPlan(),
  new Date().toISOString(),
  queuePath,
);

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(manifest, null, 2) + '\n');

console.log(JSON.stringify({
  output,
  ...manifest.summary,
  promotionAllowed: manifest.promotionAllowed,
  writesAuthority: manifest.writesAuthority,
}, null, 2));
