import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import {
  CARE_ACTIVITY_CHANGED_EVENT,
  CARE_COMPLETED_OPERATIONS_STORAGE_KEY,
  CARE_REMINDERS_STORAGE_KEY,
  CARE_SAVED_CHECKLISTS_STORAGE_KEY,
} from '../care/care-activity.service';
import {
  CARE_FAVORITES_STORAGE_KEY,
  FAVORITES_CHANGED_EVENT,
} from '../favorites/favorites.service';
import { APP_STATE_CHANGED_EVENT, clearLocalAppState } from '../storage/local-app-state';

export type MagicLinkResult =
  | { ok: true; email: string; redirectTo: string; reason?: never; message?: never }
  | { ok: false; reason: 'missing_config' | 'invalid_email' | 'rate_limited' | 'network' | 'unknown'; message: string; email?: never; redirectTo?: never };

export type SignOutResult =
  | { ok: true; reason?: never; message?: never }
  | { ok: false; reason: 'missing_config' | 'network' | 'unknown'; message: string };

export const normalizeAuthEmail = (value: string) => value.trim().toLowerCase();

const isEmailLike = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isNetworkError = (message: string) => /fetch|network|failed to fetch|load failed|timeout|abort/i.test(message);
const isRateLimitError = (message: string) => /rate|limit|too many|seconds|email rate/i.test(message);

const emitClearedUserData = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(APP_STATE_CHANGED_EVENT));
  window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
  window.dispatchEvent(new Event(CARE_ACTIVITY_CHANGED_EVENT));
};

export const clearSignedInUserLocalData = () => {
  clearLocalAppState();
  if (typeof window !== 'undefined') {
    [
      CARE_FAVORITES_STORAGE_KEY,
      CARE_REMINDERS_STORAGE_KEY,
      CARE_COMPLETED_OPERATIONS_STORAGE_KEY,
      CARE_SAVED_CHECKLISTS_STORAGE_KEY,
    ].forEach(key => window.localStorage.removeItem(key));
  }
  emitClearedUserData();
};

export const authService = {
  isConfigured: () => isSupabaseConfigured && Boolean(supabase),

  getSession: async (): Promise<Session | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error('暂时无法读取登录状态。');
    return data.session;
  },

  sendMagicLink: async (rawEmail: string): Promise<MagicLinkResult> => {
    if (!isSupabaseConfigured || !supabase) {
      return { ok: false, reason: 'missing_config', message: '登录服务尚未配置。' };
    }
    const email = normalizeAuthEmail(rawEmail);
    if (!isEmailLike(email)) {
      return { ok: false, reason: 'invalid_email', message: '请输入有效的邮箱地址。' };
    }

    const redirectTo = `${window.location.origin}/login?callback=1`;
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });
      if (error) {
        const message = error.message || 'Magic link request failed';
        if (isRateLimitError(message)) return { ok: false, reason: 'rate_limited', message: '发送过于频繁，请稍后再试。' };
        if (isNetworkError(message)) return { ok: false, reason: 'network', message: '网络连接失败，请稍后重试。' };
        return { ok: false, reason: 'unknown', message: '登录链接没有发送成功，请稍后重试。' };
      }
      return { ok: true, email, redirectTo };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      return {
        ok: false,
        reason: isNetworkError(message) ? 'network' : 'unknown',
        message: isNetworkError(message) ? '网络连接失败，请稍后重试。' : '登录链接没有发送成功，请稍后重试。',
      };
    }
  },

  signOut: async (): Promise<SignOutResult> => {
    if (!isSupabaseConfigured || !supabase) {
      return { ok: false, reason: 'missing_config', message: '登录服务尚未配置。' };
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        const message = error.message || 'Sign out failed';
        return {
          ok: false,
          reason: isNetworkError(message) ? 'network' : 'unknown',
          message: isNetworkError(message) ? '网络连接失败，当前账号尚未退出。' : '退出登录没有完成，请稍后重试。',
        };
      }
      clearSignedInUserLocalData();
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      return {
        ok: false,
        reason: isNetworkError(message) ? 'network' : 'unknown',
        message: isNetworkError(message) ? '网络连接失败，当前账号尚未退出。' : '退出登录没有完成，请稍后重试。',
      };
    }
  },
};
