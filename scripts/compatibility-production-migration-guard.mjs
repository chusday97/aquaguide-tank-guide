import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence.ts';

export const PRODUCTION_PROJECT_REF='ydiygvhuqpogmqlcvgob';
export const START_MIGRATION_COUNT=26;
export const START_LATEST_VERSION='20260816160129';
export const CONFIRM_TOKEN='EXECUTE_22_COMPATIBILITY_MIGRATIONS';
export const EXPECTED_CHAIN_FINGERPRINT='6c8a22eadda625599a275cc8184ad3c07fdadafcb222331eaac840aa5f32f26c';
export const HELD_MIGRATION='202610090001_compatibility_gold_ram_rhodeus_profile_owner.sql';
export const MIGRATIONS=[
'202609040002_compatibility_profile_revisions.sql','202609040003_compatibility_pair_rule_revisions.sql','202609040004_compatibility_revision_review_gate.sql','202609050001_compatibility_reviewed_baseline_reconciliation.sql','202609050002_compatibility_versioned_publish.sql','202609110001_compatibility_v3_profile_authority.sql','202609120001_compatibility_recovery_baseline.sql','202609120002_compatibility_harlequin_baseline.sql','202609120003_compatibility_black_skirt_baseline.sql','202609120004_compatibility_cherry_barb_baseline.sql','202609120005_compatibility_ember_tetra_baseline.sql','202609120006_compatibility_denison_barb_baseline.sql','202609120007_compatibility_congo_tetra_baseline.sql','202609120008_compatibility_pearl_gourami_baseline.sql','202609120009_compatibility_agassizii_baseline.sql','202609120010_compatibility_ramirezi_baseline.sql','202609120011_compatibility_discus_baseline.sql','202609120012_compatibility_pygmy_cory_baseline.sql','202609120013_compatibility_sewellia_baseline.sql','202609120014_compatibility_clown_loach_baseline.sql','202609120015_compatibility_red_rainbowfish_baseline.sql','202609160001_compatibility_rummy_oto_oscar_baseline.sql'];

const root=resolve(import.meta.dirname,'..');
const migrationsDir=join(root,'supabase','migrations');
const heldDir=join(root,'supabase','held-migrations');
const q=v=>`'${String(v).replaceAll("'","''")}'`;
const sqlTextArray=vs=>`ARRAY[${vs.map(q).join(',')}]::text[]`;
const sha256=v=>createHash('sha256').update(v).digest('hex');

export const getAuthorityKeys=()=>{
 const a=getCompatibilityEvidenceAudit();
 return {
  profiles:a.reviewedProfiles.map(x=>x.speciesId).sort(),
  pairRules:a.reviewedPairRules.map(x=>[...x.speciesIds].sort().join('__')).sort(),
  stageRisks:a.reviewedStageRiskProfiles.map(x=>`${x.speciesId}:${x.riskType}`).sort(),
 };
};
export const calculateChainFingerprint=()=>sha256(MIGRATIONS.map(name=>{
 const content=readFileSync(join(migrationsDir,name));
 return `${name}\0${sha256(content)}`;
}).join('\n'));
export const validateLocalChain=()=>{
 const active=readdirSync(migrationsDir).filter(n=>/^202609(?:040002|040003|040004|050001|050002|110001|1200(?:0[1-9]|1[0-5])|160001)_compatibility.*\.sql$/.test(n)).sort();
 if(JSON.stringify(active)!==JSON.stringify(MIGRATIONS)) throw new Error(`Compatibility migration whitelist drifted. expected=${MIGRATIONS.length} actual=${active.length}`);
 if(active.includes(HELD_MIGRATION)) throw new Error('Held migration entered active whitelist.');
 if(!readdirSync(heldDir).includes(HELD_MIGRATION)) throw new Error('Held Compatibility migration is missing from held-migrations.');
 const fingerprint=calculateChainFingerprint();
 if(fingerprint!==EXPECTED_CHAIN_FINGERPRINT) throw new Error(`Compatibility migration fingerprint drifted: ${fingerprint}`);
 const authority=getAuthorityKeys();
 if(authority.profiles.length!==34||authority.pairRules.length!==21||authority.stageRisks.length!==1) throw new Error(`Static authority drifted: ${authority.profiles.length}/${authority.pairRules.length}/${authority.stageRisks.length}`);
 return {fingerprint,authority};
};
const stripEmbeddedTransaction=(name,sql)=>{
 if(name!=='202609110001_compatibility_v3_profile_authority.sql') return sql.trim();
 const lines=sql.split(/\r?\n/);
 const beginIndexes=lines.map((line,index)=>line.trim().toLowerCase()==='begin;'?index:-1).filter(index=>index>=0);
 const commitIndexes=lines.map((line,index)=>line.trim().toLowerCase()==='commit;'?index:-1).filter(index=>index>=0);
 if(beginIndexes.length!==1||commitIndexes.length!==1) throw new Error(`Expected exactly one embedded BEGIN/COMMIT in ${name}; got ${beginIndexes.length}/${commitIndexes.length}`);
 const removed=new Set([...beginIndexes,...commitIndexes]);
 const stripped=lines.filter((_,index)=>!removed.has(index)).join('\n').trim();
 if(/^\s*(begin|commit);/im.test(stripped)) throw new Error(`Unexpected nested transaction remains in ${name}`);
 return stripped;
};
const migrationVersion=name=>name.split('_',1)[0];
const migrationName=name=>name.replace(/^\d+_/,'').replace(/\.sql$/,'');

export const buildBundleSql=()=>{
 const {authority}=validateLocalChain();
 const lines=['begin;'];
 lines.push(`do $$ begin
 if (select count(*) from supabase_migrations.schema_migrations) <> ${START_MIGRATION_COUNT} then raise exception 'ABORT: migration count drift'; end if;
 if (select max(version) from supabase_migrations.schema_migrations) <> ${q(START_LATEST_VERSION)} then raise exception 'ABORT: latest migration drift'; end if;
 if (select count(*) from public.species where deleted_at is null) <> 486 then raise exception 'ABORT: species baseline drift'; end if;
 if (select count(*) from public.species_feeding_profiles where deleted_at is null) <> 486 then raise exception 'ABORT: feeding baseline drift'; end if;
 if (select count(*) from public.care_articles where deleted_at is null) <> 41 then raise exception 'ABORT: care baseline drift'; end if;
 if (select count(*) from public.care_article_steps where deleted_at is null) <> 128 then raise exception 'ABORT: care-step baseline drift'; end if;
 if (select count(*) from public.species_compatibility_profiles) <> 0 then raise exception 'ABORT: compatibility profiles not empty'; end if;
 if (select count(*) from public.species_pair_compatibility_rules) <> 0 then raise exception 'ABORT: compatibility pair rules not empty'; end if;
 if (select count(*) from public.evidence_sources) <> 0 then raise exception 'ABORT: compatibility evidence not empty'; end if;
 if to_regclass('public.compatibility_authority_state') is not null then raise exception 'ABORT: authority state already exists'; end if;
 if to_regclass('public.species_compatibility_profile_stage_risks') is not null then raise exception 'ABORT: stage risk table already exists'; end if;
end $$;`);
 for(const name of MIGRATIONS){
  const sql=stripEmbeddedTransaction(name,readFileSync(join(migrationsDir,name),'utf8'));
  lines.push(`-- BEGIN GUARDED MIGRATION ${name}\n${sql}\n-- END GUARDED MIGRATION ${name}`);
  lines.push(`insert into supabase_migrations.schema_migrations(version,statements,name,created_by) values (${q(migrationVersion(name))},ARRAY[${q(`guarded:${name}`)}]::text[],${q(migrationName(name))},'aqua-compatibility-production-guard');`);
 }
 lines.push(`do $$ declare
 actual_profiles text[]; actual_pairs text[]; actual_stage_risks text[];
begin
 if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='species_compatibility_profiles' and column_name='required_facts') then raise exception 'POSTCHECK: required_facts missing'; end if;
 if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='species_compatibility_profiles' and column_name='stocking_guidance') then raise exception 'POSTCHECK: stocking_guidance missing'; end if;
 if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='species_pair_compatibility_rules' and column_name='basis') then raise exception 'POSTCHECK: pair basis missing'; end if;
 if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='evidence_sources' and column_name='source_key') then raise exception 'POSTCHECK: source_key missing'; end if;
 if to_regclass('public.compatibility_authority_state') is null then raise exception 'POSTCHECK: authority state missing'; end if;
 if to_regclass('public.species_compatibility_profile_stage_risks') is null then raise exception 'POSTCHECK: stage risk table missing'; end if;
 select coalesce(array_agg(s.catalog_key order by s.catalog_key),'{}'::text[]) into actual_profiles from public.species_compatibility_profiles p join public.species s on s.id=p.species_id where p.review_status='reviewed' and p.deleted_at is null;
 if actual_profiles <> ${sqlTextArray(authority.profiles)} then raise exception 'POSTCHECK: reviewed profile key set mismatch'; end if;
 select coalesce(array_agg(pair_key order by pair_key),'{}'::text[]) into actual_pairs from (select least(sa.catalog_key,sb.catalog_key)||'__'||greatest(sa.catalog_key,sb.catalog_key) pair_key from public.species_pair_compatibility_rules r join public.species sa on sa.id=r.species_a_id join public.species sb on sb.id=r.species_b_id where r.review_status='reviewed' and r.deleted_at is null) x;
 if actual_pairs <> ${sqlTextArray(authority.pairRules)} then raise exception 'POSTCHECK: reviewed pair key set mismatch'; end if;
 select coalesce(array_agg(s.catalog_key||':'||r.risk_type order by s.catalog_key,r.risk_type),'{}'::text[]) into actual_stage_risks from public.species_compatibility_profile_stage_risks r join public.species s on s.id=r.species_id where r.review_status='reviewed' and r.deleted_at is null;
 if actual_stage_risks <> ${sqlTextArray(authority.stageRisks)} then raise exception 'POSTCHECK: reviewed stage-risk key set mismatch'; end if;
 if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <= 0 then raise exception 'POSTCHECK: reviewed evidence missing'; end if;
 if not exists (select 1 from public.compatibility_authority_state where singleton=true) then raise exception 'POSTCHECK: authority singleton missing'; end if;
 if (select count(*) from supabase_migrations.schema_migrations) <> ${START_MIGRATION_COUNT+MIGRATIONS.length} then raise exception 'POSTCHECK: migration history count mismatch'; end if;
 if (select max(version) from supabase_migrations.schema_migrations) <> ${q(migrationVersion(MIGRATIONS.at(-1)))} then raise exception 'POSTCHECK: latest migration mismatch'; end if;
 if (select count(*) from public.species where deleted_at is null) <> 486 then raise exception 'POSTCHECK: species changed'; end if;
 if (select count(*) from public.species_feeding_profiles where deleted_at is null) <> 486 then raise exception 'POSTCHECK: feeding changed'; end if;
 if (select count(*) from public.care_articles where deleted_at is null) <> 41 then raise exception 'POSTCHECK: care changed'; end if;
 if (select count(*) from public.care_article_steps where deleted_at is null) <> 128 then raise exception 'POSTCHECK: care steps changed'; end if;
 if (select count(*) from public.species_assets) <> 0 then raise exception 'POSTCHECK: species assets changed'; end if;
 if (select count(*) from public.care_article_assets) <> 0 then raise exception 'POSTCHECK: care assets changed'; end if;
end $$;`);
 lines.push('commit;');
 return `${lines.join('\n\n')}\n`;
};

const run=(cmd,args,options={})=>{
 const r=spawnSync(cmd,args,{cwd:root,encoding:'utf8',...options});
 if(r.status!==0) throw new Error(`${cmd} ${args.join(' ')} failed: ${r.stderr||r.stdout}`);
 return r.stdout.trim();
};
export const readLinkedProjectRef=()=>readFileSync(join(root,'supabase','.temp','project-ref'),'utf8').trim();
export const validateProductionCodeCompatibility=()=>{
 const critical=['apps/api/src/routes/content.ts','src/data/compatibilityEvidence.ts','src/services/compatibility/compatibility.service.ts'];
 const changed=run('git',['diff','--name-only','origin/release/production..origin/main','--',...critical]).split(/\r?\n/).filter(Boolean);
 if(changed.length) throw new Error(`Production Compatibility runtime drifted in critical files: ${changed.join(', ')}`);
 const releaseLoader=run('git',['show','origin/release/production:apps/api/src/compatibility-authority.ts']);
 const mainLoader=run('git',['show','origin/main:apps/api/src/compatibility-authority.ts']);
 const normalize=value=>value.replace(/if \(!exactCoverage\) throw new ApiError\(409, 'MIGRATION_REJECTED', [^\n]+\);/,"if (!exactCoverage) throw new ApiError(409, 'MIGRATION_REJECTED', '<normalized-message>');");
 if(normalize(releaseLoader)!==normalize(mainLoader)) throw new Error('Production Compatibility authority loader differs from main beyond the approved error-message-only delta.');
 return {releaseBranch:'origin/release/production',runtimeCompatible:true,allowedDelta:'MIGRATION_REJECTED message only'};
};
export const assertGitStateForCommit=()=>{
 const branch=run('git',['branch','--show-current']);
 const head=run('git',['rev-parse','HEAD']);
 const originMain=run('git',['rev-parse','origin/main']);
 const dirty=run('git',['status','--porcelain']);
 if(branch!=='main') throw new Error(`Commit requires main branch; current=${branch}`);
 if(head!==originMain) throw new Error(`Commit requires HEAD == origin/main; ${head} != ${originMain}`);
 if(dirty) throw new Error('Commit requires a clean worktree.');
};
export const queryLivePreflight=()=>{
 const sql=`select (select count(*) from supabase_migrations.schema_migrations)::int migration_count,(select max(version) from supabase_migrations.schema_migrations) latest_version,(select count(*) from public.species where deleted_at is null)::int species,(select count(*) from public.species_feeding_profiles where deleted_at is null)::int feeding,(select count(*) from public.care_articles where deleted_at is null)::int care,(select count(*) from public.care_article_steps where deleted_at is null)::int care_steps,(select count(*) from public.species_compatibility_profiles)::int profiles,(select count(*) from public.species_pair_compatibility_rules)::int pair_rules,(select count(*) from public.evidence_sources)::int evidence,(to_regclass('public.compatibility_authority_state') is not null) authority_state_exists,(to_regclass('public.species_compatibility_profile_stage_risks') is not null) stage_risks_exists;`;
 const rows=JSON.parse(run('supabase',['db','query','--linked','--output-format','json',sql]));
 if(!Array.isArray(rows)||rows.length!==1) throw new Error('Unexpected Supabase preflight response.');
 return rows[0];
};
export const validateLivePreflight=live=>{
 const expected={migration_count:26,latest_version:START_LATEST_VERSION,species:486,feeding:486,care:41,care_steps:128,profiles:0,pair_rules:0,evidence:0,authority_state_exists:false,stage_risks_exists:false};
 const drift=Object.entries(expected).filter(([k,v])=>live[k]!==v);
 if(drift.length) throw new Error(`Production preflight drift: ${drift.map(([k,v])=>`${k}=${live[k]} expected=${v}`).join(', ')}`);
 return expected;
};

const isMain=import.meta.url===`file://${process.argv[1]}`;
if(isMain){
 const commit=process.argv.includes('--commit');
 const writeArg=process.argv.find(x=>x.startsWith('--write-sql='));
 const {fingerprint,authority}=validateLocalChain();
 const productionCodeCompatibility=validateProductionCodeCompatibility();
 const linkedRef=readLinkedProjectRef();
 if(linkedRef!==PRODUCTION_PROJECT_REF) throw new Error(`Linked Supabase ref mismatch: ${linkedRef}`);
 const live=queryLivePreflight(); validateLivePreflight(live);
 const bundle=buildBundleSql();
 const plan={mode:commit?'commit-requested':'dry-run',projectRef:linkedRef,migrationCount:MIGRATIONS.length,fingerprint,expectedAuthority:{profiles:authority.profiles.length,pairRules:authority.pairRules.length,stageRisks:authority.stageRisks.length},startState:live,heldMigrationExcluded:HELD_MIGRATION,productionCodeCompatibility,atomicBundleBytes:Buffer.byteLength(bundle),mutationAuthorized:false};
 if(writeArg){const path=writeArg.slice('--write-sql='.length);writeFileSync(path,bundle);plan.bundlePath=path;}
 if(!commit){console.log(JSON.stringify(plan,null,2));process.exit(0);}
 if(process.env.AQUAGUIDE_COMPATIBILITY_PRODUCTION_CONFIRM!==CONFIRM_TOKEN) throw new Error(`Commit denied: set AQUAGUIDE_COMPATIBILITY_PRODUCTION_CONFIRM=${CONFIRM_TOKEN}`);
 assertGitStateForCommit();
 const dir=mkdtempSync(join(tmpdir(),'aqua-compat-migrations-')); const file=join(dir,'compatibility-production-bundle.sql');
 try{writeFileSync(file,bundle);run('supabase',['db','query','--linked','--file',file]);}finally{rmSync(dir,{recursive:true,force:true});}
 console.log(JSON.stringify({...plan,mode:'committed',mutationAuthorized:true},null,2));
}
