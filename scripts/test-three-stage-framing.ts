import { getAquariumCameraFrame } from '../src/components/ThreeAquarium';

for (const aspect of [0.5, 0.75, 1, 16 / 9, 2.4]) {
  const contain = getAquariumCameraFrame({ length: 9, width: 4.5, height: 5, aspect, framing: 'contain' });
  const cover = getAquariumCameraFrame({ length: 9, width: 4.5, height: 5, aspect, framing: 'stage-cover' });
  if (!(cover.z < contain.z)) {
    throw new Error(`stage-cover must move the camera closer than contain framing at aspect ${aspect}.`);
  }
}

console.log('three stage framing: PASS');
