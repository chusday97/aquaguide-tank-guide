export type NextWaveUnified15IdentityOutcome = {
  speciesId: string;
  code: 'catalog_scientific_name_unresolved';
  candidateTaxa: string[];
  sourceIds: string[];
  note: string;
};

export type NextWaveUnified15DomainOutcome = {
  speciesId: string;
  lifeType: 'crustacean_or_mollusk' | 'coral_or_anemone' | 'marine_invertebrate';
  sourceIds: string[];
  note: string;
};

const domainHold = (
  speciesId: string,
  lifeType: NextWaveUnified15DomainOutcome['lifeType'],
  sourceId: string,
  note: string,
): NextWaveUnified15DomainOutcome => ({
  speciesId,
  lifeType,
  sourceIds: [sourceId],
  note,
});

export const nextWaveUnified15IdentityOutcomes: readonly NextWaveUnified15IdentityOutcome[] = [
  {
    speciesId: 'sp_0162',
    code: 'catalog_scientific_name_unresolved',
    candidateTaxa: ['Carassius auratus ornamental Red Grass lineage'],
    sourceIds: ['batch28-fishbase-carassius-auratus-red-grass'],
    note: 'The catalog scientific name ends at “Carassius auratus var.” without a variant identifier. The Red Grass object review does not repair that incomplete scientific identity or authorize generic goldfish Compatibility inheritance.',
  },
] as const;

export const nextWaveUnified15DomainOutcomes: readonly NextWaveUnified15DomainOutcome[] = [
  domainHold('sp_0034', 'crustacean_or_mollusk', 'batch08-worms-tylomelania', 'Tylomelania is a gastropod snail taxon. Snail-specific grazing, substrate/mineral sensitivity, reproduction and invertebrate cohabitation are outside fish-profile social semantics.'),
  domainHold('sp_0036', 'crustacean_or_mollusk', 'batch04-worms-vittina-turrita', 'Vittina/Neritina turrita is a gastropod snail. The commercial variant identity does not change its mollusk domain; snail grazing, shell/mineral requirements and invertebrate interactions require non-fish semantics.'),
  domainHold('sp_0164', 'crustacean_or_mollusk', 'batch40-professional-neocaridina-davidi-black', 'Neocaridina davidi Black is a shrimp catalog object. Molting, colony behavior, mineral sensitivity and predation exposure are outside the current fish Compatibility Profile.'),
  domainHold('sp_0165', 'crustacean_or_mollusk', 'batch40-professional-neocaridina-davidi-yellow-line', 'Neocaridina davidi Yellow Line is a shrimp catalog object. Shrimp colony, molting and fish-predation risks require crustacean-specific compatibility semantics.'),
  domainHold('sp_0166', 'crustacean_or_mollusk', 'batch40-professional-neocaridina-davidi-fire-red', 'Neocaridina davidi Fire Red is a shrimp catalog object. Variant grade does not move the object into fish-profile semantics.'),
  domainHold('sp_0238', 'crustacean_or_mollusk', 'batch40-professional-neocaridina-davidi-full-black', 'Neocaridina davidi Full Black is a shrimp catalog object. Shrimp-specific colony, molting and predation constraints remain outside the fish Compatibility domain.'),
  domainHold('sp_0239', 'crustacean_or_mollusk', 'batch41-professional-neocaridina-davidi-bloody-mary', 'Neocaridina davidi Bloody Mary is a shrimp catalog object. Exact trade-line review confirms the object, but its compatibility semantics remain crustacean-specific.'),
  domainHold('sp_0249', 'crustacean_or_mollusk', 'batch13-fishbase-pomacea-bridgesii-gold', 'Pomacea bridgesii Gold is a gastropod snail catalog object. Snail grazing, shell/mineral requirements and invertebrate cohabitation are not represented by fish social fields.'),
  domainHold('sp_0250', 'crustacean_or_mollusk', 'batch13-fishbase-pomacea-bridgesii-blue', 'Pomacea bridgesii Blue is a gastropod snail catalog object. Variant color does not alter the mollusk compatibility domain.'),
  domainHold('sp_0251', 'crustacean_or_mollusk', 'batch13-fishbase-pomacea-bridgesii-purple', 'Pomacea bridgesii Purple is a gastropod snail catalog object. Snail-specific husbandry and cohabitation require non-fish semantics.'),
  domainHold('sp_0274', 'crustacean_or_mollusk', 'batch41-professional-neocaridina-davidi-neon-gold', 'Neocaridina davidi Neon Gold is a shrimp catalog object and remains outside fish-profile semantics.'),
  domainHold('sp_0275', 'crustacean_or_mollusk', 'batch41-professional-neocaridina-davidi-rili', 'Neocaridina davidi Rili is a shrimp catalog object and remains outside fish-profile semantics.'),
  domainHold('sp_0276', 'crustacean_or_mollusk', 'batch41-professional-neocaridina-davidi-deep-blue', 'Neocaridina davidi Deep Blue is a shrimp catalog object and remains outside fish-profile semantics.'),
  domainHold('sp_0277', 'crustacean_or_mollusk', 'batch41-professional-caridina-cantonensis-s-class', 'Caridina cantonensis S-Class is a shrimp catalog object. Grade-specific identity does not change the crustacean compatibility domain.'),
  domainHold('sp_0278', 'crustacean_or_mollusk', 'batch41-professional-caridina-cantonensis-black-king-kong', 'Caridina cantonensis Black King Kong is a shrimp catalog object. Shrimp-specific mineral, molting and predation constraints require crustacean semantics.'),
  domainHold('sp_0279', 'crustacean_or_mollusk', 'batch41-professional-neocaridina-davidi-blue-gold-back', 'Neocaridina davidi Blue Gold Back is a shrimp catalog object and remains outside fish-profile semantics.'),
  domainHold('sp_0342', 'crustacean_or_mollusk', 'batch41-professional-neocaridina-davidi-blue-gold', 'Neocaridina davidi Blue Gold is a shrimp catalog object and remains outside fish-profile semantics.'),
  domainHold('sp_0396', 'crustacean_or_mollusk', 'batch41-professional-neocaridina-davidi-blue-pearl', 'Neocaridina davidi Blue Pearl is a shrimp catalog object and remains outside fish-profile semantics.'),
  domainHold('sp_0397', 'crustacean_or_mollusk', 'batch41-professional-caridina-cantonensis-flower', 'Caridina cantonensis Flower is a shrimp catalog object. Exact ornamental lineage still belongs to the crustacean domain.'),
  domainHold('sp_0398', 'crustacean_or_mollusk', 'batch42-professional-caridina-cantonensis-panda', 'Caridina cantonensis Panda is a shrimp catalog object. Exact ornamental lineage still belongs to the crustacean domain.'),
  domainHold('sp_0320', 'coral_or_anemone', 'batch34-worms-sarcophyton-sp', 'Sarcophyton sp. is a soft-coral taxon. Coral allelopathy, growth, placement, light/flow and reef-space competition are outside fish-profile semantics.'),
  domainHold('sp_0324', 'coral_or_anemone', 'batch34-worms-actinodiscus-sp', 'Actinodiscus sp. is a corallimorph/coral-like cnidarian. Stinging, overgrowth, placement and reef-space interactions require reef-specific compatibility semantics.'),
  domainHold('sp_0327', 'marine_invertebrate', 'batch35-worms-sabellastarte-spectabilis', 'Sabellastarte spectabilis is a marine polychaete tube worm despite the legacy catalog category “海水鱼”. Filter-feeding, tube placement, flow and invertebrate predation risks are outside fish-profile semantics.'),
  domainHold('sp_0329', 'coral_or_anemone', 'batch35-worms-acropora-sp', 'Acropora sp. is a stony coral taxon. Light/flow, allelopathy, stinging and reef-space competition require coral-specific compatibility semantics.'),
] as const;

export const nextWaveUnified15AllSpeciesIds = [
  'sp_0162','sp_0034','sp_0036','sp_0164','sp_0165',
  'sp_0166','sp_0238','sp_0239','sp_0249','sp_0250',
  'sp_0251','sp_0274','sp_0275','sp_0276','sp_0277',
  'sp_0278','sp_0279','sp_0342','sp_0396','sp_0397',
  'sp_0398','sp_0320','sp_0324','sp_0327','sp_0329',
] as const;

export const nextWaveUnified15ProfileIds = [] as const;
