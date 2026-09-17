export interface CareVisualSources {
  thumbnail: string;
  detail: string;
  fallback: string;
}

export const getCareVisualSources = (imageUrl: string): CareVisualSources => {
  const match = imageUrl.match(/^\/assets\/qa\/(.+)\.(?:png|jpe?g|webp)(?:\?.*)?$/i);
  if (!match) return { thumbnail: imageUrl, detail: imageUrl, fallback: imageUrl };
  const detail = `/responsive/care/${match[1]}-960.webp`;
  return {
    thumbnail: `/responsive/care/${match[1]}-480.webp`,
    detail,
    fallback: detail,
  };
};
