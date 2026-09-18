import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const artifact = resolve(root, '.artifacts/readiness/latest.json');
const collect = spawnSync('npm', ['run', 'readiness:collect'], { cwd: root, encoding: 'utf8', stdio: 'inherit' });
if (collect.status !== 0 || !existsSync(artifact)) process.exit(collect.status ?? 1);
const report = JSON.parse(readFileSync(artifact, 'utf8'));
const labels = { PASS: '通过', FAIL: '失败', BLOCKED: '阻塞', UNVERIFIED: '未验证', USER_ACCEPTANCE_REQUIRED: '需用户验收' };
const colors = { PASS: '#16805c', FAIL: '#c93c37', BLOCKED: '#b26b00', UNVERIFIED: '#64748b', USER_ACCEPTANCE_REQUIRED: '#7c3aed' };
const esc = (value) => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AquaGuide readiness</title><style>
body{margin:0;background:#f5f7fb;color:#172033;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:1100px;margin:0 auto;padding:32px 20px 64px}h1{margin:0 0 6px;font-size:28px}h2{margin:28px 0 12px;font-size:18px}.meta{color:#64748b;margin-bottom:22px}.summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.card,.gate{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:16px;box-shadow:0 3px 12px #1720330b}.card strong{display:block;font-size:20px;margin-top:4px}.grid{display:grid;gap:10px}.gate{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:start}.gate small{display:block;color:#64748b;margin-top:5px;word-break:break-word}.status{font-weight:700;color:var(--status);white-space:nowrap}.facts{display:grid;gap:8px}.fact{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px}.sha{font-family:ui-monospace,SFMono-Regular,monospace;word-break:break-all}@media(max-width:650px){.summary{grid-template-columns:1fr}.gate{grid-template-columns:1fr}.status{justify-self:start}}
</style><main><h1>AquaGuide 进度证据中心</h1><div class="meta">只读 · 当前 SHA <span class="sha">${esc(report.evaluatedSha)}</span> · 分支 ${esc(report.branch)} · ${esc(report.evaluatedAt)}</div><section class="summary"><div class="card">Main 代码收敛<strong style="color:${colors[report.readiness.mainConvergence]}">${labels[report.readiness.mainConvergence]}</strong></div><div class="card">生产发布<strong style="color:${colors[report.readiness.productionRelease]}">${labels[report.readiness.productionRelease]}</strong></div></section><h2>六条进度线</h2><section class="grid">${report.gates.map(item => `<details class="gate"><summary><span>${esc(item.title)}</span> <span class="status" style="--status:${colors[item.status]}">${labels[item.status]}</span></summary><small>命令：${esc(item.command)}</small><small>预期：${esc(item.expected)}</small><small>实际：${esc(item.actual)}</small>${item.notes ? `<small>备注：${esc(item.notes)}</small>` : ''}</details>`).join('')}</section><h2>固定业务案例</h2><section class="facts">${report.businessCases.map(item => `<div class="fact"><strong>${esc(item.name)}</strong>：${esc(item.expected)} <span class="status" style="--status:${colors[item.status]}">${labels[item.status]}</span></div>`).join('')}</section><h2>怎么避免返工</h2><div class="card">任何代码、规则、Catalog、数据库或 UI 文件变化都会使对应证据失效。页面出现乱码不会被底层绿色测试掩盖；它会单独显示为需验收或阻塞。</div></main>`;
const requestedPort = Number(process.env.READINESS_PORT ?? 4320);
const server = createServer((request, response) => { if (request.url === '/readiness.json') { response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' }); response.end(JSON.stringify(report)); return; } response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); response.end(html); });
const listen = (port, fallback = true) => {
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && fallback && !process.env.READINESS_PORT) {
      console.warn(`Port ${port} is already in use; trying ${port + 1}. Set READINESS_PORT to choose explicitly.`);
      listen(port + 1, false);
      return;
    }
    console.error(`Unable to start readiness server on ${port}: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => console.log(`AquaGuide readiness: http://127.0.0.1:${port}`));
};
listen(requestedPort);
