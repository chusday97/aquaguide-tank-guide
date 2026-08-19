import fs from 'node:fs';

const replaceExact = (source, before, after, label) => {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  return source.replace(before, after);
};

const aquariumPath = 'src/pages/Aquarium.tsx';
let aquarium = fs.readFileSync(aquariumPath, 'utf8');

aquarium = replaceExact(
  aquarium,
  `  const [selectedDailyCheckArticle, setSelectedDailyCheckArticle] = useState<(typeof careTopicsData)[number] | null>(null);\n`,
  '',
  'Remove Daily Check article modal state',
);

aquarium = replaceExact(
  aquarium,
  `      primaryActionLabel: diagnosisIssueType === '巡检' && dailyCheckArticles[0]\n        ? '查看补救步骤'\n        : diagnosisIssueType === '巡检'\n          ? todayDailyCheckRecord ? '更新今天记录' : '保存今天记录'\n          : '保存本次诊断',\n      primaryActionType: diagnosisIssueType === '巡检' && dailyCheckArticles[0] ? 'dialog' : 'mutation',\n    });\n    if (dailyCheckInterpretation) {`,
  `      primaryActionLabel: diagnosisIssueType === '巡检'\n        ? todayDailyCheckRecord ? '更新今天记录' : '保存今天记录'\n        : '保存本次诊断',\n      primaryActionType: 'mutation',\n    });\n    const relatedCareArticle = diagnosisIssueType === '巡检' ? dailyCheckArticles[0] : undefined;\n    if (relatedCareArticle) {\n      model.detailSections.push({\n        id: 'care-article',\n        title: \`相关护理 · \${relatedCareArticle.title}\`,\n        items: [\n          relatedCareArticle.summary,\n          ...relatedCareArticle.firstSteps.slice(0, 3).map((step, index) => \`步骤 \${index + 1} · \${step}\`),\n          ...relatedCareArticle.avoid.slice(0, 2).map(item => \`避免 · \${item}\`),\n          relatedCareArticle.nextStep ? \`下一步 · \${relatedCareArticle.nextStep}\` : '',\n        ].filter(Boolean),\n      });\n    }\n    if (dailyCheckInterpretation) {`,
  'Turn Daily Check article into inline result evidence',
);

aquarium = replaceExact(
  aquarium,
  `  const handleVisualDiagnosisPrimary = () => {\n    const saved = handleSaveDiagnosisRecord();\n    if (!saved) return;\n    if (diagnosisIssueType === '巡检' && dailyCheckArticles[0] && structuredDiagnosis) {\n      setSelectedDailyCheckArticle(dailyCheckArticles[0]);\n      trackSessionEvent('remedy_article_opened', { action: 'open', status: structuredDiagnosis.riskLevel, entry: 'daily-check-result' });\n    }\n  };`,
  `  const handleVisualDiagnosisPrimary = () => {\n    const saved = handleSaveDiagnosisRecord();\n    if (!saved) return;\n  };`,
  'Keep Daily Check primary CTA to one save intent while preserving save failure guard',
);

const modalStart = `      <Dialog open={Boolean(selectedDailyCheckArticle)} onOpenChange={(open) => !open && setSelectedDailyCheckArticle(null)}>`;
const nextDialog = `      <Dialog open={isRiskReminderOpen} onOpenChange={setIsRiskReminderOpen}>`;
const modalStartIndex = aquarium.indexOf(modalStart);
const nextDialogIndex = aquarium.indexOf(nextDialog, modalStartIndex);
if (modalStartIndex < 0 || nextDialogIndex < 0) {
  throw new Error(`Remove Daily Check article Dialog: anchors not found (${modalStartIndex}, ${nextDialogIndex})`);
}
aquarium = `${aquarium.slice(0, modalStartIndex)}${aquarium.slice(nextDialogIndex)}`;
fs.writeFileSync(aquariumPath, aquarium);

const visualPath = 'src/components/visual-results/VisualResultCard.tsx';
let visual = fs.readFileSync(visualPath, 'utf8');
visual = replaceExact(
  visual,
  `<section key={section.id} className="rounded-[13px] bg-white p-3">`,
  `<section key={section.id} data-visual-detail-section-id={section.id} className="rounded-[13px] bg-white p-3">`,
  'Expose semantic visual detail section id',
);
fs.writeFileSync(visualPath, visual);

console.log('Applied Daily Check inline guidance: save is one intent; care guidance stays inside result evidence.');