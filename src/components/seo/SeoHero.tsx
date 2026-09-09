import type { ReactNode } from 'react';

export function SeoHero({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`seo-hero ${className}`}>{children}</section>;
}

export default SeoHero;
