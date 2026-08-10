import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, content) => {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log(`updated ${p}`);
};
const replaceRequired = (p, from, to, label = String(from).slice(0, 80)) => {
  const source = read(p);
  const next = typeof from === 'string' ? source.replace(from, to) : source.replace(from, to);
  if (next === source) throw new Error(`No match in ${p}: ${label}`);
  write(p, next);
};
const replaceOptional = (p, from, to) => {
  const source = read(p);
  const next = typeof from === 'string' ? source.replace(from, to) : source.replace(from, to);
  if (next !== source) write(p, next);
};

write('src/config/features.ts', `export type FeatureKey = 'auth' | 'achievements' | 'imageExport' | 'sharing';
export type FeatureStatus = 'live' | 'building';

type FeatureDefinition = {
  status: FeatureStatus;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
};

export const featureRegistry: Record<FeatureKey, FeatureDefinition> = {
  auth: {
    status: 'building',
    title: { zh: '云端同步', en: 'Cloud sync' },
    description: { zh: '跨设备同步鱼缸和养护记录。', en: 'Sync aquariums and care records across devices.' },
  },
  achievements: {
    status: 'building',
    title: { zh: '成就勋章', en: 'Achievements' },
    description: { zh: '记录长期养护里程碑。', en: 'Track long-term care milestones.' },
  },
  sharing: {
    status: 'building',
    title: { zh: '分享与隐私', en: 'Sharing & privacy' },
    description: { zh: '管理分享链接和隐私设置。', en: 'Manage share links and privacy settings.' },
  },
  imageExport: {
    status: 'building',
    title: { zh: '图片导出', en: 'Image export' },
    description: { zh: '将卡片保存为图片。', en: 'Save cards as images.' },
  },
};

export const isFeatureKey = (value: string | undefined | null): value is FeatureKey => (
  value === 'auth' || value === 'achievements' || value === 'imageExport' || value === 'sharing'
);

export const isBuildingFeature = (feature: FeatureKey) => featureRegistry[feature].status === 'building';
`);

write('src/components/common/ConfirmDialog.tsx', `import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onCancel(); }}>
      <DialogContent showCloseButton={false} className="w-[92vw] max-w-[420px] rounded-[22px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="min-h-11">{cancelLabel}</Button>
          <Button type="button" variant={destructive ? 'destructive' : 'default'} onClick={onConfirm} className="min-h-11">{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
`);

write('src/hooks/useUnsavedChangesGuard.ts', `import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type RegisterNavigationGuard = (guard: ((targetPath: string) => boolean) | null) => () => void;
type PendingIntent =
  | { kind: 'route'; path: string }
  | { kind: 'history'; delta: number }
  | { kind: 'action'; action: () => void };

export function useUnsavedChangesGuard({
  enabled,
  registerNavigationGuard,
  onBeforeConfirm,
}: {
  enabled: boolean;
  registerNavigationGuard: RegisterNavigationGuard;
  onBeforeConfirm?: () => void;
}) {
  const navigate = useNavigate();
  const [pendingIntent, setPendingIntent] = useState<PendingIntent | null>(null);
  const originIndexRef = useRef<number | null>(null);
  const restoringHistoryRef = useRef(false);
  const allowHistoryNavigationRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      originIndexRef.current = null;
      setPendingIntent(null);
      return;
    }
    const index = Number(window.history.state?.idx);
    originIndexRef.current = Number.isFinite(index) ? index : null;
  }, [enabled]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!enabled) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled]);

  useEffect(() => registerNavigationGuard(enabled
    ? (path) => {
      setPendingIntent({ kind: 'route', path });
      return false;
    }
    : null), [enabled, registerNavigationGuard]);

  useEffect(() => {
    if (!enabled) return;
    const handlePopState = (event: PopStateEvent) => {
      if (allowHistoryNavigationRef.current) {
        allowHistoryNavigationRef.current = false;
        return;
      }
      if (restoringHistoryRef.current) {
        restoringHistoryRef.current = false;
        return;
      }
      const originIndex = originIndexRef.current;
      const targetIndex = Number(event.state?.idx);
      if (originIndex === null || !Number.isFinite(targetIndex) || originIndex === targetIndex) return;
      const delta = targetIndex - originIndex;
      setPendingIntent({ kind: 'history', delta });
      restoringHistoryRef.current = true;
      window.history.go(-delta);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [enabled]);

  const requestAction = useCallback((action: () => void) => {
    if (!enabled) {
      action();
      return;
    }
    setPendingIntent({ kind: 'action', action });
  }, [enabled]);

  const cancelPending = useCallback(() => setPendingIntent(null), []);

  const confirmPending = useCallback(() => {
    const intent = pendingIntent;
    if (!intent) return;
    onBeforeConfirm?.();
    setPendingIntent(null);
    if (intent.kind === 'route') {
      navigate(intent.path);
      return;
    }
    if (intent.kind === 'history') {
      allowHistoryNavigationRef.current = true;
      window.history.go(intent.delta);
      return;
    }
    intent.action();
  }, [navigate, onBeforeConfirm, pendingIntent]);

  return {
    pending: Boolean(pendingIntent),
    requestAction,
    cancelPending,
    confirmPending,
  };
}
`);

// Explicit feature registry + explicit feature attributes. No visible-text inference.
{
  const p = 'src/components/layout/WorkspaceNavigationProvider.tsx';
  let s = read(p);
  s = s.replace("import { useToast } from '../common/ToastProvider';", "import { useToast } from '../common/ToastProvider';\nimport { featureRegistry, isBuildingFeature, isFeatureKey, type FeatureKey } from '../../config/features';");
  s = s.replace("  kind: 'auth' | 'achievements' | 'imageExport' | 'sharing';", '  kind: FeatureKey;');
  s = s.replace(/const buildFeaturePreview = \(kind: 'auth' \| 'achievements' \| 'imageExport' \| 'sharing'\): FeaturePreviewState => \{[\s\S]*?\n\};\n\nconst getWorkspaceScroller/, `const buildFeaturePreview = (kind: FeatureKey): FeaturePreviewState => {
  const isEn = isEnglishUi();
  const feature = featureRegistry[kind];
  return {
    kind,
    title: isEn ? feature.title.en : feature.title.zh,
    description: isEn ? feature.description.en : feature.description.zh,
  };
};

const getWorkspaceScroller`);
  s = s.replace("  const showFeaturePreview = useCallback((kind: 'auth' | 'achievements' | 'imageExport' | 'sharing') => {", '  const showFeaturePreview = useCallback((kind: FeatureKey) => {');
  s = s.replace(/    const resolveBuildingFeature = \(target: HTMLElement\): FeaturePreviewState\['kind'\] \| null => \{[\s\S]*?      return null;\n    \};/, `    const resolveBuildingFeature = (target: HTMLElement): FeaturePreviewState['kind'] | null => {
      const explicitTarget = target.closest<HTMLElement>('[data-feature-building]');
      const explicitFeature = explicitTarget?.dataset.featureBuilding;
      if (isFeatureKey(explicitFeature) && isBuildingFeature(explicitFeature)) return explicitFeature;
      const href = target instanceof HTMLAnchorElement ? target.getAttribute('href') || '' : '';
      if (/^\\/login(?:[/?#]|$)/.test(href)) return 'auth';
      return null;
    };`);
  s = s.replace(/    if \(\/\^\\\/collection\\\/achievements\(\?:\[\/?#\]\|\$\)\/\.test\(path\)\) \{\n      showFeaturePreview\('achievements'\);\n      return;\n    \}\n/g, '');
  s = s.replace(/    if \(\/\^\\\/collection\\\/achievements\(\?:\[\/?#\]\|\$\)\/\.test\(targetPath\)\) \{\n      showFeaturePreview\('achievements'\);\n      return;\n    \}\n/g, '');
  write(p, s);
}

// Navigation: remove achievements from normal sidebar IA, make submenu active state ignore auxiliary query params,
// and direct achievements URL render the same building page as the collection entry.
{
  const p = 'src/App.tsx';
  let s = read(p);
  s = s.replace("    { id: 'achievements', labelKey: 'nav.achievements', descriptionKey: 'nav.achievementsDescription', icon: Medal, path: '/collection/achievements' },\n", '');
  s = s.replace("  const activeMenu = activePath ? desktopSubMenus[activePath] || [] : [];", `  const activeMenu = activePath ? desktopSubMenus[activePath] || [] : [];
  const isSubMenuPathActive = (target: string) => {
    const [targetPathname, targetQuery = ''] = target.split('?');
    if (location.pathname !== targetPathname) return false;
    const required = new URLSearchParams(targetQuery);
    const current = new URLSearchParams(location.search);
    return Array.from(required.entries()).every(([key, value]) => current.get(key) === value);
  };`);
  s = s.replace("const isActive = item.path ? `${location.pathname}${location.search}` === item.path : location.hash === item.hash;", "const isActive = item.path ? isSubMenuPathActive(item.path) : location.hash === item.hash;");
  s = s.replace('<Route path="/collection/achievements" element={<Navigate to="/collection" replace />} />', '<Route path="/collection/achievements" element={page(<Collection module="achievements" />, \'collection-achievements\')} />');
  write(p, s);
}

// Navigation copy no longer presents achievements as a normal live collection module.
{
  const p = 'src/i18n/index.ts';
  let s = read(p);
  s = s.replace("collectionDescription: '种草、养护、纪念与勋章'", "collectionDescription: '种草、养护与纪念'");
  s = s.replace("collectionDescription: 'Wishlist, care, memorials & badges'", "collectionDescription: 'Wishlist, care & memorials'");
  s = s.replace("collectionDescription: 'Wishlist, care, memorials and badges'", "collectionDescription: 'Wishlist, care and memorials'");
  write(p, s);
}

// Collection hub: achievements entry navigates to its explicit building page and is visually muted.
{
  const p = 'src/pages/CollectionHub.tsx';
  let s = read(p);
  s = s.replace(/  const openModule = \(\) => \{\n    if \(id === 'achievements'\) \{[\s\S]*?    navigate\(moduleRoutes\[id\]\);\n  \};/, `  const openModule = () => {
    navigate(moduleRoutes[id]);
  };`);
  s = s.replace('className="flex min-h-[326px] min-w-0 flex-col rounded-[24px] border border-white/90 bg-white p-4 text-left shadow-sm"', "className={`flex min-h-[326px] min-w-0 flex-col rounded-[24px] border p-4 text-left ${id === 'achievements' ? 'border-slate-200 bg-slate-50 text-slate-500 shadow-none' : 'border-white/90 bg-white shadow-sm'}`}");
  write(p, s);
}

// All exposed sharing entry points use the explicit building feature state.
{
  const p = 'src/components/SpeciesDetailDialog.tsx';
  let s = read(p);
  s = s.replace('onClick={handleShare} className="flex h-11 w-11 items-center justify-center rounded-full bg-bg text-ink/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"', 'data-feature-building="sharing" onClick={() => window.dispatchEvent(new CustomEvent(\'aquaguide:feature-preview\', { detail: { feature: \'sharing\' } }))} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-400 shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"');
  write(p, s);
}
{
  const p = 'src/pages/CareEncyclopedia.tsx';
  let s = read(p);
  s = s.replace(/onOpenShare=\{\(\) => \{\n\s*setShareTopic\(selectedTopic\);\n\s*setShareMessage\(''\);\n\s*setCopyMessage\(''\);\n\s*\}\}/g, "onOpenShare={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))}");
  write(p, s);
}
{
  const p = 'src/pages/Collection.tsx';
  let s = read(p);
  s = s.replace('onOpenShare={() => void shareCareTopic(selectedTopic)}', "onOpenShare={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))}");
  write(p, s);
}

// Search result cards represent objects: species cards open the species profile just like care cards open care content.
{
  const p = 'src/pages/Search.tsx';
  let s = read(p);
  s = s.replace(/<button key=\{fish\.id\} id=\{`search-species-\$\{fish\.id\}`\} type="button" onClick=\{\(\) => \{[\s\S]*?window\.scrollTo\(\{ top: 0, behavior: window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches \? 'auto' : 'smooth' \}\);\n\s*\}\} className=/, `<button key={fish.id} id={\`search-species-\${fish.id}\`} type="button" onClick={() => openSearchResult(\`/encyclopedia?species=\${encodeURIComponent(fish.id)}&source=search\`, \`search-species-\${fish.id}\`)} className=`);
  s = s.replace("<Fish className=\"h-3.5 w-3.5\" />{isEn ? 'Select' : '选择'}", "<Fish className=\"h-3.5 w-3.5\" />{t('searchPage.viewDetails')}");
  write(p, s);
}

// AI assistant: card opens the object; saving is a separate control; clear uses shared ConfirmDialog.
{
  const p = 'src/pages/AIAssistant.tsx';
  let s = read(p);
  s = s.replace("import { addSpeciesFavorite, getSpeciesFavoriteIds, subscribeToFavorites } from '../services/favorites/favorites.service';", "import { addSpeciesFavorite, getSpeciesFavoriteIds, subscribeToFavorites } from '../services/favorites/favorites.service';\nimport { useWorkspaceNavigation } from '../components/layout/WorkspaceNavigationProvider';\nimport { ConfirmDialog } from '../components/common/ConfirmDialog';");
  s = s.replace("  const [messages, setMessages] = useState<Message[]>(() => loadSavedMessages(isEn));", "  const { navigateToRoute } = useWorkspaceNavigation();\n  const [messages, setMessages] = useState<Message[]>(() => loadSavedMessages(isEn));\n  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);");
  s = s.replace(/  const handleClearChat = \(\) => \{\n    if \(!confirm\([\s\S]*?\n  \};/, `  const handleClearChat = () => setIsClearConfirmOpen(true);
  const confirmClearChat = () => {
    setMessages([getWelcomeMessage(isEn)]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setIsClearConfirmOpen(false);
  };`);
  s = s.replace(/                            <button\n                              key=\{speciesId\}[\s\S]*?                            <\/button>/, `                            <div key={speciesId} className="flex items-center gap-2 rounded-sm border border-accent/15 bg-white px-2.5 py-2 transition-colors hover:border-accent md:max-w-[360px]">
                              <button
                                type="button"
                                onClick={() => navigateToRoute(\`/encyclopedia?species=\${encodeURIComponent(speciesId)}&source=assistant\`)}
                                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                              >
                                <img src={getSpeciesDisplayImage(species)} alt={species.name} className="h-9 w-12 shrink-0 object-contain" loading="lazy" />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[12px] font-black text-ink">{species.name}</span>
                                  <span className="block truncate text-[10px] font-bold text-ink/50">{species.category}</span>
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => addToWishlist(speciesId)}
                                disabled={isAdded}
                                aria-label={isAdded ? (isEn ? 'Saved' : '已收藏') : (isEn ? 'Save species' : '收藏物种')}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-accent hover:bg-accent/10 disabled:cursor-default disabled:opacity-65"
                              >
                                {isAdded ? <Heart className="h-4 w-4 fill-accent" /> : <Plus className="h-4 w-4" />}
                              </button>
                            </div>`);
  s = s.replace("      </div>\n    </div>\n  );\n}", `      </div>
      <ConfirmDialog
        open={isClearConfirmOpen}
        title={isEn ? 'Clear chat history?' : '清空历史对话？'}
        description={isEn ? 'This removes the saved AI assistant conversation from this browser.' : '这会删除当前浏览器中保存的 AI 助手历史对话。'}
        confirmLabel={isEn ? 'Clear' : '清空'}
        cancelLabel={isEn ? 'Cancel' : '取消'}
        destructive
        onConfirm={confirmClearChat}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
}`);
  write(p, s);
}

// Settings: shared unsaved-changes guard protects app navigation, browser history, refresh and onboarding reset.
{
  const p = 'src/pages/Settings.tsx';
  let s = read(p);
  s = s.replace("import { useEffect, useRef, useState } from 'react';", "import { useRef, useState } from 'react';");
  s = s.replace("import { useTranslation } from 'react-i18next';", "import { useTranslation } from 'react-i18next';\nimport { useNavigate } from 'react-router-dom';");
  s = s.replace("import { useLayoutMode } from '../components/layout/LayoutModeProvider';", "import { useLayoutMode } from '../components/layout/LayoutModeProvider';\nimport { ConfirmDialog } from '../components/common/ConfirmDialog';\nimport { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard';");
  s = s.replace("  const { navigateToRoute, registerNavigationGuard } = useWorkspaceNavigation();", "  const { registerNavigationGuard } = useWorkspaceNavigation();\n  const navigate = useNavigate();");
  s = s.replace(/\n  useEffect\(\(\) => \{\n    const handleBeforeUnload[\s\S]*?\n  \}, \[hasUnsavedFeedback\]\);\n\n  useEffect\(\(\) => registerNavigationGuard\([\s\S]*?\n    : null\), \[hasUnsavedFeedback, registerNavigationGuard\]\);\n/, `
  const unsavedGuard = useUnsavedChangesGuard({
    enabled: hasUnsavedFeedback,
    registerNavigationGuard,
  });
`);
  s = s.replace("onClick={() => { restartOnboarding(); navigateToRoute('/welcome'); }}", "onClick={() => unsavedGuard.requestAction(() => { restartOnboarding(); navigate('/welcome'); })}");
  s = s.replace("    </div>\n  );\n}\n", `      <ConfirmDialog
        open={unsavedGuard.pending}
        title={isEn ? 'Leave without submitting feedback?' : '放弃未提交的反馈？'}
        description={isEn ? 'Your current feedback text will not be submitted.' : '当前填写的反馈不会被提交。'}
        confirmLabel={isEn ? 'Leave' : '离开'}
        cancelLabel={isEn ? 'Keep editing' : '继续编辑'}
        destructive
        onConfirm={unsavedGuard.confirmPending}
        onCancel={unsavedGuard.cancelPending}
      />
    </div>
  );
}
`);
  write(p, s);
}

// Identify keeps its proven navigation semantics but uses the shared confirmation surface.
{
  const p = 'src/pages/Identify.tsx';
  let s = read(p);
  s = s.replace("import { useWorkspaceNavigation } from '../components/layout/WorkspaceNavigationProvider';", "import { useWorkspaceNavigation } from '../components/layout/WorkspaceNavigationProvider';\nimport { ConfirmDialog } from '../components/common/ConfirmDialog';");
  s = s.replace(/\n      \{pendingNavigationPath && \([\s\S]*?\n      \)\}\n    <\/main>/, `
      <ConfirmDialog
        open={Boolean(pendingNavigationPath)}
        title={t('identify.leaveTitle')}
        description={t('identify.leaveHint')}
        confirmLabel={t('identify.leave')}
        cancelLabel={t('identify.stay')}
        destructive
        onCancel={() => { pendingHistoryDeltaRef.current = null; setPendingNavigationPath(''); }}
        onConfirm={() => {
          const path = pendingNavigationPath;
          const historyDelta = pendingHistoryDeltaRef.current;
          pendingHistoryDeltaRef.current = null;
          setPendingNavigationPath('');
          cancelDiagnosisSession();
          if (path === '__reset__') { reset(); return; }
          if (path === '__history_back__') {
            if (historyDelta !== null) {
              allowHistoryNavigationRef.current = true;
              window.history.go(historyDelta);
            } else navigate('/encyclopedia', { replace: true });
            return;
          }
          navigate(path);
        }}
      />
    </main>`);
  write(p, s);
}

// Collection destructive confirmations use the shared confirmation component too.
{
  const p = 'src/pages/Collection.tsx';
  let s = read(p);
  s = s.replace("import { useWorkspaceNavigation } from '../components/layout/WorkspaceNavigationProvider';", "import { useWorkspaceNavigation } from '../components/layout/WorkspaceNavigationProvider';\nimport { ConfirmDialog } from '../components/common/ConfirmDialog';");
  s = s.replace(/\n      <Dialog open=\{Boolean\(pendingFishRemoval\)\}[\s\S]*?<\/Dialog>\n\n      <Dialog open=\{Boolean\(pendingCareRemoval\)\}[\s\S]*?<\/Dialog>/, `
      <ConfirmDialog
        open={Boolean(pendingFishRemoval)}
        title={isEn ? 'Remove this saved species?' : '移除这条种草？'}
        description={isEn ? \`${pendingFishRemoval?.name || 'This species'} will be removed from My Collection. You can save it again later.\` : \`“${pendingFishRemoval?.name || ''}”会从水族册移除，之后仍可在图鉴重新收藏。\`}
        confirmLabel={isEn ? 'Remove' : '确认移除'}
        cancelLabel={isEn ? 'Cancel' : '取消'}
        destructive
        onConfirm={removeFishFavorite}
        onCancel={() => setPendingFishRemoval(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingCareRemoval)}
        title={isEn ? 'Remove this saved guide?' : '移除这篇收藏？'}
        description={isEn ? \`${pendingCareRemoval?.title || 'This guide'} will be removed from My Collection. You can save it again later.\` : \`“${pendingCareRemoval?.title || ''}”会从水族册移除，之后仍可重新收藏。\`}
        confirmLabel={isEn ? 'Remove' : '确认移除'}
        cancelLabel={isEn ? 'Cancel' : '取消'}
        destructive
        onConfirm={removeCareFavorite}
        onCancel={() => setPendingCareRemoval(null)}
      />`);
  write(p, s);
}

// Handoff: preserve historical record and prepend the 2026-08-10 product/interaction baseline.
{
  const p = 'HANDOFF.md';
  let s = read(p);
  const marker = '## 2026-08-10 文案与交互一致性基线';
  if (!s.includes(marker)) {
    const section = `${marker}\n\n- 2026-08-10 已完成连续七轮用户可见文案审计：删除模型/provider/fallback/候选池/数据结构/原始错误等内部实现语言；普通用户界面不得直接展示 raw error.message。\n- 已确认产品事实边界：用户事实必须显式；未回答与明确“无”不同；高风险确定性规则与 AI 解释分离，AI 不得反转安全阻断。\n- 当前建设中功能统一为：云端同步/登录、成就勋章、图片导出、分享与隐私。建设中是显式 feature state，不能再依靠按钮文字或 DOM 正则猜测。\n- Interaction Contract：①浏览场景 Card=Open object；收藏/添加/删除/选择必须是独立 control。②只有明确选择任务允许 Card=Select。③Guard first, side effect second。④删除/清空/放弃未保存内容使用共享 ConfirmDialog，不新增 window.confirm。⑤侧栏 active 按业务 route/query 判断，source/item 等辅助参数不能破坏高亮。⑥同一建设中功能的所有入口必须表现一致。\n- Search 物种结果卡应打开物种档案；AI 助手提到的物种卡应打开物种档案，收藏为独立按钮。\n- Achievements 不属于当前正常 IA：可保留灰色建设中入口，但不得展示真实进度、自动解锁、目标或下一步。直接 URL 与点击入口应落到同一建设中 surface。\n- 分享/导出在转 live 之前不得保留 icon-only 绕过入口，不得一边在 Settings 标注建设中、一边仍调用 navigator.share/clipboard/PNG/print。\n- 未保存内容保护应覆盖应用内导航、浏览器返回/前进、刷新/关闭和 reset/restart；任何 reset/write/delete 副作用都必须发生在用户确认之后。\n- UI/导航改动合并前至少运行 build + 交互一致性回归检查；合并后必须确认 Vercel Production success 才能宣称上线。\n\n`;
    s = s.replace('# AquaGuide 交接文档\n', `# AquaGuide 交接文档\n\n${section}`);
    write(p, s);
  }
}

write('scripts/verify-interaction-consistency.mjs', `import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const provider = read('src/components/layout/WorkspaceNavigationProvider.tsx');
const app = read('src/App.tsx');
const settings = read('src/pages/Settings.tsx');
const assistant = read('src/pages/AIAssistant.tsx');
const search = read('src/pages/Search.tsx');
const collectionHub = read('src/pages/CollectionHub.tsx');
const speciesDetail = read('src/components/SpeciesDetailDialog.tsx');
const care = read('src/pages/CareEncyclopedia.tsx');
const collection = read('src/pages/Collection.tsx');
const handoff = read('HANDOFF.md');

assert(provider.includes("[data-feature-building]"), 'Feature gate must read explicit data-feature-building attributes.');
assert(!provider.includes("const text = (target.textContent"), 'Feature gate must not infer availability from visible text.');
assert(app.includes('isSubMenuPathActive'), 'Sidebar must use semantic submenu matching.');
assert(app.includes('<Collection module="achievements" />'), 'Direct achievements route must render the building surface.');
assert(!settings.includes('window.confirm('), 'Settings must not use window.confirm.');
assert(!assistant.includes('confirm(isEn'), 'AI assistant must not use native confirm.');
assert(settings.includes('useUnsavedChangesGuard'), 'Settings must use the shared unsaved changes guard.');
assert(search.includes('/encyclopedia?species=${encodeURIComponent(fish.id)}&source=search'), 'Search species cards must open the species object.');
assert(assistant.includes('source=assistant'), 'AI species cards must open species profiles.');
assert(assistant.includes('addToWishlist(speciesId)'), 'AI wishlist mutation must remain a separate control.');
assert(speciesDetail.includes('data-feature-building="sharing"'), 'Species detail sharing must be explicitly gated.');
assert(care.includes("detail: { feature: 'sharing' }"), 'Care sharing must use the building feature gate.');
assert(collection.includes("detail: { feature: 'sharing' }"), 'Collection care sharing must use the building feature gate.');
assert(collectionHub.includes('navigate(moduleRoutes[id])'), 'Collection hub building entry must navigate to its building page.');
assert(handoff.includes('2026-08-10 文案与交互一致性基线'), 'Handoff must include the current interaction baseline.');

if (failures.length) {
  console.error('Interaction consistency audit failed:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}
console.log('Interaction consistency audit passed.');
`);

// Add a reusable command without reformatting package.json.
{
  const p = 'package.json';
  let s = read(p);
  if (!s.includes('test:interaction-consistency')) {
    s = s.replace('"test:settings-feedback": "node scripts/verify-settings-feedback.mjs",', '"test:settings-feedback": "node scripts/verify-settings-feedback.mjs",\n    "test:interaction-consistency": "node scripts/verify-interaction-consistency.mjs",');
    write(p, s);
  }
}

console.log('Interaction consistency migration complete.');
