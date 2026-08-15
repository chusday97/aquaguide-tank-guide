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
const start = source.indexOf(legacyStartMarker);
const end = source.indexOf(nextMarker, start);
if (start < 0 || end < 0 || end <= start) throw new Error('legacy detail block markers not found');
source = source.slice(0, start) + source.slice(end);

writeFileSync(path, source);
console.log('Removed disabled legacy aquarium detail editor and local-only handlers.');
