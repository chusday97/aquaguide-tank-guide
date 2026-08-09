import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/pages/Aquarium.tsx';
let source = readFileSync(path, 'utf8');
const marker = '// AQUAGUIDE_PRODUCT_UX_CLOSURE_V2';

const replaceOnce = (search, replacement, label) => {
  if (!source.includes(search)) throw new Error(`Missing patch target: ${label}`);
  source = source.replace(search, replacement);
};

if (!source.includes(marker)) {
  replaceOnce(
    '// AQUAGUIDE_PRODUCT_UX_CLOSURE_V1',
    `// AQUAGUIDE_PRODUCT_UX_CLOSURE_V1\n${marker}`,
    'v2 marker',
  );

  replaceOnce(
    "  const recommendedFishes = recommendations.slice(0, 6);\n  const addFishList = fishSearchTerm.trim() ? searchResults : recommendedFishes;",
    `  const recommendedFishes = recommendations.slice(0, 6);\n  const addFishCandidatePool = fishData.filter(f => !isAquaticPlantSpecies(f) && !isHardscapeSpecies(f));\n  const categoryFishes = addFishCategory === 'all'\n    ? recommendedFishes\n    : addFishCandidatePool.filter(fish => getAddFishCategory(fish) === addFishCategory).slice(0, 24);\n  const addFishList = fishSearchTerm.trim() ? searchResults : categoryFishes;`,
    'category picker candidate pool',
  );

  replaceOnce(
    "                  const count = category.id === 'all' ? fishData.length : fishData.filter(fish => getAddFishCategory(fish) === category.id).length;",
    "                  const count = category.id === 'all' ? addFishCandidatePool.length : addFishCandidatePool.filter(fish => getAddFishCategory(fish) === category.id).length;",
    'category picker counts',
  );

  replaceOnce(
    "                  setFishSearchTerm('');\n                  setSelectedAddFishItems([]);",
    "                  setFishSearchTerm('');\n                  setAddFishCategory('all');\n                  setSelectedAddFishItems([]);",
    'category reset on close',
  );

  replaceOnce(
    "  const settingsWaterType = settingsForm.waterType || 'Freshwater';",
    "  const settingsWaterType = settingsForm.waterType;",
    'remove implicit freshwater settings default',
  );

  replaceOnce(
    `          <div className="mt-3 grid gap-1.5">\n            <Label className="text-[11px] font-bold text-ink/55">{isEn ? 'Target Temp (°C)' : '目标温度 (°C)'}</Label>`,
    `          <div className="mt-3 grid gap-2">\n            <div className="flex items-center justify-between gap-2">\n              <Label className="text-[11px] font-bold text-ink/55">{isEn ? 'Target Temp (°C)' : '目标温度 (°C)'}</Label>\n              <span className="text-[9px] font-bold text-ink/35">{isEn ? 'Choose a preset or enter your own' : '可点选常用值，也可自定义'}</span>\n            </div>\n            <div className="flex flex-wrap gap-2">\n              {[22, 24, 25, 26, 28].map(temp => (\n                <button\n                  key={temp}\n                  type="button"\n                  onClick={() => setSettingsForm({ ...settingsForm, targetTemperature: String(temp) })}\n                  className={\`min-h-10 rounded-full border px-3 text-[11px] font-black \${settingsForm.targetTemperature === String(temp) ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-border bg-white text-ink/55'}\`}\n                >\n                  {temp}°C\n                </button>\n              ))}\n            </div>`,
    'temperature quick presets',
  );

  replaceOnce(
    "                selected={(settingsForm.equipment?.light || '普通灯') === option}",
    "                selected={settingsForm.equipment?.light === option}",
    'remove guessed lighting selection',
  );

  replaceOnce(
    "                selected={(settingsForm.equipment?.filter || '瀑布过滤') === option}",
    "                selected={settingsForm.equipment?.filter === option}",
    'remove guessed filter selection',
  );

  writeFileSync(path, source, 'utf8');
}

console.log('AquaGuide product UX closure v2 applied.');
