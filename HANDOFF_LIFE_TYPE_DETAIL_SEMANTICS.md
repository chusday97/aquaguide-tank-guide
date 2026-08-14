# Life-type detail semantics handoff — 2026-08-14

- Branch: `fix/life-type-detail-semantics`
- Base: `fix/non-animal-species-fit` / PR #31
- Scope: species-detail UI semantics only; do not merge phase-2 catalog dedupe into this work.
- Root cause: `SpeciesDetailDialog` contained a second livestock-oriented fit assessor after the canonical `speciesFitEngine` had already been made life-type aware.
- Structural fix: preserve the previous animal detail implementation byte-for-byte as `SpeciesDetailDialogLegacy.tsx`; route only `plant` and `hardscape` to `NonAnimalSpeciesDetailDialog.tsx`.
- Plant/hardscape detail consumes `evaluateSpeciesForAquarium()` and does not use fish-style tank volume, housing mode, compatibility calculator, sex-identification, or memorial/death semantics.
- New permanent gate: `scripts/test-life-type-detail-semantics.ts` runs inside Product Golden Path.
- Validation still required at handoff time: TypeScript, build, responsive route smoke, and GP-001/GP-002 on the branch.
