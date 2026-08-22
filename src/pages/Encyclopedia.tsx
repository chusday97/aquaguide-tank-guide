import { useEffect, useRef } from 'react';
import EncyclopediaBase from './EncyclopediaBase';

type HiddenSurface = {
  element: HTMLElement;
  display: string;
};

export default function Encyclopedia() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hiddenSurfaceRef = useRef<HiddenSurface | null>(null);

  useEffect(() => {
    const restoreBrowseSurface = () => {
      const hidden = hiddenSurfaceRef.current;
      if (!hidden) return;
      hidden.element.style.display = hidden.display;
      hidden.element.removeAttribute('data-encyclopedia-browse-surface-hidden');
      hiddenSurfaceRef.current = null;
    };

    const syncCompatibilitySurface = () => {
      const root = rootRef.current;
      if (!root) return;
      const calculator = root.querySelector<HTMLElement>('#compatibility-calculator');
      if (!calculator) {
        restoreBrowseSurface();
        return;
      }

      const browseSurface = calculator.previousElementSibling;
      if (!(browseSurface instanceof HTMLElement)) return;

      if (hiddenSurfaceRef.current?.element !== browseSurface) {
        restoreBrowseSurface();
        hiddenSurfaceRef.current = { element: browseSurface, display: browseSurface.style.display };
        browseSurface.style.display = 'none';
        browseSurface.setAttribute('data-encyclopedia-browse-surface-hidden', 'true');
      }

      // Compatibility is a top-level mode, not a deep anchor at the bottom of Atlas.
      // Once the browse surface is removed from layout, keep the calculator at the
      // beginning of the workspace instead of restoring Atlas' previous scroll depth.
      window.requestAnimationFrame(() => {
        calculator.scrollIntoView({ block: 'start', behavior: 'auto' });
      });
    };

    const root = rootRef.current;
    if (!root) return undefined;
    const observer = new MutationObserver(syncCompatibilitySurface);
    observer.observe(root, { childList: true, subtree: true });
    syncCompatibilitySurface();

    return () => {
      observer.disconnect();
      restoreBrowseSurface();
    };
  }, []);

  return (
    <div ref={rootRef} style={{ display: 'contents' }} data-encyclopedia-navigation-guard>
      <EncyclopediaBase />
    </div>
  );
}
