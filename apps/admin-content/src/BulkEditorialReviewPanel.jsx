import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
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

function candidateIdSet(overview, locale) {
  const source = overview?.locales?.[locale]?.memberIdsByState || {};
  return new Set([...(source.blocked || []), ...(source.ready_for_review || []), ...(source.publish_ready || [])]);
}
export default function BulkEditorialReviewPanel({ species = [], groups = [], seoRows = {}, groupSeoRows = {}, workflowOverview, locale = 'zh-CN', importBatch = null, schemaReady = false, readOnly = false, stagingPublishing = false, onPublishBatch, onCompleted }) {
  const { appLocale } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const [action, setAction] = useState('submit');
  const [selected, setSelected] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [scope, setScope] = useState(importBatch ? 'batch' : 'all');

  const groupByMemberId = useMemo(() => {
    const map = new Map();
    for (const group of groups || []) for (const member of group.members || []) map.set(member.id, group);
    return map;
  }, [groups]);
  const allCandidateIds = useMemo(() => candidateIdSet(workflowOverview, locale), [workflowOverview, locale]);
  const reviewReadyIds = useMemo(() => new Set(workflowOverview?.locales?.[locale]?.memberIdsByState?.ready_for_review || []), [workflowOverview, locale]);

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

  const allCandidateSets = useMemo(() => ({
    submit: buildCandidates('submit'),
    approve: buildCandidates('approve'),
    return: buildCandidates('return'),
  }), [buildCandidates]);
  const batchCatalogKeys = useMemo(() => new Set(importBatch?.catalog_keys || []), [importBatch?.batch_id, importBatch?.catalog_keys]);
  const filterByScope = useCallback((rows) => {
    if (!importBatch || scope === 'all') return rows;
    if (scope === 'batch') return rows.filter((item) => batchCatalogKeys.has(item.member.catalog_key));
    return rows.filter((item) => !batchCatalogKeys.has(item.member.catalog_key));
  }, [importBatch, scope, batchCatalogKeys]);
  const candidateSets = useMemo(() => ({
    submit: filterByScope(allCandidateSets.submit),
    approve: filterByScope(allCandidateSets.approve),
    return: filterByScope(allCandidateSets.return),
  }), [allCandidateSets, filterByScope]);
  const candidates = candidateSets[action];
  const eligible = candidates.filter((item) => !item.blockedReason);
  const selectedRows = eligible.filter((item) => selected.has(item.member.id));
  const otherEligibleCount = importBatch
    ? allCandidateSets[action].filter((item) => !batchCatalogKeys.has(item.member.catalog_key) && !item.blockedReason).length
    : 0;

  useEffect(() => { setScope(importBatch ? 'batch' : 'all'); }, [importBatch?.batch_id, locale]);
  useEffect(() => { setSelected(new Set()); }, [action, locale, scope, importBatch?.batch_id]);
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
      emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Select pages first' : '请先选择页面', detail: isUiEnglish ? 'Choose at least one eligible page.' : '至少勾选 1 个可执行页面。' });
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
    const scopedBatch = importBatch && scope === 'batch' ? importBatch : null;
    const { data, error } = await adminContentClient.rpc('transition_editorial_reviews_bulk', {
      p_target_state: target,
      p_items: items,
      p_batch_id: scopedBatch?.batch_id || '',
    }, {
      kind: 'editorial_review_bulk',
      title: `${isUiEnglish ? ACTIONS[action].en : ACTIONS[action].zh} ${selectedRows.length} ${isUiEnglish ? 'pages' : '个页面'}`,
      detail: scopedBatch
        ? `${scopedBatch.batch_id} · ${scopedBatch.filename || getLocaleLabel(locale)}`
        : items.length > selectedRows.length
          ? `${isUiEnglish ? 'Includes' : '同时处理'} ${items.length - selectedRows.length} ${isUiEnglish ? 'Base templates' : '个基础模板'}`
          : `${getLocaleLabel(locale)} · ${items.length} ${isUiEnglish ? 'resources' : '项内容'}`,
      metadata: {
        action, locale, page_count: selectedRows.length, resource_count: items.length,
        batch_id: scopedBatch?.batch_id || '', filename: scopedBatch?.filename || '', source: scopedBatch?.source || '',
      },
    });
    setSaving(false);
    if (error) return;
    setSelected(new Set());
    onCompleted?.(data);
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
  const batchStatusLabel = importBatch ? ({
    imported: isUiEnglish ? 'Imported' : '已导入',
    review_in_progress: isUiEnglish ? 'Review in progress' : '提交审核中',
    pending_review: isUiEnglish ? 'Awaiting approval' : '待批准',
    approval_in_progress: isUiEnglish ? 'Approval in progress' : '批准处理中',
    approved: isUiEnglish ? 'Approved' : '已批准',
    returned: isUiEnglish ? 'Returned to editing' : '已退回编辑',
    staging_published: isUiEnglish ? 'Published to Staging' : '已发布到 Staging',
  }[importBatch.status] || importBatch.status) : '';
  return (
    <section className="bulk-editorial-panel">
      <div className="bulk-duplicate-head">
        <div>
          <p className="eyebrow">BULK EDITORIAL REVIEW · {getLocaleLabel(locale)}</p>
          <h2>{isUiEnglish ? 'Bulk content review' : '批量内容审核'}</h2>
          <p>{isUiEnglish ? 'Move multiple completed pages through editorial review without weakening Data Review, copy hygiene, or Preview gates.' : '一次处理多条已完成页面，但不会绕过数据复核、测试文案或 Preview 门禁。'}</p>
        </div>
        <span className="bulk-duplicate-count">{workflowOverview?.locales?.[locale]?.ready_for_review || 0} {isUiEnglish ? 'awaiting review' : '个待审核'}</span>
      </div>

      {importBatch ? (
        <div className="bulk-review-scope">
          <div className="bulk-review-scope-summary">
            <span>{isUiEnglish ? 'Current import batch' : '当前导入批次'}</span>
            <strong>{importBatch.batch_id}</strong>
            <small>{importBatch.filename || 'CSV'} · {importBatch.locale} · {importBatch.catalog_keys?.length || 0} Species · {batchStatusLabel}</small>
          </div>
          <div className="bulk-review-scope-actions" role="tablist" aria-label={isUiEnglish ? 'Review scope' : '审核范围'}>
            <button type="button" role="tab" aria-selected={scope === 'batch'} className={scope === 'batch' ? 'active' : ''} onClick={() => setScope('batch')}>
              {isUiEnglish ? 'Current batch' : '当前批次'} · {importBatch.catalog_keys?.length || 0}
            </button>
            <button type="button" role="tab" aria-selected={scope === 'other'} className={scope === 'other' ? 'active' : ''} onClick={() => setScope('other')}>
              {isUiEnglish ? 'Other pending' : '其他待处理'} · {otherEligibleCount}
            </button>
          </div>
          {importBatch.status === 'approved' ? (
            <button type="button" className="primary-button compact batch-staging-button" disabled={stagingPublishing || !onPublishBatch} onClick={() => onPublishBatch?.(importBatch)}>
              {stagingPublishing ? (isUiEnglish ? 'Publishing batch…' : '正在发布批次…') : (isUiEnglish ? `Publish batch to Staging · ${importBatch.catalog_keys?.length || 0}` : `发布此批次到 Staging · ${importBatch.catalog_keys?.length || 0}`)}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="bulk-review-decision bulk-editorial-actions" role="tablist" aria-label={isUiEnglish ? 'Bulk editorial action' : '批量内容审核动作'}>
        {Object.entries(ACTIONS).map(([key, meta]) => (
          <button type="button" role="tab" aria-selected={action === key} key={key} className={action === key ? 'active' : ''} onClick={() => setAction(key)}>
            <strong>{isUiEnglish ? meta.en : meta.zh}</strong>
            <small>{candidateSets[key].filter((item) => !item.blockedReason).length} {isUiEnglish ? 'eligible pages' : '个可执行页面'}</small>
          </button>
        ))}
      </div>

      <div className="bulk-review-toolbar">
        <div className="bulk-select-actions">
          <button type="button" className="secondary-button compact" onClick={() => setSelected(new Set(eligible.slice(0, 50).map((item) => item.member.id)))}>{importBatch && scope === 'batch' ? (isUiEnglish ? 'Select current batch' : '全选当前批次') : (isUiEnglish ? 'Select filtered results' : '全选当前筛选结果')}</button>
          <button type="button" className="ghost-button compact" onClick={() => setSelected(new Set())}>{isUiEnglish ? 'Clear' : '清空选择'}</button>
        </div>
        <strong>{selectedRows.length} {isUiEnglish ? 'pages selected' : '个页面已选择'}</strong>
      </div>
      <div className="bulk-duplicate-list bulk-editorial-list">
        {candidates.length === 0 ? (
          <p className="bulk-duplicate-empty">{isUiEnglish ? 'No pages are eligible for this bulk action.' : '当前没有可执行此批量动作的页面。'}</p>
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

      <div className="bulk-duplicate-footer">
        <span>{selectedBaseCount ? (isUiEnglish ? `${selectedBaseCount} required Base templates will move in the same atomic review action.` : `会在同一次原子操作中同步处理 ${selectedBaseCount} 个必要的基础模板。`) : (isUiEnglish ? 'Only the selected page review states will change.' : '只修改所选页面的审核状态。')}</span>
        <button type="button" className="primary-button" disabled={saving || !selectedRows.length} onClick={submit}>{saving ? (isUiEnglish ? 'Saving…' : '正在保存…') : `${actionLabel} ${selectedRows.length}`}</button>
      </div>
    </section>
  );
}
