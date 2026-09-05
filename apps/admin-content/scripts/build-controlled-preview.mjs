import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { generatePublicSpecies } from './generate-public-species.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const repoRoot = path.resolve(appRoot, '../..');

function inside(child, parent) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export function validatePreviewOutputDir(outDir) {
  const resolved = path.resolve(outDir || path.join(appRoot, '.preview-output'));
  const forbidden = [path.join(repoRoot, 'public'), path.join(appRoot, 'public'), path.join(appRoot, 'dist')];
  if (forbidden.some((target) => inside(resolved, target))) {
    throw new Error(`Controlled Preview Publish refuses deployable output directory: ${resolved}`);
  }
  return resolved;
}

function renderPreviewIndex(siteUrl, pages, manifest) {
  const items = pages.map((page) => {
    const planned = page.routeMeta.robots;
    return `<li><a href="${page.routeMeta.selfPath}">${page.effectiveSeo.displayName || page.member.name} · ${page.row.locale}</a> <small>planned ${planned}</small></li>`;
  }).join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>AquaGuide Species Preview</title><style>body{font:16px/1.55 system-ui;max-width:920px;margin:48px auto;padding:0 24px;color:#17231d}code{background:#eef3ef;padding:2px 5px;border-radius:5px}li{margin:10px 0}.warn{padding:14px 16px;background:#fff4d6;border:1px solid #e7c66a;border-radius:12px}</style></head><body><h1>AquaGuide Controlled Preview Publish</h1><p class="warn"><strong>PREVIEW ONLY.</strong> All rendered pages are forced to <code>noindex,nofollow</code>. Planned SEO state is shown only for review.</p><p>Preview host: <code>${siteUrl}</code></p><p>Pages: ${manifest.generated_pages} · planned indexable: ${manifest.planned_indexable_pages}</p><ul>${items}</ul></body></html>\n`;
}

export async function buildControlledPreviewPublish({ snapshot, outDir, siteUrl, productionSiteUrl }) {
  if (snapshot?.environment !== 'preview' || snapshot?.delivery_mode !== 'controlled_preview') {
    throw new Error('Controlled Preview Publish requires environment=preview and delivery_mode=controlled_preview.');
  }
  const selected = Array.isArray(snapshot.selected_catalog_keys) ? snapshot.selected_catalog_keys.filter(Boolean) : [];
  if (!selected.length) throw new Error('Controlled Preview Publish requires explicit selected_catalog_keys.');
  const resolvedOut = validatePreviewOutputDir(outDir);
  const result = await generatePublicSpecies({
    snapshot,
    outDir: resolvedOut,
    siteUrl,
    productionSiteUrl,
    mode: 'preview',
    selectedCatalogKeys: selected,
  });
  if (!result.manifest.generated_pages) throw new Error('Controlled Preview Publish produced zero pages.');
  await writeFile(path.join(resolvedOut, 'robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8');
  const indexHtml = renderPreviewIndex(siteUrl, result.pages, result.manifest);
  await writeFile(path.join(resolvedOut, 'index.html'), indexHtml, 'utf8');
  await writeFile(path.join(resolvedOut, 'preview-index.html'), indexHtml, 'utf8');
  await writeFile(path.join(resolvedOut, 'preview-publish.manifest.json'), `${JSON.stringify(result.manifest, null, 2)}\n`, 'utf8');
  return { ...result, outDir: resolvedOut };
}

async function cli() {
  const args = process.argv.slice(2);
  const value = (name) => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : null; };
  const snapshotPath = value('--snapshot');
  const outDir = value('--out-dir') || path.join(appRoot, '.preview-output');
  const siteUrl = value('--site-url');
  const productionSiteUrl = value('--production-site-url');
  if (!snapshotPath || !siteUrl) throw new Error('Usage: node build-controlled-preview.mjs --snapshot <preview.json> --site-url <non-production-url> [--out-dir <dir>] [--production-site-url <url>]');
  const snapshot = JSON.parse(await readFile(path.resolve(snapshotPath), 'utf8'));
  const result = await buildControlledPreviewPublish({ snapshot, outDir, siteUrl, productionSiteUrl });
  console.log(JSON.stringify({ out_dir: result.outDir, ...result.manifest }));
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  cli().catch((error) => { console.error(`Controlled Preview Publish blocked: ${error.message}`); process.exitCode = 1; });
}
