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
  exportRoot.style.background = '#ffffff';
  exportRoot.style.color = '#10231b';
  exportRoot.style.opacity = '1';
  exportRoot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(exportRoot);
  try {
    await waitForImages(exportRoot);
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(exportRoot, {
      backgroundColor: '#ffffff',
      scale: 1,
      useCORS: true,
      foreignObjectRendering: false,
      logging: false,
      width: 1080,
      windowWidth: 1080,
      onclone: clonedDocument => {
        const clonedRoot = clonedDocument.querySelector<HTMLElement>('[data-export-artifact]');
        if (!clonedRoot) return;
        clonedRoot.style.backgroundColor = '#ffffff';
        clonedRoot.style.color = '#10231b';
        clonedRoot.style.borderColor = '#173e33';
        clonedRoot.style.opacity = '1';
        clonedRoot.querySelectorAll<HTMLElement>('*').forEach(node => {
          node.style.color = '#10231b';
          node.style.borderColor = '#b8c7bf';
          node.style.boxShadow = 'none';
          node.style.textShadow = 'none';
          node.style.opacity = '1';
          if (node.tagName === 'SECTION') node.style.backgroundColor = '#f3f7f5';
        });
      },
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

type PrintableArtifact = {
  eyebrow: string;
  title: string;
  summary: string;
  metric?: string;
  sections: Array<{ title: string; items: string[] }>;
  disclaimer: string;
};

const wrapCanvasText = (context: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = [];
  let current = '';
  Array.from(text).forEach(character => {
    const next = current + character;
    if (current && context.measureText(next).width > maxWidth) {
      lines.push(current);
      current = character;
    } else current = next;
  });
  if (current) lines.push(current);
  return lines.length ? lines : ['—'];
};

export const downloadArtifactContentAsPng = async (content: PrintableArtifact, fileName: string, locale = 'zh-CN') => {
  await document.fonts?.ready;
  const width = 1080;
  const padding = 72;
  const maxTextWidth = width - padding * 2;
  const measureCanvas = document.createElement('canvas');
  const measureContext = measureCanvas.getContext('2d');
  if (!measureContext) throw new Error('当前浏览器无法生成图片。');
  measureContext.font = '700 28px system-ui, sans-serif';
  const summaryLines = wrapCanvasText(measureContext, content.summary, maxTextWidth - (content.metric ? 210 : 0));
  const sectionLayouts = content.sections.map(section => {
    measureContext.font = '700 25px system-ui, sans-serif';
    const lines = (section.items.length ? section.items : ['—']).flatMap(item => wrapCanvasText(measureContext, `• ${item}`, maxTextWidth - 52));
    return { ...section, lines, height: 74 + lines.length * 40 + 28 };
  });
  const height = Math.max(720, 250 + summaryLines.length * 42 + sectionLayouts.reduce((sum, section) => sum + section.height + 24, 0) + 130);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('当前浏览器无法生成图片。');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.strokeStyle = '#173e33';
  context.lineWidth = 4;
  context.strokeRect(18, 18, width - 36, height - 36);
  let y = 78;
  context.fillStyle = '#17634b';
  context.font = '800 22px system-ui, sans-serif';
  context.fillText(`AQUAGUIDE · ${content.eyebrow}`, padding, y);
  y += 62;
  context.fillStyle = '#10231b';
  context.font = '900 48px system-ui, sans-serif';
  context.fillText(content.title, padding, y, content.metric ? maxTextWidth - 220 : maxTextWidth);
  if (content.metric) {
    context.fillStyle = '#17634b';
    context.font = '900 68px system-ui, sans-serif';
    context.textAlign = 'right';
    context.fillText(content.metric, width - padding, y);
    context.textAlign = 'left';
  }
  y += 52;
  context.fillStyle = '#314a40';
  context.font = '700 28px system-ui, sans-serif';
  summaryLines.forEach(line => { context.fillText(line, padding, y); y += 42; });
  y += 18;
  context.strokeStyle = '#b8c7bf';
  context.lineWidth = 2;
  context.beginPath(); context.moveTo(padding, y); context.lineTo(width - padding, y); context.stroke();
  y += 28;
  sectionLayouts.forEach(section => {
    context.fillStyle = '#f3f7f5';
    context.strokeStyle = '#b8c7bf';
    context.lineWidth = 2;
    context.beginPath(); context.roundRect(padding, y, maxTextWidth, section.height, 22); context.fill(); context.stroke();
    context.fillStyle = '#10231b';
    context.font = '900 28px system-ui, sans-serif';
    context.fillText(section.title, padding + 28, y + 46);
    context.font = '700 25px system-ui, sans-serif';
    let lineY = y + 88;
    section.lines.forEach(line => { context.fillText(line, padding + 28, lineY); lineY += 40; });
    y += section.height + 24;
  });
  context.fillStyle = '#40564c';
  context.font = '700 19px system-ui, sans-serif';
  const footer = `${content.disclaimer} · ${new Date().toLocaleString(locale)}`;
  wrapCanvasText(context, footer, maxTextWidth).slice(0, 3).forEach(line => { context.fillText(line, padding, y); y += 30; });
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
};
