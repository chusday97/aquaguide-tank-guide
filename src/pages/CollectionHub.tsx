import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookHeart,
  BookOpenCheck,
  Check,
  ChevronRight,
  Heart,
  Medal,
  ShieldCheck,
  Skull,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResilientImage } from '../components/common/ResilientImage';
import { careTopicsData } from '../data/careTopicsData';
import { fishData } from '../data/fishData';
import { getCareVisualSources } from '../lib/careVisual';
import { getSpeciesImageClass, getSpeciesVisualSources } from '../lib/speciesVisual';
import type { AchievementId, CollectionModule } from '../modules/collection/collection.types';
import { getCollectionSnapshot, subscribeToCollection } from '../services/collection/collection.service';

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
  wishlist: 'left-[6%] top-[16%]',
  care: 'right-[5%] top-[15%]',
  memorial: 'left-[8%] bottom-[13%]',
  achievements: 'right-[7%] bottom-[12%]',
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
  const [activeModule, setActiveModule] = useState<CollectionModule>('wishlist');
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  useEffect(() => subscribeToCollection(() => setSnapshot(getCollectionSnapshot())), []);

  const wishlistFishes = useMemo(() => [...snapshot.wishlistIds]
    .reverse()
    .map(id => fishData.find(fish => fish.id === id))
    .filter((fish): fish is (typeof fishData)[number] => Boolean(fish))
    .slice(0, 4), [snapshot.wishlistIds]);

  const careTopics = useMemo(() => Object.values(snapshot.careFavorites)
    .sort((a, b) => new Date(b.favoritedAt).getTime() - new Date(a.favoritedAt).getTime())
    .map(favorite => careTopicsData.find(topic => topic.id === favorite.id))
    .filter((topic): topic is (typeof careTopicsData)[number] => Boolean(topic))
    .slice(0, 4), [snapshot.careFavorites]);

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
      countLabel: isEn ? `${snapshot.counts.wishlist} saved` : `${snapshot.counts.wishlist} 种`,
      icon: <Heart className="h-4 w-4" />,
      accentClass: 'text-rose-600',
    },
    care: {
      title: isEn ? 'Saved Care' : '养护收藏',
      shortLabel: isEn ? 'Care' : '养护',
      description: isEn ? 'Keep the care guides you want to return to during real aquarium maintenance.' : '把真正会反复查看的养护指南收进来，维护时直接继续。',
      countLabel: isEn ? `${snapshot.counts.care} guides` : `${snapshot.counts.care} 篇`,
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

  return (
    <div className="collection-hub page-frame-wide mx-auto flex w-full min-w-0 flex-col gap-4 pb-24">
      <header className="px-1 py-1">
        <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.14em] text-emerald-700 uppercase"><BookHeart className="h-4 w-4" />{isEn ? 'Aqua Collection' : '自然水族册'}</div>
        <h1 className="mt-2 text-[30px] font-bold text-ink md:text-[42px]">{isEn ? 'My Collection' : '我的水族册'}</h1>
        <p className="mt-2 max-w-[680px] text-[13px] font-semibold leading-6 text-ink/56">{isEn ? 'Hover over a creature to preview its collection, then bring that collection into the center.' : '把鼠标移到海洋生物上查看细分内容，点击后把对应收藏拉到中央。'}</p>
      </header>

      <section className="relative min-h-[720px] overflow-hidden rounded-[36px] border border-emerald-100/80 bg-[linear-gradient(180deg,#dff6f0_0%,#bfe7dc_53%,#9fcdbf_72%,#7f9f84_100%)] shadow-[0_26px_70px_rgba(18,83,66,0.13)] md:min-h-[760px]" aria-label={isEn ? 'Interactive collection aquarium' : '互动水族册'}>
        <span aria-hidden="true" className="absolute inset-x-0 top-[22%] h-px bg-white/70 shadow-[0_0_30px_white]" />
        <span aria-hidden="true" className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
        <span aria-hidden="true" className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-100/35 blur-3xl" />
        <span aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-[24%] bg-[linear-gradient(180deg,rgba(115,102,75,0.62),rgba(86,72,49,0.78))]" />
        <span aria-hidden="true" className="absolute bottom-[7%] left-[4%] h-[22%] w-4 origin-bottom -rotate-12 rounded-t-full bg-emerald-700/65" />
        <span aria-hidden="true" className="absolute bottom-[6%] left-[9%] h-[16%] w-3 origin-bottom rotate-6 rounded-t-full bg-emerald-800/55" />
        <span aria-hidden="true" className="absolute bottom-[5%] right-[6%] h-[26%] w-4 origin-bottom rotate-12 rounded-t-full bg-emerald-700/60" />

        <div className="relative z-20 grid grid-cols-2 gap-3 p-4 md:hidden">
          {moduleOrder.map(module => {
            const meta = moduleMeta[module];
            const fish = fishData[marineVisualIndexes[module]] || fishData[0];
            return (
              <button
                key={module}
                type="button"
                onClick={() => selectModule(module)}
                aria-pressed={activeModule === module}
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

        <div className="hidden md:block">
          {moduleOrder.map(module => {
            const meta = moduleMeta[module];
            const fish = fishData[marineVisualIndexes[module]] || fishData[0];
            const hoverItems = getHoverItems(module);
            return (
              <div key={module} className={`group absolute z-30 ${desktopNodePositions[module]}`}>
                <button
                  type="button"
                  onClick={() => selectModule(module)}
                  aria-pressed={activeModule === module}
                  className={`relative flex min-h-[112px] min-w-[150px] flex-col items-center justify-center rounded-[30px] border px-4 py-3 transition-all duration-300 hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${activeModule === module ? 'border-white bg-white/88 shadow-[0_18px_45px_rgba(11,88,66,0.22)]' : 'border-white/55 bg-white/38 shadow-[0_14px_34px_rgba(13,79,61,0.10)] backdrop-blur-md'}`}
                >
                  <span className="relative flex h-[72px] w-[122px] items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    {fish && <ResilientImage src={getSpeciesVisualSources(fish).thumbnail} alt="" className={`h-full w-full object-contain drop-shadow-[0_14px_12px_rgba(13,68,54,0.24)] ${getSpeciesImageClass(fish)}`} loading="lazy" decoding="async" />}
                    <span className={`absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ${meta.accentClass}`}>{meta.icon}</span>
                  </span>
                  <span className="mt-1 text-[12px] font-black text-ink">{meta.shortLabel}</span>
                  <span className="text-[10px] font-bold text-ink/46">{meta.countLabel}</span>
                </button>

                <div className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-50 w-[236px] -translate-x-1/2 translate-y-2 rounded-[22px] border border-white/80 bg-white/92 p-2 opacity-0 shadow-[0_20px_55px_rgba(12,70,55,0.18)] backdrop-blur-xl transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
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

        <div className="relative z-20 mx-4 mb-5 mt-3 md:absolute md:left-1/2 md:top-1/2 md:m-0 md:w-[min(58%,720px)] md:-translate-x-1/2 md:-translate-y-1/2">
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

        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/65 bg-white/50 px-3 py-2 text-[10px] font-bold text-emerald-950/55 backdrop-blur-md md:flex"><Sparkles className="h-3.5 w-3.5" />{isEn ? 'Hover to peek · click to focus' : '悬停预览 · 点击聚焦到中央'}</div>
      </section>
    </div>
  );
}
