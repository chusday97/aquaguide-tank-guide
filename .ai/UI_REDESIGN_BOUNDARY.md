# Aqua UI Redesign Boundary

## Goal
Rebuild Aqua's visual language, information hierarchy, responsive layout, and interaction presentation without redefining the already-verified product/domain behavior.

## Frozen behavior
- Compatibility domain rules, canonical result policy, evidence priority, and add-policy semantics.
- Species Knowledge authority and reviewed/unknown truth handling.
- Aquarium creation facts, livestock persistence, atomic add/remove/replay behavior.
- Today Action priority and Daily Check state transitions.
- Care decision logic and existing task/result contracts.
- Production database migrations and release policy.

## UI redesign may change
- Page composition, navigation presentation, spacing, typography, color, surfaces, icons, motion, responsive layout.
- Information hierarchy and progressive disclosure.
- View-model/adaptor presentation code when needed to expose existing domain truth cleanly.
- Component structure where behavior contracts remain unchanged.

## Hard guardrails
- No UI task may introduce a second compatibility or care decision engine.
- Do not infer missing domain facts in the view layer.
- Do not write to real livestock state from planning/preview interactions.
- Business behavior changes must be isolated, named, and reviewed separately from UI work.
- Each production UI implementation must keep the existing Golden Path / Compatibility / Aquarium regressions green.

## Workflow
Reference/intent → disposable variants or prototype → human direction choice → production View Layer implementation → browser evidence → design review → regression gates.
