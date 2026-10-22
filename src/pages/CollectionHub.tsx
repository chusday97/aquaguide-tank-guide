import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  BookHeart,
  BookOpenCheck,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  History as HistoryIcon,
  Medal,
  Plus,
  ShieldCheck,
  Skull,
  Sparkles,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResilientImage } from '../components/common/ResilientImage';
import { careTopicsData } from '../data/careTopicsData';
import { fishData } from '../data/fishData';
import { getCareVisualSources } from '../lib/careVisual';
import { getSpeciesImageClass, getSpeciesVisualSources } from '../lib/speciesVisual';
import type { AchievementId, CollectionModule } from '../modules/collection/collection.types';
import { buildCollectionHomeModel } from '../services/collection/collection-home.service';
import { getCollectionSnapshot, loadCurrentFavorites, loadCurrentKeepingHistory, subscribeToCollection } from '../services/collection/collection.service';
import type { CareFavoriteMap } from '../services/favorites/favorites.service';
import { taskRoutes } from '../services/navigation/task-routes';

const moduleRoutes: Record<CollectionModule, string> = {
  wishlist: '/collection/wishlist',
  care: '/collection/care',
  memorial: '/collection/memorial',
  achievements: '/collection/achievements',
};

const achievementIcons: Record<AchievementId, typeof Medal> = {
  first_aquarium: Sparkles,
  first_daily_check: Check,
  seven_day_guardian: ShieldCheck,
  water_change_routine: BookOpenCheck,
  wishlist_collector: Heart,
  care_learner: BookHeart,
  compatible_community: ShieldCheck,
  life_reflection: Medal,
};

const moduleOrder: CollectionModule[] = ['wishlist', 'care', 'memorial', 'achievements'];
const marineVisualIndexes: Record<CollectionModule, number> = {
  wishlist: 0,
  care: 2,
  memorial: 4,
  achievements: 6,
};

const desktopNodePositions: Record<CollectionModule, string> = {
  wishlist: 'left-[1%] top-[16%] xl:left-[4%]',
  care: 'right-[1%] top-[15%] xl:right-[4%]',
  memorial: 'left-[1%] bottom-[13%] xl:left-[4%]',
  achievements: 'right-[1%] bottom-[12%] xl:right-[4%]',
};

type HoverItem = {
  id: string;
  label: string;
  meta?: string;
  all?: boolean;
};

function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center rounded-[28px] border border-white/70 bg-white/60 px-6 text-center backdrop-blur-xl">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink/30 shadow-sm">{icon}</span>
      <h3 className="mt-4 text-[18px] font-black text-ink">{title}</h3>
      <p className="mt-2 max-w-[360px] text-[12px] font-semibold leading-6 text-ink/52">{description}</p>
    </div>
  );
}

export default function CollectionHub() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const [snapshot, setSnapshot] = useState(getCollectionSnapshot);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [careFavorites, setCareFavorites] = useState<CareFavoriteMap>({});
  const [historySummary, setHistorySummary] = useState({ current: 0, ever: 0, events: 0 });
  const [homeData, setHomeData] = useState<Awaited<ReturnType<typeof loadCurrentKeepingHistory>> | null>(null);
  const [homeLoadState, setHomeLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [activeModule, setActiveModule] = useState<CollectionModule>('wishlist');
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      setSnapshot(getCollectionSnapshot());
      try {
        const current = await loadCurrentFavorites();
        if (!cancelled) {
          setWishlistIds(current.wishlistIds);
          setCareFavorites(current.careFavorites);
        }
      } catch {
        if (!cancelled) {
          setWishlistIds([]);
          setCareFavorites({});
        }
      }
      try {
        const keeping = await loadCurrentKeepingHistory();
        if (!cancelled) {
          setHomeData(keeping);
          setHomeLoadState('ready');
          setHistorySummary({
            current: keeping.history.currentSpeciesIds.length,
            ever: keeping.history.speciesEverKeptIds.length,
            events: keeping.history.events.length,
          });
        }
      } catch {
        if (!cancelled) {
          setHomeData(null);
          setHomeLoadState('error');
          setHistorySummary({ current: 0, ever: 0, events: 0 });
        }
      }
    };
    const onFocus = () => void refresh();
    void refresh();
    window.addEventListener('focus', onFocus);
    const unsubscribe = subscribeToCollection(onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      unsubscribe();
    };
  }, []);

  const wishlistFishes = useMemo(() => [...wishlistIds]
    .reverse()
    .map(id => fishData.find(fish => fish.id === id))
    .filter((fish): fish is (typeof fishData)[number] => Boolean(fish))
    .slice(0, 4), [wishlistIds]);

  const careTopics = useMemo(() => Object.values(careFavorites)
    .sort((a, b) => new Date(b.favoritedAt).getTime() - new Date(a.favoritedAt).getTime())
    .map(favorite => careTopicsData.find(topic => topic.id === favorite.id))
    .filter((topic): topic is (typeof careTopicsData)[number] => Boolean(topic))
    .slice(0, 4), [careFavorites]);

  const homeModel = useMemo(() => buildCollectionHomeModel({
    aquariums: homeData?.aquariums ?? [],
    currentAquariumId: homeData?.currentAquariumId,
    diagnosisRecords: homeData?.diagnosisRecords ?? [],
    history: homeData?.history ?? {
      events: [],
      activeCohorts: [],
      speciesEverKeptIds: [],
      currentSpeciesIds: [],
      aquariumIds: [],
    },
  }), [homeData]);

  const residentPreviews = useMemo(() => (homeModel.aquarium?.fishes || [])
    .filter(record => record.quantity > 0)
    .map(record => ({ record, fish: fishData.find(fish => fish.id === record.fishId) }))
    .filter(item => Boolean(item.fish))
    .slice(0, 4), [homeModel.aquarium]);

  const recentMemorials = snapshot.memorials.slice(0, 4);
  const achievementPreviews = useMemo(() => {
    const unlocked = [...snapshot.achievements].reverse().filter(item => item.unlocked);
    const locked = [...snapshot.achievements]
      .filter(item => !item.unlocked)
      .sort((a, b) => (b.current / b.target) - (a.current / a.target));
    return [...unlocked, ...locked]
      .filter((item, index, items) => items.findIndex(candidate => candidate.id === item.id) === index)
      .slice(0, 4);
  }, [snapshot.achievements]);

  const moduleMeta: Record<CollectionModule, {
    title: string;
    shortLabel: string;
    description: string;
    countLabel: string;
    icon: ReactNode;
    accentClass: string;
  }> = {
    wishlist: {
      title: isEn ? 'Species Wishlist' : '种草图鉴',
      shortLabel: isEn ? 'Wishlist' : '种草',
      description: isEn ? 'Species you saved for a closer look before deciding what belongs in your tank.' : '把感兴趣的生物先放在这里，再决定是否适合你的鱼缸。',
      countLabel: isEn ? `${wishlistIds.length} saved` : `${wishlistIds.length} 种`,
      icon: <Heart className="h-4 w-4" />,
      accentClass: 'text-rose-600',
    },
    care: {
      title: isEn ? 'Saved Care' : '养护收藏',
      shortLabel: isEn ? 'Care' : '养护',
      description: isEn ? 'Keep the care guides you want to return to during real aquarium maintenance.' : '把真正会反复查看的养护指南收进来，维护时直接继续。',
      countLabel: isEn ? `${Object.keys(careFavorites).length} guides` : `${Object.keys(careFavorites).length} 篇`,
      icon: <BookOpenCheck className="h-4 w-4" />,
      accentClass: 'text-sky-700',
    },
    memorial: {
      title: isEn ? 'Life Memorials' : '生命纪念',
      shortLabel: isEn ? 'Memorials' : '纪念',
      description: isEn ? 'A quiet record of lives that were part of your aquarium and what you learned from them.' : '记录曾经生活在缸里的生命，以及留下来的观察与复盘。',
      countLabel: isEn ? `${snapshot.counts.memorial} records` : `${snapshot.counts.memorial} 条`,
      icon: <Skull className="h-4 w-4" />,
      accentClass: 'text-stone-600',
    },
    achievements: {
      title: isEn ? 'Aquarium Milestones' : '成长勋章',
      shortLabel: isEn ? 'Badges' : '勋章',
      description: isEn ? 'Milestones earned from real aquarium care, not decorative points.' : '根据真实养缸行为形成的里程碑，不做无意义的积分装饰。',
      countLabel: isEn ? `${snapshot.counts.achievements} unlocked` : `${snapshot.counts.achievements} 枚已解锁`,
      icon: <Medal className="h-4 w-4" />,
      accentClass: 'text-amber-700',
    },
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(isEn ? 'en' : 'zh-CN', { month: 'short', day: 'numeric' }).format(date);
  };

  const openItem = (module: CollectionModule, itemId: string) => {
    if (module === 'memorial') {
      navigate(`/collection/memorial/${encodeURIComponent(itemId)}`);
      return;
    }
    navigate(`${moduleRoutes[module]}?item=${encodeURIComponent(itemId)}`);
  };

  const selectModule = (module: CollectionModule, itemId?: string) => {
    setActiveModule(module);
    setFocusedItemId(itemId || null);
  };

  const getHoverItems = (module: CollectionModule): HoverItem[] => {
    if (module === 'wishlist') {
      return [
        ...wishlistFishes.slice(0, 3).map(fish => ({ id: fish.id, label: fish.name, meta: fish.category })),
        { id: 'all', label: isEn ? 'View all saved species' : '查看全部种草', all: true },
      ];
    }
    if (module === 'care') {
      return [
        ...careTopics.slice(0, 3).map(topic => ({ id: topic.id, label: topic.title, meta: topic.category })),
        { id: 'all', label: isEn ? 'View all saved guides' : '查看全部养护收藏', all: true },
      ];
    }
    if (module === 'memorial') {
      return [
        ...recentMemorials.slice(0, 3).map(record => {
          const fish = fishData.find(item => item.id === record.fishId);
          return { id: record.id, label: fish?.name || (isEn ? 'Aquarium resident' : '缸内生物'), meta: formatDate(record.date) };
        }),
        { id: 'all', label: isEn ? 'View all memorials' : '查看全部纪念', all: true },
      ];
    }
    return [
      ...achievementPreviews.slice(0, 3).map(item => ({
        id: item.id,
        label: item.title,
        meta: item.unlocked ? (isEn ? 'Unlocked' : '已解锁') : `${item.current}/${item.target}`,
      })),
      { id: 'all', label: isEn ? 'View all milestones' : '查看全部勋章', all: true },
    ];
  };

  const renderCentralContent = () => {
    if (activeModule === 'wishlist') {
      if (!wishlistFishes.length) {
        return <EmptyState icon={<Heart className="h-6 w-6" />} title={isEn ? 'Nothing saved yet' : '还没有种草生物'} description={isEn ? 'Save species from the atlas and they will surface here.' : '从图鉴收藏感兴趣的生物后，它们会出现在中央。'} />;
      }
      return (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {wishlistFishes.map(fish => (
            <button
              key={fish.id}
              type="button"
              onClick={() => openItem('wishlist', fish.id)}
              data-preview-item="wishlist"
              data-preview-id={fish.id}
              className={`group flex min-w-0 items-center gap-3 rounded-[22px] border bg-white/78 p-3 text-left shadow-sm transition-all hover:-translate-y-1 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${focusedItemId === fish.id ? 'border-rose-300 ring-2 ring-rose-100' : 'border-white/80'}`}
            >
              <span className="flex h-[88px] w-[116px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-white/90">
                <ResilientImage src={getSpeciesVisualSources(fish).thumbnail} alt={fish.name} className={`h-full w-full object-contain p-[6%] ${getSpeciesImageClass(fish)}`} loading="lazy" decoding="async" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-black text-ink">{fish.name}</span>
                <span className="mt-1 block truncate text-[11px] font-semibold text-ink/48">{fish.scientificName}</span>
                <span className="mt-3 inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-600">{fish.category}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink/28 transition-transform group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      );
    }

    if (activeModule === 'care') {
      if (!careTopics.length) {
        return <EmptyState icon={<BookOpenCheck className="h-6 w-6" />} title={isEn ? 'No saved guides yet' : '还没有养护收藏'} description={isEn ? 'Favorite useful care guides and they will stay ready here.' : '把常用的养护指南收藏起来，之后可以从这里继续。'} />;
      }
      return (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {careTopics.map(topic => (
            <button
              key={topic.id}
              type="button"
              onClick={() => openItem('care', topic.id)}
              data-preview-item="care"
              data-preview-id={topic.id}
              className={`group overflow-hidden rounded-[22px] border bg-white/78 text-left shadow-sm transition-all hover:-translate-y-1 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${focusedItemId === topic.id ? 'border-sky-300 ring-2 ring-sky-100' : 'border-white/80'}`}
            >
              <span className="block h-[120px] overflow-hidden bg-white/70">
                <ResilientImage src={getCareVisualSources(topic.imageUrl).thumbnail} alt={topic.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
              </span>
              <span className="block p-3.5">
                <span className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1 text-[14px] font-black text-ink">{topic.title}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink/28 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="mt-1.5 line-clamp-2 text-[11px] font-semibold leading-5 text-ink/50">{topic.summary}</span>
                <span className="mt-3 inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black text-sky-700">{topic.category}</span>
              </span>
            </button>
          ))}
        </div>
      );
    }

    if (activeModule === 'memorial') {
      if (!recentMemorials.length) {
        return <EmptyState icon={<Skull className="h-6 w-6" />} title={isEn ? 'No memorial records' : '还没有生命纪念'} description={isEn ? 'Memorial entries appear only from real aquarium records.' : '只有真实记录过的生命纪念才会出现在这里。'} />;
      }
      return (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {recentMemorials.map(record => {
            const fish = fishData.find(item => item.id === record.fishId);
            return (
              <button
                key={record.id}
                type="button"
                onClick={() => openItem('memorial', record.id)}
                data-preview-item="memorial"
                data-preview-id={record.id}
                className={`group flex min-h-[132px] items-center gap-4 rounded-[22px] border bg-white/76 p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 ${focusedItemId === record.id ? 'border-stone-400 ring-2 ring-stone-100' : 'border-white/80'}`}
              >
                <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-50">
                  {fish ? <ResilientImage src={getSpeciesVisualSources(fish).thumbnail} alt={fish.name} className={`h-full w-full object-contain p-[8%] grayscale-[20%] ${getSpeciesImageClass(fish)}`} loading="lazy" decoding="async" /> : <Skull className="h-6 w-6 text-stone-400" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-black text-ink">{fish?.name || (isEn ? 'Aquarium resident' : '缸内生物')}</span>
                  <span className="mt-1 block text-[11px] font-bold text-ink/46">{formatDate(record.date)}</span>
                  <span className="mt-2 line-clamp-2 text-[11px] font-semibold leading-5 text-ink/52">{record.reason || record.observation || (isEn ? 'Open the memorial record.' : '打开纪念记录查看详情。')}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink/28 transition-transform group-hover:translate-x-1" />
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        {achievementPreviews.map(item => {
          const AchievementIcon = achievementIcons[item.id] || Medal;
          const progress = Math.max(0, Math.min(100, Math.round((item.current / Math.max(item.target, 1)) * 100)));
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.nextAction?.route) navigate(item.nextAction.route);
                else navigate(moduleRoutes.achievements);
              }}
              data-preview-item="achievements"
              data-preview-id={item.id}
              className={`group rounded-[22px] border bg-white/78 p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${focusedItemId === item.id ? 'border-amber-300 ring-2 ring-amber-100' : 'border-white/80'}`}
            >
              <span className="flex items-start gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.unlocked ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-ink/36'}`}><AchievementIcon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[14px] font-black text-ink">{item.title}</span>
                    <span className="shrink-0 text-[10px] font-black text-ink/42">{item.unlocked ? (isEn ? 'Unlocked' : '已解锁') : `${item.current}/${item.target}`}</span>
                  </span>
                  <span className="mt-1 block line-clamp-2 text-[11px] font-semibold leading-5 text-ink/50">{item.description}</span>
                </span>
              </span>
              <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-black/5"><span className="block h-full rounded-full bg-amber-500 transition-[width]" style={{ width: `${progress}%` }} /></span>
            </button>
          );
        })}
      </div>
    );
  };

  const activeMeta = moduleMeta[activeModule];

  const homePriority = (() => {
    switch (homeModel.priority.kind) {
      case 'setup_aquarium':
        return {
          eyebrow: isEn ? 'Start here' : '先从这里开始',
          title: isEn ? 'Create your aquarium' : '先建立你的鱼缸',
          description: isEn ? 'Add only the tank basics first. You can fill in professional parameters later.' : '先记录缸大小和基础信息即可，专业参数可以以后再补。',
          action: isEn ? 'Create aquarium' : '建立鱼缸',
          route: taskRoutes.aquarium.create('collection-home'),
          attention: false,
        };
      case 'add_resident':
        return {
          eyebrow: isEn ? 'Next step' : '下一步',
          title: isEn ? 'Add the residents already in this tank' : '把现在养的成员记录进来',
          description: isEn ? 'Species and quantity are enough to unlock tank-specific compatibility and care context.' : '只要记录物种和数量，就能开始使用针对这个缸的混养与养护判断。',
          action: isEn ? 'Add residents' : '记录现有成员',
          route: taskRoutes.aquarium.addSpecies(undefined, 'collection-home'),
          attention: false,
        };
      case 'daily_check_attention':
        return {
          eyebrow: isEn ? 'Needs attention' : '现在最值得关注',
          title: isEn ? 'Today’s check found something to review' : '今天的巡检有需要关注的地方',
          description: homeModel.priority.summary || (isEn ? 'Review the latest check before making changes to the tank.' : '先查看最新巡检结果，再决定是否调整鱼缸。'),
          action: isEn ? 'Review check' : '查看巡检',
          route: taskRoutes.aquarium.dailyCheckFrom('collection-home'),
          attention: true,
        };
      case 'daily_check_recorded':
        return {
          eyebrow: isEn ? 'Today' : '今天',
          title: isEn ? 'Today’s check is recorded' : '今天已经检查过了',
          description: homeModel.priority.summary || (isEn ? 'Your latest check is saved.' : '最新巡检已经记录，这里只展示已有结果，不额外推断鱼缸状态。'),
          action: isEn ? 'Open check' : '查看检查',
          route: taskRoutes.aquarium.dailyCheckFrom('collection-home'),
          attention: false,
        };
      default:
        return {
          eyebrow: isEn ? 'Today' : '今天',
          title: isEn ? 'One-minute tank check' : '今天还没检查',
          description: isEn ? 'A quick check keeps the aquarium record useful without asking for lots of parameters.' : '花一分钟确认鱼的状态和水体变化，不需要每天填写一堆参数。',
          action: isEn ? 'Start check' : '开始检查',
          route: taskRoutes.aquarium.dailyCheckFrom('collection-home'),
          attention: false,
        };
    }
  })();

  return (
    <div data-workspace-layout="immersive" className="collection-hub page-frame-wide mx-auto flex w-full min-w-0 flex-col gap-4 pb-24">
      <header className="px-1 py-1">
        <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.14em] text-emerald-700 uppercase"><BookHeart className="h-4 w-4" />{isEn ? 'My Aquarium' : '我的鱼缸'}</div>
        <h1 className="mt-2 text-[30px] font-bold text-ink md:text-[42px]">{isEn ? 'My Aquarium Book' : '我的水族册'}</h1>
        <p className="mt-2 max-w-[720px] text-[13px] font-semibold leading-6 text-ink/56">{isEn ? 'See what is happening in your aquarium, what matters today, and keep its story over time.' : '先看这个缸现在怎么样、今天该做什么；收藏与记录会在养缸过程中自然沉淀下来。'}</p>
      </header>

      <section data-collection-home className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.7fr)]">
        <div className="rounded-[30px] border border-emerald-100 bg-white p-5 shadow-sm md:p-6">
          {homeLoadState === 'loading' ? (
            <div className="flex min-h-[260px] flex-col justify-center">
              <div className="h-3 w-24 animate-pulse rounded-full bg-emerald-100" />
              <div className="mt-4 h-7 w-48 animate-pulse rounded-xl bg-ink/5" />
              <div className="mt-3 h-4 w-64 max-w-full animate-pulse rounded-full bg-ink/5" />
              <p className="mt-5 text-[11px] font-bold text-ink/42">{isEn ? 'Loading your aquarium…' : '正在读取你的鱼缸…'}</p>
            </div>
          ) : homeLoadState === 'error' ? (
            <div className="flex min-h-[260px] flex-col justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-600"><Activity className="h-5 w-5" /></div>
              <h2 className="mt-5 text-[22px] font-black text-ink">{isEn ? 'Aquarium data is temporarily unavailable' : '暂时无法读取鱼缸数据'}</h2>
              <p className="mt-2 max-w-[520px] text-[12px] font-semibold leading-6 text-ink/52">{isEn ? 'Your existing aquarium has not been replaced or cleared. Reopen this page later to try again.' : '你的原有鱼缸没有被清空或替换，稍后重新进入这个页面即可再次读取。'}</p>
            </div>
          ) : homeModel.aquarium ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <div className="text-[10px] font-black tracking-[0.14em] text-emerald-700 uppercase">{isEn ? 'Current aquarium' : '当前鱼缸'}</div>
                  <h2 className="mt-1 truncate text-[24px] font-black text-ink">{homeModel.aquarium.name || (isEn ? 'My aquarium' : '我的鱼缸')}</h2>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-ink/55">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5"><Users className="h-3.5 w-3.5 text-emerald-700" />{isEn ? homeModel.speciesCount + ' species · ' + homeModel.residentCount + ' residents' : homeModel.speciesCount + ' 种 · ' + homeModel.residentCount + ' 个成员'}</span>
                    {homeModel.volumeLiters !== null && <span className="rounded-full bg-sky-50 px-3 py-1.5 text-sky-800">{homeModel.volumeLiters}L</span>}
                    {homeModel.daysRunning !== null && <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-50 px-3 py-1.5"><Clock3 className="h-3.5 w-3.5" />{homeModel.daysRunning === 0 ? (isEn ? 'Started today' : '今天建立') : (isEn ? homeModel.daysRunning + ' days' : '已记录 ' + homeModel.daysRunning + ' 天')}</span>}
                  </div>
                </div>
                <button type="button" onClick={() => navigate(taskRoutes.aquarium.livestockFrom('collection-home'))} className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-[11px] font-black text-emerald-800 transition hover:bg-emerald-100">{isEn ? 'Manage residents' : '管理当前成员'}</button>
              </div>

              {residentPreviews.length > 0 ? (
                <div>
                  <div className="mb-2 text-[11px] font-black text-ink/48">{isEn ? 'Living here now' : '现在生活在这里'}</div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {residentPreviews.map(({ record, fish }) => fish && (
                      <button key={record.id} type="button" onClick={() => navigate(taskRoutes.encyclopedia.species(fish.id, 'collection-home'))} className="flex min-w-0 items-center gap-2 rounded-[18px] border border-ink/5 bg-[#fafbf8] p-2.5 text-left transition hover:border-emerald-100 hover:bg-emerald-50/50">
                        <span className="flex h-10 w-12 shrink-0 items-center justify-center"><ResilientImage src={getSpeciesVisualSources(fish).thumbnail} alt="" className={['h-full w-full object-contain', getSpeciesImageClass(fish)].join(' ')} loading="lazy" decoding="async" /></span>
                        <span className="min-w-0"><span className="block truncate text-[11px] font-black text-ink">{fish.name}</span><span className="mt-0.5 block text-[9px] font-bold text-ink/42">× {record.quantity}</span></span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : <div className="rounded-[20px] bg-emerald-50/70 px-4 py-3 text-[12px] font-semibold leading-5 text-emerald-950/65">{isEn ? 'No current residents have been recorded yet.' : '鱼缸已经建立，但还没有记录当前成员。'}</div>}

              <button type="button" onClick={() => navigate(taskRoutes.compatibility.with({ aquariumId: homeModel.aquarium?.id, source: 'collection-home' }))} className="flex w-full items-center justify-between rounded-[22px] bg-[#0b634d] px-4 py-3.5 text-left text-white transition hover:bg-[#095743]">
                <span><span className="flex items-center gap-2 text-[13px] font-black"><Plus className="h-4 w-4" />{isEn ? 'I want to add a new resident' : '我想加一个新成员'}</span><span className="mt-1 block text-[10px] font-semibold text-white/68">{isEn ? 'Check it against this aquarium before adding it.' : '直接基于这个鱼缸判断是否适合加入。'}</span></span>
                <ChevronRight className="h-5 w-5 shrink-0" />
              </button>
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><Sparkles className="h-5 w-5" /></div>
              <h2 className="mt-5 text-[24px] font-black text-ink">{isEn ? 'Give this aquarium book a real tank' : '先让水族册认识你的鱼缸'}</h2>
              <p className="mt-2 max-w-[520px] text-[12px] font-semibold leading-6 text-ink/52">{isEn ? 'Tank size and current residents are enough to start. Professional measurements stay optional.' : '先告诉我缸有多大、现在养了什么就够了。pH、硬度等专业测量都可以后补。'}</p>
              <button type="button" onClick={() => navigate(taskRoutes.aquarium.create('collection-home'))} className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#0b634d] px-5 py-3 text-[12px] font-black text-white"><Plus className="h-4 w-4" />{isEn ? 'Create my aquarium' : '建立我的鱼缸'}</button>
            </div>
          )}
        </div>

        <div className={homeLoadState === 'ready' && homePriority.attention ? 'rounded-[30px] border border-amber-200 bg-amber-50/80 p-5 shadow-sm md:p-6' : 'rounded-[30px] border border-emerald-100 bg-[#f8fbf8] p-5 shadow-sm md:p-6'}>
          {homeLoadState === 'loading' ? (
            <div className="flex h-full min-h-[220px] flex-col justify-center">
              <div className="h-11 w-11 animate-pulse rounded-full bg-emerald-100" />
              <div className="mt-5 h-3 w-20 animate-pulse rounded-full bg-ink/5" />
              <div className="mt-3 h-6 w-44 animate-pulse rounded-lg bg-ink/5" />
            </div>
          ) : homeLoadState === 'error' ? (
            <div className="flex h-full min-h-[220px] flex-col justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-600"><Activity className="h-5 w-5" /></div>
              <div className="mt-5 text-[10px] font-black tracking-[0.14em] text-stone-500 uppercase">{isEn ? 'Unavailable' : '暂不可用'}</div>
              <h2 className="mt-2 text-[21px] font-black leading-tight text-ink">{isEn ? 'Today’s task could not be loaded' : '今天的事项暂时没有读出来'}</h2>
              <p className="mt-3 text-[12px] font-semibold leading-6 text-ink/56">{isEn ? 'We will not guess a task from stale local data.' : '这里不会拿旧的本地数据替你猜一个任务。'}</p>
            </div>
          ) : (
            <>
              <div className={homePriority.attention ? 'flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-800' : 'flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-800'}><Activity className="h-5 w-5" /></div>
              <div className={homePriority.attention ? 'mt-5 text-[10px] font-black tracking-[0.14em] text-amber-800 uppercase' : 'mt-5 text-[10px] font-black tracking-[0.14em] text-emerald-700 uppercase'}>{homePriority.eyebrow}</div>
              <h2 className="mt-2 text-[21px] font-black leading-tight text-ink">{homePriority.title}</h2>
              <p className="mt-3 text-[12px] font-semibold leading-6 text-ink/56">{homePriority.description}</p>
              <button type="button" onClick={() => navigate(homePriority.route)} className={homePriority.attention ? 'mt-5 inline-flex items-center gap-1.5 rounded-full bg-amber-800 px-4 py-2.5 text-[11px] font-black text-white' : 'mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[11px] font-black text-emerald-800 shadow-sm ring-1 ring-emerald-100'}>{homePriority.action}<ChevronRight className="h-4 w-4" /></button>
            </>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)]">
        <div className="rounded-[26px] border border-ink/5 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-[12px] font-black text-ink"><HistoryIcon className="h-4 w-4 text-emerald-700" />{isEn ? 'Recent tank story' : '这个缸最近发生了什么'}</div><div className="mt-1 text-[10px] font-semibold text-ink/42">{isEn ? 'Built automatically from real aquarium events.' : '从真实养护、成员变化和判断记录中自动形成。'}</div></div><button type="button" data-collection-history-entry onClick={() => navigate('/collection/history')} className="shrink-0 text-[11px] font-black text-emerald-700">{isEn ? 'Full history' : '完整履历'}</button></div>
          {homeLoadState === 'loading' ? <p className="mt-4 rounded-[18px] bg-[#fafbf8] px-4 py-3 text-[11px] font-semibold leading-5 text-ink/44">{isEn ? 'Loading aquarium history…' : '正在读取鱼缸记录…'}</p> : homeLoadState === 'error' ? <p className="mt-4 rounded-[18px] bg-[#fafbf8] px-4 py-3 text-[11px] font-semibold leading-5 text-ink/44">{isEn ? 'Aquarium history is temporarily unavailable.' : '鱼缸记录暂时没有加载出来。'}</p> : homeModel.recentEvents.length > 0 ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{homeModel.recentEvents.map(event => <button key={event.id} type="button" onClick={() => homeModel.aquarium && navigate(taskRoutes.aquarium.timeline(homeModel.aquarium.id, 'collection-home'))} className="flex items-start justify-between gap-3 rounded-[18px] bg-[#fafbf8] px-3.5 py-3 text-left transition hover:bg-emerald-50"><span className="min-w-0"><span className="block truncate text-[11px] font-black text-ink">{event.title}</span>{event.label && <span className="mt-1 block line-clamp-1 text-[9px] font-semibold text-ink/44">{event.label}</span>}</span><span className="shrink-0 text-[9px] font-bold text-ink/35">{formatDate(event.occurredAt)}</span></button>)}</div> : <p className="mt-4 rounded-[18px] bg-[#fafbf8] px-4 py-3 text-[11px] font-semibold leading-5 text-ink/44">{isEn ? 'Care checks and resident changes will gradually become this aquarium’s timeline.' : '之后的巡检、成员变化和混养判断，会自动沉淀成这个缸的时间线。'}</p>}
        </div>
        <button type="button" onClick={() => navigate('/collection/history')} className="group flex items-center justify-between gap-4 rounded-[26px] border border-emerald-100 bg-white px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span><span className="block text-[12px] font-black text-ink">{isEn ? 'My keeping history' : '我的养鱼履历'}</span><span className="mt-1 block text-[10px] font-semibold leading-5 text-ink/45">{homeLoadState === 'loading' ? (isEn ? 'Loading keeping history…' : '正在读取养鱼履历…') : homeLoadState === 'error' ? (isEn ? 'Keeping history is temporarily unavailable' : '养鱼履历暂时没有加载出来') : (isEn ? historySummary.current + ' species now · ' + historySummary.ever + ' ever · ' + historySummary.events + ' events' : '当前 ' + historySummary.current + ' 种 · 曾养 ' + historySummary.ever + ' 种 · ' + historySummary.events + ' 条记录')}</span></span><ChevronRight className="h-4 w-4 shrink-0 text-emerald-700 transition-transform group-hover:translate-x-1" /></button>
      </section>

      <div className="px-1 pt-2">
        <div className="text-[10px] font-black tracking-[0.14em] text-ink/35 uppercase">{isEn ? 'Saved & remembered' : '收藏与回顾'}</div>
        <h2 className="mt-1 text-[20px] font-black text-ink">{isEn ? 'Things you want to revisit' : '以后还会回来看的东西'}</h2>
      </div>

      <section className="relative min-h-[720px] overflow-hidden rounded-[36px] border border-emerald-100/80 bg-[linear-gradient(180deg,#dff6f0_0%,#bfe7dc_53%,#9fcdbf_72%,#7f9f84_100%)] shadow-[0_26px_70px_rgba(18,83,66,0.13)] md:min-h-[760px]" aria-label={isEn ? 'Interactive collection aquarium' : '互动水族册'}>
        <span aria-hidden="true" className="absolute inset-x-0 top-[22%] h-px bg-white/70 shadow-[0_0_30px_white]" />
        <span aria-hidden="true" className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
        <span aria-hidden="true" className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-100/35 blur-3xl" />
        <span aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-[24%] bg-[linear-gradient(180deg,rgba(115,102,75,0.62),rgba(86,72,49,0.78))]" />
        <span aria-hidden="true" className="absolute bottom-[7%] left-[4%] h-[22%] w-4 origin-bottom -rotate-12 rounded-t-full bg-emerald-700/65" />
        <span aria-hidden="true" className="absolute bottom-[6%] left-[9%] h-[16%] w-3 origin-bottom rotate-6 rounded-t-full bg-emerald-800/55" />
        <span aria-hidden="true" className="absolute bottom-[5%] right-[6%] h-[26%] w-4 origin-bottom rotate-12 rounded-t-full bg-emerald-700/60" />

        <div className="collection-compact-nav relative z-20 grid grid-cols-2 gap-3 p-4 lg:hidden">
          {moduleOrder.map(module => {
            const meta = moduleMeta[module];
            const fish = fishData[marineVisualIndexes[module]] || fishData[0];
            return (
              <button
                key={module}
                type="button"
                onClick={() => selectModule(module)}
                aria-pressed={activeModule === module}
                data-collection-compact={module}
                className={`flex min-h-[116px] flex-col items-center justify-center rounded-[24px] border bg-white/68 p-3 backdrop-blur-xl transition-all ${activeModule === module ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-white/80'}`}
              >
                <span className="relative flex h-14 w-24 items-center justify-center">
                  {fish && <ResilientImage src={getSpeciesVisualSources(fish).thumbnail} alt="" className={`h-full w-full object-contain drop-shadow-[0_10px_10px_rgba(18,70,57,0.18)] ${getSpeciesImageClass(fish)}`} loading="lazy" decoding="async" />}
                </span>
                <span className="mt-2 flex items-center gap-1.5 text-[12px] font-black text-ink">{meta.icon}{meta.shortLabel}</span>
                <span className="mt-1 text-[10px] font-bold text-ink/45">{meta.countLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="collection-desktop-nav hidden lg:block">
          {moduleOrder.map(module => {
            const meta = moduleMeta[module];
            const fish = fishData[marineVisualIndexes[module]] || fishData[0];
            const hoverItems = getHoverItems(module);
            const hoverPanelAlign = module === 'wishlist' || module === 'memorial'
              ? 'left-0 translate-x-0'
              : 'right-0 left-auto translate-x-0';
            return (
              <div key={module} className={`group absolute z-30 ${desktopNodePositions[module]}`}>
                <button
                  type="button"
                  onClick={() => selectModule(module)}
                  aria-pressed={activeModule === module}
                  data-collection-node={module}
                  data-node-visual="creature"
                  className="relative flex min-h-[120px] min-w-[140px] flex-col items-center justify-center bg-transparent px-1 py-2 transition-transform duration-300 hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent xl:min-h-[132px] xl:min-w-[160px]"
                >
                  <span aria-hidden="true" className={`absolute left-1/2 top-[42%] h-[82px] w-[126px] xl:h-[92px] xl:w-[144px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-xl transition-all duration-300 ${activeModule === module ? 'bg-white/58 opacity-100 scale-110' : 'bg-white/24 opacity-55 group-hover:opacity-90'}`} />
                  <span className={`relative flex h-[82px] w-[128px] items-center justify-center xl:h-[94px] xl:w-[150px] transition-all duration-300 ${activeModule === module ? 'scale-110 -translate-y-1' : 'group-hover:scale-110'}`}>
                    {fish && <ResilientImage src={getSpeciesVisualSources(fish).thumbnail} alt="" className={`h-full w-full object-contain drop-shadow-[0_18px_14px_rgba(13,68,54,0.28)] ${getSpeciesImageClass(fish)}`} loading="lazy" decoding="async" />}
                  </span>
                  <span className={`relative mt-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black shadow-[0_8px_20px_rgba(13,68,54,0.10)] backdrop-blur-md transition-all ${activeModule === module ? 'border-white/90 bg-white/88 text-ink' : 'border-white/60 bg-white/58 text-ink/72 group-hover:bg-white/78 group-hover:text-ink'}`}>
                    <span className={meta.accentClass}>{meta.icon}</span>
                    <span>{meta.shortLabel}</span>
                    <span className="text-[9px] font-bold text-ink/42">· {meta.countLabel}</span>
                  </span>
                </button>

                <div data-collection-hover={module}
                  className={`pointer-events-none absolute top-[calc(100%+10px)] z-50 w-[236px] translate-y-2 rounded-[22px] ${hoverPanelAlign} border border-white/80 bg-white/92 p-2 opacity-0 shadow-[0_20px_55px_rgba(12,70,55,0.18)] backdrop-blur-xl transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100`}>
                  <div className="px-2 pb-1.5 pt-1 text-[10px] font-black tracking-[0.12em] text-ink/38 uppercase">{isEn ? 'Inside this collection' : '这里面的细分'}</div>
                  {hoverItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => item.all ? navigate(moduleRoutes[module]) : selectModule(module, item.id)}
                      className="flex w-full items-center justify-between gap-2 rounded-[14px] px-2.5 py-2 text-left transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-black text-ink">{item.label}</span>
                        {item.meta && <span className="mt-0.5 block truncate text-[9px] font-bold text-ink/42">{item.meta}</span>}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink/30" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative z-20 mx-4 mb-5 mt-3 lg:absolute lg:left-1/2 lg:top-1/2 lg:m-0 lg:w-[min(50%,720px)] lg:-translate-x-1/2 lg:-translate-y-1/2 xl:w-[min(56%,720px)]">
          <section key={activeModule} className="overflow-hidden rounded-[32px] border border-white/80 bg-[#fdfcf8]/94 p-4 shadow-[0_26px_72px_rgba(13,67,54,0.18)] backdrop-blur-2xl md:p-6" aria-live="polite" data-collection-focus={activeModule}>
            <div className="flex items-start justify-between gap-4 border-b border-ink/8 pb-4">
              <div className="min-w-0">
                <div className={`flex items-center gap-2 text-[11px] font-black ${activeMeta.accentClass}`}>{activeMeta.icon}{activeMeta.countLabel}</div>
                <h2 className="mt-2 font-serif text-[27px] font-bold leading-tight text-ink md:text-[34px]">{activeMeta.title}</h2>
                <p className="mt-2 max-w-[540px] text-[12px] font-semibold leading-6 text-ink/54">{activeMeta.description}</p>
              </div>
              <button type="button" onClick={() => navigate(moduleRoutes[activeModule])} className="hidden shrink-0 items-center gap-1 rounded-full border border-emerald-100 bg-white px-4 py-2.5 text-[11px] font-black text-emerald-800 shadow-sm transition-transform hover:-translate-y-0.5 sm:flex">{isEn ? 'Open full collection' : '打开完整模块'}<ChevronRight className="h-4 w-4" /></button>
            </div>

            <div className="mt-4 max-h-[430px] overflow-y-auto pr-1">{renderCentralContent()}</div>

            <button type="button" onClick={() => navigate(moduleRoutes[activeModule])} className="mt-4 flex w-full items-center justify-center gap-1 rounded-full bg-[#0b634d] px-4 py-3 text-[12px] font-black text-white sm:hidden">{isEn ? 'Open full collection' : '打开完整模块'}<ChevronRight className="h-4 w-4" /></button>
          </section>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/65 bg-white/50 px-3 py-2 text-[10px] font-bold text-emerald-950/55 backdrop-blur-md lg:flex"><Sparkles className="h-3.5 w-3.5" />{isEn ? 'Hover to peek · click to focus' : '悬停预览 · 点击聚焦到中央'}</div>
      </section>
    </div>
  );
}
