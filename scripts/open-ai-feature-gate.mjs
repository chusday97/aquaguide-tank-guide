import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/components/layout/WorkspaceNavigationProvider.tsx';
let source = readFileSync(path, 'utf8');
const marker = '// AQUAGUIDE_AI_OPEN_V1';

if (!source.includes(marker)) {
  source = source.replace(
    "// AQUAGUIDE_PRODUCT_UX_CLOSURE_V1",
    "// AQUAGUIDE_PRODUCT_UX_CLOSURE_V1\n// AQUAGUIDE_AI_OPEN_V1",
  );

  source = source.replace(
`    const handleFeaturePreviewEvent = (event: Event) => {
      const feature = (event as CustomEvent<{ feature?: string }>).detail?.feature || '';
      showFeaturePreview(feature.startsWith('auth') ? 'auth' : 'ai');
    };`,
`    const handleFeaturePreviewEvent = (event: Event) => {
      const feature = (event as CustomEvent<{ feature?: string }>).detail?.feature || '';
      if (feature.startsWith('auth')) showFeaturePreview('auth');
    };`,
  );

  source = source.replace(
`      if (/AI\\s*(Tank Copilot|建缸助手|建议|养护|风险|Plan|Care)|(^|\\s)AI($|\\s)/i.test(text)) {
        event.preventDefault();
        event.stopPropagation();
        showFeaturePreview('ai');
      }
`,
'',
  );

  writeFileSync(path, source, 'utf8');
}

// Triggered after the workflow exists; safe because the migration is idempotent.
