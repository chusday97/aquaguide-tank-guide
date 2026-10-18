import {
  getSafeAnalyticsReadinessSummary,
  resolveAnalyticsRuntimeConfig,
} from '../src/services/analytics/analytics-readiness.service';

const config = resolveAnalyticsRuntimeConfig({
  projectKey: process.env.VITE_POSTHOG_KEY,
  host: process.env.VITE_POSTHOG_HOST,
});

const summary = getSafeAnalyticsReadinessSummary(config);
const strict = process.env.AQUAGUIDE_REQUIRE_ANALYTICS === '1';

console.log(`ANALYTICS_PRODUCTION_READINESS=${summary.status.toUpperCase()}`);
console.log(JSON.stringify({
  ...summary,
  strict,
  requirement: 'VITE_POSTHOG_KEY is required to enable client analytics; VITE_POSTHOG_HOST is optional and falls back to the code default.',
}));

if (strict && summary.status !== 'ready') {
  console.error('Analytics readiness is required for this release, but the client project key is not configured.');
  process.exit(1);
}
