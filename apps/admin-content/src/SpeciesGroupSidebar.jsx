import { useMemo } from 'react';
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
}) {
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return groups.filter((group) => (
      (!category || group.primary_category === category) && matches(group, needle)
    ));
  }, [groups, search, category]);

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
        {filtered.map((group) => (
          <section className={`species-group ${group.category_conflict ? 'needs-review' : ''}`} key={group.group_key}>
            <button className="group-header" type="button" onClick={() => onSelect(group.members[0].id)}>
              <span className="group-copy">
                <strong>{group.base_scientific_name}</strong>
                <small>{group.member_count > 1 ? `${group.member_count} 条同类 / 变种` : group.members[0].name}</small>
              </span>
              <span className="group-badges">
                {group.category_conflict ? <em>需复核</em> : null}
                {group.member_count > 1 ? <b>{group.member_count}</b> : null}
              </span>
            </button>

            {group.member_count > 1 ? (
              <div className="variant-list">
                {group.members.map((item) => (
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
                      </span>
                      <code>{item.catalog_key}</code>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <button
                className={`single-species-row ${selectedId === group.members[0].id ? 'active' : ''}`}
                type="button"
                onClick={() => onSelect(group.members[0].id)}
              >
                <strong>{group.members[0].name}</strong>
                <small>{group.members[0].catalog_key}</small>
              </button>
            )}
          </section>
        ))}
      </div>
    </aside>
  );
}
