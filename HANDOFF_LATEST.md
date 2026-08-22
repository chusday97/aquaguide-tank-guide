# AquaGuide — Latest Handoff

**Updated:** 2026-08-22  
**Repository:** `chusday97/aquaguide-tank-guide`  
**Active branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Parent:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Release rule:** do not merge to `main` or deploy production without explicit authorization.

## 1. Current verified baseline

Latest fully validated product-code head: `dbaab622371494a89effafe1e982598c46b2d1f7`.

Permanent gates on that head:

- Production Security Boundary V1 — **PASS**, run `32568805732`
- Result UX V1 — **PASS**, run `32568805769`
- Compatibility Stage Risk V1 — **PASS**, run `32568805704`
- Plant Roster Edit Fix — **PASS**, run `32568805727`
- Vercel Preview status — **SUCCESS**

Result UX run #113 completed the full browser chain: Diagnosis → Compatibility → Knowledge → Procedure → Species Detail → Layout Recovery → Identification → Tank Copilot.

## 2. 2026-08-22 repair: Layout Recovery V1

The new layout regression gate initially exposed two real product regressions that older green gates did not cover.

### Care desktop guide width

Fail-before on head `4b24e7d`:

- `.care-workspace-shell` was wide enough, but `data-care-first-screen` measured only about **340px**.
- Root cause layer 1: the legacy detail hero used `md:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]`, leaving the actionable guide in a narrow right column.

First repair `4ecd3cb`:

- detail spans the full Care workspace;
- decision-first content spans the full inner grid and renders before supporting media;
- desktop hero media becomes secondary;
- mobile ordering is unchanged.

The next run improved the first-screen width from **340px → 818px**, but correctly remained red.

Root cause layer 2:

- the detail body still had the legacy `mx-auto max-w-[850px] p-4` reading corridor;
- after padding, the measured content width was about 818px.

Second repair `1c8acbc`:

- removes the legacy 850px cap only when the Care workspace container is at least 1000px;
- the original >=940px browser contract remains unchanged;
- Care layout then passed and the suite continued to the next assertion.

### Aquarium narrow-desktop hierarchy

Once Care passed, the same regression suite exposed a previously hidden 768px dashboard issue:

- Today: `top=115`
- Manage: `top=428`
- Context: `top=893`

Root cause:

- `ui-v2-dashboard.css` intentionally used `Today → Manage → Context` whenever the `aquarium-home` container was <=719px;
- at a 768px desktop viewport, the active desktop shell still produced a narrow content container, so tank identity/context was pushed below management.

Repair `dbaab622`:

- only for desktop viewport >=768px with `aquarium-home` <=719px, order becomes `Today → Context → Manage → Secondary`;
- phone task ordering remains unchanged;
- Layout Recovery then passed Atlas, Care, and Aquarium assertions in the same run.

## 3. Current product state

### Data / decision correctness

- compatibility deterministic boundary remains green;
- life-stage risk coverage remains green;
- plant roster edit regression remains green;
- share-report production secret boundary remains green;
- AI remains an explanation layer around deterministic product decisions rather than the authority for hard safety outcomes.

### Core user paths

The current Result UX baseline has browser evidence for:

- abnormal-care quick check and decision result;
- compatibility blocked-pair decision;
- knowledge and procedure care topics;
- species detail and exact parent-roster return;
- identification uncertainty / explicit confirmation;
- Tank Copilot decision-first / authority boundary.

### UI / interaction

- Atlas deep-link detail no longer collapses/blank-outs in the layout recovery path;
- wide Care guides use the workspace rather than a 340/850px legacy corridor;
- narrow desktop Aquarium preserves Today + tank context before management;
- mobile-specific ordering is intentionally preserved.

### Backend / runtime

Phase 1 authoritative `/api/v1` boundary remains in place:

`frontend → api client → apps/api/src → Vercel Functions → Supabase / AI / Resend`

Known legacy bridges still exist and must not be deleted without consumer proof:

- `api/ai/chat.js -> server/index.mjs`
- `api/v1/health.js -> server/index.mjs`

## 4. Remaining release risks

1. **Stack convergence is not complete.** #105 still depends on #104; the approved merge/retarget sequence has not been executed.
2. **Production smoke is not complete.** Preview success is not evidence that production environment variables, auth, persistence, share links, and external providers work in production.
3. **Legacy server Phase 2 is not started.** Remaining bridge consumers need inventory and replacement proof before migration.
4. **Dependency audit needs triage.** Current CI reports 18 npm audit findings (2 low, 6 moderate, 10 high). This count alone does not prove production exploitability; classify runtime reachability before changing dependencies.
5. **Knowledge Engine is planned, not implemented.** Do not jump directly to vector retrieval before provenance, ingestion, and evaluation baseline exist.

## 5. Next execution order

The repair order is now:

1. **Release-baseline maintenance** — triage dependency findings by production reachability; no blind `npm audit fix`.
2. **Stack convergence** — after explicit merge authorization: review/merge #104, retarget #105, resolve only real conflicts, rerun all four gates.
3. **Production readiness** — verify production env/secrets and perform post-deploy golden-path smoke only after deployment is explicitly authorized.
4. **Legacy server Phase 2** — inventory `server/index.mjs` consumers, migrate one bridge at a time, add a regression contract before deleting any bridge.
5. **Knowledge Engine** — `P0 provenance/version schema → P1 trusted ingestion/freshness → P4 evaluation baseline → P2 hybrid retrieval → P3 grounded result/citations → P5 knowledge ops console`.

Do not start broad new feature work before steps 1–3 are closed. The current priority is turning the now-green RC1/Result UX stack into a reproducible release baseline, not adding surface area.
