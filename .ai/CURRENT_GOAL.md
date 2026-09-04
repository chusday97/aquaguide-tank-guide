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
6. [IN PROGRESS] Compatibility Admin: Profile + Pair Draft workflows and explicit human Review/Approve with server structural Impact Check are DONE locally; [NEXT] converge reviewed Compatibility publish authority with runtime, then add versioned publish + engine regression gate.

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

## 2026-09-04 Compatibility Admin — Behavior Profile Draft checkpoint
- Functional commit `dfed5a94 feat(admin): add compatibility profile draft workflow`.
- `/admin/compatibility` audits the exact 7 reviewed static Profiles / 4 reviewed Pair Rules currently used by the Compatibility engine.
- Species Behavior Profile edits now use isolated `species_compatibility_profile_revisions`; create/update/submit-review never mutate `species_compatibility_profiles`.
- Drafts inherit reviewed citation snapshots only; reviewed publish is intentionally unavailable until source reconciliation and human review are implemented.
- API reports which catalog keys already have reviewed DB baselines; profiles without DB alignment remain read-only instead of failing after click.
- Migration `202609040002_compatibility_profile_revisions.sql` is committed but NOT applied to Production or any live database in this round.
- 390/1280 browser contract proves create Draft → edit → save → submit review → edit lock. API check, root lint/build, compatibility contracts and diff hygiene pass.
- Next: Pair Rule revision Draft workflow; keep reviewed runtime and Production locked.

## 2026-09-04 Compatibility Admin — Pair Rule Draft checkpoint
- Functional commit `4c9ec12e feat(admin): add compatibility pair rule draft workflow`.
- Reviewed Pair Rules now support isolated revision Draft create/edit/submit-review when the exact DB pair baseline is aligned.
- Draft fields cover verdict, risk type, reason, mitigation, basis, confidence and reviewed citation snapshots; same-species pairs are rejected.
- One active Pair Rule revision per canonical pair is enforced; reviewed runtime rows are never updated by Draft routes and no Compatibility publish endpoint exists yet.
- Browser acceptance passes at 1280/390 for create → edit → save → submit-review → edit lock. A Zod refine/omit runtime crash found during acceptance was corrected at the contract layer.
- Migration `202609040003_compatibility_pair_rule_revisions.sql` is repository-only and unapplied to live databases/Production.
- Next: reviewed rule versioning + human approval + regression/impact gate before any Compatibility publish path is introduced.

## 2026-09-04 Compatibility human review / impact checkpoint
- Functional commit `25e3ec0d feat(admin): add compatibility human review gate`.
- Submitting a Profile/Pair Draft now makes the API compare it with the current reviewed DB baseline and persist an impact report; no-change drafts cannot enter review.
- `pending_review` revisions can only move to Approved/Rejected through an explicit authenticated human action; Reject requires a note.
- Approval changes revision status only and never updates reviewed runtime rows.
- Browser 1280/390 proves submit → Impact Check → approve → Approved while editing remains locked.
- Migration `202609040004_compatibility_revision_review_gate.sql` is code-only/unapplied.
- Remaining blocker before publish: user-facing Compatibility still reads code/data reviewed evidence, so DB publish would create split authority.
