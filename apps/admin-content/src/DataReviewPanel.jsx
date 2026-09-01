import { useAppLanguage } from './AppLanguage.jsx';
import { useEffect, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { categoryIssueKey, summarizeDataReviewIssues } from './publishReadiness.js';

function ReviewDecision({ issueKey, issueType, group, set, row, schemaReady, readOnly, onSaved, onResolved, onSeoPolicyAligned }) {
  const { appLocale, t } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const [decision, setDecision] = useState(row?.decision || '');
  const [canonicalKey, setCanonicalKey] = useState(row?.canonical_catalog_key || '');
  const [notes, setNotes] = useState(row?.notes || '');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDecision(row?.decision || '');
    setCanonicalKey(row?.canonical_catalog_key || '');
    setNotes(row?.notes || '');
    setMessage('');
  }, [issueKey, row]);

  const duplicateMembers = issueType === 'duplicate_set'
    ? (set?.member_ids || []).map((id) => group.members?.find((item) => item.catalog_key === id)).filter(Boolean)
    : [];
  const sourcePrimary = duplicateMembers.find((member) => !member.duplicate_of_catalog_key && duplicateMembers.some((peer) => peer.duplicate_of_catalog_key === member.catalog_key)) || null;
  const recommendedCanonicalKey = sourcePrimary?.catalog_key || set?.member_ids?.[0] || '';
  const matchingFields = issueType === 'duplicate_set'
    ? [
      ['name', isUiEnglish ? 'name' : '名称'],
      ['scientific_name', isUiEnglish ? 'scientific name' : '学名'],
      ['variant_label', isUiEnglish ? 'variant' : '变体'],
      ['category', isUiEnglish ? 'category' : '分类'],
    ].filter(([field]) => { const values = duplicateMembers.map((member) => String(member?.[field] || '')); return values.some(Boolean) && new Set(values).size <= 1; }).map(([, label]) => label)
    : [];

  const save = async () => {
    if (readOnly) return setMessage(isUiEnglish ? 'Read-only Review does not write data.' : '只读 Review 不写数据。');
    if (!schemaReady) return setMessage(isUiEnglish ? 'Data Review schema is not ready.' : 'Data Review schema 尚未应用。');
    if (!decision) return setMessage(isUiEnglish ? 'Choose a review conclusion first.' : '请先选择人工结论。');
    if (decision === 'duplicate_records' && !canonicalKey) return setMessage(isUiEnglish ? 'Choose the SEO page to keep.' : '确认重复时必须选择保留的 SEO 主页面。');
    setSaving(true); setMessage('');

    if (issueType === 'duplicate_set') {
      const activity = {
        kind: 'duplicate_review',
        title: decision === 'duplicate_records' ? '重复记录已确认并处理' : '已确认两条记录不是重复',
        detail: `${group.base_scientific_name} · ${set?.name || issueKey}`,
        metadata: { issue_key: issueKey, decision, canonical_catalog_key: decision === 'duplicate_records' ? canonicalKey : '' },
      };
      const { data: resolution, error } = await adminContentClient.rpc('resolve_species_duplicate_review', {
        p_issue_key: issueKey,
        p_group_key: group.group_key,
        p_decision: decision,
        p_canonical_catalog_key: decision === 'duplicate_records' ? canonicalKey : '',
        p_member_ids: set?.member_ids || [],
        p_notes: notes.trim(),
      }, activity);
      setSaving(false);
      if (error) return setMessage(error.message || (isUiEnglish ? 'Save failed.' : '保存失败。'));
      const savedReview = resolution?.review;
      const alignedRows = resolution?.seo_rows || [];
      setMessage(decision === 'duplicate_records'
        ? (isUiEnglish ? 'Resolved in one operation. Canonical/index policy was synchronized automatically.' : '已一次性处理完成，并自动同步 SEO 主页面与 Canonical 策略。')
        : (isUiEnglish ? 'Conclusion saved. Product Truth was not modified.' : '人工结论已记录；Product Truth 未被修改。'));
      if (savedReview) onSaved?.(savedReview);
      if (alignedRows.length) onSeoPolicyAligned?.(alignedRows);
      if (savedReview) onResolved?.(savedReview);
      return;
    }

    const payload = {
      issue_key: issueKey, issue_type: issueType, group_key: group.group_key, decision,
      canonical_catalog_key: '', notes: notes.trim(),
    };
    const { data, error } = await adminContentClient.from('species_data_reviews')
      .upsert(payload, { onConflict: 'issue_key' })
      .activity({
        kind: 'data_review', title: '源数据复核已记录', detail: `${group.base_scientific_name} · ${issueKey}`,
        metadata: { issue_key: issueKey, decision },
      })
      .select('*').single();
    setSaving(false);
    if (error) return setMessage(error.message || (isUiEnglish ? 'Save failed.' : '保存失败。'));
    setMessage(isUiEnglish ? 'Conclusion saved. Product Truth was not modified.' : '人工结论已记录；Product Truth 未被修改。');
    onSaved?.(data);
    onResolved?.(data);
  };
  return (
    <div className="review-decision-box">
      {issueType === 'duplicate_set' ? (
        <div className="duplicate-evidence-summary">
          <div><strong>{isUiEnglish ? 'System comparison' : '系统比对'}</strong><span>{matchingFields.length ? (isUiEnglish ? `${matchingFields.join(', ')} match` : `${matchingFields.join('、')}一致`) : (isUiEnglish ? 'Review source fields manually' : '需要人工核对源字段')}</span></div>
          {sourcePrimary ? <div><strong>{isUiEnglish ? 'Source lineage' : '源记录关系'}</strong><span>{isUiEnglish ? `${sourcePrimary.catalog_key} is marked as the primary source record; duplicate rows point to it.` : `${sourcePrimary.catalog_key} 是当前源数据主记录；其他重复行已指向它。`}</span></div> : null}
          <p>{isUiEnglish ? 'Recommendation: if there is no external evidence that these are different variants, confirm the duplicate and keep the primary source record. Product Truth rows are not deleted.' : '建议：如果没有额外业务证据证明它们是不同品种，确认重复并保留源数据主记录。这里只合并 SEO 页面，不删除 Product Truth。'}</p>
        </div>
      ) : null}
      <div className="review-decision-options" aria-label={isUiEnglish ? 'Review decision' : '人工结论'}>
        {issueType === 'category_conflict' ? <>
          <button type="button" className={`review-choice ${decision === 'accepted_as_is' ? 'active' : ''}`} onClick={() => setDecision('accepted_as_is')}>
            <strong>{isUiEnglish ? 'Keep current categories' : '分类没有问题'}</strong><small>{isUiEnglish ? 'Continue SEO with current source categories' : '保持源数据分类，继续 SEO'}</small>
          </button>
          <button type="button" className={`review-choice ${decision === 'source_correction_required' ? 'active' : ''}`} onClick={() => setDecision('source_correction_required')}>
            <strong>{isUiEnglish ? 'Source data needs correction' : '源数据需要修正'}</strong><small>{isUiEnglish ? 'Keep SEO blocked until corrected' : '修正前继续阻止 SEO 发布'}</small>
          </button>
        </> : <>
          <button type="button" className={`review-choice ${decision === 'duplicate_records' ? 'active' : ''}`} onClick={() => { setDecision('duplicate_records'); if (!canonicalKey && recommendedCanonicalKey) setCanonicalKey(recommendedCanonicalKey); }}>
            <strong>{isUiEnglish ? 'Confirm duplicate' : '确认是重复记录'}</strong><small>{isUiEnglish ? 'Keep one SEO page and canonicalize the rest' : '保留 1 个 SEO 页面，其余自动 Canonical'}</small>
          </button>
          <button type="button" className={`review-choice ${decision === 'distinct_records' ? 'active' : ''}`} onClick={() => { setDecision('distinct_records'); setCanonicalKey(''); }}>
            <strong>{isUiEnglish ? 'Keep as distinct records' : '确认不是重复'}</strong><small>{isUiEnglish ? 'Keep both SEO pages independent' : '两个 SEO 页面分别保留'}</small>
          </button>
        </>}
      </div>
      {decision === 'duplicate_records' ? (
        <div className="canonical-choice-block">
          <strong>{isUiEnglish ? 'Which page should remain?' : '保留哪个 SEO 页面？'}</strong>
          <div className="canonical-choice-list">
            {(set?.member_ids || []).map((id) => {
              const member = group.members?.find((item) => item.catalog_key === id);
              const relation = sourcePrimary?.catalog_key === id
                ? (isUiEnglish ? 'recommended primary' : '推荐保留 · 源数据主记录')
                : member?.duplicate_of_catalog_key
                  ? (isUiEnglish ? `duplicate of ${member.duplicate_of_catalog_key}` : `源数据重复于 ${member.duplicate_of_catalog_key}`)
                  : '';
              return <label className={`canonical-choice ${canonicalKey === id ? 'active' : ''}`} key={id}><input type="radio" name={`canonical-${issueKey}`} value={id} checked={canonicalKey === id} onChange={() => setCanonicalKey(id)} /><span><b>{member?.name || set?.name || id}</b><small>{id}{relation ? ` · ${relation}` : ''}</small></span></label>;
            })}
          </div>
        </div>
      ) : null}
      {decision ? <div className="review-outcome-note">{decision === 'duplicate_records'
        ? (isUiEnglish ? 'After saving: one SEO page remains independent; duplicate rows point to it with Canonical. This is one atomic operation.' : '保存后：只保留一个独立 SEO 页面，其他重复记录自动指向它的 Canonical；整套处理作为一次操作完成。')
        : (isUiEnglish ? 'After saving: both records remain eligible to become separate SEO pages. Existing Product Truth is unchanged.' : '保存后：两条记录继续作为独立 SEO 页面候选；Product Truth 不做修改。')}</div> : null}
      <label>{isUiEnglish ? 'Review notes' : '审核备注'}
        <textarea rows="2" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={isUiEnglish ? 'Record the evidence for this decision; Product Truth is not rewritten.' : '记录判断依据；不改写 Product Truth。'} />
      </label>
      <div className="review-decision-footer">
        <span>{row?.reviewed_at ? `已记录 · ${new Date(row.reviewed_at).toLocaleString()}` : '尚未记录人工结论'}{message ? ` · ${message}` : ''}</span>
        <button type="button" className="secondary-button compact" onClick={save} disabled={saving || readOnly}>{saving ? t('common.saving') : (isUiEnglish ? 'Confirm & save' : '确认并保存')}</button>
      </div>
    </div>
  );
}

export default function DataReviewPanel({ group, reviewRows = {}, schemaReady = false, readOnly = false, onSaved, onResolved, onSeoPolicyAligned }) {
  const { appLocale } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  if (!group || (!group.category_conflict && !group.duplicate_count)) return null;
  const categoryMembers = group.category_conflict
    ? group.categories.map((category) => ({ category, members: group.members.filter((member) => member.category === category) }))
    : [];
  const issueSummary = summarizeDataReviewIssues(group, reviewRows);
  return (
    <section className="data-review-panel">
      <div className="data-review-header">
        <div>
          <p className="eyebrow">DATA REVIEW WORKFLOW</p>
          <h2>{isUiEnglish ? 'Source data review' : '源数据复核'}</h2>
          <p>{isUiEnglish ? `${group.base_scientific_name} requires a human decision. Review affects SEO eligibility only and never rewrites Product Truth.` : `${group.base_scientific_name} 的问题需要人工结论；结论只影响 SEO 发布资格，不改 Product Truth。`}</p>
        </div>
        <span className={`review-count ${issueSummary.open === 0 ? 'resolved' : ''}`}>{issueSummary.open > 0 ? `${issueSummary.open} ${isUiEnglish ? 'open' : '项待处理'}` : (isUiEnglish ? 'Resolved' : '已处理')}</span>
      </div>
      {group.category_conflict ? (
        <div className="review-issue-card">
          <div className="review-issue-title"><strong>{isUiEnglish ? 'Category conflict' : '分类冲突'}</strong><span>{group.categories.join(' ↔ ')}</span></div>
          <p>{isUiEnglish ? 'The same Base Species appears in multiple product categories. A human decision is required before SEO eligibility can continue.' : '同一 Base Species 位于多个产品分类。只有人工确认“分类差异为预期”才能解除 SEO 阻止。'}</p>
          <div className="review-evidence-grid">
            {categoryMembers.map((item) => <div key={item.category}><b>{item.category}</b>{item.members.map((member) => <small key={member.catalog_key}>{member.name} · {member.catalog_key}</small>)}</div>)}
          </div>
          <ReviewDecision issueKey={categoryIssueKey(group)} issueType="category_conflict" group={group}
            row={reviewRows[categoryIssueKey(group)]} schemaReady={schemaReady} readOnly={readOnly} onSaved={onSaved} onResolved={onResolved} onSeoPolicyAligned={onSeoPolicyAligned} />
        </div>
      ) : null}
      {group.duplicate_sets?.map((set) => (
        <div className="review-issue-card" key={set.duplicate_set_key}>
          <div className="review-issue-title"><strong>{isUiEnglish ? 'Possible duplicate pages' : '疑似重复页面'}</strong><span>{set.member_ids.length} {isUiEnglish ? 'source records' : '条源记录'}</span></div>
          <p><b>{set.name}</b> · <i>{set.scientific_name}</i></p>
          <div className="duplicate-key-list">{set.member_ids.map((id) => { const member = group.members?.find((item) => item.catalog_key === id); return <code key={id}>{member?.name || set.name} · {id}</code>; })}</div>
          <ReviewDecision issueKey={set.duplicate_set_key} issueType="duplicate_set" group={group} set={set}
            row={reviewRows[set.duplicate_set_key]} schemaReady={schemaReady} readOnly={readOnly} onSaved={onSaved} onResolved={onResolved} onSeoPolicyAligned={onSeoPolicyAligned} />
        </div>
      ))}
    </section>
  );
}
