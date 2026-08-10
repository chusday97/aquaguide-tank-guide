export type FeatureKey = 'auth' | 'achievements' | 'sharing';
export type FeatureStatus = 'live' | 'building';

type FeatureDefinition = {
  status: FeatureStatus;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
};

export const featureRegistry: Record<FeatureKey, FeatureDefinition> = {
  auth: {
    status: 'building',
    title: { zh: '云端同步', en: 'Cloud sync' },
    description: { zh: '跨设备同步鱼缸和养护记录。', en: 'Sync aquariums and care records across devices.' },
  },
  achievements: {
    status: 'building',
    title: { zh: '成就勋章', en: 'Achievements' },
    description: { zh: '记录长期养护里程碑。', en: 'Track long-term care milestones.' },
  },
  sharing: {
    status: 'building',
    title: { zh: '分享与隐私', en: 'Sharing & privacy' },
    description: { zh: '管理分享链接和隐私设置。', en: 'Manage share links and privacy settings.' },
  },
};

export const isFeatureKey = (value: string | undefined | null): value is FeatureKey => (
  value === 'auth' || value === 'achievements' || value === 'sharing'
);

export const isBuildingFeature = (feature: FeatureKey) => featureRegistry[feature].status === 'building';
