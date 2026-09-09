import { ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ResilientImage } from '../components/common/ResilientImage';
import { SeoBreadcrumbs } from '../components/seo/SeoBreadcrumbs';
import { SeoCapabilityCard } from '../components/seo/SeoCapabilityCard';
import { SeoPageShell } from '../components/seo/SeoPageShell';
import { SeoSectionHeading } from '../components/seo/SeoSectionHeading';
import { SeoSourceFooter } from '../components/seo/SeoSourceFooter';
import { getPublishedCategoryLanding } from '../data/publishedPublicSeo';
import { setSeoDocument } from '../services/seo/seo-document.service';

export default function CategoryLanding() {
  const { slug = '' } = useParams();
  const page = getPublishedCategoryLanding(slug);
  useEffect(() => setSeoDocument({ title: page ? `${page.category.name}｜AquaGuide 物种分类` : '分类不存在｜AquaGuide', description: page ? `浏览 AquaGuide 的${page.category.name}物种资料。` : 'AquaGuide 分类页面', canonical: `/category/${slug}`, jsonLd: page ? { '@context': 'https://schema.org', '@graph': [{ '@type': 'CollectionPage', name: page.category.name, url: `${window.location.origin}/category/${slug}` }, { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '首页', item: window.location.origin }, { '@type': 'ListItem', position: 2, name: page.category.name, item: `${window.location.origin}/category/${slug}` }] }] } : undefined }), [page, slug]);
  if (!page) return <SeoPageShell><div className="flex min-h-[60dvh] items-center justify-center"><div className="seo-card w-full max-w-[560px] p-8 text-center"><h1 className="font-serif text-3xl font-bold">没有找到这个分类</h1><Link to="/" className="seo-action seo-focus mt-6 bg-accent text-white">返回 AquaGuide</Link></div></div></SeoPageShell>;
  return <SeoPageShell>
    <SeoBreadcrumbs items={[{ label: '首页', href: '/' }, { label: page.category.name }]} ariaLabel="分类路径" />
    <header className="seo-hero__content mt-10 max-w-[760px] md:mt-16"><p className="seo-eyebrow">物种分类</p><h1 className="seo-hero__title mt-3">{page.category.name}</h1><p className="seo-lead mt-5">从基础身份开始，先找到你真正想了解的物种，再进入它自己的百科档案。</p></header>
    <section className="seo-section" aria-labelledby="category-species"><SeoSectionHeading number="01" eyebrow="基础物种" title="从一个物种开始" description="从这里进入已经整理好的物种档案。" />
      <div className="seo-stagger mt-8 grid gap-4 md:grid-cols-2">{page.featuredBaseSpecies.map(species => <Link key={species.id} to={species.href} className="seo-card seo-focus group grid min-h-[180px] grid-cols-[112px_minmax(0,1fr)_20px] items-center gap-5 p-4 hover:border-accent"><div className="seo-category-card__media">{species.image ? <ResilientImage src={species.image.src} alt={species.image.altZh} loading="lazy" className="h-full w-full object-contain p-2" /> : <span role="img" aria-label="物种图片暂不可用">图片暂不可用</span>}</div><div><p className="seo-eyebrow">基础物种</p><h2 className="mt-3 font-serif text-3xl font-bold">{species.name}</h2><p className="seo-meta mt-2 italic">{species.scientificName}</p></div><ChevronRight className="h-5 w-5 text-accent transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link>)}</div>
    </section>
    <section className="seo-section"><SeoCapabilityCard title="想知道它是否适合你的缸？" description="浏览百科后，可以把物种带入 AquaGuide 的鱼缸工具完成下一步比较。" href="/aquarium" actionLabel="检查我的鱼缸" /></section>
    <SeoSourceFooter title="资料说明" text="这里先展示分类与物种入口；具体的习性和饲养信息，请进入对应物种档案查看。" status="公开预览 · 暂不进入搜索索引" />
  </SeoPageShell>;
}
