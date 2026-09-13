# Aqua Product Accepted Baseline

Updated: 2026-09-11
Branch: product-recovery-20260911

## Purpose
This file is the product-facing freeze authority for Aqua recovery work. The default rule is: preserve accepted user-facing structure unless the active task explicitly authorizes a surface change.

## Product surfaces

### Frozen by default
- Global navigation and primary route structure
- Existing Aquarium page information architecture outside compatibility/action-result surfaces
- Existing Species detail header and primary identity presentation
- Existing accepted spacing, typography hierarchy, and page-level layout unless a task explicitly targets them
- Any unrelated Admin / SEO / publishing UI

### Active recovery surfaces
- Compatibility decision result surface
- Beginner Action Layer: "只告诉我该怎么做"
- Species knowledge content structure for sex identification / reproduction / husbandry
- Compatibility decision logic and evidence contracts

## Non-negotiable UX rules
1. Beginner users see the final decision first: can add / can add with conditions / do not add / need more information.
2. Show the action before professional explanation.
3. Professional parameters and evidence are progressively disclosed.
4. Do not use a single compatibility percentage as the primary decision.
5. A recommended tank size is not automatically a hard safety boundary.
6. Hard biological conflicts must not be overridden by anecdotal stability.
7. Soft capacity/guideline risks may be adjusted by stable real-world tank context.

## Change control
Before changing UI outside an active recovery surface, the agent must explicitly record why that surface is required for the task. Otherwise it is out of scope.

## Recovery policy
The legacy branch `feature/admin-content-v0` is a reference/source branch only for recovery work. Do not merge or rebase it wholesale into this branch. Migrate only explicitly selected product-facing capabilities or contracts after review.
