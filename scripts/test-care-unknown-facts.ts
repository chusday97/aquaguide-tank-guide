import fs from 'node:fs';

const source = fs.readFileSync('src/pages/CareEncyclopedia.tsx', 'utf8');

const required = [
  "Volume unknown",
  "容量未记录",
  "Water type unknown",
  "水体类型未记录",
  "Target temp unknown",
  "目标水温未记录",
  'formatTankVolumeFact(aquarium, true)',
  'formatWaterTypeFact(aquarium, true)',
  'formatTargetTemperatureFact(aquarium, true)',
  'formatTankVolumeFact(activeAquarium, true)',
  'formatTargetTemperatureFact(activeAquarium, true)',
  'formatWaterTypeFact(activeAquarium, true)',
  'Number.isFinite(value) && value > 0',
];

for (const snippet of required) {
  if (!source.includes(snippet)) throw new Error(`Care unknown-facts contract missing: ${snippet}`);
}

const forbidden = [
  'targetTemperature || 25',
  "aquarium.waterType === 'Saltwater' ? 'Saltwater' : 'Freshwater'",
  "aquarium.waterType === 'Saltwater' ? '海水' : '淡水'",
  '`Water volume: ~${volumeLiters}L',
  '`当前水体：约 ${volumeLiters}L',
];

for (const snippet of forbidden) {
  if (source.includes(snippet)) throw new Error(`Care still fabricates an unknown fact: ${snippet}`);
}

console.log('Care unknown-facts contract passed');
