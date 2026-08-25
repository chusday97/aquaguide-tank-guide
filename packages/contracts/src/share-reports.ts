import { z } from 'zod';
import { isoDateTimeSchema, uuidSchema } from './business.js';

export const exportArtifactKindSchema = z.enum([
  'health_score',
  'diagnosis_result',
  'weekly_care_plan',
  'onboarding_checklist',
  'aquarium_archive',
  'hundred_day_milestone',
]);

export type ExportArtifactKind = z.infer<typeof exportArtifactKindSchema>;

export interface ExportArtifactMeta {
  kind: ExportArtifactKind;
  aquariumId: string;
  generatedAt: string;
  locale: 'zh-CN' | 'en';
  fileName: string;
}

export const sanitizedAquariumReportSchema = z.object({
  snapshotVersion: z.literal(1),
  generatedAt: isoDateTimeSchema,
  expiresAt: isoDateTimeSchema,
  health: z.object({
    score: z.number().int().min(0).max(100),
    status: z.string().min(1).max(40),
    reasons: z.array(z.string().max(240)).max(3),
    nextAction: z.string().max(240).optional(),
    missingData: z.array(z.string().max(120)).max(8),
  }),
  environment: z.object({
    waterType: z.string().max(40).optional(),
    volumeLiters: z.number().positive().optional(),
    targetTemperatureC: z.number().optional(),
    equipment: z.array(z.string().max(120)).max(12),
  }),
  species: z.array(z.object({
    catalogKey: z.string().min(1).max(160),
    name: z.string().min(1).max(160),
    quantity: z.number().int().positive(),
  })).max(200),
  latestDiagnosis: z.object({
    riskLevel: z.string().max(40),
    conclusion: z.string().max(500),
    actions: z.array(z.string().max(240)).max(8),
  }).optional(),
  weeklyCarePlan: z.array(z.object({
    title: z.string().min(1).max(200),
    dayLabel: z.string().max(80),
    status: z.enum(['overdue', 'pending', 'completed']),
  })).max(50),
  disclaimer: z.string().min(1).max(500),
});

export type SanitizedAquariumReport = z.infer<typeof sanitizedAquariumReportSchema>;

export const aquariumShareReportCreateSchema = z.object({
  aquariumId: uuidSchema,
  snapshot: sanitizedAquariumReportSchema,
});

export const aquariumShareReportSchema = z.object({
  id: uuidSchema,
  aquariumId: uuidSchema,
  snapshotVersion: z.literal(1),
  createdAt: isoDateTimeSchema,
  expiresAt: isoDateTimeSchema,
  revokedAt: isoDateTimeSchema.optional(),
  shareUrl: z.string().url().optional(),
});

export type AquariumShareReport = z.infer<typeof aquariumShareReportSchema>;
