import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/pages/Aquarium.tsx';
let source = readFileSync(path, 'utf8');

const replaceExactlyOnce = (from, to, label) => {
  const first = source.indexOf(from);
  const last = source.lastIndexOf(from);
  if (first < 0) throw new Error(`${label}: expected source fragment was not found`);
  if (first !== last) throw new Error(`${label}: source fragment matched more than once`);
  source = source.replace(from, to);
};

replaceExactlyOnce(
  "import { createAquariumDraft, getAquariumSetupStatus, normalizeAquariumRecord } from '../services/aquarium/aquarium-setup.service';",
  "import { createAquariumDraft, getAquariumSetupFacts, getAquariumSetupStatus, normalizeAquariumRecord } from '../services/aquarium/aquarium-setup.service';",
  'setup facts import',
);

replaceExactlyOnce(
[
  '  const configuredSettingCount = [',
  '    settingsForm.waterType,',
  '    settingsForm.targetTemperature,',
  '    settingsEstimatedWaterLiters > 0,',
  "    currentSubstrate !== '无',",
  '    selectedPlantCount > 0,',
  '    selectedHardscapeCount > 0,',
  '    settingsForm.equipment?.filter,',
  '    settingsForm.equipment?.light,',
  '    settingsForm.equipment?.heater,',
  '    settingsForm.equipment?.oxygen,',
  '  ].filter(Boolean).length;',
].join('\n'),
[
  '  const settingsFacts = getAquariumSetupFacts(settingsForm);',
  '  const configuredSettingCount = [',
  '    settingsFacts.waterTypeKnown,',
  '    settingsFacts.temperatureKnown,',
  '    settingsFacts.dimensionsKnown,',
  '    settingsFacts.substrateKnown,',
  '    selectedPlantCount > 0,',
  '    selectedHardscapeCount > 0,',
  '    settingsFacts.filterKnown,',
  '    settingsFacts.lightKnown,',
  '    settingsFacts.heaterKnown,',
  '    settingsFacts.oxygenKnown,',
  '  ].filter(Boolean).length;',
].join('\n'),
  'configured answer count',
);

replaceExactlyOnce(
[
  '    {',
  "      id: 'substrate',",
  "      title: isEn ? 'Substrate' : '底砂',",
  "      summary: currentSubstrate !== '无' || selectedHardscapeNames.length > 0",
  "        ? [currentSubstrate !== '无' ? (isEn ? (substrateOptions.find(opt => opt.value === currentSubstrate)?.labelEn || currentSubstrate) : currentSubstrate) : null, ...selectedHardscapeNames].filter(Boolean).join(isEn ? ', ' : '、')",
  "        : (isEn ? 'No substrate or hardscape selected' : '未选择底砂或造景'),",
  "      configured: currentSubstrate !== '无' || selectedHardscapeCount > 0,",
  '    },',
].join('\n'),
[
  '    {',
  "      id: 'substrate',",
  "      title: isEn ? 'Substrate' : '底砂',",
  '      summary: settingsFacts.substrateKnown || selectedHardscapeNames.length > 0',
  '        ? [',
  '            settingsFacts.substrateKnown',
  "              ? (currentSubstrate === '无'",
  "                  ? (isEn ? 'Substrate: none' : '底砂：无')",
  '                  : (isEn ? (substrateOptions.find(opt => opt.value === currentSubstrate)?.labelEn || currentSubstrate) : currentSubstrate))',
  "              : (isEn ? 'Substrate not recorded' : '底砂未记录'),",
  '            ...selectedHardscapeNames,',
  "          ].filter(Boolean).join(isEn ? ', ' : '、')",
  "        : (isEn ? 'No substrate or hardscape recorded' : '未记录底砂或造景'),",
  '      configured: settingsFacts.substrateKnown || selectedHardscapeCount > 0,',
  '    },',
].join('\n'),
  'substrate explicit-none state',
);

replaceExactlyOnce(
[
  '    {',
  "      id: 'lighting',",
  "      title: isEn ? 'Lighting' : '灯光',",
  "      summary: settingsForm.equipment?.light && settingsForm.equipment.light !== '无' ",
  "        ? (isEn ? (t(`aquarium.${lightOptionKeys[settingsForm.equipment.light] || 'none'}`) || settingsForm.equipment.light) : settingsForm.equipment.light) ",
  "        : (isEn ? 'No lighting selected' : '未选择灯光'),",
  "      configured: Boolean(settingsForm.equipment?.light && settingsForm.equipment.light !== '无'),",
  '    },',
].join('\n'),
[
  '    {',
  "      id: 'lighting',",
  "      title: isEn ? 'Lighting' : '灯光',",
  '      summary: !settingsFacts.lightKnown',
  "        ? (isEn ? 'Lighting not recorded' : '灯光未记录')",
  "        : settingsForm.equipment?.light === '无'",
  "          ? (isEn ? 'Lighting: none' : '灯光：无')",
  "          : (isEn ? (t(`aquarium.${lightOptionKeys[settingsForm.equipment?.light || ''] || 'none'}`) || settingsForm.equipment?.light) : settingsForm.equipment?.light || ''),",
  '      configured: settingsFacts.lightKnown,',
  '    },',
].join('\n'),
  'lighting explicit-none state',
);

replaceExactlyOnce(
[
  '    {',
  "      id: 'equipment',",
  "      title: isEn ? 'Equipment' : '设备',",
  '      summary: [',
  "        settingsForm.equipment?.filter && settingsForm.equipment.filter !== '无' ",
  "          ? (isEn ? (t(`aquarium.${filterOptionKeys[settingsForm.equipment.filter] || 'none'}`) || settingsForm.equipment.filter) : settingsForm.equipment.filter) ",
  '          : null,',
  "        settingsForm.equipment?.heater ? (isEn ? 'Heater' : '加热棒') : null,",
  "        settingsForm.equipment?.oxygen ? (isEn ? 'Aeration' : '氧气/气泡石') : null,",
  "      ].filter(Boolean).join(isEn ? ', ' : '、') || (isEn ? 'No filter or auxiliary equipment selected' : '未选择过滤或辅助设备'),",
  '      configured: Boolean(',
  "        (settingsForm.equipment?.filter && settingsForm.equipment.filter !== '无')",
  '        || settingsForm.equipment?.heater',
  '        || settingsForm.equipment?.oxygen',
  '      ),',
  '    },',
].join('\n'),
[
  '    {',
  "      id: 'equipment',",
  "      title: isEn ? 'Equipment' : '设备',",
  '      summary: [',
  '        settingsFacts.filterKnown',
  "          ? (settingsForm.equipment?.filter === '无'",
  "              ? (isEn ? 'Filter: none' : '过滤：无')",
  "              : (isEn ? (t(`aquarium.${filterOptionKeys[settingsForm.equipment?.filter || ''] || 'none'}`) || settingsForm.equipment?.filter) : settingsForm.equipment?.filter))",
  "          : (isEn ? 'Filter not recorded' : '过滤未记录'),",
  '        settingsFacts.heaterKnown',
  "          ? (settingsForm.equipment?.heater ? (isEn ? 'Heater: yes' : '加热棒：有') : (isEn ? 'Heater: no' : '加热棒：无'))",
  "          : (isEn ? 'Heater not recorded' : '加热棒未记录'),",
  '        settingsFacts.oxygenKnown',
  "          ? (settingsForm.equipment?.oxygen ? (isEn ? 'Aeration: yes' : '增氧：有') : (isEn ? 'Aeration: no' : '增氧：无'))",
  "          : (isEn ? 'Aeration not recorded' : '增氧未记录'),",
  "      ].filter(Boolean).join(isEn ? ', ' : '、'),",
  '      configured: settingsFacts.filterKnown,',
  '    },',
].join('\n'),
  'equipment explicit answer state',
);

replaceExactlyOnce(
[
  '          <div className="grid grid-cols-2 gap-2">',
  '            {[',
  "              { key: 'heater', label: '加热棒', description: '低温或热带鱼建议开启' },",
  "              { key: 'oxygen', label: '氧气 / 气泡石', description: '高密度或虾缸可开启' },",
  '            ].map(device => {',
  '              const isSelected = Boolean((settingsForm.equipment as any)?.[device.key]);',
  '              return (',
  '                <SelectableOptionCard',
  '                  key={device.key}',
  '                  label={device.label}',
  '                  description={device.description}',
  '                  selected={isSelected}',
  '                  mode="multi"',
  '                  onClick={() => setSettingsForm({',
  '                    ...settingsForm,',
  '                    equipment: {',
  '                      ...(settingsForm.equipment || {}),',
  '                      [device.key]: !isSelected',
  '                    }',
  '                  })}',
  '                />',
  '              );',
  '            })}',
  '          </div>',
].join('\n'),
[
  '          <div className="grid gap-3">',
  '            {[',
  "              { key: 'heater' as const, label: isEn ? 'Heater' : '加热棒', description: isEn ? 'Record whether this tank has a heater.' : '明确记录当前鱼缸是否有加热棒' },",
  "              { key: 'oxygen' as const, label: isEn ? 'Aeration' : '氧气 / 气泡石', description: isEn ? 'Record whether this tank has aeration.' : '明确记录当前鱼缸是否有增氧设备' },",
  '            ].map(device => {',
  '              const currentValue = settingsForm.equipment?.[device.key];',
  '              return (',
  '                <div key={device.key} className="grid gap-2 rounded-[14px] bg-bg/60 p-3">',
  '                  <div className="flex items-start justify-between gap-3">',
  '                    <div>',
  '                      <div className="text-[12px] font-black text-ink">{device.label}</div>',
  '                      <div className="mt-0.5 text-[10px] font-medium text-ink/45">{device.description}</div>',
  '                    </div>',
  '                    <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-ink/45">',
  "                      {typeof currentValue === 'boolean' ? (isEn ? 'Recorded' : '已记录') : (isEn ? 'Not recorded' : '未记录')}",
  '                    </span>',
  '                  </div>',
  '                  <div className="grid grid-cols-2 gap-2">',
  '                    {[',
  "                      { value: true, label: isEn ? 'Yes' : '有' },",
  "                      { value: false, label: isEn ? 'No' : '没有' },",
  '                    ].map(option => (',
  '                      <SelectableOptionCard',
  '                        key={`${device.key}-${String(option.value)}`}',
  '                        label={option.label}',
  '                        selected={currentValue === option.value}',
  '                        onClick={() => setSettingsForm({',
  '                          ...settingsForm,',
  '                          equipment: {',
  '                            ...(settingsForm.equipment || {}),',
  '                            [device.key]: option.value,',
  '                          },',
  '                        })}',
  '                      />',
  '                    ))}',
  '                  </div>',
  '                </div>',
  '              );',
  '            })}',
  '          </div>',
].join('\n'),
  'auxiliary equipment three-state controls',
);

replaceExactlyOnce(
  "                `已配置 ${configuredSettingCount} 项`,",
  "                isEn ? `${configuredSettingCount} recorded` : `已记录 ${configuredSettingCount} 项`,",
  'settings recorded count label',
);

replaceExactlyOnce(
  "                              {item.configured ? '已配置' : '待配置'}",
  "                              {item.configured ? (isEn ? 'Recorded' : '已记录') : (isEn ? 'Missing' : '待记录')}",
  'settings item status label',
);

writeFileSync(path, source);
console.log('Aquarium three-state settings patch applied.');
