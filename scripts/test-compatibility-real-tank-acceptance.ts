import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getCompatibilityPresentation } from '../src/services/compatibility/compatibility-presentation.service';
import type { Aquarium } from '../src/types';

const byId=(id:string)=>{const fish=fishData.find(x=>x.id===id);assert.ok(fish,'missing '+id);return fish;};
const tank=(l:number,w:number,h:number,t:number):Aquarium=>({id:'real-tank',name:'真实混养验收',fishes:[],dimensions:{length:String(l),width:String(w),height:String(h)},waterType:'Freshwater',targetTemperature:String(t),equipment:{filter:'桶滤',heater:true,oxygen:true,light:'普通灯'}});
const run=(aquarium:Aquarium, raw:Array<[string,number]>)=>{
  const decision=evaluateCompatibilityDecision({tank:aquarium,items:raw.map(([id,quantity])=>({species:byId(id),quantity}))});
  return {decision,presentation:getCompatibilityPresentation(decision)};
};

// 1) A normal reviewed community must not become caution merely because one peaceful species is marked prey-vulnerable.
const community=run(tank(120,45,45,24),[['sp_0012',8],['sp_0431',10],['sp_0443',6],['sp_0053',6]]);
assert.equal(community.decision.status,'compatible');
assert.equal(community.presentation.verdict.indicator,'green');
assert.equal(community.decision.warningRules.some(r=>r.code==='predation_vulnerability_context'),false);

// 2) Species with no common temperature window remain a hard red block and show only the blocker action.
const temperature=run(tank(120,50,50,26),[['sp_0434',8],['sp_0447',5],['sp_0443',6]]);
assert.equal(temperature.decision.status,'not_recommended');
assert.match(temperature.presentation.reasons[0],/没有共同的适宜温度区间/);
assert.deepEqual(temperature.presentation.adjustments,['双方已审核适温区间没有可靠重叠；不要靠折中温度硬混，建议更换候选物种。']);

// 3) Exact reviewed Angelfish x Neon predation evidence must dominate a 3-species result.
const angelfish=run(tank(120,50,50,25),[['sp_0446',2],['sp_0431',12],['sp_0443',6]]);
assert.equal(angelfish.decision.status,'not_recommended');
assert.ok(angelfish.decision.blockingRules.some(r=>r.code==='pair_rule_predation_threat'));
assert.equal(angelfish.presentation.reasons.length,1);
assert.match(angelfish.presentation.reasons[0],/神仙鱼.*Neon Tetra|Neon Tetra.*神仙鱼/);
assert.deepEqual(angelfish.presentation.adjustments,['不要与可被吞食的个体同缸；分缸，或更换为体型与捕食关系更合适的室友。']);

// 4) Multiple under-grouped species need one concrete quantity correction per species.
const groups=run(tank(100,40,40,24),[['sp_0062',4],['sp_0468',4],['sp_0443',3]]);
assert.equal(groups.decision.status,'caution');
assert.equal(groups.presentation.adjustments.length,1);
assert.match(groups.presentation.adjustments[0],/金三角灯：当前 4 → 至少 8/);
assert.match(groups.presentation.adjustments[0],/红眼灯：当前 4 → 至少 6/);
assert.match(groups.presentation.adjustments[0],/熊猫鼠：当前 3 → 至少 6/);

// 5) Long-term space pressure remains adjustable, not falsely green or an arbitrary hard block.
const space=run(tank(90,40,40,25),[['sp_0125',1],['sp_0431',10],['sp_0012',8]]);
assert.equal(space.decision.status,'caution');
assert.ok(space.presentation.reasons.some(x=>/120cm|水体低于/.test(x)));
assert.deepEqual(space.presentation.adjustments,['先升级到满足已审核最低缸长/体积的鱼缸；空间未达标前不要继续加入。']);

// 6) Pairwise-safe groups can still become yellow from whole-tank cumulative load; that reason must stay first.
const aggregate=run(tank(60,30,35,25),[['sp_0011',10],['sp_0012',10],['sp_0013',10]]);
assert.equal(aggregate.decision.status,'caution');
assert.match(aggregate.presentation.reasons[0],/负荷/);
assert.ok(aggregate.presentation.adjustments.some(x=>/降低整缸总负荷|升级过滤/.test(x)));

console.log('real tank compatibility acceptance passed: 6 actionable 3-4 species scenarios');

// 7) A six-species reviewed community in a sufficiently large tank must remain green.
const largeCommunity=run(tank(150,50,50,24),[
  ['sp_0012',8],['sp_0431',10],['sp_0443',6],['sp_0053',8],['sp_0468',10],['sp_0013',6],
]);
assert.equal(largeCommunity.decision.pairResults.length,15);
assert.equal(largeCommunity.decision.status,'compatible');
assert.deepEqual(largeCommunity.decision.warningRules,[]);

// 8) When a seven-species tank contains several hard conflicts, direct predation outranks temperature,
// and temperature outranks fin-nipping/territory in the user-facing explanation.
const multiBlocker=run(tank(150,60,60,25),[
  ['sp_0446',2],['sp_0431',12],['sp_0439',8],['sp_0436',8],['sp_0434',8],['sp_0447',5],['sp_0443',6],
]);
assert.equal(multiBlocker.decision.pairResults.length,21);
assert.equal(multiBlocker.decision.status,'not_recommended');
assert.match(multiBlocker.presentation.reasons[0],/神仙鱼.*Neon Tetra|Neon Tetra.*神仙鱼/);
assert.match(multiBlocker.presentation.reasons[1],/没有共同的适宜温度区间/);
assert.match(multiBlocker.presentation.reasons[2],/孔雀鱼.*虎皮|虎皮.*孔雀鱼/);
assert.equal(multiBlocker.presentation.reasons[2].includes('捕食风险实验'),false);
assert.match(multiBlocker.presentation.reasons[2],/直接配对养护资料/);
assert.deepEqual(multiBlocker.presentation.adjustments,[
  '不要与可被吞食的个体同缸；分缸，或更换为体型与捕食关系更合适的室友。',
  '双方已审核适温区间没有可靠重叠；不要靠折中温度硬混，建议更换候选物种。',
  '避免与长鳍、慢游或容易被追咬的鱼搭配；必要时补足群体、扩大空间或分缸。',
]);

// 9) Six simultaneous group deficits must not be truncated by the presentation cap.
const manyGroupGaps=run(tank(90,40,40,24),[
  ['sp_0062',4],['sp_0468',4],['sp_0443',3],['sp_0012',3],['sp_0435',4],['sp_0053',3],
]);
assert.equal(manyGroupGaps.decision.status,'caution');
assert.equal(manyGroupGaps.presentation.adjustments.length,1);
for(const expected of [
  '金三角灯：当前 4 → 至少 8',
  '红眼灯：当前 4 → 至少 6',
  '熊猫鼠：当前 3 → 至少 6',
  '樱桃灯：当前 3 → 至少 6',
  '斑马鱼：当前 4 → 至少 8',
  '精灵鼠：当前 3 → 至少 6',
]) assert.match(manyGroupGaps.presentation.adjustments[0],new RegExp(expected));

// 10) One predator plus five small fish must collapse repeated pair blocks into one clear predation conclusion/action.
const predatorCommunity=run(tank(180,60,60,24),[
  ['sp_0451',1],['sp_0435',10],['sp_0431',10],['sp_0436',8],['sp_0012',8],['sp_0443',6],
]);
assert.equal(predatorCommunity.decision.pairResults.length,15);
assert.equal(predatorCommunity.decision.status,'not_recommended');
assert.equal(predatorCommunity.presentation.reasons.length,1);
assert.match(predatorCommunity.presentation.reasons[0],/捕食|吞食/);
assert.deepEqual(predatorCommunity.presentation.adjustments,['不要与可被吞食的个体同缸；分缸，或更换为体型与捕食关系更合适的室友。']);

// 11) An eight-species tank with a single shared pH boundary must stay concise instead of repeating pairwise edge warnings.
const phEdgeTank=run(tank(180,60,60,24),[
  ['sp_0011',8],['sp_0436',8],['sp_0431',10],['sp_0012',8],['sp_0443',6],['sp_0053',8],['sp_0468',10],['sp_0013',6],
]);
assert.equal(phEdgeTank.decision.pairResults.length,28);
assert.equal(phEdgeTank.decision.status,'caution');
assert.equal(phEdgeTank.presentation.reasons.length,1);
assert.match(phEdgeTank.presentation.reasons[0],/pH.*单一边界值/);
assert.deepEqual(phEdgeTank.presentation.adjustments,['先把 pH 稳定到双方已审核的可重叠范围；若没有可靠重叠，改为分缸或更换物种。']);

console.log('complex real-tank acceptance passed: 5 additional 6-8 species scenarios');
