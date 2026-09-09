import type { ReactNode } from 'react';

export type SeoDataRailItem = { label: string; value: string; icon?: ReactNode };

export function SeoDataRail({ items }: { items: SeoDataRailItem[] }) {
  return <dl className="seo-data-rail">{items.map(item => <div key={item.label} className="seo-data-rail__item">
    <dt className="seo-data-rail__label">{item.icon}{item.label}</dt>
    <dd className="seo-data-rail__value">{item.value}</dd>
  </div>)}</dl>;
}

export default SeoDataRail;
