import assert from 'node:assert/strict';
import { careTopicsData } from '../src/data/careTopicsData';
import { getCareFollowUpAction, getCareReferences, getCareReferenceReviewStatus } from '../src/data/careEvidence';

assert.equal(careTopicsData.length, 41, '养护内容数量变化时必须重新执行全量审核');

const topicRows = careTopicsData.map(topic => {
  const references = getCareReferences(topic);
  assert.ok(topic.firstSteps.length > 0, `${topic.id} 缺少立即动作`);
  assert.ok(getCareFollowUpAction(topic).trim(), `${topic.id} 缺少用户实际可见的唯一下一步`);
  assert.ok(references.length > 0, `${topic.id} 缺少引用来源`);
  assert.ok(references.every(reference => /^https:\/\//.test(reference.url)), `${topic.id} 存在无效来源地址`);
  return {
    id: topic.id,
    status: getCareReferenceReviewStatus(topic),
    references: references.length,
  };
});

const { getIssueGuidance } = await import('../src/pages/CareEncyclopedia');
type StepDiagnosisIssue = Parameters<typeof getIssueGuidance>[0];
const issueTypes: StepDiagnosisIssue[] = [
  'cloudy',
  'gasping',
  'refusal',
  'hiding',
  'aggression',
  'death',
  'shrimpDeath',
  'plantProblem',
];

for (const issue of issueTypes) {
  const guidance = getIssueGuidance(issue, false);
  const combined = [...guidance.routineActions, ...guidance.avoidActions, ...guidance.observeItems].join(' ');
  if (issue !== 'aggression' && issue !== 'hiding') {
    assert.doesNotMatch(combined, /增加.*躲避|增加.*遮挡|躲避区/, `${issue} 错误混入领地/追咬动作`);
  }
  assert.doesNotMatch(combined, /直接.*下药|立即.*药浴|全缸.*杀菌/, `${issue} 包含未经诊断的用药动作`);
}

const dangerousCopy = careTopicsData
  .flatMap(topic => [topic.summary, ...topic.firstSteps, ...topic.avoid, topic.nextStep].map(text => ({ id: topic.id, text })))
  .filter(item => /立即.*药浴|主缸.*杀菌|静置暴晒\s*24\s*小时进行除氯/.test(item.text));
assert.deepEqual(dangerousCopy, [], `仍有高风险或已被纠正的旧操作：${JSON.stringify(dangerousCopy)}`);

const reviewedCount = topicRows.filter(row => row.status === 'reviewed').length;
const draftCount = topicRows.length - reviewedCount;
console.log(`care evidence audit: ${topicRows.length} topics, ${reviewedCount} reviewed, ${draftCount} partly pending review, ${issueTypes.length} issue paths checked`);
