export type Phase2Batch01FieldStatus = 'reviewed_supported' | 'reviewed_unknown';

export type Phase2Batch01FieldAuthority = {
  status: Phase2Batch01FieldStatus;
  citationIds: string[];
  factEvidence: string;
};

/** Direct, variant-aware authority only. No legacy/template or base-species fallback is used. */
export const phase2Batch01Authority: Record<string, Partial<Record<'feeding' | 'care', Phase2Batch01FieldAuthority>>> = {
  sp_0016: {
    feeding: {
      status: 'reviewed_supported',
      citationIds: ['aquarium-industries-ramirezi-care-sheet'],
      factEvidence: 'The Aquarium Industries Ramirezi sheet explicitly lists gold rams as a colour variant and describes varied sinking pellets plus small live foods for M. ramirezi.',
    },
    care: {
      status: 'reviewed_supported',
      citationIds: ['aquarium-industries-ramirezi-care-sheet'],
      factEvidence: 'The same source gives 24–28°C, pH 5.0–7.2 and warns that selective breeding can increase sensitivity to poor water quality.',
    },
  },
  sp_0224: {
    feeding: {
      status: 'reviewed_unknown',
      citationIds: ['batch03-fishbase-channa-argus'],
      factEvidence: 'The reviewed species source does not establish a Platinum morph-specific feeding authority; legacy carnivore/template text is intentionally excluded.',
    },
    care: {
      status: 'reviewed_unknown',
      citationIds: ['batch03-fishbase-channa-argus'],
      factEvidence: 'No reliable Platinum morph-specific care range or stocking guidance was found.',
    },
  },
  sp_0475: {
    feeding: {
      status: 'reviewed_unknown',
      citationIds: ['batch03-fishbase-rhodeus-ocellatus'],
      factEvidence: 'FishBase does not provide a defensible aquarium feeding regime for this catalog object; the legacy rule fallback remains excluded.',
    },
    care: {
      status: 'reviewed_unknown',
      citationIds: ['batch03-fishbase-rhodeus-ocellatus', 'jstage-rhodeus-ocellatus-reproductive-cycle'],
      factEvidence: 'Sources support ecology and reproductive temperature response, not a complete species-specific aquarium care protocol.',
    },
  },
};
