import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogIdentityBoundary } from '../catalogIdentityBoundaries';

export const identityBoundaryCorrectionsPhase2_17Sources = {
  suAquaticRedCherryTetra: {
    id: 'phase2-17-su-aquatic-red-cherry-tetra',
    title: 'RED CHERRY TETRA – 甜心柠檬灯',
    publisher: "Su's Aquatic",
    url: 'https://suaquatic.com/product/red-cherry-tetra/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  daehneMuzelRedTetra: {
    id: 'phase2-17-daehne-muzel-red-tetra',
    title: 'Ein neuer Salmler — Hyphessobrycon sp. “Muzel Red” / Red Cherry tetra',
    publisher: 'Dähne Aquaristik',
    url: 'https://www.daehne-aquaristik.de/blogs/berichte/ein-neuer-salmler',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  yangyubangSweetheartLemonTetra: {
    id: 'phase2-17-yangyubang-sweetheart-lemon-tetra',
    title: '甜心柠檬灯（Hyphessobrycon cf. pulchripinnis）',
    publisher: '养鱼帮',
    url: 'https://www.yangyubang.com/?p=1190',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

export const identityBoundaryCorrectionsPhase2_17 = {
  sp_0141: {
    speciesId: 'sp_0141',
    code: 'trade_name_taxon_ambiguous',
    resolvedGranularity: 'trade_name_only',
    candidateTaxa: [
      'Hyphessobrycon sp. “Muzel Red Cherry” (undescribed aquarium-trade lineage)',
      'Hemigrammus sp. “Red Muzel” (alternative genus placement proposed in curated aquarium literature)',
      'Hyphessobrycon cf. pulchripinnis (Chinese aquarium-trade attribution)',
    ],
    sourceIds: [
      'batch14-fishbase-hyphessobrycon-pulchripinnis-var',
      identityBoundaryCorrectionsPhase2_17Sources.suAquaticRedCherryTetra.id,
      identityBoundaryCorrectionsPhase2_17Sources.daehneMuzelRedTetra.id,
      identityBoundaryCorrectionsPhase2_17Sources.yangyubangSweetheartLemonTetra.id,
    ],
    note: '“甜心柠檬灯 / Red Cherry Tetra” should not be modeled as one unnamed Hyphessobrycon pulchripinnis var. Exact trade-object sources instead use Hyphessobrycon sp. “Muzel” / “Muzel Red Cherry”; another curated aquarium source states that the fish is still scientifically undescribed and discusses Hemigrammus sp. as an alternative genus placement, while a Chinese aquarium source uses Hyphessobrycon cf. pulchripinnis. These conflicting trade/taxonomic attributions establish a trade-name identity boundary, not a reviewed parent taxon. Keep Compatibility fail-closed until a formal description or stronger exact-object taxonomic authority resolves the lineage.',
    reviewedAt: '2026-10-19',
    researchDisposition: 'terminal_unknown_hold',
  },
} satisfies Record<string, CatalogIdentityBoundary>;
