# Compatibility V4 AI Shadow

## Goal

Add real AI reasoning to Compatibility without weakening reviewed deterministic authority.

Runtime hierarchy:

`Deterministic hard rules / reviewed Pair Rules > AI shadow reasoning`

The AI layer does not mutate the final compatibility decision in this phase.

## Server path

- Service: `apps/api/src/compatibility-ai-reasoner.ts`
- Authenticated API: `GET /aquariums/:id/compatibility-ai-shadow/:speciesCatalogKey?catalogVersion=...`
- Existing deterministic context is produced by `readPublishedCatalogCompatibilityContext`.
- Text-model configuration reuses the server-only `AI_API_KEY / AI_BASE_URL / AI_MODEL / AI_TIMEOUT_MS` contract.

No model credential is exposed to the browser.

## Eligibility

AI reasoning runs only when:

1. the deterministic decision is `decisionReadiness = reviewed`;
2. every participating catalog object has an exact reviewed Compatibility Profile;
3. every participating object resolves reviewed runtime Species Knowledge.

If any prerequisite is missing, AI is skipped and the deterministic decision is returned unchanged.

This deliberately prevents the model from filling unknown biological facts from memory.

## Model input

The provider receives only:

- canonical deterministic decision;
- deterministic rule codes and evidence-rich rule summaries;
- exact reviewed Profile fields;
- reviewed Species Knowledge fields;
- tank facts already present in the request context;
- quantities;
- an allow-list of rule codes;
- an allow-list of evidence IDs.

The prompt explicitly forbids external biological knowledge, invented thresholds, invented group sizes, invented pair interactions and invented citations.

## Structured output

The provider must return JSON with:

- `suggestedVerdict`;
- grounded `reasons[]`;
- grounded `adjustments[]`;
- grounded `uncertainties[]`;
- `confidence`;
- `evidenceIds[]`.

Every reason/adjustment/uncertainty must cite rule codes supplied in the input. Every evidence ID must be from the input allow-list.

## Authority guard

The final response always contains the deterministic `finalDecision`.

AI output is rejected when it:

- weakens a blocking or `not_recommended` decision;
- upgrades `caution` to `compatible`;
- changes `insufficient_data` into another verdict;
- references an unknown rule code;
- references an unknown evidence ID;
- fails schema validation.

Provider timeout/network/configuration failure returns `ai.status = unavailable`; deterministic compatibility remains usable.

## Current phase

This is shadow/assist mode only.

AI may explain combination-level risk, rank concerns and propose grounded adjustments. It cannot publish biological facts, create Profiles, create Pair Rules, approve revisions, mutate DB authority, or change the user-facing final compatibility verdict.

A later phase may compare shadow output against curated regression cases before considering any broader role.
