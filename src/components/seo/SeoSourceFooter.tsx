import { Info } from 'lucide-react';
import type { PublishedSourceReference } from '../../types';

export function SeoSourceFooter({ title, text, status, sources = [] }: { title: string; text: string; status?: string; sources?: PublishedSourceReference[] }) {
  return <footer className="seo-source-footer"><div className="flex items-start gap-3"><Info className="mt-0.5 h-5 w-5 shrink-0 text-accent/65" aria-hidden="true" /><div className="min-w-0"><h2 className="font-bold text-ink">{title}</h2><p className="seo-body mt-2">{text}</p>{sources.length > 0 && <ul className="mt-4 grid gap-2">{sources.map(source => <li key={source.id} className="seo-meta leading-6"><span className="font-bold text-ink/75">{source.title}</span><span> · {source.publisher}</span>{source.url && <>{' · '}<a className="seo-focus inline-flex min-h-11 items-center rounded-lg font-bold text-accent underline decoration-accent/25 underline-offset-4" href={source.url} target="_blank" rel="noreferrer">查看来源</a></>}</li>)}</ul>}{status && <p className="seo-meta mt-3 font-bold text-accent/70">{status}</p>}</div></div></footer>;
}

export default SeoSourceFooter;
