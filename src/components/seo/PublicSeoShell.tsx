import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function PublicSeoLoading() {
  return <main className="seo-page-shell" aria-busy="true" aria-live="polite">
    <div className="seo-public-loading" role="status">
      <div className="seo-public-loading__crumbs"><span /><span /><span /></div>
      <div className="seo-public-loading__hero">
        <div className="seo-public-loading__media" />
        <div className="seo-public-loading__copy">
          <span className="seo-public-loading__line seo-public-loading__line--eyebrow" />
          <span className="seo-public-loading__line seo-public-loading__line--title" />
          <span className="seo-public-loading__line seo-public-loading__line--wide" />
          <span className="seo-public-loading__line seo-public-loading__line--body" />
          <div className="seo-public-loading__pills"><span /><span /><span /></div>
        </div>
      </div>
      <p className="seo-public-loading__label">正在准备 AquaGuide 页面…</p>
    </div>
  </main>;
}

export function PublicSeoShell({ children }: { children: ReactNode }) {
  return <div className="public-seo-root min-h-[100dvh] bg-[#FDFCF8] text-ink">
    <header className="seo-public-header border-b border-ink/10 bg-[#FDFCF8]/95 px-6 py-4 backdrop-blur-md md:px-10">
      <div className="mx-auto flex min-h-11 max-w-[1280px] items-center justify-between gap-4">
        <Link to="/" className="seo-focus inline-flex min-h-11 items-center rounded-full px-2 font-serif text-xl font-bold text-accent">AquaGuide</Link>
        <nav aria-label="公开页面导航" className="flex items-center gap-1 text-sm font-bold text-ink/60">
          <Link to="/category/shrimp-snails-crabs" className="seo-public-header__browse seo-focus inline-flex min-h-11 items-center rounded-full px-3 hover:bg-[#E8F0EE] hover:text-accent">浏览物种</Link>
          <Link to="/aquarium" className="seo-public-header__cta seo-focus inline-flex min-h-11 items-center whitespace-nowrap rounded-full bg-accent px-4 text-white hover:bg-emerald-800">进入鱼缸</Link>
        </nav>
      </div>
    </header>
    {children}
  </div>;
}

export default PublicSeoShell;
