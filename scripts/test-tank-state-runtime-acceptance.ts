import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import type { Aquarium } from '../src/types';
import type { DiagnosisRecord } from '../src/modules/diagnosis/diagnosis.types';
import { deriveCurrentTankState } from '../src/services/aquarium/tank-state-evidence.service';
import {
  buildCurrentTankRiskItems,
  getCurrentTankRiskLevel,
} from '../src/services/aquarium/tank-state-presentation.service';

const NOW = new Date('2026-09-26T08:00:00.000Z');
const species = (id:string) => {
  const found=fishData.find(item=>item.id===id);
  assert.ok(found,`missing species ${id}`);
  return found;
};
const record=(createdAt:string,problemType:string,answers:Record<string,string>,resultSummary='用户结构化记录'):DiagnosisRecord=>({
  diagnosisId:`${createdAt}-${problemType}`,
  createdAt,
  aquariumId:'tank-runtime',
  problemType,
  answers,
  resultSummary,
  riskLevel:'低风险',
  riskCode:'low',
  suggestedActions:[],
  missingInfo:[],
  followUpNotes:[],
});
const aquarium=(items:Array<[string,number]>,overrides:Partial<Aquarium>={}):Aquarium=>({
  id:'tank-runtime',
  name:'运行中混养验收缸',
  waterType:'Freshwater',
  targetTemperature:'25',
  dimensions:{length:'150',width:'50',height:'50'},
  equipment:{filter:'桶滤',heater:true,oxygen:true,light:'普通灯'},
  fishes:items.map(([fishId,quantity],index)=>({id:`stock-${index}`,fishId,quantity,entryDate:'2026-09-01T08:00:00.000Z'})),
  startedAt:'2026-08-01T08:00:00.000Z',
  ...overrides,
});
const run=(tank:Aquarium,records:DiagnosisRecord[])=>{
  const evidence=deriveCurrentTankState({aquarium:tank,speciesCatalog:fishData,diagnosisRecords:records,now:NOW});
  const items=buildCurrentTankRiskItems({aquarium:tank,speciesCatalog:fishData,evidence});
  return {evidence,items};
};
const normal=[record('2026-09-25T08:00:00.000Z','巡检',{breathing:'正常',behavior:'正常游动和进食'})];

// 1) A reviewed red predation pair does not become green/no-action after one normal patrol.
{
  const {evidence,items}=run(aquarium([['sp_0446',2],['sp_0431',12]]),normal);
  assert.equal(evidence.compatibilityDecision?.status,'not_recommended');
  assert.equal(evidence.hardConstraints.length,0,'predation remains an observation-sensitive high prior, not an environmental hard constraint');
  assert.equal(evidence.result.state,'watch');
  assert.equal(evidence.result.primaryAction,'observe');
  assert.match(evidence.result.summary,/不能把一次正常观察当成已经安全/);
  assert.equal(items.length,1);
  assert.equal(items[0].severity,'warning');
  assert.equal(getCurrentTankRiskLevel(evidence),'low');
}

// 2) A reviewed red fin-nipping pair behaves the same: normal now != safe long term.
{
  const {evidence,items}=run(aquarium([['sp_0439',8],['sp_0436',8]]),normal);
  assert.equal(evidence.compatibilityDecision?.status,'not_recommended');
  assert.equal(evidence.result.state,'watch');
  assert.ok(evidence.priors.some(item=>item.level==='high' && item.kind==='aggression'));
  assert.match(items[0]?.nextStep || '',/持续追逐|长期躲藏|摄食受压/);
}

// 3) A genuinely safe reviewed community can still become stable after normal current observations.
{
  const {evidence,items}=run(aquarium([['sp_0012',8],['sp_0431',10],['sp_0443',6]]),normal);
  assert.equal(evidence.compatibilityDecision?.status,'compatible');
  assert.equal(evidence.result.state,'stable');
  assert.equal(evidence.result.primaryAction,'no_action');
  assert.deepEqual(items,[]);
}

// 4) A single chasing observation is still watch, not an automatic forced separation.
{
  const {evidence,items}=run(aquarium([['sp_0439',8],['sp_0436',8]]),[
    record('2026-09-25T08:00:00.000Z','追咬打架',{aggression:'明显追咬'}),
  ]);
  assert.equal(evidence.result.state,'watch');
  assert.ok(evidence.result.activeSignals.includes('persistent_chasing'));
  assert.equal(items[0]?.severity,'warning');
}

// 5) Chasing plus sustained hiding is corroborated current evidence and must trigger adjustment.
{
  const {evidence,items}=run(aquarium([['sp_0439',8],['sp_0436',8]]),[
    record('2026-09-25T08:00:00.000Z','追咬打架',{aggression:'明显追咬'}),
    record('2026-09-25T09:00:00.000Z','躲藏不动',{hiding:'长时间躲藏'}),
  ]);
  assert.equal(evidence.result.state,'intervene');
  assert.ok(evidence.result.activeSignals.includes('persistent_chasing'));
  assert.ok(evidence.result.activeSignals.includes('hiding_pressure'));
  assert.match(items[0]?.title || '',/追咬已造成持续压力/);
  assert.ok(items[0]?.actionSteps.some(step=>/隔离|分缸/.test(step)));
}

// 6) Injury requires an explicit stop-harm action rather than generic "observe more" copy.
{
  const {evidence,items}=run(aquarium([['sp_0439',8],['sp_0436',8]]),[
    record('2026-09-25T08:00:00.000Z','追咬打架',{aggression:'咬伤鳍条'}),
  ]);
  assert.equal(evidence.result.state,'intervene');
  assert.ok(evidence.result.activeSignals.includes('injury'));
  assert.match(items[0]?.title || '',/受伤/);
  assert.match(items[0]?.nextStep || '',/隔离/);
}

// 7) Respiratory distress outranks compatibility and returns concrete aeration/water checks.
{
  const {evidence,items}=run(aquarium([['sp_0012',8],['sp_0431',10],['sp_0443',6]]),[
    record('2026-09-25T08:00:00.000Z','鱼浮头 / 呼吸急促',{gasping:'呼吸明显急促'}),
  ]);
  assert.equal(evidence.compatibilityDecision?.status,'compatible');
  assert.equal(evidence.result.state,'urgent');
  assert.equal(getCurrentTankRiskLevel(evidence),'high');
  assert.match(items[0]?.title || '',/呼吸急促|浮头/);
  assert.ok(items[0]?.actionSteps.some(step=>/曝气|水面扰动/.test(step)));
  assert.ok(items[0]?.actionSteps.some(step=>/水质/.test(step)));
}

// 8) A no-common-temperature combination remains an active current constraint despite normal behavior.
{
  const {evidence,items}=run(aquarium([['sp_0434',8],['sp_0447',5]],{targetTemperature:'25'}),normal);
  assert.equal(evidence.compatibilityDecision?.status,'not_recommended');
  assert.ok(evidence.hardConstraints.some(item=>item.code.includes('temperature')));
  assert.equal(evidence.result.state,'intervene');
  assert.equal(evidence.result.primaryAction,'adjust');
  assert.match(items[0]?.title || '',/水温/);
  assert.match(items[0]?.nextStep || '',/折中水温|分到独立稳定环境/);
}

// 9) An old normal patrol cannot be used as current evidence to clear a reviewed high-risk pair.
{
  const stale=[record('2026-09-10T08:00:00.000Z','巡检',{breathing:'正常',behavior:'正常游动和进食'})];
  const {evidence}=run(aquarium([['sp_0446',2],['sp_0431',12]]),stale);
  assert.equal(evidence.result.state,'watch');
  assert.equal(evidence.result.confidence,'low');
  assert.match(evidence.result.summary,/缺少足够近期现实观察/);
}



// Recovery trajectory: current relapse signals outrank unresolved historical pressure.
{
  const base = [
    record('2026-09-22T08:00:00.000Z','追咬打架',{aggression:'明显追咬'}),
    record('2026-09-22T09:00:00.000Z','躲藏不动',{hiding:'长时间躲藏'}),
  ];
  const oneNormal = [...base, record('2026-09-24T08:00:00.000Z','巡检',{breathing:'正常',behavior:'正常游动和进食'})];
  const twoNormals = [...oneNormal, record('2026-09-25T08:00:00.000Z','巡检',{breathing:'正常',behavior:'正常游动和进食'})];
  const threeNormals = [
    ...base,
    record('2026-09-23T08:00:00.000Z','巡检',{breathing:'正常',behavior:'正常游动和进食'}),
    record('2026-09-24T08:00:00.000Z','巡检',{breathing:'正常',behavior:'正常游动和进食'}),
    record('2026-09-25T08:00:00.000Z','巡检',{breathing:'正常',behavior:'正常游动和进食'}),
  ];
  const tank = aquarium([['sp_0439',8],['sp_0436',8]]);
  const a = run(tank,base).evidence.result;
  const b = run(tank,oneNormal).evidence.result;
  const c = run(tank,twoNormals).evidence.result;
  const d = run(tank,threeNormals).evidence.result;
  const relapse = run(tank,[...threeNormals,record('2026-09-26T07:00:00.000Z','追咬打架',{aggression:'明显追咬'})]).evidence.result;
  assert.equal(a.state,'intervene');
  assert.equal(b.state,'intervene','one normal follow-up is not enough to clear corroborated behavior pressure');
  assert.equal(c.state,'watch');
  assert.ok(c.matchedRules.includes('AQ-STATE-010'));
  assert.equal(d.state,'watch','reviewed high-risk pair remains watch even after three normal confirmations');
  assert.ok(d.matchedRules.includes('AQ-STATE-009'));
  assert.deepEqual(d.recovery,{phase:'confirmed',confirmations:3,targetConfirmations:3,remainingConfirmations:0});
  assert.equal(relapse.state,'watch');
  assert.equal(relapse.confidence,'medium','a new current chase must outrank unresolved historical-pressure fallback');
  assert.ok(relapse.activeSignals.includes('persistent_chasing'));
  assert.ok(relapse.matchedRules.includes('AQ-STATE-006'));
  assert.deepEqual(relapse.recovery,{phase:'confirming',confirmations:0,targetConfirmations:2,remainingConfirmations:2});
}

console.log('Recovery trajectory acceptance passed: intervene -> watch, reviewed risk retained, relapse stays active');

// Intervention evidence integration: executed action + follow-up is visible without claiming causality.
{
  const tank = aquarium([['sp_0439',8],['sp_0436',8]]);
  const records = [
    record('2026-09-22T08:00:00.000Z','追咬打架',{aggression:'明显追咬'}),
    record('2026-09-22T09:00:00.000Z','躲藏不动',{hiding:'长时间躲藏'}),
    record('2026-09-23T08:00:00.000Z','巡检',{interventionType:'增加遮挡',interventionNote:'增加沉木形成视线遮挡'}),
    record('2026-09-24T08:00:00.000Z','巡检',{breathing:'正常',behavior:'正常游动和进食'}),
    record('2026-09-25T08:00:00.000Z','巡检',{breathing:'正常',behavior:'正常游动和进食'}),
  ];
  const {evidence,items}=run(tank,records);
  assert.equal(evidence.interventions.length,1);
  assert.equal(evidence.interventionEffects.length,1);
  assert.equal(evidence.interventionEffects[0].outcome,'improved_after_action');
  assert.match(evidence.interventionEffects[0].summary,/时间先后相关/);
  assert.equal(evidence.interventionEffects[0].summary.includes('导致恢复'),false);
  assert.ok(items[0]?.nextStep.includes('措施记录：'));
  assert.ok(items[0]?.nextStep.includes('时间先后相关'));
}

// Intervention evidence integration: a repeated problem after the action must remain visible as not controlled.
{
  const tank = aquarium([['sp_0439',8],['sp_0436',8]]);
  const records = [
    record('2026-09-22T08:00:00.000Z','追咬打架',{aggression:'明显追咬'}),
    record('2026-09-23T08:00:00.000Z','巡检',{interventionType:'增加遮挡'}),
    record('2026-09-24T08:00:00.000Z','追咬打架',{aggression:'明显追咬'}),
    record('2026-09-24T09:00:00.000Z','躲藏不动',{hiding:'长时间躲藏',chasing:'明显追咬'}),
  ];
  const {evidence,items}=run(tank,records);
  assert.equal(evidence.result.state,'intervene');
  assert.equal(evidence.interventionEffects[0].outcome,'problem_persisted_after_action');
  assert.match(items[0]?.nextStep || '',/措施后复查/);
  assert.match(items[0]?.nextStep || '',/没有足够证据认为该措施已经控制住问题/);
}

console.log('Intervention evidence integration passed: action-followup association is visible and causality-safe');


// Intervention presentation outcomes: every effect state must tell the user what to do next.
{
  const tank = aquarium([['sp_0439',8],['sp_0436',8]]);
  const base = [record('2026-09-22T08:00:00.000Z','追咬打架',{aggression:'明显追咬'})];

  const insufficient = run(tank,[
    ...base,
    record('2026-09-23T08:00:00.000Z','巡检',{interventionType:'增加遮挡'}),
    record('2026-09-24T08:00:00.000Z','巡检',{behavior:'正常游动和进食'}),
  ]);
  assert.equal(insufficient.evidence.interventionEffects[0].outcome,'insufficient_followup');
  assert.match(insufficient.items[0]?.nextStep || '',/至少 2 次结构化复查/);

  const mixed = run(tank,[
    ...base,
    record('2026-09-23T08:00:00.000Z','巡检',{interventionType:'临时隔离'}),
    record('2026-09-24T08:00:00.000Z','巡检',{behavior:'正常游动和进食'}),
    record('2026-09-25T08:00:00.000Z','巡检',{behavior:'正常游动和进食'}),
    record('2026-09-26T07:00:00.000Z','追咬打架',{aggression:'明显追咬'}),
  ]);
  assert.equal(mixed.evidence.interventionEffects[0].outcome,'mixed_after_action');
  assert.match(mixed.items[0]?.nextStep || '',/证据不足以判断.*是否伴随持续改善/);
}

console.log('Intervention presentation outcomes passed: follow-up guidance is actionable and causality-safe');
