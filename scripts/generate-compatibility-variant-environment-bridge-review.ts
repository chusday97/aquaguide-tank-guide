import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { buildCompatibilityVariantEnvironmentBridgeReview } from '../src/services/compatibility/variant-bridge-review.service';

const outputPath = 'evaluation/product/compatibility-variant-environment-bridge-review.v1.json';
const report = buildCompatibilityVariantEnvironmentBridgeReview();
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  outputPath,
  ...report.summary,
  ...report.policy,
}, null, 2));
