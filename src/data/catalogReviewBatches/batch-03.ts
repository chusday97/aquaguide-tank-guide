import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

/**
 * Batch 03 is deliberately conservative.  FishBase records are used for
 * identity/environmental reference only; aquarium stocking, aggression,
 * breeding and maximum-count claims are not promoted without a source that
 * actually supports that claim.  Those fields are therefore reviewed as
 * unknown rather than filled from the legacy template.
 */
export interface CatalogReviewBatch03Entry {
  speciesId: string;
  commonName: string;
  scientificName: string;
  sources: CatalogEvidenceSource[];
  fieldReviews: CatalogFieldReview[];
}

const reviewedAt = '2026-08-31T00:00:00+08:00';
const fields = [
  'identity', 'water', 'temperature', 'ph', 'adult_size', 'tank_size',
  'social_behavior', 'territoriality', 'predation', 'breeding_behavior',
] as const;

type Seed = {
  speciesId: string;
  commonName: string;
  scientificName: string;
  baseSpeciesKey: string;
  variantKey?: string | null;
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  water?: 'freshwater' | 'saltwater' | 'brackish' | 'unknown';
  identityUnknown?: string;
};

const seeds: Seed[] = [
  {
    speciesId: 'sp_0451', commonName: '地图鱼', scientificName: 'Astronotus ocellatus',
    baseSpeciesKey: 'Astronotus ocellatus', sourceId: 'batch03-fishbase-astronotus-ocellatus',
    sourceTitle: 'Astronotus ocellatus species summary', sourceUrl: 'https://www.fishbase.se/summary/Astronotus-ocellatus.html', water: 'freshwater',
  },
  {
    speciesId: 'sp_0021', commonName: '迷你鹦鹉鱼', scientificName: 'Amatitlania nigrofasciata var.',
    baseSpeciesKey: 'Amatitlania nigrofasciata', variantKey: null, sourceId: 'batch03-fishbase-amatitlania-nigrofasciata',
    sourceTitle: 'Amatitlania nigrofasciata species summary', sourceUrl: 'https://www.fishbase.se/summary/Amatitlania-nigrofasciata.html', water: 'freshwater',
    identityUnknown: '“迷你鹦鹉鱼”品系身份与 Amatitlania nigrofasciata 的商业命名关系未被该物种页确认，品系字段保持未知。',
  },
  {
    speciesId: 'sp_0049', commonName: '珍珠赤雷龙', scientificName: 'Channa asiatica',
    baseSpeciesKey: 'Channa asiatica', sourceId: 'batch03-fishbase-channa-asiatica',
    sourceTitle: 'Channa asiatica species summary', sourceUrl: 'https://www.fishbase.se/summary/Channa-asiatica.html', water: 'freshwater',
  },
  {
    speciesId: 'sp_0224', commonName: '白金雷龙', scientificName: 'Channa argus var. Platinum',
    baseSpeciesKey: 'Channa argus', variantKey: 'Platinum', sourceId: 'batch03-fishbase-channa-argus',
    sourceTitle: 'Channa argus species summary', sourceUrl: 'https://www.fishbase.se/summary/Channa-argus.html', water: 'freshwater',
  },
  {
    speciesId: 'sp_0475', commonName: '高体鳑鲏', scientificName: 'Rhodeus ocellatus',
    baseSpeciesKey: 'Rhodeus ocellatus', sourceId: 'batch03-fishbase-rhodeus-ocellatus',
    sourceTitle: 'Rhodeus ocellatus species summary', sourceUrl: 'https://www.fishbase.se/summary/Rhodeus-ocellatus.html', water: 'freshwater',
  },
  {
    speciesId: 'sp_0459', commonName: '黑壳虾', scientificName: 'Neocaridina davidi wild type',
    baseSpeciesKey: 'Neocaridina davidi', variantKey: 'wild type', sourceId: 'batch03-uf-ifas-neocaridina-davidi',
    sourceTitle: 'Cherry Shrimp Neocaridina davidi (UF/IFAS)', sourceUrl: 'https://ask.ifas.ufl.edu/publication/IN1301', water: 'freshwater',
  },
  {
    speciesId: 'sp_0001', commonName: '极火虾', scientificName: 'Neocaridina davidi var. Red',
    baseSpeciesKey: 'Neocaridina davidi', variantKey: 'Red', sourceId: 'batch03-usfws-neocaridina-davidi-red-morphs',
    sourceTitle: 'Cherry Shrimp ecological risk screening summary (red morph names)', sourceUrl: 'https://www.fws.gov/sites/default/files/documents/2025-06/ecological-risk-screening-summary-cherry-shrimp-june-2025.pdf', water: 'freshwater',
  },
  {
    speciesId: 'sp_0002', commonName: '水晶虾', scientificName: 'Caridina cantonensis var.',
    baseSpeciesKey: 'Caridina cantonensis', variantKey: null, sourceId: 'batch03-itis-caridina-cantonensis',
    sourceTitle: 'Caridina cantonensis taxonomic report (ITIS)', sourceUrl: 'https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=1173917',
    identityUnknown: '“水晶虾”商业品系与 Caridina cantonensis 的现行分类对应关系需要专门品系来源确认。',
  },
  {
    speciesId: 'sp_0428', commonName: '斑马螺', scientificName: 'Neritina natalensis',
    baseSpeciesKey: 'Neritina natalensis', sourceId: 'batch03-obis-neritina-natalensis',
    sourceTitle: 'Neritina natalensis taxon record (OBIS/WoRMS)', sourceUrl: 'https://old.obis.org/taxon/818788',
    identityUnknown: 'Neritina 属观赏斑纹螺的商业名、物种名和幼体盐度需求存在混用，现有来源不足以确认本条完整水体画像。',
  },
  {
    speciesId: 'sp_0258', commonName: '糖果KOI斗鱼', scientificName: 'Betta splendens var. Koi',
    baseSpeciesKey: 'Betta splendens', variantKey: 'Koi', sourceId: 'batch03-fishbase-betta-splendens',
    sourceTitle: 'Betta splendens species summary (base species identity reference)', sourceUrl: 'https://www.fishbase.se/summary/Betta-splendens.html', water: 'freshwater',
    identityUnknown: 'Koi 品系不是 FishBase 独立分类单元；仅确认基础种，品系养护和行为差异保持未知。',
  },
];

const unknownReason = (seed: Seed, field: string) => {
  if (field === 'identity' && seed.identityUnknown) return seed.identityUnknown;
  if (field === 'water' && !seed.water) return '现有物种来源未同时确认观赏贸易名对应的完整水体阶段需求。';
  if (field === 'ph') return '该来源未给出可直接用于本产品混养判断的审定 pH 区间。';
  if (field === 'temperature') return '该来源未给出可直接用于本产品混养判断的审定水温区间。';
  if (field === 'adult_size') return '需要可追溯的成体尺寸定义；不能把商业规格或模板尺寸当作成体证据。';
  if (field === 'tank_size') return '没有足以支撑最低缸体或最大数量的专业来源，保持未知。';
  if (field === 'social_behavior') return '来源不足以确认水族箱条件下的最低群体或稳定社会模式。';
  if (field === 'territoriality') return '高风险行为结论需要直接行为研究或两份独立专业来源，当前不升级经验标签。';
  if (field === 'predation') return '没有把捕食对象、体型阈值和家庭水族箱情境同时确认的来源。';
  return '没有把繁殖期、护幼和生命阶段行为同时确认的来源。';
};

const makeReview = (seed: Seed, field: typeof fields[number]): CatalogFieldReview => {
  const isIdentitySupported = field === 'identity' && !seed.identityUnknown;
  const isWaterSupported = field === 'water' && Boolean(seed.water);
  if (isIdentitySupported) {
    return {
      speciesId: seed.speciesId, field, proposedValue: {
        scientificName: seed.scientificName,
        baseSpeciesKey: seed.baseSpeciesKey,
        variantKey: seed.variantKey ?? null,
      }, status: 'reviewed', resolution: 'supported', confidence: 'medium',
      citationIds: [seed.sourceId], conflictNotes: [], reviewedAt,
    };
  }
  if (isWaterSupported) {
    return {
      speciesId: seed.speciesId, field, proposedValue: seed.water, status: 'reviewed',
      resolution: 'supported', confidence: 'medium', citationIds: [seed.sourceId],
      conflictNotes: [], reviewedAt,
    };
  }
  return {
    speciesId: seed.speciesId, field, proposedValue: null, status: 'reviewed',
    resolution: 'unknown', confidence: 'unknown', citationIds: [seed.sourceId],
    conflictNotes: [unknownReason(seed, field)], reviewedAt,
  };
};

export const catalogReviewBatch03: CatalogReviewBatch03Entry[] = seeds.map(seed => ({
  speciesId: seed.speciesId,
  commonName: seed.commonName,
  scientificName: seed.scientificName,
  sources: [{
    id: seed.sourceId,
    title: seed.sourceTitle,
    publisher: seed.sourceId.includes('uf-ifas') ? 'University of Florida IFAS' :
      seed.sourceId.includes('usfws') ? 'U.S. Fish and Wildlife Service' :
        seed.sourceId.includes('itis') ? 'Integrated Taxonomic Information System' :
          seed.sourceId.includes('obis') ? 'Ocean Biodiversity Information System' : 'FishBase',
    url: seed.sourceUrl,
    sourceType: seed.sourceId.includes('uf-ifas') ? 'university' :
      seed.sourceId.includes('usfws') || seed.sourceId.includes('itis') ? 'government' :
        seed.sourceId.includes('obis') ? 'professional_association' : 'curated_husbandry',
    reviewStatus: 'reviewed',
  }],
  fieldReviews: fields.map(field => makeReview(seed, field)),
}));

export const catalogReviewBatch03FieldReviews = catalogReviewBatch03.flatMap(entry => entry.fieldReviews);
export const catalogReviewBatch03Sources = catalogReviewBatch03.flatMap(entry => entry.sources);

/** Populated only after a reviewer has read and verified source content. */
export const catalogReviewBatch03VerifiedSourceIds: string[] = [
  'batch03-fishbase-channa-asiatica',
  'batch03-fishbase-channa-argus',
  'batch03-fishbase-betta-splendens',
  'batch03-uf-ifas-neocaridina-davidi',
  'batch03-usfws-neocaridina-davidi-red-morphs',
  'batch03-obis-neritina-natalensis',
];

if (catalogReviewBatch03.length !== 10 || catalogReviewBatch03FieldReviews.length !== 100) {
  throw new Error('Batch 03 must contain exactly 10 species and 100 field reviews');
}
