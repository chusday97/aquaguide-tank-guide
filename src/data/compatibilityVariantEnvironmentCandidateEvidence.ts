export type CompatibilityVariantEnvironmentCandidateField = 'water' | 'temperature' | 'ph';

export type CompatibilityVariantEnvironmentCandidateSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: 'university' | 'professional_association' | 'curated_husbandry';
};

export type CompatibilityVariantEnvironmentCandidateEvidence = {
  researchKey: string;
  field: CompatibilityVariantEnvironmentCandidateField;
  status: 'draft_candidate' | 'blocked_by_contract';
  proposedValue: unknown;
  reasonCode?: string;
  evidenceSummary?: string;
  source: CompatibilityVariantEnvironmentCandidateSource;
};

/**
 * Source-controlled draft evidence discovered for the reviewed identity-known
 * zero-inheritance variants. These records are research inputs only.
 *
 * They do not write Catalog reviews, Compatibility Profiles, canonical
 * inheritedFacts, Pair Rules, rollout membership, or runtime authority.
 */
export const compatibilityVariantEnvironmentCandidateEvidence: CompatibilityVariantEnvironmentCandidateEvidence[] = [
  {
    researchKey: 'Carassius auratus',
    field: 'water',
    status: 'draft_candidate',
    proposedValue: 'freshwater',
    source: {
      id: 'research-93564a7e556d72f5e735',
      title: 'Carassius auratus | INFORMATION | Animal Diversity Web',
      publisher: 'Animal Diversity Web, University of Michigan',
      url: 'https://animaldiversity.org/accounts/Carassius_auratus',
      sourceType: 'university',
    },
  },
  {
    researchKey: 'Carassius auratus',
    field: 'temperature',
    status: 'draft_candidate',
    proposedValue: { min: 10, max: 25 },
    source: {
      id: 'research-ff4044764363ca267ede',
      title: 'Poisson rouge • Carassius auratus • Fiche poissons',
      publisher: 'Fishipedia',
      url: 'https://www.fishipedia.fr/fr/poissons/carassius-auratus',
      sourceType: 'curated_husbandry',
    },
  },
  {
    researchKey: 'Carassius auratus',
    field: 'ph',
    status: 'draft_candidate',
    proposedValue: { min: 6.5, max: 8 },
    source: {
      id: 'research-ff4044764363ca267ede',
      title: 'Poisson rouge • Carassius auratus • Fiche poissons',
      publisher: 'Fishipedia',
      url: 'https://www.fishipedia.fr/fr/poissons/carassius-auratus',
      sourceType: 'curated_husbandry',
    },
  },
  {
    researchKey: 'Paracheirodon innesi',
    field: 'water',
    status: 'draft_candidate',
    proposedValue: 'freshwater',
    source: {
      id: 'research-a8e109294b9b5d2fd459',
      title: 'Paracheirodon innesi, Neon tetra : fisheries, aquarium',
      publisher: 'FishBase',
      url: 'https://www.fishbase.se/summary/Paracheirodon-innesi.html',
      sourceType: 'professional_association',
    },
  },
  {
    researchKey: 'Paracheirodon innesi',
    field: 'temperature',
    status: 'draft_candidate',
    proposedValue: { min: 20, max: 26 },
    source: {
      id: 'research-97e9ab0c5596ea9db651',
      title: 'Néon bleu • Paracheirodon innesi • Fiche poissons',
      publisher: 'Fishipedia',
      url: 'https://www.fishipedia.fr/fr/poissons/paracheirodon-innesi',
      sourceType: 'curated_husbandry',
    },
  },
  {
    researchKey: 'Paracheirodon innesi',
    field: 'ph',
    status: 'draft_candidate',
    proposedValue: { min: 6, max: 7.2 },
    source: {
      id: 'research-97e9ab0c5596ea9db651',
      title: 'Néon bleu • Paracheirodon innesi • Fiche poissons',
      publisher: 'Fishipedia',
      url: 'https://www.fishipedia.fr/fr/poissons/paracheirodon-innesi',
      sourceType: 'curated_husbandry',
    },
  },
  {
    researchKey: 'Poecilia reticulata',
    field: 'water',
    status: 'blocked_by_contract',
    proposedValue: null,
    reasonCode: 'multi_environment_not_representable_by_single_water_value',
    evidenceSummary: 'Verified FishBase exact-taxon Environment explicitly lists both freshwater and brackish; current Compatibility water candidate contract is single-valued, so no deterministic value is promoted.',
    source: {
      id: 'research-fishbase-poecilia-water-boundary',
      title: 'Poecilia reticulata, Guppy : aquarium',
      publisher: 'FishBase',
      url: 'https://www.fishbase.se/summary/Poecilia-reticulata.html',
      sourceType: 'professional_association',
    },
  },
  {
    researchKey: 'Poecilia reticulata',
    field: 'temperature',
    status: 'draft_candidate',
    proposedValue: { min: 17, max: 28 },
    source: {
      id: 'research-96ef679173e9882fbdea',
      title: 'Poecilia reticulata (Guppy) · Seriously Fish',
      publisher: 'Seriously Fish',
      url: 'https://www.seriouslyfish.com/species/poecilia-reticulata',
      sourceType: 'curated_husbandry',
    },
  },
  {
    researchKey: 'Poecilia reticulata',
    field: 'ph',
    status: 'draft_candidate',
    proposedValue: { min: 7, max: 8.5 },
    source: {
      id: 'research-96ef679173e9882fbdea',
      title: 'Poecilia reticulata (Guppy) · Seriously Fish',
      publisher: 'Seriously Fish',
      url: 'https://www.seriouslyfish.com/species/poecilia-reticulata',
      sourceType: 'curated_husbandry',
    },
  },
  {
    researchKey: 'Tanichthys albonubes',
    field: 'water',
    status: 'draft_candidate',
    proposedValue: 'freshwater',
    source: {
      id: 'research-b32298af7de1ff8412a6',
      title: 'Tanichthys albonubes, White cloud mountain minnow : fisheries, aquarium',
      publisher: 'FishBase',
      url: 'https://www.fishbase.se/summary/Tanichthys-albonubes.html',
      sourceType: 'professional_association',
    },
  },
  {
    researchKey: 'Tanichthys albonubes',
    field: 'temperature',
    status: 'draft_candidate',
    proposedValue: { min: 2, max: 22 },
    source: {
      id: 'research-580d81074fd5681e91f5',
      title: 'Néon du pauvre • Tanichthys albonubes • Fiche poissons',
      publisher: 'Fishipedia',
      url: 'https://www.fishipedia.fr/fr/poissons/tanichthys-albonubes',
      sourceType: 'curated_husbandry',
    },
  },
  {
    researchKey: 'Tanichthys albonubes',
    field: 'ph',
    status: 'draft_candidate',
    proposedValue: { min: 6, max: 7.5 },
    source: {
      id: 'research-580d81074fd5681e91f5',
      title: 'Néon du pauvre • Tanichthys albonubes • Fiche poissons',
      publisher: 'Fishipedia',
      url: 'https://www.fishipedia.fr/fr/poissons/tanichthys-albonubes',
      sourceType: 'curated_husbandry',
    },
  },
];
