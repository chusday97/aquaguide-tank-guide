import { readFile, writeFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const sourcePath = 'src/components/CompatibilityRiskCalculator.tsx';
const workflowPath = '.github/workflows/compatibility-pair-telemetry-patch.yml';
const selfPath = 'scripts/patch-compatibility-pair-telemetry.mjs';

const before = `  useEffect(() => {
    if (!selectedAquarium || !resultStatus || relevantPairs.length === 0) return;
    const ids = candidateSpecies.length > 0 ? candidateSpecies.map(item => item.id) : selectedSpecies.map(item => item.id);
    const key = \`${'${selectedAquarium.id}'}:${'${ids.sort().join(\'|\')}'}:${'${resultStatus}'}\`;
    if (recordedKeyRef.current === key) return;
    recordedKeyRef.current = key;
    recordTankCompatibility({ aquariumId: selectedAquarium.id, speciesIds: ids, status: resultStatus });
    trackSessionEvent('compatibility_started', {
      action: 'calculate',
      status: resultStatus,
      entry: 'compatibility_v2',
      source: 'rules',
      candidateCount: ids.length,
    });
    onEvaluationRecorded?.();
  }, [candidateSpecies, onEvaluationRecorded, relevantPairs.length, resultStatus, selectedAquarium, selectedSpecies]);`;

const after = `  useEffect(() => {
    if (!selectedAquarium || !resultStatus || relevantPairs.length === 0) return;
    const ids = candidateSpecies.length > 0 ? candidateSpecies.map(item => item.id) : selectedSpecies.map(item => item.id);
    const key = \`${'${selectedAquarium.id}'}:${'${ids.sort().join(\'|\')}'}:${'${resultStatus}'}\`;
    if (recordedKeyRef.current === key) return;
    recordedKeyRef.current = key;
    recordTankCompatibility({ aquariumId: selectedAquarium.id, speciesIds: ids, status: resultStatus });
    trackSessionEvent('compatibility_started', {
      action: 'calculate',
      status: resultStatus,
      entry: 'compatibility_v2',
      source: 'rules',
      candidateCount: ids.length,
    });
    relevantPairs.forEach(pair => {
      trackSessionEvent('compatibility_pair_evaluated', {
        action: 'evaluate_pair',
        status: pair.status,
        entry: 'compatibility_v2',
        source: 'rules',
        pairKey: \`${'${pair.speciesA.id}'}__${'${pair.speciesB.id}'}\`,
      });
    });
    onEvaluationRecorded?.();
  }, [candidateSpecies, onEvaluationRecorded, relevantPairs, resultStatus, selectedAquarium, selectedSpecies]);`;

const source = await readFile(sourcePath, 'utf8');
const occurrences = source.split(before).length - 1;
if (occurrences !== 1) {
  throw new Error(`Expected exactly one CompatibilityRiskCalculator telemetry anchor, found ${occurrences}. Refusing to patch.`);
}
if (source.includes("trackSessionEvent('compatibility_pair_evaluated'")) {
  throw new Error('Pair telemetry emitter already exists outside the expected patch state. Refusing to guess.');
}

await writeFile(sourcePath, source.replace(before, after), 'utf8');

execFileSync('npm', ['run', 'test:session-events'], { stdio: 'inherit' });
execFileSync('npm', ['run', 'lint'], { stdio: 'inherit' });

await rm(selfPath);
await rm(workflowPath);

console.log('Guarded CompatibilityRiskCalculator pair telemetry patch passed and one-shot tooling removed.');
