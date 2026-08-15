from pathlib import Path

path = Path('src/services/repository/api-aquaguide.repository.ts')
text = path.read_text()
old = """  const source = sourceType === 'manual' || sourceType === 'care_article' || sourceType === 'home'
    ? { type: sourceType, title: sourceTitle }
    : undefined;
"""
new = """  const source: DiagnosisRecord['source'] = sourceType === 'manual'
    ? { type: 'manual', title: sourceTitle }
    : sourceType === 'care_article'
      ? { type: 'care_article', title: sourceTitle }
      : sourceType === 'home'
        ? { type: 'home', title: sourceTitle }
        : undefined;
"""
count = text.count(old)
if count != 1:
    raise SystemExit(f'diagnosis source typing: expected 1 match, got {count}')
path.write_text(text.replace(old, new, 1))
