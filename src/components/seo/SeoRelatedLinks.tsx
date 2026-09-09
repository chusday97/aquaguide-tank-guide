import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SeoRelatedLinks({ title, links }: { title: string; links: Array<{ id: string; label: string; href: string }> }) {
  if (links.length === 0) return null;
  return <section id="related" className="seo-section" aria-labelledby="seo-related-title"><div className="seo-card seo-large-card p-6">
    <div className="flex items-center justify-between gap-4"><div><p className="seo-eyebrow">{title}</p><h2 id="seo-related-title" className="mt-2 font-serif text-2xl font-bold text-ink">{title}</h2></div><BookOpen className="h-6 w-6 text-accent/45" aria-hidden="true" /></div>
    <div className="mt-5 grid gap-2">{links.map(link => <Link key={link.id} to={link.href} className="seo-focus flex min-h-11 items-center justify-between gap-3 rounded-[15px] bg-[#F7F8F5] px-4 text-sm font-bold text-ink hover:text-accent"><span>{link.label}</span><ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>)}</div>
  </div></section>;
}

export default SeoRelatedLinks;
