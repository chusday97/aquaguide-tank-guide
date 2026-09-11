import type { EvidenceSourceDto } from '../../../packages/contracts/src';

const knowledgeSources: Record<string, EvidenceSourceDto> = {
  'seriouslyfish-poecilia-reticulata': {
    id: 'seriouslyfish-poecilia-reticulata',
    title: 'Poecilia reticulata (Guppy)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/poecilia-reticulata/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  'fishbase-poecilia-reticulata': {
    id: 'fishbase-poecilia-reticulata',
    title: 'Poecilia reticulata (Guppy) species summary',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Poecilia-reticulata.html',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  'seriouslyfish-paracheirodon-innesi': {
    id: 'seriouslyfish-paracheirodon-innesi',
    title: 'Paracheirodon innesi (Neon Tetra)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/paracheirodon-innesi',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  'seriouslyfish-paracheirodon-axelrodi': {
    id: 'seriouslyfish-paracheirodon-axelrodi',
    title: 'Paracheirodon axelrodi (Cardinal Tetra)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/paracheirodon-axelrodi',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  'seriouslyfish-tanichthys-albonubes': {
    id: 'seriouslyfish-tanichthys-albonubes',
    title: 'Tanichthys albonubes (White Cloud Mountain Minnow)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/tanichthys-albonubes',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  'seriouslyfish-danio-rerio': {
    id: 'seriouslyfish-danio-rerio',
    title: "Brachydanio rerio (Zebra 'Danio')",
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/danio-rerio',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  'seriouslyfish-corydoras-aeneus': {
    id: 'seriouslyfish-corydoras-aeneus',
    title: 'Corydoras aeneus (Bronze Cory)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/corydoras-aeneus',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  'seriouslyfish-corydoras-panda': {
    id: 'seriouslyfish-corydoras-panda',
    title: 'Corydoras panda (Panda Cory)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/corydoras-panda',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  'seriouslyfish-puntigrus-tetrazona': {
    id: 'seriouslyfish-puntigrus-tetrazona',
    title: 'Puntigrus tetrazona (Tiger Barb)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/puntigrus-tetrazona',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  'seriouslyfish-betta-splendens': {
    id: 'seriouslyfish-betta-splendens',
    title: 'Betta splendens (Siamese Fighting Fish)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/betta-splendens',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  'seriouslyfish-pterophyllum-scalare': {
    id: 'seriouslyfish-pterophyllum-scalare',
    title: 'Pterophyllum scalare (Angelfish)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/pterophyllum-scalare',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  'tamu-pterophyllum-scalare-reproduction': {
    id: 'tamu-pterophyllum-scalare-reproduction',
    title: 'Reproduction of Angelfish (Pterophyllum scalare)',
    publisher: 'Texas A&M AgriLife Extension',
    url: 'https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/Reproduction-of-Angelfish-Pterphyllum-scalare.pdf',
    sourceType: 'government',
    reviewStatus: 'reviewed',
  },
};
export const getKnowledgeSource = (sourceId: string) => knowledgeSources[sourceId];

export const resolveKnowledgeSources = (sourceIds: string[]) => sourceIds
  .map(sourceId => knowledgeSources[sourceId])
  .filter((source): source is EvidenceSourceDto => Boolean(source));
