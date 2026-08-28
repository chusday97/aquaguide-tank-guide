# Live Status

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

## Current state
- Public AquaGuide `main`: untouched.
- Production Supabase: untouched; Admin migrations 001–006 remain branch-only proposals.
- A+B green baseline is recorded at `3c2acab docs(admin): record green A+B gate`; subsequent planning docs move the project into publish-readiness/product completion.
- A+B is proven: local macOS and GitHub Actions run `33147127271` both pass the shared `test:supabase-gate`.
- GitHub A uses Ubuntu 24.04, Node 24.14.0, Supabase CLI 2.115.0 and exact npm lockfile; CI has no Production credentials or deploy permissions.
- Previous Vercel Admin Preview for `43eec47` is READY / HTTP 200 / noindex; newer Preview is waiting on Vercel Hobby daily deployment quota reset.
- Catalog projection remains 486 rows → 276 Base Species; 28 suspected duplicates; 5 category-conflict groups.

## Verified publishing safety
- Migrations 001–006, RLS, admin/non-admin behavior, Base/Variant revision history and rollback-to-Draft are covered by the shared ephemeral Supabase gate.
- One bilingual `sp_0030` fixture can be read as Published from the temporary DB and materialized into two self-canonical indexable EN/ZH pages.
- Runtime checks cover title, meta, H1, robots, canonical, hreflang/x-default and Species sitemap membership.
- Production snapshot/DB/site identities fail closed; generator output must use an explicit non-production target.
- Paid persistent staging is no longer a release prerequisite.

## Current product gap
- Published controls are still globally disabled; the next step is not to remove that lock blindly.
- The Admin needs a publish-readiness layer showing exact blockers per Base/Variant/locale and a controlled Preview Publish state.
- The Data Review Queue currently displays source problems but does not yet persist human resolution decisions.
- Category conflicts and suspected duplicates therefore remain unresolved and cannot safely become independent Index pages.
- Live AI translation provider behavior has not yet been validated with a configured server-side secret.

## Next milestone
1. Publish-readiness checklist/state machine.
2. Persisted human review decisions for category conflicts / duplicates.
3. Controlled non-production Preview Publish using the existing generator and A+B gate.
4. Real AI translation suggestion smoke test.
5. Only after those steps: review Production migration/public deployment integration with explicit approval.
