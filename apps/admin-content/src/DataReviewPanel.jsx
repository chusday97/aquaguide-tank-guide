import { useAppLanguage } from './AppLanguage.jsx';
import { useEffect, useState } from 'react';
import { supabase } from './supabase.js';
import { categoryIssueKey } from './publishReadiness.js';

function ReviewDecision({ issueKey, issueType, group, set, row, schemaReady, readOnly, onSaved }) {
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

  const save = async () => {
    if (readOnly) return setMessage('只读 Review 不写数据库。');
    if (!schemaReady) return setMessage('Data Review schema 尚未应用。');
    if (!decision) return setMessage('请先选择人工结论。');
    if (decision === 'duplicate_records' && !canonicalKey) return setMessage('确认重复时必须选择 canonical 记录。');
    setSaving(true); setMessage('');
    const payload = {
      issue_key: issueKey, issue_type: issueType, group_key: group.group_key, decision,
      canonical_catalog_key: decision === 'duplicate_records' ? canonicalKey : '', notes: notes.trim(),
    };
    const { data, error } = await supabase.from('species_data_reviews')
      .upsert(payload, { onConflict: 'issue_key' }).select('*').single();
    setSaving(false);
    if (error) return setMessage(error.message || '保存失败。');
    setMessage('人工结论已记录；Product Truth 未被修改。');
    onSaved?.(data);
  };
  return (
    <div className="review-decision-box">
      <label>{isUiEnglish ? 'Review decision' : '人工结论'}
        <select value={decision} onChange={(event) => setDecision(event.target.value)}>
          <option value="">{isUiEnglish ? 'Pending review' : '待复核'}</option>
          {issueType === 'category_conflict' ? <>
            <option value="accepted_as_is">{isUiEnglish ? 'Category difference is intentional; continue SEO' : '分类差异为预期，可继续 SEO'}</option>
            <option value="source_correction_required">{isUiEnglish ? 'Source data requires correction; keep blocked' : '源数据需要修正，继续阻止'}</option>
          </> : <>
            <option value="distinct_records">{isUiEnglish ? 'Confirmed distinct records' : '确认是不同记录'}</option>
            <option value="duplicate_records">{isUiEnglish ? 'Confirmed duplicates; choose canonical' : '确认重复，指定 canonical'}</option>
          </>}
        </select>
      </label>
      {decision === 'duplicate_records' ? (
        <label>Canonical record
          <select value={canonicalKey} onChange={(event) => setCanonicalKey(event.target.value)}>
            <option value="">{isUiEnglish ? 'Select' : '请选择'}</option>
            {(set?.member_ids || []).map((id) => <option value={id} key={id}>{id}</option>)}
          </select>
        </label>
      ) : null}
      <label>{isUiEnglish ? 'Review notes' : '审核备注'}
        <textarea rows="2" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={isUiEnglish ? 'Record the evidence for this decision; Product Truth is not rewritten.' : '记录判断依据；不改写 Product Truth。'} />
      </label>
      <div className="review-decision-footer">
        <span>{row?.reviewed_at ? `已记录 · ${new Date(row.reviewed_at).toLocaleString()}` : '尚未记录人工结论'}{message ? ` · ${message}` : ''}</span>
        <button type="button" className="secondary-button compact" onClick={save} disabled={saving || readOnly}>{saving ? t('common.saving') : (isUiEnglish ? 'Save review decision' : '保存复核结论')}</button>
      </div>
    </div>
  );
}

export default function DataReviewPanel({ group, reviewRows = {}, schemaReady = false, readOnly = false, onSaved }) {
  const { appLocale } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  if (!group || (!group.category_conflict && !group.duplicate_count)) return null;
  const categoryMembers = group.category_conflict
    ? group.categories.map((category) => ({ category, members: group.members.filter((member) => member.category === category) }))
    : [];
  return (
    <section className="data-review-panel">
      <div className="data-review-header">
        <div>
          <p className="eyebrow">DATA REVIEW WORKFLOW</p>
          <h2>{isUiEnglish ? 'Source data review' : '源数据复核'}</h2>
          <p>{isUiEnglish ? `${group.base_scientific_name} requires a human decision. Review affects SEO eligibility only and never rewrites Product Truth.` : `${group.base_scientific_name} 的问题需要人工结论；结论只影响 SEO 发布资格，不改 Product Truth。`}</p>
        </div>
        <span className="review-count">{Number(group.category_conflict) + (group.duplicate_sets?.length || 0)} {isUiEnglish ? 'issues' : '项'}</span>
      </div>
      {group.category_conflict ? (
        <div className="review-issue-card">
          <div className="review-issue-title"><strong>{isUiEnglish ? 'Category conflict' : '分类冲突'}</strong><span>{group.categories.join(' ↔ ')}</span></div>
          <p>{isUiEnglish ? 'The same Base Species appears in multiple product categories. A human decision is required before SEO eligibility can continue.' : '同一 Base Species 位于多个产品分类。只有人工确认“分类差异为预期”才能解除 SEO 阻止。'}</p>
          <div className="review-evidence-grid">
            {categoryMembers.map((item) => <div key={item.category}><b>{item.category}</b>{item.members.map((member) => <small key={member.catalog_key}>{member.name} · {member.catalog_key}</small>)}</div>)}
          </div>
          <ReviewDecision issueKey={categoryIssueKey(group)} issueType="category_conflict" group={group}
            row={reviewRows[categoryIssueKey(group)]} schemaReady={schemaReady} readOnly={readOnly} onSaved={onSaved} />
        </div>
      ) : null}
      {group.duplicate_sets?.map((set) => (
        <div className="review-issue-card" key={set.duplicate_set_key}>
          <div className="review-issue-title"><strong>{isUiEnglish ? 'Possible exact duplicate' : '疑似完全重复'}</strong><span>{set.member_ids.length} {isUiEnglish ? 'records' : '条记录'}</span></div>
          <p><b>{set.name}</b> · <i>{set.scientific_name}</i></p>
          <div className="duplicate-key-list">{set.member_ids.map((id) => <code key={id}>{id}</code>)}</div>
          <ReviewDecision issueKey={set.duplicate_set_key} issueType="duplicate_set" group={group} set={set}
            row={reviewRows[set.duplicate_set_key]} schemaReady={schemaReady} readOnly={readOnly} onSaved={onSaved} />
        </div>
      ))}
    </section>
  );
}
