import type { CompatibilityOnboardingCoreField } from './species-onboarding-research.service';

export type CompatibilitySpecializedSourceType =
  | 'government'
  | 'peer_reviewed'
  | 'university'
  | 'professional_association'
  | 'curated_husbandry';

export type CompatibilitySpecializedSourceRoute = {
  id: string;
  field: CompatibilityOnboardingCoreField;
  sourceTypes: CompatibilitySpecializedSourceType[];
  domainHints: string[];
  queryHints: string[];
  evidenceRule: string;
};

const routesByField: Partial<Record<CompatibilityOnboardingCoreField, CompatibilitySpecializedSourceRoute[]>> = {
  predation: [
    {
      id: 'predation_peer_reviewed_diet',
      field: 'predation',
      sourceTypes: ['peer_reviewed'],
      domainHints: ['pubmed.ncbi.nlm.nih.gov', 'pmc.ncbi.nlm.nih.gov', 'jstage.jst.go.jp', 'journals.plos.org', 'frontiersin.org'],
      queryHints: ['diet', 'prey', 'stomach contents', 'piscivory', 'fish fry', 'juvenile fish'],
      evidenceRule: 'Require a direct exact-taxon statement that the species eats, attacks, hunts or swallows fish/fry/juvenile fish. Egg predation, invertebrate diet, or being prey do not close predation.',
    },
    {
      id: 'predation_government_ecology',
      field: 'predation',
      sourceTypes: ['government'],
      domainHints: ['noaa.gov', 'usgs.gov', 'fws.gov', '.gov'],
      queryHints: ['species ecology', 'feeding ecology', 'prey', 'diet', 'small fish', 'juvenile fish'],
      evidenceRule: 'Use only direct exact-taxon feeding/predation statements. Do not infer tankmate predation from trophic guild or habitat.',
    },
    {
      id: 'predation_university_ecology',
      field: 'predation',
      sourceTypes: ['university'],
      domainHints: ['.edu', '.ac.uk', '.edu.au'],
      queryHints: ['species account', 'feeding ecology', 'diet', 'prey', 'fish fry', 'small fish'],
      evidenceRule: 'Use only direct exact-taxon evidence that identifies fish/fry/juvenile fish as prey or explicitly describes attacks on such fish.',
    },
  ],
  ph: [
    {
      id: 'ph_institutional_husbandry',
      field: 'ph',
      sourceTypes: ['government', 'university', 'professional_association'],
      domainHints: ['.gov', '.edu', '.ac.uk', 'aza.org'],
      queryHints: ['husbandry', 'care manual', 'aquarium', 'water quality', 'pH range', 'captive care'],
      evidenceRule: 'Require an explicit numeric pH range for captive/aquarium husbandry of the exact taxon. Marine habitat classification or experimental exposure pH alone is insufficient.',
    },
    {
      id: 'ph_peer_reviewed_husbandry',
      field: 'ph',
      sourceTypes: ['peer_reviewed'],
      domainHints: ['pubmed.ncbi.nlm.nih.gov', 'pmc.ncbi.nlm.nih.gov', 'jstage.jst.go.jp', 'journals.plos.org', 'frontiersin.org'],
      queryHints: ['captive husbandry', 'aquaculture', 'maintenance water', 'water quality', 'pH'],
      evidenceRule: 'Require a direct numeric routine maintenance/husbandry pH for the exact taxon. Do not promote challenge-test, toxicity-test, or transient experimental pH as normal care.',
    },
  ],
  tank_size: [
    {
      id: 'tank_size_institutional_husbandry',
      field: 'tank_size',
      sourceTypes: ['university', 'professional_association', 'government'],
      domainHints: ['.edu', '.ac.uk', 'aza.org', '.gov'],
      queryHints: ['husbandry', 'care manual', 'minimum aquarium', 'tank length', 'tank volume', 'enclosure dimensions'],
      evidenceRule: 'Require an explicit minimum aquarium/tank volume, footprint, or length for the exact taxon. Never infer tank size from adult body size or collection container dimensions.',
    },
  ],
};

const coreFields = new Set<CompatibilityOnboardingCoreField>([
  'water',
  'temperature',
  'ph',
  'adult_size',
  'tank_size',
  'social_behavior',
  'territoriality',
  'predation',
]);

export const isCompatibilityCoreField = (value: string): value is CompatibilityOnboardingCoreField => (
  coreFields.has(value as CompatibilityOnboardingCoreField)
);

export const buildCompatibilitySpecializedSourceRoutes = (
  targetFields: readonly string[],
  attemptedRouteIds: readonly string[] = [],
): CompatibilitySpecializedSourceRoute[] => {
  const attempted = new Set(attemptedRouteIds);
  const routes: CompatibilitySpecializedSourceRoute[] = [];
  const seen = new Set<string>();
  for (const rawField of targetFields) {
    if (!isCompatibilityCoreField(rawField)) continue;
    for (const route of routesByField[rawField] || []) {
      if (attempted.has(route.id) || seen.has(route.id)) continue;
      seen.add(route.id);
      routes.push(route);
    }
  }
  return routes;
};

export const hasExhaustedCompatibilitySpecializedRoutes = (
  targetFields: readonly string[],
  attemptedRouteIds: readonly string[],
) => (
  targetFields.some(isCompatibilityCoreField)
  && buildCompatibilitySpecializedSourceRoutes(targetFields, attemptedRouteIds).length === 0
);
