import { useEffect, useState } from 'react';
import { supabase } from './supabase.js';
import { groupSeoFromRow } from './seoInheritance.js';
import { getLocaleLabel } from './localization.js';
import { REVIEW_STATES } from './publishReadiness.js';

const isPublicSpeciesPublishingEnabled = false;

export default function BaseSpeciesSeoEditor({ group, record, locale = 'zh-CN', schemaReady, readOnly, onPreview, onSaved }) {
  const [form, setForm] = useState(() => groupSeoFromRow(record, locale));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(groupSeoFromRow(record, locale));
    setMessage('');
  }, [group?.group_key, record, locale]);

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
    const next = { ...current, [key]: value };
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
    const { data, error } = await supabase
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
          <p>{group.member_count} 条记录使用这一 Base 层；多成员组共享继承，单成员组也保留统一审核与发布契约。</p>
        </div>
        <div className="editor-statuses"><span className={`status-pill ${form.status}`}>{localeLabel}: {form.status}</span><span className={`status-pill ${form.reviewState}`}>Review: {form.reviewState}</span></div>
      </div>
      {group.category_conflict ? (
        <div className="batch-warning">源 catalog 存在分类冲突；Draft 可继续编辑，但 Publish Readiness 会保持阻止直到人工结论完成。</div>
      ) : null}
      <div className="base-seo-grid">
        <label>SEO Title 模板
          <input value={form.seoTitleTemplate} onChange={(event) => update('seoTitleTemplate', event.target.value)} />
        </label>
        <label>Meta Description 模板
          <textarea rows="3" value={form.metaDescriptionTemplate} onChange={(event) => update('metaDescriptionTemplate', event.target.value)} />
        </label>
        <label>H1 模板
          <input value={form.h1Template} onChange={(event) => update('h1Template', event.target.value)} />
        </label>
        <label>共享简介 / 基础内容
          <textarea rows="5" value={form.sharedIntro} onChange={(event) => update('sharedIntro', event.target.value)} placeholder="只写这个基础物种共同成立的内容；变种差异写到 Variant Override。" />
        </label>
        <p className="template-help">变量必须原样保留：{'{{name}}'} · {'{{variant_name}}'} · {'{{base_species}}'} · {'{{scientific_name}}'}</p>
      </div>
      <div className="base-seo-footer">
        <div>{message || (readOnly ? `只读 Review：可预览 ${localeLabel} 模板，不会写数据库。` : `保存后只更新 ${localeLabel}，不会覆盖其它语言。`)}</div>
        <div className="footer-actions">
          <select value={form.reviewState} onChange={(event) => update('reviewState', event.target.value)} aria-label="Base editorial review state">
            {REVIEW_STATES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select value={form.status} onChange={(event) => update('status', event.target.value)}>
            <option value="draft">Draft</option>
            <option value="published" disabled={!isPublicSpeciesPublishingEnabled}>Published（Production integration locked）</option>
            <option value="archived">Archived</option>
          </select>
          <button className="primary-button" type="button" onClick={save} disabled={readOnly || saving}>
            {readOnly ? `只读 ${localeLabel} 预览` : saving ? '保存中…' : `保存 ${localeLabel} Base SEO`}
          </button>
        </div>
      </div>
    </section>
  );
}
