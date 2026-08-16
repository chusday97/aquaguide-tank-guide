import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../src/pages/CareEncyclopedia.tsx', import.meta.url);
let source = await readFile(path, 'utf8');

const replaceOnce = (label, before, after) => {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`[${label}] exact anchor not found`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`[${label}] exact anchor is not unique`);
  source = source.slice(0, first) + after + source.slice(first + before.length);
};

replaceOnce(
  'decision-imports',
  "import { matchesCareCategory, type CareCategoryId } from '../services/care/care-category.service';\n",
  "import { matchesCareCategory, type CareCategoryId } from '../services/care/care-category.service';\nimport { buildTankDecisionSupport } from '../lib/tankDecisionSupportOrchestrator';\nimport { buildQuickDiagnosisConflictAugmentation } from '../lib/quickDiagnosisConflictAugmentation';\nimport { InterventionComparisonPanel } from '../components/compatibility/InterventionComparisonPanel';\n",
);

replaceOnce(
  'intervention-open-state',
  "  const [isResultDetailOpen, setIsResultDetailOpen] = useState(false);\n\n  useEffect(() => {\n",
  "  const [isResultDetailOpen, setIsResultDetailOpen] = useState(false);\n  const [isInterventionComparisonOpen, setIsInterventionComparisonOpen] = useState(false);\n\n  useEffect(() => {\n",
);

replaceOnce(
  'topic-reset-close-panel',
  "    setIsResultDetailOpen(false);\n  }, [defaultAquariumId, topic.id]);\n\n  const targetAquarium = aquariums.find(item => item.id === diagnosisState.targetAquariumId) || aquariums[0] || null;\n",
  "    setIsResultDetailOpen(false);\n    setIsInterventionComparisonOpen(false);\n  }, [defaultAquariumId, topic.id]);\n\n  const targetAquarium = aquariums.find(item => item.id === diagnosisState.targetAquariumId) || aquariums[0] || null;\n",
);

replaceOnce(
  'decision-support-models',
  "  const diagnosisQuestions = useMemo(() => getStepDiagnosisQuestions(diagnosisState.issueType, isEn), [diagnosisState.issueType, isEn]);\n",
  "  // CARE_CONFLICT_DECISION_SURFACE_START\n  // This first page integration intentionally omits allAquariums. Until the canonical #34\n  // hydration stack is formally converged, destination-list certainty stays unknown rather\n  // than turning a standalone Draft's device snapshot into a relocation claim.\n  const decisionSupport = useMemo(() => targetAquarium\n    ? buildTankDecisionSupport({ aquarium: targetAquarium, catalog: fishData })\n    : null, [targetAquarium]);\n  const conflictAugmentation = useMemo(() => decisionSupport\n    ? buildQuickDiagnosisConflictAugmentation({\n        issueType: diagnosisState.issueType,\n        decisionSupport,\n        targetSpeciesIds: diagnosisState.target.scope === 'whole_tank'\n          ? []\n          : diagnosisState.target.speciesIds,\n        isEn,\n      })\n    : null, [\n      decisionSupport,\n      diagnosisState.issueType,\n      diagnosisState.target.scope,\n      diagnosisState.target.speciesIds,\n      isEn,\n    ]);\n  const diagnosisQuestions = useMemo(() => getStepDiagnosisQuestions(diagnosisState.issueType, isEn), [diagnosisState.issueType, isEn]);\n",
);

replaceOnce(
  'augmentation-visibility',
  "  const isResultStep = diagnosisState.currentStep === 2 && Boolean(diagnosisState.result);\n  const isTargetReady = !requiresSpeciesScope\n",
  "  const isResultStep = diagnosisState.currentStep === 2 && Boolean(diagnosisState.result);\n  const showConflictAugmentation = Boolean(\n    isResultStep\n    && conflictAugmentation\n    && (\n      conflictAugmentation.status === 'specific_conflict_evidence'\n      || conflictAugmentation.status === 'partial_specific_conflict_evidence'\n      || conflictAugmentation.status === 'community_identity_incomplete'\n    )\n  );\n  const isTargetReady = !requiresSpeciesScope\n",
);

replaceOnce(
  'answer-close-panel',
  "  const updateAnswer = (key: keyof StepDiagnosisAnswers, value: StepDiagnosisAnswerValue) => {\n    setIsResultDetailOpen(false);\n",
  "  const updateAnswer = (key: keyof StepDiagnosisAnswers, value: StepDiagnosisAnswerValue) => {\n    setIsResultDetailOpen(false);\n    setIsInterventionComparisonOpen(false);\n",
);

replaceOnce(
  'show-result-close-panel',
  "    setIsResultDetailOpen(false);\n    setDiagnosisState(prev => ({ ...prev, currentStep: 2, result }));\n  };\n\n  const resetDiagnosis = () => {\n    setIsResultDetailOpen(false);\n",
  "    setIsResultDetailOpen(false);\n    setIsInterventionComparisonOpen(false);\n    setDiagnosisState(prev => ({ ...prev, currentStep: 2, result }));\n  };\n\n  const resetDiagnosis = () => {\n    setIsResultDetailOpen(false);\n    setIsInterventionComparisonOpen(false);\n",
);

replaceOnce(
  'augmentation-render',
  "            {diagnosisState.result.avoidActions[0] && (\n              <section className=\"mt-3 rounded-[16px] bg-amber-50 px-3 py-2.5\">\n",
  "            {showConflictAugmentation && conflictAugmentation && (\n              <section\n                data-care-conflict-augmentation={conflictAugmentation.status}\n                className={`mt-3 rounded-[18px] border p-3 ${\n                  conflictAugmentation.priority === 'high'\n                    ? 'border-red-100 bg-red-50/75'\n                    : 'border-sky-100 bg-sky-50/80'\n                }`}\n              >\n                <div className=\"flex items-start gap-2\">\n                  <ShieldAlert className={`mt-0.5 h-4 w-4 shrink-0 ${conflictAugmentation.priority === 'high' ? 'text-red-700' : 'text-sky-700'}`} aria-hidden=\"true\" />\n                  <div className=\"min-w-0\">\n                    <div className=\"text-[10px] font-black uppercase tracking-[0.1em] text-ink/45\">\n                      {isEn ? 'Community conflict evidence' : '群落冲突证据'}\n                    </div>\n                    <h4 className=\"mt-1 text-[13px] font-black leading-relaxed text-ink\">\n                      {conflictAugmentation.headline || (isEn ? 'Community identity is incomplete' : '当前群落身份信息不完整')}\n                    </h4>\n                    {conflictAugmentation.causeAdditions[0] && (\n                      <p className=\"mt-1 text-[11px] font-semibold leading-5 text-ink/65\">{conflictAugmentation.causeAdditions[0]}</p>\n                    )}\n                  </div>\n                </div>\n\n                {conflictAugmentation.todayActionAdditions[0] && (\n                  <div className=\"mt-2 rounded-[13px] bg-white/85 px-3 py-2.5\">\n                    <div className=\"text-[9px] font-black text-emerald-800\">{isEn ? 'Decision-support next step' : '决策支持下一步'}</div>\n                    <p className=\"mt-0.5 text-[11px] font-bold leading-5 text-ink/68\">{conflictAugmentation.todayActionAdditions[0]}</p>\n                  </div>\n                )}\n                {conflictAugmentation.avoidActionAdditions[0] && (\n                  <p className=\"mt-2 text-[10px] font-bold leading-5 text-amber-900/75\">\n                    {isEn ? 'Boundary: ' : '边界：'}{conflictAugmentation.avoidActionAdditions[0]}\n                  </p>\n                )}\n                {conflictAugmentation.limitations[0] && (\n                  <p className=\"mt-1.5 text-[9px] font-semibold leading-4 text-sky-900/65\">{conflictAugmentation.limitations[0]}</p>\n                )}\n                {conflictAugmentation.showInterventionComparison && (\n                  <Button\n                    type=\"button\"\n                    variant=\"outline\"\n                    data-open-intervention-comparison\n                    onClick={() => setIsInterventionComparisonOpen(true)}\n                    className=\"mt-3 h-10 w-full rounded-full border-emerald-200 bg-white text-[11px] font-black text-emerald-800 hover:bg-emerald-50\"\n                  >\n                    {isEn ? 'Compare keep / relocation scenarios' : '查看保留 / 移出方案比较'}\n                  </Button>\n                )}\n              </section>\n            )}\n\n            {diagnosisState.result.avoidActions[0] && (\n              <section className=\"mt-3 rounded-[16px] bg-amber-50 px-3 py-2.5\">\n",
);

replaceOnce(
  'panel-mount-and-end-marker',
  "      )}\n    </section>\n  );\n}\n\nconst translateTopicTag = (tag: string, isEn = false) => {\n",
  "      )}\n\n      {decisionSupport && (\n        <InterventionComparisonPanel\n          open={isInterventionComparisonOpen}\n          result={decisionSupport}\n          isEn={isEn}\n          onOpenChange={setIsInterventionComparisonOpen}\n        />\n      )}\n      {/* CARE_CONFLICT_DECISION_SURFACE_END */}\n    </section>\n  );\n}\n\nconst translateTopicTag = (tag: string, isEn = false) => {\n",
);

await writeFile(path, source, 'utf8');
console.log('Care conflict decision surface patched with shared read-only decision support and diagnosis augmentation');
