# Current Goal

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

Move AquaGuide Species SEO Admin from publish-readiness into a controlled non-Production preview/review workflow without touching `main` or Production Supabase.

## Current milestone

`Approved Draft → Controlled Preview Snapshot → same static generator → forced-noindex preview HTML → human review`

A+B remains the stability model:
- B: Mac local Supabase for fast iteration.
- A: pinned GitHub Actions ephemeral Supabase for clean-machine release gating.

## Verified baseline
- Migration 007 Publish Readiness/Data Review passed locally and on GitHub Actions run `33149941551`.
- Controlled Preview Publish accepts Approved Draft only, requires explicit selected Species, and never writes deployable `public/` or Admin `dist/`.
- Preview output forces `noindex,nofollow`, writes `robots.txt` with `Disallow: /`, and omits the release Species sitemap.
- Release/staging mode remains unchanged: Published-only input, true robots/index strategy and sitemap verification.

## Safety boundary
- Production `Published` remains locked.
- Preview eligibility never means Production release approval.
- Preview and release reuse one generator with explicit mode-specific safety; no second content rendering implementation.
- Product Truth remains read-only from this Admin.
