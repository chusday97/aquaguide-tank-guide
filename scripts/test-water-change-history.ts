import type { Aquarium } from '../src/types';
import {
  applyWaterChangeHistory,
  getLatestWaterChangeDate,
  isFutureWaterChangeDate,
  toggleWaterChangeDate,
} from '../src/services/aquarium/water-change.service';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const now = new Date(2026, 7, 13, 12, 0, 0, 0);

assert(isFutureWaterChangeDate('2026-08-14', now), 'tomorrow must be treated as a future water-change date');
assert(!isFutureWaterChangeDate('2026-08-13', now), 'today must be allowed as a water-change date');
assert(isFutureWaterChangeDate('2026-02-30', now), 'invalid calendar date must be rejected');

const toggled = toggleWaterChangeDate(
  ['2026-08-12', '2026-08-14', 'invalid-date', '2026-08-12'],
  '2026-08-13',
  now,
);
assert(
  JSON.stringify(toggled) === JSON.stringify(['2026-08-12', '2026-08-13']),
  `toggle must remove invalid/future/duplicate history while adding today: ${JSON.stringify(toggled)}`,
);

const futureToggle = toggleWaterChangeDate(['2026-08-12'], '2026-08-14', now);
assert(
  JSON.stringify(futureToggle) === JSON.stringify(['2026-08-12']),
  `future date must not be persisted by toggle: ${JSON.stringify(futureToggle)}`,
);

assert(
  getLatestWaterChangeDate(['2026-08-10', '2026-08-14', '2026-08-12'], now) === '2026-08-12',
  'latest water change must ignore future records',
);

const aquarium: Aquarium = {
  id: 'aq_water_change_test',
  name: 'Water change test',
  fishes: [
    { id: 'stock_1', fishId: 'sp_0001', quantity: 2, entryDate: '2026-08-01' },
  ],
};

const applied = applyWaterChangeHistory(
  aquarium,
  ['2026-08-09', '2026-08-14', '2026-08-12', '2026-08-12'],
  now,
);

assert(
  JSON.stringify(applied.waterChangeHistory) === JSON.stringify(['2026-08-09', '2026-08-12']),
  `apply must keep only unique non-future valid dates: ${JSON.stringify(applied.waterChangeHistory)}`,
);
assert(
  applied.lastWaterChangeDate === new Date(2026, 7, 12, 12, 0, 0, 0).toISOString(),
  `aquarium latest water-change date must come from latest valid history: ${applied.lastWaterChangeDate}`,
);
assert(
  applied.fishes[0].lastWaterChangeDate === applied.lastWaterChangeDate,
  'fish-level lastWaterChangeDate must stay synchronized with aquarium latest history',
);

console.log(JSON.stringify({
  ok: true,
  normalizedHistory: applied.waterChangeHistory,
  latestWaterChangeDate: applied.lastWaterChangeDate,
}, null, 2));
