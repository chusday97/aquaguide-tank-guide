import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { CareTimelineItem } from '../src/services/care/care-timeline.service';
import {
  getCareReminderTitlePresentation,
  presentCareTimelineItem,
} from '../src/services/care/care-timeline-presentation.service';

const hasCjk = (value: string | undefined) => Boolean(value && /[\u3400-\u9fff]/.test(value));
const base = {
  id: 'event-1',
  aquariumId: 'tank-1',
  occurredAt: '2026-10-17T00:00:00.000Z',
  isInferred: false,
} as const;
const event = (partial: Partial<CareTimelineItem>): CareTimelineItem => ({
  ...base,
  eventType: 'feeding',
  title: '记录喂食',
  payload: {},
  ...partial,
} as CareTimelineItem);

const samples: CareTimelineItem[] = [
  event({ eventType: 'water_change', title: '记录换水', sourceType: 'water_change_day' }),
  event({ eventType: 'water_change', title: "Undid today's water-change record", sourceType: 'water_change_reversal', payload: { reversed: true } }),
  event({ eventType: 'feeding', title: 'Logged feeding', label: 'Feeding Record', sourceType: 'feeding_record' }),
  event({ eventType: 'life_stage_updated', title: '调整缸内物种体态', label: '已保存数量与体态变化', sourceType: 'livestock_state' }),
  event({ eventType: 'species_added', title: '加入缸内生物', label: '3 只/条', payload: { quantity: 3 }, sourceType: 'livestock_batch' }),
  event({ eventType: 'species_removed', title: '移出缸内生物', label: '2 只/条', payload: { quantity: 2 }, sourceType: 'livestock_removal' }),
  event({ eventType: 'settings_updated', title: '更新鱼缸设置', label: '已保存环境与设备配置', sourceType: 'aquarium_settings' }),
  event({ eventType: 'settings_updated', title: '重命名鱼缸', label: '已改为“Demo Tank”', payload: { aquariumName: 'Demo Tank' }, sourceType: 'aquarium_rename' }),
  event({ eventType: 'daily_check', title: '完成鱼只异常', label: '中文规则结论', payload: { problemType: '鱼只异常', riskLevel: 'high' }, sourceType: 'diagnosis_record' }),
  event({ eventType: 'care_plan_completed', title: '完成养护计划：换水计划', payload: { reminderTitle: '换水计划', reminderType: 'water_change' }, sourceType: 'care_reminder' }),
  event({ eventType: 'observation', title: '记录观察', label: '鱼浮在水面、呼吸明显急促', sourceType: 'observation_record' }),
  event({ eventType: 'aquarium_created', title: '开始鱼缸记录', label: '日期由旧记录推算', isInferred: true }),
];

for (const item of samples) {
  const projected = presentCareTimelineItem(item, true);
  assert.equal(hasCjk(projected.title), false, `English timeline title contains CJK: ${projected.title}`);
  if (projected.label) assert.equal(hasCjk(projected.label), false, `English timeline label contains CJK: ${projected.label}`);
}

const daily = presentCareTimelineItem(samples[8], true);
assert.equal(daily.title, 'Completed Fish Health Issue');
assert.equal(daily.label, 'High risk');
const rename = presentCareTimelineItem(samples[7], true);
assert.equal(rename.title, 'Renamed aquarium');
assert.equal(rename.label, 'Renamed to Demo Tank');
const observation = presentCareTimelineItem(samples[10], true);
assert.equal(observation.label, 'Fish floating at surface, Rapid breathing');

const reminder = {
  id: 'r1',
  sourceTopicId: 'routine-feeding',
  title: '喂食计划',
  type: 'feeding',
  createdAt: base.occurredAt,
  scheduledFor: base.occurredAt,
  repeatEnabled: true,
  repeatIntervalDays: 1,
};
assert.equal(getCareReminderTitlePresentation(reminder, true), 'Feeding reminder');
assert.equal(getCareReminderTitlePresentation({ ...reminder, title: 'Feeding reminder' }, true), 'Feeding reminder');
assert.equal(getCareReminderTitlePresentation(reminder, false), '喂食计划');

const aquariumSource = readFileSync(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');
const forbiddenPersistedUiStrings = [
  "title: isEn ? 'Updated livestock state'",
  "title: isEn ? 'Removed species from tank'",
  "title: isEn ? 'Removed livestock'",
  "title: isEn ? 'Aquarium removed'",
  "title: isEn ? 'Updated aquarium settings'",
  "title: isEn ? 'Renamed aquarium'",
  "title: isEn ? 'Logged water change'",
  "title: isEn ? 'Logged feeding'",
  "note: isEn ? 'Feeding Record'",
];
for (const snippet of forbiddenPersistedUiStrings) {
  assert.equal(aquariumSource.includes(snippet), false, `persisted history must not depend on UI locale: ${snippet}`);
}
assert.match(aquariumSource, /payload: \{ riskLevel: result\.riskLevel, problemType \}/);
assert.match(aquariumSource, /payload: \{ aquariumName: savedAquarium\.name \}/);
assert.match(aquariumSource, /const labels = \{\s+feeding: '喂食计划',\s+water_change: '换水计划',\s+general: '通用养护计划'/);

const timelineSource = readFileSync(new URL('../src/components/aquarium/AquariumTimeline.tsx', import.meta.url), 'utf8');
assert.match(timelineSource, /presentCareTimelineItem\(item, isEn\)/);
assert.match(timelineSource, /getCareReminderTitlePresentation\(reminder, isEn\)/);

console.log('care timeline localization boundary verified: persisted events/reminders stay canonical and locale projection handles current + legacy records');
