import { useAppLanguage } from './AppLanguage.jsx';

const reviewStates = [
  ['pending', { zh: '待处理', en: 'Pending' }, { zh: '需要先判断重复记录或分类冲突', en: 'Duplicate or category evidence needs a decision' }],
  ['resolved', { zh: '已解决', en: 'Resolved' }, { zh: '已记录人工结论，可继续 SEO 流程', en: 'Human decision recorded; SEO workflow can continue' }],
  ['source_fix_required', { zh: '需修源数据', en: 'Source fix needed' }, { zh: '需要先修正 AquaGuide 源数据', en: 'Product Truth source data requires correction' }],
];

const readinessStates = [
  ['blocked', { zh: '未就绪', en: 'Not ready' }, { zh: '内容、数据或双语条件还未满足', en: 'Content, data or bilingual requirements are incomplete' }],
  ['ready_for_review', { zh: '待审核', en: 'Awaiting review' }, { zh: '内容已完成，等待人工审核', en: 'Content is complete and waiting for editorial review' }],
  ['publish_ready', { zh: '可预览', en: 'Preview-ready' }, { zh: '已满足预览发布条件', en: 'Eligible for Staging Preview publication' }],
];

function QueueRow({ active, count, label, description, tone, onClick }) {
  return (
    <button type="button" className={`workflow-queue-row ${tone} ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="workflow-queue-copy"><strong>{label}</strong><small>{description}</small></span>
      <span className="workflow-queue-count">{count}</span>
      <span className="workflow-queue-arrow">›</span>
    </button>
  );
}

export default function WorkflowOverview({ overview, activeFilter, onFilter }) {
  const { appLocale } = useAppLanguage();
  const isEnglish = appLocale === 'en';
  if (!overview) return null;
  const lang = isEnglish ? 'en' : 'zh';
  const toggle = (next) => onFilter(activeFilter?.key === next.key ? null : next);
  const pageCount = overview.locales?.['zh-CN']?.total ?? 0;
  const issueCount = overview.dataReview?.total ?? 0;

  const renderReadiness = (locale, title) => (
    <section className="workflow-queue-section" key={locale}>
      <div className="workflow-queue-section-head">
        <div><h3>{title}</h3><p>{isEnglish ? 'Edit → review → Staging Preview' : '编辑 → 审核 → 预览发布'}</p></div>
        <span>{overview.locales?.[locale]?.total ?? 0} {isEnglish ? 'pages' : '个页面'}</span>
      </div>
      <div className="workflow-queue-list">
        {readinessStates.map(([status, label, description]) => (
          <QueueRow
            key={status}
            active={activeFilter?.key === `${locale}:${status}`}
            count={overview.locales?.[locale]?.[status] ?? 0}
            label={label[lang]}
            description={description[lang]}
            tone={status}
            onClick={() => toggle({ key: `${locale}:${status}`, type: 'readiness', locale, status, label: `${title} · ${label[lang]}` })}
          />
        ))}
      </div>
    </section>
  );

  return (
    <section className="workflow-overview workflow-queue-overview">
      <div className="workflow-queue-summary">
        <strong>{isEnglish ? 'What needs attention now' : '现在需要处理什么'}</strong>
        <p>{isEnglish ? `${pageCount} current SEO page candidates · ${issueCount} data-review issues` : `${pageCount} 个当前 SEO 页面候选 · ${issueCount} 个数据问题`}</p>
      </div>

      <section className="workflow-queue-section workflow-data-section">
        <div className="workflow-queue-section-head">
          <div><h3>{isEnglish ? 'Data review' : '数据复核'}</h3><p>{isEnglish ? 'Resolve source-data issues before indexing' : '先判断重复记录和分类问题，再进入内容发布'}</p></div>
          <span>{issueCount} {isEnglish ? 'issues' : '个问题'}</span>
        </div>
        <div className="workflow-queue-list">
          {reviewStates.map(([status, label, description]) => (
            <QueueRow
              key={status}
              active={activeFilter?.key === `data:${status}`}
              count={overview.dataReview?.[status] ?? 0}
              label={label[lang]}
              description={description[lang]}
              tone={status}
              onClick={() => toggle({ key: `data:${status}`, type: 'data', status, label: `${isEnglish ? 'Data review' : '数据复核'} · ${label[lang]}` })}
            />
          ))}
        </div>
      </section>

      {renderReadiness('zh-CN', isEnglish ? 'Chinese content' : '中文内容')}
      {renderReadiness('en', 'English')}
    </section>
  );
}
