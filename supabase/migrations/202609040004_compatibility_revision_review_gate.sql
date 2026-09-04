-- Compatibility human-review gate. Code-only migration; do not apply to Production in ordinary Admin work.

alter table public.species_compatibility_profile_revisions
  add column impact_report jsonb not null default '{}'::jsonb
    check (jsonb_typeof(impact_report) = 'object'),
  add column impact_checked_at timestamptz,
  add column review_note text;

alter table public.species_pair_compatibility_rule_revisions
  add column impact_report jsonb not null default '{}'::jsonb
    check (jsonb_typeof(impact_report) = 'object'),
  add column impact_checked_at timestamptz,
  add column review_note text;

comment on column public.species_compatibility_profile_revisions.impact_report is
  'Server-computed Draft-vs-reviewed structural impact captured when the revision enters pending_review.';
comment on column public.species_pair_compatibility_rule_revisions.impact_report is
  'Server-computed Draft-vs-reviewed structural impact captured when the revision enters pending_review.';
