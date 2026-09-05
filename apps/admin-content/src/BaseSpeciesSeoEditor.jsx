import { useEffect, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { groupSeoFromRow } from './seoInheritance.js';
import { getLocaleLabel } from './localization.js';
import { useAppLanguage } from './AppLanguage.jsx';
import { inspectEditorialContent, hygieneBlockerText } from './contentHygiene.js';
import { emitAdminNotice } from './AdminNoticeViewport.jsx';
import PageReviewStatusBar from './PageReviewStatusBar.jsx';

const isPublicSpeciesPublishingEnabled = false;
const BASE_EDITORIAL_KEYS = ['seoTitleTemplate', 'metaDescriptionTemplate', 'h1Template', 'sharedIntro'];

export default function BaseSpeciesSeoEditor({ group, record, locale = 'zh-CN', schemaReady, readOnly, onPreview, onSaved, selectedInspectorElement, onInspectorSelect, onDirtyChange }) {
  const { appLocale, t } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const [form, setForm] = useState(() => groupSeoFromRow(record, locale));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(groupSeoFromRow(record, locale));
    onDirtyChange?.(false);
  }, [group?.group_key, record, locale, onDirtyChange]);

  useEffect(() => {
    if (!selectedInspectorElement) return;
    const frame = requestAnimationFrame(() => {
      const target = document.querySelector(`[data-base-editor-field="${selectedInspectorElement}"]`);
      target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedInspectorElement, group?.group_key, locale]);

  const baseFieldProps = (key) => {
    const fieldState = baseFieldStateByKey?.[key] || 'default';
    return {
      'data-base-editor-field': key,
      'data-validation-state': fieldState,
      className: `inspector-editor-field state-${fieldState} ${selectedInspectorElement === key ? 'is-inspector-selected' : ''}`,
    };
  };

  const baselineForm = groupSeoFromRow(record, locale);
  const contentDirty = !readOnly && BASE_EDITORIAL_KEYS.some((key) => String(form[key] ?? '') !== String(baselineForm[key] ?? ''));
  const isDirty = !readOnly && JSON.stringify(form) !== JSON.stringify(baselineForm);
  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);
  const baseHygiene = inspectEditorialContent({
    seoTitleTemplate: form.seoTitleTemplate, metaDescriptionTemplate: form.metaDescriptionTemplate,
    h1Template: form.h1Template, sharedIntroTemplate: form.sharedIntro,
  });
  const baseHygieneBlockReason = baseHygiene.clean ? '' : hygieneBlockerText(baseHygiene.issues[0], locale);
  const baseIssueKeys = new Set(baseHygiene.issues.map((issue) => ({
    seoTitleTemplate: 'seoTitle', metaDescriptionTemplate: 'metaDescription', h1Template: 'h1', sharedIntroTemplate: 'intro',
  }[issue.field] || issue.field)));
  const baseFieldStateByKey = {
    seoTitle: baseIssueKeys.has('seoTitle') ? 'error' : form.seoTitleTemplate?.trim() ? 'success' : 'warning',
    metaDescription: baseIssueKeys.has('metaDescription') ? 'error' : form.metaDescriptionTemplate?.trim() ? 'success' : 'warning',
    h1: baseIssueKeys.has('h1') ? 'error' : form.h1Template?.trim() ? 'success' : 'warning',
    intro: baseIssueKeys.has('intro') ? 'error' : form.sharedIntro?.trim() ? 'success' : 'warning',
  };
  const reviewTone = !baseHygiene.clean || group?.category_conflict
    ? 'error'
    : contentDirty || form.reviewState !== 'approved'
      ? 'warning'
      : 'success';

  if (!group) return null;
  const localeLabel = getLocaleLabel(locale);
  const toPreviewRow = (next) => ({
    group_key: group.group_key,
    locale,
    seo_title_template: next.seoTitleTemplate,
    meta_description_template: next.metaDescriptionTemplate,
    h1_template: next.h1Template,
    shared_intro: next.sharedIntro,
    status: next.status,
    review_state: next.reviewState,
  });

  const update = (key, value) => setForm((current) => {
    const next = { ...current, [key]: value, ...(BASE_EDITORIAL_KEYS.includes(key) ? { reviewState: 'editing' } : {}) };
    onPreview?.(toPreviewRow(next));
    return next;
  });

  const save = async (reviewStateOverride = null) => {
    if (!isPublicSpeciesPublishingEnabled && form.status === 'published') {
      emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Production publishing is locked' : '正式发布未开放', detail: isUiEnglish ? 'The Base template can only remain a Draft.' : '基础模板当前只能保持草稿状态。' });
      return;
    }
    if (readOnly) {
      emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Read-only demo' : '当前是只读演示', detail: isUiEnglish ? `Only the ${localeLabel} Base preview is available.` : `这里只展示 ${localeLabel} 基础模板效果，不会写入。` });
      return;
    }
    if (!schemaReady) {
      emitAdminNotice({ status: 'error', title: isUiEnglish ? 'Save blocked' : '保存被阻止', detail: isUiEnglish ? 'Base SEO content store is not ready.' : '基础模板 SEO 内容存储尚未就绪。' });
      return;
    }
    setSaving(true);
    if (reviewStateOverride && reviewStateOverride !== 'editing' && !baseHygiene.clean) {
      setSaving(false);
      emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Review blocked' : '审核被阻止', detail: baseHygieneBlockReason });
      return;
    }
    if (reviewStateOverride) {
      const { data, error } = await adminContentClient
        .from('species_seo_groups')
        .update({ review_state: reviewStateOverride })
        .eq('group_key', group.group_key)
        .eq('locale', locale)
        .select('*')
        .single();
      setSaving(false);
      if (error) {
        /* Repo backend emits the operation error toast. */
        return;
      }
      setForm((current) => ({ ...current, reviewState: data.review_state }));
      /* Repo backend emits the operation success toast. */
      onSaved(data);
      return;
    }
    const payload = {
      group_key: group.group_key,
      locale,
      seo_title_template: form.seoTitleTemplate.trim(),
      meta_description_template: form.metaDescriptionTemplate.trim(),
      h1_template: form.h1Template.trim(),
      shared_intro: form.sharedIntro.trim(),
      status: form.status,
      review_state: form.reviewState,
    };
    const { data, error } = await adminContentClient
      .from('species_seo_groups')
      .upsert(payload, { onConflict: 'group_key,locale' })
      .select('*')
      .single();
    setSaving(false);
    if (error) {
      /* Repo backend emits the operation error toast. */
      return;
    }
    setForm(groupSeoFromRow(data, locale));
    /* Repo backend emits the operation success toast. */
    onSaved(data);
  };

  return (
    <>
      <PageReviewStatusBar
        publishStatus={form.status}
        reviewState={form.reviewState}
        isUiEnglish={isUiEnglish}
        scope="base"
        tone={reviewTone}
        busy={saving}
        dirtyHint={contentDirty ? (isUiEnglish ? 'Saving this template resets approval to Editing.' : '保存模板后会自动退回“编辑中”，需要重新审核。') : ''}
      >
        {contentDirty ? (
          <button type="button" className="primary-button compact" disabled={saving} onClick={() => save()}>{saving ? t('common.saving') : (isUiEnglish ? 'Save base template' : '保存基础模板')}</button>
        ) : form.reviewState === 'editing' ? (
          <button type="button" className="primary-button compact" disabled={saving} onClick={() => save('ready_for_review')}>{isUiEnglish ? 'Submit for review' : '提交审核'}</button>
        ) : form.reviewState === 'ready_for_review' ? (
          <>
            <button type="button" className="ghost-button compact" disabled={saving} onClick={() => save('editing')}>{isUiEnglish ? 'Back to editing' : '退回编辑'}</button>
            <button type="button" className="primary-button compact" disabled={saving} onClick={() => save('approved')}>{isUiEnglish ? 'Approve Preview' : '批准预览'}</button>
          </>
        ) : (
          <button type="button" className="ghost-button compact" disabled={saving} onClick={() => save('editing')}>{isUiEnglish ? 'Back to editing' : '退回编辑'}</button>
        )}
      </PageReviewStatusBar>

      <section className="base-seo-panel">
        <div className="base-seo-header">
          <div>
            <p className="eyebrow">BASE SPECIES SEO · {localeLabel}</p>
            <h2>{group.base_scientific_name}</h2>
            <p>{isUiEnglish ? `${group.member_count} records use this Base layer. Shared content is inherited while Variant differences remain overrides.` : `${group.member_count} 个品种页面可使用这套基础模板；只有有差异的页面才需要单独修改。`}</p>
          </div>
        </div>
      {!baseHygiene.clean ? (
        <div className="content-hygiene-warning" role="alert">
          <div><strong>{isUiEnglish ? 'Test / acceptance copy detected in Base' : '基础模板包含测试 / 验收文案'}</strong><span>{isUiEnglish ? 'Clean the flagged fields before submitting or approving this Base template.' : '清理标记字段后才能提交或批准这套基础模板。'}</span></div>
          <ul>{baseHygiene.issues.map((issue) => <li key={`${issue.field}-${issue.marker}`}><b>{issue.label}</b><span>{issue.match}</span></li>)}</ul>
        </div>
      ) : null}
      {group.category_conflict ? (
        <div className="batch-warning">{isUiEnglish ? 'The source catalog has a category conflict. Draft editing is allowed, but Preview readiness remains blocked until human review is complete.' : '源数据存在分类冲突；草稿可以继续编辑，但完成数据复核前不能进入预览发布。'}</div>
      ) : null}
      <div className="editor-detail-heading">
        <small>{isUiEnglish ? 'DETAIL EDITING' : '详细编辑'}</small>
        <div className="editor-detail-title-row">
          <h3>{isUiEnglish ? 'Base template fields' : '基础模板字段'}</h3>
          <div className="validation-legend" aria-label={isUiEnglish ? 'Field health legend' : '字段状态说明'}>
            <span className="tone-error">{isUiEnglish ? 'Red · fix' : '红 · 需修复'}</span>
            <span className="tone-warning">{isUiEnglish ? 'Yellow · attention' : '黄 · 待处理'}</span>
            <span className="tone-success">{isUiEnglish ? 'Green · healthy' : '绿 · 正常'}</span>
          </div>
        </div>
        <p>{isUiEnglish ? 'Edit shared copy here. Review actions stay in the workflow panel above.' : '这里只修改共享模板内容；提交和批准统一在上方独立审核进度栏完成。'}</p>
      </div>
      <div className="base-seo-grid">
        <label {...baseFieldProps('seoTitle')}>{isUiEnglish ? 'SEO Title template' : 'Meta 标题模板'}
          <input value={form.seoTitleTemplate} onFocus={() => onInspectorSelect?.('seoTitle')} onChange={(event) => update('seoTitleTemplate', event.target.value)} />
        </label>
        <label {...baseFieldProps('metaDescription')}>{isUiEnglish ? 'Meta Description template' : 'Meta 描述模板'}
          <textarea rows="3" value={form.metaDescriptionTemplate} onFocus={() => onInspectorSelect?.('metaDescription')} onChange={(event) => update('metaDescriptionTemplate', event.target.value)} />
        </label>
        <label {...baseFieldProps('h1')}>{isUiEnglish ? 'H1 template' : 'H1 模板'}
          <input value={form.h1Template} onFocus={() => onInspectorSelect?.('h1')} onChange={(event) => update('h1Template', event.target.value)} />
        </label>
        <label {...baseFieldProps('intro')}>{isUiEnglish ? 'Shared introduction / Base content' : '基础种简介'}
          <textarea rows="5" value={form.sharedIntro} onFocus={() => onInspectorSelect?.('intro')} onChange={(event) => update('sharedIntro', event.target.value)} placeholder={isUiEnglish ? 'Write only content shared by this Base Species; keep Variant-specific differences in overrides.' : '只写同一基础种下所有品种都成立的共同内容；某个品种的差异请到“当前品种页面”补充。'} />
        </label>
        <p className="template-help">{isUiEnglish ? 'Keep template tokens unchanged: ' : '变量必须原样保留：'}{'{{name}}'} · {'{{variant_name}}'} · {'{{base_species}}'} · {'{{scientific_name}}'}</p>
      </div>
      <div className="base-seo-footer">
        <div>{!readOnly && contentDirty ? <span className="unsaved-indicator">{isUiEnglish ? 'Unsaved changes · approval will reset' : '未保存修改 · 保存后需重新审核'}</span> : <span className="footer-context-note">{readOnly ? (isUiEnglish ? 'Read-only preview' : '只读预览') : (isUiEnglish ? `${localeLabel} only` : `仅更新 ${localeLabel}`)}</span>}</div>
        <div className="footer-actions">
          {!readOnly ? <span className={`draft-safety-chip content-${form.status}`} aria-label={isUiEnglish ? 'Base content status' : '基础模板内容状态'}>{form.status === 'published' ? (isUiEnglish ? 'Published · locked' : '已发布 · 已锁定') : (isUiEnglish ? 'Draft · not live' : '草稿 · 不会直接上线')}</span> : null}
          {contentDirty ? <button className="primary-button" type="button" onClick={() => save()} disabled={saving}>{saving ? t('common.saving') : (isUiEnglish ? 'Save base template' : '保存基础模板')}</button> : null}
        </div>
      </div>
      </section>
    </>
  );
}
