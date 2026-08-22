# AquaGuide — Latest Progress

**Updated:** 2026-08-22  
**Sync branch:** `agent/rc1-post-107-release-sync`  
**Release candidate branch:** `integration/aquaguide-rc1`  
**Current RC1 head:** `1e455a82a6542b7a8fb684c69da06221ef6bdba0`


## Latest production / Aquarium visualization progress

- [x] #109 merged to RC1; legacy Vercel function bundle bloat fixed in RC1.
- [x] RC1 `1e455a82...` release matrix re-proven 9/9 PASS.
- [x] PUI-BC-060 root cause isolated: fake default substrate + grain-mesh rendering semantics.
- [x] #110 candidate renders substrate as an explicit continuous tank-bottom surface.
- [x] Browser run `32579071402` proves Tank Settings → select `黑金沙` → repository save → 3D `data-substrate="黑金沙"`.
- [ ] #110 merged to RC1 — not authorized / not done.
- [ ] final Vercel deployment for #110 cleanup-only head — blocked by Hobby build-rate-limit, not a code failure; product-equivalent preview `fa41972e...` is READY.

## Current phase

**#104 merged → #105 merged → #107 evaluator repair merged → real RC1→main release matrix 9/9 PASS → RC1 code/regression clean → production readiness next.**

No merge to `main` and no production deployment has been performed.

## Stack convergence

- [x] #104 merged to RC1 via `2f07075e447778ea37229ca07ef485d8c0686d9c`.
- [x] #105 merged to RC1 via `e5a9dd1ccc18a296075521fdd01b0407341af617`.
- [x] #107 merged to RC1 via `8d506fae4b165fdd4aed5f7a04101dc16d5d7d7f`.
- [x] Actual RC1→main acceptance re-proven on final RC1 ancestry.
- [ ] RC1 merged to `main` — not authorized / not done.
- [ ] Production deployment — not authorized / not done.

## Final RC1→main verification matrix

| Gate | Result | Run |
|---|---|---:|
| RC1 Release Acceptance | PASS | 32576580996 |
| Product Golden Path | PASS | 32576580976 |
| UI Interaction Repair V1 | PASS | 32576580968 |
| UI UX System Refactor V1 | PASS | 32576580986 |
| UI UX Visual QA V2 | PASS | 32576580966 |
| UI UX Golden V3 | PASS | 32576581069 |
| UI V2 Aquarium | PASS | 32576580983 |
| Navigation Context V1 | PASS | 32576580972 |
| Bundle Audit V1 | PASS | 32576580993 |

### Critical browser closure

- [x] GP-001 first-tank setup
- [x] GP-002 species → in-context compatibility evidence → explicit calculator entry → explicit selection → quantity ×6 → persisted aquarium write
- [x] GP-003 returning-user Daily Check
- [x] GP-004 abnormal Care
- [x] GP-005 Collection context
- [x] UI interaction browser regression
- [x] responsive route scan
- [x] Aquarium visual hierarchy
- [x] Golden V3 baseline

## EVAL-BC-002 — CLOSED for RC code/regression

Fail-before after #105:

| Gate | Result | Run |
|---|---|---:|
| RC1 Release Acceptance | FAIL | 32575093543 |
| UI Interaction Repair V1 | FAIL | 32575093548 |
| Product Golden Path | FAIL | 32575093550 |

Repair discipline:

- [x] classified failures before touching product runtime;
- [x] migrated canonical API source marker to current app ownership;
- [x] migrated Species Detail / Encyclopedia assertions to current wrapper/Base ownership;
- [x] migrated removed Compatibility DOM markers to `DecisionResultSurface` semantics;
- [x] preserved result-first ordering, Unknown != Safe, inline AI explanation, browsing-not-selection and exact return-context contracts;
- [x] updated GP-002 to the intentional two-stage evidence → calculator flow;
- [x] kept thresholds intact;
- [x] targeted diagnostic `32575689962` passed before merge;
- [x] #107 merged;
- [x] actual RC1→main release matrix passed after merge.

## Permanent product/security baseline

Latest #107 pre-merge permanent gates:

| Gate | Result | Run |
|---|---|---:|
| Production Security Boundary V1 | PASS | 32576188012 |
| Dependency Release Baseline V1 | PASS | 32576188054 |
| Compatibility Stage Risk V1 | PASS | 32576188009 |
| Plant Roster Edit Fix | PASS | 32576188004 |
| Result UX V1 | PASS | 32576188011 |

Dependency status:

- production audit: **0 findings**;
- developer/build graph: **12 dev-only findings** = 7 high / 2 moderate / 3 low;
- do not use broad `npm audit fix` simply to chase total count to zero.

## AI usefulness baseline

PUI-BC-059 remains closed for encoded repository-level cases:

- [x] schema-valid is not treated as sufficient;
- [x] deterministic safety remains authoritative;
- [x] missing blocking tank facts outrank subjective preference chatter;
- [x] model empty selection cannot erase deterministic safe/adjustable candidates;
- [x] unnecessary `restart_goal` is rejected when executable candidates exist;
- [x] prompt requires concrete candidate/quantity planning.

Still required before production:

- [ ] representative live-provider cohort;
- [ ] generic-answer rate;
- [ ] candidate-drop rate;
- [ ] hallucinated-preference rate;
- [ ] contradiction handling;
- [ ] invalid JSON recovery;
- [ ] timeout/network fallback behavior.

## Product baseline carried forward

- [x] deterministic compatibility / stage-risk authority boundary;
- [x] plant roster edit;
- [x] decision-first Result UX;
- [x] share-report server-secret boundary;
- [x] Care wide-desktop layout recovery;
- [x] narrow-desktop Aquarium `Today → Context → Manage` hierarchy;
- [x] phone task-first hierarchy preserved;
- [x] identification uncertainty / explicit confirmation;
- [x] Species Detail browsing separated from compatibility selection;
- [x] exact return context across cross-route tasks;
- [x] Tank Copilot authority + usefulness guards.

## Release classification

**Repository / RC acceptance:** CLEAN.  
**Production acceptance:** NOT YET PROVEN.

Do not treat preview/build/CI green as proof that real Supabase, Auth, Resend, AI provider or deployed Vercel routing are configured correctly.

## Next sequence

1. Freeze RC1 from unrelated feature changes.
2. Run a representative live Tank Copilot usefulness cohort.
3. Produce production environment/secrets readiness matrix.
4. After explicit deployment authorization, deploy RC1 and run real `RC1 Post-Deploy Smoke`.
5. Run production golden paths on the actual URL.
6. Only then make the separate RC1→`main` release decision.
7. Legacy `server/index.mjs` Phase 2 consumer inventory/migration.
8. Knowledge Engine after production foundation is stable.

## Guardrails

- Code/regression clean is not production-ready.
- AI cannot override deterministic safety rules.
- Source-contract failures must be classified before modifying product code.
- Browser evidence outranks assumptions from file layout.
- Do not weaken visual/browser thresholds to make CI green.
- Do not merge RC1 to `main` or deploy production without explicit authorization.
