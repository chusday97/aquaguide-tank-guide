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

type HoverItem = {
  id: string;
  label: string;
  meta?: string;
  all?: boolean;
};

export default function CollectionHub() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const [snapshot, setSnapshot] = useState(getCollectionSnapshot);
  const [activeModule, setActiveModule] = useState<CollectionModule>('wishlist');

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

  const selectModule = (module: CollectionModule) => {
    setActiveModule(module);
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

  return (
    <div data-workspace-layout="immersive" className="collection-hub page-frame-wide mx-auto flex w-full min-w-0 flex-col gap-4 pb-24">
      <header className="px-1 py-1">
        <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.14em] text-emerald-700 uppercase"><BookHeart className="h-4 w-4" />{isEn ? 'Aqua Collection' : '自然水族册'}</div>
        <h1 className="mt-2 text-[30px] font-bold text-ink md:text-[42px]">{isEn ? 'My Collection' : '我的水族册'}</h1>
        <p className="mt-2 max-w-[680px] text-[13px] font-semibold leading-6 text-ink/56">{isEn ? 'Four key collection sectors evenly placed across your aquarium.' : '涵盖种草、养护、生命纪念与成长勋章四大板块，直接触达对应收藏。'}</p>
      </header>

      <section className="relative min-h-[720px] overflow-hidden rounded-[36px] border border-emerald-100/80 bg-[linear-gradient(180deg,#dff6f0_0%,#bfe7dc_53%,#9fcdbf_72%,#7f9f84_100%)] shadow-[0_26px_70px_rgba(18,83,66,0.13)] md:min-h-[760px]" aria-label={isEn ? 'Interactive collection aquarium' : '互动水族册'}>
        <span aria-hidden="true" className="absolute inset-x-0 top-[22%] h-px bg-white/70 shadow-[0_0_30px_white]" />
        <span aria-hidden="true" className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
        <span aria-hidden="true" className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-100/35 blur-3xl" />
        <span aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-[24%] bg-[linear-gradient(180deg,rgba(115,102,75,0.62),rgba(86,72,49,0.78))]" />
        <span aria-hidden="true" className="absolute bottom-[7%] left-[4%] h-[22%] w-4 origin-bottom -rotate-12 rounded-t-full bg-emerald-700/65" />
        <span aria-hidden="true" className="absolute bottom-[6%] left-[9%] h-[16%] w-3 origin-bottom rotate-6 rounded-t-full bg-emerald-800/55" />
        <span aria-hidden="true" className="absolute bottom-[5%] right-[6%] h-[26%] w-4 origin-bottom rotate-12 rounded-t-full bg-emerald-700/60" />

        {/* 四个板块均匀放置：4 列网格卡片（移动端 2x2，桌面端 4 列并排），彻底去掉原来遮挡中央的浮动白色大卡片 */}
        <div className="relative z-20 mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {moduleOrder.map(module => {
              const meta = moduleMeta[module];
              const fish = fishData[marineVisualIndexes[module]] || fishData[0];
              const hoverItems = getHoverItems(module);
              const isCurrent = activeModule === module;

              return (
                <div
                  key={module}
                  onClick={() => selectModule(module)}
                  className={`group relative flex flex-col justify-between rounded-[30px] border p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_22px_45px_rgba(14,64,52,0.18)] ${
                    isCurrent
                      ? 'border-emerald-400/90 bg-white/88 shadow-[0_16px_38px_rgba(14,64,52,0.14)] ring-2 ring-emerald-300/60'
                      : 'border-white/75 bg-white/65 hover:border-white/95 hover:bg-white/82'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectModule(module); }}
                  data-collection-node={module}
                >
                  {/* 顶部：图标、板块简标与已收录数量 */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[11px] font-black shadow-sm ${meta.accentClass}`}>
                        {meta.icon}
                        <span>{meta.shortLabel}</span>
                      </span>
                      <span className="text-[11px] font-black text-ink/45">{meta.countLabel}</span>
                    </div>

                    {/* 灵动海洋生物展示 */}
                    <div className="relative my-3 flex h-[120px] w-full items-center justify-center">
                      <span aria-hidden="true" className="absolute h-24 w-24 rounded-full bg-emerald-100/40 blur-xl transition-transform duration-300 group-hover:scale-125" />
                      {fish && (
                        <ResilientImage
                          src={getSpeciesVisualSources(fish).thumbnail}
                          alt={meta.title}
                          className={`relative h-full w-full object-contain drop-shadow-[0_16px_14px_rgba(13,68,54,0.24)] transition-transform duration-300 group-hover:scale-110 ${getSpeciesImageClass(fish)}`}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>

                    {/* 标题与描述 */}
                    <h3 className="font-serif text-[20px] font-bold text-ink">{meta.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-relaxed text-ink/54">{meta.description}</p>
                  </div>

                  {/* 细分子项快捷入口预览 */}
                  <div className="mt-4 border-t border-ink/8 pt-3">
                    <div className="mb-1 text-[10px] font-black tracking-wider text-ink/38 uppercase">
                      {isEn ? 'Preview items' : '收录细分'}
                    </div>
                    <div className="flex flex-col gap-1">
                      {hoverItems.slice(0, 2).map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.all) navigate(moduleRoutes[module]);
                            else openItem(module, item.id);
                          }}
                          className="flex items-center justify-between rounded-xl px-2 py-1.5 text-left text-[11px] font-bold text-ink/75 transition-colors hover:bg-emerald-50/80 hover:text-emerald-900"
                        >
                          <span className="truncate">{item.label}</span>
                          <ChevronRight className="h-3 w-3 shrink-0 text-ink/30" />
                        </button>
                      ))}
                    </div>

                    {/* 完整进入按钮 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(moduleRoutes[module]);
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-800/90 py-2.5 text-[11px] font-black text-white shadow-sm transition-all hover:bg-emerald-900 hover:shadow"
                    >
                      <span>{isEn ? 'Open module' : '打开完整模块'}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/65 bg-white/50 px-3 py-1.5 text-[10px] font-bold text-emerald-950/55 backdrop-blur-md lg:flex">
          <Sparkles className="h-3.5 w-3.5" />
          {isEn ? 'Four key collection sectors · evenly organized' : '水族册四大核心板块 · 均匀呈现'}
        </div>
      </section>
    </div>
  );
}
