# AquaGuide Relocation Confirmation Badcases — 2026-08-17

> Living regression record. PR #62/#63/#64/#65 stay Draft/unmerged. Care executable wiring is now persisted on the verified combined canonical working branch, but browser/hosted acceptance is still outstanding.

## Protected relocation badcases

REL-023…REL-049 remain active and are now backed by the persisted Care flow where applicable:

- REL-023 — committed RPC + failed post-read cannot look like mutation failure.
- REL-024 — rejected mutation transport may be post-write: same operationId, reconcile first.
- REL-025 — displayed/submitted quantity share one source.
- REL-026 — confirmation UI cannot import repository/API/Supabase directly.
- REL-027 — fresh blocked result cannot become success UI.
- REL-028 — uncertain state has no blind relocation retry.
- REL-029 — completed confirmation cannot execute again.
- REL-030 — blocked stale proposal needs a new evaluation.
- REL-031 — request IDs authoritative; names display-only.
- REL-032 — unexpected callback error reconciles conservatively.
- REL-033 — isolated green requires canonical integration audit.
- REL-034 — multi-record whole-subject cannot pick first record.
- REL-035 — multi-batch whole-subject cannot pick first batch.
- REL-036 — rendered destination verdict cannot become cached mutation authorization.
- REL-037 — resolved/record/batch/formal quantities must agree.
- REL-038 — no explicit batch means no invented executable batch.
- REL-039 — exactly one positive batch required.
- REL-040 — operationId generated once per opener-created attempt, not render.
- REL-041 — reconciliation cannot send a second mutation/new operationId.
- REL-042 — Care page cannot call `repository.relocateLivestock()` directly.
- REL-043 — fresh loader must use repository `getAquariums()`, not React/local mirror.
- REL-044 — executed/reconciled canonical state must refresh visible Care decisions immediately.
- REL-045 — idle cancel and terminal attempt lifecycle cannot be conflated.
- REL-046 — executable wiring must live on intentional canonical combined tree.
- REL-047 — one attempt uses one successfully resolved repository instance.
- REL-048 — uncertainty/post-state-unavailable dialog cannot close before canonical reconciliation.
- REL-049 — compatibility-mirror persistence failure cannot reclassify canonical success.

## Test / type findings resolved

### TEST-001 — optional-call regex false failure
Resolved test-only; no product gate was relaxed.

### TEST-002 — guessed parent verifier filename
Resolved by reusing PR #64 canonical confirmation verifier.

### TEST-003 — Care hydration test coupled to source-line adjacency
Resolved by capability-based assertions. Run `31963163536` confirms direct Care hydration, mirror subscription, canonical override and severe-risk remain green.

### TYPE-001 — mirror-result false branch not explicitly discriminated
Resolved without weakening types. Care now checks `applied.mirrorPersisted === false` before using `errorMessage`; success branch accesses `mirrorState`. App/API TypeScript and build are green.

## Persisted Care wiring verification

Working branch:

`agent/canonical-care-relocation-wiring`

Persisted Care wiring commit:

`9403663c371b8cfa824c92d843a1f57d9b6cbf3e`

Full one-shot run `31963163536`: **GREEN**.

Passed:
- verifier red before patch;
- exact Care patch;
- page wiring static contract;
- canonical-view/mirror-fallback regression;
- attempt controller;
- reconciliation lifecycle;
- entrypoint;
- fresh execution policy;
- mutation uncertainty;
- Care hydration;
- severe-risk;
- App TypeScript;
- API TypeScript;
- production build;
- self-delete of one-shot workflow/patch script;
- verified branch commit/push.

This closes the static/logic/type/build Care executable-layer exit gate. It does **not** close rendered-browser or hosted acceptance.

## New browser acceptance badcases

### REL-050 — opening confirmation mutates immediately
**Failure:** CTA click itself triggers controller `execute()` or repository write before the user presses confirm.

**Required browser proof:** opener displays confirmation facts with mutation count 0.

### REL-051 — rapid/double confirm creates two mutations
**Failure:** two UI clicks race before disabled/checking state renders.

**Required browser proof:** controller promise cache + dialog checking state result in exactly one mutation request.

### REL-052 — rendered stale destination still moves after target changed
**Failure:** user sees compatible card, target facts change, then confirm uses old card verdict.

**Required browser proof:** fresh blocked UI appears and mutation count stays 0.

### REL-053 — success state renders but conflict cards remain pre-move
**Failure:** canonical post-state is correct internally, but rendered Care graph/options remain stale until reload.

**Required browser proof:** after successful confirm, rendered source/destination decision surface reflects post-action canonical state without navigation/reload.

### REL-054 — Escape/overlay closes uncertainty dialog despite REL-048 logic
**Failure:** component source looks locked, but Radix/browser behavior still dismisses the rendered dialog.

**Required browser proof:** after `mutation_state_unknown` or post-state-unavailable, Escape and overlay click do not close; only sync is available.

### REL-055 — reconciliation visually unlocks before canonical read completes
**Failure:** sync click closes/unlocks immediately while repository read is still pending or failed.

**Required browser proof:** dialog stays locked while syncing/failure, successful canonical read renders reconciled state, only then Close works.

### REL-056 — browser test uses local harness and is incorrectly treated as hosted/Supabase acceptance
**Failure:** deterministic local/mock browser test passes and team claims real cloud relocation is validated.

**Required:** browser harness and hosted/Auth acceptance remain separate gates in documentation and PR copy.

### REL-057 — eligible browser fixture bypasses real source-scope builder
**Failure:** test directly opens the confirmation component with a synthetic request, never proving the user path from intervention card through #65 entrypoint.

**Required:** at least one Golden Path begins at rendered intervention/destination card and clicks the actual `进入迁移确认` CTA.

### REL-058 — multi-record/multi-batch case silently hides why execution is unavailable
**Failure:** source-scope fails closed in code, but rendered user only sees no button and cannot understand why.

**Required browser proof:** deterministic limitation text is visible for representative multi-record/multi-batch fixture.

## Browser Golden Path exit gate

Before the working branch can move to hosted acceptance:

- GP-REL-01 eligible rendered intervention → opener → correct four confirmation facts; zero mutation before confirm;
- GP-REL-02 success + rapid-double-click → exactly one mutation and visible canonical post-state refresh;
- GP-REL-03 target changes after render → fresh blocked UI, zero mutation;
- GP-REL-04 uncertain mutation → non-dismissible sync-only recovery; reconciliation sends no second mutation and unlocks after canonical read;
- GP-REL-05 multi-record/multi-batch source-scope fail-closed limitation visible;
- browser tests exercise actual Care/intervention/confirmation path, not only isolated component requests;
- deterministic browser harness result is explicitly separated from real hosted/Auth/Supabase acceptance;
- handoff/badcase updated immediately for any new browser failure.
