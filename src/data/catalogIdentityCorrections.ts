import type { Fish } from '../types';

export type CatalogIdentityCorrection = {
  catalogKey: string;
  expectedScientificName: string;
  reviewedAt: string;
  sourceIds: string[];
  rationale: string;
  zhCN: Partial<Pick<Fish, 'name' | 'description' | 'tankSize' | 'housingMode' | 'housingReason'>>;
  en: Partial<Pick<Fish, 'name' | 'description' | 'tankSize' | 'housingMode' | 'housingReason'>>;
};

/**
 * Runtime-only corrections for legacy catalogue rows whose stable catalogKey
 * must be preserved, but whose user-facing identity or husbandry summary is
 * materially misleading.
 *
 * This is deliberately not a taxonomy canonicalizer. Every correction is
 * object-scoped, requires an exact scientific-name match, and carries reviewed
 * provenance. Published catalogue snapshots remain immutable.
 */
export const catalogIdentityCorrections: CatalogIdentityCorrection[] = [
  {
    catalogKey: 'sp_0120',
    expectedScientificName: 'Gymnotus carapo',
    reviewedAt: '2026-09-28',
    sourceIds: ['batch20-fishbase-gymnotus-carapo', 'seriouslyfish-gymnotus-carapo'],
    rationale: 'Legacy display name “电鳗 (观赏型)” can be mistaken for true electric eels (Electrophorus). Gymnotus carapo is the Banded knifefish / 圭亚那裸背电鳗 and is a weakly electric fish.',
    zhCN: {
      name: '圭亚那裸背电鳗',
      description: '弱电型裸背电鳗，利用连续的弱电脉冲进行电定位和沟通，并非能高压放电的真正电鳗。夜行且会捕食小鱼，成年体型大，需要宽敞水体与充足遮蔽。',
      tankSize: '至少 648 升',
      housingMode: '建议单养',
      housingReason: '同类间领地性强，且会捕食小鱼；默认按单体饲养规划。与大型、强健且无法入口的异种并非绝对禁配，但需逐项核对空间、行为和水质。',
    },
    en: {
      name: 'Banded knifefish',
      description: 'A weakly electric knifefish that uses low-strength electric organ discharges for electrolocation and communication; it is not a high-voltage electric eel. It is nocturnal, predatory toward small fish, and needs a large, well-covered aquarium.',
      tankSize: 'At least 648 L',
      housingReason: 'Conspecific territoriality and predation on small fish make solitary planning the default. Large, robust tankmates that cannot be swallowed are not automatically excluded, but space, behavior and water conditions must be checked individually.',
    },
  },
];

const correctionByCatalogKey = new Map(catalogIdentityCorrections.map(item => [item.catalogKey, item]));

export const getCatalogIdentityCorrection = (catalogKey: string) => correctionByCatalogKey.get(catalogKey);

export const applyCatalogIdentityCorrection = (
  fish: Fish,
  locale: 'zh-CN' | 'en' = 'zh-CN',
): Fish => {
  const correction = getCatalogIdentityCorrection(fish.id);
  if (!correction || fish.scientificName.trim() !== correction.expectedScientificName) return fish;
  const patch = locale === 'en' ? correction.en : correction.zhCN;
  return {
    ...fish,
    ...patch,
    ...(fish.feedingProfile ? { feedingProfile: { ...fish.feedingProfile } } : {}),
  };
};
