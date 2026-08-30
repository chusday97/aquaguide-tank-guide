import { useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from './supabase.js';
import SpeciesGroupSidebar from './SpeciesGroupSidebar.jsx';
import BatchSeoEditor from './BatchSeoEditor.jsx';
import BaseSpeciesSeoEditor from './BaseSpeciesSeoEditor.jsx';
import TranslationPanel from './TranslationPanel.jsx';
import DataReviewPanel from './DataReviewPanel.jsx';
import LiveFrontendPreview from './LiveFrontendPreview.jsx';
import { useAppLanguage } from './AppLanguage.jsx';
import { loadProductTruth } from './productTruthLoader.js';
import RevisionHistoryPanel from './RevisionHistoryPanel.jsx';
import PublishReadinessPanel from './PublishReadinessPanel.jsx';
import WorkflowOverview from './WorkflowOverview.jsx';
import { resolveEffectiveSeo } from './seoInheritance.js';
import { catalogSpecies, speciesGroups, speciesGroupByMemberId } from './speciesGroups.js';
import { CONTENT_LOCALES, seoRowKey, groupSeoRowKey, getLocaleLabel, isEnglishLocale } from './localization.js';
import { buildSpeciesSeoRouteMeta, INDEX_STRATEGIES } from './seoRouteContract.js';
import { REVIEW_STATES, assessPublishReadiness, buildAdminWorkflowOverview, buildControlledPreviewSnapshot, dataReviewMap, getIndexReviewBlockReason } from './publishReadiness.js';

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

function InterfaceLanguageSwitch() {
  const { appLocale, setAppLocale, t } = useAppLanguage();
  return (
    <div className="app-language-switch" aria-label={t('top.interfaceLanguage')}>
      <button type="button" className={appLocale === 'zh-CN' ? 'active' : ''} onClick={() => setAppLocale('zh-CN')}>中文</button>
      <button type="button" className={appLocale === 'en' ? 'active' : ''} onClick={() => setAppLocale('en')}>EN</button>
    </div>
  );
}

function Login({ onSignedIn }) {
  const { appLocale, t } = useAppLanguage();
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
        <div className="login-language-row"><InterfaceLanguageSwitch /></div>
        <div className="brand-mark">A</div>
        <p className="eyebrow">AQUAGUIDE · PRIVATE</p>
        <h1>Content Admin</h1>
        <p className="muted">{appLocale === 'en' ? 'Admin access only. This workspace manages and reviews Species SEO content.' : '仅管理员可访问。当前版本用于 Species SEO 内容管理验证。'}</p>
        <form onSubmit={submit} className="login-form">
          <label>
            {appLocale === 'en' ? 'Admin email' : '管理员邮箱'}
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </label>
          <label>
            {appLocale === 'en' ? 'Password' : '密码'}
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
          </label>
          {error ? <div className="error-box">{error}</div> : null}
          <button className="primary-button" type="submit" disabled={busy}>{busy ? (appLocale === 'en' ? 'Signing in…' : '正在验证…') : (appLocale === 'en' ? 'Sign in' : '登录后台')}</button>
        </form>
        <p className="security-note">{appLocale === 'en' ? 'Access is enforced by Supabase Auth + user_roles + RLS, not by hiding the page URL.' : '访问控制由 Supabase Auth + user_roles + RLS 执行，不依赖隐藏页面地址。'}</p>
      </section>
    </main>
  );
}

function Forbidden({ email, onSignOut }) {
  const { appLocale, t } = useAppLanguage();
  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="login-language-row"><InterfaceLanguageSwitch /></div>
        <div className="brand-mark danger">!</div>
        <p className="eyebrow">ACCESS DENIED</p>
        <h1>{appLocale === 'en' ? 'Admin access required' : '没有管理员权限'}</h1>
        <p className="muted">{appLocale === 'en' ? `${email || 'Current account'} is signed in, but user_roles.role is not admin.` : `${email || '当前账号'} 已登录，但 user_roles.role 不是 admin。`}</p>
        <button className="secondary-button" type="button" onClick={onSignOut}>{appLocale === 'en' ? 'Sign out' : '退出账号'}</button>
      </section>
    </main>
  );
}

function SeoEditor({ species, group, groupRecord, record, locale = 'zh-CN', schemaReady, dataReviewRows = {}, readOnly = false, onSaved, onLivePreviewChange, selectedInspectorElement, onInspectorSelect }) {
  const { appLocale, t } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const [form, setForm] = useState(emptySeo);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [overrideEditing, setOverrideEditing] = useState({});

  useEffect(() => {
    setForm(fromSeoRow(record, species, locale));
    setOverrideEditing({});
  }, [record, species, locale]);

  useEffect(() => {
    setMessage('');
  }, [species?.id]);

  useEffect(() => {
    if (!selectedInspectorElement) return;
    if (selectedInspectorElement === 'localizedName' && !isEnglishLocale(locale)) return;
    const frame = requestAnimationFrame(() => {
      const target = document.querySelector(`[data-editor-field="${selectedInspectorElement}"]`);
      target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedInspectorElement, species?.id, locale]);

  const editorFieldProps = (key) => ({
    'data-editor-field': key,
    className: `inspector-editor-field ${selectedInspectorElement === key ? 'is-inspector-selected' : ''}`,
  });

  const hasSpecies = Boolean(species);
  const resolvedSeo = hasSpecies ? resolveEffectiveSeo({
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
  }) : { effective: null, inherited: {}, override: {} };
  const effectiveSeo = resolvedSeo.effective;
  const routeMeta = hasSpecies ? buildSpeciesSeoRouteMeta({
    member: species,
    group,
    locale,
    indexStrategy: form.indexStrategy,
    canonicalCatalogKey: form.canonicalCatalogKey,
  }) : null;
  const groupMember = group?.members?.find((item) => item.catalog_key === species?.catalog_key) || null;
  const reviewIndexBlockReason = hasSpecies ? getIndexReviewBlockReason({
    species, group, indexStrategy: form.indexStrategy, canonicalCatalogKey: form.canonicalCatalogKey, reviewRows: dataReviewRows,
  }) : '';
  const indexBlockReason = reviewIndexBlockReason || (routeMeta && !routeMeta.publishReady
    ? '选择 Canonical to sibling 后必须指定同一 Base Species 内的目标记录。'
    : '');

  useEffect(() => {
    if (!hasSpecies || !effectiveSeo || !routeMeta) {
      onLivePreviewChange?.(null);
      return;
    }
    onLivePreviewChange?.({
      species,
      locale,
      routeMeta,
      effectiveSeo: { ...effectiveSeo, imageAlt: form.imageAlt },
      override: resolvedSeo.override,
    });
  }, [
    species?.catalog_key, locale, effectiveSeo?.seoTitle, effectiveSeo?.metaDescription, effectiveSeo?.h1,
    effectiveSeo?.sharedIntro, effectiveSeo?.variantIntro, effectiveSeo?.displayName, routeMeta?.selfPath,
    routeMeta?.canonicalPath, routeMeta?.robots, form.imageAlt, resolvedSeo?.override?.seoTitle,
    resolvedSeo?.override?.metaDescription, resolvedSeo?.override?.h1, onLivePreviewChange,
  ]);

  if (!species) {
    return (
      <section className="editor-empty">
        <div className="empty-icon">↖</div>
        <h2>{isUiEnglish ? 'Select a Species' : '选择一个 Species'}</h2>
        <p>{isUiEnglish ? 'Choose a Species from the left navigation to begin editing.' : '从左侧列表选择鱼种，开始编辑 SEO 内容。'}</p>
      </section>
    );
  }

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const startOverride = (key) => {
    setOverrideEditing((current) => ({ ...current, [key]: true }));
    onInspectorSelect?.(key);
    requestAnimationFrame(() => document.querySelector(`[data-editor-override="${key}"]`)?.focus());
  };
  const useBaseValue = (key) => {
    update(key, '');
    setOverrideEditing((current) => ({ ...current, [key]: false }));
    onInspectorSelect?.(key);
  };
  const renderInheritedOverrideField = ({ key, label, value, inheritedValue, maxLength, rows }) => {
    const custom = Boolean(value);
    const editing = custom || Boolean(overrideEditing[key]);
    return (
      <div {...editorFieldProps(key)} onClick={() => onInspectorSelect?.(key)}>
        <div className="inheritance-field-heading">
          <span>{label}</span>
          <span className={`inheritance-state ${custom ? 'custom' : 'inherited'}`}>{custom ? (isUiEnglish ? 'Custom' : '自定义') : (isUiEnglish ? 'Inherited' : '继承')}</span>
        </div>
        {!editing ? (
          <div className="inherited-field-view">
            <div className="inherited-field-value">{inheritedValue || '—'}</div>
            <div className="inherited-field-footer">
              <span>{isUiEnglish ? `Inherited from ${group?.base_scientific_name || 'Base Species'}` : `继承自 ${group?.base_scientific_name || 'Base Species'}`}</span>
              <button type="button" onClick={() => startOverride(key)}>{isUiEnglish ? 'Override' : '单独编辑'}</button>
            </div>
          </div>
        ) : (
          <>
            {rows ? (
              <textarea aria-label={label} data-editor-override={key} rows={rows} value={value} maxLength={maxLength} placeholder={inheritedValue} onFocus={() => onInspectorSelect?.(key)} onChange={(event) => update(key, event.target.value)} />
            ) : (
              <input aria-label={label} data-editor-override={key} value={value} maxLength={maxLength} placeholder={inheritedValue} onFocus={() => onInspectorSelect?.(key)} onChange={(event) => update(key, event.target.value)} />
            )}
            <div className="override-field-footer">
              <span>{custom ? (isUiEnglish ? 'Custom for this page' : '当前页面自定义') : (isUiEnglish ? 'Type to create an override' : '输入内容后建立 Override')}</span>
              <button type="button" onClick={() => useBaseValue(key)}>{custom ? (isUiEnglish ? 'Use Base value' : '使用 Base 值') : (isUiEnglish ? 'Cancel' : '取消')}</button>
            </div>
          </>
        )}
      </div>
    );
  };
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
          <span className={`status-pill ${species.status}`}>{isUiEnglish ? 'Species' : '物种'}: {species.status}</span>
          <span className={`status-pill ${form.status}`}>SEO: {form.status}</span>
          <span className={`status-pill ${form.reviewState}`}>{isUiEnglish ? 'Review' : '审核'}: {form.reviewState}</span>
          {group?.member_count > 1 ? <span className="status-pill inherited">{resolvedSeo.override.seoTitle ? (isUiEnglish ? 'TITLE: OVERRIDE' : '标题：自定义') : (isUiEnglish ? 'TITLE: INHERITED' : '标题：继承')}</span> : null}
        </div>
      </div>

      <div className="editor-grid">
        <div className="form-column">
          <div className="section-card">
            <div className="section-heading">
              <div>
                <h3>{t('editor.seo')}</h3>
                <p>{isUiEnglish ? 'Edit search appearance and page headings without changing Product Truth.' : '控制搜索结果和页面主标题，不修改产品数据。'}</p>
              </div>
            </div>
            {isEnglishLocale(locale) ? (
              <label {...editorFieldProps('localizedName')}>
                English Common Name
                <input value={form.localizedName} placeholder={isUiEnglish ? 'e.g. Cherry Shrimp' : '例如 Cherry Shrimp'} onFocus={() => onInspectorSelect?.('localizedName')} onChange={(event) => update('localizedName', event.target.value)} />
                <small className="inherit-note">{isUiEnglish ? 'Only affects the English editorial layer; Product Truth names remain unchanged.' : '只影响 English 内容层；不会改 Product Truth 里的中文名称。'}</small>
              </label>
            ) : null}
            {renderInheritedOverrideField({
              key: 'seoTitle', label: t('editor.metaTitle'), value: form.seoTitle, inheritedValue: resolvedSeo.inherited.seoTitle, maxLength: 120,
            })}
            {renderInheritedOverrideField({
              key: 'metaDescription', label: t('editor.metaDescription'), value: form.metaDescription, inheritedValue: resolvedSeo.inherited.metaDescription, maxLength: 320, rows: 3,
            })}
            {renderInheritedOverrideField({
              key: 'h1', label: t('editor.h1'), value: form.h1, inheritedValue: resolvedSeo.inherited.h1,
            })}
            <label>
              {t('editor.focusKeyword')}
              <input value={form.focusKeyword} onChange={(event) => update('focusKeyword', event.target.value)} />
            </label>
          </div>

          <div className="section-card">
            <div className="section-heading">
              <div>
                <h3>{t('editor.pageContent')}</h3>
                <p>{isUiEnglish ? 'Edit the core editorial content for this page.' : '编辑这个页面最核心的内容。'}</p>
              </div>
            </div>
            {group?.member_count > 1 ? (
              <div className="inherit-content-preview">
                <strong>{t('editor.sharedIntro')}</strong>
                <p>{effectiveSeo.sharedIntro || (isUiEnglish ? 'No shared Base Species introduction yet.' : 'Base Species 尚未填写共享简介。')}</p>
              </div>
            ) : null}
            <label {...editorFieldProps('intro')}>
              {t('editor.variantIntro')}
              <textarea rows="6" value={form.intro} onFocus={() => onInspectorSelect?.('intro')} onChange={(event) => update('intro', event.target.value)} placeholder={isUiEnglish ? 'Describe only Variant-specific differences; keep shared care content in Base Species.' : '只写这个变种独有的颜色、选育、表现或注意事项；共同饲养信息留在 Base Species。'} />
            </label>
            <label {...editorFieldProps('imageAlt')}>
              {t('editor.imageAlt')}
              <input value={form.imageAlt} onFocus={() => onInspectorSelect?.('imageAlt')} onChange={(event) => update('imageAlt', event.target.value)} />
            </label>
          </div>

          <div className="section-card">
            <div className="section-heading">
              <div>
                <h3>{t('editor.indexUrl')}</h3>
                <p>{isUiEnglish ? 'Public paths are derived from stable catalog identity; Canonical is not free text.' : '公开路径由稳定 catalog key + Base Scientific Name 推导，不再手填 Canonical。'}</p>
              </div>
            </div>
            <label>{t('editor.indexStrategy')}
              <select value={form.indexStrategy} onChange={(event) => update('indexStrategy', event.target.value)}>
                {INDEX_STRATEGIES.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                    disabled={(group?.category_conflict && item.value !== 'noindex') || (groupMember?.duplicate_peer_keys?.length && item.value === 'index') || (item.value === 'canonical_to_sibling' && group?.member_count < 2)}
                  >{isUiEnglish ? item.label.split(' / ')[0] : (item.label.split(' / ')[1] || item.label)}</option>
                ))}
              </select>
            </label>
            {form.indexStrategy === 'canonical_to_sibling' ? (
              <label>{t('editor.canonicalTarget')}
                <select value={form.canonicalCatalogKey} onChange={(event) => update('canonicalCatalogKey', event.target.value)}>
                  <option value="">{isUiEnglish ? 'Select the canonical page in this Base group' : '请选择同组主页面'}</option>
                  {(group?.members || []).filter((item) => item.catalog_key !== species.catalog_key).map((item) => (
                    <option key={item.catalog_key} value={item.catalog_key}>{item.name} · {item.catalog_key}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <div className="route-inline-summary">
              <span>{t('editor.publicUrl')}</span><code>{routeMeta.selfPath}</code>
              <span>{t('editor.canonical')}</span><code>{routeMeta.canonicalPath}</code>
            </div>
            <small className="inherit-note">静态 Species HTML 生成器已通过本地回归，但尚未连接 staging/public 发布链；选择 Index 仍不会自动上线。</small>
          </div>
        </div>

      </div>

      <div className="editor-footer">
        <div>
          {!schemaReady ? <span className="warning-text">Schema 未应用：保存会被阻止</span> : null}
          {indexBlockReason ? <span className="warning-text">{indexBlockReason}</span> : null}
          {message ? <span className="save-message">{message}</span> : null}
        </div>
        <div className="footer-actions">
          <select value={form.reviewState} onChange={(event) => update('reviewState', event.target.value)} aria-label="Editorial review state">
            {REVIEW_STATES.map((item) => <option key={item.value} value={item.value}>{isUiEnglish ? item.label : ({ editing: '编辑中', ready_for_review: '待审核', approved: '已审核' }[item.value] || item.label)}</option>)}
          </select>
          <select value={form.status} onChange={(event) => update('status', event.target.value)} aria-label="SEO status">
            <option value="draft">Draft</option>
            <option value="published" disabled={!isPublicSpeciesPublishingEnabled}>{isUiEnglish ? 'Published (Production integration locked)' : 'Published（Production 发布锁定）'}</option>
            <option value="archived">Archived</option>
          </select>
          <button className="primary-button compact" type="button" onClick={save} disabled={saving || readOnly || Boolean(indexBlockReason)}>{readOnly ? (isUiEnglish ? 'Read-only preview' : '只读预览') : saving ? t('common.saving') : `${t('common.save')} ${getLocaleLabel(locale)} SEO`}</button>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const { appLocale, t } = useAppLanguage();
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
  const [workflowFilter, setWorkflowFilter] = useState(null);
  const [editorScope, setEditorScope] = useState('variant');
  const [livePreview, setLivePreview] = useState(null);
  const [selectedProductTruth, setSelectedProductTruth] = useState(null);
  const [selectedInspectorElement, setSelectedInspectorElement] = useState(null);

  useEffect(() => { setLivePreview(null); }, [selectedId, contentLocale, editorScope]);
  useEffect(() => { setSelectedInspectorElement(null); }, [selectedId, contentLocale]);

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
  useEffect(() => {
    let cancelled = false;
    setSelectedProductTruth(null);
    if (!selectedSpecies?.catalog_key) return () => { cancelled = true; };
    loadProductTruth(selectedSpecies.catalog_key)
      .then((row) => { if (!cancelled) setSelectedProductTruth(row); })
      .catch(() => { if (!cancelled) setSelectedProductTruth(null); });
    return () => { cancelled = true; };
  }, [selectedSpecies?.catalog_key]);
  const previewSpecies = selectedSpecies && selectedProductTruth
    ? { ...selectedSpecies, ...selectedProductTruth }
    : selectedSpecies;
  const selectedGroup = selectedSpecies ? speciesGroupByMemberId.get(selectedSpecies.id) : null;
  const selectedGroupKey = selectedGroup ? groupSeoRowKey(selectedGroup.group_key, contentLocale) : null;
  const selectedGroupPersisted = selectedGroupKey ? groupSeoRows[selectedGroupKey] : null;
  const selectedGroupRecord = selectedGroupKey
    ? groupPreviewRows[selectedGroupKey] || selectedGroupPersisted
    : null;
  const selectedVariantRecord = selectedSpecies ? seoRows[seoRowKey(selectedSpecies.catalog_key, contentLocale)] : null;
  const savedLivePreview = useMemo(() => {
    if (!selectedSpecies || !selectedGroup) return null;
    const resolved = resolveEffectiveSeo({
      member: selectedSpecies, group: selectedGroup, groupRow: selectedGroupRecord, variantRow: selectedVariantRecord, locale: contentLocale,
    });
    const routeMeta = buildSpeciesSeoRouteMeta({
      member: selectedSpecies, group: selectedGroup, locale: contentLocale,
      indexStrategy: selectedVariantRecord?.index_strategy || 'noindex',
      canonicalCatalogKey: selectedVariantRecord?.canonical_catalog_key || '',
    });
    return {
      species: previewSpecies, locale: contentLocale, routeMeta,
      effectiveSeo: { ...resolved.effective, imageAlt: selectedVariantRecord?.image_alt || '' },
      override: resolved.override,
    };
  }, [selectedSpecies, previewSpecies, selectedGroup, selectedGroupRecord, selectedVariantRecord, contentLocale]);
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
  const workflowOverview = useMemo(() => buildAdminWorkflowOverview({ species, groups: speciesGroups, seoRows, groupSeoRows, reviewRows: dataReviewRows }), [species, seoRows, groupSeoRows, dataReviewRows]);
  const activeLivePreview = editorScope === 'variant' && livePreview?.species?.catalog_key === selectedSpecies?.catalog_key && livePreview?.locale === contentLocale
    ? { ...livePreview, species: previewSpecies || livePreview.species }
    : savedLivePreview;
  const handleInspectorSelect = (key) => {
    setSelectedInspectorElement(key);
    const variantOnly = key === 'imageAlt' || (key === 'localizedName' && contentLocale === 'en');
    const variantOverride = Boolean(activeLivePreview?.override?.[key]);
    if (editorScope === 'base' && (variantOnly || variantOverride)) setEditorScope('variant');
  };
  const workflowScope = useMemo(() => {
    if (!workflowFilter) return { groupKeys: null, memberIds: null };
    if (workflowFilter.type === 'data') {
      return { groupKeys: new Set(workflowOverview.dataReview.groupKeysByStatus[workflowFilter.status] || []), memberIds: null };
    }
    const memberIds = new Set(workflowOverview.locales[workflowFilter.locale]?.memberIdsByState[workflowFilter.status] || []);
    const groupKeys = new Set();
    for (const id of memberIds) { const group = speciesGroupByMemberId.get(id); if (group) groupKeys.add(group.group_key); }
    return { groupKeys, memberIds };
  }, [workflowFilter, workflowOverview]);

  const applyWorkflowFilter = (next) => {
    setWorkflowFilter(next);
    if (!next) return;
    if (next.type === 'readiness') {
      const firstId = workflowOverview.locales[next.locale]?.memberIdsByState[next.status]?.[0];
      if (firstId) { setSelectedId(firstId); setEditorScope('variant'); }
      return;
    }
    const firstGroupKey = workflowOverview.dataReview.groupKeysByStatus[next.status]?.[0];
    const firstGroup = speciesGroups.find((group) => group.group_key === firstGroupKey);
    if (firstGroup?.members?.[0]?.id) { setSelectedId(firstGroup.members[0].id); setEditorScope('variant'); }
  };

  const batchMembers = batchIds.map((id) => species.find((item) => item.id === id)).filter(Boolean);
  const batchGroup = batchMembers.length ? speciesGroupByMemberId.get(batchMembers[0].id) : null;
  const batchGroupKey = batchGroup ? groupSeoRowKey(batchGroup.group_key, contentLocale) : null;
  const batchGroupRecord = batchGroupKey
    ? groupPreviewRows[batchGroupKey] || groupSeoRows[batchGroupKey]
    : null;

  const exportPreviewSnapshot = () => {
    if (!selectedSpecies || !selectedGroup || publishReadiness?.state !== 'publish_ready' || isReviewMode) return;
    const snapshot = buildControlledPreviewSnapshot({
      species: selectedSpecies,
      group: selectedGroup,
      variantRows: [sourceVariantRow, englishVariantRow],
      groupRows: [sourceGroupRow, englishGroupRow],
      reviewRows: dataReviewRows,
    });
    const blob = new Blob([`${JSON.stringify(snapshot, null, 2)}\n`], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${selectedSpecies.catalog_key}-preview-snapshot.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  };

  const toggleBatch = (id) => {
    const nextGroup = speciesGroupByMemberId.get(id);
    setSelectedId(id);
    setEditorScope('variant');
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
            <strong>{t('top.product')}</strong>
            <span>{t('top.section')}</span>
          </div>
        </div>
        <nav className="topbar-workflow" aria-label="Workflow queues">
          <button type="button" className={`workflow-status workflow-status-issue ${workflowFilter?.key === 'data:pending' ? 'active' : ''}`} onClick={() => applyWorkflowFilter({ key: 'data:pending', type: 'data', status: 'pending', label: 'Data Review · 待处理' })}>{t('top.dataReview')} <b>{workflowOverview.dataReview.pending}</b></button>
          <button type="button" className={`workflow-status workflow-status-review ${workflowFilter?.key === `${contentLocale}:ready_for_review` ? 'active' : ''}`} onClick={() => applyWorkflowFilter({ key: `${contentLocale}:ready_for_review`, type: 'readiness', locale: contentLocale, status: 'ready_for_review', label: `${getLocaleLabel(contentLocale)} · Ready for Review` })}>{t('top.awaiting')} <b>{workflowOverview.locales[contentLocale].ready_for_review}</b></button>
          <button type="button" className={`workflow-status workflow-status-ready ${workflowFilter?.key === `${contentLocale}:publish_ready` ? 'active' : ''}`} onClick={() => applyWorkflowFilter({ key: `${contentLocale}:publish_ready`, type: 'readiness', locale: contentLocale, status: 'publish_ready', label: `${getLocaleLabel(contentLocale)} · Publish-ready` })}>{t('top.previewReady')} <b>{workflowOverview.locales[contentLocale].publish_ready}</b></button>
        </nav>
        <div className="topbar-actions">
          <span className={`connection-dot ${schemaReady && groupSchemaReady && historySchemaReady && dataReviewSchemaReady ? 'ready' : 'warning'}`}></span>
          <span>{isReviewMode ? t('top.reviewMode') : t('top.admin')}</span>
          <span className="admin-email">{session.user.email}</span>
          <InterfaceLanguageSwitch />
          <button className="ghost-button" type="button" onClick={signOut}>{t('top.signOut')}</button>
        </div>
      </header>

      {isReviewMode ? (
        <div className="schema-banner">
          <strong>只读 UI Review：</strong> 当前远程预览不连接任何 Supabase 写入环境。可以搜索 486 条 Species、体验编辑器和实时前端 Preview，但保存被硬禁用。
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

      <div className="workspace studio-workspace">
        <SpeciesGroupSidebar
          groups={speciesGroups}
          selectedId={selectedId}
          selectedScope={editorScope}
          batchIds={batchIds}
          search={search}
          onSearch={setSearch}
          category={category}
          onCategory={setCategory}
          onSelect={(id) => { setSelectedId(id); setEditorScope('variant'); }}
          onSelectBase={(id) => { setSelectedId(id); setEditorScope('base'); }}
          onToggleBatch={toggleBatch}
          workflowFilter={workflowFilter}
          workflowGroupKeys={workflowScope.groupKeys}
          workflowMemberIds={workflowScope.memberIds}
          onClearWorkflowFilter={() => setWorkflowFilter(null)}
          workflowOverview={workflowOverview}
          locale={contentLocale}
          onWorkflowFilter={applyWorkflowFilter}
        />

        <main className="editor-area studio-editor-area">
          <div className="editor-context-bar">
            <div className="editor-scope-switch" aria-label="Editor scope">
              <button type="button" className={editorScope === 'base' ? 'active' : ''} onClick={() => setEditorScope('base')}>{t('editor.base')}</button>
              <button type="button" className={editorScope === 'variant' ? 'active' : ''} onClick={() => setEditorScope('variant')}>{t('editor.currentPage')}</button>
            </div>
            <div className="locale-switcher compact" aria-label="Content language">
              {CONTENT_LOCALES.map((item) => (
                <button key={item.code} type="button" className={contentLocale === item.code ? 'active' : ''} onClick={() => setContentLocale(item.code)}>{item.label}</button>
              ))}
            </div>
          </div>

          {editorScope === 'base' ? (
            <BaseSpeciesSeoEditor
              group={selectedGroup}
              record={selectedGroupPersisted}
              locale={contentLocale}
              schemaReady={groupSchemaReady}
              readOnly={isReviewMode}
              onPreview={(row) => setGroupPreviewRows((current) => ({ ...current, [groupSeoRowKey(row.group_key, row.locale)]: row }))}
              selectedInspectorElement={selectedInspectorElement}
              onInspectorSelect={handleInspectorSelect}
              onSaved={(row) => {
                const key = groupSeoRowKey(row.group_key, row.locale);
                setGroupSeoRows((current) => ({ ...current, [key]: row }));
                setGroupPreviewRows((current) => { const next = { ...current }; delete next[key]; return next; });
                setRevisionRefreshKey((current) => current + 1);
              }}
            />
          ) : (
            <SeoEditor
              species={selectedSpecies}
              group={selectedGroup}
              groupRecord={selectedGroupRecord}
              record={selectedVariantRecord}
              locale={contentLocale}
              schemaReady={schemaReady}
              dataReviewRows={dataReviewRows}
              readOnly={isReviewMode}
              onLivePreviewChange={setLivePreview}
              selectedInspectorElement={selectedInspectorElement}
              onInspectorSelect={handleInspectorSelect}
              onSaved={(row) => {
                setSeoRows((current) => ({ ...current, [seoRowKey(row.catalog_key, row.locale)]: row }));
                setRevisionRefreshKey((current) => current + 1);
              }}
            />
          )}

          <div className="editor-secondary-tools">
            {(selectedGroup?.category_conflict || selectedGroup?.duplicate_count > 0) ? (
              <details className="studio-tool-disclosure" open>
                <summary>{t('editor.sourceReview')} <span>{appLocale === 'en' ? 'This Species has unresolved source-data evidence' : '当前 Species 存在待确认的数据证据'}</span></summary>
                <DataReviewPanel group={selectedGroup} reviewRows={dataReviewRows} schemaReady={dataReviewSchemaReady} readOnly={isReviewMode}
                  onSaved={(row) => setDataReviewRows((current) => ({ ...current, [row.issue_key]: row }))} />
              </details>
            ) : null}
            <details className="studio-tool-disclosure">
              <summary>{t('editor.publishCheck')} <span>{publishReadiness?.state || 'blocked'}</span></summary>
              <PublishReadinessPanel readiness={publishReadiness} locale={getLocaleLabel(contentLocale)} readOnly={isReviewMode} onExportPreview={exportPreviewSnapshot} />
            </details>
            {contentLocale === 'en' ? (
              <details className="studio-tool-disclosure">
                <summary>{t('editor.translation')} <span>{appLocale === 'en' ? 'Chinese source → English Draft' : '中文 Source → English Draft'}</span></summary>
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
              </details>
            ) : null}
            {batchGroup && batchMembers.length > 1 ? (
              <details className="studio-tool-disclosure">
                <summary>{t('editor.batchSeo')} <span>{batchMembers.length} {appLocale === 'en' ? 'records in this group' : '条同组记录'}</span></summary>
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
                    setSeoRows((current) => ({ ...current, ...Object.fromEntries(rows.map((row) => [seoRowKey(row.catalog_key, row.locale), row])) }));
                    setRevisionRefreshKey((current) => current + 1);
                  }}
                />
              </details>
            ) : null}
            <details className="studio-tool-disclosure">
              <summary>{t('editor.history')} <span>Base / Variant revision</span></summary>
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
                    setGroupPreviewRows((current) => { const next = { ...current }; delete next[key]; return next; });
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
            </details>
            <details className="studio-tool-disclosure workflow-disclosure">
              <summary>{t('editor.workflow')} <span>Data Review / Editorial / Preview-ready</span></summary>
              <WorkflowOverview overview={workflowOverview} activeFilter={workflowFilter} onFilter={applyWorkflowFilter} />
            </details>
          </div>
        </main>

        <LiveFrontendPreview
          preview={activeLivePreview}
          readiness={publishReadiness}
          readOnly={isReviewMode}
          onGeneratePreview={exportPreviewSnapshot}
          selectedElement={selectedInspectorElement}
          onSelectElement={handleInspectorSelect}
          editorScope={editorScope}
        />
      </div>
    </div>
  );
}
