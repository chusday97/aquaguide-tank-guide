import fs from 'node:fs';

const enginePath = 'src/lib/speciesFitEngine.ts';
const testPath = 'scripts/test-core-flow-state-eval-v1.ts';
const badcasesPath = 'evaluation/product/badcases.v1.jsonl';

const engine = fs.readFileSync(enginePath, 'utf8');
const before = `  const predator = validLivestock.find(item => (\n    item.species?.temperament === 'Aggressive'\n    || item.species?.size === 'Large'\n    || /掠食|捕食|吞食|大型|龙鱼|雷龙|地图|雀鳝|魟|鳗/i.test(textOf(item.species))\n  ));`;
const after = `  const predator = validLivestock.find(item => {\n    const predatorIdentity = \`${'${item.species.name} ${item.species.category}'}\`;\n    return item.species.temperament === 'Aggressive'\n      || item.species.size === 'Large'\n      || /掠食鱼|肉食鱼|龙鱼|雷龙|地图(?:鱼)?|雀鳝|魟|鳗/i.test(predatorIdentity);\n  });`;
if (!engine.includes(before) && !engine.includes(after)) throw new Error('Predation heuristic patch anchor not found.');
if (engine.includes(before)) {
  const count = engine.split(before).length - 1;
  if (count !== 1) throw new Error(`Expected one predation anchor, found ${count}.`);
  fs.writeFileSync(enginePath, engine.replace(before, after));
}

const testSource = fs.readFileSync(testPath, 'utf8');
const testAnchor = `const incompleteCompatibility = evaluateTankCompatibility({\n  tank: makeTank({ dimensions: undefined, targetTemperature: undefined }), candidateSpecies: freshwater,\n});`;
const regressionCase = `const preyWordingExisting = makeFish({\n  id: 'prey-wording-existing',\n  name: '温和小型鱼',\n  housingReason: '性情温和，但可能被中大型鱼或肉食鱼捕食。',\n});\nconst preyWordingCandidate = makeFish({ id: 'prey-wording-candidate', name: '另一种温和小型鱼' });\nconst preyWordingResult = evaluateTankCompatibility({\n  tank: makeTank(),\n  existingSpecies: [{ species: preyWordingExisting, record: { quantity: 2 } }],\n  candidateSpecies: preyWordingCandidate,\n});\nassert.equal(\n  preyWordingResult.blockingRules.some(item => item.code === 'predation_risk'),\n  false,\n  'prey-risk wording must not be reversed into predator identity',\n);\n\n${testAnchor}`;
if (!testSource.includes(testAnchor) && !testSource.includes("id: 'prey-wording-existing'")) throw new Error('Core-flow regression anchor not found.');
if (testSource.includes(testAnchor) && !testSource.includes("id: 'prey-wording-existing'")) {
  const count = testSource.split(testAnchor).length - 1;
  if (count !== 1) throw new Error(`Expected one test anchor, found ${count}.`);
  fs.writeFileSync(testPath, testSource.replace(testAnchor, regressionCase));
}

let badcases = fs.readFileSync(badcasesPath, 'utf8').trimEnd();
const records = [
  {
    id: 'PUI-BC-021',
    featureId: 'compatibility',
    discoveredAt: '2026-08-13',
    source: 'golden_path_e2e',
    severity: 'high',
    symptom: '真实常见物种混养矩阵首次诊断 132 组中 0 组可进入 compatible/caution 记录路径，GP-002 的安全成功态实际上不可达。',
    trigger: '对常见真实 fishData 组合运行生产 evaluateCompatibilityDecision，并尝试寻找可记录 fixture。',
    expected: '在不降低安全门槛的前提下，至少存在有 reviewed evidence 支持的真实常见组合进入 caution/compatible；证据不足的组合继续保持 insufficient_data。',
    actual: '首次诊断 recordable=0/132；兼容证据仅覆盖少量特殊物种，常见和平物种缺少 reviewed profile/pair evidence。',
    rootCauseLayer: 'knowledge_coverage',
    status: 'investigating',
    regression: 'diagnose-gp002-safe-fixture.ts + verify-golden-path-species-to-stocking.mjs + compatibility evidence audit'
  },
  {
    id: 'PUI-BC-022',
    featureId: 'compatibility',
    discoveredAt: '2026-08-13',
    source: 'golden_path_e2e',
    severity: 'critical',
    symptom: '和平小型鱼也会被判为 predator：系统把 housingReason 中“可能被大型鱼捕食”等猎物风险文本反向识别成捕食者身份，导致 126/132 常见组合被 not_recommended。',
    trigger: '红绿灯作为现有生物、宝莲灯作为候选；两者均 Small/Peaceful 且 reviewed profile 仅含 shoaling。',
    expected: '捕食硬阻断只能来自结构化攻击/体型信号或明确的物种身份，不得把“被捕食/避免大型鱼”之类自然语言建议反向解释。',
    actual: 'getCompatibilityRisk 对整个 textOf(existing) 搜索“捕食|大型”等词，生成 predation_risk：红绿灯被错误视为捕食者。',
    rootCauseLayer: 'rule_engine',
    status: 'fixed',
    regression: 'test-core-flow-state-eval-v1 prey-wording regression + GP-002 fixture matrix + continuous E2E'
  }
];
for (const record of records) {
  if (!badcases.includes(`\"id\":\"${record.id}\"`)) badcases += `\n${JSON.stringify(record)}`;
}
fs.writeFileSync(badcasesPath, `${badcases}\n`);

console.log('Applied GP-002 predation heuristic fix, regression case, and badcases PUI-BC-021/022.');
