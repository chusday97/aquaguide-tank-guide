import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SeoCapabilityCard({ eyebrow = 'AquaGuide', title, description, href, actionLabel }: { eyebrow?: string; title: string; description: string; href: string; actionLabel: string }) {
  return <section id="tool" className="seo-section seo-large-card border border-emerald-100 bg-accent-light p-6 md:p-9" aria-labelledby="seo-capability-title">
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div><p className="seo-eyebrow">{eyebrow}</p><h2 id="seo-capability-title" className="mt-2 max-w-[680px] font-serif text-3xl font-bold leading-tight text-ink">{title}</h2><p className="seo-body mt-3">{description}</p></div>
      <Link to={href} className="seo-action seo-focus bg-accent text-white hover:bg-emerald-800">{actionLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    </div>
  </section>;
}

export default SeoCapabilityCard;
