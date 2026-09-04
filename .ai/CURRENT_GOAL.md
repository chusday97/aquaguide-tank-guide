# Current Goal

Updated: 2026-09-04
Canonical repo: `chusday97/aquaguide-tank-guide`
Branch: `feature/admin-content-v0`
Broader architecture: `.ai/AQUA_OPERATIONS_STUDIO_ARCHITECTURE.md`

## Current objective
Mature Aqua Admin from a Species-SEO-focused publication tool into **Aqua Operations Studio** without breaking the already-working SEO subsystem.

The immediate technical priority is to establish one authoritative Product/Care publication path so Admin changes can be trusted to reach the correct frontend consumers.

## Why this is now P0
Verified current code still has direct static frontend authorities:
- Encyclopedia → `src/data/fishData.ts`
- Care Encyclopedia → `src/data/careTopicsData.ts`
while Product/Care Admin writes through `/admin/species` and `/admin/care-articles`.

Until those paths converge, `/admin/product-content` cannot be called a mature live CMS authority even though its edit/publish API exists.
## Stable subsystem that must not regress
Species SEO remains Repo-backed and fail-closed:
- private Draft/review/import-batch authority;
- CSV preflight + Diff;
- evidence-based duplicate review;
- batch-scoped editorial review;
- bilingual Staging readiness;
- exact Staging allowlist + Canonical dependency validation;
- Production locked.

## Next milestones
1. Define one published Product/Care read contract and identify all direct static consumers.
2. Converge Species and Care frontend reads onto that authority with safe seed/fallback behavior only where explicitly required.
3. Prove one Product edit and one Care edit from Admin through frontend Preview without unintended compatibility/user-state mutation.
4. Complete the existing 14-Species bilingual SEO batch-01 operating cycle on authenticated Preview.
5. Add change-impact classification/Preview before decision-critical Product Data changes can be released broadly.
6. Build Compatibility Admin only after Product Data authority is stable.

## Safety
No Production unlock. No blind main merge/rebase. No SEO field may become authority for decision-critical Product Data or Compatibility Rules.
