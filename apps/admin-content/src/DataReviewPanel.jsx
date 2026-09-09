import { useAppLanguage } from './AppLanguage.jsx';
import { useEffect, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { categoryIssueKey, summarizeDataReviewIssues } from './publishReadiness.js';
import { emitAdminNotice } from './AdminNoticeViewport.jsx';
import DuplicateCandidateComparison from './DuplicateCandidateComparison.jsx';
import { buildDuplicateRecommendation, mergeDuplicateMembers } from './duplicateReviewEvidence.js';
import { loadProductTruthCatalog } from './productTruthLoader.js';

function CategoryConflictEvidence({ group, categoryMembers, isUiEnglish }) {
  const totalRecords = categoryMembers.reduce((sum, item) => sum + item.members.length, 0);
  return (
    <div className="category-conflict-evidence">
      <div className="evidence-summary-grid">
        <div>
          <span>{isUiEnglish ? 'System confirmed' : '系统已确认'}</span>
          <strong>{isUiEnglish ? `One Base Species is mapped to ${categoryMembers.length} categories` : `同一基础物种被映射到 ${categoryMembers.length} 个分类`}</strong>
          <small>{group.base_scientific_name} · {totalRecords} {isUiEnglish ? 'source records' : '条源记录'}</small>
        </div>
        <div>
          <span>{isUiEnglish ? 'System cannot decide' : '系统无法自动确认'}</span>
          <strong>{isUiEnglish ? 'Which category is authoritative Product Data' : '哪一个分类才是 Product Data 的最终权威分类'}</strong>
          <small>{isUiEnglish ? 'SEO evidence cannot rewrite Product Data; a human must verify the source taxonomy.' : 'SEO 证据不能替代 Product Data，需要人工核对源分类。'}</small>
        </div>
      </div>
      <div className="category-compare-table" role="table" aria-label={isUiEnglish ? 'Category comparison' : '分类对比'}>
        {categoryMembers.map((item) => (
          <div className="category-compare-row" role="row" key={item.category}>
            <strong role="cell">{item.category}</strong>
            <span role="cell">{item.members.length} {isUiEnglish ? 'records' : '条记录'}</span>
            <div role="cell"><small>{item.members.slice(0, 2).map((member) => member.name).join('、')}{item.members.length > 2 ? (isUiEnglish ? ` +${item.members.length - 2} more` : ` 等 ${item.members.length} 条`) : ''}</small></div>
          </div>
        ))}
      </div>
      <details className="category-source-records">
        <summary>{isUiEnglish ? `View all ${totalRecords} source records` : `查看全部 ${totalRecords} 条源记录`}</summary>
        <div>{categoryMembers.flatMap((item) => item.members.map((member) => <small key={member.catalog_key}><b>{item.category}</b><span>{member.name} · {member.catalog_key}</span></small>))}</div>
      </details>
      <div className="review-evidence-guidance">
        <b>{isUiEnglish ? 'How to decide' : '怎么判断'}</b>
        <span>{isUiEnglish ? 'If the records intentionally belong to different product categories, keep the categories. If one group is misclassified, mark Source Data for correction.' : '如果这些记录本来就属于不同产品分类，选择“分类没有问题”；如果其中一组是误归类，选择“源数据需要修正”。'}</span>
      </div>
    </div>
  );
}

function ReviewDecision({ issueKey, issueType, issueLabel = '', issueMeta = '', issueDescription = '', group, set, categoryMembers = [], row, catalogByKey, seoRows, groupSeoRows, locale, schemaReady, readOnly, onSaved, onResolved, onSeoPolicyAligned }) {
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
    ? (isUiEnglish ? 'No conclusion selected' : '尚未选择结论')
    : decision === 'duplicate_records'
      ? (isUiEnglish ? 'Duplicate records' : '重复记录')
      : decision === 'distinct_records'
        ? (isUiEnglish ? 'Distinct records' : '不是重复')
        : decision === 'accepted_as_is'
          ? (isUiEnglish ? 'Keep current categories' : '分类没有问题')
          : (isUiEnglish ? 'Source Data needs correction' : '源数据需要修正');
  const actionHint = !decision
    ? (isUiEnglish ? 'Choose one conclusion after reviewing the evidence. Nothing is changed until you confirm.' : '先根据上方依据选择一个结论；点击确认前不会产生任何修改。')
    : decision === 'duplicate_records' && !canonicalKey
      ? (isUiEnglish ? 'Choose the one SEO page to keep before confirming.' : '确认重复前，还需要选择最终保留的 1 个 SEO 页面。')
      : (isUiEnglish ? 'Review the final result below, then confirm once.' : '先核对下方“最终确认版本”，确认无误后只需确认一次。');
  const canonicalMember = duplicateMembers.find((item) => item.catalog_key === canonicalKey);
  const outcomeStep = decision === 'duplicate_records' ? '4' : '3';
  const outcome = !decision ? null
    : decision === 'accepted_as_is'
      ? {
          title: isUiEnglish ? 'After confirmation: close this Data Review issue' : '确认后：关闭这条数据复核问题',
          lines: isUiEnglish
            ? ['Keep the current category assignments.', 'Source Data is not rewritten here.', 'This Base Species can continue through the SEO workflow.']
            : ['保留当前分类归属。', '这里不会改写源数据。', '该基础物种可以继续进入 SEO 流程。'],
        }
      : decision === 'source_correction_required'
        ? {
            title: isUiEnglish ? 'After confirmation: Source Data correction remains required' : '确认后：记录为“源数据需要修正”',
            lines: isUiEnglish
              ? ['SEO remains blocked for this Base Species.', 'This screen does not change any category.', 'Correct Product Data in Aqua Operations Studio → Product Data, then review this issue again.']
              : ['该基础物种的 SEO 继续保持阻塞。', '这个页面不会修改任何分类。', '需要到 Aqua Operations Studio → Product Data 修正源分类，之后再重新复核。'],
          }
        : decision === 'duplicate_records'
          ? {
              title: isUiEnglish ? 'After confirmation: keep one independent SEO page' : '确认后：只保留 1 个独立 SEO 页面',
              lines: canonicalKey
                ? (isUiEnglish
                    ? [`Keep ${canonicalMember?.name || canonicalKey} (${canonicalKey}).`, `${Math.max(duplicateMembers.length - 1, 0)} duplicate record(s) will canonicalize to it.`, 'Source Data is not rewritten by this review.']
                    : [`保留 ${canonicalMember?.name || canonicalKey}（${canonicalKey}）。`, `其余 ${Math.max(duplicateMembers.length - 1, 0)} 条重复记录的 SEO Canonical 指向该页面。`, '本次复核不改写源数据。'])
                : (isUiEnglish ? ['Choose the page to keep first.'] : ['请先选择要保留的 SEO 页面。']),
            }
          : {
              title: isUiEnglish ? 'After confirmation: keep separate SEO pages' : '确认后：继续保留独立 SEO 页面',
              lines: isUiEnglish
                ? [`Keep ${duplicateMembers.length} records as separate SEO page candidates.`, 'No Canonical relationship is created by this review.', 'Source Data remains unchanged.']
                : [`${duplicateMembers.length} 条记录继续作为独立 SEO 页面候选。`, '本次复核不会建立 Canonical 关系。', '源数据保持不变。'],
            };


  return (
    <div className="review-decision-box">
      <section className="review-evidence-section review-evidence-first" aria-label={isUiEnglish ? 'Decision evidence' : '判断依据'}>
        <header>
          <div><small>{isUiEnglish ? '1 · EVIDENCE' : '1 · 先看判断依据'}</small><strong>{isUiEnglish ? 'Compare the facts before choosing' : '先确认系统发现了什么，再做决定'}</strong></div>
          <span>{isUiEnglish ? 'Read-only evidence' : '证据只读'}</span>
        </header>
        {issueType === 'duplicate_set' ? (
          <DuplicateCandidateComparison
            group={group}
            members={duplicateMembers}
            seoRows={seoRows}
            groupSeoRows={groupSeoRows}
            locale={locale}
            isUiEnglish={isUiEnglish}
          />
        ) : <CategoryConflictEvidence group={group} categoryMembers={categoryMembers} isUiEnglish={isUiEnglish} />}
      </section>

      <section className="review-decision-command" aria-label={isUiEnglish ? 'Decision actions' : '需要你做的决定'} data-ui-state={saving ? 'loading' : actionBlocked ? 'incomplete' : 'ready'}>
        <div className="review-decision-command-head">
          <div>
            <small>{isUiEnglish ? '2 · CONCLUSION' : '2 · 选择处理结论'}{issueLabel ? ` · ${issueLabel}` : ''}</small>
            <strong>{isUiEnglish ? 'Choose one conclusion' : '根据上方依据，只选择一个结论'}</strong>
            {issueMeta || issueDescription ? <p className="review-decision-issue-context">{issueMeta ? <b>{issueMeta}</b> : null}{issueDescription ? <span>{issueDescription}</span> : null}</p> : null}
          </div>
          <span className="review-decision-current">{decisionLabel}</span>
        </div>
        <div className="review-decision-options" role="radiogroup" aria-label={isUiEnglish ? 'Review decision' : '人工结论'}>
          {issueType === 'category_conflict' ? <>
            <label className={`review-choice ${decision === 'accepted_as_is' ? 'active' : ''}`}>
              <input type="radio" name={`decision-${issueKey}`} checked={decision === 'accepted_as_is'} onChange={() => setDecision('accepted_as_is')} />
              <span><strong>{isUiEnglish ? 'Confirm categories are valid' : '确认分类有效'}</strong><small>{isUiEnglish ? 'The different categories are intentional; continue SEO.' : '这些分类是有意区分的，继续 SEO。'}</small></span>
            </label>
            <label className={`review-choice ${decision === 'source_correction_required' ? 'active' : ''}`}>
              <input type="radio" name={`decision-${issueKey}`} checked={decision === 'source_correction_required'} onChange={() => setDecision('source_correction_required')} />
              <span><strong>{isUiEnglish ? 'Mark Source Data for correction' : '标记为源数据待修正'}</strong><small>{isUiEnglish ? 'One or more category assignments are wrong; keep SEO blocked.' : '至少一组分类有误，修正前继续阻止 SEO。'}</small></span>
            </label>
          </> : <>
            <label className={`review-choice ${decision === 'duplicate_records' ? 'active' : ''}`}>
              <input type="radio" name={`decision-${issueKey}`} checked={decision === 'duplicate_records'} onChange={() => setDecision('duplicate_records')} />
              <span><strong>{isUiEnglish ? 'They are duplicate records' : '确认是重复记录'}</strong><small>{isUiEnglish ? 'Keep one SEO page and canonicalize the rest.' : '保留 1 个 SEO 页面，其余建立 Canonical。'}</small></span>
            </label>
            <label className={`review-choice ${decision === 'distinct_records' ? 'active' : ''}`}>
              <input type="radio" name={`decision-${issueKey}`} checked={decision === 'distinct_records'} onChange={() => { setDecision('distinct_records'); setCanonicalKey(''); }} />
              <span><strong>{isUiEnglish ? 'They are distinct records' : '确认不是重复'}</strong><small>{isUiEnglish ? 'Keep the records as separate SEO pages.' : '多个 SEO 页面分别保留。'}</small></span>
            </label>
          </>}
        </div>

        {decision === 'duplicate_records' ? <section className="review-canonical-choice" data-testid="review-canonical-choice" aria-label={isUiEnglish ? 'Choose the final SEO page' : '选择最终保留页面'}>
          <div className="review-canonical-choice-head">
            <div><small>{isUiEnglish ? '3 · PAGE TO KEEP' : '3 · 选择最终保留页面'}</small><strong>{isUiEnglish ? 'Choose the one SEO page that remains independent' : '选择最终独立保留的 1 个 SEO 页面'}</strong></div>
            <span>{isUiEnglish ? 'SEO only · Source Data unchanged' : '仅影响 SEO · 不改源数据'}</span>
          </div>
          <p>{isUiEnglish ? 'The other duplicate pages will point their Canonical to this page. The system suggestion is evidence, not an automatic decision.' : '其余重复页面的 Canonical 会指向这里。系统建议只是判断依据，不会替你自动确认。'}</p>
          <div className="review-canonical-options" role="radiogroup" aria-label={isUiEnglish ? 'Final page to keep' : '最终保留页面'}>
            {duplicateMembers.map((member) => {
              const selected = canonicalKey === member.catalog_key;
              const recommended = recommendedCanonicalKey === member.catalog_key;
              return <label key={member.catalog_key} className={`review-canonical-option ${selected ? 'active' : ''}`}>
                <input type="radio" name={`canonical-${issueKey}`} checked={selected} onChange={() => setCanonicalKey(member.catalog_key)} />
                <span><strong>{member.name}</strong><small>{member.scientific_name} · {member.catalog_key}</small></span>
                {recommended ? <em>{isUiEnglish ? 'System suggestion' : '系统建议'}</em> : null}
              </label>;
            })}
          </div>
        </section> : null}

        {outcome ? <section className="review-result-preview" data-testid="review-final-result" aria-label={isUiEnglish ? 'Final result before confirmation' : '最终确认版本'}>
          <small>{isUiEnglish ? `${outcomeStep} · FINAL RESULT` : `${outcomeStep} · 最终确认版本`}</small>
          <strong>{outcome.title}</strong>
          <ul>{outcome.lines.map((line) => <li key={line}>{line}</li>)}</ul>
        </section> : null}

        <div className="review-decision-command-footer">
          <p>{actionHint}</p>
          <div className="review-decision-primary-actions">
            <button type="button" data-testid="review-confirm-final" className="primary-button compact review-confirm-action" onClick={save} disabled={saving || actionBlocked}>{saving ? t('common.saving') : (isUiEnglish ? 'Confirm final result' : '确认最终结果')}</button>
          </div>
        </div>
      </section>

      <details className="review-notes-disclosure">
        <summary><span><strong>{isUiEnglish ? 'Review notes' : '审核备注'}</strong><small>{isUiEnglish ? 'Optional · record external evidence or source checks' : '可选 · 记录外部依据或源数据核对结果'}</small></span><em>{isUiEnglish ? 'Open' : '展开'}</em></summary>
        <label>{isUiEnglish ? 'Review notes' : '审核备注'}
          <textarea rows="2" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={isUiEnglish ? 'Record any external evidence used for this decision.' : '记录做出这个判断时使用的外部依据。'} />
        </label>
      </details>
      <div className="review-record-status">{row?.reviewed_at ? `${isUiEnglish ? 'Recorded' : '已记录'} · ${new Date(row.reviewed_at).toLocaleString()}` : (isUiEnglish ? 'No human conclusion recorded yet' : '尚未记录人工结论')}</div>
    </div>
  );

}

export default function DataReviewPanel({ group, reviewRows = {}, seoRows = {}, groupSeoRows = {}, locale = 'zh-CN', schemaReady = false, readOnly = false, onSaved, onResolved, onSeoPolicyAligned }) {
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
            row={reviewRows[categoryIssueKey(group)]} catalogByKey={catalogByKey} seoRows={seoRows} groupSeoRows={groupSeoRows} locale={locale} schemaReady={schemaReady} readOnly={readOnly} onSaved={onSaved} onResolved={onResolved} onSeoPolicyAligned={onSeoPolicyAligned} />
        </div>
      ) : null}
      {group.duplicate_sets?.map((set) => (
        <div className="review-issue-card" key={set.duplicate_set_key}>
          <ReviewDecision issueKey={set.duplicate_set_key} issueType="duplicate_set"
            issueLabel={isUiEnglish ? 'Possible duplicate pages' : '疑似重复页面'}
            issueMeta={`${set.name} · ${set.scientific_name}`}
            issueDescription={`${set.member_ids.length} ${isUiEnglish ? 'source records need one human decision.' : '条源记录需要一个人工结论。'}`}
            group={group} set={set}
            row={reviewRows[set.duplicate_set_key]} catalogByKey={catalogByKey} seoRows={seoRows} groupSeoRows={groupSeoRows} locale={locale} schemaReady={schemaReady} readOnly={readOnly} onSaved={onSaved} onResolved={onResolved} onSeoPolicyAligned={onSeoPolicyAligned} />
        </div>
      ))}
    </section>
  );
}
