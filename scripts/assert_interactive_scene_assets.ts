import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { fishData } from '../src/data/fishData';
import { getSpeciesVisualSources } from '../src/lib/speciesVisual';
import { getLifeType } from '../src/modules/species/species.service';

const sceneCandidates = fishData.filter(fish => {
  const lifeType = getLifeType(fish);
  return lifeType !== 'plant' && lifeType !== 'hardscape' && Boolean(fish.image?.trim());
});

assert.ok(sceneCandidates.length >= 6, '互动场景至少需要六个可用物种');

for (const fish of sceneCandidates) {
  const source = getSpeciesVisualSources(fish).texture.split('?')[0];
  assert.ok(source.startsWith('/'), `${fish.id} 的场景资源必须是本地可验证路径`);
  const file = resolve(process.cwd(), `public${source}`);
  assert.ok(existsSync(file), `${fish.id} 的场景资源不存在：${source}`);
  const image = sharp(file, { animated: false });
  const metadata = await image.metadata();
  assert.ok(metadata.hasAlpha, `${fish.id} 的场景资源必须包含 Alpha 通道`);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const corners = [
    3,
    ((info.width - 1) * 4) + 3,
    ((info.height - 1) * info.width * 4) + 3,
    ((info.height * info.width - 1) * 4) + 3,
  ];
  assert.ok(corners.every(index => data[index] === 0), `${fish.id} 的四角必须透明`);
}

console.log(`Interactive scene asset alpha checks passed for ${sceneCandidates.length} species.`);
