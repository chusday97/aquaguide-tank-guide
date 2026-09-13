import { apiRequest, AquaGuideApiError } from '../api/api-client';
import { localAssetStore } from './local-asset.store';

export type LocalAdminPartition = 'business' | 'compatibility' | 'care-seo';

const runtimeEnv = (import.meta as ImportMeta & {
  env?: {
    DEV?: boolean;
    VITE_ADMIN_LOCAL_MODE?: string;
    VITE_ADMIN_LOCAL_FILE_MODE?: string;
  };
}).env;

export const isLocalAdminFileMode = Boolean(
  runtimeEnv?.DEV === true
  && runtimeEnv.VITE_ADMIN_LOCAL_MODE === 'true'
  && runtimeEnv.VITE_ADMIN_LOCAL_FILE_MODE === 'true',
);

const storageKeys: Record<LocalAdminPartition, string> = {
  business: 'aquaguide-local-business-admin-v1',
  compatibility: 'aquaguide-local-compatibility-admin-v1',
  'care-seo': 'aquaguide-local-care-seo-editorial-v1',
};
type LocalFileStatus = {
  enabled: boolean;
  root: string;
  partitions: Record<LocalAdminPartition, boolean>;
};

type LocalFileStateEnvelope = {
  partition: LocalAdminPartition;
  state: unknown;
};

export type LocalAdminIntegrityIssue = {
  severity: 'error' | 'warning';
  code: string;
  message: string;
};
export type LocalAdminIntegrityReport = {
  healthy: boolean;
  checkedAt: string;
  partitions: Record<LocalAdminPartition, boolean>;
  assets: { referenced: number; metadata: number; blobs: number; orphaned: number };
  issues: LocalAdminIntegrityIssue[];
};
export type LocalAdminBackupSummary = {
  backupFormatVersion: number;
  localFileFormatVersion: number;
  id: string;
  createdAt: string;
  reason: string;
  healthyAtBackup: boolean;
  errorCount: number;
  warningCount: number;
};
export type LocalAdminSafetySnapshot = {
  integrity: LocalAdminIntegrityReport;
  backups: LocalAdminBackupSummary[];
};

let status: 'browser-only' | 'hydrating' | 'durable' | 'unavailable' = isLocalAdminFileMode ? 'hydrating' : 'browser-only';
let rootPath = '';

export const getLocalAdminPersistenceStatus = () => ({ mode: status, root: rootPath });

export const getLocalAdminSafetySnapshot = async (): Promise<LocalAdminSafetySnapshot | null> => {
  if (!isLocalAdminFileMode) return null;
  const [integrity, backups] = await Promise.all([
    apiRequest<LocalAdminIntegrityReport>('/local-admin/integrity', { authenticated: false }),
    apiRequest<{ backups: LocalAdminBackupSummary[] }>('/local-admin/backups', { authenticated: false }),
  ]);
  return { integrity, backups: backups.backups };
};

export const createLocalAdminBackup = async (reason = 'manual') => {
  if (!isLocalAdminFileMode) throw new AquaGuideApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Local File Mode 未启用。');
  return apiRequest<LocalAdminBackupSummary>('/local-admin/backups', {
    method: 'POST', authenticated: false, body: { reason },
  });
};

export type LocalRuntimeSnapshotResult = {
  generatedAt: string;
  snapshotPath: string;
  assetDirectory: string;
  counts: { species: number; care: number; profiles: number; pairRules: number };
  sourceHash: { business: string; compatibility: string };
  gitCommitRequired: true;
  deploymentTriggered: false;
};

export const publishLocalRuntimeAuthoritySnapshot = async () => {
  if (!isLocalAdminFileMode) throw new AquaGuideApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Local File Mode 未启用。');
  return apiRequest<LocalRuntimeSnapshotResult>('/local-admin/runtime-snapshot', {
    method: 'POST', authenticated: false,
  });
};

export const restoreLocalAdminBackup = async (backupId: string) => {
  if (!isLocalAdminFileMode) throw new AquaGuideApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Local File Mode 未启用。');
  return apiRequest<{ backupId: string; safetyBackupId: string; integrity: LocalAdminIntegrityReport }>(
    `/local-admin/backups/${encodeURIComponent(backupId)}/restore`,
    { method: 'POST', authenticated: false },
  );
};

export const persistLocalAdminPartition = async (partition: LocalAdminPartition, state: unknown) => {
  if (!isLocalAdminFileMode) return;
  try {
    await apiRequest(`/local-admin/state/${partition}`, {
      method: 'PUT', authenticated: false, body: state,
    });
    status = 'durable';
  } catch (error) {
    status = 'unavailable';
    throw error;
  }
};
export const hydrateLocalAdminFileStores = async () => {
  if (!isLocalAdminFileMode || typeof window === 'undefined') return;
  status = 'hydrating';
  try {
    const remoteStatus = await apiRequest<LocalFileStatus>('/local-admin/status', { authenticated: false });
    rootPath = remoteStatus.root;
    for (const partition of Object.keys(storageKeys) as LocalAdminPartition[]) {
      let stateValue: unknown = null;
      if (remoteStatus.partitions[partition]) {
        const envelope = await apiRequest<LocalFileStateEnvelope>(`/local-admin/state/${partition}`, { authenticated: false });
        stateValue = envelope.state;
      } else {
        const existing = window.localStorage.getItem(storageKeys[partition]);
        stateValue = existing ? JSON.parse(existing) : null;
      }
      if (stateValue === null) continue;
      const migrated = partition === 'business' ? await migrateBrowserAssetsToFiles(stateValue) : false;
      window.localStorage.setItem(storageKeys[partition], JSON.stringify(stateValue));
      if (!remoteStatus.partitions[partition] || migrated) await persistLocalAdminPartition(partition, stateValue);
    }
    status = 'durable';
  } catch (error) {
    status = 'unavailable';
    if (error instanceof AquaGuideApiError) {
      throw new AquaGuideApiError(error.status, error.code,
        `已启用 Local File Mode，但 Durable Local File authority 未能安全启动；为避免误以为内容已持久保存，应用已停止启动。具体原因：${error.message}`,
        error.requestId, error.details);
    }
    throw error;
  }
};

const localAssetUrl = (assetId: string) => `/api/v1/local-admin/assets/${encodeURIComponent(assetId)}`;

type LocalFileAssetResult = {
  mimeType: string;
  byteSize: number;
  width?: number;
  height?: number;
  url: string;
};

const imageDimensions = async (file: File) => {
  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  } catch {
    return {};
  }
};

export const getLocalFileAssetUrl = (assetId: string) => (
  isLocalAdminFileMode ? localAssetUrl(assetId) : null
);

export const putLocalFileAsset = async (assetId: string, file: File): Promise<LocalFileAssetResult> => {
  if (!isLocalAdminFileMode) throw new AquaGuideApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Local File Mode 未启用。');
  const dimensions = await imageDimensions(file);
  let response: Response;
  try {
    response = await fetch(localAssetUrl(assetId), {
      method: 'PUT', headers: { 'Content-Type': file.type }, body: file,
    });
  } catch {
    status = 'unavailable';
    throw new AquaGuideApiError(0, 'DEPENDENCY_UNAVAILABLE', '本地图片文件服务不可用，图片没有保存。');
  }
  const payload = await response.json().catch(() => null) as {
    data?: { mimeType?: string; byteSize?: number };
    error?: { code?: string; message?: string };
    requestId?: string;
  } | null;
  if (!response.ok || !payload?.data) {
    status = 'unavailable';
    throw new AquaGuideApiError(
      response.status,
      (payload?.error?.code as AquaGuideApiError['code']) || 'INTERNAL_ERROR',
      payload?.error?.message || '本地图片没有保存成功。',
      payload?.requestId,
    );
  }
  status = 'durable';
  return {
    mimeType: payload.data.mimeType || file.type,
    byteSize: payload.data.byteSize || file.size,
    ...dimensions,
    url: localAssetUrl(assetId),
  };
};

type LegacyAssetRef = {
  id?: unknown;
  storageBucket?: unknown;
  storagePath?: unknown;
};

const migrateBrowserAssetsToFiles = async (state: unknown) => {
  if (!state || typeof state !== 'object') return false;
  const candidates: LegacyAssetRef[] = [];
  const visit = (value: unknown) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    const record = value as Record<string, unknown>;
    if (record.storageBucket === 'local-indexeddb' && typeof record.id === 'string') candidates.push(record);
    Object.values(record).forEach(visit);
  };
  visit(state);
  if (!candidates.length) return false;
  const migratedIds = new Set<string>();
  for (const candidate of candidates) {
    const assetId = String(candidate.id);
    if (!migratedIds.has(assetId)) {
      const stored = await localAssetStore.get(assetId);
      if (!stored) throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', `旧浏览器图片 ${assetId} 不存在，无法迁移到 Local File。`);
      const file = new File([stored.blob], stored.fileName || `${assetId}.bin`, { type: stored.mimeType });
      await putLocalFileAsset(assetId, file);
      migratedIds.add(assetId);
    }
    candidate.storageBucket = 'local-file';
    candidate.storagePath = assetId;
  }
  return true;
};

export const removeLocalFileAsset = async (assetId: string) => {
  if (!isLocalAdminFileMode) return;
  try {
    const response = await fetch(localAssetUrl(assetId), { method: 'DELETE' });
    if (!response.ok && response.status !== 404) {
      throw new AquaGuideApiError(response.status, 'INTERNAL_ERROR', '本地图片清理失败。');
    }
  } catch (error) {
    if (error instanceof AquaGuideApiError) throw error;
    throw new AquaGuideApiError(0, 'DEPENDENCY_UNAVAILABLE', '本地图片文件服务不可用。');
  }
};
