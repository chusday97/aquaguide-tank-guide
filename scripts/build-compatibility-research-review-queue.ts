import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { buildCompatibilityResearchReviewManifest } from '../src/services/compatibility/research-review-queue.service';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const inputs = (arg('input') || 'evaluation/reports/compatibility-active-completion-batch.json')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);
const output = arg('output') || 'evaluation/product/compatibility-research-review-queue.v1.json';
const reports = inputs.map(sourcePath => ({
  sourcePath,
  report: JSON.parse(readFileSync(sourcePath, 'utf8')),
}));
const manifest = buildCompatibilityResearchReviewManifest(reports);

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({
  output,
  ...manifest.summary,
  rawSourceTextCommitted: manifest.rawSourceTextCommitted,
  writesAuthority: manifest.writesAuthority,
  promotionAllowed: manifest.promotionAllowed,
}, null, 2));
