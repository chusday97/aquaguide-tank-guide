import type { Fish } from '../types';
import { fishData as seedFishData } from './fishData';
import { careTopicsData as seedCareTopicsData, type CareTopic } from './careTopicsData';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const runtimeCanonicalFishData: Fish[] = seedFishData.map(clone);
export const runtimeCanonicalCareTopicsData: CareTopic[] = seedCareTopicsData.map(clone);

export const replaceCanonicalRuntimeContent = (species: Fish[], care: CareTopic[]) => {
  runtimeCanonicalFishData.splice(0, runtimeCanonicalFishData.length, ...species.map(clone));
  runtimeCanonicalCareTopicsData.splice(0, runtimeCanonicalCareTopicsData.length, ...care.map(clone));
};

export const getCanonicalRuntimeFish = (fishOrId: Fish | string) => {
  const id = typeof fishOrId === 'string' ? fishOrId : fishOrId.id;
  return runtimeCanonicalFishData.find(item => item.id === id)
    || (typeof fishOrId === 'string' ? undefined : fishOrId);
};

export const getCanonicalRuntimeCareTopic = (topicOrId: CareTopic | string) => {
  const id = typeof topicOrId === 'string' ? topicOrId : topicOrId.id;
  return runtimeCanonicalCareTopicsData.find(item => item.id === id)
    || (typeof topicOrId === 'string' ? undefined : topicOrId);
};
