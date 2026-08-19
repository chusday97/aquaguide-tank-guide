import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ExternalLink, Info } from 'lucide-react';

export type DecisionResultTone = 'success' | 'warning' | 'danger' | 'info';
export type DecisionSourceStatus = 'reviewed' | 'candidate';

export type DecisionSource = {
  id: string;
  label: string;
  href?: string;
  detail?: string;
  status?: DecisionSourceStatus;
};

export type DecisionAction = {
  id?: string;
  title: string;
  detail?: string;
  source?: DecisionSource;
  control?: ReactNode;
};

type DecisionResultSurfaceProps = {
  testId?: string;
  tone?: DecisionResultTone;
  eyebrow?: string;
  statusLabel?: string;
  title: string;
  summary?: string;
  primarySource?: DecisionSource;
  primaryControl?: ReactNode;
  actions?: DecisionAction[];
  watchFor?: string[];
  escalateIf?: string[];
  avoid?: string[];
  evidence?: string[];
  sources?: DecisionSource[];
  children?: ReactNode;
};

const toneStyles: Record<DecisionResultTone, {
  shell: string;
  badge: string;
  icon: string;
}> = {
  success: {
    shell: 'border-emerald-100 bg-emerald-50/70',
    badge: 'bg-white text-emerald-800 ring-1 ring-emerald-100',
    icon: 'bg-emerald-700 text-white',
  },
  warning: {
    shell: 'border-amber-100 bg-amber-50/75',
    badge: 'bg-white text-amber-800 ring-1 ring-amber-100',
    icon: 'bg-amber-500 text-white',
  },
  danger: {
    shell: 'border-red-100 bg-red-50/75',
    badge: 'bg-white text-red-800 ring-1 ring-red-100',
    icon: 'bg-red-600 text-white',
  },
  info: {
    shell: 'border-sky-100 bg-sky-50/75',
    badge: 'bg-white text-sky-800 ring-1 ring-sky-100',
    icon: 'bg-sky-600 text-white',
  },
};

const unique = <T extends string>(items: T[]) => Array.from(new Set(items.filter(Boolean)));

function SourceLine({ source }: { source?: DecisionSource }) {
  if (!source) return null;
  const statusText = source.status === 'reviewed' ? '已核验' : source.status === 'candidate' ? '待逐条核验' : '';
  const content = (
    <>
      <span className="truncate">{source.label}</span>
      {statusText && (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${source.status === 'reviewed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
          {statusText}
        </span>
      )}
      {source.href && <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />}
    </>
  );

  if (!source.href) {
    return <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-ink/45">{content}</div>;
  }

  return (
    <a
      href={source.href}
      target="_blank"
      rel="noreferrer"
      className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[10px] font-black text-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
    >
      {content}
    </a>
  );
}

export function DecisionResultSurface({
  testId,
  tone = 'info',
  eyebrow = '现在先做',
  statusLabel,
  title,
  summary,
  primarySource,
  primaryControl,
  actions = [],
  watchFor = [],
  escalateIf = [],
  avoid = [],
  evidence = [],
  sources = [],
  children,
}: DecisionResultSurfaceProps) {
  const styles = toneStyles[tone];
  const visibleActions = actions.filter(action => action.title.trim()).slice(0, 2);
  const visibleWatch = unique(watchFor).slice(0, 3);
  const visibleEscalation = unique(escalateIf).slice(0, 3);
  const visibleAvoid = unique(avoid).slice(0, 2);
  const visibleEvidence = unique(evidence).slice(0, 5);
  const visibleSources = Array.from(new Map(sources.map(source => [source.id, source])).values()).slice(0, 5);
  const StatusIcon = tone === 'success' ? CheckCircle2 : tone === 'info' ? Info : AlertTriangle;

  return (
    <article data-result-ux="decision" data-testid={testId} className="overflow-hidden rounded-[24px] border border-border/70 bg-white shadow-sm">
      <section className={`border-b p-4 sm:p-5 ${styles.shell}`}>
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles.icon}`}>
            <StatusIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black tracking-[0.16em] text-ink/45">{eyebrow}</span>
              {statusLabel && <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${styles.badge}`}>{statusLabel}</span>}
            </div>
            <h3 className="mt-2 text-[20px] font-black leading-tight text-ink sm:text-[22px]">{title}</h3>
            {summary && <p className="mt-1.5 line-clamp-2 text-[12px] font-semibold leading-5 text-ink/58">{summary}</p>}
            <SourceLine source={primarySource} />
            {primaryControl && <div className="mt-3">{primaryControl}</div>}
          </div>
        </div>
      </section>

      <div className="grid gap-3 p-3 sm:p-4">
        {visibleActions.length > 0 && (
          <section data-result-ux-actions>
            <div className="mb-2 text-[11px] font-black text-ink/48">接着做</div>
            <ol className="grid gap-2">
              {visibleActions.map((action, index) => (
                <li key={action.id || `${action.title}-${index}`} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2 rounded-[16px] border border-border/70 bg-bg/55 px-3 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-black text-emerald-800 shadow-sm">{index + 2}</span>
                  <span className="min-w-0">
                    <span className="block text-[12px] font-black leading-5 text-ink">{action.title}</span>
                    {action.detail && <span className="mt-0.5 block line-clamp-2 text-[10px] font-semibold leading-4 text-ink/50">{action.detail}</span>}
                    <SourceLine source={action.source} />
                    {action.control && <span className="mt-2 block">{action.control}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {(visibleWatch.length > 0 || visibleEscalation.length > 0) && (
          <section className="grid gap-2 sm:grid-cols-2" data-result-ux-guardrails>
            {visibleWatch.length > 0 && (
              <div className="rounded-[16px] bg-sky-50 px-3 py-3">
                <div className="text-[11px] font-black text-sky-800">接下来观察</div>
                <ul className="mt-1.5 grid gap-1">
                  {visibleWatch.map(item => <li key={item} className="text-[11px] font-bold leading-5 text-sky-950/70">· {item}</li>)}
                </ul>
              </div>
            )}
            {visibleEscalation.length > 0 && (
              <div className="rounded-[16px] bg-red-50 px-3 py-3">
                <div className="text-[11px] font-black text-red-800">出现这些情况就升级处理</div>
                <ul className="mt-1.5 grid gap-1">
                  {visibleEscalation.map(item => <li key={item} className="text-[11px] font-bold leading-5 text-red-950/70">· {item}</li>)}
                </ul>
              </div>
            )}
          </section>
        )}

        {visibleAvoid.length > 0 && (
          <section className="rounded-[16px] bg-amber-50 px-3 py-3" data-result-ux-avoid>
            <div className="text-[11px] font-black text-amber-800">暂时不要</div>
            <div className="mt-1.5 grid gap-1">
              {visibleAvoid.map(item => <div key={item} className="text-[11px] font-bold leading-5 text-amber-950/72">· {item}</div>)}
            </div>
          </section>
        )}

        {(visibleEvidence.length > 0 || visibleSources.length > 0) && (
          <section className="grid gap-2" data-result-ux-evidence>
            {visibleEvidence.length > 0 && (
              <details className="rounded-[15px] border border-border/70 bg-white px-3 py-2.5">
                <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-3 text-[11px] font-black text-ink/62">
                  <span>为什么是这个结果？</span>
                  <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                </summary>
                <ul className="mt-2 grid gap-1 border-t border-border/60 pt-2">
                  {visibleEvidence.map(item => <li key={item} className="text-[11px] font-semibold leading-5 text-ink/62">· {item}</li>)}
                </ul>
              </details>
            )}
            {visibleSources.length > 0 && (
              <details className="rounded-[15px] border border-border/70 bg-white px-3 py-2.5">
                <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-3 text-[11px] font-black text-ink/62">
                  <span>信息来源 · {visibleSources.length}</span>
                  <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                </summary>
                <div className="mt-2 grid gap-2 border-t border-border/60 pt-2">
                  {visibleSources.map(source => (
                    <div key={source.id} className="rounded-[12px] bg-bg/60 px-2.5 py-2">
                      <SourceLine source={source} />
                      {source.detail && <p className="mt-1 text-[10px] font-semibold leading-4 text-ink/45">{source.detail}</p>}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </section>
        )}

        {children && <div className="pt-1" data-result-ux-footer>{children}</div>}
      </div>
    </article>
  );
}

export default DecisionResultSurface;
