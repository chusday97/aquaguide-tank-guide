import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export type ActionKind = 'route' | 'view' | 'mutation' | 'dialog' | 'section' | 'external';

const collectTsx = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const path = join(directory, entry.name);
  if (entry.isDirectory()) {
    if (path === 'src/components/ui') return [];
    return collectTsx(path);
  }
  return entry.isFile() && entry.name.endsWith('.tsx') ? [path] : [];
});

const formalPages = [
  'src/App.tsx',
  'src/pages/Aquarium.tsx',
  'src/pages/Encyclopedia.tsx',
  'src/pages/CareEncyclopedia.tsx',
  'src/pages/Collection.tsx',
  'src/pages/CollectionHub.tsx',
  'src/pages/Identify.tsx',
  'src/pages/Login.tsx',
  'src/pages/MemorialDetail.tsx',
  'src/pages/Search.tsx',
  'src/pages/Settings.tsx',
  'src/pages/SharedReport.tsx',
  'src/pages/Welcome.tsx',
];
const files = Array.from(new Set([...formalPages, ...collectTsx('src/components')]));

const forbiddenPatterns = [
  { label: 'empty click handler', pattern: /onClick\s*=\s*\{\s*\(\)\s*=>\s*\{\s*\}\s*\}/g },
  { label: 'undefined click handler', pattern: /onClick\s*=\s*\{\s*\(\)\s*=>\s*undefined\s*\}/g },
  { label: 'console-only click handler', pattern: /onClick\s*=\s*\{\s*\(\)\s*=>\s*console\.(?:log|debug)\(/g },
  { label: 'native alert', pattern: /\b(?:window\.)?alert\s*\(/g },
  { label: 'empty or javascript link', pattern: /href\s*=\s*(?:\{\s*)?["'](?:#|javascript:[^"']*)["']/g },
];

const failures: string[] = [];
const actionCounts: Record<ActionKind, number> = {
  route: 0,
  view: 0,
  mutation: 0,
  dialog: 0,
  section: 0,
  external: 0,
};

const classifyAction = (tag: string): ActionKind => {
  if (/type\s*=\s*["']submit["']/.test(tag) || /(?:save|submit|delete|remove|confirm|complete|toggleFavorite|toggleWishlist)/i.test(tag)) return 'mutation';
  if (/(?:navigate|routeNavigate|navigateToRoute|window\.location)/.test(tag)) return 'route';
  if (/(?:scrollIntoView|scrollTo|focus\(|highlight)/.test(tag)) return 'section';
  if (/(?:Dialog|Modal|Sheet|Preview|setIs[A-Z].*Open|setPending|onClose|close)/.test(tag)) return 'dialog';
  return 'view';
};

files.forEach(file => {
  const source = readFileSync(file, 'utf8');
  forbiddenPatterns.forEach(({ label, pattern }) => {
    pattern.lastIndex = 0;
    if (pattern.test(source)) failures.push(`${file}: ${label}`);
  });

  const tags = Array.from(source.matchAll(/<(button|Button)\b[\s\S]*?<\/\1>/g), match => match[0]);
  tags.forEach(tag => {
    if (/\.\.\.(?:props|buttonProps)/.test(tag)) return;
    if (!/on(?:Click|DoubleClick|PointerDown)\s*=/.test(tag) && !/type\s*=\s*["']submit["']/.test(tag) && !/formAction\s*=/.test(tag)) {
      failures.push(`${file}: visible button lacks click, submit, or form action: ${tag.replace(/\s+/g, ' ').slice(0, 120)}`);
      return;
    }
    actionCounts[classifyAction(tag)] += 1;
  });

  const anchors: string[] = source.match(/<a\b[\s\S]*?>/g) || [];
  anchors.forEach((tag: string) => {
    if (/href\s*=/.test(tag)) actionCounts.external += 1;
    else failures.push(`${file}: anchor lacks href: ${tag.replace(/\s+/g, ' ').slice(0, 120)}`);
  });
});

assert.deepEqual(failures, [], failures.join('\n'));
console.log(`product actions: ${files.length} formal surfaces passed semantic handler audit`);
console.log(`action inventory: ${Object.entries(actionCounts).map(([kind, count]) => `${kind}=${count}`).join(', ')}`);
