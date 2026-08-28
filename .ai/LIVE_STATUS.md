# Live Status

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

## Current state
- Public AquaGuide `main`: untouched.
- Production Supabase: untouched; Admin migrations 001–007 remain branch-only proposals.
- A+B baseline is proven: local macOS and GitHub Actions run `33147127271` passed the shared gate through migration 006.
- Migration 007 Publish Readiness/Data Review is pushed as `3669146`; GitHub Actions run `33149941551` passed every A-layer step, including the ephemeral schema-v7 database gate.
- Local read-only Admin preview is available at `http://localhost:3020/` and returns HTTP 200.
- Catalog projection remains 486 rows → 276 Base Species; 28 suspected duplicates; 5 category-conflict groups.

## Publish-readiness model implemented locally
- Editorial review is independent from content status: `editing → ready_for_review → approved`.
- Any editorial/index change after approval automatically resets the row to `editing`; clients cannot preserve stale approval.
- Rollback restores `draft + editing`, clears publish metadata, and cannot republish or preserve approval.
- `species_data_reviews` persists admin decisions for category conflicts and duplicate sets without modifying `fishData.ts` Product Truth.
- A safe public resolution RPC exposes only issue key/type/group/decision/canonical target; notes/reviewer identity remain admin-only.
- Generator now requires Approved Base + Approved Variant and re-checks review resolutions before independent Index.
- All 276 Base Species now have a Base editor; single-member groups no longer fall outside the Base/publication contract.

## B-layer evidence
- Fresh ephemeral Supabase applied core + migrations 001–007 from scratch.
- Schema probe reports version 7 and confirms editorial review + data-review capability.
- Ordinary authenticated users: Draft visibility 0; cannot write SEO; cannot read revisions; cannot rollback; cannot read/write Data Review rows.
- Public review-resolution RPC is readable without exposing notes/reviewer fields.
- Approved content modified afterward is forced back to Editing.
- Base/Variant rollback remains Draft-only and Editing-only.
- DB → bilingual static Species fixture still generates 2 indexable EN/ZH pages with canonical/hreflang/sitemap checks.
- Contract, staging guards, Supabase gate, production Admin build and `git diff --check` pass; only the existing >500KB Vite warning remains.
- Real Chrome Review covered duplicate, category-conflict and single-member Base paths with `PAGE_ERRORS=0`.

## Controlled Preview Publish
- Approved Draft content can now be exported from Admin as a minimal Preview Snapshot; reviewer identity and Data Review notes are stripped.
- `generate:preview-publish` reuses the static generator in explicit Preview mode and requires selected catalog keys.
- Preview HTML always renders `noindex,nofollow` even when the intended future route is Index.
- Preview output includes `robots.txt` with `Disallow: /`, a local index page and preview manifest; it does not emit `sitemap-species.xml`.
- Root/app deployable `public/` and Admin `dist/` output paths are hard-rejected.
- Local generated Preview is live at `http://localhost:4020/`; root/EN/ZH are HTTP 200 and Chromium reports no page errors.
- Admin Review remains live at `http://localhost:3020/`.

## Remaining gate
1. Add queue-level Data Review and Publish Readiness overview counts/filters.
2. Re-check remote Admin Preview after Vercel Hobby quota reset.
3. Validate 1–2 live translation suggestions after server-only provider configuration.
4. Production migration/public deploy remains a separate explicit approval.
