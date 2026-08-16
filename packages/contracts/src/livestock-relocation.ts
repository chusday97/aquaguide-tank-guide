import { z } from 'zod';
import { uuidSchema, versionSchema } from './business';

export const livestockRelocationSchema = z.object({
  destinationAquariumId: uuidSchema,
  quantity: z.number().int().positive().max(100000),
  sourceBatchVersion: versionSchema,
}).superRefine((value, context) => {
  if (!value.destinationAquariumId) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: '目标鱼缸不能为空' });
  }
});

export type LivestockRelocationInputDto = z.infer<typeof livestockRelocationSchema>;

export type LivestockRelocationResultDto = {
  sourceAquariumId: string;
  destinationAquariumId: string;
  destinationSpeciesRecordId: string;
  destinationBatchId: string;
  replayed: boolean;
};
