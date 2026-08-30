import { useEffect, useMemo, useState } from 'react';
import { speciesCategories, speciesGroupStats } from './speciesGroups.js';

function matches(group, needle) {
  if (!needle) return true;
  const values = [
    group.base_scientific_name,
    group.primary_category,
    ...group.members.flatMap((member) => [
      member.name,
      member.scientific_name,
      member.catalog_key,
      member.variant_label,
    ]),
  ];
  return values.filter(Boolean).some((value) => String(value).toLowerCase().includes(needle));
}

export default function SpeciesGroupSidebar({
  groups,
  selectedId,
  batchIds,
  search,
  onSearch,
  category,
  onCategory,
  onSelect,
  onToggleBatch,
  workflowFilter,
  workflowGroupKeys,
  workflowMemberIds,
  onClearWorkflowFilter,
}) {
  const [reviewMode, setReviewMode] = useState('all');
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return groups.filter((group) => {
      const categoryMatch = !category || group.primary_category === category;
      const textMatch = matches(group, needle);
      const reviewMatch = reviewMode === 'all'
        || (reviewMode === 'conflict' && group.category_conflict)
        || (reviewMode === 'duplicate' && group.duplicate_count > 0);
      const workflowMatch = !workflowGroupKeys || workflowGroupKeys.has(group.group_key);
      return categoryMatch && textMatch && reviewMatch && workflowMatch;
    });
  }, [groups, search, category, reviewMode, workflowGroupKeys]);

  return (
    <aside className="species-sidebar">
      <div className="sidebar-heading">
        <div>
          <p className="eyebrow">CONTENT</p>
          <h2>Species Groups</h2>
        </div>
        <span className="count-badge">{speciesGroupStats.base_group_count}</span>
      </div>
      <div className="catalog-summary">
        {speciesGroupStats.catalog_count} 条记录 · {speciesGroupStats.batch_candidate_groups} 个可批量组
      </div>
      {workflowFilter ? <div className="workflow-filter-banner"><span>Workflow 筛选：{workflowFilter.label || workflowFilter.key}</span><button type="button" onClick={onClearWorkflowFilter}>清除</button></div> : null}
      <div className="review-filters" aria-label="数据复核筛选">
        <button type="button" className={reviewMode === 'all' ? 'active' : ''} onClick={() => setReviewMode('all')}>全部 {speciesGroupStats.base_group_count}</button>
        <button type="button" className={reviewMode === 'conflict' ? 'active danger' : 'danger'} onClick={() => setReviewMode('conflict')}>分类冲突 {speciesGroupStats.category_conflict_groups}</button>
        <button type="button" className={reviewMode === 'duplicate' ? 'active warning' : 'warning'} onClick={() => setReviewMode('duplicate')}>疑似重复 +{speciesGroupStats.exact_duplicate_records}</button>
      </div>
      <input
        className="search-input"
        placeholder="搜索名称、学名、变种或 key…"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />
      <select className="category-filter" value={category} onChange={(event) => onCategory(event.target.value)}>
        <option value="">全部种类</option>
        {speciesCategories.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <div className="species-list group-list">
        {filtered.length === 0 ? <p className="list-message">没有匹配的基础物种组。</p> : null}
        {filtered.map((group) => {
          const visibleMembers = workflowMemberIds ? group.members.filter((item) => workflowMemberIds.has(item.id)) : group.members;
          const firstVisible = visibleMembers[0] || group.members[0];
          return (
          <section className={`species-group ${group.category_conflict ? 'needs-review' : ''}`} key={group.group_key}>
            <button className="group-header" type="button" onClick={() => onSelect(firstVisible.id)}>
              <span className="group-copy">
                <strong>{group.base_scientific_name}</strong>
                <small>{group.member_count > 1 ? `${visibleMembers.length}${workflowMemberIds ? ` / ${group.member_count}` : ''} 条同类 / 变种` : firstVisible.name}</small>
              </span>
              <span className="group-badges">
                {group.category_conflict ? <em>分类冲突</em> : null}
                {group.duplicate_count > 0 ? <em className="duplicate-badge">重复 +{group.duplicate_count}</em> : null}
                {group.member_count > 1 ? <b>{group.member_count}</b> : null}
              </span>
            </button>

            {group.member_count > 1 ? (
              <div className="variant-list">
                {visibleMembers.map((item) => (
                  <div className={`variant-row ${selectedId === item.id ? 'active' : ''}`} key={item.id}>
                    <input
                      type="checkbox"
                      checked={batchIds.includes(item.id)}
                      onChange={() => onToggleBatch(item.id)}
                      aria-label={`批量选择 ${item.name}`}
                    />
                    <button type="button" onClick={() => onSelect(item.id)}>
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.variant_label || '基础型 / 未标变种'}</small>
                        {item.duplicate_peer_keys?.length ? <em className="duplicate-member-note">疑似重复：{item.duplicate_peer_keys.join(' / ')}</em> : null}
                      </span>
                      <code>{item.catalog_key}</code>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <button
                className={`single-species-row ${selectedId === firstVisible.id ? 'active' : ''}`}
                type="button"
                onClick={() => onSelect(firstVisible.id)}
              >
                <strong>{firstVisible.name}</strong>
                <small>{firstVisible.catalog_key}</small>
              </button>
            )}
          </section>
          );
        })}
      </div>
    </aside>
  );
}
