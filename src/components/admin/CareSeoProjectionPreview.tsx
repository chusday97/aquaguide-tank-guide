import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Save, Send, ShieldAlert } from 'lucide-react';
import type { CareSeoEditorialWorkspaceDto, SupportedLocale } from '../../../packages/contracts/src';
import { useToast } from '../common/ToastProvider';
import { AquaGuideApiError } from '../../services/api/api-client';
import { contentAdminService } from '../../services/admin/content-admin.service';

type Props = {
  careId: string;
  sourceRefreshKey?: number | string;
};

type EditorialForm = {
  seoTitle: string;
  metaDescription: string;
  h1: string;
  focusKeyword: string;
};

const emptyForm: EditorialForm = { seoTitle: '', metaDescription: '', h1: '', focusKeyword: '' };
const errorMessage = (error: unknown) => error instanceof AquaGuideApiError ? error.message : 'Care SEO 操作没有完成，请稍后重试。';
const factCount = (value: string[]) => value.length ? `${value.length} 项` : '0 项';

export default function CareSeoProjectionPreview({ careId, sourceRefreshKey }: Props) {
  const { showToast } = useToast();
  const [locale, setLocale] = useState<SupportedLocale>('zh-CN');
  const [workspace, setWorkspace] = useState<CareSeoEditorialWorkspaceDto | null>(null);
  const [form, setForm] = useState<EditorialForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const hydrateForm = (next: CareSeoEditorialWorkspaceDto) => {
    const editorial = next.editorial;
    setForm(editorial ? {
      seoTitle: editorial.seoTitle,
      metaDescription: editorial.metaDescription,
      h1: editorial.h1,
      focusKeyword: editorial.focusKeyword,
    } : { ...next.projection.suggestedEditorial });
  };

  const load = async (nextLocale: SupportedLocale = locale) => {
    setLoading(true);
    setError('');
    try {
      const next = await contentAdminService.getCareSeoEditorialWorkspace(careId, nextLocale);
      setWorkspace(next);
      if (next) hydrateForm(next);
    } catch (cause) {
      setWorkspace(null);
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(locale); }, [careId, locale, sourceRefreshKey]);

  if (loading) {
    return <section data-testid="care-seo-projection" className="mb-4 rounded-[18px] border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-ink/45">正在读取 Published Care + SEO Editorial…</section>;
  }
  if (!workspace) {
    return <section data-testid="care-seo-projection" className="mb-4 rounded-[18px] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-red-700">{error || '当前 Care 还没有可用的 Published source。SEO 不读取 Draft Care。'}</section>;
  }

  const { projection, editorial } = workspace;
  const sourceDrift = Boolean(editorial?.sourceDrift);
  const canEdit = !editorial || sourceDrift || editorial.reviewState === 'draft';
  const currentDraft = editorial && !sourceDrift && editorial.reviewState === 'draft' ? editorial : null;
  const canSubmit = Boolean(currentDraft);
  const canApprove = Boolean(editorial && !sourceDrift && editorial.reviewState === 'ready_for_review');
  const reviewLabel = !editorial ? '未建 Draft' : sourceDrift ? 'Source drift / stale' : editorial.reviewState === 'draft' ? 'Draft' : editorial.reviewState === 'ready_for_review' ? '待审核' : 'Approved';

  const saveDraft = async () => {
    if (!workspace.persistenceAvailable) return;
    setBusy(true); setError('');
    try {
      const next = await contentAdminService.saveCareSeoEditorialDraft(careId, {
        locale,
        sourceCareVersion: projection.sourceCareVersion,
        indexStrategy: 'noindex',
        ...form,
        ...(currentDraft ? { editorialId: currentDraft.id, revisionVersion: currentDraft.version } : {}),
      });
      setWorkspace(next); hydrateForm(next);
      showToast(currentDraft ? 'Care SEO Draft 已保存' : 'Care SEO Draft 已创建', 'success');
    } catch (cause) {
      const message = errorMessage(cause); setError(message); showToast(message, 'error');
    } finally { setBusy(false); }
  };

  const transition = async (action: 'submit' | 'approve') => {
    if (!editorial || sourceDrift) return;
    setBusy(true); setError('');
    try {
      const input = { locale, sourceCareVersion: projection.sourceCareVersion, editorialId: editorial.id, revisionVersion: editorial.version };
      const next = action === 'submit'
        ? await contentAdminService.submitCareSeoEditorialReview(careId, input)
        : await contentAdminService.approveCareSeoEditorial(careId, input);
      setWorkspace(next); hydrateForm(next);
      showToast(action === 'submit' ? 'Care SEO Draft 已提交审核' : 'Care SEO Editorial 已人工批准', 'success');
    } catch (cause) {
      const message = errorMessage(cause); setError(message); showToast(message, 'error');
    } finally { setBusy(false); }
  };

  return (
    <section data-testid="care-seo-projection" className="mb-4 rounded-[20px] border border-violet-200 bg-violet-50/55 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.12em] text-violet-700">Care SEO Editorial · downstream only</div>
          <h3 className="mt-1 text-base font-black text-ink">Published Care → SEO Draft → Review → Approved</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-black">
          <span className="rounded-full bg-white px-3 py-1.5 text-violet-700">Published v{projection.sourceCareVersion}</span>
          <span className={`rounded-full px-3 py-1.5 ${sourceDrift ? 'bg-red-100 text-red-800' : editorial?.reviewState === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{reviewLabel}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">noindex locked</span>
        </div>
      </div>

      <div className="mt-3 flex gap-2" aria-label="Care SEO locale">
        {(['zh-CN', 'en'] as SupportedLocale[]).map(item => <button key={item} type="button" disabled={busy} onClick={() => setLocale(item)} className={`h-9 rounded-full px-3 text-xs font-black ${locale === item ? 'bg-violet-700 text-white' : 'border border-violet-200 bg-white text-violet-700'}`}>{item === 'zh-CN' ? '中文' : 'English'}</button>)}
      </div>

      {!workspace.persistenceAvailable && <div className="mt-4 flex gap-2 rounded-[14px] border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-950"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /><span>当前环境尚未应用 Care SEO Editorial migration，因此这里只读展示 Published projection；不会降级写入其他 authority。</span></div>}
      {sourceDrift && editorial && <div data-testid="care-seo-source-drift" className="mt-4 rounded-[14px] border border-red-200 bg-red-50 p-3 text-xs font-bold leading-5 text-red-900">Source drift：这份 SEO revision 绑定 Published Care v{editorial.sourceCareVersion}，当前已是 v{projection.sourceCareVersion}。旧 Draft/Review 不能继续批准；需显式创建基于新 Published 版本的 Draft。</div>}
      {error && <div role="alert" className="mt-4 rounded-[14px] bg-red-50 p-3 text-xs font-bold text-red-700">{error}</div>}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <EditorialField label="SEO Title" value={form.seoTitle} disabled={!canEdit || !workspace.persistenceAvailable || busy} maxLength={80} onChange={value => setForm(current => ({ ...current, seoTitle: value }))} />
        <EditorialField label="Meta Description" value={form.metaDescription} disabled={!canEdit || !workspace.persistenceAvailable || busy} maxLength={200} onChange={value => setForm(current => ({ ...current, metaDescription: value }))} />
        <EditorialField label="H1" value={form.h1} disabled={!canEdit || !workspace.persistenceAvailable || busy} maxLength={240} onChange={value => setForm(current => ({ ...current, h1: value }))} />
        <EditorialField label="Focus Keyword" value={form.focusKeyword} disabled={!canEdit || !workspace.persistenceAvailable || busy} maxLength={160} onChange={value => setForm(current => ({ ...current, focusKeyword: value }))} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {canEdit && workspace.persistenceAvailable && <button type="button" disabled={busy} onClick={() => void saveDraft()} className="flex h-10 items-center gap-2 rounded-full bg-violet-700 px-4 text-sm font-black text-white disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{currentDraft ? '保存 SEO Draft' : sourceDrift ? `基于 Published v${projection.sourceCareVersion} 新建 Draft` : '创建 SEO Draft'}</button>}
        {canSubmit && <button type="button" disabled={busy} onClick={() => void transition('submit')} className="flex h-10 items-center gap-2 rounded-full border border-violet-300 bg-white px-4 text-sm font-black text-violet-800 disabled:opacity-50"><Send className="h-4 w-4" />提交审核</button>}
        {canApprove && <button type="button" disabled={busy} onClick={() => void transition('approve')} className="flex h-10 items-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-black text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />人工批准</button>}
      </div>

      <div className="mt-4 rounded-[16px] border border-white/80 bg-white/80 p-3">
        <div className="text-[11px] font-black uppercase tracking-[0.1em] text-ink/35">Protected Care facts · read only</div>
        <div className="mt-2 grid gap-2 text-xs font-bold text-ink/58 sm:grid-cols-2 lg:grid-cols-4">
          <span>症状：{factCount(projection.sourceFacts.symptoms)}</span><span>立即动作：{factCount(projection.sourceFacts.immediateActions)}</span><span>禁止动作：{factCount(projection.sourceFacts.avoidActions)}</span><span>Evidence：{projection.sourceFacts.evidenceCount}</span>
        </div>
        <p className="mt-2 text-xs font-semibold leading-5 text-ink/48">{projection.sourceFacts.summary}</p>
      </div>

      <div className="mt-4 rounded-[16px] border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-950">
        <div className="font-black">Production / Index 未开放 · {projection.route.candidateUrl}</div>
        <p className="mt-1">Approved 仅代表 Editorial 人工审核完成，不会自动发布。下一阶段还必须生成显式、脱敏、双语成对的 Staging snapshot 并通过 hosted acceptance。</p>
      </div>
    </section>
  );
}

function EditorialField({ label, value, disabled, maxLength, onChange }: { label: string; value: string; disabled: boolean; maxLength: number; onChange: (value: string) => void }) {
  return <label className="grid gap-1.5 rounded-[14px] bg-white p-3 text-[11px] font-black uppercase tracking-[0.08em] text-ink/35 shadow-sm"><span>{label}</span><textarea aria-label={label} className="min-h-[76px] resize-y rounded-[10px] border border-border px-3 py-2 text-xs font-bold normal-case tracking-normal text-ink outline-none focus:border-violet-400 disabled:bg-slate-50 disabled:text-ink/55" value={value} maxLength={maxLength} disabled={disabled} onChange={event => onChange(event.target.value)} /></label>;
}
