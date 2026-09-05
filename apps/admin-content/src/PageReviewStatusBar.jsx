export default function PageReviewStatusBar({
  publishStatus = 'draft',
  reviewState = 'editing',
  isUiEnglish = false,
  scope = 'page',
  dirtyHint = '',
  tone = 'default',
  busy = false,
  children,
}) {
  const step = reviewState === 'approved' ? 3 : reviewState === 'ready_for_review' ? 2 : 1;
  const scopeLabel = scope === 'base'
    ? (isUiEnglish ? 'BASE TEMPLATE REVIEW' : '基础模板审核')
    : (isUiEnglish ? 'CURRENT PAGE REVIEW' : '当前页面审核');
  const publishLabel = publishStatus === 'published'
    ? (isUiEnglish ? 'Published' : '已发布')
    : (isUiEnglish ? 'Draft' : '草稿');
  const reviewLabel = isUiEnglish
    ? ({ editing: 'Editing', ready_for_review: 'Awaiting review', approved: 'Preview approved' }[reviewState] || reviewState)
    : ({ editing: '编辑中', ready_for_review: '待审核', approved: '已批准预览' }[reviewState] || reviewState);
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

  return (
    <section
      className={`page-review-status-bar page-action-panel review-${reviewState} tone-${safeTone}`}
      data-ui-state={uiState}
      aria-busy={busy || undefined}
      aria-label={scopeLabel}
    >
      <div className="page-review-meta">
        <small>{scopeLabel}</small>
        <div className="page-review-title-row">
          <strong>{isUiEnglish ? `Review ${step}/3` : `审核进度 ${step}/3`}</strong>
          <span className={`review-health-chip tone-${safeTone}`}>{healthLabel}</span>
        </div>
        <span><i className={`editor-status-dot ${publishStatus}`}></i>{publishLabel} · {reviewLabel}</span>
      </div>
      <div className="workflow-status-block">
        <small className="workflow-section-label">{isUiEnglish ? 'Review progress' : '审核进度'}</small>
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
        <small className="workflow-section-label">{isUiEnglish ? 'Next action' : '下一步操作'}</small>
        <div className="workflow-stepper-action">
          {children}
          {dirtyHint ? <small className="page-review-dirty-hint">{dirtyHint}</small> : null}
        </div>
      </div>
    </section>
  );
}
