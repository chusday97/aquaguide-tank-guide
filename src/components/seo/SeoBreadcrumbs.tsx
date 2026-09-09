import { Link } from 'react-router-dom';

export type SeoBreadcrumbItem = { label: string; href?: string };

export function SeoBreadcrumbs({ items, ariaLabel = 'Breadcrumb' }: { items: SeoBreadcrumbItem[]; ariaLabel?: string }) {
  return <nav aria-label={ariaLabel} className="seo-meta flex min-w-0 flex-wrap items-center gap-1.5">
    {items.map((item, index) => <span key={`${item.label}-${index}`} className="inline-flex min-w-0 items-center gap-1.5">
      {index > 0 && <span aria-hidden="true">/</span>}
      {item.href ? <Link to={item.href} className="seo-focus inline-flex min-h-11 min-w-11 items-center justify-center rounded px-1 py-1 hover:text-accent">{item.label}</Link> : <span className="min-w-0 break-words text-ink/72">{item.label}</span>}
    </span>)}
  </nav>;
}

export default SeoBreadcrumbs;
