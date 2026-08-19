import { Children, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, type PanInfo } from 'motion/react';
import {
  BookHeart,
  BookOpenCheck,
  Check,
  ChevronLeft,
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

function CollectionCarousel({
  children,
  isEn,
}: {
  children: ReactNode;
  isEn: boolean;
}) {
  const items = Children.toArray(children);
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = items.length;

  if (count === 0) return null;

  const activeIndex = ((currentIndex % count) + count) % count;
  const move = (delta: number) => setCurrentIndex(previous => previous + delta);
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.18;
    if (swipe < -50) move(1);
    if (swipe > 50) move(-1);
  };

  return (
    <div className="collection-hub-carousel" aria-label={isEn ? 'Collection previews' : '水族册内容预览'}>
      <div className="relative flex h-[390px] w-full items-center justify-center overflow-hidden sm:h-[410px]">
        {items.map((item, index) => {
          let offset = index - activeIndex;
          if (offset > Math.floor(count / 2)) offset -= count;
          if (offset < -Math.floor(count / 2)) offset += count;

          const isActive = offset === 0;
          const distance = Math.abs(offset);
          const opacity = distance >= 2 ? 0.04 : (isActive ? 1 : 0.3);

          return (
            <motion.div
              key={index}
              data-carousel-card
              data-carousel-active={isActive ? 'true' : 'false'}
              aria-hidden={!isActive}
              initial={false}
              animate={{
                x: `${offset * 80}%`,
                scale: isActive ? 1 : 0.86,
                opacity,
                filter: isActive ? 'blur(0px)' : 'blur(2px)',
                zIndex: 20 - distance,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              onClick={() => {
                if (!isActive) setCurrentIndex(previous => previous + offset);
              }}
              className="absolute h-[356px] w-[min(80vw,390px)] origin-center cursor-grab active:cursor-grabbing sm:h-[374px] sm:w-[390px]"
            >
              <div className={isActive ? 'h-full' : 'pointer-events-none h-full select-none'}>
                {item}
              </div>
            </motion.div>
          );
        })}

        <div className="pointer-events-none absolute inset-x-0 z-30 flex items-center justify-between px-1 sm:px-8">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label={isEn ? 'Previous collection module' : '上一个水族册模块'}
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-ink/55 shadow-md backdrop-blur transition hover:scale-105 hover:border-emerald-300 hover:text-emerald-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label={isEn ? 'Next collection module' : '下一个水族册模块'}
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-ink/55 shadow-md backdrop-blur transition hover:scale-105 hover:border-emerald-300 hover:text-emerald-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-center gap-2" aria-label={isEn ? 'Choose collection module' : '选择水族册模块'}>
        {items.map((_item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentIndex(previous => previous + (index - activeIndex))}
            aria-label={isEn ? `Show collection module ${index + 1}` : `查看第 ${index + 1} 个水族册模块`}
            aria-current={index === activeIndex ? 'true' : undefined}
            className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${index === activeIndex ? 'w-7 bg-emerald-700' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] font-bold text-ink/38">
        {isEn ? 'Swipe or use the arrows to browse your collection.' : '左右滑动或点击箭头，浏览你的水族册。'}
      </p>
    </div>
  );
}

function CollectionModuleCard({
  id,
  title,
  count,
  icon,
  tone,
  remainingCount,
  moreLabel,
  building = false,
  children,
}: {
  id: CollectionModule;
  title: string;
  count: string;
  icon: ReactNode;
  tone: string;
  remainingCount: number;
  moreLabel: string;
  building?: boolean;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const openModule = () => {
    navigate(moduleRoutes[id]);
  };
  return (
    <section
      data-collection-module={id}
      data-feature-status={building ? 'building' : undefined}
      className={`flex h-full min-h-0 min-w-0 flex-col rounded-[24px] border p-4 text-left ${id === 'achievements' ? 'border-slate-200 bg-slate-50 text-slate-500 shadow-none' : 'border-white/90 bg-white shadow-sm'}`}
    >
      {building ? (
        <div className="flex w-full items-center gap-3 rounded-[16px] text-left" aria-label={`${title}，${count}`}>
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] ${tone}`}>{icon}</span>
          <span className="min-w-0 flex-1 text-[17px] font-black text-ink">
            {title}
            <span className="ml-2 text-[13px] text-ink/45">· {count}</span>
          </span>
        </div>
      ) : (
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
      )}
      <span className="mt-3 flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[18px] border border-slate-100 bg-[#fbfcfb]">
        {children}
      </span>
      {!building && remainingCount > 0 && (
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

  useEffect(() => subscribeToCollection(() => setSnapshot(getCollectionSnapshot())), []);

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
  void achievementPreviews;

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

      <CollectionCarousel isEn={isEn}>
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
              className="grid min-h-0 w-full flex-1 grid-cols-[116px_minmax(0,1fr)] items-center gap-3 border-b border-slate-100 p-2.5 text-left transition-colors last:border-b-0 hover:bg-sky-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-600"
            >
              <span className="h-[82px] overflow-hidden rounded-[13px] bg-white">
                <ResilientImage
                  src={getCareVisualSources(topic.imageUrl).thumbnail}
                  alt={topic.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-[13px] font-black leading-5 text-ink">{topic.title}</span>
                <span className="mt-1 line-clamp-2 text-[10px] font-bold leading-4 text-ink/45">{topic.summary}</span>
              </span>
            </button>
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
                className="grid min-h-0 w-full flex-1 grid-cols-[116px_minmax(0,1fr)] items-center gap-3 border-b border-slate-100 p-2.5 text-left transition-colors last:border-b-0 hover:bg-slate-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-600"
              >
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
                  <span className="block truncate text-[13px] font-black text-ink">{fish?.name || (isEn ? 'Species unavailable' : '物种信息不可用')}</span>
                  <span className="mt-1 block text-[10px] font-bold text-ink/45">{formatDate(record.date)}</span>
                  <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[9px] font-black ${record.reason ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {record.reason ? (isEn ? 'Reason recorded' : '已记录原因') : (isEn ? 'Reason needed' : '原因待补充')}
                  </span>
                </span>
              </button>
            );
          }) : (
            <PreviewEmpty
              icon={<Skull className="h-5 w-5" />}
              title={isEn ? 'No memorial records' : '还没有生命纪念'}
              description={isEn ? 'After recording a departure or death, the date and reason are kept here.' : '记录离缸或死亡后，这里会保留日期和原因。'}
            />
          )}
        </CollectionModuleCard>

        <CollectionModuleCard
          id="achievements"
          title={isEn ? 'Achievements' : '成就勋章'}
          count={isEn ? 'Coming soon' : '建设中'}
          icon={<Medal className="h-5 w-5" />}
          tone="bg-slate-100 text-slate-400"
          remainingCount={0}
          moreLabel=""
          building
        >
          <PreviewEmpty
            icon={<Medal className="h-5 w-5" />}
            title={isEn ? 'Not available yet' : '暂未开放'}
            description={isEn ? 'Track long-term care milestones.' : '记录你的养护里程碑。'}
          />
        </CollectionModuleCard>
      </CollectionCarousel>
    </div>
  );
}
