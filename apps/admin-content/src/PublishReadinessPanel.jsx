const STATE_META = {
  blocked: { label: 'Blocked', tone: 'blocked', description: '仍有必须处理的阻塞项。' },
  ready_for_review: { label: 'Ready for Review', tone: 'review', description: '结构与内容完整，可以进入人工审核。' },
  publish_ready: { label: 'Publish-ready', tone: 'ready', description: '已满足 Preview Publish 的内容与数据门禁；不代表已上线 Production。' },
};

export default function PublishReadinessPanel({ readiness, locale }) {
  if (!readiness) return null;
  const meta = STATE_META[readiness.state] || STATE_META.blocked;
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
        <p className="readiness-note">下一步审核：{readiness.reviewNeeded.join(' + ')}。Approved 后才进入 Publish-ready。</p>
      ) : (
        <p className="readiness-note">可进入受控 Preview Publish；Production Published 仍由独立发布集成门禁控制。</p>
      )}
    </section>
  );
}
