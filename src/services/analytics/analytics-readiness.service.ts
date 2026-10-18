export const DEFAULT_POSTHOG_HOST = 'https://app.posthog.com';
export const SYNTHETIC_POSTHOG_KEY = 'phc_synthetic_dummy_key_123';

export type AnalyticsReadinessStatus =
  | 'ready'
  | 'not_configured'
  | 'misconfigured'
  | 'synthetic';

export type AnalyticsRuntimeConfig = {
  enabled: boolean;
  key: string;
  host: string;
  readiness: {
    status: AnalyticsReadinessStatus;
    missingEnvKeys: string[];
    usingDefaultHost: boolean;
  };
};

const normalize = (value: unknown) => typeof value === 'string' ? value.trim() : '';

export const resolveAnalyticsRuntimeConfig = (input: {
  projectKey?: string;
  host?: string;
  syntheticTest?: boolean;
}): AnalyticsRuntimeConfig => {
  const projectKey = normalize(input.projectKey);
  const configuredHost = normalize(input.host);
  const host = configuredHost || DEFAULT_POSTHOG_HOST;

  if (input.syntheticTest && !projectKey) {
    return {
      enabled: true,
      key: SYNTHETIC_POSTHOG_KEY,
      host,
      readiness: {
        status: 'synthetic',
        missingEnvKeys: [],
        usingDefaultHost: !configuredHost,
      },
    };
  }

  if (!projectKey) {
    return {
      enabled: false,
      key: '',
      host,
      readiness: {
        status: configuredHost ? 'misconfigured' : 'not_configured',
        missingEnvKeys: ['VITE_POSTHOG_KEY'],
        usingDefaultHost: !configuredHost,
      },
    };
  }

  return {
    enabled: true,
    key: projectKey,
    host,
    readiness: {
      status: 'ready',
      missingEnvKeys: [],
      usingDefaultHost: !configuredHost,
    },
  };
};

export const getSafeAnalyticsReadinessSummary = (config: AnalyticsRuntimeConfig) => ({
  status: config.readiness.status,
  enabled: config.enabled,
  missingEnvKeys: [...config.readiness.missingEnvKeys],
  usingDefaultHost: config.readiness.usingDefaultHost,
});
