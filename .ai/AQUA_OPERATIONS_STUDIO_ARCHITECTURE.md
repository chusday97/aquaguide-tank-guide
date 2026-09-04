# Aqua Operations Studio — Product / Content / Rules Architecture

Updated: 2026-09-04
Status: canonical product-operations architecture contract

## 1. Product definition
AquaGuide is not only a Species encyclopedia. The user product includes aquarium management, care guidance, compatibility decisions, identification/search and SEO acquisition surfaces.

The Admin therefore must not be treated as one generic CMS. The mature target is **Aqua Operations Studio**: one operating surface for Product Data, Care Knowledge, Compatibility Rules, SEO Editorial and controlled publishing.

## 2. Authority map
| Domain | Owns | User-facing consumers | Current Admin |
| --- | --- | --- | --- |
| Product Data | scientific identity, temperature, pH, tank size, temperament, feeding, housing facts, images | Encyclopedia, Aquarium, compatibility inputs, recommendations, SEO facts | `/admin/product-content` → Species |
| Care Knowledge | symptoms, steps, avoid actions, observe/escalate/next step, care assets | Care Encyclopedia, diagnosis, aquarium care tasks/recommendations | `/admin/product-content` → Care |
| Compatibility Rules | behavior profiles, pair rules, evidence, confidence, rule versions | compatibility calculator, add-to-tank safety, aquarium risk tasks | no mature operator UI yet |
| SEO Editorial | title, meta, H1, intro, image alt, localized display copy, canonical/index policy | static SEO landing pages / search acquisition | `/admin/seo/` |
| User Context | owned livestock, tank volume/conditions, reminders, activity | personalized compatibility/care results | user product, not CMS content |
## 3. Global content vs personalized results
Global content is shared after publication: Species facts, approved Care knowledge, Compatibility rules and locale-specific SEO pages are not per-user variants by default.

Personalization is computed from shared knowledge/rules plus each user's aquarium context:
`Approved Product Data + Approved Compatibility Rules + User Aquarium Context → personalized compatibility / care result`.

SEO is an acquisition projection, not the source of product behavior. Editing an SEO H1 or Meta must never silently change pH, compatibility decisions, aquarium tasks or another user's stored aquarium state.

## 4. Current verified source-of-truth gap — P0
The repository currently has two content paths that are not fully converged:
- `src/pages/Encyclopedia.tsx` imports `src/data/fishData.ts` directly.
- `src/pages/CareEncyclopedia.tsx` imports generated `src/data/careTopicsData.ts` directly.
- `/admin/product-content` writes Product/Care records through `/admin/species` and `/admin/care-articles` APIs.

Therefore Product/Care Admin `published` state is **not yet proven to be the single frontend authority**. Do not tell operators that every Product/Care publish immediately updates the live consumer experience until this read path is converged and acceptance-tested.
## 5. Compatibility boundary
The current compatibility product is real and rule-based. `tankCompatibilityEngine` consumes Species facts plus reviewed compatibility evidence and user tank context. Reviewed evidence currently lives in code/data such as `compatibilityEvidence`.

This means compatibility is **not SEO content** and is not yet a mature CMS-managed domain. The target operator model is:
`Species Behavior Profile + Pair Rule + Evidence + Confidence + Review Status + Rule Version`.

Rule changes must be stricter than copy edits: Draft → regression/impact test → human review → versioned publish.

## 6. Mature publishing model
A mature change should pass through:
`Edit → Diff → Impact → Preview → Review → Staging → Production`.

Impact Preview should distinguish:
- display-only changes;
- decision-critical Product Data changes;
- Care workflow changes;
- Compatibility rule changes;
- SEO-only acquisition changes.

Decision-critical changes must show affected consumers before release, e.g. Encyclopedia, compatibility outputs, aquarium-fit recommendations, care tasks and SEO facts.
## 7. Target Studio navigation
- Dashboard — pending review, data anomalies, recent changes, release readiness.
- Species — Product Data, source/provenance, confidence, images.
- Care — structured care playbooks and evidence.
- Compatibility — behavior profiles, pair rules, evidence, rule tests.
- SEO — Species/Care acquisition copy and canonical/index policy.
- Publish Center — Diff, impact, Preview, review, Staging, Production boundary.

## 8. Execution order
P0-A: converge Product/Care frontend reads onto one published authority; keep static files only as explicit build seed/fallback if required.
P0-B: finish the already-built 14-Species bilingual SEO batch operational acceptance without changing Production.
P1: add change-impact classification + Preview across Encyclopedia / SEO / compatibility outcomes.
P1: build Compatibility Admin for reviewed behavior/evidence/pair rules; do not make arbitrary rule edits directly publishable.
P2: unify release history/audit in Publish Center and add role/permission improvements.
P2: add AI only as an assistant for extraction, conflict detection, impact explanation and Draft generation from approved facts.

## 9. Non-negotiable rule
Reliable Product/Care/Compatibility knowledge is upstream. SEO is downstream. Never use SEO copy as authority for product decisions, and never let AI invent decision-critical facts without evidence + human review.
