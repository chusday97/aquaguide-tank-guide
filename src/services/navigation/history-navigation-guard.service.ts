type HistoryNavigationAttempt = {
  delta: number;
};

type HistoryNavigationGuard = {
  originIndex: number;
  onAttempt: (attempt: HistoryNavigationAttempt) => void;
};

let activeGuard: HistoryNavigationGuard | null = null;
let restoringHistory = false;
let allowNextHistoryNavigation = false;

const handlePopState = (event: PopStateEvent) => {
  if (allowNextHistoryNavigation) {
    allowNextHistoryNavigation = false;
    return;
  }

  if (restoringHistory) {
    event.stopImmediatePropagation();
    restoringHistory = false;
    return;
  }

  if (!activeGuard) return;
  const targetIndex = Number(event.state?.idx);
  if (!Number.isFinite(targetIndex) || targetIndex === activeGuard.originIndex) return;

  const delta = targetIndex - activeGuard.originIndex;
  event.stopImmediatePropagation();
  restoringHistory = true;
  window.history.go(-delta);
  activeGuard.onAttempt({ delta });
};

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', handlePopState);
}

export const registerHistoryNavigationGuard = (
  onAttempt: HistoryNavigationGuard['onAttempt'],
) => {
  const originIndex = Number(window.history.state?.idx);
  if (!Number.isFinite(originIndex)) return () => undefined;

  const guard = { originIndex, onAttempt };
  activeGuard = guard;
  return () => {
    if (activeGuard === guard) activeGuard = null;
  };
};

export const proceedWithHistoryNavigation = (delta: number) => {
  activeGuard = null;
  allowNextHistoryNavigation = true;
  window.history.go(delta);
};
