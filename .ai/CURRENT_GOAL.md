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
