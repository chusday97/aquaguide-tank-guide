import type { Aquarium } from '../../types';
import type { LocalAppState } from '../storage/local-app-state';

export type CareCanonicalAquariumApplyResult =
  | {
      mirrorPersisted: true;
      currentAquariumId: string;
      mirrorState: LocalAppState;
    }
  | {
      mirrorPersisted: false;
      currentAquariumId: string;
      errorMessage: string;
    };

type ApplyCareCanonicalAquariumsInput = {
  aquariums: Aquarium[];
  currentAquariumId: string;
  showCanonicalAquariums: (aquariums: Aquarium[]) => void;
  persistMirror: (patch: Pick<LocalAppState, 'aquariums' | 'currentAquariumId'>) => LocalAppState;
};

/**
 * Makes a successful canonical read visible before attempting compatibility-
 * mirror persistence. A localStorage failure must never reclassify a confirmed
 * relocation/canonical read as failed.
 */
export const applyCareCanonicalAquariums = ({
  aquariums,
  currentAquariumId,
  showCanonicalAquariums,
  persistMirror,
}: ApplyCareCanonicalAquariumsInput): CareCanonicalAquariumApplyResult => {
  const resolvedCurrentAquariumId = aquariums.some(item => item.id === currentAquariumId)
    ? currentAquariumId
    : aquariums[0]?.id || '';

  // Canonical truth reaches the current Care surface first. If mirror storage
  // fails below, the caller must keep this direct override rather than falling
  // back to an older local snapshot.
  showCanonicalAquariums(aquariums);

  try {
    const mirrorState = persistMirror({
      aquariums,
      currentAquariumId: resolvedCurrentAquariumId,
    });
    return {
      mirrorPersisted: true,
      currentAquariumId: resolvedCurrentAquariumId,
      mirrorState,
    };
  } catch (error) {
    return {
      mirrorPersisted: false,
      currentAquariumId: resolvedCurrentAquariumId,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
};
