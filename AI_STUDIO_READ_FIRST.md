# AquaGuide AI Studio UI Sync — Read This First

This repository is an existing AquaGuide application. Do NOT create a new demo, isolated preview app, replacement shell, or standalone Care prototype.

Your first task is read-only: understand and run the existing project exactly as it is.

Before changing code, inspect:
- `package.json`, `vite.config.ts`, `tsconfig.json`
- `src/main.tsx` and `src/App.tsx`
- all files in `src/pages/`
- shared UI in `src/components/`
- `src/index.css` in full
- all files in `src/styles/`
- referenced assets in `public/`
- existing data adapters used by the page you are modifying

Run the current app and verify the existing routes `/aquarium`, `/encyclopedia`, `/compatibility`, and `/care` before editing anything.

The Preview must be the existing AquaGuide application, not a recreated page based on a prompt.
## Editing boundary

You may change the presentation/UI layer when the user asks: JSX composition, component layout, visual hierarchy, CSS, responsive behavior, interaction states, and presentation-only local state.

Do NOT silently replace or rewrite business/domain behavior. Treat Compatibility, Species Knowledge, Aquarium persistence/add-remove-replay, Today Action truth, Daily Check, Care decision logic, data authorities, repositories, services, and API contracts as frozen unless the user explicitly asks to change them.

For Care specifically, `KnowledgeSceneExplorer.tsx` is one component inside the existing AquaGuide UI system. Its appearance depends on global CSS and app-level styles. Do not detach it from `src/index.css`, the app shell, typography system, or existing asset paths.

Do not replace the existing DOM/component structure with a generated mock just because a screenshot or prompt is easier to reproduce that way.

Before the first edit, report briefly:
1. application entry and router location;
2. page/component tree for the target page;
3. CSS/style dependency chain;
4. asset/data dependencies;
5. files you intend to edit.

Only after that report should you modify the existing files in place.