import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const root = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-local-file-ui-'));
const marker = '【Durable Local File regression】';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=', 'base64');

const getFreePort = () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    if (!address || typeof address === 'string') return reject(new Error('Could not allocate a local port.'));
    const port = address.port;
    server.close(error => error ? reject(error) : resolve(port));
  });
});

const apiPort = await getFreePort();
const webPort = await getFreePort();
const baseUrl = `http://127.0.0.1:${webPort}`;
let child = null;
let logs = '';

const waitForReady = async () => {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (child?.exitCode !== null) throw new Error(`Local Admin exited during startup.\n${logs}`);
    try {
      const response = await fetch(`${baseUrl}/api/v1/local-admin/status`);
      if (response.ok) {
        const payload = await response.json();
        assert.equal(payload.data.root, root);
        return;
      }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for Durable Local Admin.\n${logs}`);
};

const startLocalAdmin = async () => {
  logs = '';
  child = spawn(process.execPath, ['scripts/dev-local-admin.mjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      API_PORT: String(apiPort),
      WEB_PORT: String(webPort),
      ADMIN_LOCAL_FILE_ROOT: root,
      DISABLE_HMR: 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', chunk => { logs += chunk.toString(); });
  child.stderr.on('data', chunk => { logs += chunk.toString(); });
  await waitForReady();
};

const stopLocalAdmin = async () => {
  if (!child || child.exitCode !== null) return;
  const current = child;
  current.kill('SIGTERM');
  await Promise.race([
    new Promise(resolve => current.once('exit', resolve)),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Local Admin did not stop cleanly.\n${logs}`)), 8_000)),
  ]);
  child = null;
};

const readState = async name => {
  const envelope = JSON.parse(await readFile(path.join(root, `${name}.json`), 'utf8'));
  assert.equal(envelope.localFileFormatVersion, 1);
  assert.equal(envelope.partition, name);
  assert.equal(envelope.stateSchemaVersion, envelope.state.schemaVersion);
  return envelope.state;
};
const browser = await chromium.launch({ headless: true });

try {
  await startLocalAdmin();
  let context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  let page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));

  await page.goto(`${baseUrl}/admin/product-content?type=species&id=local-species-sp_0001`, { waitUntil: 'networkidle' });
  const description = page.locator('label:has-text("物种说明") textarea').first();
  await description.fill(`${await description.inputValue()}${marker}`);
  await page.getByRole('button', { name: '保存修改', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('form')?.textContent?.includes('草稿'));
  await page.locator('input[type=file]').setInputFiles({ name: 'durable.png', mimeType: 'image/png', buffer: png });
  await page.getByTestId('local-asset-preview').locator('img').waitFor();
  assert.match(await page.getByTestId('local-asset-preview').innerText(), /DURABLE FILE/);

  await page.goto(`${baseUrl}/admin/compatibility`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '创建 Profile Draft' }).first().click();
  await page.locator('input[placeholder="留空表示未设置"]').fill('8');
  await page.getByRole('button', { name: '保存 Draft' }).click();
  await page.waitForTimeout(200);

  await page.goto(`${baseUrl}/admin/product-content?type=care&id=local-care-guide_new_fish_acclimation`, { waitUntil: 'networkidle' });
  const seo = page.getByTestId('care-seo-projection');
  await seo.waitFor();
  await seo.getByRole('button', { name: '创建 SEO Draft' }).click();
  await page.waitForFunction(() => document.querySelector('[data-testid="care-seo-projection"]')?.textContent?.includes('Draft'));

  await page.goto(`${baseUrl}/admin/content`, { waitUntil: 'networkidle' });
  const persistence = page.getByTestId('operations-local-persistence');
  await persistence.waitFor();
  assert.match(await persistence.innerText(), /磁盘已持久化/);
  assert.equal(await persistence.getAttribute('title'), root);
  const safety = page.getByTestId('operations-local-safety');
  await safety.waitFor();
  await page.waitForFunction(() => document.querySelector('[data-testid="operations-local-integrity"]')?.textContent?.includes('数据完整'));
  await page.getByTestId('operations-create-backup').click();
  await page.waitForFunction(() => {
    const button = document.querySelector('[data-testid="operations-restore-backup"]');
    return button instanceof HTMLButtonElement && !button.disabled;
  });
  assert.match(await safety.innerText(), /最近备份/);

  const afterBackupMarker = '【After backup mutation】';
  await page.goto(`${baseUrl}/admin/product-content?type=species&id=local-species-sp_0001`, { waitUntil: 'networkidle' });
  const changedDescription = page.locator('label:has-text("物种说明") textarea').first();
  await changedDescription.fill(`${await changedDescription.inputValue()}${afterBackupMarker}`);
  await page.getByRole('button', { name: '保存修改', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('form')?.textContent?.includes('草稿'));
  await page.goto(`${baseUrl}/admin/content`, { waitUntil: 'networkidle' });
  page.once('dialog', dialog => dialog.accept());
  await page.getByTestId('operations-restore-backup').click();
  await page.waitForLoadState('networkidle');
  await page.goto(`${baseUrl}/admin/product-content?type=species&id=local-species-sp_0001`, { waitUntil: 'networkidle' });
  const restoredDescription = await page.locator('label:has-text("物种说明") textarea').first().inputValue();
  assert.ok(restoredDescription.endsWith(marker));
  assert.doesNotMatch(restoredDescription, /After backup mutation/);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0);
  assert.deepEqual(errors, []);

  const business = await readState('business');
  const species = business.species.find(item => item.catalogKey === 'sp_0001');
  assert.ok(species.description.endsWith(marker));
  assert.equal(species.speciesAssets.find(asset => asset.isCurrent).storageBucket, 'local-file');
  const compatibility = await readState('compatibility');
  assert.equal(compatibility.profileRevisions[0].minimumGroupSize, 8);
  const careSeo = await readState('care-seo');
  assert.equal(careSeo.revisions[0].reviewState, 'draft');

  await context.close();
  await stopLocalAdmin();
  await startLocalAdmin();

  context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  page = await context.newPage();
  const restartErrors = [];
  page.on('pageerror', error => restartErrors.push(String(error)));

  await page.goto(`${baseUrl}/admin/product-content?type=species&id=local-species-sp_0001`, { waitUntil: 'networkidle' });
  assert.ok((await page.locator('label:has-text("物种说明") textarea').first().inputValue()).endsWith(marker));
  await page.getByTestId('local-asset-preview').locator('img').waitFor();
  assert.match(await page.getByTestId('local-asset-preview').innerText(), /DURABLE FILE/);

  await page.goto(`${baseUrl}/admin/compatibility`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '打开 Draft' }).first().click();
  assert.equal(await page.locator('input[placeholder="留空表示未设置"]').inputValue(), '8');

  await page.goto(`${baseUrl}/admin/product-content?type=care&id=local-care-guide_new_fish_acclimation`, { waitUntil: 'networkidle' });
  const restartedSeo = page.getByTestId('care-seo-projection');
  await restartedSeo.waitFor();
  assert.match(await restartedSeo.innerText(), /保存 SEO Draft/);

  await page.goto(`${baseUrl}/admin/content`, { waitUntil: 'networkidle' });
  assert.match(await page.getByTestId('operations-local-persistence').innerText(), /磁盘已持久化/);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0);
  assert.deepEqual(restartErrors, []);
  await context.close();

  console.log('PASS durable Local File Admin: versioned disk state + Product/asset/Compatibility/Care SEO + one-click backup/restore survive full restart.');
} finally {
  await stopLocalAdmin().catch(() => undefined);
  await browser.close();
  await rm(root, { recursive: true, force: true });
}
