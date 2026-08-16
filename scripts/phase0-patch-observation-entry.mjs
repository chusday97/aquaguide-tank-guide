import { readFile, writeFile } from 'node:fs/promises';

const path = 'src/pages/Aquarium.tsx';
const source = await readFile(path, 'utf8');

if (source.includes("id: 'recordObservation'")) {
  console.log('recordObservation quick action already present; no patch needed');
  process.exit(0);
}

const anchor = "    {\n      id: 'recordWaterChange',";
const matches = source.split(anchor).length - 1;
if (matches !== 1) {
  throw new Error(`Expected exactly one recordWaterChange quick-action anchor, found ${matches}`);
}

const block = `    {
      id: 'recordObservation',
      label: isEn ? 'Record Observation' : '记录观察',
      description: isEn
        ? (!hasStockedAnimals
          ? 'Add livestock first'
          : todayObservationStatus === 'abnormal'
            ? 'Abnormality noted today'
            : todayObservationStatus === 'normal'
              ? 'Observed today'
              : 'Record normal or abnormal condition')
        : (!hasStockedAnimals
          ? '添加生物后使用'
          : todayObservationStatus === 'abnormal'
            ? '今日已发现异常'
            : todayObservationStatus === 'normal'
              ? '今日已观察'
              : '记录正常或异常状态'),
      icon: <Activity className="h-4 w-4" />,
      onClick: () => setIsObservationOpen(true),
      tone: !hasStockedAnimals
        ? 'muted' as const
        : todayObservationStatus === 'abnormal'
          ? 'warning' as const
          : todayObservationStatus === 'normal'
            ? 'normal' as const
            : 'info' as const,
      active: Boolean(todayObservationStatus),
      disabled: !hasStockedAnimals,
    },
`;

const next = source.replace(anchor, `${block}${anchor}`);
if (next === source) throw new Error('Observation quick-action patch made no change');

await writeFile(path, next, 'utf8');
console.log('Inserted reachable recordObservation quick action');
