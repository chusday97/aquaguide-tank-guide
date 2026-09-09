import type { CatalogWaterType } from '../packages/contracts/src';

export interface Fish {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  /** Explicit catalog field; absent legacy records remain unknown. */
  waterType?: CatalogWaterType;
  image: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  waterTemperature: string;
  phLevel: string;
  waterChangeCycle: number; // in days
  description: string;
  diet: string;
  feedingProfile?: {
    dietType?: string;
    feedingType: string;
    recommendedFoods: string;
    feedingFrequency: string;
    portionRule: string;
    feedingLayer?: string;
    avoidFoods: string;
    specialNotes?: string;
    confidence?: string;
    sourceName?: string;
    sourceUrl?: string;
    sourceFields?: string[];
    needsReview?: boolean;
    reviewReason?: string;
  };
  tankSize: string;
  temperament: 'Peaceful' | 'Aggressive' | 'Territorial';
  size: 'Small' | 'Medium' | 'Large';
  housingMode?: '适合混养' | '谨慎混养' | '建议单养';
  housingReason?: string;
  isCustom?: boolean;
}

/** Public species profile boundaries. Editorial values never override catalog facts. */
export type ProductTruthSpecies = Fish;

export type PublishedContentSectionId = 'overview' | 'behavior' | 'habitat' | 'feeding' | 'maintenance';

export interface PublishedContentSection {
  id: PublishedContentSectionId;
  heading: string;
  summary: string;
  details?: string[];
  sourceIds: string[];
}

export interface PublishedSpeciesTrait {
  id: string;
  label: string;
  value: string;
  summary: string;
  sourceIds: string[];
}

export interface PublishedLifeAnswer {
  answer: string;
  sourceIds: string[];
  sourceFingerprint: string;
  confirmedAt: string;
}

export interface PublishedSpeciesLifeProfile {
  activity?: PublishedLifeAnswer;
  social?: PublishedLifeAnswer;
  foraging?: PublishedLifeAnswer;
}

export interface PublishedSpeciesAsset {
  id: string;
  src: string;
  usage: 'hero' | 'detail' | 'variant-card';
  aspectRatio: '16:9' | '4:3';
  fit: 'contain';
  altZh: string;
  altEn: string;
}

export type PublishedSpeciesAssets = PublishedSpeciesAsset[];

export type SeoEvidenceSourceKind = 'product-truth' | 'reviewed-evidence' | 'asset';
export type SeoEvidenceBindingStatus = 'confirmed' | 'stale' | 'blocked';

export interface SeoEvidenceBinding {
  id: string;
  targetId: string;
  field: string;
  renderedClaim: string;
  sourceKind: SeoEvidenceSourceKind;
  sourceIds: string[];
  sourceFingerprint: string;
  status: SeoEvidenceBindingStatus;
  confirmedBy: string;
  confirmedAt: string;
}

export type SpeciesEditorialEvidenceScope = 'base' | 'variant' | 'faq';
export type SpeciesEditorialEvidenceField =
  | 'signature'
  | 'overview'
  | 'behavior'
  | 'activity'
  | 'social'
  | 'foraging'
  | 'habitat'
  | 'feeding'
  | 'maintenance'
  | 'variantDifference'
  | 'faq';
export type SpeciesEditorialEvidenceStatus = 'candidate' | 'confirmed' | 'stale' | 'blocked';

/** Internal, local-only evidence candidates. Candidates never enter a published profile. */
export interface SpeciesEditorialEvidence {
  id: string;
  targetId: string;
  scope: SpeciesEditorialEvidenceScope;
  field: SpeciesEditorialEvidenceField;
  renderedClaim: string;
  question?: string;
  answer?: string;
  sourceIds: string[];
  sourceFingerprint: string;
  status: SpeciesEditorialEvidenceStatus;
  confirmedBy?: 'project-owner';
  confirmedAt?: string;
}

export interface PublishedSeoMetadata {
  locale: 'zh-CN' | 'en';
  canonical: string;
  indexPolicy: 'index' | 'canonical-to-base' | 'noindex';
  publishedAt: string;
  reviewedAt: string;
}

export interface PublishedSpeciesSummary {
  id: string;
  name: string;
  scientificName: string;
  image?: PublishedSpeciesAsset;
  href: string;
}

export interface PublishedCategorySummary {
  id: string;
  name: string;
  href: string;
}

export interface PublishedGuideSummary {
  id: string;
  title: string;
  summary: string;
  href: string;
}

export type PublishedGuideAssets = PublishedSpeciesAsset[];

export interface PublishedVariantSummary {
  id: string;
  name: string;
  scientificName: string;
  image?: PublishedSpeciesAsset;
  difference?: string;
  indexPolicy: 'index' | 'canonical-to-base' | 'noindex';
}

export interface PublishedFaqItem {
  id: string;
  question: string;
  answer: string;
  sourceIds: string[];
}

export interface PublishedRelatedLink {
  id: string;
  label: string;
  href: string;
  kind: 'category' | 'care-guide' | 'compatibility' | 'species';
}

export interface PublishedSourceReference {
  id: string;
  title: string;
  publisher: string;
  url?: string;
  kind: 'project-product-truth' | 'government-research' | 'authoritative-database' | 'peer-reviewed';
}

export interface PublishedSpeciesProfile {
  catalog: ProductTruthSpecies;
  editorial?: {
    signature?: string;
    overview?: PublishedContentSection;
    behavior?: PublishedContentSection;
    habitat?: PublishedContentSection;
    feeding?: PublishedContentSection;
    maintenance?: PublishedContentSection;
  };
  lifeProfile?: PublishedSpeciesLifeProfile;
  reviewedTraits: PublishedSpeciesTrait[];
  assets: PublishedSpeciesAssets;
  variants: PublishedVariantSummary[];
  faq: PublishedFaqItem[];
  sources: PublishedSourceReference[];
  relatedLinks: PublishedRelatedLink[];
  metadata: PublishedSeoMetadata;
}

export interface PublishedCategoryLanding {
  category: PublishedCategorySummary;
  intro?: PublishedContentSection;
  featuredBaseSpecies: PublishedSpeciesSummary[];
  relatedGuides: PublishedRelatedLink[];
  relatedCategories: PublishedRelatedLink[];
  metadata: PublishedSeoMetadata;
}

export interface PublishedCareGuide {
  guide: PublishedGuideSummary;
  sections: PublishedContentSection[];
  assets: PublishedGuideAssets;
  relatedSpecies: PublishedSpeciesSummary[];
  relatedGuides: PublishedRelatedLink[];
  metadata: PublishedSeoMetadata;
}

export interface AquariumFish {
  id: string;
  fishId: string;
  quantity: number;
  entryDate: string; // ISO string
  lastWaterChangeDate?: string; // ISO string; unknown until a real water-change record exists
  batches?: AquariumSpeciesBatch[];
}

export type LifeStage = 'unknown' | 'juvenile' | 'adult';

/**
 * Compatibility inputs may describe unpersisted stages. Stored livestock batches
 * intentionally remain on the existing API/database LifeStage contract.
 */
export type CompatibilityLifeStage = LifeStage | 'fry' | 'subadult';

export type ReproductiveState =
  | 'unknown'
  | 'not_applicable'
  | 'normal'
  | 'pregnant_or_gravid'
  | 'in_labor_or_spawning'
  | 'postpartum_recovery';

export interface AquariumSpeciesBatch {
  id: string;
  quantity: number;
  entryDate: string;
  lifeStage: LifeStage;
  reproductiveState: ReproductiveState;
  stateUpdatedAt: string;
}

export type OnboardingGoal = 'build_tank' | 'browse_species';

export interface OnboardingState {
  version: 1;
  status: 'pending' | 'completed' | 'skipped';
  goal?: OnboardingGoal;
  viewedSpecies: boolean;
  aquariumConfigured: boolean;
  taskCardDismissed: boolean;
  completedAt?: string;
}

export interface Aquarium {
  id: string;
  name: string;
  startedAt?: string;
  startedAtSource?: 'created' | 'inferred' | 'user';
  startedAtConfirmedAt?: string;
  fishes: AquariumFish[];
  lastWaterChangeDate?: string;
  waterChangeHistory?: string[];
  lastWaterStoredDate?: string;
  dimensions?: { length: string; width: string; height: string };
  waterType?: 'Freshwater' | 'Saltwater';
  targetTemperature?: string;
  substrate?: string;
  plants?: string[];
  hardscape?: string[];
  equipment?: {
    filter?: '无' | '瀑布过滤' | '桶滤' | '上滤' | '海绵过滤';
    heater?: boolean;
    oxygen?: boolean;
    light?: '无' | '普通灯' | '水草灯' | '海水灯';
  };
}

export type SpeciesAdditionIntent = 'record_existing' | 'planned_addition';
export type CompatibilityStatus = 'compatible' | 'caution' | 'not_recommended' | 'insufficient_data';

export type AquariumSetupStatus = 'empty' | 'incomplete' | 'usable' | 'complete';

export type SpeciesAdditionPolicy =
  | 'save'
  | 'save_with_warning'
  | 'save_with_unknown'
  | 'save_with_urgent_warning'
  | 'allow'
  | 'confirm'
  | 'complete_information'
  | 'block';

export type MemorialCauseCode =
  | 'water_quality_change'
  | 'oxygen_shortage'
  | 'temperature_stress'
  | 'acclimation_stress'
  | 'aggression_or_injury'
  | 'feeding_or_digestive'
  | 'suspected_illness'
  | 'recent_medication_or_change'
  | 'age_related'
  | 'unknown'
  | 'other';

export interface DeceasedRecord {
  id: string;
  fishId: string;
  date: string;
  causeCodes?: MemorialCauseCode[];
  reason?: string;
  observation?: string;
  improvement?: string;
  version?: number;
}
