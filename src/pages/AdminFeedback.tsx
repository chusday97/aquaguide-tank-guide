import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Inbox, Loader2, RefreshCcw, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/common/ToastProvider';
import {
  feedbackAdminService,
  getAdminFeedbackErrorState,
  type AdminFeedbackRecord,
  type AdminFeedbackStatus,
} from '../services/admin/feedback-admin.service';

type FilterStatus = 'all' | AdminFeedbackStatus;
type LoadState = 'idle' | 'loading' | 'loaded' | 'auth_required' | 'forbidden' | 'request_failed';

const statusLabels: Record<AdminFeedbackStatus, string> = {
  new: '待处理',
  reviewed: '已查看',
  closed: '已关闭',
};

const categoryLabels: Record<AdminFeedbackRecord['category'], string> = {
  suggestion: '建议',
  problem: '问题',
  content: '内容纠错',
  other: '其他',
};

const deliveryLabels: Record<NonNullable<AdminFeedbackRecord['emailDeliveryStatus']>, string> = {
  sent: '邮件已送达',
  failed: '邮件发送失败',
  not_configured: '未配置邮件通知',
};

const statusClassName: Record<AdminFeedbackStatus, string> = {
  new: 'bg-amber-50 text-amber-800',
  reviewed: 'bg-sky-50 text-sky-800',
  closed: 'bg-emerald-50 text-emerald-800',
};

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(date);
};

export default function AdminFeedback() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [items, setItems] = useState<AdminFeedbackRecord[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async (append = false) => {
    if (append && !nextCursor) return;
    if (append) setIsLoadingMore(true);
    else setLoadState('loading');
    try {
      const page = await feedbackAdminService.list({
        status: filter === 'all' ? undefined : filter,
        cursor: append ? nextCursor : undefined,
        limit: 30,
      });
      setItems(current => append ? [...current, ...page.items] : page.items);
      setNextCursor(page.nextCursor);
      setLoadState('loaded');
    } catch (error) {
      const state = getAdminFeedbackErrorState(error);
      setLoadState(state);
      if (append) showToast('更多反馈没有加载成功，请重试。', 'error');
    } finally {
      setIsLoadingMore(false);
    }
  }, [filter, nextCursor, showToast]);

  useEffect(() => {
    setItems([]);
    setNextCursor(undefined);
    void load(false);
    // nextCursor deliberately resets when filter changes; loading is driven by filter only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const counts = useMemo(() => ({
    visible: items.length,
    actionable: items.filter(item => item.status !== 'closed').length,
  }), [items]);

  const updateStatus = async (record: AdminFeedbackRecord, status: AdminFeedbackStatus) => {
    setUpdatingId(record.id);
    try {
      const updated = await feedbackAdminService.updateStatus(record.id, status);
      setItems(current => current.flatMap(item => {
        if (item.id !== record.id) return [item];
        if (filter !== 'all' && filter !== status) return [];
        return [{ ...item, ...updated }];
      }));
      showToast(`反馈已更新为“${statusLabels[status]}”`, 'success');
    } catch (error) {
      const state = getAdminFeedbackErrorState(error);
      if (state === 'auth_required' || state === 'forbidden') setLoadState(state);
      showToast(state === 'forbidden' ? '当前账号没有管理员权限。' : '反馈状态没有更新成功。', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filters: Array<{ id: FilterStatus; label: string }> = [
    { id: 'all', label: '全部' },
    { id: 'new', label: '待处理' },
    { id: 'reviewed', label: '已查看' },
    { id: 'closed', label: '已关闭' },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#e8efec] p-3 text-ink md:p-6" data-admin-quality-inbox>
      <div className="mx-auto max-w-[1280px]">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/80 bg-white px-4 py-3 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="返回内容后台"
              onClick={() => navigate('/admin/content')}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border hover:bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Inbox className="h-5 w-5 text-emerald-700" />
                <h1 className="text-xl font-black">Quality Inbox</h1>
              </div>
              <p className="mt-0.5 text-xs font-bold text-ink/45">处理真实用户反馈；这里只展示服务端已保存的数据。</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load(false)}
            disabled={loadState === 'loading'}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-black text-ink/65 hover:bg-bg disabled:opacity-50"
          >
            <RefreshCcw className={`h-4 w-4 ${loadState === 'loading' ? 'animate-spin' : ''}`} />刷新
          </button>
        </header>

        <section className="mb-4 rounded-[22px] border border-white/80 bg-white p-3 shadow-sm" aria-label="反馈筛选">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {filters.map(item => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={filter === item.id}
                  onClick={() => setFilter(item.id)}
                  className={`min-h-10 rounded-full px-4 text-xs font-black transition-colors ${filter === item.id ? 'bg-emerald-800 text-white' : 'bg-bg text-ink/55 hover:text-emerald-800'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="text-[11px] font-bold text-ink/42">
              当前 {counts.visible} 条 · 未关闭 {counts.actionable} 条
            </div>
          </div>
        </section>

        {loadState === 'auth_required' ? (
          <section className="rounded-[24px] border border-amber-100 bg-white p-6 text-center shadow-sm" role="alert">
            <ShieldAlert className="mx-auto h-9 w-9 text-amber-600" />
            <h2 className="mt-3 text-lg font-black">需要管理员登录</h2>
            <p className="mx-auto mt-2 max-w-[520px] text-sm font-medium leading-6 text-ink/55">Quality Inbox 读取的是受保护的管理员接口。请先登录有管理员角色的账号。</p>
            <button type="button" onClick={() => navigate('/login')} className="mt-4 min-h-11 rounded-full bg-emerald-800 px-5 text-sm font-black text-white">去登录</button>
          </section>
        ) : loadState === 'forbidden' ? (
          <section className="rounded-[24px] border border-red-100 bg-white p-6 text-center shadow-sm" role="alert">
            <ShieldAlert className="mx-auto h-9 w-9 text-red-600" />
            <h2 className="mt-3 text-lg font-black">没有管理员权限</h2>
            <p className="mx-auto mt-2 max-w-[520px] text-sm font-medium leading-6 text-ink/55">当前账号已经登录，但没有 admin 角色。此页面不会降级为公开读取。</p>
            <button type="button" onClick={() => navigate('/aquarium')} className="mt-4 min-h-11 rounded-full border border-border px-5 text-sm font-black">返回鱼缸</button>
          </section>
        ) : loadState === 'request_failed' ? (
          <section className="rounded-[24px] border border-red-100 bg-white p-6 text-center shadow-sm" role="alert">
            <h2 className="text-lg font-black">反馈暂时无法加载</h2>
            <p className="mt-2 text-sm font-medium text-ink/55">没有使用本地假数据替代。请重试真实管理员接口。</p>
            <button type="button" onClick={() => void load(false)} className="mt-4 min-h-11 rounded-full bg-emerald-800 px-5 text-sm font-black text-white">重新加载</button>
          </section>
        ) : loadState === 'loading' ? (
          <div className="grid gap-3" aria-label="正在加载反馈">
            {[1, 2, 3].map(item => <div key={item} className="h-40 animate-pulse rounded-[22px] bg-white/75" />)}
          </div>
        ) : items.length === 0 ? (
          <section className="rounded-[24px] border border-white/80 bg-white p-8 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <h2 className="mt-3 text-lg font-black">这个筛选下没有反馈</h2>
            <p className="mt-2 text-sm font-medium text-ink/48">当前没有需要展示的真实反馈记录。</p>
          </section>
        ) : (
          <div className="grid gap-3">
            {items.map(record => (
              <article key={record.id} className="rounded-[22px] border border-white/80 bg-white p-4 shadow-sm" data-feedback-id={record.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${statusClassName[record.status]}`}>{statusLabels[record.status]}</span>
                      <span className="rounded-full bg-bg px-2.5 py-1 text-[11px] font-black text-ink/55">{categoryLabels[record.category]}</span>
                      <span className="text-[11px] font-bold text-ink/35">{formatTimestamp(record.createdAt)}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-ink/78">{record.message}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    {record.status !== 'reviewed' && (
                      <button type="button" disabled={updatingId === record.id} onClick={() => void updateStatus(record, 'reviewed')} className="min-h-10 rounded-full border border-sky-100 bg-sky-50 px-3 text-xs font-black text-sky-800 disabled:opacity-45">标记已查看</button>
                    )}
                    {record.status !== 'closed' && (
                      <button type="button" disabled={updatingId === record.id} onClick={() => void updateStatus(record, 'closed')} className="min-h-10 rounded-full bg-emerald-800 px-3 text-xs font-black text-white disabled:opacity-45">关闭</button>
                    )}
                    {record.status === 'closed' && (
                      <button type="button" disabled={updatingId === record.id} onClick={() => void updateStatus(record, 'new')} className="min-h-10 rounded-full border border-border bg-white px-3 text-xs font-black text-ink/60 disabled:opacity-45">重新打开</button>
                    )}
                  </div>
                </div>

                <dl className="mt-4 grid gap-2 border-t border-border/70 pt-3 text-[11px] font-bold text-ink/48 sm:grid-cols-2 lg:grid-cols-4">
                  <div><dt className="text-ink/30">页面</dt><dd className="mt-0.5 break-all text-ink/60">{record.pagePath}</dd></div>
                  <div><dt className="text-ink/30">设备 / 语言</dt><dd className="mt-0.5 text-ink/60">{record.deviceLayout} · {record.locale}</dd></div>
                  <div><dt className="text-ink/30">版本</dt><dd className="mt-0.5 text-ink/60">{record.appVersion}</dd></div>
                  <div><dt className="text-ink/30">通知</dt><dd className="mt-0.5 text-ink/60">{record.emailDeliveryStatus ? deliveryLabels[record.emailDeliveryStatus] : '未知'}</dd></div>
                </dl>
                {record.emailDeliveryStatus === 'failed' && record.emailDeliveryError && (
                  <p className="mt-2 rounded-[12px] bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">邮件通知失败：{record.emailDeliveryError}</p>
                )}
              </article>
            ))}
          </div>
        )}

        {loadState === 'loaded' && nextCursor && (
          <div className="mt-4 text-center">
            <button type="button" disabled={isLoadingMore} onClick={() => void load(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-5 text-sm font-black text-ink/60 shadow-sm disabled:opacity-45">
              {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" />}{isLoadingMore ? '加载中…' : '加载更多'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
