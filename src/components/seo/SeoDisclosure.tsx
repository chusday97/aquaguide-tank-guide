import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export function SeoDisclosure({ label, openLabel = label, children, className = '' }: { label: string; openLabel?: string; children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return <div className={`seo-disclosure seo-card overflow-hidden ${className}`.trim()}>
    <button type="button" aria-expanded={open} aria-controls={panelId} className="seo-disclosure__trigger seo-focus" onClick={() => setOpen(current => !current)}>
      <span>{open ? openLabel : label}</span><ChevronDown className="seo-disclosure__icon" aria-hidden="true" />
    </button>
    <div id={panelId} className={`seo-disclosure__panel ${open ? 'seo-disclosure__panel--open' : ''}`} aria-hidden={!open}>
      <div className="seo-disclosure__content">{children}</div>
    </div>
  </div>;
}

export default SeoDisclosure;
