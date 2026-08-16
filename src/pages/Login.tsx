import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { CheckCircle2, ChevronLeft, Cloud, LoaderCircle, LogOut, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { authService } from '../services/auth/auth.service';

const readRedirectError = () => {
  if (typeof window === 'undefined') return '';
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return search.get('error_description') || hash.get('error_description') || '';
};

export default function Login() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [email, setEmail] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'signing_out'>('idle');
  const [message, setMessage] = useState(() => readRedirectError());
  const callbackMode = useMemo(() => new URLSearchParams(window.location.search).get('callback') === '1', []);

  useEffect(() => {
    let active = true;
    void authService.getSession()
      .then(current => {
        if (!active) return;
        setSession(current);
        setSessionReady(true);
        if (current && callbackMode) navigate('/', { replace: true });
      })
      .catch(() => {
        if (!active) return;
        setSessionReady(true);
        setStatus('error');
        setMessage(isEn ? 'Could not read your sign-in state. Try again.' : '暂时无法读取登录状态，请稍后重试。');
      });

    if (!supabase) return () => { active = false; };
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setSessionReady(true);
      if (nextSession && callbackMode) navigate('/', { replace: true });
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [callbackMode, isEn, navigate]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setMessage('');
    const result = await authService.sendMagicLink(email);
    if (!result.ok) {
      setStatus('error');
      setMessage(isEn
        ? result.reason === 'invalid_email'
          ? 'Enter a valid email address.'
          : result.reason === 'rate_limited'
            ? 'Too many requests. Please try again later.'
            : result.reason === 'missing_config'
              ? 'Cloud sign-in is not configured for this deployment.'
              : 'The sign-in link could not be sent. Try again later.'
        : result.message);
      return;
    }
    setEmail(result.email);
    setSentEmail(result.email);
    setStatus('sent');
  };

  const signOut = async () => {
    if (status === 'signing_out') return;
    setStatus('signing_out');
    setMessage('');
    const result = await authService.signOut();
    if (!result.ok) {
      setStatus('error');
      setMessage(isEn ? 'Sign-out did not finish. Your account is still signed in.' : result.message);
      return;
    }
    window.location.replace('/login');
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#dfe8e5] px-4 py-8 text-ink">
      <main className="w-full max-w-[460px] rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_24px_70px_rgba(27,77,62,0.14)]">
        <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-800 text-white"><Cloud className="h-6 w-6" /></span>
        <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-800">{isEn ? 'ACCOUNT & SYNC' : '账户与同步'}</div>
        <h1 className="mt-3 text-[24px] font-black">{isEn ? 'AquaGuide cloud sync' : 'AquaGuide 云端同步'}</h1>

        {!sessionReady ? (
          <div role="status" className="mt-6 flex items-center gap-2 rounded-[16px] bg-slate-50 px-4 py-4 text-sm font-bold text-ink/55">
            <LoaderCircle className="h-4 w-4 animate-spin" />{isEn ? 'Checking sign-in state…' : '正在读取登录状态…'}
          </div>
        ) : session ? (
          <section className="mt-5">
            <div className="rounded-[18px] border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-sm font-black text-emerald-900"><CheckCircle2 className="h-4 w-4" />{isEn ? 'Signed in' : '已登录'}</div>
              <p className="mt-2 break-all text-sm font-semibold text-emerald-900/70">{session.user.email || (isEn ? 'Supabase account' : 'Supabase 账户')}</p>
              <p className="mt-2 text-xs font-semibold leading-5 text-emerald-900/55">{isEn ? 'Your tank and supported history can now use the cloud repository on this device.' : '当前设备已可使用云端仓库同步鱼缸和已支持的历史数据。'}</p>
            </div>
            {message && <p role="alert" className="mt-3 rounded-[14px] bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{message}</p>}
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => navigate('/aquarium', { replace: true })} className="min-h-11 rounded-full bg-emerald-800 px-4 text-sm font-black text-white">{isEn ? 'Open my tank' : '进入我的鱼缸'}</button>
              <button type="button" disabled={status === 'signing_out'} onClick={() => void signOut()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 text-sm font-black text-rose-700 disabled:opacity-50">
                {status === 'signing_out' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}{isEn ? 'Sign out' : '退出账号'}
              </button>
            </div>
            <p className="mt-3 text-[11px] font-semibold leading-5 text-ink/40">{isEn ? 'After sign-out, AquaGuide clears this account’s cloud compatibility cache from this browser. Language and layout preferences stay on this device.' : '退出成功后，AquaGuide 会清除这个账号留在当前浏览器里的云端业务镜像；语言和布局等设备偏好会保留。'}</p>
          </section>
        ) : (
          <section className="mt-5">
            <p className="text-sm font-semibold leading-6 text-ink/55">{isEn ? 'Enter your email. We will send a one-time sign-in link. If this email has no AquaGuide account yet, one will be created when you continue.' : '输入邮箱后，我们会发送一次性登录链接。若该邮箱尚无 AquaGuide 账户，继续登录时会自动创建。'}</p>
            <form className="mt-4 grid gap-3" onSubmit={submit}>
              <label className="grid gap-2 text-sm font-black text-ink">
                {isEn ? 'Email' : '邮箱'}
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                  <input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    value={email}
                    disabled={status === 'sending'}
                    onChange={event => { setEmail(event.target.value); if (status === 'error' || status === 'sent') setStatus('idle'); }}
                    placeholder="you@example.com"
                    className="min-h-12 w-full rounded-[14px] border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                  />
                </div>
              </label>
              <button type="submit" disabled={status === 'sending'} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-800 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-55">
                {status === 'sending' && <LoaderCircle className="h-4 w-4 animate-spin" />}{status === 'sending' ? (isEn ? 'Sending…' : '发送中…') : (isEn ? 'Email me a sign-in link' : '发送登录链接')}
              </button>
            </form>

            {status === 'sent' && (
              <div role="status" className="mt-4 rounded-[16px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-800">
                {isEn ? `Sign-in link sent to ${sentEmail}. Open the link in your email to continue.` : `登录链接已发送到 ${sentEmail}。请打开邮箱中的链接继续。`}
              </div>
            )}
            {status === 'error' && message && <div role="alert" className="mt-4 rounded-[16px] bg-rose-50 px-4 py-3 text-sm font-bold leading-6 text-rose-700">{message}</div>}

            <button type="button" onClick={() => navigate('/aquarium', { replace: true })} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-ink/60">
              <ChevronLeft className="h-4 w-4" />{isEn ? 'Continue on this device without sync' : '暂不登录，继续使用本机数据'}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
