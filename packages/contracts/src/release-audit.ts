export type ReleaseAuthority = 'product_care' | 'compatibility' | 'seo';
export type ReleaseDomain = 'product' | 'care' | 'compatibility_profile' | 'compatibility_pair' | 'seo_page' | 'seo_base' | 'seo_batch' | 'seo_admin';
export type ReleaseSourceAvailability = 'ready' | 'auth_required' | 'unavailable';
export type ReleaseHistoryCoverage = 'current_only' | 'revision_history' | 'activity_history';
export type ReleaseStage = 'diff' | 'impact' | 'preview' | 'review' | 'staging' | 'production';
export type ReleaseCapabilityState = 'available' | 'partial' | 'locked' | 'not_applicable';

export interface ReleaseEventDto {
  id: string;
  authority: ReleaseAuthority;
  domain: ReleaseDomain;
  eventType: string;
  status: string;
  title: string;
  detail?: string;
  resourceKey?: string;
  locale?: string;
  version?: number;
  actor?: string;
  occurredAt: string;
  sourceRef?: string;
  metadata?: Record<string, unknown>;
}

export interface ReleaseSourceStatusDto {
  authority: ReleaseAuthority;
  availability: ReleaseSourceAvailability;
  coverage: ReleaseHistoryCoverage;
  label: string;
  detail?: string;
}

export interface ReleaseCapabilityDto {
  authority: ReleaseAuthority;
  stage: ReleaseStage;
  state: ReleaseCapabilityState;
  label: string;
  detail: string;
}

export interface ReleaseFeedDto {
  events: ReleaseEventDto[];
  sources: ReleaseSourceStatusDto[];
  capabilities: ReleaseCapabilityDto[];
}
