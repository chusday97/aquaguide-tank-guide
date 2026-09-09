import { useEffect, useRef, type ReactNode } from 'react';

export function SeoPageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const sections = ref.current ? [...ref.current.querySelectorAll<HTMLElement>('.seo-section')] : [];
    sections.forEach(section => section.classList.add('seo-reveal'));
    if (typeof IntersectionObserver === 'undefined') {
      sections.forEach(section => section.classList.add('seo-reveal--visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('seo-reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return <main ref={ref} className={`seo-page-shell ${className}`}>{children}</main>;
}

export default SeoPageShell;
