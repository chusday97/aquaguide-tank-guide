import type { ReleaseEventDto } from '../../../packages/contracts/src';
import { compatibilityAdminService, type AdminCompatibilityPairRuleRevision, type AdminCompatibilityProfileRevision } from './compatibility-admin.service';
import { contentAdminService, type AdminCareArticleRecord, type AdminSpeciesRecord } from './content-admin.service';
import { publishCenterService } from './publish-center.service';
import { AquaGuideApiError } from '../api/api-client';
import { seoPageRegistryService, type SeoHealthIssueCode, type SeoPageRegistrySnapshot } from './seo-page-registry.service';

export type OperationsSeverity = 'blocker' | 'decision' | 'attention' | 'ready' | 'info';
export type OperationsAuthority = 'product_care' | 'compatibility' | 'seo';
export type OperationsAvailability = 'ready' | 'partial' | 'auth_required' | 'forbidden' | 'unavailable';

export type OperationsWorkItem = {
  id: string;
  authority: OperationsAuthority;
  severity: OperationsSeverity;
  title: string;
  detail: string;
  count: number;
  resourceKey: string;
  resourceLabel: string;
  reason: string;
  gateLabel: string;
  nextStep: string;
  verificationNote: string;
  actionLabel: string;
  href: string;
};

export type OperationsSourceStatus = {
  authority: OperationsAuthority;
  label: string;
  availability: OperationsAvailability;
  detail: string;
};

export type OperationsHomeSnapshot = {
  workItems: OperationsWorkItem[];
  sources: OperationsSourceStatus[];
  recentEvents: ReleaseEventDto[];
};

const priority: Record<OperationsSeverity, number> = { blocker: 0, decision: 1, attention: 2, ready: 3, info: 4 };
export const sortOperationsWorkItems = (items: OperationsWorkItem[]) => [...items].sort((a, b) => priority[a.severity] - priority[b.severity] || b.count - a.count);

export type OperationsReadResult = { status: 'fulfilled' } | { status: 'rejected'; reason: unknown };

const hasApiFailure = (result: OperationsReadResult, status: number, code: 'AUTH_REQUIRED' | 'FORBIDDEN') => result.status === 'rejected'
  && result.reason instanceof AquaGuideApiError
  && (result.reason.status === status || result.reason.code === code);

export const classifyOperationsReadResults = (results: OperationsReadResult[]): OperationsAvailability => {
  if (results.length === 0) return 'unavailable';
  const readable = results.filter(result => result.status === 'fulfilled').length;
  if (readable === results.length) return 'ready';
  if (readable > 0) return 'partial';
  if (results.some(result => hasApiFailure(result, 401, 'AUTH_REQUIRED'))) return 'auth_required';
  if (results.some(result => hasApiFailure(result, 403, 'FORBIDDEN'))) return 'forbidden';
  return 'unavailable';
};

const seoIssueLabel: Record<string, string> = {
  missing_meta_title: '缺少 Meta Title',
  missing_meta_description: '缺少 Meta Description',
  missing_h1: '缺少 H1',
  missing_bilingual_pair: '中英文版本未配对',
  canonical_conflict: 'Canonical 指向无效或冲突',
  missing_editorial_review: '尚未完成人工审核',
  source_not_published: 'Care 源内容尚未发布',
  source_not_snapshot: 'Care 仍使用旧发布来源',
  source_drift: 'Care Published source 已更新',
  index_strategy_unknown: 'Index 策略尚未确认',
  source_state_unknown: '来源状态尚未就绪',
};
const localeLabel = (locale: string) => locale === 'en' ? 'English' : '中文';
const seoIssueNextStep: Record<string, string> = {
  missing_meta_title: '补齐 Meta Title，并重新检查页面健康状态',
  missing_meta_description: '补齐 Meta Description，并重新检查页面健康状态',
  missing_h1: '补齐 H1，并重新检查页面健康状态',
  missing_bilingual_pair: '补齐中英文配对后再继续审核或索引',
  canonical_conflict: '修正 Canonical 目标并确认同语言目标可索引',
  missing_editorial_review: '完成该页面人工审核',
  source_not_published: '先回 Care authority 发布源内容',
  source_not_snapshot: '先生成并绑定 immutable Published snapshot',
  source_drift: '重新审核 SEO，并绑定最新 Published source',
  index_strategy_unknown: '明确 index / noindex / canonical_to_sibling 策略',
  source_state_unknown: '先恢复来源权限或服务可读状态',
};
const seoHardBlockerOrder: SeoHealthIssueCode[] = [
  'source_not_published', 'source_not_snapshot', 'source_drift', 'canonical_conflict',
  'missing_meta_title', 'missing_meta_description', 'missing_h1', 'missing_bilingual_pair',
];
const selectSeoIssue = (entry: SeoPageRegistrySnapshot['entries'][number]) => {
  if (entry.health.severity === 'blocked') {
    const hard = seoHardBlockerOrder.find(issue => entry.health.issues.includes(issue));
    if (hard) return hard;
  }
  if (entry.editorialState === 'ready_for_review' && entry.health.issues.includes('missing_editorial_review')) return 'missing_editorial_review';
  return entry.health.issues[0] || 'unknown';
};

export function buildSeoWorkItems(snapshot: SeoPageRegistrySnapshot): OperationsWorkItem[] {
  return snapshot.entries.flatMap<OperationsWorkItem>(entry => {
    if (entry.health.severity === 'unknown' || entry.health.severity === 'healthy') return [];
    const issue = selectSeoIssue(entry);
    const firstReason = seoIssueLabel[issue] || issue || '需要进一步检查';
    const reason = `${localeLabel(entry.locale)} · ${firstReason}`;
    const nextStep = seoIssueNextStep[issue] || '回到对应 SEO authority 完成该页面处理';
    if (entry.health.severity === 'blocked') return [{
      id: `seo:${entry.pageKey}:blocked`, authority: 'seo' as const, severity: 'blocker' as const,
      title: `${entry.label} · SEO 发布阻断`, detail: `${reason}。需要回到对应 SEO authority 处理。`, count: 1,
      resourceKey: entry.sourceKey, resourceLabel: entry.label, reason: firstReason,
      gateLabel: firstReason, nextStep, verificationNote: '最终发布/索引资格仍由对应 SEO authority 复核。',
      actionLabel: '处理这个页面', href: entry.editorHref,
    }];
    if (entry.editorialState === 'ready_for_review') return [{
      id: `seo:${entry.pageKey}:review`, authority: 'seo' as const, severity: 'decision' as const,
      title: `${entry.label} · 等待 SEO 人工审核`, detail: `${reason}。需要人工确认后才能继续。`, count: 1,
      resourceKey: entry.sourceKey, resourceLabel: entry.label, reason: firstReason,
      gateLabel: '等待 SEO 人工审核', nextStep: '完成该页面人工审核', verificationNote: '审核结论仍写回原 SEO authority。',
      actionLabel: '审核这个页面', href: entry.editorHref,
    }];
    return [{
      id: `seo:${entry.pageKey}:attention`, authority: 'seo' as const, severity: 'attention' as const,
      title: `${entry.label} · SEO 需要完善`, detail: `${reason}。当前不一定阻断发布，但仍需要处理。`, count: 1,
      resourceKey: entry.sourceKey, resourceLabel: entry.label, reason: firstReason,
      gateLabel: firstReason, nextStep, verificationNote: 'Operations 只提示下一步，不替代 SEO authority 状态判断。',
      actionLabel: '完善这个页面', href: entry.editorHref,
    }];
  });
}

export function buildContentWorkItems(species: AdminSpeciesRecord[], care: AdminCareArticleRecord[]): OperationsWorkItem[] {
  const speciesItems = species.filter(item => item.status === 'draft').map(item => ({
    id: `product:${item.id}:draft`, authority: 'product_care' as const, severity: 'attention' as const,
    title: `${item.name} · Product Data Draft`, detail: `${item.catalogKey} · Draft v${item.version} 尚未成为 Published Product snapshot。`, count: 1,
    resourceKey: item.catalogKey, resourceLabel: item.name, reason: 'Product Data Draft 尚未发布',
    gateLabel: '仍是 Product Data Draft', nextStep: '检查变更影响与 Preview，确认后决定继续编辑或发布', verificationNote: '发布仍由 Product / Care authority 执行。',
    actionLabel: '继续这个 Draft', href: `/admin/product-content?type=species&id=${encodeURIComponent(item.id)}`,
  }));
  const careItems = care.filter(item => item.status === 'draft').map(item => ({
    id: `care:${item.id}:draft`, authority: 'product_care' as const, severity: 'attention' as const,
    title: `${item.title} · Care Draft`, detail: `${item.catalogKey} · Draft v${item.version} 仍与最后 Published snapshot 隔离。`, count: 1,
    resourceKey: item.catalogKey, resourceLabel: item.title, reason: 'Care Draft 尚未发布',
    gateLabel: '仍是 Care Draft', nextStep: '检查 Care 变更与下游影响，确认后决定继续编辑或发布', verificationNote: '最后 Published snapshot 在显式发布前保持不变。',
    actionLabel: '继续这个 Draft', href: `/admin/product-content?type=care&id=${encodeURIComponent(item.id)}`,
  }));
  return [...speciesItems, ...careItems];
}

const compatibilityGate = (item: AdminCompatibilityProfileRevision | AdminCompatibilityPairRuleRevision) => {
  if (item.status === 'draft') return {
    severity: 'attention' as const, label: 'Draft 未提交审核', action: '继续这个 Draft',
    nextStep: '完成 Draft 编辑并提交审核', verificationNote: '提交后仍需 Impact / Regression / Evidence 与人工审核。',
  };
  const missing: string[] = [];
  if (!item.impactReport?.changedFields?.length) missing.push('Impact Check');
  if (!item.regressionReport || item.regressionReport.evaluatedScenarios <= 0) missing.push('Regression');
  if (!item.citationSnapshots.length || (item.evidenceResolution?.length || 0) < item.citationSnapshots.length) missing.push('Canonical Evidence');
  if (missing.length) return {
    severity: 'blocker' as const, label: `${missing.join(' / ')} 未就绪`, action: '修复发布前检查',
    nextStep: `回 Compatibility authority 恢复 ${missing.join('、')} 后再继续`, verificationNote: 'Operations 不会绕过缺失 gate。',
  };
  if (item.status === 'pending_review') return {
    severity: 'decision' as const, label: '等待人工审核', action: '审核这个 revision',
    nextStep: '核对 Impact / Regression / Evidence 后批准或驳回', verificationNote: '批准只改变 revision 状态，不等于已发布。',
  };
  return {
    severity: 'attention' as const, label: '已批准，待发布资格复核', action: '检查发布资格',
    nextStep: '复核 Regression / Evidence / runtime baseline gate；全部通过后才能发布', verificationNote: '最终 publish gate 必须由 Compatibility authority 实时复核。',
  };
};

export function buildCompatibilityWorkItems(profiles: AdminCompatibilityProfileRevision[], pairs: AdminCompatibilityPairRuleRevision[]): OperationsWorkItem[] {
  const profileItems = profiles.filter(item => ['draft', 'pending_review', 'approved'].includes(item.status)).map(item => {
    const state = compatibilityGate(item);
    return {
      id: `compatibility:profile:${item.id}`, authority: 'compatibility' as const, severity: state.severity,
      title: `${item.species.name} · Compatibility Profile ${state.label}`, detail: `revision #${item.revisionNumber} · ${item.species.catalogKey}。${item.status === 'approved' ? '仍需通过 Regression / Evidence / runtime baseline gate。' : '当前 reviewed runtime 尚未被这条 revision 改写。'}`, count: 1,
      resourceKey: item.species.catalogKey, resourceLabel: item.species.name, reason: state.label,
      gateLabel: state.label, nextStep: state.nextStep, verificationNote: state.verificationNote,
      actionLabel: state.action, href: `/admin/compatibility?kind=profile&revision=${encodeURIComponent(item.id)}`,
    };
  });
  const pairItems = pairs.filter(item => ['draft', 'pending_review', 'approved'].includes(item.status)).map(item => {
    const state = compatibilityGate(item);
    const label = `${item.speciesA.name} × ${item.speciesB.name}`;
    return {
      id: `compatibility:pair:${item.id}`, authority: 'compatibility' as const, severity: state.severity,
      title: `${label} · Pair Rule ${state.label}`, detail: `revision #${item.revisionNumber} · ${item.riskType}。${item.status === 'approved' ? '仍需通过 Regression / Evidence / runtime baseline gate。' : '当前 reviewed runtime 尚未被这条 revision 改写。'}`, count: 1,
      resourceKey: `${item.speciesA.catalogKey}__${item.speciesB.catalogKey}`, resourceLabel: label, reason: state.label,
      gateLabel: state.label, nextStep: state.nextStep, verificationNote: state.verificationNote,
      actionLabel: state.action, href: `/admin/compatibility?kind=pair&revision=${encodeURIComponent(item.id)}`,
    };
  });
  return [...profileItems, ...pairItems];
}

export const operationsWorkItemService = {
  async load(): Promise<OperationsHomeSnapshot> {
    const [seoResult, speciesResult, careResult, profilesResult, pairsResult, releaseResult] = await Promise.allSettled([
      seoPageRegistryService.load(), contentAdminService.listSpecies(), contentAdminService.listCareArticles(),
      compatibilityAdminService.listProfileRevisions(), compatibilityAdminService.listPairRuleRevisions(), publishCenterService.load(24),
    ]);
    const workItems: OperationsWorkItem[] = [];
    if (seoResult.status === 'fulfilled') workItems.push(...buildSeoWorkItems(seoResult.value));
    if (speciesResult.status === 'fulfilled' || careResult.status === 'fulfilled') workItems.push(...buildContentWorkItems(speciesResult.status === 'fulfilled' ? speciesResult.value : [], careResult.status === 'fulfilled' ? careResult.value : []));
    if (profilesResult.status === 'fulfilled' || pairsResult.status === 'fulfilled') workItems.push(...buildCompatibilityWorkItems(profilesResult.status === 'fulfilled' ? profilesResult.value.revisions : [], pairsResult.status === 'fulfilled' ? pairsResult.value.revisions : []));

    const sources: OperationsSourceStatus[] = [];
    const seoSources = seoResult.status === 'fulfilled' ? seoResult.value.sources : [];
    const seoAvailabilities = new Set(seoSources.map(source => source.availability));
    const seoAvailability: OperationsAvailability = seoResult.status === 'rejected'
      ? 'unavailable'
      : seoAvailabilities.size > 1 ? 'partial'
        : seoAvailabilities.has('unavailable') ? 'unavailable'
          : seoAvailabilities.has('auth_required') ? 'auth_required' : 'ready';
    const seoDetail = seoResult.status === 'rejected'
      ? 'SEO task source 暂不可读取。'
      : seoSources.map(source => `${source.label}：${source.detail}`).join(' · ') || 'SEO Registry 可读取。';
    sources.push({ authority: 'seo', label: 'SEO', availability: seoAvailability, detail: seoDetail });
    const productAvailability = classifyOperationsReadResults([speciesResult, careResult]);
    const productDetail = productAvailability === 'ready'
      ? '当前 Product / Care Draft 状态可读取。'
      : productAvailability === 'partial'
        ? 'Product / Care 只有部分当前状态可读取；未读取部分不会显示假 0。'
        : productAvailability === 'auth_required'
          ? '当前浏览器缺少 Business Admin 会话；使用已配置的安全管理员会话后点击上方「刷新任务」。'
          : productAvailability === 'forbidden'
            ? '当前账号已登录，但没有 Business Admin 内容管理权限；请使用已授权管理员账号后刷新任务。'
            : 'Product / Care 当前状态暂不可读取；这表示来源/服务异常，不等于没有任务。';
    sources.push({ authority: 'product_care', label: 'Product / Care', availability: productAvailability, detail: productDetail });
    const compatibilityAvailability = classifyOperationsReadResults([profilesResult, pairsResult]);
    const compatibilityDetail = compatibilityAvailability === 'ready'
      ? 'Profile / Pair Rule revision 当前状态可读取。'
      : compatibilityAvailability === 'partial'
        ? 'Compatibility 只有部分 revision 当前状态可读取；未读取部分不会显示假 0。'
        : compatibilityAvailability === 'auth_required'
          ? '当前浏览器缺少 Business Admin 会话；使用已配置的安全管理员会话后点击上方「刷新任务」。'
          : compatibilityAvailability === 'forbidden'
            ? '当前账号已登录，但没有 Compatibility 管理权限；请使用已授权管理员账号后刷新任务。'
            : 'Compatibility revision 当前状态暂不可读取；这表示来源/服务异常，不等于没有任务。';
    sources.push({ authority: 'compatibility', label: 'Compatibility', availability: compatibilityAvailability, detail: compatibilityDetail });

    return { workItems: sortOperationsWorkItems(workItems), sources, recentEvents: releaseResult.status === 'fulfilled' ? releaseResult.value.events.slice(0, 6) : [] };
  },
};
