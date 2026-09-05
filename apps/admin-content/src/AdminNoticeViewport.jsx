import { useEffect, useState } from 'react';

export const ADMIN_NOTICE_EVENT = 'aquaguide-admin-notice';
export const ADMIN_OPERATION_EVENT = 'aquaguide-admin-operation';

export function emitAdminNotice(detail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ADMIN_NOTICE_EVENT, { detail }));
}

const durationByStatus = {
  success: 4200,
  info: 4800,
  warning: 6500,
  error: 7200,
};

function iconFor(status) {
  if (status === 'error') return '!';
  if (status === 'warning') return '!';
  if (status === 'info') return 'i';
  return '✓';
}
export default function AdminNoticeViewport() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const addNotice = (event) => {
      const detail = event.detail || {};
      const status = detail.status || 'info';
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const notice = { id, ...detail, status };
      setNotices((current) => [...current.slice(-3), notice]);
      window.setTimeout(() => {
        setNotices((current) => current.filter((item) => item.id !== id));
      }, detail.duration || durationByStatus[status] || 5000);
    };
    window.addEventListener(ADMIN_NOTICE_EVENT, addNotice);
    window.addEventListener(ADMIN_OPERATION_EVENT, addNotice);
    return () => {
      window.removeEventListener(ADMIN_NOTICE_EVENT, addNotice);
      window.removeEventListener(ADMIN_OPERATION_EVENT, addNotice);
    };
  }, []);

  const dismiss = (id) => setNotices((current) => current.filter((item) => item.id !== id));
  return (
    <div className="operation-notice-stack" aria-live="polite" aria-atomic="false">
      {notices.map((notice) => (
        <div className={`operation-notice ${notice.status}`} role={notice.status === 'error' ? 'alert' : 'status'} key={notice.id}>
          <span>{iconFor(notice.status)}</span>
          <div>
            <strong>{notice.title || (notice.status === 'error' ? '操作失败' : notice.status === 'warning' ? '需要处理' : '操作已完成')}</strong>
            {notice.error || notice.detail ? <small>{notice.error || notice.detail}</small> : null}
          </div>
          <button type="button" className="operation-notice-close" aria-label="关闭提示" onClick={() => dismiss(notice.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
