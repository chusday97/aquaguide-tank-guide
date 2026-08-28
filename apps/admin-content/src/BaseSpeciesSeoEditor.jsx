import { useEffect, useState } from 'react';
import { supabase } from './supabase.js';
import { defaultGroupSeo, groupSeoFromRow } from './seoInheritance.js';

export default function BaseSpeciesSeoEditor({ group, record, schemaReady, readOnly, onPreview, onSaved }) {
  const [form, setForm] = useState(defaultGroupSeo);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(groupSeoFromRow(record));
    setMessage('');
  }, [group?.group_key, record]);

  if (!group || group.member_count < 2) return null;
  const toPreviewRow = (next) => ({
    group_key: group.group_key,
    locale: 'zh-CN',
    seo_title_template: next.seoTitleTemplate,
    meta_description_template: next.metaDescriptionTemplate,
    h1_template: next.h1Template,
    shared_intro: next.sharedIntro,
    status: next.status,
  });
  const update = (key, value) => setForm((current) => {
    const next = { ...current, [key]: value };
    onPreview?.(toPreviewRow(next));
    return next;
  });

  const save = async () => {
    if (readOnly) {
      setMessage('当前为只读 Review，只展示 Base Species 继承效果。');
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
      locale: 'zh-CN',
      seo_title_template: form.seoTitleTemplate.trim(),
      meta_description_template: form.metaDescriptionTemplate.trim(),
      h1_template: form.h1Template.trim(),
      shared_intro: form.sharedIntro.trim(),
      status: form.status,
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
    setMessage('Base Species SEO 已保存；未 Override 的 Variant 会自动继承。');
    onSaved(data);
  };

  return (
    <section className="base-seo-panel">
      <div className="base-seo-header">
        <div>
          <p className="eyebrow">BASE SPECIES SEO</p>
          <h2>{group.base_scientific_name}</h2>
          <p>{group.member_count} 条同类 / 变种共享这一层；Variant 默认继承，只有差异字段才 Override。</p>
        </div>
        <span className={`status-pill ${form.status}`}>BASE: {form.status}</span>
      </div>
      {group.category_conflict ? (
        <div className="batch-warning">源 catalog 存在分类冲突；可以查看继承结构，但在复核前不要发布这个 Base Species。</div>
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
        <p className="template-help">可用变量：{'{{name}}'} · {'{{variant_name}}'} · {'{{base_species}}'} · {'{{scientific_name}}'}</p>
      </div>
      <div className="base-seo-footer">
        <div>{message || (readOnly ? '只读 Review：修改模板可预览，不会写数据库。' : '保存后，同组未 Override 的 Variant 自动使用最新 Base 内容。')}</div>
        <div className="footer-actions">
          <select value={form.status} onChange={(event) => update('status', event.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button className="primary-button" type="button" onClick={save} disabled={readOnly || saving || group.category_conflict}>
            {readOnly ? '只读 Base 预览' : saving ? '保存中…' : '保存 Base SEO'}
          </button>
        </div>
      </div>
    </section>
  );
}
