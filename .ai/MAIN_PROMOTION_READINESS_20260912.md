# Aqua Admin Main Promotion Readiness — 2026-09-12

## Verdict
**FULFILLED — MAIN PROMOTED, REMOTE RELEASED, PRODUCTION VERIFIED.**

At readiness time, the isolated candidate `reconcile/admin-content-main-20260911` was a strict fast-forward descendant of `origin/main=d3c70dee633e`. A disposable worktree promotion rehearsal from real `origin/main` to candidate `72ad26932f96` completed with `git merge --ff-only`, produced the exact candidate tree, and was removed afterwards. That pre-promotion condition is preserved below as historical evidence; the fulfillment section records the later main/Production release.

## Fulfillment / release closeout
The readiness gate was fulfilled on 2026-09-12. GitHub main runtime checkpoint `5fa915d3` passed Product Golden Path; Vercel Production `dpl_2n2CfsVatP4rzzE49Ttd9H752fR8` is healthy and public alias `aqua-tank-guide.vercel.app` points to it. Release hardening additionally removed DEV-only Local Admin from the Production API trace and introduced a 1.49 MB generated Business API ESM bundle after real Vercel size/Node-ESM failures were found. Public smoke verifies Business Health 200, Local Admin 404, Compatibility Git authority 7/4, SEO Admin noindex and Product/Care static fallback. Git rollback `d3c70dee633e` and old stable Vercel deployment `dpl_9b9QBEpKCskSZLefuLTJm5cZxWH5` remain available. No Supabase Staging/Production migration or indexing unlock occurred.

## Promotion blocker found and closed
The committed `public/runtime-authority.json` intentionally contains reviewed Compatibility but zero Product/Care rows. Before `72ad2693`, any generated Git snapshot with `generatedAt` activated Product/Care Git authority even when both arrays were empty, which could suppress `/content-bootstrap` and hide cloud-published Product/Care behind static seed data.

`72ad2693 fix(runtime): preserve published api under empty git snapshot` now activates Product/Care Git authority only when the Git snapshot contains at least one Product or Care publication. Empty Product/Care falls through to Published API; Compatibility can still use the reviewed Git authority independently.

The Published Content browser gate was also updated to the current product interaction: Encyclopedia uses the current combobox/listbox; Care switches from default Interactive Check to `传统浏览 / Browse guides` before asserting published Care content. zh-CN and EN both pass.

## Validation
- `test:git-runtime-authority` PASS: non-empty Git Product/Care wins; empty Git Product/Care falls through to Published API.
- `test:published-content-runtime` PASS on isolated candidate preview port 4175.
- `test:local-file-admin` PASS.
- Root TypeScript + API TypeScript PASS.
- Full root build PASS.
- Compatibility runtime/admin/regression gates PASS.
- Published Content isolation PASS.
- Local Admin mode contract PASS.
- Compatibility authority scan PASS.
- `git diff --check` PASS.

## Promotion shape
- `origin/main...candidate`: main-only `0`; candidate-only is expected to increase with docs checkpoints.
- Promotion rehearsal changed 243 files relative to main (`60220 insertions / 485 deletions` at functional checkpoint `72ad2693`).
- `origin/main` is an ancestor of candidate; no merge conflict or semantic conflict remains at the Git boundary.

## Rollback / deployment boundary
- Pre-promotion rollback anchor: `d3c70dee633e` (current `origin/main`).
- Do not delete this anchor when promotion occurs; create a backup ref/tag before moving main.
- Updating local main and pushing main are separate actions. A push to main may trigger deployment, so no push/deployment is implied by this readiness verdict.
- Supabase Staging/Production migrations remain separate and are not required for the accepted Durable Local File + Git authority operating path.

## Next explicit action
When main promotion is authorized: preserve `d3c70dee633e` as rollback ref → refresh origin → require main to remain ancestor of candidate → fast-forward main only → re-run smoke gates on the main worktree → decide push/deploy separately.
