# AquaGuide Handoff — 2026-08-18 / PUI-BC-036

## Current priority

Functional CTA / Action Completeness, now focused on persistence closure rather than visible no-op buttons.

Acceptance unit:

`Trigger → Execution → Observable result → Persistence（如适用）→ Failure/Retry（如适用）`

## Closed in this Draft PR

### PUI-BC-036 — Aquarium delete bypassed repository persistence

- Trigger: cloud repository mode with at least two aquariums → Aquarium menu → delete a tank → reload/resync.
- Old state: `confirmDeleteAquarium` synchronously filtered the React aquarium list and called the legacy local `saveAquariums()` helper. It never called the active repository.
- Why this was a real persistence defect: AquaGuide already supports local/cloud repository modes and the backend already exposes `DELETE /aquariums/:id`; the missing layer was the frontend repository contract and wiring. A cloud user could therefore see a tank disappear locally while the server record remained and could reappear after reload/sync.
- Fail-before-fix: Product Golden Path #617 / run `32107365771`. All Product evaluation contracts passed first; the new deterministic contract then failed with `AquaGuideRepository must expose a deleteAquarium command instead of letting the UI mutate only local cache.`
- Product fix commit: `aae0ab7bad8c03d24327dd5712a3b8ede9033642`.
- Fix:
  - added `AquariumDeleteCommand` and `deleteAquarium()` to `AquaGuideRepository`;
  - Local repository deletes through the local fact source and keeps the minimum-one-aquarium invariant;
  - API repository calls the existing versioned `DELETE /aquariums/:id`, passes the operation id as the idempotency key, clears cached version state, and verifies absence through `getAquariums()` when the DELETE response fails ambiguously;
  - Aquarium UI awaits repository deletion before mutating visible state, keeps the dialog retryable on failure, exposes stable success/error feedback, and disables duplicate submission while deleting.
- Product verification: Product Golden Path #621 / run `32107779534` — Aquarium delete repository contract, typecheck, build, Care card regression, and GP-001～GP-005 all PASS.
- Permanent regression: `scripts/test-aquarium-delete-repository-contract.mjs` plus Product Golden Path step `Aquarium delete repository contract`.
- Registry: `PUI-BC-036`, `aquarium_setup`, `high`, `ui_persistence_contract`, `regression_verified`.
- Registry validation note: Product Golden Path #625 / run `32108127302` failed before the Aquarium contract because `featureId=aquarium` was not a registered product feature. The record is now mapped to the existing `aquarium_setup` feature; this was metadata correction only and did not change product code.
- Evidence limitation: this is deterministic repository/architecture regression coverage. It proves that the cloud path is wired to the existing API delete capability; it is not a connected production-cloud E2E measurement.
- PR #91 remains Draft/open/unmerged.

## Open independent Draft PRs

- #88 — PUI-BC-033 global search show-all.
- #89 — PUI-BC-034 Identify overflow hint.
- #90 — PUI-BC-035 Care card promise/effect consistency.
- #91 — PUI-BC-036 Aquarium delete persistence closure.

All four were intentionally developed independently from the same main base. Do not merge without explicit authorization. When integration is authorized, preserve both SearchAutocomplete behaviors from #88/#89 and consolidate registry/handoff ordering before final main verification.

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

Continue Action Completeness at the persistence layer. Prefer actions that currently show success but can lose, resurrect, or desynchronize user state after reload. Do not register another badcase without deterministic fail-before evidence.

## Final registry verification target

Latest-head Product Golden Path must report 18 features / 108 states / 32 Badcases on this independent branch, the Aquarium delete repository contract PASS, typecheck/build PASS, and GP-001～GP-005 PASS.
