import fs from 'node:fs';

const files = new Map();
const read = path => {
  if (!files.has(path)) files.set(path, fs.readFileSync(path, 'utf8'));
  return files.get(path);
};
const write = (path, content) => files.set(path, content);
const replaceOnce = (source, search, replacement, label) => {
  const first = source.indexOf(search);
  if (first < 0) throw new Error(`${label}: marker not found`);
  if (source.indexOf(search, first + search.length) >= 0) throw new Error(`${label}: marker not unique`);
  return source.slice(0, first) + replacement + source.slice(first + search.length);
};
const replaceCount = (source, search, replacement, expected, label) => {
  const count = source.split(search).length - 1;
  if (count !== expected) throw new Error(`${label}: expected ${expected} occurrences, got ${count}`);
  return source.split(search).join(replacement);
};

// Shared quantity semantics: plants are counted as 株, fish as 条, other animals as 只.
const unitPath = 'src/lib/speciesQuantityUnit.ts';
if (fs.existsSync(unitPath)) throw new Error('speciesQuantityUnit.ts already exists; aborting guarded migration');
fs.writeFileSync(unitPath, `import type { Fish } from '../types';\nimport { getLifeType } from '../modules/species/species.service';\n\nexport const getSpeciesQuantityUnit = (fish: Fish, isEn = false, count = 2) => {\n  const lifeType = getLifeType(fish);\n  if (lifeType === 'plant') return isEn ? (count === 1 ? 'plant' : 'plants') : '株';\n  if (lifeType === 'fish') return isEn ? 'fish' : '条';\n  if (lifeType === 'hardscape') return isEn ? (count === 1 ? 'piece' : 'pieces') : '件';\n  return isEn ? (count === 1 ? 'animal' : 'animals') : '只';\n};\n\nexport const formatSpeciesQuantity = (fish: Fish, count: number, isEn = false) => {\n  const unit = getSpeciesQuantityUnit(fish, isEn, count);\n  return isEn ? \\`${'${count} ${unit}'}\\` : \\`${'${count}${unit}'}\\`;\n};\n`);

// Dedicated plant editor: quantity + planted/added date only; no fish life-stage semantics.
const plantEditorPath = 'src/components/aquarium/PlantRecordEditor.tsx';
if (fs.existsSync(plantEditorPath)) throw new Error('PlantRecordEditor.tsx already exists; aborting guarded migration');
fs.writeFileSync(plantEditorPath, `import { useEffect, useMemo, useState } from 'react';\nimport { ArrowLeft, Sprout } from 'lucide-react';\nimport type { AquariumFish, Fish } from '../../types';\nimport { normalizeSpeciesBatches, updateSpeciesBatch } from '../../services/aquarium/species-batches.service';\nimport { QuantityStepper } from '../forms/QuantityStepper';\nimport { QuickDatePicker } from '../forms/QuickDatePicker';\nimport { formatSpeciesQuantity } from '../../lib/speciesQuantityUnit';\n\ntype Props = {\n  fish: Fish;\n  record: AquariumFish;\n  isEn: boolean;\n  onCancel: () => void;\n  onDirtyChange?: (dirty: boolean) => void;\n  onSave: (next: AquariumFish) => void | Promise<void>;\n};\n\nexport function PlantRecordEditor({ fish, record, isEn, onCancel, onDirtyChange, onSave }: Props) {\n  const batches = useMemo(() => normalizeSpeciesBatches(record), [record]);\n  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');\n  const selectedBatch = batches.find(batch => batch.id === selectedBatchId) || batches[0];\n  const [quantity, setQuantity] = useState(selectedBatch?.quantity || 1);\n  const [entryDate, setEntryDate] = useState(selectedBatch?.entryDate.slice(0, 10) || new Date().toISOString().slice(0, 10));\n  const [isSaving, setIsSaving] = useState(false);\n  const [error, setError] = useState('');\n\n  useEffect(() => {\n    const first = normalizeSpeciesBatches(record)[0];\n    setSelectedBatchId(first?.id || '');\n    setQuantity(first?.quantity || 1);\n    setEntryDate(first?.entryDate.slice(0, 10) || new Date().toISOString().slice(0, 10));\n    setError('');\n    onDirtyChange?.(false);\n  }, [record, onDirtyChange]);\n\n  const chooseBatch = (batchId: string) => {\n    const batch = batches.find(item => item.id === batchId);\n    if (!batch) return;\n    setSelectedBatchId(batch.id);\n    setQuantity(batch.quantity);\n    setEntryDate(batch.entryDate.slice(0, 10));\n    setError('');\n    onDirtyChange?.(false);\n  };\n\n  const dirty = Boolean(selectedBatch) && (quantity !== selectedBatch.quantity || entryDate !== selectedBatch.entryDate.slice(0, 10));\n\n  const save = async () => {\n    if (!selectedBatch || !dirty || isSaving) return;\n    setIsSaving(true);\n    setError('');\n    try {\n      const next = updateSpeciesBatch(record, selectedBatch.id, {\n        quantity,\n        entryDate: new Date(\\`${'${entryDate}T00:00:00'}\\`).toISOString(),\n        lifeStage: 'unknown',\n        reproductiveState: 'not_applicable',\n      });\n      await onSave(next);\n      onDirtyChange?.(false);\n      onCancel();\n    } catch (caught) {\n      setError(isEn ? 'Plant record could not be saved. Try again.' : '水草记录没有保存成功，请重试。');\n    } finally {\n      setIsSaving(false);\n    }\n  };\n\n  return (\n    <section data-plant-record-editor className=\"overflow-hidden rounded-[20px] border border-emerald-100 bg-white shadow-sm\">\n      <header className=\"border-b border-border bg-white px-4 py-4 md:px-5\">\n        <button type=\"button\" onClick={onCancel} disabled={isSaving} className=\"mb-3 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-xs font-black text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50\">\n          <ArrowLeft className=\"h-4 w-4\" />{isEn ? 'Back to tank species' : '返回缸内物种'}\n        </button>\n        <div className=\"flex items-start gap-3\">\n          <span className=\"flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700\"><Sprout className=\"h-6 w-6\" /></span>\n          <div>\n            <h2 className=\"text-lg font-black text-ink\">{isEn ? 'Edit plant record' : '修改水草记录'}</h2>\n            <p className=\"mt-1 text-xs font-semibold leading-5 text-ink/52\">{isEn ? 'Update plant quantity and the date this batch was added. Plant records do not use fish life-stage or reproductive fields.' : '修改植株数量和加入日期。水草不使用鱼类的体态或繁殖状态。'}</p>\n          </div>\n        </div>\n      </header>\n      <div className=\"grid gap-4 bg-[#FBFAF6] px-4 py-4 md:px-5\">\n        {batches.length > 1 && (\n          <fieldset className=\"grid gap-2\">\n            <legend className=\"text-xs font-black text-ink/60\">{isEn ? 'Planting batch' : '选择批次'}</legend>\n            <div className=\"grid gap-2 sm:grid-cols-2\">\n              {batches.map((batch, index) => (\n                <button key={batch.id} type=\"button\" aria-pressed={batch.id === selectedBatch?.id} onClick={() => chooseBatch(batch.id)} className={\\`min-h-12 rounded-2xl border px-3 text-left text-xs font-black ${'${batch.id === selectedBatch?.id ? \'border-emerald-700 bg-emerald-50 text-emerald-900\' : \'border-border bg-white text-ink/55\'}'}\\`}>\n                  {isEn ? \\`Batch ${'${index + 1}'}\\` : \\`第 ${'${index + 1}'} 组\\`} · {formatSpeciesQuantity(fish, batch.quantity, isEn)}\n                </button>\n              ))}\n            </div>\n          </fieldset>\n        )}\n        {selectedBatch && (\n          <div className=\"grid gap-3 sm:grid-cols-2\">\n            <div className=\"grid gap-1.5 text-xs font-black text-ink/60\">\n              <span>{isEn ? 'Plant quantity' : '植株数量'}</span>\n              <QuantityStepper label={isEn ? 'Plant quantity' : '植株数量'} min={1} max={999} value={quantity} onChange={value => { setQuantity(value); onDirtyChange?.(value !== selectedBatch.quantity || entryDate !== selectedBatch.entryDate.slice(0, 10)); }} />\n              <span className=\"text-[10px] font-semibold text-ink/40\">{formatSpeciesQuantity(fish, quantity, isEn)}</span>\n            </div>\n            <QuickDatePicker value={entryDate} onChange={value => { setEntryDate(value); onDirtyChange?.(quantity !== selectedBatch.quantity || value !== selectedBatch.entryDate.slice(0, 10)); }} isEn={isEn} />\n          </div>\n        )}\n        {error && <p role=\"alert\" className=\"rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700\">{error}</p>}\n      </div>\n      <footer className=\"flex items-center justify-end gap-2 border-t border-border bg-white px-4 py-3 md:px-5\">\n        <button type=\"button\" onClick={onCancel} disabled={isSaving} className=\"min-h-11 rounded-full border border-border px-4 text-sm font-black text-ink/60 disabled:opacity-50\">{isEn ? 'Cancel' : '取消'}</button>\n        <button type=\"button\" onClick={() => void save()} disabled={!dirty || isSaving} className=\"min-h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white disabled:opacity-50\">{isSaving ? (isEn ? 'Saving…' : '保存中…') : (isEn ? 'Save plant record' : '保存水草记录')}</button>\n      </footer>\n    </section>\n  );\n}\n`);

// LivestockBatchCard: correct summary unit and plant edit label; plant editing itself is delegated to PlantRecordEditor.
{
  const path = 'src/components/aquarium/LivestockBatchCard.tsx';
  let source = read(path);
  source = replaceOnce(source,
    "import { QuickDatePicker } from '../forms/QuickDatePicker';\n",
    "import { QuickDatePicker } from '../forms/QuickDatePicker';\nimport { getLifeType } from '../../modules/species/species.service';\nimport { formatSpeciesQuantity } from '../../lib/speciesQuantityUnit';\n",
    'LivestockBatchCard imports');
  const summarizeStart = "const summarize = (record: AquariumFish, t: TFunction) => {\n";
  const summarizeEnd = "  return parts.join(' · ');\n};\n";
  const s = source.indexOf(summarizeStart);
  const e = source.indexOf(summarizeEnd, s);
  if (s < 0 || e < 0) throw new Error('LivestockBatchCard summarize block not found');
  const summarizeReplacement = `const summarize = (record: AquariumFish, t: TFunction, fish: Fish, isEn: boolean) => {\n  const summary = summarizeSpeciesBatches(record);\n  const lifeType = getLifeType(fish);\n  const parts = [isEn ? formatSpeciesQuantity(fish, summary.total, true) : \\`共 ${'${formatSpeciesQuantity(fish, summary.total, false)}'}\\`];\n  if (lifeType === 'plant' || lifeType === 'hardscape') return parts.join(' · ');\n  if (summary.juvenile) parts.push(t('livestock.summaryJuvenile', { count: summary.juvenile }));\n  if (summary.adult) parts.push(t('livestock.summaryAdult', { count: summary.adult }));\n  if (summary.pregnant) parts.push(t('livestock.summaryPregnant', { count: summary.pregnant }));\n  if (summary.spawning) parts.push(t('livestock.summarySpawning', { count: summary.spawning }));\n  if (summary.recovery) parts.push(t('livestock.summaryRecovery', { count: summary.recovery }));\n  if (summary.unknown === summary.total) parts.push(t('livestock.summaryUnknown'));\n  return parts.join(' · ');\n};\n`;
  source = source.slice(0, s) + summarizeReplacement + source.slice(e + summarizeEnd.length);
  source = replaceCount(source, 'summarize(record, t)', 'summarize(record, t, fish, isEn)', 2, 'record summary calls');
  source = replaceCount(source, 'summarize(draft, t)', 'summarize(draft, t, fish, isEn)', 1, 'draft summary call');
  source = replaceOnce(source,
    "<Pencil className=\"h-3.5 w-3.5\" />{t('livestock.manageGroups')}",
    "<Pencil className=\"h-3.5 w-3.5\" />{getLifeType(fish) === 'plant' ? (isEn ? 'Edit plant record' : '修改水草记录') : t('livestock.manageGroups')}",
    'plant edit label');
  write(path, source);
}

// Roster: grouped quantity units + direct edit request from species detail + dedicated plant editor.
{
  const path = 'src/components/aquarium/LivestockRosterDialog.tsx';
  let source = read(path);
  source = replaceOnce(source,
    "import { getLifeType } from '../../modules/species/species.service';\n",
    "import { getLifeType } from '../../modules/species/species.service';\nimport { formatSpeciesQuantity, getSpeciesQuantityUnit } from '../../lib/speciesQuantityUnit';\nimport { PlantRecordEditor } from './PlantRecordEditor';\n",
    'roster imports');
  source = replaceOnce(source,
    "  onOpenDetail: (fish: Fish, record: AquariumFish) => void;\n",
    "  onOpenDetail: (fish: Fish, record: AquariumFish) => void;\n  editRecordRequestId?: string | null;\n  onEditRecordRequestHandled?: () => void;\n",
    'roster prop type');
  source = replaceOnce(source,
    "  onOpenDetail,\n  onSave,\n",
    "  onOpenDetail,\n  editRecordRequestId = null,\n  onEditRecordRequestHandled,\n  onSave,\n",
    'roster destructuring');
  source = replaceOnce(source,
    "  const displayedRecords = editingRecordId\n    ? visibleRecords.filter(item => item.record.id === editingRecordId)\n    : visibleRecords;\n",
    "  const displayedRecords = editingRecordId\n    ? visibleRecords.filter(item => item.record.id === editingRecordId)\n    : visibleRecords;\n  const editingItem = editingRecordId ? visibleRecords.find(item => item.record.id === editingRecordId) : undefined;\n  const editingPlant = editingItem ? getLifeType(editingItem.fish) === 'plant' : false;\n  const quantitySummary = useMemo(() => {\n    const counts = new Map<string, number>();\n    visibleRecords.forEach(({ record, fish }) => {\n      const unit = getSpeciesQuantityUnit(fish, isEn, record.quantity);\n      counts.set(unit, (counts.get(unit) || 0) + record.quantity);\n    });\n    return Array.from(counts.entries()).map(([unit, count]) => isEn ? \\`${'${count} ${unit}'}\\` : \\`${'${count}${unit}'}\\`).join(' · ');\n  }, [isEn, visibleRecords]);\n",
    'roster derived state');
  source = replaceOnce(source,
    "  useEffect(() => setStartedAtDraft(startedAt || ''), [startedAt]);\n",
    "  useEffect(() => setStartedAtDraft(startedAt || ''), [startedAt]);\n  useEffect(() => {\n    if (!open || !editRecordRequestId) return;\n    if (!visibleRecords.some(item => item.record.id === editRecordRequestId)) return;\n    pendingDetailReturnRef.current = null;\n    setDetailReturnContext(null);\n    setEditingRecordId(editRecordRequestId);\n    setIsEditingDirty(false);\n    onEditRecordRequestHandled?.();\n  }, [editRecordRequestId, onEditRecordRequestHandled, open, visibleRecords]);\n",
    'roster direct edit effect');
  source = replaceOnce(source,
    "            title={editingRecordId ? (isEn ? 'Manage livestock state' : '调整缸内物种体态') : (isEn ? 'Tank livestock' : '缸内物种')}\n            description={editingRecordId\n              ? (isEn ? 'Update one batch at a time, then review and save.' : '按批次调整，确认修改摘要后再保存。')\n              : `${aquariumName} · ${visibleRecords.length} ${isEn ? 'species' : '种'} · ${visibleRecords.reduce((sum, item) => sum + item.record.quantity, 0)} ${isEn ? 'animals' : '只/条'}`}\n",
    "            title={editingRecordId ? (editingPlant ? (isEn ? 'Edit plant record' : '修改水草记录') : (isEn ? 'Manage livestock state' : '调整缸内物种体态')) : (isEn ? 'Tank livestock' : '缸内物种')}\n            description={editingRecordId\n              ? (editingPlant ? (isEn ? 'Update plant quantity and added date.' : '修改植株数量和加入日期。') : (isEn ? 'Update one batch at a time, then review and save.' : '按批次调整，确认修改摘要后再保存。'))\n              : `${aquariumName} · ${visibleRecords.length} ${isEn ? 'species' : '种'}${quantitySummary ? ` · ${quantitySummary}` : ''}`}\n",
    'roster header semantics');
  const cardBlock = `                    <LivestockBatchCard\n                      fish={fish}\n                      record={record}\n                      reproductiveApplicable={['fish', 'invertebrate', 'reptile'].includes(getLifeType(fish))}\n                      isEditing={editingRecordId === record.id}\n                      onEditingChange={editing => {\n                        setEditingRecordId(editing ? record.id : null);\n                        if (!editing) setIsEditingDirty(false);\n                      }}\n                      onDirtyChange={setIsEditingDirty}\n                      onOpenDetail={() => openDetailFromRoster(fish, record)}\n                      onSave={next => onSave(record.id, next)}\n                    />`;
  const cardReplacement = `                    {editingRecordId === record.id && getLifeType(fish) === 'plant' ? (\n                      <PlantRecordEditor\n                        fish={fish}\n                        record={record}\n                        isEn={isEn}\n                        onCancel={() => { setEditingRecordId(null); setIsEditingDirty(false); }}\n                        onDirtyChange={setIsEditingDirty}\n                        onSave={next => onSave(record.id, next)}\n                      />\n                    ) : (\n                      <LivestockBatchCard\n                        fish={fish}\n                        record={record}\n                        reproductiveApplicable={['fish', 'invertebrate', 'reptile'].includes(getLifeType(fish))}\n                        isEditing={editingRecordId === record.id}\n                        onEditingChange={editing => {\n                          setEditingRecordId(editing ? record.id : null);\n                          if (!editing) setIsEditingDirty(false);\n                        }}\n                        onDirtyChange={setIsEditingDirty}\n                        onOpenDetail={() => openDetailFromRoster(fish, record)}\n                        onSave={next => onSave(record.id, next)}\n                      />\n                    )}`;
  source = replaceOnce(source, cardBlock, cardReplacement, 'roster plant editor switch');
  source = replaceOnce(source,
    "第 {index + 1} 组 · {batch.quantity} 只/条",
    "第 {index + 1} 组 · {removal ? formatSpeciesQuantity(removal.fish, batch.quantity, false) : batch.quantity}",
    'removal batch unit');
  source = replaceOnce(source,
    "{isRemoving ? '正在更新…' : `确认已移出 ${removal?.quantity ?? 0} 只/条`}",
    "{isRemoving ? '正在更新…' : removal ? `确认已移出 ${formatSpeciesQuantity(removal.fish, removal.quantity, false)}` : '确认移出'}",
    'removal confirm unit');
  write(path, source);
}

// Species detail: expose an explicit edit-record entry for owned aquarium species.
{
  const path = 'src/components/SpeciesDetailDialogBase.tsx';
  let source = read(path);
  source = replaceOnce(source,
    "  onViewInTank?: () => void;\n  onOpenTankSettings?: (panel: 'size' | 'parameters' | 'equipment') => void;\n",
    "  onViewInTank?: () => void;\n  onEditInTank?: () => void;\n  onOpenTankSettings?: (panel: 'size' | 'parameters' | 'equipment') => void;\n",
    'species detail prop type');
  source = replaceOnce(source,
    "  onViewInTank,\n  onOpenTankSettings,\n",
    "  onViewInTank,\n  onEditInTank,\n  onOpenTankSettings,\n",
    'species detail destructuring');
  source = replaceOnce(source,
    "              <div className=\"modalFooter shrink-0 border-t border-border bg-white/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 min-[760px]:px-6\">\n                <Button className=\"min-h-12 w-full rounded-full bg-accent px-4 text-sm font-black text-white hover:bg-accent/90 min-[760px]:text-base\" onClick={handleMainAction}>{mainActionLabel}</Button>\n              </div>\n",
    "              <div className=\"modalFooter shrink-0 border-t border-border bg-white/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 min-[760px]:px-6\">\n                <div className=\"grid gap-2 sm:grid-cols-2\">\n                  {source === 'aquarium' && owned && onEditInTank && (\n                    <Button data-species-detail-edit-tank-record type=\"button\" variant=\"outline\" className=\"min-h-12 w-full rounded-full border-emerald-200 bg-white px-4 text-sm font-black text-emerald-800 hover:bg-emerald-50 min-[760px]:text-base\" onClick={onEditInTank}>\n                      <SlidersHorizontal className=\"mr-2 h-4 w-4\" />\n                      {getLifeType(fish) === 'plant' ? (isEn ? 'Edit plant record' : '修改水草记录') : (isEn ? 'Edit tank record' : '修改缸内记录')}\n                    </Button>\n                  )}\n                  <Button className=\"min-h-12 w-full rounded-full bg-accent px-4 text-sm font-black text-white hover:bg-accent/90 min-[760px]:text-base\" onClick={handleMainAction}>{mainActionLabel}</Button>\n                </div>\n              </div>\n",
    'species detail footer');
  write(path, source);
}

// Aquarium: route detail edit action back into the exact roster record editor.
{
  const path = 'src/pages/Aquarium.tsx';
  let source = read(path);
  source = replaceOnce(source,
    "  const [selectedAqFish, setSelectedAqFish] = useState<{fish: Fish, aqFish: AquariumFish} | null>(null);\n",
    "  const [selectedAqFish, setSelectedAqFish] = useState<{fish: Fish, aqFish: AquariumFish} | null>(null);\n  const [livestockEditRequestId, setLivestockEditRequestId] = useState<string | null>(null);\n",
    'Aquarium edit request state');
  source = replaceOnce(source,
    "        onToggleWishlist={toggleWishlist}\n        onGoCalculator={() => {\n",
    "        onToggleWishlist={toggleWishlist}\n        onEditInTank={() => {\n          if (!selectedAqFish) return;\n          const recordId = selectedAqFish.aqFish.id;\n          closeAquariumSpeciesDetail(false);\n          setLivestockEditRequestId(recordId);\n          setIsTankArchiveExpanded(true);\n        }}\n        onGoCalculator={() => {\n",
    'Aquarium detail edit handler');
  source = replaceOnce(source,
    "        onOpenDetail={(fish, record) => {\n          setIsTankArchiveExpanded(false);\n          openAquariumSpeciesDetail(fish, record, 'aquarium-records');\n        }}\n        onSave={saveLivestockBatches}\n",
    "        onOpenDetail={(fish, record) => {\n          setIsTankArchiveExpanded(false);\n          openAquariumSpeciesDetail(fish, record, 'aquarium-records');\n        }}\n        editRecordRequestId={livestockEditRequestId}\n        onEditRecordRequestHandled={() => setLivestockEditRequestId(null)}\n        onSave={saveLivestockBatches}\n",
    'Aquarium roster edit request props');
  write(path, source);
}

// Permanent static contract for this badcase.
const contractPath = 'scripts/test-plant-livestock-edit-contract.mjs';
if (fs.existsSync(contractPath)) throw new Error('plant roster contract already exists; aborting guarded migration');
fs.writeFileSync(contractPath, `import fs from 'node:fs';\n\nconst roster = fs.readFileSync('src/components/aquarium/LivestockRosterDialog.tsx', 'utf8');\nconst card = fs.readFileSync('src/components/aquarium/LivestockBatchCard.tsx', 'utf8');\nconst plantEditor = fs.readFileSync('src/components/aquarium/PlantRecordEditor.tsx', 'utf8');\nconst detail = fs.readFileSync('src/components/SpeciesDetailDialogBase.tsx', 'utf8');\nconst aquarium = fs.readFileSync('src/pages/Aquarium.tsx', 'utf8');\nconst unit = fs.readFileSync('src/lib/speciesQuantityUnit.ts', 'utf8');\n\nconst assert = (condition, message) => { if (!condition) throw new Error('Plant livestock contract failed: ' + message); };\nassert(unit.includes("lifeType === 'plant'") && unit.includes("'株'"), 'plant quantity must use 株');\nassert(card.includes("getLifeType(fish) === 'plant'") && card.includes('修改水草记录'), 'plant roster card must expose a plant-specific edit action');\nassert(roster.includes('PlantRecordEditor') && roster.includes('quantitySummary'), 'roster must use the plant editor and unit-aware summary');\nassert(plantEditor.includes('data-plant-record-editor') && plantEditor.includes('max={999}') && plantEditor.includes("reproductiveState: 'not_applicable'"), 'plant editor must support direct quantity/date edits without fish reproductive semantics');\nassert(detail.includes('data-species-detail-edit-tank-record') && detail.includes('onEditInTank'), 'owned species detail must expose a tank-record edit entry');\nassert(aquarium.includes('editRecordRequestId={livestockEditRequestId}') && aquarium.includes('setIsTankArchiveExpanded(true)'), 'detail edit must reopen the exact roster editor');\nconsole.log('Plant livestock edit contract: PASS');\n`);

for (const [path, content] of files) fs.writeFileSync(path, content);

console.log('Plant roster unit + detail edit migration applied safely.');
