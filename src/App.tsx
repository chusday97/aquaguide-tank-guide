/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, Suspense, useEffect, useMemo, useState, type CSSProperties, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { hydrateOnboardingFromProfile, ONBOARDING_SYNC_FAILED_EVENT, shouldStartOnboarding, subscribeToOnboardingAuth } from './services/onboarding/onboarding.service';
import {
  Activity,
  BookHeart,
  BookOpenCheck,
  BookOpen,
  ChevronLeft,
  Database,
  Droplets,
  Library,
  Medal,
  Heart,
  Skull,
  Settings,
  Search as SearchIcon,
  Camera,
  Plus,
} from 'lucide-react';
import { ToastProvider, useToast } from './components/common/ToastProvider';
import { WorkspaceNavigationProvider, useWorkspaceNavigation } from './components/layout/WorkspaceNavigationProvider';
import { LayoutModeProvider, useLayoutMode } from './components/layout/LayoutModeProvider';
import { OnboardingTaskCard } from './components/onboarding/OnboardingTaskCard';
import { DataRecoveryNotice, RouteErrorBoundary } from './components/common/RouteErrorBoundary';
import { lazyWithRecovery } from './lib/lazyWithRecovery';
import i18n from './i18n';
import {
  getAquariumNavigationSnapshot,
  subscribeToAquariumNavigation,
} from './services/aquarium/aquarium-navigation.service';
import { SearchAutocomplete } from './components/search/SearchAutocomplete';
import type { SearchSuggestion } from './services/search/search-suggestions.service';
import { taskRoutes } from './services/navigation/task-routes';

const loadAquarium = () => import('./pages/Aquarium');
const loadEncyclopedia = () => import('./pages/Encyclopedia');
const loadCare = () => import('./pages/CareEncyclopedia');
const loadCollection = () => import('./pages/Collection');
const loadCollectionHub = () => import('./pages/CollectionHub');
const loadMemorialDetail = () => import('./pages/MemorialDetail');
const loadProjectStructure = () => import('./pages/ProjectStructurePreview');
const loadInteractivePreview = () => import('./pages/InteractivePreview');
const loadLogin = () => import('./pages/Login');
const loadAdminContent = () => import('./pages/AdminContent');
const loadIdentify = () => import('./pages/Identify');
const loadThreeDemo = () => import('./pages/ThreeDemo').then(module => ({ default: module.ThreeDemo }));
const loadSearch = () => import('./pages/Search');
const loadSettings = () => import('./pages/Settings');
const loadWelcome = () => import('./pages/Welcome');
const loadSharedReport = () => import('./pages/SharedReport');

const AquariumManager = lazyWithRecovery(loadAquarium, 'aquarium');
const Encyclopedia = lazyWithRecovery(loadEncyclopedia, 'encyclopedia');
const CareEncyclopedia = lazyWithRecovery(loadCare, 'care');
const Collection = lazyWithRecovery(loadCollection, 'collection-module');
const CollectionHub = lazyWithRecovery(loadCollectionHub, 'collection-hub');
const MemorialDetail = lazyWithRecovery(loadMemorialDetail, 'memorial-detail');
const ProjectStructurePreview = lazyWithRecovery(loadProjectStructure, 'project-structure');
const InteractivePreview = lazyWithRecovery(loadInteractivePreview, 'interactive-preview');
const Login = lazyWithRecovery(loadLogin, 'login');
const AdminContent = lazyWithRecovery(loadAdminContent, 'admin-content');
const Identify = lazyWithRecovery(loadIdentify, 'identify');
const ThreeDemo = lazyWithRecovery(loadThreeDemo, '3d-demo');
const SearchPage = lazyWithRecovery(loadSearch, 'search');
const SettingsPage = lazyWithRecovery(loadSettings, 'settings');
const WelcomePage = lazyWithRecovery(loadWelcome, 'welcome');
const SharedReportPage = lazyWithRecovery(loadSharedReport, 'shared-report');

const preloadRoute = (path: string) => {
  const loader = path === '/aquarium'
    ? loadAquarium
    : path === '/encyclopedia'
      ? loadEncyclopedia
      : path === '/identify'
        ? loadIdentify
      : path === '/search'
        ? loadSearch
      : path === '/settings'
        ? loadSettings
      : path === '/care'
        ? loadCare
        : path === '/collection'
          ? loadCollectionHub
          : path.startsWith('/collection/memorial/')
            ? loadMemorialDetail
          : path.startsWith('/collection/')
            ? loadCollection
          : null;
  if (loader) void loader().catch(() => undefined);
};


const createWatermarkedImageSrc = (image: HTMLImageElement) => {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height) return null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const fontSize = Math.max(18, Math.round(Math.min(width, height) * 0.14));
  context.save();
  context.translate(width / 2, height / 2);
  context.rotate(-Math.PI / 10);
  context.font = `900 ${fontSize}px Arial, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'rgba(27, 77, 62, 0.26)';
  context.strokeStyle = 'rgba(255, 255, 255, 0.56)';
  context.lineWidth = Math.max(2, Math.round(fontSize * 0.08));
  context.strokeText('AquaGuide', 0, 0);
  context.fillText('AquaGuide', 0, 0);
  context.restore();

  return canvas.toDataURL('image/png');
};

const applySaveWatermark = (image: HTMLImageElement | null) => {
  if (!image || image.dataset.aquaguideWatermark === 'active') return;
  if (!image.complete || !image.currentSrc) return;

  try {
    const originalSrc = image.src;
    const watermarkedSrc = createWatermarkedImageSrc(image);
    if (!watermarkedSrc) return;

    image.dataset.aquaguideWatermark = 'active';
    image.dataset.aquaguideOriginalSrc = originalSrc;
    image.src = watermarkedSrc;

    window.setTimeout(() => {
      if (image.dataset.aquaguideOriginalSrc) {
        image.src = image.dataset.aquaguideOriginalSrc;
      }
      delete image.dataset.aquaguideWatermark;
      delete image.dataset.aquaguideOriginalSrc;
    }, 2600);
  } catch {
    delete image.dataset.aquaguideWatermark;
    delete image.dataset.aquaguideOriginalSrc;
  }
};

const getEventImage = (target: EventTarget | null) => {
  if (target instanceof HTMLImageElement) return target;
  if (target instanceof Element) return target.closest('img');
  return null;
};

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AquaGuide render error', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-[430px] items-center justify-center bg-[#eef4f1] p-5 text-ink md:max-w-none">
        <div className="w-full max-w-[430px] rounded-3xl bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.12)] md:max-w-[560px]">
          <div className="mb-3 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
            {i18n.t('common.pageError')}
          </div>
          <h1 className="text-xl font-black">{i18n.t('common.renderError')}</h1>
          <p className="mt-2 text-sm leading-6 text-ink/60">{i18n.t('common.renderErrorHint')}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" className="h-11 rounded-2xl bg-emerald-700 text-sm font-black text-white" onClick={() => this.setState({ error: null })}>{i18n.t('common.retry')}</button>
            <button type="button" className="h-11 rounded-2xl border border-emerald-100 bg-white text-sm font-black text-emerald-800" onClick={() => window.location.assign('/aquarium')}>{i18n.t('common.backToAquarium')}</button>
          </div>
        </div>
      </div>
    );
  }
}

const navItems = [
  { path: '/aquarium', labelKey: 'nav.aquarium', descriptionKey: 'nav.aquariumDescription', icon: Droplets },
  { path: '/encyclopedia', labelKey: 'nav.encyclopedia', descriptionKey: 'nav.encyclopediaDescription', icon: BookOpen },
  { path: '/care', labelKey: 'nav.care', descriptionKey: 'nav.careDescription', icon: Library },
  { path: '/collection', labelKey: 'nav.collection', descriptionKey: 'nav.collectionDescription', icon: BookHeart },
];

const mobileNavItems = navItems.map(item => item.path === '/collection' ? { ...item, labelKey: 'nav.collectionMobile' } : item);

const desktopSubMenus: Record<string, Array<{
  id: string;
  labelKey: string;
  descriptionKey: string;
  icon: typeof BookOpen;
  hash?: string;
  path?: string;
}>> = {
  '/encyclopedia': [
    { id: 'browse', labelKey: 'nav.browse', descriptionKey: 'nav.browseDescription', icon: BookOpen, path: taskRoutes.encyclopedia.browse },
    { id: 'compatibility', labelKey: 'nav.compatibility', descriptionKey: 'nav.compatibilityDescription', icon: Activity, path: taskRoutes.encyclopedia.compatibility },
  ],
  '/collection': [
    { id: 'wishlist', labelKey: 'nav.wishlist', descriptionKey: 'nav.wishlistDescription', icon: Heart, path: '/collection/wishlist' },
    { id: 'care', labelKey: 'nav.careFavorites', descriptionKey: 'nav.careFavoritesDescription', icon: BookOpenCheck, path: '/collection/care' },
    { id: 'memorial', labelKey: 'nav.memorial', descriptionKey: 'nav.memorialDescription', icon: Skull, path: '/collection/memorial' },
    { id: 'achievements', labelKey: 'nav.achievements', descriptionKey: 'nav.achievementsDescription', icon: Medal, path: '/collection/achievements' },
  ],
};

function BottomNavigation() {
  const location = useLocation();
  const { navigateToRoute } = useWorkspaceNavigation();
  const { t, i18n } = useTranslation();
  const shortEnglishLabels: Record<string, string> = {
    '/aquarium': 'Tank',
    '/encyclopedia': 'Species',
    '/care': 'Care',
    '/collection': 'Collection',
  };

  return (
    <>
      {/* ── 移动端：底部标签栏 ── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-white/95 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(26,26,26,0.06)] backdrop-blur-md">
        <div className="grid grid-cols-4 gap-1">
          {mobileNavItems.map((item) => {
            const isActive = item.path === '/collection'
              ? location.pathname.startsWith('/collection')
              : location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                  onClick={() => navigateToRoute(item.path)}
                  onMouseEnter={() => preloadRoute(item.path)}
                  onFocus={() => preloadRoute(item.path)}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center rounded-2xl text-[11px] font-bold transition-all",
                  isActive
                    ? "bg-accent text-white shadow-sm"
                    : "text-ink/50 hover:bg-accent-light hover:text-accent"
                )}
              >
                <Icon className={cn("mb-1 h-5 w-5", isActive ? "stroke-white" : "")} />
                <span className="min-w-0 max-w-full leading-tight">
                  {Boolean(i18n.language?.startsWith('en')) ? shortEnglishLabels[item.path] : t(item.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

    </>
  );
}

function DesktopSidebar({
  collapsed,
  onToggleCollapsed,
  autoCollapsed = false,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  autoCollapsed?: boolean;
}) {
  const location = useLocation();
  const { navigateToRoute, navigateToView } = useWorkspaceNavigation();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [searchDraft, setSearchDraft] = useState('');
  const [sidebarSuggestions, setSidebarSuggestions] = useState<SearchSuggestion[]>([]);
  const [sidebarSpeciesTotal, setSidebarSpeciesTotal] = useState(0);
  const [sidebarSuggestionsLoading, setSidebarSuggestionsLoading] = useState(false);
  const [sidebarSuggestionsError, setSidebarSuggestionsError] = useState('');
  const [selectedSidebarSpecies, setSelectedSidebarSpecies] = useState<SearchSuggestion | null>(null);
  const [aquariumNavigation, setAquariumNavigation] = useState(getAquariumNavigationSnapshot);
  const activePath = location.pathname === '/wishlist'
    ? '/collection'
    : location.pathname === '/care-favorites'
      ? '/collection'
      : location.pathname.startsWith('/collection')
        ? '/collection'
      : navItems.some(item => item.path === location.pathname) ? location.pathname : null;
  const activeMenu = activePath ? desktopSubMenus[activePath] || [] : [];

  useEffect(() => subscribeToAquariumNavigation(setAquariumNavigation), []);

  useEffect(() => {
    if (collapsed) return;
    let cancelled = false;
    setSidebarSuggestionsLoading(true);
    setSidebarSuggestionsError('');
    void Promise.all([
      import('./services/search/search-suggestions.service'),
      import('./data/fishData'),
      import('./data/careTopicsData'),
    ]).then(([searchModule, speciesModule, careModule]) => {
      if (cancelled) return;
      const currentAquarium = aquariumNavigation.aquariums.find(item => item.id === aquariumNavigation.currentAquariumId)
        || aquariumNavigation.aquariums[0]
        || null;
      const ownedQuantityBySpeciesId = new Map((currentAquarium?.fishes || []).map(item => [item.fishId, item.quantity]));
      const result = searchModule.getSearchSuggestions({
        query: searchDraft,
        locale: Boolean(i18n.language?.startsWith('en')) ? 'en' : 'zh-CN',
        scope: 'global',
        species: speciesModule.fishData,
        careTopics: careModule.careTopicsData,
        ownedQuantityBySpeciesId,
      });
      setSidebarSuggestions(result.suggestions);
      setSidebarSpeciesTotal(result.totalSpeciesMatches);
      setSidebarSuggestionsLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setSidebarSuggestions([]);
        setSidebarSpeciesTotal(0);
        setSidebarSuggestionsLoading(false);
        setSidebarSuggestionsError(t('searchPage.suggestionsUnavailable'));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [aquariumNavigation, collapsed, searchDraft, i18n.language, t]);

  const handlePrimaryNav = (path: string) => {
    navigateToRoute(path);
  };

  const handleSubNav = (item: (typeof activeMenu)[number]) => {
    if (item.path) navigateToRoute(item.path);
    else if (item.hash && activePath) navigateToView(activePath, item.hash);
  };

  const handleAquariumSwitch = (aquariumId: string) => {
    if (!aquariumNavigation.aquariums.some(aquarium => aquarium.id === aquariumId)) {
      showToast('没有找到要切换的鱼缸。', 'error');
      return;
    }
    navigateToRoute(`/aquarium?tank=${encodeURIComponent(aquariumId)}`);
  };

  return (
    <aside
      aria-label="AquaGuide 桌面导航"
      className={cn(
        'desktop-sidebar fixed inset-y-0 left-0 z-50 hidden border-r border-white/70 bg-[#F8FAF8]/95 shadow-[18px_0_48px_rgba(27,77,62,0.08)] backdrop-blur-xl md:flex',
        collapsed ? 'w-[76px]' : 'w-[280px]'
      )}
    >
      <div className="flex min-h-0 w-full flex-col">
        <div className={cn('flex shrink-0 items-center gap-3 px-4 pb-5 pt-5', collapsed && 'justify-center px-2')}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-emerald-700 to-emerald-500 text-white shadow-[0_12px_26px_rgba(27,77,62,0.22)]">
            <Droplets className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[19px] font-black leading-tight text-ink">AquaGuide</div>
              <div className="mt-0.5 text-[12px] font-bold text-ink/42">{t('nav.assistant')}</div>
            </div>
          )}
        </div>

        {!autoCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="absolute -right-[22px] top-6 flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white text-ink/50 shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        )}

        <nav className="app-scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          <div className={cn('mb-4 grid gap-2', collapsed ? 'justify-items-center' : 'grid-cols-[minmax(0,1fr)_44px]')}>
            {collapsed ? (
              <button type="button" onClick={() => navigateToRoute('/search')} title={t('searchPage.title')} aria-label={t('searchPage.title')} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ink/55 shadow-sm hover:text-emerald-700"><SearchIcon className="h-5 w-5" /></button>
            ) : (
              <div className="min-w-0">
                <SearchAutocomplete
                  value={searchDraft}
                  suggestions={sidebarSuggestions}
                  selectedSpecies={selectedSidebarSpecies}
                  placeholder={t('searchPage.shortPlaceholder')}
                  inputLabel={t('searchPage.placeholder')}
                  submitLabel={t('searchPage.submit')}
                  viewDetailsLabel={t('searchPage.viewDetails')}
                  reselectLabel={t('searchPage.chooseAgain')}
                  speciesGroupLabel={t('searchPage.speciesCandidates')}
                  careGroupLabel={t('searchPage.careCandidates')}
                  relatedGroupLabel={t('searchPage.relatedSearches')}
                  filterGroupLabel={t('searchPage.filterSuggestions')}
                  ownedLabel={quantity => t('searchPage.ownedQuantity', { count: quantity })}
                  totalSpeciesMatches={sidebarSpeciesTotal}
                  viewAllSpeciesLabel={count => t('searchPage.viewAllSpecies', { count })}
                  compact
                  hideSubmit
                  onValueChange={value => {
                    setSearchDraft(value);
                    setSelectedSidebarSpecies(null);
                  }}
                  onSelectSuggestion={suggestion => {
                    if (suggestion.kind === 'species') {
                      setSearchDraft(suggestion.query);
                      setSelectedSidebarSpecies(suggestion);
                      return;
                    }
                    if (suggestion.kind === 'care' && suggestion.targetId) {
                      navigateToRoute(`/care?topic=${encodeURIComponent(suggestion.targetId)}&source=search`);
                      return;
                    }
                    setSearchDraft(suggestion.query);
                    navigateToRoute(`/search?q=${encodeURIComponent(suggestion.query)}`);
                  }}
                  onSubmit={value => navigateToRoute(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : '/search')}
                  onViewSelected={suggestion => suggestion.targetId && navigateToRoute(`/encyclopedia?species=${encodeURIComponent(suggestion.targetId)}&source=search`)}
                  onReselect={() => setSelectedSidebarSpecies(null)}
                  onViewAllSpecies={() => navigateToRoute(searchDraft.trim() ? `/search?q=${encodeURIComponent(searchDraft.trim())}` : '/search')}
                />
                {(sidebarSuggestionsLoading || sidebarSuggestionsError) && (
                  <p
                    className={cn('mt-1 px-1 text-[11px] leading-4', sidebarSuggestionsError ? 'text-rose-700' : 'text-ink/48')}
                    role="status"
                  >
                    {sidebarSuggestionsError || t('searchPage.loadingSuggestions')}
                  </p>
                )}
              </div>
            )}
            <button type="button" onClick={() => navigateToRoute('/identify')} title={t('identify.entry')} aria-label={t('identify.entry')} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ink/55 shadow-sm hover:text-emerald-700"><Camera className="h-5 w-5" /></button>
          </div>
          <div className="grid gap-2">
            {navItems.map((item) => {
              const isActive = activePath === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handlePrimaryNav(item.path)}
                  onMouseEnter={() => preloadRoute(item.path)}
                  onFocus={() => preloadRoute(item.path)}
                  title={collapsed ? t(item.labelKey) : undefined}
                  className={cn(
                    'flex min-h-[58px] w-full items-center gap-3 rounded-[20px] px-3 text-left transition-colors',
                    collapsed && 'justify-center px-2',
                    isActive
                      ? 'bg-accent text-white shadow-[0_14px_28px_rgba(27,77,62,0.18)]'
                      : 'text-ink/58 hover:bg-white hover:text-accent'
                  )}
                >
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px]', isActive ? 'bg-white/15 text-white' : 'bg-white text-ink/46')}>
                    <Icon className="h-5 w-5" />
                  </span>
                  {!collapsed && (
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-black leading-tight">{t(item.labelKey)}</span>
                      <span className={cn('mt-1 block truncate text-[10px] font-bold leading-tight', isActive ? 'text-white/65' : 'text-ink/36')}>
                        {t(item.descriptionKey)}
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {activePath === '/aquarium' && (
            <section className={cn('mt-4 border-t border-ink/6 pt-4', collapsed && 'pt-3')} aria-label="切换鱼缸">
              {!collapsed && <div className="mb-2 px-2 text-[10px] font-black tracking-[0.12em] text-ink/35">我的鱼缸</div>}
              {aquariumNavigation.aquariums.length > 0 && (
                <div className="app-scrollbar-hidden grid max-h-[146px] gap-1.5 overflow-y-auto">
                  {aquariumNavigation.aquariums.map(aquarium => {
                    const isCurrent = aquarium.id === aquariumNavigation.currentAquariumId;
                    const total = aquarium.fishes.reduce((sum, item) => sum + Math.max(0, item.quantity || 0), 0);
                    return (
                      <button
                        key={aquarium.id}
                        type="button"
                        onClick={() => handleAquariumSwitch(aquarium.id)}
                        aria-current={isCurrent ? 'true' : undefined}
                        title={collapsed ? aquarium.name : undefined}
                        className={cn(
                          'flex min-h-11 w-full min-w-0 items-center gap-2 rounded-[15px] px-2.5 text-left transition-colors',
                          collapsed && 'justify-center px-0',
                          isCurrent ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100' : 'text-ink/52 hover:bg-white hover:text-accent'
                        )}
                      >
                        <Droplets className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12px] font-black">{aquarium.name}</span>
                            <span className="block text-[9px] font-bold opacity-55">{total} 只/条</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                type="button"
                onClick={() => navigateToRoute(taskRoutes.aquarium.create())}
                aria-label={t('aquarium.newTank')}
                title={collapsed ? t('aquarium.newTank') : undefined}
                className={cn(
                  'mt-2 flex min-h-11 w-full min-w-0 items-center gap-2 rounded-[15px] border border-dashed border-emerald-200 px-2.5 text-left text-emerald-800 transition-colors hover:bg-emerald-50',
                  collapsed && 'justify-center px-0'
                )}
              >
                <Plus className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="text-[12px] font-black">{t('aquarium.newTank')}</span>}
              </button>
              {!collapsed && <OnboardingTaskCard variant="sidebar" />}
            </section>
          )}

          {activeMenu.length > 0 && (
          <div className={cn('mt-6 border-t border-ink/6 pt-4', collapsed && 'mt-4 pt-3')}>
            <div className="grid gap-1.5">
              {activeMenu.map((item) => {
                const Icon = item.icon;
                const isActive = item.path ? `${location.pathname}${location.search}` === item.path : location.hash === item.hash;
                return (
                  <button
                    key={item.id}
                    type="button"
                      title={collapsed ? t(item.labelKey) : undefined}
                    onClick={() => handleSubNav(item)}
                    className={cn(
                      'flex min-h-[50px] items-center gap-3 rounded-[16px] px-3 text-left transition-colors',
                      collapsed && 'justify-center px-2',
                      isActive
                        ? 'bg-white text-accent shadow-sm ring-1 ring-emerald-100'
                        : 'text-ink/55 hover:bg-white/80 hover:text-accent'
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && (
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-black leading-tight">{t(item.labelKey)}</span>
                        <span className="mt-0.5 block truncate text-[9px] font-bold leading-tight text-ink/34">{t(item.descriptionKey)}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          )}
        </nav>

        <div className={cn('shrink-0 border-t border-ink/6 py-4', collapsed ? 'px-3' : 'px-5')}>
          <button
            type="button"
            onClick={() => navigateToRoute('/settings')}
            title={collapsed ? t('common.settings') : undefined}
            aria-label={t('common.settings')}
            className={cn('flex min-h-11 w-full items-center gap-3 rounded-[16px] bg-white px-3 text-left text-ink/58 shadow-sm transition-colors hover:text-emerald-700', collapsed && 'justify-center px-0')}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-[13px] font-black">{t('common.settings')}</span>}
          </button>
          {!collapsed && (
            <>
            <div className="flex items-start gap-2 rounded-[18px] bg-white/80 px-3 py-3 text-[11px] font-bold leading-relaxed text-ink/45 shadow-sm">
              <Database className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              {t('common.localDataHint')}
            </div>
            <div className="mt-3 text-[10px] font-black text-ink/28">AquaGuide v1.0</div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function PageLoading() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60dvh] items-center justify-center rounded-sm border border-border bg-white p-6 text-center">
      <div>
        <div className="mx-auto mb-3 h-10 w-10 animate-pulse rounded-full bg-accent-light" />
        <p className="text-sm font-bold text-ink/70">{t('common.loading')}</p>
        <p className="mt-1 text-[11px] font-medium text-ink/45">{t('common.loadingHint')}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <Router>
        <ToastProvider>
          <LayoutModeProvider>
            <WorkspaceNavigationProvider>
              <AppShell />
            </WorkspaceNavigationProvider>
          </LayoutModeProvider>
        </ToastProvider>
      </Router>
    </AppErrorBoundary>
  );
}

function AppShell() {
  const location = useLocation();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isPhoneLayout } = useLayoutMode();
  const [preferencesReady, setPreferencesReady] = useState(false);
  const isStructurePreview = location.pathname === '/project-structure';
  const isInteractivePreview = location.pathname === '/_preview/interactive';
  const isLogin = location.pathname === '/login';
  const isAdminContent = location.pathname === '/admin/content';
  const isWelcome = location.pathname === '/welcome';
  const isSharedReport = location.pathname.startsWith('/report/');
  const isAquariumHomepage = location.pathname === '/aquarium';
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('aquaguide_desktop_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isNarrowDesktop, setIsNarrowDesktop] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
  ));

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023px)');
    const sync = () => setIsNarrowDesktop(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const handleSyncFailure = () => showToast(t('onboarding.syncFailed'), 'error');
    window.addEventListener(ONBOARDING_SYNC_FAILED_EVENT, handleSyncFailure);
    let active = true;
    void hydrateOnboardingFromProfile().finally(() => {
      if (active) setPreferencesReady(true);
    });
    const unsubscribeAuth = subscribeToOnboardingAuth(() => {
      void hydrateOnboardingFromProfile().finally(() => {
        if (active) setPreferencesReady(true);
      });
    });
    return () => {
      active = false;
      unsubscribeAuth();
      window.removeEventListener(ONBOARDING_SYNC_FAILED_EVENT, handleSyncFailure);
    };
  }, [showToast, t]);

  const effectiveSidebarCollapsed = isNarrowDesktop || isAquariumHomepage || isDesktopSidebarCollapsed;
  const desktopShellStyle = useMemo(() => ({
    '--desktop-sidebar-width': effectiveSidebarCollapsed ? '76px' : '280px',
  }) as CSSProperties, [effectiveSidebarCollapsed]);

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('aquaguide_desktop_sidebar_collapsed', String(next));
      } catch {
        // localStorage can be unavailable in private contexts.
      }
      return next;
    });
  };

  useEffect(() => {
    const root = document.querySelector('.aquaguide-app');
    if (!root) return;

    let touchTimer: number | null = null;
    const clearTouchTimer = () => {
      if (touchTimer !== null) {
        window.clearTimeout(touchTimer);
        touchTimer = null;
      }
    };

    const handleContextMenu = (event: Event) => {
      applySaveWatermark(getEventImage(event.target));
    };

    const handlePointerDown = (event: Event) => {
      const pointerEvent = event as PointerEvent;
      if (pointerEvent.pointerType !== 'touch' && pointerEvent.pointerType !== 'pen') return;
      const image = getEventImage(event.target);
      if (!image) return;
      clearTouchTimer();
      touchTimer = window.setTimeout(() => applySaveWatermark(image), 520);
    };

    root.addEventListener('contextmenu', handleContextMenu, true);
    root.addEventListener('dragstart', handleContextMenu, true);
    root.addEventListener('pointerdown', handlePointerDown, true);
    root.addEventListener('pointerup', clearTouchTimer, true);
    root.addEventListener('pointercancel', clearTouchTimer, true);

    return () => {
      clearTouchTimer();
      root.removeEventListener('contextmenu', handleContextMenu, true);
      root.removeEventListener('dragstart', handleContextMenu, true);
      root.removeEventListener('pointerdown', handlePointerDown, true);
      root.removeEventListener('pointerup', clearTouchTimer, true);
      root.removeEventListener('pointercancel', clearTouchTimer, true);
    };
  }, []);

  if (!preferencesReady && !isStructurePreview && !isInteractivePreview && !isLogin && !isAdminContent && !isSharedReport) return <PageLoading />;

  if (isSharedReport) {
    return (
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/report/:token" element={<RouteErrorBoundary page="shared-report"><SharedReportPage /></RouteErrorBoundary>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  if (isStructurePreview) {
    return (
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/project-structure" element={<ProjectStructurePreview />} />
          <Route path="*" element={<Navigate to="/project-structure" replace />} />
        </Routes>
      </Suspense>
    );
  }

  if (isInteractivePreview) {
    return (
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/_preview/interactive" element={<InteractivePreview />} />
          <Route path="*" element={<Navigate to="/_preview/interactive" replace />} />
        </Routes>
      </Suspense>
    );
  }

  if (isLogin) {
    return (
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  if (isAdminContent) {
    return (
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/admin/content" element={<RouteErrorBoundary page="admin-content"><AdminContent /></RouteErrorBoundary>} />
          <Route path="*" element={<Navigate to="/admin/content" replace />} />
        </Routes>
      </Suspense>
    );
  }

  if (isWelcome) {
    return (
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/welcome" element={<RouteErrorBoundary page="welcome"><WelcomePage /></RouteErrorBoundary>} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </Suspense>
    );
  }

  if (isPhoneLayout) return <MobileAppShell />;

  return (
    <>
      <DesktopAppShell
        collapsed={effectiveSidebarCollapsed}
        autoCollapsed={isNarrowDesktop || isAquariumHomepage}
        onToggleCollapsed={toggleDesktopSidebar}
        style={desktopShellStyle}
      />
    </>
  );
}

function CollectionEntry() {
  const location = useLocation();
  const tab = new URLSearchParams(location.search).get('tab');
  const routeByTab: Record<string, string> = {
    wishlist: '/collection/wishlist',
    care: '/collection/care',
    memorial: '/collection/memorial',
    achievements: '/collection/achievements',
  };
  if (tab && routeByTab[tab]) return <Navigate to={routeByTab[tab]} replace />;
  return <CollectionHub />;
}

function NotFoundPage() {
  const { navigateToRoute } = useWorkspaceNavigation();
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  return (
    <section className="mx-auto flex min-h-[70dvh] w-full max-w-[720px] items-center justify-center px-4 py-10 text-center">
      <div className="w-full rounded-[28px] border border-white/80 bg-white p-7 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-emerald-50 text-emerald-700">
          <SearchIcon className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-black text-ink">{isEn ? 'Page not found' : '没有找到这个页面'}</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-ink/52">
          {isEn ? 'This entry may have changed. Return to your tank or search species and care guides.' : '这个入口可能已经更新。你可以回到鱼缸，或搜索物种和养护指南。'}
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => navigateToRoute('/aquarium')} className="h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white hover:bg-emerald-800">
            {isEn ? 'Back to My Tank' : '返回我的鱼缸'}
          </button>
          <button type="button" onClick={() => navigateToRoute('/search')} className="h-11 rounded-full border border-emerald-200 bg-white px-5 text-sm font-black text-emerald-800 hover:bg-emerald-50">
            {isEn ? 'Search' : '搜索内容'}
          </button>
        </div>
      </div>
    </section>
  );
}

function WorkspaceRoutes() {
  const page = (content: ReactNode, name: string) => <RouteErrorBoundary page={name}>{content}</RouteErrorBoundary>;
  return (
    <>
      <DataRecoveryNotice />
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Navigate to={shouldStartOnboarding() ? '/welcome' : '/aquarium'} replace />} />
          <Route path="/login" element={page(<Login />, 'login')} />
          <Route path="/encyclopedia" element={page(<Encyclopedia />, 'encyclopedia')} />
          <Route path="/identify" element={page(<Identify />, 'identify')} />
          <Route path="/search" element={page(<SearchPage />, 'search')} />
          <Route path="/settings" element={page(<SettingsPage />, 'settings')} />
          <Route path="/welcome" element={page(<WelcomePage />, 'welcome')} />
          <Route path="/care" element={page(<CareEncyclopedia />, 'care')} />
          <Route path="/collection" element={page(<CollectionEntry />, 'collection')} />
          <Route path="/collection/wishlist" element={page(<Collection module="wishlist" />, 'collection-wishlist')} />
          <Route path="/collection/care" element={page(<Collection module="care" />, 'collection-care')} />
          <Route path="/collection/memorial/:recordId" element={page(<MemorialDetail />, 'collection-memorial-detail')} />
          <Route path="/collection/memorial" element={page(<Collection module="memorial" />, 'collection-memorial')} />
          <Route path="/collection/achievements" element={page(<Collection module="achievements" />, 'collection-achievements')} />
          <Route path="/wishlist" element={<Navigate to="/collection/wishlist" replace />} />
          <Route path="/care-favorites" element={<Navigate to="/collection/care" replace />} />
          <Route path="/aquarium" element={shouldStartOnboarding() ? <Navigate to="/welcome" replace /> : page(<AquariumManager />, 'aquarium')} />
          <Route path="/3d-demo" element={page(<ThreeDemo />, '3d-demo')} />
          <Route path="/admin/content" element={page(<AdminContent />, 'admin-content')} />
          <Route path="*" element={page(<NotFoundPage />, 'not-found')} />
        </Routes>
      </Suspense>
    </>
  );
}

function DesktopAppShell({
  collapsed,
  autoCollapsed,
  onToggleCollapsed,
  style,
}: {
  collapsed: boolean;
  autoCollapsed: boolean;
  onToggleCollapsed: () => void;
  style: CSSProperties;
}) {
  return (
    <div
      className="aquaguide-app desktop-shell-active flex min-h-[100dvh] flex-col overflow-hidden bg-[#dfe8e5] text-ink"
      style={style}
      data-layout-mode="desktop"
    >
      <DesktopSidebar collapsed={collapsed} autoCollapsed={autoCollapsed} onToggleCollapsed={onToggleCollapsed} />
      <div className="desktop-too-narrow" role="status" aria-live="polite">
        <div className="rounded-[28px] bg-white p-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-accent">
            <ChevronLeft className="h-5 w-5" />
          </div>
          <div className="text-lg font-black text-ink">当前窗口太窄</div>
          <p className="mt-2 text-sm font-bold leading-6 text-ink/55">
            桌面工作台需要更多横向空间。请放大窗口，或收起左侧栏后继续使用。
          </p>
        </div>
      </div>
      <div className="app-main-shell flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-transparent">
        <main className="app-scrollbar-hidden desktop-workspace-scroll min-h-0 flex-1 overflow-y-auto">
          <div className={`desktop-canvas mx-auto w-full ${window.location.pathname === '/aquarium' ? 'desktop-canvas--aquarium' : ''}`}>
            <WorkspaceRoutes />
          </div>
        </main>
      </div>
    </div>
  );
}

function MobileAppShell() {
  const { navigateToRoute } = useWorkspaceNavigation();
  const { t } = useTranslation();
  return (
    <div
      className="aquaguide-app phone-shell-active flex min-h-[100dvh] flex-col overflow-x-hidden bg-[#dfe8e5] text-ink"
      data-layout-mode="phone"
    >
      <div className="app-main-shell mx-auto flex min-h-0 w-full max-w-[430px] flex-1 flex-col overflow-hidden bg-bg shadow-2xl">
        <header className="flex shrink-0 items-center justify-end gap-1 border-b border-ink/5 bg-white/92 px-3 pb-2 pt-[calc(8px+env(safe-area-inset-top))] backdrop-blur-md">
          <button type="button" onClick={() => navigateToRoute('/search')} aria-label={t('searchPage.title')} className="flex h-11 w-11 items-center justify-center rounded-2xl text-ink/55 hover:bg-emerald-50 hover:text-emerald-700"><SearchIcon className="h-5 w-5" /></button>
          <button type="button" onClick={() => navigateToRoute('/identify')} aria-label={t('identify.entry')} className="flex h-11 w-11 items-center justify-center rounded-2xl text-ink/55 hover:bg-emerald-50 hover:text-emerald-700"><Camera className="h-5 w-5" /></button>
          <button type="button" onClick={() => navigateToRoute('/settings')} aria-label={t('common.settings')} className="flex h-11 w-11 items-center justify-center rounded-2xl text-ink/55 hover:bg-emerald-50 hover:text-emerald-700"><Settings className="h-5 w-5" /></button>
        </header>
        <main className="app-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-[calc(88px+env(safe-area-inset-bottom))] pt-3">
          <div className="mx-auto w-full max-w-full min-w-0 overflow-x-hidden">
            <WorkspaceRoutes />
          </div>
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}
