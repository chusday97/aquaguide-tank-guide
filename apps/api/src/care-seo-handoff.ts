import {
  careSeoStagingSnapshotSchema,
  type CareSeoEditorialSnapshotRecord,
  type CareSeoStagingSnapshot,
  type CareSeoEditorialWorkspaceDto,
  type SupportedLocale,
} from '../../../packages/contracts/src/index';
import { ApiError } from './http';
import { getCareSeoEditorialWorkspace } from './care-seo-editorial';

const locales: SupportedLocale[] = ['en', 'zh-CN'];

export const sanitizeCareSeoWorkspaceRecord = (
  workspace: CareSeoEditorialWorkspaceDto,
): CareSeoEditorialSnapshotRecord => {
  const locale = workspace.projection.locale;
  if (!workspace.persistenceAvailable) {
    throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Care SEO Editorial persistence 尚未部署到当前 Staging 环境。');
  }
  const editorial = workspace.editorial;
  if (workspace.projection.sourceAuthority !== 'publication-snapshot') {
    throw new ApiError(409, 'VERSION_CONFLICT', `Care SEO ${locale} Staging handoff 必须绑定 immutable Published Care snapshot。`);
  }
  if (!editorial || editorial.reviewState !== 'approved') {
    throw new ApiError(409, 'VERSION_CONFLICT', `Care SEO ${locale} 尚未 Approved。`);
  }
  if (
    editorial.sourceCareId !== workspace.projection.sourceCareId
    || editorial.sourceCareCatalogKey !== workspace.projection.sourceCareCatalogKey
    || editorial.locale !== workspace.projection.locale
  ) {
    throw new ApiError(409, 'VERSION_CONFLICT', `Care SEO ${locale} Editorial source identity 与 Published Care projection 不一致。`);
  }
  if (editorial.sourceDrift || editorial.sourceCareVersion !== workspace.projection.sourceCareVersion) {
    throw new ApiError(409, 'VERSION_CONFLICT', `Care SEO ${locale} source drift；必须基于最新 Published Care 重新审核。`);
  }
  if (editorial.indexStrategy !== 'noindex') {
    throw new ApiError(409, 'VERSION_CONFLICT', 'Care SEO Staging acceptance 前必须保持 noindex。');
  }
  const { projection } = workspace;
  return {
    projection: {
      sourceCareId: projection.sourceCareId,
      sourceCareCatalogKey: projection.sourceCareCatalogKey,
      sourceCareVersion: projection.sourceCareVersion,
      sourcePublishedAt: projection.sourcePublishedAt,
      sourceAuthority: projection.sourceAuthority,
      locale: projection.locale,
      route: {
        pathname: projection.route.pathname,
        topicParam: projection.route.topicParam,
        candidateUrl: projection.route.candidateUrl,
        alternates: projection.route.alternates,
      },
      sourceFacts: {
        category: projection.sourceFacts.category,
        urgency: projection.sourceFacts.urgency,
        summary: projection.sourceFacts.summary,
        immediateActions: projection.sourceFacts.immediateActions,
        avoidActions: projection.sourceFacts.avoidActions,
        observeItems: projection.sourceFacts.observeItems,
        nextStep: projection.sourceFacts.nextStep,
      },
    },
    editorial: {
      reviewState: 'approved',
      indexStrategy: 'noindex',
      seoTitle: editorial.seoTitle,
      metaDescription: editorial.metaDescription,
      h1: editorial.h1,
      focusKeyword: editorial.focusKeyword,
    },
  };
};

const sanitizeRecord = async (careId: string, locale: SupportedLocale) => (
  sanitizeCareSeoWorkspaceRecord(await getCareSeoEditorialWorkspace(careId, locale))
);

export const createCareSeoStagingHandoff = async (
  careId: string,
  sourceEnvironment: string | undefined,
  sourceLabel: string | undefined,
): Promise<CareSeoStagingSnapshot> => {
  if (sourceEnvironment !== 'staging') {
    throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Care SEO Staging handoff 只允许从显式 Staging source 生成。');
  }
  const normalizedLabel = String(sourceLabel || '').trim();
  if (!normalizedLabel || /production|prod\b/i.test(normalizedLabel)) {
    throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Care SEO Staging source label 缺失或指向 Production。');
  }
  const records = await Promise.all(locales.map(locale => sanitizeRecord(careId, locale)));
  const sourceVersions = new Set(records.map(record => record.projection.sourceCareVersion));
  const sourceIds = new Set(records.map(record => record.projection.sourceCareId));
  const catalogKeys = new Set(records.map(record => record.projection.sourceCareCatalogKey));
  if (sourceVersions.size !== 1 || sourceIds.size !== 1 || catalogKeys.size !== 1) {
    throw new ApiError(409, 'VERSION_CONFLICT', 'Care SEO bilingual pair 没有绑定同一个 Published Care version。');
  }
  return careSeoStagingSnapshotSchema.parse({
    schemaVersion: 1,
    environment: 'staging',
    sourceEnvironment: 'staging',
    sourceLabel: normalizedLabel,
    generatedAt: new Date().toISOString(),
    records,
  });
};
