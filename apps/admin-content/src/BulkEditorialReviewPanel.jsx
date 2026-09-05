import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminContentClient, publishRepoStaging } from './adminBackend.js';
import { useAppLanguage } from './AppLanguage.jsx';
import { emitAdminNotice } from './AdminNoticeViewport.jsx';
import { seoRowKey, groupSeoRowKey, getLocaleLabel } from './localization.js';
import { inspectEditorialContent } from './contentHygiene.js';

const ACTIONS = {
  submit: { target: 'ready_for_review', zh: '批量提交审核', en: 'Submit for review' },
  approve: { target: 'approved', zh: '批量批准 Preview', en: 'Approve Preview' },
  return: { target: 'editing', zh: '批量退回编辑', en: 'Return to editing' },
};

function inspectBaseRow(row) {
  if (!row) return { clean: false, issues: [{ label: 'Base template', match: 'missing' }] };
  return inspectEditorialContent({
    seoTitleTemplate: row.seo_title_template,
    metaDescriptionTemplate: row.meta_description_template,
    h1Template: row.h1_template,
    sharedIntroTemplate: row.shared_intro,
  });
}

function inspectVariantRow(row) {
  if (!row) return { clean: false, issues: [{ label: 'Species SEO', match: 'missing' }] };
  return inspectEditorialContent({
    localizedName: row.localized_name,
    seoTitle: row.seo_title,
    metaDescription: row.meta_description,
    h1: row.h1,
    variantIntro: row.intro,
    imageAlt: row.image_alt,
    focusKeyword: row.focus_keyword,
  });
}

function isApprovedDraft(row) {
  return Boolean(row && row.status === 'draft' && row.review_state === 'approved' && row.reviewed_at);
}

function candidateIdSet(overview, locale) {
  const source = overview?.locales?.[locale]?.memberIdsByState || {};
  return new Set([...(source.blocked || []), ...(source.ready_for_review || []), ...(source.publish_ready || [])]);
}

function loadRecentImportScope(locale) {
  if (typeof window === 'undefined') return { locale, catalogKeys: [], importedAt: null, source: 'none' };
  try {
    const raw = window.localStorage.getItem(`aquaguide-admin-last-import-${locale}`);
    if (!raw) return { locale, catalogKeys: [], importedAt: null, source: 'none' };
    const parsed = JSON.parse(raw);
    const catalogKeys = [...new Set((parsed?.catalogKeys || []).filter(Boolean))];
    return { locale, catalogKeys, importedAt: parsed?.importedAt || null, source: catalogKeys.length ? 'local' : 'none' };
  } catch {
    return { locale, catalogKeys: [], importedAt: null, source: 'none' };
  }
}

function scopeFromActivity(row, locale) {
  const metadata = row?.metadata || {};
  const catalogKeys = [...new Set((metadata.catalog_keys || []).filter(Boolean))];
  if (row?.kind !== 'bulk_import' || metadata.locale !== locale || !catalogKeys.length) return null;
  return { locale, catalogKeys, importedAt: row.created_at || null, source: 'activity' };
}

function scopeFromImportBatch(batch, locale) {
  if (!batch || batch.locale !== locale) return null;
  const catalogKeys = [...new Set((batch.catalog_keys || []).filter(Boolean))];
  if (!catalogKeys.length) return null;
  return {
    locale,
    catalogKeys,
    groupKeys: [...new Set((batch.group_keys || []).filter(Boolean))],
    importedAt: batch.created_at || null,
    source: 'repo',
    batchId: batch.batch_id || '',
    filename: batch.filename || '',
    status: batch.status || 'imported',
  };
}

function formatScopeTime(value, isUiEnglish) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat(isUiEnglish ? 'en-US' : 'zh-CN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '';
  }
}

export default function BulkEditorialReviewPanel({ species = [], groups = [], seoRows = {}, groupSeoRows = {}, workflowOverview, locale = 'zh-CN', importBatch = null, schemaReady = false, readOnly = false, onCompleted }) {
  const { appLocale } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const [action, setAction] = useState('submit');
  const [selected, setSelected] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [stagingPublishing, setStagingPublishing] = useState(false);
  const [recentImportScope, setRecentImportScope] = useState(() => scopeFromImportBatch(importBatch, locale) || loadRecentImportScope(locale));
  const [scopeMode, setScopeMode] = useState('recent');

  const groupByMemberId = useMemo(() => {
    const map = new Map();
    for (const group of groups || []) for (const member of group.members || []) map.set(member.id, group);
    return map;
  }, [groups]);
  const memberByCatalogKey = useMemo(() => new Map(species.map((member) => [member.catalog_key, member])), [species]);
  const allCandidateIds = useMemo(() => candidateIdSet(workflowOverview, locale), [workflowOverview, locale]);
  const reviewReadyIds = useMemo(() => new Set(workflowOverview?.locales?.[locale]?.memberIdsByState?.ready_for_review || []), [workflowOverview, locale]);
  const recentImportKeys = useMemo(() => new Set(recentImportScope.catalogKeys || []), [recentImportScope]);

  const buildCandidates = useCallback((mode) => species.flatMap((member) => {
    if (!allCandidateIds.has(member.id)) return [];
    const group = groupByMemberId.get(member.id);
    const variantRow = seoRows[seoRowKey(member.catalog_key, locale)];
    const groupRow = group ? groupSeoRows[groupSeoRowKey(group.group_key, locale)] : null;
    if (!group || !variantRow) return [];
    let blockedReason = '';
    if (mode === 'submit') {
      if (!reviewReadyIds.has(member.id) || variantRow.review_state !== 'editing') return [];
      if (groupRow?.review_state === 'editing' && !inspectBaseRow(groupRow).clean) blockedReason = isUiEnglish ? 'Base template still contains blocked copy.' : '基础模板仍有被阻止的文案。';
    }
    if (mode === 'approve') {
      if (!reviewReadyIds.has(member.id) || variantRow.review_state !== 'ready_for_review') return [];
      if (!['ready_for_review', 'approved'].includes(groupRow?.review_state)) blockedReason = isUiEnglish ? 'Submit the Base template for review first.' : '请先把基础模板提交审核。';
      else if (groupRow.review_state === 'ready_for_review' && !inspectBaseRow(groupRow).clean) blockedReason = isUiEnglish ? 'Base template still contains blocked copy.' : '基础模板仍有被阻止的文案。';
    }
    if (mode === 'return' && !['ready_for_review', 'approved'].includes(variantRow.review_state)) return [];
    return [{ member, group, variantRow, groupRow, blockedReason }];
  }), [species, allCandidateIds, groupByMemberId, seoRows, groupSeoRows, locale, reviewReadyIds, isUiEnglish]);

  const candidateSets = useMemo(() => ({
    submit: buildCandidates('submit'),
    approve: buildCandidates('approve'),
    return: buildCandidates('return'),
  }), [buildCandidates]);
  const scopedCandidateSets = useMemo(() => Object.fromEntries(
    Object.entries(candidateSets).map(([key, rows]) => [
      key,
      scopeMode === 'all' ? rows : recentImportKeys.size ? rows.filter((item) => recentImportKeys.has(item.member.catalog_key)) : [],
    ]),
  ), [candidateSets, scopeMode, recentImportKeys]);
  const candidates = scopedCandidateSets[action];
  const eligible = candidates.filter((item) => !item.blockedReason);
  const selectedRows = eligible.filter((item) => selected.has(item.member.id));
  const allEligibleForAction = candidateSets[action].filter((item) => !item.blockedReason).length;

  const stagingSelection = useMemo(() => {
    const batchKeys = [...recentImportKeys];
    const catalogKeys = new Set(batchKeys);
    for (const key of batchKeys) {
      for (const rowLocale of ['zh-CN', 'en']) {
        const row = seoRows[seoRowKey(key, rowLocale)];
        if (row?.index_strategy === 'canonical_to_sibling' && row.canonical_catalog_key) catalogKeys.add(row.canonical_catalog_key);
      }
    }
    const selectionKeys = [...catalogKeys];
    const groupKeys = new Set();
    let allMembersFound = true;
    let readySpeciesCount = 0;
    for (const key of selectionKeys) {
      const member = memberByCatalogKey.get(key);
      if (!member) { allMembersFound = false; continue; }
      const group = groupByMemberId.get(member.id);
      if (!group?.group_key) { allMembersFound = false; continue; }
      groupKeys.add(group.group_key);
      const variantRows = ['zh-CN', 'en'].map((rowLocale) => seoRows[seoRowKey(key, rowLocale)]);
      const baseRows = ['zh-CN', 'en'].map((rowLocale) => groupSeoRows[groupSeoRowKey(group.group_key, rowLocale)]);
      const variantsReady = variantRows.every((row) => isApprovedDraft(row) && inspectVariantRow(row).clean);
      const basesReady = baseRows.every((row) => isApprovedDraft(row) && inspectBaseRow(row).clean);
      if (variantsReady && basesReady) readySpeciesCount += 1;
    }
    const persistedBatchReady = !recentImportScope.batchId || ['approved', 'staging_published'].includes(recentImportScope.status);
    const ready = batchKeys.length > 0
      && batchKeys.length <= 20
      && selectionKeys.length <= 20
      && allMembersFound
      && readySpeciesCount === selectionKeys.length
      && persistedBatchReady;
    return {
      batchCount: batchKeys.length,
      dependencyCount: Math.max(selectionKeys.length - batchKeys.length, 0),
      catalogKeys: selectionKeys,
      groupKeys: [...groupKeys],
      readySpeciesCount,
      ready,
      overLimit: selectionKeys.length > 20,
    };
  }, [recentImportKeys, recentImportScope.batchId, recentImportScope.status, seoRows, groupSeoRows, memberByCatalogKey, groupByMemberId]);

  useEffect(() => {
    let cancelled = false;
    const persistedScope = scopeFromImportBatch(importBatch, locale);
    const localScope = persistedScope || loadRecentImportScope(locale);
    setRecentImportScope(localScope);
    setScopeMode('recent');
    setSelected(new Set());
    if (persistedScope || localScope.catalogKeys.length || readOnly) return () => { cancelled = true; };
    adminContentClient
      .from('admin_activity_log')
      .select('*')
      .eq('kind', 'bulk_import')
      .order('created_at', { ascending: false })
      .limit(40)
      .then(({ data, error }) => {
        if (cancelled || error) return;
        const recovered = (data || []).map((row) => scopeFromActivity(row, locale)).find(Boolean);
        if (!recovered) return;
        setRecentImportScope(recovered);
        try {
          window.localStorage.setItem(`aquaguide-admin-last-import-${locale}`, JSON.stringify({
            locale,
            catalogKeys: recovered.catalogKeys,
            importedAt: recovered.importedAt,
          }));
        } catch {
          // Activity remains the durable fallback when browser storage is unavailable.
        }
      });
    return () => { cancelled = true; };
  }, [locale, readOnly, importBatch?.batch_id, importBatch?.status, importBatch?.updated_at]);
  useEffect(() => { setSelected(new Set()); }, [action, scopeMode]);
  useEffect(() => {
    setSelected((current) => new Set([...current].filter((id) => eligible.some((item) => item.member.id === id))));
  }, [eligible.length]);

  const toggle = (id) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const submit = async () => {
    if (readOnly) {
      emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Read-only demo' : '当前是只读演示', detail: isUiEnglish ? 'Bulk editorial review was not written.' : '不会写入批量内容审核结果。' });
      return;
    }
    if (!schemaReady) {
      emitAdminNotice({ status: 'error', title: isUiEnglish ? 'Bulk review blocked' : '批量内容审核被阻止', detail: isUiEnglish ? 'Editorial content storage is not ready.' : '内容审核存储尚未就绪。' });
      return;
    }
    if (!selectedRows.length) {
      emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Select pages first' : '请先选择页面', detail: isUiEnglish ? 'Choose at least one eligible page in the current review scope.' : '请在当前审核范围内至少勾选 1 个可执行页面。' });
      return;
    }
    const target = ACTIONS[action].target;
    const items = selectedRows.map(({ member }) => ({ resource_type: 'species_seo', resource_key: member.catalog_key, locale }));
    if (action !== 'return') {
      const seenGroups = new Set();
      for (const { group, groupRow } of selectedRows) {
        const needsBase = action === 'submit' ? groupRow?.review_state === 'editing' : groupRow?.review_state === 'ready_for_review';
        if (!needsBase || seenGroups.has(group.group_key)) continue;
        seenGroups.add(group.group_key);
        items.push({ resource_type: 'species_seo_groups', resource_key: group.group_key, locale });
      }
    }
    setSaving(true);
    const scopedBatchId = scopeMode === 'recent' ? String(recentImportScope.batchId || '') : '';
    const { data, error } = await adminContentClient.rpc('transition_editorial_reviews_bulk', {
      p_target_state: target,
      p_items: items,
      p_batch_id: scopedBatchId,
    }, {
      kind: 'editorial_review_bulk',
      title: `${isUiEnglish ? ACTIONS[action].en : ACTIONS[action].zh} ${selectedRows.length} ${isUiEnglish ? 'pages' : '个页面'}`,
      detail: items.length > selectedRows.length
        ? `${isUiEnglish ? 'Includes' : '同时处理'} ${items.length - selectedRows.length} ${isUiEnglish ? 'Base templates' : '个基础模板'}`
        : `${getLocaleLabel(locale)} · ${items.length} ${isUiEnglish ? 'resources' : '项内容'}`,
      metadata: {
        action, locale, page_count: selectedRows.length, resource_count: items.length,
        review_scope: scopeMode, catalog_keys: selectedRows.map((item) => item.member.catalog_key),
        batch_id: scopedBatchId, filename: recentImportScope.filename || '', source: recentImportScope.source || '',
      },
    });
    setSaving(false);
    if (error) return;
    setSelected(new Set());
    onCompleted?.(data);
  };

  const publishRecentBatch = async () => {
    if (readOnly) {
      emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Read-only demo' : '当前是只读演示', detail: isUiEnglish ? 'Staging publish is disabled in demo mode.' : '只读演示不会执行 Staging 发布。' });
      return;
    }
    if (!schemaReady || !stagingSelection.ready) {
      emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Batch Staging publish blocked' : '本批 Staging 发布被阻止', detail: stagingSelection.overLimit
        ? (isUiEnglish ? 'A Staging release is limited to 20 Species including canonical dependencies.' : '一次 Staging 最多 20 个 Species，包含 Canonical 依赖。')
        : (isUiEnglish ? 'Both language rows and both Base templates must be Approved Drafts with review timestamps and clean content before Staging.' : 'Staging 前，中英文页面与中英文 Base 都必须是已审核的 Approved Draft，并且没有测试/验收文案。') });
      return;
    }
    setStagingPublishing(true);
    const { data, error } = await publishRepoStaging({
      catalogKeys: stagingSelection.catalogKeys,
      groupKeys: stagingSelection.groupKeys,
      batchId: recentImportScope.batchId || '',
    });
    setStagingPublishing(false);
    if (error) return;
    if (data?.import_batch) onCompleted?.({ import_batch: data.import_batch });
    emitAdminNotice({
      status: 'success',
      title: isUiEnglish ? 'Import batch published to Staging' : '本次导入批次已发布到 Staging',
      detail: `${data?.selected_catalog_keys?.length || stagingSelection.catalogKeys.length} Species · ${data?.commit_sha?.slice(0, 7) || 'Staging snapshot'}`,
    });
  };

  const selectedBaseCount = useMemo(() => {
    if (action === 'return') return 0;
    const keys = new Set();
    for (const { group, groupRow } of selectedRows) {
      if ((action === 'submit' && groupRow?.review_state === 'editing') || (action === 'approve' && groupRow?.review_state === 'ready_for_review')) keys.add(group.group_key);
    }
    return keys.size;
  }, [selectedRows, action]);

  const actionLabel = isUiEnglish ? ACTIONS[action].en : ACTIONS[action].zh;
  const scopeTime = formatScopeTime(recentImportScope.importedAt, isUiEnglish);
  const scopeSummary = scopeMode === 'recent'
    ? (recentImportKeys.size
      ? (recentImportScope.batchId
        ? `${recentImportScope.batchId}${recentImportScope.filename ? ` · ${recentImportScope.filename}` : ''} · ${recentImportKeys.size} Species${scopeTime ? ` · ${scopeTime}` : ''}`
        : (isUiEnglish ? `${recentImportKeys.size} pages from the latest ${getLocaleLabel(locale)} import${scopeTime ? ` · ${scopeTime}` : ''}` : `最近一次 ${getLocaleLabel(locale)} 导入 · ${recentImportKeys.size} 个页面${scopeTime ? ` · ${scopeTime}` : ''}`))
      : (isUiEnglish ? 'No recent import batch detected. Full-library review stays hidden until you opt in.' : '没有检测到最近导入批次。为避免误审，默认不展示全库内容。'))
    : (isUiEnglish ? `All eligible content is visible · ${allEligibleForAction} pages for this action` : `已显示全部可执行内容 · 当前动作 ${allEligibleForAction} 个页面`);

  return (
    <section className="bulk-editorial-panel">
      <div className="bulk-duplicate-head">
        <div>
          <p className="eyebrow">BULK EDITORIAL REVIEW · {getLocaleLabel(locale)}</p>
          <h2>{isUiEnglish ? 'Bulk content review' : '批量内容审核'}</h2>
          <p>{isUiEnglish ? 'Move multiple completed pages through editorial review without weakening Data Review, copy hygiene, or Preview gates.' : '一次处理多条已完成页面，但不会绕过数据复核、测试文案或 Preview 门禁。'}</p>
        </div>
        <span className="bulk-duplicate-count">{eligible.length} {isUiEnglish ? 'eligible in scope' : '个当前范围可执行'}</span>
      </div>

      <div className="bulk-import-preflight waiting" aria-label={isUiEnglish ? 'Review scope' : '审核范围'}>
        <div className="bulk-import-preflight-head">
          <div><strong>{isUiEnglish ? 'Review scope' : '审核范围'}</strong><small>{scopeSummary}</small></div>
          <span>{scopeMode === 'recent' ? (isUiEnglish ? 'Latest import' : '最近导入') : (isUiEnglish ? 'All eligible' : '全部可执行')}</span>
        </div>
        <div className="bulk-review-decision" role="radiogroup" aria-label={isUiEnglish ? 'Choose review scope' : '选择审核范围'}>
          <button type="button" className={scopeMode === 'recent' ? 'active' : ''} onClick={() => setScopeMode('recent')}>
            <strong>{isUiEnglish ? 'Latest import batch' : '最近导入批次'}</strong>
            <small>{recentImportKeys.size} {isUiEnglish ? 'recorded pages' : '个已记录页面'}</small>
          </button>
          <button type="button" className={scopeMode === 'all' ? 'active' : ''} onClick={() => setScopeMode('all')}>
            <strong>{isUiEnglish ? 'All eligible content' : '全部可执行内容'}</strong>
            <small>{isUiEnglish ? 'Explicit opt-in for historical Drafts too' : '主动切换后才会包含历史 Draft'}</small>
          </button>
        </div>
        {scopeMode === 'all' ? <p className="bulk-import-preflight-note">{isUiEnglish ? 'Caution: this scope can include older Drafts outside the latest import. “Select eligible” will select only the pages currently shown here.' : '注意：这个范围可能包含最近导入之外的旧 Draft。“全选可执行”只会选择当前范围内显示的页面。'}</p> : null}
      </div>

      <div className="bulk-review-decision bulk-editorial-actions" role="tablist" aria-label={isUiEnglish ? 'Bulk editorial action' : '批量内容审核动作'}>
        {Object.entries(ACTIONS).map(([key, meta]) => (
          <button type="button" role="tab" aria-selected={action === key} key={key} className={action === key ? 'active' : ''} onClick={() => setAction(key)}>
            <strong>{isUiEnglish ? meta.en : meta.zh}</strong>
            <small>{scopedCandidateSets[key].filter((item) => !item.blockedReason).length} {isUiEnglish ? 'eligible pages in scope' : '个当前范围可执行'}</small>
          </button>
        ))}
      </div>

      <div className="bulk-review-toolbar">
        <div className="bulk-select-actions">
          <button type="button" className="secondary-button compact" disabled={!eligible.length} onClick={() => setSelected(new Set(eligible.slice(0, 50).map((item) => item.member.id)))}>{scopeMode === 'recent' ? (isUiEnglish ? 'Select eligible in batch' : '全选本批可执行') : (isUiEnglish ? 'Select eligible in scope' : '全选当前范围')}</button>
          <button type="button" className="ghost-button compact" onClick={() => setSelected(new Set())}>{isUiEnglish ? 'Clear' : '清空选择'}</button>
        </div>
        <strong>{selectedRows.length} {isUiEnglish ? 'pages selected' : '个页面已选择'}</strong>
      </div>
      <div className="bulk-duplicate-list bulk-editorial-list">
        {candidates.length === 0 ? (
          <p className="bulk-duplicate-empty">{scopeMode === 'recent' && !recentImportKeys.size
            ? (isUiEnglish ? 'No recent import scope is available. Import a template first, or explicitly switch to “All eligible content”.' : '当前没有最近导入批次。请先导入模板，或主动切换到“全部可执行内容”。')
            : (isUiEnglish ? 'No pages are eligible for this bulk action in the current scope.' : '当前审核范围内没有可执行此批量动作的页面。')}</p>
        ) : candidates.map((item) => {
          const checked = selected.has(item.member.id);
          const disabled = Boolean(item.blockedReason);
          return (
            <article className={`bulk-duplicate-row bulk-editorial-row ${checked ? 'selected' : ''} ${disabled ? 'blocked' : ''}`} key={item.member.id}>
              <label className="bulk-duplicate-select">
                <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(item.member.id)} />
                <span>
                  <strong>{item.member.name}</strong>
                  <small>{item.member.catalog_key} · {item.group.base_scientific_name}</small>
                </span>
              </label>
              <div className="bulk-editorial-statuses">
                <span>{isUiEnglish ? 'Page' : '页面'} · {item.variantRow.review_state}</span>
                <span>{isUiEnglish ? 'Base' : '基础模板'} · {item.groupRow?.review_state || 'missing'}</span>
              </div>
              {item.blockedReason ? <small className="bulk-editorial-blocker">{item.blockedReason}</small> : null}
            </article>
          );
        })}
      </div>

      {scopeMode === 'recent' && recentImportKeys.size ? (
        <div className={`bulk-import-preflight ${stagingSelection.ready ? 'ready' : 'waiting'}`} aria-label={isUiEnglish ? 'Import batch Staging readiness' : '本批 Staging 就绪状态'}>
          <div className="bulk-import-preflight-head">
            <div><strong>{isUiEnglish ? 'Publish this import batch to Staging' : '发布本次导入批次到 Staging'}</strong><small>{isUiEnglish ? 'One explicit release after bilingual approval; Production stays locked.' : '双语审核全部通过后一次发布；Production 继续锁定。'}</small></div>
            <span>{stagingSelection.readySpeciesCount}/{stagingSelection.catalogKeys.length} {isUiEnglish ? 'bilingual approved' : '双语已批准'}</span>
          </div>
          <p className={`bulk-import-preflight-note ${stagingSelection.ready ? 'success' : ''}`}>{stagingSelection.overLimit
            ? (isUiEnglish ? 'This release exceeds the 20-Species Staging cap once canonical dependencies are included.' : '加入 Canonical 依赖后超过单次 Staging 20 个 Species 的上限。')
            : stagingSelection.ready
              ? (isUiEnglish ? `${stagingSelection.batchCount} imported pages have Approved Drafts in both languages${stagingSelection.dependencyCount ? `; ${stagingSelection.dependencyCount} canonical dependencies are included` : ''}.` : `${stagingSelection.batchCount} 个本批页面的中英文 Draft 均已批准${stagingSelection.dependencyCount ? `，并包含 ${stagingSelection.dependencyCount} 个 Canonical 依赖` : ''}。`)
              : recentImportScope.batchId && !['approved', 'staging_published'].includes(recentImportScope.status)
                ? (isUiEnglish ? 'This persisted import batch has not completed its batch approval workflow yet.' : '这个持久化导入批次尚未完成整批批准流程。')
                : (isUiEnglish ? 'Staging stays disabled until both language rows and both Base templates are Approved, reviewed and clean for every selected Species.' : '每个 Species 的中英文页面与中英文 Base 都达到 Approved、已审核且文案干净之前，Staging 发布保持禁用。')}</p>
          <div className="bulk-duplicate-footer">
            <span>{isUiEnglish ? 'This writes one sanitized Staging snapshot and triggers one Preview deployment; it does not publish Production.' : '该动作只写入一份脱敏 Staging Snapshot 并触发一次 Preview 部署，不会发布 Production。'}</span>
            <button type="button" className="primary-button" disabled={stagingPublishing || !stagingSelection.ready} onClick={publishRecentBatch}>{stagingPublishing ? (isUiEnglish ? 'Publishing…' : '正在发布…') : (isUiEnglish ? `Publish ${stagingSelection.catalogKeys.length} to Staging` : `一次发布 ${stagingSelection.catalogKeys.length} 个到 Staging`)}</button>
          </div>
        </div>
      ) : null}

      <div className="bulk-duplicate-footer">
        <span>{selectedBaseCount ? (isUiEnglish ? `${selectedBaseCount} required Base templates will move in the same atomic review action.` : `会在同一次原子操作中同步处理 ${selectedBaseCount} 个必要的基础模板。`) : (isUiEnglish ? 'Only the selected page review states will change.' : '只修改所选页面的审核状态。')}</span>
        <button type="button" className="primary-button" disabled={saving || !selectedRows.length} onClick={submit}>{saving ? (isUiEnglish ? 'Saving…' : '正在保存…') : `${actionLabel} ${selectedRows.length}`}</button>
      </div>
    </section>
  );
}
