import fs from 'node:fs';

// Preflight patch for the one-time export removal migration.
const path = 'scripts/remove-export-features.mjs';
let content = fs.readFileSync(path, 'utf8');

const replace = (from, to) => {
  if (!content.includes(from)) throw new Error(`migration patch target not found: ${from.slice(0, 100)}`);
  content = content.replace(from, to);
};

replace(
`    const start = content.lastIndexOf('<button', needleIndex);
    const endTag = content.indexOf('</button>', needleIndex);
    if (start < 0 || endTag < 0) fail(\`${'${path}'}: could not remove button containing ${'${needle}'}\`);
    let end = endTag + '</button>'.length;`,
`    const nativeStart = content.lastIndexOf('<button', needleIndex);
    const componentStart = content.lastIndexOf('<Button', needleIndex);
    const start = Math.max(nativeStart, componentStart);
    const closingTag = start === componentStart ? '</Button>' : '</button>';
    const endTag = content.indexOf(closingTag, needleIndex);
    if (start < 0 || endTag < 0) fail(\`${'${path}'}: could not remove button containing ${'${needle}'}\`);
    let end = endTag + closingTag.length;`
);

replace(
`removeBetween('src/components/SpeciesDetailDialog.tsx',
  '  const renderExportCard = async () => {',
  '  const handleRecordDeath = async () => {');`,
`removeConstFunction('src/components/SpeciesDetailDialog.tsx', '  const renderExportCard = async () => {');
removeConstFunction('src/components/SpeciesDetailDialog.tsx', '  const handleSaveExportCard = async () => {');
removeConstFunction('src/components/SpeciesDetailDialog.tsx', '  const handlePrintExportCard = async () => {');`
);

replace(
`for (const line of [
  "          onDownloadHealth={() => openExportArtifact(buildHealthScoreArtifact(artifactContext))}\\n",
  "          onDownloadCarePlan={() => openExportArtifact(buildWeeklyCareArtifact(artifactContext))}\\n",
  "        onDownloadArchive={() => openExportArtifact(buildAquariumArchiveArtifact(artifactContext))}\\n",
  "        onCreateShare={() => void createPrivateShare()}\\n",
  "        isCreatingShare={isCreatingShare}\\n",
]) replaceRequired('src/pages/Aquarium.tsx', line, '');
// Multi-line milestone prop.
removeBetween('src/pages/Aquarium.tsx',
  '        onDownloadMilestone={aquariumAgeDays >= 100 && activeAquarium.startedAtConfirmedAt\\n',
  '        onCreateShare={() => void createPrivateShare()}\\n');
// onCreateShare line was consumed by the range above, so remove the remaining creating-share prop if still present.
{
  let content = read('src/pages/Aquarium.tsx');
  content = content.replace('        isCreatingShare={isCreatingShare}\\n', '');
  write('src/pages/Aquarium.tsx', content);
}`,
`for (const line of [
  "          onDownloadHealth={() => openExportArtifact(buildHealthScoreArtifact(artifactContext))}\\n",
  "          onDownloadCarePlan={() => openExportArtifact(buildWeeklyCareArtifact(artifactContext))}\\n",
  "        onDownloadArchive={() => openExportArtifact(buildAquariumArchiveArtifact(artifactContext))}\\n",
]) replaceRequired('src/pages/Aquarium.tsx', line, '');
// Remove the multi-line milestone export prop before removing the following share prop.
removeBetween('src/pages/Aquarium.tsx',
  '        onDownloadMilestone={aquariumAgeDays >= 100 && activeAquarium.startedAtConfirmedAt\\n',
  '        onCreateShare={() => void createPrivateShare()}\\n');
replaceRequired('src/pages/Aquarium.tsx', "        onCreateShare={() => void createPrivateShare()}\\n", '');
replaceRequired('src/pages/Aquarium.tsx', "        isCreatingShare={isCreatingShare}\\n", '');`
);

// Add remaining export surfaces discovered by the regression scan.
replace(
`// Package surface: remove export test and html2canvas dependency; add a regression guard.`,
`// Onboarding task card: progress remains, downloadable checklist is removed.
replaceRequired('src/components/onboarding/OnboardingTaskCard.tsx',
  "import { Check, ChevronRight, Circle, Download, X } from 'lucide-react';",
  "import { Check, ChevronRight, Circle, X } from 'lucide-react';");
replaceRequired('src/components/onboarding/OnboardingTaskCard.tsx', "import { ExportArtifactDialog } from '../export/ExportArtifactDialog';\\n", '');
replaceRequired('src/components/onboarding/OnboardingTaskCard.tsx', "import { buildStarterChecklistArtifact } from '../../services/export/aquarium-artifact.service';\\n", '');
replaceRequired('src/components/onboarding/OnboardingTaskCard.tsx', "  const [isExportOpen, setIsExportOpen] = useState(false);\\n", '');
replaceRequired('src/components/onboarding/OnboardingTaskCard.tsx', "  const isEn = document.documentElement.lang.startsWith('en');\\n", '');
replaceRequired('src/components/onboarding/OnboardingTaskCard.tsx', "  const exportContent = buildStarterChecklistArtifact({ labels: tasks.map(task => task.label), states: tasks.map(task => task.done), isEn });\\n", '');
removeBalancedExpression('src/components/onboarding/OnboardingTaskCard.tsx', '          {progress.completedCount > 0 && (');
replaceRequired('src/components/onboarding/OnboardingTaskCard.tsx', "      <ExportArtifactDialog open={isExportOpen} onOpenChange={setIsExportOpen} content={exportContent} isEn={isEn} />\\n", '');

// Existing public share links may still be viewed; downloading a report is removed.
replaceRequired('src/pages/SharedReport.tsx',
  "import { useEffect, useMemo, useState } from 'react';",
  "import { useEffect, useState } from 'react';");
replaceRequired('src/pages/SharedReport.tsx',
  "import { Download, ShieldCheck } from 'lucide-react';",
  "import { ShieldCheck } from 'lucide-react';");
replaceRequired('src/pages/SharedReport.tsx', "import { ExportArtifactDialog, type ExportArtifactContent } from '../components/export/ExportArtifactDialog';\\n", '');
replaceRequired('src/pages/SharedReport.tsx', "  const [isExportOpen, setIsExportOpen] = useState(false);\\n", '');
removeBetween('src/pages/SharedReport.tsx',
  '  const exportContent = useMemo<ExportArtifactContent | null>(() => report ? ({\\n',
  '  return (\\n');
const sharedReportDownloadButtons = removeButtonContaining('src/pages/SharedReport.tsx', 'setIsExportOpen(true)');
if (sharedReportDownloadButtons < 1) fail('SharedReport: expected report download button');
replaceRequired('src/pages/SharedReport.tsx', "      <ExportArtifactDialog open={isExportOpen} onOpenChange={setIsExportOpen} content={exportContent} isEn={isEn} />\\n", '');

// Onboarding activation test must no longer require an export action.
replaceRequired('scripts/test-onboarding-activation.ts', "assert.match(taskCardSource, /buildStarterChecklistArtifact\\\\(\\\\{ labels: tasks\\\\.map/, '导出清单必须复用任务卡的同一任务集合');\\n", '');
replaceRequired('scripts/test-onboarding-activation.ts', "assert.match(taskCardSource, /progress\\\\.completedCount > 0/, '未完成任何真实任务时不得下载清单');\\n", '');
replaceRequired('scripts/test-onboarding-activation.ts',
  "console.log('onboarding activation: goal order, real compatibility, legacy data and shared checklist passed');",
  "console.log('onboarding activation: goal order, real compatibility and legacy data passed');");

// Package surface: remove export test and html2canvas dependency; add a regression guard.`
);

replace(
`const roots = ['src', 'scripts', 'package.json', 'HANDOFF.md'];\\n`,
`const roots = ['src', 'scripts', 'package.json'];\\n`
);

replace(
`const walk = (target) => {\\n  if (!fs.existsSync(target)) return;\\n  const stat = fs.statSync(target);`,
`const walk = (target) => {\\n  if (target === 'scripts/verify-no-export-features.mjs' || target === 'scripts/remove-export-features.mjs' || target === 'scripts/fix-remove-export-migration.mjs') return;\\n  if (!fs.existsSync(target)) return;\\n  const stat = fs.statSync(target);`
);

fs.writeFileSync(path, content);
console.log('Export removal migration hardened.');
