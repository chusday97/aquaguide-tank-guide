import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const write = (path, value) => fs.writeFileSync(path, value);
const replaceRequired = (source, from, to, label = from) => {
  if (!source.includes(from)) throw new Error(`Missing required copy target: ${label}`);
  return source.split(from).join(to);
};
const replaceOptional = (source, from, to) => source.includes(from) ? source.split(from).join(to) : source;

// 1) Construction-state dialog: one status badge, future capability copy only.
{
  const path = 'src/components/layout/WorkspaceNavigationProvider.tsx';
  let s = read(path);
  const pairs = [
    ["title: isEn ? 'Cloud sync is coming' : '云端同步 · 建设中',", "title: isEn ? 'Cloud sync' : '云端同步',"],
    ["description: isEn ? 'Sign in will sync tanks and care records across devices.' : '登录后可跨设备同步鱼缸和养护记录。',", "description: isEn ? 'Sync aquariums and care records across devices.' : '跨设备同步鱼缸和养护记录。',"],
    ["title: isEn ? 'Achievements are coming' : '成就勋章 · 建设中',", "title: isEn ? 'Achievements' : '成就勋章',"],
    ["description: isEn ? 'Track long-term care milestones.' : '记录你的养护里程碑。',", "description: isEn ? 'Track long-term care milestones.' : '记录长期养护里程碑。',"],
    ["title: isEn ? 'Sharing is coming' : '分享功能 · 建设中',", "title: isEn ? 'Sharing & privacy' : '分享与隐私',"],
    ["description: isEn ? 'Share links and privacy controls are being completed.' : '分享链接与隐私管理正在完善。',", "description: isEn ? 'Manage share links and privacy settings.' : '管理分享链接和隐私设置。',"],
    ["title: isEn ? 'Image export is coming' : '图片导出 · 建设中',", "title: isEn ? 'Image export' : '图片导出',"],
    ["description: isEn ? 'Saving generated cards as images is being completed.' : '图片保存与导出功能正在完善。',", "description: isEn ? 'Save cards as images.' : '将卡片保存为图片。',"],
    ["{isEnglishUi() ? 'Got it' : '我知道了'}", "{isEnglishUi() ? 'Close' : '关闭'}"],
    ["showToast('目标内容暂不可用，请稍后重试', 'error');", "showToast(isEnglishUi() ? 'Unable to open this right now. Please try again later.' : '暂时无法打开，请稍后再试。', 'error');"],
  ];
  for (const [from, to] of pairs) s = replaceRequired(s, from, to);
  write(path, s);
}

// 2) Collection hub: restore approved product copy and remove decorative/meta text.
{
  const path = 'src/pages/CollectionHub.tsx';
  let s = read(path);
  s = replaceRequired(s,
`      <header className="px-1 py-1">\n        <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-800">\n          <BookHeart className="h-3.5 w-3.5" /> {isEn ? 'Aqua Collection' : '自然水族册'}\n        </div>\n        <h1 className="mt-2 text-[25px] font-black tracking-tight text-ink">{isEn ? 'My Collection' : '我的水族册'}</h1>\n        <p className="mt-1 text-[12px] font-bold text-ink/48">{isEn ? 'Wishlist · Care · Memorials · Badges' : '种草 · 养护 · 纪念 · 勋章'}</p>\n      </header>`,
`      <header className="px-1 py-1">\n        <h1 className="text-[25px] font-black tracking-tight text-ink">{isEn ? 'My Collection' : '我的水族册'}</h1>\n        <p className="mt-1 text-[12px] font-bold text-ink/48">{isEn ? 'Wishlist · Care · Memorials' : '种草 · 养护 · 纪念'}</p>\n      </header>`, 'collection header');
  s = replaceRequired(s, "{fish?.name || (isEn ? 'Unrecognized species' : '未匹配生物')}", "{fish?.name || (isEn ? 'Species unavailable' : '物种信息不可用')}");
  s = replaceRequired(s, "{record.reason ? (isEn ? 'Reflected' : '已复盘') : (isEn ? 'Reason needed' : '待补充原因')}", "{record.reason ? (isEn ? 'Reason recorded' : '已记录原因') : (isEn ? 'Reason needed' : '原因待补充')}");
  s = replaceRequired(s, "description={isEn ? 'Memorial records preserve dates and care reflections.' : '生命纪念会保留日期和养护复盘。'}", "description={isEn ? 'After recording a departure or death, the date and reason are kept here.' : '记录离缸或死亡后，这里会保留日期和原因。'}");
  s = replaceRequired(s, "title={isEn ? 'Achievements are coming' : '成就勋章 · 建设中'}", "title={isEn ? 'Not available yet' : '暂未开放'}");
  write(path, s);
}

// 3) Generic result card: remove brand chrome; make labels user-facing.
{
  const path = 'src/components/visual-result/VisualResultCard.tsx';
  let s = read(path);
  s = replaceRequired(s, '            <div className="text-[11px] font-black uppercase tracking-[0.08em] text-emerald-800/65">AquaGuide</div>\n', '');
  write(path, s);
}

// 4) i18n microcopy and terminology fixes (Chinese + English).
{
  const path = 'src/i18n/index.ts';
  let s = read(path);
  const pairs = [
    ["achievementsDescription: '自动解锁与下一步'", "achievementsDescription: '建设中'"],
    ["relationshipTitle: '重点对象与影响关系'", "relationshipTitle: '重点情况'"],
    ["focus: '当前关注'", "focus: '重点'"],
    ["noSubject: '暂无可视化对象'", "noSubject: '暂无相关对象'"],
    ["expandDetails: '展开具体判断依据 · {{count}} 项'", "expandDetails: '查看判断依据 · {{count}} 项'"],
    ["collapseDetails: '收起具体判断依据'", "collapseDetails: '收起判断依据'"],
    ["confidence: { high: '图像特征较明确', medium: '图像特征一般', low: '图像特征不足' }", "confidence: { high: '识别把握较高', medium: '识别把握一般', low: '识别把握较低' }"],
    ["viewCurrentResult: '提前查看当前结果'", "viewCurrentResult: '查看当前判断'"],
    ["waterType: '水质'", "waterType: '水体'"],
    ["phWarning: '酸碱度不匹配：物种适温 pH {{range}}，当前鱼缸设定 pH {{current}}。'", "phWarning: '酸碱度不匹配：物种适宜 pH {{range}}，当前鱼缸设定 pH {{current}}。'"],
    ["housingBehaviorMatch: '社会行为兼容。'", "housingBehaviorMatch: '性情与混养基本匹配。'"],
    ["difficultyHard: '骨灰级'", "difficultyHard: '高难度'"],
    ["expertLabel: '骨灰级玩家'", "expertLabel: '经验丰富'"],
    ["feedingCare: '喚养与养护'", "feedingCare: '喂养与养护'"],
    ["feedingSection: '喚食'", "feedingSection: '喂食'"],
    ["entryDate: '入缸日期：今天 · 默认数量可在我的鱼缸中调整'", "entryDate: '入缸日期：今天'"],
    ["addToCalculatorBtn: '选择计算'", "addToCalculatorBtn: '加入混养判断'"],
    ["goToCalcBtn: '去计算'", "goToCalcBtn: '查看混养'"],
    ["fitGroupAdded: '选择该变种计算'", "fitGroupAdded: '选择该变种'"],
    ["fitGroupAlreadyAdded: '已加入计算'", "fitGroupAlreadyAdded: '已选择'"],
    ["secondConfirmWarning: '请再次确认：我已了解风险，仍要谨慎加入。'", "secondConfirmWarning: '当前组合存在风险，确认后仍会加入鱼缸。'"],
    // English alignment
    ["achievementsDescription: 'Auto unlock & next steps'", "achievementsDescription: 'Coming soon'"],
    ["relationshipTitle: 'Key Subjects & Relationships'", "relationshipTitle: 'Key situation'"],
    ["focus: 'Current Focus'", "focus: 'Focus'"],
    ["noSubject: 'No visual subjects'", "noSubject: 'No related subjects'"],
    ["expandDetails: 'Expand Detailed Evidence · {{count}} items'", "expandDetails: 'View evidence · {{count}} items'"],
    ["collapseDetails: 'Collapse Detailed Evidence'", "collapseDetails: 'Hide evidence'"],
    ["viewCurrentResult: 'View current result early'", "viewCurrentResult: 'View current assessment'"],
    ["entryDate: 'Entry date: Today · Quantity can be adjusted in My Aquarium.'", "entryDate: 'Entry date: Today'"],
    ["addToCalculatorBtn: 'Add to Calc'", "addToCalculatorBtn: 'Add to compatibility check'"],
    ["goToCalcBtn: 'Go to Calculator'", "goToCalcBtn: 'View compatibility'"],
    ["fitGroupAdded: 'Add This Variant'", "fitGroupAdded: 'Select this variant'"],
    ["fitGroupAlreadyAdded: 'Added to Calculator'", "fitGroupAlreadyAdded: 'Selected'"],
    ["secondConfirmWarning: 'Confirm again: I understand the risks and will add with caution.'", "secondConfirmWarning: 'This combination has risks. Confirming will still add it to the aquarium.'"],
  ];
  for (const [from, to] of pairs) s = replaceOptional(s, from, to);
  write(path, s);
}

// 5) Identify: keep confidence, remove database-match jargon and negative status badges.
{
  const path = 'src/pages/Identify.tsx';
  let s = read(path);
  s = replaceRequired(s,
    "<div className=\"mt-2 text-[10px] font-bold text-ink/50\">{t(`identify.confidence.${candidate.confidenceBand}`)} · {t(`identify.match.${candidate.matchType}`)}</div>",
    "<div className=\"mt-2 text-[10px] font-bold text-ink/50\">{t(`identify.confidence.${candidate.confidenceBand}`)}</div>",
    'identify candidate metadata');
  s = replaceRequired(s,
    "                <p className=\"text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700\">{t('identify.identificationResult')}</p>\n",
    '', 'identification result eyebrow');
  s = replaceRequired(s,
`                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">\n                  <span className="rounded-full bg-bg px-3 py-1.5 text-ink/58">{selectedFish.category}</span>\n                  <span className="rounded-full bg-bg px-3 py-1.5 text-ink/58">{selectedRecognitionCandidate ? t(\`identify.confidence.\${selectedRecognitionCandidate.confidenceBand}\`) : t('identify.manualConfirmed')}</span>\n                  <span className="rounded-full bg-bg px-3 py-1.5 text-ink/58">{aquarium?.fishes.some(item => item.fishId === selectedFish.id) ? t('identify.alreadyInTank') : t('identify.notInTank')}</span>\n                  <span className="rounded-full bg-bg px-3 py-1.5 text-ink/58">{getSpeciesFavoriteIds().includes(selectedFish.id) ? t('identify.alreadySaved') : t('identify.notSaved')}</span>\n                </div>`,
`                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">\n                  <span className="rounded-full bg-bg px-3 py-1.5 text-ink/58">{selectedFish.category}</span>\n                  {selectedRecognitionCandidate && <span className="rounded-full bg-bg px-3 py-1.5 text-ink/58">{t(\`identify.confidence.\${selectedRecognitionCandidate.confidenceBand}\`)}</span>}\n                  {aquarium?.fishes.some(item => item.fishId === selectedFish.id) && <span className="rounded-full bg-bg px-3 py-1.5 text-ink/58">{t('identify.alreadyInTank')}</span>}\n                  {getSpeciesFavoriteIds().includes(selectedFish.id) && <span className="rounded-full bg-bg px-3 py-1.5 text-ink/58">{t('identify.alreadySaved')}</span>}\n                </div>`, 'confirmed result badges');
  s = replaceRequired(s, "'展开证据与建议'", "'查看依据与建议'");
  s = replaceRequired(s, "'不一致的事实'", "'不支持该判断的信息'");
  s = replaceRequired(s,
    "<div><strong className=\"text-ink\">{t('identify.missingEvidence')}</strong>{hypothesis.missingEvidence.length > 0 ? hypothesis.missingEvidence.map(item => <p key={item}>{item}</p>) : <p>{Boolean(i18n.language?.startsWith('en')) ? 'No key evidence is currently missing.' : isEn ? 'No key evidence is currently missing.' : '当前没有缺失的关键项。'}</p>}</div>",
    "{hypothesis.missingEvidence.length > 0 && <div><strong className=\"text-ink\">{t('identify.missingEvidence')}</strong>{hypothesis.missingEvidence.map(item => <p key={item}>{item}</p>)}</div>}",
    'empty missing evidence block');
  write(path, s);
}

// 6) Aquarium action-card microcopy.
{
  const path = 'src/pages/Aquarium.tsx';
  let s = read(path);
  const pairs = [
    ["'当前只保留一个最该做的动作。'", "'下一步可以添加生物。'"],
    ["description: isEn ? 'Save what is already in the tank' : '先保存现实情况，再看风险'", "description: isEn ? 'Record what is already in the aquarium' : '记录鱼缸里已经有的生物'"],
    ["description: isEn ? 'Assess before an actual addition' : '先判断，不直接写入鱼缸'", "description: isEn ? 'Review risks before adding' : '查看加入前的风险'"],
    ["description: isEn ? 'History Logs' : '养护历史'", "description: isEn ? 'Feeding, water-change and check records' : '查看喂食、换水和检查记录'"],
    ["description: isEn ? (waterChangedToday ? 'Recorded Today' : 'Update Change Cycle') : (waterChangedToday ? '今日已记录' : '更新换水周期')", "description: isEn ? (waterChangedToday ? 'Recorded Today' : 'Save today\'s water change') : (waterChangedToday ? '今日已记录' : '保存今天的换水记录')"],
    ["description: isEn ? (hasStockedAnimals ? (fedToday ? 'Recorded Today' : 'Light Feeding') : 'Add Livestock First') : (hasStockedAnimals ? (fedToday ? '今日已记录' : '少量投喂') : '添加生物后使用')", "description: isEn ? (hasStockedAnimals ? (fedToday ? 'Recorded Today' : 'Save today\'s feeding') : 'Add Livestock First') : (hasStockedAnimals ? (fedToday ? '今日已记录' : '保存今天的喂食记录') : '添加生物后使用')"],
    ["level: '配置提醒'", "level: '混养提醒'"],
    ["level: '可选排查'", "level: '建议检查'"],
  ];
  for (const [from, to] of pairs) s = replaceRequired(s, from, to);
  write(path, s);
}

// 7) Species detail: explicit departure/death action instead of ambiguous More.
{
  const path = 'src/components/SpeciesDetailDialog.tsx';
  let s = read(path);
  s = replaceRequired(s, "{t('encyclopedia.moreLabel')}", "{isEn ? 'Record exit / death' : '记录离缸 / 死亡'}", 'species memorial action');
  write(path, s);
}

// 8) AI assistant: true bilingual strings and shorter chat chrome.
{
  const path = 'src/pages/AIAssistant.tsx';
  let s = read(path);
  s = replaceRequired(s,
`const SUGGESTED_QUESTIONS = [\n  "新手适合养什么鱼？",\n  "鱼缸水质变浑浊怎么办？",\n  "孔雀鱼怎么繁殖？",\n  "新鱼入缸需要注意什么？"\n];\n\nconst CHAT_STORAGE_KEY = 'aquaguide_ai_chat_messages';\n\nconst welcomeMessage: Message = {\n  id: 'welcome',\n  role: 'assistant',\n  content: '你好！我是你的养鱼助手。无论你是想了解某种鱼的饲养条件，还是遇到了水质问题，都可以问我。'\n};\n\nconst loadSavedMessages = () => {`,
`const SUGGESTED_QUESTIONS_ZH = [\n  '新手适合养什么鱼？',\n  '鱼缸水变浑浊怎么办？',\n  '孔雀鱼怎么繁殖？',\n  '新鱼入缸要注意什么？',\n];\n\nconst SUGGESTED_QUESTIONS_EN = [\n  'Which fish are suitable for beginners?',\n  'What should I do if the aquarium water turns cloudy?',\n  'How do guppies breed?',\n  'What should I check when adding new fish?',\n];\n\nconst CHAT_STORAGE_KEY = 'aquaguide_ai_chat_messages';\n\nconst getWelcomeMessage = (isEn: boolean): Message => ({\n  id: 'welcome',\n  role: 'assistant',\n  content: isEn\n    ? 'Hi! Ask me about species care, aquarium conditions, or problems you are seeing.'\n    : '你好！可以问我物种养护、鱼缸环境，或你正在遇到的问题。',\n});\n\nconst loadSavedMessages = (isEn: boolean) => {`, 'assistant language constants');
  s = replaceRequired(s, "if (!saved) return [welcomeMessage];", "if (!saved) return [getWelcomeMessage(isEn)];");
  s = replaceRequired(s, "if (!Array.isArray(parsed) || parsed.length === 0) return [welcomeMessage];", "if (!Array.isArray(parsed) || parsed.length === 0) return [getWelcomeMessage(isEn)];");
  s = replaceRequired(s, "return [welcomeMessage];\n  }\n};", "return [getWelcomeMessage(isEn)];\n  }\n};");
  s = replaceRequired(s, "const [messages, setMessages] = useState<Message[]>(loadSavedMessages);", "const [messages, setMessages] = useState<Message[]>(() => loadSavedMessages(isEn));");
  s = replaceRequired(s,
`  useEffect(() => {\n    if (scrollRef.current) {`,
`  useEffect(() => {\n    setMessages(prev => prev.map(message => message.id === 'welcome' ? getWelcomeMessage(isEn) : message));\n  }, [isEn]);\n\n  useEffect(() => {\n    if (scrollRef.current) {`, 'assistant locale refresh');
  s = replaceRequired(s, "if (!confirm('确定要清空 AI 助手的历史对话吗？')) return;\n    setMessages([welcomeMessage]);", "if (!confirm(isEn ? 'Clear AI assistant chat history?' : '确定要清空 AI 助手的历史对话吗？')) return;\n    setMessages([getWelcomeMessage(isEn)]);");
  s = replaceRequired(s, "content: response.answer || '抱歉，我没有理解你的问题。',", "content: response.answer || (isEn ? 'I could not understand that question. Please try rephrasing it.' : '我没有理解这个问题，可以换一种说法再试。'),");
  s = replaceRequired(s, "{isEn ? 'Remembers conversation history for seamless follow-up questions.' : '会记住本机里的历史对话，继续追问也能接上上下文。'}", "{isEn ? 'Supports follow-up questions. Chat history stays in this browser.' : '支持连续追问，历史对话保存在当前浏览器。'}");
  s = replaceRequired(s, "            清空", "            {isEn ? 'Clear' : '清空'}");
  s = replaceRequired(s,
`                {message.role === 'user' ? (\n                  <>\n                    <span className="mr-2 font-bold text-ink/60">{isEn ? 'Q: ' : '问：'}</span>\n                    {message.content}\n                  </>\n                ) : (`,
`                {message.role === 'user' ? (\n                  message.content\n                ) : (`, 'assistant user bubble prefix');
  s = replaceRequired(s, "{isEn ? 'AI is analyzing your aquarium environment...' : 'AI 正在为您分析当前鱼缸环境...'}", "{isEn ? 'Generating an answer…' : '正在生成回答…'}");
  s = replaceRequired(s, "{SUGGESTED_QUESTIONS.map((q, i) => (", "{(isEn ? SUGGESTED_QUESTIONS_EN : SUGGESTED_QUESTIONS_ZH).map((q, i) => (");
  s = replaceRequired(s, "placeholder={isEn ? 'Ask a question...' : '输入您的问题...'}", "placeholder={isEn ? 'Ask a question…' : '输入问题…'}");
  s = replaceRequired(s, "              发送", "              {isEn ? 'Send' : '发送'}");
  write(path, s);
}

console.log('Seventh copy audit applied.');
