export type VisualResultStatus =
  | 'compatible'
  | 'caution'
  | 'not_recommended'
  | 'insufficient_data'
  | 'routine'
  | 'watch'
  | 'urgent';

export interface VisualResultSubject {
  id: string;
  name: string;
  image?: string;
  role: 'focus' | 'related' | 'affected';
  status: VisualResultStatus;
  shortReason: string;
  badgeLabel?: string;
  emphasis?: string[];
}

export interface VisualResultViewModel {
  status: VisualResultStatus;
  presentationMode?: 'verdict' | 'confirmed_facts' | 'unavailable';
  statusLabel?: string;
  coverageLabel?: string | null;
  title: string;
  conclusion: string;
  emphasis: string[];
  subjects: VisualResultSubject[];
  currentAction: string;
  actionItems?: string[];
  avoidActions?: string[];
  primaryAction: {
    label: string;
    actionType: 'route' | 'mutation' | 'dialog' | 'section';
  };
  detailSections: Array<{
    id: string;
    title: string;
    items: string[];
  }>;
}
