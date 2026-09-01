import { useMemo } from 'react';
import { speciesCategories, speciesGroupStats } from './speciesGroups.js';
import { useAppLanguage } from './AppLanguage.jsx';

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


function isVisibleSeoMember(group, member, reviewRows = {}) {
  if (!member?.duplicate_set_key) return true;
  const review = reviewRows[member.duplicate_set_key];
  if (review?.decision === 'distinct_records') return true;
  if (review?.decision === 'duplicate_records' && review.canonical_catalog_key) {
    return member.catalog_key === review.canonical_catalog_key;
  }
  return !member.duplicate_of_catalog_key;
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
  onSelectBase,
  selectedScope = 'variant',
  onToggleBatch,
  workflowFilter,
  workflowGroupKeys,
  workflowMemberIds,
  onClearWorkflowFilter,
  workflowOverview,
  locale = 'zh-CN',
  onWorkflowFilter,
  reviewRows = {},
  onOpenDataReview,
}) {
  const { appLocale, t } = useAppLanguage();
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return groups.filter((group) => {
      const categoryMatch = !category || group.primary_category === category;
      const textMatch = matches(group, needle);
      const workflowMatch = !workflowGroupKeys || workflowGroupKeys.has(group.group_key);
      return categoryMatch && textMatch && workflowMatch;
    });
  }, [groups, search, category, workflowGroupKeys]);
  const groupedFiltered = useMemo(() => {
    const map = new Map();
    filtered.forEach((group) => {
      const key = group.primary_category || '未分类';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(group);
    });
    return [...map.entries()];
  }, [filtered]);

  const seoPageCandidateCount = useMemo(() => groups.reduce((sum, group) => (
    sum + group.members.filter((member) => isVisibleSeoMember(group, member, reviewRows)).length
  ), 0), [groups, reviewRows]);

  const workflowFilterLabel = useMemo(() => {
    if (!workflowFilter) return '';
    const localePrefix = workflowFilter.locale
      ? (workflowFilter.locale === 'en' ? 'English' : (appLocale === 'en' ? 'Chinese' : '中文'))
      : '';
    if (workflowFilter.type === 'data') return appLocale === 'en' ? 'Data Review · Pending' : '数据复核 · 待处理';
    if (workflowFilter.status === 'ready_for_review') {
      const state = appLocale === 'en' ? 'Awaiting Review' : '待审核';
      return localePrefix ? `${localePrefix} · ${state}` : state;
    }
    if (workflowFilter.status === 'publish_ready') {
      const state = appLocale === 'en' ? 'Preview-ready' : '可预览';
      return localePrefix ? `${localePrefix} · ${state}` : state;
    }
    return workflowFilter.label || workflowFilter.key;
  }, [workflowFilter, appLocale]);

  return (
    <aside className="species-sidebar">
      <div className="sidebar-heading">
        <div>
          <p className="eyebrow">{t('sidebar.content')}</p>
          <h2>{t('sidebar.species')}</h2>
        </div>
        <span className="count-badge" title={appLocale === 'en' ? `${seoPageCandidateCount} current SEO page candidates` : `${seoPageCandidateCount} 个当前 SEO 页面候选`}>{seoPageCandidateCount}</span>
      </div>
      <div className="catalog-summary">
        {speciesGroupStats.catalog_count} {appLocale === 'en' ? 'source records' : '条源记录'} · {speciesGroupStats.exact_duplicate_records} {appLocale === 'en' ? 'duplicate candidates' : '条疑似重复'} · {speciesGroupStats.base_group_count} {appLocale === 'en' ? 'Base groups' : '个基础种'}
      </div>
      {workflowFilter ? <div className="workflow-filter-banner"><span>{t('sidebar.workflowFilter')}{appLocale === 'en' ? ': ' : '：'}{workflowFilterLabel} · {filtered.length} {appLocale === 'en' ? 'Base groups' : '个 Base'}</span><button type="button" onClick={onClearWorkflowFilter}>{t('common.clear')}</button></div> : null}
      <div className="review-filters species-quick-filters" aria-label="Species workflow filters">
        <button type="button" title={appLocale === 'en' ? `${speciesGroupStats.base_group_count} Base Species groups` : `${speciesGroupStats.base_group_count} 个 Base Species 分组`} className={!workflowFilter ? 'active' : ''} onClick={() => { onClearWorkflowFilter?.(); }}>{appLocale === 'en' ? 'Base groups' : '基础种'} <b>{speciesGroupStats.base_group_count}</b></button>
        <button type="button" title={appLocale === 'en' ? `${workflowOverview?.dataReview?.pending ?? 0} pending Data Review issues` : `${workflowOverview?.dataReview?.pending ?? 0} 个待处理数据问题`} className={`tone-issue ${workflowFilter?.key === 'data:pending' ? 'active' : ''}`} onClick={() => onWorkflowFilter?.({ key: 'data:pending', type: 'data', status: 'pending', label: appLocale === 'en' ? 'Data Review · Pending' : '数据复核 · 待处理' })}>{t('common.issues')} <b>{workflowOverview?.dataReview?.pending ?? 0}</b></button>
        <button type="button" title={appLocale === 'en' ? 'Content items awaiting editorial review' : '等待人工审核的内容条目'} className={`tone-review ${workflowFilter?.key === `${locale}:ready_for_review` ? 'active' : ''}`} onClick={() => onWorkflowFilter?.({ key: `${locale}:ready_for_review`, type: 'readiness', locale, status: 'ready_for_review', label: appLocale === 'en' ? 'Awaiting Review' : '待审核' })}>{t('common.review')} <b>{workflowOverview?.locales?.[locale]?.ready_for_review ?? 0}</b></button>
        <button type="button" title={appLocale === 'en' ? 'Pages eligible for Controlled Preview' : '可进入受控 Preview 的页面'} className={`tone-ready ${workflowFilter?.key === `${locale}:publish_ready` ? 'active' : ''}`} onClick={() => onWorkflowFilter?.({ key: `${locale}:publish_ready`, type: 'readiness', locale, status: 'publish_ready', label: appLocale === 'en' ? 'Preview-ready' : '可预览' })}>{appLocale === 'en' ? 'Preview' : '预览'} <b>{workflowOverview?.locales?.[locale]?.publish_ready ?? 0}</b></button>
      </div>
      <input
        className="search-input"
        placeholder={t('sidebar.search')}
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />
      <select className="category-filter" value={category} onChange={(event) => onCategory(event.target.value)}>
        <option value="">{t('sidebar.allCategories')}</option>
        {speciesCategories.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <div className="species-list group-list">
        {filtered.length === 0 ? <p className="list-message">{t('sidebar.noMatch')}</p> : null}
        {groupedFiltered.map(([categoryName, categoryGroups]) => (
          <section className="species-category-section" key={categoryName}>
            <div className="species-category-label">{categoryName}</div>
            {categoryGroups.map((group) => {
              const primaryMembers = group.members.filter((item) => isVisibleSeoMember(group, item, reviewRows));
              const hiddenDuplicateCount = group.members.length - primaryMembers.length;
              const visibleMembers = workflowMemberIds ? primaryMembers.filter((item) => workflowMemberIds.has(item.id)) : primaryMembers;
              const firstVisible = visibleMembers[0] || primaryMembers[0] || group.members[0];
              const baseActive = selectedScope === 'base' && group.members.some((item) => item.id === selectedId);
              const containsActiveVariant = selectedScope === 'variant' && group.members.some((item) => item.id === selectedId);
              return (
                <div className={`species-group ${group.category_conflict ? 'needs-review' : ''} ${containsActiveVariant ? 'contains-active' : ''}`} key={group.group_key}>
                  <button className={`group-header ${baseActive ? 'active' : ''} ${containsActiveVariant ? 'contains-active' : ''}`} type="button" onClick={(event) => { if (event.target.closest('.issue-dot')) { onOpenDataReview?.(group.group_key, firstVisible.id); return; } onSelectBase?.(firstVisible.id); }}>
                    <span className="group-copy">
                      <strong>{group.base_scientific_name}</strong>
                      <small>{primaryMembers.length > 1 ? `${primaryMembers.length} ${t('sidebar.pages')}${hiddenDuplicateCount ? (appLocale === 'en' ? ` · ${hiddenDuplicateCount} duplicate hidden` : ` · ${hiddenDuplicateCount} 条疑似重复已折叠`) : ''}` : t('sidebar.baseSpecies')}</small>
                    </span>
                    <span className="group-badges">
                      {group.category_conflict || group.duplicate_count > 0 ? <em className="issue-dot" title={t('sidebar.dataIssue')}>!</em> : null}
                    </span>
                  </button>
                  <div className="variant-list">
                    {visibleMembers.map((item) => (
                      <div className={`variant-row ${selectedScope === 'variant' && selectedId === item.id ? 'active' : ''}`} key={item.id}>
                        <input type="checkbox" checked={batchIds.includes(item.id)} onChange={() => onToggleBatch(item.id)} aria-label={`批量选择 ${item.name}`} />
                        <button type="button" onClick={(event) => { if (event.target.closest('.variant-issue-mark')) { onOpenDataReview?.(group.group_key, item.id); return; } onSelect(item.id); }}>
                          <span>
                            <strong>{item.name}</strong>
                            <small>{item.variant_label || (group.member_count > 1 ? t('sidebar.inheritsBase') : item.catalog_key)}</small>
                          </span>
                          {item.duplicate_peer_keys?.length ? <em className="variant-issue-mark actionable" title={appLocale === 'en' ? 'Open duplicate review' : '打开重复记录处理'}>{appLocale === 'en' ? 'Review duplicate' : '处理重复'}</em> : null}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </aside>
  );
}
