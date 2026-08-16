export type PrimarySpeciesWaterType = 'freshwater' | 'saltwater' | 'brackish';

export type SpeciesWaterEvidence = {
  primaryWaterType: PrimarySpeciesWaterType;
  confidence: 'high';
  basis: 'taxon';
  note?: string;
  sourceName?: string;
};

type TaxonEvidence = SpeciesWaterEvidence & {
  scientificName: string;
};

// High-confidence primary care-water evidence for legacy catalog taxa that
// previously reached `freshwater` only through the broad `category` fallback.
// A base species entry also covers catalog varieties written as `var. ...`.
// Keep this list species-level rather than genus-level: some genera span more
// than one habitat and must not become broad habitat heuristics.
const TAXON_WATER_EVIDENCE: TaxonEvidence[] = [
  { scientificName: 'Vittina turrita', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon', note: 'Adults are kept in freshwater; natural habitat and breeding can involve brackish conditions.', sourceName: 'Scientific Reports 2021' },
  { scientificName: 'Helostoma temminkii', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Phenacogrammus interruptus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Acheilognathus macropterus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Opsariichthys bidens', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Pseudogastromyzon fangi', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon', note: 'Freshwater hillstream loach; explicit evidence prevents the ambiguous common-name token 蝴蝶鱼 from creating marine certainty.', sourceName: 'Eschmeyer Catalog of Fishes / FishBase' },
  { scientificName: 'Altolamprologus calvus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon', note: 'Endemic Lake Tanganyika cichlid; explicit taxon evidence overrides stale legacy marine category data, including catalog varieties.', sourceName: 'Eschmeyer Catalog of Fishes / FishBase' },
  { scientificName: 'Neolamprologus multifasciatus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon', note: 'Endemic Lake Tanganyika shell-dwelling cichlid; explicit taxon evidence overrides stale legacy marine category data.', sourceName: 'Eschmeyer Catalog of Fishes / FishBase' },
  { scientificName: 'Abbottina rivularis', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Pseudorasbora parva', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Aphyocypris chinensis', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Pseudobagrus fulvidraco', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Acrossocheilus fasciatus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Hemichromis bimaculatus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Macropodus opercularis', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Semaprochilodus insignis', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Cyprinus carpio', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Semaprochilodus taeniurus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Epiplatys annulatus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Gymnotus carapo', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Zacco platypus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Parambassis ranga', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon', note: 'Occurs in both freshwater and brackish environments; freshwater compatibility must not erase that habitat range.', sourceName: 'FishBase' },
  { scientificName: 'Glossolepis incisus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Iriatherina werneri', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Pseudomugil furcatus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Serrasalmus rhombeus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Trichopodus leerii', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Gnathonemus petersii', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Sahyadria denisonii', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Badis badis', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Dario dario', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Crossocheilus langei', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Osphronemus goramy', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Synodontis nigriventris', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Melanotaenia praecox', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Carassius auratus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Andinoacara pulcher', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Scleropages formosus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Potamotrygon leopoldi', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Pangio kuhlii', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
  { scientificName: 'Kryptopterus vitreolus', primaryWaterType: 'freshwater', confidence: 'high', basis: 'taxon' },
];

const normalizeScientificName = (value?: string) => (value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const matchesBaseSpecies = (scientificName: string, baseSpecies: string) => {
  const normalized = normalizeScientificName(scientificName);
  const base = normalizeScientificName(baseSpecies);
  return normalized === base || normalized.startsWith(`${base} var.`);
};

export const getSpeciesWaterEvidence = (species: { scientificName?: string }): SpeciesWaterEvidence | null => {
  const evidence = TAXON_WATER_EVIDENCE.find(item => matchesBaseSpecies(species.scientificName || '', item.scientificName));
  if (!evidence) return null;
  const { scientificName: _scientificName, ...result } = evidence;
  return result;
};

export const auditedWaterEvidenceTaxa = TAXON_WATER_EVIDENCE.map(item => item.scientificName);
