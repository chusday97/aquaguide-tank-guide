import { readFileSync, writeFileSync } from 'node:fs';

const path = 'scripts/verify-guided-navigation.mjs';
let source = readFileSync(path, 'utf8');

const staleSearch = `  await desktop.locator('#search-species-sp_0001').click();\n  await desktop.getByRole('button', { name: '查看详情' }).click();\n  await desktop.waitForURL('**/encyclopedia?species=sp_0001&source=search');`;
const currentSearch = `  await desktop.locator('#search-species-sp_0001').click();\n  await desktop.waitForURL('**/encyclopedia?species=sp_0001&source=search');`;
if (source.includes(staleSearch)) {
  source = source.replace(staleSearch, currentSearch);
} else if (!source.includes(currentSearch)) {
  throw new Error('guided navigation search-result contract could not be located');
}

const staleDrawer = `  await narrowEnglish.getByRole('button', { name: 'Discard changes' }).click();\n  await narrowEnglish.getByRole('heading', { name: /^Manage / }).waitFor({ state: 'hidden' });\n  await narrowEnglish.getByRole('button', { name: 'Settings', exact: true }).click();`;
const currentDrawer = `  await narrowEnglish.getByRole('button', { name: 'Discard changes' }).click();\n  await narrowEnglish.getByRole('heading', { name: /^Manage / }).waitFor({ state: 'hidden' });\n  await narrowEnglish.keyboard.press('Escape');\n  await narrowEnglish.locator('[role="dialog"][data-surface="right-drawer"]:visible').waitFor({ state: 'hidden' });\n  await narrowEnglish.getByRole('button', { name: 'Settings', exact: true }).click();`;
if (source.includes(staleDrawer)) {
  source = source.replace(staleDrawer, currentDrawer);
} else if (!source.includes(currentDrawer)) {
  throw new Error('guided navigation drawer-close contract could not be located');
}

writeFileSync(path, source);
console.log('Guided navigation test aligned with Card = Open object and modal drawer focus contracts.');
