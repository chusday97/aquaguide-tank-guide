import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T19:05:00+09:00';

export const compatibilityHighImpactWave18Sources = {
  opsariichthysParentCulturePatent: {
    id: 'cnipa-opsariichthys-bidens-parent-culture-wave18',
    title: 'Artificial spawning induction method for Opsariichthys bidens (CN110612931B)',
    publisher: 'China National Intellectual Property Administration / Zhejiang Academy of Agricultural Sciences',
    url: 'https://patents.google.com/patent/CN110612931B/en',
    sourceType: 'government',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const cultureSource = compatibilityHighImpactWave18Sources.opsariichthysParentCulturePatent.id;

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  conflictNotes: string[],
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'high',
  citationIds: [cultureSource],
  conflictNotes,
  reviewedAt,
});

export const compatibilityHighImpactWave18FieldReviews: CatalogFieldReview[] = [];

for (const speciesId of ['sp_0038', 'sp_0130']) {
  compatibilityHighImpactWave18FieldReviews.push(
    supported(
      speciesId,
      'temperature',
      { min: 18, max: 25 },
      [
        'CN110612931B explicitly identifies Opsariichthys bidens and maintains broodstock at 18–25°C during intensified parent-fish culture before spawning induction. This is sustained husbandry context, not a collection temperature or one-off challenge exposure.',
        'The reviewed range supersedes the older fail-closed state without converting FishBase\'s broader ecological 10–20°C range into a household target.',
      ],
    ),
    supported(
      speciesId,
      'ph',
      { min: 7, max: 8 },
      [
        'CN110612931B explicitly identifies Opsariichthys bidens and maintains broodstock at pH 7.0–8.0 during intensified parent-fish culture. This supplies a direct managed-husbandry pH range for the exact taxon.',
      ],
    ),
  );
}

export const compatibilityHighImpactWave18VerifiedSourceIds = Object.values(
  compatibilityHighImpactWave18Sources,
).map(item => item.id);

export const compatibilityHighImpactWave18ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0038',
    addCitationIds: [cultureSource],
    addRequiredFacts: ['temperature', 'ph'],
  },
  {
    speciesId: 'sp_0130',
    addCitationIds: [cultureSource],
    addRequiredFacts: ['temperature', 'ph'],
  },
] as const;

export const compatibilityHighImpactWave18AuthorityPatch = {
  patchId: 'high-impact-opsariichthys-evidence-wave18-20261015',
  speciesIds: ['sp_0038', 'sp_0130'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/high-impact-wave18-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
