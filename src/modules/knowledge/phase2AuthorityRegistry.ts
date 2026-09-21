import { phase2Batch01Authority } from './phase2Batch01Authority';
import { phase2Batch02Authority } from './phase2Batch02Authority';
import { phase2Batch03Authority } from './phase2Batch03Authority';
import { phase2Batch04Authority } from './phase2Batch04Authority';
import { phase2Batch05Authority } from './phase2Batch05Authority';
import { phase2Batch06Authority } from './phase2Batch06Authority';
import { phase2Batch07Authority } from './phase2Batch07Authority';
import { phase2Batch08Authority } from './phase2Batch08Authority';
import { phase2Batch09Authority } from './phase2Batch09Authority';
import { phase2Batch10Authority } from './phase2Batch10Authority';
import { phase2Batch11Authority } from './phase2Batch11Authority';
import { phase2Batch12Authority } from './phase2Batch12Authority';
import { phase2Batch13Authority } from './phase2Batch13Authority';
import { phase2Batch14Authority } from './phase2Batch14Authority';
import { phase2Batch15Authority } from './phase2Batch15Authority';
import { phase2Batch16Authority } from './phase2Batch16Authority';
import { phase2Batch17Authority } from './phase2Batch17Authority';
import { phase2Batch18Authority } from './phase2Batch18Authority';
import { phase2Batch19Authority } from './phase2Batch19Authority';
import { phase2Batch20Authority } from './phase2Batch20Authority';
import { phase2Batch21Authority } from './phase2Batch21Authority';
import { phase2Batch22Authority } from './phase2Batch22Authority';
import { phase2Batch23Authority } from './phase2Batch23Authority';
import { phase2Batch24Authority } from './phase2Batch24Authority';
import { phase2Batch25Authority } from './phase2Batch25Authority';
import { phase2Batch26Authority } from './phase2Batch26Authority';
import { phase2Batch27Authority } from './phase2Batch27Authority';
import { phase2Batch28Authority } from './phase2Batch28Authority';
import { phase2Batch29Authority } from './phase2Batch29Authority';
import { phase2Batch30Authority } from './phase2Batch30Authority';
import { phase2Batch31Authority } from './phase2Batch31Authority';
import { phase2Batch32Authority } from './phase2Batch32Authority';
import { phase2Batch33Authority } from './phase2Batch33Authority';
import { phase2Batch34Authority } from './phase2Batch34Authority';
import { phase2Batch35Authority } from './phase2Batch35Authority';
import { phase2Batch36Authority } from './phase2Batch36Authority';
import { phase2Batch37Authority } from './phase2Batch37Authority';
import { phase2Batch38Authority } from './phase2Batch38Authority';
import { phase2Batch39Authority } from './phase2Batch39Authority';
import { phase2Batch40Authority } from './phase2Batch40Authority';
import { phase2Batch41Authority } from './phase2Batch41Authority';
import { phase2Batch42Authority } from './phase2Batch42Authority';
import { phase2Batch43Authority } from './phase2Batch43Authority';
import { phase2Batch44Authority } from './phase2Batch44Authority';
import { phase2Batch45Authority } from './phase2Batch45Authority';
import { phase2Batch46Authority } from './phase2Batch46Authority';
import { phase2Batch47Authority } from './phase2Batch47Authority';
import { phase2Batch48Authority } from './phase2Batch48Authority';
import { phase2Batch49Authority } from './phase2Batch49Authority';

export type Phase2AuthorityField = {
  status: 'reviewed_supported' | 'reviewed_unknown';
  citationIds: string[];
  factEvidence: string;
};

export type Phase2AuthorityRecord = Partial<Record<'feeding' | 'environment' | 'care', Phase2AuthorityField>>;

const phase2AuthorityBatches: Record<string, Phase2AuthorityRecord>[] = [
  phase2Batch01Authority, phase2Batch02Authority, phase2Batch03Authority, phase2Batch04Authority,
  phase2Batch05Authority, phase2Batch06Authority, phase2Batch07Authority, phase2Batch08Authority,
  phase2Batch09Authority, phase2Batch10Authority, phase2Batch11Authority, phase2Batch12Authority,
  phase2Batch13Authority, phase2Batch14Authority, phase2Batch15Authority, phase2Batch16Authority,
  phase2Batch17Authority, phase2Batch18Authority, phase2Batch19Authority, phase2Batch20Authority,
  phase2Batch21Authority, phase2Batch22Authority, phase2Batch23Authority, phase2Batch24Authority,
  phase2Batch25Authority, phase2Batch26Authority, phase2Batch27Authority, phase2Batch28Authority,
  phase2Batch29Authority, phase2Batch30Authority, phase2Batch31Authority, phase2Batch32Authority,
  phase2Batch33Authority, phase2Batch34Authority, phase2Batch35Authority, phase2Batch36Authority,
  phase2Batch37Authority, phase2Batch38Authority, phase2Batch39Authority, phase2Batch40Authority,
  phase2Batch41Authority, phase2Batch42Authority, phase2Batch43Authority, phase2Batch44Authority,
  phase2Batch45Authority, phase2Batch46Authority, phase2Batch47Authority, phase2Batch48Authority,
  phase2Batch49Authority,
];

export const phase2AuthorityBatchCount = phase2AuthorityBatches.length;

export const phase2AuthorityBySpeciesId = phase2AuthorityBatches.reduce<Record<string, Phase2AuthorityRecord>>((records, batch) => {
  for (const [speciesId, authority] of Object.entries(batch)) {
    records[speciesId] = { ...records[speciesId], ...authority };
  }
  return records;
}, {});

export const getPhase2Authority = (speciesId: string) => phase2AuthorityBySpeciesId[speciesId];
