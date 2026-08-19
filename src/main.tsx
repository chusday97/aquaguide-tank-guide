import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import posthog from 'posthog-js';
import App from './App.tsx';
import AdminFeedback from './pages/AdminFeedback';
import { ToastProvider } from './components/common/ToastProvider';
import './services/navigation/history-navigation-guard.service';
import './index.css';
import './styles/ui-v2-foundation.css';
import './styles/ui-v2-aquarium-components.css';
import './styles/ui-v2-dashboard.css';
import './styles/ui-v2-shell.css';
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

function ReloadIntoPrimaryApp() {
  useEffect(() => {
    window.location.reload();
  }, []);
  return null;
}

function AdminFeedbackEntry() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/admin/feedback" element={<AdminFeedback />} />
          <Route path="*" element={<ReloadIntoPrimaryApp />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
const isAdminFeedback = pathname === '/admin/feedback';
const showAdminQualityShortcut = pathname === '/admin/content';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdminFeedback ? (
      <AdminFeedbackEntry />
    ) : (
      <>
        <App />
        {showAdminQualityShortcut && (
          <a
            href="/admin/feedback"
            data-admin-quality-link
            className="fixed bottom-5 right-5 z-[220] inline-flex min-h-11 items-center rounded-full border border-emerald-100 bg-emerald-800 px-5 text-sm font-black text-white shadow-[0_14px_36px_rgba(15,23,42,0.16)] transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            用户反馈
          </a>
        )}
      </>
    )}
  </StrictMode>,
);
