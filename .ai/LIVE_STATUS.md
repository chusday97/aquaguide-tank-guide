# Live Status

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

## Current state
- Public AquaGuide `main`: untouched by this Admin branch.
- Production Supabase: untouched; Admin migrations remain branch-only proposals.
- Admin app: `apps/admin-content`; remote Review mode remains no-write.
- Inheritance milestone is already pushed as `f27ed43`.
- Current uncommitted milestone adds source-data review + bilingual SEO authoring.

## Bilingual content model
- Chinese is the editorial source locale (`zh-CN`); English is a separate `en` row.
- Variant rows are keyed by `catalog_key + locale`; Base rows by `group_key + locale`.
- `localized_name` stores an English editorial common/display name and does not modify Product Truth.
- English Base templates have locale-native defaults; Variant blank Overrides continue inheriting Base.
- AI translation generates suggestions only; acceptance saves an English Draft and never auto-publishes.
- Published English is protected from direct suggestion overwrite until versioned Draft/Publish exists.

## Translation safety
- `/api/translate` requires the signed-in Supabase JWT and re-checks `user_roles.role=admin` server-side.
- Provider secrets use server-only `AI_API_KEY` / `DEEPSEEK_API_KEY`; browser code never reads them.
- Scientific names/catalog keys are context-only and must not be translated.
- Base `{{template_tokens}}` are validated after model output; token loss/rename fails closed.

## Verification
- Contract test, Vite production build and diff check passed before final docs sync; final gate will rerun before commit.
- Local isolated Supabase: same Species stores independent zh-CN and en Draft rows without collision.
- Simulated non-admin Draft read remains 0; test rows were cleaned up.
- Real Chrome Review verified `?locale=en`, `?locale=en&species=sp_0175`, and `?species=sp_0001`.
- Review UI visibly exposes 5 category conflicts and 28 duplicate candidates with exact member evidence.

## External gate
- A live AI translation request still depends on configuring the provider secret in the isolated Admin deployment.
- Public multilingual Species routing/canonical/hreflang is intentionally not connected yet.
