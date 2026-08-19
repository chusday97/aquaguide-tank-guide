import fs from 'node:fs';

const carePath = 'src/pages/CareEncyclopedia.tsx';
const compatibilityPath = 'src/components/CompatibilityRiskCalculator.tsx';
const surfacePath = 'src/components/result/DecisionResultSurface.tsx';

const replaceOnce = (source, search, replacement, label) => {
  const first = source.indexOf(search);
  if (first < 0) throw new Error(`${label}: marker not found`);
  if (source.indexOf(search, first + search.length) >= 0) throw new Error(`${label}: marker is not unique`);
  return source.slice(0, first) + replacement + source.slice(first + search.length);
};

const replaceRegexOnce = (source, pattern, replacement, label) => {
  const matches = [...source.matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`${label}: expected exactly 1 match, got ${matches.length}`);
  return source.replace(pattern, replacement);
};

let surface = fs.readFileSync(surfacePath, 'utf8');
surface = replaceOnce(
  surface,
  '<article data-result-ux="decision" data-testid={testId}',
  '<article data-result-ux="decision" data-care-assessment-next data-testid={testId}',
  'surface compatibility selector',
);
surface = replaceOnce(
  surface,
  '<h3 className="mt-2 text-[20px] font-black leading-tight text-ink sm:text-[22px]">{title}</h3>',
  '<h3 data-care-action-text className="mt-2 text-[20px] font-black leading-tight text-ink sm:text-[22px]">{title}</h3>',
  'surface primary action selector',
);
surface = replaceOnce(
  surface,
  '<span className="block text-[12px] font-black leading-5 text-ink">{action.title}</span>',
  '<span data-care-action-text className="block text-[12px] font-black leading-5 text-ink">{action.title}</span>',
  'surface secondary action selector',
);
fs.writeFileSync(surfacePath, surface);

let care = fs.readFileSync(carePath, 'utf8');
const careImport = "import { AdaptiveDetailContent } from '../components/common/AdaptiveDetailContent';\n";
care = replaceOnce(
  care,
  careImport,
  `${careImport}import { DecisionResultSurface } from '../components/result/DecisionResultSurface';\nimport { careEvidenceSource, careEvidenceSources, diagnosisEscalationSignals, riskTone } from '../modules/result/resultAdapters';\n`,
  'care Result UX imports',
);

const careResultPattern = /      \{isResultStep && diagnosisState\.result && \(\n        <section data-care-assessment-result[\s\S]*?\n      \)\}\n(?=    <\/section>\n  \);\n}\n\nconst translateTopicTag)/g;
const careResultReplacement = `      {isResultStep && diagnosisState.result && (\n        <div data-care-assessment-result>\n          <DecisionResultSurface\n            isEn={isEn}\n            testId="care-assessment-result"\n            tone={riskTone(diagnosisState.result.riskLevel)}\n            eyebrow={isEn ? 'DO THIS FIRST' : '现在先做'}\n            statusLabel={diagnosisState.result.riskLabel}\n            title={diagnosisState.result.todayActions[0] || diagnosisState.result.conclusion}\n            summary={diagnosisState.result.causes[0] || diagnosisState.result.conclusion}\n            primarySource={diagnosisState.result.todayActions[0]\n              ? careEvidenceSource(getCareActionEvidenceForText(topic, 'immediate', diagnosisState.result.todayActions[0], 0))\n              : undefined}\n            actions={diagnosisState.result.todayActions.slice(1, 3).map((action, index) => {\n              const evidence = getCareActionEvidenceForText(topic, 'immediate', action, index + 1);\n              return {\n                id: \\`diagnosis-action-\${index + 2}\\`,\n                title: action,\n                source: careEvidenceSource(evidence),\n              };\n            })}\n            watchFor={diagnosisState.result.observeItems.slice(0, 3)}\n            escalateIf={diagnosisEscalationSignals(diagnosisState.result.riskLevel, isEn)}\n            avoid={diagnosisState.result.avoidActions.slice(0, 2)}\n            evidence={[...diagnosisState.result.causes.slice(0, 3), ...diagnosisState.result.evidence.slice(0, 4)]}\n            sources={careEvidenceSources(diagnosisState.result.todayActions.slice(0, 3).map((action, index) => (\n              getCareActionEvidenceForText(topic, 'immediate', action, index)\n            )))}\n          >\n            {diagnosisState.result.riskLevel === 'unknown' ? (\n              <Button type="button" onClick={resetDiagnosis} className="h-11 w-full rounded-full bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800">\n                {isEn ? 'Complete key checks' : '补充关键检查'}\n              </Button>\n            ) : (\n              <Button type="button" onClick={onScheduleFollowUp} className="h-11 w-full rounded-full bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800">\n                {isEn ? 'Set follow-up time' : '设置复查时间'}\n              </Button>\n            )}\n            {followUpFeedback && (\n              <div role="status" className="mt-2 rounded-[15px] bg-emerald-50 px-3 py-2.5 text-center text-[11px] font-black text-emerald-800">\n                {followUpFeedback}\n              </div>\n            )}\n          </DecisionResultSurface>\n        </div>\n      )}\n`;
care = replaceRegexOnce(care, careResultPattern, careResultReplacement, 'care result surface');
fs.writeFileSync(carePath, care);

let compatibility = fs.readFileSync(compatibilityPath, 'utf8');
const compatibilityImport = "import { Button } from '@/components/ui/button';\n";
compatibility = replaceOnce(
  compatibility,
  compatibilityImport,
  `${compatibilityImport}import { DecisionResultSurface } from './result/DecisionResultSurface';\nimport { compatibilityEscalationSignals, compatibilityRuleSources, compatibilityTone } from '../modules/result/resultAdapters';\n`,
  'compatibility Result UX imports',
);

const compatibilityResultPattern = /            <div data-compatibility-verdict=\{resultStatus\}[\s\S]*?\n            \{resultStatus === 'not_recommended' && \([\s\S]*?\n            \)\}\n\n(?=            <div className="grid gap-2 sm:grid-cols-2">)/g;
const compatibilityResultReplacement = `            <div data-compatibility-verdict={resultStatus}>\n              <span className="sr-only" data-verdict-symbol={verdictCue?.symbol}>{verdictCue?.symbol}</span>\n              <DecisionResultSurface\n                isEn={isEn}\n                testId="compatibility-decision-result"\n                tone={compatibilityTone(resultStatus)}\n                eyebrow={isEn ? 'DECISION' : '先看结论'}\n                statusLabel={meta.label}\n                title={resultStatus === 'not_recommended'\n                  ? (conflictActions[0]?.title || (isEn ? 'Do not stock this combination' : '先不要把这个组合放进同一缸'))\n                  : resultStatus === 'caution'\n                    ? (isEn ? 'Meet the conditions before stocking' : '满足条件后再考虑入缸')\n                    : resultStatus === 'insufficient_data'\n                      ? (isEn ? 'Complete the missing tank or pair data first' : '先补齐鱼缸或配对信息')\n                      : (isEn ? 'Add gradually and observe' : '可以少量加入并持续观察')}\n                summary={resultStatus === 'not_recommended'\n                  ? (conflictActions[0]?.detail || decision?.summary || meta.description)\n                  : (decision?.summary || meta.description)}\n                primarySource={compatibilityRuleSources(relevantPairs.flatMap(pair => [\n                  ...pair.rawResult.blockingRules,\n                  ...pair.rawResult.warningRules,\n                  ...pair.rawResult.missingData,\n                ]))[0]}\n                primaryControl={resultStatus === 'not_recommended' && conflictActions[0]?.removeSpeciesId ? (\n                  <Button type="button" variant="outline" onClick={() => removeSpecies(conflictActions[0].removeSpeciesId!)} className="h-9 rounded-full border-red-200 px-3 text-[10px] font-black text-red-700">\n                    {getConflictActionLabel(conflictActions[0], isEn)}\n                  </Button>\n                ) : resultStatus === 'insufficient_data' && onRequestTankInfo ? (\n                  <Button type="button" onClick={requestMissingTankInfo} className="h-9 rounded-full bg-sky-700 px-3 text-[10px] font-black text-white">\n                    {isEn ? 'Complete tank settings' : '去完善鱼缸参数'}\n                  </Button>\n                ) : undefined}\n                actions={resultStatus === 'not_recommended'\n                  ? conflictActions.slice(1, 3).map(action => ({\n                    id: action.id,\n                    title: action.title,\n                    detail: action.detail,\n                    control: action.removeSpeciesId ? (\n                      <Button type="button" variant="outline" onClick={() => removeSpecies(action.removeSpeciesId!)} className="h-9 rounded-full border-red-200 px-3 text-[10px] font-black text-red-700">\n                        {getConflictActionLabel(action, isEn)}\n                      </Button>\n                    ) : onViewAquarium ? (\n                      <Button type="button" variant="outline" onClick={onViewAquarium} className="h-9 rounded-full px-3 text-[10px] font-black">\n                        {isEn ? 'Review current tank' : '查看当前鱼缸'}\n                      </Button>\n                    ) : undefined,\n                  }))\n                  : resultStatus === 'caution'\n                    ? unique(cautionPairs.flatMap(pair => pair.actions)).slice(0, 2).map((title, index) => ({ id: \\`compat-caution-\${index}\\`, title }))\n                    : resultStatus === 'insufficient_data'\n                      ? unique(missingPairs.flatMap(pair => pair.rawResult.missingData.map(item => item.evidence || item.title))).slice(0, 2).map((title, index) => ({ id: \\`compat-missing-\${index}\\`, title }))\n                      : unique(relevantPairs.flatMap(pair => pair.actions)).slice(0, 2).map((title, index) => ({ id: \\`compat-next-\${index}\\`, title }))}\n                watchFor={resultStatus === 'not_recommended'\n                  ? []\n                  : unique(relevantPairs.flatMap(pair => pair.actions)).filter(item => /观察|追咬|摄食|应激|monitor|observe|feeding|stress/i.test(item)).slice(0, 3)}\n                escalateIf={compatibilityEscalationSignals(resultStatus, decision?.riskLevel || 'unknown', isEn)}\n                avoid={resultStatus === 'not_recommended' ? conflictActions.slice(0, 2).map(action => action.title) : []}\n                evidence={unique(relevantPairs.flatMap(pair => getPairReasons(pair))).slice(0, 5)}\n                sources={compatibilityRuleSources(relevantPairs.flatMap(pair => [\n                  ...pair.rawResult.blockingRules,\n                  ...pair.rawResult.warningRules,\n                  ...pair.rawResult.missingData,\n                ]))}\n              />\n            </div>\n\n`;
compatibility = replaceRegexOnce(compatibility, compatibilityResultPattern, compatibilityResultReplacement, 'compatibility result surface');
fs.writeFileSync(compatibilityPath, compatibility);

console.log('Result UX V1 apply completed');
