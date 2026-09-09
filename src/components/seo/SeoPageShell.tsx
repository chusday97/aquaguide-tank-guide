import type { ReactNode } from 'react';

export function SeoPageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={`seo-page-shell ${className}`}>{children}</main>;
}

export default SeoPageShell;
