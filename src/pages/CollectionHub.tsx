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

function CollectionModuleCard({
  id,
  title,
  count,
  icon,
  tone,
  footer,
  children,
}: {
  id: CollectionModule;
  title: string;
  count: string;
  icon: ReactNode;
  tone: string;
  footer: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      data-collection-module={id}
      onClick={() => navigate(moduleRoutes[id])}
      className="group flex min-h-[326px] min-w-0 flex-col rounded-[24px] border border-white/90 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      aria-label={`${title}，${footer}`}
    >
      <span className="flex w-full items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] ${tone}`}>{icon}</span>
        <span className="min-w-0 flex-1 text-[17px] font-black text-ink">
          {title}
          <span className="ml-2 text-[13px] text-ink/45">· {count}</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink/25 transition-transform group-hover:translate-x-0.5" />
      </span>
      <span className="mt-3 flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[18px] border border-slate-100 bg-[#fbfcfb]">
        {children}
      </span>
      <span className="mt-3 inline-flex w-full items-center justify-center gap-1 text-[12px] font-black text-emerald-800">
        {footer}<ChevronRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

function PreviewEmpty({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <span className="flex min-h-[210px] flex-1 flex-col items-center justify-center px-5 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-white text-ink/25 shadow-sm">{icon}</span>
      <span className="mt-3 text-[13px] font-black text-ink">{title}</span>
      <span className="mt-1 max-w-[280px] text-[11px] font-bold leading-5 text-ink/42">{description}</span>
    </span>
  );
}

export default function CollectionHub() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [snapshot, setSnapshot] = useState(getCollectionSnapshot);

  useEffect(() => subscribeToCollection(() => setSnapshot(getCollectionSnapshot())), []);

  const wishlistFishes = useMemo(() => snapshot.wishlistIds
    .map(id => fishData.find(fish => fish.id === id))
    .filter((fish): fish is (typeof fishData)[number] => Boolean(fish))
    .slice(0, 3), [snapshot.wishlistIds]);

  const careTopics = useMemo(() => Object.values(snapshot.careFavorites)
    .sort((a, b) => new Date(b.favoritedAt).getTime() - new Date(a.favoritedAt).getTime())
    .map(favorite => careTopicsData.find(topic => topic.id === favorite.id))
    .filter((topic): topic is (typeof careTopicsData)[number] => Boolean(topic))
    .slice(0, 2), [snapshot.careFavorites]);

  const recentMemorials = snapshot.memorials.slice(0, 2);
  const unlockedAchievement = [...snapshot.achievements].reverse().find(item => item.unlocked);
  const nextAchievement = snapshot.achievements
    .filter(item => !item.unlocked)
    .sort((a, b) => (b.current / b.target) - (a.current / a.target))[0];
  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(isEn ? 'en' : 'zh-CN', { month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <div className="collection-hub page-frame mx-auto flex w-full min-w-0 max-w-[1180px] flex-col gap-4 pb-24">
      <header className="px-1 py-1">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-800">
          <BookHeart className="h-3.5 w-3.5" /> {isEn ? 'Aqua Collection' : '自然水族册'}
        </div>
        <h1 className="mt-2 text-[25px] font-black tracking-tight text-ink">{isEn ? 'My Collection' : '我的水族册'}</h1>
        <p className="mt-1 text-[12px] font-bold text-ink/48">{isEn ? 'Wishlist · Care · Memorials · Badges' : '种草 · 养护 · 纪念 · 勋章'}</p>
      </header>

      <section className="grid min-w-0 gap-3 min-[900px]:grid-cols-2" aria-label={isEn ? 'Collection previews' : '水族册内容预览'}>
        <CollectionModuleCard
          id="wishlist"
          title={isEn ? 'Species Wishlist' : '种草图鉴'}
          count={String(snapshot.counts.wishlist)}
          icon={<Heart className="h-5 w-5" />}
          tone="bg-rose-50 text-rose-600"
          footer={isEn ? `View all ${snapshot.counts.wishlist} species` : `查看全部 ${snapshot.counts.wishlist} 种`}
        >
          {wishlistFishes.length ? wishlistFishes.map(fish => (
            <span key={fish.id} data-preview-item="wishlist" className="flex min-h-0 flex-1 items-center gap-3 border-b border-slate-100 px-2.5 py-2 last:border-b-0">
              <span className="flex h-[62px] w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-white">
                <ResilientImage
                  src={getSpeciesVisualSources(fish).thumbnail}
                  alt=""
                  className={`h-full w-full object-contain p-[7%] ${getSpeciesImageClass(fish)}`}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-black text-ink">{fish.name}</span>
                <span className="mt-1 inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-black text-rose-600">{fish.category}</span>
              </span>
            </span>
          )) : (
            <PreviewEmpty
              icon={<Heart className="h-5 w-5" />}
              title={isEn ? 'No saved species yet' : '还没有种草生物'}
              description={isEn ? 'Save species from the encyclopedia to preview them here.' : '从图鉴收藏感兴趣的生物后，会在这里显示。'}
            />
          )}
        </CollectionModuleCard>

        <CollectionModuleCard
          id="care"
          title={isEn ? 'Saved Care' : '养护收藏'}
          count={String(snapshot.counts.care)}
          icon={<BookOpenCheck className="h-5 w-5" />}
          tone="bg-sky-50 text-sky-700"
          footer={isEn ? `View all ${snapshot.counts.care} guides` : `查看全部 ${snapshot.counts.care} 篇`}
        >
          {careTopics.length ? careTopics.map(topic => (
            <span key={topic.id} data-preview-item="care" className="grid min-h-0 flex-1 grid-cols-[116px_minmax(0,1fr)] items-center gap-3 border-b border-slate-100 p-2.5 last:border-b-0">
              <span className="h-[82px] overflow-hidden rounded-[13px] bg-white">
                <ResilientImage
                  src={getCareVisualSources(topic.imageUrl).thumbnail}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-[13px] font-black leading-5 text-ink">{topic.title}</span>
                <span className="mt-1 line-clamp-2 text-[10px] font-bold leading-4 text-ink/45">{topic.summary}</span>
              </span>
            </span>
          )) : (
            <PreviewEmpty
              icon={<BookOpenCheck className="h-5 w-5" />}
              title={isEn ? 'No saved care guides' : '还没有养护收藏'}
              description={isEn ? 'Save practical guides to reach them quickly when needed.' : '收藏常用处理步骤，遇到问题时可以快速找到。'}
            />
          )}
        </CollectionModuleCard>

        <CollectionModuleCard
          id="memorial"
          title={isEn ? 'Memorials' : '生命纪念'}
          count={String(snapshot.counts.memorial)}
          icon={<Skull className="h-5 w-5" />}
          tone="bg-slate-100 text-slate-600"
          footer={isEn ? `View all ${snapshot.counts.memorial} records` : `查看全部 ${snapshot.counts.memorial} 条`}
        >
          {recentMemorials.length ? recentMemorials.map(record => {
            const fish = fishData.find(item => item.id === record.fishId);
            return (
              <span key={record.id} data-preview-item="memorial" className="grid min-h-0 flex-1 grid-cols-[116px_minmax(0,1fr)] items-center gap-3 border-b border-slate-100 p-2.5 last:border-b-0">
                <span className="flex h-[82px] items-center justify-center overflow-hidden rounded-[13px] bg-slate-100 grayscale">
                  {fish ? (
                    <ResilientImage
                      src={getSpeciesVisualSources(fish).thumbnail}
                      alt=""
                      className={`h-full w-full object-contain p-[8%] opacity-75 ${getSpeciesImageClass(fish)}`}
                      loading="lazy"
                    />
                  ) : <Skull className="h-5 w-5 text-ink/25" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-black text-ink">{fish?.name || (isEn ? 'Unrecognized species' : '未匹配生物')}</span>
                  <span className="mt-1 block text-[10px] font-bold text-ink/45">{formatDate(record.date)}</span>
                  <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[9px] font-black ${record.reason ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {record.reason ? (isEn ? 'Reflected' : '已复盘') : (isEn ? 'Reason needed' : '待补充原因')}
                  </span>
                </span>
              </span>
            );
          }) : (
            <PreviewEmpty
              icon={<Skull className="h-5 w-5" />}
              title={isEn ? 'No memorial records' : '还没有生命纪念'}
              description={isEn ? 'Memorial records preserve dates and care reflections.' : '生命纪念会保留日期和养护复盘。'}
            />
          )}
        </CollectionModuleCard>

        <CollectionModuleCard
          id="achievements"
          title={isEn ? 'Achievements' : '成就勋章'}
          count={`${snapshot.counts.achievements}/${snapshot.achievements.length}`}
          icon={<Medal className="h-5 w-5" />}
          tone="bg-amber-50 text-amber-700"
          footer={isEn ? 'View all achievements' : '查看全部勋章'}
        >
          <span className="flex min-h-0 flex-1 flex-col p-2.5">
            {unlockedAchievement ? (() => {
              const Icon = achievementIcons[unlockedAchievement.id];
              return (
                <span className="flex items-center gap-3 rounded-[14px] border border-amber-100 bg-white px-3 py-3">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-300 text-amber-950">
                    <Icon className="h-5 w-5" />
                    <Check className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-emerald-700 p-1 text-white" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-black text-ink">{unlockedAchievement.title}</span>
                    <span className="mt-1 text-[10px] font-black text-emerald-700">{isEn ? 'Unlocked' : '已解锁'}</span>
                  </span>
                </span>
              );
            })() : (
              <span className="rounded-[14px] bg-white px-3 py-4 text-[11px] font-bold text-ink/45">
                {isEn ? 'Complete your first action to unlock a badge.' : '完成第一个养护行动后，会自动解锁勋章。'}
              </span>
            )}

            {nextAchievement && (
              <span className="mt-2 rounded-[14px] border border-amber-100 bg-white px-3 py-3">
                <span className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-[12px] font-black text-ink">{nextAchievement.title}</span>
                  <span className="shrink-0 text-[10px] font-black text-amber-800">{nextAchievement.current}/{nextAchievement.target}</span>
                </span>
                <span className="mt-2 block h-2 overflow-hidden rounded-full bg-amber-100">
                  <span className="block h-full rounded-full bg-amber-500" style={{ width: `${Math.min(100, Math.round((nextAchievement.current / nextAchievement.target) * 100))}%` }} />
                </span>
                <span className="mt-2 block text-[10px] font-bold text-ink/45">
                  {isEn ? `${Math.max(0, nextAchievement.target - nextAchievement.current)} remaining` : `还差 ${Math.max(0, nextAchievement.target - nextAchievement.current)}`}
                </span>
              </span>
            )}
            <span className="mt-auto pt-3 text-center text-[10px] font-black text-amber-800">{isEn ? 'Unlocks automatically · no claiming needed' : '自动解锁，无需领取'}</span>
          </span>
        </CollectionModuleCard>
      </section>
    </div>
  );
}
