import { z } from 'zod';
import { uuidSchema } from './business';

export const livestockRelocationSchema = z.object({
  destinationAquariumId: uuidSchema,
  quantity: z.number().int().positive().max(100000),
});

export type LivestockRelocationInputDto = z.infer<typeof livestockRelocationSchema>;

export type LivestockRelocationResultDto = {
  sourceAquariumId: string;
  destinationAquariumId: string;
  destinationSpeciesRecordId: string;
  destinationBatchId: string;
  replayed: boolean;
};
