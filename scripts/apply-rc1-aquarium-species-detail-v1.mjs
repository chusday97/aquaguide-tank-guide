import fs from 'node:fs';

const path = 'src/pages/Aquarium.tsx';
let source = fs.readFileSync(path, 'utf8');

const legacyStart = '      {/* Legacy fish detail modal is intentionally disabled; aquarium entries now use SpeciesDetailDialog. */}\n      <Dialog open={false}';
const rosterStart = '      <LivestockRosterDialog\n';
const startIndex = source.indexOf(legacyStart);
const rosterIndex = source.indexOf(rosterStart, startIndex);
if (startIndex < 0 || rosterIndex < 0) {
  throw new Error(`Legacy detail removal anchors not found (${startIndex}, ${rosterIndex})`);
}
if (source.indexOf(legacyStart, startIndex + 1) >= 0) throw new Error('Legacy detail start anchor is not unique');

const replacement = `      <SpeciesDetailDialog
        fish={selectedAqFish?.fish || null}
        open={Boolean(selectedAqFish)}
        source="aquarium"
        aquariumContext={activeAquarium}
        imageSrc={selectedAqFish ? getSpeciesDisplayImage(selectedAqFish.fish) : ''}
        owned={Boolean(selectedAqFish)}
        inCalculator={Boolean(selectedAqFish && getCompatibilitySelection().includes(selectedAqFish.fish.id))}
        inWishlist={Boolean(selectedAqFish && wishlistFishIds.has(selectedAqFish.fish.id))}
        onOpenChange={(open) => {
          if (!open) closeAquariumSpeciesDetail();
        }}
        onSelectSpecies={(fish) => {
          const aquariumRecord = activeAquarium.fishes.find(record => record.fishId === fish.id);
          if (!aquariumRecord) return;
          setSelectedAqFish({ fish, aqFish: aquariumRecord });
        }}
        onAddToCalculator={(fish) => {
          const current = getCompatibilitySelection();
          if (!current.includes(fish.id)) setCompatibilitySelection([...current, fish.id]);
        }}
        onToggleWishlist={toggleWishlist}
        onGoCalculator={() => {
          const returnContext = speciesDetailNavigationContextRef.current;
          closeAquariumSpeciesDetail(false);
          navigateToRoute(
            taskRoutes.encyclopedia.compatibility,
            returnContext ? { returnContext } : undefined,
          );
        }}
        onOpenTankSettings={(panel) => {
          closeAquariumSpeciesDetail(false);
          openAquariumSettings(panel);
        }}
      />

`;

source = `${source.slice(0, startIndex)}${replacement}${source.slice(rosterIndex)}`;
fs.writeFileSync(path, source);
console.log('Applied Aquarium species detail repair: live SpeciesDetailDialog replaces disabled legacy modal.');
