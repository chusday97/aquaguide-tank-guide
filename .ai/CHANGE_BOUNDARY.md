# Aqua Change Boundary

Updated: 2026-09-11
Active branch: product-recovery-20260911

## Default rule
A task may modify only files required for its declared product surface. Unrelated visual cleanup is prohibited.

## Current allowed surfaces
- `src/lib/tankCompatibilityEngine.ts`
- compatibility result contracts/services used by the product frontend
- the compatibility result section of `src/pages/Aquarium.tsx`
- species knowledge schema/data files required for Species Knowledge V2
- focused tests/fixtures for compatibility and action-result behavior
- `.ai/*` recovery authority documents

## Frozen surfaces unless separately authorized
- global navigation
- unrelated Aquarium cards/sections
- Species detail header/layout outside new knowledge sections
- Identify page
- Encyclopedia page-wide visual layout
- Admin / SEO / Publish Center
- global design tokens and broad CSS refactors

## Agent ownership model
- Lead/Integration agent: contracts, branch authority, final integration
- Compatibility agent: rules + tests only
- Species Knowledge agent: schema/data/evidence only
- Action Layer agent: decision-to-action presentation only
- QA agent: regression/golden cases; no redesign

## Merge rule
Do not merge/rebase `feature/admin-content-v0` wholesale. Copy or re-implement only explicitly reviewed files/ideas.
