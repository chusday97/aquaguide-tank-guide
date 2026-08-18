# AquaGuide Handoff — 2026-08-18 / PUI-BC-037

## Current priority

Functional CTA / Action Completeness, focused on persistence-promise consistency across local/cloud repository modes.

Acceptance unit:

`Trigger → Execution → Observable result → Persistence（如适用）→ Failure/Retry（如适用）`

## Closed in this Draft PR

### PUI-BC-037 — Data & backup treated cloud mode as local-only

- Trigger: cloud repository mode → Aquarium → Data & backup → import browser data or clear local data.
- Old state:
  - the Data storage description always said aquarium records were stored in the current browser;
  - `handleImportLocalData()` always wrote browser LocalAppState, reported generic import success, then reloaded;
  - `handleClearLocalData()` warned that aquarium/stocking/diagnosis/log data could not be recovered, cleared browser keys, said it was returning to an empty aquarium state, then reloaded.
- Why this was a real persistence/promise defect: Aquarium already reloads aquariums, care reminders and care events from the active cloud repository. `clearLocalAppState()` and `importLocalAppState()` only mutate browser storage. In cloud mode, browser-only import/clear therefore cannot be treated as authoritative cloud restore/delete; a reload can rehydrate cloud-backed facts while some local-only facts have been changed or removed.
- Fail-before-fix: Product Golden Path #663 / run `32116622533`. Existing Product evaluation contracts passed first (`18 features / 108 states / 31 Badcases`), then `Data storage repository-mode contract` failed with: `Data storage import must be repository-mode aware; cloud mode cannot silently import browser-only state and then report generic success.`
- Product fix commit: `282b1615b54a4449ed1510012ff43b2de42f3ae0`.
- Fix:
  - Aquarium tracks the resolved active repository mode alongside repository-backed aquarium loading;
  - cloud mode explicitly states that cloud aquarium data remains the source of truth and browser-only import/clear do not modify cloud data;
  - cloud mode blocks browser-only import before it can report false restore success;
  - cloud mode blocks browser-only clear before it can imply cloud deletion or an empty post-reload state;
  - local mode preserves the existing browser import/clear behavior and its success/failure semantics.
- Product verification: Product Golden Path #669 / run `32117306466` — Product contracts, Data storage repository-mode contract, typecheck, build, Care card regression, and GP-001～GP-005 all PASS.
- Permanent regression: `scripts/test-data-storage-repository-mode-contract.mjs` plus Product Golden Path step `Data storage repository-mode contract`.
- Registry target: `PUI-BC-037`, `aquarium_setup`, `high`, `ui_persistence_contract`, `regression_verified`.
- Evidence limitation: this proves repository-mode-aware UI/product semantics and blocks false local-only destructive promises in cloud mode. It does not add or claim a cloud backup/import/delete-all feature.
- PR #94 remains Draft/open/unmerged.

## Independent Draft PR integration note

This branch is based directly on current `main`, where the product registry still contains 31 Badcases. Other Action Completeness fixes (#88–#91 and related branches) remain independent and unmerged, so this branch intentionally adds `PUI-BC-037` without pulling their registry entries into this branch. When integration is authorized, consolidate the registry/handoff sequence and rerun all permanent regressions together before main verification.

Do not merge without explicit authorization.

## Compatibility boundary unchanged

- Decision Engine: `stable_under_regression`.
- GP-002: covered.
- Knowledge Coverage: limited.
- Catalog objects: 486.
- Compatibility-eligible species: 411.
- Reviewed species profiles: 7.
- Reviewed pair rules: 4.
- Priority directions: 132.
- Recordable priority directions: 2.
- Priority statuses: 108 `insufficient_data` / 22 `not_recommended` / 2 `caution`.
- `PUI-BC-025` stays `investigating`.

## Next

Continue persistence-level Action Completeness. Priority candidates: settings save paths and reminder/timeline mutations that may still use local helpers while cloud repository mode is active. Do not register another badcase without deterministic fail-before evidence.

## Final registry verification target

Latest-head Product Golden Path must report 18 features / 108 states / 32 Badcases on this independent branch, `Data storage repository-mode contract: PASS`, typecheck/build PASS, and GP-001～GP-005 PASS.
