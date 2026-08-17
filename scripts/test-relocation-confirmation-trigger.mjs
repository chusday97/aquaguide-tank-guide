import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const panel = readFileSync('src/components/compatibility/InterventionComparisonPanel.tsx', 'utf8');

assert.match(panel, /export type RelocationConfirmationIntent = \{/);
assert.match(panel, /onRequestRelocationConfirmation\?: \(intent: RelocationConfirmationIntent\) => void/);
assert.match(panel, /item\.status === 'compatible_by_current_evidence'\s*&&\s*onRequestRelocationConfirmation/);
assert.match(panel, /data-open-relocation-confirmation=/);
assert.match(panel, /onRequestRelocationConfirmation\(\{[\s\S]*subjectSpeciesId: option\.subjectSpeciesId,[\s\S]*quantity: option\.quantity,[\s\S]*destinationAquariumId: item\.aquariumId/);
assert.match(panel, /打开迁移确认/);
assert.match(panel, /Open relocation confirmation/);
assert.match(panel, /data-intervention-panel-mutation-free="true"/);

assert.doesNotMatch(panel, /AquaGuideRepository/);
assert.doesNotMatch(panel, /relocateLivestock\s*\(/);
assert.doesNotMatch(panel, /apiRequest\s*\(/);
assert.doesNotMatch(panel, /from ['"][^'"]*supabase/);
assert.doesNotMatch(panel, /executeFreshRelocation\s*\(/);

console.log('relocation confirmation trigger passed: compatible formal destinations may open confirmation, while the comparison panel remains mutation-free');
