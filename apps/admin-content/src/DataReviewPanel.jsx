export default function DataReviewPanel({ group }) {
  if (!group || (!group.category_conflict && !group.duplicate_count)) return null;

  const categoryMembers = group.category_conflict
    ? group.categories.map((category) => ({
      category,
      members: group.members.filter((member) => member.category === category),
    }))
    : [];

  return (
    <section className="data-review-panel">
      <div className="data-review-header">
        <div>
          <p className="eyebrow">DATA REVIEW QUEUE</p>
          <h2>源数据复核</h2>
          <p>{group.base_scientific_name} 在进入批量 SEO 前需要人工确认以下问题。</p>
        </div>
        <span className="review-count">{Number(group.category_conflict) + (group.duplicate_sets?.length || 0)} 项</span>
      </div>
      {group.category_conflict ? (
        <div className="review-issue-card">
          <div className="review-issue-title">
            <strong>分类冲突</strong>
            <span>{group.categories.join(' ↔ ')}</span>
          </div>
          <p>同一 Base Species 被分到多个产品分类。未确认正确分类前，Base Publish 与批量 SEO 保持阻止。</p>
          <div className="review-evidence-grid">
            {categoryMembers.map((item) => (
              <div key={item.category}>
                <b>{item.category}</b>
                {item.members.map((member) => <small key={member.catalog_key}>{member.name} · {member.catalog_key}</small>)}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {group.duplicate_sets?.map((set) => (
        <div className="review-issue-card" key={set.duplicate_set_key}>
          <div className="review-issue-title">
            <strong>疑似完全重复</strong>
            <span>{set.member_ids.length} 条记录</span>
          </div>
          <p><b>{set.name}</b> · <i>{set.scientific_name}</i></p>
          <div className="duplicate-key-list">
            {set.member_ids.map((id, index) => (
              <code key={id}>{id}{index === 0 ? ' · 首条候选（未自动判定 canonical）' : ''}</code>
            ))}
          </div>
          <small>这里只提供证据，不会自动删除、合并或改写 Product Truth。</small>
        </div>
      ))}
    </section>
  );
}
