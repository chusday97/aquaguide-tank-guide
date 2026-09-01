import { useEffect, useMemo, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { groupSeoFromRow } from './seoInheritance.js';
import { useAppLanguage } from './AppLanguage.jsx';

const baseFields = [
  ['seoTitleTemplate', 'SEO Title Template'],
  ['metaDescriptionTemplate', 'Meta Description Template'],
  ['h1Template', 'H1 Template'],
  ['sharedIntro', 'Shared Intro'],
];

const variantFields = [
  ['localizedName', 'English Common Name'],
  ['seoTitle', 'SEO Title Override'],
  ['metaDescription', 'Meta Description Override'],
  ['h1', 'H1 Override'],
  ['intro', 'Variant Intro'],
  ['imageAlt', 'Image Alt'],
  ['focusKeyword', 'Focus Keyword'],
];

export default function TranslationPanel({
  species, group, sourceVariantRow, sourceGroupRow, targetVariantRow, targetGroupRow,
  readOnly, schemaReady, groupSchemaReady, onVariantSaved, onGroupSaved,
}) {
  const { appLocale } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const [scope, setScope] = useState(group?.member_count > 1 ? 'base' : 'variant');
  const [suggestion, setSuggestion] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    setSuggestion(null);
    setMessage('');
    setWarnings([]);
    setScope(group?.member_count > 1 ? 'base' : 'variant');
  }, [species?.id, group?.group_key]);

  const source = useMemo(() => {
    if (scope === 'base') return groupSeoFromRow(sourceGroupRow, 'zh-CN');
    return {
      localizedName: species?.name || '',
      seoTitle: sourceVariantRow?.seo_title || '',
      metaDescription: sourceVariantRow?.meta_description || '',
      h1: sourceVariantRow?.h1 || '',
      intro: sourceVariantRow?.intro || '',
      imageAlt: sourceVariantRow?.image_alt || '',
      focusKeyword: sourceVariantRow?.focus_keyword || species?.name || '',
    };
  }, [scope, sourceGroupRow, sourceVariantRow, species]);

  if (!species || !group) return null;
  const fields = scope === 'base' ? baseFields : variantFields;
  const targetPublished = scope === 'base'
    ? targetGroupRow?.status === 'published'
    : targetVariantRow?.status === 'published';

  const generate = async () => {
    if (readOnly) {
      setMessage('只读 Review 不调用翻译服务；正式管理员登录后才会请求 AI。');
      return;
    }
    setBusy(true);
    setMessage('');
    setWarnings([]);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope,
          source,
          context: {
            speciesName: species.name,
            scientificName: species.scientific_name,
            baseScientificName: group.base_scientific_name,
            category: species.category,
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.ok) throw new Error(payload?.error || 'Translation failed');
      setSuggestion(payload.data);
      setWarnings(payload.warnings || []);
      setMessage(`已生成 English 建议 · ${payload.model || 'AI provider'}。请检查后再保存。`);
    } catch (error) {
      setMessage(error.message || '翻译失败。');
    } finally {
      setBusy(false);
    }
  };

  const updateSuggestion = (key, value) => setSuggestion((current) => ({ ...current, [key]: value }));

  const saveEnglishDraft = async () => {
    if (!suggestion || readOnly || targetPublished) return;
    if (scope === 'base' && !groupSchemaReady) {
      setMessage('Base Species SEO schema 尚未应用，不能保存 English Draft。');
      return;
    }
    if (scope === 'variant' && !schemaReady) {
      setMessage('Variant SEO schema 尚未应用，不能保存 English Draft。');
      return;
    }
    setBusy(true);
    setMessage('');
    if (scope === 'base') {
      const row = {
        group_key: group.group_key,
        locale: 'en',
        seo_title_template: suggestion.seoTitleTemplate,
        meta_description_template: suggestion.metaDescriptionTemplate,
        h1_template: suggestion.h1Template,
        shared_intro: suggestion.sharedIntro,
        status: 'draft',
      };
      const { data, error } = await adminContentClient.from('species_seo_groups').upsert(row, { onConflict: 'group_key,locale' }).select('*').single();
      if (error) setMessage(`English Base Draft 保存失败：${error.message}`);
      else { setMessage('English Base Draft 已保存，不影响中文版本。'); onGroupSaved?.(data); }
    } else {
      const row = {
        catalog_key: species.catalog_key,
        locale: 'en',
        localized_name: suggestion.localizedName,
        seo_title: suggestion.seoTitle,
        meta_description: suggestion.metaDescription,
        h1: suggestion.h1,
        intro: suggestion.intro,
        image_alt: suggestion.imageAlt,
        focus_keyword: suggestion.focusKeyword,
        index_strategy: targetVariantRow?.index_strategy || 'noindex',
        canonical_catalog_key: targetVariantRow?.canonical_catalog_key || '',
        status: 'draft',
      };
      const { data, error } = await adminContentClient.from('species_seo').upsert(row, { onConflict: 'catalog_key,locale' }).select('*').single();
      if (error) setMessage(`English Variant Draft 保存失败：${error.message}`);
      else { setMessage('English Variant Draft 已保存，不影响中文版本。'); onVariantSaved?.(data); }
    }
    setBusy(false);
  };

  return (
    <section className="translation-panel">
      <div className="translation-header">
        <div>
          <p className="eyebrow">ZH → EN TRANSLATION</p>
          <h2>{isUiEnglish ? 'Chinese → English content translation' : '中英文内容转化'}</h2>
          <p>{isUiEnglish ? 'Chinese is the source. AI creates English suggestions only; human review is required before saving an independent Draft.' : '中文是 Source；AI 只生成 English 建议，人工确认后保存为独立 Draft。'}</p>
        </div>
        <div className="translation-scope-tabs">
          {group.member_count > 1 ? (
            <button type="button" className={scope === 'base' ? 'active' : ''} onClick={() => { setScope('base'); setSuggestion(null); }}>{isUiEnglish ? 'Base shared content' : 'Base 公共内容'}</button>
          ) : null}
          <button type="button" className={scope === 'variant' ? 'active' : ''} onClick={() => { setScope('variant'); setSuggestion(null); }}>{isUiEnglish ? 'Current Variant' : '当前 Variant'}</button>
        </div>
      </div>
      <div className="translation-rule-note">
        <strong>{isUiEnglish ? 'Protection rules:' : '保护规则：'}</strong> 科学名与 catalog key 不翻译；{'{{name}}'} 等模板变量必须原样保留；空 Override 保持为空，不把 Base 内容复制进 Variant。
      </div>
      {targetPublished ? <div className="batch-warning">English 当前版本已经 Published。现阶段只允许生成建议，不允许直接覆盖已发布内容。</div> : null}
      <div className="translation-grid">
        <div className="translation-source">
          <h3>{isUiEnglish ? 'Chinese source' : '中文 Source'}</h3>
          {fields.map(([key, label]) => (
            <label key={key}>
              {label}
              <textarea rows={key.includes('Intro') || key === 'intro' ? 4 : 2} value={source[key] || ''} readOnly />
            </label>
          ))}
        </div>
        <div className="translation-target">
          <h3>English Suggestion</h3>
          {fields.map(([key, label]) => (
            <label key={key}>
              {label}
              <textarea
                rows={key.includes('Intro') || key === 'intro' ? 4 : 2}
                value={suggestion?.[key] || ''}
                placeholder={isUiEnglish ? 'Generate a translation suggestion first' : '先生成翻译建议'}
                onChange={(event) => updateSuggestion(key, event.target.value)}
                disabled={!suggestion}
              />
            </label>
          ))}
        </div>
      </div>
      {warnings.map((item) => <div className="translation-warning" key={item}>{item}</div>)}
      <div className="translation-footer">
        <span>{message || (readOnly ? '只读 Review：不请求 AI，也不会写内容存储。' : '生成建议不会自动保存或发布。')}</span>
        <div className="footer-actions">
          <button className="secondary-button" type="button" onClick={generate} disabled={busy || readOnly}>
            {busy ? (isUiEnglish ? 'Processing…' : '处理中…') : (isUiEnglish ? 'Generate English suggestion from Chinese' : '从中文生成 English 建议')}
          </button>
          <button className="primary-button" type="button" onClick={saveEnglishDraft} disabled={busy || readOnly || !suggestion || targetPublished}>
            {isUiEnglish ? 'Save as English Draft' : '保存为 English Draft'}
          </button>
        </div>
      </div>
    </section>
  );
}
