import { useMemo, useState } from 'react';
import PublicSpeciesPreview from './PublicSpeciesPreview.jsx';
import { resolveEffectiveSeo } from './seoInheritance.js';
import { buildSpeciesSeoRouteMeta } from './seoRouteContract.js';
import { groupSeoRowKey, seoRowKey } from './localization.js';
import {
  buildDuplicateRecommendation,
  duplicateCandidateSignals,
  duplicateCompleteness,
  duplicateStatusLabel,
  formatDuplicateEditedAt,
} from './duplicateReviewEvidence.js';

function RecommendationReasons({ reasons, isUiEnglish }) {
  const labels = {
    source_primary: isUiEnglish ? 'Source relationship marks this as the primary record' : '源数据关系将其标记为主记录',
    approved: isUiEnglish ? 'More reviewed SEO content is already approved' : '已有更多 SEO 内容完成审核',
    completeness: isUiEnglish ? 'SEO content is more complete' : 'SEO 内容完整度更高',
    recent_edit: isUiEnglish ? 'More recent SEO editing activity (weak signal)' : '近期有 SEO 编辑记录（弱证据）',
  };
  return <ul>{reasons.map((reason) => <li key={reason}>{labels[reason]}</li>)}</ul>;
}

export default function DuplicateCandidateComparison({
  group, members = [], seoRows = {}, groupSeoRows = {}, locale = 'zh-CN',
  canonicalKey = '', onCanonicalChange, allowKeepSelection = false, isUiEnglish = false,
}) {
  const recommendation = useMemo(() => buildDuplicateRecommendation(members, seoRows), [members, seoRows]);
  const [previewCatalogKey, setPreviewCatalogKey] = useState(null);
  const [previewLocale, setPreviewLocale] = useState(locale);
  const previewContext = useMemo(() => {
    const member = members.find((item) => item.catalog_key === previewCatalogKey);
    if (!member || !group) return null;
    const variantRow = seoRows[seoRowKey(member.catalog_key, previewLocale)] || null;
    const groupRow = groupSeoRows[groupSeoRowKey(group.group_key, previewLocale)] || null;
    const effective = resolveEffectiveSeo({ member, group, groupRow, variantRow, locale: previewLocale }).effective;
    const routeMeta = buildSpeciesSeoRouteMeta({
      member, group, locale: previewLocale,
      indexStrategy: variantRow?.index_strategy || 'noindex',
      canonicalCatalogKey: variantRow?.canonical_catalog_key || '',
    });
    return { member, variantRow, effective, routeMeta };
  }, [previewCatalogKey, previewLocale, members, group, seoRows, groupSeoRows]);

  return <div className="duplicate-comparison-evidence">
    <div className="duplicate-recommendation">
      <span>{isUiEnglish ? 'Suggested page to keep' : '系统建议保留'}</span>
      <strong>{members.find((member) => member.catalog_key === recommendation.key)?.name || recommendation.key || '—'}</strong>
      <code>{recommendation.key || '—'}</code>
      <RecommendationReasons reasons={recommendation.reasons} isUiEnglish={isUiEnglish} />
    </div>
    <div className="duplicate-candidate-grid">
      {members.map((member) => {
        const signals = duplicateCandidateSignals(member, seoRows);
        const selectedAsCanonical = canonicalKey === member.catalog_key;
        const sourcePrimary = !member.duplicate_of_catalog_key && members.some((peer) => peer.duplicate_of_catalog_key === member.catalog_key);
        return <section className={`duplicate-candidate-card ${selectedAsCanonical && allowKeepSelection ? 'keep-selected' : ''}`} key={member.catalog_key}>
          <div className="duplicate-candidate-identity">
            <div className="duplicate-candidate-image">{member.image ? <img src={member.image} alt="" /> : <span>{member.name?.slice(0, 1) || '?'}</span>}</div>
            <div><strong>{member.name}</strong><em>{member.scientific_name}</em><code>{member.catalog_key}</code></div>
            {sourcePrimary ? <span className="duplicate-source-primary">{isUiEnglish ? 'Source primary' : '源主记录'}</span> : null}
          </div>
          <div className="duplicate-source-facts">
            <div><span>{isUiEnglish ? 'Category' : '分类'}</span><strong>{member.category || '—'}</strong></div>
            <div><span>{isUiEnglish ? 'Temperature' : '水温'}</span><strong>{member.water_temperature || '—'}</strong></div>
            <div><span>pH</span><strong>{member.ph_level || '—'}</strong></div>
            <div><span>{isUiEnglish ? 'Tank' : '缸体'}</span><strong>{member.tank_size || '—'}</strong></div>
          </div>
          {member.product_description ? <p className="duplicate-source-summary">{member.product_description}</p> : null}
          <div className="duplicate-editorial-signals">
            {[['zh-CN', signals.zh], ['en', signals.en]].map(([rowLocale, row]) => <div key={rowLocale}>
              <b>{rowLocale === 'en' ? 'EN' : '中文'}</b><span>{duplicateCompleteness(row, rowLocale)}%</span><em>{duplicateStatusLabel(row, isUiEnglish)}</em>
            </div>)}
          </div>
          <div className="duplicate-last-edited"><span>{isUiEnglish ? 'SEO last edited' : 'SEO 最近编辑'}</span><strong>{formatDuplicateEditedAt(signals.latestEditedAt, isUiEnglish)}</strong></div>
          <div className="duplicate-candidate-actions">
            <button type="button" className="secondary-button compact" onClick={() => { setPreviewLocale(locale); setPreviewCatalogKey(member.catalog_key); }}>{isUiEnglish ? 'Preview page' : '查看 Preview'}</button>
            {allowKeepSelection ? <button type="button" className={`duplicate-keep-action ${selectedAsCanonical ? 'active' : ''}`} onClick={() => onCanonicalChange?.(member.catalog_key)}>{selectedAsCanonical ? (isUiEnglish ? '✓ Keep this page' : '✓ 保留此页面') : (isUiEnglish ? 'Keep this page' : '保留此页面')}</button> : null}
          </div>
        </section>;
      })}
    </div>
    {previewContext ? <aside className="duplicate-preview-sheet" aria-label={isUiEnglish ? 'Duplicate candidate preview' : '重复候选页面预览'}>
      <header><div><span>{isUiEnglish ? 'Candidate preview' : '候选页面 Preview'}</span><strong>{previewContext.member.name} · {previewContext.member.catalog_key}</strong></div>
        <div className="duplicate-preview-actions"><button type="button" className={previewLocale === 'zh-CN' ? 'active' : ''} onClick={() => setPreviewLocale('zh-CN')}>中文</button><button type="button" className={previewLocale === 'en' ? 'active' : ''} onClick={() => setPreviewLocale('en')}>EN</button><button type="button" className="close" onClick={() => setPreviewCatalogKey(null)} aria-label={isUiEnglish ? 'Close preview' : '关闭预览'}>×</button></div>
      </header>
      <div className="duplicate-preview-meta"><span>{isUiEnglish ? 'SEO status' : 'SEO 状态'}: {duplicateStatusLabel(previewContext.variantRow, isUiEnglish)}</span><span>{isUiEnglish ? 'Completeness' : '完整度'}: {duplicateCompleteness(previewContext.variantRow, previewLocale)}%</span><span>{isUiEnglish ? 'SEO last edited' : 'SEO 最近编辑'}: {formatDuplicateEditedAt(previewContext.variantRow?.updated_at, isUiEnglish)}</span></div>
      <PublicSpeciesPreview species={previewContext.member} locale={previewLocale} effectiveSeo={previewContext.effective} routeMeta={previewContext.routeMeta} />
    </aside> : null}
  </div>;
}
