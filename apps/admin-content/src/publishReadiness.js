import { resolveEffectiveSeo } from './seoInheritance.js';

export const REVIEW_STATES = [
  { value: 'editing', label: 'Editing' },
  { value: 'ready_for_review', label: 'Ready for Review' },
  { value: 'approved', label: 'Approved' },
];

export const categoryIssueKey = (group) => `category:${group?.group_key || ''}`;

export function dataReviewMap(rows = []) {
  return Object.fromEntries((rows || []).map((row) => [row.issue_key, row]));
}

export function assessDataReview(group, reviewRows = {}) {
  const blockers = [];
  const categoryReview = group?.category_conflict ? reviewRows[categoryIssueKey(group)] : null;
  if (group?.category_conflict && categoryReview?.decision !== 'accepted_as_is') {
    blockers.push(categoryReview?.decision === 'source_correction_required'
      ? '分类冲突已判定需要修正源数据；修正完成前保持阻止。'
      : '分类冲突尚未完成人工结论。');
  }

  for (const set of group?.duplicate_sets || []) {
    const review = reviewRows[set.duplicate_set_key];
    if (!review) blockers.push(`重复集 ${set.member_ids.join(' / ')} 尚未人工确认。`);
    else if (review.decision === 'duplicate_records' && !set.member_ids.includes(review.canonical_catalog_key)) {
      blockers.push(`重复集 ${set.member_ids.join(' / ')} 的 canonical 目标无效。`);
    }
  }
  return { ready: blockers.length === 0, blockers, categoryReview };
}
export function assessPublishReadiness({ species, group, locale, variantRow, groupRow, counterpartVariantRow, counterpartGroupRow, reviewRows = {} }) {
  const blockers = [];
  if (!species || !group) return { state: 'blocked', blockers: ['未选择 Species。'] };
  if (!groupRow) blockers.push(`${locale} Base Species 尚未保存。`);
  if (!variantRow) blockers.push(`${locale} Variant SEO 尚未保存。`);

  const effective = resolveEffectiveSeo({ member: species, group, groupRow, variantRow, locale }).effective;
  if (!effective.seoTitle?.trim()) blockers.push('SEO Title 为空。');
  if (!effective.metaDescription?.trim()) blockers.push('Meta Description 为空。');
  if (!effective.h1?.trim()) blockers.push('H1 为空。');
  if (![effective.sharedIntro, effective.variantIntro].filter(Boolean).join('').trim()) blockers.push('Base/Variant Intro 均为空。');
  if (locale === 'en' && !variantRow?.localized_name?.trim()) blockers.push('English Common Name 为空。');
  if (!variantRow?.image_alt?.trim()) blockers.push('Hero Image Alt 尚未填写。');

  const dataReview = assessDataReview(group, reviewRows);
  blockers.push(...dataReview.blockers);
  const member = group.members?.find((item) => item.catalog_key === species.catalog_key);
  const duplicateSet = (group.duplicate_sets || []).find((set) => set.member_ids.includes(species.catalog_key));
  const duplicateReview = duplicateSet ? reviewRows[duplicateSet.duplicate_set_key] : null;
  if (duplicateReview?.decision === 'duplicate_records') {
    const isCanonical = duplicateReview.canonical_catalog_key === species.catalog_key;
    if (isCanonical && variantRow?.index_strategy !== 'index') blockers.push('该记录被选为重复集 canonical，应使用独立 Index。');
    if (!isCanonical && variantRow?.index_strategy === 'index') blockers.push('该记录已判定为重复项，不能独立 Index。');
    if (!isCanonical && variantRow?.index_strategy === 'canonical_to_sibling' && variantRow?.canonical_catalog_key !== duplicateReview.canonical_catalog_key) {
      blockers.push('Canonical target 与重复复核结论不一致。');
    }
  } else if (member?.duplicate_peer_keys?.length && duplicateReview?.decision !== 'distinct_records') {
    blockers.push('疑似重复记录尚未得到可解除阻止的复核结论。');
  }

  if (variantRow?.index_strategy === 'index') {
    if (!counterpartVariantRow || !counterpartGroupRow) blockers.push('独立 Index 需要另一语言已有对应内容。');
    else if (counterpartVariantRow.review_state !== 'approved' || counterpartGroupRow.review_state !== 'approved') blockers.push('独立 Index 的另一语言内容尚未 Approved。');
  }

  if (blockers.length) return { state: 'blocked', blockers, effective, dataReview };
  const editorialApproved = variantRow?.review_state === 'approved' && groupRow?.review_state === 'approved';
  if (editorialApproved) return { state: 'publish_ready', blockers: [], effective, dataReview };
  return {
    state: 'ready_for_review',
    blockers: [],
    effective,
    dataReview,
    reviewNeeded: [groupRow?.review_state !== 'approved' ? 'Base Species' : null, variantRow?.review_state !== 'approved' ? 'Variant' : null].filter(Boolean),
  };
}
export function getIndexReviewBlockReason({ species, group, indexStrategy, canonicalCatalogKey, reviewRows = {} }) {
  if (group?.category_conflict && indexStrategy !== 'noindex') {
    const review = reviewRows[categoryIssueKey(group)];
    if (review?.decision !== 'accepted_as_is') return '分类冲突尚未得到“可继续 SEO”的人工结论；当前只能 Noindex。';
  }
  const duplicateSet = (group?.duplicate_sets || []).find((set) => set.member_ids.includes(species?.catalog_key));
  if (!duplicateSet) return '';
  const review = reviewRows[duplicateSet.duplicate_set_key];
  if (review?.decision === 'distinct_records') return '';
  if (review?.decision === 'duplicate_records') {
    const canonical = review.canonical_catalog_key;
    if (species.catalog_key === canonical && indexStrategy !== 'index') return '当前记录是人工确认的 canonical，应保持独立 Index。';
    if (species.catalog_key !== canonical && indexStrategy === 'index') return '当前记录已人工确认是重复项，不能独立 Index。';
    if (species.catalog_key !== canonical && indexStrategy === 'canonical_to_sibling' && canonicalCatalogKey !== canonical) return 'Canonical target 必须与人工重复复核结论一致。';
    return '';
  }
  return indexStrategy === 'index' ? '当前记录仍是疑似重复；人工复核前不能独立 Index。' : '';
}


const VARIANT_PREVIEW_FIELDS = [
  'catalog_key','locale','localized_name','seo_title','meta_description','h1','intro','image_alt',
  'canonical_path','focus_keyword','index_strategy','canonical_catalog_key','status','review_state','deleted_at','version',
];
const GROUP_PREVIEW_FIELDS = [
  'group_key','locale','seo_title_template','meta_description_template','h1_template','shared_intro',
  'status','review_state','deleted_at','version',
];
function pickPreviewFields(row, fields) {
  if (!row) return null;
  return Object.fromEntries(fields.map((field) => [field, row[field] ?? null]));
}
export function buildControlledPreviewSnapshot({ species, group, variantRows = [], groupRows = [], reviewRows = {} }) {
  if (!species?.catalog_key || !group?.group_key) throw new Error('Species and Base group are required for Preview Snapshot.');
  const resolutions = [];
  const category = reviewRows[categoryIssueKey(group)];
  if (category) resolutions.push(category);
  for (const set of group.duplicate_sets || []) {
    const row = reviewRows[set.duplicate_set_key];
    if (row) resolutions.push(row);
  }
  return {
    environment: 'preview',
    delivery_mode: 'controlled_preview',
    source_label: 'admin-ui-preview-export',
    selected_catalog_keys: [species.catalog_key],
    species_seo: variantRows.filter(Boolean).map((row) => pickPreviewFields(row, VARIANT_PREVIEW_FIELDS)),
    species_seo_groups: groupRows.filter(Boolean).map((row) => pickPreviewFields(row, GROUP_PREVIEW_FIELDS)),
    data_review_resolutions: resolutions.map((row) => ({
      issue_key: row.issue_key,
      issue_type: row.issue_type,
      group_key: row.group_key,
      decision: row.decision,
      canonical_catalog_key: row.canonical_catalog_key || '',
    })),
  };
}
