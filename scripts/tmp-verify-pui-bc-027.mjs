import fs from 'node:fs';

const path = 'evaluation/product/badcases.v1.jsonl';
const raw = fs.readFileSync(path, 'utf8').trim();
const rows = raw.split('\n').map((line, index) => {
  try { return JSON.parse(line); } catch (error) { throw new Error(`Invalid JSONL at line ${index + 1}: ${error.message}`); }
});

const target = rows.filter(row => row.id === 'PUI-BC-027');
if (target.length !== 1) throw new Error(`Expected exactly one PUI-BC-027, found ${target.length}`);
if (target[0].status !== 'investigating') throw new Error(`PUI-BC-027 status drifted to ${target[0].status}`);

const coverage = rows.filter(row => row.id === 'PUI-BC-025');
if (coverage.length !== 1) throw new Error(`Expected exactly one PUI-BC-025, found ${coverage.length}`);
if (coverage[0].status !== 'investigating') throw new Error(`PUI-BC-025 must remain investigating, found ${coverage[0].status}`);

Object.assign(target[0], {
  status: 'regression_verified',
  regression: '#552 Product Golden Path on head bdac21ffd19aae7d12dbe31bd3aa8a19be83db58：18 features / 108 states / 27 Badcases；direct 地图鱼 sp_0451 + 斑马鱼 sp_0435 = not_recommended；basis=pair_rule、reviewed、保留 peer-reviewed citations，direct evidence 不再被标成“并非直接配对实验”，且保留“实验条件不等于家庭水族箱长期同缸”限制；7 reviewed profiles / 3 pair rules / priority recordable=2 / statuses=108 insufficient_data,22 not_recommended,2 caution；typecheck/build/GP-001～GP-005 全 PASS。',
});

fs.writeFileSync(path, `${rows.map(row => JSON.stringify(row)).join('\n')}\n`);
console.log('PUI-BC-027 promoted to regression_verified; PUI-BC-025 remains investigating');
