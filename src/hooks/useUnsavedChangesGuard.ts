import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type RegisterNavigationGuard = (guard: ((targetPath: string) => boolean) | null) => () => void;
type PendingIntent =
  | { kind: 'route'; path: string }
  | { kind: 'history'; delta: number }
  | { kind: 'action'; action: () => void };

export function useUnsavedChangesGuard({
  enabled,
  registerNavigationGuard,
  onBeforeConfirm,
}: {
  enabled: boolean;
  registerNavigationGuard: RegisterNavigationGuard;
  onBeforeConfirm?: () => void;
}) {
  const navigate = useNavigate();
  const [pendingIntent, setPendingIntent] = useState<PendingIntent | null>(null);
  const originIndexRef = useRef<number | null>(null);
  const restoringHistoryRef = useRef(false);
  const allowHistoryNavigationRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      originIndexRef.current = null;
      setPendingIntent(null);
      return;
    }
    const index = Number(window.history.state?.idx);
    originIndexRef.current = Number.isFinite(index) ? index : null;
  }, [enabled]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!enabled) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled]);

  useEffect(() => registerNavigationGuard(enabled
    ? (path) => {
      setPendingIntent({ kind: 'route', path });
      return false;
    }
    : null), [enabled, registerNavigationGuard]);

  useEffect(() => {
    if (!enabled) return;
    const handlePopState = (event: PopStateEvent) => {
      if (allowHistoryNavigationRef.current) {
        allowHistoryNavigationRef.current = false;
        return;
      }
      if (restoringHistoryRef.current) {
        restoringHistoryRef.current = false;
        return;
      }
      const originIndex = originIndexRef.current;
      const targetIndex = Number(event.state?.idx);
      if (originIndex === null || !Number.isFinite(targetIndex) || originIndex === targetIndex) return;
      const delta = targetIndex - originIndex;
      setPendingIntent({ kind: 'history', delta });
      restoringHistoryRef.current = true;
      window.history.go(-delta);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [enabled]);

  const requestAction = useCallback((action: () => void) => {
    if (!enabled) {
      action();
      return;
    }
    setPendingIntent({ kind: 'action', action });
  }, [enabled]);

  const cancelPending = useCallback(() => setPendingIntent(null), []);

  const confirmPending = useCallback(() => {
    const intent = pendingIntent;
    if (!intent) return;
    onBeforeConfirm?.();
    setPendingIntent(null);
    if (intent.kind === 'route') {
      navigate(intent.path);
      return;
    }
    if (intent.kind === 'history') {
      allowHistoryNavigationRef.current = true;
      window.history.go(intent.delta);
      return;
    }
    intent.action();
  }, [navigate, onBeforeConfirm, pendingIntent]);

  return {
    pending: Boolean(pendingIntent),
    requestAction,
    cancelPending,
    confirmPending,
  };
}
