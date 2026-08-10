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

replace(
`const walk = (target) => {\\n  if (!fs.existsSync(target)) return;\\n  const stat = fs.statSync(target);`,
`const walk = (target) => {\\n  if (target === 'scripts/verify-no-export-features.mjs' || target === 'scripts/remove-export-features.mjs' || target === 'scripts/fix-remove-export-migration.mjs') return;\\n  if (!fs.existsSync(target)) return;\\n  const stat = fs.statSync(target);`
);

fs.writeFileSync(path, content);
console.log('Export removal migration hardened.');
