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
  kind: 'auth' | 'achievements' | 'imageExport' | 'sharing';
  title: string;
  description: string;
};

const isEnglishUi = () => typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('en');

const buildFeaturePreview = (kind: 'auth' | 'achievements' | 'imageExport' | 'sharing'): FeaturePreviewState => {
  const isEn = isEnglishUi();
  if (kind === 'auth') {
    return {
      kind,
      title: isEn ? 'Cloud sync is coming' : '云端同步 · 建设中',
      description: isEn ? 'Sign in will sync tanks and care records across devices.' : '登录后可跨设备同步鱼缸和养护记录。',
    };
  }
  if (kind === 'achievements') {
    return {
      kind,
      title: isEn ? 'Achievements are coming' : '成就勋章 · 建设中',
      description: isEn ? 'Track long-term care milestones.' : '记录你的养护里程碑。',
    };
  }
  if (kind === 'sharing') {
    return {
      kind,
      title: isEn ? 'Sharing is coming' : '分享功能 · 建设中',
      description: isEn ? 'Share links and privacy controls are being completed.' : '分享链接与隐私管理正在完善。',
    };
  }
  return {
    kind,
    title: isEn ? 'Image export is coming' : '图片导出 · 建设中',
    description: isEn ? 'Saving generated cards as images is being completed.' : '图片保存与导出功能正在完善。',
  };
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

  const showFeaturePreview = useCallback((kind: 'auth' | 'achievements' | 'imageExport' | 'sharing') => {
    setFeaturePreview(buildFeaturePreview(kind));
  }, []);

  useEffect(() => {
    const resolveBuildingFeature = (target: HTMLElement): FeaturePreviewState['kind'] | null => {
      const href = target instanceof HTMLAnchorElement ? target.getAttribute('href') || '' : '';
      const text = (target.textContent || '').replace(/\s+/g, ' ').trim();
      if (/^\/login(?:[/?#]|$)/.test(href)) return 'auth';
      if (/^\/collection\/achievements(?:[/?#]|$)/.test(href) || /成就勋章|Achievements|Badges/i.test(text)) return 'achievements';
      if (/分享与隐私|Sharing & privacy|生成分享报告|Create share report|生成报告链接|Create report link|打开导出与分享|Open export & share/i.test(text)) return 'sharing';
      if (/保存图片|Save image|保存 PNG|Save PNG|下载图片|Download image|预览并下载|Preview & download|导出物种卡片|Export species card|导出卡片|Export card|导出档案|Export archive|百日.*导出|Export.*milestone/i.test(text)) return 'imageExport';
      return null;
    };

    const markBuildingTargets = () => {
      document.querySelectorAll<HTMLElement>('button, a, [role="button"]').forEach(target => {
        const kind = resolveBuildingFeature(target);
        if (!kind) return;
        target.dataset.featureBuilding = kind;
        target.style.backgroundColor = '#f1f5f9';
        target.style.color = '#94a3b8';
        target.style.borderColor = '#e2e8f0';
        target.style.boxShadow = 'none';
      });
    };

    const handleFeaturePreviewEvent = (event: Event) => {
      const feature = (event as CustomEvent<{ feature?: string }>).detail?.feature || '';
      if (/^auth/i.test(feature)) showFeaturePreview('auth');
      else if (/achievement|badge|medal|成就|勋章/i.test(feature)) showFeaturePreview('achievements');
      else if (/share|sharing|分享/i.test(feature)) showFeaturePreview('sharing');
      else if (/image|export|download|导出|图片/i.test(feature)) showFeaturePreview('imageExport');
    };
    const handleFeatureClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button, a, [role="button"]') : null;
      if (!target) return;
      const kind = resolveBuildingFeature(target);
      if (!kind) return;
      event.preventDefault();
      event.stopPropagation();
      showFeaturePreview(kind);
    };
    markBuildingTargets();
    const observer = new MutationObserver(markBuildingTargets);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('aquaguide:feature-preview', handleFeaturePreviewEvent as EventListener);
    document.addEventListener('click', handleFeatureClick, true);
    return () => {
      observer.disconnect();
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
    if (/^\/collection\/achievements(?:[/?#]|$)/.test(path)) {
      showFeaturePreview('achievements');
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
    if (/^\/collection\/achievements(?:[/?#]|$)/.test(targetPath)) {
      showFeaturePreview('achievements');
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
            <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-500">
              {isEnglishUi() ? 'COMING SOON' : '功能建设中'}
            </div>
            <h2 id="feature-preview-title" className="mt-3 text-[22px] font-black leading-tight">{featurePreview.title}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-ink/58">{featurePreview.description}</p>
            <div className="mt-5">
              <button type="button" onClick={() => setFeaturePreview(null)} className="min-h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-ink/65 hover:bg-slate-50">
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
