import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/pages/Aquarium.tsx';
let source = readFileSync(path, 'utf8');

const removeExactlyOnce = (fragment, label) => {
  const first = source.indexOf(fragment);
  const last = source.lastIndexOf(fragment);
  if (first < 0) throw new Error(`${label}: expected fragment not found`);
  if (first !== last) throw new Error(`${label}: fragment matched more than once`);
  source = source.replace(fragment, '');
};

removeExactlyOnce([
  '  const handleUpdateEntryDate = (fishId: string, newDate: string) => {',
  '    if (!activeAquarium) return;',
  '    const updated = aquariums.map(a => ',
  '      a.id === activeId ? {',
  '        ...a,',
  '        fishes: a.fishes.map(f => f.id === fishId ? { ...f, entryDate: new Date(newDate).toISOString() } : f)',
  '      } : a',
  '    );',
  '    saveAquariums(updated);',
  '    if (selectedAqFish && selectedAqFish.aqFish.id === fishId) {',
  '      setSelectedAqFish({ ...selectedAqFish, aqFish: { ...selectedAqFish.aqFish, entryDate: new Date(newDate).toISOString() } });',
  '    }',
  '  };',
  '',
  '  const handleUpdateQuantity = (fishId: string, newQty: number) => {',
  '    if (!activeAquarium || newQty < 1) return;',
  '    const updated = aquariums.map(a => ',
  '      a.id === activeId ? {',
  '        ...a,',
  '        fishes: a.fishes.map(f => f.id === fishId ? { ...f, quantity: newQty } : f)',
  '      } : a',
  '    );',
  '    saveAquariums(updated);',
  '    if (selectedAqFish && selectedAqFish.aqFish.id === fishId) {',
  '      setSelectedAqFish({ ...selectedAqFish, aqFish: { ...selectedAqFish.aqFish, quantity: newQty } });',
  '    }',
  '  };',
  '',
].join('\n'), 'legacy direct livestock handlers');

const legacyStartMarker = '      {/* Legacy fish detail modal is intentionally disabled; aquarium entries now use SpeciesDetailDialog. */}';
const nextMarker = '      <LivestockRosterDialog';
const legacyStart = source.indexOf(legacyStartMarker);
const legacyEnd = source.indexOf(nextMarker, legacyStart);
if (legacyStart < 0 || legacyEnd < 0 || legacyEnd <= legacyStart) throw new Error('legacy detail block markers not found');
source = source.slice(0, legacyStart) + source.slice(legacyEnd);

const settingsModalStart = source.indexOf('      {/* Settings Modal */}');
const disabledSettingsStart = source.indexOf("              {false && activeSettingsPanel === 'size' && (", settingsModalStart);
const settingsFooterMarker = '          <DialogFooter className="shrink-0 border-t border-white bg-white/95 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 md:px-6">';
const settingsFooter = source.indexOf(settingsFooterMarker, disabledSettingsStart);
if (settingsModalStart < 0 || disabledSettingsStart < 0 || settingsFooter < 0 || settingsFooter <= disabledSettingsStart) {
  throw new Error('disabled settings block markers not found');
}
const disabledSettingsTail = source.slice(disabledSettingsStart, settingsFooter);
if (!disabledSettingsTail.includes('{false && activeSettingsPanel && (')) {
  throw new Error('disabled settings summary was not inside the removal range');
}
source = source.slice(0, disabledSettingsStart) + '            </div>\n          </div>\n' + source.slice(settingsFooter);

writeFileSync(path, source);
console.log('Removed disabled legacy aquarium detail and settings editors plus local-only handlers.');
