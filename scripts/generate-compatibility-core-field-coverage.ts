import { mkdirSync, writeFileSync } from 'node:fs';
import { buildCompatibilityCoreFieldCoverage, buildCompatibilityFastLaneResearchPackets, buildCompatibilityTaxonResearchPlan } from '../src/services/compatibility/compatibility-field-coverage.service';
import { buildCompatibilityGenusAuthorityResearchPlan } from '../src/services/compatibility/taxon-authority-research.service';

const root = new URL('../', import.meta.url).pathname;
const outputDir = `${root}docs`;
mkdirSync(outputDir, { recursive: true });
const report = buildCompatibilityCoreFieldCoverage();
const fastLanePackets = buildCompatibilityFastLaneResearchPackets();
const taxonResearchPlan = buildCompatibilityTaxonResearchPlan();
const genusAuthorityResearchPlan = buildCompatibilityGenusAuthorityResearchPlan();
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
  policy: 'field-oriented evidence ledger; decisionImpact separates hard decision blockers from soft risk-discovery gaps. Hard-decision research is deferred only by companion hard-decision terminal holds; soft risk-discovery work remains conservative and defers behind any companion terminal hold. All deferred opportunities stay visible with explicit blocker fields/reasons/authority; no ordinary Pair Rule generation',
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
  policy: 'active completion research only: prioritize hard-decision gaps unless another hard-decision terminal hold remains; soft risk-discovery gaps still defer behind companion terminal holds. Deduplicate source discovery by biological base taxon; variant evidence never auto-promotes without reviewed field-scoped bridging',
  catalogObjects: new Set(taxonResearchPlan.flatMap(item => item.catalogObjects.map(object => object.speciesId))).size,
  totalResearchJobs: taxonResearchPlan.length,
  variantBridgeJobs: taxonResearchPlan.filter(item => item.requiresVariantBridgeReview).length,
  items: taxonResearchPlan,
}, null, 2) + '\n');
writeFileSync(`${outputDir}/compatibility_genus_authority_research_plan.json`, JSON.stringify({
  generatedFrom: 'compatibility_core_field_coverage.json',
  policy: 'identity-ready exact species only; direct genus-wide evidence is required; agreement among species pages is never genus authority; ornamental variants are excluded by default; automated research may create draft candidates but never auto-promotes production authority',
  totalResearchJobs: genusAuthorityResearchPlan.length,
  impactedSpecies: new Set(genusAuthorityResearchPlan.flatMap(item => item.impactedSpeciesIds)).size,
  items: genusAuthorityResearchPlan,
}, null, 2) + '\n');

const header = ['species_id','name','scientific_name','life_type','reviewed_profile','generic_onboarding_ready','decision_ready','authoritative_field_count','actionable_gap_count','terminal_gap_count',...report.summary.coreFields];
const quote = (value: unknown) => { const text = String(value ?? ''); return /[,"\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
const lines = [header.join(','), ...report.rows.map(row => [
  row.speciesId,row.name,row.scientificName,row.lifeType,row.reviewedProfile,row.genericOnboardingReady ? 'yes' : 'no',row.decisionReady ? 'yes' : 'no',
  row.authoritativeFieldCount,row.actionableGapCount,row.terminalGapCount,
  ...report.summary.coreFields.map(field => row.fields[field].status),
].map(quote).join(','))];
writeFileSync(`${outputDir}/compatibility_core_field_coverage.csv`, lines.join('\n') + '\n');

console.log(JSON.stringify({
  species: report.summary.speciesCount,
  ready: report.summary.genericOnboardingReadySpecies,
  decisionReady: report.summary.decisionReadySpecies,
  decisionReadyButRiskIncomplete: report.summary.decisionReadyButRiskIncompleteSpecies,
  hardDecisionHeld: report.summary.hardDecisionHeldSpecies,
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
  genusAuthorityResearchJobs: genusAuthorityResearchPlan.length,
  genusAuthorityImpactedSpecies: new Set(genusAuthorityResearchPlan.flatMap(item => item.impactedSpeciesIds)).size,
  fieldActionableGaps: report.summary.fieldActionableGaps,
}, null, 2));
