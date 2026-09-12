export const EDITOR_ELEMENT_REGISTRY = {
  localizedName: {
    previewMode: 'page', editorField: 'localizedName',
    label: { 'zh-CN': '物种名称', en: 'Species name' },
  },
  h1: {
    previewMode: 'page', editorField: 'h1',
    label: { 'zh-CN': '页面 H1', en: 'Page H1' },
  },
  sharedIntro: {
    previewMode: 'page', editorField: 'intro', scope: 'base',
    label: { 'zh-CN': '基础模板简介', en: 'Base introduction' },
  },
  variantIntro: {
    previewMode: 'page', editorField: 'intro', scope: 'variant',
    label: { 'zh-CN': '当前页补充', en: 'Page-specific addition' },
  },
  intro: {
    previewMode: 'page', editorField: 'intro', scope: 'variant', legacyAlias: true,
    label: { 'zh-CN': '当前页补充', en: 'Page-specific addition' },
  },
  imageAlt: {
    previewMode: 'page', editorField: 'imageAlt',
    label: { 'zh-CN': '主图 Alt 文本', en: 'Hero image alt text' },
    assetReadOnly: true,
  },
  seoTitle: {
    previewMode: 'google', editorField: 'seoTitle',
    label: { 'zh-CN': 'SEO 标题', en: 'SEO title' },
  },
  metaDescription: {
    previewMode: 'google', editorField: 'metaDescription',
    label: { 'zh-CN': 'Meta 描述', en: 'Meta description' },
  },  scientificName: {
    previewMode: 'page', readOnly: true,
    label: { 'zh-CN': '学名', en: 'Scientific name' },
  },
  temperature: {
    previewMode: 'page', readOnly: true,
    label: { 'zh-CN': '水温', en: 'Temperature' },
  },
  ph: {
    previewMode: 'page', readOnly: true,
    label: { 'zh-CN': 'pH', en: 'pH' },
  },
  tankSize: {
    previewMode: 'page', readOnly: true,
    label: { 'zh-CN': '建议缸体', en: 'Tank size' },
  },
  difficulty: {
    previewMode: 'page', readOnly: true,
    label: { 'zh-CN': '难度', en: 'Difficulty' },
  },
};

export const getEditorElementMeta = (key) => EDITOR_ELEMENT_REGISTRY[key] || null;
export const getEditorElementLabel = (key, locale = 'zh-CN') => (
  getEditorElementMeta(key)?.label?.[locale === 'en' ? 'en' : 'zh-CN'] || key || ''
);