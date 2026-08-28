# Current Goal

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

Move AquaGuide Species SEO Admin from infrastructure-complete to a controlled editorial review workflow without touching `main` or Production Supabase.

## Current milestone

`Draft content → Editorial Review State → Data Review Decision → Publish Readiness → Preview Publish candidate`

A+B remains the validation model:
- B: Mac local Supabase for fast iteration.
- A: pinned GitHub Actions ephemeral Supabase for clean-machine release gating.

## Safety boundary
- `Published` remains hard-disabled in the Admin UI.
- `Publish-ready` means eligible for controlled Preview Publish only; it does not mean Production is live.
- Content edits after approval must automatically reset review state to `editing`.
- Rollback must restore `draft + editing`, never an approved/published state.
- Data Review decisions may affect SEO eligibility but never mutate `fishData.ts` Product Truth.
