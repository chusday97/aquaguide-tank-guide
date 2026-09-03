const INCOMPLETE_SCIENTIFIC_SUFFIX = /\b(?:var\.|subsp\.|ssp\.)\s*$/i;

export function inspectSourceIdentity(species = {}) {
  const scientificName = String(species?.scientific_name || '').trim();
  const issues = [];
  if (!scientificName) {
    issues.push({ field: 'scientific_name', code: 'missing', value: scientificName });
  } else {
    if (scientificName.split(/\s+/).length < 2) issues.push({ field: 'scientific_name', code: 'incomplete', value: scientificName });
    if (INCOMPLETE_SCIENTIFIC_SUFFIX.test(scientificName)) issues.push({ field: 'scientific_name', code: 'incomplete_suffix', value: scientificName });
  }
  return { clean: issues.length === 0, issues, scientificName };
}

export function sourceIdentityBlockerText(issue, locale = 'zh-CN') {
  if (!issue) return '';
  if (locale === 'en') {
    if (issue.code === 'missing') return 'Source scientific name is missing. Fix the AquaGuide source record before review.';
    return `Source scientific name is incomplete (${issue.value || 'unknown'}). Fix the AquaGuide source record before review.`;
  }
  if (issue.code === 'missing') return '源数据缺少学名；请先修正 AquaGuide 源记录，再进入审核。';
  return `源数据学名不完整（${issue.value || '未知'}）；请先修正 AquaGuide 源记录，再进入审核。`;
}
