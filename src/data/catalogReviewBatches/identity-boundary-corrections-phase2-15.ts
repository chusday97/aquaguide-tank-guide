import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogIdentityBoundary } from '../catalogIdentityBoundaries';

export const identityBoundaryCorrectionsPhase2_15Sources = {
  costaRicaGoldenKuhliList: {
    id: 'phase2-15-incopesca-golden-kuhli',
    title: 'AJDIP/164-2021 aquarium-species list',
    publisher: 'Instituto Costarricense de Pesca y Acuicultura (INCOPESCA)',
    url: 'https://incopesca.go.cr/acuicultura/acuariofilia/AJDIP-164-2021_Se_aprueba_lista_final_de_especies_de_interes_pesquero_y_acuicola_de_especies_de_interes_para_la_Acuariofilia_CR.pdf',
    sourceType: 'government',
    reviewStatus: 'reviewed',
  },
  usgsRedSwordtailHybrid: {
    id: 'phase2-15-usgs-red-swordtail-hybrid',
    title: 'Xiphophorus hellerii × maculatus (red swordtail) species profile',
    publisher: 'U.S. Geological Survey, Nonindigenous Aquatic Species',
    url: 'https://nas.er.usgs.gov/queries/FactSheet.aspx?speciesID=870',
    sourceType: 'government',
    reviewStatus: 'reviewed',
  },
  aquariumGlaserMollyTradeComplex: {
    id: 'phase2-15-aquarium-glaser-molly-trade-complex',
    title: 'Poecilia sphenops Black Orange Tail',
    publisher: 'Aquarium Glaser GmbH',
    url: 'https://www.aquariumglaser.de/en/fisharchive/poecilia-sphenops-black-orange-tail-2/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

export const identityBoundaryCorrectionsPhase2_15 = {
  sp_0210: {
    speciesId: 'sp_0210',
    code: 'catalog_scientific_name_unresolved',
    resolvedGranularity: 'scientific_name_unresolved',
    candidateTaxa: [
      'Pangio kuhlii (legacy catalog attribution; exact Golden Kuhli object not independently confirmed)',
      'Pangio anguillaris (government aquarium list maps “Kuhli golden” to this taxon)',
    ],
    sourceIds: [
      'batch34-fishbase-pangio-kuhlii-variant',
      identityBoundaryCorrectionsPhase2_15Sources.costaRicaGoldenKuhliList.id,
    ],
    note: 'The legacy catalog string “Pangio kuhlii var.” must not be treated as a reliable parent assignment for the Golden Kuhli trade object. A government aquarium-species list independently maps “Kuhli golden” to Pangio anguillaris, which directly conflicts with the catalog attribution. Keep the object fail-closed until the exact traded lineage is identified; do not inherit P. kuhlii Compatibility authority from the blank-var label.',
    reviewedAt: '2026-10-19',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0158: {
    speciesId: 'sp_0158',
    code: 'catalog_scientific_name_unresolved',
    resolvedGranularity: 'scientific_name_unresolved',
    candidateTaxa: [
      'Xiphophorus hellerii ornamental red lineage (legacy catalog attribution)',
      'Xiphophorus hellerii × Xiphophorus maculatus red-swordtail hybrid lineage',
    ],
    sourceIds: [
      'seriouslyfish-xiphophorus-hellerii',
      identityBoundaryCorrectionsPhase2_15Sources.usgsRedSwordtailHybrid.id,
    ],
    note: 'The blank “Xiphophorus hellerii var.” catalog label does not establish the exact Red Apple Swordtail lineage. USGS records a red-swordtail hybrid as Xiphophorus hellerii × X. maculatus, so red swordtail trade naming cannot be assumed to mean pure X. hellerii. Keep this catalog object fail-closed until object-level evidence distinguishes a pure hellerii strain from a commercial hybrid line.',
    reviewedAt: '2026-10-19',
    researchDisposition: 'terminal_unknown_hold',
  },
  sp_0142: {
    speciesId: 'sp_0142',
    code: 'catalog_scientific_name_unresolved',
    resolvedGranularity: 'scientific_name_unresolved',
    candidateTaxa: [
      'Balloon Molly morphology-changing domestic lineage; Poecilia sphenops-like attribution is legacy-only',
      'Balloon Molly domestic Poecilia breeding complex with historical interspecific crosses',
    ],
    sourceIds: [
      'batch27-fishbase-poecilia-sphenops-balloon',
      identityBoundaryCorrectionsPhase2_15Sources.aquariumGlaserMollyTradeComplex.id,
    ],
    note: 'The blank “Poecilia sphenops var.” label is not a safe parent assignment for Balloon Molly. Aquarium Glaser notes that common short-finned molly breeds historically grouped under P. sphenops can involve multiple Poecilia species and repeated crossing, and that their exact species assignment has not been scientifically resolved. Because Balloon is also morphology-changing, keep the object fail-closed and prohibit automatic P. sphenops Compatibility inheritance until its exact lineage is evidenced.',
    reviewedAt: '2026-10-19',
    researchDisposition: 'terminal_unknown_hold',
  },
} satisfies Record<string, CatalogIdentityBoundary>;
