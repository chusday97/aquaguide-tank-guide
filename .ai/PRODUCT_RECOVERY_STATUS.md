# Aqua Product Recovery Status

Updated: 2026-09-11
Active branch: `product-recovery-20260911`
Base: `main` @ `d3c70dee633ed4e24bbca161d138a832012b1d40`
Draft PR: #149

## Branch authority
- `product-recovery-20260911` is the only active Aqua product recovery branch for this effort.
- Latest measured relation to `main` before this status commit: ahead 26 / behind 0.
- Merge base is exactly the current main base commit above.
- `feature/admin-content-v0` remains reference-only. Do not merge/rebase it wholesale.

## Completed in this recovery line
### P0
- Accepted product baseline created.
- Product scope created.
- Change boundaries / agent ownership created.
- Recovery branch created directly from current main.

### P1 — Compatibility / beginner result first checkpoint
- Coarse body-size/volume bioload screening can no longer be the sole hard block.
- Aggressive/territorial temperament no longer inflates canonical waste-load screening.
- Legacy coarse capacity blocks are reclassified as advisory warnings by the canonical adapter.
- Hard biological constraints remain blocking: water-type incompatibility, severe temperature mismatch, reviewed predation, explicit single-housing, observed emergency.
- Beginner Action Layer added: can mix / conditional / need information / do not mix.
- Visual result now puts the beginner decision and immediate action first; professional evidence remains in detail sections.
- Compatibility page copy now explicitly tells users that the first result is the conclusion/action, with evidence available afterward.
- Beginner golden actions now cover compatible / soft-capacity caution / hard block / missing information.
- Tank Stability Context added: established duration, stable coexistence duration, maintenance consistency and recent water-quality incident.
- Trusted stability can downgrade only an elevated coarse-load screening to informational context; high screening remains caution.
- Stability context cannot override water-type, temperature, predation, single-housing or observed emergency hard blocks.
- Compatibility calculator now exposes one optional beginner question for real tank stability; confirmation is scoped per tank and is not persisted back into the aquarium record.
- Selecting “stable” only supplies the guarded stability context used by soft capacity/load screening; “not sure” leaves the original tank facts untouched.
- Compatibility rule authority advanced to `compatibility-domain-v3-contextual-behavior`; reviewed territoriality, fin-nipping and predation risk can now flow from Species V2 into Domain Rules while old behavior traits remain fallback-only.
- Under-grouped reviewed fin-nippers now raise `fin_nipping_group_pressure` as a caution, not a hard block; the beginner action explicitly says to fix the same-species group before adding other fish.
- CompatibilityRiskCalculator no longer overwrites the Beginner Action Layer with a generic status action; the specialized immediate action is the user-facing source of truth.

### P1 — Species Knowledge V2 contract checkpoint
- Added field-level evidence contract.
- Added staged structured contracts for sex identification, reproduction, social behavior, adult size / space and swimming zone.
- New V2 blocks are optional during migration so existing species do not receive invented facts.
- First reviewed V2 cohort added: `sp_0436` 孔雀鱼, `sp_0431` 红绿灯, `sp_0432` 宝莲灯.
- Cohort includes reviewed sex-identification, reproduction and social-behavior facts with field-level source IDs; unknown species continue to return unknown rather than generic invented biology.
- Reviewed Species V2 social facts now feed the canonical compatibility domain before older compatibility-profile fallbacks.
- Minimum group-size planning is now a canonical caution rule (`minimum_group_not_met`); reviewed V2 values override older profile minima (for example neon/cardinal tetra 8 rather than the older 5 fallback).
- Beginner Action Layer has a dedicated group-size result: `可以养，但数量要够`, with the reviewed minimum shown when available.
- `insufficient_data` results now expose missing evidence in the expandable `为什么这样判断` layer instead of hiding the reason.
- Knowledge Source Registry added for reviewed Species V2 claims; source IDs now resolve to publisher/title/URL instead of remaining opaque strings.
- Existing sex-identification disclosure now shows traceable reviewed-source links without changing the surrounding Species Detail layout.
- First reviewed cohort now includes reviewed adult-size / space authority: guppy 6 cm SL / 45 cm tank length / ~41L; neon tetra 3 cm SL / 60 cm / ~54L; cardinal tetra 3.5 cm SL / 60 cm / ~54L.
- Species Detail space labels now use reviewed V2 space authority when available, preventing old `fish.tankSize` copy from disagreeing with the compatibility engine.
- Reviewed reproduction and social/group blocks now render as additional disclosures inside the existing Species Detail hierarchy; unreviewed species get no fabricated empty sections.
- Reproduction/social disclosures carry the same traceable reviewed-source links as sex-identification claims.
- Second reviewed schooling cohort added: `sp_0434` 白云金丝, `sp_0435` 斑马鱼, `sp_0439` 虎皮鱼, including sexing, reproduction, social structure and reviewed space authority.
- White-cloud V2 minimum group size 10 overrides the old 5-fish compatibility fallback; zebrafish now has independent reviewed compatibility authority rather than relying only on the Oscar pair rule.

## Validation status
- Main Convergence foundation workflow on the latest pre-golden-case checkpoint: PASS through project truth, catalog, domain compatibility, legacy compatibility, lint, API and production build.
- Domain compatibility regression: PASS after soft-capacity change.
- Legacy compatibility facade regression: PASS after canonical adapter/test alignment.
- Main Convergence foundation workflow passed through project truth, catalog, compatibility, lint, API and build on the recovery line.
- Local recovery validation after Tank Stability Context: domain compatibility PASS, legacy compatibility PASS, TypeScript lint PASS, production build PASS.
- Species Knowledge V2 first-cohort assertions PASS; TypeScript lint PASS after reviewed cohort wiring.
- Species V2 → compatibility wiring: domain compatibility PASS, legacy facade PASS, beginner visual/action regression PASS, species knowledge PASS, TypeScript PASS, production build PASS.
- Knowledge Source Registry checkpoint: source-resolution assertions PASS, TypeScript PASS, full compatibility regressions PASS, production build PASS.
- User-facing stability confirmation checkpoint: compatibility regression PASS, explicit non-mutating confirmation test PASS, TypeScript PASS, production build PASS.
- Species Detail reproduction/social disclosure checkpoint: species-knowledge assertions PASS, TypeScript PASS, production build PASS.
- Browser Golden Path contract + GP001/GP002/GP003/GP004: PASS on production preview after aligning the shoaling fixture to the reviewed 8-fish minimum. Re-ran all four UI paths after reviewed space authority wiring: PASS.
- GP002 now asserts the real recordable action instead of brittle status copy and persists 8 cardinal tetras; existing 6 neon tetras remain unchanged.
- Contextual behavior regression suite PASS: structured territoriality/predation, tiger-barb 4-vs-8 group behavior, unknown existing quantity non-inference, domain/facade/visual action/lint/build all PASS.
- Product-action audit PASS after removing the generic `currentAction` override.
- GP001/GP002/GP003/GP004 re-run after contextual behavior + Beginner Action wiring: all PASS.
- Local preview verified HTTP 200 at `http://127.0.0.1:4320/`; production preview verified at `http://127.0.0.1:4173/`.
- Do not merge until the latest current-head workflows are green.

## Next execution order
1. Add focused browser coverage for the Beginner Action Layer so group-pressure and stability-context actions are asserted in rendered UI, not only service tests.
2. Model target vulnerability (for example long fins / slow-moving targets) before allowing fin-nipping evidence to create pair-specific warnings; do not infer vulnerability from names.
3. Expand the reviewed cohort incrementally with high-frequency species; keep V2 data + compatibility authority in the same checkpoint.
4. Continue replacing coarse capacity heuristics with reviewed adult size, tank length, activity and later filtration/flow facts; keep volume guidance soft unless it is a true physical constraint.
5. Continue full Golden Path validation before any merge to main.

### P1 — Trait-inference authority checkpoint
- Removed the bespoke-pair-study requirement as a universal recordability gate. Reviewed species traits + general rules may now produce compatible/caution outcomes; direct pair rules remain higher-priority overrides.
- Added `pair_trait_inference` as visible provenance instead of turning absent direct pair research into missing decision-critical data.
- Reviewed compatibility profiles now carry reviewed water type for the active cohort, filling stale legacy catalog gaps.
- Species Fit no longer equates `Aggressive` or `Large` with predation when reviewed behavior authority exists.
- Compatibility UI now prefers reviewed social housing labels over stale legacy `housingMode` values; tiger barb shows group guidance instead of `建议单养`.
- Browser acceptance added for tiger-barb group-pressure action and stable-tank soft-load downgrade, including visible positive evidence after expanding details.
- GP001 E2E now clicks the actual settings navigation button, reducing pointer-interception flakes.

#### Validation
- Evidence coverage PASS: 132 real common-species directions; 6 reviewed recordable directions under the new provenance contract.
- Domain compatibility, legacy facade, visual results, TypeScript, production build: PASS.
- Compatibility beginner-action E2E: PASS.
- GP001 / GP002 / GP003 / GP004: PASS.

### P1 — Target-vulnerability checkpoint
- Compatibility authority advanced to `compatibility-domain-v4-target-vulnerability`.
- Added reviewed target-side behavior facts: `finNipVulnerability` and `swimmingPace`; these are distinct from the aggressor-side `finNippingRisk`.
- Generic fin-nipping pressure against a reviewed vulnerable/slow target produces caution (`fin_nipping_target_vulnerability`), not a fabricated hard block.
- Guppy is the first reviewed vulnerable target; Species Fit and Domain use the reviewed field before legacy fish-name heuristics.
- Added reviewed tiger-barb × guppy pair evidence as a direct `not_recommended` override. Meeting tiger-barb group-size guidance does not erase the pair-level long-fin conflict.
- Beginner Action renders a dedicated vulnerability warning for generic caution and treats reviewed pair blocks as explicit `不建议混养`.

#### Validation
- Evidence coverage PASS; reviewed pair-rule floor = 5.
- Domain compatibility / legacy facade / visual actions / TypeScript / production build: PASS.
- Compatibility beginner-action browser E2E covers group pressure, stable-load downgrade, and tiger-barb × guppy reviewed block: PASS.
- GP001 / GP002 / GP003 / GP004: PASS.

### P1 — Base-species inheritance checkpoint
- Added inheritance-aware runtime authority: exact ID review first, then explicit base species by scientific name.
- Direct review audit remains ID-based, preventing inherited ornamental variants from being counted as separately reviewed evidence.
- `Betta splendens` baseline review can now serve `Betta splendens var.*` variants; exact variant review can override it later.
- Added reviewed `Pterophyllum scalare` behavior/space knowledge and structured fin-nip vulnerability.
- Compatibility/Species Fit/UI housing labels now share the same inheritance-aware authority path.
- Regression contracts prove: Betta variant inheritance works without fake direct review coverage; tiger barb × angelfish produces fin-nip caution without stale single-housing or fabricated predation hard blocks.

#### Validation
- Species Knowledge assertions: PASS.
- Domain compatibility: PASS.
- Legacy/canonical compatibility: PASS.
- TypeScript: PASS.
- Production build: PASS.
- Compatibility beginner-action browser E2E: PASS.
- GP001 / GP002 / GP003 / GP004: PASS.

### P1 — Capacity heuristic cleanup checkpoint
- Removed the last legacy aggression/territoriality multiplier from bioload calculations.
- Removed `loadMultiplier` from the domain contract.
- Removed the generic raw-count `density_high` rule from Species Fit.
- Behavior risk is now modeled through behavior rules; waste/capacity screening remains independent.
- No new universal stocking threshold replaces these heuristics.

#### Validation
- Domain compatibility: PASS.
- Legacy/canonical compatibility: PASS.
- TypeScript: PASS.
- Production build: PASS.
- Compatibility beginner-action browser E2E: PASS.
- GP001 / GP002 / GP003 / GP004: PASS.

### P1 — Bottom-zone ecology checkpoint
- Added reviewed `Corydoras aeneus` and `Corydoras panda` knowledge/compatibility authority.
- Added `swimmingZone` as a structured compatibility fact.
- Added informational `shared_bottom_zone_context` for two reviewed bottom-dwelling species.
- Shared ecological zone is context, not a universal risk score; it does not change a compatible result by itself.
- Corrected the panda cory scientific-name typo in the catalog.

#### Validation
- Species Knowledge: PASS.
- Domain compatibility: PASS.
- Legacy/canonical compatibility: PASS.
- Evidence coverage: PASS; recordable reviewed directions increased from 6 to 12 without new hard-block relaxation.
- TypeScript: PASS.
- Production build: PASS.
- Compatibility beginner-action browser E2E: PASS.
- GP001 / GP002 / GP003 / GP004: PASS.

### P1 — Species Detail reviewed-knowledge presentation checkpoint
- Existing reviewed Species V2 space facts are now visible in Species Detail rather than only feeding the compatibility engine.
- Added human-readable adult size, planning volume, tank length, swimming zone, activity level and reviewed sources.
- Social disclosure now exposes recommended group range and localized swimming-zone labels.
- The UI explicitly frames space values as long-term planning references, not one-number hard pass/fail limits.
- Removed a duplicate Compatibility Calculator action from the unavailable evidence state.

#### Validation
- Species Knowledge: PASS.
- TypeScript: PASS.
- Production build: PASS.
- Species Detail browser E2E: PASS.
- Compatibility beginner-action browser E2E: PASS.
- GP001 / GP002 / GP003 / GP004: PASS.

### P1 — Predation-vulnerability + common-invertebrate checkpoint
- Compatibility authority advances to `compatibility-domain-v5-predation-vulnerability`.
- Active predation (`predationRisk`) and prey-side vulnerability (`predationVulnerability`) are separate reviewed facts.
- Reviewed fish + highly vulnerable shrimp produces caution (`predation_vulnerability_context`); a reviewed high-predation fish + small vulnerable prey still produces the existing hard `predation_risk` block.
- Invertebrate + invertebrate does not receive an automatic prey-vulnerability warning.
- Added inheritance-aware reviewed authority for `Neocaridina davidi` (including cherry/wild morphs), `Caridina cantonensis`, and `Neritina natalensis`; direct-ID audit remains separate from inherited runtime authority.
- Beginner Action now surfaces `先确认鱼不会把虾当食物` before lower-priority group/capacity cautions when this boundary applies.
- Priority catalogue-direction audit currently reports 110/132 recordable directions: 108 caution, 2 compatible, 22 not recommended. This is not a safety percentage and includes duplicate catalogue records/variants; the next metric cleanup must also report canonical biological-taxon coverage.

#### Validation
- Species Knowledge / Domain / Compatibility / Visual Action / evidence coverage / TypeScript / production build: PASS.
- Fish-shrimp Beginner Action browser E2E: PASS.
- Species Detail browser E2E: PASS.
- GP001 / GP002 / GP003 / GP004: PASS.

### P1 — Canonical coverage metric checkpoint
- Added shared taxonomy helpers for base-species scientific names and canonical taxon keys; runtime inheritance and coverage accounting now use the same biological identity rule.
- Priority coverage now reports both raw catalogue rows and canonical biological taxa. Duplicate IDs/morphs are integrity-tested but do not inflate progress.
- Current priority set: 12 raw catalogue records = 132 ordered raw directions; 8 canonical taxa = 56 ordered biological directions.
- Canonical result: 42/56 directions are recordable and all 42 are caution; 14/56 are `not_recommended`; there are no unconditional compatible canonical directions in this test setup.
- The previous raw 110/132 number is retained only as a duplicate-record integrity audit, not as the primary progress metric.
- Duplicate catalogue records for the same taxon must agree on verdict; the coverage test fails if they diverge.

### P1 — Amatitlania partial knowledge convergence checkpoint
- Added evidence-backed base-species Knowledge V2 for `Amatitlania nigrofasciata` from the existing reviewed aggression/territory study.
- Deliberately kept unsupported fields unknown/absent: no fabricated sexing rule, reproduction timing, adult-size threshold, or space minimum.
- Compatibility base inheritance now matches Species Knowledge base inheritance for ornamental `var.*` forms.
- Priority canonical coverage: 9 taxa / 72 directions; 56 caution, 16 not_recommended, 0 unconditional compatible.

#### Validation
- Species Knowledge / Compatibility / Domain / Visual Results / evidence coverage / TypeScript / production build: PASS.
- Species Detail browser E2E / Compatibility Beginner Action E2E / GP001 / GP002 / GP003 / GP004: PASS.
