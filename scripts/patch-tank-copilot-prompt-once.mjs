#!/usr/bin/env node

import fs from 'node:fs';

const path = 'server/index.mjs';
const source = fs.readFileSync(path, 'utf8');

const before = `    '你只能基于 context.goal、context.answers、context.aquariumSummary、context.missingInformation、context.safeCandidates、context.adjustableCandidates 和 context.blockedReasons 工作。',
    '如果缺失信息较多，最多追问 3 个关键问题，不要直接生成确定推荐。',
    '输出必须是合法 JSON，不要 Markdown，不要代码块，不要额外解释。',`;

const after = `    '你只能基于 context.goal、context.answers、context.aquariumSummary、context.missingInformation、context.safeCandidates、context.adjustableCandidates 和 context.blockedReasons 工作。',
    '先把 goal 和 answers 解析成可操作偏好：维护投入、经验水平、观赏风格、目标生物/类群、明确不要的方向；只能使用用户明确表达的信息，不得补写未提供偏好。',
    '如果 context.missingInformation 非空，missingQuestions 必须优先覆盖会阻止可靠推荐的尺寸/容量、水体、水温、过滤等关键事实，recommendedActions 第一项必须是 complete_tank_info。',
    '如果 context.missingInformation 为空，并且 safeCandidates 或 adjustableCandidates 非空，selectedCandidateIds 至少返回 1 个、最多 4 个候选；不能因为目标较宽泛就返回空数组或 restart_goal。',
    'selectedCandidateIds 必须按用户目标匹配度排序，但只能从本地候选池选择，安全性仍完全由本地规则决定。',
    'planSummary 必须点名候选名称与 recommendedQuantity，并说明它们如何匹配用户的维护投入/经验/观赏偏好；不能只写“查看候选”“进入模拟”“再决定下一步”这类流程废话。',
    '如果选择 adjustableCandidates，blockedExplanation 或 planSummary 必须明确写出 requiredAdjustments，不能把“可调整”写成“已安全”。',
    '如果缺失信息较多，最多追问 3 个关键问题，不要直接生成确定推荐。',
    '输出必须是合法 JSON，不要 Markdown，不要代码块，不要额外解释。',`;

if (!source.includes(before)) {
  throw new Error('Tank Copilot prompt anchor not found; refusing blind patch.');
}

const next = source.replace(before, after);
if (next === source) throw new Error('Tank Copilot prompt patch produced no change.');
fs.writeFileSync(path, next);
console.log('Patched Tank Copilot prompt usefulness contract.');
