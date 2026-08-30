# Live Status

Updated: 2026-08-30
Branch: `feature/admin-content-v0`

## Current state
- Public AquaGuide `main`: untouched.
- Production Supabase: untouched; Admin migrations 001–007 remain branch-only proposals.
- A+B is green through schema v7 and Controlled Preview safety.
- Local read-only Admin preview is running at `http://localhost:3020/`.
- Local generated static Controlled Preview remains available at `http://localhost:4020/` while that process is alive.
- Catalog remains 486 rows → 276 Base Species; 5 category-conflict groups + 28 duplicate sets = 33 Data Review issues.

## Latest committed baseline
- `f6c6401` — Controlled Species Preview Publish.
- `374db2f` — queue-level Workflow Overview filters; Chrome verifies 276 → 32 issue groups → 276 restore with zero page errors.

## UI convergence currently verified locally
- `aqua-fronted-cms` has been inspected as the AI Studio visual source. It is not connected as a backend/business dependency.
- Current Admin now uses a true three-pane desktop workspace: 270px Species navigation / flexible editor / 460px live preview; at 1600px the editor receives 870px.
- Left navigation is Category → Base Species → Variant. Parent click enters Base authoring; child click enters Variant authoring.
- Workflow filters are simplified to All / Data Issues / Awaiting Review / Ready.
- Main editor no longer embeds a second Google-preview column; right preview owns Page / Google / Mobile.
- Unsaved H1 edits stream to the live page immediately.
- Secondary operations (Data Review, readiness details, translation, batch, revision history, workflow overview) are progressively disclosed instead of permanently occupying the editor.
- Live Preview now lazy-loads image + read-only water/tank/difficulty/description facts from the existing catalog projection; Species Group JSON stays lightweight. Chrome confirms the current Species image and facts render correctly.
- Browser evidence at 1600×1000: left=270, center=870, right=460; H1 live update PASS; Base editor switch PASS; issue filter 33 issues → 32 groups; `pageErrors=[]`.
- Local Supabase gate remains PASS after the UI refactor; schema_version=7, RLS/rollback/static generation unchanged.

## Current uncommitted milestone
- First visual integration pass is locally green but not yet pushed.
- Before push: update contract/docs, rerun contract/build/diff/full B gate, inspect staged scope.
- After push: GitHub A-layer clean Ubuntu run must pass before this UI milestone is treated as stable.

## Remaining product work
1. Further reduce inherited/custom field noise in the center editor.
2. Refine Data Review / Translation / History interactions into lighter secondary surfaces.
3. Re-check Vercel Preview when quota permits.
4. Validate live English AI suggestion quality with a server-only provider key.
5. Production migration/public deploy remains a separate explicit approval.

## 2026-08-31 Admin UI / i18n status
- Local Review remains available at `http://localhost:3020/`.
- Three-pane browser proof at 1600px: left 270px / editor 870px / preview 460px.
- Global UI locale switch persists via `aquaguide-admin-app-locale` and updates `<html lang>`.
- Browser proof: UI English + content Chinese coexist; the right frontend preview remains Chinese when `contentLocale=zh-CN`.
- Product Truth lazy-load proof: `sp_0030` renders a 591px source image plus 18–28°C / pH 6.5–8.0 / 30L+ facts after the group projection was de-duplicated.
- B layer remains green through migration 007, RLS, rollback, bilingual generator and Controlled Preview gates.
