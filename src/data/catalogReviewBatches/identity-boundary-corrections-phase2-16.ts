import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogIdentityBoundary } from '../catalogIdentityBoundaries';

export const identityBoundaryCorrectionsPhase2_16Sources = {
  ornamentalMedakaDiversification: {
    id: 'phase2-16-mbe-ornamental-medaka-diversification',
    title: 'Genomic consequences of domestication and the diversification of body coloration and morphology in ornamental medaka strains',
    publisher: 'Molecular Biology and Evolution',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12915790/',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

export const identityBoundaryCorrectionsPhase2_16 = {
  sp_0474: {
    speciesId: 'sp_0474',
    code: 'trade_name_taxon_ambiguous',
    resolvedGranularity: 'trade_name_only',
    candidateTaxa: [
      'ornamental Japanese medaka strains derived from the Oryzias latipes species complex',
      'multiple distinct ornamental medaka strains; “top-view/观背青鳉” is not one exact variant identity',
    ],
    sourceIds: [
      'batch39-fishbase-oryzias-latipes-var',
      identityBoundaryCorrectionsPhase2_16Sources.ornamentalMedakaDiversification.id,
    ],
    note: '“观背青鳉” should not be modeled as one unnamed Oryzias latipes var. The reviewed genomics literature describes ornamental Japanese medaka as a large domesticated strain group derived from the Oryzias latipes species complex, with more than 700 strains and diverse colour, scale, eye, fin and body-shape phenotypes. The catalog label therefore identifies an ornamental medaka group, not one exact strain that can inherit a single variant profile. Keep Compatibility fail-closed until the user/catalog selects an exact ornamental strain or a reviewed group-level policy is explicitly defined.',
    reviewedAt: '2026-10-19',
    researchDisposition: 'terminal_unknown_hold',
  },
} satisfies Record<string, CatalogIdentityBoundary>;
