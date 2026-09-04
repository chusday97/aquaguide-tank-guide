# Current Goal

Updated: 2026-09-04
Canonical repo: `chusday97/aquaguide-tank-guide`
Branch: `feature/admin-content-v0`
Broader architecture: `.ai/AQUA_OPERATIONS_STUDIO_ARCHITECTURE.md`

## Current objective
Mature Aqua Admin from a Species-SEO-focused publication tool into **Aqua Operations Studio** without breaking the already-working SEO subsystem.

The immediate priority is now **P1 Compatibility Admin**. Change Impact Preview is complete: field classification, affected-consumer summaries, persisted Draft-vs-Published Diff, Encyclopedia Before/After, and species-only Compatibility regression are implemented and accepted.

## Why this is now P1
The defined Product/Care authority target is already converged and browser-accepted. The remaining operational risk is release comprehension: a content operator must see which user-facing surfaces change directly, which independent authorities require review, and what the user will see before a decision-critical release is approved.
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
1. [DONE locally] Define one published Product/Care read contract, inventory direct static consumers, and isolate Draft from the last Published snapshot.
2. [DONE locally] Converge Encyclopedia Product and Care Encyclopedia/Aquarium/Identify diagnosis reads onto the published runtime authority with explicit static fallback.
3. [DONE locally] Prove Product and Care Save→Publish→Preview boundaries with user-state and Compatibility isolation.
4. [DONE] Complete the 14-Species bilingual SEO batch-01 operating cycle on authenticated Preview; 28/28 hosted EN/ZH pages passed acceptance.
5. [DONE] Change Impact Preview: field classification, affected-consumer summary, decision-critical Before/After and Compatibility-result regression checks.
6. [NEXT] Build Compatibility Admin: reviewed Species behavior profiles, Pair Rules, Evidence, Confidence, Review Status and Rule Version.

## Safety
No Production unlock. No blind main merge/rebase. No SEO field may become authority for decision-critical Product Data or Compatibility Rules.

## 2026-09-04 implementation state
Functional checkpoint `d6d2b37e` adds publication snapshots and Draft isolation. Public API routes now prefer the immutable published snapshot, while pre-migration published rows remain a compatibility fallback. The database migration is committed but not applied to Production. Runtime bootstrap now prefers the published Product/Care API; Encyclopedia Product plus Care Encyclopedia/Aquarium/Identify diagnosis consume that runtime catalog. Browser injection acceptance passed for zh-CN Product/Care and English Care. Production migration remains unapplied; the next P0 is a real Admin edit/save/publish → Preview proof.

## 2026-09-04 Product/Care P0 acceptance
- Controlled browser Preview proves Product and Care Save remain invisible until Publish, then advance the intended runtime consumer.
- Care hardcoded display-title overrides were corrected so published Care titles are not masked by legacy presentation maps.
- `aquarium_app_state_v1` remains byte-identical across Admin Save/Publish and before/after user Preview loads.
- Published Product hydration mutates only `runtimeFishData`; static `fishData` used by Compatibility remains unchanged.
- This closes the defined Product/Care P0 target locally. Production migration/deployment remains intentionally untouched.

## 2026-09-04 SEO operational acceptance + CI cost control
- Authenticated batch-01 completed for zh-CN and en: 14 Species × 2 locales, with durable batch scope and 14 Base groups per locale.
- One explicit Staging snapshot publish created commit `7aaeb44e02ce6b82ba35919b081945bf4d0ce1cd`; Production remained locked.
- Hosted deployment `dpl_B86KiBaD75LhGdcHMa6v8zTN6pJM` passed 28/28 page checks for metadata, H1, Product facts, canonical/hreflang, robots, CTA and content hygiene.
- CI is now split into light default checks and gated heavy Golden/Visual/evaluation/browser checks.

## 2026-09-04 Change Impact Preview first round
- `e58c7082` adds field-level impact classification for Product/Care edits.
- The editor distinguishes direct runtime consumers from independent/downstream consumers that require separate review.
- Draft impact uses the current published public detail as baseline and survives page refresh; no new authority/database path was introduced.
- This first-round note is historical; the following completion checkpoint closes Before/After and Compatibility regression. Next milestone is Compatibility Admin.

## 2026-09-04 Change Impact Preview completion
- Functional commit `9dc30c48 feat(admin): complete change impact preview`.
- Decision-critical Product edits now show Encyclopedia current-published vs ready-to-publish Before/After, including temperature, pH, tank size, water-change cycle, temperament, size, housing and feeding fields.
- Saved Product Drafts automatically run the existing species-only Compatibility engine against the current static living-species cohort; status changes and rule-only changes are both surfaced.
- Compatibility regression is explicitly simulation-only: Product publish does not mutate Compatibility evidence/rules.
- Browser regression passes at 1280/390 including save → reload persistence and publish-confirmation summary. Product/Care Save→Publish boundaries, Admin contract/build and root build remain green.
- Next milestone: Compatibility Admin.
