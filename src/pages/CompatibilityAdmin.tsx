import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpenCheck, Loader2, Save, Send, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/common/ToastProvider';
import { fishData } from '../data/fishData';
import { type ReviewedCompatibilityProfile, type ReviewedPairRule } from '../data/compatibilityEvidence';
import { getRuntimeCompatibilityEvidenceAudit, hydrateReviewedCompatibilityEvidence } from '../data/runtimeCompatibilityEvidence';
import { AquaGuideApiError } from '../services/api/api-client';
import {
  compatibilityAdminService,
  type AdminCompatibilityPairRuleRevision,
  type AdminCompatibilityProfileRevision,
} from '../services/admin/compatibility-admin.service';

const confidenceLabel = { high: '高', medium: '中', low: '低', unknown: '未知' } as const;
const verdictLabel = { compatible: '可混养', caution: '谨慎混养', not_recommended: '不建议', insufficient_data: '信息不足' } as const;
const revisionStatusLabel = {
  draft: 'Draft', pending_review: '待审核', approved: '已批准', rejected: '已驳回', published: '已发布', superseded: '已替代',
} as const;
const verdictClass = {
  compatible: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  caution: 'border-amber-200 bg-amber-50 text-amber-800',
  not_recommended: 'border-red-200 bg-red-50 text-red-800',
  insufficient_data: 'border-slate-200 bg-slate-50 text-slate-700',
} as const;

type RevisionCapability = 'loading' | 'ready' | 'unavailable';
type DraftForm = { behaviorTraits: string; minimumGroupSize: string; predationTargets: string; confidence: 'high' | 'medium' | 'low' | 'unknown' };
type PairDraftForm = { verdict: 'compatible' | 'caution' | 'not_recommended' | 'insufficient_data'; riskType: string; reason: string; mitigation: string; basis: 'species_trait' | 'pair_rule' | 'tank_condition' | 'rule_inference'; confidence: 'high' | 'medium' | 'low' | 'unknown' };

const draftFormFromRevision = (revision: AdminCompatibilityProfileRevision): DraftForm => ({
  behaviorTraits: revision.behaviorTraits.join('\n'),
  minimumGroupSize: revision.minimumGroupSize ? String(revision.minimumGroupSize) : '',
  predationTargets: revision.predationTargets.join('\n'),
  confidence: revision.confidence,
});

const pairDraftFormFromRevision = (revision: AdminCompatibilityPairRuleRevision): PairDraftForm => ({
  verdict: revision.verdict,
  riskType: revision.riskType,
  reason: revision.reason,
  mitigation: revision.mitigation.join('\n'),
  basis: revision.basis,
  confidence: revision.confidence,
});
const compatibilityPairKey = (left: string, right: string) => [left, right].sort().join('__');

const lines = (value: string) => value.split('\n').map(item => item.trim()).filter(Boolean);
const errorText = (error: unknown) => error instanceof AquaGuideApiError ? error.message : 'Compatibility Draft 操作没有完成。';

const citationSnapshotsFromProfile = (profile: ReviewedCompatibilityProfile) => profile.citations.map(source => ({
  sourceKey: source.id,
  title: source.title,
  publisher: source.publisher,
  url: source.url,
  sourceType: source.sourceType,
  reviewStatus: source.reviewStatus,
}));

const citationSnapshotsFromPairRule = (rule: ReviewedPairRule) => rule.citations.map(source => ({
  sourceKey: source.id, title: source.title, publisher: source.publisher, url: source.url, sourceType: source.sourceType, reviewStatus: source.reviewStatus,
}));

export default function CompatibilityAdmin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [revisions, setRevisions] = useState<AdminCompatibilityProfileRevision[]>([]);
  const [revisionCapability, setRevisionCapability] = useState<RevisionCapability>('loading');
  const [writableCatalogKeys, setWritableCatalogKeys] = useState<string[]>([]);
  const [revisionError, setRevisionError] = useState('');
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);
  const [draftForm, setDraftForm] = useState<DraftForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileReviewNote, setProfileReviewNote] = useState('');
  const [isProfileReviewing, setIsProfileReviewing] = useState(false);
  const [isProfilePublishing, setIsProfilePublishing] = useState(false);
  const [pairRevisions, setPairRevisions] = useState<AdminCompatibilityPairRuleRevision[]>([]);
  const [pairRevisionCapability, setPairRevisionCapability] = useState<RevisionCapability>('loading');
  const [writablePairKeys, setWritablePairKeys] = useState<string[]>([]);
  const [pairRevisionError, setPairRevisionError] = useState('');
  const [selectedPairRevisionId, setSelectedPairRevisionId] = useState<string | null>(null);
  const [pairDraftForm, setPairDraftForm] = useState<PairDraftForm | null>(null);
  const [isPairSaving, setIsPairSaving] = useState(false);
  const [isPairSubmitting, setIsPairSubmitting] = useState(false);
  const [pairReviewNote, setPairReviewNote] = useState('');
  const [isPairReviewing, setIsPairReviewing] = useState(false);
  const [isPairPublishing, setIsPairPublishing] = useState(false);
  const [audit, setAudit] = useState(() => getRuntimeCompatibilityEvidenceAudit());
  const speciesById = useMemo(() => new Map(fishData.map(item => [item.id, item])), []);

  useEffect(() => {
    let active = true;
    compatibilityAdminService.listProfileRevisions()
      .then(workspace => {
        if (!active) return;
        setRevisions(workspace.revisions);
        setWritableCatalogKeys(workspace.writableCatalogKeys);
        setRevisionCapability('ready');
        setRevisionError('');
      })
      .catch(error => {
        if (!active) return;
        setRevisionCapability('unavailable');
        setRevisionError(errorText(error));
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    compatibilityAdminService.listPairRuleRevisions()
      .then(workspace => {
        if (!active) return;
        setPairRevisions(workspace.revisions);
        setWritablePairKeys(workspace.writablePairKeys);
        setPairRevisionCapability('ready');
        setPairRevisionError('');
      })
      .catch(error => {
        if (!active) return;
        setPairRevisionCapability('unavailable');
        setPairRevisionError(errorText(error));
      });
    return () => { active = false; };
  }, []);

  const writableCatalogKeySet = useMemo(() => new Set(writableCatalogKeys), [writableCatalogKeys]);
  const activeRevisionByCatalogKey = useMemo(() => new Map(
    revisions.filter(item => ['draft', 'pending_review', 'approved'].includes(item.status)).map(item => [item.species.catalogKey, item]),
  ), [revisions]);
  const selectedRevision = revisions.find(item => item.id === selectedRevisionId) || null;
  const writablePairKeySet = useMemo(() => new Set(writablePairKeys), [writablePairKeys]);
  const activePairRevisionByKey = useMemo(() => new Map(
    pairRevisions.filter(item => ['draft', 'pending_review', 'approved'].includes(item.status)).map(item => [compatibilityPairKey(item.speciesA.catalogKey, item.speciesB.catalogKey), item]),
  ), [pairRevisions]);
  const selectedPairRevision = pairRevisions.find(item => item.id === selectedPairRevisionId) || null;
  const profileRegressionReady = Boolean(selectedRevision?.regressionReport && selectedRevision.regressionReport.evaluatedScenarios > 0);
  const pairRegressionReady = Boolean(selectedPairRevision?.regressionReport && selectedPairRevision.regressionReport.evaluatedScenarios > 0);
  const runtimePublishReady = audit.status.source === 'reviewed-db'
    && writableCatalogKeys.length === audit.reviewedProfiles.length
    && writablePairKeys.length === audit.reviewedPairRules.length;

  const normalizedQuery = query.trim().toLowerCase();
  const profiles = audit.reviewedProfiles.filter(profile => {
    if (!normalizedQuery) return true;
    const species = speciesById.get(profile.speciesId);
    return `${profile.speciesId} ${species?.name || ''} ${species?.scientificName || ''} ${profile.behaviorTraits.join(' ')}`.toLowerCase().includes(normalizedQuery);
  });
  const pairRules = audit.reviewedPairRules.filter(rule => {
    if (!normalizedQuery) return true;
    const names = rule.speciesIds.map(id => speciesById.get(id)?.name || id).join(' ');
    return `${names} ${rule.riskType} ${rule.reason}`.toLowerCase().includes(normalizedQuery);
  });

  const selectRevision = (revision: AdminCompatibilityProfileRevision) => {
    setSelectedRevisionId(revision.id);
    setDraftForm(draftFormFromRevision(revision));
    setProfileReviewNote(revision.reviewNote || '');
    setRevisionError('');
  };

  const beginDraft = async (profile: ReviewedCompatibilityProfile) => {
    const species = speciesById.get(profile.speciesId);
    if (!species || revisionCapability !== 'ready' || !writableCatalogKeySet.has(profile.speciesId)) return;
    setIsSaving(true);
    setRevisionError('');
    try {
      const created = await compatibilityAdminService.createProfileRevision({
        catalogKey: profile.speciesId,
        behaviorTraits: profile.behaviorTraits,
        minimumGroupSize: profile.minimumGroupSize ?? null,
        predationTargets: profile.predationTargets,
        confidence: profile.confidence,
        citations: citationSnapshotsFromProfile(profile),
      });
      setRevisions(items => [created, ...items.filter(item => item.id !== created.id)]);
      selectRevision(created);
      showToast(`${species.name} Compatibility Draft 已创建`, 'success');
    } catch (error) {
      const message = errorText(error);
      setRevisionError(message);
      showToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const saveDraft = async () => {
    if (!selectedRevision || !draftForm || selectedRevision.status !== 'draft') return;
    const minimumGroupSize = draftForm.minimumGroupSize.trim() ? Number(draftForm.minimumGroupSize) : null;
    if (minimumGroupSize !== null && (!Number.isInteger(minimumGroupSize) || minimumGroupSize <= 0)) {
      setRevisionError('最低群体数量必须是正整数，或留空。');
      return;
    }
    setIsSaving(true);
    setRevisionError('');
    try {
      const updated = await compatibilityAdminService.updateProfileRevision(selectedRevision.id, selectedRevision.version, {
        behaviorTraits: lines(draftForm.behaviorTraits),
        minimumGroupSize,
        predationTargets: lines(draftForm.predationTargets),
        confidence: draftForm.confidence,
      });
      setRevisions(items => items.map(item => item.id === updated.id ? updated : item));
      selectRevision(updated);
      showToast('Compatibility Draft 已保存', 'success');
    } catch (error) {
      const message = errorText(error);
      setRevisionError(message);
      showToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const submitDraft = async () => {
    if (!selectedRevision || selectedRevision.status !== 'draft') return;
    if (!window.confirm('提交审核后将锁定 Draft 编辑；当前 reviewed Compatibility 仍不会改变。确认继续吗？')) return;
    setIsSubmitting(true);
    setRevisionError('');
    try {
      const submitted = await compatibilityAdminService.submitProfileRevision(selectedRevision.id, selectedRevision.version);
      setRevisions(items => items.map(item => item.id === submitted.id ? submitted : item));
      selectRevision(submitted);
      showToast('Compatibility revision 已提交审核', 'success');
    } catch (error) {
      const message = errorText(error);
      setRevisionError(message);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  const reviewProfileRevision = async (decision: 'approve' | 'reject') => {
    if (!selectedRevision || selectedRevision.status !== 'pending_review') return;
    if (decision === 'reject' && !profileReviewNote.trim()) { setRevisionError('驳回时必须填写审核说明。'); return; }
    setIsProfileReviewing(true); setRevisionError('');
    try {
      const reviewed = await compatibilityAdminService.reviewProfileRevision(selectedRevision.id, { version: selectedRevision.version, decision, note: profileReviewNote.trim() || undefined });
      setRevisions(items => items.map(item => item.id === reviewed.id ? reviewed : item));
      selectRevision(reviewed);
      showToast(decision === 'approve' ? 'Profile revision 已批准；尚未发布' : 'Profile revision 已驳回', 'success');
    } catch (error) {
      const message = errorText(error); setRevisionError(message); showToast(message, 'error');
    } finally { setIsProfileReviewing(false); }
  };

  const selectPairRevision = (revision: AdminCompatibilityPairRuleRevision) => {
    setSelectedPairRevisionId(revision.id);
    setPairDraftForm(pairDraftFormFromRevision(revision));
    setPairReviewNote(revision.reviewNote || '');
    setPairRevisionError('');
  };

  const beginPairDraft = async (rule: ReviewedPairRule) => {
    const key = compatibilityPairKey(rule.speciesIds[0], rule.speciesIds[1]);
    if (pairRevisionCapability !== 'ready' || !writablePairKeySet.has(key)) return;
    setIsPairSaving(true);
    setPairRevisionError('');
    try {
      const created = await compatibilityAdminService.createPairRuleRevision({
        catalogKeyA: rule.speciesIds[0], catalogKeyB: rule.speciesIds[1], verdict: rule.verdict,
        riskType: rule.riskType, reason: rule.reason, mitigation: rule.mitigation,
        basis: rule.basis, confidence: rule.confidence, citations: citationSnapshotsFromPairRule(rule),
      });
      setPairRevisions(items => [created, ...items.filter(item => item.id !== created.id)]);
      selectPairRevision(created);
      showToast('Pair Rule Draft 已创建', 'success');
    } catch (error) {
      const message = errorText(error); setPairRevisionError(message); showToast(message, 'error');
    } finally { setIsPairSaving(false); }
  };

  const savePairDraft = async () => {
    if (!selectedPairRevision || !pairDraftForm || selectedPairRevision.status !== 'draft') return;
    if (!pairDraftForm.riskType.trim() || !pairDraftForm.reason.trim()) {
      setPairRevisionError('Risk Type 与判断依据不能为空。'); return;
    }
    setIsPairSaving(true); setPairRevisionError('');
    try {
      const updated = await compatibilityAdminService.updatePairRuleRevision(selectedPairRevision.id, selectedPairRevision.version, {
        verdict: pairDraftForm.verdict, riskType: pairDraftForm.riskType.trim(), reason: pairDraftForm.reason.trim(),
        mitigation: lines(pairDraftForm.mitigation), basis: pairDraftForm.basis, confidence: pairDraftForm.confidence,
      });
      setPairRevisions(items => items.map(item => item.id === updated.id ? updated : item));
      selectPairRevision(updated); showToast('Pair Rule Draft 已保存', 'success');
    } catch (error) {
      const message = errorText(error); setPairRevisionError(message); showToast(message, 'error');
    } finally { setIsPairSaving(false); }
  };

  const submitPairDraft = async () => {
    if (!selectedPairRevision || selectedPairRevision.status !== 'draft') return;
    if (!window.confirm('提交审核后将锁定 Pair Rule Draft；当前 reviewed Pair Rule 仍不会改变。确认继续吗？')) return;
    setIsPairSubmitting(true); setPairRevisionError('');
    try {
      const submitted = await compatibilityAdminService.submitPairRuleRevision(selectedPairRevision.id, selectedPairRevision.version);
      setPairRevisions(items => items.map(item => item.id === submitted.id ? submitted : item));
      selectPairRevision(submitted); showToast('Pair Rule revision 已提交审核', 'success');
    } catch (error) {
      const message = errorText(error); setPairRevisionError(message); showToast(message, 'error');
    } finally { setIsPairSubmitting(false); }
  };

  const reviewPairRevision = async (decision: 'approve' | 'reject') => {
    if (!selectedPairRevision || selectedPairRevision.status !== 'pending_review') return;
    if (decision === 'reject' && !pairReviewNote.trim()) { setPairRevisionError('驳回时必须填写审核说明。'); return; }
    setIsPairReviewing(true); setPairRevisionError('');
    try {
      const reviewed = await compatibilityAdminService.reviewPairRuleRevision(selectedPairRevision.id, { version: selectedPairRevision.version, decision, note: pairReviewNote.trim() || undefined });
      setPairRevisions(items => items.map(item => item.id === reviewed.id ? reviewed : item));
      selectPairRevision(reviewed);
      showToast(decision === 'approve' ? 'Pair Rule revision 已批准；尚未发布' : 'Pair Rule revision 已驳回', 'success');
    } catch (error) {
      const message = errorText(error); setPairRevisionError(message); showToast(message, 'error');
    } finally { setIsPairReviewing(false); }
  };


  const refreshReviewedAuthority = async () => {
    const status = await hydrateReviewedCompatibilityEvidence(true);
    setAudit(getRuntimeCompatibilityEvidenceAudit());
    return status;
  };

  const publishProfileRevision = async () => {
    if (!selectedRevision || selectedRevision.status !== 'approved' || !runtimePublishReady) return;
    if (!window.confirm('这会把已批准 Profile revision 作为新的 reviewed Compatibility 版本发布，并立即影响后续混养判断。确认继续吗？')) return;
    setIsProfilePublishing(true); setRevisionError('');
    try {
      const published = await compatibilityAdminService.publishProfileRevision(selectedRevision.id, selectedRevision.version);
      setRevisions(items => items.map(item => item.id === published.id ? published : item));
      selectRevision(published);
      const status = await refreshReviewedAuthority();
      if (status.source !== 'reviewed-db') {
        setRevisionError('Profile 已发布，但 reviewed runtime 暂时回退到静态基线；请先恢复 Compatibility bootstrap 再继续发布。');
        showToast('Profile 已发布，但 runtime 尚未确认新 authority', 'error');
      } else showToast('Profile reviewed version 已发布', 'success');
    } catch (error) {
      const message = errorText(error); setRevisionError(message); showToast(message, 'error');
    } finally { setIsProfilePublishing(false); }
  };

  const publishPairRevision = async () => {
    if (!selectedPairRevision || selectedPairRevision.status !== 'approved' || !runtimePublishReady) return;
    if (!window.confirm('这会把已批准 Pair Rule revision 作为新的 reviewed Compatibility 版本发布，并立即影响后续混养判断。确认继续吗？')) return;
    setIsPairPublishing(true); setPairRevisionError('');
    try {
      const published = await compatibilityAdminService.publishPairRuleRevision(selectedPairRevision.id, selectedPairRevision.version);
      setPairRevisions(items => items.map(item => item.id === published.id ? published : item));
      selectPairRevision(published);
      const status = await refreshReviewedAuthority();
      if (status.source !== 'reviewed-db') {
        setPairRevisionError('Pair Rule 已发布，但 reviewed runtime 暂时回退到静态基线；请先恢复 Compatibility bootstrap 再继续发布。');
        showToast('Pair Rule 已发布，但 runtime 尚未确认新 authority', 'error');
      } else showToast('Pair Rule reviewed version 已发布', 'success');
    } catch (error) {
      const message = errorText(error); setPairRevisionError(message); showToast(message, 'error');
    } finally { setIsPairPublishing(false); }
  };

  return (
    <div className="min-h-[100dvh] bg-[#e8efec] p-3 text-ink md:p-6">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/80 bg-white px-4 py-3 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="返回管理后台" onClick={() => navigate('/admin/content')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border hover:bg-bg"><ArrowLeft className="h-5 w-5" /></button>
            <div className="min-w-0"><div className="text-xs font-black uppercase tracking-[0.14em] text-indigo-700">Compatibility Authority</div><h1 className="truncate text-xl font-black">Compatibility Admin</h1></div>
          </div>
          <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${revisionCapability === 'ready' && pairRevisionCapability === 'ready' ? 'border-indigo-200 bg-indigo-50 text-indigo-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            {revisionCapability === 'loading' || pairRevisionCapability === 'loading' ? '检查 Draft storage…' : revisionCapability === 'ready' && pairRevisionCapability === 'ready' ? 'Profile / Pair Draft 已启用' : revisionCapability === 'ready' || pairRevisionCapability === 'ready' ? '部分 Draft 已启用' : '只读审核基线'}
          </span>
        </header>

        <section className="mt-4 rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-950">
          reviewed Compatibility baseline 始终保持独立。Draft 与审核不会修改 runtime；只有完成 Impact、真实 Compatibility Regression、Canonical Evidence、人工批准且 DB/runtime baseline 全量对齐后，才允许 versioned publish。
        </section>
        {revisionCapability === 'unavailable' && <div role="status" className="mt-3 rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-xs font-bold leading-5 text-ink/55">Draft storage 尚未启用：{revisionError || 'Compatibility revision API / migration 不可用。'} 当前 reviewed baseline 仍可正常审计。</div>}
        {revisionCapability === 'ready' && revisionError && <div role="alert" className="mt-3 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{revisionError}</div>}
        {pairRevisionCapability === 'unavailable' && <div role="status" className="mt-3 rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-xs font-bold leading-5 text-ink/55">Pair Rule Draft storage 尚未启用：{pairRevisionError || 'Pair Rule revision API / migration 不可用。'} reviewed Pair Rules 仍可正常审计。</div>}
        {pairRevisionCapability === 'ready' && pairRevisionError && <div role="alert" className="mt-3 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{pairRevisionError}</div>}

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[20px] border border-white/80 bg-white p-4 shadow-sm"><div className="text-xs font-black text-ink/45">Reviewed Profiles</div><div className="mt-1 text-2xl font-black">{audit.reviewedProfiles.length}</div><div className="mt-1 text-[10px] font-bold text-ink/40">DB baseline {revisionCapability === 'ready' ? `${writableCatalogKeys.length}/${audit.reviewedProfiles.length}` : '—'}</div></div>
          <div className="rounded-[20px] border border-white/80 bg-white p-4 shadow-sm"><div className="text-xs font-black text-ink/45">Reviewed Pair Rules</div><div className="mt-1 text-2xl font-black">{audit.reviewedPairRules.length}</div><div className="mt-1 text-[10px] font-bold text-ink/40">DB baseline {pairRevisionCapability === 'ready' ? `${writablePairKeys.length}/${audit.reviewedPairRules.length}` : '—'}</div></div>
          <div className="rounded-[20px] border border-white/80 bg-white p-4 shadow-sm"><div className="text-xs font-black text-ink/45">Active Revisions</div><div className="mt-1 text-sm font-black leading-6">Profiles {revisionCapability === 'ready' ? activeRevisionByCatalogKey.size : '—'}<br/>Pair Rules {pairRevisionCapability === 'ready' ? activePairRevisionByKey.size : '—'}</div></div>
        </section>

        {selectedRevision && draftForm && <section data-testid="compatibility-draft-editor" className="mt-4 rounded-[24px] border border-indigo-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="text-xs font-black uppercase tracking-[0.12em] text-indigo-700">Behavior Profile Revision #{selectedRevision.revisionNumber}</div><h2 className="mt-1 text-lg font-black">{selectedRevision.species.name}</h2><p className="mt-1 text-xs font-bold italic text-ink/45">{selectedRevision.species.scientificName} · baseline v{selectedRevision.baseProfileVersion || '—'}</p></div>
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-800">{revisionStatusLabel[selectedRevision.status]}</span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-black text-ink/60"><span>Behavior traits（每行一项）</span><textarea disabled={selectedRevision.status !== 'draft'} value={draftForm.behaviorTraits} onChange={event => setDraftForm(value => value ? { ...value, behaviorTraits: event.target.value } : value)} className="min-h-[120px] rounded-[14px] border border-border bg-bg px-3 py-2 text-sm font-bold disabled:opacity-60" /></label>
            <label className="grid gap-1.5 text-xs font-black text-ink/60"><span>Predation targets（每行一项）</span><textarea disabled={selectedRevision.status !== 'draft'} value={draftForm.predationTargets} onChange={event => setDraftForm(value => value ? { ...value, predationTargets: event.target.value } : value)} className="min-h-[120px] rounded-[14px] border border-border bg-bg px-3 py-2 text-sm font-bold disabled:opacity-60" /></label>
            <label className="grid gap-1.5 text-xs font-black text-ink/60"><span>最低群体数量</span><input disabled={selectedRevision.status !== 'draft'} inputMode="numeric" value={draftForm.minimumGroupSize} onChange={event => setDraftForm(value => value ? { ...value, minimumGroupSize: event.target.value } : value)} className="h-11 rounded-[14px] border border-border bg-bg px-3 text-sm font-bold disabled:opacity-60" placeholder="留空表示未设置" /></label>
            <label className="grid gap-1.5 text-xs font-black text-ink/60"><span>Confidence</span><select disabled={selectedRevision.status !== 'draft'} value={draftForm.confidence} onChange={event => setDraftForm(value => value ? { ...value, confidence: event.target.value as DraftForm['confidence'] } : value)} className="h-11 rounded-[14px] border border-border bg-bg px-3 text-sm font-bold disabled:opacity-60"><option value="high">高</option><option value="medium">中</option><option value="low">低</option><option value="unknown">未知</option></select></label>
          </div>
          <div className="mt-4 rounded-[14px] bg-bg px-3 py-3 text-xs font-bold leading-5 text-ink/55">继承 reviewed evidence：{selectedRevision.citationSnapshots.map(source => source.publisher).join(' · ')}。Canonical Evidence：{selectedRevision.evidenceResolution?.length || 0}/{selectedRevision.citationSnapshots.length}。</div>
          {selectedRevision.impactReport?.changedFields?.length ? <div data-testid="profile-impact-report" className="mt-3 rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-3 text-xs font-bold leading-5 text-amber-950">服务器 Impact Check：baseline v{selectedRevision.impactReport.baselineVersion} → 变更 {selectedRevision.impactReport.changedFields.join('、')}。批准只改变 revision 审核状态，不会发布到 Compatibility runtime。</div> : null}
          {selectedRevision.regressionReport ? <div data-testid="profile-regression-report" className="mt-3 rounded-[14px] border border-indigo-200 bg-indigo-50 px-3 py-3 text-xs font-bold leading-5 text-indigo-950"><div>Compatibility Regression：authority seq {selectedRevision.regressionReport.authoritySequence} · 已评估 {selectedRevision.regressionReport.evaluatedScenarios} 个场景 · 结果变化 {selectedRevision.regressionReport.changedScenarios} 个。</div>{selectedRevision.regressionReport.changes.slice(0, 5).map(change => <div key={`${change.scenario}-${change.species.join('-')}`} className="mt-1 text-[11px] text-indigo-900/70">{change.species.map(id => speciesById.get(id)?.name || id).join(' × ')} · {change.scenario}: {change.before.status} → {change.after.status}</div>)}</div> : null}
          {selectedRevision.status === 'pending_review' && <div className="mt-3 grid gap-2"><label className="grid gap-1 text-xs font-black text-ink/60"><span>审核说明（驳回必填）</span><textarea value={profileReviewNote} onChange={event => setProfileReviewNote(event.target.value)} className="min-h-[80px] rounded-[14px] border border-border bg-bg px-3 py-2 text-sm font-bold" /></label><div className="flex flex-wrap justify-end gap-2"><button type="button" disabled={isProfileReviewing} onClick={() => void reviewProfileRevision('reject')} className="h-10 rounded-full border border-red-200 px-4 text-sm font-black text-red-700 disabled:opacity-50">驳回 revision</button><button type="button" disabled={isProfileReviewing || !profileRegressionReady} onClick={() => void reviewProfileRevision('approve')} className="h-10 rounded-full bg-emerald-700 px-4 text-sm font-black text-white disabled:opacity-50">批准 revision（不发布）</button></div></div>}
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            {selectedRevision.status === 'draft' && <button type="button" disabled={isSaving || isSubmitting} onClick={() => void saveDraft()} className="flex h-10 items-center gap-2 rounded-full border border-indigo-200 px-4 text-sm font-black text-indigo-800 disabled:opacity-50">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}保存 Draft</button>}
            {selectedRevision.status === 'draft' && <button type="button" disabled={isSaving || isSubmitting} onClick={() => void submitDraft()} className="flex h-10 items-center gap-2 rounded-full bg-indigo-700 px-4 text-sm font-black text-white disabled:opacity-50">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}提交审核</button>}
            {selectedRevision.status === 'approved' && runtimePublishReady && profileRegressionReady && <button type="button" disabled={isProfilePublishing} onClick={() => void publishProfileRevision()} className="flex h-10 items-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-black text-white disabled:opacity-50">{isProfilePublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}发布 reviewed version</button>}
            {selectedRevision.status === 'approved' && !runtimePublishReady && <span className="self-center text-xs font-bold text-amber-700">发布锁定：DB/runtime baseline 尚未全量对齐</span>}
          </div>
        </section>}

        {selectedPairRevision && pairDraftForm && <section data-testid="compatibility-pair-draft-editor" className="mt-4 rounded-[24px] border border-violet-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="text-xs font-black uppercase tracking-[0.12em] text-violet-700">Pair Rule Revision #{selectedPairRevision.revisionNumber}</div><h2 className="mt-1 text-lg font-black">{selectedPairRevision.speciesA.name} × {selectedPairRevision.speciesB.name}</h2><p className="mt-1 text-xs font-bold text-ink/45">baseline v{selectedPairRevision.baseRuleVersion || '—'} · Evidence inherited from reviewed rule</p></div>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-black text-violet-800">{revisionStatusLabel[selectedPairRevision.status]}</span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-black text-ink/60"><span>Verdict</span><select disabled={selectedPairRevision.status !== 'draft'} value={pairDraftForm.verdict} onChange={event => setPairDraftForm(value => value ? { ...value, verdict: event.target.value as PairDraftForm['verdict'] } : value)} className="h-11 rounded-[14px] border border-border bg-bg px-3 text-sm font-bold disabled:opacity-60"><option value="compatible">可混养</option><option value="caution">谨慎混养</option><option value="not_recommended">不建议</option><option value="insufficient_data">信息不足</option></select></label>
            <label className="grid gap-1.5 text-xs font-black text-ink/60"><span>Risk Type</span><input disabled={selectedPairRevision.status !== 'draft'} value={pairDraftForm.riskType} onChange={event => setPairDraftForm(value => value ? { ...value, riskType: event.target.value } : value)} className="h-11 rounded-[14px] border border-border bg-bg px-3 text-sm font-bold disabled:opacity-60" /></label>
            <label className="grid gap-1.5 text-xs font-black text-ink/60"><span>Basis</span><select disabled={selectedPairRevision.status !== 'draft'} value={pairDraftForm.basis} onChange={event => setPairDraftForm(value => value ? { ...value, basis: event.target.value as PairDraftForm['basis'] } : value)} className="h-11 rounded-[14px] border border-border bg-bg px-3 text-sm font-bold disabled:opacity-60"><option value="pair_rule">直接配对证据</option><option value="rule_inference">规则推断</option><option value="species_trait">物种特征</option><option value="tank_condition">鱼缸条件</option></select></label>
            <label className="grid gap-1.5 text-xs font-black text-ink/60"><span>Confidence</span><select disabled={selectedPairRevision.status !== 'draft'} value={pairDraftForm.confidence} onChange={event => setPairDraftForm(value => value ? { ...value, confidence: event.target.value as PairDraftForm['confidence'] } : value)} className="h-11 rounded-[14px] border border-border bg-bg px-3 text-sm font-bold disabled:opacity-60"><option value="high">高</option><option value="medium">中</option><option value="low">低</option><option value="unknown">未知</option></select></label>
            <label className="grid gap-1.5 text-xs font-black text-ink/60 md:col-span-2"><span>判断依据</span><textarea disabled={selectedPairRevision.status !== 'draft'} value={pairDraftForm.reason} onChange={event => setPairDraftForm(value => value ? { ...value, reason: event.target.value } : value)} className="min-h-[120px] rounded-[14px] border border-border bg-bg px-3 py-2 text-sm font-bold leading-6 disabled:opacity-60" /></label>
            <label className="grid gap-1.5 text-xs font-black text-ink/60 md:col-span-2"><span>Mitigation（每行一项）</span><textarea disabled={selectedPairRevision.status !== 'draft'} value={pairDraftForm.mitigation} onChange={event => setPairDraftForm(value => value ? { ...value, mitigation: event.target.value } : value)} className="min-h-[100px] rounded-[14px] border border-border bg-bg px-3 py-2 text-sm font-bold disabled:opacity-60" /></label>
          </div>
          <div className="mt-4 rounded-[14px] bg-bg px-3 py-3 text-xs font-bold leading-5 text-ink/55">继承 reviewed evidence：{selectedPairRevision.citationSnapshots.map(source => source.publisher).join(' · ')}。Canonical Evidence：{selectedPairRevision.evidenceResolution?.length || 0}/{selectedPairRevision.citationSnapshots.length}。</div>
          {selectedPairRevision.impactReport?.changedFields?.length ? <div data-testid="pair-impact-report" className="mt-3 rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-3 text-xs font-bold leading-5 text-amber-950">服务器 Impact Check：baseline v{selectedPairRevision.impactReport.baselineVersion} → 变更 {selectedPairRevision.impactReport.changedFields.join('、')}。批准只改变 revision 审核状态，不会发布到 Compatibility runtime。</div> : null}
          {selectedPairRevision.regressionReport ? <div data-testid="pair-regression-report" className="mt-3 rounded-[14px] border border-violet-200 bg-violet-50 px-3 py-3 text-xs font-bold leading-5 text-violet-950"><div>Compatibility Regression：authority seq {selectedPairRevision.regressionReport.authoritySequence} · 已评估 {selectedPairRevision.regressionReport.evaluatedScenarios} 个场景 · 结果变化 {selectedPairRevision.regressionReport.changedScenarios} 个。</div>{selectedPairRevision.regressionReport.changes.slice(0, 5).map(change => <div key={`${change.scenario}-${change.species.join('-')}`} className="mt-1 text-[11px] text-violet-900/70">{change.species.map(id => speciesById.get(id)?.name || id).join(' × ')} · {change.scenario}: {change.before.status} → {change.after.status}</div>)}</div> : null}
          {selectedPairRevision.status === 'pending_review' && <div className="mt-3 grid gap-2"><label className="grid gap-1 text-xs font-black text-ink/60"><span>Pair 审核说明（驳回必填）</span><textarea value={pairReviewNote} onChange={event => setPairReviewNote(event.target.value)} className="min-h-[80px] rounded-[14px] border border-border bg-bg px-3 py-2 text-sm font-bold" /></label><div className="flex flex-wrap justify-end gap-2"><button type="button" disabled={isPairReviewing} onClick={() => void reviewPairRevision('reject')} className="h-10 rounded-full border border-red-200 px-4 text-sm font-black text-red-700 disabled:opacity-50">驳回 Pair revision</button><button type="button" disabled={isPairReviewing || !pairRegressionReady} onClick={() => void reviewPairRevision('approve')} className="h-10 rounded-full bg-emerald-700 px-4 text-sm font-black text-white disabled:opacity-50">批准 Pair revision（不发布）</button></div></div>}
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            {selectedPairRevision.status === 'draft' && <button type="button" disabled={isPairSaving || isPairSubmitting} onClick={() => void savePairDraft()} className="flex h-10 items-center gap-2 rounded-full border border-violet-200 px-4 text-sm font-black text-violet-800 disabled:opacity-50">{isPairSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}保存 Pair Draft</button>}
            {selectedPairRevision.status === 'draft' && <button type="button" disabled={isPairSaving || isPairSubmitting} onClick={() => void submitPairDraft()} className="flex h-10 items-center gap-2 rounded-full bg-violet-700 px-4 text-sm font-black text-white disabled:opacity-50">{isPairSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}提交 Pair 审核</button>}
            {selectedPairRevision.status === 'approved' && runtimePublishReady && pairRegressionReady && <button type="button" disabled={isPairPublishing} onClick={() => void publishPairRevision()} className="flex h-10 items-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-black text-white disabled:opacity-50">{isPairPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}发布 Pair reviewed version</button>}
            {selectedPairRevision.status === 'approved' && !runtimePublishReady && <span className="self-center text-xs font-bold text-amber-700">发布锁定：DB/runtime baseline 尚未全量对齐</span>}
          </div>
        </section>}


        <div className="mt-4 rounded-[20px] border border-white/80 bg-white p-3 shadow-sm">
          <label className="block text-xs font-black text-ink/50" htmlFor="compatibility-admin-search">搜索物种、学名、行为或风险类型</label>
          <input id="compatibility-admin-search" value={query} onChange={event => setQuery(event.target.value)} className="mt-2 h-11 w-full rounded-[14px] border border-border bg-bg px-3 text-sm font-bold outline-none focus:border-indigo-400" placeholder="例如：孔雀鱼 / shoaling / predation" />
        </div>
        <main className="mt-4 grid min-w-0 gap-4 xl:grid-cols-2">
          <section className="min-w-0 rounded-[24px] border border-white/80 bg-white p-4 shadow-sm" aria-labelledby="compatibility-profile-title">
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-indigo-700"/><h2 id="compatibility-profile-title" className="text-lg font-black">Species Behavior Profiles</h2></div>
            <p className="mt-1 text-xs font-bold text-ink/45">reviewed baseline + 安全 revision Draft；Draft 不替换 runtime。</p>
            <div className="mt-4 grid gap-3">{profiles.map(profile => {
              const species = speciesById.get(profile.speciesId);
              const activeRevision = activeRevisionByCatalogKey.get(profile.speciesId);
              return <article key={profile.speciesId} className="min-w-0 rounded-[18px] border border-border bg-bg/50 p-3">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-2"><div className="min-w-0"><div className="truncate text-sm font-black">{species?.name || profile.speciesId}</div><div className="mt-0.5 truncate text-[11px] font-bold italic text-ink/45">{species?.scientificName || profile.speciesId}</div></div><span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-black text-indigo-800">置信度 {confidenceLabel[profile.confidence]}</span></div>
                <div className="mt-3 flex flex-wrap gap-1.5">{profile.behaviorTraits.map(trait => <span key={trait} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-700">{trait}</span>)}</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="rounded-[12px] bg-white px-3 py-2 text-xs font-bold"><span className="text-ink/40">最低群体：</span>{profile.minimumGroupSize || '未设置'}</div><div className="rounded-[12px] bg-white px-3 py-2 text-xs font-bold"><span className="text-ink/40">捕食目标：</span>{profile.predationTargets.length ? profile.predationTargets.join('、') : '无已审核目标'}</div></div>
                <div className="mt-3 text-[11px] font-bold leading-5 text-ink/55">证据 {profile.citations.length} 项：{profile.citations.map(source => source.publisher).join(' · ')}</div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <span className="text-[10px] font-black text-ink/40">reviewed baseline</span>
                  {revisionCapability === 'ready' && activeRevision && <button type="button" onClick={() => selectRevision(activeRevision)} className="h-9 rounded-full border border-indigo-200 bg-white px-3 text-xs font-black text-indigo-800">打开 {revisionStatusLabel[activeRevision.status]}</button>}
                  {revisionCapability === 'ready' && !activeRevision && writableCatalogKeySet.has(profile.speciesId) && <button type="button" disabled={isSaving} onClick={() => void beginDraft(profile)} className="h-9 rounded-full bg-indigo-700 px-3 text-xs font-black text-white disabled:opacity-50">创建 Profile Draft</button>}
                  {revisionCapability === 'ready' && !activeRevision && !writableCatalogKeySet.has(profile.speciesId) && <span className="text-[10px] font-bold text-amber-700">等待 DB baseline 对齐</span>}
                  {revisionCapability !== 'ready' && <span className="text-[10px] font-bold text-amber-700">写入锁定</span>}
                </div>
              </article>;
            })}{profiles.length === 0 && <div className="rounded-[16px] bg-bg p-5 text-center text-sm font-bold text-ink/45">没有匹配的 Profile。</div>}</div>
          </section>

          <section className="min-w-0 rounded-[24px] border border-white/80 bg-white p-4 shadow-sm" aria-labelledby="compatibility-pair-title">
            <div className="flex items-center gap-2"><BookOpenCheck className="h-5 w-5 text-violet-700"/><h2 id="compatibility-pair-title" className="text-lg font-black">Reviewed Pair Rules</h2></div>
            <p className="mt-1 text-xs font-bold text-ink/45">reviewed baseline + 安全 Pair Rule revision Draft；Draft 不替换 runtime。</p>
            <div className="mt-4 grid gap-3">{pairRules.map(rule => {
              const left = speciesById.get(rule.speciesIds[0]);
              const right = speciesById.get(rule.speciesIds[1]);
              const key = compatibilityPairKey(rule.speciesIds[0], rule.speciesIds[1]);
              const activeRevision = activePairRevisionByKey.get(key);
              return <article key={key} className="min-w-0 rounded-[18px] border border-border bg-bg/50 p-3">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-2"><div className="min-w-0 text-sm font-black">{left?.name || rule.speciesIds[0]} <span className="text-ink/30">×</span> {right?.name || rule.speciesIds[1]}</div><span className={`rounded-full border px-2 py-1 text-[10px] font-black ${verdictClass[rule.verdict]}`}>{verdictLabel[rule.verdict]}</span></div>
                <div className="mt-2 text-[11px] font-black text-violet-700">{rule.riskType}</div>
                <p className="mt-2 break-words text-xs font-bold leading-5 text-ink/65">{rule.reason}</p>
                <div className="mt-3 rounded-[12px] bg-white px-3 py-2 text-[11px] font-bold leading-5 text-ink/55"><span className="font-black text-ink/70">缓解：</span>{rule.mitigation.join('；')}</div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-ink/45"><span>basis: {rule.basis} · confidence: {rule.confidence}</span><span>{rule.citations.length} 项 reviewed evidence</span></div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <span className="text-[10px] font-black text-ink/40">reviewed baseline</span>
                  {pairRevisionCapability === 'ready' && activeRevision && <button type="button" onClick={() => selectPairRevision(activeRevision)} className="h-9 rounded-full border border-violet-200 bg-white px-3 text-xs font-black text-violet-800">打开 Pair {revisionStatusLabel[activeRevision.status]}</button>}
                  {pairRevisionCapability === 'ready' && !activeRevision && writablePairKeySet.has(key) && <button type="button" disabled={isPairSaving} onClick={() => void beginPairDraft(rule)} className="h-9 rounded-full bg-violet-700 px-3 text-xs font-black text-white disabled:opacity-50">创建 Pair Draft</button>}
                  {pairRevisionCapability === 'ready' && !activeRevision && !writablePairKeySet.has(key) && <span className="text-[10px] font-bold text-amber-700">等待 DB Pair baseline 对齐</span>}
                  {pairRevisionCapability !== 'ready' && <span className="text-[10px] font-bold text-amber-700">写入锁定</span>}
                </div>
              </article>;
            })}{pairRules.length === 0 && <div className="rounded-[16px] bg-bg p-5 text-center text-sm font-bold text-ink/45">没有匹配的 Pair Rule。</div>}</div>
          </section>
        </main>
      </div>
    </div>
  );
}
