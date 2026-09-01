import { useEffect, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { groupSeoFromRow } from './seoInheritance.js';
import { getLocaleLabel } from './localization.js';
import { useAppLanguage } from './AppLanguage.jsx';

const isPublicSpeciesPublishingEnabled = false;
const BASE_EDITORIAL_KEYS = ['seoTitleTemplate', 'metaDescriptionTemplate', 'h1Template', 'sharedIntro'];

export default function BaseSpeciesSeoEditor({ group, record, locale = 'zh-CN', schemaReady, readOnly, onPreview, onSaved, selectedInspectorElement, onInspectorSelect, onDirtyChange }) {
  const { appLocale, t } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const [form, setForm] = useState(() => groupSeoFromRow(record, locale));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(groupSeoFromRow(record, locale));
    setMessage('');
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

  const baseFieldProps = (key) => ({
    'data-base-editor-field': key,
    className: `inspector-editor-field ${selectedInspectorElement === key ? 'is-inspector-selected' : ''}`,
  });

  const baselineForm = groupSeoFromRow(record, locale);
  const contentDirty = !readOnly && BASE_EDITORIAL_KEYS.some((key) => String(form[key] ?? '') !== String(baselineForm[key] ?? ''));
  const isDirty = !readOnly && JSON.stringify(form) !== JSON.stringify(baselineForm);
  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);

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
      setMessage('Species 发布仍锁定：Production 发布未开放。');
      return;
    }
    if (readOnly) {
      setMessage(`当前为只读 Review，只展示 ${localeLabel} 基础模板效果。`);
      return;
    }
    if (!schemaReady) {
      setMessage('基础模板 SEO store 尚未就绪。');
      return;
    }
    setSaving(true);
    setMessage('');
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
        setMessage(`审核状态更新失败：${error.message}`);
        return;
      }
      setForm((current) => ({ ...current, reviewState: data.review_state }));
      setMessage(reviewStateOverride === 'ready_for_review' ? (isUiEnglish ? 'Submitted for review.' : '已提交审核。') : reviewStateOverride === 'approved' ? (isUiEnglish ? 'Approved for Preview.' : '已批准进入预览。') : (isUiEnglish ? 'Returned to editing.' : '已退回编辑。'));
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
      setMessage(`基础模板保存失败：${error.message}`);
      return;
    }
    setForm(groupSeoFromRow(data, locale));
    setMessage(`${localeLabel} 基础模板已保存；未单独设置的品种页面会自动使用模板。`);
    onSaved(data);
  };

  return (
    <section className="base-seo-panel">
      <div className="base-seo-header">
        <div>
          <p className="eyebrow">BASE SPECIES SEO · {localeLabel}</p>
          <h2>{group.base_scientific_name}</h2>
          <p>{isUiEnglish ? `${group.member_count} records use this Base layer. Shared content is inherited while Variant differences remain overrides.` : `${group.member_count} 个品种页面可使用这套基础模板；只有有差异的页面才需要单独修改。`}</p>
        </div>
        <div className="editor-status-cluster" aria-label={isUiEnglish ? 'Base current states' : '基础种当前状态'}>
          <div className="editor-status-item">
            <small>{isUiEnglish ? 'Publish status' : '发布状态'}</small>
            <span className="editor-status-value"><span className={`editor-status-dot ${form.status}`}></span><strong>{form.status === 'published' ? (isUiEnglish ? 'Published' : '已发布') : (isUiEnglish ? 'Draft' : '草稿')}</strong></span>
          </div>
          <div className="editor-status-item">
            <small>{isUiEnglish ? 'Review status' : '审核状态'}</small>
            <strong className={`review-status-pill review-${form.reviewState}`}>{isUiEnglish ? ({ editing: 'Editing', ready_for_review: 'Awaiting review', approved: 'Preview approved' }[form.reviewState] || form.reviewState) : ({ editing: '编辑中', ready_for_review: '待审核', approved: '已批准预览' }[form.reviewState] || form.reviewState)}</strong>
          </div>
        </div>
      </div>
      <div className={`workflow-stepper review-${form.reviewState}`} aria-label={isUiEnglish ? 'Base editorial workflow' : '基础种内容审核流程'}>
        <div className="workflow-status-block">
          <small className="workflow-section-label">{isUiEnglish ? 'Review progress' : '审核进度'}</small>
          <div className="workflow-stepper-track">
          <span className={form.reviewState === 'editing' ? 'current' : 'done'}><b>1</b>{isUiEnglish ? 'Editing' : '编辑中'}</span>
          <i>→</i>
          <span className={form.reviewState === 'ready_for_review' ? 'current' : form.reviewState === 'approved' ? 'done' : ''}><b>2</b>{isUiEnglish ? 'Awaiting review' : '待审核'}</span>
          <i>→</i>
          <span className={form.reviewState === 'approved' ? 'current' : ''}><b>3</b>{isUiEnglish ? 'Preview approved' : '已批准预览'}</span>
          </div>
        </div>
        <div className="workflow-action-block">
          <small className="workflow-section-label">{isUiEnglish ? 'Available actions' : '可执行操作'}</small>
          <div className="workflow-stepper-action">
          {contentDirty ? (
            <button type="button" className="primary-button compact" disabled={saving || readOnly} onClick={() => save()}>{saving ? t('common.saving') : (isUiEnglish ? 'Save base template' : '保存基础模板')}</button>
          ) : form.reviewState === 'editing' ? (
            <button type="button" className="primary-button compact" disabled={saving || readOnly} onClick={() => save('ready_for_review')}>{isUiEnglish ? 'Submit for review' : '提交审核'}</button>
          ) : form.reviewState === 'ready_for_review' ? (
            <>
              <button type="button" className="ghost-button compact" disabled={saving || readOnly} onClick={() => save('editing')}>{isUiEnglish ? 'Back to editing' : '退回编辑'}</button>
              <button type="button" className="primary-button compact" disabled={saving || readOnly} onClick={() => save('approved')}>{isUiEnglish ? 'Approve Preview' : '批准预览'}</button>
            </>
          ) : (
            <button type="button" className="ghost-button compact" disabled={saving || readOnly} onClick={() => save('editing')}>{isUiEnglish ? 'Back to editing' : '退回编辑'}</button>
          )}
          </div>
        </div>
      </div>
      {group.category_conflict ? (
        <div className="batch-warning">{isUiEnglish ? 'The source catalog has a category conflict. Draft editing is allowed, but Preview readiness remains blocked until human review is complete.' : '源数据存在分类冲突；草稿可以继续编辑，但完成数据复核前不能进入预览发布。'}</div>
      ) : null}
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
        <div>{!readOnly && contentDirty ? <span className="unsaved-indicator">{isUiEnglish ? 'Unsaved changes · approval will reset' : '未保存修改 · 保存后需重新审核'}</span> : null}{message || (readOnly ? `只读 Review：可预览 ${localeLabel} 基础模板，不会写入。` : `保存后只更新 ${localeLabel} 的基础模板，不会覆盖其它语言。`)}</div>
        <div className="footer-actions">
          <span className={`draft-safety-chip content-${form.status}`} aria-label={isUiEnglish ? 'Base content status' : 'Base 内容状态'}>{form.status === 'published' ? (isUiEnglish ? 'Published · locked' : 'Published · 已锁定') : (isUiEnglish ? 'Draft · not live' : '草稿 · 不会直接上线')}</span>
          {contentDirty ? <button className="primary-button" type="button" onClick={() => save()} disabled={readOnly || saving}>{saving ? t('common.saving') : (isUiEnglish ? 'Save base template' : '保存基础模板')}</button> : null}
        </div>
      </div>
    </section>
  );
}
