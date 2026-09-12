import { getReviewedCompatibilityProfile } from './compatibilityEvidence';
import { getSpeciesLandingPilotRecord } from './speciesLandingPilot';
import { getSeoEvidenceEntry, isSeoEvidenceConfirmed } from './seoEvidenceBindings';
import {
  getConfirmedSpeciesEditorialEvidence,
  getPublishedSpeciesEditorial,
  getPublishedSpeciesFaq,
  getPublishedVariantDifference,
  getSpeciesEditorialSource,
} from './speciesEditorialEvidence';
import type { PublishedLifeAnswer, PublishedSourceReference, PublishedSpeciesAsset, PublishedSpeciesLifeProfile, PublishedSpeciesProfile, PublishedSpeciesTrait } from '../types';
import type { SpeciesLandingSelection } from '../services/species/species-landing.service';

const publishedAsset = (fish: SpeciesLandingSelection['species'], usage: 'hero' | 'variant-card'): PublishedSpeciesAsset | undefined => {
  const pilot = getSpeciesLandingPilotRecord(fish);
  const source = usage === 'hero' ? pilot.asset.hero : pilot.asset.variantCard;
  if (source.status !== 'approved' || !source.sourcePath || !isSeoEvidenceConfirmed(fish.id, `assets.${usage}`)) return undefined;
  return {
    id: `${fish.id}-${usage}`,
    src: source.sourcePath,
    usage,
    aspectRatio: usage === 'hero' ? '16:9' : '4:3',
    fit: 'contain',
    altZh: source.altZh,
    altEn: source.altEn,
  };
};

const reviewedTraitsFor = (speciesId: string): PublishedSpeciesTrait[] => {
  const evidence = getReviewedCompatibilityProfile(speciesId);
  if (!evidence || evidence.reviewStatus !== 'reviewed' || evidence.citations.length === 0) return [];
  const sourceIds = evidence.citations.filter(source => source.reviewStatus === 'reviewed').map(source => source.id);
  if (sourceIds.length === 0) return [];

  return evidence.behaviorTraits.map(trait => {
    if (!isSeoEvidenceConfirmed(speciesId, `reviewedTraits.${trait}`)) return undefined;
    if (trait === 'shoaling') {
      return {
        id: `${speciesId}-shoaling`,
        label: '群游倾向',
        value: evidence.minimumGroupSize ? `建议至少 ${evidence.minimumGroupSize} 条` : '群体活动',
        summary: '它有群游倾向；一起饲养时，建议至少保持这个群体规模。',
        sourceIds,
      };
    }
    return {
      id: `${speciesId}-${trait}`,
      label: '行为特征',
      value: trait,
      summary: '这是它在物种资料中呈现出的行为特征。',
      sourceIds,
    };
  }).filter((trait): trait is PublishedSpeciesTrait => Boolean(trait));
};

const lifeAnswer = (sourceFingerprint: string, answer: string, sourceIds: string[], confirmedAt: string): PublishedLifeAnswer => {
  return {
    answer,
    sourceIds,
    sourceFingerprint,
    confirmedAt,
  };
};

const lifeProfileFor = (baseSpeciesId: string): PublishedSpeciesLifeProfile | undefined => {
  const profile: PublishedSpeciesLifeProfile = {};
  if (baseSpeciesId === 'sp_0001') {
    const evidence = getConfirmedSpeciesEditorialEvidence(baseSpeciesId).find(entry => entry.field === 'behavior');
    if (evidence) profile.foraging = lifeAnswer(evidence.sourceFingerprint, evidence.renderedClaim, evidence.sourceIds, evidence.confirmedAt || '');
  }
  if (baseSpeciesId === 'sp_0001') {
    const evidence = getConfirmedSpeciesEditorialEvidence(baseSpeciesId).find(entry => entry.field === 'activity');
    if (evidence) profile.activity = lifeAnswer(evidence.sourceFingerprint, evidence.renderedClaim, evidence.sourceIds, evidence.confirmedAt || '');
  }
  if (baseSpeciesId === 'sp_0432') {
    const evidence = getReviewedCompatibilityProfile(baseSpeciesId);
    const binding = getSeoEvidenceEntry(baseSpeciesId, 'reviewedTraits.shoaling');
    if (evidence && binding && evidence.minimumGroupSize) {
      profile.social = lifeAnswer(binding.binding.sourceFingerprint, `它有群游倾向，建议至少 ${evidence.minimumGroupSize} 条一起活动。`, binding.binding.sourceIds, binding.binding.confirmedAt);
    }
    const activity = getConfirmedSpeciesEditorialEvidence(baseSpeciesId).find(entry => entry.field === 'activity');
    if (activity) profile.activity = lifeAnswer(activity.sourceFingerprint, activity.renderedClaim, activity.sourceIds, activity.confirmedAt || '');
    const foraging = getConfirmedSpeciesEditorialEvidence(baseSpeciesId).find(entry => entry.field === 'foraging');
    if (foraging) profile.foraging = lifeAnswer(foraging.sourceFingerprint, foraging.renderedClaim, foraging.sourceIds, foraging.confirmedAt || '');
  }
  return Object.keys(profile).length > 0 ? profile : undefined;
};

const sourceKind = (sourceType: string): PublishedSourceReference['kind'] => {
  if (sourceType === 'project-product-truth') return 'project-product-truth';
  if (sourceType === 'peer-reviewed' || sourceType === 'peer_reviewed') return 'peer-reviewed';
  if (sourceType === 'authoritative-database' || sourceType === 'curated_husbandry') return 'authoritative-database';
  return 'government-research';
};

const publishedSourcesFor = (baseId: string, speciesId: string, visibleVariantIds: string[]): PublishedSourceReference[] => {
  const editorialSourceIds = [baseId, speciesId, ...visibleVariantIds]
    .flatMap(targetId => getConfirmedSpeciesEditorialEvidence(targetId))
    .flatMap(evidence => evidence.sourceIds);
  const editorialSources = editorialSourceIds.map(sourceId => getSpeciesEditorialSource(sourceId)).filter(Boolean);
  const traitSources = getReviewedCompatibilityProfile(speciesId)?.citations.filter(source => source.reviewStatus === 'reviewed') || [];
  const references: PublishedSourceReference[] = [
    ...editorialSources.map(source => ({
      id: source!.id,
      title: source!.sourceType === 'project-product-truth'
        ? (source!.id.startsWith('source-row-map:') ? 'AquaGuide 物种归组记录' : 'AquaGuide 物种目录记录')
        : source!.title,
      publisher: source!.sourceType === 'project-product-truth' ? 'AquaGuide' : source!.publisher,
      ...(source!.url.startsWith('http') ? { url: source!.url } : {}),
      kind: sourceKind(source!.sourceType),
    })),
    ...traitSources.map(source => ({
      id: source.id,
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      kind: sourceKind(source.sourceType),
    })),
  ];
  return [...new Map(references.map(source => [`${source.title}|${source.publisher}|${source.url ?? ''}`, source])).values()];
};

const categoryHrefFor = (category: string): string | undefined => {
  if (category === '虾螺蟹') return '/category/shrimp-snails-crabs';
  return undefined;
};

export const getPublishedSpeciesProfile = (
  selection: SpeciesLandingSelection,
  locale: 'zh-CN' | 'en' = 'zh-CN',
): PublishedSpeciesProfile => {
  const { species, baseSpecies, variants } = selection;
  const profile = getSpeciesLandingPilotRecord(species);
  const hero = publishedAsset(species, 'hero');
  const editorial = locale === 'zh-CN' ? getPublishedSpeciesEditorial(baseSpecies.id) : undefined;
  const faq = locale === 'zh-CN' ? getPublishedSpeciesFaq(baseSpecies.id) : [];
  const variantSummaries = variants.map(variant => {
    const image = publishedAsset(variant, 'variant-card');
    const difference = locale === 'zh-CN' ? getPublishedVariantDifference(variant.id) : undefined;
    return {
      id: variant.id,
      name: variant.name,
      scientificName: variant.scientificName,
      image,
      difference,
      indexPolicy: variant.id === baseSpecies.id ? 'noindex' as const : 'canonical-to-base' as const,
    };
  }).filter(variant => variant.id === baseSpecies.id || variant.id === species.id || Boolean(variant.image || variant.difference));

  return {
    catalog: species,
    editorial,
    lifeProfile: locale === 'zh-CN' ? lifeProfileFor(baseSpecies.id) : undefined,
    reviewedTraits: reviewedTraitsFor(species.id),
    assets: hero ? [hero] : [],
    variants: variantSummaries,
    faq,
    sources: locale === 'zh-CN' ? publishedSourcesFor(baseSpecies.id, species.id, variantSummaries.map(variant => variant.id)) : [],
    relatedLinks: [
      ...(categoryHrefFor(species.category) ? [{ id: 'category', label: `浏览${species.category}分类`, href: categoryHrefFor(species.category)!, kind: 'category' as const }] : []),
      { id: 'care', label: '查看养护百科', href: '/care', kind: 'care-guide' },
      { id: 'compatibility', label: '把它加入混养计算', href: `/encyclopedia?mode=compatibility&species=${encodeURIComponent(species.id)}&source=species-profile`, kind: 'compatibility' },
    ],
    metadata: {
      locale,
      canonical: `/species/${baseSpecies.id}`,
      indexPolicy: profile.indexPolicy,
      publishedAt: '',
      reviewedAt: '',
    },
  };
};
