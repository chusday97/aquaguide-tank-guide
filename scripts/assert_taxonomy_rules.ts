import { fishData } from '../src/data/fishData';
import { applyLocalization } from '../src/i18n/localizeData';
import { localizeTaxonomyLabel } from '../src/modules/species/species-taxonomy.presentation';
import type { Fish } from '../src/types';
import {
  getCareTaxonomyPath,
  getDisplayableSpecies,
  getEncyclopediaLifeType,
  getLifeType,
  getSpeciesFilterTags,
  getSpeciesRoleLabel,
  getSpeciesPositioning,
  getToolFunctions,
  getSecondaryCategory,
  isSaltwaterSpecies,
  isSpeciesCompatibleWithWaterType,
  speciesService,
} from '../src/modules/species/species.service';

type AssertionFailure = {
  rule: string;
  speciesId?: string;
  name?: string;
  details?: string;
};

const failures: AssertionFailure[] = [];
const fail = (failure: AssertionFailure) => failures.push(failure);
const displayableIds = new Set(getDisplayableSpecies().map(fish => fish.id));
const encyclopediaItems = speciesService.list({ includeScenery: false, limit: 500 }).items;

for (const fish of fishData) {
  const originalCategory = (fish as Fish & { _originalCategory?: string })._originalCategory || fish.category;
  const lifeType = getLifeType(fish);
  const encyclopediaLifeType = getEncyclopediaLifeType(fish);
  const secondaryCategory = getSecondaryCategory(fish);
  const roleLabel = getSpeciesRoleLabel(fish);
  const englishRoleLabel = getSpeciesRoleLabel(fish, true);

  if (originalCategory === '珊瑚/海水无脊椎') {
    const sourceTags = getSpeciesFilterTags(fish);
    if (lifeType !== 'coral' || encyclopediaLifeType !== 'coral' || !sourceTags.environmentTags.includes('海水')) {
      fail({
        rule: '来源分类为珊瑚/海水无脊椎的记录不得被名称规则改判',
        speciesId: fish.id,
        name: fish.name,
        details: `lifeType=${lifeType}, encyclopediaLifeType=${encyclopediaLifeType}, environment=${sourceTags.environmentTags.join(',')}`,
      });
    }
  }

  if ((lifeType === 'plant' || lifeType === 'hardscape') && displayableIds.has(fish.id)) {
    fail({
      rule: '水草/硬景不能进入图鉴展示列表',
      speciesId: fish.id,
      name: fish.name,
      details: `lifeType=${lifeType}`,
    });
  }

  if (['freshwaterFish', 'saltwaterFish', 'invertebrate', 'reptile', 'coral'].includes(encyclopediaLifeType) && !secondaryCategory) {
    fail({
      rule: '图鉴展示物种必须有用户可见二级分类',
      speciesId: fish.id,
      name: fish.name,
      details: `encyclopediaLifeType=${encyclopediaLifeType}`,
    });
  }

  if (lifeType !== 'fish' && (/小型观赏鱼|群游搭配/.test(roleLabel) || /Small Fish|Schooling Mix/.test(englishRoleLabel))) {
    fail({
      rule: '非鱼类不得使用鱼类角色标签',
      speciesId: fish.id,
      name: fish.name,
      details: `lifeType=${lifeType}, role=${roleLabel}, roleEn=${englishRoleLabel}`,
    });
  }

  if (lifeType === 'coral' && !/珊瑚|海水特殊养护|特殊缸体/.test(roleLabel)) {
    fail({
      rule: '珊瑚生命类型必须使用珊瑚或海水特殊养护标签',
      speciesId: fish.id,
      name: fish.name,
      details: `secondaryCategory=${secondaryCategory}, role=${roleLabel}`,
    });
  }

  if (lifeType === 'coral' && getSpeciesFilterTags(fish).functionTags.includes('小缸适合')) {
    fail({
      rule: '珊瑚不得仅凭通用 Small 字段获得小缸适合标签',
      speciesId: fish.id,
      name: fish.name,
    });
  }

  if (lifeType === 'coral' && getSpeciesFilterTags(fish).environmentTags.includes('小缸')) {
    fail({
      rule: '珊瑚不得仅凭通用 Small 字段获得小缸环境标签',
      speciesId: fish.id,
      name: fish.name,
    });
  }
}

for (const item of encyclopediaItems) {
  const lifeType = getLifeType(item);
  if (lifeType === 'plant' || lifeType === 'hardscape') {
    fail({
      rule: 'speciesService.list 默认结果不能包含水草/硬景',
      speciesId: item.id,
      name: item.name,
      details: `lifeType=${lifeType}`,
    });
  }
}


const taxonomyIdentityCases = [
  { id: 'sp_0436', expected: '孔雀/月光/玛丽/剑尾', label: '孔雀鱼' },
  { id: 'sp_0439', expected: '鲃类/小型鲤科', label: '虎皮鱼' },
  { id: 'sp_0440', expected: '鲃类/小型鲤科', label: '一眉道人' },
];
for (const expected of taxonomyIdentityCases) {
  const fish = fishData.find(item => item.id === expected.id);
  if (!fish) {
    fail({ rule: 'taxonomy identity regression fixture must exist', speciesId: expected.id, name: expected.label });
    continue;
  }
  const actual = getSecondaryCategory(fish);
  if (actual !== expected.expected) {
    fail({
      rule: 'secondary taxonomy must follow species identity, not names mentioned in description',
      speciesId: fish.id,
      name: fish.name,
      details: `expected=${expected.expected}, actual=${actual}`,
    });
  }
}

const hillstreamLoach = fishData.find(item => item.id === 'sp_0039');
if (!hillstreamLoach) {
  fail({ rule: '方氏拟腹吸鳅 regression fixture must exist', speciesId: 'sp_0039' });
} else if (isSaltwaterSpecies(hillstreamLoach) || getEncyclopediaLifeType(hillstreamLoach) !== 'freshwaterFish') {
  fail({
    rule: 'water taxonomy must follow species identity, not marine words mentioned in description',
    speciesId: hillstreamLoach.id,
    name: hillstreamLoach.name,
    details: `saltwater=${isSaltwaterSpecies(hillstreamLoach)}, encyclopediaLifeType=${getEncyclopediaLifeType(hillstreamLoach)}`,
  });
}

const africanButterflyFish = fishData.find(item => item.id === 'sp_0119');
if (!africanButterflyFish) {
  fail({ rule: '古代蝴蝶鱼 regression fixture must exist', speciesId: 'sp_0119' });
} else if (isSaltwaterSpecies(africanButterflyFish) || getEncyclopediaLifeType(africanButterflyFish) !== 'freshwaterFish' || getSecondaryCategory(africanButterflyFish) !== '龙鱼/古代鱼') {
  fail({
    rule: 'freshwater butterfly fish identity must not match generic marine butterfly-fish wording',
    speciesId: africanButterflyFish.id,
    name: africanButterflyFish.name,
    details: `saltwater=${isSaltwaterSpecies(africanButterflyFish)}, encyclopediaLifeType=${getEncyclopediaLifeType(africanButterflyFish)}, secondary=${getSecondaryCategory(africanButterflyFish)}`,
  });
}

const hanCharacter = /[\u3400-\u9fff]/;
for (const fish of fishData) {
  const secondaryCategory = getSecondaryCategory(fish);
  if (secondaryCategory) {
    const englishLabel = localizeTaxonomyLabel(secondaryCategory, true);
    if (hanCharacter.test(englishLabel)) {
      fail({
        rule: 'English taxonomy presentation must not expose canonical Chinese labels',
        speciesId: fish.id,
        name: fish.name,
        details: `canonical=${secondaryCategory}, english=${englishLabel}`,
      });
    }
  }
  const englishWater = localizeTaxonomyLabel(getCareTaxonomyPath(fish).waterType, true);
  if (hanCharacter.test(englishWater)) {
    fail({
      rule: 'English water taxonomy presentation must be localized without mutating domain values',
      speciesId: fish.id,
      name: fish.name,
      details: `englishWater=${englishWater}`,
    });
  }
}

const canonicalTaxonomyById = new Map(fishData.map(fish => [fish.id, {
  lifeType: getLifeType(fish),
  encyclopediaLifeType: getEncyclopediaLifeType(fish),
  waterType: getCareTaxonomyPath(fish).waterType,
  secondaryCategory: getSecondaryCategory(fish),
}]));
applyLocalization('en');
for (const fish of fishData) {
  const canonical = canonicalTaxonomyById.get(fish.id);
  const localized = {
    lifeType: getLifeType(fish),
    encyclopediaLifeType: getEncyclopediaLifeType(fish),
    waterType: getCareTaxonomyPath(fish).waterType,
    secondaryCategory: getSecondaryCategory(fish),
  };
  if (canonical && JSON.stringify(canonical) !== JSON.stringify(localized)) {
    fail({
      rule: 'locale switch must not mutate species domain taxonomy',
      speciesId: fish.id,
      name: (fish as Fish & { _originalName?: string })._originalName || fish.name,
      details: `canonical=${JSON.stringify(canonical)}, en=${JSON.stringify(localized)}`,
    });
  }
}
applyLocalization('zh-CN');

const frogfishItems = fishData.filter(fish => /五彩青蛙|Synchiropus/i.test(`${fish.name} ${fish.scientificName}`));
if (frogfishItems.length === 0) {
  fail({ rule: '必须存在五彩青蛙/青蛙鱼数据' });
}

for (const fish of frogfishItems) {
  const lifeType = getEncyclopediaLifeType(fish);
  const secondaryCategory = getSecondaryCategory(fish);
  if (lifeType !== 'saltwaterFish' || secondaryCategory !== '虾虎/青蛙鱼') {
    fail({
      rule: '五彩青蛙必须归为海水鱼/虾虎青蛙鱼，不得归为两栖',
      speciesId: fish.id,
      name: fish.name,
      details: `lifeType=${lifeType}, secondaryCategory=${secondaryCategory}`,
    });
  }
}

const turtleItems = fishData.filter(fish => /龟|turtle|Sternotherus|Trachemys|Mauremys|Carettochelys|Staurotypus/i.test(`${fish.name} ${fish.scientificName}`));
for (const fish of turtleItems) {
  const lifeType = getEncyclopediaLifeType(fish);
  const secondaryCategory = getSecondaryCategory(fish);
  if (lifeType !== 'reptile' || secondaryCategory !== '龟类') {
    fail({
      rule: '龟类必须归为龟/两栖下的龟类',
      speciesId: fish.id,
      name: fish.name,
      details: `lifeType=${lifeType}, secondaryCategory=${secondaryCategory}`,
    });
  }
}

const knownOverrides = [
  { id: 'sp_0141', water: '淡水', ornamental: true, tool: false },
  { id: 'sp_0186', water: '海水', ornamental: true, tool: false },
  { id: 'sp_0460', water: '淡水', ornamental: false, tool: false },
];
for (const expected of knownOverrides) {
  const fish = fishData.find(item => item.id === expected.id);
  if (!fish) {
    fail({ rule: '人工分类覆盖物种必须存在', speciesId: expected.id });
    continue;
  }
  const tags = getSpeciesFilterTags(fish);
  if (!tags.environmentTags.includes(expected.water)) {
    fail({ rule: '人工分类覆盖的水体标签必须正确', speciesId: fish.id, name: fish.name, details: tags.environmentTags.join(',') });
  }
  if (tags.functionTags.includes('观赏鱼') !== expected.ornamental) {
    fail({ rule: '人工分类覆盖的观赏鱼标签必须正确', speciesId: fish.id, name: fish.name, details: tags.functionTags.join(',') });
  }
  if ((getToolFunctions(fish).length > 0) !== expected.tool) {
    fail({ rule: '人工分类覆盖的工具属性必须正确', speciesId: fish.id, name: fish.name, details: getToolFunctions(fish).join(',') });
  }
  if (/\p{Script=Han}/u.test(getSpeciesRoleLabel(fish, true)) || /\p{Script=Han}/u.test(getSpeciesPositioning(fish, true))) {
    fail({ rule: '人工分类覆盖的英文角色和定位不得回退中文', speciesId: fish.id, name: fish.name });
  }
}

for (const fish of fishData) {
  const tags = getSpeciesFilterTags(fish);
  if (tags.functionTags.includes('观赏鱼') && getLifeType(fish) !== 'fish') {
    fail({ rule: '观赏鱼标签只能分配给鱼类', speciesId: fish.id, name: fish.name, details: `lifeType=${getLifeType(fish)}` });
  }
  if (tags.environmentTags.includes('淡水') && !isSpeciesCompatibleWithWaterType(fish, 'Freshwater')) {
    fail({ rule: '淡水标签不能分配给海水对象', speciesId: fish.id, name: fish.name });
  }
  if (tags.environmentTags.includes('海水') && !isSpeciesCompatibleWithWaterType(fish, 'Saltwater')) {
    fail({ rule: '海水标签不能分配给淡水对象', speciesId: fish.id, name: fish.name });
  }
  if (tags.functionTags.includes('工具生物') && !['fish', 'invertebrate'].includes(getLifeType(fish))) {
    fail({ rule: '工具生物只能来自鱼类或无脊椎动物', speciesId: fish.id, name: fish.name, details: `lifeType=${getLifeType(fish)}` });
  }
}

const freshwaterOrnamentalCount = fishData.filter(fish => {
  const tags = getSpeciesFilterTags(fish);
  return tags.functionTags.includes('观赏鱼') && tags.environmentTags.includes('淡水');
}).length;
if (freshwaterOrnamentalCount === 0) {
  fail({ rule: '观赏鱼 + 淡水组合筛选必须有结果' });
}

if (failures.length > 0) {
  console.error(`Taxonomy assertions failed: ${failures.length}`);
  console.error(JSON.stringify(failures.slice(0, 50), null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  totalSpecies: fishData.length,
  displayableSpecies: displayableIds.size,
  checkedRules: [
    '水草/硬景不进图鉴',
    '图鉴物种必须有二级分类',
    '五彩青蛙归海水鱼/虾虎青蛙鱼',
    '龟类归龟/两栖/龟类',
    '人工覆盖物种标签正确',
    '观赏鱼和水体标签边界正确',
    '工具生物边界和组合筛选有效',
    '非鱼类不得出现鱼类角色标签',
    '珊瑚角色和两类小缸标签边界正确',
    '人工覆盖物种具备英文角色与定位',
    '来源珊瑚分类独立约束生命类型和海水环境',
  ],
}, null, 2));
