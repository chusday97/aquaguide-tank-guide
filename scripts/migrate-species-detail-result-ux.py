from pathlib import Path

path = Path('src/components/SpeciesDetailDialogBase.tsx')
text = path.read_text()

if 'testId="species-detail-decision"' in text:
    print('Species Detail Result UX already migrated; no rewrite needed')
    raise SystemExit(0)

import_anchor = "import { VisualResultCard } from './visual-results/VisualResultCard';\n"
if import_anchor not in text:
    raise SystemExit('VisualResultCard import anchor missing; refusing migration')
text = text.replace(
    import_anchor,
    import_anchor + "import { DecisionResultSurface } from './result/DecisionResultSurface';\n",
    1,
)

start_marker = '                        <div data-visual-result-status={mapFitStatus(displayFit.status)}'
end_marker = '                        <div className="mt-2 flex flex-wrap gap-2 min-[760px]:mt-3">'
start = text.find(start_marker)
end = text.find(end_marker, start)
if start == -1 or end == -1:
    raise SystemExit('Species Detail legacy verdict boundary missing; refusing migration')

replacement = '''                        <div
                          data-visual-result-status={mapFitStatus(displayFit.status)}
                          data-species-detail-decision-result
                          className="mt-2 min-[760px]:mt-4"
                        >
                          <DecisionResultSurface
                            testId="species-detail-decision"
                            isEn={isEn}
                            tone={
                              displayFit.status === 'suitable' || displayFit.status === 'alreadyInTank'
                                ? 'success'
                                : displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk'
                                  ? 'danger'
                                  : displayFit.status === 'caution'
                                    ? 'warning'
                                    : 'info'
                            }
                            eyebrow={aquariumContext ? (isEn ? 'FITS MY TANK?' : '适合我的鱼缸吗？') : (isEn ? 'TANK NOT SELECTED' : '尚未选择鱼缸')}
                            title={displayFit.title}
                            summary={aquariumContext ? displayFit.conclusion : t('encyclopedia.conclusionNoTank')}
                            watchFor={displayFit.risks.filter(item => item.status === 'warning').map(item => item.advice)}
                            avoid={displayFit.risks.filter(item => item.status === 'danger').map(item => item.advice)}
                            evidence={verdictReasons.map(reason => `${reason.label} · ${reason.text}`)}
                          />
                        </div>

'''
text = text[:start] + replacement + text[end:]

footer_anchor = '<Button className="min-h-12 w-full rounded-full bg-accent px-4 text-sm font-black text-white hover:bg-accent/90 min-[760px]:text-base" onClick={handleMainAction}>{mainActionLabel}</Button>'
footer_replacement = '<Button data-species-detail-primary-action className="min-h-12 w-full rounded-full bg-accent px-4 text-sm font-black text-white hover:bg-accent/90 min-[760px]:text-base" onClick={handleMainAction}>{mainActionLabel}</Button>'
if footer_anchor not in text:
    raise SystemExit('Species Detail primary footer action anchor missing; refusing migration')
text = text.replace(footer_anchor, footer_replacement, 1)

required = [
    "import { DecisionResultSurface } from './result/DecisionResultSurface';",
    'testId="species-detail-decision"',
    'data-species-detail-decision-result',
    'data-species-detail-primary-action',
    "eyebrow={aquariumContext ? (isEn ? 'FITS MY TANK?' : '适合我的鱼缸吗？')",
    'title={displayFit.title}',
    'evidence={verdictReasons.map(reason => `${reason.label} · ${reason.text}`)}',
    'data-species-detail-edit-tank-record',
    'data-disclosure-purpose="secondary_evidence"',
]
for needle in required:
    if needle not in text:
        raise SystemExit(f'Required Species Detail contract missing after migration: {needle}')

if "aria-label={isEn ? 'Key reasons' : '关键原因'}" in text:
    raise SystemExit('Legacy always-visible key reasons remain after migration')

path.write_text(text)
print('Species Detail Result UX migration patch prepared')
