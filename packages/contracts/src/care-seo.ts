import { z } from 'zod';
import { supportedLocaleSchema, type SupportedLocale } from './localization';

export type CareSeoProjectionAuthority = 'publication-snapshot' | 'legacy-published';
export type CareSeoRouteReadiness = 'blocked' | 'ready';

export const careSeoPublicPath = (catalogKey: string, locale: SupportedLocale = 'en') => {
  const encodedKey = encodeURIComponent(catalogKey.trim());
  return `${locale === 'zh-CN' ? '/zh' : ''}/care/${encodedKey}.html`;
};

export const careSeoCatalogKeyFromPathParam = (value: string) => (
  decodeURIComponent(value).replace(/\.html$/i, '').trim()
);

export const buildCareSeoAlternates = (catalogKey: string) => ({
  en: careSeoPublicPath(catalogKey, 'en'),
  'zh-CN': careSeoPublicPath(catalogKey, 'zh-CN'),
  'x-default': careSeoPublicPath(catalogKey, 'en'),
});

export interface CareSeoProjectionSourceFactDto {
  label: string;
  value: string | string[];
}

export interface CareSeoProjectionDto {
  sourceCareId: string;
  sourceCareCatalogKey: string;
  sourceCareVersion: number;
  sourcePublishedAt: string;
  sourceAuthority: CareSeoProjectionAuthority;
  locale: SupportedLocale;
  route: {
    pathname: string;
    topicParam: string;
    candidateUrl: string;
    alternates: { en: string; 'zh-CN': string; 'x-default': string };
    readiness: CareSeoRouteReadiness;
    blockers: string[];
  };
  sourceFacts: {
    title: string;
    category: string;
    urgency: string;
    summary: string;
    symptoms: string[];
    immediateActions: string[];
    avoidActions: string[];
    observeItems: string[];
    diagnoseWhen: string[];
    nextStep: string;
    evidenceCount: number;
  };
  suggestedEditorial: {
    seoTitle: string;
    metaDescription: string;
    h1: string;
    focusKeyword: string;
  };
  editableFields: Array<'seoTitle' | 'metaDescription' | 'h1' | 'focusKeyword'>;
  protectedSourceFields: string[];
  publishReady: boolean;
}


export const careSeoEditorialReviewStateSchema = z.enum(['draft', 'ready_for_review', 'approved']);
export const careSeoIndexStrategySchema = z.enum(['noindex', 'index']);

export const careSeoEditorialFieldsSchema = z.object({
  seoTitle: z.string().trim().min(1).max(80),
  metaDescription: z.string().trim().min(1).max(200),
  h1: z.string().trim().min(1).max(240),
  focusKeyword: z.string().trim().min(1).max(160),
  indexStrategy: careSeoIndexStrategySchema,
});

export const careSeoEditorialDraftMutationSchema = careSeoEditorialFieldsSchema.extend({
  locale: supportedLocaleSchema,
  sourceCareVersion: z.number().int().positive(),
  editorialId: z.string().uuid().optional(),
  revisionVersion: z.number().int().positive().optional(),
}).superRefine((value, context) => {
  if (Boolean(value.editorialId) !== Boolean(value.revisionVersion)) {
    context.addIssue({ code: 'custom', path: ['revisionVersion'], message: 'Existing Editorial Draft requires both editorialId and revisionVersion.' });
  }
});

export const careSeoEditorialTransitionMutationSchema = z.object({
  locale: supportedLocaleSchema,
  sourceCareVersion: z.number().int().positive(),
  editorialId: z.string().uuid(),
  revisionVersion: z.number().int().positive(),
});

export type CareSeoEditorialReviewState = z.infer<typeof careSeoEditorialReviewStateSchema>;
export type CareSeoIndexStrategy = z.infer<typeof careSeoIndexStrategySchema>;
export type CareSeoEditorialDraftMutation = z.infer<typeof careSeoEditorialDraftMutationSchema>;
export type CareSeoEditorialTransitionMutation = z.infer<typeof careSeoEditorialTransitionMutationSchema>;

export interface CareSeoEditorialRevisionDto {
  id: string;
  sourceCareId: string;
  sourceCareCatalogKey: string;
  sourceCareVersion: number;
  locale: SupportedLocale;
  revisionNumber: number;
  version: number;
  reviewState: CareSeoEditorialReviewState;
  indexStrategy: CareSeoIndexStrategy;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  focusKeyword: string;
  sourceDrift: boolean;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
}

export interface CareSeoEditorialWorkspaceDto {
  projection: CareSeoProjectionDto;
  editorial: CareSeoEditorialRevisionDto | null;
  persistenceAvailable: boolean;
}

export const careSeoAiAssistRequestSchema = z.object({
  locale: supportedLocaleSchema,
  sourceCareVersion: z.number().int().positive(),
});

export const careSeoAiConflictSchema = z.object({
  severity: z.enum(['info', 'warning', 'blocking']),
  type: z.enum(['source_gap', 'unsupported_claim', 'editorial_conflict', 'source_drift']),
  field: z.string().trim().min(1).max(80),
  explanation: z.string().trim().min(1).max(500),
});

export const careSeoAiDraftSchema = careSeoEditorialFieldsSchema.extend({
  indexStrategy: z.literal('noindex'),
});

export const careSeoAiProviderOutputSchema = z.object({
  sourceExtraction: z.object({
    primaryTopic: z.string().trim().min(1).max(240),
    searchIntent: z.string().trim().min(1).max(240),
    keyTerms: z.array(z.string().trim().min(1).max(120)).max(12),
    safetyBoundaries: z.array(z.string().trim().min(1).max(320)).max(10),
  }),
  conflicts: z.array(careSeoAiConflictSchema).max(12),
  impactExplanation: z.object({
    summary: z.string().trim().min(1).max(800),
    changedEditorialFields: z.array(z.enum(['seoTitle', 'metaDescription', 'h1', 'focusKeyword'])).max(4),
  }),
  draft: careSeoAiDraftSchema,
  reviewWarnings: z.array(z.string().trim().min(1).max(400)).max(10),
});

export const careSeoAiAssistDtoSchema = careSeoAiProviderOutputSchema.extend({
  sourceBinding: z.object({
    sourceCareId: z.string().trim().min(1),
    sourceCareCatalogKey: z.string().trim().min(1),
    sourceCareVersion: z.number().int().positive(),
    sourceAuthority: z.literal('publication-snapshot'),
    locale: supportedLocaleSchema,
  }),
  provider: z.object({
    model: z.string().trim().min(1),
    generatedAt: z.string().datetime({ offset: true }),
  }),
});

export type CareSeoAiAssistRequest = z.infer<typeof careSeoAiAssistRequestSchema>;
export type CareSeoAiConflict = z.infer<typeof careSeoAiConflictSchema>;
export type CareSeoAiDraft = z.infer<typeof careSeoAiDraftSchema>;
export type CareSeoAiProviderOutput = z.infer<typeof careSeoAiProviderOutputSchema>;
export type CareSeoAiAssistDto = z.infer<typeof careSeoAiAssistDtoSchema>;

const careSeoProjectionSnapshotSchema = z.object({
  sourceCareId: z.string().trim().min(1),
  sourceCareCatalogKey: z.string().trim().min(1),
  sourceCareVersion: z.number().int().positive(),
  sourcePublishedAt: z.string().datetime({ offset: true }),
  sourceAuthority: z.enum(['publication-snapshot', 'legacy-published']),
  locale: supportedLocaleSchema,
  route: z.object({
    pathname: z.string().startsWith('/'),
    topicParam: z.string().trim().min(1),
    candidateUrl: z.string().startsWith('/'),
    alternates: z.object({
      en: z.string().startsWith('/'),
      'zh-CN': z.string().startsWith('/'),
      'x-default': z.string().startsWith('/'),
    }),
  }),
  sourceFacts: z.object({
    category: z.string().trim().min(1),
    urgency: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    immediateActions: z.array(z.string()),
    avoidActions: z.array(z.string()),
    observeItems: z.array(z.string()),
    nextStep: z.string().trim().min(1),
  }),
});

export const careSeoEditorialSnapshotRecordSchema = z.object({
  projection: careSeoProjectionSnapshotSchema,
  editorial: careSeoEditorialFieldsSchema.extend({
    reviewState: careSeoEditorialReviewStateSchema,
  }),
});

export const careSeoStagingSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  environment: z.enum(['staging', 'production']),
  sourceEnvironment: z.enum(['staging', 'production']),
  sourceLabel: z.string().trim().min(1),
  generatedAt: z.string().datetime(),
  records: z.array(careSeoEditorialSnapshotRecordSchema).min(2),
});

export const careSeoHostedAcceptanceEvidenceSchema = z.object({
  schemaVersion: z.literal(1),
  environment: z.literal('staging'),
  snapshotSha256: z.string().regex(/^[0-9a-f]{64}$/),
  snapshotGitSha: z.string().regex(/^[0-9a-f]{40}$/),
  acceptedAt: z.string().datetime({ offset: true }),
  deployment: z.object({
    provider: z.literal('vercel'),
    deploymentId: z.string().startsWith('dpl_'),
    deploymentUrl: z.string().url(),
    canonicalBaseUrl: z.string().url(),
  }),
  verification: z.object({
    pagesChecked: z.number().int().positive(),
    bilingualPairsChecked: z.number().int().positive(),
    http200: z.literal(true),
    metadataMatched: z.literal(true),
    canonicalHreflangMatched: z.literal(true),
    sourceVersionMatched: z.literal(true),
    noindexRetained: z.literal(true),
    hygienePassed: z.literal(true),
  }),
});

export const careSeoReleaseDecisionSchema = z.object({
  schemaVersion: z.literal(1),
  targetEnvironment: z.literal('production'),
  decision: z.enum(['hold_noindex', 'approve_index_release']),
  decidedAt: z.string().datetime({ offset: true }),
  decidedBy: z.string().trim().min(1),
  snapshotSha256: z.string().regex(/^[0-9a-f]{64}$/),
  acceptanceDeploymentId: z.string().startsWith('dpl_'),
  rationale: z.string().trim().min(1).max(1000),
});

export type CareSeoEditorialSnapshotRecord = z.infer<typeof careSeoEditorialSnapshotRecordSchema>;
export type CareSeoStagingSnapshot = z.infer<typeof careSeoStagingSnapshotSchema>;
export type CareSeoHostedAcceptanceEvidence = z.infer<typeof careSeoHostedAcceptanceEvidenceSchema>;
export type CareSeoReleaseDecision = z.infer<typeof careSeoReleaseDecisionSchema>;
