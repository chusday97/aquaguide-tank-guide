import { mkdirSync, writeFileSync } from 'node:fs';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';

const root = new URL('../', import.meta.url).pathname;
const outputDir = `${root}docs`;
mkdirSync(outputDir, { recursive: true });
const report = buildCompatibilityCoreFieldCoverage();

writeFileSync(`${outputDir}/compatibility_core_field_coverage.json`, JSON.stringify({ generatedFrom: 'source-controlled reviewed authority', ...report.summary, rows: report.rows }, null, 2) + '\n');
writeFileSync(`${outputDir}/compatibility_core_field_backlog.json`, JSON.stringify({
  generatedFrom: 'compatibility_core_field_coverage.json',
  policy: 'field-oriented gaps only; no ordinary Pair Rule generation; terminal identity/evidence/domain holds excluded',
  totalItems: report.backlog.length,
  items: report.backlog,
}, null, 2) + '\n');

const header = ['species_id','name','scientific_name','life_type','reviewed_profile','generic_onboarding_ready','authoritative_field_count','actionable_gap_count','terminal_gap_count',...report.summary.coreFields];
const quote = (value: unknown) => { const text = String(value ?? ''); return /[,"\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
const lines = [header.join(','), ...report.rows.map(row => [
  row.speciesId,row.name,row.scientificName,row.lifeType,row.reviewedProfile,row.genericOnboardingReady ? 'yes' : 'no',
  row.authoritativeFieldCount,row.actionableGapCount,row.terminalGapCount,
  ...report.summary.coreFields.map(field => row.fields[field].status),
].map(quote).join(','))];
writeFileSync(`${outputDir}/compatibility_core_field_coverage.csv`, lines.join('\n') + '\n');

console.log(JSON.stringify({
  species: report.summary.speciesCount,
  ready: report.summary.genericOnboardingReadySpecies,
  coreFieldComplete: report.summary.coreFieldCompleteSpecies,
  oneFieldGap: report.summary.oneFieldGapSpecies,
  runtimeReviewedProfiles: report.summary.runtimeReviewedProfileSpecies,
  domainOrIdentityHeldSpecies: report.summary.domainOrIdentityHeldSpecies,
  actionableBacklog: report.backlog.length,
  fieldActionableGaps: report.summary.fieldActionableGaps,
}, null, 2));
