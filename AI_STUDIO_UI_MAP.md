# AquaGuide UI Map

This file is a navigation aid only. The repository files themselves are the source of truth.

## Application shell
- Entry: `src/main.tsx`
- Router/workspace shell: `src/App.tsx`
- Global stylesheet: `src/index.css`
- Typography: `src/styles/typography-system.css`
- Additional layout styles: `src/styles/aquarium-stage-layout-v4.css`, `aquarium-stage-layout-v5.css`, `immersive-detail-layout-v5.css`, `species-compat-layout-v1.css`

## Primary product routes
- `/aquarium` → Aquarium workspace
- `/encyclopedia` → Species encyclopedia
- `/compatibility` → Compatibility calculator
- `/care` → Care encyclopedia / interactive care
- `/identify`, `/search`, `/settings`, `/collection/*` are part of the same application shell

## Primary page files
- `src/pages/Aquarium.tsx`
- `src/pages/Encyclopedia.tsx`
- `src/pages/Compatibility.tsx`
- `src/pages/CareEncyclopedia.tsx`
- `src/pages/Search.tsx`
- `src/pages/Identify.tsx`
- `src/pages/Settings.tsx`
## Care UI dependency chain
- Route shell: `src/App.tsx`
- Page: `src/pages/CareEncyclopedia.tsx`
- Main interactive component: `src/components/interactive/KnowledgeSceneExplorer.tsx`
- Presentation mapping: `src/components/interactive/knowledgeJourney.ts`
- Latest guide adapter: `src/data/latestCareGuideCatalog.ts`
- Image fallback: `src/components/common/ResilientImage.tsx`
- Hand-drawn assets: `public/care-guides-handdrawn/`
- Care styles are distributed through `src/index.css`; do not assume a standalone Care stylesheet is complete.

## Aquarium / species / compatibility UI
- Aquarium page: `src/pages/Aquarium.tsx` plus aquarium stage layout styles
- Species atlas: `src/components/interactive/SpeciesSceneAtlas.tsx`
- Compatibility page: `src/pages/Compatibility.tsx`
- Shared navigation and workspace behavior live in `src/App.tsx` and navigation services

## Important rule
If a visual dependency appears to be missing, search the repository before recreating it. Preserve the existing import graph, route shell, CSS cascade, design tokens, assets, responsive behavior, and interaction contracts.