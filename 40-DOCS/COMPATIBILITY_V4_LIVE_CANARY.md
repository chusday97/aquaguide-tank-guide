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
- `COMPATIBILITY_AI_MODEL` (falls back to `AI_MODEL` / `DEEPSEEK_MODEL`)
- `COMPATIBILITY_AI_FALLBACK_MODELS` (optional comma-separated ordered fallbacks)
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

A pre-existing local Bailian credential is securely reused through ignored `.env.local`; the secret is never printed or committed. Compatibility now has its own model pool instead of inheriting one global text model: primary `qwen3.7-flash-2026-07-15`, then `qwen3.8-27b`, then `deepseek-v4.1-flash`, with the existing Beijing workspace OpenAI-compatible endpoint and a 20-second per-model timeout.

Live probes confirmed both Qwen 3.x models are callable when Compatibility sends `enable_thinking=false`; without that adapter they exhausted the 20-second budget. The same non-thinking adapter remains enabled for DeepSeek V4. `kimi-k3` shows account quota but is not in the active pool because the current workspace endpoint returns an immediate provider-level failure for that model code.

The default real V4 canary now reports `pass_guarded` on `qwen3.7-flash-2026-07-15`: all three reviewed states (compatible / caution / not recommended) are accepted, the insufficient-data state is skipped before AI, there are zero unavailable/rejected cases, and final-decision mutations remain zero. A forced unsupported-primary canary also reaches `pass_guarded`, proving the ordered failover path can recover through the configured fallback models without mutating deterministic authority.

WebCodex Vercel CLI auth is now verified for the linked `aquaguide` project. `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `AI_TIMEOUT_MS`, `COMPATIBILITY_AI_MODEL`, and `COMPATIBILITY_AI_FALLBACK_MODELS` have been written to both Preview and Production environment scopes without exposing the secret. These values apply to new deployments; this checkpoint does not perform a Production redeploy.

A remote Preview-only acceptance probe also confirms that the deployed Vercel runtime can call the configured Bailian workspace: `qwen3.7-flash-2026-07-15` completed with HTTP 200 in about 4.1 seconds and returned the required guarded judgment plus non-empty reason/action arrays. The temporary probe file was removed immediately after validation and is not committed product surface.

The remaining Preview blocker is database infrastructure, not the model provider. The branch Preview responds normally but its Business API reports `databaseConfigured=false`. Current Supabase discovery contains no dedicated AquaGuide staging project or non-default branch, so the authenticated DB-backed shadow endpoint cannot be exercised safely in Preview. Preview must not be pointed at Production Supabase merely to satisfy this gate; Production promotion stays held until a safe non-Production database path is available.
