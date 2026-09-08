import { createPortal } from 'react-dom';

export default function PageReviewStatusBar({
  publishStatus = 'draft',
  reviewState = 'editing',
  isUiEnglish = false,
  scope = 'page',
  dirtyHint = '',
  tone = 'default',
  busy = false,
  portalTarget = null,
  children,
}) {
  const step = reviewState === 'approved' ? 3 : reviewState === 'ready_for_review' ? 2 : 1;
  const scopeLabel = scope === 'base'
    ? (isUiEnglish ? 'BASE TEMPLATE REVIEW' : '基础模板审核')
    : (isUiEnglish ? 'CURRENT PAGE REVIEW' : '当前页面审核');
  const publishLabel = publishStatus === 'published'
    ? (isUiEnglish ? 'Published' : '已发布')
    : (isUiEnglish ? 'Draft' : '草稿');
  const steps = [
    [1, isUiEnglish ? 'Editing' : '编辑中'],
    [2, isUiEnglish ? 'Awaiting review' : '待审核'],
    [3, isUiEnglish ? 'Preview approved' : '已批准预览'],
  ];
  const safeTone = ['error', 'warning', 'success'].includes(tone) ? tone : 'default';
  const healthLabel = busy
    ? (isUiEnglish ? 'Working' : '处理中')
    : safeTone === 'error'
      ? (isUiEnglish ? 'Needs fixing' : '需修复')
      : safeTone === 'warning'
        ? (isUiEnglish ? 'Needs attention' : '待处理')
        : safeTone === 'success'
          ? (isUiEnglish ? 'Healthy' : '正常')
          : (isUiEnglish ? 'In progress' : '进行中');
  const uiState = busy ? 'loading' : safeTone;

  const content = (
    <section
      className={`page-review-status-bar page-action-panel review-${reviewState} tone-${safeTone}`}
      data-ui-state={uiState}
      aria-busy={busy || undefined}
      aria-label={scopeLabel}
    >
      <div className="page-review-meta">
        <div className="page-review-title-row">
          <strong>{scopeLabel}</strong>
          <span className={`review-health-chip tone-${safeTone}`}>{healthLabel}</span>
        </div>
        <span><i className={`editor-status-dot ${publishStatus}`}></i>{publishLabel}</span>
      </div>
      <div className="workflow-status-block" aria-label={isUiEnglish ? `Review ${step} of 3` : `审核 ${step}/3`}>
        <div className="workflow-stepper-track">
          {steps.map(([index, label], position) => (
            <span key={index} className={index === step ? 'current' : index < step ? 'done' : ''}>
              <b>{index < step ? '✓' : index}</b>{label}
              {position < steps.length - 1 ? <i>→</i> : null}
            </span>
          ))}
        </div>
      </div>
      <div className="workflow-action-block">
        <div className="workflow-stepper-action">
          {children}
          {dirtyHint ? <small className="page-review-dirty-hint">{dirtyHint}</small> : null}
        </div>
      </div>
    </section>
  );

  return portalTarget ? createPortal(content, portalTarget) : null;
}
