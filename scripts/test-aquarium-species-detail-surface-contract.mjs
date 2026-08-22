import fs from 'node:fs';

const source = fs.readFileSync('src/pages/Aquarium.tsx', 'utf8');

const requireMarker = (marker, message) => {
  if (!source.includes(marker)) throw new Error(message || `Missing marker: ${marker}`);
};
const forbidMarker = (marker, message) => {
  if (source.includes(marker)) throw new Error(message || `Forbidden marker: ${marker}`);
};

requireMarker('<SpeciesDetailDialog', 'Aquarium must render the shared SpeciesDetailDialog.');
requireMarker('fish={selectedAqFish?.fish || null}', 'Aquarium-owned species selection must drive the live detail surface.');
requireMarker('source="aquarium"', 'Aquarium species detail must use aquarium-specific semantics.');
requireMarker('open={Boolean(selectedAqFish)}', 'Selected aquarium species must visibly open the detail surface.');
requireMarker('inCalculator={Boolean(selectedAqFish && getCompatibilitySelection().includes(selectedAqFish.fish.id))}', 'Detail must read compatibility selection without mutating it on open.');
requireMarker('onGoCalculator={() => {', 'Compatibility navigation must remain an explicit action from detail.');
requireMarker('onOpenDetail={(fish, record) => {', 'Livestock roster must keep a real detail opener.');
requireMarker("openAquariumSpeciesDetail(fish, record, 'aquarium-records');", 'Roster detail must preserve Aquarium return context.');

forbidMarker('Legacy fish detail modal is intentionally disabled', 'Disabled legacy species modal must be removed.');
forbidMarker('<Dialog open={false}', 'Aquarium must not keep a dead disabled detail Dialog.');

console.log('Aquarium species detail surface contract passed: roster selection opens the shared wide detail surface without implicit compatibility selection.');
