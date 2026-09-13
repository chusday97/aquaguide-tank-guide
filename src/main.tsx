import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import posthog from 'posthog-js';
import { hydratePublishedContentCatalog } from './data/runtimeContentCatalog';
import { hydrateReviewedCompatibilityEvidence } from './data/runtimeCompatibilityEvidence';
import { getLocalAdminSafetySnapshot, getLocalAdminStartupRecoveryGuidance, hydrateLocalAdminFileStores, restoreLocalAdminBackup } from './services/admin/local-file-persistence';
import { AquaGuideApiError } from './services/api/api-client';
import './services/navigation/history-navigation-guard.service';
import './index.css';
import './styles/aquarium-stage-layout-v4.css';
import './styles/immersive-detail-layout-v5.css';
import { initializeSessionAnalytics } from './services/analytics/session-events.service';

const isSyntheticTest = typeof window !== 'undefined' && window.location.search.includes('synthetic_test=1');
const posthogKey = import.meta.env.VITE_POSTHOG_KEY || (isSyntheticTest ? 'phc_synthetic_dummy_key_123' : '');
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    autocapture: false,
    capture_pageview: false,
    loaded: (ph) => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('synthetic_test') === '1') {
        ph.register({
          is_synthetic: true,
          traffic_type: 'synthetic',
          test_run_id: urlParams.get('test_run_id') || 'local_test',
          persona_id: urlParams.get('persona_id') || 'unknown',
          scenario_id: urlParams.get('scenario_id') || 'unknown',
          test_version: urlParams.get('test_version') || '1.0.0',
        });
      }
    }
  });
}

initializeSessionAnalytics();

const startApplication = async () => {
  await hydrateLocalAdminFileStores();
  await Promise.all([hydratePublishedContentCatalog(), hydrateReviewedCompatibilityEvidence()]);
  const { default: App } = await import('./App.tsx');
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

void startApplication().catch(async error => {
  const root = document.getElementById('root');
  if (!root) return;
  const message = error instanceof Error ? error.message : 'Local Admin 启动失败。';
  const guidance = getLocalAdminStartupRecoveryGuidance(error);
  const safe = (value: string) => value.replace(/[<>&"']/g, '');
  const integrityFailure = error instanceof AquaGuideApiError && error.code === 'INTEGRITY_FAILED';
  const safety = integrityFailure ? await getLocalAdminSafetySnapshot().catch(() => null) : null;
  const latestHealthyBackup = safety?.backups[0] ?? null;
  const recoveryAction = integrityFailure
    ? latestHealthyBackup
      ? '<button type="button" data-testid="local-admin-restore-latest" style="margin-top:12px;padding:10px 14px;border:1px solid #222;border-radius:8px;background:#fff;cursor:pointer">恢复最近健康备份</button><p data-testid="local-admin-restore-status" style="line-height:1.6;color:#666"></p>'
      : '<p style="line-height:1.7;color:#666">没有找到可用的健康 backup；请先人工检查 Local File root，问题解决前不要继续写入。</p>'
    : '';
  root.innerHTML = `<main style="max-width:720px;margin:80px auto;padding:24px;font-family:system-ui,sans-serif"><h1 style="font-size:24px;margin:0 0 12px">Local Admin 未启动</h1><p style="line-height:1.7">${safe(message)}</p><p style="line-height:1.7;color:#666">Durable Local File Mode 已 fail-closed；不会自动退回为看似已保存的 browser-only 模式。</p><p style="line-height:1.7"><strong>处理：</strong>${safe(guidance)}</p>${recoveryAction}</main>`;
  if (latestHealthyBackup) {
    const button = root.querySelector<HTMLButtonElement>('[data-testid="local-admin-restore-latest"]');
    const status = root.querySelector<HTMLElement>('[data-testid="local-admin-restore-status"]');
    button?.addEventListener('click', async () => {
      button.disabled = true;
      if (status) status.textContent = `正在恢复 ${latestHealthyBackup.id}…`;
      try {
        await restoreLocalAdminBackup(latestHealthyBackup.id);
        if (status) status.textContent = '健康 backup 已恢复，正在重新加载…';
        window.location.reload();
      } catch (restoreError) {
        button.disabled = false;
        if (status) status.textContent = restoreError instanceof Error ? restoreError.message : '恢复失败，请检查 Local Admin 日志。';
      }
    });
  }
  console.error('[local-admin-startup]', error);
});
