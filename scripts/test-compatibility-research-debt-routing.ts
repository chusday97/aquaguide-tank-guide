import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  buildCompatibilityResearchDebtRoutingReport,
} from '../src/services/compatibility/taxon-authority-research.service';

const report = buildCompatibilityResearchDebtRoutingReport();
const { summary } = report;

assert.equal(summary.catalogObjects, 486);
assert.equal(summary.fullAuthorityReadySpecies, 122);
assert.equal(summary.decisionReadySoftDebtSpecies, 22);
assert.equal(summary.decisionReadySoftDebtFields, 37);
assert.equal(summary.immediateDecisionResearchSpecies, 0, 'no current catalog object should spend source-research capacity unless it can unlock a hard decision');
assert.equal(summary.immediateDecisionResearchFields, 0);
assert.equal(summary.optionalRiskResearchSpecies, 2);
assert.equal(summary.optionalRiskResearchFields, 2);
assert.equal(summary.identityFirstSpecies, 157, 'identity debt is the current primary blocker inside the fish Compatibility domain');
assert.equal(summary.domainExtensionSpecies, 167, 'non-fish catalog objects must be separated from fish identity debt before prioritization');
assert.equal(summary.hardEvidenceCeilingSpecies, 7);
assert.equal(summary.notApplicableSpecies, 11);
assert.equal(summary.otherHoldSpecies, 0);

assert.equal(summary.legacyVisibleBacklogItems, 47);
assert.equal(summary.legacyBacklogImmediateResearchItems, 0, 'the old 47-item predation ledger must not be presented as an active research queue');
assert.equal(summary.legacyBacklogIdentityFirstItems, 37);
assert.equal(summary.legacyBacklogDeferredSpeciesResearchItems, 10);

const decisionReadyDebt = report.items.filter(item => item.lane === 'decision_ready_soft_debt');
assert.equal(decisionReadyDebt.length, 22);
assert.ok(decisionReadyDebt.every(item => item.decisionReady));
assert.ok(decisionReadyDebt.every(item => item.hardDecisionGaps.length === 0), 'decision-ready soft debt must never contain hard-decision gaps');
assert.ok(decisionReadyDebt.every(item => item.immediateResearchFields.length === 0));
assert.equal(
  decisionReadyDebt.reduce((count, item) => count + item.optionalResearchFields.length, 0),
  2,
  'only two soft-risk fields remain eligible for optional non-blocking research',
);

const identityFirst = report.items.filter(item => item.lane === 'identity_first');
assert.ok(identityFirst.every(item => item.hardDecisionGaps.some(field => field.route === 'identity_resolution_required')));
const hardCeilings = report.items.filter(item => item.lane === 'hard_evidence_ceiling');
assert.ok(hardCeilings.every(item => item.hardDecisionGaps.some(field => field.route === 'public_evidence_ceiling')));
const domainExtension = report.items.filter(item => item.lane === 'domain_extension');
assert.ok(domainExtension.every(item => item.lifeType !== 'fish'), 'species-level domain routing must separate non-fish objects before interpreting field-level identity holds');

assert.equal(report.legacyBacklogRouting.length, 47);
assert.ok(report.legacyBacklogRouting.every(item => item.completionEligible === false));
assert.equal(report.legacyBacklogRouting.filter(item => item.route === 'identity_resolution_required').length, 37);
assert.equal(report.legacyBacklogRouting.filter(item => item.route === 'species_targeted_research').length, 10);

const artifact = JSON.parse(readFileSync('docs/compatibility_research_debt_routing.json', 'utf8')) as ReturnType<typeof buildCompatibilityResearchDebtRoutingReport> & { generatedFrom?: string; generatedAt?: string };
assert.equal(artifact.generatedAt, undefined);
assert.equal(artifact.generatedFrom, 'compatibility_core_field_coverage.json');
assert.equal(artifact.policy, report.policy);
assert.deepEqual(artifact.summary, report.summary);
assert.deepEqual(artifact.items, report.items);
assert.deepEqual(artifact.legacyBacklogRouting, report.legacyBacklogRouting);

console.log('PASS research debt is routed by decision impact rather than raw missing-field count');
console.log('PASS legacy 47-item predation backlog has zero immediate research work');
console.log('PASS identity-first is the dominant current blocker and decision-ready soft debt remains non-blocking');
