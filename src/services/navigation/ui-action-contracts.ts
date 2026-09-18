export type UiActionKind =
  | 'navigate'
  | 'open_detail'
  | 'start_task'
  | 'expand'
  | 'mutate'
  | 'confirm'
  | 'external';

export type UiReturnPolicy = 'preserve_context' | 'return_home' | 'stay';

export type UiActionContract = {
  id: string;
  kind: UiActionKind;
  destination: string;
  returnPolicy: UiReturnPolicy;
};

/**
 * The action registry is intentionally small and explicit. It is the semantic
 * source used by browser tests; page components provide the visible labels.
 */
export const uiActionContracts: UiActionContract[] = [
  { id: 'species.view-tank-risk', kind: 'expand', destination: 'species-detail.risk-summary', returnPolicy: 'stay' },
  { id: 'species.open-compatibility', kind: 'navigate', destination: '/compatibility', returnPolicy: 'preserve_context' },
  { id: 'species.view-care', kind: 'navigate', destination: '/care', returnPolicy: 'preserve_context' },
  { id: 'species.toggle-wishlist', kind: 'mutate', destination: 'wishlist', returnPolicy: 'stay' },
  { id: 'species.record-existing', kind: 'start_task', destination: '/aquarium?action=record-existing', returnPolicy: 'preserve_context' },
  { id: 'species.plan-addition', kind: 'start_task', destination: '/aquarium?action=plan-species', returnPolicy: 'preserve_context' },
  { id: 'species.open-tank-settings', kind: 'start_task', destination: '/aquarium#settings', returnPolicy: 'preserve_context' },
  { id: 'species.view-tank', kind: 'navigate', destination: '/aquarium?action=livestock', returnPolicy: 'preserve_context' },
  { id: 'compatibility.add-species', kind: 'expand', destination: 'compatibility.selection', returnPolicy: 'stay' },
  { id: 'compatibility.calculate', kind: 'expand', destination: 'compatibility.result', returnPolicy: 'stay' },
  { id: 'compatibility.plan-addition', kind: 'start_task', destination: '/aquarium?action=plan-species', returnPolicy: 'preserve_context' },
  { id: 'compatibility.record-existing', kind: 'start_task', destination: '/aquarium?action=record-existing', returnPolicy: 'preserve_context' },
  { id: 'compatibility.reselect', kind: 'expand', destination: 'compatibility.selection', returnPolicy: 'stay' },
  { id: 'compatibility.save-wishlist', kind: 'mutate', destination: 'wishlist', returnPolicy: 'stay' },
  { id: 'aquarium.open-livestock', kind: 'open_detail', destination: '/aquarium?action=livestock', returnPolicy: 'preserve_context' },
  { id: 'aquarium.open-management', kind: 'open_detail', destination: 'aquarium.management', returnPolicy: 'preserve_context' },
  { id: 'aquarium.open-history', kind: 'navigate', destination: '/aquarium?action=timeline', returnPolicy: 'preserve_context' },
  { id: 'aquarium.open-add', kind: 'start_task', destination: '/aquarium?action=add-species', returnPolicy: 'preserve_context' },
  { id: 'aquarium.open-settings', kind: 'start_task', destination: '/aquarium#settings', returnPolicy: 'preserve_context' },
];

export const uiActionContractIds = new Set(uiActionContracts.map(contract => contract.id));
