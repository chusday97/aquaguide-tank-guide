import { readFileSync, writeFileSync } from 'node:fs';

const replaceOnce = (path, from, to, label) => {
  let source = readFileSync(path, 'utf8');
  const first = source.indexOf(from);
  const last = source.lastIndexOf(from);
  if (first < 0) throw new Error(`${label}: fragment not found in ${path}`);
  if (first !== last) throw new Error(`${label}: fragment matched more than once in ${path}`);
  source = source.replace(from, to);
  writeFileSync(path, source);
};

const replaceBetween = (path, startMarker, endMarker, replacement, label) => {
  let source = readFileSync(path, 'utf8');
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0 || end <= start) throw new Error(`${label}: markers not found in ${path}`);
  source = source.slice(0, start) + replacement + source.slice(end);
  writeFileSync(path, source);
};

// Local repository: one local state patch updates aquarium summary, history and canonical care event together.
replaceOnce(
  'src/services/repository/local-aquaguide.repository.ts',
  "import { loadAppStateFromStorage } from '../storage/local-app-state';",
  "import { loadAppStateFromStorage, patchLocalAppState } from '../storage/local-app-state';",
  'local state import',
);
replaceOnce(
  'src/services/repository/local-aquaguide.repository.ts',
  "import { appendSpeciesBatch, createSpeciesBatch, removeSpeciesBatchQuantity } from '../aquarium/species-batches.service';",
  "import { appendSpeciesBatch, createSpeciesBatch, removeSpeciesBatchQuantity } from '../aquarium/species-batches.service';\nimport { applyWaterChangeHistory, isFutureWaterChangeDate, setWaterChangeDateRecorded, waterChangeDateToIso } from '../aquarium/water-change.service';",
  'local water change import',
);
replaceOnce(
  'src/services/repository/local-aquaguide.repository.ts',
  "  CareTimelineMutation,\n} from './aquaguide.repository';",
  "  CareTimelineMutation,\n  CareTimelineRecord,\n  WaterChangeMutation,\n} from './aquaguide.repository';",
  'local repository types',
);
replaceOnce(
  'src/services/repository/local-aquaguide.repository.ts',
  '  async saveAquarium(aquarium: Aquarium) {',
[
  '  async setWaterChange(input: WaterChangeMutation) {',
  '    const state = loadAppStateFromStorage();',
  '    const aquarium = state.aquariums.find(item => item.id === input.aquariumId);',
  "    if (!aquarium) throw new Error('没有找到需要记录换水的鱼缸。');",
  "    if (isFutureWaterChangeDate(input.date)) throw new Error('只能记录今天或过去实际发生的换水。');",
  '    const occurredAt = waterChangeDateToIso(input.date);',
  "    if (!occurredAt) throw new Error('换水日期无效。');",
  '    const nextHistory = setWaterChangeDateRecorded(aquarium.waterChangeHistory || [], input.date, input.recorded);',
  '    const nextAquarium = applyWaterChangeHistory(aquarium, nextHistory);',
  '    const currentEvents = (state.careEvents || []) as CareTimelineRecord[];',
  '    const sameDayEvent = (event: CareTimelineRecord) => event.aquariumId === input.aquariumId',
  "      && event.eventType === 'water_change'",
  "      && event.sourceType === 'water_change_day'",
  '      && event.sourceId === input.date;',
  '    const retainedEvents = currentEvents.filter(event => !sameDayEvent(event));',
  '    const nextEvents: CareTimelineRecord[] = input.recorded',
  '      ? [{',
  '          id: `water-change:${input.aquariumId}:${input.date}`,',
  '          aquariumId: input.aquariumId,',
  "          eventType: 'water_change',",
  "          title: '换水记录',",
  '          label: input.date,',
  '          payload: { localDate: input.date },',
  '          occurredAt,',
  "          sourceType: 'water_change_day',",
  '          sourceId: input.date,',
  '          isInferred: false,',
  '        }, ...retainedEvents]',
  '      : retainedEvents;',
  '    const nextAquariums = state.aquariums.map(item => item.id === input.aquariumId ? nextAquarium : item);',
  '    patchLocalAppState({ aquariums: nextAquariums, careEvents: nextEvents });',
  '    return nextAquarium;',
  '  }',
  '',
  '  async saveAquarium(aquarium: Aquarium) {',
].join('\n'),
  'local atomic water change method',
);

// Cloud repository calls the atomic API and refreshes its aquarium version cache from the returned aggregate.
replaceOnce(
  'src/services/repository/api-aquaguide.repository.ts',
  "  CareTimelineRecord,\n} from './aquaguide.repository';",
  "  CareTimelineRecord,\n  WaterChangeMutation,\n} from './aquaguide.repository';",
  'api repository water change type',
);
replaceOnce(
  'src/services/repository/api-aquaguide.repository.ts',
  '  async saveAquarium(aquarium: Aquarium) {',
[
  '  async setWaterChange(input: WaterChangeMutation) {',
  '    const saved = await apiRequest<ApiAquarium>(`/aquariums/${input.aquariumId}/water-changes/${input.date}`, {',
  "      method: 'PUT',",
  '      body: { recorded: input.recorded },',
  '      idempotencyKey: input.operationId,',
  '    });',
  '    return this.rememberAquarium(saved);',
  '  }',
  '',
  '  async saveAquarium(aquarium: Aquarium) {',
].join('\n'),
  'api repository atomic water change method',
);

// API route delegates all water-change writes to the transaction RPC, then returns a fresh aggregate/version.
replaceOnce(
  'apps/api/src/routes/aquariums.ts',
  "const mapAquarium = (row: DbRow) => ({",
[
  "const parseLocalDate = (value: string) => {",
  "  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) throw new ApiError(400, 'VALIDATION_ERROR', '换水日期无效。');",
  "  const [year, month, day] = value.split('-').map(Number);",
  '  const parsed = new Date(Date.UTC(year, month - 1, day));',
  "  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) throw new ApiError(400, 'VALIDATION_ERROR', '换水日期无效。');",
  '  return value;',
  '};',
  '',
  'const mapAquarium = (row: DbRow) => ({',
].join('\n'),
  'local date parser',
);
replaceOnce(
  'apps/api/src/routes/aquariums.ts',
  "aquariumsRouter.post('/aquariums/:id/species', asyncRoute(async (request, response) => {",
[
  "aquariumsRouter.put('/aquariums/:id/water-changes/:localDate', asyncRoute(async (request, response) => {",
  "  const aquariumId = parseId(request.params.id, '鱼缸标识');",
  '  const localDate = parseLocalDate(request.params.localDate);',
  '  const recorded = request.body?.recorded;',
  "  if (typeof recorded !== 'boolean') throw new ApiError(400, 'VALIDATION_ERROR', '换水记录状态无效。');",
  '  const operationKey = requireIdempotencyKey(request);',
  '  const client = userClientFor(request);',
  "  const { error: mutationError } = await client.rpc('set_aquarium_water_change_day', {",
  '    target_aquarium_id: aquariumId,',
  '    water_change_date: localDate,',
  '    should_record: recorded,',
  '    operation_key: operationKey,',
  '    operation_request_hash: getRequestHash(request),',
  '  });',
  "  if (mutationError?.message?.includes('AQUARIUM_NOT_FOUND')) throw new ApiError(404, 'NOT_FOUND', '没有找到这个鱼缸。');",
  "  if (mutationError?.message?.includes('DUPLICATE_OPERATION_KEY')) throw new ApiError(409, 'DUPLICATE_RESOURCE', '这个操作号已经用于另一项修改。');",
  "  if (mutationError) throwDatabaseError(mutationError, '换水记录没有完整保存，事件和鱼缸摘要均保持不变。');",
  "  const { data, error } = await client.from('aquariums').select(aquariumSelect).eq('id', aquariumId).is('deleted_at', null).maybeSingle();",
  "  if (error || !data) throwDatabaseError(error, '换水已提交，但鱼缸最新状态暂时无法读取。');",
  '  return sendData(request, response, mapAquarium(data));',
  '}));',
  '',
  "aquariumsRouter.post('/aquariums/:id/species', asyncRoute(async (request, response) => {",
].join('\n'),
  'atomic water change API route',
);

// Page: cloud history is rebuilt from canonical care events, and all writes go through the repository mutation.
replaceOnce(
  'src/pages/Aquarium.tsx',
  "import { applyWaterChangeHistory, isFutureWaterChangeDate, toggleWaterChangeDate } from '../services/aquarium/water-change.service';",
  "import { applyWaterChangeHistory, hydrateAquariumWaterChangeHistory, isFutureWaterChangeDate, setWaterChangeDateRecorded } from '../services/aquarium/water-change.service';",
  'page water change imports',
);
replaceOnce(
  'src/pages/Aquarium.tsx',
  '        const normalized = normalizeAquariumPlants(repositoryAquariums);',
[
  '        const normalizedBase = normalizeAquariumPlants(repositoryAquariums);',
  "        const normalized = resolvedMode === 'cloud'",
  '          ? normalizedBase.map(aquarium => hydrateAquariumWaterChangeHistory(aquarium, repositoryEvents))',
  '          : normalizedBase;',
].join('\n'),
  'cloud water change hydration',
);
replaceOnce(
  'src/pages/Aquarium.tsx',
[
  '  const saveAquariums = (newAquariums: Aquarium[]) => {',
  "    const saved = persistAquariums(newAquariums, activeId || newAquariums[0]?.id || '');",
  '    setAquariums(saved.aquariums);',
  '  };',
  '',
].join('\n'),
  '',
  'remove legacy page saveAquariums helper',
);
replaceBetween(
  'src/pages/Aquarium.tsx',
  '  const handleTankWaterChange = async (): Promise<boolean> => {',
  '  const handleDailyActionPrimary = () => {',
[
  '  const setWaterChangeRecorded = async (dateStr: string, recorded: boolean): Promise<boolean> => {',
  '    if (!activeAquarium || isWaterChangeSaving || isFutureWaterChangeDate(dateStr)) return false;',
  '    setIsWaterChangeSaving(true);',
  "    setWaterChangeError('');",
  "    setWaterChangeFeedback('');",
  '    try {',
  '      const repository = await getCurrentAquaGuideRepository();',
  '      const savedAquarium = await repository.setWaterChange({',
  '        aquariumId: activeAquarium.id,',
  '        date: dateStr,',
  '        recorded,',
  '        operationId: `water-change:${activeAquarium.id}:${dateStr}:${crypto.randomUUID()}`,',
  '      });',
  '      const nextHistory = setWaterChangeDateRecorded(activeAquarium.waterChangeHistory || [], dateStr, recorded);',
  '      const hydratedAquarium = applyWaterChangeHistory(savedAquarium, nextHistory);',
  '      const mirroredAquariums = aquariums.map(aquarium => aquarium.id === activeId ? hydratedAquarium : aquarium);',
  '      let displayAquariums = mirroredAquariums;',
  '      try {',
  '        displayAquariums = persistAquariums(mirroredAquariums, hydratedAquarium.id).aquariums;',
  '      } catch {',
  "        showToast(isEn ? 'Water change was saved, but the local cache could not be refreshed.' : '换水已保存，但本地缓存未能刷新；重新打开后会以持久化数据为准。', 'error');",
  '      }',
  '      setAquariums(displayAquariums);',
  '      try {',
  '        const events = await repository.getCareEvents(activeAquarium.id);',
  '        setCareTimelineEvents(events);',
  '        setCareTimelineRevision(value => value + 1);',
  '      } catch {',
  "        showToast(isEn ? 'Water change was saved, but the timeline could not be refreshed.' : '换水已保存，但养护时间线暂时无法刷新。', 'error');",
  '      }',
  '      return true;',
  '    } catch {',
  "      const message = isEn ? 'Could not save the water-change record. Try again.' : '换水记录没有保存成功，请重试。';",
  '      setWaterChangeError(message);',
  "      showToast(message, 'error');",
  '      return false;',
  '    } finally {',
  '      setIsWaterChangeSaving(false);',
  '    }',
  '  };',
  '',
  '  const handleTankWaterChange = async (): Promise<boolean> => {',
  '    if (!activeAquarium || isWaterChangeSaving) return false;',
  "    const todayStr = format(new Date(), 'yyyy-MM-dd');",
  '    const hasTodayRecord = (activeAquarium.waterChangeHistory || []).includes(todayStr);',
  '    const saved = await setWaterChangeRecorded(todayStr, !hasTodayRecord);',
  '    if (!saved) return false;',
  '    setTankActionMessage(hasTodayRecord',
  "      ? (isEn ? \"Recalled today's water change record\" : '已撤回今日换水记录')",
  "      : (isEn ? `Logged water change: ${format(new Date(), 'yyyy-MM-dd HH:mm')}` : `已记录换水：${format(new Date(), 'yyyy-MM-dd HH:mm')}`));",
  '    return true;',
  '  };',
  '',
  '  const handleDailyActionPrimary = () => {',
].join('\n'),
  'repository-backed today water change handler',
);
replaceBetween(
  'src/pages/Aquarium.tsx',
  '  const handleToggleWaterChangeDate = (dateStr: string): boolean => {',
  '  const getConflicts = (_fishes: AquariumFish[]): string[] => {',
[
  '  const handleToggleWaterChangeDate = async (dateStr: string): Promise<boolean> => {',
  '    if (!activeAquarium || isFutureWaterChangeDate(dateStr)) return false;',
  '    const recorded = !(activeAquarium.waterChangeHistory || []).includes(dateStr);',
  '    return setWaterChangeRecorded(dateStr, recorded);',
  '  };',
  '',
  '  const getConflicts = (_fishes: AquariumFish[]): string[] => {',
].join('\n'),
  'repository-backed calendar water change handler',
);
replaceOnce(
  'src/pages/Aquarium.tsx',
  '              onClick={() => {\n                if (isWaterChangeSaving || isFutureWaterChangeDate(selectedWaterChangeDate)) {',
  '              onClick={async () => {\n                if (isWaterChangeSaving || isFutureWaterChangeDate(selectedWaterChangeDate)) {',
  'calendar async click',
);
replaceOnce(
  'src/pages/Aquarium.tsx',
[
  '                setIsWaterChangeSaving(true);',
  "                setWaterChangeError('');",
  "                setWaterChangeFeedback('');",
  '                try {',
  '                  const saved = handleToggleWaterChangeDate(selectedWaterChangeDate);',
].join('\n'),
[
  "                setWaterChangeError('');",
  "                setWaterChangeFeedback('');",
  '                try {',
  '                  const saved = await handleToggleWaterChangeDate(selectedWaterChangeDate);',
].join('\n'),
  'calendar await repository mutation',
);
replaceOnce(
  'src/pages/Aquarium.tsx',
[
  '                } catch {',
  "                  setWaterChangeError(isEn ? 'Could not save the water-change record. Try again.' : '换水记录没有保存成功，请重试。');",
  '                } finally {',
  '                  setIsWaterChangeSaving(false);',
  '                }',
].join('\n'),
[
  '                } catch {',
  "                  setWaterChangeError(isEn ? 'Could not save the water-change record. Try again.' : '换水记录没有保存成功，请重试。');",
  '                }',
].join('\n'),
  'calendar saving lifecycle owned by mutation helper',
);

console.log('Atomic water change flow patch applied.');
