import { useAppLanguage } from './AppLanguage.jsx';
import { useEffect, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { categoryIssueKey } from './publishReadiness.js';

function ReviewDecision({ issueKey, issueType, group, set, row, schemaReady, readOnly, onSaved, onSeoPolicyAligned }) {
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
    if (decision === 'duplicate_records' && !canonicalKey) return setMessage('确认重复时必须选择保留的 SEO 主页面。');
    setSaving(true); setMessage('');
    const payload = {
      issue_key: issueKey, issue_type: issueType, group_key: group.group_key, decision,
      canonical_catalog_key: decision === 'duplicate_records' ? canonicalKey : '', notes: notes.trim(),
    };
    const { data, error } = await adminContentClient.from('species_data_reviews')
      .upsert(payload, { onConflict: 'issue_key' }).select('*').single();
    if (error) {
      setSaving(false);
      return setMessage(error.message || '保存失败。');
    }
    const alignedRows = [];
    if (issueType === 'duplicate_set' && decision === 'duplicate_records') {
      const { data: canonicalRows, error: canonicalError } = await adminContentClient
        .from('species_seo')
        .update({ index_strategy: 'index', canonical_catalog_key: '' })
        .eq('catalog_key', canonicalKey)
        .select('*');
      if (canonicalError) {
        setSaving(false);
        setMessage(`复核已记录，但 SEO 主页面策略同步失败：${canonicalError.message}`);
        onSaved?.(data);
        return;
      }
      alignedRows.push(...(canonicalRows || []));
      for (const duplicateKey of (set?.member_ids || []).filter((id) => id !== canonicalKey)) {
        const { data: duplicateRows, error: duplicateError } = await adminContentClient
          .from('species_seo')
          .update({ index_strategy: 'canonical_to_sibling', canonical_catalog_key: canonicalKey })
          .eq('catalog_key', duplicateKey)
          .select('*');
        if (duplicateError) {
          setSaving(false);
          setMessage(`复核已记录，但重复页面策略同步失败：${duplicateError.message}`);
          onSaved?.(data);
          return;
        }
        alignedRows.push(...(duplicateRows || []));
      }
    }
    setSaving(false);
    setMessage(decision === 'duplicate_records' ? '复核已记录，并已自动同步 SEO 主页面策略。' : '人工结论已记录；Product Truth 未被修改。');
    onSaved?.(data);
    if (alignedRows.length) onSeoPolicyAligned?.(alignedRows);
  };
  return (
    <div className="review-decision-box">
      <div className="review-decision-options" aria-label={isUiEnglish ? 'Review decision' : '人工结论'}>
        {issueType === 'category_conflict' ? <>
          <button type="button" className={`review-choice ${decision === 'accepted_as_is' ? 'active' : ''}`} onClick={() => setDecision('accepted_as_is')}>
            <strong>{isUiEnglish ? 'Keep current categories' : '分类没有问题'}</strong><small>{isUiEnglish ? 'Continue SEO with current source categories' : '保持源数据分类，继续 SEO'}</small>
          </button>
          <button type="button" className={`review-choice ${decision === 'source_correction_required' ? 'active' : ''}`} onClick={() => setDecision('source_correction_required')}>
            <strong>{isUiEnglish ? 'Source data needs correction' : '源数据需要修正'}</strong><small>{isUiEnglish ? 'Keep SEO blocked until corrected' : '修正前继续阻止 SEO 发布'}</small>
          </button>
        </> : <>
          <button type="button" className={`review-choice ${decision === 'duplicate_records' ? 'active' : ''}`} onClick={() => { setDecision('duplicate_records'); if (!canonicalKey && set?.member_ids?.[0]) setCanonicalKey(set.member_ids[0]); }}>
            <strong>{isUiEnglish ? 'Same species / duplicate record' : '是同一个品种'}</strong><small>{isUiEnglish ? 'Keep one SEO page' : '只保留 1 个 SEO 页面'}</small>
          </button>
          <button type="button" className={`review-choice ${decision === 'distinct_records' ? 'active' : ''}`} onClick={() => { setDecision('distinct_records'); setCanonicalKey(''); }}>
            <strong>{isUiEnglish ? 'Different records' : '不是重复'}</strong><small>{isUiEnglish ? 'Keep both SEO pages' : '两个页面分别保留'}</small>
          </button>
        </>}
      </div>
      {decision === 'duplicate_records' ? (
        <div className="canonical-choice-block">
          <strong>{isUiEnglish ? 'Which page should remain?' : '保留哪个 SEO 页面？'}</strong>
          <div className="canonical-choice-list">
            {(set?.member_ids || []).map((id) => {
              const member = group.members?.find((item) => item.catalog_key === id);
              return <label className={`canonical-choice ${canonicalKey === id ? 'active' : ''}`} key={id}><input type="radio" name={`canonical-${issueKey}`} value={id} checked={canonicalKey === id} onChange={() => setCanonicalKey(id)} /><span><b>{member?.name || set?.name || id}</b><small>{id}</small></span></label>;
            })}
          </div>
        </div>
      ) : null}
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

export default function DataReviewPanel({ group, reviewRows = {}, schemaReady = false, readOnly = false, onSaved, onSeoPolicyAligned }) {
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
            row={reviewRows[categoryIssueKey(group)]} schemaReady={schemaReady} readOnly={readOnly} onSaved={onSaved} onSeoPolicyAligned={onSeoPolicyAligned} />
        </div>
      ) : null}
      {group.duplicate_sets?.map((set) => (
        <div className="review-issue-card" key={set.duplicate_set_key}>
          <div className="review-issue-title"><strong>{isUiEnglish ? 'Possible duplicate pages' : '疑似重复页面'}</strong><span>{set.member_ids.length} {isUiEnglish ? 'source records' : '条源记录'}</span></div>
          <p><b>{set.name}</b> · <i>{set.scientific_name}</i></p>
          <div className="duplicate-key-list">{set.member_ids.map((id) => { const member = group.members?.find((item) => item.catalog_key === id); return <code key={id}>{member?.name || set.name} · {id}</code>; })}</div>
          <ReviewDecision issueKey={set.duplicate_set_key} issueType="duplicate_set" group={group} set={set}
            row={reviewRows[set.duplicate_set_key]} schemaReady={schemaReady} readOnly={readOnly} onSaved={onSaved} onSeoPolicyAligned={onSeoPolicyAligned} />
        </div>
      ))}
    </section>
  );
}
