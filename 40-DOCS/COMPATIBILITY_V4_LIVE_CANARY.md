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

The DB-independent real V4 canary reuses the production `evaluateTankCompatibility` and `createCompatibilityAiShadowAssessment` code paths against real reviewed catalog species. The current Qwen 3.7 run reports `pass_guarded`: all three reviewed states (compatible / caution / not recommended) are accepted, all three contain grounded reasons, both risk states contain actionable adjustments, the insufficient-data state is skipped before AI, and final-decision mutations remain zero.

The report exposes configured fallbacks plus per-case actual model, reasons, adjustments, uncertainties, provider calls and repair count, with aggregate `modelsUsed`. The normal run records Qwen 3.7. A forced invalid primary currently recovers through Qwen 3.8 and still accepts all three reviewed cases with zero final-decision mutations.

WebCodex Vercel CLI auth is now verified for the linked `aquaguide` project. `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `AI_TIMEOUT_MS`, `COMPATIBILITY_AI_MODEL`, and `COMPATIBILITY_AI_FALLBACK_MODELS` have been written to both Preview and Production environment scopes without exposing the secret. These values apply to new deployments; this checkpoint does not perform a Production redeploy.

A remote Preview-only acceptance probe also confirms that the deployed Vercel runtime can call the configured Bailian workspace: `qwen3.7-flash-2026-07-15` completed with HTTP 200 in about 4.1 seconds and returned the required guarded judgment plus non-empty reason/action arrays. The temporary probe file was removed immediately after validation and is not committed product surface.

Prompt/validation V2 requires a grounded action for caution and not_recommended outputs. The reasoner may perform one bounded repair call only for schema defects or a missing required action. Unknown rule/evidence grounding and attempts to weaken deterministic authority are rejected before action repair. The current real canary needed one repair for a schema-invalid compatible response; after repair all three reviewed cases were accepted. This retry is observable through `repairCount` and cannot mutate the deterministic final decision.

The authenticated shadow route is intentionally read-only. A contract test isolates the route source and rejects any insert/update/delete/upsert call in that route.

Compatibility is now exposed to product code through a second read-only endpoint: `GET /aquariums/:id/compatibility-assessment`. It accepts the current aquarium plus optional repeated `planned=speciesCatalogKey:quantity` query values, merges duplicate species quantities, and calls the existing runtime `evaluateCompatibilityDecision` whole-tank aggregator before AI. This means Aqua does not need to pre-compose or persist every possible species combination; pair relationships and 3+ species whole-tank risks are calculated at request time from current reviewed authority.

The product response now separates the default user result from the evidence layer. `main` contains only `judgment`, `why`, and `howTo`; the visible judgment vocabulary is fixed to `可以养 / 有条件可以 / 不建议 / 暂时无法判断`. `details` holds grounded AI output, rule codes, evidence, provenance and deterministic authority under the `查看依据` label. AI text can supplement the main result only when its verdict exactly matches deterministic authority and the sentence passes a strict readability filter; technical tokens, snake_case, system terms and overly long prose are automatically excluded from `main`.

The latest focused validation passes `test:compatibility-v4-product-assessment`, `test:compatibility-v4-user-readability`, `test:compatibility-result-card`, user-conclusion/presentation contracts, API/project typechecks, and the full backend release gate. The result-card contract proves that a 3-species plan is judged from the whole-tank decision, local/Preview mode has an immediate deterministic readable fallback, cloud enrichment is read-only and authority-clamped, and technical evidence is absent from the default card. The real Bailian canary still reports `pass_guarded` on Qwen 3.7 with zero final-decision mutations.

A dedicated readability contract now runs 20 real catalog cases: 5 compatible, 5 caution, 5 reviewed not-recommended and 5 insufficient-data. It requires one to two short `why` lines and one to two short `howTo` lines, bans implementation jargon from the default result, verifies executable actions for risk states, and verifies explicit missing-information language plus `AI skipped` for insufficient authority. A live Qwen recheck through the final product builder produced, for example, `有条件可以 → 这组里有更容易被追食或啄咬的一方，需要先确认实际捕食风险` with concrete separation/observation actions, and `不建议 → 它们适合的长期水温没有安全重叠` with a direct `分缸或更换温度需求更接近的物种` action.

The existing add-species planner now consumes this contract directly. Its default card contains only the four-state judgment plus `为什么` and `怎么做`; per-species statuses, raw rule evidence and optional AI support are collapsed under `查看依据`. The planner's overall status no longer takes the maximum of separate candidate checks: it builds one runtime whole-tank decision from current stock plus all planned additions, so 3+ species interactions and cumulative tank risks drive the visible result and add policy.

Preview currently has no dedicated AquaGuide database (`databaseConfigured=false`). Under the current project constraints this is recorded as an infrastructure coverage gap rather than a Compatibility AI release blocker. The untested Preview-only segment is login + Supabase user-data loading; core Compatibility AI behavior is covered by the DB-independent real-species canary and the remote Vercel→Bailian provider probe. Preview must not be pointed at Production Supabase just to close this gap. Once a Production promotion is separately authorized, the remaining deployment validation is a read-only smoke test on an existing aquarium.
