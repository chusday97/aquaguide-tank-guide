import { fishData } from '../../data/fishData';
import { isReviewedColorOnlyVariantKey } from '../../data/catalogCanonicalIdentity';
import {
  COMPATIBILITY_HARD_DECISION_FIELDS,
  buildCompatibilityCoreFieldCoverage,
} from './compatibility-field-coverage.service';

export type VariantHoldClass =
  | 'color_only_identity_candidate'
  | 'morphology_variant'
  | 'trade_or_lineage_label'
  | 'size_grade_or_trade_label';

const authoritativeStatuses = new Set(['reviewed_supported', 'reviewed_neutral_or_negative']);

const variantSuffix = (scientificName: string) => (
  scientificName.split(/\bvar\.\s*/i)[1]?.trim() ?? ''
);

export const classifyCompatibilityVariantHold = (
  scientificName: string,
  name: string,
): VariantHoldClass => {
  const suffix = variantSuffix(scientificName);
  const normalized = `${suffix} ${name}`.toLowerCase();

  // Morphology-sensitive labels always win over color tokens. Inspect both the
  // scientific variant suffix and localized catalog name: commercial names may
  // encode body/fin form only in Chinese (for example 半月 or 皮球).
  if (/longfin|long fin|high fin|halfmoon|crowntail|crown|dumbo|ranchu|oranda|telescope|tigerhead|butterfly|black moor|balloon|jellybean|长鳍|大帆|高鳍|半月|冠尾|狮头|兰寿|龙睛|蝶尾|虎头|球形|皮球|短身/.test(normalized)) {
    return 'morphology_variant';
  }
  if (/^xl$/i.test(suffix)) return 'size_grade_or_trade_label';

  // A color-looking suffix is not enough when the catalog/common name signals
  // a commercial lineage or hybrid identity. These stay fail-closed until the
  // lineage itself is reviewed.
  if (/鹦鹉|parrot|hybrid|crossbreed|cross-bred/.test(normalized)) {
    return 'trade_or_lineage_label';
  }

  if (isReviewedColorOnlyVariantKey(suffix)) return 'color_only_identity_candidate';
  return 'trade_or_lineage_label';
};

export const buildCompatibilityVariantHoldClassification = () => {
  const coverage = buildCompatibilityCoreFieldCoverage();
  const rowById = new Map(coverage.rows.map(row => [row.speciesId, row]));

  const held = coverage.backlog
    .filter(item => item.field === 'predation')
    .flatMap(item => {
      const row = rowById.get(item.speciesId);
      const species = fishData.find(entry => entry.id === item.speciesId);
      if (!row || !species) return [];

      const unresolvedHard = COMPATIBILITY_HARD_DECISION_FIELDS
        .filter(field => !authoritativeStatuses.has(row.fields[field].status))
        .map(field => row.fields[field]);

      const identityOrVariantHeld = unresolvedHard.length > 0
        && unresolvedHard.every(cell => (
          cell.authoritySource === 'identity_boundary'
          || cell.authoritySource === 'variant_evidence_ceiling'
        ));
      if (!identityOrVariantHeld) return [];

      const suffix = variantSuffix(species.scientificName);
      const classification = classifyCompatibilityVariantHold(species.scientificName, species.name);
      return [{
        speciesId: species.id,
        name: species.name,
        scientificName: species.scientificName,
        variantSuffix: suffix,
        classification,
        candidateForAutomaticInheritance: false,
        nextAction: classification === 'color_only_identity_candidate'
          ? 'review_identity_bridge_then_reuse_existing_color_morph_policy'
          : classification === 'morphology_variant'
            ? 'review_exact_variant_identity_and_field_scoped_authority'
            : classification === 'size_grade_or_trade_label'
              ? 'resolve_catalog_semantics_before_compatibility_inheritance'
              : 'review_trade_or_lineage_identity_before_any_inheritance',
      }];
    })
    .sort((a, b) => a.speciesId.localeCompare(b.speciesId));

  const byClass = held.reduce<Record<VariantHoldClass, number>>((acc, item) => {
    acc[item.classification] += 1;
    return acc;
  }, {
    color_only_identity_candidate: 0,
    morphology_variant: 0,
    trade_or_lineage_label: 0,
    size_grade_or_trade_label: 0,
  });

  return {
    version: 1,
    invariant: 'Variant-name triage may prioritize identity research but never grants Compatibility inheritance or safety authority.',
    policy: {
      colorOnlyRequiresReviewedIdentityBridge: true,
      morphologyAutoInheritanceAllowed: false,
      tradeLabelAutoInheritanceAllowed: false,
      sizeGradeAutoInheritanceAllowed: false,
      pairPrecomputationRequired: false,
    },
    summary: {
      heldCatalogObjects: held.length,
      ...byClass,
    },
    priority: [
      'color_only_identity_candidate',
      'trade_or_lineage_label',
      'morphology_variant',
      'size_grade_or_trade_label',
    ] as VariantHoldClass[],
    items: held,
  };
};
