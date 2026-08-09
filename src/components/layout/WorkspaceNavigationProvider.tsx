import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../common/ToastProvider';
import { loadAppStateFromStorage } from '../../services/storage/local-app-state';
import { getAquariumAiReadiness, type AquariumAiSetupPanel } from '../../services/aquarium/aquarium-setup.service';

// AQUAGUIDE_PRODUCT_UX_CLOSURE_V1

import type {
  NavigateToSectionOptions,
  WorkspaceNavigationContext,
  WorkspaceSectionId,
} from '../../types/navigation';

type WorkspaceNavigationValue = {
  navigateToRoute: (path: string) => void;
  navigateToView: (path: string, hash?: string) => void;
  navigateToSection: (sectionId: WorkspaceSectionId, options?: NavigateToSectionOptions) => Promise<boolean>;
  registerSection: (sectionId: WorkspaceSectionId, element: HTMLElement | null) => () => void;
  captureContext: (sourceId?: string) => WorkspaceNavigationContext;
  restoreContext: (context: WorkspaceNavigationContext) => Promise<boolean>;
  registerNavigationGuard: (guard: ((targetPath: string) => boolean) | null) => () => void;
};

const WorkspaceNavigationContextValue = createContext<WorkspaceNavigationValue | null>(null);

type FeaturePreviewState = {
  kind: 'auth' | 'ai';
  title: string;
  description: string;
  ready?: boolean;
  missing?: string[];
  firstPanel?: AquariumAiSetupPanel;
};

const isEnglishUi = () => typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('en');

const buildFeaturePreview = (kind: 'auth' | 'ai'): FeaturePreviewState => {
  const isEn = isEnglishUi();
  if (kind === 'auth') {
    return {
      kind,
      title: isEn ? 'Cloud sync is being built' : '云端同步 · 建设中',
      description: isEn
        ? 'Sign-in will later sync tanks, species, favorites and care history across devices. The current version continues to save data on this device.'
        : '未来登录后可跨设备同步鱼缸、物种、收藏与养护记录。当前版本继续使用本设备数据，不会进入尚未闭环的登录流程。',
    };
  }

  try {
    const state = loadAppStateFromStorage();
    const aquarium = state.aquariums.find(item => item.id === state.currentAquariumId) || state.aquariums[0];
    if (!aquarium) {
      return {
        kind,
        title: isEn ? 'AI features are being built' : 'AI 功能 · 建设中',
        description: isEn
          ? 'AI will use verified tank settings and AquaGuide safety rules to explain risks and personalize care. Create a tank and confirm its core parameters first.'
          : '未来 AI 会读取已确认的鱼缸参数，并结合 AquaGuide 安全规则解释风险和个性化养护。使用前需要先创建鱼缸并确认核心参数。',
        ready: false,
        missing: [isEn ? 'Create or select a tank first' : '先创建或选择一个鱼缸'],
        firstPanel: 'size',
      };
    }
    const readiness = getAquariumAiReadiness(aquarium);
    return {
      kind,
      title: isEn ? 'AI features are being built' : 'AI 功能 · 建设中',
      description: readiness.ready
        ? (isEn
          ? 'Your tank data meets the current AI-ready requirement. When released, AI will automatically use these settings instead of asking you to type them again.'
          : '当前鱼缸资料已经达到 AI 使用条件。功能开放后，AI 会自动读取这些已确认参数，不再要求你重复填写文字。')
        : (isEn
          ? 'AI will only activate after the core tank parameters below are confirmed, so it does not generate advice from guessed values.'
          : '为避免 AI 基于猜测数据生成建议，以下核心参数确认完成后才会开放 AI 能力。'),
      ready: readiness.ready,
      missing: readiness.missing.map(item => item.label),
      firstPanel: readiness.firstPanel,
    };
  } catch {
    return {
      kind,
      title: isEn ? 'AI features are being built' : 'AI 功能 · 建设中',
      description: isEn ? 'AI will be enabled after verified tank parameters are available.' : 'AI 会在鱼缸核心参数确认后开放。',
      ready: false,
      missing: [isEn ? 'Tank settings are not available yet' : '暂时无法读取鱼缸设置'],
      firstPanel: 'size',
    };
  }
};

const getWorkspaceScroller = () => document.querySelector<HTMLElement>('.desktop-workspace-scroll');

const getScrollTop = () => {
  const scroller = getWorkspaceScroller();
  return scroller ? scroller.scrollTop : window.scrollY;
};

const waitForLayout = () => new Promise<void>((resolve) => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => resolve());
  });
});

const getStickyOffset = (scroller: HTMLElement) => {
  const scrollerRect = scroller.getBoundingClientRect();
  let offset = 20;

  scroller.querySelectorAll<HTMLElement>('[data-workspace-sticky="true"]').forEach((element) => {
    const rect = element.getBoundingClientRect();
    const isPinned = rect.top <= scrollerRect.top + 4 && rect.bottom > scrollerRect.top;
    if (isPinned) {
      offset = Math.max(offset, rect.bottom - scrollerRect.top + 12);
    }
  });

  return offset;
};

const focusAndHighlight = (element: HTMLElement) => {
  const hadTabIndex = element.hasAttribute('tabindex');
  if (!hadTabIndex) element.setAttribute('tabindex', '-1');

  element.classList.add('workspace-section-highlight');
  element.focus({ preventScroll: true });

  window.setTimeout(() => {
    element.classList.remove('workspace-section-highlight');
    if (!hadTabIndex) element.removeAttribute('tabindex');
  }, 1200);
};

const scrollElementIntoWorkspace = (element: HTMLElement, behavior: ScrollBehavior) => {
  const scroller = getWorkspaceScroller();
  if (!scroller) {
    const top = window.scrollY + element.getBoundingClientRect().top - 20;
    window.scrollTo({ top: Math.max(0, top), behavior });
    focusAndHighlight(element);
    return;
  }

  const scrollerRect = scroller.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const top = scroller.scrollTop + elementRect.top - scrollerRect.top - getStickyOffset(scroller);
  scroller.scrollTo({ top: Math.max(0, top), behavior });
  focusAndHighlight(element);
};

export function WorkspaceNavigationProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const sectionsRef = useRef(new Map<WorkspaceSectionId, HTMLElement>());
  const navigationGuardRef = useRef<((targetPath: string) => boolean) | null>(null);
  const [featurePreview, setFeaturePreview] = useState<FeaturePreviewState | null>(null);

  const showFeaturePreview = useCallback((kind: 'auth' | 'ai') => {
    setFeaturePreview(buildFeaturePreview(kind));
  }, []);

  useEffect(() => {
    const handleFeaturePreviewEvent = (event: Event) => {
      const feature = (event as CustomEvent<{ feature?: string }>).detail?.feature || '';
      showFeaturePreview(feature.startsWith('auth') ? 'auth' : 'ai');
    };
    const handleFeatureClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button, a, [role="button"]') : null;
      if (!target) return;
      const href = target instanceof HTMLAnchorElement ? target.getAttribute('href') || '' : '';
      const text = (target.textContent || '').replace(/\s+/g, ' ').trim();
      if (/^\/login(?:[/?#]|$)/.test(href)) {
        event.preventDefault();
        event.stopPropagation();
        showFeaturePreview('auth');
        return;
      }
      if (/AI\s*(Tank Copilot|建缸助手|建议|养护|风险|Plan|Care)|(^|\s)AI($|\s)/i.test(text)) {
        event.preventDefault();
        event.stopPropagation();
        showFeaturePreview('ai');
      }
    };
    window.addEventListener('aquaguide:feature-preview', handleFeaturePreviewEvent as EventListener);
    document.addEventListener('click', handleFeatureClick, true);
    return () => {
      window.removeEventListener('aquaguide:feature-preview', handleFeaturePreviewEvent as EventListener);
      document.removeEventListener('click', handleFeatureClick, true);
    };
  }, [showFeaturePreview]);

  const registerNavigationGuard = useCallback((guard: ((targetPath: string) => boolean) | null) => {
    navigationGuardRef.current = guard;
    return () => {
      if (navigationGuardRef.current === guard) navigationGuardRef.current = null;
    };
  }, []);

  const canNavigate = useCallback((targetPath: string) => navigationGuardRef.current?.(targetPath) ?? true, []);

  const navigateToRoute = useCallback((path: string) => {
    if (/^\/login(?:[/?#]|$)/.test(path)) {
      showFeaturePreview('auth');
      return;
    }
    if (!canNavigate(path)) return;
    navigate(path);
  }, [canNavigate, navigate, showFeaturePreview]);

  const navigateToView = useCallback((path: string, hash = '') => {
    const targetPath = `${path}${hash}`;
    if (/^\/login(?:[/?#]|$)/.test(targetPath)) {
      showFeaturePreview('auth');
      return;
    }
    if (!canNavigate(targetPath)) return;
    navigate(targetPath);
  }, [canNavigate, navigate, showFeaturePreview]);

  const waitForSection = useCallback((sectionId: WorkspaceSectionId) => new Promise<HTMLElement>((resolve, reject) => {
    const findSection = () => sectionsRef.current.get(sectionId) ?? document.getElementById(sectionId);
    const existing = findSection();
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = findSection();
      if (!element) return;
      observer.disconnect();
      window.clearTimeout(timeoutId);
      resolve(element);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const timeoutId = window.setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Workspace section not found: ${sectionId}`));
    }, 2500);
  }), []);

  const navigateToSection = useCallback(async (
    sectionId: WorkspaceSectionId,
    options: NavigateToSectionOptions = {},
  ) => {
    const path = options.path ?? location.pathname;
    const updateHash = options.updateHash ?? true;
    const targetUrl = `${path}${updateHash ? `#${sectionId}` : ''}`;

    if (`${location.pathname}${location.hash}` !== targetUrl) {
      if (!canNavigate(targetUrl)) return false;
      navigate(targetUrl);
    }

    try {
      const element = await waitForSection(sectionId);
      scrollElementIntoWorkspace(element, options.behavior ?? 'smooth');
      return true;
    } catch (error) {
      console.error('Workspace navigation failed', error);
      showToast('目标内容暂不可用，请稍后重试', 'error');
      return false;
    }
  }, [canNavigate, location.hash, location.pathname, navigate, showToast, waitForSection]);

  const registerSection = useCallback((sectionId: WorkspaceSectionId, element: HTMLElement | null) => {
    if (element) sectionsRef.current.set(sectionId, element);
    return () => {
      if (sectionsRef.current.get(sectionId) === element) {
        sectionsRef.current.delete(sectionId);
      }
    };
  }, []);

  const captureContext = useCallback((sourceId?: string): WorkspaceNavigationContext => ({
    route: location.pathname,
    query: location.search,
    hash: location.hash,
    scrollTop: getScrollTop(),
    sourceId,
  }), [location.hash, location.pathname, location.search]);

  const restoreContext = useCallback(async (context: WorkspaceNavigationContext) => {
    const targetUrl = `${context.route}${context.query}${context.hash}`;
    if (`${location.pathname}${location.search}${location.hash}` !== targetUrl) {
      if (!canNavigate(targetUrl)) return false;
      navigate(targetUrl);
    }

    // Route and list state can both change while a detail surface closes. Wait
    // for the next painted layout before restoring the saved scroll position.
    await waitForLayout();
    const scroller = getWorkspaceScroller();
    if (scroller) {
      scroller.scrollTo({ top: context.scrollTop, behavior: 'auto' });
    } else {
      window.scrollTo({ top: context.scrollTop, behavior: 'auto' });
    }

    if (context.sourceId) {
      const source = document.getElementById(context.sourceId);
      if (source) {
        focusAndHighlight(source);
      }
    }
    return true;
  }, [canNavigate, location.hash, location.pathname, location.search, navigate]);

  const value = useMemo<WorkspaceNavigationValue>(() => ({
    navigateToRoute,
    navigateToView,
    navigateToSection,
    registerSection,
    captureContext,
    restoreContext,
    registerNavigationGuard,
  }), [captureContext, navigateToRoute, navigateToSection, navigateToView, registerNavigationGuard, registerSection, restoreContext]);

  return (
    <WorkspaceNavigationContextValue.Provider value={value}>
      {children}
      {featurePreview && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4" role="presentation">
          <button type="button" aria-label={isEnglishUi() ? 'Close preview' : '关闭说明'} className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={() => setFeaturePreview(null)} />
          <section role="dialog" aria-modal="true" aria-labelledby="feature-preview-title" className="relative w-full max-w-[460px] rounded-[26px] border border-white/80 bg-white p-5 text-ink shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
            <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-800">
              {isEnglishUi() ? 'COMING SOON' : '功能建设中'}
            </div>
            <h2 id="feature-preview-title" className="mt-3 text-[22px] font-black leading-tight">{featurePreview.title}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-ink/58">{featurePreview.description}</p>
            {featurePreview.kind === 'ai' && (featurePreview.missing?.length || 0) > 0 && (
              <div className="mt-4 rounded-[18px] border border-amber-100 bg-amber-50/75 p-4">
                <div className="text-xs font-black text-amber-900">{isEnglishUi() ? 'Confirm these before AI can be used' : 'AI 开放前需要先确认'}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {featurePreview.missing?.map(item => <span key={item} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-amber-800 shadow-sm">{item}</span>)}
                </div>
              </div>
            )}
            {featurePreview.kind === 'ai' && featurePreview.ready && (
              <div className="mt-4 rounded-[16px] bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-800">
                {isEnglishUi() ? 'Tank parameters ready ✓' : '鱼缸核心参数已确认 ✓'}
              </div>
            )}
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {featurePreview.kind === 'ai' && !featurePreview.ready && (
                <button type="button" onClick={() => {
                  const panel = featurePreview.firstPanel || 'size';
                  setFeaturePreview(null);
                  navigate(`/aquarium#settings-${panel}`);
                }} className="min-h-11 rounded-full bg-emerald-800 px-4 text-sm font-black text-white hover:bg-emerald-900">
                  {isEnglishUi() ? 'Complete tank settings' : '去完善鱼缸资料'}
                </button>
              )}
              <button type="button" onClick={() => setFeaturePreview(null)} className="min-h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-ink/65 hover:bg-slate-50">
                {isEnglishUi() ? 'Got it' : '我知道了'}
              </button>
            </div>
          </section>
        </div>
      )}
    </WorkspaceNavigationContextValue.Provider>
  );
}

export function useWorkspaceNavigation() {
  const context = useContext(WorkspaceNavigationContextValue);
  if (!context) {
    throw new Error('useWorkspaceNavigation must be used within WorkspaceNavigationProvider');
  }
  return context;
}
