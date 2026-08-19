import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type LayoutMode = 'phone' | 'desktop';

type NavigatorLike = {
  userAgent?: string;
  userAgentData?: { mobile?: boolean };
};

export const PHONE_LAYOUT_MAX_WIDTH = 767;
export const PHONE_LAYOUT_MEDIA_QUERY = `(max-width: ${PHONE_LAYOUT_MAX_WIDTH}px)`;

export const detectLayoutMode = (
  navigatorLike?: NavigatorLike | null,
  viewportWidth?: number | null,
): LayoutMode => {
  if (typeof viewportWidth === 'number' && Number.isFinite(viewportWidth)) {
    return viewportWidth <= PHONE_LAYOUT_MAX_WIDTH ? 'phone' : 'desktop';
  }

  if (!navigatorLike) return 'desktop';
  const userAgent = navigatorLike.userAgent || '';
  if (/iPhone|iPod|Windows Phone|Android.+Mobile|Mobile.+Safari/i.test(userAgent)) return 'phone';
  if (/iPad|Tablet|PlayBook|Silk/i.test(userAgent)) return 'desktop';

  if (typeof navigatorLike.userAgentData?.mobile === 'boolean') {
    return navigatorLike.userAgentData.mobile ? 'phone' : 'desktop';
  }
  return 'desktop';
};

type LayoutModeContextValue = {
  layoutMode: LayoutMode;
  isPhoneLayout: boolean;
};

const LayoutModeContext = createContext<LayoutModeContextValue | null>(null);

const getCurrentLayoutMode = (): LayoutMode => {
  if (typeof window === 'undefined') {
    return typeof navigator === 'undefined' ? 'desktop' : detectLayoutMode(navigator);
  }
  return detectLayoutMode(typeof navigator === 'undefined' ? null : navigator, window.innerWidth);
};

export function LayoutModeProvider({ children }: { children: ReactNode }) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(getCurrentLayoutMode);

  useEffect(() => {
    const media = window.matchMedia(PHONE_LAYOUT_MEDIA_QUERY);
    const sync = () => setLayoutMode(media.matches ? 'phone' : 'desktop');
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const value = useMemo(() => ({
    layoutMode,
    isPhoneLayout: layoutMode === 'phone',
  }), [layoutMode]);

  return <LayoutModeContext.Provider value={value}>{children}</LayoutModeContext.Provider>;
}

export const useLayoutMode = () => {
  const context = useContext(LayoutModeContext);
  if (!context) throw new Error('useLayoutMode must be used inside LayoutModeProvider');
  return context;
};
