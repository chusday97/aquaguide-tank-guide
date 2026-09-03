
function dispatchOperationEvent(detail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('aquaguide-admin-operation', { detail }));
}

function describeOperation(operation, result) {
  const explicit = operation.activity || {};
  const values = Array.isArray(operation.values) ? operation.values : [operation.values || {}];
  const first = result?.data && Array.isArray(result.data) ? result.data[0] : result?.data;
  if (explicit.title || explicit.detail) return { title: explicit.title || '后台操作已完成', detail: explicit.detail || '', kind: explicit.kind || 'admin_action' };
  if (operation.table === 'species_data_reviews') {
    const decision = values[0]?.decision;
    return {
      title: decision === 'duplicate_records' ? '重复记录已处理' : decision === 'distinct_records' ? '已确认不是重复' : '数据复核已保存',
      detail: first?.group_key || values[0]?.group_key || '',
      kind: 'data_review',
    };
  }
  if (operation.table === 'species_seo' || operation.table === 'species_seo_groups') {
    const label = operation.table === 'species_seo_groups' ? '基础模板' : 'SEO 页面';
    const state = operation.action === 'update' ? values[0]?.review_state : null;
    return {
      title: state === 'approved' ? `${label}已批准预览` : state === 'ready_for_review' ? `${label}已提交审核` : state === 'editing' ? `${label}已退回编辑` : `${label}已保存`,
      detail: first?.catalog_key || first?.group_key || values[0]?.catalog_key || values[0]?.group_key || '',
      kind: state ? 'review_state' : 'content_saved',
    };
  }
  return { title: '后台操作已完成', detail: operation.table || '', kind: 'admin_action' };
}

async function apiRequest(path, options = {}) {
  try {
    const response = await fetch(path, {
      credentials: 'include',
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    const payload = await response.json().catch(() => ({ data: null, error: { message: `HTTP ${response.status}` } }));
    if (!response.ok && !payload?.error) return { data: null, error: { message: `HTTP ${response.status}` } };
    return payload;
  } catch (error) {
    return { data: null, error: { message: error.message || 'Repository Admin API is unavailable.' } };
  }
}

class RepoQueryBuilder {
  constructor(table) {
    this.operation = { action: 'select', table, filters: [] };
    this.executed = null;
  }

  select(columns = '*') { this.operation.columns = columns; return this; }
  upsert(values, options = {}) { this.operation.action = 'upsert'; this.operation.values = values; this.operation.options = options; return this; }
  insert(values) { this.operation.action = 'insert'; this.operation.values = values; return this; }
  update(values) { this.operation.action = 'update'; this.operation.values = values; return this; }
  delete() { this.operation.action = 'delete'; return this; }
  eq(column, value) { this.operation.filters.push({ type: 'eq', column, value }); return this; }
  is(column, value) { this.operation.filters.push({ type: 'is', column, value }); return this; }
  in(column, values) { this.operation.filters.push({ type: 'in', column, values }); return this; }
  order(column, options = {}) { this.operation.order = { column, ascending: options.ascending !== false }; return this; }
  limit(value) { this.operation.limit = Number(value); return this; }
  activity(meta = {}) { this.operation.activity = meta; return this; }
  single() { this.operation.singleMode = 'single'; return this; }
  maybeSingle() { this.operation.singleMode = 'maybeSingle'; return this; }

  execute() {
    if (!this.executed) {
      this.executed = apiRequest('/api/admin-content/query', {
        method: 'POST',
        body: JSON.stringify(this.operation),
      }).then((result) => {
        if (this.operation.action !== 'select') {
          const description = describeOperation(this.operation, result);
          dispatchOperationEvent({ ...description, status: result?.error ? 'error' : 'success', error: result?.error?.message || '', at: new Date().toISOString() });
        }
        return result;
      });
    }
    return this.executed;
  }

  then(resolve, reject) { return this.execute().then(resolve, reject); }
  catch(reject) { return this.execute().catch(reject); }
  finally(handler) { return this.execute().finally(handler); }
}

const listeners = new Set();
function emitAuth(event, session) {
  for (const callback of listeners) {
    try { callback(event, session); } catch { /* UI listeners must not break auth. */ }
  }
}

export const repoBackendClient = {
  auth: {
    async getSession() {
      const response = await apiRequest('/api/admin-content/session', { method: 'GET' });
      return { data: { session: response.session || null }, error: response.error || null };
    },
    async signInWithPassword({ email, password }) {
      const result = await apiRequest('/api/admin-content/session', {
        method: 'POST', body: JSON.stringify({ email, password }),
      });
      const session = result?.data?.session || null;
      if (session) emitAuth('SIGNED_IN', session);
      return result;
    },
    onAuthStateChange(callback) {
      listeners.add(callback);
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
    },
    async signOut() {
      const result = await apiRequest('/api/admin-content/session', { method: 'DELETE' });
      emitAuth('SIGNED_OUT', null);
      return result;
    },
  },
  from(table) { return new RepoQueryBuilder(table); },
  rpc(name, args = {}, activity = {}) {
    const operation = { action: 'rpc', rpc: name, args, activity };
    return apiRequest('/api/admin-content/query', {
      method: 'POST', body: JSON.stringify(operation),
    }).then((result) => {
      const fallback = name === 'restore_species_seo_revision'
        ? { kind: 'revision_restored', title: '历史版本已恢复', detail: '' }
        : name === 'resolve_species_duplicate_review'
          ? { kind: 'duplicate_review', title: args.p_decision === 'duplicate_records' ? '重复记录已处理' : '已确认不是重复', detail: args.p_group_key || '' }
          : name === 'resolve_species_duplicate_reviews_bulk'
            ? { kind: 'duplicate_review_bulk', title: `批量审核 ${args.p_reviews?.length || 0} 组重复记录`, detail: '' }
            : name === 'transition_editorial_reviews_bulk'
              ? { kind: 'editorial_review_bulk', title: `批量内容审核 ${args.p_items?.length || 0} 项`, detail: args.p_target_state || '' }
              : name === 'import_species_seo_bulk'
                ? { kind: 'bulk_import', title: `批量导入 ${args.p_species_rows?.length || 0} 条 SEO 内容`, detail: '缺失基础模板会在同一次写入中建立' }
                : { kind: 'admin_action', title: '后台操作已完成', detail: name };
      const description = activity?.title || activity?.detail ? { ...fallback, ...activity } : fallback;
      dispatchOperationEvent({ ...description, status: result?.error ? 'error' : 'success', error: result?.error?.message || '', at: new Date().toISOString() });
      return result;
    });
  },
};

export async function publishRepoStaging({ catalogKeys, groupKeys }) {
  const result = await apiRequest('/api/admin-content/publish-staging', {
    method: 'POST', body: JSON.stringify({ catalogKeys, groupKeys }),
  });
  dispatchOperationEvent({
    kind: 'staging_publish',
    title: result?.error ? 'Staging 发布失败' : 'Staging 发布已完成',
    detail: result?.error?.message || `${result?.data?.selected_catalog_keys?.length || 0} 个 Species`,
    status: result?.error ? 'error' : 'success',
    error: result?.error?.message || '',
    at: new Date().toISOString(),
  });
  return result;
}

export async function getRepoBackendHealth() {
  return apiRequest('/api/admin-content/health', { method: 'GET' });
}
