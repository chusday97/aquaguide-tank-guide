import fs from 'node:fs';
import path from 'node:path';
import { fishData } from '../src/data/fishData';
import {
  getCareTaxonomyPath,
  getEncyclopediaLifeType,
  getLifeType,
  getSecondaryCategory,
  getSpeciesFilterTags,
  getSpeciesRoleLabel,
  getSpeciesPositioning,
} from '../src/modules/species/species.service';

interface SpeciesTaxonomyAuditRow {
  speciesId: string;
  lifeType: string;
  primaryCategory: string;
  secondaryCategory: string;
  roleLabel: string;
  waterType: string;
  violations: string[];
}

const outputDir = path.resolve('output/classification_audit');
const csvPath = path.join(outputDir, 'species_taxonomy_review.csv');
const htmlPath = path.join(outputDir, 'species_taxonomy_review.html');

const primaryLabelByLifeType: Record<string, string> = {
  freshwaterFish: '淡水鱼',
  saltwaterFish: '海水鱼',
  invertebrate: '虾螺蟹',
  reptile: '龟/两栖',
  coral: '珊瑚/海葵',
  plant: '水草',
  hardscape: '硬景/底砂',
};

const reviewReasonFor = (oldCategory: string, primary: string, secondary: string) => {
  if ((primary === '淡水鱼' || primary === '海水鱼') && /水草|硬景|底床/.test(oldCategory)) return '旧分类把鱼放进了水草或硬景';
  if ((primary === '水草' || primary === '硬景/底砂') && /鱼类|灯科鱼|慈鲷|斗鱼|鲶鱼|异型|海水鱼/.test(oldCategory)) return '旧分类把造景素材放进了生物分类';
  if (primary === '虾螺蟹' && oldCategory === '海水鱼') return '旧分类把海水清洁生物放进了海水鱼';
  if (primary === '珊瑚/海葵' && oldCategory === '海水鱼') return '旧分类把水母/滤食生物放进了海水鱼';
  if (!secondary) return '缺少用户可见二级分类';
  return '';
};

const escapeCsv = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const escapeHtml = (value: unknown) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const rows = fishData.map((fish) => {
  const originalCategory = (fish as typeof fish & { _originalCategory?: string })._originalCategory || fish.category;
  const encyclopediaLifeType = getEncyclopediaLifeType(fish);
  const lifeType = getLifeType(fish);
  const primary = primaryLabelByLifeType[encyclopediaLifeType] || '淡水鱼';
  const secondary = getSecondaryCategory(fish);
  const reviewReason = reviewReasonFor(fish.category, primary, secondary);
  const roleLabel = getSpeciesRoleLabel(fish);
  const englishRoleLabel = getSpeciesRoleLabel(fish, true);
  const taxonomy = getCareTaxonomyPath(fish);
  const filterTags = getSpeciesFilterTags(fish);
  const positioning = getSpeciesPositioning(fish);
  const positioningEn = getSpeciesPositioning(fish, true);
  const violations = [
    reviewReason,
    originalCategory === '珊瑚/海水无脊椎' && (lifeType !== 'coral' || taxonomy.waterType !== '海水')
      ? '来源珊瑚分类被错误改判'
      : '',
    lifeType !== 'fish' && (/小型观赏鱼|群游搭配/.test(roleLabel) || /Small Fish|Schooling Mix/.test(englishRoleLabel))
      ? '非鱼类使用了鱼类角色标签'
      : '',
    lifeType === 'coral' && taxonomy.waterType !== '海水' ? '珊瑚水体类型不是海水' : '',
    lifeType === 'coral' && filterTags.functionTags.includes('小缸适合') ? '珊瑚错误获得小缸适合标签' : '',
    lifeType === 'coral' && filterTags.environmentTags.includes('小缸') ? '珊瑚错误获得小缸环境标签' : '',
    lifeType !== 'fish' && filterTags.functionTags.includes('观赏鱼') ? '非鱼类错误获得观赏鱼标签' : '',
    /\p{Script=Han}/u.test(englishRoleLabel) || /\p{Script=Han}/u.test(positioningEn) ? '英文角色或定位仍包含中文' : '',
  ].filter(Boolean);

  const audit: SpeciesTaxonomyAuditRow = {
    speciesId: fish.id,
    lifeType,
    primaryCategory: primary,
    secondaryCategory: secondary,
    roleLabel,
    waterType: taxonomy.waterType,
    violations,
  };

  return {
    id: audit.speciesId,
    name: fish.name,
    scientificName: fish.scientificName,
    oldCategory: fish.category,
    lifeType: audit.lifeType,
    proposedPrimaryCategory: audit.primaryCategory,
    proposedSecondaryCategory: audit.secondaryCategory,
    roleLabel: audit.roleLabel,
    roleLabelEn: englishRoleLabel,
    positioning,
    positioningEn,
    waterType: audit.waterType,
    functionTags: filterTags.functionTags.join(' · '),
    showInEncyclopedia: ['淡水鱼', '海水鱼', '虾螺蟹', '龟/两栖', '珊瑚/海葵'].includes(primary),
    showInAquariumSettings: ['水草', '硬景/底砂'].includes(primary),
    internalReviewFlag: audit.violations.length > 0,
    internalReviewReason: audit.violations.join('；'),
  };
});

fs.mkdirSync(outputDir, { recursive: true });

const headers = Object.keys(rows[0] || {});
fs.writeFileSync(
  csvPath,
  `${headers.join(',')}\n${rows.map(row => headers.map(header => escapeCsv(row[header as keyof typeof row])).join(',')).join('\n')}\n`,
);

const groupedCounts = rows.reduce<Record<string, number>>((acc, row) => {
  const key = `${row.proposedPrimaryCategory} / ${row.proposedSecondaryCategory}`;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

fs.writeFileSync(htmlPath, `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AquaGuide 物种分类审核表</title>
  <style>
    body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif; background: #f5f7f3; color: #17251f; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    .summary { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 20px; }
    .pill { border: 1px solid #d7ddd7; background: white; padding: 8px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; background: white; font-size: 12px; }
    th, td { border: 1px solid #dfe5df; padding: 8px; text-align: left; vertical-align: top; }
    th { position: sticky; top: 0; background: #173f32; color: white; z-index: 1; }
    tr.review { background: #fff7ed; }
    .muted { color: #6d766f; font-size: 13px; }
  </style>
</head>
<body>
  <h1>AquaGuide 物种分类审核表</h1>
  <p class="muted">用户可见分类只使用正式分类；内部异常只在 internalReviewFlag / internalReviewReason 中记录。</p>
  <div class="summary">
    <span class="pill">总数：${rows.length}</span>
    <span class="pill">图鉴展示：${rows.filter(row => row.showInEncyclopedia).length}</span>
    <span class="pill">鱼缸设置：${rows.filter(row => row.showInAquariumSettings).length}</span>
    <span class="pill">内部需看一眼：${rows.filter(row => row.internalReviewFlag).length}</span>
  </div>
  <div class="summary">
    ${Object.entries(groupedCounts).sort((a, b) => a[0].localeCompare(b[0], 'zh-Hans-CN')).map(([key, count]) => `<span class="pill">${escapeHtml(key)}：${count}</span>`).join('')}
  </div>
  <table>
    <thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
    <tbody>
      ${rows.map(row => `<tr class="${row.internalReviewFlag ? 'review' : ''}">${headers.map(header => `<td>${escapeHtml(row[header as keyof typeof row])}</td>`).join('')}</tr>`).join('\n')}
    </tbody>
  </table>
</body>
</html>
`);

console.log(`Wrote ${csvPath}`);
console.log(`Wrote ${htmlPath}`);
