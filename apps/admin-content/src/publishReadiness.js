import { resolveEffectiveSeo } from './seoInheritance.js';
import { groupSeoRowKey, seoRowKey } from './localization.js';
import { inspectEditorialContent, hygieneBlockerText } from './contentHygiene.js';

export const REVIEW_STATES = [
  { value: 'editing', label: 'Editing' },
  { value: 'ready_for_review', label: 'Ready for Review' },
  { value: 'approved', label: 'Approved' },
];

export const categoryIssueKey = (group) => `category:${group?.group_key || ''}`;

export function dataReviewMap(rows = []) {
  return Object.fromEntries((rows || []).map((row) => [row.issue_key, row]));
}

export function getDataReviewIssueState(issue, reviewRows = {}) {
  const review = reviewRows[issue?.issue_key];
  if (!review) return 'pending';
  if (issue?.issue_type === 'category_conflict') {
    if (review.decision === 'accepted_as_is') return 'resolved';
    if (review.decision === 'source_correction_required') return 'source_fix_required';
    return 'pending';
  }
  if (review.decision === 'distinct_records') return 'resolved';
  if (review.decision === 'duplicate_records' && issue?.member_ids?.includes(review.canonical_catalog_key)) return 'resolved';
  return 'pending';
}

export function summarizeDataReviewIssues(group, reviewRows = {}) {
  const issues = [];
  if (group?.category_conflict) issues.push({ issue_key: categoryIssueKey(group), issue_type: 'category_conflict', member_ids: group.members?.map((member) => member.catalog_key) || [] });
  for (const set of group?.duplicate_sets || []) issues.push({ issue_key: set.duplicate_set_key, issue_type: 'duplicate_set', member_ids: set.member_ids || [] });
  const summary = { total: issues.length, pending: 0, resolved: 0, source_fix_required: 0, open: 0, issues };
  for (const issue of issues) {
    const state = getDataReviewIssueState(issue, reviewRows);
    summary[state] += 1;
    if (state !== 'resolved') summary.open += 1;
  }
  return summary;
}

export function assessDataReview(group, reviewRows = {}, { catalogKey = null } = {}) {
  const blockers = [];
  const categoryReview = group?.category_conflict ? reviewRows[categoryIssueKey(group)] : null;
  if (group?.category_conflict && categoryReview?.decision !== 'accepted_as_is') {
    blockers.push(categoryReview?.decision === 'source_correction_required'
      ? '分类冲突已判定需要修正源数据；修正完成前保持阻止。'
      : '分类冲突尚未完成人工结论。');
  }

  const duplicateSets = (group?.duplicate_sets || []).filter((set) => !catalogKey || set.member_ids.includes(catalogKey));
  for (const set of duplicateSets) {
    const review = reviewRows[set.duplicate_set_key];
    const label = set.name || set.scientific_name || '当前页面';
    if (!review) blockers.push(`疑似重复页面：${label}（${set.member_ids.join(' / ')}）还没有确认应保留哪条记录。`);
    else if (review.decision === 'duplicate_records' && !set.member_ids.includes(review.canonical_catalog_key)) {
      blockers.push(`疑似重复页面：${label} 的主页面选择无效，请重新确认。`);
    }
  }
  return { ready: blockers.length === 0, blockers, categoryReview };
}
export function getResolvedDuplicateSeoPolicy({ species, group, reviewRows = {} }) {
  const catalogKey = species?.catalog_key;
  if (!catalogKey || !group) return null;
  const duplicateSet = (group.duplicate_sets || []).find((set) => set.member_ids.includes(catalogKey));
  if (!duplicateSet) return null;
  const review = reviewRows[duplicateSet.duplicate_set_key];
  if (review?.decision !== 'duplicate_records' || !duplicateSet.member_ids.includes(review.canonical_catalog_key)) return null;
  if (review.canonical_catalog_key === catalogKey) {
    return { indexStrategy: 'index', canonicalCatalogKey: '', duplicateSet, review, isCanonical: true };
  }
  return {
    indexStrategy: 'canonical_to_sibling',
    canonicalCatalogKey: review.canonical_catalog_key,
    duplicateSet,
    review,
    isCanonical: false,
  };
}

export function assessPublishReadiness({ species, group, locale, variantRow, groupRow, counterpartVariantRow, counterpartGroupRow, reviewRows = {} }) {
  const blockers = [];
  const blockerCodes = [];
  const addBlocker = (code, text) => {
    blockers.push(text);
    blockerCodes.push(code);
  };
  if (!species || !group) return { state: 'blocked', blockers: ['未选择 Species。'], blockerCodes: ['content'] };
  if (!groupRow) addBlocker('content', `${locale} Base Species 尚未保存。`);
  if (!variantRow) addBlocker('content', `${locale} Variant SEO 尚未保存。`);

  const effective = resolveEffectiveSeo({ member: species, group, groupRow, variantRow, locale }).effective;
  if (!effective.seoTitle?.trim()) addBlocker('content', 'SEO Title 为空。');
  if (!effective.metaDescription?.trim()) addBlocker('content', 'Meta Description 为空。');
  if (!effective.h1?.trim()) addBlocker('content', 'H1 为空。');
  if (![effective.sharedIntro, effective.variantIntro].filter(Boolean).join('').trim()) addBlocker('content', 'Base/Variant Intro 均为空。');
  if (locale === 'en' && !variantRow?.localized_name?.trim()) addBlocker('content', 'English Common Name 为空。');
  if (!variantRow?.image_alt?.trim()) addBlocker('content', 'Hero Image Alt 尚未填写。');

  const hygiene = inspectEditorialContent({
    seoTitle: effective.seoTitle, metaDescription: effective.metaDescription, h1: effective.h1,
    sharedIntro: effective.sharedIntro, variantIntro: effective.variantIntro, localizedName: variantRow?.localized_name,
    imageAlt: variantRow?.image_alt, focusKeyword: variantRow?.focus_keyword,
  });
  for (const issue of hygiene.issues) addBlocker('hygiene', hygieneBlockerText(issue, locale));

  const dataReview = assessDataReview(group, reviewRows, { catalogKey: species.catalog_key });
  for (const blocker of dataReview.blockers) addBlocker('data_review', blocker);
  const member = group.members?.find((item) => item.catalog_key === species.catalog_key);
  const duplicateSet = (group.duplicate_sets || []).find((set) => set.member_ids.includes(species.catalog_key));
  const duplicateReview = duplicateSet ? reviewRows[duplicateSet.duplicate_set_key] : null;
  if (duplicateReview?.decision === 'duplicate_records') {
    const isCanonical = duplicateReview.canonical_catalog_key === species.catalog_key;
    if (isCanonical && variantRow?.index_strategy !== 'index') addBlocker('seo_policy', '当前记录已被确认为 SEO 主页面，应使用独立收录。');
    if (!isCanonical && variantRow?.index_strategy === 'index') addBlocker('seo_policy', '当前记录已确认是重复项，不能作为独立 SEO 页面收录。');
    if (!isCanonical && variantRow?.index_strategy === 'canonical_to_sibling' && variantRow?.canonical_catalog_key !== duplicateReview.canonical_catalog_key) {
      addBlocker('seo_policy', '当前 Canonical 目标与已确认的 SEO 主页面不一致。');
    }
  } else if (member?.duplicate_peer_keys?.length && duplicateReview?.decision !== 'distinct_records') {
    addBlocker('data_review', '当前页面与另一条记录疑似重复，需要先确认它们是否为同一页面。');
  }

  if (variantRow?.index_strategy === 'index') {
    if (!counterpartVariantRow || !counterpartGroupRow) addBlocker('bilingual', '独立 Index 需要另一语言已有对应内容。');
    else {
      if (counterpartVariantRow.review_state !== 'approved' || counterpartGroupRow.review_state !== 'approved') addBlocker('bilingual', '独立 Index 的另一语言内容尚未 Approved。');
      const counterpartLocale = locale === 'en' ? 'zh-CN' : 'en';
      const counterpartEffective = resolveEffectiveSeo({ member: species, group, groupRow: counterpartGroupRow, variantRow: counterpartVariantRow, locale: counterpartLocale }).effective;
      const counterpartHygiene = inspectEditorialContent({
        seoTitle: counterpartEffective.seoTitle, metaDescription: counterpartEffective.metaDescription, h1: counterpartEffective.h1,
        sharedIntro: counterpartEffective.sharedIntro, variantIntro: counterpartEffective.variantIntro, localizedName: counterpartVariantRow.localized_name,
        imageAlt: counterpartVariantRow.image_alt, focusKeyword: counterpartVariantRow.focus_keyword,
      });
      if (!counterpartHygiene.clean) addBlocker('bilingual', `另一语言页面仍有测试/验收文案：${counterpartHygiene.issues.map((issue) => issue.label).join('、')}。`);
    }
  }

  if (blockers.length) return { state: 'blocked', blockers, blockerCodes: [...new Set(blockerCodes)], effective, dataReview, hygiene };
  const editorialApproved = variantRow?.review_state === 'approved' && groupRow?.review_state === 'approved';
  if (editorialApproved) return { state: 'publish_ready', blockers: [], blockerCodes: [], effective, dataReview, hygiene };
  return {
    state: 'ready_for_review',
    blockers: [],
    blockerCodes: [],
    effective,
    dataReview,
    hygiene,
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


function issueStatus(issue, reviewRows) {
  return getDataReviewIssueState(issue, reviewRows);
}

const BLOCKED_NEXT_ACTION_PRIORITY = ['hygiene', 'data_review', 'content', 'bilingual', 'seo_policy'];
function primaryBlockedNextAction(blockerCodes = []) {
  return BLOCKED_NEXT_ACTION_PRIORITY.find((code) => blockerCodes.includes(code)) || 'other';
}

export function buildAdminWorkflowOverview({ species = [], groups = [], seoRows = {}, groupSeoRows = {}, reviewRows = {} }) {
  const dataIssues = groups.flatMap((group) => {
    const issues = [];
    if (group.category_conflict) issues.push({ issue_key: categoryIssueKey(group), issue_type: 'category_conflict', group_key: group.group_key, member_ids: group.members.map((m) => m.catalog_key) });
    for (const set of group.duplicate_sets || []) issues.push({ issue_key: set.duplicate_set_key, issue_type: 'duplicate_set', group_key: group.group_key, member_ids: set.member_ids });
    return issues;
  });
  const dataReview = {
    total: dataIssues.length,
    pending: 0,
    resolved: 0,
    source_fix_required: 0,
    groupKeysByStatus: { pending: [], resolved: [], source_fix_required: [] },
  };
  const groupSets = { pending: new Set(), resolved: new Set(), source_fix_required: new Set() };
  for (const issue of dataIssues) {
    const status = issueStatus(issue, reviewRows);
    dataReview[status] += 1;
    groupSets[status].add(issue.group_key);
  }
  for (const key of Object.keys(groupSets)) dataReview.groupKeysByStatus[key] = [...groupSets[key]];

  const groupByMember = new Map();
  for (const group of groups) for (const member of group.members) groupByMember.set(member.catalog_key, group);
  const workflowSpecies = species.filter((item) => {
    const group = groupByMember.get(item.catalog_key);
    const groupMember = group?.members?.find((member) => member.catalog_key === item.catalog_key);
    const duplicateSet = (group?.duplicate_sets || []).find((set) => set.member_ids.includes(item.catalog_key));
    if (!duplicateSet) return true;
    const review = reviewRows[duplicateSet.duplicate_set_key];
    if (review?.decision === 'distinct_records') return true;
    if (review?.decision === 'duplicate_records' && review.canonical_catalog_key) return item.catalog_key === review.canonical_catalog_key;
    return !groupMember?.duplicate_of_catalog_key;
  });
  const contentHygiene = {
    total: 0,
    byLocale: {
      'zh-CN': { count: 0, memberIds: [] },
      en: { count: 0, memberIds: [] },
    },
  };
  const locales = {};
  for (const locale of ['zh-CN', 'en']) {
    const counterpart = locale === 'en' ? 'zh-CN' : 'en';
    const state = {
      total: workflowSpecies.length,
      blocked: 0,
      ready_for_review: 0,
      publish_ready: 0,
      memberIdsByState: { blocked: [], ready_for_review: [], publish_ready: [] },
      blockedNextActions: {
        data_review: { count: 0, memberIds: [] },
        hygiene: { count: 0, memberIds: [] },
        content: { count: 0, memberIds: [] },
        bilingual: { count: 0, memberIds: [] },
        seo_policy: { count: 0, memberIds: [] },
        other: { count: 0, memberIds: [] },
      },
    };
    for (const item of workflowSpecies) {
      const group = groupByMember.get(item.catalog_key);
      if (!group) continue;
      const result = assessPublishReadiness({
        species: item, group, locale,
        variantRow: seoRows[seoRowKey(item.catalog_key, locale)],
        groupRow: groupSeoRows[groupSeoRowKey(group.group_key, locale)],
        counterpartVariantRow: seoRows[seoRowKey(item.catalog_key, counterpart)],
        counterpartGroupRow: groupSeoRows[groupSeoRowKey(group.group_key, counterpart)],
        reviewRows,
      });
      state[result.state] += 1;
      state.memberIdsByState[result.state].push(item.id);
      if (result.state === 'blocked') {
        const nextAction = primaryBlockedNextAction(result.blockerCodes);
        state.blockedNextActions[nextAction].count += 1;
        state.blockedNextActions[nextAction].memberIds.push(item.id);
      }
      if (result.hygiene && !result.hygiene.clean) {
        contentHygiene.total += 1;
        contentHygiene.byLocale[locale].count += 1;
        contentHygiene.byLocale[locale].memberIds.push(item.id);
      }
    }
    locales[locale] = state;
  }
  return { dataReview, locales, contentHygiene };
}
