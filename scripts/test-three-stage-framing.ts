import { getAquariumCameraFrame } from '../src/components/ThreeAquarium';

const contain = getAquariumCameraFrame({ length: 9, width: 4.5, height: 5, aspect: 16 / 9, framing: 'contain' });
const cover = getAquariumCameraFrame({ length: 9, width: 4.5, height: 5, aspect: 16 / 9, framing: 'stage-cover' });

if (!(cover.z < contain.z)) {
  throw new Error('stage-cover must move the camera closer than contain framing.');
}

console.log('three stage framing: PASS');
