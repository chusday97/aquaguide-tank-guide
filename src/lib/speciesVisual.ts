import type { Fish } from '../types';

const getResponsiveSpeciesImage = (id: string, size: 256 | 768) => `/responsive/species/${id}-${size}.webp`;

const paleBodyPattern = /白金|白子|白化|雪白|白玉|白云|白裙|玻璃|透明|银|水母|海月|蛋黄水母|Platinum|Albino|White|Glass|Silver|Aurelia|Chrysaora|Cotylorhiza/i;

export const getSpeciesDisplayImage = (fish: Pick<Fish, 'id' | 'image'>) => (
  getResponsiveSpeciesImage(fish.id, 768)
);

export interface SpeciesVisualSources {
  thumbnail: string;
  detail: string;
  texture: string;
  fallback: string;
}

export const getSpeciesVisualSources = (fish: Pick<Fish, 'id' | 'image'>): SpeciesVisualSources => {
  const thumbnail = getResponsiveSpeciesImage(fish.id, 256);
  const detail = getResponsiveSpeciesImage(fish.id, 768);
  return {
    thumbnail,
    detail,
    texture: detail,
    fallback: detail,
  };
};

export const hasLowContrastSpeciesImage = (fish: Pick<Fish, 'name' | 'scientificName' | 'image'>) => (
  paleBodyPattern.test(`${fish.name} ${fish.scientificName} ${fish.image}`)
);

export const getSpeciesImageSurfaceClass = (fish: Pick<Fish, 'name' | 'scientificName' | 'image'>) => (
  hasLowContrastSpeciesImage(fish)
    ? 'bg-emerald-950/[0.05]'
    : 'bg-transparent'
);

export const getSpeciesImageClass = (fish: Pick<Fish, 'name' | 'scientificName' | 'image'>) => (
  hasLowContrastSpeciesImage(fish)
    ? 'drop-shadow-[0_12px_18px_rgba(37,79,92,0.30)] contrast-[1.12] saturate-[1.08]'
    : 'drop-shadow-[0_8px_12px_rgba(27,77,62,0.12)]'
);
