# RC1 + Final UI Reconciliation Plan

Updated: 2026-08-25

## Goal

Produce one unified AquaGuide RC1 that preserves the accepted interactive UI while consuming the latest deterministic decision and production layers.

## Source roles

- UI donor/base: `codex/interactive-parity-v3` @ `a3f1664`
- Logic/runtime donor: `integration/aquaguide-rc1` @ `895f2f3`
- Working branch: `reconcile/final-ui-rc1-v1`

## Migration order

1. Deterministic domain foundation
   - Compatibility Product Truth
   - Whole-Tank Feasibility
   - Tank State Engine
   - Water Change Engine
2. Authority adapters
   - Tank Evidence Adapter
   - Existing Tank Current State presentation
   - Water Change decision adapter
3. Recommendation authority
   - remove temperament-weighted load authority
   - remove keyword minimum-group authority
   - remove static `housingMode` prefilter hard-block
   - canonical Compatibility owns `blocked`
4. Preserve UI shell and interaction
   - Aquarium immersive stage
   - Detail / Task / Blocking / Media surfaces
   - Collection creature-first navigation
   - Encyclopedia / Care workspace behavior
5. Production/runtime reconciliation
   - Vercel ESM boundary
   - API/runtime contracts
   - repository/env acceptance
6. Final visual + golden-path acceptance

## Stage 1 completed in working tree

- Imported RC1 bioload / Tank State / Water Change domain rules.
- Imported canonical Compatibility + Whole-Tank types/engine/evidence support.
- Integrated Recommendation authority corrections without deleting Interactive Discovery.
- Integrated Tank Evidence Adapter and Current Tank State presentation into the old UI Aquarium surface.
- Integrated Water Change decision adapter into the old UI Aquarium surface.
- Replaced static `blockingCompatibilityRisk` ownership of Today Action with Current Tank State ownership.
- Extended lifecycle type support to `fry / juvenile / subadult / adult` required by current evidence.

## Stage 1 acceptance

- P0 Compatibility: 5/5 PASS
- Whole-Tank Feasibility: 7/7 PASS
- Tank State Engine: 11/11 PASS
- Tank Evidence Adapter: PASS
- Existing Tank Authority: PASS
- Water Change Engine: 8/8 PASS
- Water Change Authority: PASS
- TypeScript: PASS
- Production build: PASS

## Remaining reconciliation

- finish Current Tank State watch/unknown Today Action parity with RC1;
- finish Water Change presentation copy and maintenance labels;
- run old UI runtime matrix against the unified branch;
- port Recommendation #134/#135 permanent regression tests;
- port Vercel ESM / release runtime contracts without changing UI;
- compare Aquarium, Encyclopedia, Collection, Care, Identify, Settings at 390 / 768 / 1024 / 1440;
- user human visual acceptance before declaring unified UI PASS.

## 2026-08-25 02:29 +0800 — Post-baseline requirement recovery V1
- `UI_REQUIREMENT_LEDGER.md` added as chronological requirement authority.
- UI-006..UI-010 recovered and regression-protected.
- Old `.interactive-tank-shell` page-matrix anchor is superseded by `[data-interactive-atlas]`.
- Next reconciliation target: Mobile Species Detail first-viewport information density / CTA reachability.

## 2026-08-25 13:38 +0800 — Stage 2 UI recovery checkpoint
- UI-011 Species Detail authority presentation reconciled: canonical rule buckets own decision evidence; heuristic/context metrics are reference-only.
- UI-012 Mobile Species Detail first viewport reconciled: verdict and CTA precede feeding/reference detail; browser regression PASS.
- UI-005 Collection semantic reconciliation implemented: later creature-first navigation is retained while the earlier accepted focus-carousel interaction is restored.
- Collection keeps four desktop creature nodes and compact mobile creature shortcuts; center focus additionally supports adjacent peeks, arrows, dots, spring motion, and drag/swipe.
- Runtime evidence: Collection creature-navigation PASS, focus-carousel PASS, Species Detail UI PASS, Species Detail authority PASS, page matrix 28/28 PASS, TypeScript PASS, production build PASS.
- Next UI target: UI-013 Aquarium hierarchy visual/state audit. Production runtime reconciliation remains after UI requirement recovery.
- Human acceptance is still separate: UI-005 stays VERIFY until the user accepts the visible Collection result.

## 2026-08-25 14:20 +0800 — Atlas semantic-reconciliation correction
- Donor recency is not UI authority: the 2026-08-23 RC1 `InteractiveSpeciesAtlas` re-entry must not replace the accepted 2026-08-21 `SpeciesSceneAtlas` interaction line.
- Restored canonical scene behavior from the final interactive UI branch while keeping later mobile Search/Toolbar and deterministic authority fixes.
- Acceptance gates now target SpeciesSceneAtlas: discovery batch, transparent assets, dock overlay, explicit Browse/Compatibility separation, and one mobile Encyclopedia toolbar.
- PUI-BC-062 protects this rule.

## 2026-08-25 14:31 +0800 — Atlas observation-state reflow
- Recovered the 2026-08-22 user-specific Atlas rule from Draft PR #112: full scene -> explicit profile intent -> narrowed left scene + right detail -> close restores exact scene.
- Implemented with current canonical `SpeciesSceneAtlas` and current canonical Species Detail Rail; did not restore the obsolete RC1 inline knowledge implementation.
- This scoped Atlas exception supersedes the generic 'do not squeeze background' Rail rule only for the post-CTA observation state.
- Runtime gate: `test:interactive-atlas-detail-reflow` PASS at 1440/1024 plus phone bottom-sheet check.
