const DEFAULT_PREVIEW_URL = 'http://127.0.0.1:4317';

export const getPreviewUrl = () => {
  const configuredUrl = process.env.AQUAGUIDE_URL
    || process.env.AQUAGUIDE_PREVIEW_URL
    || process.env.PREVIEW_URL;
  return (configuredUrl || DEFAULT_PREVIEW_URL).replace(/\/+$/, '');
};
