import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const scanRoots = ['src', 'apps', 'packages'];
const allowedLegacyConsumers = new Set([
  'src/lib/tankCompatibilityEngine.ts',
  'src/lib/compatibility/canonical-result.adapter.ts',
  'src/services/compatibility/compatibility.service.ts',
  'src/components/CompatibilityRiskCalculator.tsx',
  'src/components/SpeciesDetailDialog.tsx',
  'src/components/visual-results/visual-result.adapters.ts',
  'src/pages/Aquarium.tsx',
  'src/pages/Encyclopedia.tsx',
]);

const files = [];
const visit = (directory) => {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) visit(path);
    else if (/\.(ts|tsx)$/.test(entry)) files.push(path);
  }
};
for (const directory of scanRoots) visit(join(root, directory));

const violations = [];
for (const path of files) {
  const source = readFileSync(path, 'utf8');
  if (!/tankCompatibilityEngine/.test(source)) continue;
  const relativePath = relative(root, path);
  if (/from ['"][^'"]*tankCompatibilityEngine['"]/.test(source) && !allowedLegacyConsumers.has(relativePath)) {
    violations.push(`${relativePath}: direct legacy engine import is not allowlisted`);
  }
}

const legacyEngine = readFileSync(join(root, 'src/lib/tankCompatibilityEngine.ts'), 'utf8');
const service = readFileSync(join(root, 'src/services/compatibility/compatibility.service.ts'), 'utf8');
const requiredEngineSignals = [
  'const domainDecision = evaluateCompatibility(domainInput);',
  'domainStatus: domainDecision.status',
  'return applyCanonicalCompatibilityDecision',
];
for (const signal of requiredEngineSignals) {
  if (!legacyEngine.includes(signal)) violations.push(`tankCompatibilityEngine.ts: missing Domain authority signal: ${signal}`);
}
for (const signal of ['normalizeCanonicalResult', 'getCompatibilityDecision(result)', 'domainStatus']) {
  if (!service.includes(signal)) violations.push(`compatibility.service.ts: missing canonical decision signal: ${signal}`);
}

if (violations.length > 0) {
  console.error('Compatibility authority gate failed:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`Compatibility authority gate passed: ${files.length} source files scanned; legacy facade consumers are allowlisted and Domain decision signals are present.`);
