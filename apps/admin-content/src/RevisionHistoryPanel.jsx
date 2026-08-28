import { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase.js';
import { getLocaleLabel } from './localization.js';

const resourceLabels = {
  species_seo: 'Variant History',
  species_seo_group: 'Base Species History',
};

const formatTime = (value) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).format(new Date(value));
  } catch {
    return '—';
  }
};

function revisionSummary(revision, resourceType) {
  const snapshot = revision.snapshot || {};
  if (resourceType === 'species_seo_group') {
    return snapshot.h1_template || snapshot.seo_title_template || 'Base Species snapshot';
  }
  return snapshot.h1 || snapshot.seo_title || snapshot.localized_name || 'Variant snapshot';
}

export default function RevisionHistoryPanel({
  resourceType,
  resourceKey,
  locale = 'zh-CN',
  schemaReady,
  readOnly = false,
  refreshKey = 0,
  onRestored,
}) {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [armedId, setArmedId] = useState('');
  const [restoringId, setRestoringId] = useState('');
  const label = resourceLabels[resourceType] || 'History';

  useEffect(() => {
    let cancelled = false;
    setArmedId('');
    setError('');
    if (!resourceKey || readOnly || !schemaReady || !supabase) {
      setRevisions([]);
      return () => { cancelled = true; };
    }

    setLoading(true);
    supabase
      .from('content_revisions')
      .select('id,resource_type,resource_key,locale,version,operation,snapshot,source_revision_id,created_at')
      .eq('resource_type', resourceType)
      .eq('resource_key', resourceKey)
      .eq('locale', locale)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data, error: queryError }) => {
        if (cancelled) return;
        setLoading(false);
        if (queryError) {
          setError(`历史版本读取失败：${queryError.message}`);
          setRevisions([]);
          return;
        }
        setRevisions(data || []);
      });

    return () => { cancelled = true; };
  }, [resourceType, resourceKey, locale, schemaReady, readOnly, refreshKey]);

  const latestVersion = useMemo(() => revisions.reduce((max, item) => Math.max(max, item.version || 0), 0), [revisions]);

  const restore = async (revision) => {
    if (readOnly || !schemaReady) return;
    if (armedId !== revision.id) {
      setArmedId(revision.id);
      return;
    }
    setRestoringId(revision.id);
    setError('');
    const { data, error: restoreError } = await supabase.rpc('restore_species_seo_revision', { p_revision_id: revision.id });
    setRestoringId('');
    setArmedId('');
    if (restoreError) {
      setError(`回滚失败：${restoreError.message}`);
      return;
    }
    onRestored?.(data, resourceType);
  };

  return (
    <section className="revision-panel">
      <div className="revision-header">
        <div>
          <p className="eyebrow">VERSION HISTORY · {getLocaleLabel(locale)}</p>
          <h3>{label}</h3>
        </div>
        <span className="revision-count">{latestVersion ? `v${latestVersion}` : '—'}</span>
      </div>

      {readOnly ? (
        <p className="revision-empty">远程 UI Review 不读取真实历史记录；连接 Local / Staging Supabase 后才显示版本与回滚。</p>
      ) : !schemaReady ? (
        <p className="revision-empty">Revision migration 尚未应用。Draft 编辑不受影响，但发布继续锁定。</p>
      ) : loading ? (
        <p className="revision-empty">正在读取历史版本…</p>
      ) : error ? (
        <p className="revision-error">{error}</p>
      ) : revisions.length === 0 ? (
        <p className="revision-empty">还没有历史快照。第一次保存后会自动创建 v1。</p>
      ) : (
        <div className="revision-list">
          {revisions.map((revision) => (
            <div className="revision-item" key={revision.id}>
              <div className="revision-main">
                <div className="revision-meta">
                  <strong>v{revision.version}</strong>
                  <span className={`revision-operation ${revision.operation}`}>{revision.operation}</span>
                  <span>{formatTime(revision.created_at)}</span>
                  <span>{revision.snapshot?.status || 'draft'}</span>
                </div>
                <div className="revision-summary">{revisionSummary(revision, resourceType)}</div>
              </div>
              <button
                type="button"
                className={armedId === revision.id ? 'danger-button compact' : 'secondary-button compact'}
                onClick={() => restore(revision)}
                disabled={Boolean(restoringId)}
              >
                {restoringId === revision.id
                  ? '恢复中…'
                  : armedId === revision.id
                    ? `再次点击恢复 v${revision.version} 为 Draft`
                    : `恢复 v${revision.version}`}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
