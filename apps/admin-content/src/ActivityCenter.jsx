import { useEffect, useMemo, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { useAppLanguage } from './AppLanguage.jsx';
import { emitAdminNotice } from './AdminNoticeViewport.jsx';

const KIND_LABELS = {
  content_saved: ['内容已保存', 'Content saved'],
  review_submitted: ['已提交审核', 'Submitted for review'],
  review_approved: ['已批准预览', 'Preview approved'],
  review_returned: ['已退回编辑', 'Returned to editing'],
  duplicate_review: ['重复数据复核', 'Duplicate review'],
  data_review: ['数据复核', 'Data review'],
  batch_drafts_created: ['批量建立草稿', 'Batch Draft creation'],
  bulk_import: ['批量导入', 'Bulk import'],
  editorial_review_bulk: ['批量内容审核', 'Bulk content review'],
  revision_restored: ['恢复历史版本', 'Revision restored'],
  staging_publish: ['发布到预发布环境', 'Staging publish'],
};

function formatTime(value, locale) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en' : 'zh-CN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).format(new Date(value));
  } catch {
    return '—';
  }
}

export default function ActivityCenter({ open, onClose, refreshKey = 0, onLoaded, readOnly = false }) {
  const { appLocale } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    if (readOnly) {
      setRows([]);
      setLoading(false);
      return () => { cancelled = true; };
    }
    setLoading(true);
    adminContentClient
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data, error: queryError }) => {
        if (cancelled) return;
        setLoading(false);
        if (queryError) {
          setRows([]);
          emitAdminNotice({ status: 'error', title: isUiEnglish ? 'Activity failed to load' : '操作记录读取失败', detail: queryError.message || (isUiEnglish ? 'Please retry.' : '请稍后重试。') });
          return;
        }
        setRows(data || []);
        onLoaded?.(data || []);
      });
    return () => { cancelled = true; };
  }, [open, refreshKey, onLoaded, readOnly]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return rows.filter((row) => new Date(row.created_at).toDateString() === today).length;
  }, [rows]);

  if (!open) return null;
  return (
    <div className="activity-center-layer">
      <button type="button" className="activity-center-backdrop" aria-label={isUiEnglish ? 'Close activity center' : '关闭操作中心'} onClick={onClose} />
      <aside className="activity-center" aria-label={isUiEnglish ? 'Activity center' : '操作中心'}>
        <header className="activity-center-header">
          <div>
            <p className="eyebrow">ADMIN ACTIVITY</p>
            <h2>{isUiEnglish ? 'Activity center' : '操作中心'}</h2>
            <span>{isUiEnglish ? `${todayCount} operations today` : `今天 ${todayCount} 次操作`}</span>
          </div>
          <button type="button" className="activity-center-close" onClick={onClose}>×</button>
        </header>
        <div className="activity-center-body">
          {readOnly ? <p className="activity-empty">{isUiEnglish ? 'Read-only UI demo does not load private operation history.' : '只读界面演示不读取私有操作记录；登录真实后台后，这里会显示保存、审核、重复处理、批量导入和预发布记录。'}</p> : null}
          {!readOnly && loading ? <p className="activity-empty">{isUiEnglish ? 'Loading activity…' : '正在读取操作记录…'}</p> : null}
          {!readOnly && !loading && rows.length === 0 ? <p className="activity-empty">{isUiEnglish ? 'No operations recorded yet.' : '还没有操作记录。完成一次保存、审核或数据处理后会显示在这里。'}</p> : null}
          {rows.map((row) => {
            const labels = KIND_LABELS[row.kind] || [row.title || '后台操作', row.title || 'Admin action'];
            return (
              <article className="activity-item" key={row.id}>
                <span className={`activity-status ${row.status || 'success'}`}>{row.status === 'error' ? '!' : '✓'}</span>
                <div>
                  <div className="activity-item-title"><strong>{isUiEnglish ? labels[1] : labels[0]}</strong><time>{formatTime(row.created_at, appLocale)}</time></div>
                  <p>{row.detail || row.resource_key || (isUiEnglish ? 'Completed successfully.' : '操作已完成。')}</p>
                  <small>
                    {row.metadata?.batch_id ? `${row.metadata.batch_id}${row.metadata.filename ? ` · ${row.metadata.filename}` : ''}` : ''}
                    {row.metadata?.batch_id && (row.affected_count > 1 || row.locale) ? ' · ' : ''}
                    {row.affected_count > 1 ? (isUiEnglish ? `${row.affected_count} records` : `${row.affected_count} 条记录`) : row.locale || ''}
                  </small>
                </div>
              </article>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
