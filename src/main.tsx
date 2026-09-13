import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import posthog from 'posthog-js';
import { hydratePublishedContentCatalog } from './data/runtimeContentCatalog';
import { hydrateReviewedCompatibilityEvidence } from './data/runtimeCompatibilityEvidence';
import { getLocalAdminStartupRecoveryGuidance, hydrateLocalAdminFileStores } from './services/admin/local-file-persistence';
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

void startApplication().catch(error => {
  const root = document.getElementById('root');
  if (!root) return;
  const message = error instanceof Error ? error.message : 'Local Admin 启动失败。';
  const guidance = getLocalAdminStartupRecoveryGuidance(error);
  const safe = (value: string) => value.replace(/[<>&"']/g, '');
  root.innerHTML = `<main style="max-width:720px;margin:80px auto;padding:24px;font-family:system-ui,sans-serif"><h1 style="font-size:24px;margin:0 0 12px">Local Admin 未启动</h1><p style="line-height:1.7">${safe(message)}</p><p style="line-height:1.7;color:#666">Durable Local File Mode 已 fail-closed；不会自动退回为看似已保存的 browser-only 模式。</p><p style="line-height:1.7"><strong>处理：</strong>${safe(guidance)}</p></main>`;
  console.error('[local-admin-startup]', error);
});
