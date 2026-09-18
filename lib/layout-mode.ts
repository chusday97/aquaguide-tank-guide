export type ResponsiveLayoutMode = 'phone' | 'desktop';

export const PHONE_LAYOUT_BREAKPOINT_PX = 768;
export const PHONE_LAYOUT_QUERY = `(max-width: ${PHONE_LAYOUT_BREAKPOINT_PX - 1}px)`;

export const getLayoutModeForViewportWidth = (width: number): ResponsiveLayoutMode => (
  width < PHONE_LAYOUT_BREAKPOINT_PX ? 'phone' : 'desktop'
);

export const canUseLayoutMatchMedia = () => (
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
);

export const getPhoneViewportSnapshot = () => (
  canUseLayoutMatchMedia() ? window.matchMedia(PHONE_LAYOUT_QUERY).matches : false
);

export const subscribeToPhoneViewport = (onStoreChange: () => void) => {
  if (!canUseLayoutMatchMedia()) return () => undefined;
  const query = window.matchMedia(PHONE_LAYOUT_QUERY);
  query.addEventListener('change', onStoreChange);
  return () => query.removeEventListener('change', onStoreChange);
};
