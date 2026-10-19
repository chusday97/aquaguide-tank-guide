import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { buildCompatibilityVariantExactEvidenceQueue } from '../src/services/compatibility/variant-exact-evidence-queue.service';

const outputPath = 'evaluation/product/compatibility-variant-exact-evidence-queue.v1.json';
const report = buildCompatibilityVariantExactEvidenceQueue();
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  outputPath,
  ...report.summary,
  ...report.policy,
}, null, 2));
