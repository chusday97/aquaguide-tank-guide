import { useEffect, useMemo, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { AquariumFish, Fish } from '../../types';
import { createLivestockRemovalAttempt, markLivestockRemovalSubmitted } from '../../services/aquarium/livestock-removal-attempt.service';
import { normalizeSpeciesBatches } from '../../services/aquarium/species-batches.service';
import { LivestockBatchCard } from './LivestockBatchCard';
import { SurfaceHeader } from '../common/SurfaceHeader';
import { useTranslation } from 'react-i18next';
import { QuantityStepper } from '../forms/QuantityStepper';
import { getLifeType } from '../../modules/species/species.service';

type RemovalDraft = {
  record: AquariumFish;
  fish: Fish;
  batchId: string;
  quantity: number;
  operationId: string;
  submitted: boolean;
};

type Props = {
  open: boolean;
  aquariumName: string;
  records: AquariumFish[];
  species: Fish[];
  onOpenChange: (open: boolean) => void;
  onOpenDetail: (fish: Fish, record: AquariumFish) => void;
  onSave: (recordId: string, nextRecord: AquariumFish | null) => Promise<void>;
  onRemove: (input: {
    aquariumFishId: string;
    batchId: string;
    quantity: number;
    operationId: string;
  }) => Promise<void>;
  onAdd: () => void;
  startedAt?: string;
  startedAtConfirmed: boolean;
  aquariumAgeDays: number;
  isSavingStartedAt?: boolean;
  onConfirmStartedAt: (value: string) => Promise<void>;
  onDownloadArchive: () => void;
  onDownloadMilestone?: () => void;
  onCreateShare: () => void;
  isCreatingShare?: boolean;
};

export function LivestockRosterDialog({
  open,
  aquariumName,
  records,
  species,
  onOpenChange,
  onOpenDetail,
  onSave,
  onRemove,
  onAdd,
  startedAt,
  startedAtConfirmed,
  aquariumAgeDays,
  isSavingStartedAt = false,
  onConfirmStartedAt,
  onDownloadArchive,
  onDownloadMilestone,
  onCreateShare,
  isCreatingShare = false,
}: Props) {
  const { i18n } = useTranslation();
  const isEn = i18n.language !== 'zh-CN';
  const [removal, setRemoval] = useState<RemovalDraft | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');
  const [startedAtDraft, setStartedAtDraft] = useState(startedAt || '');
  const [startedAtError, setStartedAtError] = useState('');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isEditingDirty, setIsEditingDirty] = useState(false);
  const [isRosterCloseConfirmOpen, setIsRosterCloseConfirmOpen] = useState(false);
  const speciesById = useMemo(() => new Map(species.map(item => [item.id, item])), [species]);
  const visibleRecords = useMemo(() => records
    .map(record => ({ record, fish: speciesById.get(record.fishId) }))
    .filter((item): item is { record: AquariumFish; fish: Fish } => Boolean(item.fish)), [records, speciesById]);
  const displayedRecords = editingRecordId
    ? visibleRecords.filter(item => item.record.id === editingRecordId)
    : visibleRecords;

  useEffect(() => {
    if (!removal) return;
    const current = records.find(item => item.id === removal.record.id);
    if (!current) setRemoval(null);
  }, [records, removal]);

  useEffect(() => setStartedAtDraft(startedAt || ''), [startedAt]);
  useEffect(() => {
    if (!open) {
      setEditingRecordId(null);
      setIsEditingDirty(false);
      setIsRosterCloseConfirmOpen(false);
    }
  }, [open]);
  useEffect(() => {
    if (editingRecordId && !visibleRecords.some(item => item.record.id === editingRecordId)) {
      setEditingRecordId(null);
      setIsEditingDirty(false);
    }
  }, [editingRecordId, visibleRecords]);

  const batches = removal ? normalizeSpeciesBatches(removal.record) : [];
  const selectedBatch = batches.find(batch => batch.id === removal?.batchId);

  const beginRemoval = (record: AquariumFish, fish: Fish) => {
    const firstBatch = normalizeSpeciesBatches(record)[0];
    setRemoveError('');
    setRemoval({
      record,
      fish,
      batchId: firstBatch.id,
      quantity: 1,
      ...createLivestockRemovalAttempt(),
    });
  };

  const confirmRemoval = async () => {
    if (!removal || !selectedBatch || isRemoving) return;
    if (!Number.isInteger(removal.quantity) || removal.quantity < 1 || removal.quantity > selectedBatch.quantity) {
      setRemoveError(`请输入 1–${selectedBatch.quantity} 之间的整数。`);
      return;
    }
    setIsRemoving(true);
    setRemoveError('');
    setRemoval(current => current ? markLivestockRemovalSubmitted(current) : current);
    try {
      await onRemove({
        aquariumFishId: removal.record.id,
        batchId: removal.batchId,
        quantity: removal.quantity,
        operationId: removal.operationId,
      });
      setRemoval(null);
    } catch (error) {
      setRemoveError(error instanceof Error ? error.message : '移出失败，请稍后重试。');
    } finally {
      setIsRemoving(false);
    }
  };

  const requestRosterOpenChange = (next: boolean) => {
    if (!next && editingRecordId && isEditingDirty) {
      setIsRosterCloseConfirmOpen(true);
      return;
    }
    if (!next) {
      setEditingRecordId(null);
      setIsEditingDirty(false);
    }
    onOpenChange(next);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={requestRosterOpenChange}>
        <DialogContent showCloseButton={false} className="flex h-[92dvh] max-h-[92dvh] w-[min(94vw,900px)] max-w-[900px] flex-col overflow-hidden rounded-[28px] p-0 sm:h-auto sm:max-h-[88dvh]">
          <SurfaceHeader
            title={editingRecordId ? (isEn ? 'Manage livestock state' : '调整缸内物种体态') : (isEn ? 'Tank livestock' : '缸内物种')}
            description={editingRecordId
              ? (isEn ? 'Update one batch at a time, then review and save.' : '按批次调整，确认修改摘要后再保存。')
              : `${aquariumName} · ${visibleRecords.length} ${isEn ? 'species' : '种'} · ${visibleRecords.reduce((sum, item) => sum + item.record.quantity, 0)} ${isEn ? 'animals' : '只/条'}`}
            onClose={() => requestRosterOpenChange(false)}
            actions={(
              editingRecordId ? undefined : (
                <>
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))} aria-label={isEn ? 'Sharing is coming' : '分享功能建设中'} title={isEn ? 'Sharing is coming' : '分享功能建设中'} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-400 shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300">
                  <Share2 className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'image-export' } }))} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 text-xs font-black text-slate-400 shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300">
                  <Download className="h-4 w-4" />{isEn ? 'Export · Coming soon' : '导出 · 建设中'}
                </button>
                </>
              )
            )}
          />
          <div className="app-scrollbar-hidden min-h-0 overflow-y-auto bg-[#FBFAF6] px-4 py-4 md:px-5">
            {!editingRecordId && <section className="mb-4 rounded-[20px] border border-emerald-100 bg-white p-4">
              <div className="flex flex-wrap items-end gap-3">
                <label className="min-w-[190px] flex-1 text-xs font-black text-ink/65">
                  {isEn ? 'Aquarium start date' : '建缸日期'}
                  <input type="date" value={startedAtDraft} max={new Date().toISOString().slice(0, 10)} onChange={event => setStartedAtDraft(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-ink" />
                </label>
                <button
                  type="button"
                  disabled={!startedAtDraft || isSavingStartedAt}
                  onClick={() => {
                    setStartedAtError('');
                    void onConfirmStartedAt(startedAtDraft).catch(error => setStartedAtError(error instanceof Error ? error.message : '日期保存失败，请重试。'));
                  }}
                  className="min-h-11 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white disabled:opacity-50"
                >
                  {isSavingStartedAt ? (isEn ? 'Saving…' : '保存中…') : startedAtConfirmed ? (isEn ? 'Update date' : '修改日期') : (isEn ? 'Confirm date' : '确认日期')}
                </button>
              </div>
              {!startedAtConfirmed && <p className="mt-2 text-xs font-semibold leading-5 text-amber-700">{isEn ? 'This date was inferred from older records. Confirm or edit it before milestone cards are unlocked.' : '该日期由旧记录推算。确认或修改后，才会解锁百日纪念。'}</p>}
              {startedAtError && <p role="alert" className="mt-2 text-xs font-bold text-rose-700">{startedAtError}</p>}
              {startedAtConfirmed && aquariumAgeDays >= 100 && onDownloadMilestone && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-3 py-3 text-amber-900">
                  <div>
                    <div className="text-sm font-black">{isEn ? `My aquarium is ${aquariumAgeDays} days old` : `我的鱼缸养了 ${aquariumAgeDays} 天`}</div>
                    <div className="mt-0.5 text-xs font-semibold opacity-70">{isEn ? 'Milestone cards remain available after day 100.' : '百日之后持续可见，可随时重新生成。'}</div>
                  </div>
                  <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'image-export' } }))} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 text-xs font-black text-slate-400 shadow-none"><Download className="h-4 w-4" />{isEn ? 'Export' : '导出'}</button>
                </div>
              )}
            </section>}
            {displayedRecords.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {displayedRecords.map(({ record, fish }) => (
                  <div key={record.id} className="relative min-w-0">
                    {!editingRecordId && <button
                      type="button"
                      aria-label={isEn ? `Remove ${fish.name} from aquarium` : `将${fish.name}移出鱼缸`}
                      title={isEn ? 'Remove from aquarium' : '移出鱼缸'}
                      onClick={() => beginRemoval(record, fish)}
                      className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-rose-100 bg-white/95 text-rose-600 shadow-sm transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      <X className="h-5 w-5" />
                    </button>}
                    <LivestockBatchCard
                      fish={fish}
                      record={record}
                      reproductiveApplicable={['fish', 'invertebrate', 'reptile'].includes(getLifeType(fish))}
                      isEditing={editingRecordId === record.id}
                      onEditingChange={editing => {
                        setEditingRecordId(editing ? record.id : null);
                        if (!editing) setIsEditingDirty(false);
                      }}
                      onDirtyChange={setIsEditingDirty}
                      onOpenDetail={() => onOpenDetail(fish, record)}
                      onSave={next => onSave(record.id, next)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[22px] border border-dashed border-ink/15 bg-white px-5 text-center">
                <p className="text-base font-black text-ink">鱼缸里还没有生物</p>
                <p className="mt-2 max-w-[30ch] text-xs font-semibold leading-5 text-ink/50">先添加一种生物，之后可以在这里查看数量、体态和入缸批次。</p>
                <button type="button" onClick={onAdd} className="mt-4 min-h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white hover:bg-emerald-800">记录已有生物</button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRosterCloseConfirmOpen} onOpenChange={setIsRosterCloseConfirmOpen}>
        <DialogContent showCloseButton={false} className="w-[min(92vw,440px)] max-w-[440px] rounded-[26px]">
          <DialogHeader>
            <DialogTitle>{isEn ? 'Discard livestock changes?' : '放弃体态修改？'}</DialogTitle>
            <DialogDescription>{isEn ? 'Unsaved quantity and state changes will be lost before the livestock panel closes.' : '关闭缸内物种前，尚未保存的数量和体态调整会丢失。'}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button" onClick={() => setIsRosterCloseConfirmOpen(false)} className="min-h-11 rounded-full border border-border px-4 text-sm font-black">{isEn ? 'Continue editing' : '继续编辑'}</button>
            <button
              type="button"
              onClick={() => {
                setIsRosterCloseConfirmOpen(false);
                setEditingRecordId(null);
                setIsEditingDirty(false);
                onOpenChange(false);
              }}
              className="min-h-11 rounded-full bg-rose-600 px-4 text-sm font-black text-white"
            >
              {isEn ? 'Discard and close' : '放弃并关闭'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(removal)} onOpenChange={next => {
        if (!next && !isRemoving) {
          setRemoval(null);
          setRemoveError('');
        }
      }}>
        <DialogContent showCloseButton={false} data-removal-operation-id={removal?.operationId} className="w-[min(92vw,460px)] max-w-[460px] rounded-[26px]">
          <DialogHeader>
            <DialogTitle>确认移出{removal?.fish.name}</DialogTitle>
            <DialogDescription>请先在现实中完成转缸、可靠送养或退回商家，再更新这里的记录。不要放生。</DialogDescription>
          </DialogHeader>
          {removal && (
            <div className="grid gap-3">
              {batches.length > 1 && <fieldset className="grid gap-2"><legend className="text-xs font-black text-ink/65">从哪一组移出</legend><div className="grid gap-2 sm:grid-cols-2">{batches.map((batch, index) => <button key={batch.id} type="button" aria-pressed={removal.batchId === batch.id} disabled={removal.submitted} onClick={() => setRemoval(current => current ? { ...current, batchId: batch.id, quantity: 1 } : current)} className={`min-h-11 rounded-2xl border px-3 text-left text-xs font-black ${removal.batchId === batch.id ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-ink/60'}`}>第 {index + 1} 组 · {batch.quantity} 只/条</button>)}</div></fieldset>}
              <div className="grid gap-1.5 text-xs font-black text-ink/65"><span>移出数量</span><QuantityStepper label="移出数量" min={1} max={selectedBatch?.quantity ?? 1} disabled={removal.submitted} value={removal.quantity} onChange={quantity => setRemoval(current => current ? { ...current, quantity } : current)} /></div>
              <div className="rounded-2xl bg-amber-50 px-3 py-3 text-xs font-semibold leading-5 text-amber-900">
                <strong>移出前准备：</strong>使用已循环的接收缸或确认可靠接收人；保持水温接近并缓慢过水。移出不是死亡记录，不会进入生命纪念。
              </div>
              {removeError && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{removeError}</p>}
              {removal.submitted && removeError && (
                <p className="text-xs font-semibold leading-5 text-ink/55">重试会核对同一次操作，不会再次扣减。若要修改数量，请先取消并重新发起。</p>
              )}
            </div>
          )}
          <DialogFooter>
            <button type="button" disabled={isRemoving} onClick={() => setRemoval(null)} className="min-h-11 rounded-2xl border border-border px-4 text-sm font-black disabled:opacity-50">暂不移出</button>
            <button type="button" disabled={isRemoving || !Number.isInteger(removal?.quantity)} onClick={() => void confirmRemoval()} className="min-h-11 rounded-2xl bg-rose-600 px-4 text-sm font-black text-white disabled:opacity-60">
              {isRemoving ? '正在更新…' : `确认已移出 ${removal?.quantity ?? 0} 只/条`}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
