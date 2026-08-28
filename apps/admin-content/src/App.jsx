import { useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from './supabase.js';
import SpeciesGroupSidebar from './SpeciesGroupSidebar.jsx';
import BatchSeoEditor from './BatchSeoEditor.jsx';
import BaseSpeciesSeoEditor from './BaseSpeciesSeoEditor.jsx';
import TranslationPanel from './TranslationPanel.jsx';
import DataReviewPanel from './DataReviewPanel.jsx';
import PublicSpeciesPreview from './PublicSpeciesPreview.jsx';
import RevisionHistoryPanel from './RevisionHistoryPanel.jsx';
import PublishReadinessPanel from './PublishReadinessPanel.jsx';
import { resolveEffectiveSeo } from './seoInheritance.js';
import { catalogSpecies, speciesGroups, speciesGroupByMemberId } from './speciesGroups.js';
import { CONTENT_LOCALES, seoRowKey, groupSeoRowKey, getLocaleLabel, isEnglishLocale } from './localization.js';
import { buildSpeciesSeoRouteMeta, INDEX_STRATEGIES } from './seoRouteContract.js';
import { REVIEW_STATES, assessPublishReadiness, dataReviewMap, getIndexReviewBlockReason } from './publishReadiness.js';

const isReviewMode = import.meta.env.VITE_ADMIN_REVIEW_MODE === 'true';
const isPublicSpeciesPublishingEnabled = false;
const initialParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
const initialContentLocale = initialParams.get('locale') === 'en' ? 'en' : 'zh-CN';
const initialSpeciesId = initialParams.get('species') || null;

const emptySeo = {
  localizedName: '',
  seoTitle: '',
  metaDescription: '',
  h1: '',
  intro: '',
  imageAlt: '',
  indexStrategy: 'noindex',
  canonicalCatalogKey: '',
  focusKeyword: '',
  status: 'draft',
  reviewState: 'editing',
};

const fromSeoRow = (row, species, locale = 'zh-CN') => ({
  localizedName: row?.localized_name || (isEnglishLocale(locale) ? '' : species?.name || ''),
  seoTitle: row?.seo_title || '',
  metaDescription: row?.meta_description || '',
  h1: row?.h1 || '',
  intro: row?.intro || '',
  imageAlt: row?.image_alt || '',
  indexStrategy: row?.index_strategy || 'noindex',
  canonicalCatalogKey: row?.canonical_catalog_key || '',
  focusKeyword: row?.focus_keyword || (isEnglishLocale(locale) ? row?.localized_name || '' : species?.name || ''),
  status: row?.status || 'draft',
  reviewState: row?.review_state || 'editing',
  reviewedAt: row?.reviewed_at || null,
  version: row?.version,
});

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '—';
  }
};

function Login({ onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(signInError.message || '登录失败，请检查账号。');
      return;
    }
    onSignedIn(data.session);
  };

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand-mark">A</div>
        <p className="eyebrow">AQUAGUIDE · PRIVATE</p>
        <h1>Content Admin</h1>
        <p className="muted">仅管理员可访问。当前版本用于 Species SEO 内容管理验证。</p>
        <form onSubmit={submit} className="login-form">
          <label>
            管理员邮箱
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </label>
          <label>
            密码
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
          </label>
          {error ? <div className="error-box">{error}</div> : null}
          <button className="primary-button" type="submit" disabled={busy}>{busy ? '正在验证…' : '登录后台'}</button>
        </form>
        <p className="security-note">访问控制由 Supabase Auth + user_roles + RLS 执行，不依赖隐藏页面地址。</p>
      </section>
    </main>
  );
}

function Forbidden({ email, onSignOut }) {
  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand-mark danger">!</div>
        <p className="eyebrow">ACCESS DENIED</p>
        <h1>没有管理员权限</h1>
        <p className="muted">{email || '当前账号'} 已登录，但 `user_roles.role` 不是 admin。</p>
        <button className="secondary-button" type="button" onClick={onSignOut}>退出账号</button>
      </section>
    </main>
  );
}

function SeoEditor({ species, group, groupRecord, record, locale = 'zh-CN', schemaReady, dataReviewRows = {}, readOnly = false, onSaved }) {
  const [form, setForm] = useState(emptySeo);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(fromSeoRow(record, species, locale));
  }, [record, species, locale]);

  useEffect(() => {
    setMessage('');
  }, [species?.id]);

  if (!species) {
    return (
      <section className="editor-empty">
        <div className="empty-icon">↖</div>
        <h2>选择一个 Species</h2>
        <p>从左侧列表选择鱼种，开始编辑 SEO 内容。</p>
      </section>
    );
  }

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const resolvedSeo = resolveEffectiveSeo({
    member: species,
    group,
    groupRow: groupRecord,
    variantRow: {
      seo_title: form.seoTitle,
      meta_description: form.metaDescription,
      h1: form.h1,
      intro: form.intro,
      localized_name: form.localizedName,
      locale,
    },
    locale,
  });
  const effectiveSeo = resolvedSeo.effective;
  const routeMeta = buildSpeciesSeoRouteMeta({
    member: species,
    group,
    locale,
    indexStrategy: form.indexStrategy,
    canonicalCatalogKey: form.canonicalCatalogKey,
  });
  const groupMember = group?.members?.find((item) => item.catalog_key === species.catalog_key) || null;
  const reviewIndexBlockReason = getIndexReviewBlockReason({
    species, group, indexStrategy: form.indexStrategy, canonicalCatalogKey: form.canonicalCatalogKey, reviewRows: dataReviewRows,
  });
  const indexBlockReason = reviewIndexBlockReason || (!routeMeta.publishReady
    ? '选择 Canonical to sibling 后必须指定同一 Base Species 内的目标记录。'
    : '');

  const save = async () => {
    if (indexBlockReason) {
      setMessage(indexBlockReason);
      return;
    }
    if (!isPublicSpeciesPublishingEnabled && form.status === 'published') {
      setMessage('Species 发布仍锁定：A+B 门禁已通过，但 Production public-deploy integration 尚未显式批准，只能保存 Draft 或 Archived。');
      return;
    }
    if (readOnly) {
      setMessage('当前为只读 UI Review，不会向任何 Supabase 发送写入请求。');
      return;
    }
    if (!schemaReady) {
      setMessage('当前 Supabase 尚未应用 species_seo migration。这个分支不会自动修改生产数据库。');
      return;
    }
    setSaving(true);
    setMessage('');
    const payload = {
      catalog_key: species.catalog_key,
      locale,
      localized_name: isEnglishLocale(locale) ? form.localizedName.trim() : '',
      seo_title: form.seoTitle.trim(),
      meta_description: form.metaDescription.trim(),
      h1: form.h1.trim(),
      intro: form.intro.trim(),
      image_alt: form.imageAlt.trim(),
      canonical_path: routeMeta.canonicalPath,
      index_strategy: form.indexStrategy,
      canonical_catalog_key: form.indexStrategy === 'canonical_to_sibling' ? form.canonicalCatalogKey : '',
      focus_keyword: form.focusKeyword.trim(),
      status: form.status,
      review_state: form.reviewState,
    };
    const { data, error } = await supabase
      .from('species_seo')
      .upsert(payload, { onConflict: 'catalog_key,locale' })
      .select('*')
      .single();
    setSaving(false);
    if (error) {
      setMessage(error.message || '保存失败。');
      return;
    }
    setMessage('已保存到 Species SEO 草稿。');
    onSaved(data);
  };

  return (
    <section className="editor-panel">
      <div className="editor-header">
        <div>
          <p className="eyebrow">SPECIES SEO · {getLocaleLabel(locale)}</p>
          <h2>{species.name}</h2>
          <p className="scientific-name">{species.scientific_name}</p>
        </div>
        <div className="editor-statuses">
          <span className={`status-pill ${species.status}`}>Species: {species.status}</span>
          <span className={`status-pill ${form.status}`}>SEO: {form.status}</span>
          <span className={`status-pill ${form.reviewState}`}>Review: {form.reviewState}</span>
          {group?.member_count > 1 ? <span className="status-pill inherited">{resolvedSeo.override.seoTitle ? 'TITLE: OVERRIDE' : 'TITLE: INHERITED'}</span> : null}
        </div>
      </div>

      <div className="editor-grid">
        <div className="form-column">
          <div className="section-card">
            <div className="section-heading">
              <div>
                <h3>Search Appearance</h3>
                <p>控制搜索结果和页面主标题，不修改产品数据。</p>
              </div>
            </div>
            {isEnglishLocale(locale) ? (
              <label>
                English Common Name
                <input value={form.localizedName} placeholder="例如 Cherry Shrimp" onChange={(event) => update('localizedName', event.target.value)} />
                <small className="inherit-note">只影响 English 内容层；不会改 Product Truth 里的中文名称。</small>
              </label>
            ) : null}
            <label>
              SEO Title Override <span>{form.seoTitle ? `${form.seoTitle.length}/60` : '继承 Base'}</span>
              <input value={form.seoTitle} maxLength={120} placeholder={resolvedSeo.inherited.seoTitle} onChange={(event) => update('seoTitle', event.target.value)} />
              <small className="inherit-note">{form.seoTitle ? '当前 Variant 使用自定义 Title；清空即可恢复继承。' : `继承：${resolvedSeo.inherited.seoTitle}`}</small>
            </label>
            <label>
              Meta Description Override <span>{form.metaDescription ? `${form.metaDescription.length}/160` : '继承 Base'}</span>
              <textarea rows="3" value={form.metaDescription} maxLength={320} placeholder={resolvedSeo.inherited.metaDescription} onChange={(event) => update('metaDescription', event.target.value)} />
              <small className="inherit-note">{form.metaDescription ? '当前 Variant 使用自定义 Description；清空即可恢复继承。' : '当前使用 Base Species 模板。'}</small>
            </label>
            <label>
              页面 H1 Override
              <input value={form.h1} placeholder={resolvedSeo.inherited.h1} onChange={(event) => update('h1', event.target.value)} />
              <small className="inherit-note">{form.h1 ? '当前 Variant 使用自定义 H1。' : `继承：${resolvedSeo.inherited.h1}`}</small>
            </label>
            <label>
              Focus Keyword
              <input value={form.focusKeyword} onChange={(event) => update('focusKeyword', event.target.value)} />
            </label>
          </div>

          <div className="section-card">
            <div className="section-heading">
              <div>
                <h3>Page Content</h3>
                <p>V0 只管理最核心的编辑型内容。</p>
              </div>
            </div>
            {group?.member_count > 1 ? (
              <div className="inherit-content-preview">
                <strong>Base Species 共享简介</strong>
                <p>{effectiveSeo.sharedIntro || 'Base Species 尚未填写共享简介。'}</p>
              </div>
            ) : null}
            <label>
              Variant Intro / 差异补充
              <textarea rows="6" value={form.intro} onChange={(event) => update('intro', event.target.value)} placeholder="只写这个变种独有的颜色、选育、表现或注意事项；共同饲养信息留在 Base Species。" />
            </label>
            <label>
              Hero Image Alt
              <input value={form.imageAlt} onChange={(event) => update('imageAlt', event.target.value)} />
            </label>
          </div>

          <div className="section-card">
            <div className="section-heading">
              <div>
                <h3>Indexing & URL</h3>
                <p>公开路径由稳定 catalog key + Base Scientific Name 推导，不再手填 Canonical。</p>
              </div>
            </div>
            <label>Search Index Strategy
              <select value={form.indexStrategy} onChange={(event) => update('indexStrategy', event.target.value)}>
                {INDEX_STRATEGIES.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                    disabled={(group?.category_conflict && item.value !== 'noindex') || (groupMember?.duplicate_peer_keys?.length && item.value === 'index') || (item.value === 'canonical_to_sibling' && group?.member_count < 2)}
                  >{item.label}</option>
                ))}
              </select>
            </label>
            {form.indexStrategy === 'canonical_to_sibling' ? (
              <label>Canonical target（同组）
                <select value={form.canonicalCatalogKey} onChange={(event) => update('canonicalCatalogKey', event.target.value)}>
                  <option value="">请选择同组主页面</option>
                  {(group?.members || []).filter((item) => item.catalog_key !== species.catalog_key).map((item) => (
                    <option key={item.catalog_key} value={item.catalog_key}>{item.name} · {item.catalog_key}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <div className="route-inline-summary">
              <span>Public URL</span><code>{routeMeta.selfPath}</code>
              <span>Canonical</span><code>{routeMeta.canonicalPath}</code>
            </div>
            <small className="inherit-note">静态 Species HTML 生成器已通过本地回归，但尚未连接 staging/public 发布链；选择 Index 仍不会自动上线。</small>
          </div>
        </div>

        <aside className="preview-column">
          <div className="section-card sticky-card">
            <div className="section-heading">
              <div>
                <h3>Google Preview</h3>
                <p>用于编辑判断，不代表 Google 一定采用。</p>
              </div>
            </div>
            <div className="google-preview">
              <div className="preview-domain">aquaguide · {routeMeta.selfPath}</div>
              <div className="preview-title">{effectiveSeo.seoTitle || effectiveSeo.displayName || species.name}</div>
              <div className="preview-description">{effectiveSeo.metaDescription || '尚未填写 Meta Description。'}</div>
            </div>
            <div className="seo-checks">
              <div><span className={effectiveSeo.seoTitle.length > 0 && effectiveSeo.seoTitle.length <= 60 ? 'check good' : 'check'}>•</span> Title {effectiveSeo.seoTitle.length > 60 ? '过长' : resolvedSeo.override.seoTitle ? 'Variant Override' : 'Base 继承'}</div>
              <div><span className={effectiveSeo.metaDescription.length > 0 && effectiveSeo.metaDescription.length <= 160 ? 'check good' : 'check'}>•</span> Description {effectiveSeo.metaDescription.length > 160 ? '过长' : resolvedSeo.override.metaDescription ? 'Variant Override' : 'Base 继承'}</div>
              <div><span className={effectiveSeo.h1 ? 'check good' : 'check'}>•</span> H1 {resolvedSeo.override.h1 ? 'Variant Override' : 'Base 继承'}</div>
              <div><span className={form.imageAlt ? 'check good' : 'check'}>•</span> Image Alt {form.imageAlt ? '已填写' : '缺失'}</div>
            </div>
          </div>
        </aside>
      </div>

      <PublicSpeciesPreview species={species} locale={locale} effectiveSeo={effectiveSeo} routeMeta={routeMeta} />

      <div className="editor-footer">
        <div>
          {!schemaReady ? <span className="warning-text">Schema 未应用：保存会被阻止</span> : null}
          {indexBlockReason ? <span className="warning-text">{indexBlockReason}</span> : null}
          {message ? <span className="save-message">{message}</span> : null}
        </div>
        <div className="footer-actions">
          <select value={form.reviewState} onChange={(event) => update('reviewState', event.target.value)} aria-label="Editorial review state">
            {REVIEW_STATES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select value={form.status} onChange={(event) => update('status', event.target.value)} aria-label="SEO status">
            <option value="draft">Draft</option>
            <option value="published" disabled={!isPublicSpeciesPublishingEnabled}>Published（Production integration locked）</option>
            <option value="archived">Archived</option>
          </select>
          <button className="primary-button compact" type="button" onClick={save} disabled={saving || readOnly || Boolean(indexBlockReason)}>{readOnly ? '只读预览' : saving ? '保存中…' : `保存 ${getLocaleLabel(locale)} SEO`}</button>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [role, setRole] = useState(null);
  const [species, setSpecies] = useState([]);
  const [seoRows, setSeoRows] = useState({});
  const [groupSeoRows, setGroupSeoRows] = useState({});
  const [groupPreviewRows, setGroupPreviewRows] = useState({});
  const [contentLocale, setContentLocale] = useState(initialContentLocale);
  const [selectedId, setSelectedId] = useState(initialSpeciesId);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [batchIds, setBatchIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schemaReady, setSchemaReady] = useState(true);
  const [groupSchemaReady, setGroupSchemaReady] = useState(true);
  const [historySchemaReady, setHistorySchemaReady] = useState(true);
  const [dataReviewSchemaReady, setDataReviewSchemaReady] = useState(true);
  const [dataReviewRows, setDataReviewRows] = useState({});
  const [revisionRefreshKey, setRevisionRefreshKey] = useState(0);

  useEffect(() => {
    if (isReviewMode) {
      setSession({ user: { id: 'review-only', email: 'review@aquaguide.local' } });
      setRole('admin');
      setSpecies(catalogSpecies);
      setSelectedId((current) => catalogSpecies.some((item) => item.id === current) ? current : catalogSpecies[0]?.id || null);
      setSchemaReady(false);
      setGroupSchemaReady(false);
      setHistorySchemaReady(false);
      setDataReviewSchemaReady(false);
      setAuthChecked(true);
      return undefined;
    }
    if (!supabase) {
      setAuthChecked(true);
      return undefined;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setAuthChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isReviewMode) return undefined;
    if (!session) {
      setRole(null);
      setSpecies([]);
      setSeoRows({});
      setGroupSeoRows({});
      setGroupPreviewRows({});
      setDataReviewRows({});
      return;
    }

    const loadAdminData = async () => {
      setLoading(true);
      setError('');
      const { data: roleRow, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .maybeSingle();

      if (roleError) {
        setError(`管理员身份验证失败：${roleError.message}`);
        setLoading(false);
        return;
      }
      setRole(roleRow?.role || 'user');
      if (roleRow?.role !== 'admin') {
        setLoading(false);
        return;
      }

      // V0 reads the product catalog from the same source currently used by AquaGuide.
      // This avoids duplicating 486 product records into Supabase just to edit SEO.
      setSpecies(catalogSpecies);
      if (!selectedId && catalogSpecies.length) setSelectedId(catalogSpecies[0].id);

      const { data: seoData, error: seoError } = await supabase
        .from('species_seo')
        .select('id,catalog_key,locale,localized_name,seo_title,meta_description,h1,intro,image_alt,canonical_path,focus_keyword,index_strategy,canonical_catalog_key,status,published_at,review_state,reviewed_by,reviewed_at,updated_at,deleted_at,version')
        .is('deleted_at', null);

      if (seoError) {
        setSchemaReady(false);
      } else {
        setSchemaReady(true);
        setSeoRows(Object.fromEntries((seoData || []).map((row) => [seoRowKey(row.catalog_key, row.locale), row])));
      }

      const { data: groupSeoData, error: groupSeoError } = await supabase
        .from('species_seo_groups')
        .select('*')
        .is('deleted_at', null);
      if (groupSeoError) {
        setGroupSchemaReady(false);
      } else {
        setGroupSchemaReady(true);
        setGroupSeoRows(Object.fromEntries((groupSeoData || []).map((row) => [groupSeoRowKey(row.group_key, row.locale), row])));
      }

      const { error: historyError } = await supabase
        .from('content_revisions')
        .select('id')
        .limit(1);
      setHistorySchemaReady(!historyError);

      const { data: reviewData, error: reviewError } = await supabase
        .from('species_data_reviews')
        .select('*');
      setDataReviewSchemaReady(!reviewError);
      setDataReviewRows(reviewError ? {} : dataReviewMap(reviewData || []));
      setLoading(false);
    };

    loadAdminData();
  }, [session]);

  const selectedSpecies = species.find((item) => item.id === selectedId) || null;
  const selectedGroup = selectedSpecies ? speciesGroupByMemberId.get(selectedSpecies.id) : null;
  const selectedGroupKey = selectedGroup ? groupSeoRowKey(selectedGroup.group_key, contentLocale) : null;
  const selectedGroupPersisted = selectedGroupKey ? groupSeoRows[selectedGroupKey] : null;
  const selectedGroupRecord = selectedGroupKey
    ? groupPreviewRows[selectedGroupKey] || selectedGroupPersisted
    : null;
  const selectedVariantRecord = selectedSpecies ? seoRows[seoRowKey(selectedSpecies.catalog_key, contentLocale)] : null;
  const sourceVariantRow = selectedSpecies ? seoRows[seoRowKey(selectedSpecies.catalog_key, 'zh-CN')] : null;
  const sourceGroupRow = selectedGroup ? groupSeoRows[groupSeoRowKey(selectedGroup.group_key, 'zh-CN')] : null;
  const englishVariantRow = selectedSpecies ? seoRows[seoRowKey(selectedSpecies.catalog_key, 'en')] : null;
  const englishGroupRow = selectedGroup ? groupSeoRows[groupSeoRowKey(selectedGroup.group_key, 'en')] : null;
  const counterpartLocale = contentLocale === 'en' ? 'zh-CN' : 'en';
  const counterpartVariantRow = selectedSpecies ? seoRows[seoRowKey(selectedSpecies.catalog_key, counterpartLocale)] : null;
  const counterpartGroupRow = selectedGroup ? groupSeoRows[groupSeoRowKey(selectedGroup.group_key, counterpartLocale)] : null;
  const calculatedReadiness = selectedSpecies && selectedGroup ? assessPublishReadiness({
    species: selectedSpecies, group: selectedGroup, locale: contentLocale, variantRow: selectedVariantRecord,
    groupRow: selectedGroupPersisted, counterpartVariantRow, counterpartGroupRow, reviewRows: dataReviewRows,
  }) : null;
  const publishReadiness = calculatedReadiness && (!schemaReady || !groupSchemaReady || !historySchemaReady || !dataReviewSchemaReady)
    ? { state: 'blocked', blockers: ['Admin schema 001–007 尚未完整就绪；Publish Readiness fail closed。'] }
    : calculatedReadiness;
  const localeSeoRows = useMemo(() => Object.fromEntries(
    Object.values(seoRows).filter((row) => row.locale === contentLocale).map((row) => [row.catalog_key, row]),
  ), [seoRows, contentLocale]);
  const batchMembers = batchIds.map((id) => species.find((item) => item.id === id)).filter(Boolean);
  const batchGroup = batchMembers.length ? speciesGroupByMemberId.get(batchMembers[0].id) : null;
  const batchGroupKey = batchGroup ? groupSeoRowKey(batchGroup.group_key, contentLocale) : null;
  const batchGroupRecord = batchGroupKey
    ? groupPreviewRows[batchGroupKey] || groupSeoRows[batchGroupKey]
    : null;

  const toggleBatch = (id) => {
    const nextGroup = speciesGroupByMemberId.get(id);
    setSelectedId(id);
    setBatchIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      const currentGroup = current.length ? speciesGroupByMemberId.get(current[0]) : null;
      if (currentGroup && nextGroup && currentGroup.group_key !== nextGroup.group_key) return [id];
      return [...current, id];
    });
  };

  const signOut = async () => {
    if (isReviewMode) return;
    await supabase.auth.signOut();
    setSession(null);
  };

  if (!isReviewMode && !isSupabaseConfigured) {
    return (
      <main className="login-shell">
        <section className="login-card wide">
          <div className="brand-mark">A</div>
          <p className="eyebrow">SETUP REQUIRED</p>
          <h1>Admin V0 已创建</h1>
          <p className="muted">复制 `.env.example` 为本地环境变量并配置 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY` 后即可登录。不要把 service role key 放进前端。</p>
        </section>
      </main>
    );
  }

  if (!authChecked) return <main className="center-message">正在检查登录状态…</main>;
  if (!session) return <Login onSignedIn={setSession} />;
  if (role && role !== 'admin') return <Forbidden email={session.user.email} onSignOut={signOut} />;

  return (
    <div className="admin-shell">
      <header className="topbar">
        <div className="brand-row">
          <div className="brand-mark small">A</div>
          <div>
            <strong>AquaGuide Admin</strong>
            <span>Species Content</span>
          </div>
        </div>
        <div className="locale-switcher" aria-label="Content language">
          {CONTENT_LOCALES.map((item) => (
            <button
              key={item.code}
              type="button"
              className={contentLocale === item.code ? 'active' : ''}
              onClick={() => setContentLocale(item.code)}
            >
              {item.label}
            </button>
          ))}
          <small>语言独立 Draft / Publish</small>
        </div>
        <div className="topbar-actions">
          <span className={`connection-dot ${schemaReady && groupSchemaReady && historySchemaReady && dataReviewSchemaReady ? 'ready' : 'warning'}`}></span>
          <span>{isReviewMode ? 'Read-only UI review' : schemaReady && groupSchemaReady ? `${getLocaleLabel(contentLocale)} SEO · ${historySchemaReady ? 'history ready' : 'history pending'}` : 'SEO schema pending'}</span>
          <span className="admin-email">{session.user.email}</span>
          <button className="ghost-button" type="button" onClick={signOut}>退出</button>
        </div>
      </header>

      {isReviewMode ? (
        <div className="schema-banner">
          <strong>只读 UI Review：</strong> 当前远程预览不连接任何 Supabase 写入环境。可以搜索 486 条 Species、体验编辑器和 Google Preview，但保存被硬禁用。
        </div>
      ) : !schemaReady || !groupSchemaReady ? (
        <div className="schema-banner">
          <strong>安全隔离状态：</strong> Variant / Base Species SEO migration 尚未全部应用；可以预览继承结构，但缺失的层级不会写入。不会自动触碰 Production。
        </div>
      ) : !historySchemaReady ? (
        <div className="schema-banner">
          <strong>版本安全门：</strong> Draft 编辑可用，但 revision history migration 尚未应用；在历史记录与回滚可验证前 Published 继续锁定。
        </div>
      ) : !dataReviewSchemaReady ? (
        <div className="schema-banner">
          <strong>审核安全门：</strong> migration 007 尚未完整应用；Editorial Review / Data Review 不可用，Publish Readiness 保持 Blocked。
        </div>
      ) : null}

      {error ? <div className="page-error">{error}</div> : null}

      <div className="workspace">
        <SpeciesGroupSidebar
          groups={speciesGroups}
          selectedId={selectedId}
          batchIds={batchIds}
          search={search}
          onSearch={setSearch}
          category={category}
          onCategory={setCategory}
          onSelect={setSelectedId}
          onToggleBatch={toggleBatch}
        />

        <main className="editor-area">
          <PublishReadinessPanel readiness={publishReadiness} locale={getLocaleLabel(contentLocale)} />
          <DataReviewPanel group={selectedGroup} reviewRows={dataReviewRows} schemaReady={dataReviewSchemaReady} readOnly={isReviewMode}
            onSaved={(row) => setDataReviewRows((current) => ({ ...current, [row.issue_key]: row }))} />
          {contentLocale === 'en' ? (
            <TranslationPanel
              species={selectedSpecies}
              group={selectedGroup}
              sourceVariantRow={sourceVariantRow}
              sourceGroupRow={sourceGroupRow}
              targetVariantRow={englishVariantRow}
              targetGroupRow={englishGroupRow}
              readOnly={isReviewMode}
              accessToken={session?.access_token || ''}
              schemaReady={schemaReady}
              groupSchemaReady={groupSchemaReady}
              onVariantSaved={(row) => {
                setSeoRows((current) => ({ ...current, [seoRowKey(row.catalog_key, row.locale)]: row }));
                setRevisionRefreshKey((current) => current + 1);
              }}
              onGroupSaved={(row) => {
                setGroupSeoRows((current) => ({ ...current, [groupSeoRowKey(row.group_key, row.locale)]: row }));
                setRevisionRefreshKey((current) => current + 1);
              }}
            />
          ) : null}
          <BaseSpeciesSeoEditor
            group={selectedGroup}
            record={selectedGroupPersisted}
            locale={contentLocale}
            schemaReady={groupSchemaReady}
            readOnly={isReviewMode}
            onPreview={(row) => setGroupPreviewRows((current) => ({ ...current, [groupSeoRowKey(row.group_key, row.locale)]: row }))}
            onSaved={(row) => {
              const key = groupSeoRowKey(row.group_key, row.locale);
              setGroupSeoRows((current) => ({ ...current, [key]: row }));
              setGroupPreviewRows((current) => {
                const next = { ...current };
                delete next[key];
                return next;
              });
              setRevisionRefreshKey((current) => current + 1);
            }}
          />
          <div className="revision-grid">
            <RevisionHistoryPanel
              resourceType="species_seo_group"
              resourceKey={selectedGroup?.group_key || ''}
              locale={contentLocale}
              schemaReady={historySchemaReady}
              readOnly={isReviewMode}
              refreshKey={revisionRefreshKey}
              onRestored={(row) => {
                if (!row?.group_key) return;
                const key = groupSeoRowKey(row.group_key, row.locale);
                setGroupSeoRows((current) => ({ ...current, [key]: row }));
                setGroupPreviewRows((current) => {
                  const next = { ...current };
                  delete next[key];
                  return next;
                });
                setRevisionRefreshKey((current) => current + 1);
              }}
            />
            <RevisionHistoryPanel
              resourceType="species_seo"
              resourceKey={selectedSpecies?.catalog_key || ''}
              locale={contentLocale}
              schemaReady={historySchemaReady}
              readOnly={isReviewMode}
              refreshKey={revisionRefreshKey}
              onRestored={(row) => {
                if (!row?.catalog_key) return;
                setSeoRows((current) => ({ ...current, [seoRowKey(row.catalog_key, row.locale)]: row }));
                setRevisionRefreshKey((current) => current + 1);
              }}
            />
          </div>
          {batchGroup && batchMembers.length > 1 ? (
            <BatchSeoEditor
              group={batchGroup}
              groupRecord={batchGroupRecord}
              members={batchMembers}
              existingRows={localeSeoRows}
              locale={contentLocale}
              schemaReady={schemaReady}
              dataReviewRows={dataReviewRows}
              readOnly={isReviewMode}
              onClear={() => setBatchIds([])}
              onSaved={(rows) => {
                setSeoRows((current) => ({
                  ...current,
                  ...Object.fromEntries(rows.map((row) => [seoRowKey(row.catalog_key, row.locale), row])),
                }));
                setRevisionRefreshKey((current) => current + 1);
              }}
            />
          ) : null}
          <SeoEditor
            species={selectedSpecies}
            group={selectedGroup}
            groupRecord={selectedGroupRecord}
            record={selectedVariantRecord}
            locale={contentLocale}
            schemaReady={schemaReady}
            dataReviewRows={dataReviewRows}
            readOnly={isReviewMode}
            onSaved={(row) => {
              setSeoRows((current) => ({ ...current, [seoRowKey(row.catalog_key, row.locale)]: row }));
              setRevisionRefreshKey((current) => current + 1);
            }}
          />
        </main>
      </div>
    </div>
  );
}
