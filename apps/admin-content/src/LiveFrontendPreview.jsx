import { useState } from 'react';
import { getLocaleLabel } from './localization.js';
import { useAppLanguage } from './AppLanguage.jsx';

const stateMeta = {
  blocked: { label: 'Blocked', tone: 'blocked' },
  ready_for_review: { label: 'Ready for Review', tone: 'review' },
  publish_ready: { label: 'Preview-ready', tone: 'ready' },
};

function SpeciesPage({ preview, mobile = false }) {
  const { species, effectiveSeo, locale } = preview;
  const imageSrc = species.image?.startsWith('/') ? `https://aqua-tank-guide.vercel.app${species.image}` : species.image;
  const intro = [effectiveSeo.sharedIntro, effectiveSeo.variantIntro].filter(Boolean).join('\n\n')
    || species.product_description
    || (locale === 'en' ? 'Editorial introduction has not been written yet.' : '尚未填写编辑型简介。');
  return (
    <article className={`live-species-page ${mobile ? 'mobile' : ''}`}>
      <div className="live-site-header"><strong>AquaGuide</strong><span>{preview.locale === 'en' ? 'Species Guide' : '物种指南'}</span></div>
      <div className="live-breadcrumb">Species · {species.category} · {effectiveSeo.displayName || species.name}</div>
      <div className="live-hero">
        <img src={imageSrc} alt={effectiveSeo.imageAlt || effectiveSeo.displayName || species.name} />
        <div className="live-hero-copy">
          <span className="live-kicker">{species.category}</span>
          <h1>{effectiveSeo.h1 || effectiveSeo.displayName || species.name}</h1>
          <em>{species.scientific_name}</em>
        </div>
      </div>
      <div className="live-facts">
        <div><span>{locale === 'en' ? 'Temperature' : '水温'}</span><strong>{species.water_temperature || '—'}</strong></div>
        <div><span>pH</span><strong>{species.ph_level || '—'}</strong></div>
        <div><span>{locale === 'en' ? 'Tank' : '建议缸体'}</span><strong>{species.tank_size || '—'}</strong></div>
        <div><span>{locale === 'en' ? 'Care' : '难度'}</span><strong>{species.difficulty || '—'}</strong></div>
      </div>
      <div className="live-body">
        <h2>{locale === 'en' ? 'Overview & Care' : '物种概览与饲养'}</h2>
        <p>{intro}</p>
        <h2>{locale === 'en' ? 'Care essentials' : '饲养要点'}</h2>
        <p>{species.product_description || (locale === 'en' ? 'Care facts come from AquaGuide Product Truth.' : '饲养事实来自 AquaGuide Product Truth。')}</p>
      </div>
    </article>
  );
}

function GooglePreview({ preview }) {
  const { species, effectiveSeo, routeMeta } = preview;
  return (
    <div className="live-google-card">
      <div className="live-google-brand"><span>A</span><div><strong>AquaGuide</strong><small>aquaguide · {routeMeta?.selfPath}</small></div></div>
      <h3>{effectiveSeo.seoTitle || effectiveSeo.displayName || species.name}</h3>
      <p>{effectiveSeo.metaDescription || (preview.locale === 'en' ? 'Meta Description has not been written yet.' : '尚未填写 Meta Description。')}</p>
    </div>
  );
}

export default function LiveFrontendPreview({ preview, readiness, onGeneratePreview, readOnly = false }) {
  const { appLocale, t } = useAppLanguage();
  const [mode, setMode] = useState('page');
  const meta = appLocale === 'en'
    ? (stateMeta[readiness?.state] || stateMeta.blocked)
    : ({ blocked: { label: '已阻止', tone: 'blocked' }, ready_for_review: { label: '待审核', tone: 'review' }, publish_ready: { label: '可生成 Preview', tone: 'ready' } }[readiness?.state] || { label: '已阻止', tone: 'blocked' });
  if (!preview?.species) return <aside className="live-preview-pane"><div className="live-preview-empty">{t('preview.empty')}</div></aside>;
  return (
    <aside className="live-preview-pane">
      <header className="live-preview-header">
        <div><strong>{t('preview.title')}</strong><small>{getLocaleLabel(preview.locale)}</small></div>
        <div className="preview-mode-tabs">
          {['page', 'google', 'mobile'].map((item) => <button key={item} type="button" className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>{item === 'page' ? t('preview.page') : item === 'google' ? t('preview.google') : t('preview.mobile')}</button>)}
        </div>
      </header>
      <div className="preview-readiness-row">
        <span className={`preview-readiness ${meta.tone}`}>{meta.label}{readiness?.blockers?.length ? ` · ${readiness.blockers.length} ${appLocale === 'en' ? 'items' : '项'}` : ''}</span>
        {readiness?.state === 'publish_ready' ? <button className="preview-generate-button" type="button" onClick={onGeneratePreview} disabled={readOnly}>{t('preview.generate')}</button> : <span className="preview-readiness-hint">{readiness?.state === 'blocked' ? t('preview.blockedHint') : t('preview.reviewHint')}</span>}
      </div>
      <div className={`live-preview-canvas ${mode === 'mobile' ? 'is-mobile' : ''}`}>
        {mode === 'google' ? <GooglePreview preview={preview} /> : <SpeciesPage preview={preview} mobile={mode === 'mobile'} />}
      </div>
      <footer className="live-preview-footer">{t('preview.previewOnly')}</footer>
    </aside>
  );
}
