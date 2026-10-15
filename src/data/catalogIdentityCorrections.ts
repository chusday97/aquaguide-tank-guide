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
import {
  catalogIdentityCorrectionBaseSpeciesIds as wave26BaseSpeciesIds,
  resolvedCatalogIdentityCorrectionSpeciesIds as wave26ResolvedSpeciesIds,
} from './catalogReviewBatches/identity-corrections-wave26';
import {
  catalogIdentityCorrectionBaseSpeciesIds as wave27BaseSpeciesIds,
  resolvedCatalogIdentityCorrectionSpeciesIds as wave27ResolvedSpeciesIds,
} from './catalogReviewBatches/identity-corrections-wave27';
import {
  catalogIdentityCorrectionBaseSpeciesIds as wave28BaseSpeciesIds,
  resolvedCatalogIdentityCorrectionSpeciesIds as wave28ResolvedSpeciesIds,
} from './catalogReviewBatches/identity-corrections-wave28';

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set([
  ...wave21ResolvedSpeciesIds,
  ...wave22ResolvedSpeciesIds,
  ...wave23ResolvedSpeciesIds,
  ...wave24ResolvedSpeciesIds,
  ...wave25ResolvedSpeciesIds,
  ...wave26ResolvedSpeciesIds,
  ...wave27ResolvedSpeciesIds,
  ...wave28ResolvedSpeciesIds,
]);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  ...wave21BaseSpeciesIds,
  ...wave22BaseSpeciesIds,
  ...wave23BaseSpeciesIds,
  ...wave24BaseSpeciesIds,
  ...wave25BaseSpeciesIds,
  ...wave26BaseSpeciesIds,
  ...wave27BaseSpeciesIds,
  ...wave28BaseSpeciesIds,
} as const;
