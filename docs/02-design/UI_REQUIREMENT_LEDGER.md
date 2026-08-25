# AquaGuide UI Requirement Ledger

Updated: 2026-08-25

## Purpose
This is the chronological source of truth for accepted UI/UX requirements. `UI_SOURCE_OF_TRUTH.md` defines the visual language and non-regression baseline; this ledger defines the complete requirement set, including decisions made after the baseline SHA.

## Precedence
1. Latest explicit user UI decision wins.
2. A later accepted interaction contract supersedes an older conflicting implementation.
3. Commits/screenshots are implementation evidence, not product truth by themselves.
4. RC1 logic may replace domain authority, but may not silently rewrite visual hierarchy.
5. A UI requirement is DONE only when implementation + browser regression + visual review agree.

## Status
`KEEP` = present and protected · `MISSING` = accepted but absent · `PARTIAL` = incomplete · `VERIFY` = implemented but needs visual confirmation · `SUPERSEDED` = replaced by a later decision.

## Current ledger
| ID | Requirement | Source / later evidence | Status | Canonical owner | Acceptance |
|---|---|---|---|---|---|
| UI-001 | Aquarium >=960px is one immersive 3D stage; status/actions are overlays | interactive-parity final contract | KEEP | `Aquarium.tsx`, `ThreeAquarium.tsx` | 1440/1024 geometry + camera framing |
| UI-002 | Desktop browse detail = 480-600px persistent right rail; mobile = bottom sheet | surface contract | KEEP | shared Surface + Species Detail | desktop/mobile surface matrix |
| UI-003 | Care uses workspace/detail, not blocking modal chains | Care workspace convergence | KEEP | Care | browse/deeplink/back-context |
| UI-004 | Collection is creature-first and interaction-first | `8e6417f` | KEEP | `CollectionHub.tsx` | desktop + compact fallback |
| UI-005 | Collection should retain IceGlide-like focused carousel/center-focus feel | explicit user requirement after initial collection work | VERIFY | `CollectionHub.tsx` | focus hierarchy + wheel/drag/touch/keyboard |
| UI-006 | Interactive Atlas opens in the accepted 6-creature SpeciesSceneAtlas; first click selects in-scene, profile opens only on explicit action; visual discovery is not Compatibility | `5c03448`, `8577511`, `22d61d0`; later toolbar/authority fixes retained | KEEP | `Encyclopedia.tsx` + `interactive/SpeciesSceneAtlas.tsx` | 6-creature batch + persistence + transparent assets + dock overlay + authority boundary |
| UI-007 | Mobile Encyclopedia surfaces search directly in its own toolbar | `66a9ab4`, PR #124 | KEEP | Encyclopedia | mobile search focus regression |
| UI-008 | Mobile Encyclopedia owns one top toolbar; App shell header is suppressed there | `a936323`, PR #128 | KEEP | `App.tsx`, Encyclopedia | exactly one toolbar at 390px |
| UI-009 | Mobile shell header CSS applies only to the shell header; Identify page header must not be polluted | `f09ece0`, PR #126 | KEEP | `ui-v2-shell.css`, Identify | Identify mobile header regression |
| UI-010 | Browsing/opening Species detail must not implicitly modify Compatibility selection | Atlas authority hardening | KEEP | Encyclopedia / Species Detail | selection unchanged until explicit action |
| UI-011 | Species Detail evidence/verdict comes from canonical Compatibility authority | `45e8e61`, PR #130 | KEEP | Species Detail presentation adapter | canonical-vs-view contract |
| UI-012 | Mobile Species Detail initial viewport must expose verdict before primary CTA and keep the primary action reachable | existing detail experience contract | KEEP | Species Detail | 390x844 first-viewport regression |
| UI-013 | Aquarium home hierarchy = state & Today Action -> tank/livestock -> frequent daily actions; one true primary action per state | `INTERACTION_SPEC.md` | VERIFY | Aquarium | seeded state screenshots + path checks |
| UI-014 | Interactive Atlas observation state: after explicit profile CTA, desktop aquarium/scene narrows left and Species Detail slides in on the right; closing restores the exact same scene/batch | explicit user requirement 2026-08-22; Draft PR #112 `ddc9db51` | KEEP | `Encyclopedia.tsx` + `SpeciesSceneAtlas` + Species Detail Rail | 1440/1024 no-overlap reflow + exact-scene restore; phone remains bottom sheet |

## Superseded examples
- Browsing detail as centered blocking modal -> `SUPERSEDED` by persistent rail / bottom sheet.
- Desktop 50/50 or 54/46 split workspace -> `SUPERSEDED` by overlay/persistent rail contract.
- Static temperament or generic tank-size warning driving Current Tank danger UI -> `SUPERSEDED` by Current Tank State authority.
- RC1 `InteractiveSpeciesAtlas` knowledge-panel/re-entry layout as the visual owner -> `SUPERSEDED` by the accepted 2026-08-21 `SpeciesSceneAtlas`; later Search/Toolbar/authority fixes are retained semantically.

## Execution order
1. Recover accepted post-baseline missing requirements (UI-006..UI-009).
2. Close partial regressions (UI-011, UI-012).
3. Re-audit explicit user requests not encoded in commits/docs, especially Collection focus-carousel behavior (UI-005).
4. Promote only visually accepted cases into screenshot golden baselines.

## 2026-08-25 recovery checkpoint
- UI-006..UI-010 restored on `reconcile/final-ui-rc1-v1`.
- Interactive Atlas authority contract PASS; visual-only scene never imports Compatibility / Current Tank / Water Change / Recommendation authority.
- The earlier RC1 `InteractiveSpeciesAtlas` knowledge-panel implementation is retired from the unified checkpoint and is no longer a visual owner. The accepted `SpeciesSceneAtlas` is restored as default scene mode.
- SpeciesSceneAtlas runtime PASS: six creatures, whole-batch replacement, same-day no-repeat, refresh persistence, transparent asset fallback, and selected dock overlay at 768 / 1024 / 1440.
- Mobile Encyclopedia toolbar ownership PASS: exactly one top toolbar, direct Search + Identify + Settings, 44px targets.
- Identify header regression PASS at 390 / 900 / 1600.
- Page runtime matrix uses `[data-interactive-atlas]` on the canonical `.interactive-tank-shell` scene: 28/28 PASS.

## 2026-08-25 13:38 +0800 checkpoint
- UI-011 KEEP: Species Detail watch/avoid/evidence now comes from canonical Compatibility rule buckets; tank-size/equipment/housing fields are explicitly reference-only.
- UI-012 KEEP: mobile detail order is Identity/Hero -> canonical verdict -> primary action -> feeding/reference; 390x844 CTA regression PASS.
- UI-005 VERIFY: current creature-first Collection now also has center-focus carousel semantics: adjacent peeks, arrows, dots, spring transition, horizontal drag/swipe, `touch-action: pan-y`, and compact mobile creature shortcuts.
- Collection creature-navigation runtime PASS at 1440/1024/768/390; focus-carousel runtime PASS including mobile drag.
- UI-005 remains VERIFY until user human visual acceptance; implementation is not yet promoted to a golden screenshot contract.

## 2026-08-25 14:31 +0800 — Interactive Atlas observation-state recovery
- UI-014 KEEP: recovered the explicit 2026-08-22 two-state Atlas contract and Draft PR #112 behavior.
- Desktop 1440/1024: scene actively narrows left; current canonical Species Detail Rail slides from the right; scene and rail have 0px overlap.
- Closing detail restores original scene width and the exact persisted six-species batch; no reroll.
- Narrowed scene removes the old in-scene selection dock so the right Species Detail is the single detail surface.
- Phone remains the accepted bottom-sheet behavior and does not use desktop narrowing.
- This is a scoped exception to the general persistent-Rail rule: ordinary browse pages remain usable behind the Rail; Interactive Atlas intentionally yields scene width after explicit profile intent.
