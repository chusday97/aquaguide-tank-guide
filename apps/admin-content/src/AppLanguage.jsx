import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'aquaguide-admin-app-locale';
const AppLanguageContext = createContext(null);

const zh = {
  common: { chinese: '中文', english: 'English', all: '全部', issues: '问题', review: '待审核', ready: 'Ready', clear: '清除', save: '保存', saving: '保存中…', readonly: '只读', draft: 'Draft', published: 'Published', archived: 'Archived' },
  top: { product: 'AquaGuide Content', section: 'Species SEO', dataReview: '数据复核', awaiting: '待审核', previewReady: 'Preview-ready', reviewMode: '只读 Review', admin: 'Admin', signOut: '退出', interfaceLanguage: '界面语言' },
  sidebar: { content: '内容', species: '物种', records: '条记录', batchGroups: '个可批量组', workflowFilter: '工作流筛选', search: '搜索名称、学名、变种或 key…', allCategories: '全部种类', noMatch: '没有匹配的基础物种组。', pages: '个页面', baseSpecies: 'Base Species', inheritsBase: '继承 Base', dataIssue: '存在数据复核事项' },
  editor: { base: 'Base Species', currentPage: '当前页面', contentVersion: '内容版本', seo: 'SEO', pageContent: '页面内容', advancedSeo: '高级 SEO', metaTitle: 'Meta 标题', metaDescription: 'Meta 描述', h1: '页面 H1', focusKeyword: 'Focus Keyword', sharedIntro: 'Base Species 共享简介', variantIntro: 'Variant 简介 / 差异补充', imageAlt: '图片 Alt', indexUrl: '索引与 URL', indexStrategy: '索引策略', canonicalTarget: 'Canonical 目标', publicUrl: 'Public URL', canonical: 'Canonical', sourceReview: '数据复核', publishCheck: '发布检查', translation: '中英文转化', batchSeo: '批量 SEO', history: '版本历史', workflow: '工作队列' },
  preview: { title: '效果预览', page: '页面', google: 'Google', mobile: '手机', empty: '选择 Species 后查看前端效果。', generate: '生成 Preview', blockedHint: '完成阻塞项后可生成 Preview', reviewHint: '完成审核后可生成 Preview', previewOnly: '仅预览 · Noindex · Product Truth 只读', overview: '物种概览与饲养', care: '饲养要点', temperature: '水温', tank: '建议缸体', difficulty: '难度' },
};
const en = {
  common: { chinese: '中文', english: 'English', all: 'All', issues: 'Issues', review: 'Awaiting Review', ready: 'Ready', clear: 'Clear', save: 'Save', saving: 'Saving…', readonly: 'Read-only', draft: 'Draft', published: 'Published', archived: 'Archived' },
  top: { product: 'AquaGuide Content', section: 'Species SEO', dataReview: 'Data Review', awaiting: 'Awaiting Review', previewReady: 'Preview-ready', reviewMode: 'Read-only Review', admin: 'Admin', signOut: 'Sign out', interfaceLanguage: 'Interface language' },
  sidebar: { content: 'Content', species: 'Species', records: 'records', batchGroups: 'batch groups', workflowFilter: 'Workflow filter', search: 'Search name, scientific name, variant or key…', allCategories: 'All categories', noMatch: 'No matching Base Species groups.', pages: 'pages', baseSpecies: 'Base Species', inheritsBase: 'Inherits Base', dataIssue: 'Data review required' },
  editor: { base: 'Base Species', currentPage: 'Current page', contentVersion: 'Content version', seo: 'SEO', pageContent: 'Page content', advancedSeo: 'Advanced SEO', metaTitle: 'Meta Title', metaDescription: 'Meta Description', h1: 'Page H1', focusKeyword: 'Focus Keyword', sharedIntro: 'Base Species shared intro', variantIntro: 'Variant intro / differences', imageAlt: 'Image Alt', indexUrl: 'Indexing & URL', indexStrategy: 'Index strategy', canonicalTarget: 'Canonical target', publicUrl: 'Public URL', canonical: 'Canonical', sourceReview: 'Data Review', publishCheck: 'Publish readiness', translation: 'Chinese → English', batchSeo: 'Batch SEO', history: 'Revision history', workflow: 'Work queues' },
  preview: { title: 'Preview', page: 'Page', google: 'Google', mobile: 'Mobile', empty: 'Select a Species to see the frontend result.', generate: 'Generate Preview', blockedHint: 'Resolve blockers to generate a Preview', reviewHint: 'Complete review to generate a Preview', previewOnly: 'Preview only · Noindex · Product Truth read-only', overview: 'Overview & Care', care: 'Care essentials', temperature: 'Temperature', tank: 'Tank', difficulty: 'Difficulty' },
};

const dictionaries = { 'zh-CN': zh, en };
const readPath = (source, path) => path.split('.').reduce((value, key) => value?.[key], source);

export function AppLanguageProvider({ children }) {
  const [appLocale, setLocale] = useState(() => localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'zh-CN');
  const setAppLocale = useCallback((locale) => {
    const next = locale === 'en' ? 'en' : 'zh-CN';
    localStorage.setItem(STORAGE_KEY, next);
    setLocale(next);
  }, []);  useEffect(() => {
    document.documentElement.lang = appLocale === 'en' ? 'en' : 'zh-CN';
  }, [appLocale]);

  const t = useCallback((path) => readPath(dictionaries[appLocale], path) ?? readPath(zh, path) ?? path, [appLocale]);
  const value = useMemo(() => ({ appLocale, setAppLocale, t }), [appLocale, setAppLocale, t]);
  return <AppLanguageContext.Provider value={value}>{children}</AppLanguageContext.Provider>;
}

export function useAppLanguage() {
  const context = useContext(AppLanguageContext);
  if (!context) throw new Error('useAppLanguage must be used inside AppLanguageProvider');
  return context;
}
