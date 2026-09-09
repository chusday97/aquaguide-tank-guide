type SeoDocumentInput = { title: string; description: string; canonical: string; jsonLd?: Record<string, unknown> };

export const setSeoDocument = ({ title, description, canonical, jsonLd }: SeoDocumentInput) => {
  if (typeof document === 'undefined') return () => undefined;
  const previousTitle = document.title;
  const previousDescription = document.head.querySelector('meta[name="description"]')?.getAttribute('content');
  const previousRobots = document.head.querySelector('meta[name="robots"]')?.getAttribute('content');
  const previousCanonical = document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');
  const previousJsonLd = document.head.querySelector('script[data-aquaguide-seo-jsonld="true"]')?.textContent;
  document.title = title;
  const upsert = (selector: string, create: () => HTMLElement) => document.head.querySelector(selector) || document.head.appendChild(create());
  const descriptionNode = upsert('meta[name="description"]', () => { const node = document.createElement('meta'); node.setAttribute('name', 'description'); return node; });
  descriptionNode.setAttribute('content', description);
  const robotsNode = upsert('meta[name="robots"]', () => { const node = document.createElement('meta'); node.setAttribute('name', 'robots'); return node; });
  robotsNode.setAttribute('content', 'noindex,follow');
  const canonicalNode = upsert('link[rel="canonical"]', () => { const node = document.createElement('link'); node.setAttribute('rel', 'canonical'); return node; });
  canonicalNode.setAttribute('href', `${window.location.origin}${canonical}`);
  const existingJsonLd = document.head.querySelector('script[data-aquaguide-seo-jsonld="true"]');
  existingJsonLd?.remove();
  if (jsonLd) {
    const node = document.createElement('script');
    node.type = 'application/ld+json';
    node.dataset.aquaguideSeoJsonld = 'true';
    node.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(node);
  }
  return () => {
    document.title = previousTitle;
    const restore = (selector: string, attribute: string, value: string | null | undefined) => {
      const node = document.head.querySelector(selector);
      if (!node) return;
      if (value === undefined) node.remove();
      else node.setAttribute(attribute, value);
    };
    restore('meta[name="description"]', 'content', previousDescription);
    restore('meta[name="robots"]', 'content', previousRobots);
    restore('link[rel="canonical"]', 'href', previousCanonical);
    const currentJsonLd = document.head.querySelector('script[data-aquaguide-seo-jsonld="true"]');
    if (currentJsonLd) {
      if (previousJsonLd === undefined) currentJsonLd.remove();
      else currentJsonLd.textContent = previousJsonLd;
    }
  };
};
