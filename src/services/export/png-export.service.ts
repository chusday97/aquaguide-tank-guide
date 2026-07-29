const waitForImages = async (root: HTMLElement) => {
  await Promise.all(Array.from(root.querySelectorAll('img')).map(image => {
    if (image.complete) return Promise.resolve();
    return new Promise<void>(resolve => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => resolve(), { once: true });
    });
  }));
  await document.fonts?.ready;
};

export const downloadElementAsPng = async (element: HTMLElement, fileName: string) => {
  await waitForImages(element);
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(element, {
    backgroundColor: '#fffdf8',
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: 1080,
  });
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const safeExportFileName = (value: string) => value.replace(/[\\/:*?"<>|]+/g, '-').trim();
