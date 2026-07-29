import { useEffect, useRef, useState } from 'react';
import { Check, Languages, Link2, MessageSquareText, RotateCcw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { setLocale, type SupportedLocale } from '../i18n';
import { useWorkspaceNavigation } from '../components/layout/WorkspaceNavigationProvider';
import { restartOnboarding } from '../services/onboarding/onboarding.service';
import { submitFeedback } from '../services/feedback/feedback.service';
import { useLayoutMode } from '../components/layout/LayoutModeProvider';
import {
  listAquariumShareReports,
  revokeAquariumShareReport,
  type AquariumShareReportListItem,
} from '../services/share/aquarium-share-report.service';
import { AquaGuideApiError } from '../services/api/api-client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const localeOptions: Array<{ locale: SupportedLocale; label: string }> = [
  { locale: 'zh-CN', label: '简体中文' },
  { locale: 'en', label: 'English' },
];

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const currentLocale: SupportedLocale = i18n.language === 'zh-CN' ? 'zh-CN' : 'en';
  const isEn = currentLocale === 'en';
  const { navigateToRoute, registerNavigationGuard } = useWorkspaceNavigation();
  const { isPhoneLayout } = useLayoutMode();
  const [feedbackCategory, setFeedbackCategory] = useState<'suggestion' | 'problem' | 'content' | 'other'>('suggestion');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedbackError, setFeedbackError] = useState('');
  const feedbackInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [shareReports, setShareReports] = useState<AquariumShareReportListItem[]>([]);
  const [shareStatus, setShareStatus] = useState<'loading' | 'ready' | 'auth' | 'error'>('loading');
  const [shareError, setShareError] = useState('');
  const [revokingShareId, setRevokingShareId] = useState('');
  const [pendingRevokeShareId, setPendingRevokeShareId] = useState('');
  const hasUnsavedFeedback = feedbackMessage.trim().length > 0;

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedFeedback) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedFeedback]);

  useEffect(() => registerNavigationGuard(hasUnsavedFeedback
    ? () => window.confirm('反馈还没有提交，确定要离开吗？')
    : null), [hasUnsavedFeedback, registerNavigationGuard]);

  useEffect(() => {
    let active = true;
    void listAquariumShareReports().then(result => {
      if (!active) return;
      setShareReports(result.items);
      setShareStatus('ready');
    }).catch(error => {
      if (!active) return;
      if (error instanceof AquaGuideApiError && error.code === 'AUTH_REQUIRED') {
        setShareStatus('auth');
        return;
      }
      setShareError(isEn ? 'Shared reports are temporarily unavailable.' : (error instanceof Error ? error.message : '分享记录暂时无法加载。'));
      setShareStatus('error');
    });
    return () => { active = false; };
  }, []);

  const revokeShare = async (id: string) => {
    if (revokingShareId) return;
    setRevokingShareId(id);
    setShareError('');
    try {
      const result = await revokeAquariumShareReport(id);
      setShareReports(current => current.map(item => item.id === id ? { ...item, revokedAt: result.revokedAt } : item));
      setPendingRevokeShareId('');
    } catch (error) {
      setShareError(isEn ? 'The report link could not be revoked. Try again.' : (error instanceof Error ? error.message : '分享链接暂时无法撤销。'));
    } finally {
      setRevokingShareId('');
    }
  };

  const handleFeedbackSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = feedbackMessage.trim();
    if (message.length < 10) {
      setFeedbackStatus('error');
      setFeedbackError('请至少写 10 个字，方便我们理解问题。');
      feedbackInputRef.current?.focus();
      return;
    }
    setFeedbackStatus('submitting');
    setFeedbackError('');
    try {
      await submitFeedback({
        category: feedbackCategory,
        message,
        pagePath: window.location.pathname + window.location.search + window.location.hash,
        locale: currentLocale,
        appVersion: import.meta.env.VITE_APP_VERSION || 'local-preview',
        deviceLayout: isPhoneLayout ? 'phone' : 'desktop',
      });
      setFeedbackMessage('');
      setFeedbackStatus('success');
    } catch (error) {
      setFeedbackStatus('error');
      setFeedbackError(error instanceof Error ? error.message : '反馈暂时没有提交成功，请稍后重试。');
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-1 py-2 md:px-8 md:py-8">
      <header className="rounded-[28px] bg-gradient-to-br from-emerald-900 to-emerald-700 p-6 text-white shadow-[0_18px_44px_rgba(18,79,61,0.18)] md:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14"><Languages className="h-6 w-6" /></span>
        <h1 className="mt-5 text-2xl font-black md:text-3xl">{t('settingsPage.title')}</h1>
        <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/70">{t('settingsPage.subtitle')}</p>
      </header>

      <section className="mt-4 rounded-[28px] border border-white/70 bg-white p-5 shadow-sm md:mt-6 md:p-7" aria-labelledby="settings-language-title">
        <h2 id="settings-language-title" className="text-lg font-black text-ink">{t('common.language')}</h2>
        <p className="mt-1 text-sm font-medium leading-6 text-ink/52">{t('common.languageHint')}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={t('common.language')}>
          {localeOptions.map(option => {
            const selected = option.locale === currentLocale;
            return (
              <button
                key={option.locale}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => void setLocale(option.locale)}
                className={`flex min-h-14 items-center justify-between rounded-2xl border px-4 text-left text-sm font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${selected ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-border/70 text-ink/65 hover:border-emerald-200'}`}
              >
                {option.label}
                {selected && <Check className="h-5 w-5" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-4 rounded-[24px] border border-emerald-100 bg-emerald-50/65 p-5">
        <div className="flex items-start gap-3">
          <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black text-emerald-950">{t('settingsPage.onboardingTitle')}</h2>
            <p className="mt-1 text-xs font-semibold leading-5 text-emerald-900/60">{t('settingsPage.onboardingHint')}</p>
            <button type="button" onClick={() => { restartOnboarding(); navigateToRoute('/welcome'); }} className="mt-3 min-h-11 rounded-2xl bg-white px-4 text-sm font-black text-emerald-800 shadow-sm hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">{t('settingsPage.replayOnboarding')}</button>
          </div>
        </div>
      </section>

      <section id="shared-reports" className="mt-4 scroll-mt-6 rounded-[28px] border border-white/70 bg-white p-5 shadow-sm md:p-7" aria-labelledby="settings-share-title">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><Link2 className="h-5 w-5" /></span>
          <div>
            <h2 id="settings-share-title" className="text-lg font-black text-ink">{isEn ? 'Shared reports' : '已分享报告'}</h2>
            <p className="mt-1 text-sm font-medium leading-6 text-ink/52">{isEn ? 'Links expire after 7 days and can be revoked early. The original token is only shown when created.' : '分享链接只保留 7 天，可随时撤销。原始链接只在创建时显示。'}</p>
          </div>
        </div>
        {shareStatus === 'loading' && <p className="mt-4 text-sm font-bold text-ink/45">{isEn ? 'Loading…' : '正在加载…'}</p>}
        {shareStatus === 'auth' && <div className="mt-4 rounded-2xl bg-bg p-4"><p className="text-sm font-semibold text-ink/60">{isEn ? 'Sign in to create and revoke privacy-safe report links.' : '登录后可以生成和撤销脱敏报告链接。'}</p><button type="button" onClick={() => navigateToRoute('/login')} className="mt-3 min-h-11 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white">{isEn ? 'Sign in' : '去登录'}</button></div>}
        {shareStatus === 'ready' && shareReports.length === 0 && <p className="mt-4 rounded-2xl bg-bg p-4 text-sm font-semibold text-ink/55">{isEn ? 'No reports have been shared yet. Create one from the aquarium archive.' : '还没有分享过鱼缸报告。请从鱼缸档案生成。'}</p>}
        {shareStatus === 'ready' && shareReports.length > 0 && (
          <div className="mt-4 grid gap-3">
            {shareReports.map(report => {
              const revoked = Boolean(report.revokedAt);
              const expired = new Date(report.expiresAt).getTime() <= Date.now();
              return (
                <article key={report.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 p-4">
                  <div className="min-w-0">
                    <div className="text-sm font-black text-ink">{isEn ? 'My aquarium report' : '我的鱼缸报告'}</div>
                    <div className="mt-1 text-xs font-semibold text-ink/45">
                      {revoked ? (isEn ? 'Revoked' : '已撤销') : expired ? (isEn ? 'Expired' : '已过期') : `${isEn ? 'Valid until' : '有效至'} ${new Date(report.expiresAt).toLocaleString(isEn ? 'en' : 'zh-CN')}`}
                    </div>
                  </div>
                  {!revoked && !expired && (
                    <button type="button" disabled={revokingShareId === report.id} onClick={() => setPendingRevokeShareId(report.id)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-rose-50 px-3 text-xs font-black text-rose-700 disabled:opacity-50">
                      <Trash2 className="h-4 w-4" />{revokingShareId === report.id ? (isEn ? 'Revoking…' : '撤销中…') : (isEn ? 'Revoke link' : '撤销链接')}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
        {(shareStatus === 'error' || shareError) && <p role="alert" className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{shareError}</p>}
      </section>

      <section id="feedback" className="mt-4 scroll-mt-6 rounded-[28px] border border-white/70 bg-white p-5 shadow-sm md:p-7" aria-labelledby="settings-feedback-title">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><MessageSquareText className="h-5 w-5" /></span>
          <div>
            <h2 id="settings-feedback-title" className="text-lg font-black text-ink">意见反馈</h2>
            <p className="mt-1 text-sm font-medium leading-6 text-ink/52">告诉我们哪里难用或希望增加什么。请不要填写联系方式、鱼缸隐私或诊断原文。</p>
          </div>
        </div>
        <form className="mt-5 grid gap-4" onSubmit={handleFeedbackSubmit}>
          <fieldset disabled={feedbackStatus === 'submitting'}>
            <legend className="text-sm font-black text-ink">反馈类型</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['suggestion', '功能建议'],
                ['problem', '使用问题'],
                ['content', '内容纠错'],
                ['other', '其他'],
              ].map(([value, label]) => (
                <label key={value} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border px-3 text-center text-xs font-black ${feedbackCategory === value ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-border/70 text-ink/58'}`}>
                  <input
                    type="radio"
                    name="feedback-category"
                    value={value}
                    checked={feedbackCategory === value}
                    onChange={() => setFeedbackCategory(value as typeof feedbackCategory)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-2 text-sm font-black text-ink">
            你的意见
            <textarea
              ref={feedbackInputRef}
              value={feedbackMessage}
              onChange={event => {
                setFeedbackMessage(event.target.value);
                if (feedbackStatus !== 'idle') setFeedbackStatus('idle');
              }}
              minLength={10}
              maxLength={2000}
              rows={5}
              disabled={feedbackStatus === 'submitting'}
              placeholder="例如：点击混养结果后，我希望直接看到需要调整哪一种鱼。"
              className="min-h-[132px] w-full resize-y rounded-[20px] border border-border/70 bg-bg/35 px-4 py-3 text-sm font-semibold leading-6 text-ink outline-none placeholder:text-ink/30 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
            <span className="text-right text-[11px] font-bold text-ink/36">{feedbackMessage.length} / 2000</span>
          </label>
          {feedbackStatus === 'success' && <p role="status" className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">已收到，谢谢你的建议。</p>}
          {feedbackStatus === 'error' && <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{feedbackError}</p>}
          <button
            type="submit"
            disabled={feedbackStatus === 'submitting'}
            className="min-h-12 w-full rounded-2xl bg-emerald-700 px-5 text-sm font-black text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-45 sm:w-fit"
          >
            {feedbackStatus === 'submitting' ? '提交中…' : '提交反馈'}
          </button>
        </form>
      </section>
      <Dialog open={Boolean(pendingRevokeShareId)} onOpenChange={open => { if (!open && !revokingShareId) setPendingRevokeShareId(''); }}>
        <DialogContent showCloseButton={false} className="w-[min(92vw,460px)] max-w-[460px] rounded-[26px]">
          <DialogHeader>
            <DialogTitle>{isEn ? 'Revoke this report link?' : '撤销这条报告链接？'}</DialogTitle>
            <DialogDescription>{isEn ? 'The original link will stop working immediately and cannot be restored. Create a new report if you need to share again.' : '原链接会立即失效且无法恢复。如需再次分享，请重新生成一份报告。'}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button" autoFocus disabled={Boolean(revokingShareId)} onClick={() => setPendingRevokeShareId('')} className="min-h-11 rounded-xl border border-border px-4 text-sm font-black disabled:opacity-50">{isEn ? 'Keep link' : '暂不撤销'}</button>
            <button type="button" disabled={Boolean(revokingShareId)} onClick={() => void revokeShare(pendingRevokeShareId)} className="min-h-11 rounded-xl bg-rose-600 px-4 text-sm font-black text-white disabled:opacity-50">{revokingShareId ? (isEn ? 'Revoking…' : '正在撤销…') : (isEn ? 'Revoke permanently' : '确认撤销')}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
