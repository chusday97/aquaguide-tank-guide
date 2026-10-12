import { nextWaveUnified08DomainOutcomes } from './catalogReviewBatches/next-wave-unified-08';
import { nextWaveUnified09DomainOutcomes } from './catalogReviewBatches/next-wave-unified-09';

export type CompatibilityDomainBoundaryCode = 'life_type_not_supported_by_fish_compatibility_domain';

export type CompatibilityDomainBoundary = {
  speciesId: string;
  code: CompatibilityDomainBoundaryCode;
  lifeType: 'crustacean_or_mollusk' | 'amphibian' | 'coral_or_anemone' | 'jellyfish';
  sourceIds: string[];
  note: string;
  reviewedAt: string;
  researchDisposition: 'terminal_unknown_hold';
};

const reviewedAt = '2026-10-11';

const boundary = (
  speciesId: string,
  lifeType: CompatibilityDomainBoundary['lifeType'],
  sourceIds: string[],
  note: string,
): CompatibilityDomainBoundary => ({
  speciesId,
  code: 'life_type_not_supported_by_fish_compatibility_domain',
  lifeType,
  sourceIds,
  note,
  reviewedAt,
  researchDisposition: 'terminal_unknown_hold',
});

export const compatibilityDomainBoundaries: Record<string, CompatibilityDomainBoundary> = {
  ...Object.fromEntries(nextWaveUnified08DomainOutcomes.map(outcome => [outcome.speciesId, {
    ...outcome,
    code: 'life_type_not_supported_by_fish_compatibility_domain' as const,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }])),
  ...Object.fromEntries(nextWaveUnified09DomainOutcomes.map(outcome => [outcome.speciesId, {
    ...outcome,
    code: 'life_type_not_supported_by_fish_compatibility_domain' as const,
    reviewedAt: '2026-10-12',
    researchDisposition: 'terminal_unknown_hold' as const,
  }])),
  sp_0035: boundary('sp_0035', 'crustacean_or_mollusk', ['batch04-raffles-geosesarma-dennerle'], 'Duplicate catalog object for Geosesarma dennerle; same reviewed domain boundary as sp_0006.'),
  sp_0006: boundary('sp_0006', 'crustacean_or_mollusk', ['batch04-raffles-geosesarma-dennerle'], 'Geosesarma dennerle is a crab. The current reviewed Compatibility engine is fish-profile based and does not yet model terrestrial/semi-terrestrial crab habitat, predation, or cohabitation semantics. Keep fail-closed until a cross-taxa domain is implemented.'),
  sp_0457: boundary('sp_0457', 'crustacean_or_mollusk', ['batch04-keys-anentome-helena'], 'Duplicate catalog object for Anentome helena; same reviewed domain boundary as sp_0430.'),
  sp_0430: boundary('sp_0430', 'crustacean_or_mollusk', ['batch04-keys-anentome-helena'], 'Anentome helena is a gastropod. The current fish Compatibility profile schema cannot represent snail-specific predation and invertebrate stocking rules without conflating them with fish social behavior.'),
  sp_0007: boundary('sp_0007', 'amphibian', ['batch18-fishbase-ambystoma-mexicanum'], 'Ambystoma mexicanum is an amphibian. Its temperature, feeding, impaction and fish-cohabitation constraints require an amphibian-specific compatibility model rather than a fish social profile.'),
  sp_0008: boundary('sp_0008', 'amphibian', ['batch18-fishbase-cynops-orientalis'], 'Cynops orientalis is an amphibian. The current fish Compatibility profile does not model amphibian toxic skin, terrestrial access, or amphibian-specific cohabitation risks.'),
  sp_0009: boundary('sp_0009', 'amphibian', ['batch18-fishbase-ceratophrys-ornata'], 'Ceratophrys ornata is an amphibian. A fish Compatibility profile would misrepresent its terrestrial habitat and broad gape-predation constraints.'),
  sp_0318: boundary('sp_0318', 'coral_or_anemone', ['batch23-worms-plerogyra-sinuosa'], 'Plerogyra sinuosa is a coral. Coral allelopathy, sweeper tentacles, light/flow and reef placement are not represented by the current fish Compatibility profile schema.'),
  sp_0319: boundary('sp_0319', 'coral_or_anemone', ['batch23-worms-euphyllia-glabrescens'], 'Euphyllia glabrescens is a coral. The current fish Compatibility model cannot safely encode coral stinging radius, reef placement, light/flow or coral-to-coral aggression.'),
  sp_0321: boundary('sp_0321', 'coral_or_anemone', ['batch23-worms-pachyclavularia-violacea'], 'Pachyclavularia violacea is a coral-like colonial invertebrate. Its overgrowth and reef-space competition require a reef-specific compatibility domain.'),
  sp_0322: boundary('sp_0322', 'coral_or_anemone', ['batch23-worms-euphyllia-divisa'], 'Euphyllia divisa is a coral. Current fish-profile semantics do not model coral stinging, placement and reef competition.'),
  sp_0323: boundary('sp_0323', 'coral_or_anemone', ['batch23-worms-catalaphyllia-jardinei'], 'Catalaphyllia jardinei is a coral. Reef-specific light, flow, placement and stinging interactions are outside the current fish Compatibility domain.'),
  sp_0325: boundary('sp_0325', 'coral_or_anemone', ['batch23-worms-heteractis-crispa'], 'Heteractis crispa is a sea anemone. Host relationships, nematocyst stings, wandering behavior and reef placement require an anemone/reef compatibility model.'),
  sp_0379: boundary('sp_0379', 'jellyfish', ['batch24-worms-chrysaora-quinquecirrha'], 'Chrysaora quinquecirrha is a jellyfish. Kreisel-style flow, prey capture and cnidarian stinging risks are not representable by the current fish Compatibility profile.'),
  sp_0382: boundary('sp_0382', 'jellyfish', ['batch24-worms-chrysaora-melanaster'], 'Chrysaora melanaster is a jellyfish. The current fish Compatibility domain cannot model jellyfish-specific flow, contact damage and stinging interactions.'),
  sp_0384: boundary('sp_0384', 'jellyfish', ['batch24-worms-sanderia-malayensis'], 'Sanderia malayensis is a jellyfish. It requires a cnidarian-specific compatibility model rather than fish territoriality/social fields.'),
};

export const getCompatibilityDomainBoundary = (speciesId: string) => compatibilityDomainBoundaries[speciesId];
