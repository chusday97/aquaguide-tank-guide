import { getLocaleLabel } from './localization.js';

const factLabels = {
  'zh-CN': { temperature: '水温', ph: 'pH', tank: '建议缸体', difficulty: '饲养难度', truth: '现有 Product Truth' },
  en: { temperature: 'Temperature', ph: 'pH', tank: 'Tank size', difficulty: 'Difficulty', truth: 'Existing Product Truth' },
};

export default function PublicSpeciesPreview({ species, locale, effectiveSeo, routeMeta }) {
  if (!species || !routeMeta) return null;
  const labels = locale === 'en' ? factLabels.en : factLabels['zh-CN'];
  const intro = [effectiveSeo.sharedIntro, effectiveSeo.variantIntro].filter(Boolean).join('\n\n')
    || species.product_description
    || (locale === 'en' ? 'Editorial introduction has not been written yet.' : '尚未填写编辑型简介。');

  return (
    <section className="public-preview-panel">
      <div className="public-preview-heading">
        <div>
          <p className="eyebrow">PUBLIC SPECIES PAGE PREVIEW · {getLocaleLabel(locale)}</p>
          <h3>填写后，公开页面会怎样变化</h3>
        </div>
        <span className={`robots-pill ${routeMeta.robots.startsWith('index') ? 'index' : 'noindex'}`}>{routeMeta.robots}</span>
      </div>
      <div className="route-contract-preview">
        <div><span>Public URL</span><code>{routeMeta.selfPath}</code></div>
        <div><span>Canonical</span><code>{routeMeta.canonicalPath}</code></div>
        <div><span>hreflang=en</span><code>{routeMeta.alternates.en}</code></div>
        <div><span>hreflang=zh-CN</span><code>{routeMeta.alternates['zh-CN']}</code></div>
        <div><span>x-default</span><code>{routeMeta.alternates['x-default']}</code></div>
      </div>
      {routeMeta.warning ? <div className="batch-warning">{routeMeta.warning}</div> : null}

      <article className="species-page-mock">
        <div className="species-page-breadcrumb">AquaGuide / Species / {effectiveSeo.displayName || species.name}</div>
        <div className="species-page-hero">
          <div className="species-page-image-placeholder">
            <span>Species image</span>
            <small>{species.catalog_key}</small>
          </div>
          <div className="species-page-copy">
            <span className="species-page-category">{species.category}</span>
            <h1>{effectiveSeo.h1 || effectiveSeo.displayName || species.name}</h1>
            <p className="scientific-name">{species.scientific_name}</p>
            <p className="species-page-intro">{intro}</p>
          </div>
        </div>
        <div className="species-fact-grid">
          <div><span>{labels.temperature}</span><strong>{species.water_temperature || '—'}</strong></div>
          <div><span>{labels.ph}</span><strong>{species.ph_level || '—'}</strong></div>
          <div><span>{labels.tank}</span><strong>{species.tank_size || '—'}</strong></div>
          <div><span>{labels.difficulty}</span><strong>{species.difficulty || '—'}</strong></div>
        </div>
        <div className="truth-note">
          <strong>{labels.truth}</strong>
          <span>{locale === 'en' ? 'These facts are read from the existing catalog; SEO editing does not rewrite them.' : '这些事实读取现有 catalog；SEO 编辑不会改写它们。'}</span>
        </div>
      </article>
    </section>
  );
}
