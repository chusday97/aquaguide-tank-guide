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

## 4. Current verified source-of-truth status
Product/Care P0 is converged and controlled-Preview accepted: public Product/Care APIs are the published runtime authority for the connected Encyclopedia/Care/Aquarium/Identify consumers, while static datasets remain explicit seed/offline fallback.

Compatibility is now converged in code as a reviewed authority with explicit fallback. `tankCompatibilityEngine`, Admin reviewed views and server regression consume the same reviewed authority model. DB authority activates only with exact current 7 Profile / 4 Pair coverage and reviewed Evidence; otherwise the runtime falls back wholesale to the static reviewed baseline. Versioned publish exists behind canonical Evidence, structural Impact, real engine Regression, explicit human approval and freshness/version gates. The migrations remain unapplied to live/Production, so live rollout is still intentionally locked.

## 5. Compatibility boundary
The compatibility product is real and rule-based. `tankCompatibilityEngine` consumes Approved Product facts plus reviewed Compatibility evidence/rules and user tank context.

The operator model is implemented in code for the current reviewed baseline:
`Species Behavior Profile + Pair Rule + Evidence + Confidence + Review Status + Rule Version`.
Rules follow `Draft → structural Impact → real engine Regression → canonical Evidence → human Review/Approve → versioned publish`. Arbitrary new rules without a reviewed DB baseline remain disallowed.

The next architecture gap is cross-domain release observability: Product/Care snapshots, SEO Repo/Staging releases and Compatibility revisions are mature but separate. P2 should unify **read-only release history/audit first**, then permissions/orchestration, without creating a competing publication authority.

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
