import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { buildCompatibilityVariantEnvironmentCandidateReview } from '../src/services/compatibility/variant-environment-candidate-review.service';

const outputPath = 'evaluation/product/compatibility-variant-environment-candidates.v1.json';
const report = buildCompatibilityVariantEnvironmentCandidateReview();
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  outputPath,
  ...report.summary,
  writesAuthority: report.policy.writesAuthority,
  promotionAllowed: report.policy.promotionAllowed,
  grantsInheritance: report.policy.grantsInheritance,
}, null, 2));
