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
import {
  catalogIdentityCorrectionBaseSpeciesIds as wave24BaseSpeciesIds,
  resolvedCatalogIdentityCorrectionSpeciesIds as wave24ResolvedSpeciesIds,
} from './catalogReviewBatches/identity-corrections-wave24';
import {
  catalogIdentityCorrectionBaseSpeciesIds as wave25BaseSpeciesIds,
  resolvedCatalogIdentityCorrectionSpeciesIds as wave25ResolvedSpeciesIds,
} from './catalogReviewBatches/identity-corrections-wave25';

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set([
  ...wave21ResolvedSpeciesIds,
  ...wave22ResolvedSpeciesIds,
  ...wave23ResolvedSpeciesIds,
  ...wave24ResolvedSpeciesIds,
  ...wave25ResolvedSpeciesIds,
]);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  ...wave21BaseSpeciesIds,
  ...wave22BaseSpeciesIds,
  ...wave23BaseSpeciesIds,
  ...wave24BaseSpeciesIds,
  ...wave25BaseSpeciesIds,
} as const;
