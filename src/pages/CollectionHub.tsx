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
import { getCollectionSnapshot, hydrateCollectionData, subscribeToCollection } from '../services/collection/collection.service';

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
  remainingCount,
  moreLabel,
  children,
}: {
  id: CollectionModule;
  title: string;
  count: string;
  icon: ReactNode;
  tone: string;
  remainingCount: number;
  moreLabel: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const openModule = () => {
    navigate(moduleRoutes[id]);
  };
  return (
    <section
      data-collection-module={id}
      className={`flex min-h-[326px] min-w-0 flex-col rounded-[24px] border p-4 text-left ${id === 'achievements' ? 'border-slate-200 bg-slate-50 text-slate-500 shadow-none' : 'border-white/90 bg-white shadow-sm'}`}
    >
      <button
        type="button"
        onClick={openModule}
        className="group flex w-full items-center gap-3 rounded-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        aria-label={`${title}，${count}`}
      >
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] ${tone}`}>{icon}</span>
        <span className="min-w-0 flex-1 text-[17px] font-black text-ink">
          {title}
          <span className="ml-2 text-[13px] text-ink/45">· {count}</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink/25 transition-transform group-hover:translate-x-0.5" />
      </button>
      <span className="mt-3 flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[18px] border border-slate-100 bg-[#fbfcfb]">
        {children}
      </span>
      {remainingCount > 0 && (
        <button
          type="button"
          onClick={openModule}
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-full text-[12px] font-black text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          {moreLabel}<ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </section>
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
  const navigate = useNavigate();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const [snapshot, setSnapshot] = useState(getCollectionSnapshot);

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeToCollection(() => setSnapshot(getCollectionSnapshot()));
    void hydrateCollectionData()
      .then(next => { if (active) setSnapshot(next); })
      .catch(() => undefined);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const wishlistFishes = useMemo(() => [...snapshot.wishlistIds]
    .reverse()
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
  const achievementPreviews = useMemo(() => {
    const prioritized = [
      ...(unlockedAchievement ? [unlockedAchievement] : []),
      ...(nextAchievement ? [nextAchievement] : []),
      ...snapshot.achievements,
    ];
    return prioritized
      .filter((item, index, items) => items.findIndex(candidate => candidate.id === item.id) === index)
      .slice(0, 2);
  }, [nextAchievement, snapshot.achievements, unlockedAchievement]);
  const openItem = (module: CollectionModule, itemId: string) => {
    if (module === 'memorial') {
      navigate(`/collection/memorial/${encodeURIComponent(itemId)}`);
      return;
    }
    navigate(`${moduleRoutes[module]}?item=${encodeURIComponent(itemId)}`);
  };
  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(isEn ? 'en' : 'zh-CN', { month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <div className="collection-hub page-frame mx-auto flex w-full min-w-0 max-w-[1180px] flex-col gap-4 pb-24">
      <header className="px-1 py-1">
        <h1 className="text-[25px] font-black tracking-tight text-ink">{isEn ? 'My Collection' : '我的水族册'}</h1>
        <p className="mt-1 text-[12px] font-bold text-ink/48">{isEn ? 'Wishlist · Care · Memorials' : '种草 · 养护 · 纪念'}</p>
      </header>

      <section className="grid min-w-0 gap-3 min-[900px]:grid-cols-2" aria-label={isEn ? 'Collection previews' : '水族册内容预览'}>
        <CollectionModuleCard
          id="wishlist"
          title={isEn ? 'Species Wishlist' : '种草图鉴'}
          count={String(snapshot.counts.wishlist)}
          icon={<Heart className="h-5 w-5" />}
          tone="bg-rose-50 text-rose-600"
          remainingCount={Math.max(0, snapshot.counts.wishlist - 3)}
          moreLabel={isEn ? `More ${Math.max(0, snapshot.counts.wishlist - 3)} species` : `更多 ${Math.max(0, snapshot.counts.wishlist - 3)} 种`}
        >
          {wishlistFishes.length ? wishlistFishes.map(fish => (
            <button
              key={fish.id}
              type="button"
              data-preview-item="wishlist"
              data-preview-id={fish.id}
              onClick={() => openItem('wishlist', fish.id)}
              className="flex min-h-0 w-full flex-1 items-center gap-3 border-b border-slate-100 px-2.5 py-2 text-left transition-colors last:border-b-0 hover:bg-rose-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500"
            >
              <span className="flex h-[62px] w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-white">
                <ResilientImage
                  src={getSpeciesVisualSources(fish).thumbnail}
                  alt={fish.name}
                  className={`h-full w-full object-contain p-[7%] ${getSpeciesImageClass(fish)}`}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-black text-ink">{fish.name}</span>
                <span className="mt-1 inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-black text-rose-600">{fish.category}</span>
              </span>
            </button>
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
          remainingCount={Math.max(0, snapshot.counts.care - 2)}
          moreLabel={isEn ? `More ${Math.max(0, snapshot.counts.care - 2)} guides` : `更多 ${Math.max(0, snapshot.counts.care - 2)} 篇`}
        >
          {careTopics.length ? careTopics.map(topic => (
            <button
              key={topic.id}
              type="button"
              data-preview-item="care"
              data-preview-id={topic.id}
              onClick={() => openItem('care', topic.id)}
              className="flex min-h-0 w-full flex-1 items-center gap-3 border-b border-slate-100 px-2.5 py-2 text-left transition-colors last:border-b-0 hover:bg-sky-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500"
            >
              <span className="flex h-[62px] w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-white">
                <ResilientImage
                  src={getCareVisualSources(topic).thumbnail}
                  alt={topic.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="min-w-0">
                <span className="block line-clamp-2 text-[13px] font-black leading-5 text-ink">{topic.title}</span>
                <span className="mt-1 block text-[10px] font-bold text-ink/42">{topic.category}</span>
              </span>
            </button>
          )) : (
            <PreviewEmpty
              icon={<BookOpenCheck className="h-5 w-5" />}
              title={isEn ? 'No saved care yet' : '还没有养护收藏'}
              description={isEn ? 'Save care guides to keep important routines close at hand.' : '收藏常用养护内容后，会在这里显示。'}
            />
          )}
        </CollectionModuleCard>

        <CollectionModuleCard
          id="memorial"
          title={isEn ? 'Life Memorial' : '生命纪念'}
          count={String(snapshot.counts.memorial)}
          icon={<Skull className="h-5 w-5" />}
          tone="bg-slate-100 text-slate-600"
          remainingCount={Math.max(0, snapshot.counts.memorial - 2)}
          moreLabel={isEn ? `More ${Math.max(0, snapshot.counts.memorial - 2)} records` : `更多 ${Math.max(0, snapshot.counts.memorial - 2)} 条`}
        >
          {recentMemorials.length ? recentMemorials.map(record => {
            const fish = fishData.find(item => item.id === record.fishId);
            return (
              <button
                key={record.id}
                type="button"
                data-preview-item="memorial"
                data-preview-id={record.id}
                onClick={() => openItem('memorial', record.id)}
                className="flex min-h-0 w-full flex-1 items-center gap-3 border-b border-slate-100 px-2.5 py-2 text-left transition-colors last:border-b-0 hover:bg-slate-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-500"
              >
                <span className="flex h-[62px] w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-white">
                  {fish ? (
                    <ResilientImage
                      src={getSpeciesVisualSources(fish).thumbnail}
                      alt={fish.name}
                      className={`h-full w-full object-contain p-[7%] opacity-75 grayscale-[28%] ${getSpeciesImageClass(fish)}`}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : <Skull className="h-5 w-5 text-ink/30" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-black text-ink">{fish?.name || (isEn ? 'Life Memorial' : '生命纪念')}</span>
                  <span className="mt-1 block text-[10px] font-bold text-ink/42">{formatDate(record.date)}</span>
                </span>
              </button>
            );
          }) : (
            <PreviewEmpty
              icon={<Skull className="h-5 w-5" />}
              title={isEn ? 'No memorial records' : '还没有生命纪念'}
              description={isEn ? 'Memorial records will appear here when you choose to keep them.' : '当你选择留下生命记录时，会在这里显示。'}
            />
          )}
        </CollectionModuleCard>

        <CollectionModuleCard
          id="achievements"
          title={isEn ? 'Achievements' : '成就勋章'}
          count={isEn ? 'Building' : '建设中'}
          icon={<Medal className="h-5 w-5" />}
          tone="bg-slate-100 text-slate-400"
          remainingCount={0}
          moreLabel=""
        >
          <PreviewEmpty
            icon={<Medal className="h-5 w-5" />}
            title={isEn ? 'Coming later' : '暂未开放'}
            description={isEn ? 'Achievements are still being designed and will not count as completed product behavior yet.' : '成就体系仍在设计中，目前不会作为已完成的产品行为展示。'}
          />
        </CollectionModuleCard>
      </section>
    </div>
  );
}
