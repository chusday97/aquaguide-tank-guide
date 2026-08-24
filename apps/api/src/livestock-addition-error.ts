import { throwDatabaseError } from './data-utils.js';
import { ApiError } from './http.js';

type DatabaseError = { code?: string; message?: string } | null;

export const throwLivestockAdditionRpcError = (error: DatabaseError): never => {
  const message = error?.message || '';
  if (message.includes('AQUARIUM_NOT_FOUND')) {
    throw new ApiError(404, 'NOT_FOUND', '没有找到这个鱼缸。');
  }
  if (message.includes('SPECIES_NOT_FOUND')) {
    throw new ApiError(404, 'NOT_FOUND', '没有找到这个物种。');
  }
  if (message.includes('DUPLICATE_OPERATION_KEY') || message.includes('DUPLICATE_BATCH_ID')) {
    throw new ApiError(409, 'DUPLICATE_RESOURCE', '这个操作号已经用于另一项记录。');
  }
  return throwDatabaseError(error, '物种和体态批次没有保存成功。');
};
