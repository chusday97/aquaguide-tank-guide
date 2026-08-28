import { useMemo, useState } from 'react';
import { supabase } from './supabase.js';
import { resolveEffectiveSeo } from './seoInheritance.js';

export default function BatchSeoEditor({ group, members, existingRows, groupRecord, readOnly, schemaReady, onSaved, onClear }) {
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const publishedSelected = members.filter((member) => existingRows[member.catalog_key]?.status === 'published');
  const previews = useMemo(() => members.slice(0, 6).map((member) => {
    const resolved = resolveEffectiveSeo({
      member,
      group,
      groupRow: groupRecord,
      variantRow: existingRows[member.catalog_key],
    });
    return {
      id: member.id,
      name: member.name,
      title: resolved.effective.seoTitle,
      overridden: resolved.override.seoTitle,
    };
  }), [group, groupRecord, members, existingRows]);

  const blockedReason = group.category_conflict
    ? '这个基础组存在分类冲突，必须先复核源数据。'
    : publishedSelected.length
      ? `已选中 ${publishedSelected.length} 条已发布记录；版本化草稿完成前禁止批量覆盖。`
      : !schemaReady
        ? 'Variant SEO schema 尚未应用，当前只能预览继承结果。'
        : '';

  const saveDrafts = async () => {
    if (readOnly || blockedReason || members.length < 2) return;
    setSaving(true);
    setMessage('');
    const rows = members.map((member) => ({
      catalog_key: member.catalog_key,
      locale: 'zh-CN',
      status: 'draft',
    }));
    const { data, error } = await supabase
      .from('species_seo')
      .upsert(rows, { onConflict: 'catalog_key,locale' })
      .select('*');
    if (error) setMessage(`批量建立继承 Draft 失败：${error.message}`);
    else {
      setMessage(`已建立 ${data.length} 条 Variant Draft；未 Override 字段继续继承 Base SEO。`);
      onSaved(data);
    }
    setSaving(false);
  };

  return (
    <section className="batch-panel">
      <div className="batch-header">
        <div>
          <p className="eyebrow">BULK VARIANT SEO</p>
          <h2>{group.base_scientific_name}</h2>
          <p>{members.length} 个同类 / 变种已选择。这里建立继承 Draft，不复制 Base 文案到每一条记录。</p>
        </div>
        <button className="ghost-button" type="button" onClick={onClear}>清除选择</button>
      </div>
      {blockedReason ? <div className="batch-warning">{blockedReason}</div> : null}
      <div className="batch-preview inheritance-preview">
        <h3>继承结果预览</h3>
        {previews.map((item) => (
          <div className="batch-preview-row" key={item.id}>
            <strong>{item.name}</strong>
            <span>{item.title}</span>
            <small>{item.overridden ? 'Variant Override' : '继承 Base Template'}</small>
          </div>
        ))}
        {members.length > previews.length ? <small>另有 {members.length - previews.length} 条使用同一继承规则。</small> : null}
      </div>
      <div className="batch-footer">
        <span>{message || (readOnly ? '远程 Review 只展示继承结果，不写数据库。' : '批量操作只创建 Draft 状态，不覆盖现有 Variant Override。')}</span>
        <button
          className="primary-button"
          type="button"
          onClick={saveDrafts}
          disabled={readOnly || Boolean(blockedReason) || members.length < 2 || saving}
        >
          {readOnly ? '只读继承预览' : saving ? '建立 Draft 中…' : `建立 ${members.length} 条继承 Draft`}
        </button>
      </div>
    </section>
  );
}
