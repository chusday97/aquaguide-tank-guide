import { fishData } from '../src/data/fishData';
import {
  buildReviewedCompatibilityProfileFromCatalogFields,
  getCompatibilityEvidenceAudit,
} from '../src/data/compatibilityEvidence';

export const getCompatibilityProductionMaterializedAuthority = () => {
  const audit = getCompatibilityEvidenceAudit();
  const profilesById = new Map(audit.reviewedProfiles.map(profile => [profile.speciesId, profile]));
  const fieldDerivedProfileIds: string[] = [];

  for (const fish of fishData) {
    if (profilesById.has(fish.id)) continue;
    const profile = buildReviewedCompatibilityProfileFromCatalogFields(fish.id);
    if (!profile) continue;
    profilesById.set(fish.id, profile);
    fieldDerivedProfileIds.push(fish.id);
  }

  const profiles = [...profilesById.values()].sort((a, b) => a.speciesId.localeCompare(b.speciesId));
  const evidenceById = new Map<string, (typeof profiles)[number]['citations'][number]>();
  for (const profile of profiles) for (const citation of profile.citations) evidenceById.set(citation.id, citation);
  for (const rule of audit.reviewedPairRules) for (const citation of rule.citations) evidenceById.set(citation.id, citation);
  for (const risk of audit.reviewedStageRiskProfiles) for (const citation of risk.citations || []) evidenceById.set(citation.id, citation);

  return {
    profiles,
    fieldDerivedProfileIds: fieldDerivedProfileIds.sort(),
    pairRules: audit.reviewedPairRules,
    stageRisks: audit.reviewedStageRiskProfiles,
    evidenceSources: [...evidenceById.values()].sort((a, b) => a.id.localeCompare(b.id)),
  };
};
