# AquaGuide Relocation Confirmation Badcases — 2026-08-17

> Living regression record. PR #62/#63/#64/#65 stay Draft/unmerged. Executable Care wiring is being built only on the verified combined canonical branch.

## Existing protected badcases

REL-023…REL-049 remain active. The latest confirmed protections include atomic receipt semantics, fresh revalidation, stable attempt operationId/repository session, no direct Care relocation mutation, canonical display before mirror persistence, and non-dismissible uncertainty until canonical reconciliation succeeds.

## Test infrastructure findings

### TEST-001 — optional-call regex false failure
Fixed test only; product gate unchanged.

### TEST-002 — guessed parent verifier filename
Fixed by reusing PR #64 canonical verifier.

### TEST-003 — Care hydration regression coupled to source-line adjacency
Run `31962863527` stopped because the static test required `appState` initialization and `subscribeToAppState` to be adjacent. The new canonical override state legitimately sits between them. Test was changed to capability assertions; rerun `31963027394` confirmed Care hydration is green.

## TYPE-001 — mirror-result false branch is not explicitly discriminated

**Observed in Care wiring rerun `31963027394`:** all relocation/canonical/hydration/severe-risk gates passed, then app TypeScript failed with:

`Property 'errorMessage' does not exist on type 'CareCanonicalAquariumApplyResult'`.

The helper deliberately returns a strict union:

- `mirrorPersisted: true` → has `mirrorState`
- `mirrorPersisted: false` → has `errorMessage`

The Care patch used:

`if (applied.mirrorPersisted) { ... } else { applied.errorMessage }`

The current TypeScript configuration did not accept the truthiness `else` as sufficiently narrowed to the false literal branch.

**Classification:** integration type-boundary issue. This is not evidence against REL-049 behavior; the helper regressions and page static contract were already green.

**Forbidden fixes:**
- do not add `any`;
- do not make `errorMessage` optional on the success branch;
- do not weaken `mirrorPersisted` from literal `true | false` to generic boolean;
- do not throw mirror errors just to simplify the type.

**Required fix:** use explicit literal discrimination, preferably handle `applied.mirrorPersisted === false` first, log the false-branch `errorMessage`, retain canonical React override, and return from the mirror-sync helper path. The true branch may then safely access `mirrorState` and release the canonical override.

**Status:** patch-script correction required; JSX wiring is still unpersisted because the one-shot run stopped before commit.

## Current verified baseline

- #65 isolated `31961532732`: green.
- disposable #62 + #65 audit `31961690289`: green.
- canonical bootstrap `31962121116`: green.
- Care controller `31962344545`: green.
- reconciliation lifecycle `31962635712`: green.
- Care wiring run `31962863527`: new wiring gates green through uncertainty; TEST-003 stopped run.
- Care wiring rerun `31963027394`: wiring/mirror/controller/confirmation/entrypoint/fresh/uncertainty/hydration/severe-risk all green; TYPE-001 stopped app TypeScript before API TS/build/commit.

## Remaining Care executable-layer exit gate

- fix TYPE-001 without weakening result types;
- rerun exact-anchor Care wiring from unpersisted pre-wiring state;
- require app/API TypeScript + production build green;
- self-delete one-shot write tooling only after full green;
- verify persisted Care page still contains no direct relocation mutation call;
- then add browser Golden Path for open → confirm → fresh block/success/reconcile;
- keep handoff/badcase updated as failures are found.
