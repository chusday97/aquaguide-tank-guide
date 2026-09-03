# Live Status

Updated: 2026-09-04
Canonical branch: `feature/admin-content-v0`
Latest functional commit: `8c9ceeb fix(admin-content): add import preflight gate`

## Current state
- Production remains locked; public `main` has not been modified by this work.
- Species SEO runtime is Repo-backed, not Supabase-backed.
- Private Draft/review authority: `chusday97/aquaguide-seo-content / seo-admin-drafts`.
- Public Staging delivery: `chusday97/aquaguide-tank-guide / feature/admin-content-v0` via explicit sanitized snapshot only.
- Canonical hosted Admin path: AquaGuide Preview `/admin/seo/`.
- Standalone `admin-content` Vercel Preview is not the writable operational surface.

## Latest verified product behavior
- Duplicate single/bulk review uses one shared evidence component; ID-only selection is removed.
- Blank CSV template is operational and safe to re-upload unchanged.
- CSV import now follows: upload → preflight → field Diff → Create Draft.
- Preflight renders all row-level validation issues (first 12 visible, remainder counted) rather than only one Toast error.
- Create Draft is fail-closed when CSV errors exist, no rows are marked, no real changes exist, store is unavailable, or the environment is read-only.
- Browser proof PASS: invalid row issue visible + Draft disabled; valid diff visible; read-only demo remains non-writing.

## Validation
- Admin contract + generator + Repo backend/API + dual-repo routing: PASS.
- Root AquaGuide build: PASS.
- SEO Species handoff browser gate: PASS.
- Admin authority UI regression: PASS.
- `git diff --check`: PASS.
