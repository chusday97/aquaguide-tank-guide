import { nextWaveUnified08EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-08';
import { nextWaveUnified09EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-09';
import { nextWaveUnified10EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-10';
import { nextWaveUnified11EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-11';
import { nextWaveUnified12EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-12';
import { nextWaveUnified13EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-13';
import { nextWaveUnified14EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-14';
import { nextWaveUnified16EvidenceCeilings } from './catalogReviewBatches/next-wave-unified-16';

export type KnowledgeEvidenceCeilingCode =
  | 'variant_social_not_established'
  | 'variant_husbandry_not_established'
  | 'species_social_not_established'
  | 'species_space_minimum_conflicted'
  | 'species_space_minimum_not_established'
  | 'species_temperature_husbandry_not_established'
  | 'species_ph_husbandry_range_not_established'
  | 'species_territoriality_not_established'
  | 'species_fish_predation_not_established';

export type KnowledgeEvidenceField = 'feeding' | 'environment' | 'space' | 'social' | 'care' | 'territoriality' | 'predation';

export type KnowledgeEvidenceCeiling = {
  speciesId: string;
  field: KnowledgeEvidenceField;
  code: KnowledgeEvidenceCeilingCode;
  sourceIds: string[];
  note: string;
  reviewedAt: string;
  researchDisposition?: 'terminal_unknown_hold';
};

export const knowledgeEvidenceCeilings: Record<string, KnowledgeEvidenceCeiling[]> = {
  ...Object.fromEntries(nextWaveUnified08EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  ...Object.fromEntries(nextWaveUnified09EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  ...Object.fromEntries(nextWaveUnified10EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  ...Object.fromEntries(nextWaveUnified11EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  ...Object.fromEntries(nextWaveUnified12EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  ...Object.fromEntries(nextWaveUnified13EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  ...Object.fromEntries(nextWaveUnified14EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  ...Object.fromEntries(nextWaveUnified16EvidenceCeilings.map(outcome => [outcome.speciesId, [{
    ...outcome,
    reviewedAt: '2026-10-13',
    researchDisposition: 'terminal_unknown_hold' as const,
  }]])),
  sp_0038: [
    {
      speciesId: 'sp_0038',
      field: 'space',
      code: 'species_space_minimum_not_established',
      sourceIds: [
        'fishbase-opsariichthys-bidens',
        'doi-opsariichthys-bidens-enrichment-2024',
        'cnipa-opsariichthys-bidens-parent-culture-wave18',
      ],
      note: 'Targeted exact-taxon review established adult size, managed water conditions, feeding risk and social behavior for Opsariichthys bidens, but found no defensible household-aquarium minimum length or volume. Production ponds, broodstock facilities and experimental vessels are context-specific and must not be converted into a minimum tank size merely to clear coverage.',
      reviewedAt: '2026-10-15',
      researchDisposition: 'terminal_unknown_hold',
    },
    {
      speciesId: 'sp_0038',
      field: 'social',
      code: 'species_territoriality_not_established',
      sourceIds: ['doi-opsariichthys-bidens-enrichment-2024'],
      note: 'The exact-taxon enrichment study documents chasing, nipping, clustering and dominance-hierarchy effects, but does not directly establish territory defense or non-territoriality for Opsariichthys bidens. Keep territoriality terminal-unknown rather than translating general aggression or dominance into a territorial trait.',
      reviewedAt: '2026-10-15',
      researchDisposition: 'terminal_unknown_hold',
    },
  ],
  sp_0051: [
    {
      speciesId: 'sp_0051',
      field: 'environment',
      code: 'species_temperature_husbandry_not_established',
      sourceIds: [
        'cnipa-acrossocheilus-fasciatus-growout-wave19',
        'cnipa-acrossocheilus-fasciatus-breeding-wave19',
        'jwas-acrossocheilus-fasciatus-temperature-wave19',
      ],
      note: 'Targeted exact-taxon review found several valid but life-stage/context-specific temperature observations rather than one defensible all-stage aquarium planning range: grow-out uses a seasonally varying 3–28°C water source and begins feeding around 13–15°C, breeding work uses >=22°C for spawning and 22–25°C for larvae, while the peer-reviewed fry study estimates 23.81–26.57°C as the growth/feeding optimum for fry. Do not collapse these different purposes into a single generic Compatibility temperature range.',
      reviewedAt: '2026-10-15',
      researchDisposition: 'terminal_unknown_hold',
    },
    {
      speciesId: 'sp_0051',
      field: 'space',
      code: 'species_space_minimum_not_established',
      sourceIds: [
        'batch08-fishbase-acrossocheilus-fasciatus',
        'cnipa-acrossocheilus-fasciatus-growout-wave19',
      ],
      note: 'Exact-taxon review found production grow-out pools (including 15 m × 4 m commercial culture units) but no defensible household-aquarium minimum length or volume. A production facility dimension is not a minimum tank requirement and must not be promoted merely to clear Compatibility coverage.',
      reviewedAt: '2026-10-15',
      researchDisposition: 'terminal_unknown_hold',
    },
    {
      speciesId: 'sp_0051',
      field: 'territoriality',
      code: 'species_territoriality_not_established',
      sourceIds: ['doi-acrossocheilus-fasciatus-behavior-2024'],
      note: 'Peer-reviewed exact-taxon behavior work supports shoal cohesion, synchronization, sociability and individual behavioral variation, but does not directly establish stable territory defense or explicit non-territoriality. Keep territoriality fail-closed instead of translating general social or aggressive behavior into a territory rule.',
      reviewedAt: '2026-10-15',
      researchDisposition: 'terminal_unknown_hold',
    },
    {
      speciesId: 'sp_0051',
      field: 'predation',
      code: 'species_fish_predation_not_established',
      sourceIds: [
        'dlou-acrossocheilus-fasciatus-diet-wave19',
        'batch08-fishbase-acrossocheilus-fasciatus',
      ],
      note: 'Recent exact-species literature describes juveniles feeding on plankton and adults mainly on attached algae, aquatic-insect larvae and organic detritus, but does not directly test or state fish-prey safety. Absence of fish from the reported diet is not sufficient evidence for predation targets: []; keep fish-predation scope terminal-unknown until direct prey-scope evidence exists.',
      reviewedAt: '2026-10-15',
      researchDisposition: 'terminal_unknown_hold',
    },
  ],
  sp_0130: [
    {
      speciesId: 'sp_0130',
      field: 'space',
      code: 'species_space_minimum_not_established',
      sourceIds: [
        'fishbase-opsariichthys-bidens',
        'doi-opsariichthys-bidens-enrichment-2024',
        'cnipa-opsariichthys-bidens-parent-culture-wave18',
      ],
      note: 'This duplicate exact Opsariichthys bidens catalog object shares the same targeted evidence boundary as sp_0038: reviewed sources do not provide a defensible household-aquarium minimum length or volume, and production or experimental vessel dimensions must not be promoted as a tank minimum.',
      reviewedAt: '2026-10-15',
      researchDisposition: 'terminal_unknown_hold',
    },
    {
      speciesId: 'sp_0130',
      field: 'social',
      code: 'species_territoriality_not_established',
      sourceIds: ['doi-opsariichthys-bidens-enrichment-2024'],
      note: 'This duplicate exact Opsariichthys bidens object shares the same behavioral evidence ceiling as sp_0038: direct research shows aggression and dominance hierarchy but not explicit territory defense or non-territoriality, so territoriality remains fail-closed.',
      reviewedAt: '2026-10-15',
      researchDisposition: 'terminal_unknown_hold',
    },
  ],
  sp_0047: [
    {
      speciesId: 'sp_0047',
      field: 'social',
      code: 'species_social_not_established',
      sourceIds: ['batch18-fishbase-tachysurus-fulvidraco', 'fws-tachysurus-fulvidraco-erss'],
      note: 'Targeted review established accepted identity, freshwater environment, aquarium planning temperature, adult size and male nest guarding, but did not establish a stable household community/social mode. Keep positive community compatibility fail-closed instead of repeating ordinary source search.',
      reviewedAt: '2026-10-11',
      researchDisposition: 'terminal_unknown_hold',
    },
    {
      speciesId: 'sp_0047',
      field: 'predation',
      code: 'species_fish_predation_not_established',
      sourceIds: ['batch18-fishbase-tachysurus-fulvidraco', 'fws-tachysurus-fulvidraco-erss'],
      note: 'The same targeted exact-taxon review records occasional fish consumption but does not establish a defensible prey-size or fish-prey scope for aquarium planning. Keep predation scope terminal-unknown until direct prey-scope evidence exists; do not widen occasional fish consumption into a generic small-fish rule.',
      reviewedAt: '2026-10-11',
      researchDisposition: 'terminal_unknown_hold',
    },
  ],
  sp_0173: [
    {
      speciesId: 'sp_0173',
      field: 'territoriality',
      code: 'species_territoriality_not_established',
      sourceIds: [
        'wave05-seriouslyfish-salminus-brasiliensis',
        'aquaculture-international-salminus-aggression-wave20',
      ],
      note: 'Targeted exact-species review confirms strong aggression, piscivory and juvenile intraspecific injury/cannibalism in Salminus brasiliensis, but the reviewed sources do not directly establish stable territory defense or explicit non-territoriality. Aggression is already represented by predation/social risk and must not be silently converted into a territorial trait.',
      reviewedAt: '2026-10-15',
      researchDisposition: 'terminal_unknown_hold',
    },
  ],
  sp_0185: [
    {
      speciesId: 'sp_0185',
      field: 'environment',
      code: 'species_ph_husbandry_range_not_established',
      sourceIds: [
        'batch21-fishbase-pomacanthus-annularis',
        'research-wave21-fishipedia-pomacanthus-annularis',
        'adw-pomacanthus-annularis-predation-wave24',
      ],
      note: 'Repeated exact-taxon review across FishBase, Fishipedia and Animal Diversity Web did not establish a tolerated aquarium pH range for Pomacanthus annularis. ADW supplies only an optimum point of pH 8; Wave26 and Wave28 explicitly rejected promoting that point as {8,8}. Keep pH terminal-unknown until a direct min-max husbandry range is available.',
      reviewedAt: '2026-10-17',
      researchDisposition: 'terminal_unknown_hold',
    },
  ],
  sp_0198: [
    {
      speciesId: 'sp_0198',
      field: 'space',
      code: 'species_space_minimum_conflicted',
      sourceIds: [
        'seriouslyfish-channa-diplogramma',
        'baqua-channa-diplogramma-tank-minimum',
        'fishipedia-channa-diplogramma-tank-minimum',
      ],
      note: 'Targeted exact-taxon review found irreconcilable aquarium-minimum guidance: Seriously Fish records no numeric aquarium base and recommends only public installations or the very largest private aquaria, B-Aqua gives 500 L, and Fishi-pedia gives 3000 L. Keep tank_size terminal-unknown until a stronger exact-taxon numeric husbandry authority resolves the conflict; do not infer from adult size or choose a value merely to clear coverage.',
      reviewedAt: '2026-10-14',
      researchDisposition: 'terminal_unknown_hold',
    },
  ],
  sp_0224: [
    {
      speciesId: 'sp_0224',
      field: 'social',
      code: 'variant_husbandry_not_established',
      sourceIds: ['batch03-fishbase-channa-argus', 'northern-snakehead-fws-erss-2024', 'northern-snakehead-usgs-diet-2012'],
      note: 'Reviewed Channa argus sources establish base-species ecology and predation authority, and the reviewed Platinum identity may inherit that evidence through the canonical taxon bridge. Targeted review still does not establish a stable social mode or territoriality value, so those husbandry fields remain fail-closed; this ceiling does not block reviewed predation inheritance.',
      reviewedAt: '2026-09-22',
      researchDisposition: 'terminal_unknown_hold',
    },
    {
      speciesId: 'sp_0224',
      field: 'feeding',
      code: 'variant_husbandry_not_established',
      sourceIds: ['batch03-fishbase-channa-argus', 'northern-snakehead-usgs-diet-2012'],
      note: 'Reviewed sources establish Channa argus feeding ecology, but no reviewed source establishes Platinum-morph-specific feeding authority. Keep this field fail-closed rather than converting base-species diet evidence into a morph husbandry recommendation.',
      reviewedAt: '2026-09-22',
      researchDisposition: 'terminal_unknown_hold',
    },
    {
      speciesId: 'sp_0224',
      field: 'care',
      code: 'variant_husbandry_not_established',
      sourceIds: ['batch03-fishbase-channa-argus', 'northern-snakehead-fws-erss-2024'],
      note: 'Reviewed Channa argus sources do not establish a Platinum-morph-specific aquarium care protocol. Existing base-species temperature, size and ecological evidence remains useful context but is not promoted into morph-specific care authority.',
      reviewedAt: '2026-09-22',
      researchDisposition: 'terminal_unknown_hold',
    },
  ],
  sp_0258: [
    {
      speciesId: 'sp_0258',
      field: 'social',
      code: 'variant_social_not_established',
      sourceIds: [
        'sciadv-betta-phenotypic-diversity',
        'ygcen-betta-behavior-variation-2022',
      ],
      note: 'Koi/candy is a reviewed mosaic commercial phenotype of domesticated Betta splendens, but published aggression work shows substantial individual/strain variation and does not establish a Koi-specific stable social mode. Keep social authority fail-closed; this social ceiling does not block separately reviewed, field-scoped base-species space or trophic inheritance.',
      reviewedAt: '2026-09-22',
      researchDisposition: 'terminal_unknown_hold',
    },
    {
      speciesId: 'sp_0258',
      field: 'feeding',
      code: 'variant_husbandry_not_established',
      sourceIds: ['sciadv-betta-phenotypic-diversity'],
      note: 'The Koi/candy phenotype identity is reviewed, but no reviewed source establishes a Koi-specific feeding protocol. Base-species Betta feeding guidance is not promoted to the commercial phenotype without an explicit reviewed bridge.',
      reviewedAt: '2026-09-22',
      researchDisposition: 'terminal_unknown_hold',
    },
    {
      speciesId: 'sp_0258',
      field: 'care',
      code: 'variant_husbandry_not_established',
      sourceIds: ['sciadv-betta-phenotypic-diversity'],
      note: 'The Koi/candy phenotype identity is reviewed, but no reviewed source establishes Koi-specific husbandry beyond the explicitly bridged water, temperature, pH and adult-size fields. Keep broader care authority fail-closed.',
      reviewedAt: '2026-09-22',
      researchDisposition: 'terminal_unknown_hold',
    },
  ],
};

export const getKnowledgeEvidenceCeilings = (speciesId: string) => knowledgeEvidenceCeilings[speciesId] ?? [];
export const getKnowledgeEvidenceCeiling = (speciesId: string, field?: KnowledgeEvidenceField) => {
  const ceilings = getKnowledgeEvidenceCeilings(speciesId);
  return field ? ceilings.find(item => item.field === field) : ceilings[0];
};
