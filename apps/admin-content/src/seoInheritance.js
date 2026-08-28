import { isEnglishLocale } from './localization.js';

const zhDefaults = {
  seoTitleTemplate: '{{name}}怎么养？水温、pH、混养与饲养指南',
  metaDescriptionTemplate: '了解{{name}}（{{base_species}}）的水温、pH、鱼缸环境、混养与日常饲养重点。',
  h1Template: '{{name}}饲养指南',
  sharedIntro: '',
  status: 'draft',
};

const enDefaults = {
  seoTitleTemplate: '{{name}} Care Guide: Water, Tank & Compatibility',
  metaDescriptionTemplate: 'Learn the water parameters, tank setup, compatibility and daily care essentials for {{name}} ({{base_species}}).',
  h1Template: '{{name}} Care Guide',
  sharedIntro: '',
  status: 'draft',
};

export const defaultGroupSeoForLocale = (locale = 'zh-CN') => (
  isEnglishLocale(locale) ? enDefaults : zhDefaults
);

export const defaultGroupSeo = zhDefaults;
export const groupSeoFromRow = (row, locale = 'zh-CN') => {
  const fallback = defaultGroupSeoForLocale(locale);
  return {
    seoTitleTemplate: row?.seo_title_template || fallback.seoTitleTemplate,
    metaDescriptionTemplate: row?.meta_description_template || fallback.metaDescriptionTemplate,
    h1Template: row?.h1_template || fallback.h1Template,
    sharedIntro: row?.shared_intro || '',
    status: row?.status || 'draft',
    version: row?.version,
  };
};

export function applySeoTemplate(template, member, group, variantRow) {
  const displayName = variantRow?.localized_name || member?.name || '';
  return String(template || '')
    .replaceAll('{{name}}', displayName)
    .replaceAll('{{variant_name}}', variantRow?.localized_name || member?.variant_label || member?.name || '')
    .replaceAll('{{base_species}}', group?.base_scientific_name || '')
    .replaceAll('{{scientific_name}}', member?.scientific_name || '');
}
export function resolveEffectiveSeo({ member, group, groupRow, variantRow, locale }) {
  const activeLocale = locale || variantRow?.locale || groupRow?.locale || 'zh-CN';
  const base = groupSeoFromRow(groupRow, activeLocale);
  const inherited = {
    seoTitle: applySeoTemplate(base.seoTitleTemplate, member, group, variantRow),
    metaDescription: applySeoTemplate(base.metaDescriptionTemplate, member, group, variantRow),
    h1: applySeoTemplate(base.h1Template, member, group, variantRow),
  };
  return {
    inherited,
    effective: {
      displayName: variantRow?.localized_name || member?.name || '',
      seoTitle: variantRow?.seo_title || inherited.seoTitle,
      metaDescription: variantRow?.meta_description || inherited.metaDescription,
      h1: variantRow?.h1 || inherited.h1,
      sharedIntro: base.sharedIntro,
      variantIntro: variantRow?.intro || '',
    },
    override: {
      localizedName: Boolean(variantRow?.localized_name),
      seoTitle: Boolean(variantRow?.seo_title),
      metaDescription: Boolean(variantRow?.meta_description),
      h1: Boolean(variantRow?.h1),
      intro: Boolean(variantRow?.intro),
    },
  };
}
