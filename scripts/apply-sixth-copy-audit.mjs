import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const read = path => readFileSync(path, 'utf8');
const write = (path, value) => writeFileSync(path, value, 'utf8');
const quote = value => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const replaceAllSafe = (source, from, to, label = from) => {
  if (!source.includes(from)) {
    console.log(`skip: ${label}`);
    return source;
  }
  return source.split(from).join(to);
};

const replaceOnceSafe = (source, from, to, label = from) => {
  if (!source.includes(from)) {
    console.log(`skip: ${label}`);
    return source;
  }
  return source.replace(from, to);
};

const setKeyInBlock = (source, startToken, endToken, key, value) => {
  const start = source.indexOf(startToken);
  if (start < 0) throw new Error(`Missing block start: ${startToken}`);
  const end = source.indexOf(endToken, start + startToken.length);
  if (end < 0) throw new Error(`Missing block end after ${startToken}`);
  const before = source.slice(0, start);
  let block = source.slice(start, end);
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^(\\s{8}${escapedKey}:\\s*).*$`, 'm');
  if (!pattern.test(block)) {
    console.log(`skip key: ${key}`);
    return source;
  }
  block = block.replace(pattern, `$1${quote(value)},`);
  return before + block + source.slice(end);
};

// ---- i18n: approved Aquarium/Care copy changes, Chinese + English parity ----
{
  const path = 'src/i18n/index.ts';
  let source = read(path);
  const enMarker = '\n  en: {';
  const enIndex = source.indexOf(enMarker);
  if (enIndex < 0) throw new Error('Missing English locale section');
  let zh = source.slice(0, enIndex);
  let en = source.slice(enIndex);

  const aquariumStart = '      aquarium: {';
  const aquariumEnd = '      encyclopedia: {';
  const careStart = '      care: {';
  const careEnd = '\n      },\n    },\n  },';

  const zhAquarium = {
    tankBasicsHint: '',
    advancedTestsHint: '出现异常时，再考虑检测 pH、氨氮和亚硝酸盐。',
    commonOptions: '常用选项',
    heaterDesc: '根据目标水温和室温决定是否开启',
    oxygenDesc: '水面交换不足或饲养密度较高时可考虑开启',
    brackishDescription: '建设中',
    dataSavingTitle: '数据保存',
    dataSavingDetailTitle1: '数据保存在当前浏览器',
    dataSavingDetailDesc1: '鱼缸、养护和收藏记录会保存在当前浏览器。',
    dataSavingDetailDesc2: '更换设备、浏览器或清理浏览器数据后，记录可能丢失。',
    smartDiagnosisDesc: '回答几个问题，查看风险和处理建议。',
    fromCareEncyclopediaDesc: '已带入相关问题，可以直接开始检查。',
    selectProblemTypeDesc: '',
    completeTodayCheckDesc: '按实际情况选择即可。',
    skipHint: '没有也可以，先根据已经观察到的情况判断。',
    aiProcessingHint: '正在补充分析…',
    continueDetailsDesc: '可以补充症状、水质数据或近期操作。',
  };
  const enAquarium = {
    tankBasicsHint: '',
    advancedTestsHint: 'If something looks abnormal, consider checking pH, ammonia and nitrite.',
    commonOptions: 'Common options',
    heaterDesc: 'Use it when the target water temperature requires heating.',
    oxygenDesc: 'Consider it when surface exchange is limited or stocking density is high.',
    brackishDescription: 'Coming soon',
    dataSavingTitle: 'Data storage',
    dataSavingDetailTitle1: 'Data is stored in this browser',
    dataSavingDetailDesc1: 'Aquarium, care and saved-item records are stored in this browser.',
    dataSavingDetailDesc2: 'Records may be lost if you switch devices or browsers, or clear browser data.',
    smartDiagnosisDesc: 'Answer a few questions to see risks and recommended actions.',
    fromCareEncyclopediaDesc: 'The related issue is ready. You can start checking now.',
    selectProblemTypeDesc: '',
    completeTodayCheckDesc: 'Choose what matches what you actually observed.',
    skipHint: 'You can continue with what you have already observed.',
    aiProcessingHint: 'Adding more analysis…',
    continueDetailsDesc: 'You can add symptoms, water data or recent actions.',
  };

  for (const [key, value] of Object.entries(zhAquarium)) zh = setKeyInBlock(zh, aquariumStart, aquariumEnd, key, value);
  for (const [key, value] of Object.entries(enAquarium)) en = setKeyInBlock(en, aquariumStart, aquariumEnd, key, value);
  zh = setKeyInBlock(zh, careStart, careEnd, 'subtitle', '');
  en = setKeyInBlock(en, careStart, careEnd, 'subtitle', '');

  write(path, zh + en);
}

// ---- Aquarium: remove implementation language and simplify actions ----
{
  const path = 'src/pages/Aquarium.tsx';
  let source = read(path);

  source = replaceOnceSafe(source,
    `{isEn ? 'Choose a broad group first, then a specific species. AquaGuide will not guess a strain or variant you did not choose.' : '先选生物大类，再选具体物种；系统不会自动猜测你没有确认的品系或变体。'}`,
    `{isEn ? 'Choose a group, then select a specific species.' : '先选生物大类，再选择具体物种。'}`,
    'add-species defensive helper');
  source = replaceOnceSafe(source,
    `{isEn ? 'Step 2: Confirm Selected Species' : '第 2 步：确认已选生物'}`,
    `{isEn ? 'Confirm selected species' : '确认已选生物'}`,
    'add-species step 2');
  source = replaceOnceSafe(source,
    `{selectedAddSpeciesCount > 0 ? '确认每种生物的数量和入缸日期后再添加。' : '还没有选择生物，请先从上方搜索或推荐中选择。'}`,
    `{selectedAddSpeciesCount > 0 ? (isEn ? 'Confirm quantity and entry date before adding.' : '确认每种生物的数量和入缸日期后再添加。') : (isEn ? 'No species selected yet.' : '还没有选择生物。')}`,
    'add-species selected helper');

  source = replaceAllSafe(source,
    `AI 正在整理你的补充描述；本地风险和处理步骤已先生成。`,
    `正在补充分析…`,
    'daily-check processing');
  source = replaceAllSafe(source,
    `已保存到诊断记录，下次诊断会参考最近记录。`,
    `已保存本次诊断记录。`,
    'diagnosis saved detail');
  source = replaceAllSafe(source,
    `dailyCheckInterpretation.source === 'model' ? 'AI 补充解读' : '本地补充解读'`,
    `'补充解读'`,
    'diagnosis source badge');

  // Copilot: hide implementation provenance and candidate-pool internals.
  source = replaceOnceSafe(source,
`                      <span className={\`shrink-0 rounded-full px-3 py-1 text-[10px] font-black \${
                        tankCopilotResult.source === 'model'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }\`}>
                        {tankCopilotResult.source === 'model' ? '模型回复' : '本地模板'}
                      </span>`,
    '',
    'copilot provenance badge');
  source = replaceAllSafe(source, `本地规则允许`, ``, 'copilot local-rule badge text');
  source = replaceAllSafe(source, `暂无可执行候选`, `暂时没有合适的候选`, 'copilot no candidates title');
  source = replaceAllSafe(source,
    `模型或模板给出的候选没有通过本地规则候选池校验。请重新描述目标，或先完善鱼缸信息。`,
    `暂时没有适合当前鱼缸的推荐。请重新描述目标，或先完善鱼缸信息。`,
    'copilot candidate validation');
  source = replaceAllSafe(source,
    `当前本地规则没有可执行候选，请换一个目标或先完善鱼缸信息。`,
    `暂时没有合适的候选，请换一个目标或先完善鱼缸信息。`,
    'copilot candidate error');
  source = replaceAllSafe(source,
    `本地规则暂时没有可执行候选。换一个更具体的目标，或先完善鱼缸信息。`,
    `暂时没有合适的候选。换一个更具体的目标，或先完善鱼缸信息。`,
    'copilot action description');
  source = replaceAllSafe(source,
    `\`打开 \${tankCopilotAllowedCandidates.length} 个本地规则允许的候选，不写入真实鱼缸。\``,
    `\`查看 \${tankCopilotAllowedCandidates.length} 个适合当前鱼缸的候选。\``,
    'copilot open candidates');
  source = replaceOnceSafe(source,
`                  {!tankCopilotNeedsAnswers && tankCopilotHiddenCandidateCount > 0 && (
                    <div className="rounded-[16px] border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
                      已隐藏 {tankCopilotHiddenCandidateCount} 个未通过本地规则候选池校验的候选。
                    </div>
                  )}
`,
    '',
    'hidden candidate count');
  source = replaceAllSafe(source, `{isEn ? 'Next Step' : '下一步动作'}`, `{isEn ? 'Next step' : '下一步'}`, 'copilot next step');
  source = replaceAllSafe(source, `{isEn ? 'View Not Recommended' : '查看不建议方向'}`, `{isEn ? 'Not recommended' : '不建议'}`, 'copilot blocked directions');
  source = replaceAllSafe(source,
    `输入一个目标后，系统会先用本地规则筛掉不安全方向，再让 AI 组织成可执行方案。`,
    `输入你的目标，获取搭建建议。`,
    'copilot empty helper');
  source = replaceOnceSafe(source,
`              <div className="rounded-[16px] bg-bg px-4 py-3 text-[11px] font-bold leading-relaxed text-ink/45">
                系统结论由规则生成，AI 负责理解目标、解释方案和生成行动建议。
              </div>
`,
    '',
    'copilot architecture note');

  // Smart recommendations: keep actionable facts, remove internal scoring/architecture.
  source = replaceOnceSafe(source,
`            <DialogDescription className="text-xs font-medium leading-relaxed text-ink/55">
              系统规则先筛安全边界，AI 只做解释和排序辅助。
            </DialogDescription>`,
`            <DialogDescription className="sr-only">
              {isEn ? 'Recommendations based on the current aquarium.' : '根据当前鱼缸提供推荐。'}
            </DialogDescription>`,
    'smart recommendation architecture note');
  source = replaceAllSafe(source, `{isEn ? 'Current Tank Profile' : '当前鱼缸画像'}`, `{isEn ? 'Current aquarium' : '当前鱼缸'}`, 'smart profile title');
  source = replaceOnceSafe(source, `                    <span className="rounded-full bg-white px-2.5 py-1 text-accent">负载 {smartRecommendation.profile.load.loadRate}%</span>\n`, '', 'load rate');
  source = replaceOnceSafe(source, `                    <span className="rounded-full bg-white px-2.5 py-1 text-ink/58">剩余 {smartRecommendation.profile.load.remainingCapacity} 负载</span>\n`, '', 'remaining load');
  source = replaceOnceSafe(source, `                    <span className="rounded-full bg-white px-2.5 py-1 text-ink/58">可补水层 {smartRecommendation.profile.availableNiches.length || 0} 个</span>\n`, '', 'niche count');
  source = replaceAllSafe(source, `{isEn ? 'Preference Keywords' : '偏好关键词'}`, `{isEn ? 'What matters to you?' : '你更在意什么？'}`, 'preference label');
  source = replaceAllSafe(source, `推荐前建议先补充：{smartRecommendation.infoRequests.join('、')}。`, `先补充：{smartRecommendation.infoRequests.join('、')}。`, 'smart info request');
  source = replaceAllSafe(source, `{isEn ? 'Empty Tank Preset Plans' : '空缸组合方案'}`, `{isEn ? 'Setup plans' : '搭配方案'}`, 'empty plan title');
  source = replaceAllSafe(source,
    `<div className="mt-3 text-[11px] font-bold text-ink/50">预计负载 {plan.estimatedLoadRate}% · 维护 {plan.maintenanceLevel}</div>`,
    `<div className="mt-3 text-[11px] font-bold text-ink/50">{isEn ? 'Care level' : '养护难度'}：{plan.maintenanceLevel}</div>`,
    'plan estimated load');

  // Entry-to-addition toasts: state the user action, not storage semantics.
  source = replaceOnceSafe(source,
`    showToast(intent === 'record_existing'
      ? (isEn ? \`Pre-selected "\${fish.name}". It will be saved before risk guidance.\` : \`已预选“\${fish.name}”，会先保存现实记录，再显示风险提示\`)
      : (isEn ? \`Pre-selected "\${fish.name}". It will be assessed before recording.\` : \`已预选“\${fish.name}”，会先完成规划判断，不会直接写入鱼缸\`));`,
`    showToast(intent === 'record_existing'
      ? (isEn ? \`Selected "\${fish.name}". Confirm quantity and entry date.\` : \`已选择“\${fish.name}”，请确认数量和入缸日期。\`)
      : (isEn ? \`Selected "\${fish.name}". Review the risk first.\` : \`已选择“\${fish.name}”，请先查看风险。\`));`,
    'preselected species toast');

  // Local-data import must not surface raw exception text.
  source = source.replace(
    /setLocalDataMessage\(error instanceof Error \? error\.message : \(Boolean\(i18n\.language\?\.startsWith\('en'\)\) \? 'Import failed, please check JSON format\.' : '导入失败，请检查 JSON 格式。'\)\);/g,
    `setLocalDataMessage(Boolean(i18n.language?.startsWith('en')) ? 'Import failed. Check the data format and try again.' : '导入失败，请检查数据格式后重试。');`,
  );

  // Globally within Aquarium, never pass raw Error.message straight to a toast.
  source = source.replace(
    /showToast\(\s*error instanceof Error \? error\.message : ([\s\S]*?),\s*'error'\s*\)/g,
    `showToast($1, 'error')`,
  );

  write(path, source);
}

// ---- Care encyclopedia: reduce instructional chrome and rename assessment language ----
{
  const path = 'src/pages/CareEncyclopedia.tsx';
  let source = read(path);

  source = replaceOnceSafe(source,
`            <p className="mt-1 text-[12px] font-medium text-ink/55">{t('care.subtitle')}</p>
`, '', 'mobile care subtitle');
  source = replaceOnceSafe(source,
`              <span className="shrink-0 rounded-full bg-bg px-2.5 py-1 text-[10px] font-black text-ink/42">{activeBannerIndex + 1}/{careRecommendations.length}</span>
`, '', 'recommendation counter');
  source = replaceAllSafe(source, `: '按问题浏览常用养护方法。');`, `: '');`, 'care list subtitle zh');
  source = replaceAllSafe(source, `: 'Browse care guides by topic.')`, `: '')`, 'care list subtitle en');

  source = replaceAllSafe(source, `{isEn ? 'Quick Assessment' : '快速评测'}`, `{isEn ? 'Quick check' : '快速检查'}`, 'quick assessment title');
  source = replaceAllSafe(source, `{isResultStep ? (isEn ? 'Your action plan is ready' : '处理方案已生成')`, `{isResultStep ? (isEn ? 'Recommendations are ready' : '处理建议已生成')`, 'assessment ready');
  source = replaceAllSafe(source, `{isEn ? 'Check Again' : '重新自查'}`, `{isEn ? 'Check again' : '重新检查'}`, 'assessment retry');
  source = replaceAllSafe(source, `(isEn ? 'View Action Plan' : '查看处理方案')`, `(isEn ? 'View recommendations' : '查看处理建议')`, 'view action plan');
  source = replaceAllSafe(source, `{isEn ? 'Assessment complete' : '评测完成'}`, `{isEn ? 'Check complete' : '检查完成'}`, 'assessment complete');
  source = replaceAllSafe(source, `(isEn ? 'Complete these checks first' : '先补充这些检查')`, `(isEn ? 'Confirm these details first' : '先确认这些信息')`, 'assessment unknown heading');

  source = replaceAllSafe(source, `{isEn ? 'One thing to avoid' : '最重要的避坑提醒'}`, `{isEn ? 'Avoid for now' : '暂时不要'}`, 'procedure avoid heading');
  source = replaceAllSafe(source,
    `{meta.guideType === 'careChecklist'\n                        ? (isEn ? 'Care by phase, focusing on stability, observation, and minimal operations.' : '按阶段照料，重点是稳定、观察和少量操作。')\n                        : (isEn ? 'Understand the logic first, then decide whether to operate.' : '先理解原理，再决定是否需要操作。')}`,
    `{''}`,
    'care detail explanatory subtitle');
  source = replaceAllSafe(source, `{isEn ? 'Detailed Description & Analysis' : '详细说明与判断依据'}`, `{isEn ? 'Detailed description' : '详细说明'}`, 'detail analysis heading');

  // Keep source links but remove repetitive visible “Sources/来源” labels.
  source = replaceOnceSafe(source,
`      <span className="text-[9px] font-bold text-ink/38">{isEn ? 'Sources' : '来源'}</span>`,
`      <span className="sr-only">{isEn ? 'Sources' : '来源'}</span>`,
    'inline source label');

  // Raw repository/API exception text must not be shown in toasts here either.
  source = source.replace(
    /showToast\(\s*error instanceof Error \? error\.message : ([\s\S]*?),\s*'error'\s*\)/g,
    `showToast($1, 'error')`,
  );

  write(path, source);
}

// ---- Toast safety net: technical strings never surface as ordinary error UI ----
{
  const path = 'src/components/common/ToastProvider.tsx';
  let source = read(path);
  source = replaceOnceSafe(source,
`const ToastContext = createContext<ToastContextValue | null>(null);
`,
`const ToastContext = createContext<ToastContextValue | null>(null);

const technicalErrorPattern = /(?:stack|trace|http\\s*\\d{3}|status\\s*code|json|unexpected token|syntaxerror|typeerror|referenceerror|fetch failed|networkerror|network request|repository|provider|supabase|postgres|database|sql|api[_ -]?key|oauth|cors|timeout|timed out|ECONN|ENOTFOUND|ERR_|\\b5\\d\\d\\b|\\b4\\d\\d\\b)/i;

const sanitizeToastMessage = (message: string, tone: ToastTone) => {
  const normalized = String(message || '').trim();
  if (tone !== 'error') return normalized;
  if (!normalized || technicalErrorPattern.test(normalized)) {
    return document.documentElement.lang?.toLowerCase().startsWith('en')
      ? 'Something went wrong. Please try again.'
      : '暂时无法完成，请重试。';
  }
  return normalized;
};
`,
    'toast sanitizer helper');
  source = replaceOnceSafe(source,
`  const showToast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = \`${Date.now()}-${Math.random().toString(36).slice(2)}\`;
    setToasts(prev => [...prev.slice(-2), { id, message, tone }]);
`,
`  const showToast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = \`${Date.now()}-${Math.random().toString(36).slice(2)}\`;
    const safeMessage = sanitizeToastMessage(message, tone);
    setToasts(prev => [...prev.slice(-2), { id, message: safeMessage, tone }]);
`,
    'toast sanitizer use');
  write(path, source);
}

// ---- Audit: report remaining raw error.message usage in UI source for manual review ----
{
  const walk = dir => readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) return walk(path);
    return /\\.(tsx|ts)$/.test(path) ? [path] : [];
  });
  const hits = [];
  for (const path of walk('src')) {
    const content = read(path);
    content.split('\n').forEach((line, index) => {
      if (line.includes('error.message') && !path.includes('/services/') && !path.includes('/api/')) {
        hits.push(`${path}:${index + 1}:${line.trim()}`);
      }
    });
  }
  console.log(`Remaining non-service error.message references: ${hits.length}`);
  hits.slice(0, 80).forEach(hit => console.log(`AUDIT ${hit}`));
}

console.log('Sixth UI copy audit applied.');
