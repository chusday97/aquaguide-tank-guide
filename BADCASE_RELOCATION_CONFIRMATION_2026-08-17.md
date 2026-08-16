# AquaGuide Relocation Confirmation Badcases — 2026-08-17

> Living regression record. PR #62/#63/#64/#65 stay Draft/unmerged. Executable Care wiring is being built only on the verified combined canonical branch.

## Existing protected badcases

- REL-023 — committed RPC + failed post-read cannot look like mutation failure.
- REL-024 — rejected mutation transport may be post-write: preserve operationId and reconcile.
- REL-025 — displayed/submitted quantity share one source.
- REL-026 — confirmation UI cannot import repository/API/Supabase directly.
- REL-027 — fresh blocked result cannot become success UI.
- REL-028 — uncertain state has no blind relocation retry.
- REL-029 — completed confirmation cannot execute again.
- REL-030 — blocked stale proposal needs a new evaluation.
- REL-031 — request IDs authoritative; names display-only.
- REL-032 — unexpected callback error reconciles conservatively.
- REL-033 — isolated green requires canonical integration audit.
- REL-034…REL-039 — PR #65 multi-record/multi-batch/missing-batch/quantity/cached-verdict protections remain green.

## Care executable-layer badcases

### REL-040 — operationId regenerated during render
**Fix:** controller creates operationId once from the opener event. Regression green.

### REL-041 — reconciliation sends a second mutation/new operationId
**Fix:** controller `reconcile()` is canonical read-only; unknown outcome preserves attempt identity. Regression green.

### REL-042 — Care JSX/page handler calls `repository.relocateLivestock()` directly
**Current wiring contract:** Care only creates the controller; mutation remains reachable solely inside the #63 injected callback. Static page verifier passed in the one-shot runner.

### REL-043 — “fresh” loader returns React/local mirror state
**Fix:** controller pre/post loads use repository `getAquariums()`. Fresh destination degradation produces zero writes. Regression green.

### REL-044 — success leaves Care decision state stale
**Confirmed and addressed in wiring design:** executed/reconciled canonical aquarium lists are applied directly to the Care-visible state before compatibility-mirror persistence.

### REL-045 — idle cancel and terminal attempt lifecycle are conflated
One attempt identity belongs to one move. Uncertain states are now non-dismissible until reconciliation succeeds; idle unused cancellation remains separately discardable.

### REL-046 — final Care wiring implemented on PR #65-only branch
**Fix:** executable work moved to canonical combined branch. Bootstrap `31962121116` green; no main/product PR merge.

### REL-047 — repository mode/source changes inside one attempt
**Fix:** one successfully resolved repository instance owns pre-load → mutation → post-load → reconcile. Controller regression green.

### REL-048 — reconciliation-required dialog can be dismissed before canonical sync
**Fix:** dialog close lock + reconciled terminal state. Full rerun `31962635712` green.

### REL-049 — canonical refresh succeeds but compatibility-mirror persistence fails
**Fix design + helper regression:** canonical state is shown first; mirror persistence is best-effort and caught. Mirror failure cannot throw/reclassify relocation success. Helper static/logic gates passed in Care wiring runner before later hydration-test stop.

## Test infrastructure badcases

### TEST-001 — optional-call regex false failure
Fixed test only; product gate unchanged.

### TEST-002 — guessed parent verifier filename
Fixed by reusing PR #64 canonical verifier.

### TEST-003 — Care hydration regression requires unrelated statements to be adjacent

**Observed in one-shot Care wiring run `31962863527`:**

New wiring static contract, canonical mirror fallback, controller, confirmation lifecycle, entrypoint, fresh policy and mutation uncertainty all passed. The run then failed at `scripts/test-care-aquarium-hydration.ts` before severe-risk/TypeScript/build.

The failing static regex requires:

`const [appState, setAppState] = useState(loadAppStateFromStorage);` immediately followed by `useEffect(() => subscribeToAppState(...))`.

The Care patch only inserts the required canonical override state between them:

`const [canonicalAquariums, setCanonicalAquariums] = useState<Aquarium[] | null>(null);`

The app-state subscription itself remains present. This insertion is necessary to protect REL-044/049 and does not remove direct-page hydration.

**Classification:** stale test-structure coupling, not a product/hydration regression.

**Required test correction:** assert capabilities independently:
- appState initializes from storage mirror;
- `subscribeToAppState` still refreshes appState;
- StepDiagnosis uses `canonicalAquariums ?? appState.aquariums` so verified canonical post-action state can outrank a stale mirror;
- no regression to one-time `useMemo(loadAppStateFromStorage)`.

Do not restore source-line adjacency or remove the canonical override merely to satisfy this regex.

**Status:** fix test, rerun the full one-shot workflow from the unpersisted pre-wiring branch state.

## Current verified baseline

- #65 isolated run `31961532732`: green.
- disposable #62 + #65 audit `31961690289`: green.
- canonical bootstrap `31962121116`: green.
- controller run `31962344545`: green.
- reconciliation lifecycle run `31962635712`: green.
- Care JSX one-shot `31962863527`: new wiring gates green through mutation uncertainty; stopped at TEST-003. JSX patch was not committed/pushed.

## Remaining Care executable-layer exit gate

- correct TEST-003 without weakening hydration semantics;
- rerun exact-anchor Care wiring and require Care hydration + severe-risk + app/API TypeScript + build green;
- self-delete one-shot write tooling only after full green;
- verify persisted Care page has no direct relocation mutation call;
- then add browser Golden Path for open → confirm → fresh block/success/reconcile;
- keep handoff/badcase updated as failures are found.
