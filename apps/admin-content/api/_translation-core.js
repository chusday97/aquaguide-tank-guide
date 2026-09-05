const TOKEN_PATTERN = /{{\s*[a-zA-Z0-9_]+\s*}}/g;

export const extractTemplateTokens = (value = '') => (
  [...new Set(String(value).match(TOKEN_PATTERN) || [])].sort()
);

export const parseJsonObject = (text) => {
  try { return JSON.parse(text); }
  catch {
    const match = String(text || '').match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Translation response is not valid JSON');
    return JSON.parse(match[0]);
  }
};

export const cleanTranslationObject = (scope, raw = {}) => {
  if (scope === 'base') {
    return {
      seoTitleTemplate: String(raw.seoTitleTemplate || '').trim(),
      metaDescriptionTemplate: String(raw.metaDescriptionTemplate || '').trim(),
      h1Template: String(raw.h1Template || '').trim(),
      sharedIntro: String(raw.sharedIntro || '').trim(),
    };
  }
  return {
    localizedName: String(raw.localizedName || '').trim(),
    seoTitle: String(raw.seoTitle || '').trim(),
    metaDescription: String(raw.metaDescription || '').trim(),
    h1: String(raw.h1 || '').trim(),
    intro: String(raw.intro || '').trim(),
    imageAlt: String(raw.imageAlt || '').trim(),
    focusKeyword: String(raw.focusKeyword || '').trim(),
  };
};

export const validateProtectedTokens = (scope, source = {}, translated = {}) => {
  if (scope !== 'base') return [];
  const pairs = [
    ['seoTitleTemplate', source.seoTitleTemplate, translated.seoTitleTemplate],
    ['metaDescriptionTemplate', source.metaDescriptionTemplate, translated.metaDescriptionTemplate],
    ['h1Template', source.h1Template, translated.h1Template],
  ];
  const errors = [];
  for (const [field, before, after] of pairs) {
    const sourceTokens = extractTemplateTokens(before);
    const targetTokens = extractTemplateTokens(after);
    if (JSON.stringify(sourceTokens) !== JSON.stringify(targetTokens)) {
      errors.push(`${field} template tokens changed during translation`);
    }
  }
  return errors;
};

export const hasCjkText = (value = '') => /[\u3400-\u9fff]/u.test(String(value));
