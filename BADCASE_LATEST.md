# AquaGuide — Latest Badcases

**Updated:** 2026-08-22  
**Branch:** `agent/result-ux-v1`  
**Purpose:** current handoff-level badcase ledger. Canonical historical product registry remains under `evaluation/product/`.

## REL-BC-001 — Production dependency graph contained untriaged high-severity findings

- **Area:** release baseline / dependency security
- **Severity:** high
- **Source:** `npm audit --omit=dev` release-baseline evidence
- **Status:** remediation_landed / permanent_gate_verification_pending
- **Baseline:** 18 production-graph findings = 10 high + 6 moderate + 2 low
- **Candidate proof:** Dependency Release Baseline V1 run `32572924271` — PASS
- **Landed by:** `5c277cec1f99f5bb507b7d50b2018d5d571ef0f1`
- **Apply proof:** Apply Dependency Remediation Once run `32573063116` — PASS

### Symptom

The same 18 findings appeared in both the full audit and `npm audit --omit=dev`. Treating the count as generic dev-tooling noise would therefore have been unsafe.

Notable production-graph findings included direct `react-router-dom`, direct `express`, direct `vite`, plus transitive `react-router`, `qs`, `dompurify`, `hono`, `postcss`, and others.

### Root causes

1. Build-only tooling (`vite`, `shadcn`, Tailwind/Vite plugins, type packages) was classified under root production dependencies, inflating the production graph and making build-chain vulnerabilities appear runtime-reachable.
2. Runtime direct dependencies had stale vulnerable ranges (`react-router-dom`, `express`).
3. The lockfile retained a vulnerable transitive DOMPurify release through PostHog.
4. A first remediation artifact workflow had its own packaging bug: two different `package.json` files were copied into the same flat artifact directory, causing a false CI failure after the candidate itself had already built successfully.

### Repair

- reclassified build-only packages to `devDependencies` rather than suppressing audit output;
- upgraded `react-router-dom` to `^7.18.2`;
- upgraded root and API `express` to `^4.22.2`;
- moved/upgraded Vite to dev-only `^6.4.3`;
- regenerated the lockfile and advanced DOMPurify to patched `3.4.14` in the validated dependency graph;
- fixed the artifact directory structure so root and API manifests are preserved separately;
- added package ancestry traces to distinguish shipped/runtime dependencies from tooling chains;
- landed the exact validated lockfile through a one-time workflow that required zero production audit findings and self-deleted after commit.

### Result

Validated post-remediation candidate:

- production audit: **0 findings**;
- full audit: **12 dev-only findings** = 7 high + 2 moderate + 3 low;
- `npm ci`: PASS;
- TypeScript/lint: PASS;
- production build: PASS.

The 12 remaining findings are retained as tooling debt, principally under shadcn/MCP SDK and build-tool dependency chains. They are not production-runtime blockers under the corrected manifest, but they are not erased from the ledger.

### Closure rule

REL-BC-001 becomes fully `regression_verified` only when normal permanent product gates also pass on a descendant of the landed dependency commit. Dependency audit/build success alone is not enough to prove user-facing behavior stayed intact.

---

## PUI-BC-057 — Wide Care guide stayed narrow inside a wide workspace

- **Feature:** Care / Result UX
- **Severity:** high
- **Status:** regression_verified
- **Fixed by:** `4ecd3cb6741aaa61d76388ea26ec4aa7d1461a17` + `1c8acbcbfa175687dba81d144485ea08a0ee3f89`
- **Regression:** Result UX V1 run `32568805769` — PASS

At 1440px, actionable Care content was first ~340px and then ~818px because two independent legacy constraints remained: the split hero grid and `max-w-[850px]`. The repair made decision content span the wide workspace without lowering the >=940px contract and preserved mobile ordering.

## PUI-BC-058 — Narrow desktop Aquarium pushed tank context below management

- **Feature:** Aquarium home hierarchy
- **Severity:** high
- **Status:** regression_verified
- **Fixed by:** `dbaab622371494a89effafe1e982598c46b2d1f7`
- **Regression:** Result UX V1 run `32568805769` — PASS

At a 768px desktop fixture, the <=719px aquarium container rule applied phone-style `Today → Manage → Context` ordering inside the desktop shell. The fix applies `Today → Context → Manage → Secondary` only for narrow desktop while leaving phone behavior unchanged.

## Carry-forward discipline

- Keep fail-before evidence; never lower a regression threshold merely to turn CI green.
- Separate product/browser badcases from release/tooling badcases; do not force release dependency findings into the product feature-state registry without a valid feature mapping.
- A green audit/build does not close a user-facing regression; normal product/browser gates must still pass.
- Do not use raw severity counts without dependency classification and runtime reachability.
- Do not blindly run `npm audit fix`; prefer minimal, explainable dependency changes with lockfile and regression proof.
- Preserve the append-only canonical product badcase registry under `evaluation/product/` when product entries are added.
