import { ArrowRight, BookOpen, Droplets, Fish } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { SeoPageShell } from '../components/seo/SeoPageShell';
import { SeoSectionHeading } from '../components/seo/SeoSectionHeading';
import { SeoCapabilityCard } from '../components/seo/SeoCapabilityCard';
import { SeoRelatedLinks } from '../components/seo/SeoRelatedLinks';
import { SeoSourceFooter } from '../components/seo/SeoSourceFooter';
import { setSeoDocument } from '../services/seo/seo-document.service';
import { ResilientImage } from '../components/common/ResilientImage';
import { getPublishedSpeciesProfile } from '../data/publishedSpeciesProfile';
import { getSpeciesLandingSelection } from '../services/species/species-landing.service';

const marketingSpeciesAsset = (() => {
  const selection = getSpeciesLandingSelection('sp_0001');
  return selection ? getPublishedSpeciesProfile(selection).assets.find(asset => asset.usage === 'hero') : undefined;
})();

export default function MarketingLanding() {
  useEffect(() => setSeoDocument({ title: 'AquaGuide｜认识物种，照顾好鱼缸', description: 'AquaGuide 把物种百科、养护知识和真实鱼缸工具放在同一条清晰路径上。', canonical: '/', jsonLd: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'AquaGuide', url: window.location.origin } }), []);
  return <SeoPageShell className="public-seo-marketing">
    <section className="seo-hero mt-10 items-center md:mt-16" aria-labelledby="marketing-title">
      <div className="seo-hero__content">
        <p className="seo-eyebrow">AquaGuide · 水族观察笔记</p>
        <h1 id="marketing-title" className="seo-hero__title">先认识它，<br />再把它带回家。</h1>
        <p className="seo-lead mt-6">从物种的基础习性，到你的真实鱼缸，AquaGuide 帮你把每一次选择变成可以理解、可以观察的养护过程。</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/category/shrimp-snails-crabs" className="seo-action seo-focus bg-accent text-white hover:bg-emerald-800">开始认识物种 <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          <Link to="/aquarium" className="seo-action seo-focus border border-ink/15 bg-white text-ink hover:border-accent hover:text-accent">进入我的鱼缸</Link>
        </div>
      </div>
      <div className="seo-hero__media seo-card seo-large-card relative flex min-h-[340px] items-end overflow-hidden bg-[#E8F0EE] p-6 md:min-h-[470px] md:p-10">
        {marketingSpeciesAsset && <ResilientImage src={marketingSpeciesAsset.src} alt={marketingSpeciesAsset.altZh} loading="eager" className="absolute inset-0 h-full w-full object-contain p-[14%] opacity-90" />}
        <div className="relative z-[1] max-w-[420px] rounded-2xl bg-[#E8F0EE]/82 p-3 backdrop-blur-sm"><p className="seo-eyebrow">给你的鱼缸的一份图鉴</p><p className="mt-3 font-serif text-3xl font-bold leading-tight text-accent md:text-5xl">把复杂的养护判断，留给清晰的下一步。</p></div>
      </div>
    </section>
    <section className="seo-section" aria-labelledby="marketing-value"><SeoSectionHeading number="01" eyebrow="为什么选择 AquaGuide" title="从一页百科，走到一次可靠的决定" description="公开内容负责帮助你理解；应用工具负责把要求与你自己的鱼缸进行比较。" />
      <div className="seo-stagger mt-8 grid gap-4 md:grid-cols-3"><article className="seo-card p-6"><Fish className="h-6 w-6 text-accent" aria-hidden="true" /><h3 className="mt-6 font-serif text-2xl font-bold">认识物种</h3><p className="seo-body mt-3">看懂身份、习性、环境和日常节奏，不先被一堆参数淹没。</p></article><article className="seo-card p-6"><BookOpen className="h-6 w-6 text-accent" aria-hidden="true" /><h3 className="mt-6 font-serif text-2xl font-bold">理解饲养</h3><p className="seo-body mt-3">把经过审核的内容放在对应章节里，缺少证据时保持诚实。</p></article><article className="seo-card p-6"><Droplets className="h-6 w-6 text-accent" aria-hidden="true" /><h3 className="mt-6 font-serif text-2xl font-bold">比较鱼缸</h3><p className="seo-body mt-3">准备好后，再把物种要求带进你的真实鱼缸判断。</p></article></div>
    </section>
    <section className="seo-section"><SeoCapabilityCard title="你的鱼缸，才是最后的答案" description="公开百科先帮你建立理解；进入 AquaGuide 后，再使用真实鱼缸数据完成适配与混养判断。" href="/aquarium" actionLabel="进入我的鱼缸" /></section>
    <SeoRelatedLinks title="继续探索" links={[{ id: 'category', label: '浏览虾螺蟹分类', href: '/category/shrimp-snails-crabs' }, { id: 'care', label: '进入养护中心', href: '/care' }]} />
    <SeoSourceFooter title="内容责任" text="本页是 AquaGuide 的公开入口，产品数据、百科内容和鱼缸判断分别由各自来源负责。" status="公开预览 · 暂不进入搜索索引" />
  </SeoPageShell>;
}
