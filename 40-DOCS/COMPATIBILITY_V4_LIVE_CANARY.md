# Compatibility V4 Live Provider Canary

## Purpose

The live canary is the controlled bridge between deterministic V4 shadow regression and any future user-visible AI explanation.

It uses the same four real three-species states already covered by the deterministic shadow eval:

- reviewed compatible;
- reviewed caution;
- reviewed not recommended;
- insufficient data / incomplete authority.

The canary never changes the deterministic `finalDecision`.

## Command

`npm run canary:compatibility-v4-live`

Default output:

`.artifacts/readiness/compatibility-v4-live-canary.json`

The output path is intentionally outside committed product authority. A canary run records model/provider metadata, per-case latency, AI status/reason, suggested verdict, and whether the deterministic final decision remained unchanged. It never records the API key.

## Provider behavior

The command uses the existing server-side text provider contract:

- `AI_API_KEY` or `DEEPSEEK_API_KEY`
- `AI_BASE_URL` / `DEEPSEEK_BASE_URL`
- `AI_MODEL` / `DEEPSEEK_MODEL`
- `AI_TIMEOUT_MS`

No browser credential is introduced.

A secret-free authenticated diagnostic is also available at:

`GET /api/v1/aquariums/compatibility-ai-readiness`

It returns only `mode`, `configured`, provider host, model and timeout. It never returns an API key or authorization header.


If no provider key is configured, the canary outcome is `blocked_not_configured`. Reviewed cases return `ai.status=unavailable` with `not_configured` before any provider invocation; the insufficient-data case still skips AI entirely. This is a valid fail-closed environment result, not a successful live-model evaluation.

Configured providers also distinguish explicit operational blockers: `blocked_provider_quota`, `blocked_provider_access`, and `blocked_provider_rate_limit`. These do not mutate the deterministic result and are separate from transport/network failure.

## Readiness rule

A configured provider only produces `pass_guarded` when:

1. there are zero deterministic final-decision mutations;
2. there are no provider-unavailable reviewed cases;
3. at least two reviewed cases produce accepted, schema-valid, grounded AI output;
4. incomplete authority still skips AI.

A rejected model output remains observable but cannot weaken deterministic authority.

## Current WebCodex observation — 2026-10-13

A pre-existing local Bailian `DASHSCOPE_API_KEY` was securely reused for Aqua as ignored `AI_API_KEY` with `AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`, `AI_MODEL=qwen-plus`, and a 20-second timeout. The secret was not printed or committed. `GET /models` returned HTTP 200, confirming key and endpoint authentication.

Real chat probes were then attempted. `qwen-plus`, `qwen-flash`, `qwen3.5-flash`, `qwen3.6-flash`, and `qwen3.7-flash` returned HTTP 403 `AllocationQuota.FreeTierOnly`: the account's free text quota is exhausted while paid use is disabled. Legacy Turbo and a small Qwen instruct model were also access-denied.

The real V4 canary now reports `blocked_provider_quota`: three reviewed cases are `unavailable/quota_exhausted`, the insufficient-data case is still skipped, and final-decision mutations remain zero.

The WebCodex host has a linked Vercel project but no Vercel CLI auth/token, so these AI environment variables have not been written to remote Preview or Production.
