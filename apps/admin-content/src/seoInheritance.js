export const defaultGroupSeo = {
  seoTitleTemplate: '{{name}}怎么养？水温、pH、混养与饲养指南',
  metaDescriptionTemplate: '了解{{name}}（{{base_species}}）的水温、pH、鱼缸环境、混养与日常饲养重点。',
  h1Template: '{{name}}饲养指南',
  sharedIntro: '',
  status: 'draft',
};

export const groupSeoFromRow = (row) => ({
  seoTitleTemplate: row?.seo_title_template || defaultGroupSeo.seoTitleTemplate,
  metaDescriptionTemplate: row?.meta_description_template || defaultGroupSeo.metaDescriptionTemplate,
  h1Template: row?.h1_template || defaultGroupSeo.h1Template,
  sharedIntro: row?.shared_intro || '',
  status: row?.status || 'draft',
  version: row?.version,
});

export function applySeoTemplate(template, member, group) {
  return String(template || '')
    .replaceAll('{{name}}', member?.name || '')
    .replaceAll('{{variant_name}}', member?.variant_label || member?.name || '')
    .replaceAll('{{base_species}}', group?.base_scientific_name || '')
    .replaceAll('{{scientific_name}}', member?.scientific_name || '');
}

export function resolveEffectiveSeo({ member, group, groupRow, variantRow }) {
  const base = groupSeoFromRow(groupRow);
  const inherited = {
    seoTitle: applySeoTemplate(base.seoTitleTemplate, member, group),
    metaDescription: applySeoTemplate(base.metaDescriptionTemplate, member, group),
    h1: applySeoTemplate(base.h1Template, member, group),
  };
  return {
    inherited,
    effective: {
      seoTitle: variantRow?.seo_title || inherited.seoTitle,
      metaDescription: variantRow?.meta_description || inherited.metaDescription,
      h1: variantRow?.h1 || inherited.h1,
      sharedIntro: base.sharedIntro,
      variantIntro: variantRow?.intro || '',
    },
    override: {
      seoTitle: Boolean(variantRow?.seo_title),
      metaDescription: Boolean(variantRow?.meta_description),
      h1: Boolean(variantRow?.h1),
      intro: Boolean(variantRow?.intro),
    },
  };
}
