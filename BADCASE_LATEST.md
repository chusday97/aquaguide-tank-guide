# AquaGuide — Latest Badcases

**Updated:** 2026-08-22  
**Branch:** `agent/result-ux-v1`  
**Purpose:** current handoff-level badcase ledger. Canonical historical product registry remains under `evaluation/product/`.

## PUI-BC-057 — Wide Care guide stayed narrow inside a wide workspace

- **Feature:** Care / Result UX
- **Severity:** high
- **Source:** CI layout-recovery fail-before
- **Status:** regression_verified
- **Discovered on:** `4b24e7d88b6cc21847a21ea31eb3f8447671e91c`
- **Fixed by:** `4ecd3cb6741aaa61d76388ea26ec4aa7d1461a17` + `1c8acbcbfa175687dba81d144485ea08a0ee3f89`
- **Regression:** Result UX V1 run `32568805769`, Layout Recovery step PASS

### Symptom

At 1440px desktop, `.care-workspace-shell` was already wide enough, but the actionable first-screen content measured only about 340px.

### Expected

A selected guide in a wide Care workspace should use the workspace as a decision surface. The first-screen actionable content should be at least 940px wide under the regression fixture; supporting imagery must not force the action content into a narrow secondary column.

### Root causes

1. Legacy hero layout: `md:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]` kept the decision content in the right column.
2. After the first fix, a second legacy `max-w-[850px]` content corridor still capped the body; measured width improved from ~340px to ~818px but remained below the existing contract.

### Repair rule

- selected desktop detail spans the full Care workspace;
- decision-first content spans the full inner grid and appears before supporting media;
- the 850px cap is removed only for Care workspace containers >=1000px;
- original >=940px regression threshold was not weakened;
- phone ordering remains unchanged.

## PUI-BC-058 — Narrow desktop Aquarium pushed tank context below management

- **Feature:** Aquarium home hierarchy
- **Severity:** high
- **Source:** CI layout-recovery continuation after PUI-BC-057 was fixed
- **Status:** regression_verified
- **Discovered on:** `1c8acbcbfa175687dba81d144485ea08a0ee3f89`
- **Fixed by:** `dbaab622371494a89effafe1e982598c46b2d1f7`
- **Regression:** Result UX V1 run `32568805769`, Layout Recovery step PASS

### Symptom

At the 768px desktop regression fixture:

- Today: top 115
- Manage: top 428
- Context: top 893

The page showed management controls before the tank identity/context, so the previous home hero hierarchy was lost.

### Expected

Once the desktop shell is active, a narrow desktop should still present the current decision and tank context before the management stack. The phone-specific task-first ordering may remain different.

### Root cause

`ui-v2-dashboard.css` had a container rule for `aquarium-home <=719px` that explicitly ordered `Today → Manage → Context → Secondary`. A 768px viewport can still produce a <=719px content container after the desktop shell/sidebar is applied, so the phone/narrow-workspace rule unintentionally governed desktop hierarchy.

### Repair rule

For viewport >=768px and `aquarium-home <=719px`, override only the desktop ordering to:

`Today → Context → Manage → Secondary`

Phone ordering is intentionally preserved.

## Verification evidence

Final product-code head `dbaab622371494a89effafe1e982598c46b2d1f7`:

- Production Security Boundary V1 — PASS (`32568805732`)
- Result UX V1 — PASS (`32568805769`)
- Compatibility Stage Risk V1 — PASS (`32568805704`)
- Plant Roster Edit Fix — PASS (`32568805727`)
- Vercel Preview — SUCCESS

The final Result UX run executed Layout Recovery successfully and continued through Identification and Tank Copilot, proving the fix did not merely move the failure to the next unchecked step.

## Carry-forward badcase discipline

- Keep fail-before evidence; do not lower thresholds to close a badcase.
- Split separate user-visible root causes into separate badcases even when one regression script discovers them sequentially.
- A green preview/build does not close a badcase unless the relevant product/browser regression also passes.
- When adding new machine-readable entries, preserve the append-only historical registry and valid feature-state mapping; do not destructively rewrite prior cases.
