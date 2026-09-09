import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { chromium } from 'playwright';

const getFreePort = () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    if (!address || typeof address === 'string') return reject(new Error('Could not allocate a port.'));
    server.close(error => error ? reject(error) : resolve(address.port));
  });
});

const port = await getFreePort();
const cwd = path.join(process.cwd(), 'apps/admin-content');
const viteBin = path.join(process.cwd(), 'node_modules/vite/bin/vite.js');
const baseUrl = `http://127.0.0.1:${port}`;
let logs = '';
const child = spawn(process.execPath, [viteBin, '--host=127.0.0.1', `--port=${port}`, '--strictPort'], {
  cwd, stdio: ['ignore', 'pipe', 'pipe'],
});
child.stdout.on('data', chunk => { logs += chunk.toString(); });
child.stderr.on('data', chunk => { logs += chunk.toString(); });

const stop = async () => {
  if (child.exitCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([
    new Promise(resolve => child.once('exit', resolve)),
    new Promise(resolve => setTimeout(resolve, 4000)),
  ]);
};
const waitForReady = async () => {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`SEO Admin exited during startup.\n${logs}`);
    try { if ((await fetch(`${baseUrl}/?demo=1`)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error(`Timed out waiting for SEO Admin.\n${logs}`);
};

const browser = await chromium.launch({ headless: true });
const runViewport = async (label, viewport) => {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(`${baseUrl}/?demo=1`, { waitUntil: 'networkidle' });
  const coreSeo = page.locator('.editor-secondary-seo-disclosure');
  await coreSeo.waitFor();
  assert.equal(await coreSeo.evaluate(element => element.open), true, 'Core Search & indexing controls must be visible by default.');
  assert.match(await coreSeo.innerText(), /搜索展示[\s\S]*收录与 Canonical/);
  assert.equal(await coreSeo.getByRole('button', { name: '本页自定义', exact: true }).count(), 3, 'Inherited Title/Description/H1 must expose three explicit current-page override choices.');
  assert.equal(await coreSeo.getByRole('button', { name: '单独修改', exact: true }).count(), 0, 'Generic override copy must not remain visible.');
  const searchFields = coreSeo.locator('.search-settings .inheritance-editor-field');
  assert.equal(await searchFields.count(), 3, 'Title/Description/H1 must remain visible as three source rows.');
  for (let index = 0; index < 3; index += 1) {
    assert.match(await searchFields.nth(index).getAttribute('class'), /is-inherited/);
    const box = await searchFields.nth(index).boundingBox();
    assert.equal(Boolean(box && box.height <= 54), true, 'Inherited search rows must stay compact until the operator opens a page override.');
  }
  const firstInheritedSearchField = searchFields.first();
  await firstInheritedSearchField.getByRole('button', { name: '本页自定义', exact: true }).click();
  assert.match(await firstInheritedSearchField.getAttribute('class'), /is-editing/, 'Choosing page customization must expand exactly that field into editing state.');
  assert.equal(await firstInheritedSearchField.locator('input, textarea').count(), 1, 'Expanded page customization must expose the real input control.');
  await firstInheritedSearchField.getByRole('button', { name: '取消本页自定义', exact: true }).click();
  assert.match(await firstInheritedSearchField.getAttribute('class'), /is-inherited/, 'Cancelling page customization must return the field to compact inherited state.');
  const policySection = coreSeo.locator('.policy-settings');
  const policyBox = await policySection.boundingBox();
  const secondarySeoBox = await coreSeo.boundingBox();
  assert.equal(Boolean(policyBox && policyBox.height < 300), true, 'Visible indexing/canonical controls must stay below the 300px desktop density budget.');
  assert.equal(Boolean(secondarySeoBox && secondarySeoBox.height < 620), true, 'The full visible Search & indexing section must stay below the 620px desktop density budget.');
  assert.equal((await policySection.locator('.policy-primary-fields').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length)), 2, 'Keyword and indexing policy must share one desktop row.');
  assert.doesNotMatch(await policySection.innerText(), /静态物种页面生成器已验证；正式发布仍然锁定。/, 'The policy form must not repeat the global Production lock message.');
  assert.match(await page.locator('.live-preview-header').innerText(), /最终页面 = 基础模板 \+ 当前页面/, 'Preview header must explain the composed final-page ownership.');
  await page.getByRole('button', { name: '基础模板', exact: true }).last().click();
  assert.equal(await page.locator('.editor-scope-context').count(), 0, 'Base editor must not repeat ownership in a second impact strip.');
  assert.match(await page.locator('.base-task-header').innerText(), /基础模板[\s\S]*同组 4 个页面共用[\s\S]*修改后会同步影响同组页面/);
  assert.match(await page.locator('.live-preview-header').innerText(), /最终页面 = 基础模板 \+ 当前页面/);
  const contextualTools = page.locator('.current-page-tools');
  assert.match(await contextualTools.locator('summary').innerText(), /基础模板工具[\s\S]*最终页发布资格[\s\S]*基础模板历史/);
  await contextualTools.evaluate(element => { element.open = true; });
  await contextualTools.getByRole('button', { name: /基础模板历史/ }).click();
  let ownershipDrawer = page.locator('.editor-tool-drawer');
  await ownershipDrawer.waitFor();
  assert.equal(await ownershipDrawer.locator('h2').innerText(), '基础模板版本历史');
  assert.equal(await ownershipDrawer.getByTestId('context-history-panel').locator(':scope > *').count(), 1, 'Base history drawer must render exactly one Base authority panel.');
  await ownershipDrawer.getByRole('button', { name: '关闭工具面板' }).click();

  await page.getByRole('button', { name: '当前页面', exact: true }).last().click();
  assert.match(await contextualTools.locator('summary').innerText(), /当前页面工具[\s\S]*最终页发布资格[\s\S]*当前页面历史/);
  await contextualTools.evaluate(element => { element.open = true; });
  await contextualTools.getByRole('button', { name: /当前页面历史/ }).click();
  ownershipDrawer = page.locator('.editor-tool-drawer');
  await ownershipDrawer.waitFor();
  assert.equal(await ownershipDrawer.locator('h2').innerText(), '当前页面版本历史');
  assert.equal(await ownershipDrawer.getByTestId('context-history-panel').locator(':scope > *').count(), 1, 'Current-page history drawer must render exactly one current-page authority panel.');
  await ownershipDrawer.getByRole('button', { name: '关闭工具面板' }).click();
  assert.equal(await page.locator('.editor-footer button').count(), 0, 'Editor footer must not duplicate top review actions.');
  assert.equal(await page.locator('.editor-panel .draft-safety-chip').count(), 0, 'Editor body must not repeat Draft status from the top review bar.');
  const topChromeHeight = async () => {
    const selectors = ['.current-task-notice', '.workflow-command-center', '.page-review-top-slot'];
    let total = 0;
    for (const selector of selectors) total += await page.locator(selector).evaluate(element => element.getBoundingClientRect().height);
    return total;
  };
  assert.equal((await topChromeHeight()) <= 140, true, 'Desktop task + workflow + page-review chrome must stay within the compact 140px budget.');
  const currentPageTools = page.locator('.current-page-tools');
  assert.match(await currentPageTools.evaluate(element => element.textContent || ''), /当前页面工具[\s\S]*发布资格|当前页面工具[\s\S]*发布检查/);
  assert.doesNotMatch(await currentPageTools.evaluate(element => element.textContent || ''), /批量审核重复记录|批量内容审核|SEO 模板导入|工作队列/);
  const operationsTrigger = page.getByRole('button', { name: '运营工具', exact: true });
  await operationsTrigger.click();
  const operationsDrawer = page.locator('.editor-tool-drawer');
  await operationsDrawer.waitFor();
  const operationsMenu = operationsDrawer.getByTestId('operations-tool-menu');
  assert.match(await operationsMenu.innerText(), /批量审核重复记录[\s\S]*SEO 模板导入[\s\S]*任务队列/);
  assert.equal(await operationsDrawer.evaluate(element => element.scrollWidth - element.clientWidth), 0, 'Operations drawer must not overflow horizontally.');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(100);
  assert.equal(await operationsTrigger.isVisible(), true, 'Operations entry must remain accessible on mobile.');
  assert.equal((await policySection.locator('.policy-primary-fields').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length)), 1, 'Mobile indexing policy must return to one readable column.');
  assert.equal((await topChromeHeight()) <= 140, true, 'Mobile task + workflow + page-review chrome must stay within the compact 140px budget.');
  assert.equal(await page.locator('.current-task-notice').getByText('33 个数据问题需要确认', { exact: true }).isVisible(), true, 'Mobile current-task notification must keep the actual problem title visible after compaction.');
  assert.equal(await operationsDrawer.evaluate(element => element.scrollWidth - element.clientWidth), 0, 'Mobile Operations drawer must not overflow horizontally.');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0, 'Mobile SEO Admin must not gain page-level horizontal overflow from the Operations entry.');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await operationsDrawer.getByRole('button', { name: /关闭|Close/ }).click().catch(async () => { await page.keyboard.press('Escape'); });
  await page.getByRole('button', { name: /处理重复/ }).first().click();
  const drawer = page.locator('.editor-tool-drawer');
  await drawer.waitFor();
  assert.match(await drawer.innerText(), /先看判断依据，再选择一个结论并确认最终结果/);
  const evidence = drawer.locator('.review-evidence-first');
  assert.equal(await evidence.getByText('保留此页面', { exact: true }).count(), 0);
  assert.equal(await evidence.locator('input[type="radio"]').count(), 0);
  assert.equal(await drawer.getByTestId('review-canonical-choice').count(), 0);

  await drawer.getByText('确认是重复记录', { exact: true }).click();
  const canonical = drawer.getByTestId('review-canonical-choice');
  await canonical.waitFor();
  assert.equal(await canonical.locator('input[type="radio"]:checked').count(), 0, 'System suggestion must not become an automatic human decision.');
  assert.match(await canonical.innerText(), /仅影响 SEO · 不改源数据[\s\S]*系统建议/);
  assert.equal(await drawer.getByTestId('review-confirm-final').isEnabled(), false);
  assert.match(await drawer.getByTestId('review-final-result').innerText(), /最终确认版本[\s\S]*请先选择要保留的 SEO 页面/);

  await canonical.locator('.review-canonical-option').first().click();
  assert.equal(await canonical.locator('input[type="radio"]:checked').count(), 1);
  assert.match(await drawer.getByTestId('review-final-result').innerText(), /最终确认版本[\s\S]*Canonical 指向该页面[\s\S]*不改写源数据/);
  assert.equal(await drawer.getByTestId('review-confirm-final').isEnabled(), true);
  assert.equal(await drawer.locator('.review-decision-primary-actions button').count(), 1);
  assert.equal(await drawer.getByText('稍后再判断', { exact: true }).count(), 0);
  assert.equal(await drawer.evaluate(element => element.scrollWidth - element.clientWidth), 0, `${label} Data Review drawer must not overflow horizontally.`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(100);
  assert.equal(await drawer.evaluate(element => element.scrollWidth - element.clientWidth), 0, 'mobile Data Review drawer must not overflow horizontally.');
  assert.equal(await canonical.locator('.review-canonical-option').count() >= 2, true);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseUrl}/?demo=1`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /处理数据/ }).first().click();
  const categoryDrawer = page.locator('.editor-tool-drawer');
  await categoryDrawer.waitFor();
  const categoryEvidence = categoryDrawer.locator('.review-evidence-first');
  assert.match(await categoryEvidence.innerText(), /系统已确认[\s\S]*系统无法自动确认[\s\S]*怎么判断/);
  assert.equal(await categoryDrawer.getByTestId('review-canonical-choice').count(), 0);
  await categoryDrawer.getByText('确认分类有效', { exact: true }).click();
  assert.match(await categoryDrawer.getByTestId('review-final-result').innerText(), /3 · 最终确认版本[\s\S]*这里不会改写源数据[\s\S]*继续进入 SEO 流程/);
  assert.equal(await categoryDrawer.locator('.review-decision-primary-actions button').count(), 1);
  assert.equal(await categoryDrawer.getByTestId('review-confirm-final').isEnabled(), true);
  assert.deepEqual(errors, []);
  await context.close();
};

try {
  await waitForReady();
  await runViewport('desktop + responsive mobile', { width: 1440, height: 1000 });
  console.log('PASS SEO Admin hierarchy: compact top chrome + Data Review decision flow + page/global Operations separation + responsive layout.');
} finally {
  await browser.close();
  await stop();
}
