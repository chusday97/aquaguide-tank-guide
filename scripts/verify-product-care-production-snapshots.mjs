import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve('.');
const PRODUCTION_PROJECT_REF = 'ydiygvhuqpogmqlcvgob';
const EXPECTED = { species: 486, care: 41, total: 527, careSteps: 128 };
const BASE_URL = process.env.AQUAGUIDE_URL || 'https://aqua-tank-guide.vercel.app';

const run = (cmd, args) => {
  const result = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
  return result.stdout.trim();
};

const query = sql => {
  const rows = JSON.parse(run('supabase', ['db','query','--linked','--output-format','json',sql]));
  if (!Array.isArray(rows) || rows.length !== 1) throw new Error('Unexpected Supabase verification response');
  return rows[0];
};

const fetchJson = async path => {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const url = new URL(path, BASE_URL);
      url.searchParams.set('_verify', `${Date.now()}-${attempt}`);
      const response = await fetch(url, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error(`${path} failed: HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 500));
    }
  }
  throw lastError;
};

const projectRef = readFileSync(join(root,'supabase','.temp','project-ref'),'utf8').trim();
if (projectRef !== PRODUCTION_PROJECT_REF) throw new Error(`Linked Supabase ref mismatch: ${projectRef}`);

const db = query(`
select
  (select count(*)::int from public.content_publications) as total,
  (select count(*)::int from public.content_publications where resource_type='species') as species,
  (select count(*)::int from public.content_publications where resource_type='care') as care,
  (select count(*)::int from public.content_publications cp join public.species s on cp.resource_type='species' and s.id=cp.resource_id where cp.catalog_key=s.catalog_key and cp.source_version=s.version) as species_version_matches,
  (select count(*)::int from public.content_publications cp join public.care_articles c on cp.resource_type='care' and c.id=cp.resource_id where cp.catalog_key=c.catalog_key and cp.source_version=c.version) as care_version_matches,
  (select count(*)::int from public.species where deleted_at is null) as species_total,
  (select count(*)::int from public.care_articles where deleted_at is null) as care_total,
  (select count(*)::int from public.care_article_steps where deleted_at is null) as care_steps,
  (select count(*)::int from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) as profiles,
  (select count(*)::int from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) as pair_rules,
  (select count(*)::int from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) as stage_risks;
`);

const expectedDb = {
  total: EXPECTED.total, species: EXPECTED.species, care: EXPECTED.care,
  species_version_matches: EXPECTED.species, care_version_matches: EXPECTED.care,
  species_total: EXPECTED.species, care_total: EXPECTED.care, care_steps: EXPECTED.careSteps,
};
for (const [key,value] of Object.entries(expectedDb)) {
  if (db[key] !== value) throw new Error(`DB verification failed: ${key}=${db[key]} expected=${value}`);
}

const [zh, en, health, businessHealth, speciesDetail, careDetail] = await Promise.all([
  fetchJson('/api/v1/content-bootstrap?locale=zh-CN'),
  fetchJson('/api/v1/content-bootstrap?locale=en'),
  fetchJson('/api/v1/health'),
  fetchJson('/api/v1/business-health'),
  fetchJson('/api/v1/species/sp_0001?locale=zh-CN'),
  fetchJson('/api/v1/care-articles/qa_gen_001?locale=zh-CN'),
]);

for (const [locale,body] of [['zh-CN',zh],['en',en]]) {
  const data = body.data;
  if (data?.authority !== 'publication-snapshot') throw new Error(`${locale} authority=${data?.authority}`);
  if (data?.publicationCounts?.species !== EXPECTED.species || data?.publicationCounts?.care !== EXPECTED.care) {
    throw new Error(`${locale} publicationCounts=${JSON.stringify(data?.publicationCounts)}`);
  }
  if (data?.species?.length !== EXPECTED.species || data?.careArticles?.length !== EXPECTED.care) {
    throw new Error(`${locale} runtime coverage mismatch`);
  }
}

if (health.ok !== true || health.configured !== true) throw new Error('Health endpoint not ready');
if (businessHealth.data?.ok !== true || businessHealth.data?.databaseConfigured !== true) throw new Error('Business health not ready');
if (speciesDetail.data?.catalogKey !== 'sp_0001') throw new Error('Published species detail probe failed');
if (careDetail.data?.catalogKey !== 'qa_gen_001') throw new Error('Published care detail probe failed');

console.log(JSON.stringify({
  phase: 'READY_PRODUCT_CARE_PRODUCTION',
  projectRef,
  db,
  runtime: {
    authority: zh.data.authority,
    publicationCounts: zh.data.publicationCounts,
    zhCoverage: { species: zh.data.species.length, care: zh.data.careArticles.length },
    enCoverage: { species: en.data.species.length, care: en.data.careArticles.length },
    health: { ok: health.ok, configured: health.configured },
    businessHealth: businessHealth.data,
    probes: { species: speciesDetail.data.catalogKey, care: careDetail.data.catalogKey },
  },
  blockers: [],
  mutationAuthorized: false,
}, null, 2));
