import { useEffect, useMemo, useState } from 'react';
import { Droplets, Heart, Loader2, Ruler, Thermometer, Waves } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ResilientImage } from '../components/common/ResilientImage';
import { getPublishedSpeciesProfile } from '../data/publishedSpeciesProfile';
import { getSpeciesLandingPilotRecord, type SpeciesLandingAssetUse } from '../data/speciesLandingPilot';
import { getCareTaxonomyPath, getDifficultyLabel, getSecondaryCategory, getSizeLabel, getTemperamentLabel } from '../modules/species/species.service';
import { taskRoutes } from '../services/navigation/task-routes';
import { getCurrentAquaGuideRepository } from '../services/repository/repository-provider';
import { getSpeciesFavoriteIds, subscribeToFavorites } from '../services/favorites/favorites.service';
import { getSpeciesLandingSelection } from '../services/species/species-landing.service';
import { SeoBreadcrumbs } from '../components/seo/SeoBreadcrumbs';
import { SeoCapabilityCard } from '../components/seo/SeoCapabilityCard';
import { SeoDataRail } from '../components/seo/SeoDataRail';
import { SeoHero } from '../components/seo/SeoHero';
import { SeoPageShell } from '../components/seo/SeoPageShell';
import { SeoRelatedLinks } from '../components/seo/SeoRelatedLinks';
import { SeoSectionHeading } from '../components/seo/SeoSectionHeading';
import { SeoSourceFooter } from '../components/seo/SeoSourceFooter';
import { SeoDisclosure } from '../components/seo/SeoDisclosure';
import { setSeoDocument } from '../services/seo/seo-document.service';
import type { Fish, PublishedContentSection, PublishedLifeAnswer, PublishedSpeciesAsset } from '../types';

const labels = {
  back: '返回图鉴', freshwater: '淡水', saltwater: '海水', difficulty: '养护难度', easy: '极易', medium: '中等', hard: '困难', favorite: '收藏', saved: '已收藏', identity: '认识这个物种', intro: '先认识它的基础特征，再决定如何把它带进你的鱼缸。', chapters: '章节导航', overview: '一眼了解', behavior: '它如何生活', habitat: '适合怎样的环境', care: '日常怎么养', variants: '外观与品系', faq: '常见问题', showDetails: '展开详情', hideDetails: '收起详情', tool: '把物种要求与你的真实鱼缸进行比较。', toolDetail: '准备好后进入 AquaGuide，检查具体鱼缸或缸内伙伴。', openTool: '检查我的鱼缸', temp: '水温', ph: 'pH', minTank: '最低缸体', size: '体型', temperament: '性情', imageUnavailable: '图片暂时不可用', imageFailed: '图片暂时不可用', related: '继续探索', current: '当前', sources: '资料来源', sourceText: '这里汇总了本页使用的目录与专业资料。', returnSearch: '搜索物种', missing: '没有找到这个物种页面。', learnMore: '回到图鉴选择其他物种。', chapterSignatures: { behavior: '', habitat: '水体、空间与环境稳定性', feeding: '把每天最重要的照料动作放在前面', maintenance: '日常维护内容正在补充' },
} as const;

const localizeDifficulty = (fish: Fish) => getDifficultyLabel(fish);
const localizeSize = (fish: Fish) => getSizeLabel(fish);
const localizeTemperament = (fish: Fish) => getTemperamentLabel(fish);

const canPreviewPendingAssets = (searchParams: URLSearchParams) => (
  import.meta.env.DEV
  && typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  && searchParams.get('assetPreview') === '1'
);

const toPreviewAsset = (fish: Fish, source: SpeciesLandingAssetUse): PublishedSpeciesAsset | undefined => {
  if (!source.sourcePath) return undefined;
  return {
    id: `${fish.id}-${source.use}-preview`,
    src: source.sourcePath,
    usage: source.use,
    aspectRatio: source.use === 'hero' ? '16:9' : '4:3',
    fit: source.crop,
    altZh: source.altZh,
    altEn: source.altEn,
  };
};

const StatIcon = ({ label }: { label: string }) => {
  if (label === '水温' || label === 'Temperature') return <Thermometer className="h-4 w-4" aria-hidden="true" />;
  if (label === '最低缸体' || label === 'Minimum tank') return <Ruler className="h-4 w-4" aria-hidden="true" />;
  return <Droplets className="h-4 w-4" aria-hidden="true" />;
};

function SectionHeading({ number, eyebrow, title, description, id }: { number: string; eyebrow: string; title: string; description?: string; id?: string }) {
  return <SeoSectionHeading id={id} number={number} eyebrow={eyebrow} title={title} description={description} />;
}

function MediaFrame({ asset, label, alt, failed, onFallback, className = '' }: { asset?: PublishedSpeciesAsset; label: string; alt: string; failed?: boolean; onFallback?: () => void; className?: string }) {
  if (!asset || failed) return <div className={`flex min-h-[260px] items-center justify-center rounded-[28px] border border-dashed border-emerald-200 bg-[radial-gradient(circle_at_50%_35%,rgba(175,220,202,.34),transparent_48%),#F3F8F3] p-8 text-center ${className}`} role="img" aria-label={label}><div><Waves className="mx-auto h-8 w-8 text-accent/45" aria-hidden="true" /><p className="mt-4 text-sm font-black text-accent/75">{label}</p></div></div>;
  return <div className={`flex min-h-[260px] items-center justify-center overflow-hidden rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_18px_60px_rgba(27,77,62,0.08)] ${className}`}><ResilientImage src={asset.src} alt={alt} loading="eager" onFallback={onFallback} className="h-full w-full object-contain p-[8%]" /></div>;
}

function LifeAnswerCard({ question, answer }: { question: string; answer: PublishedLifeAnswer }) {
  return <article className="seo-card border-emerald-100 bg-[#F5FAF6] p-5"><h3 className="font-bold text-ink">{question}</h3><p className="seo-body mt-3">{answer.answer}</p></article>;
}

function EditorialSection({ section }: { section: PublishedContentSection }) {
  return <article className="seo-card overflow-hidden p-5"><h3 className="font-bold text-ink">{section.heading}</h3><p className="seo-body mt-3">{section.summary}</p>{section.details && section.details.length > 0 && <SeoDisclosure label={labels.showDetails} openLabel={labels.hideDetails} className="mt-3 border-0 shadow-none"><ul className="grid gap-2 text-sm font-normal leading-7 text-ink/62">{section.details.map(detail => <li key={detail} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/55" />{detail}</li>)}</ul></SeoDisclosure>}</article>;
}

export function SpeciesLanding() {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selection = useMemo(() => getSpeciesLandingSelection(slug, searchParams.get('variant')), [searchParams, slug]);
  const fish = selection?.species || null;
  const baseSpecies = selection?.baseSpecies || null;
  const profile = useMemo(() => selection ? getPublishedSpeciesProfile(selection, 'zh-CN') : null, [selection]);
  const assetPreviewEnabled = canPreviewPendingAssets(searchParams);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getSpeciesFavoriteIds());
  const [favoriteSaving, setFavoriteSaving] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  useEffect(() => subscribeToFavorites(() => setFavoriteIds(getSpeciesFavoriteIds())), []);
  useEffect(() => { setHeroImageFailed(false); setActionFeedback(''); }, [fish?.id]);
  useEffect(() => {
    if (!fish || !profile) return;
    document.documentElement.lang = 'zh-CN';
    return setSeoDocument({
      title: `${fish.name}：习性、饲养与环境 | AquaGuide`,
      description: profile.editorial?.signature || `${fish.name}的基础信息、核心参数与饲养参考。`,
      canonical: profile.metadata.canonical,
    });
  }, [fish, profile]);

  if (!selection || !fish || !baseSpecies || !profile) return <section className="mx-auto flex min-h-[70dvh] w-full max-w-[720px] items-center justify-center px-4 py-10 text-center"><div className="seo-card seo-large-card w-full p-7"><h1 className="font-serif text-2xl font-bold text-ink">{labels.missing}</h1><p className="seo-body mx-auto mt-3">{labels.learnMore}</p><button type="button" onClick={() => navigate('/encyclopedia')} className="seo-action seo-focus mt-5 bg-accent text-white">{labels.returnSearch}</button></div></section>;

  const isFavorite = favoriteIds.includes(fish.id);
  const groupVariants = profile.variants;
  const fishPilot = getSpeciesLandingPilotRecord(fish);
  const heroAsset = profile.assets.find(asset => asset.usage === 'hero')
    || (assetPreviewEnabled ? toPreviewAsset(fish, fishPilot.asset.hero) : undefined);
  const breadcrumbCategory = getSecondaryCategory(baseSpecies) || baseSpecies.category;
  const categoryText = fish.category;
  const waterTypeText = getCareTaxonomyPath(fish).waterType === '海水' ? labels.saltwater : labels.freshwater;
  const imageAlt = heroAsset ? heroAsset.altZh : `${fish.name}（${fish.scientificName}）`;
  const heroSignature = groupVariants.find(variant => variant.id === fish.id)?.difference || profile.editorial?.signature || fish.description || labels.intro;
  const variantPath = (id: string) => id === baseSpecies.id ? `/species/${baseSpecies.id}` : `/species/${baseSpecies.id}?variant=${encodeURIComponent(id)}`;

  const toggleFavorite = async () => {
    if (favoriteSaving) return;
    setFavoriteSaving(true);
    try {
      const repository = await getCurrentAquaGuideRepository();
      await repository.updateFavorite({ type: 'species', catalogKey: fish.id, favorite: !isFavorite });
      setFavoriteIds(getSpeciesFavoriteIds());
      setActionFeedback(isFavorite ? '已取消收藏。' : '已加入收藏。');
    } catch {
      setActionFeedback('收藏未完成，请稍后重试。');
    } finally {
      setFavoriteSaving(false);
    }
  };

  const lifeAnswers = [
    profile.lifeProfile?.activity ? { question: '平时在哪里活动？', answer: profile.lifeProfile.activity } : null,
    profile.lifeProfile?.social ? { question: '喜欢独处还是成群？', answer: profile.lifeProfile.social } : null,
    profile.lifeProfile?.foraging ? { question: '通常怎么寻找食物？', answer: profile.lifeProfile.foraging } : null,
  ].filter((item): item is { question: string; answer: PublishedLifeAnswer } => Boolean(item));
  const hasBehavior = lifeAnswers.length > 0;
  const contentSectionIds = [
    'overview',
    ...(hasBehavior ? ['behavior'] : []),
    ...(profile.editorial?.habitat ? ['habitat'] : []),
    ...((profile.editorial?.feeding || profile.editorial?.maintenance) ? ['care'] : []),
    ...(groupVariants.length > 1 ? ['variants'] : []),
    ...(profile.faq.length > 0 ? ['faq'] : []),
  ];
  const sectionNumber = (id: string) => String(contentSectionIds.indexOf(id) + 1).padStart(2, '0');
  const navItems = [
    { id: 'overview', label: labels.overview },
    ...(hasBehavior ? [{ id: 'behavior', label: labels.behavior }] : []),
    ...(profile.editorial?.habitat ? [{ id: 'habitat', label: labels.habitat }] : []),
    ...((profile.editorial?.feeding || profile.editorial?.maintenance) ? [{ id: 'care', label: labels.care }] : []),
    ...(groupVariants.length > 1 ? [{ id: 'variants', label: labels.variants }] : []),
    ...(profile.faq.length > 0 ? [{ id: 'faq', label: labels.faq }] : []),
    { id: 'tool', label: 'AquaGuide' }, { id: 'related', label: labels.related },
  ];
  const stats = [
    { label: labels.temp, value: fish.waterTemperature }, { label: labels.ph, value: fish.phLevel }, { label: labels.minTank, value: fish.tankSize }, { label: labels.size, value: localizeSize(fish) }, { label: labels.temperament, value: localizeTemperament(fish) }, { label: labels.difficulty, value: localizeDifficulty(fish) },
  ];

  return <SeoPageShell>
    <SeoBreadcrumbs ariaLabel="面包屑" items={[{ label: labels.back, href: '/encyclopedia' }, { label: breadcrumbCategory, href: `/encyclopedia?category=${encodeURIComponent(baseSpecies.category)}` }, ...(baseSpecies.id !== fish.id ? [{ label: baseSpecies.name, href: `/species/${baseSpecies.id}` }] : []), { label: fish.name }]} />
    <nav aria-label={labels.chapters} className="mt-4 -mx-1 flex min-w-0 gap-1 overflow-x-auto px-1 pb-1 text-xs font-bold text-ink/48 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{navItems.map(item => <a key={item.id} href={`#${item.id}`} className="seo-focus inline-flex min-h-11 shrink-0 items-center rounded-full border border-transparent px-3 hover:border-emerald-100 hover:bg-white hover:text-accent">{item.label}</a>)}</nav>

    <SeoHero id="overview"><div className="seo-hero__media order-2 min-w-0 lg:order-1"><MediaFrame asset={heroAsset} label={heroImageFailed ? labels.imageFailed : labels.imageUnavailable} alt={imageAlt} failed={heroImageFailed} onFallback={() => setHeroImageFailed(true)} className="min-h-[280px] md:min-h-[470px]" /></div><div className="seo-hero__content order-1 min-w-0 lg:order-2"><p className="seo-eyebrow">{categoryText} · {waterTypeText}</p><p className="seo-meta mt-5 font-bold text-accent/75">{labels.identity}</p><h1 className="seo-hero__title break-words">{fish.name}</h1><p className="seo-hero__scientific break-words">{fish.scientificName}</p><p className="seo-lead mt-6">{heroSignature}</p><div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[13px] font-bold text-emerald-900">{localizeDifficulty(fish)}</span><span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-[13px] font-bold text-sky-900">{waterTypeText}</span><span className="rounded-full border border-border bg-white px-3 py-1.5 text-[13px] font-bold text-ink/62">{localizeTemperament(fish)}</span></div>{actionFeedback && <p className="seo-meta mt-4 font-bold text-accent" role="status" aria-live="polite">{actionFeedback}</p>}<div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => void toggleFavorite()} disabled={favoriteSaving} aria-pressed={isFavorite} className="seo-action seo-focus border border-border bg-white text-ink/70 hover:border-rose-200 hover:text-rose-700 disabled:cursor-wait disabled:opacity-60">{favoriteSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Heart className={isFavorite ? 'h-4 w-4 fill-current text-rose-600' : 'h-4 w-4'} aria-hidden="true" />}{isFavorite ? labels.saved : labels.favorite}</button></div></div></SeoHero>

    <section className="seo-section" aria-labelledby="stats-title"><div className="mb-6 flex items-center justify-between gap-4"><div><p className="seo-eyebrow">{sectionNumber('overview')} · {labels.overview}</p><h2 id="stats-title" className="mt-2 font-serif text-2xl font-bold text-ink">{labels.overview}</h2></div><Droplets className="h-6 w-6 text-accent/45" aria-hidden="true" /></div><SeoDataRail items={stats.map(item => ({ ...item, icon: <StatIcon label={item.label} /> }))} />{profile.editorial?.overview && <p className="seo-lead mx-auto mt-8 max-w-[680px]">{profile.editorial.overview.summary}</p>}</section>

    {hasBehavior && <section id="behavior" className="seo-section" aria-labelledby="behavior-title"><SectionHeading id="behavior-title" number={sectionNumber('behavior')} eyebrow={labels.behavior} title={labels.behavior} /><div className="seo-stagger mt-8 grid gap-4 md:grid-cols-3">{lifeAnswers.map(item => <LifeAnswerCard key={item.question} {...item} />)}</div></section>}
    {profile.editorial?.habitat && <section id="habitat" className="seo-section" aria-labelledby="habitat-title"><SectionHeading id="habitat-title" number={sectionNumber('habitat')} eyebrow={labels.habitat} title={profile.editorial.habitat.heading} description={labels.chapterSignatures.habitat} /><div className="seo-editorial-pair mt-8"><div className="seo-habitat-visual" aria-hidden="true"><span className="seo-habitat-visual__eyebrow">环境观察</span><span className="seo-habitat-visual__title">水体 · 空间 · 稳定</span><span className="seo-habitat-visual__orb seo-habitat-visual__orb--one" /><span className="seo-habitat-visual__orb seo-habitat-visual__orb--two" /></div><div className="seo-card seo-large-card p-6"><p className="seo-body font-bold">{profile.editorial.habitat.summary}</p>{profile.editorial.habitat.details && <ul className="mt-5 grid gap-3 text-sm font-normal leading-7 text-ink/62">{profile.editorial.habitat.details.map(detail => <li key={detail} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/55" />{detail}</li>)}</ul>}</div></div></section>}
    {(profile.editorial?.feeding || profile.editorial?.maintenance) && <section id="care" className="seo-section" aria-labelledby="care-title"><SectionHeading id="care-title" number={sectionNumber('care')} eyebrow={labels.care} title={labels.care} description={labels.chapterSignatures.feeding} /><div className="mt-8 grid gap-3">{[profile.editorial.feeding, profile.editorial.maintenance].filter((section): section is PublishedContentSection => Boolean(section)).map(section => <EditorialSection key={section.id} section={section} />)}</div></section>}
    {groupVariants.length > 1 && <section id="variants" className="seo-section" aria-labelledby="variants-title"><SectionHeading id="variants-title" number={sectionNumber('variants')} eyebrow={labels.variants} title={labels.variants} /><div className="seo-stagger mt-8 grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4">{groupVariants.map(variant => { const active = variant.id === fish.id; const variantAsset = variant.image; return <Link key={variant.id} to={variantPath(variant.id)} aria-current={active ? 'page' : undefined} className={`seo-focus min-w-0 rounded-[20px] border p-3 transition-colors ${active ? 'border-emerald-300 bg-emerald-50' : 'border-border bg-white hover:border-emerald-200'}`}><MediaFrame asset={variantAsset} label={labels.imageUnavailable} alt={variantAsset ? variantAsset.altZh : `${variant.name}（${variant.scientificName}）`} className="min-h-[120px] rounded-[16px] p-0 shadow-none" /><p className="mt-3 truncate text-sm font-bold text-ink">{variant.name}</p><p className="seo-meta mt-1 truncate">{variant.scientificName}</p>{variant.difference && <p className="mt-2 text-xs font-normal leading-5 text-ink/60">{variant.difference}</p>}{active && <span className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-[10px] font-bold text-accent">{labels.current}</span>}</Link>; })}</div></section>}

    <SeoCapabilityCard title={labels.tool} description={labels.toolDetail} href={taskRoutes.encyclopedia.compatibilitySpecies(fish.id, 'species-profile')} actionLabel={labels.openTool} />
    {profile.faq.length > 0 && <section id="faq" className="seo-section" aria-labelledby="faq-title"><SectionHeading id="faq-title" number={sectionNumber('faq')} eyebrow={labels.faq} title={labels.faq} /><div className="mt-8 grid gap-3">{profile.faq.map(item => <SeoDisclosure key={item.id} label={item.question}><p className="seo-body">{item.answer}</p></SeoDisclosure>)}</div></section>}
    <SeoRelatedLinks title={labels.related} links={profile.relatedLinks} />
    <SeoSourceFooter title={labels.sources} text={labels.sourceText} sources={profile.sources} />
  </SeoPageShell>;
}

export default SpeciesLanding;
