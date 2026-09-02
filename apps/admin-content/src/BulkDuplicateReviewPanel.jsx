import { useEffect, useMemo, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { useAppLanguage } from './AppLanguage.jsx';
import { emitAdminNotice } from './AdminNoticeViewport.jsx';

function buildPendingDuplicateSets(groups, reviewRows) {
  const rows = [];
  for (const group of groups || []) {
    for (const set of group.duplicate_sets || []) {
      const review = reviewRows?.[set.duplicate_set_key];
      if (['duplicate_records', 'distinct_records'].includes(review?.decision)) continue;
      const members = (set.member_ids || []).map((id) => group.members?.find((item) => item.catalog_key === id)).filter(Boolean);
      const sourcePrimary = members.find((member) => !member.duplicate_of_catalog_key && members.some((peer) => peer.duplicate_of_catalog_key === member.catalog_key)) || null;
      rows.push({
        issueKey: set.duplicate_set_key,
        groupKey: group.group_key,
        groupName: group.base_scientific_name,
        set,
        members,
        recommendedCanonicalKey: sourcePrimary?.catalog_key || set.member_ids?.[0] || '',
        hasSourcePrimary: Boolean(sourcePrimary),
      });
    }
  }
  return rows;
}

export default function BulkDuplicateReviewPanel({ groups = [], reviewRows = {}, schemaReady = false, readOnly = false, onCompleted }) {
  const { appLocale } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const pending = useMemo(() => buildPendingDuplicateSets(groups, reviewRows), [groups, reviewRows]);
  const [selected, setSelected] = useState(() => new Set());
  const [decision, setDecision] = useState('duplicate_records');
  const [canonicalByIssue, setCanonicalByIssue] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCanonicalByIssue((current) => Object.fromEntries(pending.map((item) => [item.issueKey, current[item.issueKey] || item.recommendedCanonicalKey])));
    setSelected((current) => new Set([...current].filter((key) => pending.some((item) => item.issueKey === key))));
  }, [pending]);

  const selectedRows = pending.filter((item) => selected.has(item.issueKey));
  const toggle = (issueKey) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(issueKey)) next.delete(issueKey); else next.add(issueKey);
    return next;
  });

  const submit = async () => {
    if (readOnly) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Read-only Review' : '当前是只读 Review', detail: isUiEnglish ? 'Bulk duplicate decisions were not written.' : '不会写入批量重复审核结论。' }); return; }
    if (!schemaReady) { emitAdminNotice({ status: 'error', title: isUiEnglish ? 'Bulk review blocked' : '批量审核被阻止', detail: isUiEnglish ? 'Data Review storage is not ready.' : 'Data Review 存储尚未就绪。' }); return; }
    if (!selectedRows.length) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Select duplicate groups first' : '请先选择重复候选', detail: isUiEnglish ? 'Choose at least one duplicate group to review.' : '至少勾选 1 组重复候选后再批量处理。' }); return; }
    const invalid = decision === 'duplicate_records' ? selectedRows.find((item) => !canonicalByIssue[item.issueKey] || !item.set.member_ids.includes(canonicalByIssue[item.issueKey])) : null;
    if (invalid) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Choose a page to keep' : '请选择保留页面', detail: `${invalid.groupName} · ${invalid.set.name}` }); return; }
    setSaving(true);
    const reviews = selectedRows.map((item) => ({
      p_issue_key: item.issueKey,
      p_group_key: item.groupKey,
      p_decision: decision,
      p_canonical_catalog_key: decision === 'duplicate_records' ? canonicalByIssue[item.issueKey] : '',
      p_member_ids: item.set.member_ids || [],
      p_notes: isUiEnglish ? 'Bulk duplicate review' : '批量重复审核',
    }));
    const { data, error } = await adminContentClient.rpc('resolve_species_duplicate_reviews_bulk', { p_reviews: reviews }, {
      kind: 'duplicate_review_bulk',
      title: decision === 'duplicate_records' ? `批量确认 ${reviews.length} 组重复记录` : `批量确认 ${reviews.length} 组非重复记录`,
      detail: decision === 'duplicate_records' ? '已同步 Index / Canonical 策略' : '已恢复为独立页面候选',
      metadata: { count: reviews.length, decision },
    });
    setSaving(false);
    if (error) return;
    setSelected(new Set());
    onCompleted?.(data);
  };

  return (
    <section className="bulk-duplicate-panel">
      <div className="bulk-duplicate-head">
        <div><p className="eyebrow">BULK DATA REVIEW</p><h2>{isUiEnglish ? 'Bulk duplicate review' : '批量审核重复记录'}</h2><p>{isUiEnglish ? 'Select multiple duplicate candidates, choose one conclusion, verify the page to keep, then save them as one atomic operation.' : '一次选择多组重复候选，统一选择人工结论，确认每组保留页面后，一次性原子保存。任何一组失败，整批都不会写入。'}</p></div>
        <span className="bulk-duplicate-count">{pending.length} {isUiEnglish ? 'pending' : '组待审核'}</span>
      </div>

      <div className="bulk-review-toolbar">
        <div className="bulk-select-actions">
          <button type="button" className="secondary-button compact" onClick={() => setSelected(new Set(pending.map((item) => item.issueKey)))}>{isUiEnglish ? 'Select all pending' : '全选待审核'}</button>
          <button type="button" className="ghost-button compact" onClick={() => setSelected(new Set())}>{isUiEnglish ? 'Clear' : '清空选择'}</button>
        </div>
        <strong>{selectedRows.length} {isUiEnglish ? 'selected' : '组已选择'}</strong>
      </div>

      <div className="bulk-review-decision" role="radiogroup" aria-label={isUiEnglish ? 'Bulk duplicate decision' : '批量审核结论'}>
        <button type="button" className={decision === 'duplicate_records' ? 'active' : ''} onClick={() => setDecision('duplicate_records')}><strong>{isUiEnglish ? 'Confirm duplicates' : '确认是重复记录'}</strong><small>{isUiEnglish ? 'Keep one SEO page per group; canonicalize the rest' : '每组保留 1 个 SEO 页面，其余自动 Canonical'}</small></button>
        <button type="button" className={decision === 'distinct_records' ? 'active' : ''} onClick={() => setDecision('distinct_records')}><strong>{isUiEnglish ? 'Confirm distinct' : '确认不是重复'}</strong><small>{isUiEnglish ? 'Keep every record as an independent SEO candidate' : '每条记录继续作为独立 SEO 页面候选'}</small></button>
      </div>

      <div className="bulk-duplicate-list">
        {pending.length === 0 ? <p className="bulk-duplicate-empty">{isUiEnglish ? 'No duplicate candidates are waiting for review.' : '当前没有待审核的重复候选。'}</p> : pending.map((item) => {
          const checked = selected.has(item.issueKey);
          return (
            <article className={`bulk-duplicate-row ${checked ? 'selected' : ''}`} key={item.issueKey}>
              <label className="bulk-duplicate-select"><input type="checkbox" checked={checked} onChange={() => toggle(item.issueKey)} /><span><strong>{item.set.name || item.groupName}</strong><small>{item.groupName} · {item.set.member_ids.length} {isUiEnglish ? 'records' : '条记录'}</small></span></label>
              <div className="bulk-duplicate-members">
                {item.members.map((member) => <span key={member.catalog_key}>{member.name} · {member.catalog_key}</span>)}
              </div>
              {checked && decision === 'duplicate_records' ? (
                <div className="bulk-canonical-choice">
                  <small>{isUiEnglish ? 'Keep this SEO page' : '保留这个 SEO 页面'}{item.hasSourcePrimary ? (isUiEnglish ? ' · source primary recommended' : ' · 已按源数据主记录推荐') : ''}</small>
                  <div>{item.members.map((member) => <button type="button" key={member.catalog_key} className={canonicalByIssue[item.issueKey] === member.catalog_key ? 'active' : ''} onClick={() => setCanonicalByIssue((current) => ({ ...current, [item.issueKey]: member.catalog_key }))}>{member.catalog_key}</button>)}</div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="bulk-duplicate-footer"><span>{isUiEnglish ? 'Product Truth records are never deleted or rewritten by this action.' : '该操作只处理 SEO 资格和 Canonical，不删除、改写 Product Truth。'}</span><button type="button" className="primary-button" disabled={saving} onClick={submit}>{saving ? (isUiEnglish ? 'Saving…' : '正在保存…') : (isUiEnglish ? `Confirm ${selectedRows.length} groups` : `确认处理 ${selectedRows.length} 组`)}</button></div>
    </section>
  );
}
