import fs from 'node:fs';

const path = 'src/i18n/index.ts';
let s = fs.readFileSync(path, 'utf8');
const pairs = [
  ["achievementsDescription: 'Automatic progress and next steps'", "achievementsDescription: 'Coming soon'"],
  ["relationshipTitle: 'Key subjects and relationships'", "relationshipTitle: 'Key situation'"],
  ["focus: 'Current focus'", "focus: 'Focus'"],
  ["noSubject: 'No visual subject available'", "noSubject: 'No related subjects'"],
  ["expandDetails: 'Expand evidence · {{count}} items'", "expandDetails: 'View evidence · {{count}} items'"],
  ["collapseDetails: 'Collapse evidence'", "collapseDetails: 'Hide evidence'"],
  ["confidence: { high: 'Clear visual features', medium: 'Moderate visual evidence', low: 'Limited visual evidence' }", "confidence: { high: 'High confidence', medium: 'Medium confidence', low: 'Low confidence' }"],
];
for (const [from, to] of pairs) {
  if (!s.includes(from)) throw new Error(`Missing English copy target: ${from}`);
  s = s.replace(from, to);
}
fs.writeFileSync(path, s);
console.log('Seventh English copy follow-up applied.');
