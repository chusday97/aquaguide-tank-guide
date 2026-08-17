import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type {
  RelocationExecutionBlockReason,
  RelocationExecutionRequest,
  RelocationExecutionResult,
} from '../../lib/relocationExecutionPolicy';
import {
  relocationOutcomeRequiresReconciliation,
  toRelocationConfirmationOutcome,
  type RelocationConfirmationOutcome,
} from '../../lib/relocationConfirmationState';

export type RelocationConfirmationFacts = {
  sourceAquariumName: string;
  destinationAquariumName: string;
  speciesName: string;
};

export type RelocationConfirmationDialogProps = {
  open: boolean;
  request: RelocationExecutionRequest;
  facts: RelocationConfirmationFacts;
  isEn?: boolean;
  onOpenChange: (open: boolean) => void;
  executeFreshRelocation: (request: RelocationExecutionRequest) => Promise<RelocationExecutionResult>;
  onReconcile: () => Promise<void> | void;
};

const blockedReasonLabel = (reason: RelocationExecutionBlockReason, isEn: boolean) => {
  const labels: Record<RelocationExecutionBlockReason, [string, string]> = {
    invalid_quantity: ['迁移数量已无效。', 'The relocation quantity is no longer valid.'],
    same_aquarium: ['源鱼缸和目标鱼缸不能相同。', 'Source and destination must be different aquariums.'],
    source_aquarium_not_found: ['源鱼缸已不存在或暂时无法读取。', 'The source aquarium no longer exists or cannot be read.'],
    destination_aquarium_not_found: ['目标鱼缸已不存在或暂时无法读取。', 'The destination aquarium no longer exists or cannot be read.'],
    source_livestock_not_found: ['待迁移的生物记录已经变化。', 'The livestock record to move has changed.'],
    source_livestock_unresolved: ['该生物身份尚未确认，不能执行物种级迁移。', 'This livestock identity is unresolved, so species-level relocation cannot execute.'],
    source_batch_not_found: ['待迁移的批次已经变化。', 'The selected source batch has changed.'],
    source_batch_quantity_changed: ['当前批次数量已经变化，请重新查看方案。', 'The selected batch quantity has changed. Review the plan again.'],
    source_species_not_grounded: ['当前记录无法重新匹配到已确认物种。', 'The current record can no longer be grounded to a verified species.'],
    source_intervention_not_formally_allowed: ['源鱼缸当前资料不足，不能继续正式迁移方案。', 'The source aquarium no longer has enough certainty for a formal relocation action.'],
    source_subject_no_longer_formal_relocation_option: ['当前冲突已经变化，这个物种不再是正式迁移方案。', 'The conflict changed and this species is no longer a formal relocation option.'],
    requested_quantity_not_fresh_formal_option: ['当前需要迁移的完整数量已经变化，请重新比较方案。', 'The freshly required whole-subject quantity has changed. Review the options again.'],
    destination_not_evaluated: ['目标鱼缸目前无法完成重新评估。', 'The destination aquarium cannot currently be re-evaluated.'],
    destination_not_compatible_by_current_evidence: ['重新检查后，目标鱼缸不再满足直接执行条件。', 'After re-checking, the destination no longer meets the direct-execution gate.'],
  };
  return labels[reason][isEn ? 1 : 0];
};

function FactRow({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div className="rounded-[14px] border border-border bg-white px-3 py-2.5" data-relocation-fact={testId}>
      <div className="text-[9px] font-black uppercase tracking-[0.12em] text-ink/40">{label}</div>
      <div className="mt-0.5 text-[12px] font-black text-ink">{value}</div>
    </div>
  );
}

export function RelocationConfirmationDialog({
  open,
  request,
  facts,
  isEn = false,
  onOpenChange,
  executeFreshRelocation,
  onReconcile,
}: RelocationConfirmationDialogProps) {
  const [checking, setChecking] = useState(false);
  const [outcome, setOutcome] = useState<RelocationConfirmationOutcome | null>(null);
  const [unexpectedError, setUnexpectedError] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [reconciliationComplete, setReconciliationComplete] = useState(false);
  const [reconciliationError, setReconciliationError] = useState<string | null>(null);

  useEffect(() => {
    setChecking(false);
    setOutcome(null);
    setUnexpectedError(false);
    setReconciling(false);
    setReconciliationComplete(false);
    setReconciliationError(null);
  }, [open, request.operationId]);

  const handleConfirm = async () => {
    if (checking || outcome || unexpectedError) return;
    setChecking(true);
    try {
      const result = await executeFreshRelocation(request);
      setOutcome(toRelocationConfirmationOutcome(result));
    } catch {
      // The component cannot prove whether an unexpected thrown error happened
      // before or after a write boundary. Stay conservative and reconcile.
      setUnexpectedError(true);
    } finally {
      setChecking(false);
    }
  };

  const handleReconcile = async () => {
    if (reconciling || reconciliationComplete) return;
    setReconciling(true);
    setReconciliationError(null);
    try {
      await onReconcile();
      // Only a successfully completed canonical read clears the non-dismissible
      // uncertainty gate. It does not infer whether the prior mutation happened;
      // the caller refreshes the visible decision surface from that canonical state.
      setReconciliationComplete(true);
    } catch (error) {
      setReconciliationError(error instanceof Error ? error.message : String(error));
    } finally {
      setReconciling(false);
    }
  };

  const rawReconciliationRequired = unexpectedError || Boolean(outcome && relocationOutcomeRequiresReconciliation(outcome));
  const reconciliationRequired = rawReconciliationRequired && !reconciliationComplete;
  const completed = outcome?.phase === 'completed';
  const blocked = outcome?.phase === 'blocked' ? outcome : null;
  const canClose = !checking && !reconciling && !reconciliationRequired;

  useEffect(() => {
    if (canClose) return undefined;
    const blockEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };
    window.addEventListener('keydown', blockEscape, true);
    return () => window.removeEventListener('keydown', blockEscape, true);
  }, [canClose]);

  return (
    <Dialog
      open={open}
      disablePointerDismissal={!canClose}
      onOpenChange={(nextOpen, eventDetails) => {
        if (!nextOpen && !canClose) {
          eventDetails.cancel();
          return;
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className="w-[94vw] max-w-[560px] rounded-[24px] border-border bg-bg p-0"
        data-relocation-confirmation-dialog="true"
        data-relocation-result={unexpectedError ? 'unexpected_error' : outcome?.phase || 'idle'}
        data-relocation-close-locked={reconciliationRequired ? 'true' : 'false'}
      >
        <DialogHeader className="border-b border-border/70 bg-white px-5 py-4 text-left">
          <div className="flex items-center gap-2 text-ink/50">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.14em]">{isEn ? 'Relocation confirmation' : '迁移确认'}</span>
          </div>
          <DialogTitle className="mt-1 text-xl font-black text-ink">
            {isEn ? 'Re-check the current tanks before moving' : '迁移前重新检查当前鱼缸状态'}
          </DialogTitle>
          <DialogDescription className="mt-1 text-[11px] font-bold leading-relaxed text-ink/55">
            {isEn
              ? 'The earlier destination card is not authorization. Confirming will reload both tanks and recompute the source intervention and destination verdict before any move.'
              : '之前看到的目标缸结论不会直接授权迁移。确认后会先重新读取两个鱼缸，并重新计算源缸方案与目标缸结论，条件变化时不会执行迁移。'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-2">
            <div data-relocation-source={request.sourceAquariumId}>
              <FactRow label={isEn ? 'Source aquarium' : '源鱼缸'} value={facts.sourceAquariumName} testId="source" />
            </div>
            <div data-relocation-destination={request.destinationAquariumId}>
              <FactRow label={isEn ? 'Destination aquarium' : '目标鱼缸'} value={facts.destinationAquariumName} testId="destination" />
            </div>
            <div data-relocation-species={request.sourceAquariumFishId}>
              <FactRow label={isEn ? 'Livestock' : '迁移生物'} value={facts.speciesName} testId="species" />
            </div>
            <div data-relocation-quantity={request.quantity}>
              <FactRow label={isEn ? 'Quantity' : '数量'} value={String(request.quantity)} testId="quantity" />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 rounded-[14px] bg-slate-100 px-3 py-2.5 text-[10px] font-black text-ink/55">
            <span>{facts.sourceAquariumName}</span>
            <ArrowRight className="h-3.5 w-3.5" />
            <span>{facts.destinationAquariumName}</span>
          </div>

          {!outcome && !unexpectedError && (
            <section className="mt-4 rounded-[16px] border border-amber-200 bg-amber-50 p-3.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <p className="text-[10px] font-bold leading-relaxed text-amber-950/75">
                  {isEn
                    ? 'Only a freshly recomputed “compatible by current evidence” destination can proceed. Conditional, insufficient-data, changed-quantity, unresolved, or multi-batch whole-subject cases remain blocked.'
                    : '只有重新计算后仍为“基于当前证据可考虑”的目标缸才能继续。条件候选、资料不足、数量变化、身份未确认，以及当前无法一次完成的多批次完整迁移都会被阻止。'}
                </p>
              </div>
            </section>
          )}

          {blocked && (
            <section className="mt-4 rounded-[16px] border border-amber-200 bg-amber-50 p-4" data-relocation-blocked={blocked.reason}>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <h3 className="text-[12px] font-black text-amber-950">{isEn ? 'Conditions changed. Nothing was moved.' : '条件已变化，本次没有执行迁移'}</h3>
                  <p className="mt-1 text-[10px] font-bold leading-relaxed text-amber-900/70">{blockedReasonLabel(blocked.reason, isEn)}</p>
                </div>
              </div>
            </section>
          )}

          {completed && (
            <section className="mt-4 rounded-[16px] border border-emerald-200 bg-emerald-50 p-4" data-relocation-completed="true">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div>
                  <h3 className="text-[12px] font-black text-emerald-950">{isEn ? 'Relocation completed and both tanks were recalculated.' : '迁移已完成，并已重新计算两个鱼缸'}</h3>
                  <p className="mt-1 text-[10px] font-bold leading-relaxed text-emerald-900/70">{isEn ? 'Review the refreshed source and destination state before taking another action.' : '请以刷新后的源缸与目标缸状态为准，再决定下一步。'}</p>
                </div>
              </div>
            </section>
          )}

          {reconciliationRequired && (
            <section className="mt-4 rounded-[16px] border border-sky-200 bg-sky-50 p-4" data-relocation-reconciliation-required="true">
              <div className="flex items-start gap-2.5">
                <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
                <div>
                  <h3 className="text-[12px] font-black text-sky-950">
                    {outcome?.executionStatus === 'mutation_state_unknown'
                      ? (isEn ? 'The move outcome cannot be confirmed yet.' : '暂时无法确认迁移是否已经执行')
                      : (isEn ? 'The move may be complete, but the latest state is unavailable.' : '迁移可能已经完成，但最新状态暂时无法同步')}
                  </h3>
                  <p className="mt-1 text-[10px] font-bold leading-relaxed text-sky-900/70">
                    {isEn
                      ? 'Do not send another relocation. Synchronize the aquarium state first; this dialog stays locked until a canonical read succeeds.'
                      : '不要再次发起迁移。请先重新同步鱼缸状态；在 canonical 状态读取成功前，这个确认不会被关闭或换成新的迁移操作。'}
                  </p>
                  {reconciliationError && (
                    <p className="mt-2 text-[9px] font-bold leading-relaxed text-red-700" data-relocation-reconciliation-error="true">
                      {isEn ? `Synchronization failed: ${reconciliationError}` : `同步失败：${reconciliationError}`}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {reconciliationComplete && rawReconciliationRequired && (
            <section className="mt-4 rounded-[16px] border border-emerald-200 bg-emerald-50 p-4" data-relocation-reconciled="true">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div>
                  <h3 className="text-[12px] font-black text-emerald-950">{isEn ? 'Aquarium state synchronized.' : '鱼缸状态已重新同步'}</h3>
                  <p className="mt-1 text-[10px] font-bold leading-relaxed text-emerald-900/70">{isEn ? 'Close this confirmation and continue from the refreshed canonical aquarium state. No second relocation was sent.' : '现在可以关闭确认，并以刚读取的 canonical 鱼缸状态继续判断。本次同步没有再次发送迁移。'}</p>
                </div>
              </div>
            </section>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {!reconciliationRequired && (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={checking || reconciling}
                className="rounded-[13px] border border-border bg-white px-4 py-2.5 text-[11px] font-black text-ink/65 disabled:opacity-50"
                data-close-relocation-confirmation="true"
              >
                {completed || blocked || reconciliationComplete ? (isEn ? 'Close' : '关闭') : (isEn ? 'Cancel' : '取消')}
              </button>
            )}

            {!outcome && !unexpectedError && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={checking}
                className="inline-flex items-center justify-center gap-2 rounded-[13px] bg-ink px-4 py-2.5 text-[11px] font-black text-white disabled:opacity-50"
                data-confirm-relocation="true"
              >
                {checking && <Loader2 className="h-4 w-4 animate-spin" />}
                {checking
                  ? (isEn ? 'Re-checking current tanks…' : '正在重新检查当前状态…')
                  : (isEn ? 'Re-check and confirm relocation' : '重新检查并确认迁移')}
              </button>
            )}

            {reconciliationRequired && (
              <button
                type="button"
                onClick={handleReconcile}
                disabled={reconciling}
                className="inline-flex items-center justify-center gap-2 rounded-[13px] bg-sky-800 px-4 py-2.5 text-[11px] font-black text-white disabled:opacity-50"
                data-reconcile-relocation="true"
              >
                <RefreshCw className={`h-4 w-4 ${reconciling ? 'animate-spin' : ''}`} />
                {reconciling ? (isEn ? 'Synchronizing…' : '正在同步…') : (isEn ? 'Synchronize aquarium state' : '重新同步鱼缸状态')}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
