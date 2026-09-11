import { careArticleAdminInputSchema, speciesAdminInputSchema, type GitRuntimeAuthoritySnapshot } from '../../packages/contracts/src';

let cached: Promise<GitRuntimeAuthoritySnapshot | null> | null = null;

const parseSnapshot = (value: unknown): GitRuntimeAuthoritySnapshot | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const snapshot = value as Partial<GitRuntimeAuthoritySnapshot>;
  if (snapshot.schemaVersion !== 1 || snapshot.authority !== 'local-file-git' || !snapshot.productCare) return null;
  if (!Array.isArray(snapshot.productCare.species) || !Array.isArray(snapshot.productCare.careArticles)) return null;
  if (!snapshot.productCare.species.every(item => item && speciesAdminInputSchema.safeParse(item.input).success && Number.isInteger(item.version) && item.version > 0 && Array.isArray(item.assets))) return null;
  if (!snapshot.productCare.careArticles.every(item => item && careArticleAdminInputSchema.safeParse(item.input).success && Number.isInteger(item.version) && item.version > 0 && Array.isArray(item.assets))) return null;
  if (snapshot.compatibility && (!Array.isArray(snapshot.compatibility.profiles) || !Array.isArray(snapshot.compatibility.pairRules) || snapshot.compatibility.authority !== 'reviewed-git')) return null;
  return snapshot as GitRuntimeAuthoritySnapshot;
};

export const loadGitRuntimeAuthoritySnapshot = async (fresh = false) => {
  if (fresh || !cached) {
    cached = fetch(`/runtime-authority.json${fresh ? `?v=${Date.now()}` : ''}`, { cache: fresh ? 'no-store' : 'default' })
      .then(async response => response.ok ? parseSnapshot(await response.json()) : null)
      .catch(() => null);
  }
  return cached;
};

export const resetGitRuntimeAuthoritySnapshotForTest = () => { cached = null; };
