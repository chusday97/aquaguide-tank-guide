import { readFileSync, writeFileSync } from 'node:fs';

const path = 'scripts/verify-guided-navigation.mjs';
let source = readFileSync(path, 'utf8');
const stale = `  await desktop.locator('#search-species-sp_0001').click();\n  await desktop.getByRole('button', { name: '查看详情' }).click();\n  await desktop.waitForURL('**/encyclopedia?species=sp_0001&source=search');`;
const current = `  await desktop.locator('#search-species-sp_0001').click();\n  await desktop.waitForURL('**/encyclopedia?species=sp_0001&source=search');`;
if (source.includes(stale)) {
  source = source.replace(stale, current);
  writeFileSync(path, source);
} else if (!source.includes(current)) {
  throw new Error('guided navigation search-result contract could not be located');
}
console.log('Guided navigation test aligned with Card = Open object contract.');
