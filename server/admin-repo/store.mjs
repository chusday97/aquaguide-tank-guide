import crypto from 'node:crypto';
import { readDraftJsonWithFallback, updateDraftJson, writeStagingSnapshot } from './github.mjs';

export const EMPTY_ADMIN_STORE = {
  schema_version: 2,
  updated_at: null,
  species_seo: [],
  species_seo_groups: [],
  species_data_reviews: [],
  content_revisions: [],
  admin_activity_log: [],
};

const TABLES = new Set(['species_seo', 'species_seo_groups', 'species_data_reviews', 'content_revisions', 'admin_activity_log', 'user_roles']);
const RESOURCE_CONFIG = {
  species_seo: {
    keys: ['catalog_key', 'locale'],
    resourceType: 'species_seo',
    resourceKey: 'catalog_key',
    contentFields: ['localized_name', 'seo_title', 'meta_description', 'h1', 'intro', 'image_alt', 'canonical_path', 'focus_keyword', 'index_strategy', 'canonical_catalog_key'],
  },
  species_seo_groups: {
    keys: ['group_key', 'locale'],
    resourceType: 'species_seo_group',
    resourceKey: 'group_key',
    contentFields: ['seo_title_template', 'meta_description_template', 'h1_template', 'shared_intro'],
  },
  species_data_reviews: { keys: ['issue_key'] },
  admin_activity_log: { keys: ['id'] },
};

function now() { return new Date().toISOString(); }
function clone(value) { return value == null ? value : structuredClone(value); }
function normalizeStore(store) {
  const next = { ...EMPTY_ADMIN_STORE, ...(store || {}) };
  for (const key of ['species_seo', 'species_seo_groups', 'species_data_reviews', 'content_revisions', 'admin_activity_log']) {
    if (!Array.isArray(next[key])) next[key] = [];
  }
  next.schema_version = Math.max(2, Number(next.schema_version) || 0);
  return next;
}

function sameKey(row, payload, keys) {
  return keys.every((key) => String(row?.[key] ?? '') === String(payload?.[key] ?? ''));
}

function contentChanged(previous, payload, fields) {
  return fields.some((field) => Object.hasOwn(payload, field) && String(previous?.[field] ?? '') !== String(payload?.[field] ?? ''));
}

function revisionFor(row, cfg, operation, sourceRevisionId = null) {
  return {
    id: crypto.randomUUID(),
    resource_type: cfg.resourceType,
    resource_key: row[cfg.resourceKey],
    locale: row.locale,
    version: row.version || 1,
    operation,
    snapshot: clone(row),
    source_revision_id: sourceRevisionId,
    created_at: now(),
  };
}


function activityDescriptor(operation, rows = []) {
  const first = rows[0] || {};
  const values = Array.isArray(operation.values) ? operation.values : [operation.values || {}];
  const firstValue = values[0] || {};
  const explicit = operation.activity || {};
  if (explicit.kind || explicit.title || explicit.detail) {
    return {
      kind: explicit.kind || 'admin_action',
      title: explicit.title || '后台操作已完成',
      detail: explicit.detail || '',
      metadata: explicit.metadata || {},
    };
  }
  if (operation.table === 'species_data_reviews') {
    const decision = firstValue.decision || first.decision || '';
    return {
      kind: decision === 'duplicate_records' || decision === 'distinct_records' ? 'duplicate_review' : 'data_review',
      title: decision === 'duplicate_records' ? '重复记录已处理' : decision === 'distinct_records' ? '已确认不是重复' : '数据复核已记录',
      detail: first.group_key || firstValue.group_key || '',
      metadata: { decision, canonical_catalog_key: first.canonical_catalog_key || firstValue.canonical_catalog_key || '' },
    };
  }
  if (operation.table === 'species_seo' || operation.table === 'species_seo_groups') {
    const reviewStateOnly = operation.action === 'update' && Object.keys(firstValue).every((key) => key === 'review_state');
    const resourceLabel = operation.table === 'species_seo_groups' ? '基础模板' : 'SEO 页面';
    if (reviewStateOnly) {
      const state = firstValue.review_state;
      return {
        kind: state === 'approved' ? 'review_approved' : state === 'ready_for_review' ? 'review_submitted' : 'review_returned',
        title: state === 'approved' ? `${resourceLabel}已批准预览` : state === 'ready_for_review' ? `${resourceLabel}已提交审核` : `${resourceLabel}已退回编辑`,
        detail: first.catalog_key || first.group_key || '',
        metadata: { review_state: state },
      };
    }
    if (values.length > 1 && values.every((item) => Object.keys(item).every((key) => ['catalog_key', 'locale', 'status'].includes(key)))) {
      return { kind: 'batch_drafts_created', title: `已批量建立 ${values.length} 条 Draft`, detail: first.locale || firstValue.locale || '', metadata: {} };
    }
    return {
      kind: 'content_saved',
      title: `${resourceLabel}已保存`,
      detail: first.catalog_key || first.group_key || '',
      metadata: { locale: first.locale || firstValue.locale || '' },
    };
  }
  return { kind: 'admin_action', title: '后台操作已完成', detail: operation.table || '', metadata: {} };
}

function appendActivity(store, operation, rows = []) {
  const descriptor = activityDescriptor(operation, rows);
  const first = rows[0] || {};
  store.admin_activity_log.push({
    id: crypto.randomUUID(),
    status: 'success',
    kind: descriptor.kind,
    title: descriptor.title,
    detail: descriptor.detail,
    resource_type: operation.table || operation.rpc || 'admin',
    resource_key: first.catalog_key || first.group_key || first.issue_key || '',
    locale: first.locale || '',
    affected_count: rows.length || (Array.isArray(operation.values) ? operation.values.length : 1),
    metadata: descriptor.metadata,
    actor: 'repo-admin',
    created_at: now(),
  });
  store.admin_activity_log = store.admin_activity_log.slice(-1000);
}

export async function appendRepoActivity(activity) {
  await updateDraftJson((raw) => {
    const store = normalizeStore(raw);
    appendActivity(store, { table: 'staging_publish', activity }, []);
    store.updated_at = now();
    return store;
  }, 'content(seo): record admin activity');
}

function applyEditorialMetadata(previous, payload, cfg) {
  const timestamp = now();
  const inserting = !previous;
  const changed = inserting || contentChanged(previous, payload, cfg.contentFields || []);
  const merged = { ...(previous || {}), ...payload };
  merged.id = previous?.id || crypto.randomUUID();
  merged.created_at = previous?.created_at || timestamp;
  merged.updated_at = timestamp;
  merged.deleted_at = payload.deleted_at ?? previous?.deleted_at ?? null;
  merged.version = (previous?.version || 0) + 1;
  merged.status = 'draft';
  merged.published_at = null;
  if (changed) {
    merged.review_state = 'editing';
    merged.reviewed_at = null;
    merged.reviewed_by = null;
  } else {
    const requested = payload.review_state || previous?.review_state || 'editing';
    merged.review_state = ['editing', 'ready_for_review', 'approved'].includes(requested) ? requested : 'editing';
    if (merged.review_state === 'approved') {
      merged.reviewed_at = previous?.review_state === 'approved' && previous?.reviewed_at ? previous.reviewed_at : timestamp;
      merged.reviewed_by = 'repo-admin';
    } else {
      merged.reviewed_at = null;
      merged.reviewed_by = null;
    }
  }
  return merged;
}

function applyDataReviewMetadata(previous, payload) {
  const timestamp = now();
  return {
    ...(previous || {}), ...payload,
    created_at: previous?.created_at || timestamp,
    updated_at: timestamp,
    reviewed_at: timestamp,
    reviewed_by: 'repo-admin',
    version: (previous?.version || 0) + 1,
  };
}

function applyUpsert(store, table, values) {
  const cfg = RESOURCE_CONFIG[table];
  if (!cfg) throw new Error(`Unsupported upsert table: ${table}`);
  const rows = Array.isArray(values) ? values : [values];
  const output = [];
  for (const payload of rows) {
    const index = store[table].findIndex((row) => sameKey(row, payload, cfg.keys));
    const previous = index >= 0 ? store[table][index] : null;
    const next = table === 'species_data_reviews'
      ? applyDataReviewMetadata(previous, payload)
      : applyEditorialMetadata(previous, payload, cfg);
    if (index >= 0) store[table][index] = next; else store[table].push(next);
    if (cfg.resourceType) {
      store.content_revisions.push(revisionFor(next, cfg, previous ? 'update' : 'insert'));
    }
    output.push(clone(next));
  }
  store.content_revisions = store.content_revisions.slice(-1000);
  store.updated_at = now();
  return output;
}

function matches(row, filters = []) {
  return filters.every((filter) => {
    if (filter.type === 'eq') return String(row?.[filter.column] ?? '') === String(filter.value ?? '');
    if (filter.type === 'is') return filter.value === null ? row?.[filter.column] == null : row?.[filter.column] === filter.value;
    if (filter.type === 'in') return (filter.values || []).map(String).includes(String(row?.[filter.column] ?? ''));
    return true;
  });
}

function applySelect(store, operation) {
  const sourceRows = operation.table === 'user_roles'
    ? [{ user_id: 'repo-admin', role: 'admin', deleted_at: null }]
    : clone(store[operation.table] || []);
  let rows = sourceRows.filter((row) => matches(row, operation.filters));
  if (operation.order?.column) {
    const { column, ascending = true } = operation.order;
    rows.sort((a, b) => {
      const av = a?.[column] ?? ''; const bv = b?.[column] ?? '';
      return (av < bv ? -1 : av > bv ? 1 : 0) * (ascending ? 1 : -1);
    });
  }
  if (Number.isFinite(operation.limit)) rows = rows.slice(0, operation.limit);
  return rows;
}

function applyUpdate(store, operation) {
  const cfg = RESOURCE_CONFIG[operation.table];
  if (!cfg) throw new Error(`Unsupported update table: ${operation.table}`);
  const output = [];
  store[operation.table] = store[operation.table].map((row) => {
    if (!matches(row, operation.filters)) return row;
    const next = operation.table === 'species_data_reviews'
      ? applyDataReviewMetadata(row, operation.values || {})
      : applyEditorialMetadata(row, operation.values || {}, cfg);
    if (cfg.resourceType) store.content_revisions.push(revisionFor(next, cfg, 'update'));
    output.push(clone(next));
    return next;
  });
  store.content_revisions = store.content_revisions.slice(-1000);
  store.updated_at = now();
  return output;
}

function applyInsert(store, operation) {
  if (operation.table === 'admin_activity_log') {
    const rows = (Array.isArray(operation.values) ? operation.values : [operation.values]).map((row) => ({ id: row.id || crypto.randomUUID(), created_at: row.created_at || now(), ...row }));
    store.admin_activity_log.push(...rows);
    store.admin_activity_log = store.admin_activity_log.slice(-1000);
    store.updated_at = now();
    return clone(rows);
  }
  return applyUpsert(store, operation.table, operation.values);
}

function restoreRevision(store, revisionId) {
  const revision = store.content_revisions.find((item) => item.id === revisionId);
  if (!revision) throw new Error('Revision not found.');
  const table = revision.resource_type === 'species_seo_group' ? 'species_seo_groups' : 'species_seo';
  const cfg = RESOURCE_CONFIG[table];
  const payload = { ...revision.snapshot, status: 'draft', review_state: 'editing', published_at: null, reviewed_at: null, reviewed_by: null };
  const index = store[table].findIndex((row) => row[cfg.resourceKey] === revision.resource_key && row.locale === revision.locale);
  const previous = index >= 0 ? store[table][index] : null;
  const timestamp = now();
  const next = {
    ...payload,
    id: previous?.id || payload.id || crypto.randomUUID(),
    version: (previous?.version || payload.version || 0) + 1,
    created_at: previous?.created_at || payload.created_at || timestamp,
    updated_at: timestamp,
  };
  if (index >= 0) store[table][index] = next; else store[table].push(next);
  store.content_revisions.push(revisionFor(next, cfg, 'rollback', revision.id));
  store.content_revisions = store.content_revisions.slice(-1000);
  store.updated_at = timestamp;
  return clone(next);
}

function finalizeSingle(data, mode) {
  if (!mode) return { data, error: null };
  if (mode === 'maybeSingle') {
    if (data.length > 1) return { data: null, error: { message: 'Expected at most one row.' } };
    return { data: data[0] || null, error: null };
  }
  if (data.length !== 1) return { data: null, error: { message: `Expected exactly one row, got ${data.length}.` } };
  return { data: data[0], error: null };
}

export async function executeRepoOperation(operation) {
  if (!TABLES.has(operation.table) && operation.action !== 'rpc') {
    return { data: null, error: { message: `Unsupported repo table: ${operation.table || 'missing'}` } };
  }
  try {
    if (operation.action === 'select') {
      const current = normalizeStore((await readDraftJsonWithFallback(EMPTY_ADMIN_STORE)).data);
      return finalizeSingle(applySelect(current, operation), operation.singleMode);
    }
    if (operation.action === 'rpc') {
      if (operation.rpc !== 'restore_species_seo_revision') throw new Error(`Unsupported repo RPC: ${operation.rpc}`);
      let restored = null;
      await updateDraftJson((raw) => {
        const store = normalizeStore(raw);
        restored = restoreRevision(store, operation.args?.p_revision_id);
        appendActivity(store, { ...operation, activity: operation.activity || { kind: 'revision_restored', title: '历史版本已恢复', detail: restored?.catalog_key || restored?.group_key || '' } }, restored ? [restored] : []);
        return store;
      }, 'content(seo): restore revision as draft');
      return { data: restored, error: null };
    }
    let result = [];
    await updateDraftJson((raw) => {
      const store = normalizeStore(raw);
      if (operation.action === 'upsert') result = applyUpsert(store, operation.table, operation.values);
      else if (operation.action === 'insert') result = applyInsert(store, operation);
      else if (operation.action === 'update') result = applyUpdate(store, operation);
      else throw new Error(`Unsupported repo action: ${operation.action}`);
      if (operation.table !== 'admin_activity_log') appendActivity(store, operation, result);
      return store;
    }, operation.commitMessage || `content(seo): ${operation.action} ${operation.table}`);
    return finalizeSingle(result, operation.singleMode);
  } catch (error) {
    return { data: null, error: { message: error.message || 'Repository content operation failed.' } };
  }
}

export async function buildRepoStagingSnapshot({ catalogKeys, groupKeys }) {
  const selectedCatalogKeys = [...new Set((catalogKeys || []).map(String).filter(Boolean))];
  const selectedGroupKeys = [...new Set((groupKeys || []).map(String).filter(Boolean))];
  if (!selectedCatalogKeys.length) throw new Error('Select at least one Species for staging publish.');
  if (selectedCatalogKeys.length > 20) throw new Error('Staging publish is limited to 20 Species per release.');
  if (!selectedGroupKeys.length) throw new Error('Selected Base Species group keys are required.');
  const store = normalizeStore((await readDraftJsonWithFallback(EMPTY_ADMIN_STORE)).data);
  const speciesSeo = store.species_seo.filter((row) => selectedCatalogKeys.includes(row.catalog_key) && row.status === 'draft' && row.review_state === 'approved' && row.reviewed_at && !row.deleted_at);
  const speciesSeoGroups = store.species_seo_groups.filter((row) => selectedGroupKeys.includes(row.group_key) && row.status === 'draft' && row.review_state === 'approved' && row.reviewed_at && !row.deleted_at);
  const snapshot = {
    environment: 'staging',
    delivery_mode: 'staging_release',
    source_label: 'github-repo-admin',
    exported_at: now(),
    selected_catalog_keys: selectedCatalogKeys,
    species_seo: speciesSeo.map(({ reviewed_by, ...row }) => row),
    species_seo_groups: speciesSeoGroups.map(({ reviewed_by, ...row }) => row),
    data_review_resolutions: store.species_data_reviews
      .filter((row) => selectedGroupKeys.includes(row.group_key))
      .map(({ notes, reviewed_by, reviewed_at, created_at, updated_at, version, ...row }) => row),
  };
  if (speciesSeo.length < selectedCatalogKeys.length * 2) {
    throw new Error('Each selected Species must have Approved Draft rows for both zh-CN and en before staging publish.');
  }
  if (speciesSeoGroups.length < selectedGroupKeys.length * 2) throw new Error('Each selected Base Species must have Approved Draft rows for both zh-CN and en before staging publish.');
  return snapshot;
}

export async function publishRepoStagingSelection(selection) {
  const snapshot = await buildRepoStagingSnapshot(selection);
  const write = await writeStagingSnapshot(snapshot);
  return { snapshot, write };
}
