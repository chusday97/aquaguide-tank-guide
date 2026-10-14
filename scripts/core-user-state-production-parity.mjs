import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import {
  CORE_USER_STATE_RPC_REQUIREMENTS,
  CORE_USER_STATE_TABLE_REQUIREMENTS,
  evaluateCoreUserStateParity,
} from './core-user-state-production-parity-lib.mjs';
import { PRODUCTION_PROJECT_REF } from './compatibility-production-migration-guard.mjs';

const run = (cmd, args) => {
  const result = spawnSync(cmd, args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
  return result.stdout.trim();
};

const linkedRef = readFileSync(new URL('../supabase/.temp/project-ref', import.meta.url), 'utf8').trim();
if (linkedRef !== PRODUCTION_PROJECT_REF) {
  throw new Error(`Linked Supabase ref mismatch: ${linkedRef}`);
}

const q = value => `'${String(value).replaceAll("'", "''")}'`;
const tableNames = CORE_USER_STATE_TABLE_REQUIREMENTS.map(([name]) => q(name)).join(',');
const rpcNames = CORE_USER_STATE_RPC_REQUIREMENTS.map(item => q(item.name)).join(',');

const tableSql = `select
  c.relname as name,
  c.relrowsecurity as rls_enabled,
  coalesce((
    select json_agg(p.policyname order by p.policyname)
    from pg_policies p
    where p.schemaname='public' and p.tablename=c.relname
  ), '[]'::json) as policies
from pg_class c
where c.relnamespace='public'::regnamespace
  and c.relname in (${tableNames})
order by c.relname;`;

const rpcSql = `select
  p.proname as name,
  pg_get_function_identity_arguments(p.oid) as args,
  p.prosecdef as security_definer,
  has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute,
  has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
  and p.proname in (${rpcNames})
order by p.proname,args;`;

const query = sql => JSON.parse(run('supabase', ['db', 'query', '--linked', '--output-format', 'json', sql]));
const tables = query(tableSql);
const rpcs = query(rpcSql);
const result = evaluateCoreUserStateParity({ tables, rpcs });

console.log(JSON.stringify({
  projectRef: linkedRef,
  source: 'production_schema_metadata',
  readsUserRows: false,
  ...result,
}, null, 2));

if (!result.verified) process.exitCode = 2;
