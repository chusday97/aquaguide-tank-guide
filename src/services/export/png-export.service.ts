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
  const exportRoot = element.cloneNode(true) as HTMLElement;
  exportRoot.style.position = 'fixed';
  exportRoot.style.left = '-100000px';
  exportRoot.style.top = '0';
  exportRoot.style.width = '1080px';
  exportRoot.style.maxWidth = 'none';
  exportRoot.style.boxSizing = 'border-box';
  exportRoot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(exportRoot);
  try {
    await waitForImages(exportRoot);
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(exportRoot, {
      backgroundColor: '#fffdf8',
      scale: 1,
      useCORS: true,
      foreignObjectRendering: true,
      logging: false,
      width: 1080,
      windowWidth: 1080,
    });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    exportRoot.remove();
  }
};

export const safeExportFileName = (value: string) => {
  const sanitized = value.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim();
  return sanitized || 'AquaGuide-export.png';
};
