import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogIdentityBoundary } from '../catalogIdentityBoundaries';

export const identityBoundaryCorrectionsPhase2_18Sources = {
  seriouslyFishRummynoseBleheri: {
    id: 'phase2-18-seriouslyfish-petitella-bleheri',
    title: 'Petitella bleheri (Firehead Tetra)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/petitella-bleheri',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  seriouslyFishRummynoseRhodostoma: {
    id: 'phase2-18-seriouslyfish-petitella-rhodostoma',
    title: 'Petitella rhodostoma (Rummy-nose tetra)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/petitella-rhodostoma',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  seriouslyFishRummynoseGeorgiae: {
    id: 'phase2-18-seriouslyfish-petitella-georgiae',
    title: 'Petitella georgiae (False Rummy-nose)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/petitella-georgiae',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  practicalFishkeepingGoldTetraTrade: {
    id: 'phase2-18-practical-fishkeeping-gold-tetra-trade',
    title: '5 great Shoaling Silver Fish for Stunning Aquascapes',
    publisher: 'Practical Fishkeeping',
    url: 'https://www.practicalfishkeeping.co.uk/features/5-brilliant-shoaling-silver-fish-for-stunning-aquascapes/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  yeeBlueEyeGoldTetra: {
    id: 'phase2-18-yee-blue-eye-gold-tetra',
    title: '这些群游的南美灯鱼，身上有光，温顺好混养',
    publisher: 'YEE水族世界 / 凤凰网',
    url: 'https://ishare.ifeng.com/c/s/7vqKDqr6W81',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

export const identityBoundaryCorrectionsPhase2_18 = {
  sp_0154: {
    speciesId: 'sp_0154',
    code: 'trade_name_taxon_ambiguous',
    resolvedGranularity: 'trade_name_only',
    candidateTaxa: [
      'Petitella bleheri (formerly Hemigrammus bleheri; common firehead/rummy-nose trade taxon)',
      'Petitella rhodostoma (true rummy-nose tetra)',
      'Petitella georgiae (false rummy-nose tetra)',
    ],
    sourceIds: [
      'batch05-fishbase-hemigrammus-bleheri',
      identityBoundaryCorrectionsPhase2_18Sources.seriouslyFishRummynoseBleheri.id,
      identityBoundaryCorrectionsPhase2_18Sources.seriouslyFishRummynoseRhodostoma.id,
      identityBoundaryCorrectionsPhase2_18Sources.seriouslyFishRummynoseGeorgiae.id,
    ],
    note: '“红鼻灯 (改良)” contains only a generic merchandising modifier, not a reviewed strain identity. The underlying rummy-nose aquarium trade spans Petitella bleheri, P. rhodostoma and P. georgiae, so the blank Hemigrammus bleheri var. parent cannot select one lineage. Treat this as trade-name taxon ambiguity rather than an “improved strain” identity and keep Compatibility fail-closed until exact provenance identifies the catalog object.',
    reviewedAt: '2026-10-19',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0204: {
    speciesId: 'sp_0204',
    code: 'trade_name_taxon_ambiguous',
    resolvedGranularity: 'trade_name_only',
    candidateTaxa: [
      'Petitella bleheri (formerly Hemigrammus bleheri; the species most commonly sold as rummy-nose tetra)',
      'Petitella rhodostoma (true rummy-nose tetra)',
      'Petitella georgiae (false rummy-nose tetra)',
    ],
    sourceIds: [
      'batch06-fishbase-hemigrammus-bleheri',
      identityBoundaryCorrectionsPhase2_18Sources.seriouslyFishRummynoseBleheri.id,
      identityBoundaryCorrectionsPhase2_18Sources.seriouslyFishRummynoseRhodostoma.id,
      identityBoundaryCorrectionsPhase2_18Sources.seriouslyFishRummynoseGeorgiae.id,
    ],
    note: '“黑金刚红鼻剪刀 / Black Diamond Rummy Nose” should not inherit from a blank Hemigrammus bleheri var. parent hint. Reviewed aquarium authority documents three near-identical taxa sold through the rummy-nose trade: Petitella bleheri, P. rhodostoma and P. georgiae. The exact “Black Diamond” modifier was not independently tied to one of them, so the catalog object is a trade-name taxon ambiguity rather than a missing variant-name defect. Keep Compatibility fail-closed until an exact importer/breeder/object source identifies the lineage.',
    reviewedAt: '2026-10-19',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0212: {
    speciesId: 'sp_0212',
    code: 'trade_name_taxon_ambiguous',
    resolvedGranularity: 'trade_name_only',
    candidateTaxa: [
      'Hemigrammus rodwayi (traditional Gold Tetra attribution)',
      'Hyphessobrycon saizi (similar species reported in the aquarium trade under Gold Tetra)',
    ],
    sourceIds: [
      'batch06-fishbase-hemigrammus-rodwayi',
      identityBoundaryCorrectionsPhase2_18Sources.practicalFishkeepingGoldTetraTrade.id,
      identityBoundaryCorrectionsPhase2_18Sources.yeeBlueEyeGoldTetra.id,
    ],
    note: '“蓝眼金灯” is an aquarium trade label, not a reviewed Hemigrammus rodwayi variant name. A Chinese aquarium article describes this exact trade label but does not provide a binomial. Practical Fishkeeping notes that many aquarium fish sold as Gold Tetra / Hemigrammus rodwayi may actually be Hyphessobrycon saizi. Therefore the legacy blank-var attribution cannot select one taxon. Keep Compatibility fail-closed until exact provenance or an object-level taxonomic source resolves the trade fish.',
    reviewedAt: '2026-10-19',
    researchDisposition: 'terminal_unknown_hold',
  },
} satisfies Record<string, CatalogIdentityBoundary>;
