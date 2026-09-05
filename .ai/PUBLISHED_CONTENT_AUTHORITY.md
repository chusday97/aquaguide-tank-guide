# Product / Care Published Content Authority

Updated: 2026-09-04
Status: P0 source-of-truth inventory and read-contract decision

## Purpose
This file records every current direct static Product/Care consumer and the required migration boundary. It is the implementation companion to `AQUA_OPERATIONS_STUDIO_ARCHITECTURE.md`.

## Published read contract
The intended user-facing authority is the public Product/Care API backed by reviewed published records. Admin writes remain authenticated and separate from public reads.

Required semantics:
- Draft/save must never mutate what anonymous/public consumers read.
- Publish is the only operation that advances the public Product/Care version.
- Archive removes the published version intentionally.
- Product Data must not absorb Compatibility rule authority or SEO editorial authority.
- Care Knowledge must not absorb user aquarium state.
- Static datasets are seed/offline fallback only; they are not a second live authority.

## Runtime Product Data consumers
Direct `fishData.ts` runtime consumers currently found under `src/`:
- App bootstrap/search preload: `src/App.tsx`
- Compatibility UI: `src/components/CompatibilityRiskCalculator.tsx`
- Species detail: `src/components/SpeciesDetailDialog.tsx`
- Aquarium 3D/runtime lookup: `src/components/ThreeAquarium.tsx`
- Localization projection: `src/i18n/localizeData.ts`
- Assistant context: `src/modules/assistant/assistant.service.ts`
- Species filtering/grouping service: `src/modules/species/species.service.ts`
- AI assistant page: `src/pages/AIAssistant.tsx`
- Aquarium product/runtime decisions: `src/pages/Aquarium.tsx`
- Care context species lookup: `src/pages/CareEncyclopedia.tsx`
- Collection/favorites: `src/pages/Collection.tsx`, `src/pages/CollectionHub.tsx`
- Encyclopedia: `src/pages/Encyclopedia.tsx`
- Home summaries: `src/pages/Home.tsx`
- Identification mapping: `src/pages/Identify.tsx`
- Memorial detail: `src/pages/MemorialDetail.tsx`
- Search: `src/pages/Search.tsx`
- Collection service: `src/services/collection/collection.service.ts`

`src/pages/ProjectStructurePreview.tsx` is a documentation/structure display reference, not a product-data decision consumer.

## Runtime Care Knowledge consumers
Direct `careTopicsData.ts` runtime consumers currently found under `src/`:
- App bootstrap/search preload: `src/App.tsx`
- Localization projection: `src/i18n/localizeData.ts`
- Diagnosis rules/types: `src/modules/diagnosis/diagnosis.rules.ts`, `diagnosis.types.ts`
- Aquarium recommendations/tasks: `src/pages/Aquarium.tsx`
- Care Encyclopedia + diagnosis: `src/pages/CareEncyclopedia.tsx`
- Collection/favorites: `src/pages/Collection.tsx`, `src/pages/CollectionHub.tsx`
- Encyclopedia search/care suggestions: `src/pages/Encyclopedia.tsx`
- Identification suggestions: `src/pages/Identify.tsx`
- Search: `src/pages/Search.tsx`
- Care category/search services: `src/services/care/care-category.service.ts`, `src/services/search/search-suggestions.service.ts`

## Build-time / audit / seed users
These may continue consuming static datasets when their role is explicitly seed, generation, migration, audit or regression testing rather than live frontend authority.
Product build/audit users include Admin catalog generation/contract verification plus taxonomy, image, compatibility, species-fit, diagnosis, search and content-import scripts under `apps/admin-content/scripts/` and `scripts/`.

Care build/audit users include care evidence/category/search tests, localization sync and content import under `scripts/`.

The static files therefore remain useful as:
1. canonical seed input for controlled import/migration where explicitly invoked;
2. deterministic fixture/audit input for tests that intentionally validate the seed catalog;
3. offline/bootstrap fallback when the published API is unavailable, with fallback state observable and never described as current published content.

They must not remain the default successful runtime path after P0 convergence.

## Newly verified publish-isolation blocker
Current Product/Care Admin updates and public reads target the same rows:
- `PATCH /admin/species/:id` updates `species` in place.
- `PATCH /admin/care-articles/:id` updates `care_articles` in place.
- `POST /admin/content/:type/:id/publish` only changes status/published timestamp.
- Public `/species` and `/care-articles` read rows where `status = published`.

Therefore editing an already-published row can change fields while it is still publicly eligible. Runtime cutover must not happen until Draft/save is isolated from the last published snapshot/version.

## Required migration sequence
1. Add an explicit Draft-vs-Published isolation mechanism for Product and Care.
2. Add one bulk published-content read boundary suitable for frontend bootstrap/runtime use.
3. Map published Product/Care DTOs into existing frontend domain types without importing SEO or Compatibility authority.
4. Hydrate runtime consumers from the published authority; static data becomes fallback only.
5. Browser-prove one Product edit and one Care edit remain invisible after Save, then become visible only after Publish.
6. Verify aquarium user state is unchanged and compatibility rules are not silently rewritten.

## Acceptance condition
P0 Product/Care authority convergence is complete only when direct runtime static reads are removed or routed through the published-content provider, Draft isolation is proven, and Admin Publish is browser-verified end to end.

## 2026-09-04 implemented runtime cutover
- `runtimeContentCatalog.ts` bootstraps Product/Care from `/api/v1/content-bootstrap` before App import; failed/unconfigured API explicitly resets to static fallback.
- Locale changes rehydrate the published catalog for `zh-CN` / `en`; published rows are protected from legacy static localization overwrite.
- Encyclopedia Product Data and Care Encyclopedia use the runtime catalog.
- Aquarium and Identify diagnosis now receive Care Knowledge from the runtime catalog; diagnosis rules remain pure consumers of the passed `careTopics` input.
- Dedicated Business API Vercel routing avoids packaging the legacy static server into `/api/v1/*`.
- Remaining direct static imports in Collection/Search/Home/Compatibility-related surfaces are not evidence that the two completed P0 routing items are unfinished; they require separate impact classification before decision-critical Product migration.
- Controlled end-to-end Admin Save/Publish → Preview proof now passes for the defined Product/Care target consumers. Production/staging deployment acceptance remains separate and was not performed.

## 2026-09-04 controlled acceptance result
- Product Admin Save moves the editable record to Draft while the public runtime retains the previous published value; Publish advances Encyclopedia on a fresh Preview load.
- Care Admin follows the same boundary and advances Care Guide only after Publish.
- Stricter card-title assertions exposed and fixed a legacy hardcoded Care-title override that had produced a false-positive earlier test.
- Published Product/Care labels are protected from legacy search/localization projection.
- Browser tests keep `aquarium_app_state_v1` byte-identical; Node isolation test proves published Product hydration does not mutate static Compatibility inputs.
- The defined Product/Care P0 target is locally accepted; remaining direct static consumers require explicit impact classification before any decision-critical migration.
