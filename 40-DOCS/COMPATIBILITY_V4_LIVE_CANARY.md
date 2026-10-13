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

A pre-existing local Bailian `DASHSCOPE_API_KEY` is securely reused for Aqua as ignored `AI_API_KEY`. Aqua now uses the existing Beijing workspace OpenAI-compatible endpoint plus `AI_MODEL=deepseek-v4.1-flash` and a 20-second timeout. The secret is not printed or committed.

Qwen Flash/Plus probes in this workspace remain quota-blocked, but `deepseek-v4.1-flash` returns HTTP 200. DeepSeek V4 defaults to thinking mode; with the prior output budget that produced `finish_reason=length` and no final `content`. Compatibility therefore sends `enable_thinking=false` only for DeepSeek V4 models. A strict JSON schema probe then returned `finish_reason=stop` with exactly `suggestedVerdict`, `reasons`, `adjustments`, `uncertainties`, `confidence`, and `evidenceIds`.

The real V4 canary now reports `pass_guarded`: all three reviewed states (compatible / caution / not recommended) are accepted, the insufficient-data state is skipped before AI, there are zero unavailable/rejected cases, and final-decision mutations remain zero. Reviewed-case latency is roughly 6.7–7.4 seconds in the current local run.

The WebCodex host has a linked Vercel project but no Vercel CLI auth/token, so these AI environment variables have not been written to remote Preview or Production.
