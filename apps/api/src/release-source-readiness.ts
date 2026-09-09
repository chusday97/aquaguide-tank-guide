import type { ReleaseSourceAvailability } from '../../../packages/contracts/src';

export type ReleaseDatabaseError = { code?: string; message?: string } | null | undefined;
export type ReleaseTableReadState = 'ready' | 'schema_not_ready' | 'unavailable';

export const isMissingReleaseSchema = (error: ReleaseDatabaseError, objects: string[]) => {
  if (!error) return false;
  const code = String(error.code || '');
  const message = String(error.message || '');
  if (['42P01', 'PGRST205'].includes(code)) return true;
  return objects.some(object => message.toLowerCase().includes(object.toLowerCase()))
    && /not found|does not exist|schema cache/i.test(message);
};

export const classifyReleaseTableRead = (error: ReleaseDatabaseError, objects: string[]): ReleaseTableReadState => {
  if (!error) return 'ready';
  return isMissingReleaseSchema(error, objects) ? 'schema_not_ready' : 'unavailable';
};

export const combineReleaseTableStates = (states: ReleaseTableReadState[]): ReleaseSourceAvailability => {
  if (!states.length) return 'unavailable';
  if (states.every(state => state === 'ready')) return 'ready';
  if (states.some(state => state === 'ready')) return 'partial';
  if (states.every(state => state === 'schema_not_ready')) return 'schema_not_ready';
  return 'unavailable';
};
