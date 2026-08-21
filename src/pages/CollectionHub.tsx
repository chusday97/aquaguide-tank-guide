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
  remainingCount,
  moreLabel,
  children,
  isOpen,
  onOpen,
}: {
  id: CollectionModule;
  title: string;
  count: string;
  icon: ReactNode;
  tone: string;
  remainingCount: number;
  moreLabel: string;
  children: ReactNode;
  isOpen: boolean;
  onOpen: () => void;
}) {
  const navigate = useNavigate();
  return (
    <section
      data-collection-module={id}
      className={`collection-book-chapter collection-book-chapter-${id} ${isOpen ? 'is-open' : ''}`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="collection-book-chapter-title"
        aria-current={isOpen ? 'true' : undefined}
        aria-label={`${title}，${count}，${isOpen ? '当前章节已打开；使用返回全部章节回到总览' : '聚焦查看本章'}`}
      >
        <span className={`collection-book-chapter-mark ${tone}`}>{icon}</span>
        <span className="collection-book-chapter-name">
          {title}
          <span>· {count}</span>
        </span>
        <ChevronRight className="collection-book-chapter-arrow h-5 w-5 shrink-0" />
      </button>
      <span className="collection-book-chapter-content">
        {children}
      </span>
      {remainingCount > 0 && (
        <button
          type="button"
          onClick={() => navigate(moduleRoutes[id])}
          className="collection-book-chapter-more"
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
  const [openModule, setOpenModule] = useState<CollectionModule | null>(null);

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
    <div className="collection-hub collection-book-page page-frame mx-auto flex w-full min-w-0 max-w-[1180px] flex-col gap-4 pb-24">
      <header className="collection-book-heading px-1 py-1">
        <div className="collection-book-eyebrow">
          <BookHeart className="h-3.5 w-3.5" /> {isEn ? 'Aqua Collection' : '自然水族册'}
        </div>
        <h1>{isEn ? 'My Collection' : '我的水族册'}</h1>
        <p>{isEn ? 'Open one chapter, then continue with a real item.' : '翻开一个章节，再从最近收录的内容继续。'}</p>
      </header>

      <section className={`collection-book-shell ${openModule ? 'has-open-chapter' : ''}`} aria-label={isEn ? 'Collection previews' : '水族册内容预览'}>
        <span aria-hidden="true" className="collection-book-water-glow collection-book-water-glow-one" />
        <span aria-hidden="true" className="collection-book-water-glow collection-book-water-glow-two" />
        <span aria-hidden="true" className="collection-book-plant collection-book-plant-left" />
        <span aria-hidden="true" className="collection-book-plant collection-book-plant-right" />
        {openModule && (
          <button
            type="button"
            onClick={() => setOpenModule(null)}
            className="collection-book-return"
          >
            {isEn ? 'Back to all chapters' : '返回全部章节'}
          </button>
        )}
        <div className="collection-book-spread">
        <CollectionModuleCard
          id="wishlist"
          title={isEn ? 'Species Wishlist' : '种草图鉴'}
          count={String(snapshot.counts.wishlist)}
          icon={<Heart className="h-5 w-5" />}
          tone="bg-rose-50 text-rose-600"
          remainingCount={Math.max(0, snapshot.counts.wishlist - 3)}
          moreLabel={isEn ? `More ${Math.max(0, snapshot.counts.wishlist - 3)} species` : `更多 ${Math.max(0, snapshot.counts.wishlist - 3)} 种`}
          isOpen={openModule === 'wishlist'}
          onOpen={() => setOpenModule('wishlist')}
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
          isOpen={openModule === 'care'}
          onOpen={() => setOpenModule('care')}
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
          isOpen={openModule === 'memorial'}
          onOpen={() => setOpenModule('memorial')}
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
                  <span className="block truncate text-[13px] font-black text-ink">{fish?.name || (isEn ? 'Unrecognized species' : '未匹配生物')}</span>
                  <span className="mt-1 block text-[10px] font-bold text-ink/45">{formatDate(record.date)}</span>
                  <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[9px] font-black ${record.reason ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {record.reason ? (isEn ? 'Reflected' : '已复盘') : (isEn ? 'Reason needed' : '待补充原因')}
                  </span>
                </span>
              </button>
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
          remainingCount={Math.max(0, snapshot.achievements.length - 2)}
          moreLabel={isEn ? `More ${Math.max(0, snapshot.achievements.length - 2)} badges` : `更多 ${Math.max(0, snapshot.achievements.length - 2)} 枚`}
          isOpen={openModule === 'achievements'}
          onOpen={() => setOpenModule('achievements')}
        >
          <span className="flex min-h-0 flex-1 flex-col p-2.5">
            {achievementPreviews.map((achievement, index) => {
              const Icon = achievementIcons[achievement.id];
              return (
                <button
                  key={achievement.id}
                  type="button"
                  data-preview-item="achievements"
                  data-preview-id={achievement.id}
                  onClick={() => openItem('achievements', achievement.id)}
                  className={`${index > 0 ? 'mt-2' : ''} flex items-center gap-3 rounded-[14px] border border-amber-100 bg-white px-3 py-3 text-left hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600`}
                >
                  <span className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${achievement.unlocked ? 'bg-amber-300 text-amber-950' : 'bg-amber-50 text-amber-800'}`}>
                    <Icon className="h-5 w-5" />
                    {achievement.unlocked && <Check className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-emerald-700 p-1 text-white" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-black text-ink">{achievement.title}</span>
                    <span className={`mt-1 block text-[10px] font-black ${achievement.unlocked ? 'text-emerald-700' : 'text-amber-800'}`}>
                      {achievement.unlocked
                        ? (isEn ? 'Unlocked' : '已解锁')
                        : (isEn ? `${achievement.current}/${achievement.target} completed` : `已完成 ${achievement.current}/${achievement.target}`)}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink/25" />
                </button>
              );
            })}
            <span className="mt-auto pt-3 text-center text-[10px] font-black text-amber-800">{isEn ? 'Unlocks automatically · no claiming needed' : '自动解锁，无需领取'}</span>
          </span>
        </CollectionModuleCard>
        </div>
      </section>
    </div>
  );
}
