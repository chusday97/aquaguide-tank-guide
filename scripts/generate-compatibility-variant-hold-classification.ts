import { mkdirSync, writeFileSync } from 'node:fs';
import { buildCompatibilityVariantHoldClassification } from '../src/services/compatibility/compatibility-variant-hold-classification.service';

const report = buildCompatibilityVariantHoldClassification();
const root = new URL('../', import.meta.url).pathname;
mkdirSync(`${root}docs`, { recursive: true });
writeFileSync(
  `${root}docs/compatibility_variant_hold_classification.json`,
  JSON.stringify(report, null, 2) + '\n',
);
console.log(JSON.stringify(report.summary, null, 2));
