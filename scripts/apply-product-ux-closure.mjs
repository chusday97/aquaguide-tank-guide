import { readFileSync, writeFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const write = (path, content) => writeFileSync(path, content, 'utf8');

const replaceOnce = (source, search, replacement, label) => {
  if (!source.includes(search)) throw new Error(`Missing patch target: ${label}`);
  return source.replace(search, replacement);
};

const replaceAll = (source, search, replacement) => source.split(search).join(replacement);

const replaceAfter = (source, marker, search, replacement, label) => {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing patch marker: ${label}`);
  const searchIndex = source.indexOf(search, markerIndex);
  if (searchIndex < 0) throw new Error(`Missing patch target after marker: ${label}`);
  return source.slice(0, searchIndex) + replacement + source.slice(searchIndex + search.length);
};

const marker = '// AQUAGUIDE_PRODUCT_UX_CLOSURE_V1';

// 1) One authoritative definition of AI-ready aquarium data and explicit presets.
{
  const path = 'src/services/aquarium/aquarium-setup.service.ts';
  let source = read(path);
  if (!source.includes(marker)) {
    source += `\n\n${marker}\nexport type AquariumAiSetupPanel = 'size' | 'parameters' | 'equipment';\n\nexport type AquariumAiMissingField = {\n  key: 'dimensions' | 'waterType' | 'temperature' | 'filter';\n  label: string;\n  panel: AquariumAiSetupPanel;\n};\n\nexport const AQUARIUM_QUICK_SETUP_PRESETS = {\n  dimensions: [\n    { id: '20l', label: '40×25×20 cm · 20L', dimensions: { length: '40', width: '25', height: '20' } },\n    { id: '34l', label: '45×30×25 cm · 34L', dimensions: { length: '45', width: '30', height: '25' } },\n    { id: '45l', label: '50×30×30 cm · 45L', dimensions: { length: '50', width: '30', height: '30' } },\n    { id: '63l', label: '60×30×35 cm · 63L', dimensions: { length: '60', width: '30', height: '35' } },\n    { id: '90l', label: '75×40×30 cm · 90L', dimensions: { length: '75', width: '40', height: '30' } },\n  ],\n  temperaturesC: [22, 24, 25, 26, 28],\n  filters: ['无', '瀑布过滤', '海绵过滤', '上滤', '桶滤'] as const,\n} as const;\n\nexport const getAquariumAiReadiness = (aquarium: Aquarium) => {\n  const missing: AquariumAiMissingField[] = [];\n  const dimensionsComplete = Boolean(\n    nonEmpty(aquarium.dimensions?.length)\n    && nonEmpty(aquarium.dimensions?.width)\n    && nonEmpty(aquarium.dimensions?.height),\n  );\n  if (!dimensionsComplete) missing.push({ key: 'dimensions', label: '鱼缸尺寸 / 容量', panel: 'size' });\n  if (aquarium.waterType !== 'Freshwater' && aquarium.waterType !== 'Saltwater') {\n    missing.push({ key: 'waterType', label: '水体类型', panel: 'parameters' });\n  }\n  if (!nonEmpty(aquarium.targetTemperature) || !Number.isFinite(Number(aquarium.targetTemperature))) {\n    missing.push({ key: 'temperature', label: '目标水温', panel: 'parameters' });\n  }\n  // undefined means the user has not answered. The explicit value \"无\" is a real answer.\n  if (aquarium.equipment?.filter === undefined) {\n    missing.push({ key: 'filter', label: '过滤设备', panel: 'equipment' });\n  }\n  return {\n    ready: missing.length === 0,\n    missing,\n    firstPanel: missing[0]?.panel,\n  };\n};\n`;
    write(path, source);
  }
}

// 2) Copilot and UI use the same completeness rule. "No filter" is a known value, not missing data.
{
  const path = 'src/modules/copilot/tankBuildCopilot.ts';
  let source = read(path);
  if (!source.includes(marker)) {
    source = replaceOnce(
      source,
      "import type { TankCopilotContext } from './copilot.types';",
      "import type { TankCopilotContext } from './copilot.types';\nimport { getAquariumAiReadiness } from '../../services/aquarium/aquarium-setup.service';\n\n" + marker,
      'copilot readiness import',
    );
    const readinessPattern = /export const getTankCopilotMissingInfo = \(aquarium: Aquarium\) => \{[\s\S]*?\n\};/;
    if (!readinessPattern.test(source)) throw new Error('Missing patch target: getTankCopilotMissingInfo');
    source = source.replace(
      readinessPattern,
      "export const getTankCopilotMissingInfo = (aquarium: Aquarium) => (\n  getAquariumAiReadiness(aquarium).missing.map(item => item.label)\n);",
    );
    write(path, source);
  }
}

// 3) Central feature gate: login and visible AI actions explain the future value without entering incomplete flows.
{
  const path = 'src/components/layout/WorkspaceNavigationProvider.tsx';
  let source = read(path);
  if (!source.includes(marker)) {
    source = replaceOnce(
      source,
      "  useMemo,\n  useRef,\n  type ReactNode,",
      "  useMemo,\n  useRef,\n  useEffect,\n  useState,\n  type ReactNode,",
      'workspace hooks',
    );
    source = replaceOnce(
      source,
      "import type {\n  NavigateToSectionOptions,",
      `import { loadAppStateFromStorage } from '../../services/storage/local-app-state';\nimport { getAquariumAiReadiness, type AquariumAiSetupPanel } from '../../services/aquarium/aquarium-setup.service';\n\n${marker}\n\nimport type {\n  NavigateToSectionOptions,`,
      'workspace readiness imports',
    );
    source = replaceOnce(
      source,
      "const WorkspaceNavigationContextValue = createContext<WorkspaceNavigationValue | null>(null);",
      `const WorkspaceNavigationContextValue = createContext<WorkspaceNavigationValue | null>(null);\n\ntype FeaturePreviewState = {\n  kind: 'auth' | 'ai';\n  title: string;\n  description: string;\n  ready?: boolean;\n  missing?: string[];\n  firstPanel?: AquariumAiSetupPanel;\n};\n\nconst isEnglishUi = () => typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('en');\n\nconst buildFeaturePreview = (kind: 'auth' | 'ai'): FeaturePreviewState => {\n  const isEn = isEnglishUi();\n  if (kind === 'auth') {\n    return {\n      kind,\n      title: isEn ? 'Cloud sync is being built' : '云端同步 · 建设中',\n      description: isEn\n        ? 'Sign-in will later sync tanks, species, favorites and care history across devices. The current version continues to save data on this device.'\n        : '未来登录后可跨设备同步鱼缸、物种、收藏与养护记录。当前版本继续使用本设备数据，不会进入尚未闭环的登录流程。',\n    };\n  }\n\n  try {\n    const state = loadAppStateFromStorage();\n    const aquarium = state.aquariums.find(item => item.id === state.currentAquariumId) || state.aquariums[0];\n    if (!aquarium) {\n      return {\n        kind,\n        title: isEn ? 'AI features are being built' : 'AI 功能 · 建设中',\n        description: isEn\n          ? 'AI will use verified tank settings and AquaGuide safety rules to explain risks and personalize care. Create a tank and confirm its core parameters first.'\n          : '未来 AI 会读取已确认的鱼缸参数，并结合 AquaGuide 安全规则解释风险和个性化养护。使用前需要先创建鱼缸并确认核心参数。',\n        ready: false,\n        missing: [isEn ? 'Create or select a tank first' : '先创建或选择一个鱼缸'],\n        firstPanel: 'size',\n      };\n    }\n    const readiness = getAquariumAiReadiness(aquarium);\n    return {\n      kind,\n      title: isEn ? 'AI features are being built' : 'AI 功能 · 建设中',\n      description: readiness.ready\n        ? (isEn\n          ? 'Your tank data meets the current AI-ready requirement. When released, AI will automatically use these settings instead of asking you to type them again.'\n          : '当前鱼缸资料已经达到 AI 使用条件。功能开放后，AI 会自动读取这些已确认参数，不再要求你重复填写文字。')\n        : (isEn\n          ? 'AI will only activate after the core tank parameters below are confirmed, so it does not generate advice from guessed values.'\n          : '为避免 AI 基于猜测数据生成建议，以下核心参数确认完成后才会开放 AI 能力。'),\n      ready: readiness.ready,\n      missing: readiness.missing.map(item => item.label),\n      firstPanel: readiness.firstPanel,\n    };\n  } catch {\n    return {\n      kind,\n      title: isEn ? 'AI features are being built' : 'AI 功能 · 建设中',\n      description: isEn ? 'AI will be enabled after verified tank parameters are available.' : 'AI 会在鱼缸核心参数确认后开放。',\n      ready: false,\n      missing: [isEn ? 'Tank settings are not available yet' : '暂时无法读取鱼缸设置'],\n      firstPanel: 'size',\n    };\n  }\n};`,
      'workspace feature preview helpers',
    );
    source = replaceOnce(
      source,
      "  const navigationGuardRef = useRef<((targetPath: string) => boolean) | null>(null);",
      "  const navigationGuardRef = useRef<((targetPath: string) => boolean) | null>(null);\n  const [featurePreview, setFeaturePreview] = useState<FeaturePreviewState | null>(null);",
      'workspace feature preview state',
    );
    source = replaceOnce(
      source,
      "  const registerNavigationGuard = useCallback((guard: ((targetPath: string) => boolean) | null) => {",
      `  const showFeaturePreview = useCallback((kind: 'auth' | 'ai') => {\n    setFeaturePreview(buildFeaturePreview(kind));\n  }, []);\n\n  useEffect(() => {\n    const handleFeaturePreviewEvent = (event: Event) => {\n      const feature = (event as CustomEvent<{ feature?: string }>).detail?.feature || '';\n      showFeaturePreview(feature.startsWith('auth') ? 'auth' : 'ai');\n    };\n    const handleFeatureClick = (event: MouseEvent) => {\n      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button, a, [role=\"button\"]') : null;\n      if (!target) return;\n      const href = target instanceof HTMLAnchorElement ? target.getAttribute('href') || '' : '';\n      const text = (target.textContent || '').replace(/\\s+/g, ' ').trim();\n      if (/^\\/login(?:[/?#]|$)/.test(href)) {\n        event.preventDefault();\n        event.stopPropagation();\n        showFeaturePreview('auth');\n        return;\n      }\n      if (/AI\\s*(Tank Copilot|建缸助手|建议|养护|风险|Plan|Care)|(^|\\s)AI($|\\s)/i.test(text)) {\n        event.preventDefault();\n        event.stopPropagation();\n        showFeaturePreview('ai');\n      }\n    };\n    window.addEventListener('aquaguide:feature-preview', handleFeaturePreviewEvent as EventListener);\n    document.addEventListener('click', handleFeatureClick, true);\n    return () => {\n      window.removeEventListener('aquaguide:feature-preview', handleFeaturePreviewEvent as EventListener);\n      document.removeEventListener('click', handleFeatureClick, true);\n    };\n  }, [showFeaturePreview]);\n\n  const registerNavigationGuard = useCallback((guard: ((targetPath: string) => boolean) | null) => {`,
      'workspace feature gate handlers',
    );
    source = replaceOnce(
      source,
      `  const navigateToRoute = useCallback((path: string) => {\n    if (!canNavigate(path)) return;\n    navigate(path);\n  }, [canNavigate, navigate]);`,
      `  const navigateToRoute = useCallback((path: string) => {\n    if (/^\\/login(?:[/?#]|$)/.test(path)) {\n      showFeaturePreview('auth');\n      return;\n    }\n    if (!canNavigate(path)) return;\n    navigate(path);\n  }, [canNavigate, navigate, showFeaturePreview]);`,
      'workspace login route gate',
    );
    source = replaceOnce(
      source,
      `  const navigateToView = useCallback((path: string, hash = '') => {\n    const targetPath = \`${'${path}${hash}'}\`;\n    if (!canNavigate(targetPath)) return;\n    navigate(targetPath);\n  }, [canNavigate, navigate]);`,
      `  const navigateToView = useCallback((path: string, hash = '') => {\n    const targetPath = \`${'${path}${hash}'}\`;\n    if (/^\\/login(?:[/?#]|$)/.test(targetPath)) {\n      showFeaturePreview('auth');\n      return;\n    }\n    if (!canNavigate(targetPath)) return;\n    navigate(targetPath);\n  }, [canNavigate, navigate, showFeaturePreview]);`,
      'workspace login view gate',
    );
    source = replaceOnce(
      source,
      `  return (\n    <WorkspaceNavigationContextValue.Provider value={value}>\n      {children}\n    </WorkspaceNavigationContextValue.Provider>\n  );`,
      `  return (\n    <WorkspaceNavigationContextValue.Provider value={value}>\n      {children}\n      {featurePreview && (\n        <div className=\"fixed inset-0 z-[140] flex items-center justify-center p-4\" role=\"presentation\">\n          <button type=\"button\" aria-label={isEnglishUi() ? 'Close preview' : '关闭说明'} className=\"absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]\" onClick={() => setFeaturePreview(null)} />\n          <section role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"feature-preview-title\" className=\"relative w-full max-w-[460px] rounded-[26px] border border-white/80 bg-white p-5 text-ink shadow-[0_30px_90px_rgba(15,23,42,0.24)]\">\n            <div className=\"inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-800\">\n              {isEnglishUi() ? 'COMING SOON' : '功能建设中'}\n            </div>\n            <h2 id=\"feature-preview-title\" className=\"mt-3 text-[22px] font-black leading-tight\">{featurePreview.title}</h2>\n            <p className=\"mt-2 text-sm font-semibold leading-6 text-ink/58\">{featurePreview.description}</p>\n            {featurePreview.kind === 'ai' && (featurePreview.missing?.length || 0) > 0 && (\n              <div className=\"mt-4 rounded-[18px] border border-amber-100 bg-amber-50/75 p-4\">\n                <div className=\"text-xs font-black text-amber-900\">{isEnglishUi() ? 'Confirm these before AI can be used' : 'AI 开放前需要先确认'}</div>\n                <div className=\"mt-2 flex flex-wrap gap-2\">\n                  {featurePreview.missing?.map(item => <span key={item} className=\"rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-amber-800 shadow-sm\">{item}</span>)}\n                </div>\n              </div>\n            )}\n            {featurePreview.kind === 'ai' && featurePreview.ready && (\n              <div className=\"mt-4 rounded-[16px] bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-800\">\n                {isEnglishUi() ? 'Tank parameters ready ✓' : '鱼缸核心参数已确认 ✓'}\n              </div>\n            )}\n            <div className=\"mt-5 grid gap-2 sm:grid-cols-2\">\n              {featurePreview.kind === 'ai' && !featurePreview.ready && (\n                <button type=\"button\" onClick={() => {\n                  const panel = featurePreview.firstPanel || 'size';\n                  setFeaturePreview(null);\n                  navigate(\`/aquarium#settings-\${panel}\`);\n                }} className=\"min-h-11 rounded-full bg-emerald-800 px-4 text-sm font-black text-white hover:bg-emerald-900\">\n                  {isEnglishUi() ? 'Complete tank settings' : '去完善鱼缸资料'}\n                </button>\n              )}\n              <button type=\"button\" onClick={() => setFeaturePreview(null)} className=\"min-h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-ink/65 hover:bg-slate-50\">\n                {isEnglishUi() ? 'Got it' : '我知道了'}\n              </button>\n            </div>\n          </section>\n        </div>\n      )}\n    </WorkspaceNavigationContextValue.Provider>\n  );`,
      'workspace feature preview modal',
    );
    write(path, source);
  }
}

// 4) Direct /login visits also explain that the cloud feature is not released; auth implementation remains untouched in services.
{
  const path = 'src/pages/Login.tsx';
  const source = read(path);
  if (!source.includes(marker)) {
    write(path, `import { Cloud, ChevronLeft } from 'lucide-react';\nimport { useNavigate } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';\n\n${marker}\n\nexport default function Login() {\n  const navigate = useNavigate();\n  const { i18n } = useTranslation();\n  const isEn = Boolean(i18n.language?.startsWith('en'));\n\n  return (\n    <div className=\"flex min-h-[100dvh] items-center justify-center bg-[#dfe8e5] px-4 py-8 text-ink\">\n      <main className=\"w-full max-w-[460px] rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_24px_70px_rgba(27,77,62,0.14)]\">\n        <span className=\"flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-800 text-white\"><Cloud className=\"h-6 w-6\" /></span>\n        <div className=\"mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-800\">{isEn ? 'COMING SOON' : '功能建设中'}</div>\n        <h1 className=\"mt-3 text-[24px] font-black\">{isEn ? 'AquaGuide cloud sync' : 'AquaGuide 云端同步'}</h1>\n        <p className=\"mt-2 text-sm font-semibold leading-6 text-ink/55\">\n          {isEn ? 'Sign-in will later sync tanks, species, favorites and care history across devices. For now, AquaGuide continues to save your working data on this device.' : '未来登录后可跨设备同步鱼缸、物种、收藏和养护记录。当前版本继续使用本设备数据，暂不开放未完全闭环的登录与迁移流程。'}\n        </p>\n        <button type=\"button\" onClick={() => navigate('/aquarium', { replace: true })} className=\"mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-4 text-sm font-black text-white\">\n          <ChevronLeft className=\"h-4 w-4\" />{isEn ? 'Back to my tank' : '返回我的鱼缸'}\n        </button>\n      </main>\n    </div>\n  );\n}\n`);
  }
}

// 5) Close the inline aquarium UX gaps while leaving the current species IDs / database keys unchanged.
{
  const path = 'src/pages/Aquarium.tsx';
  let source = read(path);
  if (!source.includes(marker)) {
    source = replaceOnce(source, "const ThreeAquarium = lazy(() => import('../components/ThreeAquarium').then(module => ({ default: module.ThreeAquarium })));", `${marker}\n\nconst ThreeAquarium = lazy(() => import('../components/ThreeAquarium').then(module => ({ default: module.ThreeAquarium })));`, 'aquarium closure marker');

    source = replaceOnce(
      source,
      "function AquariumZoneHeader({ index, title, subtitle, titleId }: { index: number; title: string; subtitle: string; titleId: string }) {",
      `const getAddFishCategory = (fish: Fish): 'fish' | 'shrimp' | 'snail' | 'crab' | 'plant' | 'coral' | 'other' => {\n  const value = \`${'${fish.category} ${fish.name} ${fish.scientificName}'}\`.toLowerCase();\n  if (/水草|plant|moss|fern|anubias|cryptocoryne/.test(value)) return 'plant';\n  if (/珊瑚|coral|reef/.test(value)) return 'coral';\n  if (/虾|shrimp|prawn|caridina|neocaridina/.test(value)) return 'shrimp';\n  if (/螺|snail|nerite|mystery snail/.test(value)) return 'snail';\n  if (/蟹|crab/.test(value)) return 'crab';\n  if (/鱼|fish|tetra|rasbora|cichlid|gourami|betta|guppy|cory|loach/.test(value)) return 'fish';\n  return 'other';\n};\n\nfunction AquariumZoneHeader({ index, title, subtitle, titleId }: { index: number; title: string; subtitle: string; titleId: string }) {`,
      'species category helper',
    );

    source = replaceOnce(
      source,
      "  const [fishSearchTerm, setFishSearchTerm] = useState('');",
      "  const [fishSearchTerm, setFishSearchTerm] = useState('');\n  const [addFishCategory, setAddFishCategory] = useState<'all' | 'fish' | 'shrimp' | 'snail' | 'crab' | 'plant' | 'coral' | 'other'>('all');\n  const [isRiskOverrideConfirmOpen, setIsRiskOverrideConfirmOpen] = useState(false);",
      'add species category state',
    );

    source = replaceAll(
      source,
      "    setFishSearchTerm('');\n    setSelectedAddFishItems(",
      "    setFishSearchTerm('');\n    setAddFishCategory('all');\n    setSelectedAddFishItems(",
    );

    source = replaceOnce(
      source,
      `  const openTankBuildCopilot = () => {\n    setTankCopilotError('');\n    setTankCopilotResult(null);\n    setTankCopilotAnswers({});\n    setTankCopilotGoal(prev => prev || (activeAquarium.fishes.length > 0 ? (Boolean(i18n.language?.startsWith('en')) ? 'Plan safe additions based on active tank' : '基于当前鱼缸规划下一步安全搭配') : (Boolean(i18n.language?.startsWith('en')) ? 'Beginner small freshwater tank' : '新手小型淡水缸')));\n    setIsTankCopilotOpen(true);\n  };`,
      `  const openTankBuildCopilot = () => {\n    window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'ai-care' } }));\n  };`,
      'AI tank copilot feature gate',
    );

    source = replaceOnce(
      source,
      `  const handleRecordExistingFromPlan = async () => {\n    const items = addFishCompatibilityReview?.items || normalizeSelectedAddFishItems();\n    setAdditionIntent('record_existing');\n    await recordSelectedFishItems(items);\n  };\n\n  const handleAddCompatibilitySpeciesToTank`,
      `  const handleRecordExistingFromPlan = async () => {\n    const items = addFishCompatibilityReview?.items || normalizeSelectedAddFishItems();\n    setAdditionIntent('record_existing');\n    await recordSelectedFishItems(items);\n  };\n\n  const handleRiskOverrideAdd = async () => {\n    if (!addFishCompatibilityReview || !activeAquarium) return;\n    const review = addFishCompatibilityReview;\n    try {\n      const storageKey = 'aquaguide:risk-overrides:v1';\n      const existing = JSON.parse(window.localStorage.getItem(storageKey) || '[]');\n      const records = Array.isArray(existing) ? existing : [];\n      const riskRecord = {\n        id: crypto.randomUUID(),\n        aquariumId: activeAquarium.id,\n        species: review.items.map(item => ({\n          fishId: item.fishId,\n          name: fishData.find(fish => fish.id === item.fishId)?.name || item.fishId,\n          quantity: item.quantity,\n        })),\n        status: review.status,\n        reasons: review.keyRules.map(rule => ({ code: rule.code, title: rule.title, evidence: rule.evidence, severity: rule.severity })),\n        ruleVersion: review.evaluations[0]?.result.metadata.ruleVersion || 'unknown',\n        confirmedAt: new Date().toISOString(),\n      };\n      window.localStorage.setItem(storageKey, JSON.stringify([riskRecord, ...records].slice(0, 100)));\n    } catch (error) {\n      console.warn('AquaGuide risk override audit could not be saved', error);\n    }\n    setAdditionIntent('record_existing');\n    setIsRiskOverrideConfirmOpen(false);\n    await recordSelectedFishItems(review.items);\n    setTankActionMessage(Boolean(i18n.language?.startsWith('en'))\n      ? 'High-risk stocking was recorded after your explicit confirmation. Keep monitoring the flagged risks.'\n      : '已按你的明确确认记录高风险组合；后续请持续关注上方标记的风险。');\n  };\n\n  const handleAddCompatibilitySpeciesToTank`,
      'risk override handler',
    );

    source = replaceOnce(
      source,
      "{isEn ? 'Step 2: Planning Assessment' : '第 2 步：规划判断'}",
      "{isEn ? 'Post-addition Risk Assessment' : '加入后风险判定'}",
      'risk assessment heading',
    );
    source = replaceOnce(
      source,
      `<div className="mt-1 text-lg font-black text-ink">\n                        {getTankCompatibilityStatusLabel(addFishCompatibilityReview.status)}\n                      </div>`,
      `<div className={\`mt-1 font-black \${addFishCompatibilityReview.status === 'not_recommended' ? 'text-[28px] leading-tight text-red-700' : 'text-lg text-ink'}\`}>\n                        {addFishCompatibilityReview.status === 'not_recommended'\n                          ? (isEn ? 'Not recommended to add' : '不建议加入')\n                          : getTankCompatibilityStatusLabel(addFishCompatibilityReview.status)}\n                      </div>`,
      'risk status prominence',
    );
    source = replaceOnce(
      source,
      `<p className="mt-1 text-[12px] font-bold leading-relaxed text-ink/62">`,
      `<p className={\`mt-2 leading-relaxed \${addFishCompatibilityReview.status === 'not_recommended' ? 'text-[14px] font-black text-red-800' : 'text-[12px] font-bold text-ink/62'}\`}>`,
      'risk summary prominence',
    );
    source = replaceOnce(
      source,
      `<div className="rounded-[14px] bg-white/72 p-3">\n                      <div className="text-[11px] font-black text-ink">{isEn ? 'Key Reasons' : '最关键的依据'}</div>`,
      `<div className={\`rounded-[16px] p-4 \${addFishCompatibilityReview.status === 'not_recommended' ? 'border-2 border-red-200 bg-white' : 'bg-white/72'}\`}>\n                      <div className={\`font-black \${addFishCompatibilityReview.status === 'not_recommended' ? 'text-[15px] text-red-700' : 'text-[11px] text-ink'}\`}>{isEn ? 'Key Reasons' : '不建议混养的原因'}</div>`,
      'risk reasons container',
    );
    source = replaceOnce(
      source,
      `<div key={\`${'${rule.code}-${rule.title}-${rule.evidence}'}\`} className="text-[11px] font-medium leading-relaxed text-ink/62">\n                            <span className="font-black text-ink/72">{rule.title}：</span>{rule.evidence}\n                          </div>`,
      `<div key={\`${'${rule.code}-${rule.title}-${rule.evidence}'}\`} className={\`leading-relaxed \${addFishCompatibilityReview.status === 'not_recommended' ? 'rounded-[12px] bg-red-50 px-3 py-2 text-[14px] font-bold text-red-900' : 'text-[11px] font-medium text-ink/62'}\`}>\n                            <span className={addFishCompatibilityReview.status === 'not_recommended' ? 'font-black text-red-800' : 'font-black text-ink/72'}>{rule.title}：</span>{rule.evidence}\n                          </div>`,
      'risk reason typography',
    );

    source = replaceAfter(
      source,
      "{isEn ? 'Step 1: Select Species' : '第 1 步：选择生物'}",
      `              <div className="relative">`,
      `              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">\n                {([\n                  { id: 'all', zh: '全部', en: 'All' },\n                  { id: 'fish', zh: '鱼类', en: 'Fish' },\n                  { id: 'shrimp', zh: '虾', en: 'Shrimp' },\n                  { id: 'snail', zh: '螺', en: 'Snails' },\n                  { id: 'crab', zh: '蟹', en: 'Crabs' },\n                  { id: 'plant', zh: '水草', en: 'Plants' },\n                  { id: 'coral', zh: '珊瑚', en: 'Coral' },\n                  { id: 'other', zh: '其他', en: 'Other' },\n                ] as const).map(category => {\n                  const count = category.id === 'all' ? fishData.length : fishData.filter(fish => getAddFishCategory(fish) === category.id).length;\n                  return (\n                    <button\n                      key={category.id}\n                      type="button"\n                      onClick={() => { setAddFishCategory(category.id); setAddFishCompatibilityReview(null); }}\n                      className={\`min-h-11 rounded-[14px] border px-2 py-2 text-[11px] font-black transition-colors \${addFishCategory === category.id ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-border bg-white text-ink/55'}\`}\n                    >\n                      <span className="block">{isEn ? category.en : category.zh}</span>\n                      <span className="mt-0.5 block text-[9px] opacity-55">{count}</span>\n                    </button>\n                  );\n                })}\n              </div>\n              <p className="rounded-[12px] bg-bg px-3 py-2 text-[10px] font-bold leading-5 text-ink/48">\n                {isEn ? 'Choose a broad group first, then a specific species. AquaGuide will not guess a strain or variant you did not choose.' : '先选生物大类，再选具体物种；系统不会自动猜测你没有确认的品系或变体。'}\n              </p>\n              <div className="relative">`,
      'category-first species picker',
    );
    source = replaceOnce(
      source,
      `{addFishList.map(fish => {`,
      `{addFishList.filter(fish => addFishCategory === 'all' || getAddFishCategory(fish) === addFishCategory).map(fish => {`,
      'category filtered species list',
    );

    source = replaceOnce(
      source,
      "                  {!addFishSuccess && (",
      `                  {!addFishSuccess && addFishCompatibilityReview?.status === 'not_recommended' && (\n                    <DialogFooter className="shrink-0 border-t border-red-100 bg-white/98 px-4 py-3 shadow-[0_-10px_24px_rgba(127,29,29,0.08)]">\n                      <div className="grid w-full gap-2 sm:grid-cols-3">\n                        <Button type="button" variant="outline" disabled={isAddFishSaving} onClick={() => setAddFishCompatibilityReview(null)} className="h-11 rounded-full text-sm font-black">\n                          {isEn ? 'Go back & adjust' : '返回调整'}\n                        </Button>\n                        <Button type="button" variant="outline" disabled={isAddFishSaving} onClick={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'ai-risk' } }))} className="h-11 rounded-full border-violet-200 bg-violet-50 text-sm font-black text-violet-800">\n                          {isEn ? 'AI advice' : 'AI 建议'}\n                        </Button>\n                        <Button type="button" disabled={isAddFishSaving} onClick={() => setIsRiskOverrideConfirmOpen(true)} className="h-11 rounded-full bg-red-700 text-sm font-black text-white hover:bg-red-800">\n                          {isEn ? 'Add anyway' : '仍要加入'}\n                        </Button>\n                      </div>\n                    </DialogFooter>\n                  )}\n                  {!addFishSuccess && addFishCompatibilityReview?.status !== 'not_recommended' && (`,
      'high-risk three-way decision footer',
    );

    source = replaceOnce(
      source,
      `      <Dialog open={isTankCopilotOpen} onOpenChange={setIsTankCopilotOpen}>`,
      `      <Dialog open={isRiskOverrideConfirmOpen} onOpenChange={setIsRiskOverrideConfirmOpen}>\n        <DialogContent showCloseButton={false} className="w-[92vw] max-w-[460px] rounded-[24px] border-red-100 bg-white p-0">\n          <DialogHeader className="border-b border-red-100 px-5 py-4 text-left">\n            <div className="inline-flex w-fit rounded-full bg-red-100 px-3 py-1 text-[11px] font-black text-red-800">{isEn ? 'HIGH RISK OVERRIDE' : '高风险确认'}</div>\n            <DialogTitle className="mt-2 text-[22px] font-black text-red-700">{isEn ? 'AquaGuide does not recommend this mix' : 'AquaGuide 不建议这个组合'}</DialogTitle>\n            <DialogDescription className="text-sm font-bold leading-6 text-ink/60">\n              {isEn ? 'If you continue, the species will be recorded in the tank and this explicit override will be saved for later risk reminders.' : '如果继续，这些生物会被记录到鱼缸，同时保存一次“已知风险仍加入”的确认记录，便于后续持续提示。'}\n            </DialogDescription>\n          </DialogHeader>\n          <div className="grid gap-2 px-5 py-4">\n            {addFishCompatibilityReview?.keyRules.slice(0, 4).map(rule => (\n              <div key={\`override-\${rule.code}-\${rule.evidence}\`} className="rounded-[14px] bg-red-50 px-3 py-3 text-[13px] font-bold leading-6 text-red-900">\n                <span className="font-black">{rule.title}：</span>{rule.evidence}\n              </div>\n            ))}\n          </div>\n          <DialogFooter className="grid gap-2 border-t border-red-100 px-5 py-4 sm:grid-cols-2">\n            <Button type="button" variant="outline" disabled={isAddFishSaving} onClick={() => setIsRiskOverrideConfirmOpen(false)} className="h-11 rounded-full text-sm font-black">\n              {isEn ? 'Cancel' : '返回调整'}\n            </Button>\n            <Button type="button" disabled={isAddFishSaving} onClick={() => void handleRiskOverrideAdd()} className="h-11 rounded-full bg-red-700 text-sm font-black text-white hover:bg-red-800">\n              {isAddFishSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}\n              {isEn ? 'I understand the risk, add anyway' : '我已了解风险，仍要加入'}\n            </Button>\n          </DialogFooter>\n        </DialogContent>\n      </Dialog>\n\n      <Dialog open={isTankCopilotOpen} onOpenChange={setIsTankCopilotOpen}>`,
      'risk override confirmation dialog',
    );

    source = replaceOnce(
      source,
      `当前参考：{activeAquarium.name} · {activeAquarium.waterType === 'Saltwater' ? '海水' : '淡水'} · {activeAquarium.targetTemperature || 25}°C`,
      `当前参考：{activeAquarium.name} · {activeAquarium.waterType === 'Saltwater' ? '海水' : activeAquarium.waterType === 'Freshwater' ? '淡水' : '水体未设置'} · {activeAquarium.targetTemperature ? \`${'${activeAquarium.targetTemperature}'}°C\` : '温度未设置'}`,
      'remove fake AI defaults',
    );

    const renderSettingsMarker = "  const renderSettingsPanel = (panel: NonNullable<typeof activeSettingsPanel>) => {";
    source = replaceAfter(
      source,
      renderSettingsMarker,
      `          <div className="grid grid-cols-3 gap-2">`,
      `          <div className="mb-3 grid gap-2">\n            <div className="flex items-center justify-between gap-2">\n              <div className="text-[11px] font-black text-ink/55">{isEn ? 'Common size presets' : '常用尺寸预设'}</div>\n              <span className="text-[9px] font-bold text-ink/35">{isEn ? 'Tap to confirm, editable afterwards' : '点击确认，之后仍可修改'}</span>\n            </div>\n            <div className="flex flex-wrap gap-2">\n              {[\n                { label: '40×25×20 · 20L', length: '40', width: '25', height: '20' },\n                { label: '45×30×25 · 34L', length: '45', width: '30', height: '25' },\n                { label: '50×30×30 · 45L', length: '50', width: '30', height: '30' },\n                { label: '60×30×35 · 63L', length: '60', width: '30', height: '35' },\n                { label: '75×40×30 · 90L', length: '75', width: '40', height: '30' },\n              ].map(preset => (\n                <button key={preset.label} type="button" onClick={() => setSettingsForm({ ...settingsForm, dimensions: { length: preset.length, width: preset.width, height: preset.height } })} className="min-h-10 rounded-full border border-emerald-100 bg-emerald-50 px-3 text-[10px] font-black text-emerald-800">\n                  {preset.label}\n                </button>\n              ))}\n            </div>\n          </div>\n          <div className="grid grid-cols-3 gap-2">`,
      'settings dimension presets',
    );
    source = replaceAfter(
      source,
      "    if (panel === 'parameters') {",
      `          <Label className="text-[11px] font-bold text-ink/55">{t('aquarium.targetTemp')}</Label>`,
      `          <div className="mb-2 flex flex-wrap gap-2">\n            {[22, 24, 25, 26, 28].map(temp => (\n              <button key={temp} type="button" onClick={() => setSettingsForm({ ...settingsForm, targetTemperature: String(temp) })} className={\`min-h-10 rounded-full border px-3 text-[11px] font-black \${settingsForm.targetTemperature === String(temp) ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-border bg-white text-ink/55'}\`}>\n                {temp}°C\n              </button>\n            ))}\n          </div>\n          <Label className="text-[11px] font-bold text-ink/55">{t('aquarium.targetTemp')}</Label>`,
      'settings temperature presets',
    );

    source = replaceAll(
      source,
      "t(`aquarium.${filterOptionKeys[settingsForm.equipment?.filter || '瀑布过滤'] || 'filterCascade'}`)",
      "settingsForm.equipment?.filter ? t(`aquarium.${filterOptionKeys[settingsForm.equipment.filter] || 'filterCascade'}`) : (isEn ? 'Filter not set' : '过滤未设置')",
    );
    source = replaceAll(
      source,
      "t(`aquarium.${lightOptionKeys[settingsForm.equipment?.light || '普通灯'] || 'lightNormal'}`)",
      "settingsForm.equipment?.light ? t(`aquarium.${lightOptionKeys[settingsForm.equipment.light] || 'lightNormal'}`) : (isEn ? 'Light not set' : '照明未设置')",
    );

    write(path, source);
  }
}

console.log('AquaGuide product UX closure migration applied.');
