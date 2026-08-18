export type EnvironmentEvidenceKind = 'primary' | 'database' | 'expert_husbandry';

export type EnvironmentEvidenceRecord = {
  id: string;
  title: string;
  kind: EnvironmentEvidenceKind;
  url: string;
  supports: string[];
  notes?: string;
};

export const environmentEvidenceSources: Record<string, EnvironmentEvidenceRecord> = {
  'sewellia-lineolata-fishbase-40433': {
    id: 'sewellia-lineolata-fishbase-40433',
    title: 'FishBase — Sewellia lineolata (ecology; Ref. 40433)',
    kind: 'database',
    url: 'https://www.fishbase.se/summary/26831',
    supports: [
      'freshwater habitat',
      'rheophilous ecology',
      'rapids and riffles',
      'stone/periphyton association',
    ],
    notes: 'Use for habitat structure and flow affinity; not as a stand-alone aquarium equipment prescription.',
  },
  'sewellia-lineolata-practical-fishkeeping': {
    id: 'sewellia-lineolata-practical-fishkeeping',
    title: 'Practical Fishkeeping — Sewellia lineolata',
    kind: 'expert_husbandry',
    url: 'https://www.practicalfishkeeping.co.uk/features/articles/sewellia-lineolata',
    supports: [
      'clean well-oxygenated water',
      'fast-flowing hillstream husbandry',
      'rock/gravel habitat structure',
    ],
    notes: 'Corroborates husbandry interpretation of the rheophilic habitat; does not imply an air pump is uniquely required.',
  },
  'sewellia-lineolata-fishkeeper': {
    id: 'sewellia-lineolata-fishkeeper',
    title: 'Fishkeeper — Reticulated Hillstream Loach (Sewellia lineolata)',
    kind: 'expert_husbandry',
    url: 'https://www.fishkeeper.co.uk/fish/freshwater/cyprinids/gold-ring-hillstream-loach',
    supports: [
      'fast-moving water husbandry',
      'high oxygen requirement',
      'clean well-aerated water',
    ],
    notes: 'Used as an independent husbandry corroboration source for oxygenation and flow demand.',
  },
};
