import type { Fish } from '../types';

export type SpeciesLandingAssetStatus = 'needs_review' | 'approved' | 'blocked';
export type SpeciesLandingEditorialStatus = 'unavailable' | 'draft' | 'published';
export type SpeciesLandingIndexPolicy = 'index' | 'canonical-to-base' | 'noindex';
export type SpeciesLandingAssetUse = {
  sourcePath: string;
  use: 'hero' | 'variant-card';
  crop: 'contain';
  altZh: string;
  altEn: string;
  status: SpeciesLandingAssetStatus;
  confirmedBy?: 'project-owner';
  confirmedAt?: string;
};

export type SpeciesLandingPilotRecord = {
  baseCatalogKey: string;
  asset: {
    hero: SpeciesLandingAssetUse;
    variantCard: SpeciesLandingAssetUse;
    fallbackLabelZh: string;
    fallbackLabelEn: string;
  };
  editorial: {
    status: SpeciesLandingEditorialStatus;
    intro: SpeciesLandingEditorialStatus;
    care: SpeciesLandingEditorialStatus;
    faq: SpeciesLandingEditorialStatus;
    variantDifference: SpeciesLandingEditorialStatus;
  };
  indexPolicy: SpeciesLandingIndexPolicy;
};

export const speciesLandingPilotContent: Record<string, SpeciesLandingPilotRecord> = {
  sp_0001: {
    baseCatalogKey: 'sp_0001',
    asset: {
      hero: { sourcePath: '/species-image-overrides/sp_0001.png', use: 'hero', crop: 'contain', altZh: '侧视的红色极火虾。', altEn: 'Draft: Side view of a red fire shrimp.', status: 'approved', confirmedBy: 'project-owner', confirmedAt: '2026-09-01' },
      variantCard: { sourcePath: '/species-image-overrides/sp_0001.png', use: 'variant-card', crop: 'contain', altZh: '侧视的红色极火虾。', altEn: 'Draft: Side view of a red fire shrimp.', status: 'approved', confirmedBy: 'project-owner', confirmedAt: '2026-09-01' },
      fallbackLabelZh: '极火虾图片暂不可用',
      fallbackLabelEn: 'Fire shrimp image unavailable',
    },
    editorial: { status: 'unavailable', intro: 'unavailable', care: 'unavailable', faq: 'unavailable', variantDifference: 'unavailable' },
    indexPolicy: 'noindex',
  },
  sp_0030: {
    baseCatalogKey: 'sp_0001',
    asset: {
      hero: { sourcePath: '/species-image-overrides/sp_0030.png', use: 'hero', crop: 'contain', altZh: '侧视的黄色黄金米虾。', altEn: 'Draft: Side view of a yellow fire shrimp.', status: 'approved', confirmedBy: 'project-owner', confirmedAt: '2026-09-01' },
      variantCard: { sourcePath: '/species-image-overrides/sp_0030.png', use: 'variant-card', crop: 'contain', altZh: '侧视的黄色黄金米虾。', altEn: 'Draft: Side view of a yellow fire shrimp.', status: 'approved', confirmedBy: 'project-owner', confirmedAt: '2026-09-01' },
      fallbackLabelZh: '黄金米虾图片暂不可用',
      fallbackLabelEn: 'Yellow shrimp image unavailable',
    },
    editorial: { status: 'unavailable', intro: 'unavailable', care: 'unavailable', faq: 'unavailable', variantDifference: 'unavailable' },
    indexPolicy: 'noindex',
  },
};

export const getSpeciesLandingPilotRecord = (fish: Pick<Fish, 'id' | 'name' | 'scientificName'>) => (
  speciesLandingPilotContent[fish.id] || {
    baseCatalogKey: fish.id,
    asset: {
      hero: { sourcePath: '', use: 'hero' as const, crop: 'contain' as const, altZh: `${fish.name}，${fish.scientificName}`, altEn: `${fish.name}, ${fish.scientificName}`, status: 'needs_review' as const },
      variantCard: { sourcePath: '', use: 'variant-card' as const, crop: 'contain' as const, altZh: `${fish.name}，${fish.scientificName}`, altEn: `${fish.name}, ${fish.scientificName}`, status: 'needs_review' as const },
      fallbackLabelZh: `${fish.name}图片暂不可用`,
      fallbackLabelEn: `${fish.name} image unavailable`,
    },
    editorial: { status: 'unavailable' as const, intro: 'unavailable' as const, care: 'unavailable' as const, faq: 'unavailable' as const, variantDifference: 'unavailable' as const },
    indexPolicy: 'noindex' as const,
  }
);
