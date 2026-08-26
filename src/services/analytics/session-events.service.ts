import posthog from 'posthog-js';

export type AquaGuideEventName =
  | 'product_opened'
  | 'favorite_page_view'
  | 'mini_result_generated'
  | 'mini_open_full'
  | 'daily_check_started'
  | 'daily_check_completed'
  | 'remedy_article_opened'
  | 'onboarding_goal_selected'
  | 'onboarding_core_value_completed'
  | 'aquarium_setup_started'
  | 'aquarium_setup_completed'
  | 'species_candidate_selected'
  | 'compatibility_started'
  | 'compatibility_pair_evaluated'
  | 'compatibility_completed'
  | 'activation_completed'
  | 'identification_completed'
  | 'species_identification_started'
  | 'species_identification_completed'
  | 'triage_started'
  | 'health_triage_started'
  | 'health_triage_completed'
  | 'compatibility_from_identify_started'
  | 'ai_task_started'
  | 'ai_task_completed'
  | 'ai_task_fallback'
  | 'ai_safety_filter_triggered'
  | 'share_report_created'
  | 'aquarium_primary_action_clicked';

export type AnalyticsDurationBucket =
  | 'under_2m'
  | '2_to_5m'
  | '5_to_10m'
  | '10_to_30m'
  | 'over_30m'
  | 'returning_session';

export type AiSafetyFilterType =
  | 'outside_candidate_pool'
  | 'risk_downgrade'
  | 'outside_article_whitelist'
  | 'invalid_action'
  | 'invalid_observation';

export type SafeAnalyticsProperties = {
  action: string;
  status?: string;
  entry?: string;
  goal?: 'build_tank' | 'browse_species';
  task?: string;
  source?: 'model' | 'fallback' | 'rules';
  failureReason?: string;
  riskLevel?: string;
  locale?: 'zh-CN' | 'en';
  durationBucket?: AnalyticsDurationBucket;
  candidateCount?: number;
  appVersion?: string;
  filterType?: AiSafetyFilterType;
  pairKey?: string;
};

export type AquaGuideEvent = SafeAnalyticsProperties & {
  name: AquaGuideEventName;
  occurredAt: string;
};

export const FIRST_OPENED_AT_KEY = 'aquaguide:first_opened_at';
const FIRST_OPEN_SESSION_KEY = 'aquaguide:first_open_session';
const sessionEvents: AquaGuideEvent[] = [];
let productOpenedInitialized = false;

const appVersion = () => {
  const meta = import.meta as ImportMeta & { env?: { VITE_APP_VERSION?: string } };
  return meta.env?.VITE_APP_VERSION || 'local-preview';
};

const trim = (value: unknown, length: number) => typeof value === 'string' && value.trim()
  ? value.trim().slice(0, length)
  : undefined;

const sanitizePairKey = (value: unknown) => {
  const raw = trim(value, 100);
  if (!raw) return undefined;
  const parts = raw.split('__');
  if (parts.length !== 2 || !parts.every(part => /^sp_[0-9]{4,}$/.test(part))) return undefined;
  const [left, right] = [...parts].sort();
  if (left === right) return undefined;
  return `${left}__${right}`;
};

const sanitizeProperties = (properties: SafeAnalyticsProperties): SafeAnalyticsProperties => {
  const source = properties.source === 'model' || properties.source === 'fallback' || properties.source === 'rules'
    ? properties.source
    : undefined;
  const locale = properties.locale === 'en' || properties.locale === 'zh-CN' ? properties.locale : undefined;
  const goal = properties.goal === 'build_tank' || properties.goal === 'browse_species' ? properties.goal : undefined;
  const durationBucket = ['under_2m', '2_to_5m', '5_to_10m', '10_to_30m', 'over_30m', 'returning_session'].includes(String(properties.durationBucket))
    ? properties.durationBucket
    : undefined;
  const filterType = ['outside_candidate_pool', 'risk_downgrade', 'outside_article_whitelist', 'invalid_action', 'invalid_observation'].includes(String(properties.filterType))
    ? properties.filterType
    : undefined;
  const candidateCount = Number.isFinite(properties.candidateCount)
    ? Math.max(0, Math.min(100, Math.round(Number(properties.candidateCount))))
    : undefined;
  return {
    action: trim(properties.action, 80) || 'unknown',
    status: trim(properties.status, 40),
    entry: trim(properties.entry, 40),
    goal,
    task: trim(properties.task, 60),
    source,
    failureReason: trim(properties.failureReason, 60),
    riskLevel: trim(properties.riskLevel, 40),
    locale,
    durationBucket,
    candidateCount,
    appVersion: trim(properties.appVersion, 40) || appVersion(),
    filterType,
    pairKey: sanitizePairKey(properties.pairKey),
  };
};

export const trackSessionEvent = (
  name: AquaGuideEventName,
  properties: SafeAnalyticsProperties,
) => {
  const safe = sanitizeProperties(properties);
  const event: AquaGuideEvent = { name, ...safe, occurredAt: new Date().toISOString() };
  sessionEvents.push(event);

  try {
    posthog.capture(name, safe);
  } catch {
    // Analytics is non-critical. The local session record remains available when PostHog is not initialized.
  }

  return event;
};

const getDurationBucket = (elapsedMs: number): AnalyticsDurationBucket => {
  if (elapsedMs < 2 * 60_000) return 'under_2m';
  if (elapsedMs < 5 * 60_000) return '2_to_5m';
  if (elapsedMs < 10 * 60_000) return '5_to_10m';
  if (elapsedMs < 30 * 60_000) return '10_to_30m';
  return 'over_30m';
};

export const initializeSessionAnalytics = (now = Date.now()) => {
  if (typeof window === 'undefined' || productOpenedInitialized) return;
  productOpenedInitialized = true;
  let firstOpenedAt = window.localStorage.getItem(FIRST_OPENED_AT_KEY);
  if (!firstOpenedAt || !Number.isFinite(Number(firstOpenedAt))) {
    firstOpenedAt = String(now);
    window.localStorage.setItem(FIRST_OPENED_AT_KEY, firstOpenedAt);
    window.sessionStorage.setItem(FIRST_OPEN_SESSION_KEY, firstOpenedAt);
  } else if (!window.sessionStorage.getItem(FIRST_OPEN_SESSION_KEY)) {
    window.sessionStorage.setItem(FIRST_OPEN_SESSION_KEY, 'returning');
  }
  trackSessionEvent('product_opened', {
    action: 'open',
    status: window.sessionStorage.getItem(FIRST_OPEN_SESSION_KEY) === firstOpenedAt ? 'first_session' : 'returning_session',
    entry: 'app',
  });
};

export const getActivationDurationBucket = (now = Date.now()): AnalyticsDurationBucket => {
  if (typeof window === 'undefined') return 'returning_session';
  const firstOpenedAt = window.localStorage.getItem(FIRST_OPENED_AT_KEY);
  if (!firstOpenedAt || window.sessionStorage.getItem(FIRST_OPEN_SESSION_KEY) !== firstOpenedAt) return 'returning_session';
  const elapsed = now - Number(firstOpenedAt);
  return Number.isFinite(elapsed) && elapsed >= 0 ? getDurationBucket(elapsed) : 'returning_session';
};

export const trackActivationIfFirstValidCompatibility = (input: {
  alreadyActivated: boolean;
  status: string;
  candidateCount: number;
}) => {
  if (input.alreadyActivated) return false;
  trackSessionEvent('activation_completed', {
    action: 'complete_first_tank_compatibility',
    status: input.status,
    entry: 'compatibility',
    durationBucket: getActivationDurationBucket(),
    candidateCount: input.candidateCount,
  });
  return true;
};

export const getSessionEvents = () => sessionEvents.map(event => ({ ...event }));

export const resetSessionEvents = () => {
  sessionEvents.splice(0, sessionEvents.length);
  productOpenedInitialized = false;
};
