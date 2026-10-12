export type NextWaveUnified10EvidenceCeilingOutcome = {
  speciesId: string;
  field: 'social';
  code: 'variant_social_not_established';
  sourceIds: string[];
  note: string;
};

export type NextWaveUnified10DomainOutcome = {
  speciesId: string;
  lifeType: 'crustacean_or_mollusk' | 'coral_or_anemone' | 'marine_invertebrate' | 'jellyfish' | 'reptile';
  sourceIds: string[];
  note: string;
};

const domainHold = (
  speciesId: string,
  lifeType: NextWaveUnified10DomainOutcome['lifeType'],
  sourceId: string,
  note: string,
): NextWaveUnified10DomainOutcome => ({
  speciesId,
  lifeType,
  sourceIds: [sourceId],
  note,
});

export const nextWaveUnified10EvidenceCeilings: readonly NextWaveUnified10EvidenceCeilingOutcome[] = [
  {
    speciesId: 'sp_0063',
    field: 'social',
    code: 'variant_social_not_established',
    sourceIds: ['batch26-fishbase-carassius-auratus-ranchu'],
    note: 'The Ranchu catalog object has an object-level reviewed record, but that review explicitly leaves environment, space and social behavior unknown and forbids base-species inheritance. No reviewed Compatibility source establishes a Ranchu-specific stable household social mode, so positive compatibility remains fail-closed.',
  },
] as const;

export const nextWaveUnified10DomainOutcomes: readonly NextWaveUnified10DomainOutcome[] = [
  domainHold('sp_0029', 'crustacean_or_mollusk', 'batch04-itis-caridina-dennerli', 'Duplicate catalog object for Caridina dennerli. Reviewed identity confirms a shrimp, so the same non-fish domain boundary applies; shrimp stocking, molting and predation exposure must not be encoded as fish social behavior.'),
  domainHold('sp_0032', 'crustacean_or_mollusk', 'batch04-worms-vittina-turrita', 'Duplicate catalog object for Vittina turrita. Reviewed identity confirms a gastropod; shell/mineral, grazing and invertebrate cohabitation semantics are outside the fish Compatibility Profile.'),
  domainHold('sp_0033', 'crustacean_or_mollusk', 'batch08-fishbase-clithon-corona', 'Duplicate catalog object for Clithon corona. The reviewed taxon is a gastropod, and snail-specific grazing, shell chemistry and predation rules require a non-fish compatibility domain.'),
  domainHold('sp_0454', 'crustacean_or_mollusk', 'batch37-fishbase-caridina-multidentata-duplicate', 'Reviewed as a duplicate Caridina multidentata catalog object. Shrimp colony behavior, molting and predation exposure are outside the current fish-profile runtime.'),
  domainHold('sp_0456', 'crustacean_or_mollusk', 'batch17-fishbase-pomacea-bridgesii-duplicate-catalog', 'Reviewed as a duplicate Pomacea bridgesii catalog object. Apple-snail grazing, shell chemistry, reproduction and predation semantics are not representable by fish Compatibility fields.'),

  domainHold('sp_0192', 'coral_or_anemone', 'batch33-worms-entacmaea-quadricolor', 'Entacmaea quadricolor is a sea anemone. Nematocyst stings, host relationships, wandering, reef placement and light/flow require an anemone-specific compatibility domain.'),
  domainHold('sp_0193', 'coral_or_anemone', 'batch33-worms-stichodactyla-haddoni', 'Stichodactyla haddoni is a sea anemone. Fish social/territorial fields cannot represent stinging, host relationships, movement and reef-space constraints.'),
  domainHold('sp_0326', 'coral_or_anemone', 'batch34-worms-trachyphyllia-geoffroyi', 'Trachyphyllia geoffroyi is a coral. Coral stinging, placement, light/flow and reef-space competition are outside the current fish Compatibility domain.'),
  domainHold('sp_0331', 'coral_or_anemone', 'batch35-worms-tubastraea-faulkneri', 'Tubastraea faulkneri is a coral. Feeding, placement, flow, stinging and reef competition cannot be represented safely by fish Compatibility Profile semantics.'),
  domainHold('sp_0369', 'coral_or_anemone', 'batch36-worms-micromussa-lordhowensis', 'Micromussa lordhowensis is a coral. Reef placement, stinging radius, light/flow and coral competition require reef-specific compatibility semantics.'),

  domainHold('sp_0194', 'marine_invertebrate', 'batch34-worms-protula-bispiralis', 'Protula bispiralis is a marine polychaete tube worm despite the catalog category “海水鱼”. Filter-feeding, tube placement, flow and invertebrate predation risks are outside fish-profile semantics.'),
  domainHold('sp_0195', 'marine_invertebrate', 'batch34-worms-astropecten-polyacanthus', 'Astropecten polyacanthus is an echinoderm sea star despite the catalog category “海水鱼”. Substrate foraging, invertebrate predation and sea-star-specific husbandry require a marine-invertebrate compatibility domain.'),
  domainHold('sp_0328', 'marine_invertebrate', 'batch35-worms-fromia-milleporella', 'Fromia milleporella is an echinoderm sea star despite the catalog category “海水鱼”. Reef grazing, starvation sensitivity and invertebrate cohabitation cannot be encoded as fish social behavior.'),

  domainHold('sp_0377', 'jellyfish', 'batch36-worms-aurelia-aurita', 'Aurelia aurita is a jellyfish. Kreisel-style flow, contact damage, prey capture and cnidarian interactions are outside the current fish Compatibility domain.'),
  domainHold('sp_0378', 'jellyfish', 'batch36-worms-aurelia-coerulea', 'Aurelia coerulea is a jellyfish. Jellyfish-specific flow, contact damage and feeding interactions require a cnidarian compatibility model rather than fish social fields.'),
  domainHold('sp_0380', 'jellyfish', 'batch36-worms-phyllorhiza-punctata', 'Phyllorhiza punctata is a jellyfish. Its flow, contact and cnidarian interaction constraints are not representable by the fish Compatibility Profile.'),
  domainHold('sp_0381', 'jellyfish', 'batch36-worms-cassiopea-andromeda', 'Cassiopea andromeda is a jellyfish with bottom-associated husbandry and cnidarian contact risks; the fish Compatibility domain cannot model those constraints safely.'),
  domainHold('sp_0383', 'jellyfish', 'batch36-worms-cotylorhiza-tuberculata', 'Cotylorhiza tuberculata is a jellyfish. Flow, contact damage, prey capture and cnidarian-specific cohabitation require a jellyfish domain.'),

  domainHold('sp_0461', 'reptile', 'batch38-ncbi-mauremys-reevesii', 'Mauremys reevesii (catalog Chinemys reevesii) is a turtle. Basking, terrestrial access, UVB/thermal gradients, drowning/escape and turtle predation require a reptile-specific compatibility domain.'),
  domainHold('sp_0462', 'reptile', 'batch38-cites-mauremys-sinensis', 'Mauremys sinensis is a turtle. Reptile basking, terrestrial access, thermal/UVB and cohabitation risks are structurally outside fish Compatibility fields.'),
  domainHold('sp_0463', 'reptile', 'batch38-tandfonline-sternotherus-carinatus', 'Sternotherus carinatus is a turtle. Turtle-specific basking, terrestrial access, predation and habitat-structure constraints require a reptile compatibility model.'),
  domainHold('sp_0464', 'reptile', 'batch38-cites-staurotypus-salvinii', 'Staurotypus salvinii is a turtle. Its reptile husbandry, basking/thermal needs and animal-interaction risks cannot be represented by a fish social profile.'),
  domainHold('sp_0465', 'reptile', 'batch38-cites-carettochelys-insculpta', 'Carettochelys insculpta is an aquatic turtle. Even with highly aquatic behavior, reptile thermal, respiratory, injury and cohabitation semantics require a dedicated reptile compatibility domain.'),
  domainHold('sp_0466', 'reptile', 'batch38-cites-sternotherus-odoratus', 'Sternotherus odoratus is a turtle. Basking/thermal access, air breathing, habitat structure and reptile predation/cohabitation cannot be safely reduced to fish Compatibility fields.'),
] as const;

export const nextWaveUnified10AllSpeciesIds = [
  'sp_0029','sp_0032','sp_0033','sp_0454','sp_0456',
  'sp_0192','sp_0193','sp_0194','sp_0195','sp_0326',
  'sp_0328','sp_0331','sp_0369','sp_0377','sp_0378',
  'sp_0380','sp_0381','sp_0383','sp_0461','sp_0462',
  'sp_0463','sp_0464','sp_0465','sp_0466','sp_0063',
] as const;

export const nextWaveUnified10ProfileIds = [] as const;
