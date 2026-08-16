import { AlertTriangle, CheckCircle2, HelpCircle, Search, ShieldAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Fish } from '../../types';
import type { TankCompatibilityResult } from '../../lib/tankCompatibilityEngine';
import type {
  ReplacementCandidate,
  ReplacementRecommendationResult,
} from '../../lib/replacementRecommendationEngine';

export type RiskAndAlternativesPanelProps = {
  open: boolean;
  rejectedSpecies: Fish;
  rejectedCompatibility: TankCompatibilityResult;
  replacementResult: ReplacementRecommendationResult;
  isEn?: boolean;
  onOpenChange: (open: boolean) => void;
  onViewCandidate?: (species: Fish) => void;
};

const intentMatchLabel = (match: string, isEn: boolean) => {
  const labels: Record<string, [string, string]> = {
    same_role: ['同类用途', 'Same role'],
    same_social_mode: ['相似群居方式', 'Similar social mode'],
    same_size: ['相似体型', 'Similar size'],
    same_difficulty: ['相似难度', 'Similar care level'],
  };
  const value = labels[match];
  return value ? value[isEn ? 1 : 0] : match;
};

const evidenceLabel = (candidate: ReplacementCandidate, isEn: boolean) => (
  candidate.evidenceStatus === 'reviewed_behavior'
    ? (isEn ? 'Reviewed behavior evidence' : '已有审核行为证据')
    : (isEn ? 'Behavior evidence incomplete' : '行为证据仍不完整')
);

function CandidateCard({
  candidate,
  tone,
  isEn,
  onViewCandidate,
}: {
  candidate: ReplacementCandidate;
  tone: 'recommended' | 'conditional' | 'confirmation';
  isEn: boolean;
  onViewCandidate?: (species: Fish) => void;
}) {
  const toneClass = tone === 'recommended'
    ? 'border-emerald-100 bg-emerald-50/70'
    : tone === 'conditional'
      ? 'border-amber-100 bg-amber-50/70'
      : 'border-sky-100 bg-sky-50/70';
  const label = tone === 'recommended'
    ? (isEn ? 'Better fit for this tank' : '更适合当前鱼缸')
    : tone === 'conditional'
      ? (isEn ? 'Conditional option' : '有条件候选')
      : (isEn ? 'Needs more confirmation' : '需要更多资料确认');

  return (
    <article className={`rounded-[18px] border p-4 ${toneClass}`} data-replacement-species-id={candidate.species.id}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.12em] text-ink/45">{label}</div>
          <h4 className="mt-1 text-[15px] font-black text-ink">{candidate.species.name}</h4>
          <p className="mt-0.5 truncate text-[11px] font-medium italic text-ink/45">{candidate.species.scientificName}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-ink/58 shadow-sm">
          {isEn ? `Evaluated at ×${candidate.evaluationQuantity}` : `按 ${candidate.evaluationQuantity} 只评估`}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {candidate.intentMatches.map(match => (
          <span key={match} className="rounded-full border border-white bg-white/80 px-2 py-1 text-[10px] font-bold text-ink/55">
            {intentMatchLabel(match, isEn)}
          </span>
        ))}
      </div>

      <p className="mt-3 text-[12px] font-bold leading-relaxed text-ink/68">{candidate.compatibility.summary}</p>
      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-ink/50">
        {candidate.evidenceStatus === 'reviewed_behavior'
          ? <CheckCircle2 className="h-3.5 w-3.5" />
          : <HelpCircle className="h-3.5 w-3.5" />}
        {evidenceLabel(candidate, isEn)}
      </div>

      {onViewCandidate && (
        <Button
          type="button"
          variant="outline"
          className="mt-3 min-h-11 w-full rounded-full bg-white text-[12px] font-black"
          onClick={() => onViewCandidate(candidate.species)}
        >
          {isEn ? 'View candidate details' : '查看候选详情'}
        </Button>
      )}
    </article>
  );
}

export function RiskAndAlternativesPanel({
  open,
  rejectedSpecies,
  rejectedCompatibility,
  replacementResult,
  isEn = false,
  onOpenChange,
  onViewCandidate,
}: RiskAndAlternativesPanelProps) {
  const primaryRisk = rejectedCompatibility.blockingRules[0]
    || rejectedCompatibility.warningRules[0]
    || rejectedCompatibility.missingData[0];
  const totalCandidates = replacementResult.recommended.length
    + replacementResult.conditional.length
    + replacementResult.needsConfirmation.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88dvh] w-[94vw] max-w-[680px] flex-col overflow-hidden rounded-[24px] border-border bg-bg p-0">
        <DialogHeader className="shrink-0 border-b border-border/70 bg-white px-5 py-4 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.14em]">
                  {isEn ? 'Risk & alternatives' : '风险与替代方案'}
                </span>
              </div>
              <DialogTitle className="mt-1 text-xl font-black text-ink">
                {isEn ? `Why ${rejectedSpecies.name} is not recommended` : `为什么不建议加入 ${rejectedSpecies.name}`}
              </DialogTitle>
              <DialogDescription className="mt-1 text-[12px] font-medium leading-relaxed text-ink/55">
                {isEn
                  ? 'Alternatives are re-evaluated against your current aquarium. No safe alternative is also a valid result.'
                  : '替代候选会重新按照你当前鱼缸判断；如果没有真正解决风险的同类替代，系统会直接告诉你。'}
              </DialogDescription>
            </div>
            <button
              type="button"
              aria-label={isEn ? 'Close alternatives' : '关闭替代方案'}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-bg text-ink/55"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <section className="rounded-[20px] border border-red-100 bg-red-50/80 p-4" data-risk-summary>
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div className="min-w-0">
                <div className="text-[11px] font-black text-red-700">
                  {primaryRisk?.title || (isEn ? 'Current tank conflict' : '当前鱼缸存在阻断风险')}
                </div>
                <p className="mt-1 text-[12px] font-bold leading-relaxed text-red-900/80">
                  {primaryRisk?.evidence || rejectedCompatibility.summary}
                </p>
                {primaryRisk && (
                  <p className="mt-2 text-[10px] font-bold text-red-800/60">
                    {isEn
                      ? `Basis: ${primaryRisk.basis} · Confidence: ${primaryRisk.confidence}`
                      : `依据：${primaryRisk.basis} · 置信度：${primaryRisk.confidence}`}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="mt-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-ink/48">
                  <Search className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.12em]">
                    {isEn ? 'Same-intent search' : '同类意图搜索'}
                  </span>
                </div>
                <h3 className="mt-1 text-[16px] font-black text-ink">
                  {isEn ? 'What can replace the original choice?' : '有什么能替代原本的选择？'}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-ink/42">
                {isEn ? `${replacementResult.evaluatedCandidateCount} evaluated` : `已重算 ${replacementResult.evaluatedCandidateCount} 个同类候选`}
              </span>
            </div>

            {replacementResult.status === 'no_safe_same_intent_alternative' && (
              <div className="mt-3 rounded-[18px] border border-amber-200 bg-amber-50 p-4" data-no-safe-alternative>
                <p className="text-[13px] font-black leading-relaxed text-amber-900">
                  {isEn
                    ? 'No same-intent alternative was found that actually removes the current blocker.'
                    : '没有找到真正解决当前阻断风险的同类替代。'}
                </p>
                <p className="mt-1 text-[11px] font-bold leading-relaxed text-amber-800/75">
                  {isEn
                    ? 'The problem may come from the current community structure, not from this one species name. Replacing it with another similar species can reproduce the same risk.'
                    : '这通常意味着问题来自当前群落结构，而不是原候选这个品种本身。换成另一种相似生物仍可能重复同样的风险。'}
                </p>
              </div>
            )}

            {replacementResult.status === 'insufficient_data' && replacementResult.unresolvedCurrentSpeciesIds.length > 0 && (
              <div className="mt-3 rounded-[18px] border border-sky-200 bg-sky-50 p-4" data-alternatives-insufficient>
                <p className="text-[13px] font-black text-sky-900">
                  {isEn ? 'Current livestock identity is incomplete' : '当前缸内生物身份还不完整'}
                </p>
                <p className="mt-1 text-[11px] font-bold leading-relaxed text-sky-800/75">
                  {isEn
                    ? 'Candidates can be explored, but none will be promoted to a formal recommendation until the unresolved residents are identified.'
                    : '可以先查看待确认候选，但在未确认缸内未知生物前，系统不会把任何候选包装成正式推荐。'}
                </p>
              </div>
            )}

            {totalCandidates > 0 && (
              <div className="mt-3 grid gap-3">
                {replacementResult.recommended.map(candidate => (
                  <CandidateCard key={candidate.species.id} candidate={candidate} tone="recommended" isEn={isEn} onViewCandidate={onViewCandidate} />
                ))}
                {replacementResult.conditional.map(candidate => (
                  <CandidateCard key={candidate.species.id} candidate={candidate} tone="conditional" isEn={isEn} onViewCandidate={onViewCandidate} />
                ))}
                {replacementResult.needsConfirmation.map(candidate => (
                  <CandidateCard key={candidate.species.id} candidate={candidate} tone="confirmation" isEn={isEn} onViewCandidate={onViewCandidate} />
                ))}
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
