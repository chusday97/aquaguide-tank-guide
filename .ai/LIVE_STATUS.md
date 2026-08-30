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
- `539baf4` — three-pane live workspace + global Admin language + lazy Product Truth preview.
- GitHub Actions run `33323234484` completed SUCCESS: contract, migration 001–007 ephemeral Supabase gate, production build, generated catalog parity and diff hygiene all green.
- `374db2f` remains the verified queue-filter baseline: 276 → 32 issue groups → 276 restore with zero page errors.

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

## Current local delta
- Top workflow navigation now uses semantic state colors: Data Review amber, Awaiting Review blue, Preview-ready green. Browser computed-style verification confirms all three states render distinctly.
- This small UI delta is intentionally being synchronized with the Inspector roadmap rather than treated as a standalone product milestone.

## Remaining product work
1. P0: Bidirectional Editor ↔ Preview Inspector for the first six editable fields.
2. P0: Selection source labels — Custom / Inherited from Base / Product Truth · Read only.
3. P1: Reduce inherited/custom field noise and refine secondary tools into lighter surfaces.
4. Re-check Vercel Preview when quota permits and validate live English AI suggestions when the server-only provider key is available.
5. Production migration/public deploy remains a separate explicit approval.

## 2026-08-31 Admin UI / i18n status
- Local Review remains available at `http://localhost:3020/`.
- Three-pane browser proof at 1600px: left 270px / editor 870px / preview 460px.
- Global UI locale switch persists via `aquaguide-admin-app-locale` and updates `<html lang>`.
- Browser proof: UI English + content Chinese coexist; the right frontend preview remains Chinese when `contentLocale=zh-CN`.
- Product Truth lazy-load proof: `sp_0030` renders a 591px source image plus 18–28°C / pH 6.5–8.0 / 30L+ facts after the group projection was de-duplicated.
- B layer remains green through migration 007, RLS, rollback, bilingual generator and Controlled Preview gates.
