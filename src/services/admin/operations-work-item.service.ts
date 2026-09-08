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

export function buildSeoWorkItems(snapshot: SeoPageRegistrySnapshot): OperationsWorkItem[] {
  const blocked = snapshot.entries.filter(entry => entry.health.severity === 'blocked');
  const attention = snapshot.entries.filter(entry => entry.health.severity === 'attention');
  const review = snapshot.entries.filter(entry => entry.editorialState === 'ready_for_review');
  const items: OperationsWorkItem[] = [];
  if (blocked.length) items.push({ id: 'seo:blocked', authority: 'seo', severity: 'blocker', title: `${blocked.length} 个 SEO 页面存在发布阻断`, detail: 'Meta / H1 / Canonical / Published source 等条件未满足，需要先处理阻断。', count: blocked.length, actionLabel: '查看 SEO 阻断', href: '/admin/seo-pages' });
  if (review.length) items.push({ id: 'seo:review', authority: 'seo', severity: 'decision', title: `${review.length} 个 SEO 页面等待人工审核`, detail: '内容已经进入审核阶段，需要人工确认后才能继续。', count: review.length, actionLabel: '进入 SEO 审核', href: '/admin/seo-pages' });
  if (attention.length) items.push({ id: 'seo:attention', authority: 'seo', severity: 'attention', title: `${attention.length} 个 SEO 页面需要完善`, detail: '这些页面当前不一定阻断发布，但仍有内容或双语完整度问题。', count: attention.length, actionLabel: '查看待完善页面', href: '/admin/seo-pages' });
  return items;
}

export function buildContentWorkItems(species: AdminSpeciesRecord[], care: AdminCareArticleRecord[]): OperationsWorkItem[] {
  const speciesDrafts = species.filter(item => item.status === 'draft');
  const careDrafts = care.filter(item => item.status === 'draft');
  const items: OperationsWorkItem[] = [];
  if (speciesDrafts.length) items.push({ id: 'product:drafts', authority: 'product_care', severity: 'attention', title: `${speciesDrafts.length} 个 Product Data Draft 待处理`, detail: 'Draft 尚未成为 Published Product snapshot；继续编辑或完成发布判断。', count: speciesDrafts.length, actionLabel: '打开 Product Data', href: '/admin/product-content?type=species' });
  if (careDrafts.length) items.push({ id: 'care:drafts', authority: 'product_care', severity: 'attention', title: `${careDrafts.length} 个 Care Draft 待处理`, detail: 'Care Draft 仍与最后 Published snapshot 隔离，需要继续编辑或发布。', count: careDrafts.length, actionLabel: '打开 Care Knowledge', href: '/admin/product-content?type=care' });
  return items;
}

export function buildCompatibilityWorkItems(profiles: AdminCompatibilityProfileRevision[], pairs: AdminCompatibilityPairRuleRevision[]): OperationsWorkItem[] {
  const all = [...profiles.map(item => ({ status: item.status })), ...pairs.map(item => ({ status: item.status }))];
  const pending = all.filter(item => item.status === 'pending_review');
  const drafts = all.filter(item => item.status === 'draft');
  const approved = all.filter(item => item.status === 'approved');
  const items: OperationsWorkItem[] = [];
  if (pending.length) items.push({ id: 'compatibility:review', authority: 'compatibility', severity: 'decision', title: `${pending.length} 个 Compatibility revision 等待审核`, detail: '这些 revision 需要人工批准或驳回；审核不会自动修改 runtime。', count: pending.length, actionLabel: '进入 Compatibility 审核', href: '/admin/compatibility' });
  if (drafts.length) items.push({ id: 'compatibility:drafts', authority: 'compatibility', severity: 'attention', title: `${drafts.length} 个 Compatibility Draft 编辑中`, detail: 'Profile / Pair Rule Draft 尚未提交审核。', count: drafts.length, actionLabel: '继续 Compatibility Draft', href: '/admin/compatibility' });
  if (approved.length) items.push({ id: 'compatibility:approved', authority: 'compatibility', severity: 'attention', title: `${approved.length} 个 Compatibility revision 已批准，需要检查发布资格`, detail: '是否允许 reviewed publish 仍取决于 Regression、Evidence 与 runtime baseline gate。', count: approved.length, actionLabel: '检查发布资格', href: '/admin/compatibility' });
  return items;
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
