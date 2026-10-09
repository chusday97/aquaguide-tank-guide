-- HOLD / REPOSITORY-ONLY OWNERSHIP ARTIFACT.
-- DO NOT APPLY. This file records the future DB owner for reviewed runtime
-- compatibility Profiles that already exist in local/file authority.
-- A DB-authority switch requires a separate explicit approval and a replacement
-- executable migration. Accidental execution must fail closed.

do $$
begin
  raise exception 'HOLD: repository-only compatibility profile owner; do not apply without explicit DB-authority approval';
end $$;

-- Owned reviewed Profile: sp_0016 / 金波子 / Mikrogeophagus ramirezi var. Gold
-- behavior_traits: peaceful, breeding_defense
-- minimum_group_size: null
-- predation_targets: []
-- confidence: high
-- required_facts: water, temperature, ph, adult_size, social_behavior, breeding_behavior
-- evidence:
--   seriouslyfish-mikrogeophagus-ramirezi
--   fishbase-mikrogeophagus-ramirezi
-- Compatibility held-profile drift: sp_0016
-- Compatibility held-profile evidence drift: sp_0016

-- Owned reviewed Profile: sp_0475 / 高体鳑鲏 / Rhodeus ocellatus
-- water_types: freshwater, brackish
-- behavior_traits: schooling
-- minimum_group_size: 3
-- predation_targets: []
-- confidence: medium
-- required_facts: water, temperature, adult_size, social_behavior
-- evidence:
--   batch03-fishbase-rhodeus-ocellatus
--   jstage-rhodeus-ocellatus-schooling
-- Compatibility held-profile drift: sp_0475
-- Compatibility held-profile evidence drift: sp_0475
