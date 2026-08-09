// Validation trigger: source patch is applied by the branch workflow below.
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const write = (path, content) => fs.writeFileSync(path, content);
const replaceOnce = (source, search, replacement, label) => {
  const index = source.indexOf(search);
  if (index < 0) throw new Error(`Missing patch anchor: ${label}`);
  return source.slice(0, index) + replacement + source.slice(index + search.length);
};
const insertBefore = (source, anchor, content, label) => replaceOnce(source, anchor, `${content}${anchor}`, label);

// ---- Aquarium product flow ----
const aquariumPath = 'src/pages/Aquarium.tsx';
let aquarium = read(aquariumPath);

aquarium = insertBefore(
  aquarium,
  "type DiagnosisMode = 'home' | 'quiz' | 'result' | 'history';",
  `const getAddFishCategoryGroup = (fish: Fish) => {\n  const lifeType = getLifeType(fish);\n  const text = \`${'${fish.name} ${fish.category} ${fish.scientificName}'}\`;\n  if (lifeType === 'plant') return '水草';\n  if (lifeType === 'coral') return '珊瑚';\n  if (lifeType === 'invertebrate') {\n    if (/虾|shrimp|caridina|neocaridina/i.test(text)) return '虾';\n    if (/螺|snail|neritina|pomacea|clithon|anentome/i.test(text)) return '螺';\n    if (/蟹|crab/i.test(text)) return '蟹';\n    return '其他';\n  }\n  if (lifeType === 'fish') return '鱼类';\n  return '其他';\n};\n\nconst ADD_FISH_CATEGORY_OPTIONS = ['全部', '鱼类', '虾', '螺', '蟹', '珊瑚', '水草', '其他'] as const;\n\n`,
  'add-fish category helpers',
);

aquarium = replaceOnce(
  aquarium,
  "  const [fishSearchTerm, setFishSearchTerm] = useState('');\n  const [selectedAddFishItems, setSelectedAddFishItems] = useState<SelectedAddFishItem[]>([]);",
  "  const [fishSearchTerm, setFishSearchTerm] = useState('');\n  const [addFishCategory, setAddFishCategory] = useState<(typeof ADD_FISH_CATEGORY_OPTIONS)[number]>('全部');\n  const [selectedAddFishItems, setSelectedAddFishItems] = useState<SelectedAddFishItem[]>([]);",
  'add-fish category state',
);

aquarium = replaceOnce(
  aquarium,
  "  const [tankActionMessage, setTankActionMessage] = useState<string>('');",
  "  const [tankActionMessage, setTankActionMessage] = useState<string>('');\n  const [featurePreview, setFeaturePreview] = useState<null | { kind: 'ai_setup' | 'ai_building' | 'ai_risk' | 'login'; missing?: string[] }>(null);\n  const [riskOverrideConfirmOpen, setRiskOverrideConfirmOpen] = useState(false);",
  'feature preview state',
);

aquarium = replaceOnce(
  aquarium,
  "    setAddFishCompatibilityReview(null);\n    setFishSearchTerm('');\n    setSelectedAddFishItems(selectedFish",
  "    setAddFishCompatibilityReview(null);\n    setFishSearchTerm('');\n    setAddFishCategory('全部');\n    setSelectedAddFishItems(selectedFish",
  'reset category when opening species addition',
);

aquarium = replaceOnce(
  aquarium,
  "  const openTankBuildCopilot = () => {\n    setTankCopilotError('');\n    setTankCopilotResult(null);\n    setTankCopilotAnswers({});\n    setTankCopilotGoal(prev => prev || (activeAquarium.fishes.length > 0 ? (Boolean(i18n.language?.startsWith('en')) ? 'Plan safe additions based on active tank' : '基于当前鱼缸规划下一步安全搭配') : (Boolean(i18n.language?.startsWith('en')) ? 'Beginner small freshwater tank' : '新手小型淡水缸')));\n    setIsTankCopilotOpen(true);\n  };",
  "  const openTankBuildCopilot = () => {\n    const missing = getTankCopilotMissingInfo(activeAquarium);\n    if (missing.length > 0) {\n      setFeaturePreview({ kind: 'ai_setup', missing });\n      return;\n    }\n    setFeaturePreview({ kind: 'ai_building' });\n  };",
  'AI feature gate',
);

aquarium = replaceOnce(
  aquarium,
  "        showToast(isEn ? 'Sign in to create a share link.' : '登录后才能生成分享链接。', 'error');\n        navigateToRoute('/login');\n        return;",
  "        setFeaturePreview({ kind: 'login' });\n        return;",
  'share login feature gate',
);

aquarium = replaceOnce(
  aquarium,
  "  const handleRecordExistingFromPlan = async () => {\n    const items = addFishCompatibilityReview?.items || normalizeSelectedAddFishItems();\n    setAdditionIntent('record_existing');\n    await recordSelectedFishItems(items);\n  };",
  "  const handleRecordExistingFromPlan = async () => {\n    const items = addFishCompatibilityReview?.items || normalizeSelectedAddFishItems();\n    setAdditionIntent('record_existing');\n    await recordSelectedFishItems(items);\n  };\n\n  const handleOverrideRiskAndAdd = async () => {\n    if (!activeAquarium || !addFishCompatibilityReview || addFishCompatibilityReview.status !== 'not_recommended') return;\n    const key = 'aquaguide_risk_overrides_v1';\n    let current: unknown[] = [];\n    try {\n      const parsed = JSON.parse(localStorage.getItem(key) || '[]');\n      current = Array.isArray(parsed) ? parsed : [];\n    } catch {\n      current = [];\n    }\n    const override = {\n      id: crypto.randomUUID(),\n      aquariumId: activeAquarium.id,\n      items: addFishCompatibilityReview.items,\n      status: addFishCompatibilityReview.status,\n      blockingReasons: addFishCompatibilityReview.keyRules.map(rule => ({ code: rule.code, title: rule.title, evidence: rule.evidence, severity: rule.severity })),\n      ruleVersion: addFishCompatibilityReview.evaluations[0]?.result.metadata.ruleVersion || 'unknown',\n      confirmedAt: new Date().toISOString(),\n    };\n    localStorage.setItem(key, JSON.stringify([override, ...current].slice(0, 100)));\n    setRiskOverrideConfirmOpen(false);\n    const saved = await recordSelectedFishItems(addFishCompatibilityReview.items);\n    if (saved) {\n      setTankActionMessage(isEn ? 'Added after explicit risk confirmation. The high-risk override was recorded.' : '已在明确确认风险后加入，并保留这次高风险覆盖记录。');\n    }\n  };",
  'risk override handler',
);

aquarium = aquarium.replace(
  "当前参考：{activeAquarium.name} · {activeAquarium.waterType === 'Saltwater' ? '海水' : '淡水'} · {activeAquarium.targetTemperature || 25}°C",
  "当前参考：{activeAquarium.name} · {activeAquarium.waterType === 'Saltwater' ? '海水' : activeAquarium.waterType === 'Freshwater' ? '淡水' : '水体未设置'} · {activeAquarium.targetTemperature ? `${activeAquarium.targetTemperature}°C` : '温度未设置'}",
);

aquarium = replaceOnce(
  aquarium,
  "        <ConfigSection title={isEn ? \"Dimensions\" : \"尺寸\"} subtitle={isEn ? \"Used for volume estimation and care advice.\" : \"用于估算容量和后续养护建议。\"}>\n          <div className=\"grid grid-cols-3 gap-2\">",
  `        <ConfigSection title={isEn ? "Dimensions" : "尺寸"} subtitle={isEn ? "Used for volume estimation and care advice." : "用于估算容量和后续养护建议。"}>\n          <div className="mb-3">\n            <div className="text-[11px] font-black text-ink/55">{isEn ? 'Quick presets' : '常见鱼缸预设'}</div>\n            <div className="mt-2 flex flex-wrap gap-2">\n              {[\n                { label: '30×20×25cm · ~15L', dimensions: { length: '30', width: '20', height: '25' } },\n                { label: '45×25×30cm · ~34L', dimensions: { length: '45', width: '25', height: '30' } },\n                { label: '60×30×36cm · ~65L', dimensions: { length: '60', width: '30', height: '36' } },\n                { label: '90×45×45cm · ~182L', dimensions: { length: '90', width: '45', height: '45' } },\n              ].map(preset => {\n                const selected = settingsForm.dimensions?.length === preset.dimensions.length\n                  && settingsForm.dimensions?.width === preset.dimensions.width\n                  && settingsForm.dimensions?.height === preset.dimensions.height;\n                return (\n                  <button\n                    key={preset.label}\n                    type="button"\n                    onClick={() => setSettingsForm({ ...settingsForm, dimensions: preset.dimensions })}\n                    className={\`rounded-full border px-3 py-1.5 text-[11px] font-black ${'${selected ? \'border-emerald-300 bg-emerald-50 text-emerald-800\' : \'border-border bg-white text-ink/55\'}'}\`}\n                  >\n                    {preset.label}\n                  </button>\n                );\n              })}\n            </div>\n            <div className="mt-2 text-[10px] font-medium text-ink/42">{isEn ? 'Choose a preset only if it matches your real tank; otherwise enter the dimensions below.' : '只有和真实鱼缸一致时才选择预设；不匹配请在下方填写实际长宽高。'}</div>\n          </div>\n          <div className="grid grid-cols-3 gap-2">`,
  'tank size presets',
);

aquarium = replaceOnce(
  aquarium,
  "          <div className=\"mt-3 grid gap-1.5\">\n            <Label className=\"text-[11px] font-bold text-ink/55\">{isEn ? 'Target Temp (°C)' : '目标温度 (°C)'}</Label>\n            <Input",
  `          <div className="mt-3 grid gap-1.5">\n            <Label className="text-[11px] font-bold text-ink/55">{isEn ? 'Target Temp (°C)' : '目标温度 (°C)'}</Label>\n            <div className="flex flex-wrap gap-2">\n              {['22', '24', '25', '26', '28'].map(value => (\n                <button\n                  key={value}\n                  type="button"\n                  onClick={() => setSettingsForm({ ...settingsForm, targetTemperature: value })}\n                  className={\`min-h-9 rounded-full border px-3 text-[11px] font-black ${'${settingsForm.targetTemperature === value ? \'border-emerald-300 bg-emerald-50 text-emerald-800\' : \'border-border bg-white text-ink/55\'}'}\`}\n                >\n                  {value}°C\n                </button>\n              ))}\n            </div>\n            <div className="text-[10px] font-medium text-ink/42">{isEn ? 'Tap a common target or enter your actual target below.' : '可点选常见目标温度，或在下方填写你的实际温度。'}</div>\n            <Input`,
  'temperature presets',
);

aquarium = aquarium.replace("selected={(settingsForm.equipment?.light || '普通灯') === option}", "selected={settingsForm.equipment?.light === option}");
aquarium = aquarium.replace("selected={(settingsForm.equipment?.filter || '瀑布过滤') === option}", "selected={settingsForm.equipment?.filter === option}");

aquarium = replaceOnce(
  aquarium,
  "      configured: Boolean(\n        (settingsForm.equipment?.filter && settingsForm.equipment.filter !== '无')\n        || settingsForm.equipment?.heater\n        || settingsForm.equipment?.oxygen\n      ),",
  "      configured: settingsForm.equipment?.filter !== undefined\n        || typeof settingsForm.equipment?.heater === 'boolean'\n        || typeof settingsForm.equipment?.oxygen === 'boolean',",
  'explicit no-filter counts as configured',
);

aquarium = replaceOnce(
  aquarium,
  "                  <p className=\"mt-0.5 text-[11px] font-medium leading-relaxed text-ink/50\">{addFishIntro}</p>\n                </div>\n              <div className=\"relative\">",
  `                  <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-ink/50">{addFishIntro}</p>\n                </div>\n                <div>\n                  <div className="text-[11px] font-black text-ink/45">{isEn ? 'Choose a category first' : '先选择大类'}</div>\n                  <div className="app-scrollbar-hidden mt-2 flex gap-2 overflow-x-auto pb-1">\n                    {ADD_FISH_CATEGORY_OPTIONS.map(category => (\n                      <button\n                        key={category}\n                        type="button"\n                        onClick={() => { setAddFishCategory(category); setFishSearchTerm(''); }}\n                        className={\`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-black ${'${addFishCategory === category ? \'border-emerald-300 bg-emerald-50 text-emerald-800\' : \'border-border bg-white text-ink/50\'}'}\`}\n                      >\n                        {isEn ? ({ '全部': 'All', '鱼类': 'Fish', '虾': 'Shrimp', '螺': 'Snails', '蟹': 'Crabs', '珊瑚': 'Corals', '水草': 'Plants', '其他': 'Other' } as Record<string, string>)[category] : category}\n                      </button>\n                    ))}\n                  </div>\n                </div>\n              <div className="relative">`,
  'add fish category selector',
);

aquarium = replaceOnce(
  aquarium,
  "                  {addFishList.map(fish => {",
  "                  {addFishList.filter(fish => addFishCategory === '全部' || getAddFishCategoryGroup(fish) === addFishCategory).map(fish => {",
  'filter add fish list by category',
);

aquarium = replaceOnce(
  aquarium,
  "                  </div>\n\n                  <div className=\"grid gap-2\">\n                    {addFishCompatibilityReview.evaluations.map(evaluation => (",
  `                  </div>\n\n                  {addFishCompatibilityReview.status === 'not_recommended' && (\n                    <div className="rounded-[18px] border-2 border-red-300 bg-white p-4 shadow-sm">\n                      <div className="text-[11px] font-black uppercase tracking-[0.12em] text-red-600">{isEn ? 'Risk after adding' : '加入后的风险判定'}</div>\n                      <div className="mt-1 text-2xl font-black leading-tight text-red-700">{isEn ? 'Not recommended to mix' : '不建议混养'}</div>\n                      <p className="mt-2 text-[15px] font-black leading-relaxed text-red-950">\n                        {addFishCompatibilityReview.keyRules[0]?.evidence || (isEn ? 'The current combination has a blocking compatibility risk.' : '当前组合存在阻断级混养风险。')}\n                      </p>\n                    </div>\n                  )}\n\n                  <div className="grid gap-2">\n                    {addFishCompatibilityReview.evaluations.map(evaluation => (`,
  'prominent blocking risk banner',
);

aquarium = replaceOnce(
  aquarium,
  "                          <div key={`${rule.code}-${rule.title}-${rule.evidence}`} className=\"text-[11px] font-medium leading-relaxed text-ink/62\">\n                            <span className=\"font-black text-ink/72\">{rule.title}：</span>{rule.evidence}\n                          </div>",
  "                          <div key={`${rule.code}-${rule.title}-${rule.evidence}`} className={addFishCompatibilityReview.status === 'not_recommended' ? 'text-[14px] font-bold leading-relaxed text-red-950' : 'text-[11px] font-medium leading-relaxed text-ink/62'}>\n                            <span className={addFishCompatibilityReview.status === 'not_recommended' ? 'font-black text-red-800' : 'font-black text-ink/72'}>{rule.title}：</span>{rule.evidence}\n                          </div>",
  'prominent risk reasons',
);

aquarium = aquarium.replace(
  "{addFishCompatibilityReview && ['block', 'complete_information'].includes(getTankCompatibilityAddPolicy(addFishCompatibilityReview.status)) && (",
  "{addFishCompatibilityReview && getTankCompatibilityAddPolicy(addFishCompatibilityReview.status) === 'complete_information' && (",
);

aquarium = replaceOnce(
  aquarium,
  "                        <Button\n                          className=\"h-10 rounded-full bg-emerald-700 text-sm font-bold text-white hover:bg-emerald-800 disabled:bg-ink/15 disabled:text-ink/35\"",
  `                        {addFishCompatibilityReview && getTankCompatibilityAddPolicy(addFishCompatibilityReview.status) === 'block' && (\n                          <Button\n                            type="button"\n                            variant="outline"\n                            disabled={isAddFishSaving}\n                            onClick={() => setFeaturePreview({ kind: 'ai_risk' })}\n                            className="h-10 rounded-full border-violet-200 bg-violet-50 text-sm font-black text-violet-800"\n                          >\n                            <Sparkles className="mr-1.5 h-4 w-4" />AI 建议\n                          </Button>\n                        )}\n                        <Button\n                          className={\`h-10 rounded-full text-sm font-bold text-white disabled:bg-ink/15 disabled:text-ink/35 ${'${addFishCompatibilityReview && getTankCompatibilityAddPolicy(addFishCompatibilityReview.status) === \'block\' ? \'bg-red-600 hover:bg-red-700\' : \'bg-emerald-700 hover:bg-emerald-800\'}'}\`}`,
  'AI advice button and danger styling',
);

aquarium = aquarium.replace(
  "? getTankCompatibilityAddPolicy(addFishCompatibilityReview.status) === 'block'\n                              ? () => setAddFishCompatibilityReview(null)",
  "? getTankCompatibilityAddPolicy(addFishCompatibilityReview.status) === 'block'\n                              ? () => setRiskOverrideConfirmOpen(true)",
);
aquarium = aquarium.replace("? '返回调整组合'", "? '仍要加入'");

aquarium = insertBefore(
  aquarium,
  "      {/* Add Fish Dialog (Search Based) */}",
  `      <Dialog open={Boolean(featurePreview)} onOpenChange={(open) => { if (!open) setFeaturePreview(null); }}>\n        <DialogContent showCloseButton={false} className="w-[min(92vw,480px)] max-w-[480px] rounded-[24px]">\n          <DialogHeader>\n            <DialogTitle>\n              {featurePreview?.kind === 'ai_setup'\n                ? (isEn ? 'Complete tank details before using AI' : '完善鱼缸参数后才能使用 AI')\n                : featurePreview?.kind === 'login'\n                  ? (isEn ? 'Cloud sync is under construction' : '云端同步 · 建设中')\n                  : featurePreview?.kind === 'ai_risk'\n                    ? (isEn ? 'AI risk advice is under construction' : 'AI 风险调整建议 · 建设中')\n                    : (isEn ? 'AI personalized guidance is under construction' : 'AI 个性化建议 · 建设中')}\n            </DialogTitle>\n            <DialogDescription>\n              {featurePreview?.kind === 'ai_setup'\n                ? (isEn ? 'AI only becomes available after the tank size, water type, target temperature, and filter status are confirmed. This avoids advice based on guessed values.' : 'AI 只有在尺寸、水体类型、目标温度和过滤状态都由你确认后才会开放，避免系统基于猜测数据生成建议。')\n                : featurePreview?.kind === 'login'\n                  ? (isEn ? 'Future sign-in will sync aquariums, favorites, care history and share links across devices. The current version continues to store data locally.' : '未来登录后会跨设备同步鱼缸、收藏、养护记录和分享链接；当前版本继续使用本地数据，不会进入未闭环的登录流程。')\n                  : featurePreview?.kind === 'ai_risk'\n                    ? (isEn ? 'This feature will explain the blocking rule and suggest safer alternatives or tank adjustments. Current decisions still use AquaGuide compatibility rules.' : '这个功能未来会解释阻断风险，并给出更安全的替代物种或鱼缸调整方案；当前仍以 AquaGuide 兼容规则为准。')\n                    : (isEn ? 'This feature will use confirmed tank parameters and compatibility rules to generate personalized care and stocking guidance. It is not yet open to production users.' : '这个功能未来会读取已确认的鱼缸参数与兼容规则，生成个性化养护和搭配建议；当前版本暂不开放正式使用。')}\n            </DialogDescription>\n          </DialogHeader>\n          {featurePreview?.kind === 'ai_setup' && featurePreview.missing && featurePreview.missing.length > 0 && (\n            <div className="rounded-[16px] bg-amber-50 p-3 text-sm font-bold text-amber-900">\n              <div className="font-black">{isEn ? 'Still missing' : '还缺少'}</div>\n              <div className="mt-1">{featurePreview.missing.join('、')}</div>\n            </div>\n          )}\n          <DialogFooter>\n            <Button type="button" variant="outline" onClick={() => setFeaturePreview(null)}>{isEn ? 'Got it' : '稍后'}</Button>\n            {featurePreview?.kind === 'ai_setup' && (\n              <Button\n                type="button"\n                onClick={() => {\n                  const missing = featurePreview.missing || [];\n                  const panel = missing.some(item => /尺寸|容量|volume|size/i.test(item))\n                    ? 'size'\n                    : missing.some(item => /过滤|filter|设备|equipment/i.test(item))\n                      ? 'equipment'\n                      : 'parameters';\n                  setFeaturePreview(null);\n                  openAquariumSettings(panel);\n                }}\n                className="bg-emerald-700 text-white hover:bg-emerald-800"\n              >\n                {isEn ? 'Complete tank settings' : '去完善鱼缸参数'}\n              </Button>\n            )}\n          </DialogFooter>\n        </DialogContent>\n      </Dialog>\n\n      <Dialog open={riskOverrideConfirmOpen} onOpenChange={setRiskOverrideConfirmOpen}>\n        <DialogContent showCloseButton={false} className="w-[min(92vw,500px)] max-w-[500px] rounded-[24px] border-red-200">\n          <DialogHeader>\n            <DialogTitle className="text-red-700">{isEn ? 'AquaGuide does not recommend this combination' : 'AquaGuide 不建议这个组合'}</DialogTitle>\n            <DialogDescription>\n              {isEn ? 'If you continue, the livestock will be recorded as intentionally added despite a blocking compatibility risk. The override and current rule reasons will be kept locally.' : '如果继续，这些生物会在存在阻断级混养风险的情况下被记录为“用户明确选择加入”。系统会保留本次风险原因和确认记录。'}\n            </DialogDescription>\n          </DialogHeader>\n          {addFishCompatibilityReview?.keyRules?.length ? (\n            <div className="rounded-[16px] bg-red-50 p-3">\n              {addFishCompatibilityReview.keyRules.slice(0, 3).map(rule => (\n                <div key={\`${'${rule.code}-${rule.evidence}'}\`} className="py-1 text-sm font-bold leading-relaxed text-red-950">\n                  <span className="font-black text-red-700">{rule.title}：</span>{rule.evidence}\n                </div>\n              ))}\n            </div>\n          ) : null}\n          <DialogFooter>\n            <Button type="button" variant="outline" onClick={() => setRiskOverrideConfirmOpen(false)}>{isEn ? 'Go back' : '返回调整'}</Button>\n            <Button type="button" disabled={isAddFishSaving} onClick={() => void handleOverrideRiskAndAdd()} className="bg-red-600 text-white hover:bg-red-700">\n              {isAddFishSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}\n              {isEn ? 'I understand the risk, still add' : '我已了解风险，仍要加入'}\n            </Button>\n          </DialogFooter>\n        </DialogContent>\n      </Dialog>\n\n`,
  'feature and risk dialogs',
);

aquarium = replaceOnce(
  aquarium,
  "                  setFishSearchTerm('');\n                  setSelectedAddFishItems([]);",
  "                  setFishSearchTerm('');\n                  setAddFishCategory('全部');\n                  setSelectedAddFishItems([]);",
  'reset add-fish category on close',
);

write(aquariumPath, aquarium);

const copilotPath = 'src/modules/copilot/tankBuildCopilot.ts';
let copilot = read(copilotPath);
copilot = replaceOnce(
  copilot,
  "  if (!aquarium.equipment?.filter || aquarium.equipment.filter === '无') missing.push('过滤设备');",
  "  if (aquarium.equipment?.filter === undefined) missing.push('过滤设备');",
  'explicit no-filter is a known value',
);
write(copilotPath, copilot);

const settingsPath = 'src/pages/Settings.tsx';
let settings = read(settingsPath);
settings = replaceOnce(
  settings,
  "  const [pendingRevokeShareId, setPendingRevokeShareId] = useState('');",
  "  const [pendingRevokeShareId, setPendingRevokeShareId] = useState('');\n  const [isLoginPreviewOpen, setIsLoginPreviewOpen] = useState(false);",
  'settings login preview state',
);
settings = replaceOnce(
  settings,
  "<button type=\"button\" onClick={() => navigateToRoute('/login')} className=\"min-h-11 rounded-full bg-emerald-700 px-4 text-sm font-black text-white\">{isEn ? 'Sign in' : '去登录'}</button>",
  "<button type=\"button\" onClick={() => setIsLoginPreviewOpen(true)} className=\"min-h-11 rounded-full bg-emerald-700 px-4 text-sm font-black text-white\">{isEn ? 'Sign in' : '去登录'}</button>",
  'settings login button gate',
);
settings = insertBefore(
  settings,
  "      <Dialog open={Boolean(pendingRevokeShareId)}",
  `      <Dialog open={isLoginPreviewOpen} onOpenChange={setIsLoginPreviewOpen}>\n        <DialogContent showCloseButton={false} className="w-[min(92vw,460px)] max-w-[460px] rounded-[26px]">\n          <DialogHeader>\n            <DialogTitle>{isEn ? 'Cloud sync is under construction' : '云端同步 · 建设中'}</DialogTitle>\n            <DialogDescription>{isEn ? 'Future sign-in will sync your aquariums, favorites, care history and privacy-safe share links across devices. The current version keeps using local data and will not enter an unfinished login flow.' : '未来登录后会跨设备同步鱼缸、收藏、养护记录和脱敏分享链接。当前版本继续使用本地数据，不会进入尚未闭环的登录流程。'}</DialogDescription>\n          </DialogHeader>\n          <DialogFooter>\n            <button type="button" autoFocus onClick={() => setIsLoginPreviewOpen(false)} className="min-h-11 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white">{isEn ? 'Got it' : '知道了'}</button>\n          </DialogFooter>\n        </DialogContent>\n      </Dialog>\n`,
  'settings login preview dialog',
);
write(settingsPath, settings);

const loginPath = 'src/pages/Login.tsx';
write(loginPath, `import { Cloud, ChevronLeft } from 'lucide-react';\nimport { useTranslation } from 'react-i18next';\nimport { useNavigate } from 'react-router-dom';\n\nexport default function Login() {\n  const navigate = useNavigate();\n  const { i18n } = useTranslation();\n  const isEn = Boolean(i18n.language?.startsWith('en'));\n  return (\n    <div className="flex min-h-[100dvh] items-center justify-center bg-[#dfe8e5] px-4 py-8 text-ink">\n      <main className="w-full max-w-[480px] rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_24px_70px_rgba(27,77,62,0.14)]">\n        <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-50 text-emerald-800"><Cloud className="h-6 w-6" /></span>\n        <div className="mt-5 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">{isEn ? 'Under construction' : '功能建设中'}</div>\n        <h1 className="mt-3 text-[24px] font-black leading-tight text-ink">{isEn ? 'AquaGuide cloud sync' : 'AquaGuide 云端同步'}</h1>\n        <p className="mt-3 text-sm font-semibold leading-6 text-ink/58">{isEn ? 'When this feature is ready, signing in will sync aquariums, favorites, care history and share links across devices. For now, AquaGuide keeps your working data on this device and does not expose the unfinished sign-in flow.' : '功能完成后，登录会用于跨设备同步鱼缸、收藏、养护记录和分享链接。当前版本继续使用本设备数据，不开放尚未闭环的正式登录流程。'}</p>\n        <button type="button" onClick={() => navigate(-1)} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-800 px-5 text-sm font-black text-white hover:bg-emerald-900"><ChevronLeft className="h-4 w-4" />{isEn ? 'Go back' : '返回'}</button>\n      </main>\n    </div>\n  );\n}\n`);

try { fs.unlinkSync('scripts/apply_product_closure_patch.mjs'); } catch {}
try { fs.unlinkSync('.github/workflows/agent-product-closure.yml'); } catch {}

console.log('Product closure patch applied successfully.');
