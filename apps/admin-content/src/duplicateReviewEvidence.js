import { seoRowKey } from './localization.js';

const SEO_CONTENT_FIELDS = {
  'zh-CN': ['seo_title', 'meta_description', 'h1', 'intro', 'image_alt', 'focus_keyword'],
  en: ['localized_name', 'seo_title', 'meta_description', 'h1', 'intro', 'image_alt', 'focus_keyword'],
};

export function duplicateCompleteness(row, locale) {
  if (!row) return 0;
  const fields = SEO_CONTENT_FIELDS[locale] || SEO_CONTENT_FIELDS['zh-CN'];
  const filled = fields.filter((field) => String(row?.[field] ?? '').trim()).length;
  return Math.round((filled / fields.length) * 100);
}

export function formatDuplicateEditedAt(value, isUiEnglish) {
  if (!value) return isUiEnglish ? 'Not edited' : '尚未编辑';
  try {
    return new Intl.DateTimeFormat(isUiEnglish ? 'en-US' : 'zh-CN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

export function duplicateStatusLabel(row, isUiEnglish) {
  if (!row) return isUiEnglish ? 'No Draft' : '无 Draft';
  if (row.review_state === 'approved') return isUiEnglish ? 'Approved' : '已批准';
  if (row.review_state === 'ready_for_review') return isUiEnglish ? 'Awaiting review' : '待审核';
  return isUiEnglish ? 'Editing' : '编辑中';
}

export function duplicateCandidateSignals(member, seoRows) {
  const zh = seoRows?.[seoRowKey(member.catalog_key, 'zh-CN')] || null;
  const en = seoRows?.[seoRowKey(member.catalog_key, 'en')] || null;
  const rows = [zh, en].filter(Boolean);
  const approvedCount = rows.filter((row) => row.review_state === 'approved').length;
  const averageCompleteness = Math.round((duplicateCompleteness(zh, 'zh-CN') + duplicateCompleteness(en, 'en')) / 2);
  const latestEditedAt = rows.map((row) => row.updated_at).filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null;
  return { zh, en, approvedCount, averageCompleteness, latestEditedAt };
}

export function buildDuplicateRecommendation(members, seoRows) {
  const evaluated = (members || []).map((member) => {
    const signals = duplicateCandidateSignals(member, seoRows);
    const sourcePrimary = !member.duplicate_of_catalog_key
      && members.some((peer) => peer.duplicate_of_catalog_key === member.catalog_key);
    const score = (sourcePrimary ? 10000 : 0) + (signals.approvedCount * 1000)
      + signals.averageCompleteness + (signals.latestEditedAt ? 1 : 0);
    return { member, signals, sourcePrimary, score };
  }).sort((a, b) => b.score - a.score);
  const recommended = evaluated[0] || null;
  if (!recommended) return { key: '', reasons: [] };
  const reasons = [];
  if (recommended.sourcePrimary) reasons.push('source_primary');
  const maxApproved = Math.max(...evaluated.map((item) => item.signals.approvedCount), 0);
  if (recommended.signals.approvedCount > 0 && recommended.signals.approvedCount === maxApproved) reasons.push('approved');
  const maxCompleteness = Math.max(...evaluated.map((item) => item.signals.averageCompleteness), 0);
  if (recommended.signals.averageCompleteness > 0 && recommended.signals.averageCompleteness === maxCompleteness) reasons.push('completeness');
  const latest = evaluated.map((item) => item.signals.latestEditedAt).filter(Boolean).sort((a, b) => new Date(b) - new Date(a))[0];
  if (latest && recommended.signals.latestEditedAt === latest) reasons.push('recent_edit');
  return { key: recommended.member.catalog_key, reasons };
}

export function mergeDuplicateMembers(group, set, catalogByKey = new Map()) {
  return (set?.member_ids || []).map((id) => {
    const relationMember = group?.members?.find((item) => item.catalog_key === id);
    const catalogMember = catalogByKey.get(id);
    return relationMember ? { ...(catalogMember || {}), ...relationMember } : null;
  }).filter(Boolean);
}
