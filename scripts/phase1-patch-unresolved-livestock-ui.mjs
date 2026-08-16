import { readFile, writeFile } from 'node:fs/promises';

const replaceOnce = (source, search, replacement, label) => {
  const count = source.split(search).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  return source.replace(search, replacement);
};

const replaceRegexOnce = (source, regex, replacement, label) => {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const matches = source.match(new RegExp(regex.source, flags)) || [];
  if (matches.length !== 1) throw new Error(`${label}: expected exactly one regex match, found ${matches.length}`);
  return source.replace(regex, replacement);
};

const patch = async (path, transform) => {
  const source = await readFile(path, 'utf8');
  const next = transform(source);
  if (next === source) throw new Error(`${path}: patch made no change`);
  await writeFile(path, next, 'utf8');
  console.log(`patched ${path}`);
};

await patch('src/pages/Aquarium.tsx', source => {
  let next = replaceOnce(
    source,
    `  recordExistingLivestock,
  type RecordExistingResult,
} from '../services/aquarium/livestock-recording.service';
`,
    `  recordExistingLivestock,
  type ExistingLivestockRecordItem,
  type RecordExistingResult,
} from '../services/aquarium/livestock-recording.service';
`,
    'Aquarium unresolved item import',
  );

  next = replaceOnce(
    next,
    `  const [fishSearchTerm, setFishSearchTerm] = useState('');
  const [addFishCategory, setAddFishCategory] = useState<'all' | 'fish' | 'shrimp' | 'snail' | 'crab' | 'plant' | 'coral' | 'other'>('all');
`,
    `  const [fishSearchTerm, setFishSearchTerm] = useState('');
  const [unresolvedLivestockQuantity, setUnresolvedLivestockQuantity] = useState(1);
  const [addFishCategory, setAddFishCategory] = useState<'all' | 'fish' | 'shrimp' | 'snail' | 'crab' | 'plant' | 'coral' | 'other'>('all');
`,
    'Aquarium unresolved quantity state',
  );

  next = replaceOnce(
    next,
    `    setAddFishCompatibilityReview(null);
    setFishSearchTerm('');
    setAddFishCategory('all');
`,
    `    setAddFishCompatibilityReview(null);
    setFishSearchTerm('');
    setUnresolvedLivestockQuantity(1);
    setAddFishCategory('all');
`,
    'open species addition reset',
  );

  next = replaceOnce(
    next,
    `    after.fishes.forEach(record => {
      const speciesName = fishData.find(item => item.id === record.fishId)?.name || '缸内生物';
      (record.batches || []).filter(batch => !previousBatchIds.has(batch.id)).forEach(batch => {
        operations.push(persistCareTimelineEvent({
          aquariumId: after.id,
          eventType: 'species_added',
          title: isEn ? \`Added \${speciesName}\` : \`加入\${speciesName}\`,
          label: isEn ? \`\${batch.quantity} animals\` : \`\${batch.quantity} 只/条\`,
          payload: { speciesId: record.fishId, quantity: batch.quantity },
`,
    `    after.fishes.forEach(record => {
      const isUnresolved = record.identityStatus === 'unresolved';
      const speciesName = isUnresolved
        ? (record.rawName?.trim() || (isEn ? 'Unresolved livestock' : '未确认生物'))
        : (fishData.find(item => item.id === record.fishId)?.name || '缸内生物');
      (record.batches || []).filter(batch => !previousBatchIds.has(batch.id)).forEach(batch => {
        operations.push(persistCareTimelineEvent({
          aquariumId: after.id,
          eventType: 'species_added',
          title: isEn ? \`Added \${speciesName}\` : \`加入\${speciesName}\`,
          label: isEn ? \`\${batch.quantity} animals\` : \`\${batch.quantity} 只/条\`,
          payload: isUnresolved
            ? { identityStatus: 'unresolved', rawName: record.rawName, quantity: batch.quantity }
            : { identityStatus: 'verified', speciesId: record.fishId, quantity: batch.quantity },
`,
    'truthful unresolved timeline payload',
  );

  next = replaceOnce(
    next,
    `  const recordSelectedFishItems = async (normalizedItems: SpeciesAdditionItem[]) => {
`,
    `  const recordSelectedFishItems = async (normalizedItems: ExistingLivestockRecordItem[]) => {
`,
    'recordSelectedFishItems union input',
  );

  next = replaceOnce(
    next,
    `      showToast(result.failedItems.length > 0
        ? \`已记录 \${result.savedItems.length} 项，\${result.failedItems.length} 项需要重试\`
        : (isEn ? 'Livestock recorded. Risk guidance is ready.' : '已记录缸内生物，并生成风险提示'));
`,
    `      showToast(result.failedItems.length > 0
        ? \`已记录 \${result.savedItems.length} 项，\${result.failedItems.length} 项需要重试\`
        : result.assessmentFailure
          ? (isEn ? 'Livestock recorded. Identity confirmation is still needed.' : '已按现实情况记录；身份确认前完整混养判断暂不可用。')
          : (isEn ? 'Livestock recorded. Risk guidance is ready.' : '已记录缸内生物，并生成风险提示'));
`,
    'unresolved save toast',
  );

  next = replaceOnce(
    next,
    `  const handleAddFish = async () => {
`,
    `  const handleRecordUnresolvedExistingLivestock = async () => {
    const rawName = fishSearchTerm.trim();
    if (additionIntent !== 'record_existing' || !activeAquarium || !rawName || isAddFishSaving) return;
    const saved = await recordSelectedFishItems([{
      identityStatus: 'unresolved',
      rawName,
      quantity: Math.max(1, Math.min(100000, Math.round(unresolvedLivestockQuantity || 1))),
      entryDate: format(new Date(), 'yyyy-MM-dd'),
    }]);
    if (saved) setUnresolvedLivestockQuantity(1);
  };

  const handleAddFish = async () => {
`,
    'manual unresolved record handler',
  );

  next = replaceOnce(
    next,
    `                if (!open) {
                  setFishSearchTerm('');
                  setAddFishCategory('all');
`,
    `                if (!open) {
                  setFishSearchTerm('');
                  setUnresolvedLivestockQuantity(1);
                  setAddFishCategory('all');
`,
    'dialog close unresolved reset',
  );

  next = replaceOnce(
    next,
    `                  {fishSearchTerm.trim() && searchResults.length === 0 && (
                    <div className="rounded-[14px] bg-bg px-3 py-5 text-center text-xs font-medium text-ink/50">{isEn ? 'No species found' : '没有找到相关生物'}</div>
                  )}
`,
    `                  {fishSearchTerm.trim() && searchResults.length === 0 && (
                    additionIntent === 'record_existing' ? (
                      <div data-unresolved-record-entry="true" className="grid gap-3 rounded-[16px] border border-sky-100 bg-sky-50 p-3 text-left">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="inline-flex rounded-full bg-white px-2 py-1 text-[10px] font-black text-sky-700">{isEn ? 'Identity pending' : '待确认身份'}</span>
                            <div className="mt-2 break-words text-sm font-black text-ink">{fishSearchTerm.trim()}</div>
                          </div>
                          <label className="w-24 shrink-0 text-[10px] font-black text-ink/55">
                            {isEn ? 'Quantity' : '数量'}
                            <Input
                              aria-label={isEn ? 'Unresolved livestock quantity' : '未确认生物数量'}
                              type="number"
                              min={1}
                              max={100000}
                              value={unresolvedLivestockQuantity}
                              onChange={event => setUnresolvedLivestockQuantity(Math.max(1, Math.min(100000, Math.round(Number(event.target.value) || 1))))}
                              className="mt-1 h-9 rounded-[12px] bg-white text-center text-sm font-black"
                            />
                          </label>
                        </div>
                        <p className="text-[11px] font-medium leading-relaxed text-sky-900/72">
                          {isEn
                            ? 'Save this as a real tank fact. Until the identity is confirmed, it will not be used for a complete compatibility verdict.'
                            : '可以先按现实名称保存。身份确认前不会用于完整混养判断，也不会伪造物种资料。'}
                        </p>
                        <Button
                          type="button"
                          disabled={isAddFishSaving || !fishSearchTerm.trim()}
                          onClick={() => { void handleRecordUnresolvedExistingLivestock(); }}
                          className="h-10 rounded-full bg-sky-700 text-xs font-black text-white hover:bg-sky-800"
                        >
                          {isAddFishSaving ? (isEn ? 'Saving…' : '保存中…') : (isEn ? 'Record this name' : '按此名称记录')}
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-[14px] bg-bg px-3 py-5 text-center text-xs font-medium leading-relaxed text-ink/50">
                        {isEn ? 'No catalog species found. Planned additions require a catalog species; try another name or scientific name.' : '没有找到已收录生物。规划模式只接受已收录生物，请尝试其他名称或学名。'}
                      </div>
                    )
                  )}
`,
    'intent-scoped no-result UI',
  );

  return next;
});

await patch('src/components/aquarium/LivestockRosterDialog.tsx', source => {
  let next = replaceOnce(
    source,
    `type RemovalDraft = {
  record: AquariumFish;
  fish: Fish;
  batchId: string;
`,
    `type RemovalDraft = {
  record: AquariumFish;
  fish?: Fish;
  label: string;
  batchId: string;
`,
    'roster removal identity',
  );

  next = replaceOnce(
    next,
    `  const speciesById = useMemo(() => new Map(species.map(item => [item.id, item])), [species]);
  const visibleRecords = useMemo(() => records
    .map(record => ({ record, fish: speciesById.get(record.fishId) }))
    .filter((item): item is { record: AquariumFish; fish: Fish } => Boolean(item.fish)), [records, speciesById]);
`,
    `  const speciesById = useMemo(() => new Map(species.map(item => [item.id, item])), [species]);
  const visibleRecords = useMemo(() => records.map(record => {
    const fish = speciesById.get(record.fishId);
    const unresolved = record.identityStatus === 'unresolved' || !fish;
    const label = unresolved
      ? (record.rawName?.trim() || (isEn ? 'Unresolved livestock' : '未确认生物'))
      : fish.name;
    return { record, fish, unresolved, label };
  }), [records, speciesById, isEn]);
`,
    'roster retains unresolved records',
  );

  next = replaceOnce(
    next,
    `  const beginRemoval = (record: AquariumFish, fish: Fish) => {
`,
    `  const beginRemoval = (record: AquariumFish, fish: Fish | undefined, label: string) => {
`,
    'roster beginRemoval signature',
  );
  next = replaceOnce(
    next,
    `    setRemoval({
      record,
      fish,
      batchId: firstBatch.id,
`,
    `    setRemoval({
      record,
      fish,
      label,
      batchId: firstBatch.id,
`,
    'roster removal label',
  );

  next = replaceRegexOnce(
    next,
    /                \{displayedRecords\.map\(\(\{ record, fish \}\) => \([\s\S]*?                \)\)\}\n/,
    `                {displayedRecords.map(({ record, fish, unresolved, label }) => (
                  <div key={record.id} className="relative min-w-0">
                    {!editingRecordId && <button
                      type="button"
                      aria-label={isEn ? \`Remove \${label} from aquarium\` : \`将\${label}移出鱼缸\`}
                      title={isEn ? 'Remove from aquarium' : '移出鱼缸'}
                      onClick={() => beginRemoval(record, fish, label)}
                      className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-rose-100 bg-white/95 text-rose-600 shadow-sm transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      <X className="h-5 w-5" />
                    </button>}
                    {fish ? (
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
                        onSave={nextRecord => onSave(record.id, nextRecord)}
                      />
                    ) : (
                      <article data-livestock-identity="unresolved" className="min-h-[150px] rounded-[22px] border border-sky-100 bg-white p-4 pr-14 shadow-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-base font-black text-ink">{record.rawName?.trim() || label}</h3>
                          <span className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-black text-sky-700">{isEn ? 'Identity pending' : '待确认身份'}</span>
                        </div>
                        <p className="mt-2 text-xs font-semibold leading-5 text-ink/55">
                          {isEn
                            ? 'Recorded from the real tank without a catalog match. Compatibility remains incomplete until this identity is confirmed.'
                            : '这是按现实名称保存的记录，尚未绑定物种资料。身份确认前，完整混养判断会保持信息不足。'}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black text-ink/60">
                          <span className="rounded-full bg-bg px-3 py-1.5">{isEn ? \`Quantity \${record.quantity}\` : \`数量 \${record.quantity}\`}</span>
                          <span className="rounded-full bg-bg px-3 py-1.5">{isEn ? \`Recorded \${record.entryDate.slice(0, 10)}\` : \`记录日期 \${record.entryDate.slice(0, 10)}\`}</span>
                        </div>
                      </article>
                    )}
                  </div>
                ))}
`,
    'roster verified/unresolved rendering',
  );

  next = replaceOnce(
    next,
    `            <DialogTitle>确认移出{removal?.fish.name}</DialogTitle>
`,
    `            <DialogTitle>确认移出{removal?.label}</DialogTitle>
`,
    'roster removal title',
  );

  return next;
});

console.log('unresolved livestock UI patch applied with record-existing-only manual entry and visible roster state');
