import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { AquariumFish, Fish } from '../../types';
import { createLivestockRemovalAttempt, markLivestockRemovalSubmitted } from '../../services/aquarium/livestock-removal-attempt.service';
import { normalizeSpeciesBatches } from '../../services/aquarium/species-batches.service';
import { LivestockBatchCard } from './LivestockBatchCard';
import { SurfaceHeader } from '../common/SurfaceHeader';

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
}: Props) {
  const [removal, setRemoval] = useState<RemovalDraft | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');
  const speciesById = useMemo(() => new Map(species.map(item => [item.id, item])), [species]);
  const visibleRecords = useMemo(() => records
    .map(record => ({ record, fish: speciesById.get(record.fishId) }))
    .filter((item): item is { record: AquariumFish; fish: Fish } => Boolean(item.fish)), [records, speciesById]);

  useEffect(() => {
    if (!removal) return;
    const current = records.find(item => item.id === removal.record.id);
    if (!current) setRemoval(null);
  }, [records, removal]);

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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="flex max-h-[88dvh] w-[min(94vw,900px)] max-w-[900px] flex-col overflow-hidden rounded-[28px] p-0">
          <SurfaceHeader
            title="缸内物种"
            description={`${aquariumName} · ${visibleRecords.length} 种 · 共 ${visibleRecords.reduce((sum, item) => sum + item.record.quantity, 0)} 只/条`}
            onClose={() => onOpenChange(false)}
          />
          <div className="app-scrollbar-hidden min-h-0 overflow-y-auto bg-[#FBFAF6] px-4 py-4 md:px-5">
            {visibleRecords.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {visibleRecords.map(({ record, fish }) => (
                  <div key={record.id} className="relative min-w-0">
                    <button
                      type="button"
                      aria-label={`将${fish.name}移出鱼缸`}
                      title="移出鱼缸"
                      onClick={() => beginRemoval(record, fish)}
                      className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-rose-100 bg-white/95 text-rose-600 shadow-sm transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <LivestockBatchCard
                      fish={fish}
                      record={record}
                      reproductiveApplicable
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
                <button type="button" onClick={onAdd} className="mt-4 min-h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white hover:bg-emerald-800">添加生物</button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(removal)} onOpenChange={next => {
        if (!next && !isRemoving) {
          setRemoval(null);
          setRemoveError('');
        }
      }}>
        <DialogContent data-removal-operation-id={removal?.operationId} className="w-[min(92vw,460px)] max-w-[460px] rounded-[26px]">
          <DialogHeader>
            <DialogTitle>确认移出{removal?.fish.name}</DialogTitle>
            <DialogDescription>请先在现实中完成转缸、可靠送养或退回商家，再更新这里的记录。不要放生。</DialogDescription>
          </DialogHeader>
          {removal && (
            <div className="grid gap-3">
              {batches.length > 1 && (
                <label className="text-xs font-black text-ink/65">
                  从哪一组移出
                  <select
                    value={removal.batchId}
                    disabled={removal.submitted}
                    onChange={event => setRemoval(current => current ? { ...current, batchId: event.target.value, quantity: 1 } : current)}
                    className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-ink"
                  >
                    {batches.map((batch, index) => <option key={batch.id} value={batch.id}>第 {index + 1} 组 · {batch.quantity} 只/条</option>)}
                  </select>
                </label>
              )}
              <label className="text-xs font-black text-ink/65">
                移出数量
                <input
                  type="number"
                  min={1}
                  max={selectedBatch?.quantity ?? 1}
                  step={1}
                  inputMode="numeric"
                  disabled={removal.submitted}
                  value={removal.quantity}
                  onChange={event => setRemoval(current => current ? { ...current, quantity: Number(event.target.value) } : current)}
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-ink"
                />
              </label>
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
