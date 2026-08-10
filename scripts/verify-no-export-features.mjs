import fs from 'node:fs';
import path from 'node:path';

const roots = ['src', 'scripts', 'package.json'];
const forbidden = [
  'imageExport',
  "feature: 'image-export'",
  'AquariumExportCenter',
  'ExportArtifactDialog',
  'openExportArtifact',
  'buildHealthScoreArtifact',
  'buildDiagnosisArtifact',
  'buildWeeklyCareArtifact',
  'buildAquariumArchiveArtifact',
  'buildHundredDayArtifact',
  'buildStarterChecklistArtifact',
  'exportLocalAppState',
  'html2canvas',
  '下载诊断结果图',
  '导出评分',
  '导出计划',
  '导出 · 建设中',
  '保存图片 · 建设中',
  'Print card',
  'Export species card',
];
const files = [];
const walk = (target) => {
  if (target === 'scripts/verify-no-export-features.mjs' || target === 'scripts/remove-export-features.mjs' || target === 'scripts/fix-remove-export-migration.mjs') return;
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(target)) walk(path.join(target, name));
  } else if (/\.(ts|tsx|js|mjs|json|md)$/.test(target) || target === 'package.json') files.push(target);
};
roots.forEach(walk);
const failures = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const token of forbidden) if (text.includes(token)) failures.push(file + ': ' + token);
}
for (const deletedPath of ['src/components/export', 'src/services/export', 'scripts/test-aquarium-artifacts.ts']) {
  if (fs.existsSync(deletedPath)) failures.push('still exists: ' + deletedPath);
}
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (pkg.dependencies?.html2canvas) failures.push('html2canvas dependency still present');
if (pkg.scripts?.['test:aquarium-artifacts']) failures.push('test:aquarium-artifacts script still present');
if (failures.length) {
  console.error('Export removal regression failed:');
  failures.forEach(item => console.error('- ' + item));
  process.exit(1);
}
console.log('No export product surfaces remain.');
