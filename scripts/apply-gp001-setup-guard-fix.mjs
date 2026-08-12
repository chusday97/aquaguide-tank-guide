import fs from 'node:fs';

const aquariumPath = 'src/pages/Aquarium.tsx';
const badcasesPath = 'evaluation/product/badcases.v1.jsonl';

let source = fs.readFileSync(aquariumPath, 'utf8');
const importBefore = `import { createAquariumDraft, getAquariumSetupStatus, normalizeAquariumRecord } from '../services/aquarium/aquarium-setup.service';`;
const importAfter = `import { createAquariumDraft, getAquariumAiReadiness, getAquariumSetupStatus, normalizeAquariumRecord } from '../services/aquarium/aquarium-setup.service';`;
if (source.includes(importBefore)) source = source.replace(importBefore, importAfter);
else if (!source.includes(importAfter)) throw new Error('Aquarium setup import anchor not found.');

const saveBefore = `<Button onClick={() => {\n              const updated = aquariums.map(a => a.id === activeId ? { ...a, ...settingsForm } : a);\n              saveAquariums(updated);`;
const saveAfter = `<Button onClick={() => {\n              const nextAquarium = { ...activeAquarium, ...settingsForm };\n              const readiness = getAquariumAiReadiness(nextAquarium);\n              if (!readiness.ready) {\n                const firstPanel = readiness.firstPanel || 'size';\n                setActiveSettingsPanel(firstPanel);\n                window.requestAnimationFrame(() => {\n                  settingPanelRefs.current[firstPanel]?.scrollIntoView({ block: 'start', behavior: 'smooth' });\n                });\n                showToast(\n                  isEn\n                    ? \`Complete these tank facts first: \${readiness.missing.map(item => item.label).join(', ')}\`\n                    : \`还缺：\${readiness.missing.map(item => item.label).join('、')}\`,\n                  'error',\n                );\n                return;\n              }\n              const updated = aquariums.map(a => a.id === activeId ? nextAquarium : a);\n              saveAquariums(updated);`;
if (source.includes(saveBefore)) {
  const count = source.split(saveBefore).length - 1;
  if (count !== 1) throw new Error(`Expected one settings save anchor, found ${count}.`);
  source = source.replace(saveBefore, saveAfter);
} else if (!source.includes('const readiness = getAquariumAiReadiness(nextAquarium);')) {
  throw new Error('Settings save patch anchor not found.');
}
fs.writeFileSync(aquariumPath, source);

let badcases = fs.readFileSync(badcasesPath, 'utf8').trimEnd();
const id = 'PUI-BC-023';
if (!badcases.includes(`\"id\":\"${id}\"`)) {
  badcases += `\n${JSON.stringify({
    id,
    featureId: 'aquarium_setup',
    discoveredAt: '2026-08-13',
    source: 'golden_path_e2e',
    severity: 'high',
    symptom: '新用户创建空鱼缸后进入设置，不填写任何必要参数也能点击保存；Surface 关闭且 onboarding 会把 aquariumConfigured 标为 true。',
    trigger: 'Welcome → 开始建缸 → 创建真实空鱼缸 → 建立或完善鱼缸 → 不填写尺寸/水体/温度/过滤 → 点击保存设置。',
    expected: '缺少必要事实时保持设置任务打开，明确指出缺什么并定位到首个缺失分区；不写入鱼缸，不推进 onboarding。过滤=无仍算显式回答。',
    actual: '保存 handler 无完整性 guard，直接 saveAquariums、markAquariumConfigured 并关闭设置 Surface。',
    rootCauseLayer: 'task_state_guard',
    status: 'fixed',
    regression: 'test:golden-path-gp001-ui + aquarium_setup missing-context state'
  })}`;
}
fs.writeFileSync(badcasesPath, `${badcases}\n`);

console.log('Applied GP-001 required-setup guard and registered PUI-BC-023.');
