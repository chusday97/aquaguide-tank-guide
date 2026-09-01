import { useEffect, useMemo, useState } from 'react';
import { adminContentClient, getRepoBackendHealth, isAdminBackendConfigured, isRepoBackend, publishRepoStaging } from './adminBackend.js';
import SpeciesGroupSidebar from './SpeciesGroupSidebar.jsx';
import BatchSeoEditor from './BatchSeoEditor.jsx';
import BulkImportPanel from './BulkImportPanel.jsx';
import ActivityCenter from './ActivityCenter.jsx';
import BaseSpeciesSeoEditor from './BaseSpeciesSeoEditor.jsx';
import TranslationPanel from './TranslationPanel.jsx';
import DataReviewPanel from './DataReviewPanel.jsx';
import LiveFrontendPreview from './LiveFrontendPreview.jsx';
import { useAppLanguage } from './AppLanguage.jsx';
import { loadProductTruth } from './productTruthLoader.js';
import RevisionHistoryPanel from './RevisionHistoryPanel.jsx';
import PublishReadinessPanel from './PublishReadinessPanel.jsx';
import WorkflowOverview from './WorkflowOverview.jsx';
import EditorToolDrawer from './EditorToolDrawer.jsx';
import { getEditorElementMeta } from './editorElementRegistry.js';
import { resolveEffectiveSeo } from './seoInheritance.js';
import { catalogSpecies, speciesGroups, speciesGroupByMemberId } from './speciesGroups.js';
import { CONTENT_LOCALES, seoRowKey, groupSeoRowKey, getLocaleLabel, isEnglishLocale } from './localization.js';
import { buildSpeciesSeoRouteMeta, INDEX_STRATEGIES } from './seoRouteContract.js';
import { assessDataReview, assessPublishReadiness, buildAdminWorkflowOverview, buildControlledPreviewSnapshot, dataReviewMap, getIndexReviewBlockReason } from './publishReadiness.js';

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

const EDITORIAL_FORM_KEYS = ['localizedName', 'seoTitle', 'metaDescription', 'h1', 'intro', 'imageAlt', 'indexStrategy', 'canonicalCatalogKey', 'focusKeyword'];

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
  const [email, setEmail] = useState('admin@aquaguide.local');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const { data, error: signInError } = await adminContentClient.auth.signInWithPassword({ email, password });
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
        <h1>Species SEO Admin</h1>
        <p className="muted">{appLocale === 'en' ? 'Admin access only. This workspace manages and reviews Species SEO content.' : '仅管理员可访问。当前版本用于 Species SEO 内容管理验证。'}</p>
        <form onSubmit={submit} className="login-form">
          <label>
            {appLocale === 'en' ? 'Admin email' : '管理员邮箱'}
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" />
          </label>
          <label>
            {appLocale === 'en' ? 'Password' : '密码'}
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
          </label>
          {error ? <div className="error-box">{error}</div> : null}
          <button className="primary-button" type="submit" disabled={busy}>{busy ? (appLocale === 'en' ? 'Signing in…' : '正在验证…') : (appLocale === 'en' ? 'Sign in' : '登录后台')}</button>
        </form>
        <p className="security-note">{appLocale === 'en' ? 'Admin account is prefilled. Paste your current Admin password; access uses a server-side session and secrets never enter the browser.' : '管理员账号已自动填好，只需粘贴当前后台密码；访问由服务端 Session 控制，GitHub Token 不进入浏览器。'}</p>
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
        <p className="muted">{appLocale === 'en' ? `${email || 'Current account'} is signed in, but this Repo Admin session is not authorized.` : `${email || '当前账号'} 已登录，但当前 Repo Admin Session 没有管理员权限。`}</p>
        <button className="secondary-button" type="button" onClick={onSignOut}>{appLocale === 'en' ? 'Sign out' : '退出账号'}</button>
      </section>
    </main>
  );
}

function SeoEditor({ species, group, groupRecord, record, locale = 'zh-CN', schemaReady, dataReviewRows = {}, readOnly = false, onSaved, onLivePreviewChange, selectedInspectorElement, onInspectorSelect, onDirtyChange, publishReadinessState = 'blocked', stagingPublishing = false, stagingMessage = '', onPublishStaging, onOpenReadiness }) {
  const { appLocale, t } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const [form, setForm] = useState(emptySeo);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [overrideEditing, setOverrideEditing] = useState({});

  useEffect(() => {
    setForm(fromSeoRow(record, species, locale));
    setOverrideEditing({});
    onDirtyChange?.(false);
  }, [record, species, locale, onDirtyChange]);

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

  const baselineForm = fromSeoRow(record, species, locale);
  const contentDirty = !readOnly && EDITORIAL_FORM_KEYS.some((key) => String(form[key] ?? '') !== String(baselineForm[key] ?? ''));
  const isDirty = !readOnly && JSON.stringify(form) !== JSON.stringify(baselineForm);
  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);

  if (!species) {
    return (
      <section className="editor-empty">
        <div className="empty-icon">↖</div>
        <h2>{isUiEnglish ? 'Select a Species' : '选择一个 Species'}</h2>
        <p>{isUiEnglish ? 'Choose a Species from the left navigation to begin editing.' : '从左侧列表选择鱼种，开始编辑 SEO 内容。'}</p>
      </section>
    );
  }

  const update = (key, value) => setForm((current) => ({
    ...current,
    [key]: value,
    ...(EDITORIAL_FORM_KEYS.includes(key) ? { reviewState: 'editing' } : {}),
  }));
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
  const sourceFields = [
    { key: 'seoTitle', label: t('editor.metaTitle'), custom: Boolean(form.seoTitle) },
    { key: 'metaDescription', label: t('editor.metaDescription'), custom: Boolean(form.metaDescription) },
    { key: 'h1', label: t('editor.h1'), custom: Boolean(form.h1) },
  ];
  const customSourceCount = sourceFields.filter((item) => item.custom).length;
  const renderInheritedOverrideField = ({ key, label, value, inheritedValue, maxLength, rows }) => {
    const custom = Boolean(value);
    const editing = custom || Boolean(overrideEditing[key]);
    return (
      <div {...editorFieldProps(key)} onClick={() => onInspectorSelect?.(key)}>
        <div className="inheritance-field-heading"><span>{label}</span></div>
        {!editing ? (
          <div className="inherited-field-view compact-source-view">
            <div className="inherited-field-value">{inheritedValue || '—'}</div>
            <button type="button" className="inline-source-action" onClick={() => startOverride(key)}>{isUiEnglish ? 'Edit for this page' : '单独编辑'}</button>
          </div>
        ) : rows ? (
          <textarea aria-label={label} data-editor-override={key} rows={rows} value={value} maxLength={maxLength} placeholder={inheritedValue} onFocus={() => onInspectorSelect?.(key)} onChange={(event) => update(key, event.target.value)} />
        ) : (
          <input aria-label={label} data-editor-override={key} value={value} maxLength={maxLength} placeholder={inheritedValue} onFocus={() => onInspectorSelect?.(key)} onChange={(event) => update(key, event.target.value)} />
        )}
      </div>
    );
  };
  const save = async (reviewStateOverride = null) => {
    if (!isPublicSpeciesPublishingEnabled && form.status === 'published') {
      setMessage('Species 发布仍锁定：Production 发布未开放，只能保存 Draft。');
      return;
    }
    if (readOnly) {
      setMessage('当前为只读 UI Review，不会向内容存储发送任何写入请求。');
      return;
    }
    if (!schemaReady) {
      setMessage('Repo Content Store 尚未就绪；保存被安全阻止。');
      return;
    }
    setSaving(true);
    setMessage('');
    if (reviewStateOverride) {
      const { data, error } = await adminContentClient
        .from('species_seo')
        .update({ review_state: reviewStateOverride })
        .eq('catalog_key', species.catalog_key)
        .eq('locale', locale)
        .select('*')
        .single();
      setSaving(false);
      if (error) {
        setMessage(error.message || '审核状态更新失败。');
        return;
      }
      setForm((current) => ({ ...current, reviewState: data.review_state }));
      setMessage(reviewStateOverride === 'ready_for_review' ? '已提交审核。' : reviewStateOverride === 'approved' ? '已批准进入预览。' : '已退回编辑。');
      onSaved(data);
      return;
    }
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
    const { data, error } = await adminContentClient
      .from('species_seo')
      .upsert(payload, { onConflict: 'catalog_key,locale' })
      .select('*')
      .single();
    setSaving(false);
    if (error) {
      setMessage(error.message || '保存失败。');
      return;
    }
    setForm(fromSeoRow(data, species, locale));
    setMessage('修改已保存为草稿；如内容发生变化，审核状态会自动回到编辑中。');
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
        <div className="editor-status-cluster" aria-label={isUiEnglish ? 'Current states' : '当前状态'}>
          <div className="editor-status-item">
            <small>{isUiEnglish ? 'Publish status' : '发布状态'}</small>
            <span className="editor-status-value"><span className={`editor-status-dot ${form.status}`}></span><strong>{form.status === 'published' ? (isUiEnglish ? 'Published' : '已发布') : (isUiEnglish ? 'Draft' : '草稿')}</strong></span>
          </div>
          <div className="editor-status-item">
            <small>{isUiEnglish ? 'Review status' : '审核状态'}</small>
            <strong className={`review-status-pill review-${form.reviewState}`}>{isUiEnglish ? ({ editing: 'Editing', ready_for_review: 'Awaiting review', approved: 'Preview approved' }[form.reviewState] || form.reviewState) : ({ editing: '编辑中', ready_for_review: '待审核', approved: '已批准预览' }[form.reviewState] || form.reviewState)}</strong>
          </div>
        </div>
      </div>

      <div className={`workflow-stepper review-${form.reviewState}`} aria-label={isUiEnglish ? 'Editorial workflow' : '内容审核流程'}>
        <div className="workflow-status-block">
          <small className="workflow-section-label">{isUiEnglish ? 'Review progress' : '审核进度'}</small>
          <div className="workflow-stepper-track">
          <span className={form.reviewState === 'editing' ? 'current' : 'done'}><b>1</b>{isUiEnglish ? 'Editing' : '编辑中'}</span>
          <i>→</i>
          <span className={form.reviewState === 'ready_for_review' ? 'current' : form.reviewState === 'approved' ? 'done' : ''}><b>2</b>{isUiEnglish ? 'Awaiting review' : '待审核'}</span>
          <i>→</i>
          <span className={form.reviewState === 'approved' ? 'current' : ''}><b>3</b>{isUiEnglish ? 'Preview approved' : '已批准预览'}</span>
          </div>
        </div>
        <div className="workflow-action-block">
          <small className="workflow-section-label">{isUiEnglish ? 'Available actions' : '可执行操作'}</small>
          <div className="workflow-stepper-action">
          {contentDirty ? (
            <button type="button" className="primary-button compact" disabled={saving || readOnly} onClick={() => save()}>{saving ? t('common.saving') : (isUiEnglish ? 'Save changes' : '保存修改')}</button>
          ) : form.reviewState === 'editing' ? (
            <button type="button" className="primary-button compact" disabled={saving || readOnly} onClick={() => save('ready_for_review')}>{saving ? t('common.saving') : (isUiEnglish ? 'Submit for review' : '提交审核')}</button>
          ) : form.reviewState === 'ready_for_review' ? (
            <>
              <button type="button" className="ghost-button compact" disabled={saving || readOnly} onClick={() => save('editing')}>{isUiEnglish ? 'Back to editing' : '退回编辑'}</button>
              <button type="button" className="primary-button compact" disabled={saving || readOnly} onClick={() => save('approved')}>{saving ? t('common.saving') : (isUiEnglish ? 'Approve Preview' : '批准预览')}</button>
            </>
          ) : publishReadinessState === 'publish_ready' ? (
            <>
              <button type="button" className="ghost-button compact" disabled={saving || readOnly || stagingPublishing} onClick={() => save('editing')}>{isUiEnglish ? 'Back to editing' : '退回编辑'}</button>
              <button type="button" className="primary-button compact staging-action" disabled={readOnly || stagingPublishing} onClick={onPublishStaging}>{stagingPublishing ? (isUiEnglish ? 'Publishing…' : '正在发布…') : (isUiEnglish ? 'Publish to Staging' : '发布到 Staging')}</button>
            </>
          ) : (
            <>
              <button type="button" className="ghost-button compact" disabled={saving || readOnly} onClick={() => save('editing')}>{isUiEnglish ? 'Back to editing' : '退回编辑'}</button>
              <button type="button" className="secondary-button compact" onClick={onOpenReadiness}>{isUiEnglish ? 'View blockers' : '查看发布阻塞项'}</button>
            </>
          )}
          {contentDirty ? <small>{isUiEnglish ? 'Saving content resets approval to Editing.' : '保存内容后会自动退回“编辑中”，避免旧审核结果继续生效。'}</small> : null}
          </div>
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
            <details className="content-source-manager">
              <summary>
                <span><strong>{isUiEnglish ? 'Content source' : '内容来源'}</strong><small>{isUiEnglish ? `${customSourceCount} page-specific · ${sourceFields.length - customSourceCount} from template` : `${customSourceCount} 项本页专用 · ${sourceFields.length - customSourceCount} 项使用模板`}</small></span>
                <em>{isUiEnglish ? 'Manage' : '管理'}</em>
              </summary>
              <div className="content-source-list">
                {sourceFields.map((item) => (
                  <div className="content-source-row" key={item.key}>
                    <span>{item.label}</span>
                    <strong>{item.custom ? (isUiEnglish ? 'This page' : '本页专用') : (isUiEnglish ? 'Base template' : '基础模板')}</strong>
                    <button type="button" onClick={() => item.custom ? useBaseValue(item.key) : startOverride(item.key)}>{item.custom ? (isUiEnglish ? 'Use template' : '改用模板') : (isUiEnglish ? 'Edit this page' : '单独编辑')}</button>
                  </div>
                ))}
              </div>
            </details>
            {renderInheritedOverrideField({
              key: 'seoTitle', label: t('editor.metaTitle'), value: form.seoTitle, inheritedValue: resolvedSeo.inherited.seoTitle, maxLength: 120,
            })}
            {renderInheritedOverrideField({
              key: 'metaDescription', label: t('editor.metaDescription'), value: form.metaDescription, inheritedValue: resolvedSeo.inherited.metaDescription, maxLength: 320, rows: 3,
            })}
            {renderInheritedOverrideField({
              key: 'h1', label: t('editor.h1'), value: form.h1, inheritedValue: resolvedSeo.inherited.h1,
            })}
          </div>

          <div className="section-card">
            <div className="section-heading">
              <div>
                <h3>{t('editor.pageContent')}</h3>
                <p>{isUiEnglish ? 'Edit the core editorial content for this page.' : '编辑这个页面最核心的内容。'}</p>
              </div>
            </div>
            {group?.member_count > 1 ? (
              <details className="inherited-content-disclosure">
                <summary>
                  <span>
                    <strong>{t('editor.sharedIntro')}</strong>
                    <small>{effectiveSeo.sharedIntro ? (isUiEnglish ? 'Shared across this Base Species group' : '来自基础种模板') : (isUiEnglish ? 'Shared content is empty' : '基础种简介尚未填写')}</small>
                  </span>
                  <em>{isUiEnglish ? 'View shared content' : '查看基础种简介'}</em>
                </summary>
                <p>{effectiveSeo.sharedIntro || (isUiEnglish ? 'No shared introduction yet.' : '基础种简介尚未填写。')}</p>
              </details>
            ) : null}
            <label {...editorFieldProps('intro')}>
              {t('editor.variantIntro')}
              <textarea rows="4" value={form.intro} onFocus={() => onInspectorSelect?.('intro')} onChange={(event) => update('intro', event.target.value)} placeholder={isUiEnglish ? 'Add only what is different on this page; do not repeat shared care content.' : '只补充这个品种与基础种不同的信息；共同饲养内容不要重复写。'} />
            </label>
            <label {...editorFieldProps('imageAlt')}>
              {t('editor.imageAlt')}
              <input value={form.imageAlt} onFocus={() => onInspectorSelect?.('imageAlt')} onChange={(event) => update('imageAlt', event.target.value)} />
            </label>
          </div>

          <details className="advanced-seo-disclosure" open={Boolean(indexBlockReason)}>
            <summary>
              <span>
                <strong>{isUiEnglish ? 'Advanced SEO' : '高级 SEO'}</strong>
                <small>{isUiEnglish ? 'Keyword, indexing, canonical and URL settings' : '关键词、收录策略、Canonical 与 URL'}</small>
              </span>
              <em>{form.indexStrategy === 'index' ? (isUiEnglish ? 'Index' : '独立收录') : form.indexStrategy === 'canonical_to_sibling' ? 'Canonical' : 'Noindex'}</em>
            </summary>
            <div className="advanced-seo-body">
              <label>
                {t('editor.focusKeyword')}
                <input value={form.focusKeyword} onChange={(event) => update('focusKeyword', event.target.value)} />
              </label>
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
              {indexBlockReason ? <div className="advanced-seo-warning">{indexBlockReason}</div> : null}
              <small className="inherit-note">{isUiEnglish ? 'The static Species generator is verified, but Production publishing remains locked.' : '静态 Species 生成器已验证；Production 发布仍然锁定。'}</small>
            </div>
          </details>
        </div>

      </div>

      <div className="editor-footer">
        <div>
          {!readOnly && contentDirty ? <span className="unsaved-indicator">{isUiEnglish ? 'Unsaved changes · approval will reset' : '未保存修改 · 保存后需重新审核'}</span> : null}
          {!schemaReady ? <span className="warning-text">Schema 未应用：保存会被阻止</span> : null}
          {message ? <span className="save-message">{message}</span> : null}
          {stagingMessage ? <span className="save-message">{stagingMessage}</span> : null}
        </div>
        <div className="footer-actions">
          <span className={`draft-safety-chip content-${form.status}`} aria-label={isUiEnglish ? 'Content status' : '内容状态'}>{form.status === 'published' ? (isUiEnglish ? 'Published · locked' : 'Published · 已锁定') : (isUiEnglish ? 'Draft · not live' : '草稿 · 不会直接上线')}</span>
          {contentDirty ? <button className="primary-button compact" type="button" onClick={() => save()} disabled={saving || readOnly}>{saving ? t('common.saving') : (isUiEnglish ? 'Save changes' : '保存修改')}</button> : null}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const { appLocale, t } = useAppLanguage();
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);
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
  const [productTruthState, setProductTruthState] = useState({ catalogKey: null, row: null, loading: false, error: false });
  const [selectedInspectorElement, setSelectedInspectorElement] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [compactPreviewOpen, setCompactPreviewOpen] = useState(false);
  const [editorDirty, setEditorDirty] = useState(false);
  const [stagingPublishing, setStagingPublishing] = useState(false);
  const [stagingPublishMessage, setStagingPublishMessage] = useState('');
  const [activityOpen, setActivityOpen] = useState(false);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [activityUnread, setActivityUnread] = useState(0);
  const [operationNotices, setOperationNotices] = useState([]);

  useEffect(() => { setLivePreview(null); }, [selectedId, contentLocale, editorScope]);
  useEffect(() => {
    setSelectedInspectorElement(null);
    setActiveTool(null);
    setCompactPreviewOpen(false);
  }, [selectedId, contentLocale]);

  useEffect(() => {
    const onOperation = (event) => {
      const detail = event.detail || {};
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setOperationNotices((current) => [...current.slice(-2), { id, ...detail }]);
      setActivityRefreshKey((current) => current + 1);
      if (detail.status === 'success' && !activityOpen) setActivityUnread((current) => current + 1);
      window.setTimeout(() => setOperationNotices((current) => current.filter((item) => item.id !== id)), 5200);
    };
    window.addEventListener('aquaguide-admin-operation', onOperation);
    return () => window.removeEventListener('aquaguide-admin-operation', onOperation);
  }, [activityOpen]);

  useEffect(() => {
    if (!editorDirty || isReviewMode) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editorDirty]);

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
    if (!adminContentClient) {
      setAuthChecked(true);
      return undefined;
    }
    Promise.all([
      adminContentClient.auth.getSession(),
      getRepoBackendHealth(),
    ]).then(([{ data }, health]) => {
      setSession(data.session || null);
      setBackendHealth(health?.ok ? health : { ok: false, repo_access_error: health?.error?.message || 'health_unavailable' });
      setAuthChecked(true);
    });
    const { data: listener } = adminContentClient.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
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
      const { data: roleRow, error: roleError } = await adminContentClient
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
      // Product Truth stays repository-owned; the SEO content store only keeps editorial fields.
      setSpecies(catalogSpecies);
      if (!selectedId && catalogSpecies.length) setSelectedId(catalogSpecies[0].id);

      const { data: seoData, error: seoError } = await adminContentClient
        .from('species_seo')
        .select('id,catalog_key,locale,localized_name,seo_title,meta_description,h1,intro,image_alt,canonical_path,focus_keyword,index_strategy,canonical_catalog_key,status,published_at,review_state,reviewed_by,reviewed_at,updated_at,deleted_at,version')
        .is('deleted_at', null);

      if (seoError) {
        setSchemaReady(false);
      } else {
        setSchemaReady(true);
        setSeoRows(Object.fromEntries((seoData || []).map((row) => [seoRowKey(row.catalog_key, row.locale), row])));
      }

      const { data: groupSeoData, error: groupSeoError } = await adminContentClient
        .from('species_seo_groups')
        .select('*')
        .is('deleted_at', null);
      if (groupSeoError) {
        setGroupSchemaReady(false);
      } else {
        setGroupSchemaReady(true);
        setGroupSeoRows(Object.fromEntries((groupSeoData || []).map((row) => [groupSeoRowKey(row.group_key, row.locale), row])));
      }

      const { error: historyError } = await adminContentClient
        .from('content_revisions')
        .select('id')
        .limit(1);
      setHistorySchemaReady(!historyError);

      const { data: reviewData, error: reviewError } = await adminContentClient
        .from('species_data_reviews')
        .select('*');
      setDataReviewSchemaReady(!reviewError);
      setDataReviewRows(reviewError ? {} : dataReviewMap(reviewData || []));
      setLoading(false);
    };

    loadAdminData();
  }, [session]);

  useEffect(() => {
    if (!session || role !== 'admin' || isReviewMode) return undefined;
    let cancelled = false;
    const lastSeen = typeof window !== 'undefined' ? window.localStorage.getItem('aquaguide-admin-activity-seen-at') : null;
    adminContentClient.from('admin_activity_log').select('id,created_at').order('created_at', { ascending: false }).limit(100).then(({ data, error: activityError }) => {
      if (cancelled || activityError) return;
      const unread = lastSeen ? (data || []).filter((row) => new Date(row.created_at) > new Date(lastSeen)).length : 0;
      setActivityUnread(unread);
    });
    return () => { cancelled = true; };
  }, [session, role]);

  const selectedSpecies = species.find((item) => item.id === selectedId) || null;
  useEffect(() => {
    let cancelled = false;
    const catalogKey = selectedSpecies?.catalog_key || null;
    if (!catalogKey) {
      setProductTruthState({ catalogKey: null, row: null, loading: false, error: false });
      return () => { cancelled = true; };
    }
    setProductTruthState({ catalogKey, row: null, loading: true, error: false });
    loadProductTruth(catalogKey)
      .then((row) => {
        if (!cancelled) setProductTruthState({ catalogKey, row: row || null, loading: false, error: !row });
      })
      .catch(() => {
        if (!cancelled) setProductTruthState({ catalogKey, row: null, loading: false, error: true });
      });
    return () => { cancelled = true; };
  }, [selectedSpecies?.catalog_key]);
  const productTruthMatchesSelection = Boolean(selectedSpecies?.catalog_key && productTruthState.catalogKey === selectedSpecies.catalog_key);
  const productTruthLoading = Boolean(selectedSpecies && (!productTruthMatchesSelection || productTruthState.loading));
  const productTruthError = Boolean(selectedSpecies && productTruthMatchesSelection && !productTruthState.loading && productTruthState.error);
  const selectedProductTruth = productTruthMatchesSelection && !productTruthState.error ? productTruthState.row : null;
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
      species: previewSpecies, locale: contentLocale, routeMeta, productTruthLoading, productTruthError,
      effectiveSeo: { ...resolved.effective, imageAlt: selectedVariantRecord?.image_alt || '' },
      override: resolved.override,
    };
  }, [selectedSpecies, previewSpecies, selectedGroup, selectedGroupRecord, selectedVariantRecord, contentLocale, productTruthLoading, productTruthError]);
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
    ? { state: 'blocked', blockers: [isRepoBackend ? 'Repo Content Store 尚未完整就绪；Publish Readiness fail closed。' : 'Admin schema 001–008 尚未完整就绪；Publish Readiness fail closed。'] }
    : calculatedReadiness;
  const localeSeoRows = useMemo(() => Object.fromEntries(
    Object.values(seoRows).filter((row) => row.locale === contentLocale).map((row) => [row.catalog_key, row]),
  ), [seoRows, contentLocale]);
  const workflowOverview = useMemo(() => buildAdminWorkflowOverview({ species, groups: speciesGroups, seoRows, groupSeoRows, reviewRows: dataReviewRows }), [species, seoRows, groupSeoRows, dataReviewRows]);
  const activeLivePreview = editorScope === 'variant' && livePreview?.species?.catalog_key === selectedSpecies?.catalog_key && livePreview?.locale === contentLocale
    ? { ...livePreview, species: previewSpecies || livePreview.species, productTruthLoading, productTruthError }
    : savedLivePreview;
  const confirmDiscardUnsaved = () => {
    if (!editorDirty || isReviewMode) return true;
    return window.confirm(appLocale === 'en'
      ? 'You have unsaved changes. Discard them and continue?'
      : '当前有未保存修改。确定放弃这些修改并继续吗？');
  };
  const runEditorNavigation = (action) => {
    if (!confirmDiscardUnsaved()) return false;
    action();
    return true;
  };
  const handleInspectorSelect = (key, source = 'editor') => {
    setSelectedInspectorElement(key);
    const elementMeta = getEditorElementMeta(key);
    const inspectorReadOnly = Boolean(elementMeta?.readOnly || (key === 'localizedName' && contentLocale !== 'en'));
    if (source === 'editor') setCompactPreviewOpen(true);
    if (source === 'preview' && !inspectorReadOnly) setCompactPreviewOpen(false);
    if (!inspectorReadOnly) setActiveTool(null);
    const variantOnly = key === 'imageAlt' || (key === 'localizedName' && contentLocale === 'en');
    const variantOverride = Boolean(activeLivePreview?.override?.[key]);
    if (source === 'preview' && !inspectorReadOnly) {
      const targetScope = variantOnly || variantOverride ? 'variant' : 'base';
      if (targetScope !== editorScope) runEditorNavigation(() => setEditorScope(targetScope));
    }
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
    if (!next) { setWorkflowFilter(null); return; }
    if (workflowFilter?.key === next.key) return;
    if (!confirmDiscardUnsaved()) return;
    setWorkflowFilter(next);
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

  const publishSelectedToStaging = async () => {
    if (!isRepoBackend || !selectedSpecies || !selectedGroup || publishReadiness?.state !== 'publish_ready' || isReviewMode) return;
    setStagingPublishing(true);
    setStagingPublishMessage('');
    const canonicalTarget = selectedVariantRecord?.index_strategy === 'canonical_to_sibling'
      ? selectedVariantRecord.canonical_catalog_key
      : '';
    const catalogKeys = [...new Set([selectedSpecies.catalog_key, canonicalTarget].filter(Boolean))];
    const { data, error: publishError } = await publishRepoStaging({
      catalogKeys,
      groupKeys: [selectedGroup.group_key],
    });
    setStagingPublishing(false);
    if (publishError) {
      setStagingPublishMessage(appLocale === 'en' ? `Staging publish blocked: ${publishError.message}` : `Staging 发布被阻止：${publishError.message}`);
      return;
    }
    setStagingPublishMessage(appLocale === 'en'
      ? `Staging snapshot committed to ${data.branch}. Vercel Preview will rebuild once for this explicit publish.`
      : `Staging Snapshot 已提交到 ${data.branch}；只有这次明确发布会触发一次 Vercel Preview 构建。`);
  };

  const toggleBatch = (id) => {
    const nextGroup = speciesGroupByMemberId.get(id);
    if ((id !== selectedId || editorScope !== 'variant') && !confirmDiscardUnsaved()) return;
    setSelectedId(id);
    setEditorScope('variant');
    setBatchIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      const currentGroup = current.length ? speciesGroupByMemberId.get(current[0]) : null;
      if (currentGroup && nextGroup && currentGroup.group_key !== nextGroup.group_key) return [id];
      return [...current, id];
    });
  };

  const toolDrawerMeta = ({
    dataReview: {
      title: t('editor.sourceReview'),
      subtitle: appLocale === 'en' ? 'Resolve source-data evidence without changing Product Truth.' : '处理源数据证据，不修改 Product Truth。',
    },
    readiness: {
      title: t('editor.publishCheck'),
      subtitle: appLocale === 'en' ? 'See exactly what blocks or enables Controlled Preview.' : '查看阻塞项与 Controlled Preview 条件。',
    },
    translation: {
      title: t('editor.translation'),
      subtitle: appLocale === 'en' ? 'Chinese source → AI suggestion → reviewed English Draft.' : '中文 Source → AI 建议 → 人工确认 English Draft。',
    },
    batch: {
      title: t('editor.batchSeo'),
      subtitle: appLocale === 'en' ? 'Create inherited Draft shells without copying Base content.' : '建立继承 Draft，不复制 Base 文案。',
    },
    bulkImport: {
      title: appLocale === 'en' ? 'Bulk import' : '批量导入',
      subtitle: appLocale === 'en' ? 'Download the AquaGuide CSV template, fill it, validate it, then import Draft changes.' : '下载 AquaGuide CSV 模板，回填、校验后批量导入 Draft。',
    },
    history: {
      title: t('editor.history'),
      subtitle: appLocale === 'en' ? 'Versioned Base and Variant revision history.' : '带版本记录的 Base / Variant 历史。',
    },
    workflow: {
      title: t('editor.workflow'),
      subtitle: appLocale === 'en' ? 'Navigate Data Review, editorial review and Preview-ready queues.' : '查看数据复核、内容审核和可预览页面。',
    },
  })[activeTool] || { title: '', subtitle: '' };


  const repoBackendBlocked = !isReviewMode && backendHealth?.ok && (
    !backendHealth.auth_configured ||
    !backendHealth.github_token_configured ||
    !backendHealth.content_repo_readable ||
    !backendHealth.content_contents_write_capable ||
    !backendHealth.draft_branch_ready ||
    !backendHealth.content_store_readable ||
    !backendHealth.staging_repo_readable ||
    !backendHealth.staging_contents_write_capable ||
    !backendHealth.staging_branch_ready
  );

  const signOut = async () => {
    if (isReviewMode) return;
    if (!confirmDiscardUnsaved()) return;
    setEditorDirty(false);
    await adminContentClient.auth.signOut();
    setSession(null);
  };

  if (!isReviewMode && !isAdminBackendConfigured) {
    return (
      <main className="login-shell">
        <section className="login-card wide">
          <div className="brand-mark">A</div>
          <p className="eyebrow">SETUP REQUIRED</p>
          <h1>Admin V0 已创建</h1>
          <p className="muted">当前选择的 Admin 数据后端尚未配置。Repo 模式只需要服务端 Admin Session + GitHub Contents 写入凭证；任何 secret 都不能使用 VITE_ 前缀。</p>
        </section>
      </main>
    );
  }

  if (!authChecked) return <main className="center-message">正在检查登录状态…</main>;
  if (repoBackendBlocked) {
    const healthItems = [
      ['Server session', backendHealth.auth_configured],
      ['GitHub token', backendHealth.github_token_configured],
      ['Private content repo', backendHealth.content_repo_readable],
      ['Private content write', backendHealth.content_contents_write_capable],
      ['Draft branch', backendHealth.draft_branch_ready],
      ['Draft store', backendHealth.content_store_readable],
      ['AquaGuide staging repo', backendHealth.staging_repo_readable],
      ['Staging snapshot write', backendHealth.staging_contents_write_capable],
      ['Staging branch', backendHealth.staging_branch_ready],
    ];
    return (
      <main className="login-shell">
        <section className="login-card wide">
          <div className="login-language-row"><InterfaceLanguageSwitch /></div>
          <div className="brand-mark danger">!</div>
          <p className="eyebrow">REPO BACKEND SETUP</p>
          <h1>{appLocale === 'en' ? 'Admin storage is not ready yet' : '后台内容存储还未就绪'}</h1>
          <p className="muted">{appLocale === 'en' ? 'Login is intentionally blocked until the GitHub-backed content authority passes every server-side check.' : '在 GitHub-backed 内容源通过全部服务端检查前，后台会主动阻止登录，避免把配置问题误判成编辑器故障。'}</p>
          <div className="backend-health-list">
            {healthItems.map(([label, ready]) => (
              <div className={`backend-health-item ${ready ? 'ready' : 'blocked'}`} key={label}>
                <span>{ready ? '✓' : '!'}</span><strong>{label}</strong><em>{ready ? 'Ready' : 'Blocked'}</em>
              </div>
            ))}
          </div>
          <p className="security-note">{appLocale === 'en' ? `Status: ${backendHealth.repo_access_error || 'configuration incomplete'}. Drafts stay private; only sanitized staging snapshots cross into AquaGuide.` : `当前状态：${backendHealth.repo_access_error || '配置未完成'}。Draft 保持私有，只有脱敏后的 Staging Snapshot 会进入 AquaGuide。`}</p>
        </section>
      </main>
    );
  }
  if (backendHealth && !backendHealth.ok) return <main className="center-message">Repo Admin health check failed closed.</main>;
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
          <button type="button" className={`workflow-status workflow-status-issue ${workflowFilter?.key === 'data:pending' ? 'active' : ''}`} onClick={() => applyWorkflowFilter({ key: 'data:pending', type: 'data', status: 'pending', label: appLocale === 'en' ? 'Data Review · Pending' : '数据复核 · 待处理' })}>{t('top.dataReview')} <b>{workflowOverview.dataReview.pending}</b></button>
          <button type="button" className={`workflow-status workflow-status-review ${workflowFilter?.key === `${contentLocale}:ready_for_review` ? 'active' : ''}`} onClick={() => applyWorkflowFilter({ key: `${contentLocale}:ready_for_review`, type: 'readiness', locale: contentLocale, status: 'ready_for_review', label: `${contentLocale === 'en' ? 'English' : (appLocale === 'en' ? 'Chinese' : '中文')} · ${appLocale === 'en' ? 'Awaiting Review' : '待审核'}` })}>{t('top.awaiting')} <b>{workflowOverview.locales[contentLocale].ready_for_review}</b></button>
          <button type="button" className={`workflow-status workflow-status-ready ${workflowFilter?.key === `${contentLocale}:publish_ready` ? 'active' : ''}`} onClick={() => applyWorkflowFilter({ key: `${contentLocale}:publish_ready`, type: 'readiness', locale: contentLocale, status: 'publish_ready', label: `${contentLocale === 'en' ? 'English' : (appLocale === 'en' ? 'Chinese' : '中文')} · ${appLocale === 'en' ? 'Preview-ready' : '可预览'}` })}>{t('top.previewReady')} <b>{workflowOverview.locales[contentLocale].publish_ready}</b></button>
        </nav>
        <div className="topbar-actions">
          <span className={`connection-dot ${schemaReady && groupSchemaReady && historySchemaReady && dataReviewSchemaReady ? 'ready' : 'warning'}`}></span>
          <span>{isReviewMode ? t('top.reviewMode') : t('top.admin')}</span>
          <span className="admin-email">{session.user.email}</span>
          <button type="button" className={`topbar-bulk-trigger ${activeTool === 'bulkImport' ? 'active' : ''}`} onClick={() => setActiveTool('bulkImport')}>
            {appLocale === 'en' ? 'Bulk import' : '批量导入'}
          </button>
          <button type="button" className={`activity-trigger ${activityOpen ? 'active' : ''}`} onClick={() => {
            setActivityOpen(true);
            setActivityUnread(0);
            window.localStorage.setItem('aquaguide-admin-activity-seen-at', new Date().toISOString());
          }} aria-label={appLocale === 'en' ? 'Open activity center' : '打开操作中心'}>
            <span>{appLocale === 'en' ? 'Activity' : '操作记录'}</span>{activityUnread > 0 ? <b>{Math.min(activityUnread, 99)}</b> : null}
          </button>
          <InterfaceLanguageSwitch />
          <button className="ghost-button" type="button" onClick={signOut}>{t('top.signOut')}</button>
        </div>
      </header>

      {isReviewMode ? (
        <div className="schema-banner">
          <strong>只读 UI Review：</strong> 当前远程预览不连接任何可写内容源。可以搜索 486 条 Species、体验编辑器和实时前端 Preview，但保存被硬禁用。
        </div>
      ) : !schemaReady || !groupSchemaReady ? (
        <div className="schema-banner">
          <strong>安全隔离状态：</strong> {isRepoBackend ? 'Repo Content Store 当前不可写；可以继续预览继承结构，但保存被阻止。' : 'Variant / Base Species SEO migration 尚未全部应用；可以预览继承结构，但缺失的层级不会写入。'} 不会自动触碰 Production。
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
          onSelect={(id) => { if (selectedId === id && editorScope === 'variant') return; runEditorNavigation(() => { setSelectedId(id); setEditorScope('variant'); }); }}
          onSelectBase={(id) => { if (selectedId === id && editorScope === 'base') return; runEditorNavigation(() => { setSelectedId(id); setEditorScope('base'); }); }}
          onToggleBatch={toggleBatch}
          workflowFilter={workflowFilter}
          workflowGroupKeys={workflowScope.groupKeys}
          workflowMemberIds={workflowScope.memberIds}
          onClearWorkflowFilter={() => setWorkflowFilter(null)}
          workflowOverview={workflowOverview}
          locale={contentLocale}
          onWorkflowFilter={applyWorkflowFilter}
          reviewRows={dataReviewRows}
          onOpenDataReview={(_groupKey, memberId) => {
            runEditorNavigation(() => {
              if (memberId) setSelectedId(memberId);
              setEditorScope('variant');
              requestAnimationFrame(() => setActiveTool('dataReview'));
            });
          }}
        />

        <main className="editor-area studio-editor-area">
          <div className="editor-context-bar">
            <div className="editor-scope-switch" aria-label="Editor scope">
              <button type="button" className={editorScope === 'base' ? 'active' : ''} onClick={() => editorScope === 'base' || runEditorNavigation(() => setEditorScope('base'))}>{t('editor.base')}</button>
              <button type="button" className={editorScope === 'variant' ? 'active' : ''} onClick={() => editorScope === 'variant' || runEditorNavigation(() => setEditorScope('variant'))}>{t('editor.currentPage')}</button>
            </div>
            <button type="button" className="compact-preview-toggle" onClick={() => setCompactPreviewOpen(true)}>{t('preview.title')}</button>
            <div className="locale-switcher compact" aria-label="Content language">
              {CONTENT_LOCALES.map((item) => (
                <button key={item.code} type="button" className={contentLocale === item.code ? 'active' : ''} onClick={() => contentLocale === item.code || runEditorNavigation(() => setContentLocale(item.code))}>{item.label}</button>
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
              onInspectorSelect={(key) => handleInspectorSelect(key, 'editor')}
              onDirtyChange={setEditorDirty}
              publishReadinessState={publishReadiness?.state || 'blocked'}
              stagingPublishing={stagingPublishing}
              stagingMessage={stagingPublishMessage}
              onPublishStaging={publishSelectedToStaging}
              onOpenReadiness={() => setActiveTool('readiness')}
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
              onInspectorSelect={(key) => handleInspectorSelect(key, 'editor')}
              onDirtyChange={setEditorDirty}
              publishReadinessState={publishReadiness?.state || 'blocked'}
              stagingPublishing={stagingPublishing}
              stagingMessage={stagingPublishMessage}
              onPublishStaging={publishSelectedToStaging}
              onOpenReadiness={() => setActiveTool('readiness')}
              onSaved={(row) => {
                setSeoRows((current) => ({ ...current, [seoRowKey(row.catalog_key, row.locale)]: row }));
                setRevisionRefreshKey((current) => current + 1);
              }}
            />
          )}

          <div className="editor-secondary-tools editor-tool-launchers">
            {(selectedGroup?.category_conflict || selectedGroup?.duplicate_count > 0) ? (
              <button type="button" className={`editor-tool-row issue ${activeTool === 'dataReview' ? 'active' : ''}`} onClick={() => setActiveTool('dataReview')}>
                <span><strong>{t('editor.sourceReview')}</strong><small>{appLocale === 'en' ? 'Source evidence requires a human decision' : '存在需要人工判断的源数据证据'}</small></span>
                <em>{Number(selectedGroup.category_conflict) + (selectedGroup.duplicate_sets?.length || 0)}</em>
              </button>
            ) : null}
            <button type="button" className={`editor-tool-row readiness ${activeTool === 'readiness' ? 'active' : ''}`} onClick={() => setActiveTool('readiness')}>
              <span><strong>{t('editor.publishCheck')}</strong><small>{appLocale === 'en' ? 'Controlled Preview eligibility' : 'Controlled Preview 资格检查'}</small></span>
              <em className={publishReadiness?.state || 'blocked'}>{publishReadiness?.state || 'blocked'}</em>
            </button>
            {contentLocale === 'en' ? (
              <button type="button" className={`editor-tool-row ${activeTool === 'translation' ? 'active' : ''}`} onClick={() => setActiveTool('translation')}>
                <span><strong>{t('editor.translation')}</strong><small>{appLocale === 'en' ? 'Chinese source → English Draft' : '中文 Source → English Draft'}</small></span><b>›</b>
              </button>
            ) : null}
            {batchGroup && batchMembers.length > 1 ? (
              <button type="button" className={`editor-tool-row ${activeTool === 'batch' ? 'active' : ''}`} onClick={() => setActiveTool('batch')}>
                <span><strong>{t('editor.batchSeo')}</strong><small>{batchMembers.length} {appLocale === 'en' ? 'selected records' : '条已选择记录'}</small></span><b>›</b>
              </button>
            ) : null}
            <button type="button" className={`editor-tool-row ${activeTool === 'bulkImport' ? 'active' : ''}`} onClick={() => setActiveTool('bulkImport')}>
              <span><strong>{appLocale === 'en' ? 'Bulk import' : '批量导入'}</strong><small>{appLocale === 'en' ? 'Download template → fill → upload' : '下载模板 → 回填 → 上传校验'}</small></span><b>›</b>
            </button>
            <button type="button" className={`editor-tool-row ${activeTool === 'history' ? 'active' : ''}`} onClick={() => setActiveTool('history')}>
              <span><strong>{t('editor.history')}</strong><small>Base / Variant revision</small></span><b>›</b>
            </button>
            <button type="button" className={`editor-tool-row ${activeTool === 'workflow' ? 'active' : ''}`} onClick={() => setActiveTool('workflow')}>
              <span><strong>{t('editor.workflow')}</strong><small>Data Review / Editorial / Preview-ready</small></span><b>›</b>
            </button>
          </div>


        </main>

        <EditorToolDrawer open={Boolean(activeTool)} title={toolDrawerMeta.title} subtitle={toolDrawerMeta.subtitle} onClose={() => setActiveTool(null)}>
            {activeTool === 'dataReview' ? (
              <DataReviewPanel group={selectedGroup} reviewRows={dataReviewRows} schemaReady={dataReviewSchemaReady} readOnly={isReviewMode}
                onSaved={(row) => setDataReviewRows((current) => ({ ...current, [row.issue_key]: row }))}
                onResolved={(row) => {
                  const nextRows = { ...dataReviewRows, [row.issue_key]: row };
                  if (selectedGroup && assessDataReview(selectedGroup, nextRows).ready) {
                    setActiveTool(null);
                  }
                }}
                onSeoPolicyAligned={(rows) => {
                  setSeoRows((current) => ({ ...current, ...Object.fromEntries(rows.map((row) => [seoRowKey(row.catalog_key, row.locale), row])) }));
                  setRevisionRefreshKey((current) => current + 1);
                }} />
            ) : null}
            {activeTool === 'readiness' ? (
              <PublishReadinessPanel readiness={publishReadiness} locale={getLocaleLabel(contentLocale)} readOnly={isReviewMode} onExportPreview={exportPreviewSnapshot} onPublishStaging={publishSelectedToStaging} stagingPublishing={stagingPublishing} stagingMessage={stagingPublishMessage} repoMode={isRepoBackend} />
            ) : null}
            {activeTool === 'translation' && contentLocale === 'en' ? (
              <TranslationPanel
                species={selectedSpecies}
                group={selectedGroup}
                sourceVariantRow={sourceVariantRow}
                sourceGroupRow={sourceGroupRow}
                targetVariantRow={englishVariantRow}
                targetGroupRow={englishGroupRow}
                readOnly={isReviewMode}
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
            {activeTool === 'batch' && batchGroup && batchMembers.length > 1 ? (
              <BatchSeoEditor
                group={batchGroup}
                groupRecord={batchGroupRecord}
                members={batchMembers}
                existingRows={localeSeoRows}
                locale={contentLocale}
                schemaReady={schemaReady}
                dataReviewRows={dataReviewRows}
                readOnly={isReviewMode}
                onClear={() => { setBatchIds([]); setActiveTool(null); }}
                onSaved={(rows) => {
                  setSeoRows((current) => ({ ...current, ...Object.fromEntries(rows.map((row) => [seoRowKey(row.catalog_key, row.locale), row])) }));
                  setRevisionRefreshKey((current) => current + 1);
                }}
              />
            ) : null}
            {activeTool === 'bulkImport' ? (
              <BulkImportPanel
                species={species}
                seoRows={seoRows}
                locale={contentLocale}
                schemaReady={schemaReady}
                readOnly={isReviewMode}
                onImported={(rows) => {
                  setSeoRows((current) => ({ ...current, ...Object.fromEntries(rows.map((row) => [seoRowKey(row.catalog_key, row.locale), row])) }));
                  setRevisionRefreshKey((current) => current + 1);
                }}
              />
            ) : null}
            {activeTool === 'history' ? (
              <div className="revision-grid drawer-revision-grid">
                <RevisionHistoryPanel
                  resourceType="species_seo_group" resourceKey={selectedGroup?.group_key || ''} locale={contentLocale}
                  schemaReady={historySchemaReady} readOnly={isReviewMode} refreshKey={revisionRefreshKey}
                  onRestored={(row) => {
                    if (!row?.group_key) return;
                    const key = groupSeoRowKey(row.group_key, row.locale);
                    setGroupSeoRows((current) => ({ ...current, [key]: row }));
                    setGroupPreviewRows((current) => { const next = { ...current }; delete next[key]; return next; });
                    setRevisionRefreshKey((current) => current + 1);
                  }}
                />
                <RevisionHistoryPanel
                  resourceType="species_seo" resourceKey={selectedSpecies?.catalog_key || ''} locale={contentLocale}
                  schemaReady={historySchemaReady} readOnly={isReviewMode} refreshKey={revisionRefreshKey}
                  onRestored={(row) => {
                    if (!row?.catalog_key) return;
                    setSeoRows((current) => ({ ...current, [seoRowKey(row.catalog_key, row.locale)]: row }));
                    setRevisionRefreshKey((current) => current + 1);
                  }}
                />
              </div>
            ) : null}
            {activeTool === 'workflow' ? (
              <WorkflowOverview overview={workflowOverview} activeFilter={workflowFilter} onFilter={(filter) => { applyWorkflowFilter(filter); setActiveTool(null); }} />
            ) : null}
        </EditorToolDrawer>

        <LiveFrontendPreview
          preview={activeLivePreview}
          readiness={publishReadiness}
          readOnly={isReviewMode}
          onGeneratePreview={exportPreviewSnapshot}
          selectedElement={selectedInspectorElement}
          onSelectElement={(key) => handleInspectorSelect(key, 'preview')}
          editorScope={editorScope}
          compactOpen={compactPreviewOpen}
          onCloseCompact={() => setCompactPreviewOpen(false)}
        />
      </div>
      <div className="operation-notice-stack" aria-live="polite">
        {operationNotices.map((notice) => (
          <div className={`operation-notice ${notice.status || 'success'}`} key={notice.id}>
            <span>{notice.status === 'error' ? '!' : '✓'}</span>
            <div><strong>{notice.title || (notice.status === 'error' ? '操作失败' : '操作已完成')}</strong><small>{notice.error || notice.detail || ''}</small></div>
          </div>
        ))}
      </div>
      <ActivityCenter
        open={activityOpen}
        refreshKey={activityRefreshKey}
        onClose={() => setActivityOpen(false)}
        readOnly={isReviewMode}
        onLoaded={() => {
          setActivityUnread(0);
          window.localStorage.setItem('aquaguide-admin-activity-seen-at', new Date().toISOString());
        }}
      />
    </div>
  );
}
