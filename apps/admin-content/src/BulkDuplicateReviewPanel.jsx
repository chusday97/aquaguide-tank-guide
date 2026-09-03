import { useEffect, useMemo, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { useAppLanguage } from './AppLanguage.jsx';
import { emitAdminNotice } from './AdminNoticeViewport.jsx';
import PublicSpeciesPreview from './PublicSpeciesPreview.jsx';
import { resolveEffectiveSeo } from './seoInheritance.js';
import { buildSpeciesSeoRouteMeta } from './seoRouteContract.js';
import { groupSeoRowKey, seoRowKey } from './localization.js';
import { loadProductTruthCatalog } from './productTruthLoader.js';

const SEO_CONTENT_FIELDS = {
  'zh-CN': ['seo_title', 'meta_description', 'h1', 'intro', 'image_alt', 'focus_keyword'],
  en: ['localized_name', 'seo_title', 'meta_description', 'h1', 'intro', 'image_alt', 'focus_keyword'],
};

function completeness(row, locale) {
  if (!row) return 0;
  const fields = SEO_CONTENT_FIELDS[locale] || SEO_CONTENT_FIELDS['zh-CN'];
  const filled = fields.filter((field) => String(row?.[field] ?? '').trim()).length;
  return Math.round((filled / fields.length) * 100);
}

function formatEditedAt(value, isUiEnglish) {
  if (!value) return isUiEnglish ? 'Not edited' : '尚未编辑';
  try {
    return new Intl.DateTimeFormat(isUiEnglish ? 'en-US' : 'zh-CN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

function statusLabel(row, isUiEnglish) {
  if (!row) return isUiEnglish ? 'No Draft' : '无 Draft';
  if (row.review_state === 'approved') return isUiEnglish ? 'Approved' : '已批准';
  if (row.review_state === 'ready_for_review') return isUiEnglish ? 'Awaiting review' : '待审核';
  return isUiEnglish ? 'Editing' : '编辑中';
}

function candidateSignals(member, seoRows) {
  const zh = seoRows?.[seoRowKey(member.catalog_key, 'zh-CN')] || null;
  const en = seoRows?.[seoRowKey(member.catalog_key, 'en')] || null;
  const rows = [zh, en].filter(Boolean);
  const approvedCount = rows.filter((row) => row.review_state === 'approved').length;
  const averageCompleteness = Math.round((completeness(zh, 'zh-CN') + completeness(en, 'en')) / 2);
  const latestEditedAt = rows
    .map((row) => row.updated_at)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null;
  return { zh, en, approvedCount, averageCompleteness, latestEditedAt };
}

function buildRecommendation(members, seoRows) {
  const evaluated = members.map((member) => {
    const signals = candidateSignals(member, seoRows);
    const sourcePrimary = !member.duplicate_of_catalog_key
      && members.some((peer) => peer.duplicate_of_catalog_key === member.catalog_key);
    const score = (sourcePrimary ? 10000 : 0)
      + (signals.approvedCount * 1000)
      + signals.averageCompleteness
      + (signals.latestEditedAt ? 1 : 0);
    return { member, signals, sourcePrimary, score };
  }).sort((a, b) => b.score - a.score);
  const recommended = evaluated[0] || null;
  if (!recommended) return { key: '', hasSourcePrimary: false, reasons: [] };
  const reasons = [];
  if (recommended.sourcePrimary) reasons.push('source_primary');
  const maxApproved = Math.max(...evaluated.map((item) => item.signals.approvedCount), 0);
  if (recommended.signals.approvedCount > 0 && recommended.signals.approvedCount === maxApproved) reasons.push('approved');
  const maxCompleteness = Math.max(...evaluated.map((item) => item.signals.averageCompleteness), 0);
  if (recommended.signals.averageCompleteness > 0 && recommended.signals.averageCompleteness === maxCompleteness) reasons.push('completeness');
  const latest = evaluated.map((item) => item.signals.latestEditedAt).filter(Boolean).sort((a, b) => new Date(b) - new Date(a))[0];
  if (latest && recommended.signals.latestEditedAt === latest) reasons.push('recent_edit');
  return { key: recommended.member.catalog_key, hasSourcePrimary: recommended.sourcePrimary, reasons };
}

function buildPendingDuplicateSets(groups, catalogByKey, reviewRows, seoRows) {
  const rows = [];
  for (const group of groups || []) {
    for (const set of group.duplicate_sets || []) {
      const review = reviewRows?.[set.duplicate_set_key];
      if (['duplicate_records', 'distinct_records'].includes(review?.decision)) continue;
      const members = (set.member_ids || []).map((id) => {
        const relationMember = group.members?.find((item) => item.catalog_key === id);
        const catalogMember = catalogByKey.get(id);
        return relationMember ? { ...(catalogMember || {}), ...relationMember } : null;
      }).filter(Boolean);
      const recommendation = buildRecommendation(members, seoRows);
      rows.push({
        issueKey: set.duplicate_set_key,
        groupKey: group.group_key,
        groupName: group.base_scientific_name,
        group,
        set,
        members,
        recommendedCanonicalKey: recommendation.key || set.member_ids?.[0] || '',
        hasSourcePrimary: recommendation.hasSourcePrimary,
        recommendationReasons: recommendation.reasons,
      });
    }
  }
  return rows;
}

function RecommendationReasons({ reasons, isUiEnglish }) {
  const labels = {
    source_primary: isUiEnglish ? 'Source relationship marks this as the primary record' : '源数据关系将其标记为主记录',
    approved: isUiEnglish ? 'More reviewed SEO content is already approved' : '已有更多 SEO 内容完成审核',
    completeness: isUiEnglish ? 'SEO content is more complete' : 'SEO 内容完整度更高',
    recent_edit: isUiEnglish ? 'More recent SEO editing activity (weak signal)' : '近期有 SEO 编辑记录（弱证据）',
  };
  return <ul>{reasons.map((reason) => <li key={reason}>{labels[reason]}</li>)}</ul>;
}

export default function BulkDuplicateReviewPanel({
  groups = [], reviewRows = {}, seoRows = {}, groupSeoRows = {}, locale = 'zh-CN',
  schemaReady = false, readOnly = false, onCompleted,
}) {
  const { appLocale } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const [catalogByKey, setCatalogByKey] = useState(() => new Map());
  useEffect(() => {
    let cancelled = false;
    loadProductTruthCatalog().then((catalog) => { if (!cancelled) setCatalogByKey(catalog); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const pending = useMemo(
    () => buildPendingDuplicateSets(groups, catalogByKey, reviewRows, seoRows),
    [groups, catalogByKey, reviewRows, seoRows],
  );
  const [selected, setSelected] = useState(() => new Set());
  const [decision, setDecision] = useState('duplicate_records');
  const [canonicalByIssue, setCanonicalByIssue] = useState({});
  const [saving, setSaving] = useState(false);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [previewLocale, setPreviewLocale] = useState(locale);

  useEffect(() => {
    setCanonicalByIssue((current) => Object.fromEntries(pending.map((item) => [item.issueKey, current[item.issueKey] || item.recommendedCanonicalKey])));
    setSelected((current) => new Set([...current].filter((key) => pending.some((item) => item.issueKey === key))));
  }, [pending]);
  useEffect(() => setPreviewLocale(locale), [locale]);

  const selectedRows = pending.filter((item) => selected.has(item.issueKey));
  const toggle = (issueKey) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(issueKey)) next.delete(issueKey); else next.add(issueKey);
    return next;
  });

  const deferIssue = (issueKey) => {
    setSelected((current) => {
      const next = new Set(current);
      next.delete(issueKey);
      return next;
    });
    emitAdminNotice({
      status: 'info',
      title: isUiEnglish ? 'Left for later' : '已暂不处理',
      detail: isUiEnglish ? 'No decision was written. This candidate stays in the pending queue.' : '不会写入任何结论，该重复候选会继续留在待审核队列。',
    });
  };

  const submit = async () => {
    if (readOnly) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Read-only demo' : '当前是只读演示', detail: isUiEnglish ? 'Bulk duplicate decisions were not written.' : '不会写入批量重复审核结论。' }); return; }
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

  const previewContext = useMemo(() => {
    if (!previewTarget) return null;
    const item = pending.find((row) => row.issueKey === previewTarget.issueKey);
    const member = item?.members.find((row) => row.catalog_key === previewTarget.catalogKey);
    if (!item || !member) return null;
    const variantRow = seoRows[seoRowKey(member.catalog_key, previewLocale)] || null;
    const groupRow = groupSeoRows[groupSeoRowKey(item.groupKey, previewLocale)] || null;
    const effective = resolveEffectiveSeo({ member, group: item.group, groupRow, variantRow, locale: previewLocale }).effective;
    const routeMeta = buildSpeciesSeoRouteMeta({
      member,
      group: item.group,
      locale: previewLocale,
      indexStrategy: variantRow?.index_strategy || 'noindex',
      canonicalCatalogKey: variantRow?.canonical_catalog_key || '',
    });
    return { item, member, variantRow, effective, routeMeta };
  }, [previewTarget, previewLocale, pending, seoRows, groupSeoRows]);

  return (
    <section className="bulk-duplicate-panel">
      <div className="bulk-duplicate-head">
        <div><p className="eyebrow">BULK DATA REVIEW</p><h2>{isUiEnglish ? 'Bulk duplicate review' : '批量审核重复记录'}</h2><p>{isUiEnglish ? 'Compare identity, source facts, editorial status and Preview before choosing the SEO page to keep. IDs are secondary evidence, not the decision itself.' : '先对比身份、源数据、SEO 编辑状态和真实 Preview，再决定保留哪个页面。编号只作为辅助身份，不再作为主要判断依据。'}</p></div>
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
          const recommendedKey = item.recommendedCanonicalKey;
          return (
            <article className={`bulk-duplicate-row decision-card ${checked ? 'selected' : ''}`} key={item.issueKey}>
              <div className="duplicate-decision-card-head">
                <label className="bulk-duplicate-select"><input type="checkbox" checked={checked} onChange={() => toggle(item.issueKey)} /><span><strong>{item.set.name || item.groupName}</strong><small>{item.set.scientific_name || item.groupName} · {item.set.member_ids.length} {isUiEnglish ? 'records' : '条记录'}</small></span></label>
                <button type="button" className="ghost-button compact" onClick={() => deferIssue(item.issueKey)}>{isUiEnglish ? 'Later' : '暂不处理'}</button>
              </div>

              <div className="duplicate-recommendation">
                <span>{isUiEnglish ? 'Suggested page to keep' : '系统建议保留'}</span>
                <strong>{item.members.find((member) => member.catalog_key === recommendedKey)?.name || recommendedKey}</strong>
                <code>{recommendedKey}</code>
                <RecommendationReasons reasons={item.recommendationReasons} isUiEnglish={isUiEnglish} />
              </div>

              <div className="duplicate-candidate-grid">
                {item.members.map((member) => {
                  const signals = candidateSignals(member, seoRows);
                  const selectedAsCanonical = canonicalByIssue[item.issueKey] === member.catalog_key;
                  const sourcePrimary = !member.duplicate_of_catalog_key && item.members.some((peer) => peer.duplicate_of_catalog_key === member.catalog_key);
                  return (
                    <section className={`duplicate-candidate-card ${selectedAsCanonical && checked && decision === 'duplicate_records' ? 'keep-selected' : ''}`} key={member.catalog_key}>
                      <div className="duplicate-candidate-identity">
                        <div className="duplicate-candidate-image">
                          {member.image ? <img src={member.image} alt="" /> : <span>{member.name?.slice(0, 1) || '?'}</span>}
                        </div>
                        <div><strong>{member.name}</strong><em>{member.scientific_name}</em><code>{member.catalog_key}</code></div>
                        {sourcePrimary ? <span className="duplicate-source-primary">{isUiEnglish ? 'Source primary' : '源主记录'}</span> : null}
                      </div>

                      <div className="duplicate-source-facts">
                        <div><span>{isUiEnglish ? 'Category' : '分类'}</span><strong>{member.category || '—'}</strong></div>
                        <div><span>{isUiEnglish ? 'Temperature' : '水温'}</span><strong>{member.water_temperature || '—'}</strong></div>
                        <div><span>pH</span><strong>{member.ph_level || '—'}</strong></div>
                        <div><span>{isUiEnglish ? 'Tank' : '缸体'}</span><strong>{member.tank_size || '—'}</strong></div>
                      </div>

                      {member.product_description ? <p className="duplicate-source-summary">{member.product_description}</p> : null}

                      <div className="duplicate-editorial-signals">
                        {[['zh-CN', signals.zh], ['en', signals.en]].map(([rowLocale, row]) => (
                          <div key={rowLocale}>
                            <b>{rowLocale === 'en' ? 'EN' : '中文'}</b>
                            <span>{completeness(row, rowLocale)}%</span>
                            <em>{statusLabel(row, isUiEnglish)}</em>
                          </div>
                        ))}
                      </div>
                      <div className="duplicate-last-edited"><span>{isUiEnglish ? 'SEO last edited' : 'SEO 最近编辑'}</span><strong>{formatEditedAt(signals.latestEditedAt, isUiEnglish)}</strong></div>

                      <div className="duplicate-candidate-actions">
                        <button type="button" className="secondary-button compact" onClick={() => { setPreviewLocale(locale); setPreviewTarget({ issueKey: item.issueKey, catalogKey: member.catalog_key }); }}>{isUiEnglish ? 'Preview page' : '查看 Preview'}</button>
                        {checked && decision === 'duplicate_records' ? (
                          <button type="button" className={`duplicate-keep-action ${selectedAsCanonical ? 'active' : ''}`} onClick={() => setCanonicalByIssue((current) => ({ ...current, [item.issueKey]: member.catalog_key }))}>{selectedAsCanonical ? (isUiEnglish ? '✓ Keep this page' : '✓ 保留此页面') : (isUiEnglish ? 'Keep this page' : '保留此页面')}</button>
                        ) : null}
                      </div>
                    </section>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      {previewContext ? (
        <aside className="duplicate-preview-sheet" aria-label={isUiEnglish ? 'Duplicate candidate preview' : '重复候选页面预览'}>
          <header>
            <div><span>{isUiEnglish ? 'Candidate preview' : '候选页面 Preview'}</span><strong>{previewContext.member.name} · {previewContext.member.catalog_key}</strong></div>
            <div className="duplicate-preview-actions">
              <button type="button" className={previewLocale === 'zh-CN' ? 'active' : ''} onClick={() => setPreviewLocale('zh-CN')}>中文</button>
              <button type="button" className={previewLocale === 'en' ? 'active' : ''} onClick={() => setPreviewLocale('en')}>EN</button>
              <button type="button" className="close" onClick={() => setPreviewTarget(null)} aria-label={isUiEnglish ? 'Close preview' : '关闭预览'}>×</button>
            </div>
          </header>
          <div className="duplicate-preview-meta"><span>{isUiEnglish ? 'SEO status' : 'SEO 状态'}: {statusLabel(previewContext.variantRow, isUiEnglish)}</span><span>{isUiEnglish ? 'Completeness' : '完整度'}: {completeness(previewContext.variantRow, previewLocale)}%</span><span>{isUiEnglish ? 'SEO last edited' : 'SEO 最近编辑'}: {formatEditedAt(previewContext.variantRow?.updated_at, isUiEnglish)}</span></div>
          <PublicSpeciesPreview species={previewContext.member} locale={previewLocale} effectiveSeo={previewContext.effective} routeMeta={previewContext.routeMeta} />
        </aside>
      ) : null}

      <div className="bulk-duplicate-footer"><span>{isUiEnglish ? 'Source records are never deleted or rewritten. “Later” writes nothing and keeps the candidate pending.' : '该操作只处理 SEO 资格和 Canonical，不删除、改写源数据；“暂不处理”不会写入任何结论。'}</span><button type="button" className="primary-button" disabled={saving} onClick={submit}>{saving ? (isUiEnglish ? 'Saving…' : '正在保存…') : (isUiEnglish ? `Confirm ${selectedRows.length} groups` : `确认处理 ${selectedRows.length} 组`)}</button></div>
    </section>
  );
}
