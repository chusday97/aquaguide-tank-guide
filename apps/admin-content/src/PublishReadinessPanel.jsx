import { useAppLanguage } from './AppLanguage.jsx';
const STATE_META = {
  blocked: { label: 'Blocked', tone: 'blocked', description: '仍有必须处理的阻塞项。' },
  ready_for_review: { label: 'Ready for Review', tone: 'review', description: '结构与内容完整，可以进入人工审核。' },
  publish_ready: { label: 'Publish-ready', tone: 'ready', description: '已满足 Preview Publish 的内容与数据门禁；不代表已上线 Production。' },
};

export default function PublishReadinessPanel({ readiness, locale, readOnly = false, onExportPreview, onPublishStaging, stagingPublishing = false, repoMode = false }) {
  const { appLocale } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  if (!readiness) return null;
  const meta = isUiEnglish
    ? ({ blocked: { label: 'Blocked', tone: 'blocked', description: 'Required blockers still need attention.' }, ready_for_review: { label: 'Ready for Review', tone: 'review', description: 'Structure and content are complete and ready for human review.' }, publish_ready: { label: 'Preview-ready', tone: 'ready', description: 'Content and data gates are satisfied for Controlled Preview; this is not Production.' } }[readiness.state] || { label: 'Blocked', tone: 'blocked', description: 'Required blockers still need attention.' })
    : ({ blocked: { label: '已阻止', tone: 'blocked', description: '仍有必须处理的阻塞项。' }, ready_for_review: { label: '待审核', tone: 'review', description: '结构与内容完整，可以进入人工审核。' }, publish_ready: { label: '可生成预览', tone: 'ready', description: '已满足预览的内容与数据门禁；不代表已正式上线。' } }[readiness.state] || { label: '已阻止', tone: 'blocked', description: '仍有必须处理的阻塞项。' });
  return (
    <section className={`publish-readiness-panel ${meta.tone}`}>
      <div className="publish-readiness-head">
        <div>
          <p className="eyebrow">PUBLISH READINESS · {locale}</p>
          <h2>{meta.label}</h2>
          <p>{meta.description}</p>
        </div>
        <span className={`readiness-pill ${meta.tone}`}>{meta.label}</span>
      </div>
      {readiness.blockers?.length ? (
        <div className="readiness-blockers">
          {readiness.blockers.map((item) => <div key={item}>• {item}</div>)}
        </div>
      ) : readiness.reviewNeeded?.length ? (
        <p className="readiness-note">{isUiEnglish ? `Next review: ${readiness.reviewNeeded.join(' + ')}. Approval is required before Preview-ready.` : `下一步审核：${readiness.reviewNeeded.join(' + ')}。Approved 后才进入 Publish-ready。`}</p>
      ) : (
        <div className="readiness-ready-actions">
          <p className="readiness-note">{isUiEnglish ? 'Eligible for Controlled Preview. Production publication remains separately locked.' : '可进入受控预览；正式发布仍由独立发布门禁控制。'}</p>
          <div className="footer-actions">
            <button className="secondary-button" type="button" disabled={!onExportPreview} onClick={onExportPreview}>
              {readOnly ? (isUiEnglish ? 'Read-only Preview Snapshot' : '只读预览快照') : (isUiEnglish ? 'Export Preview Snapshot' : '导出预览快照')}
            </button>
            {repoMode ? (
              <button className="primary-button compact" type="button" disabled={!onPublishStaging || stagingPublishing} onClick={onPublishStaging}>
                {stagingPublishing ? (isUiEnglish ? 'Publishing…' : '发布中…') : (isUiEnglish ? 'Publish selected to Staging' : '发布当前物种到预发布环境')}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
