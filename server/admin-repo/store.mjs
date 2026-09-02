import crypto from 'node:crypto';
import { readDraftJsonWithFallback, updateDraftJson, writeStagingSnapshot } from './github.mjs';
import { inspectEditorialContent } from '../../apps/admin-content/src/contentHygiene.js';

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

function repoRowHygiene(table, row = {}) {
  if (table === 'species_seo') {
    return inspectEditorialContent({
      localizedName: row.localized_name, seoTitle: row.seo_title, metaDescription: row.meta_description, h1: row.h1,
      variantIntro: row.intro, imageAlt: row.image_alt, focusKeyword: row.focus_keyword,
    });
  }
  if (table === 'species_seo_groups') {
    return inspectEditorialContent({
      seoTitleTemplate: row.seo_title_template, metaDescriptionTemplate: row.meta_description_template,
      h1Template: row.h1_template, sharedIntroTemplate: row.shared_intro,
    });
  }
  return { clean: true, issues: [] };
}

function assertReviewContentHygiene(table, row, requestedState) {
  if (!['ready_for_review', 'approved'].includes(requestedState) || !['species_seo', 'species_seo_groups'].includes(table)) return;
  const hygiene = repoRowHygiene(table, row);
  if (!hygiene.clean) {
    const fields = hygiene.issues.map((issue) => `${issue.label} (${issue.match})`).join(', ');
    throw new Error(`Content hygiene blocked review: remove test/acceptance wording from ${fields}.`);
  }
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

function applyResolvedDuplicateSeoPolicy(store, row) {
  if (!row?.catalog_key) return row;
  const review = (store.species_data_reviews || []).find((item) =>
    item.issue_type === 'duplicate_set' &&
    item.decision === 'duplicate_records' &&
    Array.isArray(item.member_ids) &&
    item.member_ids.includes(row.catalog_key) &&
    item.member_ids.includes(item.canonical_catalog_key)
  );
  if (!review) return row;
  if (review.canonical_catalog_key === row.catalog_key) {
    row.index_strategy = 'index';
    row.canonical_catalog_key = '';
  } else {
    row.index_strategy = 'canonical_to_sibling';
    row.canonical_catalog_key = review.canonical_catalog_key;
  }
  return row;
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
    let next = table === 'species_data_reviews'
      ? applyDataReviewMetadata(previous, payload)
      : applyEditorialMetadata(previous, payload, cfg);
    if (table === 'species_seo') next = applyResolvedDuplicateSeoPolicy(store, next);
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
    const requestedReviewState = operation.values?.review_state;
    if (requestedReviewState) assertReviewContentHygiene(operation.table, { ...row, ...(operation.values || {}) }, requestedReviewState);
    let next = operation.table === 'species_data_reviews'
      ? applyDataReviewMetadata(row, operation.values || {})
      : applyEditorialMetadata(row, operation.values || {}, cfg);
    if (operation.table === 'species_seo') next = applyResolvedDuplicateSeoPolicy(store, next);
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

function resolveDuplicateReview(store, args = {}) {
  const issueKey = String(args.p_issue_key || '').trim();
  const groupKey = String(args.p_group_key || '').trim();
  const decision = String(args.p_decision || '').trim();
  const memberIds = [...new Set((args.p_member_ids || []).map(String).filter(Boolean))];
  const canonicalKey = decision === 'duplicate_records' ? String(args.p_canonical_catalog_key || '').trim() : '';
  const notes = String(args.p_notes || '').trim();
  if (!issueKey || !groupKey) throw new Error('Duplicate review issue/group key is required.');
  if (!['duplicate_records', 'distinct_records'].includes(decision)) throw new Error('Duplicate review decision is invalid.');
  if (memberIds.length < 2) throw new Error('Duplicate review requires at least two source records.');
  if (decision === 'duplicate_records' && !memberIds.includes(canonicalKey)) throw new Error('Canonical Species must belong to the reviewed duplicate set.');

  const review = applyUpsert(store, 'species_data_reviews', {
    issue_key: issueKey,
    issue_type: 'duplicate_set',
    group_key: groupKey,
    decision,
    canonical_catalog_key: canonicalKey,
    member_ids: memberIds,
    notes,
  })[0];

  const seoRows = [];
  if (decision === 'duplicate_records') {
    for (const memberId of memberIds) {
      const values = memberId === canonicalKey
        ? { index_strategy: 'index', canonical_catalog_key: '' }
        : { index_strategy: 'canonical_to_sibling', canonical_catalog_key: canonicalKey };
      seoRows.push(...applyUpdate(store, { table: 'species_seo', values, filters: [{ type: 'eq', column: 'catalog_key', value: memberId }] }));
    }
  } else {
    for (const memberId of memberIds) {
      seoRows.push(...applyUpdate(store, {
        table: 'species_seo',
        values: { index_strategy: 'noindex', canonical_catalog_key: '' },
        filters: [{ type: 'eq', column: 'catalog_key', value: memberId }],
      }));
    }
  }

  return { review: clone(review), seo_rows: clone(seoRows) };
}


function resolveDuplicateReviewsBulk(store, args = {}) {
  const reviews = Array.isArray(args.p_reviews) ? args.p_reviews : [];
  if (!reviews.length) throw new Error('Bulk duplicate review requires at least one selected issue.');
  if (reviews.length > 50) throw new Error('Bulk duplicate review is limited to 50 issues per operation.');
  const issueKeys = reviews.map((item) => String(item?.p_issue_key || '').trim());
  if (new Set(issueKeys).size !== issueKeys.length) throw new Error('Bulk duplicate review contains duplicate issue keys.');
  const resolved = reviews.map((item) => resolveDuplicateReview(store, item));
  return {
    reviews: resolved.map((item) => item.review),
    seo_rows: resolved.flatMap((item) => item.seo_rows || []),
  };
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
      if (operation.rpc === 'restore_species_seo_revision') {
        let restored = null;
        await updateDraftJson((raw) => {
          const store = normalizeStore(raw);
          restored = restoreRevision(store, operation.args?.p_revision_id);
          appendActivity(store, { ...operation, activity: operation.activity || { kind: 'revision_restored', title: '历史版本已恢复', detail: restored?.catalog_key || restored?.group_key || '' } }, restored ? [restored] : []);
          return store;
        }, 'content(seo): restore revision as draft');
        return { data: restored, error: null };
      }
      if (operation.rpc === 'resolve_species_duplicate_reviews_bulk') {
        let resolved = null;
        await updateDraftJson((raw) => {
          const store = normalizeStore(raw);
          resolved = resolveDuplicateReviewsBulk(store, operation.args || {});
          const decisions = [...new Set((resolved?.reviews || []).map((item) => item.decision))];
          appendActivity(store, {
            ...operation,
            table: 'species_data_reviews',
            activity: operation.activity || {
              kind: 'duplicate_review_bulk',
              title: `批量审核 ${resolved?.reviews?.length || 0} 组重复记录`,
              detail: decisions.length === 1 && decisions[0] === 'duplicate_records' ? '已同步 Index / Canonical 策略' : '批量人工结论已记录',
              metadata: { count: resolved?.reviews?.length || 0, decisions },
            },
          }, resolved?.reviews || []);
          return store;
        }, 'content(seo): resolve duplicate reviews bulk');
        return { data: resolved, error: null };
      }
      if (operation.rpc === 'resolve_species_duplicate_review') {
        let resolved = null;
        await updateDraftJson((raw) => {
          const store = normalizeStore(raw);
          resolved = resolveDuplicateReview(store, operation.args || {});
          const decision = resolved?.review?.decision;
          appendActivity(store, {
            ...operation,
            table: 'species_data_reviews',
            activity: operation.activity || {
              kind: 'duplicate_review',
              title: decision === 'duplicate_records' ? '重复记录已确认并处理' : '已确认两条记录不是重复',
              detail: resolved?.review?.group_key || '',
              metadata: { decision, canonical_catalog_key: resolved?.review?.canonical_catalog_key || '' },
            },
          }, resolved?.review ? [resolved.review] : []);
          return store;
        }, 'content(seo): resolve duplicate review');
        return { data: resolved, error: null };
      }
      throw new Error(`Unsupported repo RPC: ${operation.rpc}`);
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
  const dirtyRows = [
    ...speciesSeo.map((row) => ({ type: 'Species', key: `${row.catalog_key}/${row.locale}`, hygiene: repoRowHygiene('species_seo', row) })),
    ...speciesSeoGroups.map((row) => ({ type: 'Base', key: `${row.group_key}/${row.locale}`, hygiene: repoRowHygiene('species_seo_groups', row) })),
  ].filter((entry) => !entry.hygiene.clean);
  if (dirtyRows.length) {
    const first = dirtyRows[0];
    throw new Error(`Staging blocked by test/acceptance wording in ${first.type} ${first.key}: ${first.hygiene.issues.map((issue) => issue.label).join(', ')}.`);
  }
  return snapshot;
}

export async function publishRepoStagingSelection(selection) {
  const snapshot = await buildRepoStagingSnapshot(selection);
  const write = await writeStagingSnapshot(snapshot);
  return { snapshot, write };
}
