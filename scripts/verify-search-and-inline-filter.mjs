import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const group = process.env.SEARCH_UI_GROUP || 'atlas';

const createPage = async (browser, viewport, locale = 'zh-CN') => {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(value => localStorage.setItem('aquaguide_locale', value), locale);
  return { page, errors };
};

const withBrowser = async (run) => {
  const browser = await chromium.launch({ headless: true });
  try {
    await run(browser);
  } finally {
    await browser.close();
  }
};

if (group === 'atlas') {
await withBrowser(async browser => {
    const { page, errors } = await createPage(browser, { width: 1280, height: 900 });
    await page.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'networkidle' });
    const input = page.locator('#atlas-toolbar [role="combobox"]');
    await input.fill('孔');
    const listbox = page.locator('#atlas-toolbar [role="listbox"]');
    await listbox.waitFor({ state: 'visible' });
    const options = listbox.getByRole('option');
    assert.equal(await options.count(), 8, '图鉴联想应优先显示 8 个具体物种');
    const candidateLabels = await options.evaluateAll(nodes => nodes.map(node => node.querySelector('span.min-w-0.flex-1 > span')?.textContent?.trim() || ''));
    assert.equal(new Set(candidateLabels).size, candidateLabels.length, '名称相似的候选也必须逐个显示');

    await input.press('ArrowDown');
    await input.press('Enter');
    assert.equal(await page.locator('[role="dialog"]:visible').count(), 0, 'Enter 只能确认候选，不能直接打开详情');
    const selectedSummary = page.locator('#atlas-toolbar [data-selected-species-summary="true"]');
    const viewDetails = selectedSummary.getByRole('button', { name: '查看详情', exact: true });
    await viewDetails.waitFor({ state: 'visible' });
    await input.fill('孔a');
    assert.equal(await viewDetails.count(), 0, '继续编辑输入后必须取消旧选择');

    await input.fill('孔');
    await listbox.waitFor({ state: 'visible' });
    await options.nth(1).click();
    await page.locator('#atlas-toolbar [data-selected-species-summary="true"]').getByRole('button', { name: '查看详情', exact: true }).click();
    assert.equal(await page.locator('[role="dialog"]:visible').count(), 1, '只有查看详情才打开物种详情');
    assert.deepEqual(errors, [], `图鉴搜索不应产生页面错误：${errors.join(' | ')}`);
    console.log('✓ encyclopedia autocomplete');
    await page.close();
});

await withBrowser(async browser => {
    const { page, errors } = await createPage(browser, { width: 1280, height: 900 });
    await page.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'networkidle' });
    const summaryBefore = await page.locator('#atlas-results').innerText();
    const overflowBefore = await page.locator('body').evaluate(node => getComputedStyle(node).overflow);
    await page.getByRole('button', { name: '更多筛选' }).click();
    const panel = page.locator('[data-inline-filter-panel="true"]');
    await panel.waitFor({ state: 'visible' });
    assert.equal(await page.locator('[role="dialog"]:visible').count(), 0, '原位筛选不能使用弹窗语义');
    const panelBox = await panel.boundingBox();
    const resultsBox = await page.locator('#atlas-results').boundingBox();
    assert.ok(panelBox && resultsBox && panelBox.y < resultsBox.y, '筛选区必须位于工具栏和结果摘要之间');
    assert.equal(await page.locator('body').evaluate(node => getComputedStyle(node).overflow), overflowBefore, '打开筛选不得锁定页面滚动');
    assert.match(
      await panel.evaluate(node => getComputedStyle(node).overscrollBehavior),
      /contain/,
      '筛选面板到达滚动边界后不得把滚动继续传给下方物种列表',
    );
    const scrollBoundaryBefore = await panel.evaluate(node => {
      node.scrollTop = node.scrollHeight;
      let parent = node.parentElement;
      while (parent) {
        const style = getComputedStyle(parent);
        if (/(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight) break;
        parent = parent.parentElement;
      }
      const scrollParent = parent || document.scrollingElement;
      scrollParent?.setAttribute('data-filter-scroll-parent', 'true');
      return {
        panelTop: node.scrollTop,
        parentTop: scrollParent?.scrollTop || 0,
        resultTop: document.querySelector('#atlas-results')?.getBoundingClientRect().top || 0,
      };
    });
    const panelCenter = await panel.boundingBox();
    assert.ok(panelCenter, '筛选面板必须具有可点击边界');
    await page.mouse.move(panelCenter.x + panelCenter.width / 2, panelCenter.y + panelCenter.height / 2);
    await page.mouse.wheel(0, 900);
    const scrollBoundaryAfter = await panel.evaluate(node => ({
      panelTop: node.scrollTop,
      parentTop: document.querySelector('[data-filter-scroll-parent="true"]')?.scrollTop || 0,
      resultTop: document.querySelector('#atlas-results')?.getBoundingClientRect().top || 0,
    }));
    assert.equal(scrollBoundaryAfter.panelTop, scrollBoundaryBefore.panelTop, '筛选面板应停留在自己的底部边界');
    assert.equal(scrollBoundaryAfter.parentTop, scrollBoundaryBefore.parentTop, '筛选面板内继续滚动不得改变页面滚动位置');
    assert.equal(Math.round(scrollBoundaryAfter.resultTop), Math.round(scrollBoundaryBefore.resultTop), '下方物种结果不得随筛选滚动移动');

    await panel.getByRole('button', { name: /^海水\s*\d+$/ }).click();
    await panel.locator('header button').click();
    assert.equal(await page.locator('#atlas-results').innerText(), summaryBefore, '关闭未应用草稿不得修改当前结果');

    await page.getByRole('button', { name: '更多筛选' }).click();
    await panel.getByRole('button', { name: /^海水\s*\d+$/ }).click();
    await panel.getByRole('button', { name: /应用筛选/ }).click();
    await page.getByRole('button', { name: /海水.*清除/ }).waitFor({ state: 'visible' });
    assert.deepEqual(errors, [], `原位筛选不应产生页面错误：${errors.join(' | ')}`);
    console.log('✓ inline filters');
    await page.close();
});
}

if (group === 'mobile') {
await withBrowser(async browser => {
    const { page, errors } = await createPage(browser, { width: 390, height: 844 }, 'en');
    await page.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'networkidle' });
    const input = page.locator('#atlas-toolbar [role="combobox"]');
    await input.fill('Poecilia');
    const options = page.locator('#atlas-toolbar [role="option"]');
    await options.first().waitFor({ state: 'visible' });
    const labels = await options.evaluateAll(nodes => nodes.map(node => node.querySelector('span.min-w-0.flex-1 > span')?.textContent?.trim() || ''));
    assert.ok(new Set(labels).size > 1, '英文搜索不得把相似变种全部显示成同一个学名');
    const metrics = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
    assert.ok(metrics.scrollWidth <= metrics.innerWidth + 1, `390px 英文页面不得横向溢出：${JSON.stringify(metrics)}`);
    assert.deepEqual(errors, [], `英文搜索不应产生页面错误：${errors.join(' | ')}`);
    console.log('✓ mobile English');
    await page.close();
});
}

if (group === 'care') {
await withBrowser(async browser => {
    const { page: carePage, errors: careErrors } = await createPage(browser, { width: 390, height: 844 });
    await carePage.goto(`${baseUrl}/care`, { waitUntil: 'networkidle' });
    const careInput = carePage.locator('#care-search [role="combobox"]');
    await careInput.fill('浮头');
    const careListbox = carePage.locator('#care-search [role="listbox"]');
    await careListbox.waitFor({ state: 'visible' });
    assert.equal(await careListbox.getByText('具体物种').count(), 0, '养护入口不得混入物种候选');
    const text = await careListbox.innerText();
    assert.ok(text.includes('养护内容') && text.includes('相关搜索'), '养护内容应排在相关词之前');
    await careListbox.getByRole('option').first().click();
    assert.equal(await carePage.locator('[role="dialog"]:visible').count(), 1, '养护候选应打开对应文章');
    assert.deepEqual(careErrors, [], `养护联想不应产生页面错误：${careErrors.join(' | ')}`);
    console.log('✓ care search');
    await carePage.close();
});
}

if (group === 'entries') {
await withBrowser(async browser => {
    const { page, errors } = await createPage(browser, { width: 1100, height: 850 });
    await page.goto(`${baseUrl}/search`, { waitUntil: 'networkidle' });
    const input = page.locator('main [role="combobox"]');
    await input.fill('孔');
    const listbox = page.locator('main [role="listbox"]');
    await listbox.waitFor({ state: 'visible' });
    assert.equal(await listbox.getByRole('option').first().getAttribute('aria-selected') !== null, true);
    await listbox.getByRole('option').first().click();
    assert.equal(await page.locator('[role="dialog"]:visible').count(), 0);
    await page.locator('main [data-selected-species-summary="true"]').getByRole('button', { name: '查看详情', exact: true }).waitFor({ state: 'visible' });
    assert.deepEqual(errors, [], `全局搜索不应产生页面错误：${errors.join(' | ')}`);
    console.log('✓ global search');

    const sidebar = page.locator('.desktop-sidebar');
    const sidebarInput = sidebar.getByRole('combobox');
    await sidebarInput.fill('孔');
    const sidebarListbox = sidebar.getByRole('listbox');
    await sidebarListbox.waitFor({ state: 'visible' });
    await sidebarListbox.getByRole('option').first().click();
    assert.equal(await page.locator('[role="dialog"]:visible').count(), 0, '侧栏选择候选不能直接打开详情');
    const selected = sidebar.locator('[data-selected-species-summary="true"]');
    await selected.waitFor({ state: 'visible' });
    const sidebarMetrics = await selected.evaluate(node => ({ scrollWidth: node.scrollWidth, clientWidth: node.clientWidth }));
    assert.ok(sidebarMetrics.scrollWidth <= sidebarMetrics.clientWidth + 1, `侧栏摘要不得横向溢出：${JSON.stringify(sidebarMetrics)}`);
    await selected.getByRole('button', { name: '查看详情', exact: true }).click();
    await page.waitForURL(/\/encyclopedia\?species=/);
    await page.locator('[role="dialog"]:visible').waitFor({ state: 'visible' });
    assert.deepEqual(errors, [], `全局与侧栏搜索不应产生页面错误：${errors.join(' | ')}`);
    console.log('✓ sidebar search');
    await page.close();
});
}

if (group === 'identify') {
await withBrowser(async browser => {
    const { page, errors } = await createPage(browser, { width: 390, height: 844 });
    await page.goto(`${baseUrl}/identify`, { waitUntil: 'networkidle' });
    await page.locator('input[type="file"]').setInputFiles('public/responsive/care/pregnant_fish_breeder_box_realistic-960.webp');
    await page.getByText('视觉模型未配置或暂不可用').waitFor({ timeout: 20_000 });
    const input = page.getByLabel('没有合适候选？手动搜索物种库');
    await input.fill('孔');
    const listbox = page.locator('[data-search-suggestion-list="true"]');
    await listbox.waitFor({ state: 'visible' });
    assert.ok(await listbox.getByRole('option').count() > 1, '识别页输入一个字也应返回多个具体物种');
    await listbox.getByRole('option').first().click();
    assert.equal(await page.getByRole('heading', { name: '它现在有什么异常？' }).count(), 0, '手动候选选择不能跳过物种确认');
    const selected = page.locator('[data-selected-species-summary="true"]');
    await selected.getByRole('button', { name: '确认是它', exact: true }).click();
    await page.getByText('识别结果', { exact: true }).waitFor();
    assert.equal(await page.getByRole('heading', { name: '它现在有什么异常？' }).count(), 0, '确认物种后不得自动启动健康分诊');
    assert.equal(await page.getByRole('button', { name: '它有异常？进入健康分诊', exact: true }).count(), 1, '识别结果必须把健康分诊保留为用户主动操作');
    assert.deepEqual(errors, [], `识别页手动搜索不应产生页面错误：${errors.join(' | ')}`);
    console.log('✓ identify manual search');
    await page.close();
});
}

console.log(`Search autocomplete and inline filter browser checks passed: ${group}.`);
