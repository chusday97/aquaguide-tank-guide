# AquaGuide Agent Instructions

## Skills

- **aquaguide-ui-ux** — Use for any user-facing UI or UX change involving navigation, task paths, dialogs/drawers/sheets, result presentation, compatibility/risk visualization, species detail, onboarding/forms, responsive layout, or complaints that the interface is flat, modal-heavy, text-heavy, hard to scan, or loses context. Read `.agents/skills/aquaguide-ui-ux/SKILL.md` before editing those surfaces.

## UI change gate

For UI work, do not treat typecheck/build success as visual acceptance. Follow the skill's audit workflow, preserve route/task context, add stable regression coverage, validate 390/900/1600 responsive behavior, and manually inspect the resulting screenshots when the workflow provides them.
