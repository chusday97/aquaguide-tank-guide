import { readFileSync, writeFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const write = (path, value) => writeFileSync(path, value, 'utf8');
const quote = value => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const replaceExact = (source, from, to, label = from) => {
  if (!source.includes(from)) {
    console.log(`skip: ${label}`);
    return source;
  }
  return source.replace(from, to);
};

const setKeyInBlock = (source, blockName, nextBlockName, key, value) => {
  const startToken = `      ${blockName}: {`;
  const endToken = `      ${nextBlockName}: {`;
  const start = source.indexOf(startToken);
  if (start < 0) throw new Error(`Missing block ${blockName}`);
  const end = source.indexOf(endToken, start + startToken.length);
  if (end < 0) throw new Error(`Missing next block ${nextBlockName} after ${blockName}`);
  const before = source.slice(0, start);
  let block = source.slice(start, end);
  const pattern = new RegExp(`(\\n\\s{8}${key.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}:\\s*)'[^'\\n]*(?:\\\\'[^'\\n]*)*'`);
  if (!pattern.test(block)) {
    console.log(`skip key: ${blockName}.${key}`);
    return source;
  }
  block = block.replace(pattern, `$1${quote(value)}`);
  return before + block + source.slice(end);
};

// ---- i18n: apply approved Chinese cleanup and keep English equivalent in sync ----
{
  const path = 'src/i18n/index.ts';
  let source = read(path);
  const enMarker = '\n  en: {';
  const enIndex = source.indexOf(enMarker);
  if (enIndex < 0) throw new Error('Missing English resource section');
  let zh = source.slice(0, enIndex);
  let en = source.slice(enIndex);

  const applyCommon = (section, values) => {
    let next = section;
    for (const [key, value] of Object.entries(values)) next = setKeyInBlock(next, 'common', 'nav', key, value);
    return next;
  };
  const applySearch = (section, values) => {
    let next = section;
    for (const [key, value] of Object.entries(values)) next = setKeyInBlock(next, 'searchPage', 'settingsPage', key, value);
    return next;
  };
  const applySettings = (section, values) => {
    let next = section;
    for (const [key, value] of Object.entries(values)) next = setKeyInBlock(next, 'settingsPage', 'onboarding', key, value);
    return next;
  };
  const applyOnboarding = (section, values) => {
    let next = section;
    for (const [key, value] of Object.entries(values)) next = setKeyInBlock(next, 'onboarding', 'livestock', key, value);
    return next;
  };
  const applyIdentify = (section, values) => {
    let next = section;
    for (const [key, value] of Object.entries(values)) next = setKeyInBlock(next, 'identify', 'aquarium', key, value);
    return next;
  };
  const applyAquarium = (section, values) => {
    let next = section;
    for (const [key, value] of Object.entries(values)) next = setKeyInBlock(next, 'aquarium', 'encyclopedia', key, value);
    return next;
  };
  const applyEncyclopedia = (section, values) => {
    let next = section;
    for (const [key, value] of Object.entries(values)) next = setKeyInBlock(next, 'encyclopedia', 'care', key, value);
    return next;
  };

  // Keep prior approved Chinese cleanup stable.
  zh = applySearch(zh, {
    subtitle: '',
    suggestionsUnavailable: '搜索建议暂不可用，可直接搜索。',
  });
  zh = applyEncyclopedia(zh, {
    quickFindDesc: '',
    showingEntriesCount: '',
    filteredByCurrentTankDesc: '当前鱼缸结果 · 第 {{current}}/{{total}} 组',
    matchedSpeciesDesc: '找到 {{count}} 种 · 第 {{current}}/{{total}} 组',
    filterSheetSubtitle: '',
    groupCollectionDesc: '{{count}} 个变种可选',
    miniCalcTitle: '混养判断',
    miniCalcHint: '再选择 1 种生物查看结果。',
    continueSelecting: '继续选择',
    fitLabelCol: '是否适合',
    fitPending: '待判断',
    addedToCalcMany: '已选择 {{count}} 种，查看混养结果。',
    addedToCalcSingle: '已选择 {{name}}，可继续添加。',
    removedFromCalc: '已移除 {{name}}。',
    confirmAddDesc: '',
    preCheckLabel: '添加前检查',
    currentTankFit: '适合我的鱼缸吗？',
    sexSummaryPlaceholder: '暂无可靠的性别辨别资料。',
    sexPt3: '',
    reasonLabel: '原因',
    memorialFormSubtitle: '保存后会更新鱼缸记录和生命纪念。',
  });

  // Previous approved Chinese copy already changed; mirror those decisions into English.
  en = applyCommon(en, {
    localDataHint: 'Your data is stored in this browser.',
    loadingHint: '',
    pageError: 'This page is temporarily unavailable',
    renderError: 'This page cannot be displayed right now',
    renderErrorHint: 'Try again or return to My Aquarium.',
  });
  en = applySettings(en, {
    subtitle: '',
    onboardingHint: 'Restart the first-use guide.',
  });
  en = applyOnboarding(en, {
    welcomeSubtitle: 'Choose one goal to start.',
    buildSubtitle: 'Record basic aquarium details for more accurate guidance.',
    browseTitle: 'Browse suitable species',
    browseSubtitle: 'View species and key care needs.',
    taskSubtitle: '',
    completeTitle: 'Basic setup complete',
    completeSubtitle: '',
    showSteps: 'View all steps',
    dismiss: 'Hide for now',
    syncFailed: 'Getting started is saved on this device.',
  });
  en = applyIdentify(en, {
    title: 'Photo identification',
    subtitle: 'Identify the species, then check health risks if needed.',
    progress: '',
    photoHint: 'Keep one clear subject in frame and use an image under 10MB.',
    privacy: 'The image is used only for this identification and the original is not stored.',
    recognizingHint: 'Confirm the species after identification.',
    uploadPreview: 'Image preview',
    confirmHint: 'Choose the species that matches best.',
    manualFallback: 'Identification is temporarily unavailable. You can search for the species manually.',
    cloudNotRecorded: '',
    tankContextReady: 'Current aquarium: {{name}}',
    needTankForCompatibility: 'Select an aquarium to view compatibility results.',
    startHealthTriage: 'Something looks wrong? Check health status',
    healthTriageFishOnly: 'Health checks currently support fish only',
    healthTriageTitle: 'Health status check',
    healthTriageSubtitle: 'Describe the issue and answer a few key questions to see risks and suggested actions.',
    withTank: 'Current aquarium: {{name}}',
    noTankContext: 'No aquarium selected, so the result may be less accurate.',
    describeHint: 'Describe what you observed.',
    noDiagnosisPromise: 'Provides risk guidance only, not a disease diagnosis or automatic medication advice.',
    questionCount: 'Question {{current}} / {{total}}',
    supportingEvidence: 'Why this result',
    missingEvidence: 'Still need to confirm',
    needMoreEvidence: 'There is not enough information yet. Confirm one more detail.',
  });
  en = applyAquarium(en, {
    zoneObserveHint: '',
    zoneManageHint: '',
    zoneLearnHint: '',
    carePlanEmptyHint: 'Add a plan from the Care Guide.',
  });
  en = applySearch(en, {
    subtitle: '',
    suggestionsUnavailable: 'Search suggestions are temporarily unavailable. You can still search directly.',
  });
  en = applyEncyclopedia(en, {
    quickFindDesc: '',
    showingEntriesCount: '',
    filteredByCurrentTankDesc: 'Current aquarium results · Group {{current}}/{{total}}',
    matchedSpeciesDesc: '{{count}} species found · Group {{current}}/{{total}}',
    filterSheetSubtitle: '',
    groupCollectionDesc: '{{count}} variants available',
    miniCalcTitle: 'Compatibility check',
    miniCalcHint: 'Select 1 more species to see the result.',
    continueSelecting: 'Continue selecting',
    fitLabelCol: 'Suitable?',
    fitPending: 'Not checked yet',
    addedToCalcMany: '{{count}} species selected. View compatibility results.',
    addedToCalcSingle: '{{name}} selected. You can add more.',
    removedFromCalc: '{{name}} removed.',
    confirmAddDesc: '',
    preCheckLabel: 'Before adding',
    currentTankFit: 'Is it right for my aquarium?',
    sexSummaryPlaceholder: 'Reliable sex-identification information is not available yet.',
    sexPt3: '',
    reasonLabel: 'Reason',
    memorialFormSubtitle: 'Saving will update the aquarium record and Life Memorial.',
  });

  write(path, zh + en);
}

// ---- Search page: remove redundant branding/subtitle and shorten species action ----
{
  const path = 'src/pages/Search.tsx';
  let source = read(path);
  source = replaceExact(source,
`      <header>\n        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">AquaGuide</p>\n        <h1 className="mt-2 text-2xl font-black text-ink md:text-3xl">{t('searchPage.title')}</h1>\n        <p className="mt-2 text-sm font-semibold leading-6 text-ink/50">{t('searchPage.subtitle')}</p>\n      </header>`,
`      <header>\n        <h1 className="text-2xl font-black text-ink md:text-3xl">{t('searchPage.title')}</h1>\n      </header>`,
  'search header');
  source = replaceExact(source, "{isEn ? 'Select this species' : '选择这个物种'}", "{isEn ? 'Select' : '选择'}", 'search species action');
  write(path, source);
}

// ---- Collection: simplify user-facing copy and hard-stop achievements as coming soon ----
{
  const path = 'src/pages/Collection.tsx';
  let source = read(path);

  source = replaceExact(source,
`            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black text-emerald-800 shadow-sm">\n              <BookHeart className="h-3.5 w-3.5" /> {Boolean(i18n.language?.startsWith('en')) ? 'My Aquaria' : '自然水族册'}\n            </div>\n`, '', 'collection decorative badge');
  source = replaceExact(source,
"      showToast(isEn ? 'This collection item is no longer available.' : '该内容已不存在或已移出水族册。', 'error');",
"      showToast(isEn ? 'This item is no longer available.' : '这条内容已不可用。', 'error');",
'collection missing item');
  source = source.replaceAll("showToast(isEn ? 'Failed to remove, check storage permissions' : '移除失败，请检查浏览器存储权限', 'error');", "showToast(isEn ? 'Could not remove this item. Try again.' : '移除失败，请稍后重试。', 'error');");
  source = replaceExact(source, "fish?.name || (Boolean(i18n.language?.startsWith('en')) ? 'Unrecognized Species' : '未匹配生物')", "fish?.name || (Boolean(i18n.language?.startsWith('en')) ? 'Species information unavailable' : '物种信息不可用')", 'memorial species fallback');
  source = replaceExact(source, "record.reason || (Boolean(i18n.language?.startsWith('en')) ? 'No reflection reason provided' : '尚未填写复盘原因')", "record.reason || (Boolean(i18n.language?.startsWith('en')) ? 'No reason recorded' : '未填写原因')", 'memorial reason fallback');
  source = replaceExact(source,
"Boolean(i18n.language?.startsWith('en')) ? 'When you log a livestock death or removal from its details page, its timeline and reflection info will be preserved here.' : '在物种详情中记录离缸或死亡后，这里会保留时间与复盘信息。'",
"Boolean(i18n.language?.startsWith('en')) ? 'After recording a death or removal, the date and reason will appear here.' : '记录离缸或死亡后，这里会保留日期和原因。'",
'memorial empty description');

  // Disable achievement unlock toasts while the feature is explicitly under construction.
  source = replaceExact(source,
`  useEffect(() => subscribeToCollection(() => {\n    const next = getCollectionSnapshot();\n    const newlyUnlocked = next.achievements.find(item => item.unlocked && !previousUnlockedRef.current.has(item.id));\n    previousUnlockedRef.current = new Set(next.achievements.filter(item => item.unlocked).map(item => item.id));\n    setSnapshot(next);\n    if (newlyUnlocked) showToast(isEn ? \`Unlocked Badge: \${newlyUnlocked.title}\` : \`解锁勋章：\${newlyUnlocked.title}\`);\n  }), [showToast]);`,
`  useEffect(() => subscribeToCollection(() => {\n    setSnapshot(getCollectionSnapshot());\n  }), []);`,
'achievement subscription');

  const achievementStart = source.indexOf("      {activeTab === 'achievements' && (");
  const afterAchievements = source.indexOf("\n\n      {((activeTab === 'wishlist'", achievementStart);
  if (achievementStart < 0 || afterAchievements < 0) throw new Error('Could not locate achievements render block');
  const achievementReplacement = `      {activeTab === 'achievements' && (\n        <section className="rounded-[22px] border border-slate-200 bg-slate-50 p-6 text-slate-500 shadow-none">\n          <div className="flex items-start gap-3">\n            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-slate-100 text-slate-400"><Medal className="h-5 w-5" /></div>\n            <div>\n              <div className="inline-flex rounded-full bg-slate-200/70 px-2.5 py-1 text-[10px] font-black text-slate-500">{isEn ? 'COMING SOON' : '功能建设中'}</div>\n              <h2 className="mt-2 text-[16px] font-black text-slate-600">{isEn ? 'Achievements & Badges' : '成就勋章'}</h2>\n            </div>\n          </div>\n        </section>\n      )}`;
  source = source.slice(0, achievementStart) + achievementReplacement + source.slice(afterAchievements);

  // Do not expose an internal achievement item count on the construction screen.
  source = replaceExact(source,
"        <div className=\"mt-5 inline-flex rounded-full bg-white/75 px-3 py-1.5 text-[11px] font-black text-ink/55 shadow-sm\">{Boolean(i18n.language?.startsWith('en')) ? `Total ${snapshot.counts[activeTab]} item(s)` : `共 ${snapshot.counts[activeTab]} 项`}</div>",
"        {activeTab !== 'achievements' && <div className=\"mt-5 inline-flex rounded-full bg-white/75 px-3 py-1.5 text-[11px] font-black text-ink/55 shadow-sm\">{Boolean(i18n.language?.startsWith('en')) ? `Total ${snapshot.counts[activeTab]} item(s)` : `共 ${snapshot.counts[activeTab]} 项`}</div>}",
'collection count');

  write(path, source);
}

// ---- Memorial detail: shorten method-language and empty-state repetition ----
{
  const path = 'src/pages/MemorialDetail.tsx';
  let source = read(path);
  const pairs = [
    ["isEn ? 'Possible cause recorded' : '已补充可能原因'", "isEn ? 'Reason recorded' : '已记录原因'"],
    ["isEn ? 'Record saved · cause still open' : '已记录 · 原因待补充'", "isEn ? 'Reason not recorded' : '原因待补充'"],
    ["<h2 className=\"mt-2 text-[22px] font-black text-ink\">{isEn ? 'Keep what you learned' : '把这次经验留下来'}</h2>\n", ""],
    ["isEn ? 'Record what you observed, a possible cause, and one change for next time.' : '记录看到的现象、可能原因，以及下次准备改变的一件事。'", "isEn ? 'Record what you observed, a possible reason, and what you would change next time.' : '记录当时现象、可能原因和后续改进。'"],
    ["{isEn ? 'Custom note' : '补充自定义原因'}", "{isEn ? 'Other reason' : '其他原因'}"],
    ["{saving ? (isEn ? 'Saving…' : '保存中…') : (isEn ? 'Save reflection' : '保存复盘')}", "{saving ? (isEn ? 'Saving…' : '保存中…') : (isEn ? 'Save' : '保存')}"],
    ["fallback: isEn ? 'No observation recorded yet.' : '还没有记录当时看到的现象。'", "fallback: isEn ? 'Not recorded' : '未记录'"],
    ["fallback: isEn ? 'No possible cause recorded yet.' : '还没有记录可能原因。'", "fallback: isEn ? 'Not recorded' : '未记录'"],
    ["fallback: isEn ? 'No improvement recorded yet.' : '还没有记录下次准备怎么做。'", "fallback: isEn ? 'Not recorded' : '未记录'"],
    ["                  <span className=\"inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-50 px-4 text-xs font-black text-emerald-800\">\n                    <Check className=\"h-4 w-4\" />{isEn ? 'Reflection supports future care decisions' : '复盘用于改进后续养护'}\n                  </span>\n", ""],
    ["{isEn ? 'Add again' : '再次加入'}", "{isEn ? 'Add this species again' : '重新添加该物种'}"],
    ["isEn ? 'It may have been removed. Return to the memorial list to view the records that are still available.' : '它可能已经被移除。返回生命纪念列表可以查看现有记录。'", "isEn ? 'This record is no longer available.' : '这条记录已不可用。'"],
  ];
  for (const [from, to] of pairs) source = replaceExact(source, from, to);
  write(path, source);
}

console.log('Fifth UI copy audit applied.');
