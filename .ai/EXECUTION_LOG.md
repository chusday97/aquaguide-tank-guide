# AI Execution Log

## 2026-08-26 — main merge readiness audit

- **Verification:** `project:status` reports canonical branch/local SHA `b2613bdd850aff43f52d56f991df56ce365462c7`; `check:preview-parity` returns `PASS` with Vercel READY deployment `aquaguide-60xddgoyg-chusday97s-projects.vercel.app`.
- **GitHub:** PR #141 remains Draft and `mergeable=CONFLICTING` / `mergeStateStatus=DIRTY`; all listed RC/UI/validate/candidate/Vercel/Cloudflare checks are successful.
- **Topology:** unified branch is 742/224 against `origin/integration/aquaguide-rc1` and 214/224 against `origin/main`; read-only merge-tree reports 62 conflicts against integration. No main PR or merge/rebase was created.
- **Boundary:** Supabase schema/RLS parity and release acceptance remain pending; no database, Supabase, production or `main` mutation.

## 2026-08-26 — post-push Preview quota observation

- **Verification:** After pushing `6df43a504c44918dc7f03f2e0baf77a197759320`, local and origin remained synchronized. PR #141 RC Convergence, validate, candidate-head and Cloudflare passed; UI Regression was pending at observation time.
- **Preview:** `check:preview-parity` reported `NOT_SYNCHRONIZED`: Vercel retained READY deployment SHA `b2613bdd` and GitHub reported `Deployment rate limited — retry in 24 hours`.
- **Boundary:** This is an external Vercel quota blocker, not a code or mergeability result; no manual deployment, Supabase write, or `main` mutation was performed.

## 2026-08-26 — Compatibility research backlog reconciliation

- **Problem:** Historical `origin/main` commits defer no-pair-evidence research groups, which could be mistaken for runtime compatibility evidence if copied wholesale.
- **Action:** Compared the source queue/outcome behavior with the canonical compatibility contract and recorded the commits as `HISTORICAL_OR_EXCLUDED`; no runtime propagation was added.
- **Verification:** Source and current contract audit completed; existing compatibility evidence coverage and scorecard remain the runtime gates.
- **Boundary:** Research-planning behavior remains unimplemented until a separate accepted contract exists; no API, database, Supabase, visual or `main` changes.

## 2026-08-26 — Achievement module remote verification

- **Verification:** Commit `d5dcbd7aed81fac691a44a021316f9bffc0d3dc7` passed PR #141 RC Convergence, UI Regression, validation, candidate-head, Vercel and Cloudflare checks.
- **Preview:** `npm run check:preview-parity` returned `PASS`; Vercel READY deployment `aquaguide-4l55btoqc-chusday97s-projects.vercel.app` exposes the same SHA.
- **Boundary:** No database, Supabase, visual-baseline or `main` mutation; achievement downgrade remains excluded as historical.

## 2026-08-26 — Achievement module reconciliation

- **Problem:** `origin/main@5bf9800c` contains a historical downgrade that marks the achievement module as building, while the canonical product contract defines eight achievements as complete and reachable.
- **Action:** Excluded the stale UI migration and strengthened `verify-collection-hub-previews.mjs` to assert the achievement creature focuses the center and renders derived milestone previews.
- **Verification:** `npm run test:collection-hub-ui`, `npm run lint`, `npm run build`, `npm run check:project-truth`, and `git diff --check` pass.
- **Boundary:** No visual-baseline, API, database, Supabase or `main` changes; local browser check required escalated process permission, while the same regression is covered by remote UI CI.

## 2026-08-26 — Empty care plan recommendation deep link remote verification

- **Verification:** Commit `66cb109c0879caea6acb1c3551cc2e065fd7ec92` passed PR #141 RC Convergence, UI Regression, validation, candidate-head, Vercel and Cloudflare checks.
- **Preview:** `npm run check:preview-parity` returned `PASS`; Vercel READY deployment `aquaguide-c3g36lf4w-chusday97s-projects.vercel.app` exposes the same SHA. Local `/_preview/interactive` returned HTTP 200.
- **Boundary:** No database, Supabase, visual-baseline or `main` mutation; Supabase parity and release acceptance remain pending.

## 2026-08-26 — Empty care plan recommendation deep link

- **Problem:** The empty-care-plan “浏览养护” CTA opened the Care home without locating the recommendation section.
- **Action:** Added `taskRoutes.care.recommendations` for `/care#care-recommendations`, wired Aquarium to it, and extended the task-entry contract.
- **Verification:** `npm run test:task-entry-contract`, `npm run test:task-routes`, `npm run lint`, `npm run build`, and `git diff --check` pass.
- **Boundary:** Selective migration of `origin/main@d464e24b`; no data, API, Supabase, visual-baseline or `main` changes. Remote CI/Preview parity pending push.

## 2026-08-26 — Daily Check navigation remote verification

- **Verification:** Commit `d4e615143be7145407a4a476c1f2b04854e78592` passed PR #141 RC Convergence (`32962622208`), UI Regression (`32962622300`), validate (`32962622235`) and candidate-head (`32962622268`); Vercel and Cloudflare passed.
- **Preview:** `npm run check:preview-parity` returned `PASS`; Vercel READY deployment `aquaguide-7rrbsg5mp-chusday97s-projects.vercel.app` exposes the same SHA.
- **Boundary:** No database, Supabase, visual-baseline or `main` mutation.

## 2026-08-26 — Daily Check navigation clarity

- **Problem:** Desktop Aquarium navigation had no explicit Daily Check subtask, making it ambiguous with Care troubleshooting.
- **Action:** Added the `/aquarium` desktop submenu item using `taskRoutes.aquarium.dailyCheck`; added `scripts/test-task-entry-contract.mjs` and the RC Convergence step.
- **Verification:** `npm run test:task-entry-contract`, `npm run test:task-routes`, `npm run lint`, and `git diff --check` pass.
- **Boundary:** No data contract, API, Supabase, visual geometry or `main` changes.

## 2026-08-26 — Daily Check rule remote verification

- **Verification:** Commit `2b544836b3c92290d3aa9f723e45627f7c7953d1` is on the canonical remote branch. PR #141 RC Convergence (`32961005538`), UI Regression (`32961005592`), Result UX/validate (`32961005535`/`32961005567`), Vercel and Cloudflare all passed.
- **Preview:** `npm run check:preview-parity` returned `PASS`; Vercel READY deployment is `aquaguide-kh6huu1vq-chusday97s-projects.vercel.app` with the same SHA.
- **Boundary:** Supabase schema/RLS parity and release acceptance remain pending; no `main`, Supabase or deployment mutation was performed.

## 2026-08-26 — Daily Check negative-answer rule hardening

- **Problem:** `origin/main@37177a60` identified substring matching that could treat categorical answers such as “没有异味” as positive water abnormalities.
- **Action:** Added exact categorical matching in `diagnosis.rules.ts`, added positive/negative contract cases, and registered `npm run test:daily-check` in `RC Convergence V1`.
- **Verification:** `npm run test:daily-check`, `npm run lint`, `npm run build`, and `git diff --check` passed.
- **Boundary:** No visual, API, database, Supabase, deployment or `main` changes; this is a selective domain-rule migration.

## 2026-08-26 — UI CI Chromium install unblock

- **Problem:** UI Regression run `32958817853` remained in `Install Chromium` for several minutes before any browser test started.
- **Action:** Changed the workflow from `npx playwright install --with-deps chromium` to `npx playwright install chromium`; the hosted Ubuntu runner supplies the required system dependencies, so the extra apt installation is unnecessary.
- **Verification:** Workflow diff check and project truth validation pass; a new remote UI run is required to verify runtime completion.
- **Boundary:** No product UI, domain rule, API, database, Supabase or visual-baseline change.

## 2026-08-26 — Canonical documentation trigger coverage

- **Problem:** `RC Convergence V1` path filters omitted the canonical progress, handoff and evidence files, so a docs-only synchronization could leave the PR displaying an older SHA's RC result.
- **Action:** Added `PROGRESS.md`, `HANDOFF_LATEST.md`, `.ai/EXECUTION_LOG.md`, `.ai/CHANGELOG_AI.md`, `40-DOCS/CHANGELOG.md`, and `.project-journal/**` to both push and pull-request trigger paths.
- **Verification:** YAML path presence check, `npm run check:project-truth`, and `git diff --check` passed. Product UI, API, database, Supabase and visual baseline are unchanged.
- **Boundary:** The workflow change must be pushed and observed on a new run; Vercel current-head deployment remains subject to the existing Hobby quota.

## 2026-08-26 — Canonical regression re-verification after fd27daf2

- **Verification:** Current canonical head `fd27daf20d8222d052fc7011ce8cdec0eccebbcd` matches local, origin and PR #141. Remote RC Convergence `32956751975`, Result UX Head Integrity `32956752189`, Surface System `32956751865`, and UI Regression `32956751904` all passed.
- **Local:** `npm run test:core-ui`, `npm run test:responsive-routes` (7×17), `npm run test:page-runtime-matrix` (28/28), `npm run check:branch-convergence`, and `npm run check:project-truth` passed; 4317 `/_preview/interactive` returned HTTP 200.
- **Boundary:** Vercel latest Ready deployment remains `f465cb76…`; the current docs-only head is not deployed because the Vercel check reports Hobby `build-rate-limit`. `npm run check:preview-parity` is intentionally `NOT_SYNCHRONIZED`; no manual deployment, Supabase mutation, migration or main merge was performed.

## 2026-08-26 — Exact Preview SHA parity restored

- **Verification:** Current canonical head `f465cb76c0ccc2a50216ebe370145bfbc5572c0d` matches local, origin and PR #141; RC `32956089426`, Result UX `32956089336`, Surface `32956089357`, and UI `32956089431` all passed.
- **Preview:** Vercel Ready Preview `aquaguide-ps1d4be93-chusday97s-projects.vercel.app` exposes the same Git SHA; `npm run check:preview-parity` returns `PASS`.
- **Boundary:** Supabase schema/RLS parity and separate release acceptance remain pending; no Supabase mutation or main merge.

## 2026-08-26 — Species detail CTA regression alignment

- **Problem:** `npm run test:species-detail-ui` expected the retired English label `View tank species`, while the current canonical detail action renders `Livestock in Tank`; the stale assertion masked a regression test gap because the script was not in the UI workflow.
- **Action:** Updated the browser assertion to the current i18n contract and added `npm run test:species-detail-ui` to `UI Regression V1`.
- **Verification:** `npm run test:species-detail-ui` passed against the 4317 production preview under controlled browser permissions; no product UI, domain rule, API, database, Supabase or visual baseline change.
- **Boundary:** Vercel current-head SHA parity remains pending (`3ac61d11` has no matching deployment); Supabase schema/RLS parity and release acceptance remain open.

## 2026-08-26 — UI regression API parity

- **Action:** The remote Identify regression exposed that UI CI used a static Vite preview without the `/api/v1` fallback endpoint. Updated `UI Regression V1` to start the existing Express API on 8787 and run Vite with its API proxy on 4173; production build remains a separate gate.
- **Verification:** In a local API+Vite proxy environment, `test:identify-flow-separation` and `test:aquarium-primary-tools` passed; no Supabase writes or product behavior changed. Commit `0b52e947` was pushed and the canonical remote UI run passed.
- **Boundary:** CI environment only; the API starts with existing configuration and does not auto-migrate or write Supabase.

## 2026-08-26 — Canonical CI regression hardening closed

- **Action:** Observed the post-fix canonical workflows and recorded the final evidence for PR #141.
- **Verification:** On `ef878e25144c4cd12c461e0f3eadbd5182a1bada`, `UI Regression V1` `32948782199`, `Surface System V1` `32948782231`, `Result UX Head Integrity V1` `32948782259`, and `RC Convergence V1` `32948782285` all completed successfully. Local/remote/PR SHA match; local 4317 interactive preview returns HTTP 200.
- **Boundary:** Vercel remains `AUTH_REQUIRED`/Hobby build-rate-limited and Supabase schema/RLS parity plus release acceptance remain pending; `main` and cloud data were not changed.

## 2026-08-26 — Preview SHA parity gate repaired and passed

- **Action:** Fixed `check:preview-parity` to use `npx --yes vercel` when no system `vercel` binary is installed; `VERCEL_BIN` remains available for explicit overrides.
- **Verification:** Read-only parity now reports `PASS`: local, origin, PR #141 and Vercel Ready Preview `aquaguide-k48ki2sbb-chusday97s-projects.vercel.app` all point to `f2a5ec4719dcc388985c845217d66eb8d1f46f47`.
- **Boundary:** No deployment was triggered by the script and no Supabase migration/write/RLS change occurred. Direct schema/RLS metadata and user release acceptance remain pending; release stays `NOT_READY`.
- **Follow-up:** The interim docs/guard-only head was observed pending briefly; Vercel then produced Ready deployment `aquaguide-jqfsw1rja-chusday97s-projects.vercel.app` for canonical head `9f1a543c…`. Strict current-head parity is now PASS.

## 2026-08-26 — Aquarium settings panel click synchronization

- **Action:** After the Add Livestock click was made navigation-independent, the remote run exposed the same default navigation wait on the Substrate and Plants settings-panel toggles. Both toggles now use `noWaitAfter`; search-result and Dialog visibility assertions remain unchanged.
- **Verification:** `PREVIEW_URL=http://127.0.0.1:4317 npm run test:aquarium-primary-tools` and `git diff --check` passed. Commit `78160db3` is ready to push.
- **Boundary:** Test-only timing alignment; no product UI/runtime, data, API, Supabase, Vercel or visual baseline change.

## 2026-08-26 — Aquarium action regression navigation wait

- **Action:** After the hidden-state wait fixed the Settings close race, the remote UI run still timed out while Playwright waited for navigation after the Add Livestock click. Changed only that regression click to `noWaitAfter`; the following “记录已有生物” Dialog visibility remains the assertion.
- **Verification:** `PREVIEW_URL=http://127.0.0.1:4317 npm run test:aquarium-primary-tools` and `git diff --check` passed. Commit `a90911fa` is ready to push.
- **Boundary:** This is a test synchronization fix; no product UI/runtime, API, database, Supabase, Vercel or visual baseline changed.

## 2026-08-26 — Surface guard and Aquarium regression stabilization

- **Action:** Replaced the stale Surface workflow assertion for `max-w-[920px]` with the canonical Detail Rail width token `w-[clamp(480px,42vw,600px)]`; added a hidden-state wait after Escape in `test:aquarium-primary-tools` before opening the next Dialog.
- **Verification:** The Surface static contract, `PREVIEW_URL=http://127.0.0.1:4317 npm run test:aquarium-primary-tools`, `npm run lint`, `npm run check:project-truth` and `git diff --check` passed. Commit `a7b85171` was pushed to the canonical branch.
- **Evidence:** Remote failures were reproduced from run `32945314731` (stale width grep) and `32945314830` (30s click timeout after Settings Escape); no product/runtime code, Supabase, Vercel or visual geometry changed.
- **Next:** Observe new Surface/UI/RC Actions runs for `a7b85171`; release remains blocked by exact Preview SHA, Supabase schema/RLS parity and release acceptance.

## 2026-08-26 — Canonical domain and API CI coverage

- **Action:** Added the existing data-contract, API-boundary, compatibility, current-tank state/evidence, water-change, evidence-presentation, recommendation and share-report checks to `RC Convergence V1`.
- **Verification:** Each command passes locally (listener-based API checks run with authorized local process permissions); the workflow now gates the canonical branch on bottom-layer semantics before type/build checks.
- **Boundary:** No product UI, domain implementation, database schema, RLS, Supabase environment or deployment behavior changed.

## 2026-08-26 — Canonical CI trigger alignment

- **Action:** Moved `Surface System V1` and `UI Regression V1` push triggers from retired `codex/interactive-parity-v3` to `codex/unified-rc-visual-v1`; added the canonical `npm run test:ui-smoke` step to the unified browser workflow using the isolated 4173 preview.
- **Verification:** Workflow trigger scan shows only the canonical branch for push events; `npm run test:ui-smoke` passes locally with `AQUAGUIDE_URL=http://127.0.0.1:4317`.
- **Verification:** The change was pushed as `834af948`; `npm run project:status` and `git ls-remote` report the same canonical SHA, and `/_preview/interactive` returns HTTP 200. `check:preview-parity` remains `AUTH_REQUIRED` for Vercel metadata.
- **Boundary:** No product UI, domain rule, API contract, database, Supabase environment or visual geometry changed. Remote workflow execution will be observed after the push.

## 2026-08-26 — Origin/main Care card reconciliation

- **Action:** Compared `origin/main@ed0cf380`'s Care card reachability patch with the canonical Care detail. The current branch already wires `分享卡片` to the existing local `生成养护卡` preview; only the regression evidence was missing.
- **Verification:** Added a canonical Preview browser check for the entry, local card preview, copy action and absence of public-sharing CTAs; the check will run in `UI Regression V1`.
- **Boundary:** No duplicate product entry, data field, API, Supabase or visual geometry was introduced. The origin/main patch remains a reviewed historical source, not a merge source.

## 2026-08-26 — Origin/main Settings sharing reconciliation

- **Action:** Compared `origin/main@daadc2a3`'s “sharing is building” change with the canonical Settings page. The unified branch has an implemented, auth-gated share-report list and a real `/aquarium?action=exports` destination.
- **Verification:** Added `test:settings-share-action-ui` to assert the Settings section and destination in the canonical Preview; share-report contract, API boundary, public report UI and Settings feedback regressions also pass.
- **Decision:** Keep `DEPLOYED_REVERIFY_PENDING` until cloud parity is authorized; do not downgrade the implemented path or copy the historical building-state patch.

## 2026-08-26 — Preview URL and stale regression repair

- **Action:** Added the canonical `scripts/preview-url.mjs` resolver (default `http://127.0.0.1:4317`) and migrated browser scripts away from mixed 3000/4173/localhost defaults. Repaired stale 600px, detail surface, compatibility route, Aquarium search/entry and dialog-name assertions. Restored the existing AI Tank Copilot as the desktop Dock seventh action and mobile more-actions entry.
- **Verification:** `npm run build`; `npm run test:core-ui`; `npm run test:page-runtime-matrix` (28/28); `npm run test:guided-navigation-ui`; `npm run test:settings-feedback`; `npm run test:interactive-scenes-ui`; `npm run lint`; `npx tsc --noEmit`; `npm run check:project-truth`; `npm run check:branch-convergence`; `git diff --check` all passed. 4317 serves the rebuilt production output and the Copilot dialog opens in Chromium.
- **Boundary:** Current visual baseline remains unchanged; no SQL, API, Supabase, main merge, or Vercel deployment was performed. Vercel exact SHA and Supabase schema/RLS parity remain external release gates.

## 2026-08-26 — Second stale-regression audit

- **Action:** Audited remaining browser scripts and documentation for retired detail surfaces, labels, and port assumptions. Updated Care category, Daily Discovery, Species Detail and the 3000-vs-4317 setup wording. Rebased Daily Discovery and action/mobile priority checks on the current product truth: discovery belongs to the Encyclopedia interactive scene, while Aquarium remains a single immersive tank workspace.
- **Verification:** `npm run test:daily-discovery`; `npm run test:product-actions-runtime`; `npm run test:mobile-aquarium-priorities`; `npm run test:core-ui`; `npm run test:page-runtime-matrix` (28/28); `npm run test:guided-navigation-ui`; `npm run test:interactive-scenes-ui`; `npm run test:settings-feedback`; `npm run lint`; `npm run check:project-truth`; `npm run check:branch-convergence`; `git diff --check` all passed on the canonical 4317 Preview. No product data, API, Supabase, or visual geometry changed.

## 2026-08-26 — Latest parity check

## 2026-08-26 — Browser contract convergence push

- **Action:** Pushed the validated convergence and documentation commits to `codex/unified-rc-visual-v1`.
- **Verification:** `npm run project:status` and `git ls-remote` report the same current SHA; worktree is clean; `/_preview/interactive` returns HTTP 200. `npm run check:preview-parity` confirms local/remote parity but remains `AUTH_REQUIRED` for Vercel deployment metadata.
- **Boundary:** No `main` merge, Supabase request/migration/write, or deployment mutation was performed.

## 2026-08-26 — Canonical UI smoke registration

- **Action:** Replaced the stale 3003 UI smoke with a small 4317-targeted smoke and registered `npm run test:ui-smoke`; it covers formal routes, browse search, interactive atlas ownership and Aquarium's single livestock entry.
- **Verification:** `npm run test:ui-smoke` passed against the production Preview. The smoke uses a deterministic local fixture and does not write cloud data.

- **Action:** Rechecked canonical local/remote SHA and the local 4317 preview; attempted a read-only public GitHub PR metadata query.
- **Verification:** `npm run project:status`, `npm run check:branch-convergence` and `curl -I http://127.0.0.1:4317/_preview/interactive` passed. GitHub API returned anonymous rate-limit protection, so no new remote check-run evidence was claimed.
- **Boundary:** No Supabase request, migration, RPC mutation, data write or Vercel deployment change.
- **Next:** Obtain authorized Vercel exact deployed SHA and Supabase schema/RLS inspection, then run release acceptance.

## 2026-08-26 — Compatibility evidence boundary migration

- **Action:** Selectively ported the reviewed-pair evidence boundary from `origin/main` history into the canonical branch. Pair decisions now call the compatibility engine with `scope: 'species_only'`; when both species have reviewed profiles but no reviewed pair rule, the result is explicitly `insufficient_data` instead of inferred recordable compatibility. Aggregate decisions still merge separate `scope: 'tank'` evaluations, so volume, equipment, temperature and bioload blocks cannot be lost; visual adapters consume the aggregate primary blocker.
- **Verification:** `test:compatibility-evidence-coverage`, `test:compatibility-coverage-scorecard`, `test:compatibility`, `test:compatibility-evidence`, `test:recommendation-authority`, `test:visual-results`, `lint` and `build` passed. Coverage includes a tiny/high-load tank regression and aggregate visual authority assertion. The scorecard reports 501 catalog species, 7 reviewed profiles, 4 reviewed pair rules, 12 priority directions and 2 recordable directions.
- **Boundary:** No SQL, API, Supabase, UI geometry or visual baseline change. Main-only evidence commits were not cherry-picked; current stage-risk evidence remains intact.
- **Next:** Expand reviewed evidence only with cited sources and update the compatibility coverage audit; cloud parity remains a separate external gate.

## 2026-08-26 — Human visual baseline confirmation

- **Decision:** User confirmed the current `http://127.0.0.1:4317/_preview/interactive` visual direction as the working baseline; this is not a final visual lock and future UI-owner changes require a new review.
- **Verification:** `project:status` reports canonical branch `codex/unified-rc-visual-v1`, clean worktree and SHA `91cc980c`; `check:branch-convergence`, `check:project-truth`, three-tier contract, compatibility (17/17), recommendation authority, tank-state (11/11), tank-evidence, water-change (8/8), API typecheck, lint, production build, Result UX head integrity, PR governance, taxonomy UI and full page runtime matrix (28/28) passed. Real Chromium loaded the 4317 route with HTTP 200, title `aquaguide` and no page errors.
- **Boundary:** No product UI, domain rule, API contract, database, Supabase environment or deployment was changed. Exact Preview SHA and Supabase schema/RLS parity remain pending.
- **Next:** Continue with authorized read-only Preview SHA/Supabase parity; re-run visual acceptance after any later UI change.

## 2026-08-26 — Preview/Supabase parity follow-up

- **Action:** Attempted only read-only cloud parity checks against the recorded Vercel branch Preview and available local deployment context.
- **Evidence:** The Preview returned `302 → Vercel SSO` without an exposed Git SHA. No authorized Supabase schema/RLS inspection surface was available; no Supabase request, migration, RPC mutation or data write was executed.
- **Decision:** Keep exact Preview SHA and Supabase schema/RLS parity as `pending`; do not infer parity from a redirect, environment names or the prior 31/31 PostgREST reachability result.
- **Next:** Obtain authorized Preview access exposing the deployed SHA, an authorized read-only Supabase schema/RLS inspection, then request human visual acceptance on 4317.

## 2026-08-26 — Remote CI evidence

- **Evidence:** GitHub read-only metadata confirmed PR #141 head `ffdcabd8411a8339ce09196f7310b96b33a4ce8a`; `RC Convergence V1` run `32915252842` and `Result UX Head Integrity V1` run `32915252831` passed. Vercel and Cloudflare status checks also passed.
- **Boundary:** Vercel did not expose the deployed Git SHA, so deployment success does not close exact Preview parity. Supabase schema/RLS and human visual acceptance remain pending.

## 2026-08-26 — Result UX workflow head integrity

- **Action:** Ported only the candidate-head verification concept from historical Result UX commits: the new workflow is configured to check out `${{ github.event.pull_request.head.sha || github.sha }}` and compare `git rev-parse HEAD` with the same expected SHA for PRs targeting `main`/`integration/aquaguide-rc1` and pushes to the canonical branch.
- **Verification:** `npm run test:result-ux-head-integrity` and `git diff --check` passed.
- **Boundary:** No product UI, domain rule, API contract, database, Supabase environment or visual baseline changed. Historical Result UX pages and workflow steps were not copied. Because this workflow is new on the feature branch, its remote PR run is pending until it is present on the PR base/default delivery path; local static verification is not a remote CI result.
- **Next:** Verify exact Vercel Preview SHA, authorized Supabase schema/RLS parity and human visual acceptance.

## 2026-08-25 — Recommendation authority and severity

- **Action:** Ported only RC recommendation authority semantics into `recommendation.service.ts`; removed free-text single-housing suppression and local hard-block overrides, reused reviewed group-size evidence, and made candidate reasons prefer `TankCompatibilityResult.summary`.
- **Verification:** `npm run test:recommendation-authority`; `npm run test:compatibility`; `npm run test:compatibility-evidence`; `npm run lint`; `npm run build`; `git diff --check`; and a read-only delayed render check against `http://127.0.0.1:4317/_preview/interactive` all passed. Build retained existing dynamic-import and large-chunk warnings only.
- **Commit:** `9fcad4a2`.
- **Boundary:** No UI geometry, SQL, API field, Supabase schema/RLS or deployed environment was changed. Compatibility evidence remains partial (501 species / 7 reviewed / approximately 1.4%).
- **Critic:** Independent six-dimension review passed with no blocking or required fixes. Optional follow-up: add an explicit canonical-blocked and `riskLevel` mapping assertion.
- **Next:** Vercel/API runtime contract review.

## 2026-08-25 — Vercel/API runtime contract

- **Action:** Ported only deployment-boundary semantics from RC #136–#138: V1 catch-all, API-before-SPA rewrite, standalone canonical Express runtime, ESM-safe imports and non-secret environment documentation. Excluded RC changes to LifeStage, database fields and business API semantics.
- **Verification:** `test:production-cloud-runtime-contract`, `test:production-cloud-runtime-smoke`, `check:api`, `test:business-api-contract`, `test:api-boundary`, `test:ai-capabilities`, `lint`, `build`, `check:project-truth` and `git diff --check` passed.
- **Boundary:** No Supabase read/write, migration, RLS, schema, deployed environment or visual baseline change. Independent Critic rechecked the health capability shape, AI aliases, fallback-key semantics and exact namespace-root rewrite; six dimensions passed. This is local runtime evidence only; exact deployed SHA and schema/RLS parity remain pending.
- **Next:** Result UX workflow head integrity review.

## 2026-08-25 — Branch convergence audit gate

## 2026-08-25 — Species Detail evidence authority

- **Action:** Ported only the RC evidence-authority semantics into the current Species Detail implementation. Added a pure adapter for ordered blocking/warning/missing/passed rules and review status; kept the current visual geometry and labeled `housingReason` as profile reference.
- **Verification:** `npm run lint`; evidence presentation assertions; compatibility 17/17; species knowledge; production build; `PREVIEW_URL=http://127.0.0.1:4317 node scripts/verify-species-detail-experience.mjs` all passed. The browser command required escalated Playwright permissions in this environment.
- **Evidence gap:** compatibility audit remains 501 species / 7 reviewed / 4 pair rules / 1.4% reviewed coverage; this migration does not claim full evidence completeness.
- **Critic follow-up:** rejected evidence was found displayable despite being non-authoritative. Excluded rejected rules from detail key reasons while retaining pending source status; added rejected-only and mixed-state assertions.
- **Next:** review Recommendation authority and severity.

- **Action:** Added `scripts/audit-branch-convergence.mjs`, `npm run audit:branch-convergence`, and `docs/03-development/BRANCH_CONVERGENCE_AUDIT.md`.
- **Evidence:** The read-only audit reported 149 canonical-only and 214 `origin/main`-only commits, plus 149 canonical-only and 742 RC1-only commits.
- **Decision:** Treat these as graph topology only; require capability-level review in `.ai/RC_MIGRATION_LEDGER.md` before any selective port.
- **Commit:** `98977966`.

## 2026-08-25 — Branch parity gate repair

- **Action:** Added local/remote SHA output and `npm run check:branch-convergence`; the canonical push workflow now fetches full refs and runs the blocking check.
- **Verification:** The check correctly fails locally while `HEAD=9c4d9500` is ahead of `origin/codex/unified-rc-visual-v1=589eb23c`; this prevents claiming GitHub parity before the push.
- **Ledger:** Advanced the next review unit from the completed P0 group to Species Detail evidence authority.
- **CI boundary:** The parity script uses `GITHUB_REF_NAME` for detached push checkouts and keeps the local Git branch name for workstation checks (`b39dbbd7`).

## 2026-08-25 — Canonical parity restored

- **Action:** Pushed `codex/unified-rc-visual-v1` through `6e71cb05`.
- **Verification:** Local and `origin/codex/unified-rc-visual-v1` both resolve to the same SHA; `project:status` and `check:branch-convergence` pass.
- **Evidence gap:** The current environment cannot reach the GitHub API, so the resulting Actions run has not been independently observed here.

## 2026-08-25 — Initialize `.ai/`

- **Read:** 项目 `PROGRESS.md`、`HANDOFF.md`、`PROJECT_STRUCTURE.md`、`40-DOCS/CHANGELOG.md`。
- **Action:** 创建 `CURRENT_GOAL.md`、`TASK_QUEUE.md`、`CHANGELOG_AI.md`、`EXECUTION_LOG.md`。
- **Verification:** 文件结构和当前目标均来自现有项目文档；未新增未经确认的产品事实。
- **Remote:** 未执行 `git push`，未触发 Vercel 部署。

## 2026-08-25 — Standardize AI project protocol

- **Read:** `.ai/CURRENT_GOAL.md`、`PROGRESS.md`、`HANDOFF.md`、`PROJECT_STRUCTURE.md`、`40-DOCS/CHANGELOG.md`。
- **Action:** 新增 `PRODUCT_CONTEXT.md`、`ARCHITECTURE.md`、`DECISION_LOG.md`、`BADCASES.md`、`docs/CONTEXT_ROUTING.md` 和根目录 `AI_PROJECT_PROTOCOL.md`。
- **Verification:** 新增内容均来自现有项目文档；协议明确要求编码前读取三个核心文件，变更后更新三个执行文件。
- **Remote:** 仅准备本地提交，不执行 `git push`，不触发 Vercel 部署。
- **Commit:** `de906c2`（仅文档；未推送）。
## 2026-08-25 — Progress unification started

- Created `codex/unified-rc-visual-v1` from `37a8d4d1` after user confirmed the 4317 interactive preview as the correct visual result.
- Recorded `integration/aquaguide-rc1@895f2f39` as a selective business reference only.
- Recorded PR #140 as deprecated because its RC-first partial UI migration regressed the approved visual result.
- Audited RC-only commits and grouped them into domain authority, recommendation, UI, interactive atlas, runtime/API, and workflow integrity categories.
- Closed PR #140 and opened Draft PR #141 against `integration/aquaguide-rc1`.
- Confirmed that P0 migration expands `LifeStage`, evidence data and planning semantics; paused code migration pending the required contract confirmation.
- Added local/CI checks that report canonical branch, SHA, approved visual baseline, RC business reference and Draft PR.

## 2026-08-25 — Daily local worktree aligned

- Switched `/Users/chuchu/Documents/New project/aquaguide_frontend` from legacy `codex/rc1-visual-integration` to `codex/unified-rc-visual-v1`.
- Verified local `HEAD` and `origin/codex/unified-rc-visual-v1` both resolve to `5b619a08`; `npm run project:status` reports `dirty: false`.
- The approved 4317 preview remains isolated on the user-approved visual baseline and was not changed.

## 2026-08-25 — Unified branch CI verified

- Added the canonical branch push trigger to `RC Convergence V1`, because a PR-only workflow not present on the default branch does not provide a usable gate for this Draft PR.
- GitHub Actions run `32846848569` passed: canonical-state check, lint, layout-mode contract, three-stage framing contract, and production build.

## 2026-08-25 — Open PR topology archived

- Queried 56 open GitHub PRs and recorded `.ai/OPEN_PR_REGISTRY.md`.
- Designated #141 as the only active convergence entry; the other 55 PRs remain traceable historical inputs and are not direct merge sources.
- No historical PR was closed or otherwise modified.

## 2026-08-25 — Unified cross-layer inventory and safe PR cleanup

- Added `docs/05-validation/MODULE_FACT_INVENTORY.md` and routed it from `docs/PROJECT_TRUTH.md`; the inventory links each module's product/UI, domain/Service, data/API, evidence and deployment state.
- Closed the 55 historical PRs from the original open-PR snapshot with a traceability comment; retained all branches and left #141 as the only open convergence PR.
- Recorded the result in `docs/03-development/PR_CLEANUP_RECORD.md` and updated the task queue, handoff and changelog.
- No SQL, Supabase, API, page component, CSS or remote branch deletion was performed.

## 2026-08-25 — Independent review fixes for governance implementation

- Critic found that the first governance script checked only document strings, that `.ai` registry/ledger edits did not trigger CI, and that Care/Identification/Text AI were combined into one ambiguous status row.
- Added a read-only GitHub API check requiring exactly open PR #141 with the canonical head/base and expected SHA in CI; local runs explicitly skip only when no token is available.
- Added `pull-requests: read` permission and `.ai/OPEN_PR_REGISTRY.md`, `.ai/RC_MIGRATION_LEDGER.md`, `.ai/TASK_QUEUE.md` workflow paths.
- Split the module inventory into Care, Identification/health triage and Text AI rows to match the canonical Feature Catalog.
- Critic rechecked the same diff and passed all six dimensions; GitHub Actions `32853545889` passed the real read-only PR topology API check on `642b007b`.

## 2026-08-25 — Supabase deployment status corrected

- The user confirmed that the existing Supabase work had already been deployed.
- Corrected the status distinction: deployed Supabase is a user-confirmed fact; re-validating the exact connected environment, schema revision and RLS behavior from the unified branch remains a separate verification task.

## 2026-08-25 — Truth consolidation phase 1 started

- Added canonical project, product, visual and deployment documentation routes.
- Reclassified the dated current-product snapshot as historical evidence; no product code, Supabase configuration or accepted visual baseline changed.

## 2026-08-25 — Truth consolidation phase 2 started

- Added a historical-evidence registry and supersession headers for legacy progress, Handoff, UI audit and cloud-planning records.
- No historical file was deleted; the change makes their evidence role explicit.

## 2026-08-25 — Truth consolidation phase 3 started

- Added `docs/05-validation/VISUAL_ACCEPTANCE_MATRIX.md` to connect the user-confirmed 4317 UI baseline to regression commands, routes and human-review status.
- Verified the local baseline: layout 6/6, framing, UI governance, interactive scenes, persistent detail rail, and page runtime matrix 28/28 all passed.

## 2026-08-25 — Truth consolidation phase 4 started

- Added `FEATURE_CATALOG.md` as the single module-status inventory and removed the duplicate capability table from Product Truth.

## 2026-08-25 — Truth consolidation phase 5 audited

- Verified non-secret evidence: 18 tracked migrations, the 31-table three-tier contract test, configured Vercel Production Supabase/Postgres variable names, and a Ready unified-branch Preview.
- Recorded exact deployed schema/RLS/SHA parity as an authorized read-only verification still required; no redeploy or configuration change was attempted.

## 2026-08-25 — Truth consolidation phase 6 started

- Added PR evidence template, delivery protocol and a deterministic project-truth verifier.
- Read the RC branch-protection API: the branch is not protected. Recorded the safe prerequisite rather than enabling a check that could block all PRs before it is runnable from the base branch.

## 2026-08-25 — Truth consolidation phase 7 contract drafted

- Read the RC domain-rule and evidence source; created a `PROPOSED` contract with exact types, no SQL/API/persistence change and explicit UI exclusions.
- No P0 product code was migrated. User approval is required before this contract changes implementation or `CONTRACT.md`.

## 2026-08-25 — Truth consolidation phase 8 gate established

- Added `RELEASE_READINESS.md`; the unified line is intentionally `NOT_READY` until exact deployment parity, authorized Supabase parity, P0 contract implementation and a separate release acceptance are complete.

## 2026-08-25 — Accepted P0 compatibility authority migration

- **Approval:** 用户明确批准 `docs/decisions/P0_COMPATIBILITY_CONTRACT.md`。
- **Action:** 迁入本地 `CompatibilityLifeStage` 输入、审核阶段风险证据、纯 tank-state / water-change / bioload 规则和从既有鱼缸、诊断事实派生的服务；共享 `LifeStage` 保持 API/数据库原枚举，未导入 RC 页面、CSS、API、迁移、RLS 或写入逻辑。
- **Verification:** `lint`、兼容性 16/16、tank-state 11/11、water-change 8/8、three-tier contract、production build 通过；4320 临时 build preview 的 layout、framing、interactive scenes、page runtime matrix 通过。
- **Remote:** 尚未推送本次产品代码；`main` 未修改，发布仍受 Supabase parity 和单独 release acceptance 阻断。
- **Independent review:** Critic initially found incomplete structured diagnosis mapping, a legacy bioload threshold regression, a shared lifecycle/API boundary leak, and free-text false positives. The builder restored the legacy multiplier, isolated `CompatibilityLifeStage`, mapped current structured question fields, excluded free text, and added regressions; the same Critic recheck passed.

## 2026-08-25 — Read-only Supabase and Preview parity attempt

- **Read:** `DEPLOYMENT_STATE.md`, `RELEASE_READINESS.md`, `CONTRACT.md`, `test-three-tier-contract`, current canonical branch and Vercel project metadata.
- **Action:** Pulled production environment names through the existing Vercel authorization into a temporary 600-permission file; queried Supabase PostgREST with the anon key using GET only. No migration, RPC mutation, INSERT, UPDATE, DELETE or RLS change was executed.
- **Verification:** 31/31 contract tables returned HTTP 200; latest aquarium, livestock batch, care-action, recurring-event, compatibility-evidence and care-reference columns returned HTTP 200. `npm run check:project-truth`, `npm run project:status` and `npm run test:three-tier-contract` passed.
- **Evidence gap:** Vercel masks PostgreSQL connection strings and the anon REST surface does not expose migration history or policy metadata, so exact schema revision/direct RLS policy verification remains pending. The latest Ready branch Preview is timing-correlated with `187d16ba` but its exact Git SHA was not returned by Vercel metadata.
- **Human review:** 4317 preview rendered at 523×812 with complete DOM, images and WebGL canvas; no application errors. User visual acceptance remains pending.

## 2026-08-25 — Visual baseline remains usable, not final

- **User decision:** The current 4317 version is usable as the working visual baseline, while additional visual issues remain for later incremental work.
- **Action:** Recorded D-AQUA-005 and clarified the Visual Baseline; no product code or UI geometry changed.
- **Constraint:** Future visual work must be module-scoped, preserve formal component/surface semantics, and rerun only the affected viewport matrix before acceptance.

## 2026-08-26 — Vercel deployment lag identified (read-only)

- **Read:** canonical branch status, branch convergence audit, Vercel project metadata and latest deployment list.
- **Verification:** local and GitHub canonical SHA are both `43f75e739655e8061fb880ed3415b741a90275c1`; `vercel ls aquaguide --json` identified the newest Ready deployment on `codex/unified-rc-visual-v1` as `aquaguide-uwfft41zv-chusday97s-projects.vercel.app` with `githubCommitSha=6b0e629d8b6694a06b98182a38da01d34718c44f`.
- **Conclusion:** Preview is verifiably behind the canonical branch; exact Preview SHA parity remains pending. No redeploy, migration, RPC mutation, configuration change or data write was executed.
- **Follow-up:** Pushed the evidence commit and rechecked `vercel ls aquaguide --json`; no deployment for the new canonical head appeared, so the lag is still active and must be resolved through the Git-connected Vercel deployment path.
- **Quota blocker:** The Git-connected Preview API request for the current head was rejected with `api-deployments-free-per-day` (Hobby daily limit exceeded). No deployment was created; retry is deferred until the quota resets.

## 2026-08-26 — Automated Preview SHA parity gate

- **Action:** Added `scripts/check-preview-parity.mjs` and `npm run check:preview-parity`.
- **Verification:** The gate reports local SHA = remote SHA, but the latest canonical-branch Vercel deployment is `6b0e629d…`; status is `NOT_SYNCHRONIZED` and the command exits non-zero.
- **Safety:** The check is read-only and does not trigger Vercel, Supabase, configuration, or data changes.
