const MARKERS = [
  { id: 'dual-repo', pattern: /dual[\s-]?repo/i },
  { id: 'acceptance', pattern: /\bacceptance(?:\s+test)?\b/i },
  { id: 'test-copy', pattern: /\btest(?:ing)?\s+(?:copy|content|title|h1)\b/i },
  { id: 'qa-only', pattern: /\bqa\s*(?:only|test)\b/i },
  { id: 'placeholder', pattern: /\bplaceholder\b/i },
  { id: 'zh-acceptance', pattern: /(?:后台)?真实保存验收|验收(?:文案|测试|用|版)?|仅供测试|测试(?:文案|内容|标题|H1|用)/i },
];

export const CONTENT_HYGIENE_FIELD_LABELS = {
  seoTitle: 'SEO Title', metaDescription: 'Meta Description', h1: 'H1', sharedIntro: 'Base Intro',
  variantIntro: 'Variant Intro', localizedName: 'English Common Name', imageAlt: 'Image Alt', focusKeyword: 'Focus Keyword',
  seoTitleTemplate: 'SEO Title template', metaDescriptionTemplate: 'Meta Description template', h1Template: 'H1 template', sharedIntroTemplate: 'Base Intro',
};

export function inspectEditorialContent(fields = {}) {
  const issues = [];
  for (const [field, rawValue] of Object.entries(fields || {})) {
    const value = String(rawValue || '').trim();
    if (!value) continue;
    for (const marker of MARKERS) {
      const match = value.match(marker.pattern);
      if (!match) continue;
      issues.push({ field, label: CONTENT_HYGIENE_FIELD_LABELS[field] || field, marker: marker.id, match: match[0] });
      break;
    }
  }
  return { clean: issues.length === 0, issues };
}

export function hygieneBlockerText(issue, locale = 'zh-CN') {
  if (!issue) return '';
  return locale === 'en'
    ? `${issue.label} still contains test/acceptance wording (${issue.match}). Remove it before review.`
    : `${issue.label} 仍包含测试/验收字样“${issue.match}”，清理后才能进入审核。`;
}
