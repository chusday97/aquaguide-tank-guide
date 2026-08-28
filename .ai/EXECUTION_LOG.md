# Execution Log

## 2026-08-28 — Admin Content V0 baseline

- Isolated branch: `feature/admin-content-v0`.
- Added standalone `apps/admin-content` Vite app.
- Verified independent build, Supabase Auth guard, `user_roles` admin check and RLS boundary.
- Local isolated Supabase test proved Admin Draft save succeeds and non-admin Draft read/write is denied.
- Remote Vercel `admin-content` project established as read-only Review environment.
- No `main` merge and no Production Supabase write.

## 2026-08-28 — Catalog authority correction

- Confirmed current public product reads 486 records from `src/data/fishData.ts`; connected Supabase `species` table is currently empty.
- Admin therefore reads a generated lightweight repository catalog and stores only editorial SEO in `species_seo`.
- Stable `catalog_key` remains the join key between Product Truth and editorial SEO.

## 2026-08-28 — Base Species / Variant milestone

- Added `generate-species-groups.mjs` and generated `species-groups.generated.json`.
- Measured 486 records → 276 Base Species groups; 83 multi-member batch groups; 223 explicit variants.
- Detected 28 exact duplicate records and 5 category-conflict groups for manual review.
- Added grouped/category navigation, variant checkboxes and same-group batch SEO template editor.
- Batch templates are Draft-only, Review-safe, Product-Truth isolated, and blocked on category conflicts / Published rows.
- Added contract assertions so flattening back to the empty Supabase `species` table or unsafe bulk writes fail tests.

## 2026-08-28 grouped UI verification
- Added root `PROGRESS.md` / `HANDOFF.md` pointers to the `.ai/` execution records.
- Verified 3011 read-only Review with real headless Chrome/CDP; 276 groups, 293 Variant rows, 5 conflict badges, no Vite overlay.
- Verified `Neocaridina davidi` two-member bulk template preview and disabled Review save.
- Verified `Pterophyllum scalare` category-conflict warning blocks bulk save.
- Verified 1440×900 desktop grid has no document horizontal overflow.
- Fixed batch checkbox selection to align the single-item editor with the last selected member.
- Removed runtime timestamp from generated grouping JSON; repeated generation now produces an identical SHA-256 hash.

## 2026-08-28 grouping milestone push
- Functional milestone committed as `746bce0 feat(admin): group species variants for bulk SEO`.
- Pushed successfully to `origin/feature/admin-content-v0`; `main` remains untouched.
- Vercel `admin-content` detected commit `746bce0` on the intended branch; deployment is currently queued on Hobby capacity, not yet verified READY.
- Deployment-side caveat: other repository branches without `apps/admin-content` can fail before Ignore Build runs because the configured Root Directory is absent. This is external deployment noise, not an Admin runtime failure.

## 2026-08-28 Base Species inheritance milestone
- Added `species_seo_groups` branch migration with admin-only write RLS and published/admin read policy.
- Added Base Species shared SEO editor and read-time inheritance resolver.
- Variant SEO fields are now explicit Overrides; clearing Title Override restores Base inheritance.
- Batch workflow now creates Draft shells only and previews effective inherited SEO instead of copying template text.
- Real Chrome Review verification: Base template edits propagate immediately to 极火虾 / 黄金米虾 previews; shared intro propagates; Variant Override remains isolated.
- Isolated local Supabase verification: admin Draft insert succeeds; non-admin Draft read returns 0 and non-admin insert is rejected by RLS; test rows cleaned up.
