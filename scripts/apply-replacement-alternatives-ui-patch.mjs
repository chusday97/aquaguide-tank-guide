import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../src/components/SpeciesDetailDialog.tsx', import.meta.url);
let source = await readFile(path, 'utf8');

const replaceOnce = (label, before, after) => {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`[${label}] exact anchor not found`);
  if (source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`[${label}] exact anchor is not unique`);
  }
  source = source.slice(0, first) + after + source.slice(first + before.length);
};

replaceOnce(
  'imports',
  "import { evaluateTankCompatibility, type TankCompatibilityResult } from '../lib/tankCompatibilityEngine';\n",
  "import { evaluateTankCompatibility, type TankCompatibilityResult } from '../lib/tankCompatibilityEngine';\nimport { recommendReplacementSpecies } from '../lib/replacementRecommendationEngine';\nimport { RiskAndAlternativesPanel } from './compatibility/RiskAndAlternativesPanel';\n",
);

replaceOnce(
  'state',
  "  const [expandedSection, setExpandedSection] = useState<'fit' | 'compatibility' | null>(null);\n  const [inlineFeedback, setInlineFeedback] = useState('');\n",
  "  const [expandedSection, setExpandedSection] = useState<'fit' | 'compatibility' | null>(null);\n  const [inlineFeedback, setInlineFeedback] = useState('');\n  const [isAlternativesOpen, setIsAlternativesOpen] = useState(false);\n",
);

replaceOnce(
  'replacement-result',
  "  const selectedFit = useMemo(() => fish ? getSpeciesFitAssessment(fish, aquariumContext, t, isEn) : null, [fish, aquariumContext, isEn, t]);\n  const displayFit = selectedFit;\n  const selectedTaxonomy = fish ? getCareTaxonomyPath(fish) : null;\n",
  "  const selectedFit = useMemo(() => fish ? getSpeciesFitAssessment(fish, aquariumContext, t, isEn) : null, [fish, aquariumContext, isEn, t]);\n  const displayFit = selectedFit;\n  const replacementResult = useMemo(() => {\n    if (!fish || !aquariumContext || !displayFit) return null;\n    if (displayFit.status !== 'unsuitable' && displayFit.status !== 'conflictRisk') return null;\n    return recommendReplacementSpecies({\n      aquarium: aquariumContext,\n      rejectedSpecies: fish,\n      catalog: fishData,\n    });\n  }, [aquariumContext, displayFit, fish]);\n  const selectedTaxonomy = fish ? getCareTaxonomyPath(fish) : null;\n",
);

replaceOnce(
  'reset',
  "    setExpandedSection(null);\n    setInlineFeedback('');\n    setIsDeathFormOpen(false);\n",
  "    setExpandedSection(null);\n    setInlineFeedback('');\n    setIsAlternativesOpen(false);\n    setIsDeathFormOpen(false);\n",
);

replaceOnce(
  'primary-action',
  "    if (displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk' || displayFit.status === 'caution') {\n      if (!inCalculator) onAddToCalculator(fish);\n      onGoCalculator?.();\n      return;\n    }\n",
  "    if (displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk') {\n      setIsAlternativesOpen(true);\n      return;\n    }\n    if (displayFit.status === 'caution') {\n      if (!inCalculator) onAddToCalculator(fish);\n      onGoCalculator?.();\n      return;\n    }\n",
);

replaceOnce(
  'panel-mount',
  "      </Dialog>\n\n      {isPreviewOpen && (\n",
  "      </Dialog>\n\n      {fish && displayFit && replacementResult && (\n        <RiskAndAlternativesPanel\n          open={isAlternativesOpen}\n          rejectedSpecies={fish}\n          rejectedCompatibility={displayFit.compatibilityResult}\n          replacementResult={replacementResult}\n          isEn={isEn}\n          onOpenChange={setIsAlternativesOpen}\n          onViewCandidate={onSelectSpecies ? (candidate) => {\n            setIsAlternativesOpen(false);\n            onSelectSpecies(candidate);\n          } : undefined}\n        />\n      )}\n\n      {isPreviewOpen && (\n",
);

await writeFile(path, source, 'utf8');
console.log('replacement alternatives UI patch applied with exact unique anchors');
