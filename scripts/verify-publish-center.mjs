import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const supabaseUrl = 'http://127.0.0.1:54321';
process.env.VITE_SUPABASE_URL = supabaseUrl;
process.env.VITE_SUPABASE_ANON_KEY = 'publish-center-test-anon-key';
const authStorageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
const fakeSession = {
  access_token: 'publish-center-token', refresh_token: 'publish-center-refresh', expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer',
  user: { id: '8b3f71bd-a1be-4a18-b7f8-5478cf55dc61', aud: 'authenticated', role: 'authenticated', email: 'admin-ui-test@example.com', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() },
};
const businessFeed = {
  events: [
    { id: 'pc-1', authority: 'product_care', domain: 'product', eventType: 'published_snapshot', status: 'published', title: 'Product 发布版本', detail: 'sp_0436 · source v4', resourceKey: 'sp_0436', version: 4, occurredAt: '2026-09-05T05:00:00.000Z' },
    { id: 'cp-1', authority: 'compatibility', domain: 'compatibility_profile', eventType: 'profile_revision', status: 'published', title: 'Profile reviewed version 已发布', detail: '孔雀鱼 · revision #2', resourceKey: 'sp_0436', version: 3, occurredAt: '2026-09-05T04:00:00.000Z' },
  ],
  sources: [
    { authority: 'product_care', availability: 'ready', coverage: 'current_only', label: 'Product / Care publication', detail: 'current only' },
    { authority: 'compatibility', availability: 'ready', coverage: 'revision_history', label: 'Compatibility revisions', detail: 'revision history' },
  ],
  permissions: [
    { authority: 'product_care', identity: 'admin-ui-test@example.com', role: 'admin', action: 'read_history', state: 'allowed', detail: 'read' },
    { authority: 'product_care', identity: 'admin-ui-test@example.com', role: 'admin', action: 'edit_draft', state: 'allowed', detail: 'edit' },
    { authority: 'product_care', identity: 'admin-ui-test@example.com', role: 'admin', action: 'review', state: 'allowed', detail: 'review' },
    { authority: 'product_care', identity: 'admin-ui-test@example.com', role: 'admin', action: 'publish_staging', state: 'not_applicable', detail: 'no staging' },
    { authority: 'product_care', identity: 'admin-ui-test@example.com', role: 'admin', action: 'publish_reviewed', state: 'not_applicable', detail: 'n/a' },
    { authority: 'product_care', identity: 'admin-ui-test@example.com', role: 'admin', action: 'publish_production', state: 'locked', detail: 'production locked' },
    { authority: 'compatibility', identity: 'admin-ui-test@example.com', role: 'admin', action: 'read_history', state: 'allowed', detail: 'read' },
    { authority: 'compatibility', identity: 'admin-ui-test@example.com', role: 'admin', action: 'edit_draft', state: 'allowed', detail: 'edit' },
    { authority: 'compatibility', identity: 'admin-ui-test@example.com', role: 'admin', action: 'review', state: 'allowed', detail: 'review' },
    { authority: 'compatibility', identity: 'admin-ui-test@example.com', role: 'admin', action: 'publish_staging', state: 'not_applicable', detail: 'no staging' },
    { authority: 'compatibility', identity: 'admin-ui-test@example.com', role: 'admin', action: 'publish_reviewed', state: 'locked', detail: 'migration unapplied' },
    { authority: 'compatibility', identity: 'admin-ui-test@example.com', role: 'admin', action: 'publish_production', state: 'locked', detail: 'production locked' },
  ],
  capabilities: [
    { authority: 'product_care', stage: 'diff', state: 'available', label: 'Diff', detail: 'field diff' },
    { authority: 'product_care', stage: 'impact', state: 'available', label: 'Impact', detail: 'impact preview' },
    { authority: 'product_care', stage: 'preview', state: 'available', label: 'Preview', detail: 'before after' },
    { authority: 'product_care', stage: 'review', state: 'partial', label: 'Review', detail: 'publish confirmation only' },
    { authority: 'product_care', stage: 'staging', state: 'not_applicable', label: 'Staging', detail: 'no separate staging' },
    { authority: 'product_care', stage: 'production', state: 'locked', label: 'Production', detail: 'production locked' },
    { authority: 'compatibility', stage: 'diff', state: 'available', label: 'Diff', detail: 'revision diff' },
    { authority: 'compatibility', stage: 'impact', state: 'available', label: 'Impact', detail: 'server regression' },
    { authority: 'compatibility', stage: 'preview', state: 'available', label: 'Preview', detail: 'engine before after' },
    { authority: 'compatibility', stage: 'review', state: 'available', label: 'Review', detail: 'human review' },
    { authority: 'compatibility', stage: 'staging', state: 'not_applicable', label: 'Staging', detail: 'no separate staging' },
    { authority: 'compatibility', stage: 'production', state: 'locked', label: 'Production', detail: 'live migration unapplied' },
  ],
};
const vite = await createServer({ root: process.cwd(), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
await vite.listen();
const address = vite.httpServer?.address();
assert.ok(address && typeof address === 'object');
const baseUrl = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    await page.addInitScript(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), { key: authStorageKey, session: fakeSession });
    let seoLoggedIn = false;
    let productAuditHistoryReady = false;
    await page.route('**/api/v1/admin/releases**', route => {
      const data = productAuditHistoryReady ? {
        ...businessFeed,
        events: [
          { id: 'pc-archive-1', authority: 'product_care', domain: 'product', eventType: 'publication_archived', status: 'archived', title: 'Product 已归档', detail: 'sp_0436 · source v5', resourceKey: 'sp_0436', version: 5, actor: '8b3f71bd-a1be-4a18-b7f8-5478cf55dc61', occurredAt: '2026-09-05T06:30:00.000Z', sourceRef: 'content_publication_events:audit-1' },
          ...businessFeed.events,
        ],
        sources: businessFeed.sources.map(source => source.authority === 'product_care' ? { ...source, coverage: 'revision_history', detail: 'append-only history' } : source),
      } : businessFeed;
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data, requestId: 'release-feed' }) });
    });
    await page.route('**/api/admin-content/session', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ configured: true, session: seoLoggedIn ? { user: { email: 'admin@aquaguide.local' } } : null }) }));
    await page.route('**/api/admin-content/query', async route => {
      const operation = route.request().postDataJSON();
      const rows = operation.table === 'admin_activity_log'
        ? [{ id: 'act-1', status: 'success', kind: 'staging_publish', title: 'Staging 发布已完成', detail: 'batch-demo · 14 Species', actor: 'repo-admin', created_at: '2026-09-05T06:00:00.000Z', metadata: { batch_id: 'batch-demo' } }]
        : operation.table === 'content_revisions'
          ? [{ id: 'rev-1', resource_type: 'species_seo', resource_key: 'sp_0436', locale: 'zh-CN', version: 8, operation: 'update', snapshot: { review_state: 'approved' }, created_at: '2026-09-05T05:30:00.000Z' }]
          : [{ batch_id: 'batch-demo', status: 'staging_published', filename: 'batch.csv', locale: 'zh-CN', page_count: 14, updated_at: '2026-09-05T06:00:00.000Z' }];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: rows, error: null }) });
    });
    await page.goto(`${baseUrl}/admin/content`);
    await page.getByRole('button', { name: /Publish[\s\S]*Release readiness/ }).click();
    await page.waitForURL('**/admin/publish-center');
    await page.getByRole('heading', { name: 'Unified Publish Center' }).waitFor();
    const timeline = page.getByTestId('publish-center-timeline');
    await timeline.getByRole('button', { name: /Product \/ Care published/ }).waitFor();
    const sources = page.getByTestId('publish-center-source-status');
    assert.match(await sources.innerText(), /Product \/ Care[\s\S]*可读取[\s\S]*当前版本/);
    assert.match(await sources.innerText(), /Compatibility[\s\S]*Revision 历史/);
    assert.match(await sources.innerText(), /SEO[\s\S]*需要登录/);
    const readiness = page.getByTestId('publish-center-readiness');
    const initialReadiness = await readiness.innerText();
    assert.match(initialReadiness, /2\/3[\s\S]*可读取模块/i);
    assert.match(initialReadiness, /1[\s\S]*需要认证 \/ 授权/i);
    assert.match(initialReadiness, /1[\s\S]*历史覆盖缺口[\s\S]*存在 current-only 来源/i);
    const sourceBox = await sources.boundingBox();
    const readinessBox = await readiness.boundingBox();
    const timelineBox = await timeline.boundingBox();
    if (viewport.width >= 1000) {
      assert.equal(Boolean(sourceBox && sourceBox.height <= 180), true, 'Desktop source status must remain compact.');
      assert.equal(Boolean(readinessBox && readinessBox.height <= 80), true, 'Desktop readiness must stay a summary row, not a card wall.');
      assert.equal(Boolean(timelineBox && timelineBox.y < 760), true, 'Desktop audit timeline must enter the first viewport before low-frequency reference details.');
    } else {
      assert.equal(Boolean(sourceBox && sourceBox.height <= 260), true, 'Mobile source status must stay compact enough to preserve the audit flow.');
      assert.equal(Boolean(readinessBox && readinessBox.height <= 150), true, 'Mobile readiness must use a compact two-column summary.');
      assert.equal(Boolean(timelineBox && timelineBox.y < 900), true, 'Mobile audit timeline must appear before a full viewport of secondary details.');
    }
    const boundary = page.getByTestId('publish-center-release-boundary');
    assert.equal(await boundary.evaluate(element => element.open), false, 'Capability/permission reference must stay closed by default.');
    const timelineTop = await timeline.evaluate(element => element.getBoundingClientRect().top + window.scrollY);
    const boundaryTop = await boundary.evaluate(element => element.getBoundingClientRect().top + window.scrollY);
    assert.equal(timelineTop < boundaryTop, true, 'Release timeline must appear before low-frequency boundary reference.');
    const authorityNoteClass = await page.getByTestId('publish-center-authority-note').getAttribute('class');
    assert.doesNotMatch(authorityNoteClass || '', /amber/, 'Read-only authority note must stay neutral, not decision-Amber.');
    await boundary.locator('summary').click();
    assert.equal(await boundary.evaluate(element => element.open), true, 'Operator must be able to expand release boundary reference.');
    const capability = page.getByTestId('publish-center-capability-matrix');
    const capabilityText = await capability.innerText();
    assert.match(capabilityText, /Product \/ Care[\s\S]*Diff[\s\S]*可用[\s\S]*Review[\s\S]*部分[\s\S]*Production[\s\S]*锁定/i);
    assert.match(capabilityText, /Compatibility[\s\S]*Impact[\s\S]*可用[\s\S]*Staging[\s\S]*不适用/i);
    assert.match(capabilityText, /SEO[\s\S]*Diff[\s\S]*可用[\s\S]*Staging[\s\S]*可用[\s\S]*Production[\s\S]*锁定/i);
    const permissions = page.getByTestId('publish-center-permission-boundary');
    const initialPermissions = await permissions.innerText();
    assert.match(initialPermissions, /Product \/ Care[\s\S]*admin-ui-test@example.com · admin[\s\S]*读取历史[\s\S]*允许[\s\S]*发布 Production[\s\S]*锁定/i);
    assert.match(initialPermissions, /Compatibility[\s\S]*发布 Reviewed[\s\S]*锁定/i);
    assert.match(initialPermissions, /SEO[\s\S]*未认证 · repo-admin[\s\S]*读取历史[\s\S]*独立登录[\s\S]*发布 Staging[\s\S]*独立登录/i);
    await boundary.locator('summary').click();
    assert.equal(await boundary.evaluate(element => element.open), false);
    const detail = page.getByTestId('publish-center-event-detail');
    assert.equal(await detail.count(), 0, 'Publish Center must not auto-open the first audit record before the operator chooses one.');
    assert.match(await timeline.innerText(), /Product 发布版本[\s\S]*Profile reviewed version 已发布/);
    await timeline.getByRole('button', { name: /Product \/ Care published Product 发布版本/ }).click();
    await detail.waitFor();
    const productDetail = await detail.innerText();
    assert.match(productDetail, /Product 发布版本/);
    assert.match(productDetail, /只读审计详情，不提供发布或回滚动作/);
    assert.match(productDetail, /当前版本/);
    assert.match(productDetail, /sp_0436/);
    const relatedEvidence = page.getByTestId('publish-center-related-evidence');
    assert.match(await relatedEvidence.innerText(), /这不是依赖判断，也不表示必须同步发布[\s\S]*Compatibility[\s\S]*Profile reviewed version 已发布/i);
    await page.getByRole('button', { name: 'Compatibility', exact: true }).click();
    assert.equal(await detail.count(), 0, 'Changing authority filter must clear stale audit detail.');
    await timeline.getByRole('button', { name: /Compatibility published Profile reviewed version 已发布/ }).click();
    const compatibilityDetail = await detail.innerText();
    assert.match(compatibilityDetail, /Profile reviewed version 已发布/);
    assert.match(compatibilityDetail, /前往 Compatibility authority/);
    await page.getByRole('button', { name: '全部', exact: true }).click();
    assert.equal(await detail.count(), 0, 'Returning to all events must keep detail closed until a record is chosen.');

    seoLoggedIn = true;
    await page.getByRole('button', { name: '刷新' }).click();
    await timeline.getByRole('button', { name: /SEO success Staging 发布已完成/ }).waitFor();
    assert.match(await sources.innerText(), /SEO[\s\S]*可读取[\s\S]*Activity \/ Revision 历史/);
    await boundary.locator('summary').click();
    const authenticatedPermissions = await permissions.innerText();
    assert.match(authenticatedPermissions, /SEO[\s\S]*admin@aquaguide.local · repo-admin[\s\S]*发布 Staging[\s\S]*允许[\s\S]*发布 Production[\s\S]*锁定/i);
    await boundary.locator('summary').click();
    const refreshedTimeline = await timeline.innerText();
    assert.match(refreshedTimeline, /Staging 发布已完成/);
    assert.match(refreshedTimeline, /SEO revision 已记录/);
    assert.match(refreshedTimeline, /SEO Staging batch 已发布/);
    await timeline.getByRole('button', { name: /SEO revision 已记录/ }).click();
    assert.match(await detail.innerText(), /SEO revision 已记录[\s\S]*Activity \/ Revision 历史[\s\S]*content_revisions:rev-1[\s\S]*zh-CN/);
    assert.match(await relatedEvidence.innerText(), /Product \/ Care[\s\S]*Product 发布版本[\s\S]*Compatibility[\s\S]*Profile reviewed version 已发布/i);

    productAuditHistoryReady = true;
    await page.getByRole('button', { name: '刷新' }).click();
    await timeline.getByRole('button', { name: /Product \/ Care archived Product 已归档/ }).waitFor();
    assert.match(await sources.innerText(), /Product \/ Care[\s\S]*可读取[\s\S]*Revision 历史/);
    const refreshedReadiness = await readiness.innerText();
    assert.match(refreshedReadiness, /0[\s\S]*历史覆盖缺口[\s\S]*历史覆盖完整/i);
    await timeline.getByRole('button', { name: /Product \/ Care archived Product 已归档/ }).click();
    assert.match(await detail.innerText(), /Product 已归档[\s\S]*sp_0436[\s\S]*content_publication_events:audit-1/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    assert.equal(overflow, false, `${viewport.width}px Publish Center should not overflow horizontally`);
    await page.close();
  }
  console.log('publish center verified: multi-authority read model, SEO auth degradation, 390/1280 layout PASS');
} finally {
  await browser.close();
  await vite.close();
}
