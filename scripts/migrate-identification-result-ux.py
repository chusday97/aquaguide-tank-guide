from pathlib import Path

path = Path('src/pages/Identify.tsx')
text = path.read_text()

if 'testId="identify-decision"' in text:
    print('Identification Result UX already migrated; no rewrite needed')
    raise SystemExit(0)

import_anchor = "import { VisualResultCard } from '../components/visual-results/VisualResultCard';\n"
if import_anchor not in text:
    raise SystemExit('VisualResultCard import anchor missing; refusing migration')
text = text.replace(
    import_anchor,
    import_anchor + "import { DecisionResultSurface } from '../components/result/DecisionResultSurface';\n",
    1,
)

legacy_header = '''                <div className="flex items-start gap-2"><Sparkles className="mt-0.5 h-5 w-5 text-emerald-700" /><div><h2 className="text-lg font-black">{t('identify.candidateTitle')}</h2><p className="mt-1 text-xs leading-5 text-ink/50">{t('identify.confirmHint')}</p></div></div>'''
if legacy_header not in text:
    raise SystemExit('Identification legacy candidate header missing; refusing migration')

shared_surface = '''                <DecisionResultSurface
                  testId="identify-decision"
                  isEn={isEn}
                  tone={recognition?.status === 'matched' ? 'info' : 'warning'}
                  eyebrow={isEn ? 'NEEDS CONFIRMATION' : '需要你确认'}
                  statusLabel={
                    recognition?.source === 'fallback'
                      ? (isEn ? 'Manual review needed' : '需要手动核对')
                      : recognition?.status === 'matched'
                        ? (isEn ? 'Likely match' : '较可能匹配')
                        : recognition?.status === 'ambiguous'
                          ? (isEn ? 'Multiple possible matches' : '多个可能候选')
                          : (isEn ? 'Low certainty' : '匹配不确定')
                  }
                  title={t('identify.candidateTitle')}
                  summary={`${t('identify.confirmHint')} ${isEn ? 'AI candidates are not confirmed species until you choose one.' : 'AI 候选并不是已确认物种，需要由你选择后才会进入确认结果。'}`}
                  avoid={[isEn ? 'Do not treat the first candidate or its confidence as a confirmed identification.' : '不要把第一候选或置信度直接当成已确认识别结果。']}
                />'''
text = text.replace(legacy_header, shared_surface, 1)

options_anchor = '<div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">\n                  {candidates.filter(item => item.fish).map((candidate, index) => ('
if options_anchor not in text:
    raise SystemExit('Identification candidate options anchor missing; refusing migration')
text = text.replace(
    options_anchor,
    '<div data-identify-candidate-options className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">\n                  {candidates.filter(item => item.fish).map((candidate, index) => (',
    1,
)

confirm_anchor = '<button type="button" onClick={() => void confirmFish(candidate.fish!)} className="mt-2 min-h-11 w-full rounded-full bg-emerald-700 px-3 text-[11px] font-black text-white">{t(\'identify.confirmSpecies\')}</button>'
if confirm_anchor not in text:
    raise SystemExit('Identification candidate confirmation anchor missing; refusing migration')
text = text.replace(
    confirm_anchor,
    '<button type="button" data-identify-candidate-confirm data-identify-candidate-id={candidate.fish!.id} onClick={() => void confirmFish(candidate.fish!)} className="mt-2 min-h-11 w-full rounded-full bg-emerald-700 px-3 text-[11px] font-black text-white">{t(\'identify.confirmSpecies\')}</button>',
    1,
)

required = [
    "import { DecisionResultSurface } from '../components/result/DecisionResultSurface';",
    'testId="identify-decision"',
    "eyebrow={isEn ? 'NEEDS CONFIRMATION' : '需要你确认'}",
    'data-identify-candidate-options',
    'data-identify-candidate-confirm',
    'onClick={() => void confirmFish(candidate.fish!)}',
    "setStage('identified')",
    'onClick={startHealthTriage}',
    "stage === 'candidates'",
    "stage === 'identified'",
]
for needle in required:
    if needle not in text:
        raise SystemExit(f'Required Identification contract missing after migration: {needle}')

if legacy_header in text:
    raise SystemExit('Legacy Identification candidate header remains after migration')

path.write_text(text)
print('Identification Result UX migration patch prepared')
