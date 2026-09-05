import { useEffect, useMemo, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { groupSeoFromRow } from './seoInheritance.js';
import { useAppLanguage } from './AppLanguage.jsx';
import { emitAdminNotice } from './AdminNoticeViewport.jsx';

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

  useEffect(() => {
    setSuggestion(null);
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
      emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Read-only demo' : '当前是只读演示', detail: isUiEnglish ? 'Translation was not requested.' : '不会调用翻译服务；正式管理员登录后才会请求 AI。' });
      return;
    }
    setBusy(true);
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
      const warnings = payload.warnings || [];
      emitAdminNotice({
        status: warnings.length ? 'warning' : 'success',
        title: isUiEnglish ? 'English suggestion generated' : '英文建议已生成',
        detail: warnings.length
          ? `${warnings[0]}${warnings.length > 1 ? ` · ${warnings.length - 1} more checks` : ''}`
          : `${payload.model || 'AI provider'} · ${isUiEnglish ? 'Review before saving.' : '请检查后再保存。'}`,
      });
    } catch (error) {
      emitAdminNotice({ status: 'error', title: isUiEnglish ? 'Translation failed' : '翻译失败', detail: error.message || (isUiEnglish ? 'The translation service did not complete.' : '翻译服务未完成。') });
    } finally {
      setBusy(false);
    }
  };

  const updateSuggestion = (key, value) => setSuggestion((current) => ({ ...current, [key]: value }));

  const saveEnglishDraft = async () => {
    if (readOnly) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Read-only demo' : '当前是只读演示', detail: isUiEnglish ? 'English Draft was not saved.' : '不会保存英文草稿。' }); return; }
    if (targetPublished) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Published content is locked' : '已发布内容当前不可覆盖', detail: isUiEnglish ? 'Generate a suggestion if needed, but create a versioned editing flow before overwriting Published content.' : '可以继续生成建议，但当前不能直接覆盖已发布 English 内容。' }); return; }
    if (!suggestion) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Generate a suggestion first' : '请先生成英文建议', detail: isUiEnglish ? 'There is no English content to save yet.' : '当前还没有可保存的英文建议。' }); return; }
    if (scope === 'base' && !groupSchemaReady) {
      emitAdminNotice({ status: 'error', title: isUiEnglish ? 'Save blocked' : '保存被阻止', detail: isUiEnglish ? 'Base Species SEO storage is not ready, so the English Draft cannot be saved.' : '基础模板 SEO 存储尚未就绪，不能保存英文草稿。' });
      return;
    }
    if (scope === 'variant' && !schemaReady) {
      emitAdminNotice({ status: 'error', title: isUiEnglish ? 'Save blocked' : '保存被阻止', detail: isUiEnglish ? 'Current-page SEO storage is not ready, so the English Draft cannot be saved.' : '当前页 SEO 存储尚未就绪，不能保存英文草稿。' });
      return;
    }
    setBusy(true);
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
      if (!error) onGroupSaved?.(data);
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
      if (!error) onVariantSaved?.(data);
    }
    setBusy(false);
  };

  return (
    <section className="translation-panel">
      <div className="translation-header">
        <div>
          <p className="eyebrow">ZH → EN TRANSLATION</p>
          <h2>{isUiEnglish ? 'Chinese → English content translation' : '中英文内容转化'}</h2>
          <p>{isUiEnglish ? 'Chinese is the source. AI creates English suggestions only; human review is required before saving an independent Draft.' : '中文是来源；AI 只生成英文建议，人工确认后保存为独立草稿。'}</p>
        </div>
        <div className="translation-scope-tabs">
          {group.member_count > 1 ? (
            <button type="button" className={scope === 'base' ? 'active' : ''} onClick={() => { setScope('base'); setSuggestion(null); }}>{isUiEnglish ? 'Base shared content' : '基础模板'}</button>
          ) : null}
          <button type="button" className={scope === 'variant' ? 'active' : ''} onClick={() => { setScope('variant'); setSuggestion(null); }}>{isUiEnglish ? 'Current Variant' : '当前 Variant'}</button>
        </div>
      </div>
      <div className="translation-rule-note">
        <strong>{isUiEnglish ? 'Protection rules:' : '保护规则：'}</strong>{isUiEnglish ? <> Scientific names and catalog keys are not translated; template tokens such as {'{{name}}'} must remain unchanged; empty overrides stay empty and Base content is not copied into the current page.</> : <> 科学名与 catalog key 不翻译；{'{{name}}'} 等模板变量必须原样保留；空自定义内容保持为空，不把基础模板内容复制进当前页面。</>}
      </div>
      {targetPublished ? <div className="batch-warning">{isUiEnglish ? 'The current English version is already published. Suggestions can still be generated, but published content cannot be overwritten directly.' : '当前英文版本已经发布。现阶段只允许生成建议，不允许直接覆盖已发布内容。'}</div> : null}
      <div className="translation-grid">
        <div className="translation-source">
          <h3>{isUiEnglish ? 'Chinese source' : '中文来源'}</h3>
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
      <div className="translation-footer">
        <span>{readOnly ? (isUiEnglish ? 'Read-only preview' : '只读预览') : (isUiEnglish ? 'Suggestions are not saved or published automatically.' : '生成建议不会自动保存或发布。')}</span>
        <div className="footer-actions">
          <button className="secondary-button" type="button" onClick={generate} disabled={busy}>
            {busy ? (isUiEnglish ? 'Processing…' : '处理中…') : (isUiEnglish ? 'Generate English suggestion from Chinese' : '从中文生成英文建议')}
          </button>
          <button className="primary-button" type="button" onClick={saveEnglishDraft} disabled={busy}>
            {isUiEnglish ? 'Save as English Draft' : '保存为英文草稿'}
          </button>
        </div>
      </div>
    </section>
  );
}
