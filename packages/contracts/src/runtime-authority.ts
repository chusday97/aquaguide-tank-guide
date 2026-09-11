import type { z } from 'zod';
import { careArticleAdminInputSchema, speciesAdminInputSchema } from './content-admin';
import type { ReviewedCompatibilityPairRuleDto, ReviewedCompatibilityProfileDto } from './compatibility-runtime';

export type RuntimeAuthoritySpeciesInput = z.infer<typeof speciesAdminInputSchema>;
export type RuntimeAuthorityCareInput = z.infer<typeof careArticleAdminInputSchema>;

export type RuntimeAuthorityAssetDto = {
  id: string;
  stepId?: string;
  variant: string;
  mimeType: string;
  width?: number;
  height?: number;
  byteSize?: number;
  assetVersion: number;
  url: string;
};

export type GitRuntimeAuthoritySnapshot = {
  schemaVersion: 1;
  authority: 'local-file-git';
  generatedAt: string | null;
  source: {
    businessUpdatedAt: string | null;
    compatibilityUpdatedAt: string | null;
    compatibilityAuthoritySequence: number | null;
  };
  productCare: {
    species: Array<{ input: RuntimeAuthoritySpeciesInput; version: number; publishedAt: string; assets: RuntimeAuthorityAssetDto[] }>;
    careArticles: Array<{ input: RuntimeAuthorityCareInput; version: number; publishedAt: string; assets: RuntimeAuthorityAssetDto[] }>;
  };
  compatibility: null | {
    authority: 'reviewed-git';
    profiles: ReviewedCompatibilityProfileDto[];
    pairRules: ReviewedCompatibilityPairRuleDto[];
    counts: { profiles: number; pairRules: number };
  };
};
