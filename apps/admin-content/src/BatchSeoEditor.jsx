import { useMemo, useState } from 'react';
import { supabase } from './supabase.js';

const defaults = {
  seoTitle: '{{name}}怎么养？水温、pH、混养与饲养指南',
  metaDescription: '了解{{name}}（{{base_species}}）的水温、pH、鱼缸环境、混养与日常饲养重点。',
  h1: '{{name}}饲养指南',
};

function applyTemplate(template, member, group) {
  return template
    .replaceAll('{{name}}', member.name || '')
    .replaceAll('{{variant_name}}', member.variant_label || member.name || '')
    .replaceAll('{{base_species}}', group.base_scientific_name || '')
    .replaceAll('{{scientific_name}}', member.scientific_name || '');
}

export default function BatchSeoEditor({ group, members, existingRows, readOnly, schemaReady, onSaved, onClear }) {
  const [templates, setTemplates] = useState(defaults);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const publishedSelected = members.filter((member) => existingRows[member.catalog_key]?.status === 'published');
  const previews = useMemo(() => members.slice(0, 4).map((member) => ({
    id: member.id,
    name: member.name,
    title: applyTemplate(templates.seoTitle, member, group),
  })), [group, members, templates]);
  const blockedReason = group.category_conflict
    ? '这个基础组存在分类冲突，必须先复核源数据。'
    : publishedSelected.length
      ? `已选中 ${publishedSelected.length} 条已发布记录；在版本化草稿完成前禁止批量覆盖已发布 SEO。`
      : !schemaReady
        ? 'SEO schema 尚未应用，当前只能预览批量结果。'
        : '';

  const updateTemplate = (key, value) => setTemplates((current) => ({ ...current, [key]: value }));

  const saveDrafts = async () => {
    if (readOnly || blockedReason || members.length < 2) return;
    setSaving(true);
    setMessage('');
    const rows = members.map((member) => ({
      catalog_key: member.catalog_key,
      locale: 'zh-CN',
      seo_title: applyTemplate(templates.seoTitle, member, group),
      meta_description: applyTemplate(templates.metaDescription, member, group),
      h1: applyTemplate(templates.h1, member, group),
      status: 'draft',
    }));
    const { data, error } = await supabase
      .from('species_seo')
      .upsert(rows, { onConflict: 'catalog_key,locale' })
      .select('*');
    if (error) setMessage(`批量保存失败：${error.message}`);
    else {
      setMessage(`已生成并保存 ${data.length} 条 SEO Draft。`);
      onSaved(data);
    }
    setSaving(false);
  };
  return (
    <section className="batch-panel">
      <div className="batch-header">
        <div>
          <p className="eyebrow">BULK SEO</p>
          <h2>{group.base_scientific_name}</h2>
          <p>{members.length} 个同类 / 变种已选择。模板只替换 SEO 字段，不改水温、pH、兼容性等 Product Truth。</p>
        </div>
        <button className="ghost-button" type="button" onClick={onClear}>清除选择</button>
      </div>
      {blockedReason ? <div className="batch-warning">{blockedReason}</div> : null}
      <div className="batch-grid">
        <div className="batch-form">
          <label>SEO Title 模板
            <input value={templates.seoTitle} onChange={(event) => updateTemplate('seoTitle', event.target.value)} />
          </label>
          <label>Meta Description 模板
            <textarea rows="3" value={templates.metaDescription} onChange={(event) => updateTemplate('metaDescription', event.target.value)} />
          </label>
          <label>H1 模板
            <input value={templates.h1} onChange={(event) => updateTemplate('h1', event.target.value)} />
          </label>
          <p className="template-help">可用变量：{'{{name}}'} · {'{{variant_name}}'} · {'{{base_species}}'} · {'{{scientific_name}}'}</p>
        </div>
        <div className="batch-preview">
          <h3>批量生成预览</h3>
          {previews.map((item) => (
            <div className="batch-preview-row" key={item.id}>
              <strong>{item.name}</strong>
              <span>{item.title}</span>
            </div>
          ))}
          {members.length > previews.length ? <small>另有 {members.length - previews.length} 条将使用同一模板生成。</small> : null}
        </div>
      </div>
      <div className="batch-footer">
        <span>{message || (readOnly ? '远程 Review 只展示生成效果，不写入数据库。' : '批量保存只允许 Draft / 未发布记录。')}</span>
        <button
          className="primary-button"
          type="button"
          onClick={saveDrafts}
          disabled={readOnly || Boolean(blockedReason) || members.length < 2 || saving}
        >
          {readOnly ? '只读批量预览' : saving ? '批量保存中…' : `保存 ${members.length} 条 Draft`}
        </button>
      </div>
    </section>
  );
}
