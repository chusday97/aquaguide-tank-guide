import fs from 'node:fs';

const file = 'src/pages/Aquarium.tsx';
let source = fs.readFileSync(file, 'utf8');

const helperMarker = 'const runWaterChangeRollbacks = async (rollbackActions: Array<() => Promise<void>>)';
if (!source.includes(helperMarker)) {
  const anchor = '  const openAquariumSpeciesDetail = (fish: Fish, aqFish: AquariumFish, sourceId?: string) => {';
  if (!source.includes(anchor)) throw new Error('Could not find water-change rollback helper insertion anchor.');
  const helper = `  const runWaterChangeRollbacks = async (rollbackActions: Array<() => Promise<void>>) => {
    let rollbackSucceeded = true;
    for (const rollback of [...rollbackActions].reverse()) {
      try {
        await rollback();
      } catch (error) {
        rollbackSucceeded = false;
        console.error('AquaGuide water-change rollback failed', error);
      }
    }
    return rollbackSucceeded;
  };

`;
  source = source.replace(anchor, helper + anchor);
}

const todayStart = source.indexOf('  const handleTankWaterChange = async (): Promise<boolean> => {');
const todayEnd = source.indexOf('\n\n  const handleDailyActionPrimary = () => {', todayStart);
if (todayStart < 0 || todayEnd < 0) throw new Error('Could not locate Today water-change handler.');

const todayReplacement = `  const handleTankWaterChange = async (): Promise<boolean> => {
    if (!activeAquarium || isWaterChangeSaving) return false;
    const now = new Date().toISOString();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const history = activeAquarium.waterChangeHistory || [];
    const hasTodayRecord = history.includes(todayStr);
    const newHistory = toggleWaterChangeDate(history, todayStr);
    const nextAquarium = applyWaterChangeHistory(activeAquarium, newHistory);
    const rollbackActions: Array<() => Promise<void>> = [];

    setIsWaterChangeSaving(true);
    setWaterChangeError('');
    setWaterChangeFeedback('');
    try {
      if (hasTodayRecord) {
        await removeCareTimelineEventBySource(activeAquarium.id, 'water_change_day', todayStr);
        rollbackActions.push(async () => {
          await persistCareTimelineEvent({
            aquariumId: activeAquarium.id,
            eventType: 'water_change',
            title: isEn ? 'Logged water change' : '记录换水',
            payload: { date: todayStr },
            occurredAt: waterChangeDateToIso(todayStr) || now,
            sourceType: 'water_change_day',
            sourceId: todayStr,
            isInferred: false,
          });
        });
        await persistCareTimelineEvent({
          aquariumId: activeAquarium.id,
          eventType: 'water_change',
          title: isEn ? "Undid today's water-change record" : '撤回今日换水记录',
          payload: { reversed: true },
          occurredAt: now,
          sourceType: 'water_change_reversal',
          sourceId: todayStr,
          isInferred: false,
        });
        rollbackActions.push(async () => {
          await removeCareTimelineEventBySource(activeAquarium.id, 'water_change_reversal', todayStr);
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
        rollbackActions.push(async () => {
          await removeCareTimelineEventBySource(activeAquarium.id, 'water_change_day', todayStr);
        });
      }
      const repository = await getCurrentAquaGuideRepository();
      const savedAquarium = await repository.saveAquarium(nextAquarium);
      const hydratedSaved = applyWaterChangeHistory(savedAquarium, newHistory);
      setAquariums(current => current.map(aquarium => aquarium.id === activeId ? hydratedSaved : aquarium));
      setTankActionMessage(hasTodayRecord
        ? (isEn ? "Recalled today's water change record" : '已撤回今日换水记录')
        : (isEn ? \`Logged water change: \${format(new Date(), 'yyyy-MM-dd HH:mm')}\` : \`已记录换水：\${format(new Date(), 'yyyy-MM-dd HH:mm')}\`));
      return true;
    } catch {
      const rollbackSucceeded = await runWaterChangeRollbacks(rollbackActions);
      const message = rollbackSucceeded
        ? (isEn ? 'Could not save the water-change record. Try again.' : '换水记录没有保存成功，请重试。')
        : (isEn ? 'Save failed and the care timeline could not be fully restored. Refresh before retrying.' : '换水保存失败，且养护时间线未能完全恢复。请刷新确认后再重试。');
      setWaterChangeError(message);
      showToast(message, 'error');
      return false;
    } finally {
      setIsWaterChangeSaving(false);
    }
  };`;

source = source.slice(0, todayStart) + todayReplacement + source.slice(todayEnd);

const calendarStart = source.indexOf('  const handleToggleWaterChangeDate = async (dateStr: string): Promise<boolean> => {');
const calendarEnd = source.indexOf('\n\n  const getConflicts = (_fishes: AquariumFish[]): string[] => {', calendarStart);
if (calendarStart < 0 || calendarEnd < 0) throw new Error('Could not locate calendar water-change handler.');

const calendarReplacement = `  const handleToggleWaterChangeDate = async (dateStr: string): Promise<boolean> => {
    if (!activeAquarium || isFutureWaterChangeDate(dateStr)) return false;
    const previousHistory = activeAquarium.waterChangeHistory || [];
    const newHistory = toggleWaterChangeDate(previousHistory, dateStr);
    const isAdding = newHistory.includes(dateStr);
    const nextAquarium = applyWaterChangeHistory(activeAquarium, newHistory);
    const rollbackActions: Array<() => Promise<void>> = [];
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
        rollbackActions.push(async () => {
          await removeCareTimelineEventBySource(activeAquarium.id, 'water_change_day', dateStr);
        });
      } else {
        await removeCareTimelineEventBySource(activeAquarium.id, 'water_change_day', dateStr);
        rollbackActions.push(async () => {
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
        });
      }
      const repository = await getCurrentAquaGuideRepository();
      const savedAquarium = await repository.saveAquarium(nextAquarium);
      const hydratedSaved = applyWaterChangeHistory(savedAquarium, newHistory);
      setAquariums(current => current.map(aquarium => aquarium.id === activeId ? hydratedSaved : aquarium));
      return true;
    } catch {
      await runWaterChangeRollbacks(rollbackActions);
      return false;
    }
  };`;

source = source.slice(0, calendarStart) + calendarReplacement + source.slice(calendarEnd);

fs.writeFileSync(file, source);
console.log('Applied water-change compensating write semantics.');
