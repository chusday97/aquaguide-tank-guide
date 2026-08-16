import { fishData } from '../src/data/fishData';
import { buildTankDecisionSupport } from '../src/lib/tankDecisionSupportOrchestrator';
import { buildRelocationConfirmationEntrypoint } from '../src/lib/relocationConfirmationEntrypoint';
import type { Aquarium, AquariumFish, AquariumSpeciesBatch } from '../src/types';

const batch = (id: string, quantity: number): AquariumSpeciesBatch => ({
  id,
  quantity,
  entryDate: '2026-08-17T00:00:00.000Z',
  lifeStage: 'adult',
  reproductiveState: 'normal',
  stateUpdatedAt: '2026-08-17T00:00:00.000Z',
});

const fishRecord = (id: string, fishId: string, quantity: number): AquariumFish => ({
  id,
  fishId,
  quantity,
  entryDate: '2026-08-17T00:00:00.000Z',
  batches: [batch(`${id}-batch`, quantity)],
});

const tank = (id: string, name: string, fishes: AquariumFish[], targetTemperature = '25'): Aquarium => ({
  id,
  name,
  fishes,
  dimensions: { length: '120', width: '50', height: '50' },
  waterType: 'Freshwater',
  targetTemperature,
  substrate: '河沙',
  plants: ['水草'],
  hardscape: ['沉木'],
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
});

const cases = [
  {
    name: 'convict + tiger barb',
    residents: [
      { id: 'sp_0021', quantity: 1 },
      { id: 'sp_0439', quantity: 6 },
    ],
  },
  {
    name: 'snakehead + neon tetra',
    residents: [
      { id: 'sp_0049', quantity: 1 },
      { id: 'sp_0431', quantity: 6 },
    ],
  },
  {
    name: 'snakehead + cardinal tetra',
    residents: [
      { id: 'sp_0049', quantity: 1 },
      { id: 'sp_0432', quantity: 6 },
    ],
  },
];

const results: unknown[] = [];

for (const fixture of cases) {
  const records = fixture.residents.map(item => fishRecord(`${item.id}-record`, item.id, item.quantity));
  const source = tank(`source-${fixture.name}`, `Source ${fixture.name}`, records);
  const destination = tank(`destination-${fixture.name}`, `Destination ${fixture.name}`, []);
  const decision = buildTankDecisionSupport({ aquarium: source, catalog: fishData, allAquariums: [source, destination] });
  const options = decision.formalChoiceComparison?.options || [];
  const optionResults = options.map(option => {
    const entry = buildRelocationConfirmationEntrypoint({
      result: decision,
      sourceAquarium: source,
      optionId: option.id,
      destinationAquariumId: destination.id,
    });
    const destinationEvaluation = decision.relocationDestinations
      .find(item => item.subjectSpeciesId === option.subjectSpeciesId)
      ?.destinations.evaluations.find(item => item.aquariumId === destination.id);
    return {
      subjectSpeciesId: option.subjectSpeciesId,
      subjectName: option.subjectName,
      quantity: option.quantity,
      destinationStatus: destinationEvaluation?.status,
      rawCompatibilityStatus: destinationEvaluation?.rawCompatibilityStatus,
      entrypointStatus: entry.status,
      entrypointReason: entry.status === 'blocked' ? entry.reason : undefined,
    };
  });
  results.push({
    name: fixture.name,
    certainty: decision.certainty,
    formalInterventionAllowed: decision.formalInterventionAllowed,
    blockerCount: decision.knownSubsetActionPlan.graph.edges.filter(edge => edge.outcome === 'blocker').length,
    options: optionResults,
  });
}

console.log(JSON.stringify(results, null, 2));

const eligible = (results as Array<{ name: string; options: Array<{ entrypointStatus: string }> }>)
  .flatMap(item => item.options.map(option => ({ fixture: item.name, ...option })))
  .filter(item => item.entrypointStatus === 'eligible');

if (eligible.length === 0) {
  throw new Error('No real-catalog reviewed relocation fixture produced an eligible confirmation entrypoint. Do not build browser tests from a synthetic catalog bypass.');
}

console.log('ELIGIBLE_REAL_BROWSER_FIXTURES', JSON.stringify(eligible));
