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
  single() { this.operation.singleMode = 'single'; return this; }
  maybeSingle() { this.operation.singleMode = 'maybeSingle'; return this; }

  execute() {
    if (!this.executed) {
      this.executed = apiRequest('/api/admin-content/query', {
        method: 'POST',
        body: JSON.stringify(this.operation),
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
  rpc(name, args = {}) {
    return apiRequest('/api/admin-content/query', {
      method: 'POST', body: JSON.stringify({ action: 'rpc', rpc: name, args }),
    });
  },
};

export async function publishRepoStaging({ catalogKeys, groupKeys }) {
  return apiRequest('/api/admin-content/publish-staging', {
    method: 'POST', body: JSON.stringify({ catalogKeys, groupKeys }),
  });
}

export async function getRepoBackendHealth() {
  return apiRequest('/api/admin-content/health', { method: 'GET' });
}
