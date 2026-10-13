import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { evaluateTankCompatibility } from '../src/services/compatibility/compatibility.service';
import type { Aquarium, Fish } from '../src/types';
import {
  COMPATIBILITY_AI_PROMPT_VERSION,
  createCompatibilityAiShadowAssessment,
  type CompatibilityAiReasoningProvider,
} from '../apps/api/src/compatibility-ai-reasoner';

export type CompatibilityV4ShadowEvalCase = {
  caseId: string;
  description: string;
  species: Array<{ id: string; name: string; role: 'existing' | 'candidate'; quantity: number }>;
  deterministic: {
    status: string;
    decisionReadiness: string;
    ruleCodes: string[];
    evidenceIds: string[];
  };
  ai: {
    status: string;
    attemptedVerdict: string | null;
    acceptedVerdict: string | null;
    reason: string | null;
    providerCalls: number;
  };
  finalDecision: {
    status: string;
    unchanged: boolean;
  };
};

export type CompatibilityV4ShadowEvalReport = {
  schemaVersion: 1;
  promptVersion: string;
  tank: {
    dimensionsCm: [number, number, number];
    waterType: 'Freshwater';
    targetTemperatureC: number;
  };
  invariants: string[];
  cases: CompatibilityV4ShadowEvalCase[];
  summary: {
    totalCases: number;
    acceptedAi: number;
    rejectedAi: number;
    skippedAi: number;
    finalDecisionMutations: number;
  };
};

const tank: Aquarium = {
  id: 'compatibility-v4-shadow-eval',
  name: 'Compatibility V4 Shadow Eval',
  fishes: [],
  dimensions: { length: '120', width: '50', height: '50' },
  waterType: 'Freshwater',
  targetTemperature: '25',
};

const getFish = (id: string): Fish => {
  const fish = fishData.find(item => item.id === id);
  if (!fish) throw new Error('Missing V4 eval species ' + id);
  return fish;
};

const quantityFor = (fish: Fish) => Math.max(1, getReviewedCompatibilityProfile(fish.id)?.minimumGroupSize || 1);

type Fixture = {
  caseId: string;
  description: string;
  ids: [string, string, string];
  providerMode: 'more_conservative' | 'attempt_weaken_block' | 'must_skip';
};

const fixtures: Fixture[] = [
  {
    caseId: 'V4-SHADOW-3SP-COMPATIBLE',
    description: 'Three small freshwater species pass deterministic reviewed authority; AI may be more conservative but cannot replace the compatible final decision.',
    ids: ['sp_0114', 'sp_0469', 'sp_0012'],
    providerMode: 'more_conservative',
  },
  {
    caseId: 'V4-SHADOW-3SP-CAUTION',
    description: 'Three-species tank produces a reviewed caution from predation-vulnerability context; AI may rank the risk more conservatively but final remains caution.',
    ids: ['sp_0114', 'sp_0469', 'sp_0013'],
    providerMode: 'more_conservative',
  },
  {
    caseId: 'V4-SHADOW-3SP-BLOCKED',
    description: 'Reviewed three-species combination contains territorial and temperature hard conflicts; an optimistic AI override must be rejected.',
    ids: ['sp_0199', 'sp_0200', 'sp_0448'],
    providerMode: 'attempt_weaken_block',
  },
  {
    caseId: 'V4-SHADOW-3SP-INSUFFICIENT',
    description: 'Candidate lacks promotable exact reviewed authority; AI provider must not run and deterministic insufficient-data decision stays final.',
    ids: ['sp_0114', 'sp_0469', 'sp_0112'],
    providerMode: 'must_skip',
  },
];

const buildCase = async (fixture: Fixture): Promise<CompatibilityV4ShadowEvalCase> => {
  const species = fixture.ids.map(getFish);
  const quantities = species.map(quantityFor);
  const deterministic = evaluateTankCompatibility({
    tank,
    existingSpecies: [
      { species: species[0], record: { quantity: quantities[0] } },
      { species: species[1], record: { quantity: quantities[1] } },
    ],
    candidateSpecies: species[2],
    candidateQuantity: quantities[2],
    intent: 'planned_addition',
  });

  let providerCalls = 0;
  let attemptedVerdict: string | null = null;
  const ruleCodes = deterministic.metadata.domainRuleCodes;
  const provider: CompatibilityAiReasoningProvider = async () => {
    providerCalls += 1;
    if (fixture.providerMode === 'must_skip') {
      throw new Error('Provider must not run for incomplete authority.');
    }
    const selectedRule = ruleCodes.find(code => code !== 'compatibility_clear') || ruleCodes[0] || 'compatibility_clear';
    attemptedVerdict = fixture.providerMode === 'attempt_weaken_block'
      ? 'compatible'
      : deterministic.status === 'compatible'
        ? 'caution'
        : 'not_recommended';
    return {
      model: 'v4-shadow-eval-fixture',
      output: {
        suggestedVerdict: attemptedVerdict,
        reasons: [{
          text: fixture.providerMode === 'attempt_weaken_block'
            ? 'Fixture deliberately attempts to weaken a deterministic hard block.'
            : 'Fixture deliberately produces a grounded, more conservative shadow assessment.',
          ruleCodes: [selectedRule],
        }],
        adjustments: fixture.providerMode === 'attempt_weaken_block' ? [] : [{
          text: 'Keep the deterministic result authoritative and monitor the grounded risk after stocking.',
          ruleCodes: [selectedRule],
        }],
        uncertainties: [],
        confidence: 'medium',
        evidenceIds: deterministic.evidenceIds || [],
      },
    };
  };

  const shadow = await createCompatibilityAiShadowAssessment({
    deterministicResult: deterministic,
    tank,
    existingSpecies: [
      { species: species[0], quantity: quantities[0] },
      { species: species[1], quantity: quantities[1] },
    ],
    candidateSpecies: species[2],
    candidateQuantity: quantities[2],
  }, provider);

  return {
    caseId: fixture.caseId,
    description: fixture.description,
    species: species.map((item, index) => ({
      id: item.id,
      name: item.name,
      role: index === 2 ? 'candidate' : 'existing',
      quantity: quantities[index],
    })),
    deterministic: {
      status: deterministic.status,
      decisionReadiness: deterministic.metadata.decisionReadiness,
      ruleCodes,
      evidenceIds: deterministic.evidenceIds || [],
    },
    ai: {
      status: shadow.ai.status,
      attemptedVerdict,
      acceptedVerdict: shadow.ai.suggestedVerdict || null,
      reason: shadow.ai.reason || null,
      providerCalls,
    },
    finalDecision: {
      status: shadow.finalDecision.status,
      unchanged: shadow.finalDecision.status === deterministic.status,
    },
  };
};

export const buildCompatibilityV4ShadowEval = async (): Promise<CompatibilityV4ShadowEvalReport> => {
  const cases: CompatibilityV4ShadowEvalCase[] = [];
  for (const fixture of fixtures) cases.push(await buildCase(fixture));
  return {
    schemaVersion: 1,
    promptVersion: COMPATIBILITY_AI_PROMPT_VERSION,
    tank: {
      dimensionsCm: [120, 50, 50],
      waterType: 'Freshwater',
      targetTemperatureC: 25,
    },
    invariants: [
      'Deterministic finalDecision is never mutated by shadow AI.',
      'Reviewed hard blocks cannot be weakened by AI.',
      'Incomplete deterministic authority skips the AI provider.',
      'AI output must remain grounded in allow-listed deterministic rule/evidence authority.',
    ],
    cases,
    summary: {
      totalCases: cases.length,
      acceptedAi: cases.filter(item => item.ai.status === 'accepted').length,
      rejectedAi: cases.filter(item => item.ai.status === 'rejected').length,
      skippedAi: cases.filter(item => item.ai.status === 'skipped').length,
      finalDecisionMutations: cases.filter(item => !item.finalDecision.unchanged).length,
    },
  };
};
