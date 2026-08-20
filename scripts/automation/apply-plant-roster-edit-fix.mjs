import fs from 'node:fs';

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

const updateFile = (path, mutate) => {
  const before = fs.readFileSync(path, 'utf8');
  const after = mutate(before);
  if (after === before) throw new Error(`${path}: no changes produced`);
  fs.writeFileSync(path, after);
};

updateFile('src/components/aquarium/LivestockBatchCard.tsx', source => {
  source = replaceOnce(
    source,
    "import { QuickDatePicker } from '../forms/QuickDatePicker';\n",
    "import { QuickDatePicker } from '../forms/QuickDatePicker';\nimport { getLifeType } from '../../modules/species/species.service';\nimport { formatSpeciesQuantity } from '../../lib/speciesQuantityUnit';\n",
    'LivestockBatchCard imports',
  );

  const start = source.indexOf("const summarize = (record: AquariumFish, t: TFunction) => {\n");
  const endMarker = "  return parts.join(' · ');\n};\n";
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error('LivestockBatchCard summarize block not found');

  const replacement = [
    "const summarize = (record: AquariumFish, t: TFunction, fish: Fish, isEn: boolean) => {",
    "  const summary = summarizeSpeciesBatches(record);",
    "  const lifeType = getLifeType(fish);",
    "  const parts = [isEn ? formatSpeciesQuantity(fish, summary.total, true) : '共 ' + formatSpeciesQuantity(fish, summary.total, false)];",
    "  if (lifeType === 'plant' || lifeType === 'hardscape') return parts.join(' · ');",
    "  if (summary.juvenile) parts.push(t('livestock.summaryJuvenile', { count: summary.juvenile }));",
    "  if (summary.adult) parts.push(t('livestock.summaryAdult', { count: summary.adult }));",
    "  if (summary.pregnant) parts.push(t('livestock.summaryPregnant', { count: summary.pregnant }));",
    "  if (summary.spawning) parts.push(t('livestock.summarySpawning', { count: summary.spawning }));",
    "  if (summary.recovery) parts.push(t('livestock.summaryRecovery', { count: summary.recovery }));",
    "  if (summary.unknown === summary.total) parts.push(t('livestock.summaryUnknown'));",
    "  return parts.join(' · ');",
    "};",
    "",
  ].join('\n');

  source = source.slice(0, start) + replacement + source.slice(end + endMarker.length);
  source = replaceCount(source, 'summarize(record, t)', 'summarize(record, t, fish, isEn)', 2, 'record summary calls');
  source = replaceCount(source, 'summarize(draft, t)', 'summarize(draft, t, fish, isEn)', 1, 'draft summary call');
  source = replaceOnce(
    source,
    "<Pencil className=\"h-3.5 w-3.5\" />{t('livestock.manageGroups')}",
    "<Pencil className=\"h-3.5 w-3.5\" />{getLifeType(fish) === 'plant' ? (isEn ? 'Edit plant record' : '修改水草记录') : t('livestock.manageGroups')}",
    'plant edit label',
  );
  return source;
});

updateFile('src/components/aquarium/LivestockRosterDialog.tsx', source => {
  source = replaceOnce(
    source,
    "import { getLifeType } from '../../modules/species/species.service';\n",
    "import { getLifeType } from '../../modules/species/species.service';\nimport { formatSpeciesQuantity, getSpeciesQuantityUnit } from '../../lib/speciesQuantityUnit';\nimport { PlantRecordEditor } from './PlantRecordEditor';\n",
    'roster imports',
  );
  source = replaceOnce(
    source,
    "  onOpenDetail: (fish: Fish, record: AquariumFish) => void;\n",
    "  onOpenDetail: (fish: Fish, record: AquariumFish) => void;\n  editRecordRequestId?: string | null;\n  onEditRecordRequestHandled?: () => void;\n",
    'roster prop type',
  );
  source = replaceOnce(
    source,
    "  onOpenDetail,\n  onSave,\n",
    "  onOpenDetail,\n  editRecordRequestId = null,\n  onEditRecordRequestHandled,\n  onSave,\n",
    'roster destructuring',
  );
  source = replaceOnce(
    source,
    "  const displayedRecords = editingRecordId\n    ? visibleRecords.filter(item => item.record.id === editingRecordId)\n    : visibleRecords;\n",
    [
      "  const displayedRecords = editingRecordId",
      "    ? visibleRecords.filter(item => item.record.id === editingRecordId)",
      "    : visibleRecords;",
      "  const editingItem = editingRecordId ? visibleRecords.find(item => item.record.id === editingRecordId) : undefined;",
      "  const editingPlant = editingItem ? getLifeType(editingItem.fish) === 'plant' : false;",
      "  const quantitySummary = useMemo(() => {",
      "    const counts = new Map<string, number>();",
      "    visibleRecords.forEach(({ record, fish }) => {",
      "      const unit = getSpeciesQuantityUnit(fish, isEn, record.quantity);",
      "      counts.set(unit, (counts.get(unit) || 0) + record.quantity);",
      "    });",
      "    return Array.from(counts.entries())",
      "      .map(([unit, count]) => isEn ? String(count) + ' ' + unit : String(count) + unit)",
      "      .join(' · ');",
      "  }, [isEn, visibleRecords]);",
      "",
    ].join('\n'),
    'roster derived state',
  );
  source = replaceOnce(
    source,
    "  useEffect(() => setStartedAtDraft(startedAt || ''), [startedAt]);\n",
    [
      "  useEffect(() => setStartedAtDraft(startedAt || ''), [startedAt]);",
      "  useEffect(() => {",
      "    if (!open || !editRecordRequestId) return;",
      "    if (!visibleRecords.some(item => item.record.id === editRecordRequestId)) return;",
      "    pendingDetailReturnRef.current = null;",
      "    setDetailReturnContext(null);",
      "    setEditingRecordId(editRecordRequestId);",
      "    setIsEditingDirty(false);",
      "    onEditRecordRequestHandled?.();",
      "  }, [editRecordRequestId, onEditRecordRequestHandled, open, visibleRecords]);",
      "",
    ].join('\n'),
    'roster direct edit effect',
  );
  source = replaceOnce(
    source,
    "            title={editingRecordId ? (isEn ? 'Manage livestock state' : '调整缸内物种体态') : (isEn ? 'Tank livestock' : '缸内物种')}\n            description={editingRecordId\n              ? (isEn ? 'Update one batch at a time, then review and save.' : '按批次调整，确认修改摘要后再保存。')\n              : `${aquariumName} · ${visibleRecords.length} ${isEn ? 'species' : '种'} · ${visibleRecords.reduce((sum, item) => sum + item.record.quantity, 0)} ${isEn ? 'animals' : '只/条'}`}\n",
    [
      "            title={editingRecordId ? (editingPlant ? (isEn ? 'Edit plant record' : '修改水草记录') : (isEn ? 'Manage livestock state' : '调整缸内物种体态')) : (isEn ? 'Tank livestock' : '缸内物种')}",
      "            description={editingRecordId",
      "              ? (editingPlant ? (isEn ? 'Update plant quantity and added date.' : '修改植株数量和加入日期。') : (isEn ? 'Update one batch at a time, then review and save.' : '按批次调整，确认修改摘要后再保存。'))",
      "              : [aquariumName, String(visibleRecords.length) + (isEn ? ' species' : '种'), quantitySummary].filter(Boolean).join(' · ')}",
    ].join('\n') + '\n',
    'roster header semantics',
  );

  const cardBlock = [
    "                    <LivestockBatchCard",
    "                      fish={fish}",
    "                      record={record}",
    "                      reproductiveApplicable={['fish', 'invertebrate', 'reptile'].includes(getLifeType(fish))}",
    "                      isEditing={editingRecordId === record.id}",
    "                      onEditingChange={editing => {",
    "                        setEditingRecordId(editing ? record.id : null);",
    "                        if (!editing) setIsEditingDirty(false);",
    "                      }}",
    "                      onDirtyChange={setIsEditingDirty}",
    "                      onOpenDetail={() => openDetailFromRoster(fish, record)}",
    "                      onSave={next => onSave(record.id, next)}",
    "                    />",
  ].join('\n');
  const cardReplacement = [
    "                    {editingRecordId === record.id && getLifeType(fish) === 'plant' ? (",
    "                      <PlantRecordEditor",
    "                        fish={fish}",
    "                        record={record}",
    "                        isEn={isEn}",
    "                        onCancel={() => { setEditingRecordId(null); setIsEditingDirty(false); }}",
    "                        onDirtyChange={setIsEditingDirty}",
    "                        onSave={next => onSave(record.id, next)}",
    "                      />",
    "                    ) : (",
    cardBlock.trimStart(),
    "                    )}",
  ].join('\n');
  source = replaceOnce(source, cardBlock, cardReplacement, 'roster plant editor switch');
  source = replaceOnce(
    source,
    "第 {index + 1} 组 · {batch.quantity} 只/条",
    "第 {index + 1} 组 · {removal ? formatSpeciesQuantity(removal.fish, batch.quantity, false) : batch.quantity}",
    'removal batch unit',
  );
  source = replaceOnce(
    source,
    "{isRemoving ? '正在更新…' : `确认已移出 ${removal?.quantity ?? 0} 只/条`}",
    "{isRemoving ? '正在更新…' : removal ? '确认已移出 ' + formatSpeciesQuantity(removal.fish, removal.quantity, false) : '确认移出'}",
    'removal confirm unit',
  );
  return source;
});

updateFile('src/components/SpeciesDetailDialogBase.tsx', source => {
  source = replaceOnce(
    source,
    "  onViewInTank?: () => void;\n  onOpenTankSettings?: (panel: 'size' | 'parameters' | 'equipment') => void;\n",
    "  onViewInTank?: () => void;\n  onEditInTank?: () => void;\n  onOpenTankSettings?: (panel: 'size' | 'parameters' | 'equipment') => void;\n",
    'species detail prop type',
  );
  source = replaceOnce(
    source,
    "  onViewInTank,\n  onOpenTankSettings,\n",
    "  onViewInTank,\n  onEditInTank,\n  onOpenTankSettings,\n",
    'species detail destructuring',
  );
  source = replaceOnce(
    source,
    "              <div className=\"modalFooter shrink-0 border-t border-border bg-white/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 min-[760px]:px-6\">\n                <Button className=\"min-h-12 w-full rounded-full bg-accent px-4 text-sm font-black text-white hover:bg-accent/90 min-[760px]:text-base\" onClick={handleMainAction}>{mainActionLabel}</Button>\n              </div>\n",
    [
      "              <div className=\"modalFooter shrink-0 border-t border-border bg-white/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 min-[760px]:px-6\">",
      "                <div className=\"grid gap-2 sm:grid-cols-2\">",
      "                  {source === 'aquarium' && owned && onEditInTank && (",
      "                    <Button data-species-detail-edit-tank-record type=\"button\" variant=\"outline\" className=\"min-h-12 w-full rounded-full border-emerald-200 bg-white px-4 text-sm font-black text-emerald-800 hover:bg-emerald-50 min-[760px]:text-base\" onClick={onEditInTank}>",
      "                      <SlidersHorizontal className=\"mr-2 h-4 w-4\" />",
      "                      {getLifeType(fish) === 'plant' ? (isEn ? 'Edit plant record' : '修改水草记录') : (isEn ? 'Edit tank record' : '修改缸内记录')}",
      "                    </Button>",
      "                  )}",
      "                  <Button className=\"min-h-12 w-full rounded-full bg-accent px-4 text-sm font-black text-white hover:bg-accent/90 min-[760px]:text-base\" onClick={handleMainAction}>{mainActionLabel}</Button>",
      "                </div>",
      "              </div>",
      "",
    ].join('\n'),
    'species detail footer',
  );
  return source;
});

updateFile('src/pages/Aquarium.tsx', source => {
  source = replaceOnce(
    source,
    "  const [selectedAqFish, setSelectedAqFish] = useState<{fish: Fish, aqFish: AquariumFish} | null>(null);\n",
    "  const [selectedAqFish, setSelectedAqFish] = useState<{fish: Fish, aqFish: AquariumFish} | null>(null);\n  const [livestockEditRequestId, setLivestockEditRequestId] = useState<string | null>(null);\n",
    'Aquarium edit request state',
  );
  source = replaceOnce(
    source,
    "        onToggleWishlist={toggleWishlist}\n        onGoCalculator={() => {\n",
    [
      "        onToggleWishlist={toggleWishlist}",
      "        onEditInTank={() => {",
      "          if (!selectedAqFish) return;",
      "          const recordId = selectedAqFish.aqFish.id;",
      "          closeAquariumSpeciesDetail(false);",
      "          setLivestockEditRequestId(recordId);",
      "          setIsTankArchiveExpanded(true);",
      "        }}",
      "        onGoCalculator={() => {",
    ].join('\n') + '\n',
    'Aquarium detail edit handler',
  );
  source = replaceOnce(
    source,
    "        onOpenDetail={(fish, record) => {\n          setIsTankArchiveExpanded(false);\n          openAquariumSpeciesDetail(fish, record, 'aquarium-records');\n        }}\n        onSave={saveLivestockBatches}\n",
    [
      "        onOpenDetail={(fish, record) => {",
      "          setIsTankArchiveExpanded(false);",
      "          openAquariumSpeciesDetail(fish, record, 'aquarium-records');",
      "        }}",
      "        editRecordRequestId={livestockEditRequestId}",
      "        onEditRecordRequestHandled={() => setLivestockEditRequestId(null)}",
      "        onSave={saveLivestockBatches}",
    ].join('\n') + '\n',
    'Aquarium roster edit request props',
  );
  return source;
});

console.log('Plant roster unit + detail edit migration applied safely.');
