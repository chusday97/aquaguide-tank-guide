import type { Fish } from '../types';

export type CatalogIdentityCorrection = {
  catalogKey: string;
  expectedScientificName: string;
  reviewedAt: string;
  sourceIds: string[];
  rationale: string;
  zhCN: Partial<Pick<Fish, 'name' | 'category' | 'description' | 'tankSize' | 'housingMode' | 'housingReason'>>;
  en: Partial<Pick<Fish, 'name' | 'category' | 'description' | 'tankSize' | 'housingMode' | 'housingReason'>>;
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
    catalogKey: 'sp_0054',
    expectedScientificName: 'Hemichromis bimaculatus',
    reviewedAt: '2026-09-28',
    sourceIds: ['batch09-fishbase-hemichromis-bimaculatus', 'seriouslyfish-hemichromis-bimaculatus'],
    rationale: 'Legacy row classifies a freshwater cichlid as hardscape/substrate and gives hardscape housing copy. The exact taxon is a territorial freshwater jewel cichlid.',
    zhCN: {
      category: '慈鲷/斗鱼',
      description: '西非淡水慈鲷，具有明显领地性，繁殖期攻击性会显著上升；不适合作为普通社区鱼随意混养。',
      tankSize: '至少 108 升（建议缸长 120 cm）',
      housingMode: '谨慎混养',
      housingReason: '需要足够领地和躲避结构；繁殖期尤其应避免与无关鱼只拥挤混养。若搭配异种，应选择体型和性情合适、无法轻易被压制的对象。',
    },
    en: {
      name: 'Jewel cichlid',
      category: '慈鲷/斗鱼',
      description: 'A territorial West African freshwater cichlid whose aggression can increase sharply during breeding. It is not a general community fish.',
      tankSize: 'At least 108 L (120 cm tank length recommended)',
      housingMode: '谨慎混养',
      housingReason: 'Provide clear territories and cover. Breeding fish can become highly aggressive, so community combinations require deliberate selection and enough space.',
    },
  },
  {
    catalogKey: 'sp_0057',
    expectedScientificName: 'Altolamprologus calvus',
    reviewedAt: '2026-09-28',
    sourceIds: ['batch09-fishbase-altolamprologus-calvus', 'seriouslyfish-altolamprologus-calvus'],
    rationale: 'Legacy row classifies this Lake Tanganyika freshwater cichlid as marine and gives generic marine/coral housing copy.',
    zhCN: {
      category: '慈鲷/斗鱼',
      description: '坦噶尼喀湖淡水慈鲷，适应碱性硬水和岩石洞穴环境，会捕食鱼卵、鱼苗及能入口的小鱼。',
      tankSize: '大型岩石缸；暂无审核固定最低体积',
      housingMode: '谨慎混养',
      housingReason: '可进入规划良好的坦湖混养缸，但应避开能被吞食的小鱼以及过于凶猛、喧闹的同缸鱼，并提供充足岩洞和领地。',
    },
    en: {
      name: 'Calvus cichlid',
      category: '慈鲷/斗鱼',
      description: 'A freshwater Lake Tanganyika cichlid for hard, alkaline water and rocky cave habitats. It preys on eggs, fry and small fish it can swallow.',
      tankSize: 'Large rockwork aquarium; no reviewed fixed minimum volume',
      housingMode: '谨慎混养',
      housingReason: 'Suitable for a carefully planned Tanganyikan community with robust tankmates too large to swallow; avoid very aggressive or boisterous companions and provide ample caves.',
    },
  },
  {
    catalogKey: 'sp_0058',
    expectedScientificName: 'Neolamprologus multifasciatus',
    reviewedAt: '2026-09-28',
    sourceIds: ['batch09-fishbase-neolamprologus-multifasciatus', 'seriouslyfish-neolamprologus-multifasciatus'],
    rationale: 'Legacy row classifies this Lake Tanganyika freshwater shell-dweller as marine and gives generic marine/coral housing copy.',
    zhCN: {
      category: '慈鲷/斗鱼',
      description: '坦噶尼喀湖淡水壳居慈鲷，围绕螺壳建立并防守小型领地；需要细沙和数量多于鱼只的空壳。',
      tankSize: '至少 40 升（成对）；群落需更大空间',
      housingMode: '谨慎混养',
      housingReason: '会积极防守壳区，但可与主要活动在其他水层的合适坦湖鱼搭配；应留出壳区间距并提供充足空壳。',
    },
    en: {
      name: 'Multifasciatus shell-dweller',
      category: '慈鲷/斗鱼',
      description: 'A freshwater Lake Tanganyika shell-dwelling cichlid that defends small territories around shells. It needs sand and more empty shells than fish.',
      tankSize: 'At least 40 L for a pair; colonies need more space',
      housingMode: '谨慎混养',
      housingReason: 'It vigorously defends shell territories but can coexist with suitable Tanganyikan species occupying other zones when shell spacing and cover are sufficient.',
    },
  },
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
