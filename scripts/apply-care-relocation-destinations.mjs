import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../src/pages/CareEncyclopedia.tsx', import.meta.url);
let source = await readFile(path, 'utf8');
const before = `  // CARE_CONFLICT_DECISION_SURFACE_START
  // This first page integration intentionally omits allAquariums. Until the canonical #34
  // hydration stack is formally converged, destination-list certainty stays unknown rather
  // than turning a standalone Draft's device snapshot into a relocation claim.
  const decisionSupport = useMemo(() => targetAquarium
    ? buildTankDecisionSupport({ aquarium: targetAquarium, catalog: fishData })
    : null, [targetAquarium]);
`;
const after = `  // CARE_CONFLICT_DECISION_SURFACE_START
  // Canonical merged-tree verification proved this Care surface reacts to #34 repository
  // hydration. The full aquarium set can therefore be supplied explicitly for destination
  // evaluation; every target tank is still recomputed through the canonical compatibility path.
  const decisionSupport = useMemo(() => targetAquarium
    ? buildTankDecisionSupport({ aquarium: targetAquarium, catalog: fishData, allAquariums: aquariums })
    : null, [targetAquarium, aquariums]);
`;
const first = source.indexOf(before);
if (first < 0) throw new Error('Care destination-evaluation anchor not found');
if (source.indexOf(before, first + before.length) >= 0) throw new Error('Care destination-evaluation anchor is not unique');
source = source.slice(0, first) + after + source.slice(first + before.length);
await writeFile(path, source, 'utf8');
console.log('Care decision support now receives the reactive aquarium set for read-only destination evaluation');
