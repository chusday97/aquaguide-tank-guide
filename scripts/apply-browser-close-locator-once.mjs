import { readFileSync, writeFileSync } from 'node:fs';

const path = 'scripts/test-care-relocation-browser-golden-path.mjs';
const content = readFileSync(path, 'utf8');
const before = `await page.getByRole('button', { name: '关闭' }).click();`;
const after = `await page.locator('[data-relocation-confirmation-dialog="true"] button').filter({ hasText: /^关闭$/ }).click();`;
const count = content.split(before).length - 1;
if (count !== 2) throw new Error(`${path}: expected exactly two ambiguous Close locators, found ${count}`);
const updated = content.split(before).join(after);
if ((updated.split(after).length - 1) !== 2) throw new Error('expected exactly two explicit visible-text Close locators after patch');
writeFileSync(path, updated);
console.log('browser Close locator patch applied: two accessible-name-ambiguous locators replaced with explicit visible-text action locators');
