# AquaGuide Feature Catalog

**Status:** Active  
**Updated:** 2026-08-25  
**Rule:** this is the only module-status inventory. Product promises belong in [PRODUCT_TRUTH.md](./PRODUCT_TRUTH.md); historical implementation detail belongs in `PROGRESS.md` and `HANDOFF.md`.

## Status vocabulary

| Status | Meaning |
| --- | --- |
| `CURRENT_VERIFIED` | Present on the unified visual baseline and covered by current local source/browser evidence. |
| `DEPLOYED_REVERIFY_PENDING` | Existing deployment is user-confirmed, but the unified branch has not repeated environment/schema/RLS parity verification. |
| `PARTIAL_WITH_FALLBACK` | A useful path exists, but a required provider, evidence set or acceptance boundary remains incomplete and has a visible safe fallback. |
| `RC_MIGRATION_PROPOSED` | Exists only as selectively reviewed RC business capability; not yet part of the unified product. |
| `HISTORICAL_OR_EXCLUDED` | Retained evidence or an intentionally excluded UI/branch path; not an active feature. |

## Current product modules

| Module | Status | User-visible scope | Source of truth |
| --- | --- | --- | --- |
| App shell and responsive surfaces | `CURRENT_VERIFIED` | Viewport-driven desktop/phone shell, Rail/Sheet/Blocking surface behavior | `UI_REGRESSION_CONTRACT.md`, Visual Acceptance Matrix |
| Aquarium workspace | `CURRENT_VERIFIED` | Immersive 3D stage, tank selection/settings, livestock entry, task surfaces and timeline entry | `src/pages/Aquarium.tsx`, Visual Baseline |
| Real livestock vs planning | `CURRENT_VERIFIED` | Existing livestock is recorded as fact; planned additions remain planning until explicitly confirmed | `CONTRACT.md`, `src/services/aquarium/` |
| Encyclopedia and species detail | `CURRENT_VERIFIED` | Browse, search/filter, persistent detail Rail/Sheet, collection and compatibility entry points | `src/pages/Encyclopedia.tsx`, Visual Acceptance Matrix |
| Care | `CURRENT_VERIFIED` | Interactive exploration plus browse fallback, article/task/reminder flows | `src/pages/CareEncyclopedia.tsx`, Visual Acceptance Matrix |
| Collection | `CURRENT_VERIFIED` | Wishlist, care saves, memorials, achievements and deep links | `src/pages/Collection*.tsx`, Visual Acceptance Matrix |
| Compatibility | `PARTIAL_WITH_FALLBACK` | Deterministic current baseline and safe insufficient-data outcomes | `src/lib/tankCompatibilityEngine.ts`, `CONTRACT.md` |
| Identification and health triage | `PARTIAL_WITH_FALLBACK` | Candidate confirmation, manual species fallback, controlled questions and urgent-path handling | `src/pages/Identify.tsx`, `src/services/ai/` |
| Text AI assistance | `PARTIAL_WITH_FALLBACK` | Structured assistant/daily-check paths with failure reporting | `apps/api/`, `server/index.mjs` |
| Visual AI | `PARTIAL_WITH_FALLBACK` | Manual confirmation when a visual provider is unavailable | Product Truth invariant 3 |
| Repository/API/Supabase architecture | `DEPLOYED_REVERIFY_PENDING` | Existing cloud architecture and user-data boundaries | `CONTRACT.md`, Deployment State |
| Sharing, feedback and admin content | `DEPLOYED_REVERIFY_PENDING` | Existing source/API paths; deployment parity should be checked before new release claims | `src/services/share/`, `src/services/feedback/`, `src/pages/AdminContent.tsx` |

## Proposed selective migrations

| Capability | Status | Constraint |
| --- | --- | --- |
| Compatibility evidence, current tank state and water-change authority | `PARTIAL_WITH_FALLBACK` | User-approved local rules and derived services are verified; existing UI geometry is unchanged and no new current-state UI surface is wired in this unit. |
| Species Detail evidence authority | `CURRENT_VERIFIED` | Detail key reasons and compatibility evidence consume the canonical rule result; profile notes are reference-only. RC detail layout was not copied. |
| Recommendation authority/severity | `CURRENT_VERIFIED` | Candidate preservation and direct/adjustable/blocked severity consume canonical `TankCompatibilityResult`; local load/group calculations remain explanatory risk/adjustment context. Current recommendation UI geometry is unchanged. |
| API/Vercel runtime changes | `RC_MIGRATION_PROPOSED` | Separate deployment/API contract review required. |

## Archived or excluded paths

- RC page components, global CSS and Interactive Atlas UI are `HISTORICAL_OR_EXCLUDED` unless a specific behavior is independently justified.
- PR #140 and `codex/rc1-visual-convergence-v1` are `HISTORICAL_OR_EXCLUDED`.
- `/3d-demo`, project-structure previews and old prototype files are experiments or evidence, not formal product delivery routes.

## Update rule

Any feature change must update this row, the linked canonical product/UI/data document, and its test evidence in the same change. A PR title or a prior deployment cannot change a row by itself.
