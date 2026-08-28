# Task Queue

Updated: 2026-08-28

## Done this milestone
- [x] Push Base Species inheritance milestone (`f27ed43`).
- [x] Build source-data review filters for 5 category conflicts and 28 suspected exact duplicates.
- [x] Add right-side review evidence; do not auto-delete or rewrite Product Truth.
- [x] Add independent `zh-CN` / `en` Species SEO and Base SEO rows.
- [x] Add locale-specific English common/display name without mutating catalog names.
- [x] Add admin-authenticated server-side AI translation suggestion endpoint.
- [x] Protect scientific names, catalog keys and Base template tokens.
- [x] Save accepted translation only as English Draft; block direct overwrite of Published English.
- [x] Verify bilingual coexistence and Draft RLS in isolated local Supabase.
- [x] Verify English translation UI and review queue in real Chrome Review mode.

## Next
- [ ] Configure AI provider secret for the isolated Admin deployment and verify one real zh→en translation request.
- [ ] Add Draft / Preview / Publish version history before modifying Published SEO.
- [ ] Add per-Variant index strategy: Index / Canonical to Base / Noindex.
- [ ] Define public multilingual URL + canonical + hreflang contract before wiring English SEO to public pages.
- [ ] Add terminology/glossary memory after the first reviewed English Species batch.
- [ ] Validate the final Admin schema in staging/non-production Supabase.

## Later
- [ ] Connect Published effective localized SEO to public Species pages.
- [ ] Add internal-link/FAQ inheritance after content model stabilizes.
- [ ] Search Console/ranking integrations only after publishing architecture is stable.
