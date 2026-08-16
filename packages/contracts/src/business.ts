import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const isoDateSchema = z.string().date();
export const isoDateTimeSchema = z.string().datetime({ offset: true });
export const versionSchema = z.number().int().positive();

export const aquariumCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  startedAt: isoDateSchema.optional(),
  startedAtSource: z.enum(['created', 'inferred', 'user']).optional(),
  startedAtConfirmedAt: isoDateTimeSchema.optional(),
  waterType: z.enum(['Freshwater', 'Saltwater']).optional(),
  lengthCm: z.number().positive().max(10000).optional(),
  widthCm: z.number().positive().max(10000).optional(),
  heightCm: z.number().positive().max(10000).optional(),
  targetTemperatureC: z.number().min(-10).max(60).optional(),
  lastWaterChangeAt: isoDateTimeSchema.optional(),
  lastWaterStoredAt: isoDateTimeSchema.optional(),
});

export const aquariumUpdateSchema = aquariumCreateSchema.partial().extend({ version: versionSchema });

export const lifeStageSchema = z.enum(['unknown', 'juvenile', 'adult']);
export const reproductiveStateSchema = z.enum([
  'unknown',
  'not_applicable',
  'normal',
  'pregnant_or_gravid',
  'in_labor_or_spawning',
  'postpartum_recovery',
]);

export const aquariumSpeciesCreateSchema = z.object({
  speciesCatalogKey: z.string().trim().min(1).max(160),
  quantity: z.number().int().positive().max(100000),
  entryDate: isoDateSchema,
  lastWaterChangeAt: isoDateTimeSchema.optional(),
  lifeStage: lifeStageSchema.default('unknown'),
  reproductiveState: reproductiveStateSchema.default('unknown'),
});

export const aquariumSpeciesUpdateSchema = z.object({
  quantity: z.number().int().positive().max(100000).optional(),
  entryDate: isoDateSchema.optional(),
  lastWaterChangeAt: isoDateTimeSchema.optional(),
  version: versionSchema,
}).refine(value => Object.keys(value).some(key => key !== 'version'), '至少修改一个字段');

export const aquariumSpeciesBatchCreateSchema = z.object({
  quantity: z.number().int().positive().max(100000),
  entryDate: isoDateSchema,
  lifeStage: lifeStageSchema.default('unknown'),
  reproductiveState: reproductiveStateSchema.default('unknown'),
});

export const aquariumSpeciesBatchUpdateSchema = aquariumSpeciesBatchCreateSchema.partial().extend({
  version: versionSchema,
}).refine(value => Object.keys(value).some(key => key !== 'version'), '至少修改一个字段');

export const aquariumSpeciesBatchSplitSchema = z.object({
  quantity: z.number().int().positive().max(100000),
  entryDate: isoDateSchema.optional(),
  lifeStage: lifeStageSchema,
  reproductiveState: reproductiveStateSchema,
  sourceVersion: versionSchema,
});

export const aquariumSpeciesBatchMergeSchema = z.object({
  sourceBatchId: uuidSchema,
  targetEntryDate: isoDateSchema,
  targetLifeStage: lifeStageSchema,
  targetReproductiveState: reproductiveStateSchema,
  targetVersion: versionSchema,
  sourceVersion: versionSchema,
});

export const aquariumSpeciesBatchRemovalSchema = z.object({
  quantity: z.number().int().positive().max(100000),
});

export const aquariumEquipmentUpsertSchema = z.object({
  filterType: z.string().trim().max(80).optional(),
  heater: z.boolean().optional(),
  oxygen: z.boolean().optional(),
  lightType: z.string().trim().max(80).optional(),
  version: versionSchema.optional(),
});

export const aquariumComponentCreateSchema = z.object({
  componentType: z.enum(['substrate', 'plant', 'hardscape']),
  name: z.string().trim().min(1).max(120),
  quantity: z.number().int().positive().max(100000).optional(),
});

export const aquariumComponentUpdateSchema = aquariumComponentCreateSchema.partial().extend({ version: versionSchema });

export const diagnosisSaveSchema = z.object({
  diagnosisKey: z.string().trim().min(1).max(180),
  problemType: z.string().trim().min(1).max(80).default('巡检'),
  sourceType: z.string().trim().max(80).optional(),
  sourceTitle: z.string().trim().max(160).optional(),
  answers: z.record(z.string(), z.string()),
  structuredAnswers: z.array(z.object({
    questionId: z.string(),
    question: z.string(),
    answer: z.string(),
  })).default([]),
  resultSummary: z.string().trim().min(1).max(2000),
  riskLevel: z.string().trim().min(1).max(80),
  riskCode: z.enum(['low', 'medium', 'high', 'unknown']).optional(),
  conclusion: z.string().max(4000).optional(),
  keyMetrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  suggestedActions: z.array(z.string()).default([]),
  avoidActions: z.array(z.string()).default([]),
  observeItems: z.array(z.string()).default([]),
  missingInfo: z.array(z.string()).default([]),
  optionalMissingInfo: z.array(z.string()).default([]),
  nextCheckAt: isoDateTimeSchema.optional(),
  followUpNotes: z.array(z.string()).default([]),
  version: versionSchema.optional(),
});

export const memorialCauseCodeSchema = z.enum([
  'water_quality_change',
  'oxygen_shortage',
  'temperature_stress',
  'acclimation_stress',
  'aggression_or_injury',
  'feeding_or_digestive',
  'suspected_illness',
  'recent_medication_or_change',
  'age_related',
  'unknown',
  'other',
]);

export const memorialCauseCodesSchema = z.array(memorialCauseCodeSchema).max(5).refine(
  value => !value.includes('unknown') || value.length === 1,
  '不确定不能与其他原因同时选择',
);

export const memorialCreateSchema = z.object({
  aquariumId: uuidSchema.optional(),
  speciesCatalogKey: z.string().trim().min(1).max(160),
  memorialDate: isoDateSchema,
  causeCodes: memorialCauseCodesSchema.default([]),
  reason: z.string().trim().max(2000).optional(),
  observation: z.string().trim().max(2000).optional(),
  improvement: z.string().trim().max(2000).optional(),
});

export const livestockMemorialCreateSchema = memorialCreateSchema.omit({ aquariumId: true }).extend({
  batchVersion: versionSchema,
});

export const memorialUpdateSchema = z.object({
  memorialDate: isoDateSchema.optional(),
  causeCodes: memorialCauseCodesSchema.optional(),
  reason: z.string().trim().max(2000).optional(),
  observation: z.string().trim().max(2000).optional(),
  improvement: z.string().trim().max(2000).optional(),
  version: versionSchema,
}).refine(value => (
  value.memorialDate !== undefined
  || value.causeCodes !== undefined
  || value.reason !== undefined
  || value.observation !== undefined
  || value.improvement !== undefined
), '至少修改一个字段');

export const careReminderCreateSchema = z.object({
  aquariumId: uuidSchema.optional(),
  sourceCatalogKey: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(160),
  reminderType: z.string().trim().min(1).max(80),
  scheduledFor: isoDateTimeSchema,
  label: z.string().trim().max(120).optional(),
  seriesId: uuidSchema.optional(),
  repeatEnabled: z.boolean().default(false),
  repeatIntervalDays: z.number().int().min(1).max(90).optional(),
}).superRefine((value, context) => {
  if (value.repeatEnabled && (!value.seriesId || !value.repeatIntervalDays)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: '循环计划需要系列标识和间隔天数' });
  }
  if (!value.repeatEnabled && (value.seriesId || value.repeatIntervalDays)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: '非循环计划不能携带循环字段' });
  }
});

export const careReminderUpdateSchema = z.object({
  scheduledFor: isoDateTimeSchema.optional(),
  label: z.string().trim().max(120).optional(),
  completedAt: isoDateTimeSchema.nullable().optional(),
  repeatEnabled: z.boolean().optional(),
  repeatIntervalDays: z.number().int().min(1).max(90).nullable().optional(),
  version: versionSchema,
}).refine(value => value.scheduledFor !== undefined || value.label !== undefined || value.completedAt !== undefined || value.repeatEnabled !== undefined || value.repeatIntervalDays !== undefined, '至少修改一个字段');

export const careChecklistProgressSaveSchema = z.object({
  aquariumId: uuidSchema.optional(),
  topicId: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(200),
  actionKeys: z.array(z.string().trim().min(1).max(240)).max(50).default([]),
  legacyActions: z.array(z.string().trim().min(1).max(1000)).max(50).default([]),
}).refine(value => value.actionKeys.length > 0 || value.legacyActions.length > 0, '至少保存一项护理进度');

export const careEventCreateSchema = z.object({
  aquariumId: uuidSchema.optional(),
  eventType: z.enum(['aquarium_created', 'settings_updated', 'species_added', 'species_removed', 'life_stage_updated', 'water_change', 'feeding', 'observation', 'daily_check', 'checklist_completed', 'care_plan_completed', 'care_operation_completed']),
  title: z.string().trim().min(1).max(160),
  label: z.string().trim().max(160).optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
  occurredAt: isoDateTimeSchema,
  sourceType: z.string().trim().min(1).max(80).optional(),
  sourceId: z.string().trim().min(1).max(200).optional(),
  isInferred: z.boolean().default(false),
}).superRefine((value, context) => {
  if (Boolean(value.sourceType) !== Boolean(value.sourceId)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: '事件来源类型与来源标识必须同时提供' });
  }
});

export const feedbackCategorySchema = z.enum(['suggestion', 'problem', 'content', 'other']);
export const feedbackStatusSchema = z.enum(['new', 'reviewed', 'closed']);
export const feedbackEmailDeliveryStatusSchema = z.enum(['not_configured', 'sent', 'failed']);

export const feedbackCreateSchema = z.object({
  category: feedbackCategorySchema,
  message: z.string().trim().min(10).max(2000),
  pagePath: z.string().trim().min(1).max(500),
  locale: z.enum(['zh-CN', 'en']),
  appVersion: z.string().trim().min(1).max(80),
  deviceLayout: z.enum(['phone', 'desktop']),
});

export const feedbackStatusUpdateSchema = z.object({
  status: feedbackStatusSchema,
});

export const migrationPreviewInputSchema = z.object({
  version: z.literal(1),
  currentAquariumId: z.string(),
  aquariums: z.array(z.unknown()),
  wishlist: z.array(z.string()),
  diagnosisRecords: z.array(z.unknown()),
  deceasedRecords: z.array(z.unknown()),
  careFavorites: z.array(z.string()).default([]),
  careReminders: z.array(z.unknown()).default([]),
  careEvents: z.array(z.unknown()).default([]),
}).passthrough();

export type AquariumCreateInput = z.infer<typeof aquariumCreateSchema>;
export type AquariumUpdateInput = z.infer<typeof aquariumUpdateSchema>;
export type AquariumSpeciesCreateInput = z.infer<typeof aquariumSpeciesCreateSchema>;
export type AquariumSpeciesUpdateInput = z.infer<typeof aquariumSpeciesUpdateSchema>;
export type AquariumSpeciesBatchCreateInput = z.infer<typeof aquariumSpeciesBatchCreateSchema>;
export type AquariumSpeciesBatchUpdateInput = z.infer<typeof aquariumSpeciesBatchUpdateSchema>;
export type AquariumSpeciesBatchSplitInput = z.infer<typeof aquariumSpeciesBatchSplitSchema>;
export type AquariumSpeciesBatchRemovalInput = z.infer<typeof aquariumSpeciesBatchRemovalSchema>;
export type DiagnosisSaveInput = z.infer<typeof diagnosisSaveSchema>;
export type MemorialCreateInput = z.infer<typeof memorialCreateSchema>;
export type CareReminderCreateInput = z.infer<typeof careReminderCreateSchema>;
export type CareChecklistProgressSaveInput = z.infer<typeof careChecklistProgressSaveSchema>;
export type CareEventCreateInput = z.infer<typeof careEventCreateSchema>;
export type FeedbackCreateInput = z.infer<typeof feedbackCreateSchema>;
export type FeedbackStatusUpdateInput = z.infer<typeof feedbackStatusUpdateSchema>;
export type MemorialCauseCode = z.infer<typeof memorialCauseCodeSchema>;
export type FeedbackEmailDeliveryStatus = z.infer<typeof feedbackEmailDeliveryStatusSchema>;

export interface FeedbackSubmissionReceipt {
  id: string;
  status: z.infer<typeof feedbackStatusSchema>;
  emailDeliveryStatus: FeedbackEmailDeliveryStatus;
  createdAt: string;
}
