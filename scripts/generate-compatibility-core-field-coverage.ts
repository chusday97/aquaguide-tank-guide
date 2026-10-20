import { mkdirSync, writeFileSync } from 'node:fs';
import { buildCompatibilityCoreFieldCoverage, buildCompatibilityFastLaneResearchPackets, buildCompatibilityTaxonResearchPlan } from '../src/services/compatibility/compatibility-field-coverage.service';

const root = new URL('../', import.meta.url).pathname;
const outputDir = `${root}docs`;
mkdirSync(outputDir, { recursive: true });
const report = buildCompatibilityCoreFieldCoverage();
const fastLanePackets = buildCompatibilityFastLaneResearchPackets();
const taxonResearchPlan = buildCompatibilityTaxonResearchPlan();
const deferredBacklog = report.backlog.filter(item => !item.completionEligible);
const countValues = (values: string[]) => Object.fromEntries(
  [...new Set(values)].sort().map(value => [value, values.filter(candidate => candidate === value).length]),
);
const deferredBlockerSummary = {
  items: deferredBacklog.length,
  species: new Set(deferredBacklog.map(item => item.speciesId)).size,
  fields: countValues(deferredBacklog.map(item => item.field)),
  blockingTerminalFields: countValues(deferredBacklog.flatMap(item => item.blockingTerminalFields)),
  blockingTerminalReasons: countValues(deferredBacklog.flatMap(item => item.blockingTerminalReasons)),
  blockingTerminalAuthoritySources: countValues(deferredBacklog.flatMap(item => item.blockingTerminalAuthoritySources)),
};

writeFileSync(`${outputDir}/compatibility_core_field_coverage.json`, JSON.stringify({ generatedFrom: 'source-controlled reviewed authority', ...report.summary, rows: report.rows }, null, 2) + '\n');
writeFileSync(`${outputDir}/compatibility_core_field_backlog.json`, JSON.stringify({
  generatedFrom: 'compatibility_core_field_coverage.json',
  policy: 'field-oriented evidence ledger; decisionImpact separates hard decision blockers from soft risk-discovery gaps. Completion-blocked opportunities remain visible with explicit blocker fields/reasons/authority; predation research debt is a safety-risk discovery surface, not a current insufficient_data blocker; no ordinary Pair Rule generation',
  totalItems: report.backlog.length,
  activeCompletionItems: report.backlog.filter(item => item.completionEligible).length,
  deferredOpportunityItems: deferredBacklog.length,
  hardDecisionResearchDebtFields: report.summary.hardDecisionResearchDebtFields,
  softRiskDiscoveryResearchDebtFields: report.summary.softRiskDiscoveryResearchDebtFields,
  predationRiskDiscoveryFields: report.summary.predationRiskDiscoveryFields,
  predationRiskDiscoveryHardReadySpecies: report.summary.predationRiskDiscoveryHardReadySpecies,
  predationRiskDiscoveryVariantIdentityHeldSpecies: report.summary.predationRiskDiscoveryVariantIdentityHeldSpecies,
  predationRiskDiscoveryOtherHardHeldSpecies: report.summary.predationRiskDiscoveryOtherHardHeldSpecies,
  deferredBlockerSummary,
  items: report.backlog,
}, null, 2) + '\n');
writeFileSync(`${outputDir}/compatibility_fast_lane_research_packets.json`, JSON.stringify({
  generatedFrom: 'compatibility_core_field_coverage.json',
  policy: 'only one-field-away fish; promote only direct reviewed exact-taxon evidence; never guess missing authority',
  totalPackets: fastLanePackets.length,
  packets: fastLanePackets,
}, null, 2) + '\n');
writeFileSync(`${outputDir}/compatibility_taxon_research_plan.json`, JSON.stringify({
  generatedFrom: 'compatibility_core_field_backlog.json',
  policy: 'active completion research only: include completionEligible field gaps, defer evidence debt on objects with companion terminal holds; deduplicate source discovery by biological base taxon; variant evidence never auto-promotes without reviewed field-scoped bridging',
  catalogObjects: new Set(taxonResearchPlan.flatMap(item => item.catalogObjects.map(object => object.speciesId))).size,
  totalResearchJobs: taxonResearchPlan.length,
  variantBridgeJobs: taxonResearchPlan.filter(item => item.requiresVariantBridgeReview).length,
  items: taxonResearchPlan,
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
  fastLaneResearchPackets: fastLanePackets.length,
  runtimeReviewedProfiles: report.summary.runtimeReviewedProfileSpecies,
  fishCompatibilityDomainSpecies: report.summary.fishCompatibilityDomainSpecies,
  fishIdentityHeldSpecies: report.summary.fishIdentityHeldSpecies,
  unsupportedDomainSpecies: report.summary.unsupportedDomainSpecies,
  unsupportedDomainSpeciesByLifeType: report.summary.unsupportedDomainSpeciesByLifeType,
  domainOrIdentityHeldSpecies: report.summary.domainOrIdentityHeldSpecies,
  visibleResearchDebtFields: report.summary.visibleResearchDebtFields,
  completionEligibleResearchDebtFields: report.summary.completionEligibleResearchDebtFields,
  deferredResearchDebtFields: report.summary.deferredResearchDebtFields,
  activeCompletionResearchDebtFields: report.summary.activeCompletionResearchDebtFields,
  deferredResearchOpportunityFields: report.summary.deferredResearchOpportunityFields,
  deferredResearchOpportunitySpecies: report.summary.deferredResearchOpportunitySpecies,
  hardDecisionResearchDebtFields: report.summary.hardDecisionResearchDebtFields,
  softRiskDiscoveryResearchDebtFields: report.summary.softRiskDiscoveryResearchDebtFields,
  predationRiskDiscoveryFields: report.summary.predationRiskDiscoveryFields,
  predationRiskDiscoveryHardReadySpecies: report.summary.predationRiskDiscoveryHardReadySpecies,
  predationRiskDiscoveryVariantIdentityHeldSpecies: report.summary.predationRiskDiscoveryVariantIdentityHeldSpecies,
  predationRiskDiscoveryOtherHardHeldSpecies: report.summary.predationRiskDiscoveryOtherHardHeldSpecies,
  taxonResearchJobs: taxonResearchPlan.length,
  taxonResearchCatalogObjects: new Set(taxonResearchPlan.flatMap(item => item.catalogObjects.map(object => object.speciesId))).size,
  variantBridgeJobs: taxonResearchPlan.filter(item => item.requiresVariantBridgeReview).length,
  fieldActionableGaps: report.summary.fieldActionableGaps,
}, null, 2));
