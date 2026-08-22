# AquaGuide — Latest Progress

**Updated:** 2026-08-22  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 (Draft / open / unmerged)  
**Latest fully verified product-code head:** `e4068dc805422ed4bf797d5223ad0bdd44c2835f`

## Current phase

**RC1 feature convergence → UI/UX system → Result UX → Layout Recovery → dependency release baseline CLOSED → Tank Copilot usefulness repair CLOSED for tested failure modes → live AI evaluation + stack convergence next.**

No production merge or deployment has been authorized.

## Verification status

| Gate | Result | Run |
|---|---|---:|
| Production Security Boundary V1 | PASS | 32573927291 |
| Dependency Release Baseline V1 | PASS | 32573927275 |
| Compatibility Stage Risk V1 | PASS | 32573927293 |
| Plant Roster Edit Fix | PASS | 32573927318 |
| Result UX V1 | PASS | 32573927306 |

Result UX additionally passed the new permanent `Tank Copilot usefulness contract`, TypeScript/build, and the full browser chain through Tank Copilot.

## PUI-BC-059 — completed for repository-level failure modes

- [x] Added a usefulness regression rather than relying on schema validity.
- [x] Captured true fail-before: Result UX run `32573810707` failed when a model returned zero candidates despite a deterministic safe pool.
- [x] Prevented `restart_goal` from becoming the primary action when a ready tank already has usable local candidates.
- [x] Restored deterministic missing-fact questions when the model asks only preference questions.
- [x] Kept all recovered candidates inside the local safe/adjustable pool.
- [x] Strengthened Tank Copilot prompt to require concrete candidate/quantity planning and prohibit generic workflow filler.
- [x] Required adjustable/caution recommendations to carry their required adjustments.
- [x] Self-removed temporary write workflow after validation.
- [x] Re-ran all five permanent gates on a normal user-authored descendant head; all passed.

Fix lineage:

- policy: `ef843ef384d09cb79d8ac7df62372e21db0241e8`
- prompt + self-cleanup: `4814e8a0b565f18d9bde7623fd4ebda68049f988`
- normal full-verification head: `e4068dc805422ed4bf797d5223ad0bdd44c2835f`

## What remains unsolved about AI

Repository tests now block known non-actionable structured outputs, but they do not measure live-provider quality. Still required before production:

- [ ] run real configured-provider cases rather than only mocks/fixtures;
- [ ] cover broad vs specific user goals;
- [ ] cover missing tank facts;
- [ ] cover safe / adjustable / no-candidate scenarios;
- [ ] measure invalid JSON, timeout/network fallback, contradiction and generic-answer rates;
- [ ] define a usefulness acceptance rubric instead of judging prose subjectively.

The target is not “AI sounds smart”. A result is usable only when it correctly identifies missing blocking facts or advances the user to a valid local candidate/action without inventing facts or weakening deterministic safety.

## Dependency-security P0 — still closed

- production audit: 0 findings;
- full audit: 12 dev-only findings = 7 high / 2 moderate / 3 low;
- permanent dependency gate remains active and read-only.

## Product baseline carried forward

- [x] deterministic compatibility / stage-risk boundary;
- [x] plant roster edit path;
- [x] decision-first Result UX;
- [x] share-report production security contract;
- [x] Layout Recovery for Atlas/Care/Aquarium;
- [x] identification uncertainty / explicit confirmation;
- [x] Tank Copilot authority boundary;
- [x] Tank Copilot usefulness guard for empty-candidate and missing-fact failure modes.

## Still required

1. Live AI evaluation set and configured-runtime smoke.
2. #104 → #105 stack convergence after explicit merge authorization.
3. Full gate rerun after final retargeted ancestry.
4. Production env/secrets + golden-path smoke after deployment authorization.
5. Legacy `server/index.mjs` consumer inventory and one-at-a-time Phase 2 migration.
6. Knowledge Engine only after release/stack foundation is stable.

## Guardrails

- Schema-valid AI output is not automatically product-valid.
- AI cannot override deterministic safety rules.
- Required factual gaps outrank preference questions.
- Do not let model emptiness erase deterministic safe candidates.
- Do not use mocks as proof of live-provider quality.
- No blind dependency fixes, regression-threshold lowering, legacy bridge deletion, main merge or production deployment without the corresponding evidence/authorization.
