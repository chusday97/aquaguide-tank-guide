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
assert.deepEqual(new Set(groups.presentation.adjustments),new Set([
  '金三角灯：当前 4 → 至少 8 只/条；补足后重新核对空间与整缸负荷。',
  '红眼灯：当前 4 → 至少 6 只/条；补足后重新核对空间与整缸负荷。',
  '熊猫鼠：当前 3 → 至少 6 只/条；补足后重新核对空间与整缸负荷。',
]));

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
