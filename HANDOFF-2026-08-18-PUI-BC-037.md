# AquaGuide Handoff — 2026-08-18 / PUI-BC-037

## Current priority

Functional CTA / Action Completeness, focused on persistence closure rather than visible no-op buttons.

Acceptance unit:

`Trigger → Execution → Observable result → Persistence（如适用）→ Failure/Retry（如适用）`

## Closed in this Draft PR

### PUI-BC-037 — Aquarium settings Save Settings bypassed repository persistence

- Trigger: cloud repository mode → open Aquarium settings → change dimensions, water type, target temperature, or equipment → click Save Settings → reload/resync from the cloud repository.
- Old state: the live Save Settings CTA built an updated aquarium array and called the legacy `saveAquariums(updated)` helper. That helper only wrote the local app-state fact source through `persistAquariums()`.
- Why this was a real persistence defect: AquaGuide already has local/cloud repository modes and the API repository already implements `saveAquarium()`. The Settings UI bypassed that active repository, so the current page could look updated while the cloud aquarium fact remained stale. The same old handler could still record a `settings_updated` timeline event and mark the aquarium configured, creating a contradictory half-success state where history said settings were saved while the cloud fact source still held the old settings.
- Fail-before-fix: Product Golden Path #629 / run `32109567946`. The original Product evaluation contracts passed first (`18 features / 108 states / 31 Badcases`), then the new deterministic Settings contract failed with `Aquarium settings must use an explicit async persistence handler instead of an inline local-only save.`
- Product fix commit: `4001bd9599774d001e36d3075dfbbfb824fb9f53`.
- Fix:
  - added an explicit async `handleSaveAquariumSettings()`;
  - resolves the active `getCurrentAquaGuideRepository()` and awaits `repository.saveAquarium()` before changing visible state;
  - updates the aquarium UI from the repository-returned saved fact rather than from a locally constructed optimistic array;
  - blocks duplicate Save/Cancel/close actions while persistence is in flight and exposes a Saving state;
  - repository failure keeps the task retryable and reports that the aquarium settings were not saved;
  - `settings_updated` timeline persistence now happens only after the aquarium fact is saved; if the timeline write fails, the UI explicitly says the settings were saved but the timeline entry was not recorded instead of reversing the primary fact result.
- Product verification: Product Golden Path #644 / run `32111424988` — baseline Product evaluation contracts (`18 features / 108 states / 31 Badcases`), Aquarium settings repository contract, typecheck, build, Care card regression, and GP-001～GP-005 all PASS.
- Permanent regression: `scripts/test-aquarium-settings-repository-contract.mjs` plus Product Golden Path step `Aquarium settings repository contract`.
- Registry target: `PUI-BC-037`, `aquarium_setup`, `high`, `ui_persistence_contract`, `regression_verified`.
- Evidence limitation: this is deterministic repository/architecture regression coverage. It proves that Save Settings is wired through the active repository and that UI success is ordered after repository persistence; it is not a connected production-cloud E2E measurement.
- PR #92 remains Draft/open/unmerged.

## Independent Draft PRs still open

- #88 — PUI-BC-033 global search show-all.
- #89 — PUI-BC-034 Identify overflow hint.
- #90 — PUI-BC-035 Care action promise/effect consistency.
- #91 — PUI-BC-036 Aquarium delete persistence closure.
- #92 — PUI-BC-037 Aquarium settings persistence closure.

These branches were intentionally developed independently from the same `main` base. Do not merge without explicit authorization. A later integration pass must union all independent badcase entries and rerun the combined permanent regressions on final main.

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

## Next candidate

Continue Action Completeness at the persistence/promise layer. The next audit target is Aquarium `Data & Backup`: verify whether its user-facing promise is explicitly local-browser-only or whether Import/Clear/Backup can claim success while cloud repository state remains authoritative and later overwrites the local result. Do not register another badcase without deterministic fail-before evidence.

## Final registry verification target

After registering PUI-BC-037, latest-head Product Golden Path on this independent branch must report `18 features / 108 states / 32 Badcases`, Aquarium settings repository contract PASS, typecheck/build PASS, Care card regression PASS, and GP-001～GP-005 PASS.