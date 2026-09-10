const localHosts = new Set(['localhost', '127.0.0.1']);
const localSeoPort = () => {
  const runtimeEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  return runtimeEnv?.VITE_SEO_ADMIN_PORT || '3010';
};

export const resolveStandaloneSeoAdminHref = (href: string, currentHref?: string) => {
  const baseHref = currentHref || (typeof window !== 'undefined' ? window.location.href : 'https://aquaguide.local/');
  const current = new URL(baseHref);
  const target = new URL(href, current);
  const isStandaloneSeoPath = target.pathname === '/admin/seo' || target.pathname.startsWith('/admin/seo/');
  if (!isStandaloneSeoPath || !localHosts.has(current.hostname) || current.port === localSeoPort()) return href;
  const localSeo = new URL(current.href);
  localSeo.port = localSeoPort();
  localSeo.pathname = '/';
  localSeo.search = target.search;
  localSeo.hash = target.hash;
  return localSeo.toString();
};
