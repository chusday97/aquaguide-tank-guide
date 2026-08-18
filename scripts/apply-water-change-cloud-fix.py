from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one marker, got {count}')
    return text.replace(old, new, 1)


# 1) API contracts: explicit clearing must survive JSON/schema parsing.
contract_path = Path('packages/contracts/src/business.ts')
contract = contract_path.read_text()
count = contract.count('lastWaterChangeAt: isoDateTimeSchema.optional(),')
if count != 3:
    raise SystemExit(f'water-change nullable contracts: expected 3 markers, got {count}')
contract = contract.replace(
    'lastWaterChangeAt: isoDateTimeSchema.optional(),',
    'lastWaterChangeAt: isoDateTimeSchema.nullable().optional(),',
)
contract_path.write_text(contract)

# 2) API repository: normalize nullable DTOs and send explicit null when history becomes empty.
api_path = Path('src/services/repository/api-aquaguide.repository.ts')
api = api_path.read_text()
count = api.count('lastWaterChangeAt?: string;')
if count != 2:
    raise SystemExit(f'api nullable dto markers: expected 2, got {count}')
api = api.replace('lastWaterChangeAt?: string;', 'lastWaterChangeAt?: string | null;')
api = replace_once(api, 'lastWaterChangeDate: item.lastWaterChangeAt,', 'lastWaterChangeDate: item.lastWaterChangeAt || undefined,', 'species dto normalization')
api = replace_once(api, 'lastWaterChangeDate: record.lastWaterChangeAt,', 'lastWaterChangeDate: record.lastWaterChangeAt || undefined,', 'aquarium dto normalization')
api = replace_once(api, 'lastWaterChangeAt: aquarium.lastWaterChangeDate,', 'lastWaterChangeAt: aquarium.lastWaterChangeDate ?? null,', 'aquarium null persistence')
count = api.count('lastWaterChangeAt: fish.lastWaterChangeDate,')
if count != 2:
    raise SystemExit(f'fish null persistence markers: expected 2, got {count}')
api = api.replace('lastWaterChangeAt: fish.lastWaterChangeDate,', 'lastWaterChangeAt: fish.lastWaterChangeDate ?? null,')
api = replace_once(
    api,
    'current.lastWaterChangeAt !== fish.lastWaterChangeDate',
    '(current.lastWaterChangeAt || undefined) !== fish.lastWaterChangeDate',
    'species nullable comparison',
)
api_path.write_text(api)

# 3) Aquarium UI: hydrate exact history from care events and route both actions through repository persistence.
page_path = Path('src/pages/Aquarium.tsx')
page = page_path.read_text()
page = replace_once(
    page,
    "import { applyWaterChangeHistory, isFutureWaterChangeDate, toggleWaterChangeDate } from '../services/aquarium/water-change.service';",
    "import { applyWaterChangeHistory, hydrateWaterChangeHistoryFromEvents, isFutureWaterChangeDate, toggleWaterChangeDate, waterChangeDateToIso } from '../services/aquarium/water-change.service';",
    'water-change imports',
)
page = replace_once(
    page,
    'const normalized = normalizeAquariumPlants(repositoryAquariums);',
    'const normalized = normalizeAquariumPlants(repositoryAquariums).map(aquarium => hydrateWaterChangeHistoryFromEvents(aquarium, repositoryEvents));',
    'repository history hydration',
)

old_today = """  const handleTankWaterChange = async (): Promise<boolean> => {
    if (!activeAquarium || isWaterChangeSaving) return false;
    const now = new Date().toISOString();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const history = activeAquarium.waterChangeHistory || [];
    const hasTodayRecord = history.includes(todayStr);
    const newHistory = toggleWaterChangeDate(history, todayStr);
    const nextAquarium = applyWaterChangeHistory(activeAquarium, newHistory);

    setIsWaterChangeSaving(true);
    setWaterChangeError('');
    setWaterChangeFeedback('');
    try {
      saveAquariums(aquariums.map(aquarium => aquarium.id === activeId ? nextAquarium : aquarium));
      try {
        if (hasTodayRecord) {
          await removeCareTimelineEventBySource(activeAquarium.id, 'water_change_day', todayStr);
          await persistCareTimelineEvent({
            aquariumId: activeAquarium.id,
            eventType: 'water_change',
            title: isEn ? \"Undid today's water-change record\" : '撤回今日换水记录',
            payload: { reversed: true },
            occurredAt: now,
            sourceType: 'water_change_reversal',
            sourceId: todayStr,
            isInferred: false,
          });
        } else {
          await persistCareTimelineEvent({
            aquariumId: activeAquarium.id,
            eventType: 'water_change',
            title: isEn ? 'Logged water change' : '记录换水',
            payload: {},
            occurredAt: now,
            sourceType: 'water_change_day',
            sourceId: todayStr,
            isInferred: false,
          });
        }
      } catch {
        showToast(isEn ? 'Water change was saved, but the timeline could not be updated.' : '换水已保存，但养护时间线没有更新成功。', 'error');
      }
      setTankActionMessage(hasTodayRecord
        ? (isEn ? \"Recalled today's water change record\" : '已撤回今日换水记录')
        : (isEn ? `Logged water change: ${format(new Date(), 'yyyy-MM-dd HH:mm')}` : `已记录换水：${format(new Date(), 'yyyy-MM-dd HH:mm')}`));
      return true;
    } catch {
      const message = isEn ? 'Could not save the water-change record. Try again.' : '换水记录没有保存成功，请重试。';
      setWaterChangeError(message);
      showToast(message, 'error');
      return false;
    } finally {
      setIsWaterChangeSaving(false);
    }
  };"""
new_today = """  const handleTankWaterChange = async (): Promise<boolean> => {
    if (!activeAquarium || isWaterChangeSaving) return false;
    const now = new Date().toISOString();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const history = activeAquarium.waterChangeHistory || [];
    const hasTodayRecord = history.includes(todayStr);
    const newHistory = toggleWaterChangeDate(history, todayStr);
    const nextAquarium = applyWaterChangeHistory(activeAquarium, newHistory);

    setIsWaterChangeSaving(true);
    setWaterChangeError('');
    setWaterChangeFeedback('');
    try {
      if (hasTodayRecord) {
        await removeCareTimelineEventBySource(activeAquarium.id, 'water_change_day', todayStr);
        await persistCareTimelineEvent({
          aquariumId: activeAquarium.id,
          eventType: 'water_change',
          title: isEn ? \"Undid today's water-change record\" : '撤回今日换水记录',
          payload: { reversed: true },
          occurredAt: now,
          sourceType: 'water_change_reversal',
          sourceId: todayStr,
          isInferred: false,
        });
      } else {
        await persistCareTimelineEvent({
          aquariumId: activeAquarium.id,
          eventType: 'water_change',
          title: isEn ? 'Logged water change' : '记录换水',
          payload: {},
          occurredAt: now,
          sourceType: 'water_change_day',
          sourceId: todayStr,
          isInferred: false,
        });
      }
      const repository = await getCurrentAquaGuideRepository();
      const savedAquarium = await repository.saveAquarium(nextAquarium);
      const hydratedSaved = applyWaterChangeHistory(savedAquarium, newHistory);
      setAquariums(current => current.map(aquarium => aquarium.id === activeId ? hydratedSaved : aquarium));
      setTankActionMessage(hasTodayRecord
        ? (isEn ? \"Recalled today's water change record\" : '已撤回今日换水记录')
        : (isEn ? `Logged water change: ${format(new Date(), 'yyyy-MM-dd HH:mm')}` : `已记录换水：${format(new Date(), 'yyyy-MM-dd HH:mm')}`));
      return true;
    } catch {
      const message = isEn ? 'Could not save the water-change record. Try again.' : '换水记录没有保存成功，请重试。';
      setWaterChangeError(message);
      showToast(message, 'error');
      return false;
    } finally {
      setIsWaterChangeSaving(false);
    }
  };"""
page = replace_once(page, old_today, new_today, 'today water-change handler')

old_calendar = """  const handleToggleWaterChangeDate = (dateStr: string): boolean => {
    if (!activeAquarium || isFutureWaterChangeDate(dateStr)) return false;
    const newHistory = toggleWaterChangeDate(activeAquarium.waterChangeHistory || [], dateStr);
    const nextAquarium = applyWaterChangeHistory(activeAquarium, newHistory);
    saveAquariums(aquariums.map(aquarium => aquarium.id === activeId ? nextAquarium : aquarium));
    return true;
  };"""
new_calendar = """  const handleToggleWaterChangeDate = async (dateStr: string): Promise<boolean> => {
    if (!activeAquarium || isFutureWaterChangeDate(dateStr)) return false;
    const previousHistory = activeAquarium.waterChangeHistory || [];
    const newHistory = toggleWaterChangeDate(previousHistory, dateStr);
    const isAdding = newHistory.includes(dateStr);
    const nextAquarium = applyWaterChangeHistory(activeAquarium, newHistory);
    try {
      if (isAdding) {
        await persistCareTimelineEvent({
          aquariumId: activeAquarium.id,
          eventType: 'water_change',
          title: isEn ? 'Logged water change' : '记录换水',
          payload: { date: dateStr },
          occurredAt: waterChangeDateToIso(dateStr) || new Date().toISOString(),
          sourceType: 'water_change_day',
          sourceId: dateStr,
          isInferred: false,
        });
      } else {
        await removeCareTimelineEventBySource(activeAquarium.id, 'water_change_day', dateStr);
      }
      const repository = await getCurrentAquaGuideRepository();
      const savedAquarium = await repository.saveAquarium(nextAquarium);
      const hydratedSaved = applyWaterChangeHistory(savedAquarium, newHistory);
      setAquariums(current => current.map(aquarium => aquarium.id === activeId ? hydratedSaved : aquarium));
      return true;
    } catch {
      return false;
    }
  };"""
page = replace_once(page, old_calendar, new_calendar, 'calendar water-change handler')
page = replace_once(
    page,
    'const saved = handleToggleWaterChangeDate(selectedWaterChangeDate);',
    'const saved = await handleToggleWaterChangeDate(selectedWaterChangeDate);',
    'calendar async caller',
)
page_path.write_text(page)
