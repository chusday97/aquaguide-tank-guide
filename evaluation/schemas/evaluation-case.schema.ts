import { z } from 'zod';

export const evaluationTaskSchema = z.enum([
  'tank_copilot',
  'daily_check',
  'species_diagnosis',
  'species_recognition',
]);

export const evaluationCategorySchema = z.enum([
  'normal',
  'boundary',
  'hard_conflict',
  'missing_information',
  'unknown_data',
  'irrelevant_input',
  'adversarial_input',
  'provider_failure',
  'localization',
  'vision_ambiguous',
]);

export const evaluationCaseSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  task: evaluationTaskSchema,
  category: evaluationCategorySchema,
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  input: z.record(z.string(), z.unknown()),
  expected: z.object({
    source: z.enum(['rules', 'model', 'fallback', 'any']).optional(),
    ruleStatus: z.string().optional(),
    requiredBehaviors: z.array(z.string()).default([]),
    forbiddenBehaviors: z.array(z.string()).default([]),
    requiredActions: z.array(z.string()).default([]),
    forbiddenActions: z.array(z.string()).default([]),
  }),
  metadata: z.object({
    origin: z.enum(['designed', 'production_badcase', 'user_test', 'regression']),
    modelVersion: z.string().optional(),
    promptVersion: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export type EvaluationCase = z.infer<typeof evaluationCaseSchema>;

export const evaluationResultSchema = z.object({
  caseId: z.string(),
  task: evaluationTaskSchema,
  category: evaluationCategorySchema,
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  runner: z.enum(['deterministic', 'mocked_provider', 'live_provider']),
  passed: z.boolean(),
  source: z.enum(['rules', 'model', 'fallback', 'unknown']),
  ruleStatus: z.string().optional(),
  behaviors: z.array(z.string()),
  actions: z.array(z.string()),
  failures: z.array(z.string()),
  latencyMs: z.number().nonnegative(),
  failureReason: z.string().optional(),
  safeSummary: z.record(z.string(), z.unknown()).optional(),
  modelVersion: z.string().optional(),
  promptVersion: z.string().optional(),
  generatedAt: z.string(),
});

export type EvaluationResult = z.infer<typeof evaluationResultSchema>;

export const badcaseSchema = z.object({
  id: z.string(),
  evaluationCaseId: z.string(),
  task: evaluationTaskSchema,
  discoveredAt: z.string(),
  source: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  symptom: z.string(),
  expectedBehavior: z.string(),
  actualBehavior: z.string(),
  rootCause: z.string(),
  rootCauseLayer: z.enum(['data', 'rule', 'prompt', 'model', 'api', 'workflow', 'ui', 'analytics']),
  status: z.enum(['open', 'investigating', 'fixed', 'regression_verified', 'wont_fix']),
  fixedByCommit: z.string().optional(),
  regressionCaseId: z.string().optional(),
  modelVersion: z.string().optional(),
  promptVersion: z.string().optional(),
});

export type EvaluationBadcase = z.infer<typeof badcaseSchema>;

export const visionManifestEntrySchema = z.object({
  id: z.string(),
  imagePath: z.string(),
  expectedCatalogKeys: z.array(z.string()),
  expectedStatus: z.enum(['matched', 'ambiguous', 'unmatched']),
  source: z.string(),
  consentConfirmed: z.literal(true),
  addedAt: z.string(),
});
