import { createClient } from '@supabase/supabase-js';
import { validateStagingAdminProvisionConfig, assertAuthIdentityMatches } from '../apps/admin-content/scripts/business-admin-staging-admin.mjs';

const args = new Set(process.argv.slice(2));
for (const arg of args) if (arg !== '--commit') throw new Error(`Unknown argument: ${arg}`);
const commit = args.has('--commit');
const config = validateStagingAdminProvisionConfig(process.env);
const client = createClient(config.supabaseUrl, process.env.STAGING_SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: authResult, error: authError } = await client.auth.admin.getUserById(config.userId);
if (authError || !authResult?.user) throw new Error(`Unable to verify Staging Auth user: ${authError?.message || 'not found'}`);
assertAuthIdentityMatches(authResult.user, config);

const { data: roleRow, error: roleError } = await client.from('user_roles')
  .select('id,user_id,role,deleted_at,version').eq('user_id', config.userId).maybeSingle();
if (roleError) throw new Error(`Unable to read Staging user_roles: ${roleError.message}`);
if (!roleRow) throw new Error('Staging Auth user has no user_roles row. Refusing to bypass the auth_user_created trigger contract.');
if (roleRow.deleted_at) throw new Error('Staging user role is deleted. Refusing automatic reactivation.');
if (!['user', 'admin'].includes(roleRow.role)) throw new Error(`Unsupported Staging user role: ${roleRow.role}`);

console.log(JSON.stringify({ mode: commit ? 'commit' : 'dry-run', target_project_ref: config.actualProjectRef, user_id: config.userId, current_role: roleRow.role, target_role: 'admin' }, null, 2));
if (!commit || roleRow.role === 'admin') process.exit(0);

const { data: updated, error: updateError } = await client.from('user_roles')
  .update({ role: 'admin' }).eq('user_id', config.userId).eq('version', roleRow.version)
  .select('user_id,role,version,deleted_at').single();
if (updateError) throw new Error(`Unable to promote Staging Admin role: ${updateError.message}`);
if (updated.role !== 'admin' || updated.deleted_at) throw new Error('Staging Admin role verification failed after update.');
console.log(JSON.stringify({ status: 'promoted', user_id: updated.user_id, role: updated.role, version: updated.version }, null, 2));
