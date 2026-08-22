# AquaGuide — Latest Progress

**Updated:** 2026-08-22  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 (Draft / open / unmerged)  
**Dependency baseline head:** `5c277cec1f99f5bb507b7d50b2018d5d571ef0f1`

## Current phase

**RC1 feature convergence → UI/UX system → Result UX → Layout Recovery → dependency release baseline landed → permanent post-remediation verification now.**

No production merge or deployment has been authorized.

## Dependency-security progress

### Baseline evidence

Original production/full audit:

| Scope | High | Moderate | Low | Total |
|---|---:|---:|---:|---:|
| `npm audit --omit=dev` | 10 | 6 | 2 | 18 |
| full audit | 10 | 6 | 2 | 18 |

This proved the original findings were present in npm's production dependency graph, not merely dev-only noise.

### Landed remediation

- [x] Moved build-only tooling out of root production dependencies.
- [x] Upgraded `react-router-dom` to `^7.18.2`.
- [x] Upgraded root/API `express` to `^4.22.2`.
- [x] Upgraded/reclassified Vite to dev-only `^6.4.3`.
- [x] Advanced transitive DOMPurify lock resolution to patched `3.4.14` in the validated candidate.
- [x] Validated candidate with `npm ci`, TypeScript, and production build.
- [x] Reduced production audit to **0 findings**.
- [x] Preserved remaining full-audit findings as dev/build debt rather than hiding them.
- [x] Used a one-time contents-write applier and self-deleted it in the same landed dependency commit.

Candidate proof: Dependency Release Baseline V1 run `32572924271` — **PASS**.  
Apply proof: Apply Dependency Remediation Once run `32573063116` — **PASS**.

After remediation, full audit remains 12 dev-only findings: 7 high, 2 moderate, 3 low. These are mainly in shadcn/MCP SDK and build-tool chains.

## Product baseline carried forward

Completed before dependency P0:

- [x] deterministic compatibility / stage-risk boundary;
- [x] plant roster edit path;
- [x] decision-first Result UX paths;
- [x] share-report production security contract;
- [x] Layout Recovery for Atlas/Care/Aquarium;
- [x] identification uncertainty/confirmation;
- [x] Tank Copilot authority boundary;
- [x] Care 340px/850px corridor regression fixed without lowering thresholds;
- [x] Aquarium 768px context hierarchy restored without changing phone ordering.

## Current release readiness

### Green / materially closed

- production dependency candidate audit: zero findings;
- dependency candidate install/types/build;
- exact dependency remediation landed to the feature branch;
- temporary write workflow removed;
- earlier product correctness and UI regression baseline established.

### Still required

- [ ] confirm all normal permanent gates green on a post-remediation descendant head;
- [ ] perform #104 → #105 stack convergence only after explicit merge authorization;
- [ ] rerun gates after final retargeted ancestry;
- [ ] verify real production environment/secrets only after deployment authorization;
- [ ] perform production golden-path smoke after authorized deployment;
- [ ] inventory remaining `server/index.mjs` consumers;
- [ ] start Knowledge Engine P0 only after release baseline/stack work is closed.

## Next sequence

1. Finish post-remediation permanent gate proof.
2. Stop dependency churn once production audit remains zero; keep the 12 dev-only findings as a separate tooling debt queue.
3. Await explicit authorization for #104/#105 stack convergence; do not merge on assumption.
4. Production readiness after explicit deploy authorization.
5. Backend Phase 2.
6. Knowledge architecture P0 → P1 → P4 → P2 → P3 → P5.

## Guardrails

- No blind `npm audit fix`.
- No lowering regression thresholds.
- Build/dev audit findings do not become production blockers merely because their severity is high; classify by shipped/runtime reachability.
- Conversely, do not label an `--omit=dev` finding as dev-only without correcting the manifest and validating the resulting production graph.
- AI cannot override deterministic safety rules.
- No deletion of legacy API bridges before consumer proof.
- No production merge/deployment without explicit authorization.
