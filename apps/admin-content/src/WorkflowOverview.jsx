import { useAppLanguage } from './AppLanguage.jsx';
const readinessCards = [
  ['blocked', 'Blocked'],
  ['ready_for_review', 'Ready for Review'],
  ['publish_ready', 'Publish-ready'],
];
const reviewCards = [
  ['pending', '待处理'],
  ['resolved', '已解决'],
  ['source_fix_required', '需修源数据'],
];

function FilterButton({ active, label, count, onClick, tone = '' }) {
  return <button type="button" className={`workflow-stat ${tone} ${active ? 'active' : ''}`} onClick={onClick}><strong>{count}</strong><span>{label}</span></button>;
}

export default function WorkflowOverview({ overview, activeFilter, onFilter }) {
  const { appLocale } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  if (!overview) return null;
  const toggle = (next) => onFilter(activeFilter?.key === next.key ? null : next);
  return (
    <section className="workflow-overview">
      <div className="workflow-overview-head"><div><p className="eyebrow">EDITORIAL WORKFLOW</p><h2>{isUiEnglish ? 'Content & review overview' : '内容与复核总览'}</h2></div><small>{isUiEnglish ? 'Readiness is counted by Species; Data Review is counted by issue.' : 'Readiness 按 486 条 Species；Data Review 按 33 个问题项。'}</small></div>
      <div className="workflow-overview-grid">
        <div className="workflow-overview-group"><h3>Data Review</h3><div className="workflow-stats">{reviewCards.map(([status,label]) => <FilterButton key={status} active={activeFilter?.key===`data:${status}`} label={label} count={overview.dataReview[status]} tone={status} onClick={() => toggle({ key:`data:${status}`, type:'data', status, label:`Data Review · ${label}` })} />)}</div></div>
        {[["zh-CN","中文"],["en","English"]].map(([locale,label]) => <div className="workflow-overview-group" key={locale}><h3>{label}</h3><div className="workflow-stats">{readinessCards.map(([status,text]) => <FilterButton key={status} active={activeFilter?.key===`${locale}:${status}`} label={text} count={overview.locales[locale][status]} tone={status} onClick={() => toggle({ key:`${locale}:${status}`, type:'readiness', locale, status, label:`${label} · ${text}` })} />)}</div></div>)}
      </div>
    </section>
  );
}
