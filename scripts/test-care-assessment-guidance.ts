import assert from 'node:assert/strict';
import { getIssueGuidance, type StepDiagnosisIssue } from '../src/pages/CareEncyclopedia';

const cases: Array<{
  issue: StepDiagnosisIssue;
  firstAction: string;
  firstObservation: string;
  firstAvoid: string;
}> = [
  {
    issue: 'gasping',
    firstAction: '增加水面扰动并确认过滤正常出水',
    firstObservation: '浮头或急促呼吸是否持续',
    firstAvoid: '不要盲目下药',
  },
  {
    issue: 'refusal',
    firstAction: '3 分钟后捞出未吃完的饲料',
    firstObservation: '下一次投喂是否恢复食欲',
    firstAvoid: '不要连续追加不同饲料',
  },
  {
    issue: 'hiding',
    firstAction: '降低灯光并减少打扰 2 小时',
    firstObservation: '弱光后是否离开躲藏处',
    firstAvoid: '不要反复追捞异常鱼只',
  },
  {
    issue: 'aggression',
    firstAction: '确认追咬者和被追咬对象',
    firstObservation: '是否固定追咬同一对象',
    firstAvoid: '不要频繁追捞所有生物',
  },
  {
    issue: 'death',
    firstAction: '移出死亡个体并检查缸内情况',
    firstObservation: '是否再次出现死亡',
    firstAvoid: '急性原因未排查前不要全缸下药',
  },
  {
    issue: 'cloudy',
    firstAction: '检查过滤出水和进水口是否通畅',
    firstObservation: '水体是否继续变浑或发绿',
    firstAvoid: '不要一次性清洗全部滤材',
  },
  {
    issue: 'shrimpDeath',
    firstAction: '移出死亡虾并检查蜕壳情况',
    firstObservation: '虾类是否继续死亡',
    firstAvoid: '不要使用含铜药物或不明除藻剂',
  },
  {
    issue: 'plantProblem',
    firstAction: '剪除严重腐烂的叶片',
    firstObservation: '新叶是否保持健康',
    firstAvoid: '不要同时提高肥料和光照',
  },
];

for (const testCase of cases) {
  const guidance = getIssueGuidance(testCase.issue, false);
  assert.equal(guidance.routineActions[0], testCase.firstAction, `${testCase.issue} 的第一步必须具体且稳定`);
  assert.equal(guidance.observeItems[0], testCase.firstObservation, `${testCase.issue} 的首个复查点必须匹配问题`);
  assert.equal(guidance.avoidActions[0], testCase.firstAvoid, `${testCase.issue} 的首个禁止动作必须匹配风险`);

  const allItems = [...guidance.routineActions, ...guidance.observeItems, ...guidance.avoidActions];
  assert.ok(allItems.every(item => item.trim().length > 0), `${testCase.issue} 不能包含空指引`);
  assert.equal(new Set(allItems).size, allItems.length, `${testCase.issue} 不能重复动作或观察语句`);
}

const cloudy = getIssueGuidance('cloudy', false);
assert.doesNotMatch(
  [...cloudy.routineActions, ...cloudy.avoidActions, ...cloudy.observeItems].join(' '),
  /躲避|遮挡/,
  '水质浑浊不得混入追咬或领地问题的躲避物建议',
);

console.log(`care assessment guidance: ${cases.length} issue-specific contracts passed`);
