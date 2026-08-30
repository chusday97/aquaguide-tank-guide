import { useEffect, useRef, useState } from 'react';
import { getLocaleLabel } from './localization.js';
import { useAppLanguage } from './AppLanguage.jsx';
import { getEditorElementLabel, getEditorElementMeta } from './editorElementRegistry.js';

const stateMeta = {
  blocked: { label: 'Blocked', tone: 'blocked' },
  ready_for_review: { label: 'Ready for Review', tone: 'review' },
  publish_ready: { label: 'Preview-ready', tone: 'ready' },
};

function elementSource(key, preview, appLocale) {
  const english = appLocale === 'en';
  const readOnly = getEditorElementMeta(key)?.readOnly || (key === 'localizedName' && preview?.locale !== 'en');
  if (readOnly) return english ? 'Product Truth · Read only' : 'Product Truth · 只读';
  if (key === 'imageAlt') return preview?.effectiveSeo?.imageAlt ? (english ? 'Custom' : '自定义') : (english ? 'Not set' : '尚未填写');
  if (key === 'intro') return preview?.override?.intro
    ? (english ? 'Custom' : '自定义')
    : preview?.effectiveSeo?.sharedIntro
      ? (english ? 'Inherited from Base' : '继承自 Base')
      : (english ? 'Not set' : '尚未填写');
  if (key === 'localizedName') return preview?.override?.localizedName ? (english ? 'Custom' : '自定义') : (english ? 'Not customized' : '未自定义');
  return preview?.override?.[key] ? (english ? 'Custom' : '自定义') : (english ? 'Inherited from Base' : '继承自 Base');
}

function elementEditPath(key, preview, appLocale, editorScope) {
  const english = appLocale === 'en';
  const meta = getEditorElementMeta(key);
  const dynamicReadOnly = meta?.readOnly || (key === 'localizedName' && preview?.locale !== 'en');
  if (dynamicReadOnly) return english ? 'Product Truth → Read only' : 'Product Truth → 只读';
  const pageContent = key === 'intro' || key === 'imageAlt';
  const section = pageContent ? (english ? 'Page content' : '页面内容') : 'SEO';
  const variantOnly = key === 'imageAlt' || (key === 'localizedName' && preview?.locale === 'en');
  const custom = Boolean(preview?.override?.[key]);
  const baseContext = editorScope === 'base' && !variantOnly && !custom;
  const scope = baseContext ? 'Base Species' : (english ? 'Current page' : '当前页面');
  return `${scope} → ${section}`;
}
function Inspectable({ elementKey, selectedElement, hoveredElement, inspectEnabled, onSelect, onHover, labelLocale = 'zh-CN', children, className = '' }) {
  const selected = selectedElement === elementKey;
  const hovered = inspectEnabled && hoveredElement === elementKey;
  return (
    <div
      className={`preview-inspectable ${selected ? 'is-selected' : ''} ${hovered ? 'is-hovered' : ''} ${className}`}
      data-preview-element={elementKey}
      onMouseEnter={() => inspectEnabled && onHover(elementKey)}
      onMouseLeave={() => inspectEnabled && onHover(null)}
      onClick={(event) => {
        if (!inspectEnabled) return;
        event.stopPropagation();
        onSelect(elementKey);
      }}
    >
      {selected || hovered ? <span className={`preview-element-tag ${hovered && !selected ? 'is-hover' : ''}`}>{getEditorElementLabel(elementKey, labelLocale)}</span> : null}
      {children}
    </div>
  );
}

function SpeciesPage({ preview, mobile = false, inspector }) {
  const { species, effectiveSeo, locale } = preview;
  const imageSrc = species.image?.startsWith('/') ? `https://aqua-tank-guide.vercel.app${species.image}` : species.image;
  const intro = [effectiveSeo.sharedIntro, effectiveSeo.variantIntro].filter(Boolean).join('\n\n')
    || species.product_description
    || (locale === 'en' ? 'Editorial introduction has not been written yet.' : '尚未填写编辑型简介。');
  const inspectProps = (elementKey, className = '') => ({ elementKey, className, ...inspector });
  return (
    <article className={`live-species-page ${mobile ? 'mobile' : ''}`}>
      <div className="live-site-header"><strong>AquaGuide</strong><span>{preview.locale === 'en' ? 'Species Guide' : '物种指南'}</span></div>
      <div className="live-breadcrumb">Species · {species.category} · <Inspectable {...inspectProps('localizedName', 'preview-inline-name')}>{effectiveSeo.displayName || species.name}</Inspectable></div>
      <div className="live-hero">
        <Inspectable {...inspectProps('imageAlt', 'preview-image-inspectable')}>
          <img src={imageSrc} alt={effectiveSeo.imageAlt || effectiveSeo.displayName || species.name} />
        </Inspectable>
        <div className="live-hero-copy">
          <span className="live-kicker">{species.category}</span>
          <Inspectable {...inspectProps('h1')}><h1>{effectiveSeo.h1 || effectiveSeo.displayName || species.name}</h1></Inspectable>
          <Inspectable {...inspectProps('scientificName')}><em>{species.scientific_name}</em></Inspectable>
        </div>
      </div>
      <div className="live-facts">
        <Inspectable {...inspectProps('temperature')}><span>{locale === 'en' ? 'Temperature' : '水温'}</span><strong>{species.water_temperature || '—'}</strong></Inspectable>
        <Inspectable {...inspectProps('ph')}><span>pH</span><strong>{species.ph_level || '—'}</strong></Inspectable>
        <Inspectable {...inspectProps('tankSize')}><span>{locale === 'en' ? 'Tank' : '建议缸体'}</span><strong>{species.tank_size || '—'}</strong></Inspectable>
        <Inspectable {...inspectProps('difficulty')}><span>{locale === 'en' ? 'Care' : '难度'}</span><strong>{species.difficulty || '—'}</strong></Inspectable>
      </div>
      <div className="live-body">
        <h2>{locale === 'en' ? 'Overview & Care' : '物种概览与饲养'}</h2>
        <Inspectable {...inspectProps('intro')}><p>{intro}</p></Inspectable>
        <h2>{locale === 'en' ? 'Care essentials' : '饲养要点'}</h2>
        <p>{species.product_description || (locale === 'en' ? 'Care facts come from AquaGuide Product Truth.' : '饲养事实来自 AquaGuide Product Truth。')}</p>
      </div>
    </article>
  );
}
function GooglePreview({ preview, inspector }) {
  const { species, effectiveSeo, routeMeta } = preview;
  const inspectProps = (elementKey) => ({ elementKey, ...inspector });
  return (
    <div className="live-google-card">
      <div className="live-google-brand"><span>A</span><div><strong>AquaGuide</strong><small>aquaguide · {routeMeta?.selfPath}</small></div></div>
      <Inspectable {...inspectProps('seoTitle')}><h3>{effectiveSeo.seoTitle || effectiveSeo.displayName || species.name}</h3></Inspectable>
      <Inspectable {...inspectProps('metaDescription')}><p>{effectiveSeo.metaDescription || (preview.locale === 'en' ? 'Meta Description has not been written yet.' : '尚未填写 Meta Description。')}</p></Inspectable>
    </div>
  );
}

export default function LiveFrontendPreview({ preview, readiness, onGeneratePreview, readOnly = false, selectedElement, onSelectElement, editorScope = 'variant' }) {
  const { appLocale, t } = useAppLanguage();
  const [mode, setMode] = useState('page');
  const [hoveredElement, setHoveredElement] = useState(null);
  const [inspectEnabled, setInspectEnabled] = useState(true);
  const paneRef = useRef(null);
  const meta = appLocale === 'en'
    ? (stateMeta[readiness?.state] || stateMeta.blocked)
    : ({ blocked: { label: '已阻止', tone: 'blocked' }, ready_for_review: { label: '待审核', tone: 'review' }, publish_ready: { label: '可生成 Preview', tone: 'ready' } }[readiness?.state] || { label: '已阻止', tone: 'blocked' });

  useEffect(() => {
    const targetMode = getEditorElementMeta(selectedElement)?.previewMode;
    if (targetMode && targetMode !== mode) setMode(targetMode);
  }, [selectedElement]);
  useEffect(() => {
    if (!selectedElement) return;
    const targetMode = getEditorElementMeta(selectedElement)?.previewMode;
    if (targetMode && targetMode !== mode) return;
    const frame = requestAnimationFrame(() => {
      const target = paneRef.current?.querySelector(`[data-preview-element="${selectedElement}"]`);
      target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedElement, mode]);

  if (!preview?.species) return <aside className="live-preview-pane"><div className="live-preview-empty">{t('preview.empty')}</div></aside>;
  const selectedLabel = selectedElement ? getEditorElementLabel(selectedElement, appLocale) : '';
  const selectedSource = selectedElement ? elementSource(selectedElement, preview, appLocale) : '';
  const selectedPath = selectedElement ? elementEditPath(selectedElement, preview, appLocale, editorScope) : '';
  const inspector = {
    selectedElement,
    hoveredElement,
    inspectEnabled,
    onSelect: onSelectElement,
    onHover: setHoveredElement,
    labelLocale: appLocale,
  };

  return (
    <aside className="live-preview-pane" ref={paneRef}>
      <header className="live-preview-header">
        <div><strong>{t('preview.title')}</strong><small>{getLocaleLabel(preview.locale)}</small></div>
        <div className="preview-header-actions">
          <div className="preview-mode-tabs">
            {['page', 'google', 'mobile'].map((item) => <button key={item} type="button" className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>{item === 'page' ? t('preview.page') : item === 'google' ? t('preview.google') : t('preview.mobile')}</button>)}
          </div>
          <button type="button" className={`inspect-toggle ${inspectEnabled ? 'active' : ''}`} onClick={() => setInspectEnabled((value) => !value)}>
            {appLocale === 'en' ? 'Inspect' : '检查元素'}
          </button>
        </div>
      </header>
      <div className="preview-readiness-row">
        <span className={`preview-readiness ${meta.tone}`}>{meta.label}{readiness?.blockers?.length ? ` · ${readiness.blockers.length} ${appLocale === 'en' ? 'items' : '项'}` : ''}</span>
        {readiness?.state === 'publish_ready' ? <button className="preview-generate-button" type="button" onClick={onGeneratePreview} disabled={readOnly}>{t('preview.generate')}</button> : <span className="preview-readiness-hint">{readiness?.state === 'blocked' ? t('preview.blockedHint') : t('preview.reviewHint')}</span>}
      </div>
      {selectedElement ? (
        <div className="preview-inspector-status">
          <strong>{selectedLabel}</strong>
          <span>{selectedSource}</span>
          <span className="preview-inspector-path">{selectedPath}</span>
        </div>
      ) : null}
      <div className={`live-preview-canvas ${mode === 'mobile' ? 'is-mobile' : ''}`}>
        {mode === 'google'
          ? <GooglePreview preview={preview} inspector={inspector} />
          : <SpeciesPage preview={preview} mobile={mode === 'mobile'} inspector={inspector} />}
      </div>
      <footer className="live-preview-footer">{t('preview.previewOnly')}</footer>
    </aside>
  );
}
