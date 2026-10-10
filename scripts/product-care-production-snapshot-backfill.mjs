import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve('.');
const PRODUCTION_PROJECT_REF = 'ydiygvhuqpogmqlcvgob';
const EXPECTED = { species: 486, care: 41, total: 527 };
const CONFIRM_TOKEN = 'EXECUTE_PRODUCT_CARE_PUBLICATION_BACKFILL_527';
const DEFAULT_BASE_URL = 'https://aqua-tank-guide.vercel.app';

const run = (cmd, args, options = {}) => {
  const result = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...options });
  if (result.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
  return result.stdout.trim();
};

const sqlQuery = sql => JSON.parse(run('supabase', ['db', 'query', '--linked', '--output-format', 'json', sql]));

const linkedRef = () => readFileSync(join(root, 'supabase', '.temp', 'project-ref'), 'utf8').trim();

const fetchBootstrap = async (baseUrl, locale) => {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const url = new URL('/api/v1/content-bootstrap', baseUrl);
      url.searchParams.set('locale', locale);
      url.searchParams.set('_backfill_probe', `${Date.now()}-${attempt}`);
      const response = await fetch(url, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error(`bootstrap ${locale} failed: HTTP ${response.status}`);
      const body = await response.json();
      if (!body?.data) throw new Error(`bootstrap ${locale} response missing data envelope`);
      return body.data;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 500));
    }
  }
  throw lastError;
};

const canonicalize = value => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map(key => [key, canonicalize(value[key])]),
    );
  }
  return value;
};

const stableHash = value => createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');

const pgLiteral = value => `'${String(value).replaceAll("'", "''")}'`;
const jsonbLiteral = value => `${pgLiteral(JSON.stringify(value))}::jsonb`;

const sourceRows = () => {
  const rows = sqlQuery(`
    select 'species'::text as resource_type,id,catalog_key,version,published_at
    from public.species
    where deleted_at is null and status='published'
    union all
    select 'care'::text as resource_type,id,catalog_key,version,published_at
    from public.care_articles
    where deleted_at is null and status='published'
    order by resource_type,catalog_key;
  `);
  if (!Array.isArray(rows)) throw new Error('Unexpected source-row response');
  return rows;
};

const publicationCounts = () => {
  const rows = sqlQuery(`
    select
      count(*)::int as total,
      count(*) filter (where resource_type='species')::int as species,
      count(*) filter (where resource_type='care')::int as care
    from public.content_publications;
  `);
  if (!Array.isArray(rows) || rows.length !== 1) throw new Error('Unexpected publication-count response');
  return rows[0];
};

const indexByCatalogKey = (items, label) => {
  const map = new Map();
  for (const item of items || []) {
    if (!item?.catalogKey) throw new Error(`${label} contains item without catalogKey`);
    if (map.has(item.catalogKey)) throw new Error(`${label} duplicate catalogKey: ${item.catalogKey}`);
    map.set(item.catalogKey, item);
  }
  return map;
};

const assertExpectedCoverage = (sources, zh, en) => {
  const speciesSources = sources.filter(row => row.resource_type === 'species');
  const careSources = sources.filter(row => row.resource_type === 'care');
  if (speciesSources.length !== EXPECTED.species || careSources.length !== EXPECTED.care || sources.length !== EXPECTED.total) {
    throw new Error(`Source coverage mismatch: species=${speciesSources.length}, care=${careSources.length}, total=${sources.length}`);
  }
  if ((zh.species || []).length !== EXPECTED.species || (zh.careArticles || []).length !== EXPECTED.care) {
    throw new Error(`zh-CN bootstrap coverage mismatch: species=${zh.species?.length}, care=${zh.careArticles?.length}`);
  }
  if ((en.species || []).length !== EXPECTED.species || (en.careArticles || []).length !== EXPECTED.care) {
    throw new Error(`en bootstrap coverage mismatch: species=${en.species?.length}, care=${en.careArticles?.length}`);
  }
};

const buildRows = (sources, zh, en) => {
  const zhSpecies = indexByCatalogKey(zh.species, 'zh species');
  const enSpecies = indexByCatalogKey(en.species, 'en species');
  const zhCare = indexByCatalogKey(zh.careArticles, 'zh care');
  const enCare = indexByCatalogKey(en.careArticles, 'en care');

  return sources.map(source => {
    const zhItem = source.resource_type === 'species' ? zhSpecies.get(source.catalog_key) : zhCare.get(source.catalog_key);
    const enItem = source.resource_type === 'species' ? enSpecies.get(source.catalog_key) : enCare.get(source.catalog_key);
    if (!zhItem || !enItem) throw new Error(`Missing DTO for ${source.resource_type}:${source.catalog_key}`);
    if (String(zhItem.id) !== String(source.id) || String(enItem.id) !== String(source.id)) {
      throw new Error(`ID mismatch for ${source.resource_type}:${source.catalog_key}`);
    }
    return {
      resourceType: source.resource_type,
      resourceId: source.id,
      catalogKey: source.catalog_key,
      sourceVersion: Number(source.version),
      publishedAt: source.published_at,
      snapshot: { 'zh-CN': zhItem, en: enItem },
    };
  });
};

const buildSql = (rows, finalize) => {
  const values = rows.map(row => `(
    ${pgLiteral(row.resourceType)},
    ${pgLiteral(row.resourceId)}::uuid,
    ${pgLiteral(row.catalogKey)},
    ${jsonbLiteral(row.snapshot)},
    ${row.sourceVersion},
    ${row.publishedAt ? `${pgLiteral(row.publishedAt)}::timestamptz` : 'now()'}
  )`).join(',\n');

  return `begin;

do $guard$
begin
  if (select count(*) from public.content_publications) <> 0 then
    raise exception 'ABORT: content_publications must be empty before baseline backfill';
  end if;
  if (select count(*) from public.species where deleted_at is null and status='published') <> ${EXPECTED.species} then
    raise exception 'ABORT: published species coverage drifted';
  end if;
  if (select count(*) from public.care_articles where deleted_at is null and status='published') <> ${EXPECTED.care} then
    raise exception 'ABORT: published care coverage drifted';
  end if;
end
$guard$;

insert into public.content_publications
(resource_type,resource_id,catalog_key,snapshot,source_version,published_at)
values
${values};

do $postcheck$
begin
  if (select count(*) from public.content_publications) <> ${EXPECTED.total} then
    raise exception 'POSTCHECK: total publication snapshot count mismatch';
  end if;
  if (select count(*) from public.content_publications where resource_type='species') <> ${EXPECTED.species} then
    raise exception 'POSTCHECK: species publication snapshot count mismatch';
  end if;
  if (select count(*) from public.content_publications where resource_type='care') <> ${EXPECTED.care} then
    raise exception 'POSTCHECK: care publication snapshot count mismatch';
  end if;
  if exists (
    select 1
    from public.content_publications cp
    left join public.species s on cp.resource_type='species' and s.id=cp.resource_id
    left join public.care_articles c on cp.resource_type='care' and c.id=cp.resource_id
    where (cp.resource_type='species' and (s.id is null or s.catalog_key<>cp.catalog_key or s.version<>cp.source_version))
       or (cp.resource_type='care' and (c.id is null or c.catalog_key<>cp.catalog_key or c.version<>cp.source_version))
  ) then
    raise exception 'POSTCHECK: publication snapshot source identity/version mismatch';
  end if;
end
$postcheck$;

${finalize};
`;
};

const main = async () => {
  const simulate = process.argv.includes('--simulate');
  const commit = process.argv.includes('--commit');
  if (simulate === commit) throw new Error('Choose exactly one of --simulate or --commit');

  const ref = linkedRef();
  if (ref !== PRODUCTION_PROJECT_REF) throw new Error(`Linked Supabase ref mismatch: ${ref}`);

  const beforeCounts = publicationCounts();
  if (beforeCounts.total !== 0 || beforeCounts.species !== 0 || beforeCounts.care !== 0) {
    throw new Error(`Baseline backfill requires 0/0 snapshots; current=${JSON.stringify(beforeCounts)}`);
  }

  const baseUrl = process.env.AQUAGUIDE_URL || DEFAULT_BASE_URL;
  const [zh, en] = await Promise.all([fetchBootstrap(baseUrl, 'zh-CN'), fetchBootstrap(baseUrl, 'en')]);
  if (zh.authority !== 'legacy-published' || en.authority !== 'legacy-published') {
    throw new Error(`Expected legacy-published baseline; zh=${zh.authority}, en=${en.authority}`);
  }
  const sources = sourceRows();
  assertExpectedCoverage(sources, zh, en);
  const rows = buildRows(sources, zh, en);

  const beforeHashes = {
    zh: stableHash({ species: zh.species, careArticles: zh.careArticles }),
    en: stableHash({ species: en.species, careArticles: en.careArticles }),
  };

  const sql = buildSql(rows, simulate ? 'rollback' : 'commit');
  const dir = mkdtempSync(join(tmpdir(), 'aqua-product-care-backfill-'));
  const file = join(dir, 'product-care-publication-backfill.sql');

  if (commit && process.env.AQUAGUIDE_PRODUCT_CARE_PRODUCTION_CONFIRM !== CONFIRM_TOKEN) {
    throw new Error(`Commit denied: set AQUAGUIDE_PRODUCT_CARE_PRODUCTION_CONFIRM=${CONFIRM_TOKEN}`);
  }

  try {
    writeFileSync(file, sql);
    run('supabase', ['db', 'query', '--linked', '--file', file]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  if (simulate) {
    const afterCounts = publicationCounts();
    if (afterCounts.total !== 0) throw new Error('Simulation rollback failed: publication rows persisted');
    console.log(JSON.stringify({
      mode: 'simulated-rollback',
      projectRef: ref,
      expected: EXPECTED,
      beforeCounts,
      afterCounts,
      payloadBytes: Buffer.byteLength(sql),
      beforeHashes,
      mutationAuthorized: false,
    }, null, 2));
    return;
  }

  const afterCounts = publicationCounts();
  if (afterCounts.total !== EXPECTED.total || afterCounts.species !== EXPECTED.species || afterCounts.care !== EXPECTED.care) {
    throw new Error(`Committed counts mismatch: ${JSON.stringify(afterCounts)}`);
  }

  const [afterZh, afterEn] = await Promise.all([fetchBootstrap(baseUrl, 'zh-CN'), fetchBootstrap(baseUrl, 'en')]);
  const afterHashes = {
    zh: stableHash({ species: afterZh.species, careArticles: afterZh.careArticles }),
    en: stableHash({ species: afterEn.species, careArticles: afterEn.careArticles }),
  };
  if (afterZh.authority !== 'publication-snapshot' || afterEn.authority !== 'publication-snapshot') {
    throw new Error(`Authority did not switch after backfill: zh=${afterZh.authority}, en=${afterEn.authority}`);
  }
  if (afterZh.publicationCounts?.species !== EXPECTED.species || afterZh.publicationCounts?.care !== EXPECTED.care) {
    throw new Error(`Runtime publication count mismatch: ${JSON.stringify(afterZh.publicationCounts)}`);
  }
  if (beforeHashes.zh !== afterHashes.zh || beforeHashes.en !== afterHashes.en) {
    throw new Error(`User-visible Product/Care DTO drift after snapshot cutover: before=${JSON.stringify(beforeHashes)} after=${JSON.stringify(afterHashes)}`);
  }

  console.log(JSON.stringify({
    mode: 'committed',
    projectRef: ref,
    expected: EXPECTED,
    beforeCounts,
    afterCounts,
    beforeHashes,
    afterHashes,
    authority: afterZh.authority,
    runtimePublicationCounts: afterZh.publicationCounts,
    mutationAuthorized: true,
  }, null, 2));
};

await main();
