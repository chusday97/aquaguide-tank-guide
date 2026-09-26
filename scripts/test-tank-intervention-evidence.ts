import assert from 'node:assert/strict';
import type { DiagnosisRecord } from '../src/modules/diagnosis/diagnosis.types';
import type { TankObservation } from '../packages/domain-rules/src/tank-state';
import {
  buildTankInterventionsFromDiagnosisRecords,
  evaluateTankInterventionEffects,
  summarizeTankInterventionSequence,
} from '../src/services/aquarium/tank-intervention-evidence.service';

const NOW = new Date('2026-09-26T08:00:00.000Z');
const record = (
  id: string,
  createdAt: string,
  answers: Record<string,string>,
  overrides: Partial<DiagnosisRecord> = {},
): DiagnosisRecord => ({
  diagnosisId:id,
  createdAt,
  aquariumId:'tank-action',
  problemType:'巡检',
  answers,
  resultSummary:'结构化记录',
  riskLevel:'低风险',
  suggestedActions:[],
  missingInfo:[],
  followUpNotes:[],
  ...overrides,
});
const obs=(
  code:TankObservation['code'],
  observedAt:string,
  evidence:string=code,
  subjectSpeciesIds?:string[],
  scope?:TankObservation['scope'],
):TankObservation=>({code,observedAt,evidence,subjectSpeciesIds,scope});
const effects=(records:DiagnosisRecord[], observations:TankObservation[])=>{
  const interventions=buildTankInterventionsFromDiagnosisRecords(records,'tank-action',NOW);
  return {interventions,effects:evaluateTankInterventionEffects({interventions,observations,now:NOW})};
};

// 1) A structured completed action is recordable without a DB schema change.
{
  const {interventions}=effects([
    record('a1','2026-09-23T08:00:00.000Z',{interventionType:'增加遮挡',interventionNote:'增加沉木遮挡'}),
  ],[]);
  assert.equal(interventions.length,1);
  assert.equal(interventions[0].type,'add_hiding');
  assert.equal(interventions[0].label,'增加遮挡 / 躲避空间');
}

// 2) Suggested actions are not evidence that the user performed them.
{
  const {interventions}=effects([
    record('a2','2026-09-23T08:00:00.000Z',{}, {suggestedActions:['建议增加遮挡','建议隔离']})
  ],[]);
  assert.deepEqual(interventions,[]);
}

// 3) Free text alone is not promoted to an executed action.
{
  const {interventions}=effects([
    record('a3','2026-09-23T08:00:00.000Z',{userDescription:'我好像增加了遮挡，可能有用'})
  ],[]);
  assert.deepEqual(interventions,[]);
}

// 4) Future action timestamps are ignored until they actually happen.
{
  const {interventions}=effects([
    record('a4','2026-09-23T08:00:00.000Z',{interventionType:'增加遮挡',interventionAt:'2026-09-27T08:00:00.000Z'})
  ],[]);
  assert.deepEqual(interventions,[]);
}

// 5) Two relevant normal confirmations after hiding support a correlation-safe improvement label.
{
  const records=[record('a5','2026-09-23T08:00:00.000Z',{interventionType:'增加遮挡'})];
  const observations=[
    obs('no_persistent_chasing','2026-09-24T08:00:00.000Z','第一次无持续追咬'),
    obs('normal_feeding','2026-09-25T08:00:00.000Z','第二次正常进食'),
  ];
  const {effects:rows}=effects(records,observations);
  assert.equal(rows[0].outcome,'improved_after_action');
  assert.equal(rows[0].normalConfirmationCount,2);
  assert.match(rows[0].summary,/时间先后相关/);
  assert.match(rows[0].summary,/不能据此确认因果关系/);
}

// 6) An abnormal signal after the action means the problem persisted after the action.
{
  const {effects:rows}=effects([
    record('a6','2026-09-23T08:00:00.000Z',{interventionType:'增加遮挡'})
  ],[
    obs('persistent_chasing','2026-09-24T08:00:00.000Z','加遮挡后仍追咬'),
  ]);
  assert.equal(rows[0].outcome,'problem_persisted_after_action');
  assert.match(rows[0].summary,/仍出现/);
}

// 7) Normal and abnormal follow-up together stays mixed, never auto-declared effective.
{
  const {effects:rows}=effects([
    record('a7','2026-09-22T08:00:00.000Z',{interventionType:'临时隔离'})
  ],[
    obs('normal_feeding','2026-09-23T08:00:00.000Z','进食恢复'),
    obs('no_persistent_chasing','2026-09-24T08:00:00.000Z','没有追咬'),
    obs('persistent_chasing','2026-09-25T08:00:00.000Z','重新追咬'),
  ]);
  assert.equal(rows[0].outcome,'mixed_after_action');
  assert.match(rows[0].summary,/结果混合/);
}

// 8) One normal follow-up is not enough to claim improvement.
{
  const {effects:rows}=effects([
    record('a8','2026-09-23T08:00:00.000Z',{interventionType:'分缸'})
  ],[
    obs('normal_activity','2026-09-24T08:00:00.000Z','活动正常'),
  ]);
  assert.equal(rows[0].outcome,'insufficient_followup');
  assert.match(rows[0].summary,/至少 2 次结构化复查/);
}

// 9) Aeration uses respiratory-specific follow-up rather than unrelated behavior signals.
{
  const {effects:rows}=effects([
    record('a9','2026-09-23T08:00:00.000Z',{interventionType:'加强曝气'})
  ],[
    obs('normal_activity','2026-09-24T07:00:00.000Z','活动正常但不等于呼吸恢复'),
    obs('normal_breathing','2026-09-24T08:00:00.000Z','呼吸正常'),
    obs('normal_breathing','2026-09-25T08:00:00.000Z','再次呼吸正常'),
  ]);
  assert.equal(rows[0].outcome,'improved_after_action');
  assert.equal(rows[0].normalConfirmationCount,2);
}

// 10) Same-timestamp diagnosis evidence is not counted as post-action follow-up.
{
  const {effects:rows}=effects([
    record('a10','2026-09-23T08:00:00.000Z',{interventionType:'加强曝气'})
  ],[
    obs('normal_breathing','2026-09-23T08:00:00.000Z','与动作同一时间'),
    obs('normal_breathing','2026-09-24T08:00:00.000Z','动作后第一次复查'),
  ]);
  assert.equal(rows[0].outcome,'insufficient_followup');
  assert.equal(rows[0].normalConfirmationCount,1);
}

console.log('tank intervention evidence passed: 10 action -> follow-up correlation cases');


// 11) A newer intervention closes the earlier action attribution window.
// Later recovery evidence belongs to the newer action window, not both actions.
{
  const records=[
    record('a11-hide','2026-09-22T08:00:00.000Z',{interventionType:'增加遮挡'}),
    record('a11-isolate','2026-09-23T08:00:00.000Z',{interventionType:'临时隔离'}),
  ];
  const observations=[
    obs('normal_feeding','2026-09-24T08:00:00.000Z','隔离后进食正常'),
    obs('no_persistent_chasing','2026-09-25T08:00:00.000Z','隔离后没有追咬'),
  ];
  const {effects:rows}=effects(records,observations);
  assert.equal(rows.length,2);
  assert.equal(rows[0].intervention.type,'add_hiding');
  assert.equal(rows[0].outcome,'insufficient_followup');
  assert.equal(rows[0].followupObservationCount,0);
  assert.equal(rows[0].evaluationWindowEnd,'2026-09-23T08:00:00.000Z');
  assert.equal(rows[1].intervention.type,'temporary_isolation');
  assert.equal(rows[1].outcome,'improved_after_action');
  assert.equal(rows[1].normalConfirmationCount,2);
}

console.log('tank intervention attribution window passed: newer actions stop evidence leakage to earlier actions');


// 12) Earlier action does not control the problem; escalation is followed by improvement.
{
  const records=[
    record('a12-hide','2026-09-20T08:00:00.000Z',{interventionType:'增加遮挡'}),
    record('a12-isolate','2026-09-22T08:00:00.000Z',{interventionType:'临时隔离'}),
  ];
  const observations=[
    obs('persistent_chasing','2026-09-21T08:00:00.000Z','加遮挡后仍追咬'),
    obs('normal_feeding','2026-09-23T08:00:00.000Z','隔离后进食正常'),
    obs('no_persistent_chasing','2026-09-24T08:00:00.000Z','隔离后未再持续追咬'),
  ];
  const {effects:rows}=effects(records,observations);
  assert.deepEqual(rows.map(item=>item.outcome),['problem_persisted_after_action','improved_after_action']);
  const sequence=summarizeTankInterventionSequence(rows);
  assert.equal(sequence?.pattern,'escalated_then_improved');
  assert.match(sequence?.summary || '',/增加遮挡.*仍有异常/);
  assert.match(sequence?.summary || '',/临时隔离.*2 次相关正常复查/);
  assert.match(sequence?.summary || '',/不能证明.*唯一原因/);
}

// 13) Earlier action was followed by improvement, but a later action window contains a relapse.
{
  const records=[
    record('a13-hide','2026-09-19T08:00:00.000Z',{interventionType:'增加遮挡'}),
    record('a13-isolate','2026-09-22T08:00:00.000Z',{interventionType:'临时隔离'}),
  ];
  const observations=[
    obs('normal_feeding','2026-09-20T08:00:00.000Z','加遮挡后进食正常'),
    obs('no_persistent_chasing','2026-09-21T08:00:00.000Z','加遮挡后未追咬'),
    obs('persistent_chasing','2026-09-23T08:00:00.000Z','后续再次追咬'),
  ];
  const {effects:rows}=effects(records,observations);
  assert.deepEqual(rows.map(item=>item.outcome),['improved_after_action','problem_persisted_after_action']);
  const sequence=summarizeTankInterventionSequence(rows);
  assert.equal(sequence?.pattern,'relapsed_after_improvement');
  assert.match(sequence?.summary || '',/曾记录到相关正常复查/);
  assert.match(sequence?.summary || '',/再次出现相关异常/);
}

// 14) Two successive actions both have persistent abnormal follow-up.
{
  const records=[
    record('a14-hide','2026-09-19T08:00:00.000Z',{interventionType:'增加遮挡'}),
    record('a14-isolate','2026-09-22T08:00:00.000Z',{interventionType:'临时隔离'}),
  ];
  const observations=[
    obs('persistent_chasing','2026-09-20T08:00:00.000Z','加遮挡后仍追咬'),
    obs('persistent_chasing','2026-09-23T08:00:00.000Z','隔离后仍追咬'),
  ];
  const {effects:rows}=effects(records,observations);
  assert.deepEqual(rows.map(item=>item.outcome),['problem_persisted_after_action','problem_persisted_after_action']);
  const sequence=summarizeTankInterventionSequence(rows);
  assert.equal(sequence?.pattern,'multiple_actions_not_controlled');
  assert.match(sequence?.summary || '',/增加遮挡/);
  assert.match(sequence?.summary || '',/临时隔离/);
  assert.match(sequence?.nextStep || '',/停止继续重复同一层级/);
}

console.log('tank intervention multi-action sequence passed: escalation, relapse, repeated non-control');


// 15) Structured target provenance is preserved with quantities and conflict pair.
{
  const {interventions}=effects([
    record('a15','2026-09-22T08:00:00.000Z',{
      interventionType:'临时隔离',
      interventionTargetSpeciesIds:'sp_0436',
      interventionTargetQuantities:'4',
      interventionConflictSpeciesIds:'sp_0439,sp_0436',
      interventionReason:'虎皮鱼持续追咬孔雀鱼',
    }),
  ],[]);
  assert.deepEqual(interventions[0].targets,[{speciesId:'sp_0436',quantity:4}]);
  assert.deepEqual(interventions[0].conflictSpeciesIds,['sp_0439','sp_0436']);
  assert.equal(interventions[0].recordedReason,'虎皮鱼持续追咬孔雀鱼');
  assert.equal(interventions[0].targetScope,'species_specific');
}

// 16) A targeted local action cannot borrow normal follow-up from a different species.
{
  const records=[record('a16','2026-09-22T08:00:00.000Z',{
    interventionType:'临时隔离',
    interventionTargetSpeciesIds:'sp_0436',
    interventionTargetQuantities:'4',
  })];
  const observations=[
    obs('normal_feeding','2026-09-23T08:00:00.000Z','红绿灯进食正常',['sp_0431'],'species_specific'),
    obs('no_persistent_chasing','2026-09-24T08:00:00.000Z','红绿灯没有追咬',['sp_0431'],'species_specific'),
  ];
  const {effects:rows}=effects(records,observations);
  assert.equal(rows[0].outcome,'insufficient_followup');
  assert.equal(rows[0].followupObservationCount,0);
}

// 17) The same targeted action can use follow-up for the same target species.
{
  const records=[record('a17','2026-09-22T08:00:00.000Z',{
    interventionType:'临时隔离',
    interventionTargetSpeciesIds:'sp_0436',
    interventionTargetQuantities:'4',
  })];
  const observations=[
    obs('normal_feeding','2026-09-23T08:00:00.000Z','孔雀鱼进食正常',['sp_0436'],'species_specific'),
    obs('no_persistent_chasing','2026-09-24T08:00:00.000Z','孔雀鱼未再被追咬',['sp_0436'],'species_specific'),
  ];
  const {effects:rows}=effects(records,observations);
  assert.equal(rows[0].outcome,'improved_after_action');
  assert.equal(rows[0].normalConfirmationCount,2);
}

// 18) An explicitly whole-tank environmental action still uses whole-tank observations.
{
  const records=[record('a18','2026-09-22T08:00:00.000Z',{
    interventionType:'加强曝气',
    interventionTargetScope:'whole_tank',
  })];
  const observations=[
    obs('normal_breathing','2026-09-23T08:00:00.000Z','全缸呼吸正常',undefined,'whole_tank'),
    obs('normal_breathing','2026-09-24T08:00:00.000Z','全缸再次呼吸正常',undefined,'whole_tank'),
  ];
  const {effects:rows}=effects(records,observations);
  assert.equal(rows[0].outcome,'improved_after_action');
  assert.equal(rows[0].normalConfirmationCount,2);
}

console.log('tank intervention object provenance passed: targets, quantities, conflicts, and scoped follow-up');
