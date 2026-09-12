import { Waves } from 'lucide-react';

type SeoAssetFallbackProps = {
  label: string;
  title?: string;
  className?: string;
};

export function SeoAssetFallback({ label, title, className = '' }: SeoAssetFallbackProps) {
  return <div className={`seo-asset-fallback ${className}`} role="img" aria-label={label}>
    <div>
      <Waves className="mx-auto h-8 w-8 text-accent/45" aria-hidden="true" />
      {title && <p className="mt-4 font-serif text-2xl font-bold text-ink/75">{title}</p>}
      <p className={`${title ? 'mt-2' : 'mt-4'} text-sm font-black text-accent/75`}>{label}</p>
    </div>
  </div>;
}
