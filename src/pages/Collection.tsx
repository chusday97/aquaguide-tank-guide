import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import i18n from '../i18n';
import {
  BookHeart,
  BookOpenCheck,
  Check,
  ChevronRight,
  Droplets,
  Heart,
  HeartOff,
  Medal,
  ShieldCheck,
  Skull,
  Sparkles,
  Waves,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdaptiveDetailContent } from '../components/common/AdaptiveDetailContent';
import { ResilientImage } from '../components/common/ResilientImage';
import type { PreviewImage } from '../components/common/ImagePreviewModal';
import { SpeciesDetailDialog } from '../components/SpeciesDetailDialog';
import { useToast } from '../components/common/ToastProvider';
import { useWorkspaceNavigation } from '../components/layout/WorkspaceNavigationProvider';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { careTopicsData, type CareTopic } from '../data/careTopicsData';
import { fishData } from '../data/fishData';
import { getSpeciesDisplayImage, getSpeciesImageClass, getSpeciesImageSurfaceClass, getSpeciesVisualSources } from '../lib/speciesVisual';
import { getCareVisualSources } from '../lib/careVisual';
import type { AchievementId, CollectionModule } from '../modules/collection/collection.types';
import { getCollectionSnapshot, hydrateCollectionMemorials, subscribeToCollection } from '../services/collection/collection.service';
import { setCompatibilitySelection } from '../services/compatibility/compatibility-selection.service';
import { getCareFavorites, getSpeciesFavoriteIds, setSpeciesFavoriteIds, toggleCareFavorite } from '../services/favorites/favorites.service';
import { trackSessionEvent } from '../services/analytics/session-events.service';
import { taskRoutes } from '../services/navigation/task-routes';
import type { Aquarium, Fish } from '../types';
import type { WorkspaceNavigationContext } from '../types/navigation';
import { CareArticleDetail } from './CareEncyclopedia';

const ImagePreviewModal = lazy(() => import('../components/common/ImagePreviewModal').then(module => ({ default: module.ImagePreviewModal })));
const PAGE_SIZE = 20;

interface CollectionItemDeepLink {
  module: CollectionModule;
  itemId: string;
}

// tabConfig is defined dynamically inside the component to support i18n

const achievementIcons: Record<AchievementId, typeof Medal> = {
  first_aquarium: Waves,
  first_daily_check: Sparkles,
  seven_day_guardian: ShieldCheck,
  water_change_routine: Droplets,
  wishlist_collector: Heart,
  care_learner: BookHeart,
  compatible_community: ShieldCheck,
  life_reflection: Medal,
};

const formatMemorialDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('zh-CN');
};

export default function Collection({ module }: { module: CollectionModule }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { captureContext, restoreContext } = useWorkspaceNavigation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const tabConfig = useMemo(() => [
    { id: 'wishlist' as CollectionModule, label: isEn ? 'Species Wishlist' : '种草图鉴', shortLabel: isEn ? 'Wishlist' : '种草', icon: Heart },
    { id: 'care' as CollectionModule, label: isEn ? 'Care Collection' : '养护收藏', shortLabel: isEn ? 'Care' : '养护', icon: BookOpenCheck },
    { id: 'memorial' as CollectionModule, label: isEn ? 'Life Memorial' : '生命纪念', shortLabel: isEn ? 'Memorial' : '纪念', icon: Skull },
    { id: 'achievements' as CollectionModule, label: isEn ? 'Achievements & Badges' : '成就勋章', shortLabel: isEn ? 'Badges' : '勋章', icon: Medal },
  ], [isEn]);
  const activeTab = module;
  const [snapshot, setSnapshot] = useState(() => getCollectionSnapshot());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedFish, setSelectedFish] = useState<Fish | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<CareTopic | null>(null);
  const [pendingFishRemoval, setPendingFishRemoval] = useState<Fish | null>(null);
  const [pendingCareRemoval, setPendingCareRemoval] = useState<CareTopic | null>(null);
  const [checkedActions, setCheckedActions] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [highlightedAchievementId, setHighlightedAchievementId] = useState<AchievementId | null>(null);
  const returnContextRef = useRef<WorkspaceNavigationContext | null>(null);
  const detailFinalFocusRef = useRef<HTMLElement | null>(null);
  const handledDeepLinkRef = useRef('');
  const previousUnlockedRef = useRef(new Set(snapshot.achievements.filter(item => item.unlocked).map(item => item.id)));
  const detailScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeToCollection(() => {
    setSnapshot(getCollectionSnapshot());
  }), []);

  useEffect(() => {
    let active = true;
    void hydrateCollectionMemorials()
      .then(next => { if (active) setSnapshot(next); })
      .catch(() => {
        if (active && activeTab === 'memorial') showToast(isEn ? 'Could not refresh memorial history.' : '生命纪念暂时无法同步，正在显示本机缓存。', 'error');
      });
    return () => { active = false; };
  }, [activeTab, isEn, showToast]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    trackSessionEvent('favorite_page_view', { action: 'view', status: activeTab, entry: 'collection' });
  }, [activeTab]);

  const wishlistFishes = useMemo(() => [...snapshot.wishlistIds]
    .reverse()
    .map(id => fishData.find(item => item.id === id))
    .filter((item): item is Fish => Boolean(item)), [snapshot.wishlistIds]);
  const careTopics = useMemo(() => Object.values(snapshot.careFavorites)
    .sort((a, b) => new Date(b.favoritedAt).getTime() - new Date(a.favoritedAt).getTime())
    .map(favorite => careTopicsData.find(item => item.id === favorite.id))
    .filter((item): item is CareTopic => Boolean(item)), [snapshot.careFavorites]);
  const currentAquarium = useMemo<Aquarium | null>(() => (
    snapshot.appState.aquariums.find(item => item.id === snapshot.appState.currentAquariumId)
    || snapshot.appState.aquariums[0]
    || null
  ), [snapshot.appState]);
  const ownedIds = useMemo(() => new Set(snapshot.appState.aquariums.flatMap(item => item.fishes.map(record => record.fishId))), [snapshot.appState.aquariums]);
  const deepLink = useMemo<CollectionItemDeepLink | null>(() => {
    const itemId = new URLSearchParams(location.search).get('item')?.trim();
    return itemId ? { module: activeTab, itemId } : null;
  }, [activeTab, location.search]);

  const clearDeepLinkItem = () => {
    if (!deepLink) return;
    const params = new URLSearchParams(location.search);
    params.delete('item');
    handledDeepLinkRef.current = '';
    navigate({
      pathname: location.pathname,
      search: params.toString() ? `?${params.toString()}` : '',
    }, { replace: true });
  };

  useEffect(() => {
    if (!deepLink) {
      handledDeepLinkRef.current = '';
      setHighlightedAchievementId(null);
      return;
    }

    const key = `${deepLink.module}:${deepLink.itemId}`;
    if (handledDeepLinkRef.current === key) return;
    handledDeepLinkRef.current = key;
    detailFinalFocusRef.current = document.getElementById('collection-module-heading');

    const showMissingItem = () => {
      showToast(isEn ? 'This item is no longer available.' : '这条内容已不可用。', 'error');
      const params = new URLSearchParams(location.search);
      params.delete('item');
      navigate({
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : '',
      }, { replace: true });
    };

    if (activeTab === 'wishlist') {
      const fish = wishlistFishes.find(item => item.id === deepLink.itemId);
      if (!fish) showMissingItem();
      else setSelectedFish(fish);
      return;
    }
    if (activeTab === 'care') {
      const topic = careTopics.find(item => item.id === deepLink.itemId);
      if (!topic) showMissingItem();
      else setSelectedTopic(topic);
      return;
    }
    if (activeTab === 'memorial') {
      const record = snapshot.memorials.find(item => item.id === deepLink.itemId);
      if (!record) showMissingItem();
      else navigate(`/collection/memorial/${encodeURIComponent(record.id)}`, { replace: true });
      return;
    }

    const achievement = snapshot.achievements.find(item => item.id === deepLink.itemId);
    if (!achievement) {
      showMissingItem();
      return;
    }
    setHighlightedAchievementId(achievement.id);
    const target = document.getElementById(`collection-achievement-${achievement.id}`);
    if (target) {
      target.scrollIntoView({
        block: 'center',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
      target.focus({ preventScroll: true });
    }
  }, [
    activeTab,
    careTopics,
    deepLink,
    isEn,
    location.pathname,
    location.search,
    navigate,
    showToast,
    snapshot.achievements,
    snapshot.memorials,
    wishlistFishes,
  ]);

  const openFromCard = (sourceId: string) => {
    returnContextRef.current = captureContext(sourceId);
    detailFinalFocusRef.current = document.getElementById(sourceId);
  };
  const restoreCard = () => {
    const context = returnContextRef.current;
    returnContextRef.current = null;
    if (context) void restoreContext(context);
  };

  const removeFishFavorite = () => {
    if (!pendingFishRemoval) return;
    setSpeciesFavoriteIds(snapshot.wishlistIds.filter(id => id !== pendingFishRemoval.id));
    if (getSpeciesFavoriteIds().includes(pendingFishRemoval.id)) {
      showToast(isEn ? 'Could not remove this item. Try again.' : '移除失败，请稍后重试。', 'error');
      return;
    }
    setPendingFishRemoval(null);
    if (deepLink?.module === 'wishlist' && deepLink.itemId === pendingFishRemoval.id) {
      setSelectedFish(null);
      clearDeepLinkItem();
    }
    showToast(isEn ? 'Removed from species wishlist' : '已从种草图鉴移除');
  };

  const removeCareFavorite = () => {
    if (!pendingCareRemoval) return;
    toggleCareFavorite({ id: pendingCareRemoval.id, title: pendingCareRemoval.title, favoritedAt: new Date().toISOString() });
    if (getCareFavorites()[pendingCareRemoval.id]) {
      showToast(isEn ? 'Could not remove this item. Try again.' : '移除失败，请稍后重试。', 'error');
      return;
    }
    setPendingCareRemoval(null);
    if (deepLink?.module === 'care' && deepLink.itemId === pendingCareRemoval.id) {
      setSelectedTopic(null);
      clearDeepLinkItem();
    }
    showToast(isEn ? 'Removed from care collection' : '已从养护收藏移除');
  };

  const openCarePreview = (topic: CareTopic) => {
    if (!topic.imageUrl) return;
    setPreviewImages([{ src: topic.imageUrl, title: topic.title }]);
    setPreviewOpen(true);
  };

  const shareCareTopic = async (topic: CareTopic) => {
    const text = `${topic.title}｜AquaGuide 养护百科`;
    try {
      if (navigator.share) await navigator.share({ title: topic.title, text });
      else await navigator.clipboard.writeText(text);
      showToast(Boolean(i18n.language?.startsWith('en')) ? (navigator.share ? 'Share panel opened' : 'Share content copied to clipboard') : (navigator.share ? '已打开分享' : '已复制分享内容'));
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      showToast(Boolean(i18n.language?.startsWith('en')) ? 'Share failed, please try again later' : '分享失败，请稍后重试', 'error');
    }
  };

  const renderEmpty = (icon: typeof Heart, title: string, description: string, action: { label: string; route: string }) => {
    const Icon = icon;
    return (
      <section className="rounded-[24px] border border-dashed border-emerald-200 bg-white/80 px-5 py-12 text-center">
        <Icon className="mx-auto h-9 w-9 text-ink/20" />
        <h2 className="mt-3 text-[17px] font-black text-ink">{title}</h2>
        <p className="mx-auto mt-1 max-w-sm text-[12px] font-bold leading-5 text-ink/45">{description}</p>
        <button type="button" onClick={() => navigate(action.route)} className="mt-5 h-10 rounded-full bg-emerald-700 px-5 text-[12px] font-black text-white shadow-sm">
          {action.label}
        </button>
      </section>
    );
  };

  return (
    <div className="collection-workspace page-frame mx-auto flex w-full min-w-0 max-w-[1180px] flex-col gap-4 pb-24">
      <header className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#edf7f1_58%,#dfeee8_100%)] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 id="collection-module-heading" tabIndex={-1} className="text-[24px] font-black tracking-tight text-ink focus-visible:outline-none">{tabConfig.find(item => item.id === activeTab)?.label}</h1>
            <button type="button" onClick={() => navigate('/collection')} className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 hover:underline">
              {Boolean(i18n.language?.startsWith('en')) ? 'Back to Collection' : '返回水族册首页'}
            </button>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-emerald-800 text-white shadow-[0_14px_30px_rgba(6,78,59,0.2)]">
            <BookHeart className="h-6 w-6" />
          </div>
        </div>
        {activeTab !== 'achievements' && <div className="mt-5 inline-flex rounded-full bg-white/75 px-3 py-1.5 text-[11px] font-black text-ink/55 shadow-sm">{Boolean(i18n.language?.startsWith('en')) ? `Total ${snapshot.counts[activeTab]} item(s)` : `共 ${snapshot.counts[activeTab]} 项`}</div>}
      </header>

      {activeTab === 'wishlist' && (wishlistFishes.length ? (
        <section className="collection-wishlist-grid grid gap-3">
          {wishlistFishes.slice(0, visibleCount).map(fish => (
            <article key={fish.id} id={`collection-wishlist-${fish.id}`} tabIndex={-1} className="flex min-w-0 flex-col rounded-[20px] border border-white/80 bg-white p-3 shadow-sm">
              <button type="button" onClick={() => { openFromCard(`collection-wishlist-${fish.id}`); setSelectedFish(fish); }} className="group text-left">
                <span className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-[16px] bg-bg ${getSpeciesImageSurfaceClass(fish)}`}>
                  <ResilientImage src={getSpeciesVisualSources(fish).thumbnail} srcSet={`${getSpeciesVisualSources(fish).thumbnail} 256w, ${getSpeciesVisualSources(fish).detail} 768w`} sizes="(max-width: 430px) 46vw, 220px" alt={fish.name} className={`h-full w-full object-contain p-[7%] transition-transform duration-200 group-hover:scale-[1.03] ${getSpeciesImageClass(fish)}`} loading="lazy" decoding="async" />
                </span>
                <span className="mt-3 flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-black text-ink">{fish.name}</span>
                    <span className="mt-1 block truncate text-[10px] font-bold text-ink/42">{fish.category} · {fish.difficulty === 'Easy' ? (Boolean(i18n.language?.startsWith('en')) ? 'Beginner' : '新手适宜') : fish.difficulty === 'Medium' ? (Boolean(i18n.language?.startsWith('en')) ? 'Intermediate' : '进阶') : (Boolean(i18n.language?.startsWith('en')) ? 'Expert' : '高难度')}</span>
                  </span>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-ink/25" />
                </span>
              </button>
              <button type="button" onClick={() => setPendingFishRemoval(fish)} className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-[11px] font-black text-rose-600">
                <HeartOff className="mr-1.5 h-3.5 w-3.5" />{Boolean(i18n.language?.startsWith('en')) ? 'Remove Saved' : '移除种草'}
              </button>
            </article>
          ))}
        </section>
      ) : renderEmpty(Heart, Boolean(i18n.language?.startsWith('en')) ? 'No Saved Species Yet' : '还没有种草生物', Boolean(i18n.language?.startsWith('en')) ? 'Add species you like to your favorites in the Encyclopedia, and they will show up here.' : '在图鉴中收藏想进一步了解的生物，它会出现在这里。', { label: Boolean(i18n.language?.startsWith('en')) ? 'Browse Encyclopedia' : '浏览图鉴', route: '/encyclopedia' }))}

      {activeTab === 'care' && (careTopics.length ? (
        <section className="collection-care-grid grid gap-3">
          {careTopics.slice(0, visibleCount).map(topic => (
            <article key={topic.id} id={`collection-care-${topic.id}`} tabIndex={-1} className="flex min-w-0 flex-col rounded-[20px] border border-white/80 bg-white p-3 shadow-sm">
              <button type="button" onClick={() => { openFromCard(`collection-care-${topic.id}`); setSelectedTopic(topic); }} className="grid grid-cols-[86px_minmax(0,1fr)] gap-3 text-left">
                <div className="h-[86px] w-[86px] overflow-hidden rounded-[15px] bg-bg"><ResilientImage src={getCareVisualSources(topic.imageUrl).thumbnail} srcSet={`${getCareVisualSources(topic.imageUrl).thumbnail} 480w, ${getCareVisualSources(topic.imageUrl).detail} 960w`} sizes="86px" alt={topic.title} className="h-full w-full object-cover" loading="lazy" decoding="async" /></div>
                <span className="min-w-0">
                  <span className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 text-[14px] font-black leading-tight text-ink">{topic.title}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink/25" />
                  </span>
                  <span className="mt-2 line-clamp-2 text-[11px] font-medium leading-5 text-ink/48">{topic.summary}</span>
                </span>
              </button>
              <button type="button" onClick={() => setPendingCareRemoval(topic)} className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-[11px] font-black text-rose-600">
                <HeartOff className="mr-1.5 h-3.5 w-3.5" />{Boolean(i18n.language?.startsWith('en')) ? 'Remove Saved' : '移除收藏'}
              </button>
            </article>
          ))}
        </section>
      ) : renderEmpty(BookOpenCheck, Boolean(i18n.language?.startsWith('en')) ? 'No Saved Care Guides' : '还没有养护收藏', Boolean(i18n.language?.startsWith('en')) ? 'Save frequently used care guidelines from the Care Guide page, and they will appear here.' : '把常用的处理步骤收藏起来，出现问题时可以更快找到。', { label: Boolean(i18n.language?.startsWith('en')) ? 'Search Care Guide' : '查养护百科', route: '/care' }))}

      {activeTab === 'memorial' && (snapshot.memorials.length ? (
        <section className="collection-memorial-grid grid gap-3">
          {snapshot.memorials.slice(0, visibleCount).map(record => {
            const fish = fishData.find(item => item.id === record.fishId);
            return (
              <button
                key={record.id}
                id={`collection-memorial-${record.id}`}
                type="button"
                onClick={() => navigate(`/collection/memorial/${encodeURIComponent(record.id)}`)}
                className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-[20px] border border-white/80 bg-white p-3 text-left shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
              >
                <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-100 grayscale">
                  {fish ? <ResilientImage src={getSpeciesVisualSources(fish).thumbnail} alt={fish.name} className={`h-full w-full object-contain p-[8%] opacity-75 ${getSpeciesImageClass(fish)}`} loading="lazy" /> : <Skull className="h-5 w-5 text-ink/30" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-black text-ink">{fish?.name || (Boolean(i18n.language?.startsWith('en')) ? 'Species information unavailable' : '物种信息不可用')}</span>
                  <span className="mt-1 block text-[11px] font-bold text-ink/42">{formatMemorialDate(record.date)}</span>
                  <span className="mt-1 block truncate text-[10px] font-medium text-ink/38">{record.reason || (Boolean(i18n.language?.startsWith('en')) ? 'No reason recorded' : '未填写原因')}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-ink/25" />
              </button>
            );
          })}
        </section>
      ) : renderEmpty(Skull, Boolean(i18n.language?.startsWith('en')) ? 'No Memorials Logged' : '还没有生命纪念', Boolean(i18n.language?.startsWith('en')) ? 'After recording a death or removal, the date and reason will appear here.' : '记录离缸或死亡后，这里会保留日期和原因。', { label: Boolean(i18n.language?.startsWith('en')) ? 'Back to Aquarium' : '返回我的鱼缸', route: '/aquarium' }))}

      {activeTab === 'achievements' && (
        <section className="rounded-[22px] border border-slate-200 bg-slate-50 p-6 text-slate-500 shadow-none">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-slate-100 text-slate-400"><Medal className="h-5 w-5" /></div>
            <div>
              <div className="inline-flex rounded-full bg-slate-200/70 px-2.5 py-1 text-[10px] font-black text-slate-500">{isEn ? 'COMING SOON' : '功能建设中'}</div>
              <h2 className="mt-2 text-[16px] font-black text-slate-600">{isEn ? 'Achievements & Badges' : '成就勋章'}</h2>
            </div>
          </div>
        </section>
      )}

      {((activeTab === 'wishlist' && wishlistFishes.length > visibleCount)
        || (activeTab === 'care' && careTopics.length > visibleCount)
        || (activeTab === 'memorial' && snapshot.memorials.length > visibleCount)) && (
        <button type="button" onClick={() => setVisibleCount(count => count + PAGE_SIZE)} className="mx-auto h-10 rounded-full border border-emerald-100 bg-white px-5 text-[11px] font-black text-emerald-800 shadow-sm">
          加载更多
        </button>
      )}

      <SpeciesDetailDialog
        fish={selectedFish}
        open={Boolean(selectedFish)}
        source="atlas"
        aquariumContext={currentAquarium}
        imageSrc={selectedFish ? getSpeciesDisplayImage(selectedFish) : ''}
        owned={Boolean(selectedFish && ownedIds.has(selectedFish.id))}
        inCalculator={false}
        inWishlist={Boolean(selectedFish && snapshot.wishlistIds.includes(selectedFish.id))}
        finalFocusElement={detailFinalFocusRef.current}
        onOpenChange={(open) => { if (!open) { setSelectedFish(null); clearDeepLinkItem(); restoreCard(); } }}
        onSelectSpecies={setSelectedFish}
        onAddToTank={(fish) => navigate(taskRoutes.aquarium.addSpecies(fish.id))}
        onAddToCalculator={(fish) => { setCompatibilitySelection([fish.id]); navigate(taskRoutes.encyclopedia.compatibility); }}
        onToggleWishlist={(fishId) => {
          const fish = fishData.find(item => item.id === fishId);
          if (fish) setPendingFishRemoval(fish);
        }}
        onGoCalculator={() => {
          if (!selectedFish) return;
          setCompatibilitySelection([selectedFish.id]);
          navigate(taskRoutes.encyclopedia.compatibility);
        }}
        onViewInTank={() => navigate(taskRoutes.aquarium.livestock)}
        onOpenTankSettings={(panel) => navigate(currentAquarium ? taskRoutes.aquarium.settings(panel) : taskRoutes.aquarium.create())}
      />

      <Dialog open={Boolean(selectedTopic)} onOpenChange={(open) => { if (!open) { setSelectedTopic(null); clearDeepLinkItem(); restoreCard(); } }}>
        <AdaptiveDetailContent finalFocus={detailFinalFocusRef}>
          {selectedTopic && (
            <CareArticleDetail
              key={selectedTopic.id}
              topic={selectedTopic}
              scrollRef={detailScrollRef}
              checkedActions={checkedActions}
              favorite={Boolean(snapshot.careFavorites[selectedTopic.id])}
              onToggleAction={(value) => setCheckedActions(items => items.includes(value) ? items.filter(item => item !== value) : [...items, value])}
              onToggleFavorite={() => setPendingCareRemoval(selectedTopic)}
              onOpenShare={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))}
              onPreview={() => openCarePreview(selectedTopic)}
              onSelectRelated={(topic) => setSelectedTopic(topic)}
              onRestoreActions={setCheckedActions}
              activeAquarium={currentAquarium}
            />
          )}
        </AdaptiveDetailContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingFishRemoval)}
        title={isEn ? 'Remove this saved species?' : '移除这条种草？'}
        description={isEn ? `${pendingFishRemoval?.name || 'This species'} will be removed from My Collection. You can save it again later.` : `“${pendingFishRemoval?.name || ''}”会从水族册移除，之后仍可在图鉴重新收藏。`}
        confirmLabel={isEn ? 'Remove' : '确认移除'}
        cancelLabel={isEn ? 'Cancel' : '取消'}
        destructive
        onConfirm={removeFishFavorite}
        onCancel={() => setPendingFishRemoval(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingCareRemoval)}
        title={isEn ? 'Remove this saved guide?' : '移除这篇收藏？'}
        description={isEn ? `${pendingCareRemoval?.title || 'This guide'} will be removed from My Collection. You can save it again later.` : `“${pendingCareRemoval?.title || ''}”会从水族册移除，之后仍可重新收藏。`}
        confirmLabel={isEn ? 'Remove' : '确认移除'}
        cancelLabel={isEn ? 'Cancel' : '取消'}
        destructive
        onConfirm={removeCareFavorite}
        onCancel={() => setPendingCareRemoval(null)}
      />

      <Suspense fallback={null}>
        <ImagePreviewModal images={previewImages} index={0} open={previewOpen} onClose={() => setPreviewOpen(false)} onIndexChange={() => undefined} />
      </Suspense>
    </div>
  );
}
