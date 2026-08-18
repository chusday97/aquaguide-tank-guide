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
  'microsorum-pteropus-tropica-4408': {
    id: 'microsorum-pteropus-tropica-4408',
    title: 'Tropica — Microsorum pteropus (008)',
    kind: 'expert_husbandry',
    url: 'https://tropica.com/en/plants/plantdetails/Microsorumpteropus%28008%29/4408',
    supports: [
      'rhizomatous growth',
      'attach to root or stone',
      'rhizome must not be buried',
      'low light demand',
      'low CO2 demand',
    ],
    notes: 'Used for planting mode and low-demand husbandry traits; avoid converting supplier ranges into unsupported precision.',
  },
  'microsorum-pteropus-aquarium-coop': {
    id: 'microsorum-pteropus-aquarium-coop',
    title: 'Aquarium Co-Op — Java Fern (Microsorum pteropus)',
    kind: 'expert_husbandry',
    url: 'https://www.aquariumcoop.com/collections/live-aquarium-plants/products/java-fern',
    supports: [
      'attach to rocks or wood',
      'low light',
      'CO2 not required',
      'hardy leaves',
      'cover for fish and fry',
    ],
    notes: 'Independent husbandry corroboration for epiphytic placement, low light/CO2 demand, leaf durability and habitat value.',
  },
  'micranthemum-callitrichoides-tropica-4478': {
    id: 'micranthemum-callitrichoides-tropica-4478',
    title: "Tropica — Micranthemum callitrichoides 'Cuba' (formerly Hemianthus callitrichoides)",
    kind: 'expert_husbandry',
    url: 'https://tropica.com/en/plants/plantdetails/Hemianthuscallitrichoides%27Cuba%27%28048BTC%29/4478',
    supports: [
      'carpeting growth habit',
      'planted into substrate in small clumps',
      'high light demand',
      'added CO2 required for strong growth',
      'water circulation and fertilizer support',
    ],
    notes: 'The source uses the current Micranthemum name while the legacy catalog retains the older Hemianthus combination.',
  },
  'micranthemum-callitrichoides-aquarium-coop': {
    id: 'micranthemum-callitrichoides-aquarium-coop',
    title: 'Aquarium Co-Op — High-tech planted tanks: Dwarf Baby Tears',
    kind: 'expert_husbandry',
    url: 'https://www.aquariumcoop.com/blogs/aquarium/high-tech-plants',
    supports: [
      'dwarf baby tears identity',
      'high light for dense carpeting',
      'pressurized CO2 for strongest success',
    ],
    notes: 'Used as independent husbandry corroboration for the high-demand carpeting profile, not for exact chemistry ranges.',
  },
  'anubias-barteri-nana-tropica-4546': {
    id: 'anubias-barteri-nana-tropica-4546',
    title: 'Tropica — Anubias barteri var. nana',
    kind: 'expert_husbandry',
    url: 'https://tropica.com/en/plants/plantdetails/Anubiasbarterivar.nana%28101YLS%29/4546',
    supports: [
      'rhizomatous growth',
      'attach to stone or tree root',
      'rhizome must not be buried',
      'low light demand',
      'low CO2 demand',
      'durable leaves not readily eaten by herbivorous fish',
    ],
    notes: 'Supports low-demand epiphytic traits; supplier ranges are not promoted into exact chemistry requirements.',
  },
  'anubias-barteri-nana-aquarium-coop': {
    id: 'anubias-barteri-nana-aquarium-coop',
    title: 'Aquarium Co-Op — Anubias Nana',
    kind: 'expert_husbandry',
    url: 'https://www.aquariumcoop.com/products/anubias-nana',
    supports: [
      'attach to rocks, wood, or decor',
      'rhizome must not be buried',
      'low light',
      'CO2 not required',
      'hardy leaves',
    ],
    notes: 'Independent husbandry corroboration for placement, low-light care, non-required CO2 and leaf durability.',
  },
};
