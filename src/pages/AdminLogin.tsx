import { FormEvent, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, LogIn, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth/auth.service';
import { apiRequest, AquaGuideApiError } from '../services/api/api-client';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const safeAdminNext = (raw: string | null) => (
  raw && raw.startsWith('/admin/') && !raw.startsWith('/admin/login') ? raw : '/admin/content'
);

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = useMemo(() => safeAdminNext(new URLSearchParams(location.search).get('next')), [location.search]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) { setError('请输入管理员邮箱和密码。'); return; }
    setLoading(true); setError('');
    try {
      const result = await authService.signInWithEmailPassword(email.trim(), password);
      if (result.ok === false) {
        setError(result.reason === 'missing_config' ? '管理员登录服务尚未绑定到当前环境。' : result.reason === 'invalid_credentials' ? '邮箱或密码不正确，或账号尚未确认。' : '登录没有完成，请稍后重试。');
        return;
      }
      await apiRequest<{ userId: string; role: 'admin' }>('/admin/session');
      navigate(nextPath, { replace: true });
    } catch (cause) {
      if (cause instanceof AquaGuideApiError && cause.code === 'FORBIDDEN') {
        await authService.signOut();
        setError('这个账号已登录，但没有 Aqua Operations Studio 管理权限。');
      } else if (cause instanceof AquaGuideApiError && cause.code === 'DEPENDENCY_UNAVAILABLE') {
        setError('登录成功，但后台权限服务暂不可用。请检查 Staging Business API 配置。');
      } else {
        setError(cause instanceof Error ? cause.message : '管理员登录没有完成。');
      }
    } finally { setLoading(false); }
  };

  return <div className="min-h-[100dvh] bg-[#edf1ef] p-4 text-ink md:p-8">
    <div className="mx-auto max-w-[520px] border border-slate-200 bg-white p-5 md:p-7">
      <button type="button" onClick={() => navigate(nextPath, { replace: true })} className="inline-flex h-10 items-center gap-2 border border-slate-200 px-3 text-xs font-black text-ink/65"><ArrowLeft className="h-4 w-4" />返回工作台</button>
      <div className="mt-6 flex h-11 w-11 items-center justify-center border border-slate-200 bg-slate-50"><ShieldCheck className="h-5 w-5" /></div>
      <div className="mt-4 text-[11px] font-black uppercase tracking-[0.1em] text-emerald-700">Aqua Operations Studio</div>
      <h1 className="mt-1 text-2xl font-black">管理员登录</h1>
      <p className="mt-2 text-sm font-semibold leading-6 text-ink/50">使用当前环境的 Supabase Auth 管理员账号。登录只验证 Business Admin 权限，不会开放普通用户云同步。</p>
      {!isSupabaseConfigured && <div role="alert" className="mt-4 border-l-4 border-slate-400 bg-slate-50 px-3 py-3 text-xs font-bold text-ink/60">当前环境尚未绑定 Staging Supabase Auth，因此管理员登录暂不可用。</div>}
      {error && <div role="alert" className="mt-4 border-l-4 border-red-500 bg-red-50 px-3 py-3 text-xs font-bold text-red-700">{error}</div>}
      <form onSubmit={submit} className="mt-5 grid gap-4">
        <label className="grid gap-1.5 text-xs font-black">管理员邮箱<input type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} disabled={!isSupabaseConfigured || loading} className="h-11 border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-slate-700 disabled:bg-slate-50" /></label>
        <label className="grid gap-1.5 text-xs font-black">密码<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} disabled={!isSupabaseConfigured || loading} className="h-11 border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-slate-700 disabled:bg-slate-50" /></label>
        <button type="submit" disabled={!isSupabaseConfigured || loading} className="mt-1 inline-flex h-11 items-center justify-center gap-2 bg-ink px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}{loading ? '正在验证权限…' : '登录并进入后台'}</button>
      </form>
      <p className="mt-4 text-[11px] font-semibold leading-5 text-ink/40">账号必须已经存在于该非 Production Supabase Auth，并且 `user_roles` 已显式授予 admin。Production 身份不会由此页面创建或提升。</p>
    </div>
  </div>;
}
