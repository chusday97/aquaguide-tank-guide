import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Sprout } from 'lucide-react';
import type { AquariumFish, Fish } from '../../types';
import { normalizeSpeciesBatches, updateSpeciesBatch } from '../../services/aquarium/species-batches.service';
import { QuantityStepper } from '../forms/QuantityStepper';
import { QuickDatePicker } from '../forms/QuickDatePicker';
import { formatSpeciesQuantity } from '../../lib/speciesQuantityUnit';

type Props = {
  fish: Fish;
  record: AquariumFish;
  isEn: boolean;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onSave: (next: AquariumFish) => void | Promise<void>;
};

export function PlantRecordEditor({ fish, record, isEn, onCancel, onDirtyChange, onSave }: Props) {
  const batches = useMemo(() => normalizeSpeciesBatches(record), [record]);
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');
  const selectedBatch = batches.find(batch => batch.id === selectedBatchId) || batches[0];
  const [quantity, setQuantity] = useState(selectedBatch?.quantity || 1);
  const [entryDate, setEntryDate] = useState(selectedBatch?.entryDate.slice(0, 10) || new Date().toISOString().slice(0, 10));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const first = normalizeSpeciesBatches(record)[0];
    setSelectedBatchId(first?.id || '');
    setQuantity(first?.quantity || 1);
    setEntryDate(first?.entryDate.slice(0, 10) || new Date().toISOString().slice(0, 10));
    setError('');
    onDirtyChange?.(false);
  }, [record, onDirtyChange]);

  const chooseBatch = (batchId: string) => {
    const batch = batches.find(item => item.id === batchId);
    if (!batch) return;
    setSelectedBatchId(batch.id);
    setQuantity(batch.quantity);
    setEntryDate(batch.entryDate.slice(0, 10));
    setError('');
    onDirtyChange?.(false);
  };

  const dirty = Boolean(selectedBatch) && (
    quantity !== selectedBatch.quantity || entryDate !== selectedBatch.entryDate.slice(0, 10)
  );

  const save = async () => {
    if (!selectedBatch || !dirty || isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      const next = updateSpeciesBatch(record, selectedBatch.id, {
        quantity,
        entryDate: new Date(`${entryDate}T00:00:00`).toISOString(),
        lifeStage: 'unknown',
        reproductiveState: 'not_applicable',
      });
      await onSave(next);
      onDirtyChange?.(false);
      onCancel();
    } catch {
      setError(isEn ? 'Plant record could not be saved. Try again.' : '水草记录没有保存成功，请重试。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section data-plant-record-editor className="overflow-hidden rounded-[20px] border border-emerald-100 bg-white shadow-sm">
      <header className="border-b border-border bg-white px-4 py-4 md:px-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="mb-3 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-xs font-black text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEn ? 'Back to tank species' : '返回缸内物种'}
        </button>
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Sprout className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-black text-ink">{isEn ? 'Edit plant record' : '修改水草记录'}</h2>
            <p className="mt-1 text-xs font-semibold leading-5 text-ink/52">
              {isEn
                ? 'Update plant quantity and the date this batch was added. Plant records do not use fish life-stage or reproductive fields.'
                : '修改植株数量和加入日期。水草不使用鱼类的体态或繁殖状态。'}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 bg-[#FBFAF6] px-4 py-4 md:px-5">
        {batches.length > 1 && (
          <fieldset className="grid gap-2">
            <legend className="text-xs font-black text-ink/60">{isEn ? 'Planting batch' : '选择批次'}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {batches.map((batch, index) => (
                <button
                  key={batch.id}
                  type="button"
                  aria-pressed={batch.id === selectedBatch?.id}
                  onClick={() => chooseBatch(batch.id)}
                  className={`min-h-12 rounded-2xl border px-3 text-left text-xs font-black ${batch.id === selectedBatch?.id ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-border bg-white text-ink/55'}`}
                >
                  {isEn ? `Batch ${index + 1}` : `第 ${index + 1} 组`} · {formatSpeciesQuantity(fish, batch.quantity, isEn)}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {selectedBatch && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5 text-xs font-black text-ink/60">
              <span>{isEn ? 'Plant quantity' : '植株数量'}</span>
              <QuantityStepper
                label={isEn ? 'Plant quantity' : '植株数量'}
                min={1}
                max={999}
                value={quantity}
                onChange={value => {
                  setQuantity(value);
                  onDirtyChange?.(value !== selectedBatch.quantity || entryDate !== selectedBatch.entryDate.slice(0, 10));
                }}
              />
              <span className="text-[10px] font-semibold text-ink/40">{formatSpeciesQuantity(fish, quantity, isEn)}</span>
            </div>
            <QuickDatePicker
              value={entryDate}
              onChange={value => {
                setEntryDate(value);
                onDirtyChange?.(quantity !== selectedBatch.quantity || value !== selectedBatch.entryDate.slice(0, 10));
              }}
              isEn={isEn}
            />
          </div>
        )}
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
      </div>

      <footer className="flex items-center justify-end gap-2 border-t border-border bg-white px-4 py-3 md:px-5">
        <button type="button" onClick={onCancel} disabled={isSaving} className="min-h-11 rounded-full border border-border px-4 text-sm font-black text-ink/60 disabled:opacity-50">
          {isEn ? 'Cancel' : '取消'}
        </button>
        <button type="button" onClick={() => void save()} disabled={!dirty || isSaving} className="min-h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white disabled:opacity-50">
          {isSaving ? (isEn ? 'Saving…' : '保存中…') : (isEn ? 'Save plant record' : '保存水草记录')}
        </button>
      </footer>
    </section>
  );
}
