## TOP CURRENT OVERRIDE — 2026-10-19 blank-var provenance + ornamental-medaka group hardening via WebCodex

- Canonical branch is `main`, continuing from local checkpoint `c502f5d4`. Scope remains Compatibility identity-boundary/evidence/audit tooling only: **no UI, no push, no deploy, no Production DB mutation, no migration, no Production rollout change**.
- This pass deliberately closes **zero** catalog identities. It hardens the remaining blank-`var.` identity path so a stripped base taxon is never presented as reviewed exact-object lineage evidence.
- For every active `catalog_scientific_name_unresolved` object with a blank `var.` suffix and only one candidate, the candidate is now normalized to **`legacy catalog attribution; exact catalog object not independently confirmed`**. The old misleading `ornamental ... lineage` wording is prohibited by regression.
- Migration audit also suppresses `singleCandidateHint` for blank-`var.` structural corrections. Human reviewers still see the full `candidateTaxa`, but downstream automation no longer receives a false one-candidate shortcut.
- `sp_0474 观背青鳉` is reclassified from a missing-variant structural correction to **trade/group identity ambiguity**. Peer-reviewed ornamental-medaka genomics describes Japanese ornamental medaka as a large strain group derived from the `Oryzias latipes species complex`, with hundreds of domesticated strains; “观背青鳉” is therefore not one exact unnamed variant that can inherit a single profile.
- `sp_0474` remains terminal fail-closed: trade-name-only granularity, no automated research, no Profile, no canonical promotion, no inherited Compatibility authority.
- Counts intentionally preserve readiness and unknown impact: **308 fish-domain / 100 generic-ready / 112 core-complete / 91 fish identity-held / 258 combined held**; **93 active boundaries = 91 fish + 2 non-fish / 16,735 unresolved pairs**. Queue classification changes from **16 -> 15 catalog-structure corrections** and **16 -> 17 trade-name disambiguations**; automated identity research remains 0.
- Coverage remains **150 visible debt fields = 72 completion-eligible + 78 deferred**, with **4 guarded taxon jobs / 9 variant objects / 0 exact-base objects**. Canonical authority remains **44 identities / 21 explicit bridges / 13 colour-policy records / 4 taxon roots / 10 field policies**.
- Fully-informed matrix remains **100 ready / 4,950 pairs / 0 insufficient_data** with 296 compatible / 2,267 caution / 2,387 not_recommended. Readability remains **9,591 reviewed-fish pairs / 97 exceptional unknowns**.
- Repository authority remains **126 reviewed Profiles / 21 reviewed Pair Rules** and rollout generations remain exact **63 / 85 / 95 / 99 / 100 / 101**.
- Identity/boundary, migration audit, candidate provenance, queue preservation, coverage/research-plan, decision freshness, variant inheritance, fully-informed, readability, main Compatibility, symmetry, regression, user conclusion, release badcases, runtime authority, rollout window, admin contract, docs authority, TypeScript and diff checks PASS.
- NEXT: continue the remaining **15** true catalog-structure corrections only from exact object/lineage evidence. For unresolved labels, retain legacy parent hypotheses only as provenance and never as promotion authority.

## CURRENT OVERRIDE — 2026-10-15 Bailian onboarding review packet + extraction transport diagnostics via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. This checkpoint is local/source-controlled only: **no push, deploy, Production alias change, DB migration, catalog promotion, or Production authority write**.
- Extended the existing `POST /admin/compatibility/research-preview` instead of creating a second research endpoint.
- Research preview now returns:
  - original identity + research packet + assessment;
  - a standardized `CompatibilityOnboardingReviewPacket`;
  - an actionable `CompatibilityOnboardingReviewWorkItem`;
  - `writesAuthority=false` remains invariant.
- Front-end `compatibilityAdminService` now exposes `researchOnboardingPreview(...)` so Admin/Operations can consume the same review payload.
- Review packet gates are explicit:
  - **8/8 supported** -> `manual_review_required` / decision work item;
  - field gaps -> `research_incomplete` / attention work item;
  - unresolved identity or terminal evidence conflict -> `terminal_hold` / blocker work item.
- New regression `scripts/test-compatibility-onboarding-review-packet.ts` is part of `test:backend-release-gate`.
- The review-packet regression proves:
  - 8/8 research output is still Draft and does not write reviewed authority;
  - missing `tank_size` remains non-approvable and asks only for the missing evidence;
  - ambiguous identity remains a blocker;
  - provider extraction transport failure is not mislabelled as public evidence absence.
- Bailian provider diagnostics were upgraded:
  - `CompatibilitySpeciesResearchPacket.diagnostics.extractionStatus` now distinguishes `ok`, `not_attempted`, `partial_transport_unavailable`, and `transport_unavailable`;
  - persistent retryable model-network failures add `provider_extraction_transport_unavailable`;
  - verified sources are preserved and unsupported claims are never synthesized;
  - extraction retries are bounded at **3 attempts**;
  - ordinary discovery/search retry behavior is not broadened.
- Extraction now processes **one verified source at a time** instead of sending up to six fetched pages in one model prompt. Claims are deduplicated by field + canonical source URL + proposed value. Independent sources remain independent evidence.
- A circuit breaker prevents one provider outage from becoming N-sources × 3 failed requests: if the first verified source exhausts all three extraction attempts before any successful extraction, the batch stops and returns transport-unavailable diagnostics.
- `researchAndAssessCompatibilitySpeciesDetailed` no longer launches a targeted evidence-search retry when the initial failure is a full extraction transport outage. A provider outage is not an evidence gap.
- Operations copy now distinguishes the two cases:
  - actual missing evidence -> “只补缺失字段的直接来源”;
  - extraction transport outage -> “重试已验证来源的结构化 extraction；不要重新补来源，也不要人工猜测 8 个 facts”.
- Existing network regression updated:
  - one transient extraction TLS failure still recovers;
  - persistent transport failure performs exactly 3 bounded attempts;
  - content-verified sources survive;
  - claims remain empty;
  - assessment explicitly reports `provider_extraction_transport_unavailable`.
- **Live provider diagnosis, not mock-only:**
  - configured research provider = Alibaba Model Studio / `qwen3.7-flash-2026-07-15`;
  - `Pterophyllum scalare` source acquisition successfully server-verified **FishBase + Seriously Fish + Fishipedia**;
  - extraction returned `transport_unavailable`, `verifiedSourceCount=3`, `transportErrorCode=retryable_network_error`;
  - zero claims were therefore correctly classified as provider transport failure, not “no public evidence”;
  - targetedRetry = **false** after the transport/evidence split;
  - work item correctly says `Compatibility extraction 暂不可用`;
  - no authority write occurred.
- A direct minimal call to the official `dashscope.aliyuncs.com/compatible-mode/v1` endpoint also failed at the network/TLS layer from this runtime, so changing prompt/model or blindly cycling fallback models would not solve the current environment-level connection issue.
- Local environment has one AI endpoint host; configured Compatibility fallback model names (`qwen3.8-27b`, `deepseek-v4.1-flash`) share that same endpoint, so model fallback is intentionally **not** used for a host-level transport outage.
- This does **not** change Compatibility decision logic, reviewed evidence thresholds, the 76-ready/2,850-pair invariant, or dynamic no-pair-precompute architecture.
- Full validation: **`BACKEND_RELEASE_GATE=PASS`**, Bailian provider regressions, onboarding blind/approval/review-packet tests, API TypeScript, project TypeScript, bundle, lint, and `git diff --check` pass.
- Current system interpretation:
  **Compatibility engine = stable; dynamic onboarding/runtime authority = implemented; review packet/API = implemented; current remaining blocker for automatic live 8-field draft generation = external Alibaba text-model transport from this runtime.**

## CURRENT OVERRIDE — 2026-10-15 reviewed onboarding approval gate + product integration via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. This checkpoint is local/source-controlled only: **no push, deploy, Production alias change, DB migration, catalog promotion, or Production authority write**.
- The previous dynamic-onboarding proof is now converted into a safe product path rather than remaining a test-only injection.
- Fixed an authority-boundary bug in `buildPostReviewCompatibilityPreviewFact`: a `ready_for_review` research assessment previously returned `reviewed: true`. It now remains **unreviewed preview authority** (`reviewed: false`) until explicit field approval exists.
- Research-complete but not approved behavior is now intentionally conservative:
  - generic preview can still show a provisional result;
  - Domain decision becomes `caution` / `decisionReadiness=partial`;
  - `species_review_pending` is explicit;
  - research/AI output cannot self-promote to runtime reviewed authority.
- Added `CompatibilityOnboardingApprovalBundle` and `buildReviewedCompatibilityOnboardingAuthority`.
- Promotion to runtime reviewed authority now requires, for **all 8 Compatibility core facts**:
  - exact species/catalog key match;
  - field review status = `reviewed`;
  - resolution = `supported`;
  - non-null review timestamp;
  - approved field value exactly matches the reconciled research value;
  - field citation set exactly matches the research resolution citation set;
  - every citation is included in the explicitly reviewed source set;
  - every source was content-verified;
  - reviewed field value still passes the source-controlled field schema.
- Missing, draft, tampered, citation-mismatched, or unresolved field approval fails closed and cannot create runtime authority.
- Added `createReviewedOnboardingEvidenceProvider`:
  - approved onboarding authorities can supply both reviewed Profile and reviewed DomainSpeciesFact at runtime;
  - any pair containing a newly approved onboarding species has **no automatic Pair Rule**;
  - existing static Profiles / Pair Rules / stage-risk authority remain fallback for normal catalog species.
- `reviewSpeciesAdditions`, `assessSpeciesAddition`, and `executeSpeciesAddition` now accept an optional trusted `CompatibilityEvidenceProvider`, so the normal product-level planned-addition workflow can evaluate a newly approved species before it is persisted into the static catalog.
- New mandatory regression: `scripts/test-compatibility-onboarding-approval.ts`.
- Approval regression proves:
  - research status = `ready_for_review`;
  - preview reviewed = **false**;
  - **8 / 8** explicit field approvals required;
  - approved runtime fact reviewed = **true**;
  - product-level `reviewSpeciesAdditions` result = **compatible** in the fixture;
  - decision readiness = **reviewed**;
  - precomputed Pair Rule used = **false**;
  - next-step / recheck / stop-condition contract remains available.
- Negative controls PASS:
  - all draft field reviews -> rejected;
  - omit pH approval -> rejected;
  - tamper reviewed temperature value away from research result -> rejected.
- The existing Dynamic Species Onboarding regression remains PASS:
  - unregistered species + reviewed 8/8 runtime facts vs 76 ready species -> 76 dynamic evaluations / 0 pair rules added / 0 insufficient_data;
  - 5-species whole-tank aggregation -> 10 dynamically evaluated pairs, fully informed.
- The existing 76-ready / 2,850 fully-informed regression remains unchanged and is still a **test matrix, not a pair prerequisite**.
- `Compatibility Onboarding Approval` is now part of `test:backend-release-gate`.
- Full validation: **`BACKEND_RELEASE_GATE=PASS`**, API/project TypeScript, lint, and `git diff --check` pass.
- Product architecture after this checkpoint:
  **identity verification -> AI/research extraction -> 8-field reconciliation -> human/reviewed evidence approval -> runtime reviewed facts -> deterministic Compatibility -> judgment / why / next step / recheck / stop condition**.
  AI can assist research and explanation, but cannot cross the approval boundary or override deterministic authority.

## CURRENT OVERRIDE — 2026-10-15 dynamic reviewed-facts onboarding proof via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. This checkpoint changes Compatibility architecture/tests only: **no catalog species promotion, no pair-rule expansion, no push, deploy, Production alias change, DB migration, or Production authority write**.
- The existing **76 ready species / 2,850 unordered pair** matrix remains an exhaustive regression test only; it is not a prerequisite pair database.
- Product-level Compatibility now accepts an optional trusted `CompatibilityEvidenceProvider` all the way through `evaluateCompatibilityDecision`, pair evaluation, and whole-tank aggregation.
- `CompatibilityEvidenceProvider` now has an optional `getReviewedSpeciesFact(species)` hook. When a provider supplies a complete reviewed `DomainSpeciesFact`, the engine can evaluate that species without requiring it to exist in static `fishData`, Species Knowledge, or the static Compatibility Profile registry.
- This does **not** weaken fail-closed behavior:
  - only an explicit provider-supplied reviewed fact can take this runtime path;
  - normal catalog/runtime authority lookup remains unchanged;
  - missing required facts still produce `insufficient_data`;
  - existing identity/domain/evidence ceilings remain unchanged.
- New mandatory regression: `scripts/test-compatibility-dynamic-onboarding.ts`.
- Synthetic fixture `sp_dynamic_unregistered_fixture / Fixtureus dynamicus` is deliberately absent from:
  - the 486-object catalog;
  - static Compatibility Profile authority;
  - all reviewed Pair Rules.
- The synthetic species receives only one runtime reviewed 8/8 fact object:
  - freshwater
  - 24–28°C
  - pH 6.5–7.5
  - adult 3–5 cm
  - minimum 60 L / 60 cm
  - group social mode, minimum 6
  - no reviewed territoriality
  - no reviewed fish predation
- Dynamic pair proof against the existing ready cohort:
  - **76 runtime pair evaluations**
  - **0 precomputed Pair Rules added**
  - **12 compatible / 29 caution / 35 not_recommended / 0 insufficient_data**
  - every decision is `decisionReadiness=reviewed`
  - every decision produces a non-unknown judgment plus `nextSteps`, `reviewCheckpoint`, and `stopCondition`
  - synthetic-involving decisions do not use `reviewed_pair_rule`
- Whole-tank proof:
  - synthetic species + 4 existing reviewed species = **5 species**
  - engine dynamically evaluates all **10 unique pairs**
  - whole-tank aggregation returns **caution**, fully informed, not `insufficient_data`
  - synthetic-involving pairs still have no reviewed Pair Rule.
- Negative control:
  - remove one required runtime fact (pH max)
  - the same unseen species immediately becomes `insufficient_data`
  - rule code includes `required_fact_ph_missing`
  - therefore runtime injection is not an escape hatch around completeness/evidence requirements.
- Existing tests remain green:
  - Generic Species Onboarding
  - Auto Onboarding Blind
  - Compatibility Service Authority
  - 76 / 2,850 Fully Informed Matrix
  - User Conclusion
  - Release Badcases
- Dynamic Species Onboarding is now part of `test:backend-release-gate`, so future backend releases must preserve this no-pair-precompute invariant.
- Full validation: **`BACKEND_RELEASE_GATE=PASS`**, project/API TypeScript, lint, and `git diff --check` pass.
- Product interpretation: a future species does **not** need A+B/A+C/... pair records. Once identity/evidence review has produced complete reviewed facts, the generic deterministic engine can evaluate it immediately against existing species and in whole-tank aggregation. AI can assist upstream research/extraction and downstream explanation/actions, but deterministic reviewed facts/rules remain final authority.

## CURRENT OVERRIDE — 2026-10-15 Super Red / Red Devil angelfish identity + catalog correction wave28 via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. Wave28 is source-controlled candidate work only: **no push, deploy, Production alias change, DB migration, or Production authority write**.
- Wave28 resolves exactly one additional identity-held fish: `sp_0388`, formerly labeled `血钻神仙 (改良) / Pterophyllum scalare var. Super Red`.
- Two independent exact-trade-line sources support this object as a `Pterophyllum scalare` ornamental line:
  - Aquatic Arts: `Red Devil Angelfish (Pterophyllum scalare 'Red Devil')`.
  - Garage Aquatics: `Red Devil Super Red Angelfish (Pterophyllum scalare)`.
- Because red angelfish trade names are not standardized, Wave28 is deliberately scoped to the existing `Super Red` object. The broader `sp_0175 Pterophyllum scalare var. Red` remains fail-closed.
- Catalog correction:
  - display name -> **`超级红神仙（Red Devil）`**
  - scientificName stays `Pterophyllum scalare var. Super Red`
  - copied `建议单养 / 斗鱼...追咬` text removed
  - pH display aligned to reviewed base authority: 6–8
  - tank copy aligned to at least 100 cm horizontal length plus adequate height
  - user-facing housing becomes `谨慎混养`, preserving adult/breeding territoriality and small-fish predation risk
- Identity-correction map now contains eight reviewed bridges; `sp_0388 -> sp_0446` is the newest.
- `sp_0388` is now **8/8 authoritative + generic-ready**, while `sp_0175 Red` remains 0/8 identity-held.
- Coverage after Wave28: **91 authoritative 8/8 fish / 76 strict generic-ready / 282 identity-domain held**. Ordinary research backlog remains exactly **336 actionable field gaps**.
- Global decision impact versus Wave27:
  - decision coverage **45.10% -> 45.27%**
  - `unresolved_identity` **20,239 -> 20,100 (-139 pairs)**
  - total `insufficient_data` **26,293 -> 26,214 (-79 pairs)**
  - `public_evidence_insufficient` **6,054 -> 6,114 (+60)** because identity resolution exposes the next real evidence boundary
  - `missing_species_fact` remains **0**
  - status totals: **397 compatible / 2,229 caution / 19,055 not_recommended / 26,214 insufficient_data**
- Strict fully-informed invariant expands to **76 ready fish = 2,850 unordered pairs = 144 compatible / 1,244 caution / 1,462 not_recommended / 0 insufficient_data**.
- Repository authority now contains **109 reviewed Profiles** = released target 101 + 8 source-controlled pending identity corrections. Historical release generations remain exact **63 -> 85 -> 95 -> 99 -> 100 -> 101**.
- PASS: catalog identity boundaries, identity bridge reviews, Species Knowledge, rollout/runtime authority, historical migrations, core-field coverage, strict fully-informed matrix, readability, user conclusion, release badcases, full `test:backend-release-gate`, API/project TypeScript, Business API bundle, lint, and `git diff --check`.
- NEXT: continue only with exact-lineage objects. `sp_0175 Red`, Gold Dario, Gold/Super Gold L134, Albino Asian arowana, and compound Balloon/Longfin/High-Fin objects remain held until stronger direct evidence exists.

## CURRENT OVERRIDE — 2026-10-15 Panda angelfish identity + catalog correction wave27 via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. Wave27 is WebCodex / WebCodex-All-Bridge source-controlled candidate work only: **no RDC, Codex agent, push, Vercel deploy, Production alias change, DB migration, or Production authority write**.
- Wave27 resolves exactly one additional identity-held fish: `sp_0178 熊猫神仙 / Pterophyllum scalare var. Panda`.
- Two independent exact-trade-line sources support Panda as a `Pterophyllum scalare` ornamental variety:
  - Aquatic Arts: `Panda Angelfish (Pterophyllum scalare - variant), USA Bred`, explicitly identifying Panda Angelfish as a `P. scalare` variant.
  - Aquapets: `Panda Angel (Pterophyllum scalare)`, independently identifying the same trade form as `P. scalare` and describing it as a selectively bred fancy variety.
- Catalog correction is object-scoped:
  - Panda identity is retained as `Pterophyllum scalare var. Panda`.
  - pH display is aligned to reviewed base authority: 6–8.
  - tank copy is aligned to the reviewed spatial boundary: plan around at least 100 cm tank length plus adequate height.
  - the copied `建议单养 / 斗鱼...追咬` template is removed and replaced by reviewed angelfish-compatible `谨慎混养` guidance.
  - Red / Super Red / longfin / balloon / platinum and all other angelfish morphs remain fail-closed unless separately evidenced.
- Identity-correction map now contains seven reviewed bridges:
  - `sp_0176 -> sp_0446` Marble angelfish -> `Pterophyllum scalare`
  - `sp_0177 -> sp_0446` Blue Diamond angelfish -> `Pterophyllum scalare`
  - `sp_0178 -> sp_0446` Panda angelfish -> `Pterophyllum scalare`
  - `sp_0221 -> sp_0017` Fire Red Agassizii -> `Apistogramma agassizii`
  - `sp_0229 -> sp_0441` Albino Gyrinocheilus -> `Gyrinocheilus aymonieri`
  - `sp_0236 -> sp_0438` Albino Red swordtail -> `Xiphophorus hellerii`
  - `sp_0407 -> sp_0103` Blood Red A arowana -> `Scleropages formosus`
- `sp_0178` now has explicit reviewed bridges for all eight Compatibility core fields, reusing the already-reviewed `sp_0446` authority only after Panda identity is established:
  - freshwater
  - 24–30°C
  - pH 6–8
  - adult max 15 cm
  - minimum horizontal tank length 100 cm, with tall-tank requirement retained in Species Knowledge
  - group social mode, minimum group size 5
  - breeding male territoriality
  - small-fish predation risk
- Object-level regression confirms `sp_0178` is **8/8 authoritative + generic-ready**, while `sp_0175 Red` and `sp_0388 Super Red` remain 0/8 identity-held and cannot inherit the base species automatically.
- Coverage after Wave27: **90 authoritative 8/8 fish / 75 strict generic-ready / 283 identity-domain held**. Ordinary research backlog remains exactly **336 actionable field gaps**, confirming no unrelated angelfish morph review leakage.
- Global decision impact versus Wave26:
  - decision coverage **44.94% -> 45.10%**
  - `unresolved_identity` **20,377 -> 20,239 (-138 pairs)**
  - total `insufficient_data` **26,371 -> 26,293 (-78 pairs)**
  - `public_evidence_insufficient` **5,994 -> 6,054 (+60)** because identity resolution exposes the next real evidence boundary rather than inventing certainty
  - `missing_species_fact` remains **0**
  - status totals: **391 compatible / 2,156 caution / 19,055 not_recommended / 26,293 insufficient_data**
- Strict fully-informed invariant expands to **75 ready fish = 2,775 unordered pairs = 141 compatible / 1,191 caution / 1,443 not_recommended / 0 insufficient_data**.
- Repository authority now contains **108 reviewed Profiles** = released target 101 + 7 source-controlled pending identity corrections (`sp_0176`, `sp_0177`, `sp_0178`, `sp_0221`, `sp_0229`, `sp_0236`, `sp_0407`). Historical release generations remain exact **63 -> 85 -> 95 -> 99 -> 100 -> 101**.
- Historical authority remains immutable; the generic later-source-controlled-correction contract permits the reviewed Wave27 bridge to supersede the runtime historical hold without rewriting migration history.
- PASS: catalog identity boundaries, explicit identity bridge reviews, Species Knowledge resolver, rollout window, runtime authority, frozen historical migrations, core-field coverage, strict fully-informed matrix, V4 readability, user conclusion, release badcases, full `test:backend-release-gate`, API/project TypeScript, Business API bundle, lint, and `git diff --check`.
- NEXT: continue exact-lineage resolution. The remaining `sp_0175 Red` and `sp_0388 Super Red` angelfish objects still contain copied Betta housing text but will not be corrected/released until their exact lineage identities are independently evidenced.

## CURRENT OVERRIDE — 2026-10-15 Blue Diamond angelfish identity + catalog correction wave26 via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. Wave26 is WebCodex / WebCodex-All-Bridge source-controlled candidate work only: **no RDC, Codex agent, push, Vercel deploy, Production alias change, DB migration, or Production authority write**.
- Wave26 resolves exactly one additional identity-held fish: `sp_0177`, formerly labeled `红眼蓝钻神仙 / Pterophyllum scalare var. Blue`.
- Two independent exact-trade-line sources support Blue Diamond as a `Pterophyllum scalare` ornamental colour form:
  - Aquatic Arts: `Blue Diamond Angelfish (Pterophyllum scalare) - Tank-Bred!`, explicitly identifying the Blue Diamond variety as `P. scalare`.
  - Swell UK: `Blue Diamond Angelfish Pterophyllum Scalare`, independently identifying the same trade form as `P. scalare`.
- Catalog correction: the legacy Chinese label/description additionally claimed a distinct **red-eye** identity, but the reviewed Blue Diamond sources do not establish a separate red-eye lineage. Wave26 therefore removes the unsupported modifier instead of preserving a compound identity:
  - display name `红眼蓝钻神仙` -> **`蓝钻神仙`**
  - scientificName `Pterophyllum scalare var. Blue` -> **`Pterophyllum scalare var. Blue Diamond`**
  - description no longer claims blood-red eyes
  - housing changes from the copied `建议单养 / 斗鱼...追咬` template to reviewed angelfish-compatible `谨慎混养` guidance
  - pH/tank copy is aligned to the reviewed base boundary: pH 6–8 and planning around at least 100 cm tank length plus adequate height
- Identity-correction map now contains six reviewed bridges:
  - `sp_0176 -> sp_0446` Marble angelfish -> `Pterophyllum scalare`
  - `sp_0177 -> sp_0446` Blue Diamond angelfish -> `Pterophyllum scalare`
  - `sp_0221 -> sp_0017` Fire Red Agassizii -> `Apistogramma agassizii`
  - `sp_0229 -> sp_0441` Albino Gyrinocheilus -> `Gyrinocheilus aymonieri`
  - `sp_0236 -> sp_0438` Albino Red swordtail -> `Xiphophorus hellerii`
  - `sp_0407 -> sp_0103` Blood Red A arowana -> `Scleropages formosus`
- `sp_0177` now has explicit reviewed bridges for all eight Compatibility core fields, reusing the already-reviewed `sp_0446` authority only after Blue Diamond identity is established:
  - freshwater
  - 24–30°C
  - pH 6–8
  - adult max 15 cm
  - minimum horizontal tank length 100 cm, with tall-tank requirement retained in Species Knowledge
  - group social mode, minimum group size 5
  - breeding male territoriality
  - small-fish predation risk
- Object-level regression confirms `sp_0177` is **8/8 authoritative + generic-ready**, while `sp_0175 Red` and `sp_0178 Panda` remain 0/8 identity-held and cannot inherit the base species automatically.
- Coverage after Wave26: **89 authoritative 8/8 fish / 74 strict generic-ready / 284 identity-domain held**. Ordinary research backlog remains exactly **336 actionable field gaps**, confirming no unrelated angelfish morph review leakage.
- Global decision impact versus Wave25:
  - decision coverage **44.78% -> 44.94%**
  - `unresolved_identity` **20,514 -> 20,377 (-137 pairs)**
  - total `insufficient_data` **26,448 -> 26,371 (-77 pairs)**
  - `public_evidence_insufficient` **5,934 -> 5,994 (+60)** because identity resolution exposes the next real evidence boundary
  - `missing_species_fact` remains **0**
  - status totals: **385 compatible / 2,084 caution / 19,055 not_recommended / 26,371 insufficient_data**
- Strict fully-informed invariant expands to **74 ready fish = 2,701 unordered pairs = 138 compatible / 1,139 caution / 1,424 not_recommended / 0 insufficient_data**.
- Repository authority now contains **107 reviewed Profiles** = released target 101 + 6 source-controlled pending identity corrections (`sp_0176`, `sp_0177`, `sp_0221`, `sp_0229`, `sp_0236`, `sp_0407`). Historical release generations remain exact **63 -> 85 -> 95 -> 99 -> 100 -> 101**.
- Historical Wave05/other frozen authority remains immutable; the generic later-source-controlled-correction contract permits the reviewed Wave26 bridge to supersede the runtime historical hold without rewriting migration history.
- PASS: catalog identity boundaries, explicit identity bridge reviews, Species Knowledge resolver, rollout window, runtime authority, frozen historical migrations, core-field coverage, strict fully-informed matrix, V4 readability, user conclusion, release badcases, full `test:backend-release-gate`, API/project TypeScript, Business API bundle, lint, and `git diff --check`.
- NEXT: keep the remaining Red/Panda/Super Red angelfish morphs fail-closed until each has equivalent exact-lineage evidence. Do not generalize Wave26 into a generic `Pterophyllum scalare var.*` inheritance rule.

## CURRENT OVERRIDE — 2026-10-15 Fire Red Agassizii identity + catalog correction wave25 via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. Wave25 is WebCodex / WebCodex-All-Bridge source-controlled candidate work only: **no RDC, Codex agent, push, Vercel deploy, Production alias change, DB migration, or Production authority write**.
- Wave25 resolves exactly one additional identity-held fish: `sp_0221`, formerly labeled `长鳍阿卡西短鲷 / Apistogramma agassizii var. Fire Red`.
- Two independent exact-lineage sources support Fire Red as an `Apistogramma agassizii` captive-bred colour form:
  - Aquarium Glaser: `Apistogramma agassizii FIRE-RED`, explicitly described as an artificial/captive-bred sport from German breeders and as an `A. agassizii` form.
  - Aquarium Co-Op: the Apistogramma care guide independently lists **Fire Red** among the colour variants of `A. agassizii`.
- Catalog correction: the old Chinese name and description additionally claimed a distinct **long-fin** lineage, but the reviewed sources support Fire Red coloration rather than an independently evidenced long-fin morph. The object is therefore renamed **`火焰红阿卡西短鲷`** and unsupported long-fin language is removed instead of silently treating Fire Red + Longfin as a compound identity.
- The same inspection exposed a copied Betta housing template on the reviewed base object `sp_0017 阿卡西短鲷`. Wave25 corrects only these two exact objects:
  - `sp_0221`: housing changes from unsupported `建议单养 / 斗鱼...长鳍追咬` text to `谨慎混养` with territory/breeding-defense, floor-space, cave and line-of-sight guidance.
  - `sp_0017`: the same erroneous Betta template is removed and replaced with authority-consistent `谨慎混养` guidance.
  - The remaining repeated template occurrences are **not** bulk-replaced; each requires object-level audit/evidence.
- Identity-correction map now contains five reviewed bridges:
  - `sp_0176 -> sp_0446` Marble angelfish -> `Pterophyllum scalare`
  - `sp_0221 -> sp_0017` Fire Red Agassizii -> `Apistogramma agassizii`
  - `sp_0229 -> sp_0441` Albino Gyrinocheilus -> `Gyrinocheilus aymonieri`
  - `sp_0236 -> sp_0438` Albino Red swordtail -> `Xiphophorus hellerii`
  - `sp_0407 -> sp_0103` Blood Red A arowana -> `Scleropages formosus`
- `sp_0221` now has explicit reviewed bridges for all eight Compatibility core fields, reusing the already-reviewed `sp_0017` authority after Fire Red identity is established:
  - freshwater
  - 22–29°C
  - pH 5–7
  - adult max 7.5 cm
  - minimum 54 L / 60 cm pair footprint
  - conservative variable Catalog social mode; Species Knowledge retains the more specific harem structure
  - breeding-defense territoriality boundary
  - no reviewed fish-predation target
- Object-level regression confirms `sp_0221` is **8/8 authoritative + generic-ready** and arbitrary unreviewed `A. agassizii var.*` objects still cannot inherit base authority automatically.
- Coverage after Wave25: **88 authoritative 8/8 fish / 73 strict generic-ready / 285 identity-domain held**. Ordinary research backlog remains exactly **336 actionable field gaps**, confirming no unrelated morph review leakage.
- Global decision impact versus Wave24:
  - decision coverage **44.62% -> 44.78%**
  - `unresolved_identity` **20,650 -> 20,514 (-136 pairs)**
  - total `insufficient_data` **26,524 -> 26,448 (-76 pairs)**
  - `public_evidence_insufficient` **5,874 -> 5,934 (+60)** because identity resolution exposes the next real evidence boundary
  - `missing_species_fact` remains **0**
  - status totals: **379 compatible / 2,013 caution / 19,055 not_recommended / 26,448 insufficient_data**
- Strict fully-informed invariant expands to **73 ready fish = 2,628 unordered pairs = 135 compatible / 1,088 caution / 1,405 not_recommended / 0 insufficient_data**.
- Repository authority now contains **106 reviewed Profiles** = released target 101 + 5 source-controlled pending identity corrections (`sp_0176`, `sp_0221`, `sp_0229`, `sp_0236`, `sp_0407`). Historical release generations remain exact **63 -> 85 -> 95 -> 99 -> 100 -> 101**.
- Historical Wave05 classified `sp_0221` as no-Profile/identity-held. The frozen migration remains unchanged; the generic later-source-controlled-correction contract permits the reviewed Wave25 bridge to supersede the historical hold without rewriting migration history.
- PASS: catalog identity boundaries, explicit identity bridge reviews, Species Knowledge, rollout window, runtime authority, frozen Wave05 migration, core-field coverage, strict fully-informed matrix, V4 readability, user conclusion, release badcases, full `test:backend-release-gate`, API/project TypeScript, Business API bundle, lint, and `git diff --check`.
- NEXT: continue systematic identity resolution, but prioritize candidates without compound-morph ambiguity. Compound labels such as Balloon + colour, Longfin + colour, or High Fin + albino remain fail-closed unless the compound identity itself is directly evidenced.

## CURRENT OVERRIDE — 2026-10-15 Albino Gyrinocheilus identity correction wave24 via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. Wave24 is WebCodex / WebCodex-All-Bridge source-controlled candidate work only: **no RDC, Codex agent, push, Vercel deploy, Production alias change, DB migration, or Production authority write**.
- Wave24 resolves exactly one additional identity-held fish: `sp_0229 白化金苔鼠 / Gyrinocheilus aymonieri var. Albino`.
- Exact object-level identity evidence:
  - Seriously Fish’s exact `Gyrinocheilus aymonieri` species account explicitly says the species is commercially produced in several ornamental strains and separately lists **albino**, golden, piebald, and short-bodied forms.
  - Tetra’s exact Chinese Algae Eater / `Gyrinocheilus aymonieri` care article independently lists wild, golden, marbled, and **albino** colour forms.
- The identity bridge is deliberately object-scoped. The sources separate albino from golden/xanthic-like colour forms, so Wave24 does **not** reinterpret golden, leucistic, marbled, or generic trade morphs as albino. `sp_0442 青苔鼠 / Gyrinocheilus aymonieri var.` remains `catalog_scientific_name_unresolved`, 0/8 and fail-closed.
- Identity-correction map now contains four reviewed bridges:
  - `sp_0176 -> sp_0446` Marble angelfish -> `Pterophyllum scalare`
  - `sp_0229 -> sp_0441` Albino Gyrinocheilus -> `Gyrinocheilus aymonieri`
  - `sp_0236 -> sp_0438` Albino Red swordtail -> `Xiphophorus hellerii`
  - `sp_0407 -> sp_0103` Blood Red A arowana -> `Scleropages formosus`
- `sp_0229` now has explicit reviewed Catalog bridges for all eight Compatibility core fields, reusing only the already-reviewed `sp_0441` same-species authority after the Albino object identity is established:
  - freshwater
  - 22–26°C
  - pH 6–8
  - adult max 28 cm
  - minimum horizontal tank length 150 cm
  - variable social mode, no invented group minimum
  - age-increasing territoriality plus similar-fish / bottom-dweller aggression
  - no reviewed fish-predation target; mucus-grazing remains a behavioral risk rather than being mislabeled as predation
- Object-level regression confirms `sp_0229` is **8/8 authoritative + generic-ready**, while unresolved `sp_0442` remains 0/8 with an identity terminal hold. No generic sibling auto-inheritance was introduced.
- Coverage after Wave24: **87 authoritative 8/8 fish / 72 strict generic-ready / 286 identity-domain held**. The ordinary research backlog remains exactly **336 actionable field gaps** (pH 69 / tank size 68 / water 64 / temperature 62 / adult size 58 / predation 10 / territoriality 5 / social 0), confirming no unrelated review leakage.
- Global decision impact versus Wave23:
  - decision coverage **44.46% -> 44.62%**
  - `unresolved_identity` **20,785 -> 20,650 (-135 pairs)**
  - total `insufficient_data` **26,599 -> 26,524 (-75 pairs)**
  - `public_evidence_insufficient` **5,814 -> 5,874 (+60)** because identity resolution exposes the next genuine public-evidence boundary rather than fabricating certainty
  - `missing_species_fact` remains **0**
  - status totals: **361 compatible / 1,955 caution / 19,055 not_recommended / 26,524 insufficient_data**
- Strict fully-informed invariant expands to **72 ready fish = 2,556 unordered pairs = 124 compatible / 1,046 caution / 1,386 not_recommended / 0 insufficient_data**.
- Repository authority now contains **105 reviewed Profiles** = released target 101 + 4 source-controlled pending identity corrections (`sp_0176`, `sp_0229`, `sp_0236`, `sp_0407`). Historical release generations remain exact **63 -> 85 -> 95 -> 99 -> 100 -> 101**.
- Historical Wave05 classified `sp_0229` as no-Profile/identity-held. The frozen migration remains unchanged; the generic later-source-controlled-correction contract allows the reviewed Wave24 bridge to supersede that historical hold without rewriting migration history.
- PASS: catalog identity boundaries, identity bridge reviews, Species Knowledge resolver, rollout window, runtime authority, frozen Wave05 migration, core-field coverage, strict fully-informed matrix, V4 readability, user conclusion, release badcases, full `test:backend-release-gate`, API/project TypeScript, Business API bundle, lint, and `git diff --check`.
- NEXT: continue the identity-resolution queue only when the base species is already ready and at least two independent exact-species / lineage-aware sources directly support the catalog object. Compound morphs (e.g. Balloon + colour, Longfin + colour) remain fail-closed unless the compound identity itself is evidenced.

## CURRENT OVERRIDE — 2026-10-15 Albino Red swordtail identity correction wave23 via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. Wave23 is WebCodex / WebCodex-All-Bridge source-controlled candidate work only: **no RDC, Codex agent, push, Vercel deploy, Production alias change, DB migration, or Production authority write**.
- Wave23 resolves exactly one additional identity-held fish: `sp_0236 红眼白子红剑 / Xiphophorus hellerii var. Albino Red`.
- Exact object-level identity evidence:
  - Pigment Cell & Melanoma Research (2026), **“A Recessive oca2 Mutation Underlies Albinism in Xiphophorus Fish”** (`10.1111/pcmr.70113`), directly reports `Xiphophorus hellerii` experimental phenotypes including **Red albino** and documents the red-eyed albino phenotype while retaining erythrophore pigmentation.
  - Texas State University Xiphophorus Genetic Stock Center, **“Xiphophorus hellerii, Albino — Strain Protocol HeAlb”**, maintains an albino `X. hellerii` stock produced by continual backcrossing to the Lancetilla `X. hellerii` line and describes it as essentially pure `X. hellerii` selected for albinism.
- The correction is deliberately narrow. `sp_0415 红眼白子红剑(高鳍)` stays fail-closed because High Fin adds an independent fin-form identity not established by the Red albino evidence. `sp_0158 红苹果剑尾` also remains fail-closed because equivalent exact trade-line evidence is absent.
- Identity-correction map now contains three reviewed bridges:
  - `sp_0176 -> sp_0446` Marble angelfish -> `Pterophyllum scalare`
  - `sp_0236 -> sp_0438` Albino Red swordtail -> `Xiphophorus hellerii`
  - `sp_0407 -> sp_0103` Blood Red A arowana -> `Scleropages formosus`
- `sp_0236` receives explicit reviewed Catalog field bridges for all eight Compatibility core fields, backed by the exact identity sources plus Wave23-scoped reviewed copies of the already-reviewed `X. hellerii` husbandry authority. This avoids globally whitelisting generic source IDs and accidentally promoting unrelated historical reviews.
- Wave23 also repairs the Species Knowledge/coverage precedence contract: an explicit object listed in `catalogIdentityCorrectionBaseSpeciesIds` may resolve through its reviewed base authority before a stale direct placeholder; **all other catalog variants retain direct-first/fail-closed behavior**. A temporary broad resolver change was rejected after it incorrectly removed 15 adult-size/tank-size gaps from unreviewed Betta trade morphs.
- `sp_0236` is now **8/8 authoritative + generic-ready**: freshwater; 16–28°C; pH 7–8; max 14 cm; 108 L / 120 cm minimum planning; shoal/community social authority; male-conspecific territoriality; no reviewed fish-predation target.
- Coverage after Wave23: **86 authoritative 8/8 fish / 71 strict generic-ready**; identity/domain held objects **288 -> 287**. Ordinary actionable field backlog remains exactly **336 gaps / 91 catalog objects / 48 base-taxon jobs**, confirming no unrelated variant authority leaked through the correction.
- Global decision impact:
  - decision coverage **44.31% -> 44.46%**
  - `unresolved_identity` **20,919 -> 20,785 (-134 pairs)**
  - total `insufficient_data` **26,673 -> 26,599 (-74 pairs)**
  - `public_evidence_insufficient` **5,754 -> 5,814 (+60)** because resolving identity correctly exposes the next genuine evidence boundary instead of fabricating certainty
  - `missing_species_fact` remains **0**
  - status totals: **355 compatible / 1,886 caution / 19,055 not_recommended / 26,599 insufficient_data**
- Strict fully-informed invariant expands to **71 ready fish = 2,485 unordered pairs = 121 compatible / 997 caution / 1,367 not_recommended / 0 insufficient_data**.
- Repository authority now contains **104 reviewed Profiles** = released target 101 + 3 source-controlled pending identity corrections (`sp_0176`, `sp_0236`, `sp_0407`). Historical release generations remain exact **63 -> 85 -> 95 -> 99 -> 100 -> 101**.
- Historical Wave05 classified `sp_0236` as no-Profile/identity-held. The frozen migration remains unchanged; its regression now generically allows any later explicitly reviewed source-controlled identity correction to supersede an old hold without rewriting historical authority.
- Runtime fail-closed regression was hardened: the invalid 98-Profile case is now built from the explicit released-target keyset rather than array slicing, so future repository growth cannot accidentally turn the test fixture into a valid rollout generation.
- PASS: catalog identity boundaries, identity bridge reviews, Species Knowledge, core-field coverage, rollout window, runtime authority, frozen Wave05 migration, strict fully-informed matrix, V4 readability, user conclusion, release badcases, full `test:backend-release-gate`, API/project TypeScript, Business API bundle, lint, and `git diff --check`.
- NEXT: continue identity-resolution only where a ready base species and exact object-level lineage evidence can be paired. Do not broaden the Albino Red correction to High Fin, Red Apple, or generic swordtail trade morphs.

## CURRENT OVERRIDE — 2026-10-15 Blood Red Asian arowana identity correction wave22 via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. Wave22 is WebCodex / WebCodex-All-Bridge source-controlled candidate work only: **no RDC, Codex agent, push, Vercel deploy, Production alias change, DB migration, or Production authority write**.
- Wave22 continues the systematic identity-resolution lane and resolves exactly one additional catalog object: `sp_0407 血红龙(A级) / Scleropages formosus var. Blood Red A`.
- Exact identity evidence is stronger than the old catalog trade-name hold:
  - Aquaculture Research (2003), **“A strain-specific and a sex-associated STS marker for Asian arowana (Scleropages formosus, Osteoglossidae)”**, explicitly identifies the **blood-red strain** as Asian arowana `Scleropages formosus`.
  - Kementerian Kelautan dan Perikanan fisheries journal (2022), **“Peningkatan Total Karotenoid pada Ikan Arwana Super Red (Scleropages formosus)…”**, explicitly states **Blood Red and Chili Red are first-grade red arowana**, covering the catalog object's Blood Red + A/first-grade wording.
- The correction is deliberately object-scoped. `sp_0408 金头过背金龙 / Gold Head`, `sp_0242 Albino`, and `sp_0284 Silver Platinum` remain fail-closed because equivalent object-level reviewed evidence was not found. Trade/farm pages are not promoted to the same identity threshold.
- Wave22 adds a reusable `catalogIdentityCorrections.ts` aggregation layer so Wave21/Wave22 corrections merge through one runtime set/map rather than requiring each consumer to import individual waves.
- Cross-layer correction map now contains:
  - `sp_0176 -> sp_0446` (Marble angelfish -> reviewed `Pterophyllum scalare`)
  - `sp_0407 -> sp_0103` (Blood Red A -> reviewed `Scleropages formosus`)
- Important systemic repair: reviewed identity-correction Compatibility bridges are now created **after** all base Profile authority patches. This prevents a corrected variant from copying a stale pre-patch base Profile. The bug was exposed because `sp_0407` initially had 8 authoritative fields but missed the later-added `territoriality` required-fact contract and therefore was not generic-ready.
- After the ordering repair, `sp_0407` inherits the final reviewed base Compatibility authority: freshwater; 22–28°C; pH 5–8; max 90 cm; minimum 200 cm tank length; variable social mode; territoriality; small-fish predation risk. It is now **8/8 authoritative + generic-ready**.
- Species Knowledge uses the same explicit identity correction bridge, but preserves its own evidence boundary: `Scleropages formosus` Knowledge V2 still records territoriality as `unknown` while predation risk is high. Wave22 does **not** copy Compatibility-only territoriality into Species Knowledge.
- Coverage after Wave22: **85 authoritative 8/8 fish / 70 strict generic-ready**; identity/domain held objects **289 -> 288**. Ordinary actionable field gaps remain **336**.
- Global decision impact:
  - decision coverage **44.02% -> 44.31%**
  - `unresolved_identity` **21,094 -> 20,919 (-175 pairs)**
  - total `insufficient_data` **26,812 -> 26,673 (-139 pairs)**
  - `public_evidence_insufficient` **5,718 -> 5,754 (+36)** because identity resolution correctly exposes the next evidence boundary for those pairs
  - `missing_species_fact` remains **0**
  - status totals: **355 compatible / 1,812 caution / 19,055 not_recommended / 26,673 insufficient_data**
- Strict fully-informed invariant expands to **70 ready fish = 2,415 unordered pairs = 121 compatible / 946 caution / 1,348 not_recommended / 0 insufficient_data**.
- Repository authority now contains **103 reviewed Profiles** = released target 101 + 2 source-controlled pending identity corrections (`sp_0176`, `sp_0407`). Historical release generations remain exact **63 -> 85 -> 95 -> 99 -> 100 -> 101**; neither correction is silently treated as Production.
- Historical Wave07 originally classified `sp_0407` as a terminal variant hold. The frozen Wave07 authority remains unchanged for audit, while its regression contract now generically allows later explicitly reviewed source-controlled identity corrections to supersede a historical hold.
- PASS: Wave22 object-level identity regressions, catalog identity boundaries, identity bridge reviews, Species Knowledge parity, core-field coverage, fully-informed matrix, V4 readability, user conclusion, rollout window, runtime authority, unified next-wave contract, historical migration/authority contracts, full `test:backend-release-gate`, API/project TypeScript, Business API bundle, lint, and `git diff --check`.
- NEXT: keep prioritizing fish identity holds where a ready base species exists and direct object-level lineage evidence can be found. A high-probability next candidate is reviewed albino `Xiphophorus hellerii` lineage evidence; do not auto-resolve compound swordtail trade names until the exact catalog object wording is defensibly bridged.

## CURRENT OVERRIDE — 2026-10-15 Reviewed identity correction pipeline wave21 via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. Wave21 is WebCodex / WebCodex-All-Bridge source-controlled candidate work only: **no RDC, Codex agent, push, Vercel deploy, Production alias change, DB migration, or Production authority write**.
- Wave21 starts the post-Wave20 main lane: systematic **identity/domain resolution**, not ordinary per-species field completion.
- Global identity/domain decomposition found **290 held catalog objects** before this wave: 125 fish identity holds plus 165 non-fish domain objects (64 plants / 49 invertebrates / 42 corals / 10 reptiles). Non-fish objects remain routed to future domain-specific work rather than being forced through the fish engine.
- First reviewed correction candidate is `sp_0176 黑白大理石神仙 / Pterophyllum scalare var. Marble`. The catalog had incorrectly labeled this fish as `硬景/底床` and carried a historical `catalog_category_mismatch` hold.
- New peer-reviewed identity authority: Indonesian Fisheries Research Journal, **“Reproduction of Three Colour Varieties of Angelfish (Pterophyllum scalare)”**, explicitly treats Black, Black & White, and Marble as colour varieties of `Pterophyllum scalare`. Wave21 therefore resolves **only `sp_0176`**. Other Pterophyllum trade morphs (Red / Blue / Balloon / Platinum Longfin / Super Red etc.) stay fail-closed unless separately bridged.
- A reusable **reviewed identity correction registry** is added:
  - historical raw identity boundary remains preserved for audit;
  - runtime `getCatalogIdentityBoundary` may suppress it only for an explicitly listed later reviewed correction;
  - correction registry maps the corrected catalog object to one reviewed base catalog object for cross-layer authority;
  - scientific-name suffixes / `var.` text alone never trigger inheritance.
- `sp_0176` category is corrected from `硬景/底床` to `慈鲷/斗鱼`, and its incorrect plant/hardscape housing explanation is replaced with fish-specific mixed-tank guidance.
- Compatibility adds an explicit `sp_0176 -> sp_0446` same-species Profile bridge. Species Knowledge V2 uses the same reviewed correction mapping, so Compatibility and Species Knowledge cannot drift apart.
- `sp_0176` becomes **8/8 authoritative + generic-ready** using the already-reviewed `Pterophyllum scalare` authority: freshwater; 24–30°C; pH 6–8; max 15 cm; minimum 100 cm tank length; group social mode; breeding-male territoriality; small-fish predation risk.
- Coverage after Wave21: **84 authoritative 8/8 fish / 69 strict generic-ready**; identity/domain held objects **290 -> 289**. Ordinary actionable field gaps remain **336**, because this wave resolves an identity boundary rather than ordinary field backlog.
- Global decision impact improves:
  - decision coverage **43.87% -> 44.02%**
  - `unresolved_identity` **21,226 -> 21,094 (-132 pairs)**
  - total `insufficient_data` **26,884 -> 26,812 (-72 pairs)**
  - `public_evidence_insufficient` **5,658 -> 5,718 (+60)** because some formerly identity-unknown pairs now correctly expose the next evidence boundary
  - `missing_species_fact` remains **0**.
- Strict fully-informed invariant expands to **69 ready fish = 2,346 unordered pairs = 119 compatible / 911 caution / 1,316 not_recommended / 0 insufficient_data**.
- Release isolation is preserved. The historical released rollout chain remains exact **63 -> 85 -> 95 -> 99 -> 100 -> 101**. The new Wave21 Profile is explicitly registered as **source-controlled pending**, so the complete repository has 102 reviewed Profiles but runtime classifies it as post-target authority growth rather than silently treating it as Production.
- Historical Wave05 and unified migration tests were updated only to allow monotonic later reviewed authority growth; frozen migrations and historical membership/count contracts remain unchanged.
- PASS: catalog identity boundaries, identity-bound bridges, Species Knowledge parity, core-field coverage, fully-informed matrix, V4 readability, user conclusion, runtime authority, rollout window, historical stacked/unified migration contracts, unified next-wave contract, full `test:backend-release-gate`, API/project TypeScript, Business API bundle, lint, and `git diff --check`.
- Data-quality discovery: the incorrect plant/hardscape `housingReason` template appears on many catalog rows, so **do not bulk replace it by string match**. NEXT should audit category/template mismatches as object-level identity candidates, then expand the correction registry only where direct reviewed identity evidence exists.
- NEXT main lane: prioritize other high-impact fish identity holds where a ready base species already exists and a direct object-level trade/variant bridge can be sourced; in parallel, design separate Compatibility domains for plant / invertebrate / coral / reptile rather than forcing those 165 objects through fish semantics.

## CURRENT OVERRIDE — 2026-10-15 Salminus husbandry authority + positive-impact completion cutoff wave20 via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. Wave20 is WebCodex / WebCodex-All-Bridge source-controlled candidate work only: **no RDC, Codex agent, push, Vercel deploy, Production alias change, DB migration, or Production authority write**.
- Wave20 targeted `sp_0173 黄金河虎`. Unified Wave05 had already reviewed the catalog identity and explicitly bound the trade/common-name object to accepted species `Salminus brasiliensis`; this wave does not invent a new variant bridge.
- Targeted re-review of the already-reviewed exact-species Seriously Fish husbandry source promotes three fields that Wave05 had conservatively left unknown:
  - **temperature 22–28°C**
  - **pH 6.0–7.5**
  - **minimum tank length ≈ 610 cm** (source gives roughly 20 ft × 4 ft × 4 ft as a bare minimum and states over 9000 L; the authority records the explicit length and deliberately does not turn “over 9000 L” into a false exact liter threshold).
- `territoriality` is deliberately **not** inferred from aggression. A 2024 Aquaculture International exact-species juvenile culture study documents strong aggression / injury / cannibalism, while the existing husbandry source documents predatory behavior, but neither directly establishes stable territory defense or explicit non-territoriality. Territoriality therefore becomes terminal evidence ceiling `species_territoriality_not_established`.
- `sp_0173` moves **4 authoritative + 4 actionable -> 7 authoritative + 0 actionable + 1 terminal hold**. It is not generic-ready and leaves the ordinary field backlog / base-taxon research plan.
- Wave20 also corrects the historical Wave05 migration regression contract: the frozen migration still owns exactly its original **9 profile-source links**, while the current runtime Profile is explicitly allowed to grow monotonically with later reviewed citations (including `aquaculture-international-salminus-aggression-wave20`). The migration file itself is unchanged.
- Coverage after Wave20: **83 authoritative 8/8 fish / 68 strict generic-ready**, **336 actionable fields across 91 catalog objects**, deduplicated to **48 base-taxon jobs**. Field gaps: `ph 69`, `tank_size 68`, `water 64`, `temperature 62`, `adult_size 58`, `predation 10`, `territoriality 5`, `social_behavior 0`.
- Actionable queue now contains **11 completion-eligible jobs / 11 objects** and **37 terminal-blocked jobs / 80 objects**.
- Global decision coverage remains **43.87%** and `insufficient_data` remains **26,884**: Wave20 does not create any new unknown pair. The stronger Salminus husbandry constraints reclassify **36 pairs from compatible -> caution** (381/1669 -> 345/1705), while `not_recommended` stays 18,961 and unknown reasons stay **21,226 unresolved_identity + 5,658 public_evidence_insufficient + 0 missing_species_fact**.
- Strict fully-informed invariant remains unchanged: **68 ready fish = 2,278 unordered pairs = 116 compatible / 865 caution / 1,297 not_recommended / 0 insufficient_data**.
- PASS: Wave20 source-registry integrity, knowledge evidence ceilings, core-field coverage, fully-informed matrix, user conclusion, release badcases, knowledge coverage, historical Wave05 migration immutability + monotonic runtime-growth regression, full `test:backend-release-gate`, API/project TypeScript checks, Business API bundle, lint, and `git diff --check`.
- **Decision-impact cutoff reached:** after excluding the four already-known predation-only evidence-boundary taxa (`Hypancistrus inspector`, `Moenkhausia sanctaefilomenae`, `Petitella rhodostoma`, `Xiphophorus maculatus`), there are **zero remaining non-Fast-Lane completion-eligible taxa with `affectedUnknownPairs > 0`**. The remaining completion-eligible taxon jobs are zero-impact coverage work under the current decision matrix.
- NEXT: stop spending the main lane on ordinary per-species completion. Shift priority to the much larger **unresolved identity/domain** component of unknown decisions (21,226 pair evaluations) and improve systematic identity resolution / domain routing. Revisit the four predation-only Fast Lane cases only when materially stronger exact-taxon prey-scope evidence appears.

## CURRENT OVERRIDE — 2026-10-15 Acrossocheilus targeted evidence + field-specific terminal ceilings wave19 via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. Wave19 is WebCodex / WebCodex-All-Bridge source-controlled candidate work only: **no RDC, Codex agent, push, Vercel deploy, Production alias change, DB migration, or Production authority write**.
- Wave19 targeted the highest-impact remaining non-Fast-Lane multi-field taxon `sp_0051 Acrossocheilus fasciatus / 光唇鱼`, previously **3/8 authoritative + 5 actionable gaps** (`temperature / ph / tank_size / territoriality / predation`).
- Only one field is promoted: **pH 7.2–7.8** from CN104509469A high-density grow-out husbandry, with CN102090361A independently binding 光唇鱼 to exact `Acrossocheilus fasciatus` and documenting managed breeding pH context.
- Four fields are deliberately **not** force-promoted and instead become explicit terminal evidence ceilings:
  - `temperature` -> `species_temperature_husbandry_not_established`: reviewed exact-taxon sources describe different life-stage/purpose-specific temperatures (seasonal grow-out water, spawning/fry conditions, and a peer-reviewed fry growth optimum), but no single defensible all-stage aquarium planning range.
  - `tank_size` -> `species_space_minimum_not_established`: commercial production-pool dimensions are not a household minimum tank requirement.
  - `territoriality` -> `species_territoriality_not_established`: peer-reviewed behavior supports shoal cohesion/synchronization and individual variation, but not direct territory defense or explicit non-territoriality.
  - `predation` -> `species_fish_predation_not_established`: exact-species diet literature reports plankton for juveniles and mainly attached algae / aquatic-insect larvae / detritus for adults, but absence of fish in a reported diet is not sufficient authority for `targets: []`.
- Evidence-ceiling granularity is now improved systemically: `KnowledgeEvidenceField` retains the legacy `social` bucket but also supports **field-specific `territoriality` and `predation` ceilings**. Compatibility core-field coverage resolves these field-specific ceilings first, then falls back to `social`, so different behavioral unknowns no longer collapse into one ambiguous stop reason.
- `sp_0051` moves to **4 authoritative + 0 actionable + 4 terminal holds** and leaves both the ordinary field backlog and base-taxon research plan. It is **not generic-ready**.
- Coverage after Wave19: **83 authoritative 8/8 fish / 68 strict generic-ready**, **340 actionable fields across 92 catalog objects**, deduplicated to **49 base-taxon jobs**. Field gaps: `ph 70`, `tank_size 69`, `water 64`, `temperature 63`, `adult_size 58`, `predation 10`, `territoriality 6`, `social_behavior 0`.
- Actionable taxon queue now contains **12 completion-eligible jobs / 12 objects** and **37 terminal-blocked jobs / 80 objects**. The next non-Fast-Lane multi-field taxon is `Salminus brasiliensis` (**110 affected unknown pairs; temperature / pH / tank_size / territoriality**).
- Global decision coverage changes **44.02% -> 43.87%** because **72 former caution pairs become `public_evidence_insufficient`** after targeted review proves that the Acrossocheilus all-stage temperature question currently has a real public-evidence ceiling. This is intentional trust behavior, not a regression: ordinary `targeted_source_expansion` remains `research_pending`/caution, while a completed targeted review with a terminal ceiling may surface `暂时无法判断`. `missing_species_fact` remains **0**.
- Current all-catalog pair audit: **381 compatible / 1,669 caution / 18,961 not_recommended / 26,884 insufficient_data**; unknown reasons are **21,226 unresolved_identity + 5,658 public_evidence_insufficient**, with no missing-user-input, missing-species-fact, or other bucket in this static audit.
- The strict fully-informed invariant is unchanged: **68 ready fish = 2,278 unordered pairs = 116 compatible / 865 caution / 1,297 not_recommended / 0 insufficient_data**.
- PASS: field-specific evidence-ceiling regression, historical freshwater authority immutability, core-field coverage, fully-informed matrix, user conclusion, release badcases, knowledge coverage, full `test:backend-release-gate`, historical migration/authority contracts, API/project TypeScript checks, Business API bundle, lint, and `git diff --check`.
- NEXT: keep the four known predation-only Fast Lane boundary cases untouched unless materially stronger exact-taxon evidence appears. Continue with `Salminus brasiliensis`; promote only directly defensible husbandry/behavior fields and terminal-classify genuinely exhausted public-evidence questions rather than forcing 8/8.

## CURRENT OVERRIDE — 2026-10-15 Opsariichthys evidence + runtime authority precedence wave18 via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. Wave18 is WebCodex / WebCodex-All-Bridge source-controlled candidate work only: **no RDC, Codex agent, push, Vercel deploy, Production alias change, DB migration, or Production authority write**.
- Wave18 targeted the next highest-impact non-Fast-Lane base taxon `Opsariichthys bidens`, represented by two exact duplicate catalog objects: `sp_0038` and `sp_0130`.
- Exact managed-husbandry authority from CN110612931B (Zhejiang Academy of Agricultural Sciences / CNIPA) promotes **temperature 18–25°C** and **pH 7.0–8.0** for both objects. This does not reuse FishBase's ecological 10–20°C climate range as a household setpoint; the newer source explicitly maintains parent fish under managed culture conditions.
- Targeted review does **not** force-close the remaining two fields:
  - `tank_size` -> terminal evidence ceiling `species_space_minimum_not_established`: production ponds, broodstock facilities and experimental vessels are context-specific and cannot be converted into a household minimum tank size.
  - `territoriality` -> terminal evidence ceiling `species_territoriality_not_established`: exact research documents chasing, nipping and dominance hierarchy, but does not directly establish territory defense or non-territoriality.
- Each Opsariichthys object moves from **4 supported + 4 actionable unknown** to **6 authoritative + 0 actionable + 2 terminal holds**. Neither becomes generic-ready, and both leave the ordinary backlog / base-taxon research plan so these two evidence-boundary questions are not repeatedly re-researched.
- Wave18 exposed and fixed a systemic runtime authority-precedence defect in `applyCatalogReviewDecisionBoundary`: the old implementation applied a later supported field review and then let any historical `reviewed_unknown` null the value again. Runtime now uses the **latest valid reviewed conclusion per field**. Therefore historical unknown -> later supported grows authority monotonically, while supported -> later unknown still fails closed. Regression coverage now locks both directions.
- This bridge matters operationally: before the fix, Wave18 temporarily created **44 `missing_species_fact`** pair evaluations because `sp_0130` temperature/pH were re-nulled at runtime. After the generic precedence fix, `missing_species_fact = 0`, `insufficient_data` returns to **26,812**, and global decision coverage returns to **44.02%**. With unknown count unchanged, **30 pair decisions move from caution to compatible** because the new managed temperature/pH authority is now actually consumed by Runtime.
- Coverage after Wave18: **83 authoritative 8/8 fish / 68 strict generic-ready**, **345 actionable fields across 93 catalog objects**, deduplicated to **50 base-taxon jobs**. Field gaps: `ph 71`, `tank_size 70`, `water 64`, `temperature 64`, `adult_size 58`, `predation 11`, `territoriality 7`, `social_behavior 0`.
- Actionable taxon queue now contains **13 completion-eligible jobs / 13 objects** and **37 terminal-blocked jobs / 80 objects**. The Opsariichthys objects are terminal-only for their two remaining fields and no longer appear in the actionable queue.
- Fully informed invariant remains **68 ready fish = 2,278 unordered pairs = 116 compatible / 865 caution / 1,297 not_recommended / 0 insufficient_data**.
- PASS: catalog-review monotonic precedence regression, knowledge evidence ceilings, core-field coverage, fully-informed matrix, user conclusion, release badcases, knowledge coverage, next-wave authority protection, full `test:backend-release-gate`, API/project TypeScript checks, Business API bundle, lint, and `git diff --check`.
- NEXT: do not return to the four known predation-only evidence-boundary Fast Lane cases unless materially stronger exact-taxon evidence appears. Highest-impact remaining multi-field actionable taxon is `Acrossocheilus fasciatus` (**175 affected unknown pairs; gaps temperature / pH / tank_size / territoriality / predation**), followed by `Salminus brasiliensis` (**109; temperature / pH / tank_size / territoriality**).

## CURRENT OVERRIDE — 2026-10-15 High-impact koi evidence wave17 via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. Wave17 is WebCodex / WebCodex-All-Bridge source-controlled candidate work only: **no RDC, Codex agent, push, Vercel deploy, Production alias change, DB migration, or Production authority write**.
- Wave17 deliberately moves past the four predation-only Fast Lane evidence-boundary cases and closes the highest-impact multi-field variant job that had defensible reviewed evidence: `Cyprinus carpio`, covering `sp_0069 红白锦鲤` and `sp_0070 蝴蝶鲤`.
- Existing Unified Wave04 identity authority already binds both catalog objects to `baseSpeciesKey: Cyprinus carpio`; Wave17 does not add automatic variant inheritance. Every promoted base-taxon fact is paired with the pre-existing reviewed variant bridge and direct koi-form husbandry coverage.
- Both koi objects close **five fields at once**:
  - `temperature 17.8–23.9°C`, `pH 7.0–8.6`, and `adult_size max 91.4 cm` from PetMD veterinary koi husbandry guidance that explicitly covers **Kohaku** and **Butterfly koi**. The husbandry range is preferred over FishBase's much wider wild survival envelope.
  - `territoriality = non-territorial` from Fishipedia's explicit exact-`Cyprinus carpio` territoriality field, with the reviewed koi variant bridge retained.
  - `predation = small_fish` from peer-reviewed PLOS ONE direct diet evidence: common carp consumed 37–52 mm young-of-year perch during an unusual food-deficit event. The source describes piscivory as extremely rare, so authority is narrowly scoped to `small_fish`; koi are not characterized as routine piscivores.
- `sp_0069` and `sp_0070` move **3/8 -> 8/8** and become generic-ready. This single base-taxon job removes **10 actionable field gaps**.
- Coverage after Wave17: **83 authoritative 8/8 fish / 68 strict generic-ready**, **353 actionable fields across 95 catalog objects**, deduplicated to **51 base-taxon jobs**. Field gaps: `ph 73`, `tank_size 72`, `temperature 66`, `water 64`, `adult_size 58`, `predation 11`, `territoriality 9`, `social_behavior 0`.
- Decision coverage rises to **44.02%**. Decision-impact partition is **14 completion-eligible jobs / 15 objects** and **37 terminal-blocked jobs / 80 objects**.
- Fast Lane remains the same four deliberate predation holds: `sp_0011`, `sp_0062`, `sp_0125`, `sp_0433`; Wave17 does not weaken those evidence boundaries.
- Fully informed invariant expands to **68 ready fish = 2,278 unordered pairs = 116 compatible / 865 caution / 1,297 not_recommended / 0 insufficient_data**.
- PASS: core-field coverage, fully-informed matrix, user conclusion, release badcases, knowledge coverage, full `test:backend-release-gate`, historical migration/authority contracts, API/project TypeScript checks, Business API bundle, lint, and `git diff --check`.
- NEXT: continue multi-field completion rather than rechecking the four known evidence-boundary holds. Highest remaining non-Fast-Lane total decision impact is `Opsariichthys bidens` (**218 affected unknown pairs across two catalog objects; gaps: temperature / pH / tank_size / territoriality**), followed by `Acrossocheilus fasciatus` (**175; five gaps**) and `Salminus brasiliensis` (**109; four gaps**). Promote only fields backed by exact/base-taxon reviewed evidence plus an explicit object bridge where required.

## CURRENT OVERRIDE — 2026-10-15 Predation evidence wave16 via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. Wave16 is **WebCodex / WebCodex-All-Bridge only**, source-controlled/local candidate work. No RDC, Codex agent, push, Vercel deploy, Production alias change, DB migration, or Production authority write.
- Wave16 closes the final predation gap for exactly two 7/8 objects at the narrow `fish_fry` scope:
  - `sp_0052 Corydoras hastatus`: the 2024 peer-reviewed JAALAS husbandry protocol explicitly names `Corydoras hastatus` and states that this smaller species is less likely to consume its own eggs and fry, while only a small number of fry survive when eggs remain with adults. This supports a non-zero fry-consumption risk but does **not** support juvenile/adult small-fish predation.
  - `sp_0151 Gymnocorymbus ternetzi var. Color morph`: Tropical Fish Hobbyist explicitly lists white skirt / blueberry / strawberry / mixed berry names under `Gymnocorymbus ternetzi`, directly bridging the catalog color morph, and states that parents are voracious predators on eggs and fry. Scope remains `fish_fry` only.
- These two objects move **7/8 -> 8/8** and become generic-ready. Coverage is now **81 authoritative 8/8 fish / 66 strict generic-ready**, with **363 actionable fields across 97 catalog objects**, deduplicated to **52 base-taxon jobs**. Field gaps: `ph 75`, `tank_size 72`, `temperature 68`, `water 64`, `adult_size 60`, `predation 13`, `territoriality 11`, `social_behavior 0`.
- Fast Lane falls **6 -> 4**, all still missing only predation: `sp_0011 Xiphophorus maculatus`, `sp_0062 Moenkhausia sanctaefilomenae`, `sp_0125 Hypancistrus inspector`, `sp_0433 Hemigrammus rhodostomus / Petitella rhodostoma`.
- The remaining four are deliberately **not** force-closed:
  - `sp_0011`: exact husbandry sources conflict on whether adults eat fry, so the current binary prey contract cannot safely choose a value.
  - `sp_0062`: strong exact sources support egg predation, but not a clean fish-fry scope; weaker fry claims are insufficient to override that boundary.
  - `sp_0125`: exact sources support “not a predator toward small fish” / non-fish stomach contents, but do not directly establish fry safety; `targets: []` would overstate the evidence.
  - `sp_0433`: strong exact sources support egg predation, while fry claims are weaker/group-level or secondary; no egg target exists and egg evidence is not promoted to `fish_fry`.
- Decision-impact partition is now **15 completion-eligible jobs / 17 objects** and **37 terminal-blocked jobs / 80 objects**. The four remaining Fast Lane taxa each affect 175 currently unknown pair evaluations and remain the highest near-ready evidence targets.
- Fully informed invariant expands to **66 ready fish = 2,145 unordered pairs = 116 compatible / 865 caution / 1,164 not_recommended / 0 insufficient_data**. Fry-only authority does not create ordinary adult-fish predation blocks.
- PASS: core-field coverage, fully-informed matrix, user conclusion, release badcases, knowledge coverage, Unified Wave16 monotonic-authority check, full `test:backend-release-gate`, project/API TypeScript checks, Business API bundle, lint, and `git diff --check`.
- NEXT: do not repeatedly re-research the four unresolved Fast Lane taxa from the same weak/ambiguous sources. Continue only if a stronger exact-taxon source resolves their specific predation scope; otherwise shift research effort to the next high-impact multi-field completion-eligible taxon.

## CURRENT OVERRIDE — 2026-10-15 Behavioral evidence wave15 via WebCodex (NOT RELEASED)

- Active branch remains `codex/compatibility-research-runtime-20261014`. Wave15 was performed through **WebCodex / WebCodex-All-Bridge only** and is source-controlled/local candidate work: no RDC, Codex agent, Vercel deployment, Production alias change, DB migration, or Production authority write.
- Wave15 closes **territoriality only** for three exact taxa using direct Fishipedia territoriality fields: `sp_0052 Corydoras hastatus` = non-territorial, `sp_0062 Moenkhausia sanctaefilomenae` = non-territorial, and `sp_0125 Hypancistrus inspector` = territorial. Peaceful/community/diet wording is not promoted into predation authority.
- All three objects move from 6/8 to **7/8**. Their remaining `predation` field stays fail-closed until direct fish-prey authority exists; none is promoted to generic-ready from this wave.
- Current coverage after Wave15: **79 authoritative 8/8 fish / 64 strict generic-ready**, **365 actionable fields across 99 catalog objects**, deduplicated to **54 base-taxon jobs**. Field gaps: `ph 75`, `tank_size 72`, `temperature 68`, `water 64`, `adult_size 60`, `predation 15`, `territoriality 11`, `social_behavior 0`.
- Fast Lane now contains six 7/8 objects, all missing only predation: `sp_0011`, `sp_0052`, `sp_0062`, `sp_0125`, `sp_0151`, `sp_0433`. The older three retain their prior conflict/variant/life-stage holds; the new three require direct exact-taxon fish-prey evidence rather than inference.
- Decision-impact partition remains **17 completion-eligible jobs / 19 objects** and **37 terminal-blocked jobs / 80 objects**. The highest near-ready impact is now the six predation-only taxa.
- Fully informed invariant remains **64 ready fish = 2,016 unordered pairs = 89 compatible / 827 caution / 1,100 not_recommended / 0 insufficient_data**.
- PASS: core-field coverage, fully-informed matrix, user conclusion, release badcases, knowledge coverage, V4 shadow/live/product/readability, result-card, runtime/rollout/migration/next-wave authority checks, full `test:backend-release-gate`, project/API TypeScript checks, Business API bundle, lint, and `git diff --check`. The locally missing locked Express transitive dependency (`accepts@1.3.8`) was restored from the existing npm cache without changing `package.json` or `package-lock.json`.
- NEXT: continue predation-only exact-taxon research for the six 7/8 Fast Lane objects without weakening the evidence contract. Do not deploy, migrate, or write Production authority as part of this checkpoint.

## CURRENT OVERRIDE — 2026-10-15 Numeric evidence wave14 via WebCodex (NOT RELEASED)

- Active branch: `codex/compatibility-research-runtime-20261014`. This checkpoint was continued through **WebCodex / WebCodex-All-Bridge only**. No RDC, Codex agent, Vercel deployment, Production alias change, DB migration, or Production authority write is part of Wave14.
- Wave14 does **not** force-close the three remaining predation-only Fast Lane objects. `Xiphophorus maculatus` has conflicting fry-safety claims, `Gymnocorymbus ternetzi var. Color morph` still requires an explicit variant bridge, and `Hemigrammus/Petitella rhodostomus` has egg-predation evidence that does not map cleanly to the current fish life-stage contract. They remain fail-closed.
- Wave14 instead closes `sp_0022 Lutjanus kasmira`, previously 3/8. Aquarium-specific long-term parameters come from exact-species LiveAquaria guidance: 72–78 °F (deterministically converted to 22.2–25.6 °C), pH 8.1–8.4, and minimum 300 US gal (≈1135.6 L, rounded conservatively to 1136 L). The broader natural Fishipedia temperature range is deliberately not substituted for aquarium husbandry temperature authority.
- Exact Fishipedia behavior evidence marks `Lutjanus kasmira` non-territorial while separately describing it as an ambush predator attacking smaller animals within reach. The predation authority is therefore scoped to `small_fish`; non-territoriality does not erase general aggression/predation risk.
- The Wave14 profile patch synchronizes all eight required facts and sets reviewed `small_fish` prey scope. `Lutjanus kasmira` is now 8/8 and generic-ready.
- Current coverage after Wave14: **79 authoritative 8/8 fish / 64 strict generic-ready**, **368 actionable fields across 99 catalog objects**, deduplicated to **54 base-taxon jobs**. Field gaps: `ph 75`, `tank_size 72`, `temperature 68`, `water 64`, `adult_size 60`, `predation 15`, `territoriality 14`, `social_behavior 0`.
- Decision-impact queue is now **17 completion-eligible jobs / 19 objects** and **37 terminal-blocked jobs / 80 objects**. The three predation-only Fast Lane objects remain unchanged.
- Fully informed invariant expands to **64 ready fish = 2,016 unordered pairs = 89 compatible / 827 caution / 1,100 not_recommended / 0 insufficient_data**.
- Domain Rules, Tank Engine, generic/blind onboarding, core-field coverage, decision-impact queue, fully-informed matrix, user conclusion, release badcases, knowledge coverage, research dry-run, domain boundaries, symmetry, result-card, presentation, lint, Web production build, Business API build and `git diff --check` all pass under WebCodex. NEXT: continue exact-taxon completion work by decision impact; do not broaden prey vocabulary or life-stage modeling solely to make backlog numbers smaller.

## CURRENT CHECKPOINT — 2026-10-14 Compatibility research batch dry-run infrastructure (NOT RELEASED)

- Active branch: `codex/compatibility-research-batch-dryrun-20261014`. This checkpoint is read-only research infrastructure: no reviewed authority write, Supabase mutation, Production migration, release-branch cutover, UI or Vision change.
- Latest source-controlled coverage plan is **606 actionable core-field gaps collapsed into 75 base-taxon research jobs covering 129 catalog objects**: 55 exact-taxon jobs and 20 base-taxon candidate jobs whose variant fields still require explicit reviewed variant bridges. Current field gaps are tank_size 116, pH 112, temperature 107, adult_size 93, water 85, territoriality 41, predation 36, social_behavior 16.
- Added permanent command `npm run dryrun:compatibility-research-batch -- --concurrency=4`. It dynamically rebuilds the current taxon plan, runs `GBIF exact identity -> Bailian trusted-source research -> deterministic packet assessment`, writes only a gitignored evaluation report, and declares `writesAuthority=false`.
- Batch statistics deliberately separate exact-taxon potential closures from variant candidate evidence. Base-taxon evidence for a variant can increase `variantCandidateFieldHits`, but never `potentialCatalogFieldClosures`; no variant fact is auto-promoted. Per-field requested gaps / potential closures / variant candidates and verified-source publisher hit counts are emitted for audit.
- A permanent contract test proves the runner is read-only and contains no admin Supabase/service-role or insert/update/upsert/delete path. The test is part of `test:backend-release-gate`.
- Full real 75-job hit-rate numbers are **not claimed yet**. Current Mac outbound TLS fails before reliable dispatch to Alibaba Model Studio and public research sites; a corrected Vercel Preview diagnostic could not be redeployed because the team hit the >100 free deployments/day cap. The existing protected admin research API correctly requires a real Supabase admin session and was not bypassed. GitHub Actions currently exposes no AI research secret. These are execution-environment blockers, not counted as provider misses or evidence ceilings.
- Temporary local/Vercel canary files were removed. When an external runtime with working network + existing research credentials is available, the supported runner can execute the full 75-job plan without code changes and produce `evaluation/reports/compatibility-research-dryrun.json`.

## TOP CURRENT OVERRIDE — 2026-10-13 Compatibility V4 Bailian free-quota model pool

- Active ## CURRENT OVERRIDE — 2026-10-15 Compatibility coverage reconciliation + scoped territoriality (NOT RELEASED)

- Active branch is `codex/compatibility-research-runtime-20261014`. This checkpoint is source-controlled/local only: **no Vercel deployment, Production alias change, DB migration, Production authority write, RDC, or Codex agent** is part of this work.
- Coverage precedence is corrected so a historical field-level `reviewed_unknown` cannot permanently suppress later explicit reviewed Species Knowledge / Compatibility Profile authority. Predation coverage also no longer treats `predationVulnerability` (“容易被吃”) as evidence of `predationRisk` (“会不会捕食别的鱼”).
- Current source-controlled coverage is **71 fish with authoritative 8/8 core fields and 56 strict generic-ready fish**. Actionable backlog is **494 fields across 113 catalog objects**, deduplicated to **68 base-taxon research jobs**. Field gaps: `tank_size 104`, `ph 101`, `temperature 96`, `adult_size 83`, `water 69`, `territoriality 21`, `predation 19`, `social_behavior 1`.
- Fast Lane now contains exactly four 7/8 fish, all missing only direct fish-predation authority: `sp_0011 Xiphophorus maculatus`, `sp_0013 Otocinclus vittatus`, `sp_0151 Gymnocorymbus ternetzi color morph`, and `sp_0433 Hemigrammus rhodostomus`. Do **not** close these from generic peacefulness, diet labels, herbivory/omnivory, or prey vulnerability.
- `sp_0013 Otocinclus vittatus` now has exact-taxon reviewed authority for a 60 L minimum, group planning with minimum 6, and explicit non-territoriality; predation deliberately remains unresolved. `sp_0438 Xiphophorus hellerii` is now 8/8 + generic-ready with scoped `male_conspecific_territoriality`; the authority is limited to male/intraspecific competition and must not be widened into generic interspecific aggression.
- Deterministic Domain Rules move to `compatibility-domain-v10-scoped-territoriality`: conspecific/intraspecific territorial traits trigger same-species caution (including quantity >1) but do **not** leak into interspecific territorial pressure. Real red-swordtail runtime acceptance: quantity 1 in a sufficiently large configured tank is compatible; quantity 2–3 produces `caution + territorial_conflict` with no missing-data result.
- Fully informed acceptance remains strict: all **56 generic-ready fish = 1,540 unordered pairs**, with **0 `insufficient_data`** under complete tank inputs. Current distribution after scoped-territoriality recognition is `61 compatible / 745 caution / 734 not_recommended / 0 insufficient_data`. Release badcases, user conclusion contract, generic onboarding, blind auto-onboarding, knowledge coverage, research dry-run, lint, Business API build and `git diff --check` all pass.
- Commits `6127eba1` (reviewed coverage reconciliation) and `c2b174c3` (swordtail territoriality closure) are already on the current remote branch. NEXT after this checkpoint: keep the four Fast Lane predation items fail-closed unless direct exact-taxon prey-scope evidence is found; then prioritize the remaining 68 base-taxon jobs by decision impact rather than returning to per-species manual crawling.

branch: `codex/compatibility-v4-bailian-deepseek-20261013`; continue this branch as the Compatibility AI acceptance authority.
- The mechanical promotion queue is complete (`next_wave_species_count = 0`), so current work moves from breadth expansion to AI-assisted combination reasoning.
- Added server-only Compatibility V4 shadow reasoner. Authority remains `deterministic hard rules / reviewed Pair Rules > AI`; AI cannot change the final compatibility decision.
- AI runs only for `decisionReadiness=reviewed` combinations whose participating objects all have exact reviewed Profiles plus runtime reviewed Species Knowledge. Missing authority skips the provider instead of guessing.
- Provider output is strict JSON and must use only allow-listed rule codes/evidence IDs. Hard-block weakening, caution→compatible upgrades, insufficient-data overrides, invented evidence, schema failure and provider failure are rejected/fail-soft.
- Authenticated shadow endpoint: `GET /aquariums/:id/compatibility-ai-shadow/:speciesCatalogKey?catalogVersion=...`. It returns deterministic `finalDecision`, separate AI assessment and provenance.
- Added deterministic 3-species shadow eval artifacts covering reviewed compatible / caution / not_recommended plus unknown insufficient_data. Current result: 4 cases, AI accepted 2 / rejected 1 / skipped 1, and 0 final-decision mutations.
- Existing local Bailian credential is reused only through ignored Aqua `.env.local`; the key is never printed or committed. Compatibility is now isolated from the global text model with `COMPATIBILITY_AI_MODEL` plus ordered `COMPATIBILITY_AI_FALLBACK_MODELS`.
- Current local pool is `qwen3.7-flash-2026-07-15` → `qwen3.8-27b` → `deepseek-v4.1-flash`. The soonest-expiring Qwen Flash quota is consumed first; quota/access/rate-limit/timeout/invalid-response/model-HTTP failures automatically advance to the next model.
- Qwen 3.x and DeepSeek V4 Compatibility requests send `enable_thinking=false`; live canaries prove both Qwen 3.x models pass guarded under the strict JSON contract. `kimi-k3` remains excluded because the current workspace endpoint rejects that model code despite visible account quota.
- DB-independent real 4-case canary reuses the production deterministic engine + generic combination reasoner with real reviewed catalog data. Current Qwen 3.7 run returns `pass_guarded`: all 3 reviewed states accepted with grounded reasons, both risk states include actionable adjustments, the insufficient-data case skips AI, and final-decision mutations remain 0. The new product-assessment contract also passes on on-demand 3-species aggregation and deterministic fallback behavior.
- Canary/readiness observability exposes ordered fallbacks, actual model per case, reasons/adjustments/uncertainties, provider-call count, and bounded repair count. The default run uses Qwen 3.7; a forced unsupported primary currently recovers through Qwen 3.8 and still passes all reviewed cases with 0 final-decision mutations.
- Authenticated secret-free readiness endpoint remains `GET /api/v1/aquariums/compatibility-ai-readiness`; no credential is exposed. Vercel CLI auth is now verified and the Bailian key/base URL plus generic and Compatibility-specific model settings are configured for both Preview and Production scopes. They take effect on new deployments; no Production redeploy is authorized/performed in this checkpoint.
- Remote Vercel provider acceptance is now proven on a temporary Preview-only canary and the temporary source was removed afterward: `qwen3.7-flash-2026-07-15` returned HTTP 200 in ~4.1s, preserved guarded `caution`, and produced 3 reasons + 4 actionable adjustments. No key/value secret was returned or committed.
- Compatibility prompt/validation is now V2: caution/not_recommended outputs must include a grounded action. A single bounded repair pass may correct schema or missing-action defects only; unknown authority and deterministic-authority conflicts remain immediate rejects and are never repaired into a different conclusion.
- The authenticated Compatibility AI shadow route remains GET/read-only. Contract tests assert that its route body contains no insert/update/delete/upsert calls.
- Added product-facing whole-tank endpoint `GET /aquariums/:id/compatibility-assessment?catalogVersion=...&planned=speciesCatalogKey:quantity`. It reads the current tank plus optional planned additions, merges duplicate quantities, runs `evaluateCompatibilityDecision` on the runtime combination, then asks AI to explain that aggregate result. No predefined/pre-enumerated species combination table is required.
- Product response now has a strict two-layer contract. Default `main` contains only user-facing `judgment / why / howTo` with the four fixed labels `可以养 / 有条件可以 / 不建议 / 暂时无法判断`; technical grounding, AI provenance, rule codes, evidence and uncertainty remain under `details -> 查看依据`. AI narrative is considered only when its verdict exactly matches deterministic authority and its sentence passes a short plain-language readability gate; otherwise `main` uses curated deterministic copy.
- Whole-tank product assessment stays fail-closed: unresolved Catalog identities reject before evaluation; `decisionReadiness != reviewed` skips the model; the product returns deterministic missing-information/uncertainty instead of asking AI to guess. Both legacy single-candidate shadow and new multi-species product endpoint remain GET/read-only.
- Added a real-catalog readability audit covering 20 combinations: 5 `compatible`, 5 `caution`, 5 reviewed `not_recommended`, and 5 `insufficient_data`. Every default sentence must be short, reject rule/model/system jargon and snake_case, risk states must contain an executable action, and insufficient-data cases must say what is missing without invoking AI.
- Rechecked the live Qwen path through the new product layer. A caution case now surfaces one direct risk sentence plus concrete prevention/observation actions; a not-recommended case surfaces the actual temperature conflict and tells the user to separate or choose species with closer temperature needs. Technical or overly long AI prose stays in `details` instead of leaking into the main result.
- The Git Preview itself is healthy (`/` HTTP 200), while `/api/v1/business-health` reports `databaseConfigured=false`. Under the current project constraint this is a known infrastructure coverage gap, not a Compatibility AI release blocker: Preview login + Supabase user-data loading is not covered there, but the core compatibility engine, real-model reasoning, fallback, grounding, action quality and read-only invariants are covered without a staging DB.
- Do not attach Preview to Production Supabase merely for testing and do not require a new staging DB for this checkpoint. When Production promotion is separately authorized, validate the deployed Compatibility AI endpoint with a read-only smoke test against an existing aquarium; no write operation is part of the AI flow.
- Static candidate remains 101 Profiles / 21 Pair Rules / 1 Stage Risk / 177 evidence. Production remains 60 migrations / 63 Profiles / 21 Pair Rules / 1 Stage Risk / 116 evidence. User has now explicitly continued after the user-readable result checkpoint, so **only the existing Compatibility/add-species result card may receive minimal UI wiring for `判断 / 为什么 / 怎么做 / 查看依据`**. No broader UI redesign, Vision work, Production mutation/deploy, DB migration, or merge/main is authorized.
- That limited result-card wiring is now implemented and validated: the add-species planner uses a single whole-tank `CompatibilityDecision` for overall status/policy, renders only `判断 / 为什么 / 怎么做` by default, moves per-species/rule/AI support into `查看依据`, and removes the old fake `AI 建议` preview button. Local/Preview mode returns deterministic readable copy immediately; authenticated cloud mode may replace only the explanation through the read-only whole-tank endpoint when remote deterministic authority exactly matches the local status. `test:compatibility-result-card`, project/API typechecks and the full backend release gate pass.
- Real user-path acceptance for `规划想养的生物 → 混养判断 → 返回调整 → 改组合 → 重新计算` is now covered by browser E2E. All result exits/edits go through one reset helper that invalidates pending async explanation requests and clears loading/product/review state, preventing stale AI text from reappearing after the user changes the plan. Result tone is now distinct by status (emerald compatible / amber caution / sky insufficient / red not-recommended), and the badge explicitly says when the result has combined planned additions with the current tank.
- Complex whole-tank acceptance is now covered with real 4–5 species combinations across `compatible / caution / not_recommended / insufficient_data`. Result/evidence ordering dedupes synonymous rules by risk family before taking the visible slots, so repeated water-type or temperature variants can no longer hide a second major conflict such as predation or single-housing. For hard-block combinations, the two default actions now follow the same deterministic family priority as the rules; generic matching AI prose cannot displace either of the top deterministic reasons.
- Current+planned provenance is now exact even when the same species already exists in the aquarium and the user plans to add more: the read-only product context returns `origin=mixed` plus `existingQuantity` and `plannedQuantity`, the AI prompt receives that source split, and the evaluator still treats a mixed row as a candidate because it contains a planned addition. Duplicate planned query tokens are also capped after aggregation so one species cannot exceed the 500-item request bound by splitting it across tokens.
- The same product endpoint now has an explicit `current_tank` mode when no planned species are supplied. Current-only assessments keep the four existing verdict labels but use `record_existing` authority (`addPolicy=allow`), suppress add/wishlist actions, and rewrite `why/howTo` plus AI context around species already present instead of telling the user to “add / stop adding / put on wishlist”. Planned or mixed requests remain `planned_addition`.
- Existing livestock quantities from the database now fail closed if they violate the authoritative `integer > 0` schema contract; the read path no longer silently converts invalid values to `1`. Focused regression also covers an 8-species current tank (28 unordered pair evaluations) and preserves reviewed whole-tank aggregation without prebuilding combinations.
- The Compatibility product response is now explicitly versioned with `schemaVersion=1` plus `assessmentMode`. The add-species client accepts cloud enrichment only when both match the expected `planned_addition` contract; unknown schema versions, `current_tank` responses, non-deterministic authority or status mismatches all fail closed to the immediate local deterministic result. A full-repo consumer scan found no remaining runtime dependency on the obsolete flat `judgment/reasons/adjustments/nextAction` response shape.
- Product assembly no longer masks an internal authority divergence by rewriting `decision.status`. If the wrapper status and canonical aggregate `finalDecision.status` ever disagree, the builder throws `COMPATIBILITY_AUTHORITY_STATUS_MISMATCH` instead of emitting a plausible-looking response. Focused regression locks this invariant.
- Generic new-species onboarding is now a formal Compatibility authority contract instead of another pair-wave process. After the complete 101-Profile baseline is present, reviewed authority may grow monotonically with additional Profiles (`post-target-superset`) without adding a new hard-coded rollout generation or an ordinary Pair Rule. Each new Profile must declare the eight generic fact families `water / temperature / ph / adult_size / tank_size / social_behavior / territoriality / predation`; baseline Pair Rules stay reviewed exceptions/supplements.
- Domain execution now checks declared measurable required facts at runtime. Missing reviewed water/temperature/pH/adult-size/tank-size data produces explicit `required_fact_*_missing`, forces `insufficient_data/partial`, and tells the user which core knowledge is missing instead of inferring a verdict. Reviewed neutral behavioral findings remain valid reviewed assertions rather than being misclassified as missing simply because no positive risk flag exists.
- Compatibility actions now carry an explicit Action Contract: `authorityLevel / sourceRuleCodes / evidenceIds / stopCondition` in addition to immediate action and observation. Unsourced fixed `3–7 天` observation windows were removed; hard blocks, reviewed numeric parameters, risk-management actions and information-required actions are distinguished so AI cannot invent thresholds.
- Permanent `test:compatibility-generic-species-onboarding` proves a synthetic future reviewed Profile joins runtime authority with zero new Pair Rules, generic traits alone produce compatible and temperature-block verdicts, missing a core trait fails closed, and a real no-Pair combination produces a sourced executable action with observation + stop condition. It is now part of `test:backend-release-gate`; focused tests, API/project typechecks and the full backend release gate pass. No UI, Vision, Production DB, Production deploy or main-merge work is included.
- Field-oriented Compatibility coverage is now source-controlled across all 486 catalog objects × the eight generic core fields. The matrix separates field-level reviewed support, reviewed neutral/negative findings, reviewed unknowns, actionable `needs_research`, identity/domain holds and hardscape `not_applicable`; ordinary Pair Rules are not generated by this process.
- Current matrix: 312 fish total; 125 fish are held by explicit identity boundaries, leaving 187 fish in the field-coverage research domain. Fast-Lane provenance reconciliation plus the current source-expansion pass now raise authoritative 8/8 core-field coverage from 33 to 42 fish and strict generic-onboarding readiness from 30 to 40. Two core-complete historical Macropodus Profiles (`sp_0043` / `sp_0044`) remain outside generic-ready because their immutable Production migration owns the older FishBase evidence IDs while later Species Knowledge uses batch18 aliases; this pass does not rewrite historical migration authority merely to improve a readiness count. Fourteen fish remain exactly one core field short. Resolved runtime reviewed Profiles still cover 137 catalog objects through direct/inherited authority.
- The actionable field backlog is now 636 field gaps, down from 645 at the start of this Fast-Lane pass. Nine one-field-away fish were closed without Pair Rules: panda cory and angelfish gained direct reviewed territoriality authority; six earlier fish plus Platinum three-spot gourami (`sp_0156`) gained reviewed neutral fish-predation authority only where exact-taxon diet plus community/tankmate evidence directly supports no generic fish-prey target. `sp_0156` retains male territoriality/breeding aggression as separate risks; omnivory itself was not used as a predation shortcut. Generic aggression, peacefulness, diet labels, or species names were not converted into territoriality/predation. Current gap counts are `tank_size 119`, `ph 114`, `temperature 109`, `adult_size 95`, `water 87`, `territoriality 53`, `predation 41`, `social_behavior 18`.
- Generated artifacts are `docs/compatibility_core_field_coverage.json`, `.csv`, `docs/compatibility_core_field_backlog.json`, plus `docs/compatibility_fast_lane_research_packets.json`. The Fast Lane packet file now isolates 14 one-field-away fish: 3 predation / 1 tank_size / 10 territoriality. Packet provenance resolution now merges Profile citations with the global reviewed Knowledge-source registry, so all 14 packets resolve their field-level evidence IDs to clickable source metadata; field-review-only evidence no longer appears as an empty source list. The remaining packets are genuine evidence work rather than stale synchronization: the tank-size ceiling for `sp_0198` has no reviewed numeric minimum, and the remaining territoriality/predation packets are not promoted from generic aggression/peacefulness/diet wording. Source-quality audit still holds `sp_0187` Atlarium as migration-owned AI-generated evidence: do not promote new facts from it until a separately authorized source-cleanup migration.
- `暂时无法判断` is now narrowed by `compatibility-domain-v9-decision-critical-readiness`. An internal `targeted_source_expansion`/review backlog no longer erases an otherwise usable verdict: if that missing fact is actually encountered by the current decision it becomes conservative `caution/partial` (`review_pending_*`); hard biological conflicts still outrank it as `not_recommended`. `insufficient_data` is reserved for genuine required user/tank inputs, unresolved catalog identity, true public-evidence ceilings, malformed reviewed authority, or legacy inputs with no source/coverage metadata.
- Coverage disposition is now passed into the deterministic engine per species/fact instead of treating all missing facts alike. Exact/inherited reviewed Profiles remain authoritative over generic field-backlog/domain placeholders, including reviewed variant bridges; only identity boundaries that still lack a reviewed bridge remain fail-closed. Reviewed measurable required facts that are genuinely absent still fail closed, while non-critical catalog research gaps stay out of the overall verdict.
- Permanent readability acceptance now audits every unordered pair among the current 113 fish objects with resolved reviewed Compatibility Profiles (6,328 pairs) under a fully configured large-tank fixture. Current checkpoint: 0/6,328 return `暂时无法判断`; reviewed variant bridges no longer get reclassified as unresolved identity, and no reviewed pair becomes unknown solely because internal review work is pending. The earlier pre-v9 audit was 372/6,328 (`5.88%`). This is a regression/audit measure under a fully configured fixture, not an estimate of real-user traffic; `暂时无法判断` remains available for actual missing user/tank inputs, genuinely unresolved identities and true reliable-public-evidence ceilings.
- User-facing unknown copy now distinguishes cause: missing user/tank information asks the user to fill the needed input; unresolved identity asks for an exact species/name; true public-evidence ceilings explicitly say the limitation is in reliable public sources rather than implying the user forgot to configure something. No Production/UI/Vision change is part of this checkpoint.
- Launch badcase acceptance is now source-controlled by `test:compatibility-release-badcases` and is part of `test:backend-release-gate`. Ten release scenarios bind together hard predation blocks, one-sided territorial pressure, breeding-only territorial activation, genuine missing tank input, unresolved catalog identity, true public-evidence ceilings, whole-tank multi-species aggregation, duplicate-species normalization, adjustable-load recovery, and the normal compatible path. Every accepted Action Contract must expose an immediate action, a recheck/observation point, a stop condition, deterministic source rule codes, and evidence IDs.
- The badcase pass caught and fixed an Action Contract provenance mismatch for `insufficient_data`: identity/public-evidence headlines were previously selected from deterministic domain codes while `sourceRuleCodes` could point only to secondary missing fields such as behavior review or equipment. Critical identity/public-evidence domain codes now lead the action provenance, with deterministic evidence preserved; hard-block and unavailable actions also carry explicit recheck points. This changes explanation/provenance alignment only and does not loosen deterministic verdicts.

## CURRENT CHECKPOINT — 2026-10-14 Compatibility taxon research-plan convergence (NOT RELEASED)

- Active branch: `codex/compatibility-taxon-research-plan-20261014`, based on current `main@a90fbcd7`. Production remains unchanged on the separate `release/production` line; this checkpoint performs no DB migration, reviewed-authority write, Production deployment or alias cutover.
- Fresh source-controlled coverage now excludes two historically misclassified coral objects (`sp_0332` Palythoa sp. and `sp_0336` Tubastraea coccinea) from the fish research queue. `getLifeType()` recognizes both coral genera and field coverage now gives explicit reviewed `compatibilityDomainBoundary` authority precedence over stale catalog categories. All 95 reviewed non-fish domain holds are terminal for the eight fish-only core fields.
- Actionable fish backlog is now **606 fields across 129 catalog objects** (previously 622 / 131). Field gaps: tank_size 116, pH 112, temperature 107, adult_size 93, water 85, territoriality 41, predation 36, social_behavior 16.
- New source-controlled `docs/compatibility_taxon_research_plan.json` deduplicates source discovery by biological base taxon: **129 catalog objects collapse to 75 taxon research jobs**. Twenty jobs contain variants. Base-taxon evidence is discovery-candidate material only for those variants and **must never auto-promote**; every affected field still requires a reviewed field-scoped variant bridge or variant-specific evidence.
- Read-only trusted-source probe over the current 129 actionable objects found at least one exact-scientific-name page for **56 objects** (Fishipedia 51, Seriously Fish 41, Animal Diversity Web 9). Page text contains 230 candidate gap hints: tank_size 43, temperature 42, pH 34, adult_size 33, territoriality 28, water 26, social_behavior 15, predation 9. These are discovery measurements only, not reviewed facts.
- Real AI batch extraction could not be completed from this workstation because Alibaba endpoints fail locally at TLS, Vercel Preview creation is currently blocked by the Free deployment-per-day limit, GitHub Actions has no AI secrets, and Vercel AI Gateway accepted refreshed OIDC but requires customer billing verification. None of those external limitations is counted as evidence or provider success, and no paid dependency was added.
- Validation PASS: taxonomy, all 95 domain-boundary contracts, core-field coverage snapshot/plan invariants, project TypeScript, `git diff --check`, and full `BACKEND_RELEASE_GATE=PASS`. Coverage artifact audit confirms exactly 95 changed rows are non-fish domain-boundary rows and **0 fish rows changed authority behavior**.
- NEXT: use the 75-job taxon plan as the batch research input when a live extraction environment is available; review 20 variant bridge groups separately. Do not return to per-species/per-field manual crawling and do not auto-copy base-taxon facts into variants.

## CURRENT OVERRIDE — 2026-10-14 Compatibility Production authority convergence

- **FINAL RELEASE STATE (supersedes all earlier 2026-10-14 staging / NOT RELEASED notes below):** business/runtime release is `d1229ee622a5b608f394f33e5f87095b316af48f`. At runtime cutover, `origin/main = origin/release/production = d1229ee6`; Vercel deployment `dpl_7NuvxYjrYnPRVUvu9t8BKPLVkdNn` is READY and owns `https://aqua-tank-guide.vercel.app`. `/api/v1/health` returns HTTP 200 with DeepSeek `deepseek-v4.1-flash` configured.
- Production Compatibility authority is fully converged through Wave4: migration count `69`, latest version `20261014163500`, `101` reviewed Profiles / `21` Pair Rules / `1` Stage Risk / `189` reviewed Evidence Sources. Species/feeding/care/content baselines remain `486/486/41/128/527`. `readiness:compatibility-production` reports `READY_COMPATIBILITY_DB`; post-migration verification reports `READY_COMPATIBILITY_PRODUCTION`, `runtimeReady=true`, blockers `[]`, with Production runtime/code parity confirmed.
- Wave4 (`20261014163500`) passed real Production rollback simulation before commit, then committed atomically through the dedicated fingerprinted fail-closed guard. It moved `68/101/184 -> 69/101/189`, reported `mutationAuthorized=true`, and preserved Pair Rules / Stage Risk at `21/1`. The earlier Wave2 and Wave3 releases remain immutable history.
- Released knowledge coverage is now `55` fish with authoritative 8/8 core fields and `53` strict generic-ready fish. Fast Lane is **`0`**; actionable backlog is `622`. Current actionable gaps are `tank_size 118`, `ph 114`, `temperature 109`, `adult_size 95`, `water 87`, `territoriality 43`, `predation 38`, `social_behavior 18`. The fully configured reviewed-pair readability fixture remains `0/6328` `暂时无法判断`.
- Wave4 closes the final Fast Lane queue without inventing facts: `sp_0105` Polypterus ornatipinnis gains scoped `conspecific_territoriality`; `sp_0468` Trigonostigma heteromorpha gains reviewed neutral territoriality; `sp_0198` Channa diplogramma remains a terminal `tank_size` evidence ceiling because exact-taxon numeric sources conflict, so no numeric aquarium minimum is inferred or linked to its Profile.
- The automatic new-species research pipeline is now present in Production code: GBIF exact accepted-species identity -> trusted-source candidate discovery -> server-side source fetch / exact-scientific-name verification -> fetched-text-only Qwen extraction -> deterministic 8-field assessment -> draft candidate. Alibaba/Qwen search output alone is never evidence and the pipeline never auto-writes reviewed authority. Deterministic trusted templates (FishBase, Seriously Fish, Fishipedia, Animal Diversity Web) provide a fail-closed fallback when model web-search discovery is empty or unavailable.
- Protected admin research endpoints are released under existing auth + admin controls: `/api/v1/admin/compatibility/research-readiness` and `/api/v1/admin/compatibility/research-preview`. They remain read/research-only with `writesAuthority=false`. Real Vercel `iad1` canary proved FishBase exact-taxon fetch plus Qwen extraction; web search itself can return empty candidates, which is why trusted templates are supplementary discovery infrastructure rather than evidence shortcuts.
- Authority patches aggregate through `src/data/compatibilityAuthorityPatches/index.ts`; reviewed variant Profiles are constructed before additive patches apply. Historical migrations remain immutable. Core user-state parity remains green: 17/17 owner/auth tables and all 6 API-critical RPC boundaries match Production metadata.
- Full `test:backend-release-gate`, Production promotion preflight, Wave4 rollback simulation, Vercel alias verification, post-migration readback and final health all passed. Held migration `202610090001_compatibility_gold_ram_rhodeus_profile_owner.sql` remains excluded. No UI/image-recognition scope was added in this release.
- Final release-state metadata is recorded on `main` after runtime/DB cutover and is intentionally not another Production runtime release. After this docs/state checkpoint, `main` may be one docs-only commit ahead of frozen Production runtime anchor `d1229ee6`; do not trigger a new alias cutover for metadata-only drift.

## CURRENT CHECKPOINT — 2026-10-14 Compatibility Fast Lane Wave4 / final3 (NOT RELEASED)

- Active branch: `codex/compatibility-fastlane-final3-20261014`, based on canonical `main@1473a491`. Production remains frozen at business/runtime anchor `release/production@8d33d56c`, DB `68 migrations / 101 Profiles / 21 Pair Rules / 1 Stage Risk / 184 Evidence`; no Wave4 Production migration, release push, alias cutover or deploy has been performed.
- Wave4 resolves the final three Fast Lane items without inventing facts. `sp_0105` Polypterus ornatipinnis gains scoped `conspecific_territoriality`: same-species combinations produce `territorial_conflict` caution, while the trait does not leak into generic interspecific territorial pressure. `sp_0468` Trigonostigma heteromorpha gains reviewed neutral territoriality (`traits: []`). `sp_0198` Channa diplogramma remains numerically unknown for `tank_size`, but is now a terminal evidence ceiling because exact-taxon sources conflict (`500 L` vs `3000 L`) while Seriously Fish records no numeric aquarium base; no numeric minimum is inferred or attached to its Profile.
- Generated local coverage after Wave4: `55` core-complete 8/8 fish, `53` strict generic-ready, Fast Lane `0`, actionable backlog `622`. Actionable field gaps are `tank_size 118`, `ph 114`, `temperature 109`, `adult_size 95`, `water 87`, `territoriality 43`, `predation 38`, `social_behavior 18`. `sp_0198` remains 7/8 with `tank_size=reviewed_unknown`, `terminal_hold`, reason `species_space_minimum_conflicted`, and is excluded from ordinary actionable research so the same unresolved conflict is not repeatedly queued.
- Wave4 additive authority is centralized through `fast-lane-wave4-20261014.ts` and the existing patch registry. New runtime semantics introduce `conspecific_territoriality` as a scoped domain trait rather than coercing intraspecific evidence into generic `territorial` behavior. Historical Wave3 authority remains immutable; its tests no longer freeze the then-current Fast Lane backlog as a permanent future state.
- Prepared but **not executed** Production artifact: `20261014163500_compatibility_fast_lane_wave4_authority_patch.sql`, fingerprint `9fbc67d8770c99f8b81f741a486205182e32b602229aeccd2d00aceb0dc80f32`. Guard START is exact live baseline `68/101/21/1/184`; TARGET is `69/101/21/1/189`. The migration inserts five reviewed Evidence Sources, updates only `sp_0105` and `sp_0468` Profiles, leaves `sp_0198` Profile arrays unchanged, and explicitly forbids linking the conflicting Channa numeric-minimum sources as Profile authority.
- Release observation tooling now extends through Wave4: `68/184 -> READY_FOR_FAST_LANE_WAVE4_MIGRATION`, `69/189 -> VERIFY_POST_MIGRATION`. Wave4 authority/guard, evidence-ceiling, next-wave, domain, core-field, readiness, post-verifier, API/typecheck and the full `test:backend-release-gate` all PASS. The 6,328 fully configured reviewed-fish readability fixture remains `0` `暂时无法判断`; Vercel Business API bundle is 2.54 MB.

## CURRENT CHECKPOINT — 2026-10-14 Compatibility automatic onboarding blind validation (NOT RELEASED)

- Active branch: `codex/compatibility-auto-onboarding-blindtest-20261014`, based on merged `main@13ce5a7b`. This checkpoint does **not** modify Production, Supabase authority, Vercel cutover, UI or Vision. Wave4 remains unreleased on Production.
- The old `Generic Species Onboarding` contract only proved that an already-reviewed Profile could enter generic Compatibility without a Pair Rule. This checkpoint adds the missing pre-review layer: `CompatibilitySpeciesResearchProvider -> structured Research Packet -> deterministic 8-field validation -> draft field reviews/profile -> post-review generic Compatibility preview`.
- Research packets are fail-closed. Only direct claims from source records whose content was actually marked `contentVerified=true` and whose runtime source schema is valid may support a field. Missing fields become `research_pending`; disagreeing direct verified values become `terminal_hold`; ambiguous identity, duplicate source IDs, malformed source records, provider/species mismatches and unverified source content cannot produce a candidate Profile. AI/search providers never mark authority reviewed directly.
- Blind acceptance uses `Pseudomugil luminatus`, which is absent from the current 486-object catalog. A complete injected packet reaches `ready_for_review`, produces exactly eight draft field reviews, and after an explicit review-preview boundary enters the normal Domain Compatibility engine without any hand-authored Pair Rule. Missing `tank_size`, conflicting `tank_size`, unverified source content and ambiguous/wrong identity all fail closed.
- A real GBIF Species API identity resolver is now implemented as the first production-shaped provider component. It verifies only `EXACT + SPECIES + ACCEPTED + canonical-name exact + confidence >=95`; fuzzy/synonym/no-match/HTTP/JSON failures do not pass identity. Live smoke for `Pseudomugil luminatus` returned GBIF taxon `9073038`, confidence `99`, `gbif_exact_accepted_species`. GBIF is used only for taxon identity, not husbandry inference.
- The actual multi-source web/husbandry discovery provider is intentionally **not** claimed complete. With no provider configured, capability state is `research_provider_unavailable`. A probe of the old rOpenSci FishBase API endpoint failed TLS from the current runtime, so it is not adopted as a hard dependency. Future discovery must supply real fetched documents/URLs and direct field claims; DeepSeek must not invent sources or silently set `contentVerified=true`.
- New permanent gates: `test:compatibility-auto-onboarding-blind` and `test:compatibility-gbif-identity`, both included in `test:backend-release-gate`. Full backend release gate and TypeScript PASS after this checkpoint.

## CURRENT CHECKPOINT — 2026-10-14 Compatibility trusted-source fallback + Vercel live canary (NOT RELEASED)

- Active branch: `codex/compatibility-trusted-source-fallback-20261014`, based on `main@255910f0`. Production remains unchanged at `release/production@8d33d56c`; no DB migration, reviewed-authority write, or Production Vercel cutover has occurred.
- Real protected Vercel Preview canaries from `iad1` proved that the runtime can fetch a real FishBase exact-taxon page and call Alibaba Model Studio / `qwen3.7-flash-2026-07-15`. For `Pseudomugil luminatus`, FishBase returned HTTP 200, exact scientific-name content, and Qwen conservatively extracted only directly supported `water=freshwater` and `adult_size=1.9cm`.
- The live extraction exposed a provider-format mismatch: Qwen can return numeric confidence such as `1.0`. Research extraction now normalizes 0..1 confidence to AquaGuide's canonical `high|medium|low|unknown` enum without changing fact/evidence acceptance rules.
- Chat Completions forced-search live canary returned HTTP 200 but an empty `{"candidates":[]}`. Responses API with `web_search` and automatic tool choice returned prose URLs but no `web_search_call`; those prose URLs are therefore rejected as evidence. Responses API with `tool_choice:"required"` exceeded the 45s Preview canary timeout. Web search is therefore supplementary, not a required success dependency.
- Deterministic trusted URL templates are the low-latency primary source-discovery fallback: FishBase `.se`, FishBase `.org`, Seriously Fish `/species/{taxon}`, Fishipedia `/fr/poissons/{taxon}`, and Animal Diversity Web. Every candidate still has to pass HTTPS/public-host checks, server fetch, redirect revalidation, exact scientific-name content verification, and fetched-text-only extraction before it can become a draft source/claim.
- Fishipedia's deterministic species route is covered because real current pages can expose husbandry fields including freshwater, temperature, pH, adult size, numeric aquarium minimum, social group size, and explicit territoriality. Missing predation evidence still remains missing: 7/8 fields stays `research_pending`, never promoted to a complete candidate.
- Temporary Preview canary functions used to inspect raw provider behavior are diagnostics only and must not be committed or released.

## CURRENT CHECKPOINT — 2026-10-14 Compatibility Bailian multi-source research provider (NOT RELEASED)

- Active branch: `codex/compatibility-bailian-research-provider-20261014`, based on `main@8f97a897`. Production remains unchanged at `release/production@8d33d56c`; no DB migration, Vercel Production cutover, UI or Vision work is part of this checkpoint.
- The missing source-discovery layer now has a server-side provider implementation in `apps/api/src/compatibility-species-research-provider.ts`. It uses the already configured Alibaba Model Studio compatible endpoint / Compatibility Qwen model with forced web search **only to discover candidate URLs**. Search output itself is never evidence.
- Candidate URLs are filtered to AquaGuide-grade source domains/types (FishBase, Seriously Fish, Animal Diversity Web, Fishipedia, IUCN, government and university domains). Non-HTTPS, credentialed/ported URLs, localhost/private-network URLs, shops/forums/other untrusted domains and redirects from trusted pages into untrusted hosts are rejected before evidence extraction.
- Every accepted source is fetched server-side with manual redirect validation. `contentVerified=true` is assigned only after a successful textual fetch whose content contains the exact scientific name. The second AI extraction pass has **no web-search access** and receives only those fetched documents; claims referencing any URL not actually fetched are discarded.
- Extraction remains conservative and draft-only: explicit numeric aquarium minimums are required for `tank_size`; territoriality neutrality cannot be inferred from generic peacefulness; predation neutrality cannot be inferred from diet labels; missing fields stay missing and conflicting direct claims are handled by the existing onboarding terminal hold. The provider never writes reviewed authority.
- New protected admin endpoints under existing `requireAuth + requireAdmin`: `GET /api/v1/admin/compatibility/research-readiness` and `POST /api/v1/admin/compatibility/research-preview`. The preview runs GBIF identity first, then research, and returns identity + packet + assessment with `writesAuthority=false`; it does not mutate Evidence/Profile tables.
- Contract validation PASS: forced-search request, trusted-domain filtering, exact-taxon fetch verification, fetched-text-only extraction, unfetched-URL rejection, unsafe redirect rejection, project TypeScript and API TypeScript. Local live model smoke is currently blocked before request dispatch by TLS/network failure from this Mac to both the workspace-specific Beijing endpoint and the shared `dashscope.aliyuncs.com` endpoint; this is recorded as a local network limitation, not counted as a provider success. Preview/Vercel validation is still required before any release.

## CURRENT OVERRIDE — 2026-10-09 Production Compatibility safe migration recovery

- Active release-recovery branch: `codex/compatibility-production-prereq-20261009`, based on `main@201f200a`.
- Highest-priority task is to finish the **safe Production Compatibility authority migration**, not UI work and not image recognition.
- A first 22-file guarded Production attempt failed atomically with `42P01` because `public.content_publications` was missing. Immediate verification proved full rollback; Production remains on 26 migrations with business counts unchanged.
- Root cause is now explicit: `202609040001_product_care_publication_snapshots.sql` is a required prerequisite for the Compatibility versioned-publish migration. The corrected guarded bundle is exactly 1 prerequisite + 22 Compatibility migrations = 23, expected post-release migration count 49.
- The release must remain a single outer transaction; unrelated Catalog/SEO/content-audit migrations and held migration `202610090001_compatibility_gold_ram_rhodeus_profile_owner.sql` remain excluded.
- Current validation PASS: guard contract, post-migration verifier contract, Production dry-run, read-only Production state verifier and diff check.
- NEXT: focused PR -> merge to clean/synced `main` -> repeat dry-run/tests -> guarded 23-file Production commit -> immediate post-migration verification. Do not retry from a dirty/non-main/unsynced worktree and do not use plain `supabase db push`.

## CURRENT OVERRIDE — 2026-09-28 Multi-species Compatibility conclusion hardening

- Active working tree remains `/Users/chuchu/aquaguide-admin-content-v0` on `backend/convergence-20260922`; starting HEAD for this checkpoint is `af11e033a3ceb4571b27364a42c3364a21183618`.
- Current scoped change is backend/domain-only Compatibility hardening. **Do not resume image-recognition work and do not perform broad UI changes.** Existing DB/infra and Production holds remain unchanged.
- For 3+ selected species, the canonical decision must combine all pairwise results with a whole-tank evaluation so cumulative constraints such as total bioload are not lost. Aggregate `status` and `metadata.domainStatus` must stay aligned.
- User-facing conclusion contract is now explicit: **判断 → 主要原因 → 可执行调整方式**. Risk ordering is deterministic so lower-priority capacity hints cannot hide observed problems, hard incompatibility, predation/fin damage, territorial pressure, group-size gaps, pH conflict, space pressure, or finally cumulative bioload.
- Unknown/unreviewed evidence remains fail-closed. Do not invent a green compatibility result to fill knowledge gaps, and do not convert soft capacity screening into a hard biological prohibition.
- Regression evidence: multi-species hard conflict, cumulative-load caution, improved verdict after reducing quantity, reason/action priority, visual-result mapping, project TypeScript, and the full `test:backend-release-gate` are PASS on this working tree.
- Repository topology remains unsafe for a blind merge: the clean integration worktree is `/Users/chuchu/aquaguide-backend-integration-20260922` at `integration/backend-main-20260922@d817eb13`, while this branch and that integration line have diverged substantially. Reconcile only reviewed slices.
- NEXT: create a local checkpoint for this Compatibility slice, then selectively reconcile it with the integration line. No Production, DB migration, Vision, or broad UI action is authorized by this checkpoint.

## CURRENT OVERRIDE — 2026-09-22 Backend convergence / release integration

Current working authority is `backend/convergence-20260922@c0dba9399dd8e6e0b212c732918f39157ecf9d8a` (`fix(vision): stage catalog recognition by category`). The worktree is clean and tracks `origin/backend/convergence-20260922`.

- Product backend convergence is complete for the current scope: Compatibility/launch-cohort knowledge authority, Tank State, Tank Evidence, Water Change, Care/Core Flow contracts, API/Catalog/type checks and the backend release gate are green.
- Latest validated backend checkpoint before the current Vision experiments: `wc_ckpt_6a508295ea1940b2a64a348c34de2cd7` (`Aqua product acceptance + vision fail-closed`).
- Launch-cohort knowledge work is closed by evidence: supported facts are promoted only where direct reviewed authority exists; remaining unknowns are explicit evidence ceilings or catalog identity boundaries and must stay fail-closed.
- **USER FREEZE 2026-09-22:** do not continue image-recognition development and do not modify UI. Existing Vision commits remain in this branch history but are not the next task and must not drive release integration decisions.
- **DB / infra HOLD remains:** do not apply the 15 Compatibility migrations, do not switch DB authority, do not change Care indexing/noindex policy, and do not expose Local Admin or mutate Production without separate authorization.
- `origin/main...HEAD` is currently diverged: main-only 13 commits, backend-only 104 commits; merge-base `437fe83fcfe282551806f573b3ca06f5bea37cc3`. Do **not** blind merge/rebase this branch into main.
- Branch diff contains backend authority/tests/docs plus frozen Vision files, one UI file (`src/pages/Aquarium.tsx`) and repository-only DB migration content. Formal integration must classify/select changes and preserve main-only commits.
- NEXT: release-integration audit only — produce/execute the backend release checklist, reconcile main-only changes, separate frozen Vision/UI/DB scope, and merge only after the candidate diff is explainable and all backend gates pass. Production remains untouched.

## CURRENT OVERRIDE — 2026-09-16 RC1 Production release CLOSED
Aqua RC1 is released and final Production browser smoke is PASS.

- Production deployment: `dpl_4uP6Jv7zei6wCpeKkCPfiBb7buNd`, commit `93549ddf1cad0855a7c479e4a696cdde7e66f06c`, READY / production.
- Direct Production API health: `GET /api/v1/health` returned 200 with `ok=true`.
- Browser smoke on the exact Production deployment PASS: GP-001 first-tank setup; GP-002 species search -> Compatibility -> stocking; GP-003 returning-user Daily Check; GP-004 abnormal-care Quick Check.
- Smoke browser used a temporary localhost read-only reverse proxy only because all local Playwright engines could not establish TLS to the Vercel-protected deployment; the proxy fetched exact Production HTML/JS/API GET/HEAD bytes with Vercel JWT and rejected non-GET/HEAD requests. No Product/DB write was made by the proxy.
- HOLD remains: 15 Compatibility migrations, DB-authority switch, Care indexing changes. Local Admin remains out of Production.
- RC1 status: **RELEASED / CLOSED**. Do not resume RC1 fixes without a new reproducible Production regression.
- NEXT work must be a separately scoped product/data/UI iteration (for example Care UI redesign or Compatibility knowledge expansion), with its own acceptance/release gate.

## CURRENT OVERRIDE — 2026-09-14 Production promote blocked by Vercel quota
Release authorization was given and the code-only promote of candidate `93549ddf` was attempted. Vercel rejected the promotion before any Production change with HTTP 402 `api-deployments-free-per-day` (“Resource is limited - try again in 24 hours”).

- Candidate remains `dpl_8yd3w1kzbDhusqvckoRBJgyAEPUE` / `93549ddf`, READY.
- Production remains `dpl_2n2CfsVatP4rzzE49Ttd9H752fR8` / `5fa915d3`, READY and unchanged.
- Do not bypass the quota by aliasing the Preview deployment onto the Production domain; that would bypass Production environment/promotion semantics.
- HOLD remains unchanged: 15 Compatibility migrations, DB-authority switch, Care indexing.
- NEXT: retry the same code-only Vercel promote only after platform quota allows it; then run immediate Production smoke and rollback on any regression.

## CURRENT OVERRIDE — 2026-09-14 Release Rehearsal PASS
RC1 has advanced from Operator Acceptance to release-ready code candidate `93549ddf`.

- Release rehearsal found and fixed one real user-facing blocker: `confirmed_facts` Compatibility results could show raw `insufficient_data` label “还不能判断”; Visual Result now uses the canonical presentation headline “当前可确认”.
- A stale launch-cohort gate was corrected: the frozen 30-species research cohort no longer incorrectly requires every later reviewed species to remain in that cohort. Readiness remains evidence-gated.
- PASS: runtime fallback without DB migrations, Git runtime authority, Product/Care runtime isolation, Publish Center, Care noindex release readiness, Local Admin DEV-only contract, Compatibility release gates, Golden Paths, TypeScript, full build, GitHub CI, Vercel Preview.
- RELEASE VERDICT: **GO WITH HOLDS**. Code may be promoted only with explicit authorization. Do not apply the 15 Compatibility migrations, do not switch DB authority, and do not change Care indexing in the same release.
- Knowledge scope remains limited: 29 reviewed profiles / 5 pair rules across 411 compatibility-eligible species. Fail-closed stability is validated; broad knowledge coverage is not claimed.
- NEXT: explicit Production code-only promote decision, followed by immediate smoke verification and rollback if required.

## CURRENT OVERRIDE — 2026-09-14 RC1 Operator Acceptance PASS
Aqua Operations Studio has moved out of open-ended reliability hardening and into release-candidate acceptance. RC1 operator acceptance on main `66030ece test(rc): align operator acceptance gates` found no product-level blocker.

- Product publish boundary PASS: Save remains private; Publish advances public Encyclopedia runtime.
- Care publish boundary PASS through the real default flow: `/care` opens Interactive Check; operator switches to Traditional Browse before searching. Save remains private; Publish advances public Care runtime.
- Compatibility operator flow PASS: canonical reviewed baseline is currently 29 Profiles / 5 Pair Rules; tiger-barb Profile Draft and Pair Draft both complete Operations deep-link -> review checks -> human approval -> reviewed publish -> task closure.
- Durable Local File browser flow PASS: state/assets/Compatibility/Care SEO persist across restart; backup/restore and corrupt-root recovery remain usable.
- Product Golden Path PASS: contract has 5 journeys with no partial E2E coverage; GP-001..GP-004 all pass. Operations Studio desktop/mobile and three-step browser acceptance pass; 16 formal task paths stay within 3 navigation clicks / 3 task screens.
- Engineering gates PASS: API/root TypeScript, full build, diff check, GitHub Product Golden Path `34826290607`.
- Two failures discovered during acceptance were stale test assumptions, not product blockers: Care search visibility changed with scene/browse mode, and Compatibility tests hard-coded historic 7/4 counts and list order. Acceptance gates now follow current product behavior and dynamic reviewed authority.
- NEXT: Production Release Decision / release rehearsal only. Do not resume speculative Local File hardening unless a new reproducible operator blocker appears. No Production promote or Compatibility migration apply without separate authorization.

## CURRENT OVERRIDE — 2026-09-14 runtime asset publication TOCTOU closed
A concrete Git runtime snapshot publication race is closed on main at `78aaef71 fix(admin): revalidate runtime asset publication`.

- Fail-before-fix: active root integrity passed, runtime staging opened, an external filesystem write then replaced a later published PNG with same-size undecodable bytes, yet `/runtime-snapshot` returned 201 and committed the corrupt bytes into `runtime-assets`.
- `copyRuntimeAssets()` now revalidates the exact metadata/body pair it is about to publish: durable metadata MIME only, metadata byteSize equality, and full decode/format match.
- External mutation after the initial root preflight now fails publication with `409 MIGRATION_REJECTED`; the previous committed runtime manifest remains unchanged and isolated staging is cleaned.
- PASS: Local File API, mode contract, Local File browser regression, Operations Studio, API/root TypeScript, full build, diff check, GitHub Product Golden Path `34821812724`.
- Vercel Preview `dpl_9W7EHy8Lhn6pTfw97x9C4fX9vBby` READY / target null. Production unchanged.
- NEXT: only another reproducible operator/runtime/data-reliability badcase; otherwise enter maintenance/observation rather than inventing defects.

# Current Goal

## CURRENT OVERRIDE — 2026-09-14 restore safety backup lifecycle closed
A concrete hidden-backup disk growth badcase is closed on main at `57577c74 fix(admin): clean completed restore safety backups`.

- Fail-before-fix: one manual backup followed by 5 successful restores left 6 backup directories on disk, 5 of them hidden `pre-restore-safety` snapshots.
- Safety backups are now transaction-scoped: retained while restore/rollback/crash recovery may still need them, removed only after the transaction journal has been cleared and recovery is complete.
- Successful restore returns `safetyBackupRetained=false`; repeated completed restores do not accumulate hidden safety directories.
- Successful crash recovery also removes its consumed safety backup. Failed rollback/recovery still preserves both journal and safety backup for operator inspection/retry.
- PASS: Local File API, mode contract, Local File browser regression, Operations Studio, API/root TypeScript, full build, diff check, GitHub Product Golden Path `34819368401`.
- Vercel Preview `dpl_2U3yL9oq4FpPp7CyABU2Wi74DZrB` READY / target null. Production unchanged.
- NEXT: only another reproducible operator/runtime/data-reliability badcase.


## CURRENT OVERRIDE — 2026-09-14 corrupt Local asset reads fail closed
A concrete read-path integrity badcase is closed on main at `422dbede fix(admin): fail closed on corrupt asset reads`.

- Fail-before-fix: after a valid asset blob was externally replaced with same-size PNG-signature bytes that could not decode, `/integrity` correctly reported `ASSET_CONTENT_INVALID` but `GET /assets/:id` still returned `200 image/png` and served the corrupt bytes.
- Asset GET now validates supported MIME, metadata byteSize, and full decodability before sending bytes. Any mismatch returns `409 INTEGRITY_FAILED` instead of serving known-corrupt content.
- Targeted repair remains unchanged: re-PUT of the same corrupt asset can restore the root and normal GET resumes afterward.
- Permanent regression requires corrupt GET => 409 while existing same-asset repair + all Local File/API/UI/Operations/type/build gates remain PASS.
- PASS: Product Golden Path `34814195437`; Vercel Preview `dpl_43FE572hz3QRDXyQCUevp33kWVzx` READY / target null.
- NEXT: only another reproducible operator/runtime/data-reliability badcase.

## CURRENT OVERRIDE — 2026-09-14 decodable Local asset content closed
A concrete signature-correct-but-undecodable image badcase is closed on main at `935bb529 fix(admin): require decodable local assets`, now contained by merged main `b01f2d28`.

- Fail-before-fix: a PNG-signature-correct buffer whose remaining body was garbage passed the previous signature-only validation even though `sharp(...).stats()` failed with a corrupt-header/libpng decode error.
- Local asset PUT now requires both declared MIME/signature agreement and successful full image decode via `sharp` metadata + stats; actual decoded format and nonzero dimensions must match PNG/JPEG/WebP expectations.
- `inspectRoot()` uses the same decode rule, so externally corrupted/historical blobs that retain a valid file signature cannot remain falsely healthy and are reported as `ASSET_CONTENT_INVALID`.
- Same-asset targeted repair remains available. Browser/API stress fixtures now use real 1x1 PNG/WebP seeds padded to the original test sizes, preserving concurrency, backup/runtime snapshot, restore, and rollback coverage.
- PASS: Local File API, mode contract, Local File browser regression, Operations Studio populated UI, API/root TypeScript, full build, diff check. Latest merged-head GitHub Product Golden Path `34812307958` PASS.
- Functional Preview `dpl_2X2ifijjxD6WzqLvrDBVFY8fpksa` READY; merged-head Preview `dpl_CBz286UQRWMuMgVuTKa28J39Csea` READY. Production unchanged.
- NEXT: only another reproducible operator/runtime/data-reliability badcase; do not weaken image decode checks to accommodate synthetic fixtures.


## SYNCED MAIN AUTHORITY — 2026-09-14 Local asset signature integrity
- Main docs checkpoint `58fd8d8b` records the already-merged functional fix `38eed2a7 fix(admin): validate local asset signatures`.
- Asset PUT rejects MIME/signature mismatch before filesystem mutation; persisted PNG/JPEG/WebP blobs are independently checked by root integrity and may emit `ASSET_CONTENT_INVALID`.
- Same-asset targeted repair remains available. Main reports Local File/UI/Operations/type/build gates PASS, GitHub Product Golden Path `34810288146` PASS, Preview READY, Production unchanged.
- Product Release authority is unchanged: latest-head Product + Admin CI remains required before any merge decision.
## CURRENT OVERRIDE — 2026-09-14 Product Release Gate after latest main Admin safety sync
- Latest `main` safety line has been merged into Product Recovery after main advanced by 7 commits.
- Imported Admin safety behavior: transactional state-write rollback (`5c8f6a63`), referenced-asset delete guard (`77a32708`), operator restore-list isolation for `pre-restore-safety` backups (`ae59e1d4`), and Local asset MIME/signature validation (`38eed2a7`), plus their authority-doc checkpoints.
- `apps/api/src/routes/local-admin.ts` and `scripts/test-local-file-admin.ts` auto-merged without code conflicts; only authority documents required manual convergence.
- Product scope remains closed: no new product modules, no Species Knowledge expansion in this window.
- PASS: merged-head Admin Local File API/mode/UI gates + Product GP-001–GP-004/Compatibility/Collection/three-step/Task Action gates + TypeScript/full build are green. CURRENT: require latest-head remote CI before any `main` merge decision.
- HOLD: 15 additive Compatibility migrations remain repository-only. No Production deploy or DB migration without separate authorization.
## Clown loach reviewed-authority checkpoint — 2026-09-13
- Added standard `Chromobotia macracanthus` / 三间鼠 (`sp_0126`) as the 25th canonical priority taxon using Seriously Fish + FishBase reviewed evidence.
- Reviewed planning authority: 24–30°C, pH 5.0–7.0, 1–12 dGH, adult size up to ~40 cm SL, 180 cm tank length, ~648 L long-term group planning, minimum group 5 with 10+ preferred.
- Legacy `Territorial` is not treated as permanent community aggression. Runtime traits are `shoaling + bottom_dwelling + fin_nipping`; long-fin vulnerability produces caution while reviewed group size removes under-group fin-nipping pressure.
- Sex identification remains unknown and reproduction remains absent; no unsupported private-aquarium breeding rule was invented.
- Canonical coverage: 25 taxa / 600 ordered directions = 460 caution, 138 not_recommended, 2 compatible; no new unconditional green-light direction.
- Runtime/Admin reviewed baseline: 28 Profiles / 5 Pair Rules. Additive migration `202609120014_compatibility_clown_loach_baseline.sql` is repository authority only and is not applied to Staging/Production.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, canonical coverage, Admin/Git/DB runtime, Staging preflight, Local File Admin, full build, Species Detail, Compatibility Beginner Action and GP001–GP004.


## Agassizii + V7 pH-edge checkpoint — 2026-09-13
- Added standard `Apistogramma agassizii` / 阿卡西短鲷 (`sp_0017`) as the 20th canonical priority taxon using Seriously Fish + FishBase reviewed evidence; Fire Red ornamental variants do not inherit automatically.
- Reviewed planning authority: 22–29°C, pH 5.0–7.0, 0–10 dGH, ~7.5 cm SL, 60 cm tank length, ~54 L single-pair planning, cave spawning with maternal egg/fry care.
- Breeding defense is contextual: normal community state does not emit permanent territorial pressure; spawning/guarding state emits `breeding_territory_active`.
- Domain Rules advanced to `compatibility-domain-v7-ph-edge-overlap`: reviewed pH ranges that only touch at a single boundary now produce caution instead of a false compatible result.
- Canonical coverage: 20 taxa / 380 ordered directions = 340 caution, 38 not_recommended, 2 compatible; the two compatible directions remain the pre-existing platy ↔ nerite pair.
- Runtime/Admin reviewed baseline: 23 Profiles / 5 Pair Rules. Additive migration `202609120009_compatibility_agassizii_baseline.sql` is repository authority only and is not applied to Staging/Production.
- Fixed unapplied `202609120008_compatibility_pearl_gourami_baseline.sql` drift assertion so its inserted and asserted behavior traits agree; Admin contract now audits insert-vs-drift trait self-consistency across additive migrations.
- Full Product/Admin/runtime/build/browser validation is green through GP001–GP004.

## Pearl gourami reviewed-authority checkpoint — 2026-09-13
- Added standard `Trichopodus leerii` / 珍珠马甲 (`sp_0444`) as the 19th canonical priority taxon using Seriously Fish + FishBase reviewed evidence; ornamental Balloon/Albino Balloon/Red Head variants do not inherit automatically.
- Environment authority uses Seriously Fish 24–30°C, pH 5.5–8.0, 2–30 dGH; space uses ~81 L from Seriously Fish and the more conservative 120 cm aquarium-length reference from FishBase.
- Ordinary community behavior remains peaceful. `breeding_defense` is contextual only: normal state does not produce territorial pressure, while explicit spawning/egg-guarding state produces `breeding_territory_active` caution.
- Canonical coverage: 19 taxa / 342 ordered directions = 304 caution, 36 not_recommended, 2 compatible; no new unconditional green-light direction.
- Runtime/Admin reviewed baseline: 22 Profiles / 5 Pair Rules. Additive migration `202609120008_compatibility_pearl_gourami_baseline.sql` is repository authority only and is not applied to Staging/Production.
- Full Product/Admin/runtime/build/browser validation is green through GP001–GP004.

## Congo tetra reviewed-authority checkpoint — 2026-09-13
- Added standard `Phenacogrammus interruptus` / 刚果美人 (`sp_0020`) as the 18th canonical priority taxon using Seriously Fish + FishBase reviewed evidence.
- Reviewed planning authority: 23–28°C, pH 6.0–7.5, 3–18 dGH, ~8 cm SL, 120 cm tank length, ~108 L planning volume, minimum group 5.
- Canonical coverage: 18 taxa / 306 ordered directions = 270 caution, 34 not_recommended, 2 compatible; no new unconditional green-light direction.
- Runtime/Admin baseline: 21 Profiles / 5 Pair Rules. Additive migration `202609120007_compatibility_congo_tetra_baseline.sql` is repository authority only and is not applied to Staging/Production.
- Full Product/Admin/runtime/build/browser validation is green through GP001–GP004.

## Main root-ownership / PID-reuse lease hardening absorbed — 2026-09-13
- Absorbed main checkpoints `32a5bb6c`, `a307b36c`, `8105f032`, and `f6820e69`: Local File authority root now has one live process owner, stale leases can be reclaimed, and PID reuse is disambiguated with process-start identity.
- Recovery keeps the dynamic canonical Compatibility exact-baseline guard at 20 Profiles / 5 Pair Rules; this DEV-only ownership lease does not change Product Species/Compatibility authority or authorize Staging/Production writes.

## Denison barb reviewed-authority checkpoint — 2026-09-13
- Added standard `Sahyadria denisonii` / 一眉道人 (`sp_0440`) as the 17th canonical priority taxon using Seriously Fish + FishBase reviewed evidence.
- Reviewed planning authority: 15–25°C, pH 6.5–7.8, 5–25 dGH, ~11 cm SL, 120 cm tank length, ~243 L planning volume, school minimum 6 with 6–10 preferred.
- Reproduction remains absent because current captive-breeding authority is not strong enough for a stable user-facing contract. Gold/Longfin/Red Line catalog variants do not inherit this standard-species authority automatically.
- Canonical coverage: 17 taxa / 272 ordered directions = 238 caution, 32 not_recommended, 2 compatible; no new unconditional green-light direction.
- Runtime/Admin reviewed baseline: 20 Profiles / 5 Pair Rules. Additive migration `202609120006_compatibility_denison_barb_baseline.sql` is repository authority only and is not applied to Staging/Production.
- Full Product/Admin/runtime/build/browser validation is green through GP001–GP004.

## Main follow-up absorbed — Local File restore visibility / snapshot consistency (2026-09-13)
- Absorbed main checkpoints `f83c08fd`, `deb5b085`, `fc125aab`, and `b6361522`: integrity/status/state/asset snapshot reads now use the shared authority read side, while restore and mutations use the exclusive write side.
- Recovery keeps the dynamic canonical Compatibility exact-baseline guard; the Local File concurrency upgrade does not downgrade the current 19 Profiles / 5 Pair Rules authority.
- Product Recovery remains the active goal in this worktree; Production/Supabase/indexing remain unchanged.

## Ember tetra reviewed-authority checkpoint — 2026-09-13
- Added one canonical biological taxon `Hyphessobrycon amandae` across two exact catalog aliases: `sp_0114` 红莲灯 and `sp_0469` 喷火灯.
- Both aliases share one Species Knowledge V2 object and identical reviewed Compatibility facts; canonical coverage counts them once, while runtime/Admin keeps two exact-ID Profiles for auditability.
- Canonical priority coverage: 16 taxa / 240 ordered directions = 208 caution, 30 not_recommended, 2 compatible; no new unconditional green-light direction.
- Runtime/Admin reviewed baseline: 19 Profiles / 5 Pair Rules. Additive migration `202609120005_compatibility_ember_tetra_baseline.sql` is repository authority only and is not applied to Staging/Production.
- Full Product/Admin/runtime/build/browser validation is green through GP001–GP004.

## Main concurrency hardening absorbed — 2026-09-13
- Absorb main checkpoints `275587ea`, `6cd1d5d8`, `25ea430b`, `01fdca74`: runtime export staging/atomic paths use collision-resistant isolation, backup IDs are atomically reserved, same-asset mutations are serialized, and authority snapshot operations are serialized.
- These are DEV-only Local File/Admin reliability changes and do not alter Product Recovery Species/Compatibility facts, 19/5 runtime baseline, or authorize any Staging/Production migration.

## Main follow-up absorbed — Local File asset-pair rollback (2026-09-13)
- Latest main commits `f2087f26` / `9a6855da` close Local File asset blob+metadata transaction gaps: failed metadata writes restore/remove the blob; failed metadata deletes restore the prior blob.
- Main docs checkpoint `af03864d` records this DEV-only reliability closure.
- This does not change Product Recovery Compatibility/Species authority or apply any database migration.

## Main Local File backup cleanup absorbed — 2026-09-12
- Main checkpoint `0c8cd464` removes partial `backup-*` directories when Local File backup copy/manifest creation fails.
- Product Recovery has absorbed the functional fix and its regression; this remains DEV-only Local File maintenance and does not change Product Compatibility authority or Production runtime.
- Main validation for this fix recorded Local File/API/TypeScript/build/CI/Vercel green; Product Recovery already revalidated Local File Admin, API TypeScript, Git runtime and full build after merge.

## Main canonical environment context — 2026-09-12
- Canonical Admin continuation remains `/Users/chuchu/aquaguide-main` on `main`; Product Recovery uses its isolated recovery worktree and must not replace the default Admin entry path.
- Main is self-contained after removing the historical `node_modules` symlink and running its own lockfile-driven `npm ci`; do not recreate dependency symlinks from canonical main into historical/recovery worktrees.
- Main cross-session recovery now fail-closes on wrong path/branch and requires live HEAD vs GitHub main comparison before edits.
- No Local File authority migration, Production deployment, Supabase change, or indexing change is implied by this documentation convergence.

## Main / recovery alignment — 2026-09-12
- `product-recovery-20260911` fully contains current `origin/main`; PR #149 is mergeable/clean and remains Draft.
- Root Vercel build authority is explicit (`npm run build` → `dist`); both aquaguide and admin-content preview deployments are green on the aligned recovery line.
- No Supabase Staging/Production migration is authorized by Product Recovery. New Compatibility migrations remain repository authority only until an explicit environment promotion task.

Updated: 2026-09-12
Active branch: `product-recovery-20260911`

## Goal
Continue Aqua Product Recovery P1 Species Knowledge V2 coverage expansion without fabricating missing biology. Close reviewed-authority gaps that materially improve Compatibility and Species Detail, using base-species inheritance only when the evidence supports shared biology.

## Current acceptance target
- Add reviewed facts field-by-field; unavailable sex/reproduction/space data stays unknown or absent.
- Exact reviewed species facts win, then evidence-backed base-species inheritance, then legacy fallback.
- Species Knowledge V2 and Compatibility must share the same biological authority instead of diverging.
- Canonical biological-taxon coverage is the progress metric; duplicate catalog IDs/ornamental morphs never inflate progress.
- Hard biological conflicts and reviewed pair overrides remain stronger than generic trait inference.
- Frozen global UI/IA stays unchanged; this phase improves decision quality and evidence disclosure, not visual redesign.

## Validation gate
Domain compatibility, legacy facade, evidence coverage, visual actions, TypeScript, build, Compatibility beginner-action browser E2E, and GP001-GP004 must pass before checkpoint push.

## Next
Continue distinct canonical taxon expansion only after the Ember-tetra checkpoint is pushed and current remote main / PR #149 are revalidated. Prefer evidence-complete standard species; duplicate catalog aliases must share biological facts without inflating canonical coverage. Keep runtime/Admin/Git authority in lockstep and use additive migrations only.

## Base-species inheritance checkpoint
- Runtime reviewed authority now resolves exact species ID first, then an explicit base-species key derived from scientific name.
- Variant inheritance is allowed only for shared base-species biology; direct-ID audit counts remain unchanged so inherited authority is never presented as a separately reviewed variant.
- `Betta splendens var.*` can inherit the reviewed `Betta splendens` baseline; variant-specific exceptions remain eligible for exact-ID overrides.
- `Pterophyllum scalare` is reviewed directly and now contributes structured fin-nip vulnerability instead of name-regex inference.
- Acceptance remains: inherited authority may improve runtime decisions, but must not inflate direct review coverage or override explicit pair/hard-risk evidence.

## Capacity heuristic cleanup checkpoint
- Aggressive/Territorial temperament must never multiply waste/bioload screening. Behavior risk and carrying-capacity screening are separate dimensions.
- Raw livestock count must not create a generic density warning; capacity remains based on reviewed species facts plus coarse body-size screening until filtration/flow/water-quality facts are added.
- No replacement hard limit is introduced here. This checkpoint removes false precision rather than inventing a new universal stocking formula.

## Bottom-zone ecology checkpoint
- Compatibility now carries reviewed swimming-zone context without turning shared zones into automatic incompatibility.
- `shared_bottom_zone_context` is informational only: it explains shared substrate/feeding pressure while preserving the underlying verdict.
- First bottom-dweller cohort: `sp_0014` Corydoras aeneus and `sp_0443` Corydoras panda with reviewed group size, adult size, tank footprint guidance and bottom-zone authority.

## Species Detail reviewed-knowledge presentation checkpoint
- Species Detail now renders reviewed adult size / planning volume / tank length / swimming zone / activity as a dedicated secondary evidence disclosure.
- Social presentation now renders reviewed recommended group range and human-readable swimming-zone labels instead of raw enum values.
- Reviewed knowledge stays optional: unreviewed species do not receive fabricated space/social sections.
- The unavailable compatibility disclosure keeps one calculator CTA only; duplicate route actions are prohibited.

## Species Detail presentation checkpoint
- Reviewed space authority is now rendered as a dedicated `成体与空间 / Adult size & space` disclosure with adult size, planning volume, tank length, swimming zone, activity level, notes, and reviewed sources.
- Social knowledge now renders recommended group range in addition to minimum group size, and internal swimming-zone enums are localized for users.
- The detail surface keeps these as progressive evidence rather than moving them into the primary action area.
- The unavailable compatibility disclosure no longer duplicates the calculator CTA; exactly one route remains.
- Browser contract updated so a single neon tetra is caution under the reviewed minimum-group rule rather than incorrectly treated as directly addable.

### Current checkpoint — housing authority convergence
- Shared reviewed housing authority now drives Species Detail, Compatibility, Encyclopedia, and Aquarium.
- Exact reviewed species facts win, then base-species inheritance, then legacy fallback.
- Next focus: increase reviewed common-species coverage; do not reopen broad UI redesign.

### Current checkpoint — V5 prey vulnerability
- `predationRisk` means active predation; `predationVulnerability` means prey-side susceptibility. These facts must never be substituted for each other.
- Common reviewed shrimp authority now uses base-species inheritance where appropriate; nerite snails do not receive a fabricated minimum group size or prey-vulnerability level.
- Fish + highly vulnerable shrimp is caution unless stronger reviewed predator evidence already hard-blocks the pair.
- Current priority catalogue-direction coverage is 110/132 recordable, overwhelmingly caution. Do not present this as overall species coverage or a safety rate.
- Next: canonicalize the coverage metric by biological taxon so duplicate catalogue IDs/variants do not inflate progress, then continue reviewed common-species expansion.

### Current checkpoint — canonical coverage accounting
- Coverage progress is measured by canonical biological taxon, not raw catalog ID.
- Priority baseline is now 8 taxa / 56 ordered directions: 42 caution, 14 not_recommended, 0 unconditional compatible.
- Raw 12-record / 132-direction output remains an integrity audit only. Duplicate IDs/morphs must produce the same canonical verdict.
- Next reviewed-data work should raise canonical taxon coverage or decision quality, not merely add duplicate catalogue records.

### Current checkpoint — Amatitlania partial Species Knowledge V2
- Closed the Compatibility-only gap for `Amatitlania nigrofasciata` using the existing peer-reviewed territory/aggression source.
- Added only reviewed social/territorial behavior; sex identification explicitly remains unknown, while reproduction and space blocks remain absent.
- `Amatitlania nigrofasciata var.*` ornamental forms inherit the reviewed base-species behavior authority; direct-ID review counts remain unchanged.
- Canonical priority coverage expands from 8 taxa / 56 ordered directions to 9 taxa / 72 ordered directions: 56 caution and 16 not_recommended, with 0 unconditional compatible in the audit setup.
- Next authority gap: `Channa asiatica`; preserve the same partial-review discipline.

### Current checkpoint — Channa partial Species Knowledge V2
- Added evidence-backed base-species Knowledge V2 for `Channa asiatica` using the existing U.S. Fish and Wildlife Service assessment.
- Migrated only reviewed predator / solitary authority into Knowledge V2; sex remains explicit unknown and reproduction / space remain absent.
- `Channa asiatica var.*` now inherits the same reviewed biological authority, including the existing hard small-fish predation boundary.
- Added a regression audit requiring every Compatibility-reviewed catalog fish to resolve to Species Knowledge V2 authority; current gap count is zero.
- Next work must select a genuinely new canonical high-frequency taxon rather than duplicate a variant.

### Current checkpoint — reviewed environment authority + Xiphophorus maculatus
- Species Knowledge V2 now has an optional reviewed `environment` block for water type, temperature, pH and hardness evidence.
- Compatibility prefers reviewed temperature / pH / water authority over broader legacy catalog strings when the reviewed block exists.
- Added reviewed `Xiphophorus maculatus` (月光鱼) authority from Seriously Fish + FishBase: 20–26°C, pH 7.0–8.2, 10–30 dGH, 60 cm planning length, up to 6 cm TL, internal livebearing with 24–30 day gestation.
- Added soft `territorial_pressure_context`: a territorial species paired with a reviewed low/non-territorial species is caution rather than an automatic green light. Hard predation / single-housing rules still outrank it.
- Canonical priority matrix is now 10 taxa / 90 ordered directions: 70 caution, 18 not_recommended, 2 compatible. The remaining compatible pair is Xiphophorus maculatus ↔ Neritina natalensis in the audit setup.

### Current checkpoint — Molly reviewed authority + visible environment evidence
- Added direct reviewed Species Knowledge/Compatibility authority for standard `Poecilia sphenops` (`sp_0437`) only. Commercial molly variants are not base-inherited because ornamental stocks may include `P. latipinna` hybrid ancestry.
- Species Detail now renders reviewed temperature / pH / hardness as secondary evidence with reviewed source links.
- Reviewed environment and space authority drive Compatibility ahead of broader legacy catalog values.
- Conflicting gestation durations across sources remain unresolved; no fabricated single gestation range is exposed.
- Canonical priority matrix: 11 taxa / 110 ordered directions; 88 caution, 20 not_recommended, 2 compatible. The only compatible canonical directions remain platy ↔ nerite snail.
- Next: add another distinct high-frequency canonical taxon only when reviewed environment/space/social facts are supportable; do not mass-inherit commercial hybrids.

### Current checkpoint — V6 tank-requirements symmetry + swordtail
- Compatibility authority advances to `compatibility-domain-v6-tank-requirements-symmetry`.
- Reviewed tank volume/length cautions now apply symmetrically to existing livestock and the planned candidate; swapping pair direction must not hide an already-unmet space requirement.
- Added direct reviewed authority for standard `Xiphophorus hellerii` (`sp_0438`): 16–28°C, pH 7.0–8.0, 10–25 dGH, ~14 cm SL, 120 cm tank length / ~108 L planning volume, adult sexing, livebearing and male dominance context.
- Commercial swordtail variants are not base-inherited because ornamental stocks commonly include hybrid ancestry with other `Xiphophorus`.
- Canonical priority matrix: 12 taxa / 132 ordered directions; 108 caution, 22 not_recommended, 2 compatible.
- Next: continue distinct canonical-taxon coverage; do not turn same-sex dominance into generic interspecific territorial aggression.

## Current checkpoint — main convergence / runtime authority alignment (2026-09-12)
- Merged current `origin/main` into `product-recovery-20260911` under a controlled no-commit convergence; main runtime/Admin infrastructure is retained alongside Product Recovery V6.
- Runtime Compatibility Profile authority is exact-ID first; evidence-backed base-species inheritance remains available for reviewed biological variants. Pair Rule and Stage Risk runtime authority are authoritative once hydrated and are not silently restored from static fallback.
- `waterType` remains field-level static reviewed authority until it enters the runtime Profile DTO: Species Knowledge reviewed environment → static reviewed Compatibility waterType → legacy catalog. This prevents runtime hydration from erasing reviewed freshwater/saltwater identity.
- Admin/Git runtime Compatibility baseline is aligned to the current canonical reviewed baseline: 14 direct Profiles / 5 Pair Rules. Publication guards validate exact canonical profile/pair keys and reviewed state, not count alone.
- Added additive migration `202609120001_compatibility_recovery_baseline.sql` for the 7 recovery Profiles + tiger-barb/guppy Pair Rule and their evidence. Historical migrations remain immutable; partial published baseline fails closed.
- Convergence validation passed across Product Domain/Compatibility/Knowledge/Visual, runtime authority, regression gate, Local File Admin, Git runtime, published-content isolation, staging seed contract, API typecheck, full build, Species Detail E2E, Compatibility Beginner Action E2E, and GP001–GP004.
- Next: create and push the merge commit, verify `origin/main...product-recovery-20260911` has main-only 0, then inspect PR #149 current-head CI before any main promotion.

## Current checkpoint — second main convergence / Production bundle alignment (2026-09-12)
- Absorbed remote main through `162bbc1f`, including the Vercel Business API esbuild bundle boundary and Production release-closeout context, while Product Recovery remains the active development authority on `product-recovery-20260911`.
- Root `npm run build` now includes `build:business-api`; the generated Business API bundle is ~1.57 MB and builds successfully before Web/Admin/static artifacts.
- Fixed a canonicalization gap found by the merged Admin regression gate: reviewed `conspecific_fry_predation` Stage Risk must survive Domain canonicalization as `not_recommended` until life-stage risk becomes a native Domain rule. No other legacy hard block regains decision authority.
- Verified after this fix: root/API TypeScript, Compatibility + regression gate, runtime/Git authority, Published Content isolation, Admin Content/Business API contracts, full build, Species Detail E2E, Compatibility Beginner Action E2E, and GP001–GP004.
- Next: complete the merge commit/push, force-refresh `origin/main`, require main-only 0, then re-check PR #149 mergeability and current-head CI before any main promotion.

## Main follow-up absorbed — local file atomic temp cleanup (2026-09-12)
- Latest main cleanup `0b662155` / `e871aee0` is absorbed into Product Recovery.
- Failed atomic Local File writes now clean temporary files instead of leaving stale temp artifacts.
- This does not change Product Recovery authority, Compatibility V6, or reviewed baseline semantics.

## Current checkpoint — Harlequin rasbora reviewed authority (2026-09-12)
- Added direct reviewed Species Knowledge V2 + Compatibility authority for `Trigonostigma heteromorpha` (`sp_0468`, 金三角灯) using Seriously Fish and FishBase.
- Reviewed facts: freshwater; 21–28°C; pH 5.0–7.5; 1–12 dGH; ~4.5 cm SL; 60 cm / ~54 L planning space; peaceful schooling; minimum group 8, recommended 8–10; adult sexing cues; external leaf-underside egg attachment with no parental care.
- Canonical priority matrix expands to 13 taxa / 156 ordered directions: 130 caution, 24 not_recommended, 2 compatible. No new unconditional green light was introduced; the remaining compatible directions are still platy ↔ nerite snail.
- Admin/Git runtime baseline advances to 15 direct Profiles / 5 Pair Rules. `public/runtime-authority.json` is regenerated from the canonical local store.
- Added additive migration `202609120002_compatibility_harlequin_baseline.sql`; prior migrations remain immutable and no database environment was mutated.
- Coverage scorecard now accepts reviewed base-species inheritance instead of falsely requiring duplicate direct-ID profiles.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, coverage scorecard, canonical evidence coverage, Compatibility Admin contract, Git/runtime authority, Staging preflight, Local File Admin, SQL parse, full build, Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004.

## Current checkpoint — Black Skirt Tetra reviewed authority (2026-09-12)
- Added direct reviewed Species Knowledge V2 + Compatibility authority for standard `Gymnocorymbus ternetzi` (`sp_0010`) from Seriously Fish + FishBase.
- Reviewed authority replaces stale legacy `Territorial` semantics with schooling behavior, no territoriality, medium fin-nipping risk, and a reviewed minimum group of 12.
- Reviewed environment/space authority: 20–26°C, pH 6.0–7.0, 5–20 dGH, 75 cm planning length / ~68 L, conservative adult-size upper bound 7.5 cm SL across reviewed sources.
- Ornamental long-fin/balloon/albino/color variants do not inherit the standard profile automatically; variant morphology may materially change fin vulnerability/body form.
- Canonical priority matrix: 14 taxa / 182 ordered directions = 154 caution, 26 not_recommended, 2 compatible. No new unconditional compatible direction was introduced.
- Admin/Git runtime baseline is now 16 direct Profiles / 5 Pair Rules. New additive migration: `202609120003_compatibility_black_skirt_baseline.sql`; do not apply it to Staging/Production in this recovery checkpoint.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, evidence coverage, Compatibility Admin contract, Git/runtime authority, Staging preflight, Local File Admin, full build, Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004.
- Next: continue only with another distinct canonical taxon whose environment/space/social evidence is strong enough; do not widen inheritance merely to raise counts.

## Current checkpoint — Cherry barb reviewed authority (2026-09-13)
- Added direct reviewed Species Knowledge V2 + Compatibility authority for standard `Puntius titteya` / Cherry barb (`sp_0012`) using Seriously Fish + FishBase.
- Reviewed planning authority: 20–27°C, pH 6.0–8.0, 2–20 dGH, ~5 cm SL, 60 cm / ~54 L, school minimum 6 with 6–10 preferred.
- Four fish correctly retains `minimum_group_not_met`; six removes the group-size warning. No variant inheritance was introduced.
- Canonical priority matrix is now 15 taxa / 210 ordered directions: 180 caution, 28 not_recommended, 2 compatible. No new unconditional compatible direction was introduced.
- Git/Admin reviewed Compatibility baseline is 17 Profiles / 5 Pair Rules. Additive migration `202609120004_compatibility_cherry_barb_baseline.sql` is repo authority only and has not been applied to Staging/Production.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, canonical evidence coverage, Admin/runtime/Git authority, Staging preflight, Local File Admin, full build, Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004.
- Next: commit/push and verify current-head PR #149; then continue only with another distinct canonical taxon backed by reviewed evidence.

## Main convergence checkpoint — Local File startup recovery guidance
- Absorbed current main startup recovery guidance for Durable Local File Mode: owner conflicts, unreadable owner lease, interrupted restore journals, newer local authority versions, and local API unavailability now render cause-specific fail-closed recovery instructions.
- This does not change Product Recovery authority, Compatibility V7, or the 23 Profile / 5 Pair runtime baseline.
## Current checkpoint — Ramirezi reviewed authority (2026-09-13)
- Added direct reviewed Species Knowledge V2 + Compatibility authority for standard `Mikrogeophagus ramirezi` (`sp_0448`, 荷兰凤凰) from Seriously Fish + FishBase.
- Reviewed planning authority: freshwater; 27–30°C; pH 4.0–7.0; 1–10 dGH; ~4.2 cm SL; 60 cm / ~54 L for a pair; pair-forming social mode; substrate spawning with biparental brood care.
- Daily social authority is not permanently territorial. `breeding_defense` produces `breeding_territory_active` only when spawning/guarding context is explicit.
- Gold/Blue/Platinum/Balloon and other `Mikrogeophagus ramirezi var.*` records do not inherit the standard profile automatically.
- Canonical priority matrix is 21 taxa / 420 ordered directions: 340 caution, 78 not_recommended, 2 compatible. No new unconditional green light was introduced; the high not_recommended count reflects the reviewed 27°C lower temperature bound in the 24°C audit tank.
- Admin/Git runtime baseline advances to 24 Profiles / 5 Pair Rules. Additive migration `202609120010_compatibility_ramirezi_baseline.sql` is repository authority only and has not been applied to Staging/Production.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, canonical evidence coverage, Compatibility Admin contract, Git/runtime authority, Staging preflight, Local File Admin, SQL parse, full build, Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004.
- Next: push this checkpoint, refresh real `origin/main`, and continue only with another distinct canonical taxon backed by reviewed evidence.

## Main convergence checkpoint — Local File lease/restore/backup hardening
- Absorbed current main Local File reliability fixes: held root leases are revalidated before continued use, interrupted-restore recovery is integrity-checked before serving, and corrupt backup candidates are filtered from operator choices.
- These changes do not alter Product Recovery authority, Compatibility V7, the 24 Profile / 5 Pair runtime baseline, or the 21-taxon canonical matrix.
## Current checkpoint — Discus partial reviewed authority (2026-09-13)
- Added direct reviewed partial Species Knowledge V2 + Compatibility authority for standard `Symphysodon aequifasciatus` (`sp_0447`, 七彩神仙鱼) from Seriously Fish + FishBase.
- Reviewed authority: freshwater; 26–30°C; pH 5.0–8.0; 0–12 dGH; ~14 cm SL; 120 cm / ~255 L planning space; school minimum 5; breeding-season territoriality modeled only through `breeding_defense`.
- Sex identification stays explicit unknown and reproduction remains absent because the reviewed source set is not strong enough for stable user-facing rules.
- Canonical priority matrix: 22 taxa / 462 ordered directions = 340 caution, 120 not_recommended, 2 compatible. The high hard-block count reflects the reviewed 26°C lower temperature bound in the 24°C audit tank rather than missing evidence.
- Admin/Git runtime baseline advances to 25 Profiles / 5 Pair Rules. Additive migration `202609120011_compatibility_discus_baseline.sql` is repository authority only and has not been applied to Staging/Production.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, canonical evidence coverage, Compatibility Admin contract, Git/runtime authority, Staging preflight, Local File Admin, SQL parse, full build, Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004.

## Main follow-up absorbed — failed restore rollback integrity
- Absorbed current main Local File hardening that re-validates authority integrity after a failed restore rollback before normal access resumes.
- Product Recovery remains the active authority; Compatibility V7, 25/5 runtime baseline, and the 22-taxon reviewed matrix are unchanged.

## Local File restore visibility fix
- Restore now overlays backup assets instead of deleting the entire live asset directory before replacement. This preserves assets referenced by a Business state that a client read immediately before the restore write lock was acquired.
- Superseded assets remain readable as integrity-audited ORPHAN_ASSET warnings; current authority references remain exact and healthy.
- Added regression coverage for the cross-request state→asset visibility window.
## Current checkpoint — Pygmy cory reviewed authority (2026-09-13)
- Added direct reviewed Species Knowledge V2 + Compatibility authority for standard `Corydoras pygmaeus` (`sp_0053`, 精灵鼠) from Seriously Fish + FishBase.
- Reviewed planning authority: freshwater; 22–26°C; pH 6.4–7.4; 0–8 dGH; ~2.1 cm SL; 45 cm / ~41 L planning space; minimum group 6 with 10+ preferred.
- `predationVulnerability: high` is evidence-backed for this tiny cory and flows through the existing V5 prey-vulnerability caution; explicit reviewed predators still keep the stronger hard block.
- Canonical priority matrix: 23 taxa / 506 ordered directions = 378 caution, 126 not_recommended, 2 compatible. No new unconditional green light was introduced.
- Admin/Git runtime baseline advances to 26 Profiles / 5 Pair Rules. Additive migration `202609120012_compatibility_pygmy_cory_baseline.sql` is repository authority only and has not been applied to Staging/Production.
- Fixed unapplied `202609120011_compatibility_discus_baseline.sql` so its drift assertion matches inserted `minimum_group_size = 5`; Admin contract now also checks additive-migration minimumGroupSize and requiredFacts self-consistency, not behaviorTraits alone.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, canonical evidence coverage, Compatibility Admin contract, Git/runtime authority, Staging preflight, Local File Admin, SQL parse, full build, Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004.

## Main convergence checkpoint — backup manifest binding and corrupt authority fail-closed
- Absorbed current main Local File hardening that binds each backup manifest to its directory identity and refuses startup when the active durable authority is corrupt.
- Product Recovery remains the active authority; Compatibility V7, the 26 Profile / 5 Pair runtime baseline, and the 23-taxon canonical matrix are unchanged.

## Current checkpoint — Sewellia lineolata reviewed authority (2026-09-13)
- Added direct reviewed Species Knowledge V2 + Compatibility authority for standard `Sewellia lineolata` (`sp_0045`, 越南爬岩鳅) from Seriously Fish.
- Reviewed planning authority: freshwater; 20–24°C; pH 6.0–7.5; 1–10 dGH; ~6.5 cm SL; 75 cm / ~68 L planning space; minimum group 6.
- Same-shape bottom competition is modeled as `territoriality: low`; it must not create a global community territorial-pressure caution. High-flow / high-oxygen husbandry remains reviewed guidance only because the current equipment model cannot distinguish flow-driven oxygenation from a simple air-pump boolean.
- Canonical priority matrix: 24 taxa / 552 ordered directions = 418 caution, 132 not_recommended, 2 compatible. No new unconditional green light was introduced.
- Admin/Git runtime baseline advances to 27 Profiles / 5 Pair Rules. Additive migration `202609120013_compatibility_sewellia_baseline.sql` is repository authority only and has not been applied to Staging/Production.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, canonical evidence coverage, Compatibility Admin contract, Git/runtime authority, Staging preflight, Local File Admin, SQL parse, full build, Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004.

## Main convergence checkpoint — corrupt active authority write guard
- Absorbed current main Local File hardening that blocks durable writes when the active authority fails integrity validation.
- Product Recovery remains the active authority; Compatibility V7, the 27 Profile / 5 Pair runtime baseline, and the 24-taxon canonical matrix are unchanged.
