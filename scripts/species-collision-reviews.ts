export type SpeciesCollisionReviewStatus =
  | 'probable_alias'
  | 'hold_distinct_strain'
  | 'hold_coarse_taxonomy'
  | 'hold_taxonomy_conflict';

export type SpeciesCollisionReview = {
  ids: readonly [string, string];
  status: SpeciesCollisionReviewStatus;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  evidenceUrls?: readonly string[];
};

// These reviews are deliberately separate from speciesIdAliases.
// A reviewed collision is not automatically safe to delete. Only a later,
// explicit migration may promote a probable_alias into a stable ID alias.
export const speciesCollisionReviews: readonly SpeciesCollisionReview[] = [
  {
    ids: ['sp_0230', 'sp_0280'],
    status: 'probable_alias',
    confidence: 'medium',
    reason: 'Both records identify the same Gold Longfin Ancistrus trade morph and have the same care fingerprint; Chinese names describe the same long-fin gold bristlenose concept. Keep as a reviewed candidate until full-record/source parity is verified.',
  },
  {
    ids: ['sp_0076', 'sp_0302'],
    status: 'probable_alias',
    confidence: 'high',
    reason: "Both records identify Anubias barteri var. nana 'Petite'; 小水榕/迷你水榕 are trade-name variants for the same named dwarf cultivar in this catalog.",
    evidenceUrls: ['https://www.aquasabi.com/Anubias-barteri-var-nana-Petite'],
  },
  {
    ids: ['sp_0208', 'sp_0340'],
    status: 'probable_alias',
    confidence: 'medium',
    reason: 'The two names differ only by the optional 灯 suffix while both records identify the same Aphyocharax anisitsi Balloon morph and share the same care fingerprint. External evidence for the Balloon trade morph still needs strengthening before deletion.',
    evidenceUrls: ['https://www.fishbase.se/summary/Aphyocharax-anisitsi'],
  },
  {
    ids: ['sp_0288', 'sp_0393'],
    status: 'probable_alias',
    confidence: 'medium',
    reason: 'Both records identify the same Platinum Longfin Gymnocorymbus ternetzi trade morph with the same care fingerprint. The Chinese trade names differ, so deletion must wait for full-record/source parity.',
  },
  {
    ids: ['sp_0154', 'sp_0204'],
    status: 'hold_coarse_taxonomy',
    confidence: 'high',
    reason: "The shared scientificName ends at 'Hemigrammus bleheri var.' and does not encode a cultivar/strain. Different trade names can therefore represent distinct strains; do not deduplicate from this collision alone.",
  },
  {
    ids: ['sp_0205', 'sp_0360'],
    status: 'hold_taxonomy_conflict',
    confidence: 'high',
    reason: "The shared scientificName ends at 'Hyphessobrycon herbertaxelrodi var.' while the Chinese trade names describe materially different-looking products. Treat this as a taxonomy/source conflict, not an alias candidate.",
  },
  {
    ids: ['sp_0095', 'sp_0315'],
    status: 'hold_coarse_taxonomy',
    confidence: 'high',
    reason: 'Ludwigia inclinata var. verticillata is a botanical variety under which multiple distinct aquarium forms/cultivars are traded. Identical base taxonomy is insufficient to merge 细叶太阳 and 红太阴.',
    evidenceUrls: [
      'https://www.flowgrow.de/db/aquaticplants/ludwigia-inclinata-var-verticillata-cuba',
      'https://www.flowgrow.de/db/aquaticplants/ludwigia-inclinata-var-verticillata-curly',
    ],
  },
  {
    ids: ['sp_0048', 'sp_0131'],
    status: 'probable_alias',
    confidence: 'high',
    reason: 'Both records resolve to Mastacembelus armatus with the same care fingerprint; 大刺鳅/刺鳅 are common-name variants in this dataset rather than encoded strains.',
    evidenceUrls: ['https://www.fishbase.se/summary/Mastacembelus-armatus.html'],
  },
  {
    ids: ['sp_0088', 'sp_0312'],
    status: 'probable_alias',
    confidence: 'high',
    reason: '睡莲 (红荷根) explicitly contains 红荷根 and both records resolve to Nymphaea lotus with the same care fingerprint. Aquarium trade sources also use Nymphaea lotus red / red tiger lotus as overlapping names.',
    evidenceUrls: ['https://www.aquasabi.com/Nymphaea-lotus'],
  },
  {
    ids: ['sp_0143', 'sp_0144'],
    status: 'hold_distinct_strain',
    confidence: 'high',
    reason: "红草尾孔雀鱼 and 蓝草尾孔雀鱼 are explicitly different colour strains. The shared 'Poecilia reticulata var.' value is incomplete strain taxonomy and must not collapse them into one entity.",
  },
  {
    ids: ['sp_0080', 'sp_0307'],
    status: 'probable_alias',
    confidence: 'medium',
    reason: '莫斯 (三角莫斯) explicitly contains 三角莫斯 and the care fingerprint is identical, so the two rows are probably the same business entity. However the aquarium use of Vesicularia dubyana is historically taxonomically confused, so taxonomy should be corrected separately from any eventual ID merge.',
    evidenceUrls: ['https://www.flowgrow.de/db/aquaticplants/vesicularia-dubyana'],
  },
] as const;
