# AquaGuide Handoff — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Base:** `agent/uiux-system-refactor-v1` (#104)  
**Latest clean six-consumer baseline:** `6d311ed18fde2241a9aa27400809634155921fa6`

## Current state

PR #105 remains **open, mergeable and Draft**. It is not merged and no production deployment is claimed.

Browser-verified Result UX consumers:

1. Diagnosis — DONE
2. Compatibility — DONE
3. Knowledge — DONE
4. Procedure — DONE
5. Species Detail — DONE
6. Identification — DONE

Authoritative clean verification on `6d311ed18fde2241a9aa27400809634155921fa6`:

- Result UX V1 / run `32357720875` — **PASS**
  - static Result UX contract;
  - TypeScript;
  - production build;
  - Diagnosis browser regression;
  - Compatibility browser regression;
  - Knowledge browser regression;
  - Procedure browser regression;
  - Species Detail + exact parent-context browser regression;
  - Identification uncertainty + explicit-confirmation browser regression;
  - evidence artifact upload.
- Plant Roster Edit Fix / run `32357720873` — **PASS**
  - plant contract;
  - TypeScript / production build;
  - plant quantity + edit browser regression;
  - existing Navigation Context regression.
- Compatibility Stage Risk V1 / run `32357720857` — **PASS**
  - same-species stage-risk contract;
  - life-stage capture UI contract;
  - legacy compatibility regression;
  - TypeScript / production build;
  - adult-control → fry-treatment browser regression.

## Species Detail closure

Species Detail now consumes the shared decision-first surface while retaining inherited PUI-BC-052.

Closure contract:

- tank-fit result is the first decision surface;
- `data-species-detail-primary-action` exposes one primary CTA;
- Aquarium-owned details preserve `data-species-detail-edit-tank-record`;
- key reasons/evidence are collapsed behind progressive disclosure;
- closing Species Detail reopens the exact originating livestock roster;
- focus returns to the originating profile opener;
- workspace scroll is restored within the existing 96px tolerance.

Key commits:

- `0e7f1dd1e2b8850d473d97f166579f5803889ccd` — product migration;
- `d4e325ad05206f3850ce1845f27ea2e09c32f975` — permanent contract / cleanup.

## Identification closure

Identification keeps AI recognition explicitly uncertain until the user confirms one candidate.

Closure contract:

- candidate review uses `identify-decision` and explicit `NEEDS CONFIRMATION / 需要你确认` framing;
- ambiguous recognition preserves multiple candidates;
- no candidate is auto-promoted to confirmed identity;
- explicit candidate buttons continue through `confirmFish`;
- confirmed state is species-bound via `data-identify-confirmed={selectedFish.id}`;
- candidate review and confirmed identity remain separate stages;
- health triage remains a separate explicit action and never auto-starts after identification.

The final red CI was an evaluator defect, not a product-flow defect: the test waited for the stale literal `物种已确认` while the product rendered `已确认物种`. The repaired browser test now verifies semantic confirmed state rather than translated copy.

Key commits:

- `95538f6cc23afc6e9dc6d3156c489647ca3cb45d` — Identification decision-first product migration;
- `4f2fa3fa9aa41889b124b1c8097e4fe106c8ea26` — stable confirmed-state contract;
- `6d311ed18fde2241a9aa27400809634155921fa6` — permanent read-only cleanup.

## Shared Result UX contract

`src/components/result/DecisionResultSurface.tsx` provides:

- one verdict / primary action / first operational step;
- maximum two follow-up actions;
- compact watch / escalation guardrails;
- compact avoid list;
- bounded hero explanation;
- reasoning and sources behind progressive disclosure;
- reviewed vs candidate evidence state.

Evidence remains fail-closed and action-scoped. A publisher/source name alone never upgrades a recommendation to Verified.

## AI consumer clarification

The final live AI consumer is the **AI Tank Copilot embedded in `src/pages/Aquarium.tsx`**.

`src/pages/AIAssistant.tsx` still exists as legacy/unrouted code, but `App.tsx` exposes no route for it and `taskRoutes` has no assistant entry. Do **not** resurrect that dead page as part of Result UX V1 unless product scope is explicitly changed.

README defines the implemented AI capability as AI Tank Copilot and states the governing boundary: deterministic rules own safety-critical decisions; AI explains, organizes and asks bounded follow-ups without overriding compatibility or risk decisions.

The live Copilot already has important safety plumbing:

- `sanitizeTankCopilotResponse` restricts candidate IDs to the deterministic local candidate pool;
- model-generated missing questions are constrained to locally allowed information keys;
- executable actions are allowlisted and labels are local-fixed;
- model actions are capped;
- local fallback remains available.

The remaining Result UX task is therefore presentation/hierarchy: direct actionable result first, bounded follow-ups, explanation behind disclosure, and visible AI-vs-rule authority boundaries.

## Vercel deployment policy

`vercel.json` has `git.deploymentEnabled: false`.

GitHub Actions remains the iterative validation layer. Hosted Preview and Production are explicit milestone actions only. Do not re-enable per-commit Vercel Git deployment during active repair work.

## Inherited contracts that must remain intact

- PUI-BC-050 Compatibility risk-review/navigation semantics;
- PUI-BC-051 Search deep-result return context;
- PUI-BC-052 Aquarium roster → Species Detail → exact parent roster return, including relevant scroll/focus context;
- PUI-BC-053 remains closed as an evaluator fixture re-seeding defect, not a product persistence regression.

## Engineering debt / non-blockers

- npm audit currently reports 18 vulnerabilities (2 low, 6 moderate, 10 high); do not blindly run `npm audit fix`;
- mixed dynamic/static Vite imports for `fishData` and `careTopicsData` remain;
- large chunks remain (`react-three-fiber` ~889 KB; main index ~2.12 MB / gzip ~475 KB);
- thin wrapper/Base structures inherited from #104 remain deliberate risk-containment debt.

## Next owner action

1. Add a fail-before browser contract for the **live Aquarium AI Tank Copilot**, not the unrouted legacy `AIAssistant.tsx`.
2. Acceptance must prove direct answer/primary action first, at most two follow-ups, explanation behind disclosure, and explicit AI-assistance authority boundaries.
3. Preserve `sanitizeTankCopilotResponse` and deterministic candidate/action restrictions; Result UX must not weaken them.
4. After Copilot migration, run the combined permanent Result UX + Plant/Navigation + lifecycle gates on one clean read-only head.
5. Then perform final upstream/integration/production-readiness closure. Keep #105 Draft until that point.
