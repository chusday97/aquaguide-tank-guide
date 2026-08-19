# AquaGuide RC1 Handoff — PUI-BC-034

## Problem
Identify manual species search rendered “共匹配 N 个物种，请继续输入” as a button solely because the shared autocomplete required an `onViewAllSpecies` prop to render the overflow copy. Identify supplied `() => undefined`, creating a visible CTA with no effect.

## RC1 product contract
- Overflow copy that only instructs the user to keep typing is informational, not an action.
- `SearchAutocomplete` renders a button only when a real `onViewAllSpecies` effect exists.
- Without that effect it renders `data-search-overflow-hint="true"` as a non-interactive hint.
- Global Search retains its real show-all button from PUI-BC-033.

## Regression
`scripts/verify-identify-search-overflow-hint.mjs` verifies the Identify overflow element is a DIV and that no non-option button exists in that overflow region.

Keep RC1 Draft until the clean combined Product/UI gates pass.
