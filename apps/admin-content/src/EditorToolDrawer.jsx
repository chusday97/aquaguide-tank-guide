import { useEffect } from 'react';
import { useAppLanguage } from './AppLanguage.jsx';

export default function EditorToolDrawer({ open, title, subtitle, onClose, children }) {
  const { appLocale } = useAppLanguage();
  const closeLabel = appLocale === 'en' ? 'Close tool panel' : '关闭工具面板';
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="editor-tool-drawer-layer" data-tool-drawer-layer>
      <button className="editor-tool-drawer-backdrop" type="button" aria-label={closeLabel} onClick={onClose} />
      <section className="editor-tool-drawer" role="dialog" aria-modal="false" aria-label={title}>
        <header className="editor-tool-drawer-header">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button className="editor-tool-drawer-close" type="button" onClick={onClose} aria-label={closeLabel}>×</button>
        </header>
        <div className="editor-tool-drawer-body">{children}</div>
      </section>
    </div>
  );
}
