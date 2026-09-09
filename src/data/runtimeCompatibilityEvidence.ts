import { apiRequest } from '../services/api/api-client';
import { isLocalBusinessAdminMode } from '../services/admin/local-business-admin.store';
import { localCompatibilityAdminStore } from '../services/admin/local-compatibility-admin.store';
import {
  applyReviewedCompatibilityBootstrap,
  getRuntimeCompatibilityEvidenceAudit,
  getRuntimeCompatibilityStatus,
  getRuntimeReviewedCompatibilityProfile,
  getRuntimeReviewedPairRule,
  resetRuntimeCompatibilityEvidence,
  resetRuntimeCompatibilityEvidenceForTest,
  type CompatibilityBootstrapResponse,
} from './runtimeCompatibilityRegistry';

export {
  applyReviewedCompatibilityBootstrap,
  getRuntimeCompatibilityEvidenceAudit,
  getRuntimeCompatibilityStatus,
  getRuntimeReviewedCompatibilityProfile,
  getRuntimeReviewedPairRule,
  resetRuntimeCompatibilityEvidenceForTest,
};

export const hydrateReviewedCompatibilityEvidence = async (fresh = false) => {
  try {
    if (isLocalBusinessAdminMode) return applyReviewedCompatibilityBootstrap(await localCompatibilityAdminStore.getBootstrap());
    const path = fresh ? `/compatibility-bootstrap?fresh=${Date.now()}` : '/compatibility-bootstrap';
    const payload = await apiRequest<CompatibilityBootstrapResponse>(path, {
      authenticated: false,
      signal: AbortSignal.timeout(5000),
    });
    return applyReviewedCompatibilityBootstrap(payload);
  } catch {
    resetRuntimeCompatibilityEvidence('reviewed_db_unavailable');
    return getRuntimeCompatibilityStatus();
  }
};
