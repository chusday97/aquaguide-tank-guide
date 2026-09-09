import { ArrowLeft, BookOpen } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SeoBreadcrumbs } from '../components/seo/SeoBreadcrumbs';
import { SeoPageShell } from '../components/seo/SeoPageShell';
import { SeoSourceFooter } from '../components/seo/SeoSourceFooter';
import { SeoSectionHeading } from '../components/seo/SeoSectionHeading';
import { getPublishedCareGuide } from '../data/publishedPublicSeo';
import { setSeoDocument } from '../services/seo/seo-document.service';

export default function CareGuideLanding() {
  const { slug = '' } = useParams();
  const page = getPublishedCareGuide(slug);
  useEffect(() => setSeoDocument({ title: page ? `${page.guide.title}｜AquaGuide` : '养护指南｜AquaGuide', description: page?.guide.summary || 'AquaGuide 养护指南', canonical: `/guides/${slug}` }), [page, slug]);
  if (!page) return <SeoPageShell><div className="flex min-h-[60dvh] items-center justify-center"><div className="seo-card w-full max-w-[560px] p-8 text-center"><h1 className="font-serif text-3xl font-bold">没有找到这篇指南</h1><Link to="/care" className="seo-action seo-focus mt-6 bg-accent text-white">进入养护中心</Link></div></div></SeoPageShell>;
  return <SeoPageShell>
    <SeoBreadcrumbs items={[{ label: '首页', href: '/' }, { label: '养护指南' }, { label: page.guide.title }]} ariaLabel="指南路径" />
    <article className="seo-section seo-hero__content mt-10 max-w-[820px] md:mt-16"><p className="seo-eyebrow">养护指南</p><h1 className="seo-hero__title mt-3">{page.guide.title}</h1><p className="seo-lead mt-5">{page.guide.summary}</p><div className="seo-card mt-10 flex items-start gap-4 bg-[#F6F3EB] p-6"><BookOpen className="mt-1 h-6 w-6 shrink-0 text-accent" aria-hidden="true" /><div><h2 className="font-serif text-2xl font-bold">内容正在准备</h2><p className="seo-body mt-2">这篇公开指南会在具体步骤整理好后开放。现在可以先回到养护中心浏览已有内容。</p><Link to="/care" className="seo-action seo-focus mt-5 bg-accent text-white">进入养护中心 <ArrowLeft className="h-4 w-4 rotate-180" aria-hidden="true" /></Link></div></div></article>
    <section className="seo-section" aria-labelledby="guide-outline-title">
      <SeoSectionHeading id="guide-outline-title" number="01" eyebrow="阅读路径" title="这篇指南会怎么展开" description="正式内容准备好后，你可以按这三个部分阅读，不需要在一页里寻找所有答案。" />
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {[
          ['先看核心结论', '先知道这篇指南要解决什么问题。'],
          ['再看分步操作', '按顺序查看每一步需要做什么。'],
          ['最后做后续观察', '完成操作后，回来看需要留意什么。'],
        ].map(([item, description], index) => (
          <article key={item} className="seo-card bg-white p-5">
            <p className="seo-eyebrow">0{index + 1}</p>
            <h3 className="mt-3 font-serif text-xl font-bold text-ink">{item}</h3>
            <p className="seo-body mt-2">{description}</p>
          </article>
        ))}
      </div>
    </section>
    <SeoSourceFooter title="资料状态" text="这篇指南目前还在准备中，完成后会在这里显示公开内容。" status="公开预览 · 暂不进入搜索索引" />
  </SeoPageShell>;
}
