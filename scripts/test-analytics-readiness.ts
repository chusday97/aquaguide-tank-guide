import assert from 'node:assert/strict';
import {
  DEFAULT_POSTHOG_HOST,
  SYNTHETIC_POSTHOG_KEY,
  getSafeAnalyticsReadinessSummary,
  resolveAnalyticsRuntimeConfig,
} from '../src/services/analytics/analytics-readiness.service';

assert.equal(DEFAULT_POSTHOG_HOST, 'https://us.i.posthog.com');

const missing = resolveAnalyticsRuntimeConfig({});
assert.equal(missing.enabled, false);
assert.equal(missing.readiness.status, 'not_configured');
assert.deepEqual(missing.readiness.missingEnvKeys, ['VITE_POSTHOG_KEY']);
assert.equal(missing.host, DEFAULT_POSTHOG_HOST);
assert.equal(missing.readiness.usingDefaultHost, true);

const hostOnly = resolveAnalyticsRuntimeConfig({ host: 'https://example.posthog.invalid' });
assert.equal(hostOnly.enabled, false);
assert.equal(hostOnly.readiness.status, 'misconfigured');
assert.deepEqual(hostOnly.readiness.missingEnvKeys, ['VITE_POSTHOG_KEY']);
assert.equal(hostOnly.readiness.usingDefaultHost, false);

const keyOnly = resolveAnalyticsRuntimeConfig({ projectKey: 'phc_test_public_project_key' });
assert.equal(keyOnly.enabled, true);
assert.equal(keyOnly.readiness.status, 'ready');
assert.equal(keyOnly.host, DEFAULT_POSTHOG_HOST);
assert.equal(keyOnly.readiness.usingDefaultHost, true);

const configured = resolveAnalyticsRuntimeConfig({
  projectKey: 'phc_test_public_project_key',
  host: 'https://custom.posthog.invalid',
});
assert.equal(configured.enabled, true);
assert.equal(configured.readiness.status, 'ready');
assert.equal(configured.readiness.usingDefaultHost, false);

const synthetic = resolveAnalyticsRuntimeConfig({ syntheticTest: true });
assert.equal(synthetic.enabled, true);
assert.equal(synthetic.readiness.status, 'synthetic');
assert.equal(synthetic.key, SYNTHETIC_POSTHOG_KEY);

const safeSummary = JSON.stringify(getSafeAnalyticsReadinessSummary(configured));
assert.equal(safeSummary.includes('phc_test_public_project_key'), false);
assert.equal(safeSummary.includes('custom.posthog.invalid'), false);

console.log('analytics readiness contract PASS: missing key fails closed, host is optional, partial config is visible, synthetic mode is isolated, and safe summaries contain no project key or host value.');
