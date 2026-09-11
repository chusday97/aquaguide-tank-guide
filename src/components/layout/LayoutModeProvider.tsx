import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import {
  getLayoutModeForViewportWidth,
  getPhoneViewportSnapshot,
  subscribeToPhoneViewport,
} from '@/lib/layout-mode';

export type LayoutMode = 'phone' | 'desktop';

/** Product layout is viewport-based, never inferred from device identity. */
export const detectLayoutMode = (viewportWidth?: number): LayoutMode => {
  const width = viewportWidth ?? (
    typeof window !== 'undefined' ? window.innerWidth : Number.POSITIVE_INFINITY
  );
  return getLayoutModeForViewportWidth(width);
};

type LayoutModeContextValue = {
  layoutMode: LayoutMode;
  isPhoneLayout: boolean;
};

const LayoutModeContext = createContext<LayoutModeContextValue | null>(null);

export function LayoutModeProvider({ children }: { children: ReactNode }) {
  const isPhoneLayout = useSyncExternalStore(
    subscribeToPhoneViewport,
    getPhoneViewportSnapshot,
    () => false,
  );
  const layoutMode: LayoutMode = isPhoneLayout ? 'phone' : 'desktop';
  const value = useMemo(() => ({
    layoutMode,
    isPhoneLayout,
  }), [isPhoneLayout, layoutMode]);

  return <LayoutModeContext.Provider value={value}>{children}</LayoutModeContext.Provider>;
}

export const useLayoutMode = () => {
  const context = useContext(LayoutModeContext);
  if (!context) throw new Error('useLayoutMode must be used inside LayoutModeProvider');
  return context;
};
