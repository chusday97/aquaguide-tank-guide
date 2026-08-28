import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveEffectiveSeo } from '../src/seoInheritance.js';
import { buildSpeciesSeoRouteMeta } from '../src/seoRouteContract.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const PRODUCTION_SITE_HOSTS = new Set(['aqua-tank-guide.vercel.app']);
const SAFE_ENVIRONMENTS = new Set(['local', 'test', 'preview', 'staging']);

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeXml(value = '') {
  return escapeHtml(value);
}

function validateSiteUrl(siteUrl, environment, productionSiteUrl) {
  if (!siteUrl) throw new Error('siteUrl is required; non-production generation must use an explicit preview/staging host.');
  let parsed;
  try { parsed = new URL(siteUrl); } catch { throw new Error(`Invalid siteUrl: ${siteUrl}`); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(`Unsupported siteUrl protocol: ${parsed.protocol}`);
  if (environment === 'staging' && !productionSiteUrl) {
    throw new Error('productionSiteUrl is required for staging canonical deny-list validation.');
  }
  let productionHost = '';
  if (productionSiteUrl) {
    try { productionHost = new URL(productionSiteUrl).hostname; } catch { throw new Error(`Invalid productionSiteUrl: ${productionSiteUrl}`); }
  }
  if (PRODUCTION_SITE_HOSTS.has(parsed.hostname) || (productionHost && parsed.hostname === productionHost)) {
    throw new Error(`Refusing production canonical host for ${environment}: ${parsed.hostname}`);
  }
  parsed.pathname = parsed.pathname.replace(/\/$/, '');
  parsed.search = ''; parsed.hash = '';
  return parsed.toString().replace(/\/$/, '');
}

function absoluteUrl(siteUrl, pathname) {
  return `${siteUrl.replace(/\/$/, '')}${pathname}`;
}

function rowKey(key, locale) {
  return `${key}::${locale}`;
}

function reviewResolutionMap(snapshot) {
  return new Map((snapshot?.data_review_resolutions || []).map((row) => [row.issue_key, row]));
}

function categoryReviewKey(group) {
  return `category:${group?.group_key || ''}`;
}

function isPublished(row) {
  return row?.status === 'published' && !row?.deleted_at;
}

function normalizeLocale(locale) {
  return locale === 'en' ? 'en' : locale === 'zh-CN' ? 'zh-CN' : null;
}

function localizeTankSize(value, locale) {
  if (locale !== 'en') return value || '—';
  const match = String(value || '').match(/至少\s*(\d+(?:\.\d+)?)\s*升/);
  return match ? `At least ${match[1]} L` : '—';
}

function pageLabels(locale) {
  if (locale === 'en') {
    return {
      breadcrumb: 'Species', temperature: 'Temperature', ph: 'pH', tank: 'Tank size', difficulty: 'Difficulty',
      truth: 'Catalog facts', truthNote: 'These values come from AquaGuide Product Truth and are not rewritten by the SEO editor.',
    };
  }
  return {
    breadcrumb: '物种图鉴', temperature: '水温', ph: 'pH', tank: '建议缸体', difficulty: '饲养难度',
    truth: 'Catalog 事实数据', truthNote: '这些数值来自 AquaGuide Product Truth，SEO 编辑不会改写它们。',
  };
}

function validatePublishedRecord({ row, groupRow, member, group, effectiveSeo, rowMap, reviewMap }) {
  const errors = [];
  const locale = normalizeLocale(row.locale);
  if (!locale) errors.push(`unsupported locale ${row.locale}`);
  if (!member || !group) errors.push(`unknown catalog_key ${row.catalog_key}`);
  if (!isPublished(groupRow)) errors.push(`Base Species ${group?.group_key || 'unknown'} is not Published for ${row.locale}`);
  if (row?.review_state !== 'approved') errors.push('Variant editorial review is not Approved');
  if (groupRow?.review_state !== 'approved') errors.push('Base Species editorial review is not Approved');
  if (!effectiveSeo?.seoTitle?.trim()) errors.push('SEO title is empty');
  if (!effectiveSeo?.metaDescription?.trim()) errors.push('Meta description is empty');
  if (!effectiveSeo?.h1?.trim()) errors.push('H1 is empty');
  const intro = [effectiveSeo?.sharedIntro, effectiveSeo?.variantIntro].filter(Boolean).join('\n\n').trim();
  if (!intro) errors.push('Editorial intro is empty');
  if (locale === 'en' && !row.localized_name?.trim()) errors.push('English localized_name is required');

  const strategy = row.index_strategy || 'noindex';
  if (strategy !== 'noindex' && group?.category_conflict) {
    const categoryReview = reviewMap.get(categoryReviewKey(group));
    if (categoryReview?.decision !== 'accepted_as_is') errors.push('category-conflict group lacks an accepted data-review resolution');
  }
  const duplicateSet = (group?.duplicate_sets || []).find((set) => set.member_ids.includes(row.catalog_key));
  const duplicateReview = duplicateSet ? reviewMap.get(duplicateSet.duplicate_set_key) : null;
  if (duplicateSet && duplicateReview?.decision === 'distinct_records') {
    // Human review explicitly confirmed these records are distinct.
  } else if (duplicateSet && duplicateReview?.decision === 'duplicate_records') {
    const canonicalKey = duplicateReview.canonical_catalog_key;
    if (!duplicateSet.member_ids.includes(canonicalKey)) errors.push('duplicate review canonical target is not in the duplicate set');
    if (row.catalog_key === canonicalKey && strategy !== 'index') errors.push('reviewed duplicate canonical record must be independently indexed');
    if (row.catalog_key !== canonicalKey && strategy === 'index') errors.push('reviewed duplicate non-canonical record cannot be independently indexed');
    if (row.catalog_key !== canonicalKey && strategy === 'canonical_to_sibling' && row.canonical_catalog_key !== canonicalKey) errors.push('canonical target does not match the reviewed duplicate resolution');
  } else if (strategy === 'index' && duplicateSet) {
    errors.push('suspected duplicate cannot be independently indexed before review');
  }
  if (strategy === 'canonical_to_sibling') {
    const target = rowMap.get(rowKey(row.canonical_catalog_key, row.locale));
    if (!target || !isPublished(target)) errors.push('canonical sibling must be Published in the same locale');
    if (target?.index_strategy !== 'index') errors.push('canonical sibling must be an independently indexed target');
  }
  return errors;
}

function renderPage({ siteUrl, member, locale, effectiveSeo, routeMeta, availableAlternates }) {
  const labels = pageLabels(locale);
  const displayName = effectiveSeo.displayName || member.name;
  const intro = [effectiveSeo.sharedIntro, effectiveSeo.variantIntro].filter(Boolean).join('\n\n').trim();
  const canonical = absoluteUrl(siteUrl, routeMeta.canonicalPath);
  const selfUrl = absoluteUrl(siteUrl, routeMeta.selfPath);
  const alternates = Object.entries(availableAlternates)
    .map(([lang, pathname]) => `<link rel="alternate" hreflang="${escapeHtml(lang)}" href="${escapeHtml(absoluteUrl(siteUrl, pathname))}">`)
    .join('\n');
  const imageAlt = member.image_alt || `${displayName} (${member.scientific_name})`;
  const image = member.image || '';
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: effectiveSeo.h1,
    description: effectiveSeo.metaDescription,
    mainEntityOfPage: selfUrl,
    about: { '@type': 'Thing', name: displayName, alternateName: member.scientific_name },
    author: { '@type': 'Organization', name: 'AquaGuide' },
  }).replaceAll('<', '\\u003c');

  return `<!doctype html>
<html lang="${locale === 'en' ? 'en' : 'zh-CN'}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(effectiveSeo.seoTitle)}</title>
<meta name="description" content="${escapeHtml(effectiveSeo.metaDescription)}">
<meta name="robots" content="${escapeHtml(routeMeta.robots)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
${alternates}
<meta property="og:type" content="article"><meta property="og:title" content="${escapeHtml(effectiveSeo.seoTitle)}"><meta property="og:description" content="${escapeHtml(effectiveSeo.metaDescription)}"><meta property="og:url" content="${escapeHtml(selfUrl)}">
<style>:root{--g:#315f49;--bg:#f5f8f5;--card:#fff;--ink:#17231d;--mut:#65736b;--line:#dce5de}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;line-height:1.65}a{color:var(--g)}header{border-bottom:1px solid var(--line);background:#fff}.bar,main{max-width:1040px;margin:auto;padding-left:24px;padding-right:24px}.bar{padding-top:16px;padding-bottom:16px;font-weight:800}.crumb{color:var(--mut);font-size:.88rem;margin:34px 0 14px}.hero{display:grid;grid-template-columns:minmax(220px,34%) 1fr;gap:34px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:24px;padding:28px}.hero img{width:100%;aspect-ratio:1;object-fit:contain;border-radius:18px;background:#eef4ef}.hero h1{font-size:clamp(2rem,5vw,3.8rem);line-height:1.02;letter-spacing:-.045em;margin:8px 0}.scientific{color:var(--mut);font-style:italic}.intro{font-size:1.06rem;white-space:pre-line}.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}.fact{background:#fff;border:1px solid var(--line);border-radius:15px;padding:16px}.fact span{display:block;color:var(--mut);font-size:.82rem}.truth{margin:18px 0 50px;padding:18px;border:1px solid var(--line);border-radius:15px;background:#edf5ef}.truth p{margin:4px 0 0;color:var(--mut)}@media(max-width:760px){.hero{grid-template-columns:1fr}.facts{grid-template-columns:1fr 1fr}}</style>
<script type="application/ld+json">${jsonLd}</script>
</head>
<body>
<header><div class="bar"><a href="/">AquaGuide</a></div></header>
<main><div class="crumb">AquaGuide / ${escapeHtml(labels.breadcrumb)} / ${escapeHtml(displayName)}</div>
<article class="hero">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(imageAlt)}">` : '<div></div>'}<div><h1>${escapeHtml(effectiveSeo.h1)}</h1><div class="scientific">${escapeHtml(member.scientific_name)}</div><p class="intro">${escapeHtml(intro)}</p></div></article>
<section class="facts"><div class="fact"><span>${labels.temperature}</span><strong>${escapeHtml(member.water_temperature || '—')}</strong></div><div class="fact"><span>${labels.ph}</span><strong>${escapeHtml(member.ph_level || '—')}</strong></div><div class="fact"><span>${labels.tank}</span><strong>${escapeHtml(localizeTankSize(member.tank_size, locale))}</strong></div><div class="fact"><span>${labels.difficulty}</span><strong>${escapeHtml(member.difficulty || '—')}</strong></div></section>
<section class="truth"><strong>${escapeHtml(labels.truth)}</strong><p>${escapeHtml(labels.truthNote)}</p></section></main>
</body></html>\n`;
}

function renderSitemap(siteUrl, pages) {
  const indexPages = pages.filter((page) => page.routeMeta.robots === 'index,follow' && page.routeMeta.selfPath === page.routeMeta.canonicalPath);
  const items = indexPages.map((page) => {
    const links = Object.entries(page.availableAlternates)
      .map(([lang, pathname]) => `<xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(absoluteUrl(siteUrl, pathname))}" />`)
      .join('');
    return `<url><loc>${escapeXml(absoluteUrl(siteUrl, page.routeMeta.selfPath))}</loc>${links}</url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${items}\n</urlset>\n`;
}

export async function generatePublicSpecies({ snapshot, outDir, siteUrl, productionSiteUrl }) {
  if (!snapshot || typeof snapshot !== 'object') throw new Error('Publication snapshot is required.');
  if (!SAFE_ENVIRONMENTS.has(snapshot.environment)) throw new Error(`Refusing publication snapshot environment: ${snapshot.environment || 'missing'}`);
  const validatedSiteUrl = validateSiteUrl(siteUrl, snapshot.environment, productionSiteUrl);
  if (!outDir) throw new Error('outDir is required; generator never writes into public/ implicitly.');

  const [catalog, groupData] = await Promise.all([
    readFile(path.join(appRoot, 'src/catalog.generated.json'), 'utf8').then(JSON.parse),
    readFile(path.join(appRoot, 'src/species-groups.generated.json'), 'utf8').then(JSON.parse),
  ]);
  const catalogMap = new Map(catalog.map((item) => [item.catalog_key, item]));
  const groupByCatalog = new Map();
  for (const group of groupData.groups) for (const member of group.members) groupByCatalog.set(member.catalog_key, group);

  const rows = Array.isArray(snapshot.species_seo) ? snapshot.species_seo : [];
  const groupRows = Array.isArray(snapshot.species_seo_groups) ? snapshot.species_seo_groups : [];
  const rowMap = new Map(rows.map((row) => [rowKey(row.catalog_key, row.locale), row]));
  const groupRowMap = new Map(groupRows.map((row) => [rowKey(row.group_key, row.locale), row]));
  const reviewMap = reviewResolutionMap(snapshot);
  const publishedRows = rows.filter(isPublished);
  const pagePlans = [];
  const errors = [];

  for (const row of publishedRows) {
    const member = catalogMap.get(row.catalog_key);
    const group = groupByCatalog.get(row.catalog_key);
    if (!member || !group) {
      errors.push(`${row.catalog_key}/${row.locale}: unknown catalog record`);
      continue;
    }
    const groupRow = groupRowMap.get(rowKey(group.group_key, row.locale));
    const { effective } = resolveEffectiveSeo({ member, group, groupRow, variantRow: row, locale: row.locale });
    const recordErrors = validatePublishedRecord({ row, groupRow, member: group.members.find((x) => x.catalog_key === row.catalog_key), group, effectiveSeo: effective, rowMap, reviewMap });
    if (recordErrors.length) {
      errors.push(`${row.catalog_key}/${row.locale}: ${recordErrors.join('; ')}`);
      continue;
    }
    const routeMeta = buildSpeciesSeoRouteMeta({ member, group, locale: row.locale, indexStrategy: row.index_strategy, canonicalCatalogKey: row.canonical_catalog_key });
    if (!routeMeta.publishReady) {
      errors.push(`${row.catalog_key}/${row.locale}: ${routeMeta.warning || 'route is not publish-ready'}`);
      continue;
    }
    pagePlans.push({ row, member: { ...member, image_alt: row.image_alt || '' }, group, effectiveSeo: effective, routeMeta });
  }

  const plannedByKey = new Map(pagePlans.map((page) => [rowKey(page.row.catalog_key, page.row.locale), page]));
  for (const page of pagePlans) {
    if (page.row.index_strategy === 'index') {
      const counterpartLocale = page.row.locale === 'en' ? 'zh-CN' : 'en';
      if (!plannedByKey.has(rowKey(page.row.catalog_key, counterpartLocale))) {
        errors.push(`${page.row.catalog_key}/${page.row.locale}: independently indexed pages require a Published ${counterpartLocale} counterpart`);
      }
    }
  }
  if (errors.length) throw new Error(`Public Species generation blocked:\n- ${errors.join('\n- ')}`);

  for (const page of pagePlans) {
    const alternateMemberKey = page.row.index_strategy === 'canonical_to_sibling' ? page.row.canonical_catalog_key : page.row.catalog_key;
    const availableAlternates = {};
    for (const [lang, pathname] of Object.entries(page.routeMeta.alternates)) {
      const locale = lang === 'zh-CN' ? 'zh-CN' : 'en';
      if (plannedByKey.has(rowKey(alternateMemberKey, locale))) availableAlternates[lang] = pathname;
    }
    page.availableAlternates = availableAlternates;
  }

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  for (const page of pagePlans) {
    const target = path.join(outDir, page.routeMeta.selfPath.replace(/^\//, ''));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, renderPage({ siteUrl: validatedSiteUrl, ...page, locale: page.row.locale }), 'utf8');
  }
  const sitemap = renderSitemap(validatedSiteUrl, pagePlans);
  await writeFile(path.join(outDir, 'sitemap-species.xml'), sitemap, 'utf8');
  const manifest = {
    environment: snapshot.environment,
    generated_at: new Date().toISOString(),
    source_label: snapshot.source_label || 'unspecified',
    published_input_rows: publishedRows.length,
    generated_pages: pagePlans.length,
    indexable_pages: pagePlans.filter((page) => page.routeMeta.robots === 'index,follow' && page.routeMeta.selfPath === page.routeMeta.canonicalPath).length,
    noindex_pages: pagePlans.filter((page) => page.routeMeta.robots.startsWith('noindex')).length,
    canonical_pages: pagePlans.filter((page) => page.routeMeta.selfPath !== page.routeMeta.canonicalPath).length,
  };
  await writeFile(path.join(outDir, 'species-pages.manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return { manifest, pages: pagePlans };
}

async function cli() {
  const args = process.argv.slice(2);
  const value = (name) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : null;
  };
  const snapshotPath = value('--snapshot');
  const outDir = value('--out-dir');
  const siteUrl = value('--site-url');
  const productionSiteUrl = value('--production-site-url');
  if (!snapshotPath || !outDir || !siteUrl) throw new Error('Usage: node generate-public-species.mjs --snapshot <json> --out-dir <dir> --site-url <non-production-url> [--production-site-url <production-url>]');
  const snapshot = JSON.parse(await readFile(path.resolve(snapshotPath), 'utf8'));
  const result = await generatePublicSpecies({ snapshot, outDir: path.resolve(outDir), siteUrl, productionSiteUrl });
  console.log(JSON.stringify(result.manifest));
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  cli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
