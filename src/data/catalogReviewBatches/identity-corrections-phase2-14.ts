import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-19T16:20:00+08:00';

export const identityCorrectionsPhase2_14Sources = {
  chinaGoldfishNamingStandard: {
    id: 'phase2-14-cn-goldfish-naming-standard-butterfly-tail',
    title: 'SC/T 5053—2021 Rules for naming goldfish varieties',
    publisher: 'Ministry of Agriculture and Rural Affairs of the People’s Republic of China',
    url: 'https://img.antpedia.com/standard/pdf/1/2301/SC_T%205053-2021.pdf',
    sourceType: 'government',
    reviewStatus: 'reviewed',
  },
  dalianButterflyTailGoldfish: {
    id: 'phase2-14-dalian-butterfly-tail-goldfish',
    title: 'Comparison of pigmentation and morphology in goldfish with tiger-type head or butterfly-type tail and their hybrids',
    publisher: 'Journal of Dalian Ocean University',
    url: 'https://xuebao.dlou.edu.cn/article/2011/2095-1388/201103004.html',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
  dalianGrassGoldfish: {
    id: 'phase2-14-dalian-grass-goldfish',
    title: 'Turning kinematics and hydrodynamics of juvenile grass goldfish based on PIV',
    publisher: 'Journal of Dalian Ocean University',
    url: 'https://xuebao.dlou.edu.cn/CN/10.16535/j.cnki.dlhyxb.2023-165',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
  chinaFeedRedGrassGoldfish: {
    id: 'phase2-14-china-feed-red-grass-goldfish',
    title: 'Effects of different dietary plant/animal protein ratios on growth performance of grass goldfish',
    publisher: 'China Feed',
    url: 'https://journal.chinafeed.com.cn/CN/abstract/abstract1587.shtml',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identityReview = (
  speciesId: string,
  scientificName: string,
  variantKey: string,
  citationIds: string[],
  conflictNotes: string[],
): CatalogFieldReview => ({
  speciesId,
  field: 'identity',
  proposedValue: {
    scientificName,
    baseSpeciesKey: scientificName,
    variantKey,
  },
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'high',
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const identityCorrectionsPhase2_14FieldReviews: CatalogFieldReview[] = [
  identityReview(
    'sp_0065',
    'Carassius auratus',
    'Butterfly Tail',
    [
      identityCorrectionsPhase2_14Sources.chinaGoldfishNamingStandard.id,
      identityCorrectionsPhase2_14Sources.dalianButterflyTailGoldfish.id,
    ],
    [
      'SC/T 5053—2021 places Butterfly Tail (蝶尾) inside the formal goldfish variety naming system, and the peer-reviewed Dalian Ocean University study explicitly treats red-white Butterfly Tail goldfish as a Carassius auratus variety.',
      'This repairs the legacy blank “Carassius auratus var.” identity only. Butterfly Tail is morphology-changing, so no water, temperature, pH, size, space, social, territoriality or predation field is inherited automatically.',
    ],
  ),
  identityReview(
    'sp_0162',
    'Carassius auratus',
    'Red Grass Goldfish',
    [
      identityCorrectionsPhase2_14Sources.dalianGrassGoldfish.id,
      identityCorrectionsPhase2_14Sources.chinaFeedRedGrassGoldfish.id,
    ],
    [
      'Peer-reviewed Chinese aquaculture literature identifies grass goldfish (草金鱼) as Carassius auratus, and the China Feed study explicitly uses Carassius auratus red var. for the red grass-goldfish form.',
      'The catalog label 红草鱼 is therefore treated as a shortened/truncated Red Grass Goldfish label within Carassius auratus, not as evidence for grass carp or another taxon. The reviewed evidence establishes a red colour form rather than a morphology-changing fancy-goldfish form; Compatibility facts may therefore use the reviewed color-morph taxon policy, while source-controlled field reviews still materialize runtime numeric values.',
    ],
  ),
];

export const identityCorrectionsPhase2_14VerifiedSourceIds = Object.values(identityCorrectionsPhase2_14Sources)
  .map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set([
  'sp_0065',
  'sp_0162',
]);

export const catalogIdentityCorrectionBaseSpeciesIds = {} as const;
