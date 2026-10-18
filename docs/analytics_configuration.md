# AquaGuide analytics configuration

AquaGuide client analytics is optional at runtime and fail-open for product functionality: if analytics is not configured, the product still works and keeps only its in-memory session event record.

## Client environment contract

- `VITE_POSTHOG_KEY` — public PostHog project key. Required to enable real client analytics.
- `VITE_POSTHOG_HOST` — optional PostHog API host. When omitted, the code default is used.
- `AQUAGUIDE_REQUIRE_ANALYTICS` — release-check strictness flag. Set to `1` only in a release environment where analytics must be configured.

Do not put real project keys or secret values in this repository documentation. Configure deployment values through the deployment platform.

## Readiness behavior

- No key and no host: `NOT_CONFIGURED`; analytics is disabled.
- Host only: `MISCONFIGURED`; analytics is disabled because a host cannot work without a project key.
- Key only: `READY`; analytics uses the code default host.
- Key + host: `READY`.
- Synthetic test mode may use the isolated synthetic key path and is never treated as production analytics readiness.

Run:

`npm run test:analytics-readiness`

`npm run check:analytics-production-readiness`

The production-readiness command is non-blocking by default and prints only safe status metadata. With `AQUAGUIDE_REQUIRE_ANALYTICS=1`, a missing project key becomes a failing release check.
