export const EDITOR_ELEMENT_REGISTRY = {
  localizedName: {
    previewMode: 'page', editorField: 'localizedName',
    label: { 'zh-CN': '物种名称', en: 'Species name' },
  },
  h1: {
    previewMode: 'page', editorField: 'h1',
    label: { 'zh-CN': '页面 H1', en: 'Page H1' },
  },
  intro: {
    previewMode: 'page', editorField: 'intro',
    label: { 'zh-CN': '页面简介', en: 'Introduction' },
  },
  imageAlt: {
    previewMode: 'page', editorField: 'imageAlt',
    label: { 'zh-CN': '主图', en: 'Hero image' },
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