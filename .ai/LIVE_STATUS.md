# Live Status

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

## Current state
- Public AquaGuide `main`: untouched.
- Production Supabase: untouched; Admin migrations 001–006 remain branch-only proposals.
- Latest pushed milestone before A+B work: `70e539f feat(admin): verify staging schema release gate`.
- Previous Vercel Admin Preview for `43eec47` remains READY / HTTP 200 / noindex; new Preview is temporarily blocked by Vercel Hobby daily deployment quota.
- 486 catalog rows → 276 Base Species groups; 28 suspected duplicates; 5 category-conflict groups.

## A+B stability model
- B = Mac local Supabase for fast development and UI/database debugging.
- A = GitHub Actions ephemeral Supabase for clean-machine, reproducible validation.
- Both run the same `npm run test:supabase-gate -w @aquaguide/admin-content` command.
- CI is read-only with respect to the repository and has no Production Supabase or Vercel deployment credentials.
- CI toolchain is pinned: Ubuntu 24.04, Node 24.14.0, Supabase CLI 2.115.0, exact npm lockfile.
## Shared gate verification
- Ephemeral DB loads only `202607160001_core_schema.sql` + Admin migrations 001–006.
- Local gate creates real admin/user Auth identities, promotes only the test admin through local DB fixture setup, then exercises product writes through JWT + RLS.
- Regular authenticated users see 0 Draft Species rows, cannot insert SEO, cannot read revision history, and cannot call rollback.
- Base + Variant rollback both restore Draft state and clear `published_at`; rollback revisions preserve source revision IDs.
- The same temporary DB publishes one reviewed `sp_0030` bilingual fixture, reads Published rows anonymously, and generates 2 indexable EN/ZH static pages with canonical/hreflang/sitemap checks.
- Local macOS result: `gate=PASS`, schema version 6, 2 rollback revisions, 2 generated/indexable pages.

## GitHub A-layer status
- Workflow `2d85a4e` is already pushed and GitHub run `33146619043` verified checkout, Node 24.14.0, Supabase CLI 2.115.0 and Docker successfully.
- That first clean run failed only at `npm ci` because root `package-lock.json` did not contain the Admin workspace metadata; database tests were not reached.
- Lockfile is now corrected locally. Actual `date-fns` remains 4.1.0; only the root dependency spec metadata is aligned to `package.json` (`^4.0.0`).
- Clean local `npm ci --no-audit --no-fund` plus the full shared Supabase gate/build now PASS.

## Remaining gate
- GitHub Actions run `33147127271` for `ef2f6ae` completed SUCCESS: every step passed, including clean `npm ci`, contract, ephemeral Supabase database gate, production build, generated catalog parity and diff hygiene.
- A is now proven on a clean Ubuntu runner; B remains the fast local path using the same database gate command.
- Published remains disabled until CI is green and public-deploy integration is explicitly reviewed.
- A paid persistent Supabase staging branch is no longer required; it remains an optional later convenience.
