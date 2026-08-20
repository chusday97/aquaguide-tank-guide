import type { AquariumFish, AquariumSpeciesBatch, LifeStage, ReproductiveState } from '../../types';

const createId = () => `batch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const createSpeciesBatch = (input: {
  quantity: number;
  entryDate: string;
  lifeStage?: LifeStage;
  reproductiveState?: ReproductiveState;
  id?: string;
  stateUpdatedAt?: string;
}): AquariumSpeciesBatch => ({
  id: input.id ?? createId(),
  quantity: Math.max(1, Math.round(input.quantity || 1)),
  entryDate: input.entryDate,
  lifeStage: input.lifeStage ?? 'unknown',
  reproductiveState: input.reproductiveState ?? 'unknown',
  stateUpdatedAt: input.stateUpdatedAt ?? new Date().toISOString(),
});

export const normalizeSpeciesBatches = (record: AquariumFish): AquariumSpeciesBatch[] => {
  const valid = Array.isArray(record.batches)
    ? record.batches.filter(batch => batch && batch.id && Number(batch.quantity) > 0)
    : [];
  if (valid.length > 0) return valid.map(batch => createSpeciesBatch(batch));
  return [createSpeciesBatch({
    id: `${record.id}_legacy`,
    quantity: record.quantity,
    entryDate: record.entryDate,
    stateUpdatedAt: record.entryDate,
  })];
};

export const withNormalizedSpeciesBatches = (record: AquariumFish): AquariumFish => {
  const batches = normalizeSpeciesBatches(record);
  return {
    ...record,
    quantity: batches.reduce((sum, batch) => sum + batch.quantity, 0),
    entryDate: batches.map(batch => batch.entryDate).sort()[0] ?? record.entryDate,
    batches,
  };
};

export const appendSpeciesBatch = (record: AquariumFish, input: Parameters<typeof createSpeciesBatch>[0]) => withNormalizedSpeciesBatches({
  ...record,
  batches: [...normalizeSpeciesBatches(record), createSpeciesBatch(input)],
});

export const updateSpeciesBatch = (
  record: AquariumFish,
  batchId: string,
  patch: Partial<Pick<AquariumSpeciesBatch, 'quantity' | 'entryDate' | 'lifeStage' | 'reproductiveState'>>,
) => withNormalizedSpeciesBatches({
  ...record,
  batches: normalizeSpeciesBatches(record).map(batch => batch.id === batchId
    ? createSpeciesBatch({
        ...batch,
        ...patch,
        id: batch.id,
        stateUpdatedAt: patch.lifeStage !== undefined || patch.reproductiveState !== undefined
          ? new Date().toISOString()
          : batch.stateUpdatedAt,
      })
    : batch),
});

export const splitSpeciesBatch = (
  record: AquariumFish,
  batchId: string,
  input: { quantity: number; lifeStage: LifeStage; reproductiveState: ReproductiveState; entryDate?: string },
) => {
  const batches = normalizeSpeciesBatches(record);
  const source = batches.find(batch => batch.id === batchId);
  const quantity = Math.round(input.quantity);
  if (!source) throw new Error('没有找到待拆分的批次。');
  if (quantity < 1 || quantity >= source.quantity) throw new Error('拆分数量必须小于原批次数量。');
  const now = new Date().toISOString();
  return withNormalizedSpeciesBatches({
    ...record,
    batches: [
      ...batches.map(batch => batch.id === batchId ? { ...batch, quantity: batch.quantity - quantity, stateUpdatedAt: now } : batch),
      createSpeciesBatch({
        quantity,
        entryDate: input.entryDate ?? source.entryDate,
        lifeStage: input.lifeStage,
        reproductiveState: input.reproductiveState,
        stateUpdatedAt: now,
      }),
    ],
  });
};

export const deleteSpeciesBatch = (record: AquariumFish, batchId: string) => {
  const remaining = normalizeSpeciesBatches(record).filter(batch => batch.id !== batchId);
  if (remaining.length === 0) return null;
  return withNormalizedSpeciesBatches({ ...record, batches: remaining });
};

export const mergeSpeciesBatches = (record: AquariumFish, targetBatchId: string, sourceBatchId: string) => {
  if (targetBatchId === sourceBatchId) throw new Error('请选择两个不同的批次。');
  const batches = normalizeSpeciesBatches(record);
  const target = batches.find(batch => batch.id === targetBatchId);
  const source = batches.find(batch => batch.id === sourceBatchId);
  if (!target || !source) throw new Error('没有找到需要合并的批次。');
  if (target.lifeStage !== source.lifeStage || target.reproductiveState !== source.reproductiveState) {
    throw new Error('请先将两个批次调整为相同体态再合并。');
  }
  return withNormalizedSpeciesBatches({
    ...record,
    batches: batches
      .filter(batch => batch.id !== sourceBatchId)
      .map(batch => batch.id === targetBatchId ? {
        ...batch,
        quantity: target.quantity + source.quantity,
        entryDate: [target.entryDate, source.entryDate].sort()[0],
      } : batch),
  });
};

export const decrementSpeciesBatch = (record: AquariumFish, batchId: string) => {
  const batches = normalizeSpeciesBatches(record);
  const target = batches.find(batch => batch.id === batchId);
  if (!target) throw new Error('没有找到需要扣减的批次。');
  if (target.quantity === 1) return deleteSpeciesBatch(record, batchId);
  return withNormalizedSpeciesBatches({
    ...record,
    batches: batches.map(batch => batch.id === batchId ? { ...batch, quantity: batch.quantity - 1 } : batch),
  });
};

export const removeSpeciesBatchQuantity = (record: AquariumFish, batchId: string, quantity: number) => {
  const batches = normalizeSpeciesBatches(record);
  const target = batches.find(batch => batch.id === batchId);
  if (!target) throw new Error('没有找到需要移出的批次。');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > target.quantity) throw new Error('移出数量必须是当前批次数量范围内的整数。');
  if (quantity === target.quantity) return deleteSpeciesBatch(record, batchId);
  return withNormalizedSpeciesBatches({
    ...record,
    batches: batches.map(batch => batch.id === batchId
      ? { ...batch, quantity: batch.quantity - quantity, stateUpdatedAt: new Date().toISOString() }
      : batch),
  });
};

export const summarizeSpeciesBatches = (record: AquariumFish) => {
  const batches = normalizeSpeciesBatches(record);
  const count = (predicate: (batch: AquariumSpeciesBatch) => boolean) => batches
    .filter(predicate)
    .reduce((sum, batch) => sum + batch.quantity, 0);
  return {
    total: count(() => true),
    fry: count(batch => batch.lifeStage === 'fry'),
    juvenile: count(batch => batch.lifeStage === 'juvenile'),
    subadult: count(batch => batch.lifeStage === 'subadult'),
    adult: count(batch => batch.lifeStage === 'adult'),
    pregnant: count(batch => batch.reproductiveState === 'pregnant_or_gravid'),
    spawning: count(batch => batch.reproductiveState === 'in_labor_or_spawning'),
    recovery: count(batch => batch.reproductiveState === 'postpartum_recovery'),
    unknown: count(batch => batch.lifeStage === 'unknown'),
  };
};

export const getSpeciesBatchContextLabel = (record: AquariumFish, isEn: boolean) => {
  const summary = summarizeSpeciesBatches(record);
  const parts: string[] = [];
  if (summary.fry) parts.push(isEn ? `${summary.fry} fry` : `鱼苗 ${summary.fry}`);
  if (summary.juvenile) parts.push(isEn ? `${summary.juvenile} juvenile` : `幼年 ${summary.juvenile}`);
  if (summary.subadult) parts.push(isEn ? `${summary.subadult} subadult` : `亚成 ${summary.subadult}`);
  if (summary.adult) parts.push(isEn ? `${summary.adult} adult` : `成年 ${summary.adult}`);
  if (summary.pregnant) parts.push(isEn ? `${summary.pregnant} pregnant/gravid` : `怀孕/抱卵 ${summary.pregnant}`);
  if (summary.spawning) parts.push(isEn ? `${summary.spawning} birthing/spawning` : `生产/繁殖 ${summary.spawning}`);
  if (summary.recovery) parts.push(isEn ? `${summary.recovery} recovering` : `产后恢复 ${summary.recovery}`);
  return parts.length > 0 ? parts.join(', ') : (isEn ? 'stage not recorded' : '体态未记录');
};

export const getSpeciesBatchObservation = (record: AquariumFish, isEn: boolean) => {
  const summary = summarizeSpeciesBatches(record);
  if (summary.spawning) return isEn ? 'Observe breathing, isolation, and whether birthing or spawning has finished.' : '观察呼吸、躲藏和生产/繁殖是否结束。';
  if (summary.pregnant) return isEn ? 'Watch appetite, chasing, hiding places, and signs of labor.' : '观察食欲、追咬、躲避空间和临产迹象。';
  if (summary.recovery) return isEn ? 'Watch appetite and energy while keeping water conditions stable.' : '观察食欲与活动量，保持水质稳定。';
  if (summary.fry) return isEn ? 'Check fry feeding access, shelter, growth, and whether larger tank mates are chasing or swallowing them.' : '观察鱼苗是否吃得到、是否有足够躲避空间、生长是否正常，以及是否被较大个体追逐或吞食。';
  if (summary.juvenile) return isEn ? 'Check juvenile feeding access, growth, and whether larger tank mates are chasing them.' : '观察幼年个体是否吃得到、生长正常，以及是否被较大个体追咬。';
  if (summary.subadult) return isEn ? 'Check subadult growth, feeding competition, and whether territorial pressure is increasing.' : '观察亚成个体的生长、进食竞争，以及领地压力是否增加。';
  return '';
};

export type SpeciesBatchCareSignal = {
  code: 'spawning' | 'pregnant' | 'recovery' | 'juvenile';
  speciesRecordId: string;
  priority: 'routine' | 'important';
  title: string;
  reason: string;
};

export const getAquariumBatchCareSignal = (
  records: AquariumFish[],
  isEn: boolean,
): SpeciesBatchCareSignal | null => {
  const candidates = records.flatMap(record => {
    const summary = summarizeSpeciesBatches(record);
    return [
      summary.spawning > 0 ? {
        code: 'spawning' as const,
        speciesRecordId: record.id,
        priority: 'important' as const,
        title: isEn ? 'Watch birthing or spawning closely' : '重点观察生产或繁殖',
        reason: isEn
          ? `${summary.spawning} animal(s) are marked as birthing or spawning. Check breathing, shelter and whether the process has finished.`
          : `${summary.spawning} 条/只正处于生产或繁殖状态，今天重点看呼吸、躲藏和过程是否结束。`,
      } : null,
      summary.pregnant > 0 ? {
        code: 'pregnant' as const,
        speciesRecordId: record.id,
        priority: 'routine' as const,
        title: isEn ? 'Check pregnant or gravid livestock' : '观察怀孕或抱卵生物',
        reason: isEn
          ? `${summary.pregnant} animal(s) need an appetite, chasing and shelter check.`
          : `${summary.pregnant} 条/只需要观察食欲、追咬和躲避空间。`,
      } : null,
      summary.recovery > 0 ? {
        code: 'recovery' as const,
        speciesRecordId: record.id,
        priority: 'routine' as const,
        title: isEn ? 'Check postpartum recovery' : '观察产后恢复状态',
        reason: isEn
          ? `${summary.recovery} animal(s) are recovering. Check appetite and activity while keeping the water stable.`
          : `${summary.recovery} 条/只处于产后恢复，观察食欲和活动量并保持水体稳定。`,
      } : null,
      summary.juvenile > 0 ? {
        code: 'juvenile' as const,
        speciesRecordId: record.id,
        priority: 'routine' as const,
        title: isEn ? 'Check juvenile feeding access' : '观察幼年生物进食',
        reason: isEn
          ? `${summary.juvenile} juvenile(s) need feeding access, growth and chasing checks.`
          : `${summary.juvenile} 条/只幼年生物需要观察是否吃得到、生长正常及有无被追咬。`,
      } : null,
    ].filter(Boolean) as SpeciesBatchCareSignal[];
  });

  const priorityOrder: SpeciesBatchCareSignal['code'][] = ['spawning', 'pregnant', 'recovery', 'juvenile'];
  return candidates.sort((a, b) => priorityOrder.indexOf(a.code) - priorityOrder.indexOf(b.code))[0] || null;
};
