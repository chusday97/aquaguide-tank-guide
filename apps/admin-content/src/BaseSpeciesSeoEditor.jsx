import { useEffect, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { groupSeoFromRow } from './seoInheritance.js';
import { getLocaleLabel } from './localization.js';
import { REVIEW_STATES } from './publishReadiness.js';
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

  const save = async () => {
    if (!isPublicSpeciesPublishingEnabled && form.status === 'published') {
      setMessage('Species 发布仍锁定：A+B 验证链已通过，但 Production public-deploy integration 尚未显式批准。');
      return;
    }
    if (readOnly) {
      setMessage(`当前为只读 Review，只展示 ${localeLabel} Base Species 继承效果。`);
      return;
    }
    if (!schemaReady) {
      setMessage('Base Species SEO schema 尚未应用。');
      return;
    }
    setSaving(true);
    setMessage('');
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
      setMessage(`Base Species 保存失败：${error.message}`);
      return;
    }
    setMessage(`${localeLabel} Base Species SEO 已保存；未 Override 的 Variant 会自动继承。`);
    onSaved(data);
  };

  return (
    <section className="base-seo-panel">
      <div className="base-seo-header">
        <div>
          <p className="eyebrow">BASE SPECIES SEO · {localeLabel}</p>
          <h2>{group.base_scientific_name}</h2>
          <p>{isUiEnglish ? `${group.member_count} records use this Base layer. Shared content is inherited while Variant differences remain overrides.` : `${group.member_count} 个品种页面共用这一层公共内容；当前品种可以单独覆盖，不需要重复填写共同信息。`}</p>
        </div>
        <div className="editor-status-line" aria-label={isUiEnglish ? 'Base content status' : 'Base 内容状态'}>
          <span className={`editor-status-dot ${form.status}`}></span>
          <strong>{form.status === 'published' ? 'Published' : 'Draft'}</strong>
          <span>·</span>
          <span>{isUiEnglish ? ({ editing: 'Editing', ready_for_review: 'Awaiting review', approved: 'Approved' }[form.reviewState] || form.reviewState) : ({ editing: '编辑中', ready_for_review: '待审核', approved: '已审核' }[form.reviewState] || form.reviewState)}</span>
        </div>
      </div>
      {group.category_conflict ? (
        <div className="batch-warning">{isUiEnglish ? 'The source catalog has a category conflict. Draft editing is allowed, but Preview readiness remains blocked until human review is complete.' : '源数据存在分类冲突；草稿可以继续编辑，但完成数据复核前不能进入预览发布。'}</div>
      ) : null}
      <div className="base-seo-grid">
        <label {...baseFieldProps('seoTitle')}>{isUiEnglish ? 'SEO Title template' : '公共 Meta 标题模板'}
          <input value={form.seoTitleTemplate} onFocus={() => onInspectorSelect?.('seoTitle')} onChange={(event) => update('seoTitleTemplate', event.target.value)} />
        </label>
        <label {...baseFieldProps('metaDescription')}>{isUiEnglish ? 'Meta Description template' : '公共 Meta 描述模板'}
          <textarea rows="3" value={form.metaDescriptionTemplate} onFocus={() => onInspectorSelect?.('metaDescription')} onChange={(event) => update('metaDescriptionTemplate', event.target.value)} />
        </label>
        <label {...baseFieldProps('h1')}>{isUiEnglish ? 'H1 template' : '公共 H1 模板'}
          <input value={form.h1Template} onFocus={() => onInspectorSelect?.('h1')} onChange={(event) => update('h1Template', event.target.value)} />
        </label>
        <label {...baseFieldProps('intro')}>{isUiEnglish ? 'Shared introduction / Base content' : '基础种公共简介'}
          <textarea rows="5" value={form.sharedIntro} onFocus={() => onInspectorSelect?.('intro')} onChange={(event) => update('sharedIntro', event.target.value)} placeholder={isUiEnglish ? 'Write only content shared by this Base Species; keep Variant-specific differences in overrides.' : '只写同一基础种下所有品种都成立的共同内容；某个品种的差异请到“当前品种页面”补充。'} />
        </label>
        <p className="template-help">{isUiEnglish ? 'Keep template tokens unchanged: ' : '变量必须原样保留：'}{'{{name}}'} · {'{{variant_name}}'} · {'{{base_species}}'} · {'{{scientific_name}}'}</p>
      </div>
      <div className="base-seo-footer">
        <div>{!readOnly && isDirty ? <span className="unsaved-indicator">{contentDirty ? (isUiEnglish ? 'Unsaved changes · approval will reset' : '未保存修改 · 保存后需重新审核') : (isUiEnglish ? 'Workflow state not saved' : '流程状态未保存')}</span> : null}{message || (readOnly ? `只读 Review：可预览 ${localeLabel} 公共内容，不会写入。` : `保存后只更新 ${localeLabel} 的公共内容，不会覆盖其它语言。`)}</div>
        <div className="footer-actions">
          <span className={`draft-safety-chip content-${form.status}`} aria-label={isUiEnglish ? 'Base content status' : 'Base 内容状态'}>{form.status === 'published' ? (isUiEnglish ? 'Published · locked' : 'Published · 已锁定') : (isUiEnglish ? 'Draft · not live' : '草稿 · 不会直接上线')}</span>
          <label className="review-flow-control">
            <span>{isUiEnglish ? 'Workflow' : '内容流程'}</span>
            <select className={`footer-state-select review-${form.reviewState}`} value={form.reviewState} disabled={contentDirty} onChange={(event) => update('reviewState', event.target.value)} aria-label={isUiEnglish ? 'Base review state' : 'Base 审核状态'}>
              {REVIEW_STATES.map((item) => <option key={item.value} value={item.value}>{isUiEnglish ? ({ editing: 'Editing', ready_for_review: 'Submit for review', approved: 'Approved for Preview' }[item.value] || item.label) : ({ editing: '编辑中', ready_for_review: '提交审核', approved: '已批准预览' }[item.value] || item.label)}</option>)}
            </select>
          </label>
          <button className="primary-button" type="button" onClick={save} disabled={readOnly || saving || !isDirty}>
            {readOnly ? `${t('common.readonly')} ${localeLabel}` : saving ? t('common.saving') : (contentDirty ? (isUiEnglish ? 'Save shared content' : '保存公共内容') : (isUiEnglish ? 'Save workflow state' : '保存流程状态'))}
          </button>
        </div>
      </div>
    </section>
  );
}
