import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-16T20:30:00+08:00';

const source = (
  id: string,
  title: string,
  publisher: string,
  url: string,
  sourceType: CatalogEvidenceSource['sourceType'],
): CatalogEvidenceSource => ({ id, title, publisher, url, sourceType, reviewStatus: 'reviewed' });

export const compatibilityWaterDirectWave27Sources = {
  hyphessobryconHerbertaxelrodiFishBase: source('batch06-fishbase-hyphessobrycon-herbertaxelrodi', 'Hyphessobrycon herbertaxelrodi species summary', 'FishBase', 'https://www.fishbase.se/summary/Hyphessobrycon-herbertaxelrodi.html', 'curated_husbandry'),
  makunaimaPittieriFishipedia: source('fishipedia-makunaima-pittieri-water-wave27', 'Makunaima pittieri / Moenkhausia pittieri freshwater environment review', 'Fishipedia', 'https://www.fishipedia.fr/fr/poissons/moenkhausia-pittieri', 'curated_husbandry'),
  sawbwaResplendensFishBase: source('fishbase-sawbwa-resplendens-water-wave27', 'Sawbwa resplendens species summary', 'FishBase', 'https://www.fishbase.se/summary/Sawbwa-resplendens.html', 'professional_association'),
  epiplatysAnnulatusFishBase: source('fishbase-epiplatys-annulatus-water-wave27', 'Epiplatys annulatus species summary', 'FishBase', 'https://www.fishbase.se/summary/Epiplatys-annulatus.html', 'professional_association'),
  pseudomugilFurcatusFishBase: source('batch32-fishbase-pseudomugil-furcatus', 'Pseudomugil furcatus species review', 'FishBase', 'https://www.fishbase.se/summary/Pseudomugil-furcatus', 'professional_association'),
  sphaerichthysOsphromenoidesFishBase: source('batch32-fishbase-sphaerichthys-osphromenoides', 'Sphaerichthys osphromenoides species review', 'FishBase', 'https://www.fishbase.se/summary/Sphaerichthys-osphromenoides.html', 'professional_association'),
  erpetoichthysCalabaricusFishipedia: source('fishipedia-erpetoichthys-calabaricus-water-wave27', 'Erpetoichthys calabaricus freshwater environment review', 'Fishipedia', 'https://www.fishipedia.fr/fr/poissons/erpetoichthys-calabaricus', 'curated_husbandry'),
  semaprochilodusInsignisFishipedia: source('fishipedia-semaprochilodus-insignis-water-wave27', 'Semaprochilodus insignis freshwater environment review', 'Fishipedia', 'https://www.fishipedia.fr/fr/poissons/semaprochilodus-insignis', 'curated_husbandry'),
  semaprochilodusTaeniurusFishBase: source('fishbase-semaprochilodus-taeniurus-water-wave27', 'Semaprochilodus taeniurus species summary', 'FishBase', 'https://www.fishbase.se/summary/Semaprochilodus-taeniurus.html', 'professional_association'),
  beaufortiaKweichowensisFishBase: source('batch32-fishbase-beaufortia-kweichowensis', 'Beaufortia kweichowensis species review', 'FishBase', 'https://www.fishbase.se/summary/Beaufortia-kweichowensis.html', 'professional_association'),
  hyphessobryconMegalopterusFishipedia: source('fishipedia-hyphessobrycon-megalopterus-water-wave27', 'Megalamphodus megalopterus / Hyphessobrycon megalopterus freshwater environment review', 'Fishipedia', 'https://www.fishipedia.fr/fr/poissons/hyphessobrycon-megalopterus', 'curated_husbandry'),
} satisfies Record<string, CatalogEvidenceSource>;

const supportedFreshwater = (speciesId: string, sourceId: string, note: string): CatalogFieldReview => ({
  speciesId,
  field: 'water',
  proposedValue: 'freshwater',
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'medium',
  citationIds: [sourceId],
  conflictNotes: [note],
  reviewedAt,
});

const s = compatibilityWaterDirectWave27Sources;

export const compatibilityWaterDirectWave27FieldReviews: CatalogFieldReview[] = [
  supportedFreshwater('sp_0470', s.hyphessobryconHerbertaxelrodiFishBase.id, 'FishBase exact-taxon Hyphessobrycon herbertaxelrodi environment explicitly states Freshwater; benthopelagic. Snapshot SHA-256: 146860d2568b6a78153ecb69133c383d40147878aa597557882983a556c43ee0.'),
  supportedFreshwater('sp_0471', s.makunaimaPittieriFishipedia.id, 'Fishipedia exact accepted/synonym page identifies Makunaima pittieri / Moenkhausia pittieri and explicitly describes the species as living in freshwater. Snapshot SHA-256: 444600d0b30b5c8331a434794eaa818202808bec1b9ae34703a10162a0c46501.'),
  supportedFreshwater('sp_0111', s.sawbwaResplendensFishBase.id, 'FishBase exact-taxon Sawbwa resplendens environment explicitly states Freshwater; benthopelagic. Snapshot SHA-256: f2dd4480e5d89c15fbdf4b114f14f7e9333de7f6424389d1916c3745b8325bcc.'),
  supportedFreshwater('sp_0113', s.epiplatysAnnulatusFishBase.id, 'FishBase exact-taxon Epiplatys annulatus environment explicitly states Freshwater; benthopelagic. Snapshot SHA-256: b82ad3549fc4516aed7d458eaa89f00751fef2b10ebd3cef812646807d4edaaf.'),
  supportedFreshwater('sp_0135', s.pseudomugilFurcatusFishBase.id, 'FishBase exact-taxon Pseudomugil furcatus environment explicitly states Freshwater; benthopelagic. Snapshot SHA-256: cddb4f7a456c49f3b5c3776a694cb4b9b20893772f8f9f5f235d550e1876c150.'),
  supportedFreshwater('sp_0060', s.sphaerichthysOsphromenoidesFishBase.id, 'FishBase exact-taxon Sphaerichthys osphromenoides environment explicitly states Freshwater; benthopelagic. Snapshot SHA-256: f9c9178439a4ef73b853348fee26424ff532876a07b4abd765bdac75373ae9b8.'),
  supportedFreshwater('sp_0136', s.sphaerichthysOsphromenoidesFishBase.id, 'This catalog row is the same exact Sphaerichthys osphromenoides taxon as sp_0060; FishBase explicitly states Freshwater; benthopelagic. Snapshot SHA-256: f9c9178439a4ef73b853348fee26424ff532876a07b4abd765bdac75373ae9b8.'),
  supportedFreshwater('sp_0106', s.erpetoichthysCalabaricusFishipedia.id, 'Fishipedia exact-taxon Erpetoichthys calabaricus introduction explicitly states the species is a tropical freshwater fish. Snapshot SHA-256: e827131196c225506d0a2761ccfbb09c41c61571cce9701df6f1d893ee74b95f.'),
  supportedFreshwater('sp_0061', s.semaprochilodusInsignisFishipedia.id, 'Fishipedia exact-taxon Semaprochilodus insignis introduction explicitly states the species lives in freshwater. Snapshot SHA-256: cf0ee5001b112e5e29cc034f35eae2aee1e6570aab48f4987a4d7bf48f71894b.'),
  supportedFreshwater('sp_0137', s.semaprochilodusInsignisFishipedia.id, 'This catalog row is the same exact Semaprochilodus insignis taxon as sp_0061; Fishipedia explicitly states the species lives in freshwater. Snapshot SHA-256: cf0ee5001b112e5e29cc034f35eae2aee1e6570aab48f4987a4d7bf48f71894b.'),
  supportedFreshwater('sp_0107', s.semaprochilodusTaeniurusFishBase.id, 'FishBase exact-taxon Semaprochilodus taeniurus environment explicitly states Freshwater; benthopelagic. Snapshot SHA-256: 4d4676aa7d7ec6d2840c8b4b4f6bdea6ace0620cecbf9fd0f4aa4924f53adc3d.'),
  supportedFreshwater('sp_0128', s.beaufortiaKweichowensisFishBase.id, 'FishBase exact-taxon Beaufortia kweichowensis environment explicitly states Freshwater; demersal. Snapshot SHA-256: cdb5ec012963579d32a8de16f6797c9f300c28581cf943b9bb2661fe8e32b909.'),
  supportedFreshwater('sp_0467', s.hyphessobryconMegalopterusFishipedia.id, 'Fishipedia exact/current-taxon page for Megalamphodus megalopterus (catalog Hyphessobrycon megalopterus) explicitly states that the species lives in freshwater. Snapshot SHA-256: 0ed4c3b204a6eac3018397188c902c1dda44523e7a259cb079f1d0998c46be27.'),
];

export const compatibilityWaterDirectWave27VerifiedSourceIds = Object.values(compatibilityWaterDirectWave27Sources).map(item => item.id);
export const compatibilityWaterDirectWave27ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [] as const;

export const compatibilityWaterDirectWave27AuthorityPatch = {
  patchId: 'water-direct-wave27-20261016',
  speciesIds: ['sp_0470', 'sp_0471', 'sp_0111', 'sp_0113', 'sp_0135', 'sp_0060', 'sp_0136', 'sp_0106', 'sp_0061', 'sp_0137', 'sp_0107', 'sp_0128', 'sp_0467'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/water-direct-wave27-20261016.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 13,
  uniqueEvidencePageCount: 11,
  reusedEvidenceSourceCount: 4,
  newEvidenceSourceCount: 7,
} as const;
