import { useEffect, useRef, useState } from 'react';
import { getLocaleLabel } from './localization.js';
import { useAppLanguage } from './AppLanguage.jsx';
import { getEditorElementLabel, getEditorElementMeta } from './editorElementRegistry.js';
import { getSpeciesPageLabels, localizeSpeciesTankSize } from './speciesPagePresentation.js';

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
  const baseContext = !variantOnly && !custom;
  const scope = baseContext ? 'Base Species' : (english ? 'Current page' : '当前页面');
  return `${scope} → ${section}`;
}
function Inspectable({ elementKey, selectedElement, hoveredElement, inspectEnabled, onSelect, onHover, labelLocale = 'zh-CN', children, className = '', readOnlyElement = false }) {
  const selected = selectedElement === elementKey;
  const hovered = inspectEnabled && hoveredElement === elementKey;
  return (
    <div
      className={`preview-inspectable ${readOnlyElement ? 'is-readonly' : 'is-editable'} ${selected ? 'is-selected' : ''} ${hovered ? 'is-hovered' : ''} ${className}`}
      data-preview-element={elementKey}
      onMouseEnter={() => inspectEnabled && onHover(elementKey)}
      onMouseLeave={() => inspectEnabled && onHover(null)}
      onClick={(event) => {
        if (!inspectEnabled) return;
        event.stopPropagation();
        onSelect(elementKey);
      }}
    >
      {selected || hovered ? <span className={`preview-element-tag ${readOnlyElement ? 'is-readonly' : ''} ${hovered && !selected ? 'is-hover' : ''}`}>{getEditorElementLabel(elementKey, labelLocale)}</span> : null}
      {children}
    </div>
  );
}

function SpeciesPage({ preview, mobile = false, inspector }) {
  const { species, effectiveSeo, locale } = preview;
  const labels = getSpeciesPageLabels(locale);
  const displayName = effectiveSeo.displayName || species.name;
  const imageSrc = species.image?.startsWith('/') ? `https://aqua-tank-guide.vercel.app${species.image}` : species.image;
  const imageAlt = effectiveSeo.imageAlt || `${displayName} (${species.scientific_name || ''})`;
  const intro = [effectiveSeo.sharedIntro, effectiveSeo.variantIntro].filter(Boolean).join('\n\n').trim();
  const inspectProps = (elementKey, className = '') => ({
    elementKey,
    className,
    readOnlyElement: Boolean(getEditorElementMeta(elementKey)?.readOnly || (elementKey === 'localizedName' && locale !== 'en')),
    ...inspector,
  });
  return (
    <article className={`live-species-page publish-structure ${mobile ? 'mobile' : ''}`}>
      <header className="live-site-header"><strong>AquaGuide</strong></header>
      <main className="live-publish-main">
        <div className="live-breadcrumb">
          AquaGuide / {labels.breadcrumb} / <Inspectable {...inspectProps('localizedName', 'preview-inline-name')}>{displayName}</Inspectable>
        </div>
        <article className="live-publish-hero">
          <Inspectable {...inspectProps('imageAlt', 'preview-image-inspectable')}>
            {imageSrc ? <img src={imageSrc} alt={imageAlt} /> : <div className="live-image-empty" />}
          </Inspectable>
          <div className="live-publish-copy">
            <Inspectable {...inspectProps('h1')}><h1>{effectiveSeo.h1 || ''}</h1></Inspectable>
            <Inspectable {...inspectProps('scientificName')}><div className="live-scientific">{species.scientific_name}</div></Inspectable>
            <Inspectable {...inspectProps('intro')}><p className="live-publish-intro">{intro}</p></Inspectable>
          </div>
        </article>
        <section className="live-facts publish-facts">
          <Inspectable {...inspectProps('temperature', 'live-fact')}><span>{labels.temperature}</span><strong>{species.water_temperature || '—'}</strong></Inspectable>
          <Inspectable {...inspectProps('ph', 'live-fact')}><span>{labels.ph}</span><strong>{species.ph_level || '—'}</strong></Inspectable>
          <Inspectable {...inspectProps('tankSize', 'live-fact')}><span>{labels.tank}</span><strong>{localizeSpeciesTankSize(species.tank_size, locale)}</strong></Inspectable>
          <Inspectable {...inspectProps('difficulty', 'live-fact')}><span>{labels.difficulty}</span><strong>{species.difficulty || '—'}</strong></Inspectable>
        </section>
        <section className="live-truth-note"><strong>{labels.truth}</strong><p>{labels.truthNote}</p></section>
      </main>
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

export default function LiveFrontendPreview({ preview, readiness, onGeneratePreview, readOnly = false, selectedElement, onSelectElement, editorScope = 'variant', compactOpen = false, onCloseCompact }) {
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

  if (!preview?.species) return <aside className={`live-preview-pane ${compactOpen ? 'compact-open' : ''}`}><div className="live-preview-empty">{t('preview.empty')}</div></aside>;
  const selectedLabel = selectedElement ? getEditorElementLabel(selectedElement, appLocale) : '';
  const selectedSource = selectedElement ? elementSource(selectedElement, preview, appLocale) : '';
  const selectedPath = selectedElement ? elementEditPath(selectedElement, preview, appLocale, editorScope) : '';
  const selectedReadOnly = Boolean(selectedElement && (getEditorElementMeta(selectedElement)?.readOnly || (selectedElement === 'localizedName' && preview?.locale !== 'en')));
  const inspector = {
    selectedElement,
    hoveredElement,
    inspectEnabled,
    onSelect: onSelectElement,
    onHover: setHoveredElement,
    labelLocale: appLocale,
  };

  return (
    <aside className={`live-preview-pane ${compactOpen ? 'compact-open' : ''}`} ref={paneRef}>
      <header className="live-preview-header">
        <div><strong>{t('preview.title')}</strong><small>{getLocaleLabel(preview.locale)}</small></div>
        <div className="preview-header-actions">
          <div className="preview-mode-tabs">
            {['page', 'google', 'mobile'].map((item) => <button key={item} type="button" className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>{item === 'page' ? t('preview.page') : item === 'google' ? t('preview.google') : t('preview.mobile')}</button>)}
          </div>
          <button type="button" className={`inspect-toggle ${inspectEnabled ? 'active' : ''}`} onClick={() => setInspectEnabled((value) => !value)}>
            {appLocale === 'en' ? 'Inspect' : '检查元素'}
          </button>
          <button type="button" className="compact-preview-close" onClick={onCloseCompact} aria-label={appLocale === 'en' ? 'Close preview' : '关闭预览'}>×</button>
        </div>
      </header>
      <div className="preview-readiness-row">
        <span className={`preview-readiness ${meta.tone}`}>{meta.label}{readiness?.blockers?.length ? ` · ${readiness.blockers.length} ${appLocale === 'en' ? 'items' : '项'}` : ''}</span>
        {readiness?.state === 'publish_ready' ? <button className="preview-generate-button" type="button" onClick={onGeneratePreview} disabled={readOnly}>{t('preview.generate')}</button> : <span className="preview-readiness-hint">{readiness?.state === 'blocked' ? t('preview.blockedHint') : t('preview.reviewHint')}</span>}
      </div>
      {selectedElement ? (
        <div className={`preview-inspector-status ${selectedReadOnly ? 'is-readonly' : 'is-editable'}`}>
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
