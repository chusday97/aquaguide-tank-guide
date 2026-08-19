---
name: aquaguide-ui-ux
description: Audit and repair AquaGuide UI/UX interaction quality. Use for navigation/path continuity, dialogs/drawers/sheets, information hierarchy, compatibility/risk results, species details, onboarding/forms, responsive layout, and any task where the UI feels flat, modal-heavy, text-heavy, or loses user context.
---

# AquaGuide UI/UX Interaction Skill

Use this skill before changing any AquaGuide user-facing interaction. The goal is not cosmetic polish. The goal is to make the product legible, reversible, state-consistent, and fast to scan.

## Non-negotiable product rules

1. **Preserve task context.**
   - A secondary action such as “查看我的鱼缸” must not destroy the caller's route/query/hash/scroll/detail state.
   - Cross-surface navigation must carry an explicit return context or preserve browser history so the user can return to the exact prior state.
   - Never replace a specific task route with a generic section home unless that is the user's explicit intent.

2. **Use the least disruptive surface.**
   - Prefer inline disclosure for extra explanation.
   - Prefer a responsive side panel / detail surface for browsable reference content.
   - Use Dialog only for short blocking decisions, confirmation, or destructive actions.
   - Do not open Dialog from Dialog. Do not create a new modal when a route, drawer, popover, inline expansion, or toast can do the job.

3. **Result first, explanation second.**
   - Every decision/result surface must start with one dominant semantic result: safe / caution / dangerous / unknown / better / worse / equal.
   - Encode the result with icon + short label + one numeric/comparative cue when available.
   - Use `>`, `<`, `≈`, arrows, warning/danger/check/info icons, chips, and compact comparison rows before paragraphs.
   - Paragraph copy is supporting evidence, never the primary visual hierarchy.

4. **Risk must look like risk.**
   - Compatibility/mixed-tank results must visually distinguish at least: compatible, caution, incompatible/high-risk, insufficient evidence.
   - High-risk outcomes cannot be rendered with the same visual weight as neutral explanatory copy.
   - Do not imply factual certainty when evidence is incomplete; “unknown” must be visually distinct from “safe”.

5. **Detail width follows information density.**
   - Species detail is a dense reference surface, not a narrow settings drawer.
   - Desktop detail width should support image + summary + structured facts without forcing one-word columns or excessive vertical scrolling.
   - Mobile detail becomes a full-height/full-width detail surface rather than a squeezed desktop sidebar.
   - Existing content layout must be reflowed when surface width changes; do not merely stretch a narrow layout.

6. **Form state and CTA state must agree.**
   - If an option is visually selected by default, it must also exist in the actual form state.
   - If a required field has a valid default, “下一步” must be enabled unless another visible requirement is unmet.
   - Do not use placeholder/default-looking UI that is not a real selected value.
   - Every disabled CTA must have an inspectable reason in UI or code.

7. **Reduce words, not information.**
   - Replace repeated explanatory prose with semantic labels, status rows, icons, progressive disclosure, and evidence details.
   - Keep decision-critical facts visible; collapse rationale, examples, and educational background.
   - Avoid card-inside-card-inside-card and title-inside-title hierarchy.

8. **Responsive behavior is a product rule.**
   - Validate at minimum 390px, 900px, and 1600px.
   - No horizontal overflow.
   - Fixed headers/bottom bars must not cover content.
   - Desktop side panels must not be reused blindly on phone.

9. **Browsing is not selection.**
   - Opening a species/card/detail is a read-only exploration action and must not mutate compatibility selection, wishlist, aquarium contents, or another decision state.
   - “加入混养判断” is an explicit decision action. It may update the selection, but must not also navigate away unless the CTA explicitly says it will open the result.
   - “加入判断” and “查看判断结果” are separate intents. Model them as separate states/actions instead of a hidden chained side effect.
   - If an item is already selected, the UI may expose “查看混养结果” or “从判断中移除”; never infer the next action from merely opening the detail.

10. **One CTA, one intent.**
   - A primary action must do the thing its label promises and no hidden second task.
   - “保存记录” must save; it must not also open an article, navigate elsewhere, select another entity, or launch a new workflow.
   - If a next step is useful after completion, expose it as a separate visible CTA or inline disclosure after the first action succeeds.
   - Do not increase content exposure by chaining a second Dialog onto a successful mutation.

## Surface decision rubric

Before adding a modal, answer in order:

- Is this information part of the current decision? → inline.
- Is it optional detail that should preserve the current task? → expandable region / popover.
- Is it a browsable entity detail? → route-aware detail panel or full detail page.
- Is it a short blocking confirmation/destructive decision? → Dialog.
- Does it launch another multi-step task? → route/task surface with return context, not nested modal.

If a Dialog is used only because it is easy to implement, reject it.

## Navigation contract

For every cross-route CTA:

- capture caller route + query + hash + scroll + source element id when leaving a specific task/detail state;
- encode a `source` / `returnTo` state when the destination needs an explicit back affordance;
- preserve the exact task route (`?mode=compatibility`, selected species, filters, etc.);
- on return, restore the prior scroll/focus where feasible;
- browser Back must work as expected;
- no CTA may silently send the user to `/aquarium` when the intended destination is `/aquarium?action=...`.

## Result hierarchy contract

Order for compatibility/fit/diagnosis-like results:

1. semantic icon;
2. one short verdict label;
3. one compact comparison/status cue;
4. top 1–3 reasons/risks;
5. primary next action;
6. expandable evidence/details.

Avoid leading with a paragraph.

Recommended semantic mapping:

- compatible / healthy / complete → `CheckCircle2`
- caution / adjustment needed → `AlertTriangle`
- dangerous / blocked / incompatible → `OctagonAlert` or strong danger icon
- insufficient evidence / unknown → `Info`
- greater / less / approximately equal → `>`, `<`, `≈` or arrow icons plus accessible text

Icons never replace accessible text/aria-labels.

## Species detail contract

Desktop target behavior:

- use a wide detail surface (roughly 680–900px depending on viewport), not a 380–480px utility drawer;
- top section: image/identity + high-value facts;
- middle: suitability/compatibility summary with semantic verdict;
- bottom/secondary: husbandry evidence, provenance, detailed explanation;
- use two-column or structured grid only when each column retains readable line length.

Mobile target behavior:

- full-height detail surface;
- sticky compact header + close/back;
- single-column content;
- primary action reachable without covering content.

Decision behavior:

- opening the detail is read-only;
- compatibility selection only changes after an explicit “加入混养判断 / 移出判断” action;
- adding a species keeps the user in context; navigating to the calculator/result requires a separate explicit “查看混养结果” action.

## Form-state contract

For every wizard/step form:

- derive initial state from the same default displayed in controls;
- `canContinue` must be derived from form state, never from a separate stale flag;
- when defaults change, tests must prove the CTA state changes consistently;
- keyboard and pointer selection must produce the same state.

## Required audit workflow

1. Reproduce the interaction from the user's entry route.
2. Record route/query/hash before action.
3. Identify the surface type actually used (inline/dialog/drawer/page).
4. Check state continuity after opening, completing, cancelling, and pressing Back.
5. Check primary result scanability at 1-second glance.
6. Check CTA state vs visible selected state.
7. Check low-intent browse actions do not mutate high-intent selection/persistence state.
8. Check whether one CTA is secretly doing more than one intent.
9. Check 390/900/1600 layout.
10. Add a source/browser regression before or with the fix.
11. Run typecheck + build + relevant Product Golden Path.
12. Do a screenshot/manual visual pass; green CI is not sufficient for visual acceptance.

## AquaGuide badcases this skill must prevent

- modal proliferation for non-blocking information;
- “查看我的鱼缸” leaves a specific Encyclopedia/compatibility/detail state and cannot return to it;
- opening a species detail silently adds that species to compatibility judgement;
- “加入混养判断” immediately throws the user into a different page without a separate navigation intent;
- saving a Daily Check immediately launches a separate care-article Dialog;
- compatibility result is paragraph-first and visually flat;
- species detail uses an overly narrow right-side drawer so the old layout becomes cramped;
- a body-shape/default choice looks selected but Next remains disabled;
- route actions collapse to generic home routes;
- nested cards/titles create component-demo appearance instead of a decision flow.

## Implementation discipline

- Prefer existing `WorkspaceNavigationProvider` context capture/restore mechanisms before inventing a second navigation system.
- Prefer the existing semantic visual-result components and Lucide icons; extend them rather than creating bespoke status styling per page.
- Prefer shadcn/Base UI primitives already owned by the repo; do not add a new UI framework for one interaction.
- Keep business/evidence logic unchanged when fixing presentation unless the UI bug exposes a real state bug.
- When a presentation change changes E2E text, use stable semantic IDs instead of forcing old wording back into the UI.