# Compatibility v3 Authority Reconciliation Contract — 2026-09-11

## Decision
Main Compatibility v3/domain-rule behavior is the behavioral baseline. Aqua Admin's reviewed runtime authority remains the decision-data authority.

Do **not** keep main's v3 Profile/Stage Risk data as direct static reads after reviewed DB authority activates. Do **not** replace main v3 engine with the feature's older v2 algorithm.

The merge contract is: **main v3 engine + one versioned Profile/Pair reviewed authority**.

## Profile authority extension
Extend the existing species Profile authority instead of creating a third top-level Admin workflow.

A reviewed Profile must carry:
- existing `behaviorTraits`
- existing `minimumGroupSize`
- existing `predationTargets`
- existing `confidence`
- main v3 `requiredFacts`
- optional main v3 `stockingGuidance`
- zero or more reviewed `stageRiskRules`

`CompatibilityLifeStage` remains compatibility-only: `unknown | juvenile | adult | fry | subadult`. Persisted livestock `LifeStage` remains unchanged.

## Stage Risk rule contract
Each Stage Risk rule belongs to one Profile revision and is published atomically with that Profile. It does not receive an independent Draft/review/publish status.

Required rule fields:
- stable rule key
- `youngerStages: CompatibilityLifeStage[]`
- `olderStages: CompatibilityLifeStage[]`
- `verdict: caution | not_recommended`
- `riskType`
- `reason`
- `mitigation[]`
- `basis` (current canonical case is `species_trait`)
- `confidence`
- dedicated Evidence links

Current main canonical baseline contains one rule: `sp_0436` adult → fry conspecific predation risk.

## Evidence isolation
Stage Risk citations must **not** be appended to ordinary Profile citations. `tankCompatibilityEngine.evidenceFromProfile()` attaches all Profile citations to normal species-trait findings, so mixing the two evidence sets would misattribute evidence.

Recommended storage inside the same Profile authority:
1. keep existing `species_compatibility_profile_sources` for ordinary Profile evidence;
2. add Profile-owned Stage Risk rule rows (or equivalent normalized child records) keyed to the reviewed Profile;
3. add Stage Risk rule → `evidence_sources` links;
4. revision-side Stage Risk data must snapshot its own citations for human review/freshness;
5. publish replaces reviewed Stage Risk children transactionally with the Profile revision.

This is a child model of Profile authority, not a third authority/workflow.

## Contract/API changes
The reconciliation candidate must extend:
- `ReviewedCompatibilityProfileDto` with `requiredFacts`, optional `stockingGuidance`, and `stageRiskRules`;
- Admin Profile Draft/update DTO with the same editable v3 fields;
- `CompatibilityBootstrapResponse` and `RuntimeCompatibilityStatus` coverage/version hashing;
- `CompatibilityEvidenceProvider` with Stage Risk lookup while preserving Profile/Pair getters;
- server `createAuthorityEvidenceProvider` and local regression provider;
- exact reviewed-DB coverage validation so v3 fields cannot silently disappear when DB authority activates.

Authority version hashing must include Profile v3 fields, Stage Risk semantics and Stage Risk evidence versions.

## Migration / publish changes
Use a new additive migration; do not edit already-landed historical migrations.

The migration must:
- add v3 Profile fields to reviewed + revision authority as required by the chosen normalized model;
- seed/backfill all 7 canonical `requiredFacts` values from main v3 evidence;
- preserve optional `stockingGuidance` (currently no explicit static baseline entries);
- seed the canonical `sp_0436` Stage Risk with its dedicated reviewed evidence;
- fail closed on partial/drifted canonical data;
- update `publish_compatibility_profile_revision` so Profile + Stage Risk children publish atomically and bump one Compatibility authority sequence.

Production/live migration remains locked.

## Review / regression changes
Profile Impact must include v3 fields and Stage Risk semantic changes.

Submit/repair/approve/publish freshness must include:
- Profile v3 field digest;
- Stage Risk rule digest;
- Stage Risk evidence identity/version;
- existing Product catalog fingerprint and authority sequence.

A Stage Risk change must therefore trigger the same real engine regression gate and fresh human approval as any other decision-critical Profile change.

## Local durable state
Local Compatibility state must bump its schema version. Migration from the current v1 state must be deterministic and fail closed on invalid data.

The canonical migration should hydrate v3 Profile fields/Stage Risk from the same main v3 reviewed baseline rather than silently defaulting a previously accepted Profile to missing decision inputs.

Backup/restore and full-restart regression must cover the upgraded Local Compatibility schema.

## Admin UI
Keep one Profile editor. Add a compact `Compatibility v3` subsection for required facts / optional stocking guidance / Stage Risk rules and their dedicated evidence.

Do not add a separate global Stage Risk workspace. Existing Profile Draft → Impact/Regression/Evidence → Human Review → Publish remains the only workflow.

## Reconciliation acceptance gate
The Compatibility cluster is accepted only when all of the following pass together:
- main v3/domain-rule tests and compatibility golden paths;
- feature runtime authority exact-coverage/fallback tests;
- Profile/Pair Admin Draft→review→publish;
- Stage Risk edit → regression → fresh approval → publish;
- reviewed DB and static fallback produce equivalent canonical decisions for the accepted baseline;
- Local File restart/backup/restore;
- Aquarium/Encyclopedia/Identify compatibility paths;
- TypeScript + full build.

Until then, the reconciliation candidate must not be considered merge-ready.
