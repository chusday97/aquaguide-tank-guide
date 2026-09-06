import { useAppLanguage } from './AppLanguage.jsx';
import { useEffect, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { categoryIssueKey, summarizeDataReviewIssues } from './publishReadiness.js';
import { emitAdminNotice } from './AdminNoticeViewport.jsx';
import DuplicateCandidateComparison from './DuplicateCandidateComparison.jsx';
import { buildDuplicateRecommendation, mergeDuplicateMembers } from './duplicateReviewEvidence.js';
import { loadProductTruthCatalog } from './productTruthLoader.js';

function ReviewDecision({ issueKey, issueType, issueLabel = '', issueMeta = '', issueDescription = '', group, set, categoryMembers = [], row, catalogByKey, seoRows, groupSeoRows, locale, schemaReady, readOnly, onSaved, onResolved, onSeoPolicyAligned, onDefer }) {
  const { appLocale, t } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const [decision, setDecision] = useState(row?.decision || '');
  const [canonicalKey, setCanonicalKey] = useState(row?.canonical_catalog_key || '');
  const [notes, setNotes] = useState(row?.notes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDecision(row?.decision || '');
    setCanonicalKey(row?.canonical_catalog_key || '');
    setNotes(row?.notes || '');
  }, [issueKey, row]);

  const duplicateMembers = issueType === 'duplicate_set' ? mergeDuplicateMembers(group, set, catalogByKey) : [];
  const recommendation = issueType === 'duplicate_set' ? buildDuplicateRecommendation(duplicateMembers, seoRows) : { key: '' };
  const recommendedCanonicalKey = recommendation.key || set?.member_ids?.[0] || '';

  const save = async () => {
    if (readOnly) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Read-only demo' : '当前是只读演示', detail: isUiEnglish ? 'No data was written.' : '不会写入数据。' }); return; }
    if (!schemaReady) { emitAdminNotice({ status: 'error', title: isUiEnglish ? 'Save blocked' : '保存被阻止', detail: isUiEnglish ? 'Data Review schema is not ready.' : '数据复核存储尚未就绪。' }); return; }
    if (!decision) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Choose a conclusion' : '请先选择人工结论', detail: isUiEnglish ? 'Select whether the records are duplicates before saving.' : '先选择复核结论，再点击“确认并保存”。' }); return; }
    if (decision === 'duplicate_records' && !canonicalKey) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Choose the page to keep' : '请选择保留的 SEO 主页面', detail: isUiEnglish ? 'A canonical page is required when confirming duplicates.' : '确认重复记录时必须指定保留哪一个 SEO 页面。' }); return; }
    setSaving(true);

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
      if (error) return;
      const savedReview = resolution?.review;
      const alignedRows = resolution?.seo_rows || [];
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
    if (error) return;
    onSaved?.(data);
    onResolved?.(data);
  };
  const actionBlocked = !decision || (decision === 'duplicate_records' && !canonicalKey);
  const decisionLabel = !decision
    ? (isUiEnglish ? 'Not selected' : '未选择结论')
    : decision === 'duplicate_records'
      ? (isUiEnglish ? 'Duplicate confirmed' : '已选择：重复记录')
      : decision === 'distinct_records'
        ? (isUiEnglish ? 'Distinct records' : '已选择：不是重复')
        : decision === 'accepted_as_is'
          ? (isUiEnglish ? 'Keep current categories' : '已选择：分类没有问题')
          : (isUiEnglish ? 'Source correction needed' : '已选择：源数据需修正');
  const actionHint = !decision
    ? (isUiEnglish ? 'Choose one conclusion below. This is the only required decision before saving.' : '先选择一个人工结论；这是保存前唯一必须完成的决定。')
    : decision === 'duplicate_records' && !canonicalKey
      ? (isUiEnglish ? 'Next: choose which page to keep in the evidence section below.' : '下一步：在下方“判断依据”中选择要保留的 SEO 页面。')
      : (isUiEnglish ? 'Decision is ready. Confirm once to record it.' : '结论已准备好，点击“确认并保存”即可记录。');

  return (
    <div className="review-decision-box">
      <section className="review-decision-command" aria-label={isUiEnglish ? 'Decision actions' : '需要你做的决定'} data-ui-state={saving ? 'loading' : actionBlocked ? 'incomplete' : 'ready'}>
        <div className="review-decision-command-head">
          <div>
            <small>{isUiEnglish ? 'ACTION' : '需要你做的决定'}{issueLabel ? ` · ${issueLabel}` : ''}</small>
            <strong>{isUiEnglish ? 'Choose the conclusion' : '选择这条数据问题的处理结论'}</strong>
            {issueMeta || issueDescription ? <p className="review-decision-issue-context">{issueMeta ? <b>{issueMeta}</b> : null}{issueDescription ? <span>{issueDescription}</span> : null}</p> : null}
          </div>
          <span className={actionBlocked ? 'is-pending' : 'is-ready'}>{saving ? (isUiEnglish ? 'Saving…' : '保存中…') : decisionLabel}</span>
        </div>
        <div className="review-decision-options" aria-label={isUiEnglish ? 'Review decision' : '人工结论'}>
          {issueType === 'category_conflict' ? <>
            <button type="button" aria-pressed={decision === 'accepted_as_is'} className={`review-choice ${decision === 'accepted_as_is' ? 'active' : ''}`} onClick={() => setDecision('accepted_as_is')}>
              <strong>{isUiEnglish ? 'Keep current categories' : '分类没有问题'}</strong><small>{isUiEnglish ? 'Continue SEO with current source categories' : '保持源数据分类，继续 SEO'}</small>
            </button>
            <button type="button" aria-pressed={decision === 'source_correction_required'} className={`review-choice ${decision === 'source_correction_required' ? 'active' : ''}`} onClick={() => setDecision('source_correction_required')}>
              <strong>{isUiEnglish ? 'Source data needs correction' : '源数据需要修正'}</strong><small>{isUiEnglish ? 'Keep SEO blocked until corrected' : '修正前继续阻止 SEO 发布'}</small>
            </button>
          </> : <>
            <button type="button" aria-pressed={decision === 'duplicate_records'} className={`review-choice ${decision === 'duplicate_records' ? 'active' : ''}`} onClick={() => { setDecision('duplicate_records'); if (!canonicalKey && recommendedCanonicalKey) setCanonicalKey(recommendedCanonicalKey); }}>
              <strong>{isUiEnglish ? 'Confirm duplicate' : '确认是重复记录'}</strong><small>{isUiEnglish ? 'Keep one SEO page and canonicalize the rest' : '保留 1 个 SEO 页面，其余自动 Canonical'}</small>
            </button>
            <button type="button" aria-pressed={decision === 'distinct_records'} className={`review-choice ${decision === 'distinct_records' ? 'active' : ''}`} onClick={() => { setDecision('distinct_records'); setCanonicalKey(''); }}>
              <strong>{isUiEnglish ? 'Keep as distinct records' : '确认不是重复'}</strong><small>{isUiEnglish ? 'Keep both SEO pages independent' : '两个 SEO 页面分别保留'}</small>
            </button>
          </>}
        </div>
        <div className="review-decision-command-footer">
          <p>{actionHint}</p>
          <div className="review-decision-primary-actions">
            {issueType === 'duplicate_set' ? <button type="button" className="ghost-button compact" onClick={() => onDefer?.()}>{isUiEnglish ? 'Later' : '暂不处理'}</button> : null}
            <button type="button" className="primary-button compact review-confirm-action" onClick={save} disabled={saving || actionBlocked}>{saving ? t('common.saving') : (isUiEnglish ? 'Confirm & save' : '确认并保存')}</button>
          </div>
        </div>
      </section>

      <section className="review-evidence-section" aria-label={isUiEnglish ? 'Decision evidence' : '判断依据'}>
        <header>
          <div><small>{isUiEnglish ? 'EVIDENCE' : '判断依据'}</small><strong>{isUiEnglish ? 'Use evidence to verify your decision' : '用证据确认你的判断'}</strong></div>
          <span>{isUiEnglish ? 'Read-only evidence' : '证据只读'}</span>
        </header>
        {issueType === 'duplicate_set' ? (
          <DuplicateCandidateComparison
            group={group}
            members={duplicateMembers}
            seoRows={seoRows}
            groupSeoRows={groupSeoRows}
            locale={locale}
            canonicalKey={canonicalKey}
            onCanonicalChange={setCanonicalKey}
            allowKeepSelection={decision === 'duplicate_records'}
            isUiEnglish={isUiEnglish}
          />
        ) : (
          <div className="review-evidence-grid">
            {categoryMembers.map((item) => <div key={item.category}><b>{item.category}</b>{item.members.map((member) => <small key={member.catalog_key}>{member.name} · {member.catalog_key}</small>)}</div>)}
          </div>
        )}
      </section>

      {decision ? <div className="review-outcome-note">{decision === 'duplicate_records'
        ? (isUiEnglish ? 'After saving: one SEO page remains independent; duplicate rows point to it with Canonical. This is one atomic operation.' : '保存后：只保留一个独立 SEO 页面，其他重复记录自动指向它的 Canonical；整套处理作为一次操作完成。')
        : (isUiEnglish ? 'After saving: both records remain eligible to become separate SEO pages. Existing source data is unchanged.' : '保存后：两条记录继续作为独立 SEO 页面候选；源数据不做修改。')}</div> : null}

      <details className="review-notes-disclosure">
        <summary><span><strong>{isUiEnglish ? 'Review notes' : '审核备注'}</strong><small>{isUiEnglish ? 'Optional · record the evidence behind the decision' : '可选 · 记录判断依据'}</small></span><em>{isUiEnglish ? 'Open' : '展开'}</em></summary>
        <label>{isUiEnglish ? 'Review notes' : '审核备注'}
          <textarea rows="2" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={isUiEnglish ? 'Record the evidence for this decision; source data is not rewritten.' : '记录判断依据；不改写源数据。'} />
        </label>
      </details>
      <div className="review-record-status">{row?.reviewed_at ? `${isUiEnglish ? 'Recorded' : '已记录'} · ${new Date(row.reviewed_at).toLocaleString()}` : (isUiEnglish ? 'No human conclusion recorded yet' : '尚未记录人工结论')}</div>
    </div>
  );
}

export default function DataReviewPanel({ group, reviewRows = {}, seoRows = {}, groupSeoRows = {}, locale = 'zh-CN', schemaReady = false, readOnly = false, onSaved, onResolved, onSeoPolicyAligned, onDefer }) {
  const { appLocale } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const [catalogByKey, setCatalogByKey] = useState(() => new Map());
  useEffect(() => {
    let cancelled = false;
    loadProductTruthCatalog().then((catalog) => { if (!cancelled) setCatalogByKey(catalog); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  if (!group || (!group.category_conflict && !group.duplicate_count)) return null;
  const categoryMembers = group.category_conflict
    ? group.categories.map((category) => ({ category, members: group.members.filter((member) => member.category === category) }))
    : [];
  const issueSummary = summarizeDataReviewIssues(group, reviewRows);
  return (
    <section className="data-review-panel">
      <div className="data-review-header">
        <div><small>{isUiEnglish ? 'CURRENT ISSUE GROUP' : '当前问题组'}</small><strong>{group.base_scientific_name}</strong></div>
        <span className={`review-count ${issueSummary.open === 0 ? 'resolved' : ''}`}>{issueSummary.open > 0 ? `${issueSummary.open} ${isUiEnglish ? 'open' : '项待处理'}` : (isUiEnglish ? 'Resolved' : '已处理')}</span>
      </div>
      {group.category_conflict ? (
        <div className="review-issue-card">
          <ReviewDecision issueKey={categoryIssueKey(group)} issueType="category_conflict"
            issueLabel={isUiEnglish ? 'Category conflict' : '分类冲突'} issueMeta={group.categories.join(' ↔ ')}
            issueDescription={isUiEnglish ? 'The same Base Species appears in multiple product categories.' : '同一基础物种位于多个产品分类，需要人工确认后才能继续 SEO。'}
            group={group} categoryMembers={categoryMembers}
            row={reviewRows[categoryIssueKey(group)]} catalogByKey={catalogByKey} seoRows={seoRows} groupSeoRows={groupSeoRows} locale={locale} schemaReady={schemaReady} readOnly={readOnly} onSaved={onSaved} onResolved={onResolved} onSeoPolicyAligned={onSeoPolicyAligned} onDefer={onDefer} />
        </div>
      ) : null}
      {group.duplicate_sets?.map((set) => (
        <div className="review-issue-card" key={set.duplicate_set_key}>
          <ReviewDecision issueKey={set.duplicate_set_key} issueType="duplicate_set"
            issueLabel={isUiEnglish ? 'Possible duplicate pages' : '疑似重复页面'}
            issueMeta={`${set.name} · ${set.scientific_name}`}
            issueDescription={`${set.member_ids.length} ${isUiEnglish ? 'source records need one human decision.' : '条源记录需要一个人工结论。'}`}
            group={group} set={set}
            row={reviewRows[set.duplicate_set_key]} catalogByKey={catalogByKey} seoRows={seoRows} groupSeoRows={groupSeoRows} locale={locale} schemaReady={schemaReady} readOnly={readOnly} onSaved={onSaved} onResolved={onResolved} onSeoPolicyAligned={onSeoPolicyAligned} onDefer={onDefer} />
        </div>
      ))}
    </section>
  );
}
