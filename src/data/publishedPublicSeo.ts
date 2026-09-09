import { fishData } from './fishData';
import { getSpeciesLandingSelection } from '../services/species/species-landing.service';
import type {
  PublishedCareGuide,
  PublishedCategoryLanding,
  PublishedSpeciesSummary,
} from '../types';
import { getPublishedSpeciesProfile } from './publishedSpeciesProfile';

const PUBLIC_CATEGORY_IDS: Record<string, string> = {
  'shrimp-snails-crabs': '虾螺蟹',
};

const PUBLISHED_CATEGORY_SPECIES = new Set(['sp_0001']);

const summaryFor = (id: string): PublishedSpeciesSummary | null => {
  const fish = fishData.find(item => item.id === id);
  if (!fish) return null;
  const selection = getSpeciesLandingSelection(fish.id);
  if (!selection) return null;
  const profile = getPublishedSpeciesProfile(selection, 'zh-CN');
  return {
    id: fish.id,
    name: fish.name,
    scientificName: fish.scientificName,
    image: profile.assets.find(asset => asset.usage === 'hero'),
    href: `/species/${fish.id}`,
  };
};

export const getPublishedCategoryLanding = (slug: string, locale: 'zh-CN' | 'en' = 'zh-CN'): PublishedCategoryLanding | null => {
  const categoryName = PUBLIC_CATEGORY_IDS[slug];
  if (!categoryName) return null;
  const featuredBaseSpecies = [...PUBLISHED_CATEGORY_SPECIES]
    .map(summaryFor)
    .filter((item): item is PublishedSpeciesSummary => Boolean(item))
    .filter(item => fishData.find(fish => fish.id === item.id)?.category === categoryName);
  return {
    category: { id: slug, name: categoryName, href: `/category/${slug}` },
    featuredBaseSpecies,
    relatedGuides: [],
    relatedCategories: [],
    metadata: {
      locale,
      canonical: `/category/${slug}`,
      indexPolicy: 'noindex',
      publishedAt: '',
      reviewedAt: '',
    },
  };
};

export const getPublishedCareGuide = (slug: string, locale: 'zh-CN' | 'en' = 'zh-CN'): PublishedCareGuide | null => {
  if (slug !== 'new-fish-acclimation') return null;
  return {
    guide: {
      id: 'guide_new_fish_acclimation',
      title: locale === 'en' ? 'New fish acclimation' : '新鱼入缸',
      summary: locale === 'en' ? 'A reviewed guide will appear here when its steps are ready.' : '这篇指南完成事实审核后，会在这里呈现可执行步骤。',
      href: `/guides/${slug}`,
    },
    sections: [],
    assets: [],
    relatedSpecies: [],
    relatedGuides: [],
    metadata: {
      locale,
      canonical: `/guides/${slug}`,
      indexPolicy: 'noindex',
      publishedAt: '',
      reviewedAt: '',
    },
  };
};
