import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const provider = read('src/components/layout/WorkspaceNavigationProvider.tsx');
const app = read('src/App.tsx');
const settings = read('src/pages/Settings.tsx');
const assistant = read('src/pages/AIAssistant.tsx');
const search = read('src/pages/Search.tsx');
const collectionHub = read('src/pages/CollectionHub.tsx');
const speciesDetail = read('src/components/SpeciesDetailDialog.tsx');
const care = read('src/pages/CareEncyclopedia.tsx');
const collection = read('src/pages/Collection.tsx');
const handoff = read('HANDOFF.md');

assert(provider.includes("[data-feature-building]"), 'Feature gate must read explicit data-feature-building attributes.');
assert(!provider.includes("const text = (target.textContent"), 'Feature gate must not infer availability from visible text.');
assert(app.includes('isSubMenuPathActive'), 'Sidebar must use semantic submenu matching.');
assert(app.includes('<Collection module="achievements" />'), 'Direct achievements route must render the building surface.');
assert(!settings.includes('window.confirm('), 'Settings must not use window.confirm.');
assert(!assistant.includes('confirm(isEn'), 'AI assistant must not use native confirm.');
assert(settings.includes('useUnsavedChangesGuard'), 'Settings must use the shared unsaved changes guard.');
assert(search.includes('/encyclopedia?species=') && search.includes('&source=search'), 'Search species cards must open the species object.');
assert(assistant.includes('source=assistant'), 'AI species cards must open species profiles.');
assert(assistant.includes('addToWishlist(speciesId)'), 'AI wishlist mutation must remain a separate control.');
assert(speciesDetail.includes('data-feature-building="sharing"'), 'Species detail sharing must be explicitly gated.');
assert(care.includes("detail: { feature: 'sharing' }"), 'Care sharing must use the building feature gate.');
assert(collection.includes("detail: { feature: 'sharing' }"), 'Collection care sharing must use the building feature gate.');
assert(collectionHub.includes('navigate(moduleRoutes[id])'), 'Collection hub building entry must navigate to its building page.');
assert(handoff.includes('2026-08-10 文案与交互一致性基线'), 'Handoff must include the current interaction baseline.');

if (failures.length) {
  console.error('Interaction consistency audit failed:');
  failures.forEach(item => console.error('- ' + item));
  process.exit(1);
}
console.log('Interaction consistency audit passed.');
