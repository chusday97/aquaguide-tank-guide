import type { PublicAssetDto } from '../../../packages/contracts/src';
import { AquaGuideApiError } from '../api/api-client';

const DB_NAME = 'aquaguide-local-assets-v1';
const STORE_NAME = 'blobs';
const DB_VERSION = 1;
const MAX_BYTES = 20 * 1024 * 1024;
const SUPPORTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const objectUrls = new Map<string, string>();

type LocalAssetBlob = {
  id: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  byteSize: number;
  width?: number;
  height?: number;
  createdAt: string;
};

const ensureBrowser = () => {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    throw new AquaGuideApiError(503, 'DEPENDENCY_UNAVAILABLE', '当前浏览器不支持本地图片存储。');
  }
};
const openDb = async (): Promise<IDBDatabase> => {
  ensureBrowser();
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
  });
};

const withStore = async <T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const request = run(tx.objectStore(STORE_NAME));
      let result: T;
      request.onsuccess = () => { result = request.result; };
      request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
      tx.oncomplete = () => resolve(result!);
      tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction failed'));
      tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
    });
  } finally {
    db.close();
  }
};
const imageDimensions = async (blob: Blob) => {
  try {
    const bitmap = await createImageBitmap(blob);
    const result = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return result;
  } catch {
    return {};
  }
};

export const localAssetStore = {
  async put(id: string, file: File) {
    ensureBrowser();
    if (!SUPPORTED_TYPES.has(file.type)) throw new AquaGuideApiError(400, 'VALIDATION_ERROR', '只支持 PNG、JPEG 和 WebP 图片。');
    if (!file.size) throw new AquaGuideApiError(400, 'VALIDATION_ERROR', '请选择需要上传的图片。');
    if (file.size > MAX_BYTES) throw new AquaGuideApiError(413, 'PAYLOAD_TOO_LARGE', '图片不能超过 20MB。');
    const dimensions = await imageDimensions(file);
    const record: LocalAssetBlob = {
      id, blob: file, fileName: file.name, mimeType: file.type, byteSize: file.size,
      ...dimensions, createdAt: new Date().toISOString(),
    };
    await withStore('readwrite', store => store.put(record));
    return { ...record, blob: undefined };
  },
  async get(id: string): Promise<LocalAssetBlob | null> {
    const result = await withStore<LocalAssetBlob | undefined>('readonly', store => store.get(id));
    return result || null;
  },

  async getObjectUrl(id: string): Promise<string | null> {
    const cached = objectUrls.get(id);
    if (cached) return cached;
    const record = await this.get(id);
    if (!record) return null;
    const url = URL.createObjectURL(record.blob);
    objectUrls.set(id, url);
    return url;
  },

  async toPublicAsset(asset: { id: string; variant: string; assetVersion: number; mimeType?: string; width?: number; height?: number; byteSize?: number; stepId?: string }): Promise<PublicAssetDto | null> {
    const url = await this.getObjectUrl(asset.id);
    if (!url) return null;
    return { id: asset.id, stepId: asset.stepId, variant: asset.variant, mimeType: asset.mimeType || 'image/webp', width: asset.width, height: asset.height, byteSize: asset.byteSize, assetVersion: asset.assetVersion, url };
  },

  async remove(id: string) {
    const cached = objectUrls.get(id);
    if (cached) URL.revokeObjectURL(cached);
    objectUrls.delete(id);
    await withStore('readwrite', store => store.delete(id));
  },

  async clear() {
    for (const url of objectUrls.values()) URL.revokeObjectURL(url);
    objectUrls.clear();
    await withStore('readwrite', store => store.clear());
  },
};
