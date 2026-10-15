import {
  catalogIdentityCorrectionBaseSpeciesIds as wave21BaseSpeciesIds,
  resolvedCatalogIdentityCorrectionSpeciesIds as wave21ResolvedSpeciesIds,
} from './catalogReviewBatches/identity-corrections-wave21';
import {
  catalogIdentityCorrectionBaseSpeciesIds as wave22BaseSpeciesIds,
  resolvedCatalogIdentityCorrectionSpeciesIds as wave22ResolvedSpeciesIds,
} from './catalogReviewBatches/identity-corrections-wave22';
import {
  catalogIdentityCorrectionBaseSpeciesIds as wave23BaseSpeciesIds,
  resolvedCatalogIdentityCorrectionSpeciesIds as wave23ResolvedSpeciesIds,
} from './catalogReviewBatches/identity-corrections-wave23';

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set([
  ...wave21ResolvedSpeciesIds,
  ...wave22ResolvedSpeciesIds,
  ...wave23ResolvedSpeciesIds,
]);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  ...wave21BaseSpeciesIds,
  ...wave22BaseSpeciesIds,
  ...wave23BaseSpeciesIds,
} as const;
