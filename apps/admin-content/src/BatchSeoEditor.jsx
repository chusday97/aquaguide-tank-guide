import { useMemo, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { resolveEffectiveSeo } from './seoInheritance.js';
import { assessDataReview } from './publishReadiness.js';
import { useAppLanguage } from './AppLanguage.jsx';

export default function BatchSeoEditor({ group, members, existingRows, groupRecord, locale = 'zh-CN', dataReviewRows = {}, readOnly, schemaReady, onSaved, onClear }) {
  const { appLocale } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const publishedSelected = members.filter((member) => existingRows[member.catalog_key]?.status === 'published');
  const dataReview = assessDataReview(group, dataReviewRows);
  const previews = useMemo(() => members.slice(0, 6).map((member) => {
    const resolved = resolveEffectiveSeo({
      member,
      group,
      groupRow: groupRecord,
      variantRow: existingRows[member.catalog_key],
      locale,
    });
    return {
      id: member.id,
      name: member.name,
      title: resolved.effective.seoTitle,
      overridden: resolved.override.seoTitle,
    };
  }), [group, groupRecord, members, existingRows, locale]);

  const blockedReason = !dataReview.ready
    ? `源数据复核尚未完成：${dataReview.blockers[0]}`
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
      locale,
      status: 'draft',
    }));
    const { data, error } = await adminContentClient
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
          <p className="eyebrow">BULK VARIANT SEO · {locale}</p>
          <h2>{group.base_scientific_name}</h2>
          <p>{isUiEnglish ? `${members.length} related records selected. This creates inherited Drafts without copying Base text into every Variant.` : `${members.length} 个同类 / 变种已选择。这里建立继承 Draft，不复制 Base 文案到每一条记录。`}</p>
        </div>
        <button className="ghost-button" type="button" onClick={onClear}>{isUiEnglish ? 'Clear selection' : '清除选择'}</button>
      </div>
      {blockedReason ? <div className="batch-warning">{blockedReason}</div> : null}
      <div className="batch-preview inheritance-preview">
        <h3>{isUiEnglish ? 'Inheritance preview' : '继承结果预览'}</h3>
        {previews.map((item) => (
          <div className="batch-preview-row" key={item.id}>
            <strong>{item.name}</strong>
            <span>{item.title}</span>
            <small>{item.overridden ? 'Variant Override' : (isUiEnglish ? 'Inherited Base Template' : '继承 Base Template')}</small>
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
          {readOnly ? (isUiEnglish ? 'Read-only inheritance preview' : '只读继承预览') : saving ? (isUiEnglish ? 'Creating Drafts…' : '建立 Draft 中…') : (isUiEnglish ? `Create ${members.length} inherited Drafts` : `建立 ${members.length} 条继承 Draft`)}
        </button>
      </div>
    </section>
  );
}
