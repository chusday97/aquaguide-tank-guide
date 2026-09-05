import type { SupportedLocale } from './localization';

export type CareSeoProjectionAuthority = 'publication-snapshot' | 'legacy-published';
export type CareSeoRouteReadiness = 'blocked' | 'ready';

export interface CareSeoProjectionSourceFactDto {
  label: string;
  value: string | string[];
}

export interface CareSeoProjectionDto {
  sourceCareId: string;
  sourceCareCatalogKey: string;
  sourceCareVersion: number;
  sourcePublishedAt: string;
  sourceAuthority: CareSeoProjectionAuthority;
  locale: SupportedLocale;
  route: {
    pathname: string;
    topicParam: string;
    candidateUrl: string;
    readiness: CareSeoRouteReadiness;
    blockers: string[];
  };
  sourceFacts: {
    title: string;
    category: string;
    urgency: string;
    summary: string;
    symptoms: string[];
    immediateActions: string[];
    avoidActions: string[];
    observeItems: string[];
    diagnoseWhen: string[];
    nextStep: string;
    evidenceCount: number;
  };
  suggestedEditorial: {
    seoTitle: string;
    metaDescription: string;
    h1: string;
    focusKeyword: string;
  };
  editableFields: Array<'seoTitle' | 'metaDescription' | 'h1' | 'focusKeyword'>;
  protectedSourceFields: string[];
  publishReady: boolean;
}
