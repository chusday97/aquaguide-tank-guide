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

If no provider key is configured, the canary outcome is `blocked_not_configured`. Reviewed cases return `ai.status=unavailable` with `not_configured`; the insufficient-data case still skips the provider entirely. This is a valid fail-closed environment result, not a successful live-model evaluation.

## Readiness rule

A configured provider only produces `pass_guarded` when:

1. there are zero deterministic final-decision mutations;
2. there are no provider-unavailable reviewed cases;
3. at least two reviewed cases produce accepted, schema-valid, grounded AI output;
4. incomplete authority still skips AI.

A rejected model output remains observable but cannot weaken deterministic authority.

## Current WebCodex observation — 2026-10-13

The current WebCodex execution environment has no configured supported AI/DeepSeek/GLM/Qwen/OpenAI/Kimi/Anthropic key. Therefore no external model request was made during this checkpoint.

The canary harness itself was executed and correctly returned `blocked_not_configured`; all four deterministic final decisions remained unchanged.
