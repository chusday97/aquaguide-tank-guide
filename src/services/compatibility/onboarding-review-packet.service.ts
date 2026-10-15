import type { CatalogFieldReview } from '../../data/catalogFieldReviews';
import type {
  CompatibilityOnboardingCoreField,
  CompatibilitySpeciesOnboardingAssessment,
} from './species-onboarding-research.service';

export type CompatibilityOnboardingReviewField = {
  field: CompatibilityOnboardingCoreField;
  status: 'supported' | 'missing' | 'conflicted' | 'invalid_or_unverified';
  proposedValue: unknown | null;
  sourceIds: string[];
  notes: string[];
  draftReview: CatalogFieldReview | null;
};

export type CompatibilityOnboardingReviewPacket = {
  kind: 'compatibility_onboarding';
  packetId: string;
  catalogKey: string;
  scientificName: string;
  status: 'ready_for_review' | 'research_pending' | 'terminal_hold';
  gate: 'manual_review_required' | 'research_incomplete' | 'terminal_hold';
  readyFieldCount: number;
  requiredFieldCount: 8;
  unresolvedFields: CompatibilityOnboardingCoreField[];
  reasonCodes: string[];
  fields: CompatibilityOnboardingReviewField[];
  canApprove: boolean;
  writesAuthority: false;
};

export type CompatibilityOnboardingReviewWorkItem = {
  id: string;
  authority: 'compatibility';
  severity: 'blocker' | 'decision' | 'attention';
  title: string;
  detail: string;
  count: 1;
  resourceKey: string;
  resourceLabel: string;
  reason: string;
  gateLabel: string;
  nextStep: string;
  verificationNote: string;
  actionLabel: string;
  href: string;
};

export const buildCompatibilityOnboardingReviewPacket = (
  assessment: CompatibilitySpeciesOnboardingAssessment,
): CompatibilityOnboardingReviewPacket => {
  const draftByField = new Map(assessment.draftFieldReviews.map(review => [review.field, review]));
  const fields: CompatibilityOnboardingReviewField[] = assessment.fieldResolutions.map(resolution => ({
    field: resolution.field,
    status: resolution.status,
    proposedValue: resolution.proposedValue,
    sourceIds: [...resolution.sourceIds],
    notes: [...resolution.notes],
    draftReview: draftByField.get(resolution.field) || null,
  }));
  const unresolvedFields = fields.filter(field => field.status !== 'supported').map(field => field.field);
  const readyFieldCount = fields.length - unresolvedFields.length;
  const canApprove = assessment.status === 'ready_for_review'
    && fields.length === 8
    && readyFieldCount === 8
    && assessment.candidateProfile !== null;

  return {
    kind: 'compatibility_onboarding',
    packetId: assessment.packetId,
    catalogKey: assessment.catalogKey,
    scientificName: assessment.scientificName,
    status: assessment.status,
    gate: assessment.status === 'terminal_hold'
      ? 'terminal_hold'
      : canApprove ? 'manual_review_required' : 'research_incomplete',
    readyFieldCount,
    requiredFieldCount: 8,
    unresolvedFields,
    reasonCodes: [...assessment.reasonCodes],
    fields,
    canApprove,
    writesAuthority: false,
  };
};

export const buildCompatibilityOnboardingReviewWorkItem = (
  packet: CompatibilityOnboardingReviewPacket,
  resourceLabel: string,
): CompatibilityOnboardingReviewWorkItem => {
  const extractionTransportUnavailable = packet.reasonCodes.includes('provider_extraction_transport_unavailable');
  if (packet.gate === 'research_incomplete' && extractionTransportUnavailable) return {
    id: `compatibility:onboarding:${packet.packetId}`,
    authority: 'compatibility',
    severity: 'attention',
    title: `${resourceLabel} · Compatibility extraction 暂不可用`,
    detail: '已完成来源抓取/校验，但结构化 extraction 传输失败；当前空字段不能解释为公开资料不存在。',
    count: 1,
    resourceKey: packet.catalogKey,
    resourceLabel,
    reason: 'Research provider extraction transport unavailable',
    gateLabel: '等待 extraction 重试',
    nextStep: '重试已验证来源的结构化 extraction；不要重新补来源，也不要人工猜测 8 个 facts',
    verificationNote: 'Transport failure 与 evidence missing 已分离；恢复前不会写入 reviewed authority。',
    actionLabel: '重试 extraction',
    href: `/admin/compatibility?kind=onboarding&packet=${encodeURIComponent(packet.packetId)}&catalogKey=${encodeURIComponent(packet.catalogKey)}`,
  };
  if (packet.gate === 'manual_review_required') return {
    id: `compatibility:onboarding:${packet.packetId}`,
    authority: 'compatibility',
    severity: 'decision',
    title: `${resourceLabel} · 新物种 8-field Compatibility 待审核`,
    detail: `${packet.readyFieldCount}/${packet.requiredFieldCount} 个核心字段已由 research 提取并完成来源校验；当前仍是 Draft，不会写入 reviewed runtime。`,
    count: 1,
    resourceKey: packet.catalogKey,
    resourceLabel,
    reason: '8 个核心字段等待人工审核',
    gateLabel: '等待 Compatibility Onboarding 审核',
    nextStep: '逐项核对字段值、来源与证据范围；批准全部 8 项后才允许进入 runtime Compatibility',
    verificationNote: 'AI/research 只能生成 Draft；不会自动批准或写入 authority。',
    actionLabel: '审核 8 个字段',
    href: `/admin/compatibility?kind=onboarding&packet=${encodeURIComponent(packet.packetId)}&catalogKey=${encodeURIComponent(packet.catalogKey)}`,
  };
  const unresolved = packet.unresolvedFields.length > 0 ? packet.unresolvedFields.join('、') : packet.reasonCodes.join('、') || '身份或证据边界未解决';
  return {
    id: `compatibility:onboarding:${packet.packetId}`,
    authority: 'compatibility',
    severity: packet.gate === 'terminal_hold' ? 'blocker' : 'attention',
    title: `${resourceLabel} · Compatibility Onboarding 尚未可审核`,
    detail: `${packet.readyFieldCount}/${packet.requiredFieldCount} 个核心字段已就绪；未解决：${unresolved}。`,
    count: 1,
    resourceKey: packet.catalogKey,
    resourceLabel,
    reason: packet.gate === 'terminal_hold' ? '身份或公开证据阻断' : 'Research 仍不完整',
    gateLabel: packet.gate === 'terminal_hold' ? 'Onboarding 阻断' : '等待补齐 evidence',
    nextStep: packet.gate === 'terminal_hold' ? '先解决身份或公开证据冲突，不进入人工批准' : '只补缺失字段的直接来源，再重新生成审核包',
    verificationNote: '未达到 8/8 supported 前不能产生 reviewed runtime authority。',
    actionLabel: packet.gate === 'terminal_hold' ? '查看阻断原因' : '继续补证据',
    href: `/admin/compatibility?kind=onboarding&packet=${encodeURIComponent(packet.packetId)}&catalogKey=${encodeURIComponent(packet.catalogKey)}`,
  };
};
