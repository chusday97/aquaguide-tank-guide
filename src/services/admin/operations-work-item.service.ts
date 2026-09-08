import type { ReleaseEventDto } from '../../../packages/contracts/src';
import { compatibilityAdminService, type AdminCompatibilityPairRuleRevision, type AdminCompatibilityProfileRevision } from './compatibility-admin.service';
import { contentAdminService, type AdminCareArticleRecord, type AdminSpeciesRecord } from './content-admin.service';
import { publishCenterService } from './publish-center.service';
import { seoPageRegistryService, type SeoPageRegistrySnapshot } from './seo-page-registry.service';

export type OperationsSeverity = 'blocker' | 'decision' | 'attention' | 'ready' | 'info';
export type OperationsAuthority = 'product_care' | 'compatibility' | 'seo';
export type OperationsAvailability = 'ready' | 'partial' | 'auth_required' | 'unavailable';

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

export function buildSeoWorkItems(snapshot: SeoPageRegistrySnapshot): OperationsWorkItem[] {
  return snapshot.entries.flatMap<OperationsWorkItem>(entry => {
    if (entry.health.severity === 'unknown' || entry.health.severity === 'healthy') return [];
    const firstReason = entry.health.issues[0] ? (seoIssueLabel[entry.health.issues[0]] || entry.health.issues[0]) : '需要进一步检查';
    const reason = `${localeLabel(entry.locale)} · ${firstReason}`;
    if (entry.health.severity === 'blocked') return [{
      id: `seo:${entry.pageKey}:blocked`, authority: 'seo' as const, severity: 'blocker' as const,
      title: `${entry.label} · SEO 发布阻断`, detail: `${reason}。需要回到对应 SEO authority 处理。`, count: 1,
      resourceKey: entry.sourceKey, resourceLabel: entry.label, reason: firstReason,
      actionLabel: '处理这个页面', href: entry.editorHref,
    }];
    if (entry.editorialState === 'ready_for_review') return [{
      id: `seo:${entry.pageKey}:review`, authority: 'seo' as const, severity: 'decision' as const,
      title: `${entry.label} · 等待 SEO 人工审核`, detail: `${reason}。需要人工确认后才能继续。`, count: 1,
      resourceKey: entry.sourceKey, resourceLabel: entry.label, reason: firstReason,
      actionLabel: '审核这个页面', href: entry.editorHref,
    }];
    return [{
      id: `seo:${entry.pageKey}:attention`, authority: 'seo' as const, severity: 'attention' as const,
      title: `${entry.label} · SEO 需要完善`, detail: `${reason}。当前不一定阻断发布，但仍需要处理。`, count: 1,
      resourceKey: entry.sourceKey, resourceLabel: entry.label, reason: firstReason,
      actionLabel: '完善这个页面', href: entry.editorHref,
    }];
  });
}

export function buildContentWorkItems(species: AdminSpeciesRecord[], care: AdminCareArticleRecord[]): OperationsWorkItem[] {
  const speciesItems = species.filter(item => item.status === 'draft').map(item => ({
    id: `product:${item.id}:draft`, authority: 'product_care' as const, severity: 'attention' as const,
    title: `${item.name} · Product Data Draft`, detail: `${item.catalogKey} · Draft v${item.version} 尚未成为 Published Product snapshot。`, count: 1,
    resourceKey: item.catalogKey, resourceLabel: item.name, reason: 'Product Data Draft 尚未发布',
    actionLabel: '继续这个 Draft', href: `/admin/product-content?type=species&id=${encodeURIComponent(item.id)}`,
  }));
  const careItems = care.filter(item => item.status === 'draft').map(item => ({
    id: `care:${item.id}:draft`, authority: 'product_care' as const, severity: 'attention' as const,
    title: `${item.title} · Care Draft`, detail: `${item.catalogKey} · Draft v${item.version} 仍与最后 Published snapshot 隔离。`, count: 1,
    resourceKey: item.catalogKey, resourceLabel: item.title, reason: 'Care Draft 尚未发布',
    actionLabel: '继续这个 Draft', href: `/admin/product-content?type=care&id=${encodeURIComponent(item.id)}`,
  }));
  return [...speciesItems, ...careItems];
}

const compatibilityStatus = (status: string) => status === 'pending_review'
  ? { severity: 'decision' as const, label: '等待人工审核', action: '审核这个 revision' }
  : status === 'approved'
    ? { severity: 'attention' as const, label: '已批准，待发布资格检查', action: '检查发布资格' }
    : { severity: 'attention' as const, label: 'Draft 编辑中', action: '继续这个 Draft' };

export function buildCompatibilityWorkItems(profiles: AdminCompatibilityProfileRevision[], pairs: AdminCompatibilityPairRuleRevision[]): OperationsWorkItem[] {
  const profileItems = profiles.filter(item => ['draft', 'pending_review', 'approved'].includes(item.status)).map(item => {
    const state = compatibilityStatus(item.status);
    return {
      id: `compatibility:profile:${item.id}`, authority: 'compatibility' as const, severity: state.severity,
      title: `${item.species.name} · Compatibility Profile ${state.label}`, detail: `revision #${item.revisionNumber} · ${item.species.catalogKey}。${item.status === 'approved' ? '仍需通过 Regression / Evidence / runtime baseline gate。' : '当前 reviewed runtime 尚未被这条 revision 改写。'}`, count: 1,
      resourceKey: item.species.catalogKey, resourceLabel: item.species.name, reason: state.label,
      actionLabel: state.action, href: `/admin/compatibility?kind=profile&revision=${encodeURIComponent(item.id)}`,
    };
  });
  const pairItems = pairs.filter(item => ['draft', 'pending_review', 'approved'].includes(item.status)).map(item => {
    const state = compatibilityStatus(item.status);
    const label = `${item.speciesA.name} × ${item.speciesB.name}`;
    return {
      id: `compatibility:pair:${item.id}`, authority: 'compatibility' as const, severity: state.severity,
      title: `${label} · Pair Rule ${state.label}`, detail: `revision #${item.revisionNumber} · ${item.riskType}。${item.status === 'approved' ? '仍需通过 Regression / Evidence / runtime baseline gate。' : '当前 reviewed runtime 尚未被这条 revision 改写。'}`, count: 1,
      resourceKey: `${item.speciesA.catalogKey}__${item.speciesB.catalogKey}`, resourceLabel: label, reason: state.label,
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
    const productSuccessCount = Number(speciesResult.status === 'fulfilled') + Number(careResult.status === 'fulfilled');
    const productAvailability: OperationsAvailability = productSuccessCount === 2 ? 'ready' : productSuccessCount === 1 ? 'partial' : 'unavailable';
    sources.push({ authority: 'product_care', label: 'Product / Care', availability: productAvailability, detail: productSuccessCount === 2 ? '当前 Product / Care Draft 状态可读取。' : productSuccessCount === 1 ? 'Product / Care 只有部分当前状态可读取；未读取部分不会显示假 0。' : 'Product / Care 当前状态暂不可读取。' });
    const compatibilitySuccessCount = Number(profilesResult.status === 'fulfilled') + Number(pairsResult.status === 'fulfilled');
    const compatibilityAvailability: OperationsAvailability = compatibilitySuccessCount === 2 ? 'ready' : compatibilitySuccessCount === 1 ? 'partial' : 'unavailable';
    sources.push({ authority: 'compatibility', label: 'Compatibility', availability: compatibilityAvailability, detail: compatibilitySuccessCount === 2 ? 'Profile / Pair Rule revision 当前状态可读取。' : compatibilitySuccessCount === 1 ? 'Compatibility 只有部分 revision 当前状态可读取；未读取部分不会显示假 0。' : 'Compatibility revision 当前状态暂不可读取。' });

    return { workItems: sortOperationsWorkItems(workItems), sources, recentEvents: releaseResult.status === 'fulfilled' ? releaseResult.value.events.slice(0, 6) : [] };
  },
};
