import { useEffect, useMemo, useState } from 'react';
import { adminContentClient, getRepoBackendHealth, isAdminBackendConfigured, isRepoBackend, publishRepoStaging } from './adminBackend.js';
import SpeciesGroupSidebar from './SpeciesGroupSidebar.jsx';
import BatchSeoEditor from './BatchSeoEditor.jsx';
import BulkImportPanel from './BulkImportPanel.jsx';
import BulkDuplicateReviewPanel from './BulkDuplicateReviewPanel.jsx';
import BulkEditorialReviewPanel from './BulkEditorialReviewPanel.jsx';
import ActivityCenter from './ActivityCenter.jsx';
import BaseSpeciesSeoEditor from './BaseSpeciesSeoEditor.jsx';
import PageReviewStatusBar from './PageReviewStatusBar.jsx';
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
import { assessDataReview, assessPublishReadiness, buildAdminWorkflowOverview, buildControlledPreviewSnapshot, dataReviewMap, getIndexReviewBlockReason, getResolvedDuplicateSeoPolicy, summarizeDataReviewIssues } from './publishReadiness.js';
import { inspectEditorialContent, hygieneBlockerText } from './contentHygiene.js';
import { emitAdminNotice } from './AdminNoticeViewport.jsx';

const queryDemoAllowed = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.endsWith('.pages.dev')
) && new URLSearchParams(window.location.search).get('demo') === '1';
const isReadOnlyDemoMode = import.meta.env.VITE_ADMIN_READ_ONLY_DEMO === 'true' || queryDemoAllowed;
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

function InterfaceLanguageSwitch({ onLocaleChange }) {
  const { appLocale, setAppLocale, t } = useAppLanguage();
  const switchLocale = (locale) => {
    if (onLocaleChange) return onLocaleChange(locale);
    setAppLocale(locale);
  };
  return (
    <div className="app-language-switch" aria-label={t('top.interfaceLanguage')}>
      <button type="button" className={appLocale === 'zh-CN' ? 'active' : ''} onClick={() => switchLocale('zh-CN')}>{appLocale === 'en' ? 'Chinese' : '中文'}</button>
      <button type="button" className={appLocale === 'en' ? 'active' : ''} onClick={() => switchLocale('en')}>{appLocale === 'en' ? 'English' : '英文'}</button>
    </div>
  );
}

function Login({ onSignedIn }) {
  const { appLocale, t } = useAppLanguage();
  const [email, setEmail] = useState('admin@aquaguide.local');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    const { data, error: signInError } = await adminContentClient.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      emitAdminNotice({ status: 'error', title: appLocale === 'en' ? 'Sign-in failed' : '登录失败', detail: signInError.message || (appLocale === 'en' ? 'Check the admin account and password.' : '请检查管理员账号和密码。') });
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

function SeoEditor({ species, group, groupRecord, record, locale = 'zh-CN', schemaReady, dataReviewRows = {}, readOnly = false, onSaved, onLivePreviewChange, selectedInspectorElement, onInspectorSelect, onDirtyChange, publishReadinessState = 'blocked', stagingPublishing = false, onPublishStaging, onOpenReadiness, onEditBase, reviewPortalTarget }) {
  const { appLocale, t } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const [form, setForm] = useState(emptySeo);
  const [saving, setSaving] = useState(false);
  const [overrideEditing, setOverrideEditing] = useState({});
  const resolvedDuplicatePolicy = getResolvedDuplicateSeoPolicy({ species, group, reviewRows: dataReviewRows });
  const duplicateSetForSpecies = (group?.duplicate_sets || []).find((set) => set.member_ids.includes(species?.catalog_key));
  const duplicateReviewForSpecies = duplicateSetForSpecies ? dataReviewRows[duplicateSetForSpecies.duplicate_set_key] : null;
  const duplicateReviewOpen = Boolean(duplicateSetForSpecies && !['distinct_records', 'duplicate_records'].includes(duplicateReviewForSpecies?.decision));

  useEffect(() => {
    const next = fromSeoRow(record, species, locale);
    if (resolvedDuplicatePolicy) {
      next.indexStrategy = resolvedDuplicatePolicy.indexStrategy;
      next.canonicalCatalogKey = resolvedDuplicatePolicy.canonicalCatalogKey;
    }
    setForm(next);
    setOverrideEditing({});
    onDirtyChange?.(false);
  }, [record, species, locale, resolvedDuplicatePolicy?.indexStrategy, resolvedDuplicatePolicy?.canonicalCatalogKey, onDirtyChange]);

  const selectedInspectorMeta = getEditorElementMeta(selectedInspectorElement);
  const selectedEditorField = selectedInspectorMeta?.editorField || selectedInspectorElement;
  const selectedInspectorTargetsVariant = selectedInspectorMeta?.scope !== 'base';
  useEffect(() => {
    if (!selectedInspectorElement || !selectedInspectorTargetsVariant) return;
    if (selectedInspectorElement === 'localizedName' && !isEnglishLocale(locale)) return;
    const frame = requestAnimationFrame(() => {
      const target = document.querySelector(`[data-editor-field="${selectedEditorField}"]`);
      target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedInspectorElement, selectedEditorField, selectedInspectorTargetsVariant, species?.id, locale]);

  const editorFieldProps = (key) => {
    const fieldState = fieldStateByKey?.[key] || 'default';
    const selected = selectedInspectorTargetsVariant && selectedEditorField === key;
    return {
      'data-editor-field': key,
      'data-validation-state': fieldState,
      className: `inspector-editor-field state-${fieldState} ${selected ? 'is-inspector-selected' : ''}`,
    };
  };

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
  const currentHygiene = hasSpecies ? inspectEditorialContent({
    seoTitle: effectiveSeo?.seoTitle, metaDescription: effectiveSeo?.metaDescription, h1: effectiveSeo?.h1,
    sharedIntro: effectiveSeo?.sharedIntro, variantIntro: form.intro, localizedName: isEnglishLocale(locale) ? form.localizedName : '',
    imageAlt: form.imageAlt, focusKeyword: form.focusKeyword,
  }) : { clean: true, issues: [] };
  const hygieneBlockReason = currentHygiene.clean ? '' : hygieneBlockerText(currentHygiene.issues[0], locale);
  const hygieneIssueKeys = new Set(currentHygiene.issues.map((issue) => ({ variantIntro: 'intro' }[issue.field] || issue.field)));
  const hasIntroContent = Boolean([effectiveSeo?.sharedIntro, effectiveSeo?.variantIntro].filter(Boolean).join('').trim());
  const requiredFieldPresent = {
    seoTitle: Boolean(effectiveSeo?.seoTitle?.trim()),
    metaDescription: Boolean(effectiveSeo?.metaDescription?.trim()),
    h1: Boolean(effectiveSeo?.h1?.trim()),
    intro: hasIntroContent,
    imageAlt: Boolean(form.imageAlt?.trim()),
    localizedName: !isEnglishLocale(locale) || Boolean(form.localizedName?.trim()),
  };
  const fieldStateByKey = {
    seoTitle: hygieneIssueKeys.has('seoTitle') ? 'error' : requiredFieldPresent.seoTitle ? 'success' : 'warning',
    metaDescription: hygieneIssueKeys.has('metaDescription') ? 'error' : requiredFieldPresent.metaDescription ? 'success' : 'warning',
    h1: hygieneIssueKeys.has('h1') ? 'error' : requiredFieldPresent.h1 ? 'success' : 'warning',
    intro: hygieneIssueKeys.has('intro') || hygieneIssueKeys.has('sharedIntro') ? 'error' : requiredFieldPresent.intro ? 'success' : 'warning',
    imageAlt: hygieneIssueKeys.has('imageAlt') ? 'error' : requiredFieldPresent.imageAlt ? 'success' : 'warning',
    localizedName: hygieneIssueKeys.has('localizedName') ? 'error' : requiredFieldPresent.localizedName ? 'success' : 'warning',
    focusKeyword: hygieneIssueKeys.has('focusKeyword') ? 'error' : form.focusKeyword?.trim() ? 'success' : 'default',
    indexStrategy: indexBlockReason ? 'error' : 'success',
  };
  const stateLabel = (state) => isUiEnglish
    ? ({ error: 'Needs fixing', warning: 'Needs attention', success: 'Healthy', default: 'Optional' }[state] || 'In progress')
    : ({ error: '需修复', warning: '待补充', success: '正常', default: '可选' }[state] || '进行中');
  const sectionState = (keys) => keys.some((key) => fieldStateByKey[key] === 'error')
    ? 'error'
    : keys.some((key) => fieldStateByKey[key] === 'warning')
      ? 'warning'
      : 'success';
  const seoSectionState = sectionState(isEnglishLocale(locale) ? ['localizedName', 'seoTitle', 'metaDescription', 'h1'] : ['seoTitle', 'metaDescription', 'h1']);
  const contentSectionState = sectionState(['intro', 'imageAlt']);
  const policySectionState = indexBlockReason ? 'error' : 'success';
  useEffect(() => {
    if (!hasSpecies || !effectiveSeo || !routeMeta) {
      onLivePreviewChange?.(null);
      return;
    }
    onLivePreviewChange?.({
      species,
      locale,
      routeMeta,
      variantRow: {
        localized_name: form.localizedName,
        seo_title: form.seoTitle,
        meta_description: form.metaDescription,
        h1: form.h1,
        intro: form.intro,
        image_alt: form.imageAlt,
        index_strategy: form.indexStrategy,
        canonical_catalog_key: form.canonicalCatalogKey,
      },
      effectiveSeo: { ...effectiveSeo, imageAlt: form.imageAlt },
      override: resolvedSeo.override,
    });
  }, [
    species?.catalog_key, locale, effectiveSeo?.seoTitle, effectiveSeo?.metaDescription, effectiveSeo?.h1,
    effectiveSeo?.sharedIntro, effectiveSeo?.variantIntro, effectiveSeo?.displayName, routeMeta?.selfPath,
    routeMeta?.canonicalPath, routeMeta?.robots, form.localizedName, form.seoTitle, form.metaDescription, form.h1, form.intro, form.imageAlt,
    form.indexStrategy, form.canonicalCatalogKey, resolvedSeo?.override?.seoTitle, resolvedSeo?.override?.metaDescription, resolvedSeo?.override?.h1, onLivePreviewChange,
  ]);

  const baselineForm = fromSeoRow(record, species, locale);
  const contentDirty = !readOnly && EDITORIAL_FORM_KEYS.some((key) => String(form[key] ?? '') !== String(baselineForm[key] ?? ''));
  const isDirty = !readOnly && JSON.stringify(form) !== JSON.stringify(baselineForm);
  const reviewTone = !currentHygiene.clean || indexBlockReason || publishReadinessState === 'blocked'
    ? 'error'
    : contentDirty || form.reviewState !== 'approved'
      ? 'warning'
      : 'success';
  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);

  if (!species) {
    return (
      <section className="editor-empty" data-ui-state="empty">
        <div className="empty-icon">↖</div>
        <h2>{isUiEnglish ? 'Select a Species' : '选择一个物种'}</h2>
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
  const inheritedSourceCount = sourceFields.length - customSourceCount;
  const pageTaskKeys = isEnglishLocale(locale) ? ['localizedName', 'intro', 'imageAlt'] : ['intro', 'imageAlt'];
  const pageAttentionCount = pageTaskKeys.filter((key) => ['warning', 'error'].includes(fieldStateByKey[key])).length;
  const seoAttentionCount = sourceFields.filter((item) => ['warning', 'error'].includes(fieldStateByKey[item.key]) || item.custom).length;
  const renderInheritedOverrideField = ({ key, label, value, inheritedValue, maxLength, rows }) => {
    const custom = Boolean(value);
    const editing = custom || Boolean(overrideEditing[key]);
    return (
      <div {...editorFieldProps(key)} onClick={() => onInspectorSelect?.(key)}>
        <div className="inheritance-field-heading">
          <span>{label}</span>
          <div className="inheritance-field-source">
            <small>{custom ? (isUiEnglish ? 'This page' : '本页专用') : (isUiEnglish ? 'Base template' : '基础模板')}</small>
            {editing ? <button type="button" className="inline-source-action" onClick={() => useBaseValue(key)}>{custom ? (isUiEnglish ? 'Use template' : '改用模板') : (isUiEnglish ? 'Cancel override' : '取消单独修改')}</button> : null}
          </div>
        </div>
        {!editing ? (
          <div className="inherited-field-view compact-source-view">
            <div className="inherited-field-value">{inheritedValue || '—'}</div>
            <button type="button" className="inline-source-action" onClick={() => startOverride(key)}>{isUiEnglish ? 'Edit for this page' : '单独修改'}</button>
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
      emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Production publishing is locked' : '正式发布未开放', detail: isUiEnglish ? 'This action can only save a Draft.' : '当前只能保存草稿，不能直接发布到正式环境。' });
      return;
    }
    if (readOnly) {
      emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Read-only demo' : '当前是只读演示', detail: isUiEnglish ? 'No write request was sent.' : '此次操作不会写入内容存储。' });
      return;
    }
    if (!schemaReady) {
      emitAdminNotice({ status: 'error', title: isUiEnglish ? 'Save blocked' : '保存被阻止', detail: isUiEnglish ? 'Repo Content Store is not ready.' : '仓库内容存储尚未就绪。' });
      return;
    }
    setSaving(true);
    if (reviewStateOverride && reviewStateOverride !== 'editing' && !currentHygiene.clean) {
      setSaving(false);
      emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Review blocked' : '审核被阻止', detail: hygieneBlockReason });
      return;
    }
    if (reviewStateOverride && !contentDirty) {
      const { data, error } = await adminContentClient
        .from('species_seo')
        .update({ review_state: reviewStateOverride })
        .eq('catalog_key', species.catalog_key)
        .eq('locale', locale)
        .select('*')
        .single();
      setSaving(false);
      if (error) {
        /* Repo backend emits the operation error toast. */
        return;
      }
      setForm((current) => ({ ...current, reviewState: data.review_state }));
      /* Repo backend emits the operation success toast. */
      onSaved(data);
      return;
    }
    if (indexBlockReason) {
      setSaving(false);
      emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Save blocked' : '保存被阻止', detail: indexBlockReason });
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
      review_state: reviewStateOverride || form.reviewState,
    };
    const { data, error } = await adminContentClient
      .from('species_seo')
      .upsert(payload, { onConflict: 'catalog_key,locale' })
      .select('*')
      .single();
    setSaving(false);
    if (error) {
      /* Repo backend emits the operation error toast. */
      return;
    }
    setForm(fromSeoRow(data, species, locale));
    /* Repo backend emits the operation success toast. */
    onSaved(data);
  };

  return (
    <>
      <PageReviewStatusBar
        publishStatus={form.status}
        reviewState={form.reviewState}
        isUiEnglish={isUiEnglish}
        scope="page"
        tone={reviewTone}
        busy={saving || stagingPublishing}
        portalTarget={reviewPortalTarget}
        dirtyHint={contentDirty ? (isUiEnglish ? 'Save a draft, or save and move directly into review.' : '可以仅保存草稿，也可以直接保存并进入审核。') : ''}
      >
        {form.reviewState === 'editing' ? (
          <div className="review-next-action-stack">
            <div className="review-next-action-buttons">
              {contentDirty ? <button type="button" className="ghost-button compact" disabled={saving} onClick={() => save()}>{isUiEnglish ? 'Save draft' : '仅保存草稿'}</button> : null}
              <button type="button" className="primary-button compact review-submit-action" disabled={saving} onClick={() => save('ready_for_review')}>{saving ? t('common.saving') : contentDirty ? (isUiEnglish ? 'Save & submit →' : '保存并提交审核 →') : (isUiEnglish ? 'Submit for review →' : '提交审核 →')}</button>
            </div>
            <small className="review-next-step-hint">{isUiEnglish ? 'Next: Awaiting review · 2/3' : '下一步：进入待审核 · 2/3'}</small>
          </div>
        ) : form.reviewState === 'ready_for_review' ? (
          <>
            <button type="button" className="ghost-button compact" disabled={saving} onClick={() => save('editing')}>{isUiEnglish ? 'Back to editing' : '退回编辑'}</button>
            <button type="button" className="primary-button compact" disabled={saving} onClick={() => save('approved')}>{saving ? t('common.saving') : (isUiEnglish ? 'Approve Preview' : '批准预览')}</button>
          </>
        ) : publishReadinessState === 'publish_ready' ? (
          <>
            <button type="button" className="ghost-button compact" disabled={saving || stagingPublishing} onClick={() => save('editing')}>{isUiEnglish ? 'Back to editing' : '退回编辑'}</button>
            <button type="button" className="primary-button compact staging-action" disabled={stagingPublishing} onClick={onPublishStaging}>{stagingPublishing ? (isUiEnglish ? 'Publishing…' : '正在发布…') : (isUiEnglish ? 'Publish to Staging' : '发布到预发布环境')}</button>
          </>
        ) : (
          <>
            <button type="button" className="ghost-button compact" disabled={saving} onClick={() => save('editing')}>{isUiEnglish ? 'Back to editing' : '退回编辑'}</button>
            <button type="button" className="secondary-button compact" onClick={onOpenReadiness}>{isUiEnglish ? 'View blockers' : '查看发布阻塞项'}</button>
          </>
        )}
      </PageReviewStatusBar>

      <section className="editor-panel">
        <div className="editor-task-header">
          <div>
            <h2>{species.name}</h2>
            <p>{species.scientific_name}</p>
          </div>
          <div className="editor-task-summary" aria-label={isUiEnglish ? 'Editing summary' : '填写概览'}>
            <strong className={pageAttentionCount > 0 ? 'needs-attention' : ''}>{pageAttentionCount > 0 ? (isUiEnglish ? `${pageAttentionCount} to complete` : `${pageAttentionCount} 项待填写`) : (isUiEnglish ? 'Page content complete' : '页面内容已完整')}</strong>
            <span>{isUiEnglish ? `${inheritedSourceCount} search fields use the template` : `${inheritedSourceCount} 项搜索字段沿用模板`}</span>
          </div>
        </div>

      {!currentHygiene.clean ? (
        <div className="content-hygiene-warning" role="alert">
          <div><strong>{isUiEnglish ? 'Test / acceptance copy detected' : '检测到测试 / 验收文案'}</strong><span>{isUiEnglish ? 'Draft editing is allowed, but review and Preview are blocked until these markers are removed.' : '可以继续保存草稿，但清理这些字样前不能提交审核或进入预览。'}</span></div>
          <ul>{currentHygiene.issues.map((issue) => {
            const inheritedBaseIssue = issue.field === 'sharedIntro' || (['seoTitle', 'metaDescription', 'h1'].includes(issue.field) && !form[issue.field]);
            return <li key={`${issue.field}-${issue.marker}`}><b>{issue.label}</b><span>{issue.match}</span>{['seoTitle', 'metaDescription', 'h1'].includes(issue.field) && form[issue.field] ? <button type="button" onClick={() => useBaseValue(issue.field)}>{isUiEnglish ? 'Use clean Base template' : '恢复基础模板'}</button> : issue.field === 'variantIntro' && form.intro ? <button type="button" onClick={() => update('intro', '')}>{isUiEnglish ? 'Clear page supplement' : '清空本页补充'}</button> : inheritedBaseIssue ? <button type="button" onClick={onEditBase}>{isUiEnglish ? 'Edit Base template' : '去基础模板修复'}</button> : null}</li>;
          })}</ul>
        </div>
      ) : null}

      <div className="editor-grid">
        <div className="form-column">
          <div className={`section-card validation-section state-${contentSectionState}`} data-validation-state={contentSectionState}>
            <div className="section-heading">
              <div>
                <h3>{isUiEnglish ? 'Page-specific content' : '当前页面要填写'}</h3>
                <p>{isUiEnglish ? 'Only content unique to this page belongs here.' : '这里只填写当前物种页面自己的内容；模板已提供的内容无需重复填写。'}</p>
              </div>
            </div>
            {isEnglishLocale(locale) ? (
              <label {...editorFieldProps('localizedName')}>
                {isUiEnglish ? 'English common name' : '英文常用名'}
                <input value={form.localizedName} placeholder={isUiEnglish ? 'e.g. Cherry Shrimp' : '例如 Cherry Shrimp'} onFocus={() => onInspectorSelect?.('localizedName')} onChange={(event) => update('localizedName', event.target.value)} />
                <small className="inherit-note">{isUiEnglish ? 'Required for the English page only.' : '仅英文页面需要填写。'}</small>
              </label>
            ) : null}
            <label {...editorFieldProps('intro')}>
              <span className="editor-field-question">{isUiEnglish ? 'What is different about this page?' : '这个品种有什么不同？'}</span>
              <small className="editor-field-guidance">{isUiEnglish ? 'Write only differences from the Base template. If the template already covers the page and there is no difference, leave this blank.' : '只写和基础模板不同的内容；基础模板已有共同内容且当前品种没有差异时，可以留空。'}</small>
              <textarea rows="4" value={form.intro} onFocus={() => onInspectorSelect?.('variantIntro')} onChange={(event) => update('intro', event.target.value)} placeholder={isUiEnglish ? 'Example: color, temperament or care differences unique to this variant…' : '例如：这个品种独有的颜色、性格或饲养差异…'} />
            </label>
            <label {...editorFieldProps('imageAlt')}>
              <span className="editor-field-question">{isUiEnglish ? 'Describe the main image' : '主图里是什么？'}</span>
              <small className="editor-field-guidance">{isUiEnglish ? 'One short sentence for accessibility and image search.' : '用一句短句描述图片里的物种，用于无障碍和图片搜索。'}</small>
              <input value={form.imageAlt} placeholder={isUiEnglish ? `Example: ${species.name} aquarium fish` : `例如：${species.name} 观赏鱼`} onFocus={() => onInspectorSelect?.('imageAlt')} onChange={(event) => update('imageAlt', event.target.value)} />
            </label>
            {group?.member_count > 1 ? (
              <details className="inherited-content-disclosure secondary-reference">
                <summary>
                  <span><strong>{isUiEnglish ? 'Template content' : '基础模板内容'}</strong><small>{isUiEnglish ? 'Already inherited; no need to repeat it here' : '当前页面已自动继承，不需要重复填写'}</small></span>
                  <em>{isUiEnglish ? 'View' : '查看'}</em>
                </summary>
                <p>{effectiveSeo.sharedIntro || (isUiEnglish ? 'No shared introduction yet.' : '基础种简介尚未填写。')}</p>
              </details>
            ) : null}
          </div>

          <details className={`editor-task-disclosure search-task state-${seoSectionState}`} open={seoAttentionCount > 0 || ['seoTitle', 'metaDescription', 'h1'].includes(selectedEditorField)}>
            <summary>
              <div>
                <strong>{isUiEnglish ? 'Search appearance' : '搜索展示'}</strong>
                <small>{seoAttentionCount > 0
                  ? (isUiEnglish ? `${seoAttentionCount} item${seoAttentionCount === 1 ? '' : 's'} need attention` : `${seoAttentionCount} 项需要处理`)
                  : (isUiEnglish ? `${inheritedSourceCount} fields use the Base template` : `${inheritedSourceCount} 项沿用基础模板，无需填写`)}</small>
              </div>
              <span>{seoAttentionCount > 0 ? stateLabel(seoSectionState) : (isUiEnglish ? 'Optional override' : '需要时再单独修改')}</span>
            </summary>
            <div className="editor-task-disclosure-body">
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
          </details>

          <details className={`advanced-seo-disclosure validation-section state-${policySectionState}`} data-validation-state={policySectionState} open={Boolean(indexBlockReason)}>
            <summary>
              <span>
                <strong>{isUiEnglish ? 'Advanced SEO' : '高级 SEO'}</strong>
                <small>{isUiEnglish ? 'Keyword, indexing, canonical and URL settings' : '关键词、收录策略、Canonical 与 URL'}</small>
              </span>
              <div className="advanced-seo-summary-state">{policySectionState !== 'success' ? <span className={`validation-state-chip tone-${policySectionState}`}>{stateLabel(policySectionState)}</span> : null}<em>{form.indexStrategy === 'index' ? (isUiEnglish ? 'Index' : '独立收录') : form.indexStrategy === 'canonical_to_sibling' ? 'Canonical' : 'Noindex'}</em></div>
            </summary>
            <div className="advanced-seo-body">
              <label>
                {t('editor.focusKeyword')}
                <input value={form.focusKeyword} onChange={(event) => update('focusKeyword', event.target.value)} />
              </label>
              <label {...editorFieldProps('indexStrategy')}>{t('editor.indexStrategy')}
                <select value={form.indexStrategy} disabled={Boolean(resolvedDuplicatePolicy)} onChange={(event) => update('indexStrategy', event.target.value)}>
                  {INDEX_STRATEGIES.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                      disabled={(group?.category_conflict && item.value !== 'noindex') || (duplicateReviewOpen && item.value === 'index') || (item.value === 'canonical_to_sibling' && group?.member_count < 2)}
                    >{isUiEnglish ? item.label.split(' / ')[0] : (item.label.split(' / ')[1] || item.label)}</option>
                  ))}
                </select>
                {resolvedDuplicatePolicy ? <small className="inherit-note">{isUiEnglish ? 'Locked by the resolved duplicate-review decision.' : '已由人工重复复核结论锁定；如需改变，请回到“数据问题”重新复核。'}</small> : null}
              </label>
              {form.indexStrategy === 'canonical_to_sibling' ? (
                <label>{t('editor.canonicalTarget')}
                  <select value={form.canonicalCatalogKey} disabled={Boolean(resolvedDuplicatePolicy)} onChange={(event) => update('canonicalCatalogKey', event.target.value)}>
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
              <small className="inherit-note">{isUiEnglish ? 'The static Species generator is verified, but Production publishing remains locked.' : '静态物种页面生成器已验证；正式发布仍然锁定。'}</small>
            </div>
          </details>
        </div>

      </div>

      <div className="editor-footer">
        <div>
          {!readOnly && contentDirty ? <span className="unsaved-indicator">{isUiEnglish ? 'Unsaved changes · approval will reset' : '未保存修改 · 保存后需重新审核'}</span> : null}
          {!readOnly && !schemaReady ? <span className="warning-text">{isUiEnglish ? 'Storage schema is not ready; saving is blocked.' : '内容存储尚未就绪，保存会被阻止。'}</span> : null}
        </div>
        <div className="footer-actions">
          {!readOnly ? <span className={`draft-safety-chip content-${form.status}`} aria-label={isUiEnglish ? 'Content status' : '内容状态'}>{form.status === 'published' ? (isUiEnglish ? 'Published · locked' : '已发布 · 已锁定') : (isUiEnglish ? 'Draft · not live' : '草稿 · 不会直接上线')}</span> : null}
          {contentDirty ? <button className="primary-button compact" type="button" onClick={() => save()} disabled={saving}>{saving ? t('common.saving') : (isUiEnglish ? 'Save changes' : '保存修改')}</button> : null}
        </div>
      </div>
      </section>
    </>
  );
}

export default function App() {
  const { appLocale, setAppLocale, t } = useAppLanguage();
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);
  const [role, setRole] = useState(null);
  const [species, setSpecies] = useState([]);
  const [seoRows, setSeoRows] = useState({});
  const [groupSeoRows, setGroupSeoRows] = useState({});
  const [groupPreviewRows, setGroupPreviewRows] = useState({});
  const [contentLocale, setContentLocale] = useState(() => initialParams.has('locale') ? initialContentLocale : appLocale);
  const [selectedId, setSelectedId] = useState(initialSpeciesId);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [batchIds, setBatchIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schemaReady, setSchemaReady] = useState(true);
  const [groupSchemaReady, setGroupSchemaReady] = useState(true);
  const [historySchemaReady, setHistorySchemaReady] = useState(true);
  const [dataReviewSchemaReady, setDataReviewSchemaReady] = useState(true);
  const [dataReviewRows, setDataReviewRows] = useState({});
  const [revisionRefreshKey, setRevisionRefreshKey] = useState(0);
  const [workflowFilter, setWorkflowFilter] = useState(null);
  const [reviewPortalTarget, setReviewPortalTarget] = useState(null);
  const [editorScope, setEditorScope] = useState('variant');
  const [livePreview, setLivePreview] = useState(null);
  const [productTruthState, setProductTruthState] = useState({ catalogKey: null, row: null, loading: false, error: false });
  const [selectedInspectorElement, setSelectedInspectorElement] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [compactPreviewOpen, setCompactPreviewOpen] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(420);
  const [previewResizing, setPreviewResizing] = useState(false);
  const [editorDirty, setEditorDirty] = useState(false);
  const [stagingPublishing, setStagingPublishing] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [activityUnread, setActivityUnread] = useState(0);
  const [importBatches, setImportBatches] = useState([]);


  useEffect(() => {
    if (!previewResizing) return undefined;
    const handleMove = (event) => {
      const sidebarWidth = window.innerWidth >= 1320 ? 270 : window.innerWidth >= 900 ? 220 : 0;
      const maxWidth = Math.max(340, Math.min(560, window.innerWidth - sidebarWidth - 420));
      const nextWidth = Math.max(340, Math.min(maxWidth, window.innerWidth - event.clientX));
      setPreviewWidth(nextWidth);
    };
    const handleEnd = () => setPreviewResizing(false);
    document.body.classList.add('is-resizing-preview');
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd, { once: true });
    return () => {
      document.body.classList.remove('is-resizing-preview');
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
    };
  }, [previewResizing]);

  useEffect(() => { setLivePreview(null); }, [selectedId, contentLocale]);
  useEffect(() => {
    setSelectedInspectorElement(null);
    setActiveTool(null);
    setCompactPreviewOpen(false);
  }, [selectedId, contentLocale]);

  useEffect(() => {
    const onOperation = (event) => {
      const detail = event.detail || {};
      setActivityRefreshKey((current) => current + 1);
      if (detail.status === 'success' && !activityOpen) setActivityUnread((current) => current + 1);
    };
    window.addEventListener('aquaguide-admin-operation', onOperation);
    return () => window.removeEventListener('aquaguide-admin-operation', onOperation);
  }, [activityOpen]);

  useEffect(() => {
    if (!editorDirty || isReadOnlyDemoMode) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editorDirty]);

  useEffect(() => {
    if (isReadOnlyDemoMode) {
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
    if (isReadOnlyDemoMode) return undefined;
    if (!session) {
      setRole(null);
      setSpecies([]);
      setSeoRows({});
      setGroupSeoRows({});
      setGroupPreviewRows({});
      setDataReviewRows({});
      setImportBatches([]);
      return;
    }

    const loadAdminData = async () => {
      setLoading(true);
      const { data: roleRow, error: roleError } = await adminContentClient
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .maybeSingle();

      if (roleError) {
        emitAdminNotice({ status: 'error', title: appLocale === 'en' ? 'Admin verification failed' : '管理员身份验证失败', detail: roleError.message });
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

      const { data: importBatchData, error: importBatchError } = await adminContentClient
        .from('import_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setImportBatches(importBatchError ? [] : (importBatchData || []));
      setLoading(false);
    };

    loadAdminData();
  }, [session]);

  useEffect(() => {
    if (!session || role !== 'admin' || isReadOnlyDemoMode) return undefined;
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
  const selectedDataReviewSummary = selectedGroup ? summarizeDataReviewIssues(selectedGroup, dataReviewRows) : { total: 0, open: 0 };
  const selectedGroupKey = selectedGroup ? groupSeoRowKey(selectedGroup.group_key, contentLocale) : null;
  const selectedGroupPersisted = selectedGroupKey ? groupSeoRows[selectedGroupKey] : null;
  const selectedGroupRecord = selectedGroupKey
    ? groupPreviewRows[selectedGroupKey] || selectedGroupPersisted
    : null;
  const selectedVariantRecord = selectedSpecies ? seoRows[seoRowKey(selectedSpecies.catalog_key, contentLocale)] : null;
  const liveVariantMatchesSelection = Boolean(
    livePreview?.species?.catalog_key === selectedSpecies?.catalog_key && livePreview?.locale === contentLocale,
  );
  const previewVariantRecord = liveVariantMatchesSelection && livePreview?.variantRow
    ? livePreview.variantRow
    : selectedVariantRecord;
  const composedLivePreview = useMemo(() => {
    if (!selectedSpecies || !selectedGroup) return null;
    const resolved = resolveEffectiveSeo({
      member: selectedSpecies, group: selectedGroup, groupRow: selectedGroupRecord, variantRow: previewVariantRecord, locale: contentLocale,
    });
    const routeMeta = buildSpeciesSeoRouteMeta({
      member: selectedSpecies, group: selectedGroup, locale: contentLocale,
      indexStrategy: previewVariantRecord?.index_strategy || 'noindex',
      canonicalCatalogKey: previewVariantRecord?.canonical_catalog_key || '',
    });
    return {
      species: previewSpecies, locale: contentLocale, routeMeta, productTruthLoading, productTruthError,
      effectiveSeo: { ...resolved.effective, imageAlt: previewVariantRecord?.image_alt || '' },
      override: resolved.override,
      variantRow: previewVariantRecord,
    };
  }, [selectedSpecies, previewSpecies, selectedGroup, selectedGroupRecord, previewVariantRecord, contentLocale, productTruthLoading, productTruthError]);
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
  const currentImportBatch = useMemo(() => {
    const localized = [...importBatches]
      .filter((row) => row?.locale === contentLocale)
      .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
    return localized[0] || null;
  }, [importBatches, contentLocale]);
  const upsertImportBatch = (batch) => {
    if (!batch?.batch_id) return;
    setImportBatches((current) => [batch, ...current.filter((row) => row.batch_id !== batch.batch_id)]);
  };
  const pendingDuplicateReviewCount = useMemo(() => speciesGroups.reduce((sum, group) => sum + (group.duplicate_sets || []).filter((set) => !['duplicate_records', 'distinct_records'].includes(dataReviewRows?.[set.duplicate_set_key]?.decision)).length, 0), [dataReviewRows]);
  const activeLivePreview = composedLivePreview;
  const confirmDiscardUnsaved = () => {
    if (!editorDirty || isReadOnlyDemoMode) return true;
    return window.confirm(appLocale === 'en'
      ? 'You have unsaved changes. Discard them and continue?'
      : '当前有未保存修改。确定放弃这些修改并继续吗？');
  };
  const runEditorNavigation = (action) => {
    if (!confirmDiscardUnsaved()) return false;
    action();
    return true;
  };
  const switchWorkspaceLocale = (locale) => {
    const next = locale === 'en' ? 'en' : 'zh-CN';
    if (next === contentLocale) {
      setAppLocale(next);
      return true;
    }
    return runEditorNavigation(() => {
      setContentLocale(next);
      setAppLocale(next);
    });
  };
  const handleInspectorSelect = (key, source = 'editor') => {
    setSelectedInspectorElement(key);
    const elementMeta = getEditorElementMeta(key);
    const inspectorReadOnly = Boolean(elementMeta?.readOnly || (key === 'localizedName' && contentLocale !== 'en'));
    if (source === 'editor') setCompactPreviewOpen(true);
    if (!inspectorReadOnly) setActiveTool(null);
    if (source === 'preview' && !inspectorReadOnly) {
      const explicitScope = elementMeta?.scope;
      const targetScope = explicitScope || editorScope;
      if (targetScope !== editorScope) runEditorNavigation(() => setEditorScope(targetScope));
    }
  };
  const workflowScope = useMemo(() => {
    if (!workflowFilter) return { groupKeys: null, memberIds: null };
    if (workflowFilter.type === 'data') {
      return { groupKeys: new Set(workflowOverview.dataReview.groupKeysByStatus[workflowFilter.status] || []), memberIds: null };
    }
    const sourceIds = workflowFilter.type === 'blocked_reason'
      ? workflowOverview.locales[workflowFilter.locale]?.blockedNextActions?.[workflowFilter.reason]?.memberIds || []
      : workflowOverview.locales[workflowFilter.locale]?.memberIdsByState[workflowFilter.status] || [];
    const memberIds = new Set(sourceIds);
    const groupKeys = new Set();
    for (const id of memberIds) { const group = speciesGroupByMemberId.get(id); if (group) groupKeys.add(group.group_key); }
    return { groupKeys, memberIds };
  }, [workflowFilter, workflowOverview]);

  const applyWorkflowFilter = (next) => {
    if (!next) { setWorkflowFilter(null); return; }
    if (workflowFilter?.key === next.key) return;
    if (!confirmDiscardUnsaved()) return;
    setWorkflowFilter(next);
    if (next.type === 'readiness' || next.type === 'blocked_reason') {
      const firstId = next.type === 'blocked_reason'
        ? workflowOverview.locales[next.locale]?.blockedNextActions?.[next.reason]?.memberIds?.[0]
        : workflowOverview.locales[next.locale]?.memberIdsByState[next.status]?.[0];
      if (next.locale) setContentLocale(next.locale);
      if (firstId) { setSelectedId(firstId); setEditorScope('variant'); }
      return;
    }
    const firstGroupKey = workflowOverview.dataReview.groupKeysByStatus[next.status]?.[0];
    const firstGroup = speciesGroups.find((group) => group.group_key === firstGroupKey);
    if (firstGroup?.members?.[0]?.id) { setSelectedId(firstGroup.members[0].id); setEditorScope('variant'); }
  };

  const primaryWorkflowAction = (() => {
    const localeOverview = workflowOverview.locales?.[contentLocale] || {};
    if ((workflowOverview.dataReview?.pending || 0) > 0) {
      const count = workflowOverview.dataReview.pending;
      return {
        tone: 'issue',
        title: appLocale === 'en' ? `Resolve ${count} source-data issue${count === 1 ? '' : 's'} first` : `先处理 ${count} 个数据问题`,
        detail: appLocale === 'en' ? 'Duplicate/category decisions block editorial approval. Finish these before editing more pages.' : '重复记录或分类问题会阻塞后续审核。先完成这里，再继续改 SEO 内容。',
        cta: appLocale === 'en' ? 'Start data review' : '开始处理',
        run: () => applyWorkflowFilter({ key: 'data:pending', type: 'data', status: 'pending', label: appLocale === 'en' ? 'Data Review · Pending' : '数据复核 · 待处理' }),
      };
    }
    if ((localeOverview.ready_for_review || 0) > 0) {
      const count = localeOverview.ready_for_review;
      return {
        tone: 'review',
        title: appLocale === 'en' ? `${count} page${count === 1 ? '' : 's'} waiting for review` : `${count} 个页面等你审核`,
        detail: appLocale === 'en' ? 'Content is complete. Review the page and either approve Preview or return it to editing.' : '内容已经补齐。现在只需要人工检查并“批准预览”或退回编辑。',
        cta: appLocale === 'en' ? 'Review next page' : '审核下一页',
        run: () => applyWorkflowFilter({ key: `${contentLocale}:ready_for_review`, type: 'readiness', locale: contentLocale, status: 'ready_for_review', label: `${contentLocale === 'en' ? 'English' : '中文'} · ${appLocale === 'en' ? 'Awaiting Review' : '待审核'}` }),
      };
    }
    if ((localeOverview.publish_ready || 0) > 0) {
      const count = localeOverview.publish_ready;
      return {
        tone: 'ready',
        title: appLocale === 'en' ? `${count} page${count === 1 ? '' : 's'} ready for Staging Preview` : `${count} 个页面可以进入预发布`,
        detail: appLocale === 'en' ? 'These pages passed data, editorial and bilingual checks. Production is still locked.' : '这些页面已通过数据、内容和双语检查；正式发布仍然锁定。',
        cta: appLocale === 'en' ? 'View Preview-ready pages' : '查看可预览页面',
        run: () => applyWorkflowFilter({ key: `${contentLocale}:publish_ready`, type: 'readiness', locale: contentLocale, status: 'publish_ready', label: `${contentLocale === 'en' ? 'English' : '中文'} · ${appLocale === 'en' ? 'Preview-ready' : '可预览'}` }),
      };
    }
    return {
      tone: 'edit',
      title: appLocale === 'en' ? 'Continue the selected SEO page' : '继续完善当前 SEO 页面',
      detail: appLocale === 'en' ? 'Edit the page below. Open Preview only when you need to compare the rendered result.' : '继续编辑下方页面；需要对照效果时再打开“效果预览”。',
      cta: appLocale === 'en' ? 'Continue editing' : '继续编辑',
      run: () => document.querySelector('.studio-editor-area')?.scrollTo({ top: 0, behavior: 'smooth' }),
    };
  })();
  const currentWorkflowStage = ({ issue: 1, edit: 2, review: 3, ready: 4 })[primaryWorkflowAction.tone] || 2;

  const batchMembers = batchIds.map((id) => species.find((item) => item.id === id)).filter(Boolean);
  const batchGroup = batchMembers.length ? speciesGroupByMemberId.get(batchMembers[0].id) : null;
  const batchGroupKey = batchGroup ? groupSeoRowKey(batchGroup.group_key, contentLocale) : null;
  const batchGroupRecord = batchGroupKey
    ? groupPreviewRows[batchGroupKey] || groupSeoRows[batchGroupKey]
    : null;

  const exportPreviewSnapshot = () => {
    if (isReadOnlyDemoMode) {
      emitAdminNotice({ status: 'warning', title: appLocale === 'en' ? 'Read-only demo' : '当前是只读演示', detail: appLocale === 'en' ? 'A real Preview Snapshot is only exported from the authenticated Admin.' : '真实预览快照只能从已登录后台导出。' });
      return;
    }
    if (!selectedSpecies || !selectedGroup) {
      emitAdminNotice({ status: 'warning', title: appLocale === 'en' ? 'Select a Species first' : '请先选择物种', detail: appLocale === 'en' ? 'A selected Species is required.' : '导出前需要先选择一个物种页面。' });
      return;
    }
    if (publishReadiness?.state !== 'publish_ready') {
      emitAdminNotice({ status: 'warning', title: appLocale === 'en' ? 'Preview export blocked' : '预览导出被阻止', detail: publishReadiness?.blockers?.[0] || (appLocale === 'en' ? 'This page is not Preview-ready yet.' : '当前页面还没有达到可预览条件。'), duration: 7200 });
      return;
    }
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
    if (isReadOnlyDemoMode) {
      emitAdminNotice({ status: 'warning', title: appLocale === 'en' ? 'Read-only demo' : '当前是只读演示', detail: appLocale === 'en' ? 'Staging publish is not available in demo mode.' : '演示模式不会执行预发布。' });
      return;
    }
    if (!isRepoBackend) {
      emitAdminNotice({ status: 'error', title: appLocale === 'en' ? 'Staging publish unavailable' : '无法发布到预发布环境', detail: appLocale === 'en' ? 'The Repo-backed Admin backend is required.' : '当前不是可写的仓库后台。' });
      return;
    }
    if (!selectedSpecies || !selectedGroup) {
      emitAdminNotice({ status: 'warning', title: appLocale === 'en' ? 'Select a Species first' : '请先选择物种', detail: appLocale === 'en' ? 'A selected Species is required before publishing.' : '发布前需要先选择一个物种页面。' });
      return;
    }
    if (publishReadiness?.state !== 'publish_ready') {
      emitAdminNotice({ status: 'warning', title: appLocale === 'en' ? 'Staging publish blocked' : '预发布被阻止', detail: publishReadiness?.blockers?.[0] || (appLocale === 'en' ? 'This page is not Preview-ready yet.' : '当前页面还没有达到可预览条件。'), duration: 7200 });
      return;
    }
    setStagingPublishing(true);
    const canonicalTarget = selectedVariantRecord?.index_strategy === 'canonical_to_sibling'
      ? selectedVariantRecord.canonical_catalog_key
      : '';
    const catalogKeys = [...new Set([selectedSpecies.catalog_key, canonicalTarget].filter(Boolean))];
    const { error: publishError } = await publishRepoStaging({
      catalogKeys,
      groupKeys: [selectedGroup.group_key],
    });
    setStagingPublishing(false);
    if (publishError) {
      return;
    }
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
      title: appLocale === 'en' ? 'Resolve data issues' : '处理数据问题',
      subtitle: appLocale === 'en' ? 'Choose the action first; supporting evidence stays below.' : '先选择处理结论；判断依据统一放在下方。',
    },
    readiness: {
      title: t('editor.publishCheck'),
      subtitle: appLocale === 'en' ? 'See exactly what blocks or enables Controlled Preview.' : '查看阻塞项与受控预览条件。',
    },
    translation: {
      title: t('editor.translation'),
      subtitle: appLocale === 'en' ? 'Chinese source → AI suggestion → reviewed English Draft.' : '中文来源 → AI 建议 → 人工确认英文草稿。',
    },
    batch: {
      title: t('editor.batchSeo'),
      subtitle: appLocale === 'en' ? 'Create inherited Draft shells without copying Base content.' : '建立继承草稿，不复制基础模板文案。',
    },
    bulkReview: {
      title: appLocale === 'en' ? 'Bulk duplicate review' : '批量审核重复记录',
      subtitle: appLocale === 'en' ? 'Select multiple duplicate candidates and save one human decision batch atomically.' : '选择多组重复候选，一次确认并原子保存人工结论。',
    },
    bulkEditorial: {
      title: appLocale === 'en' ? 'Bulk content review' : '批量内容审核',
      subtitle: appLocale === 'en' ? 'Submit, approve, or return multiple completed pages without weakening review gates.' : '批量提交、批准或退回已完成页面，不绕过现有审核门禁。',
    },
    bulkImport: {
      title: appLocale === 'en' ? 'SEO template import' : 'SEO 模板导入',
      subtitle: appLocale === 'en' ? 'Download the AquaGuide template, fill it in Excel / Numbers, validate it, then import Draft changes.' : '下载 AquaGuide 模板，用 Excel / Numbers 回填，上传校验后批量导入草稿。',
    },
    history: {
      title: t('editor.history'),
      subtitle: appLocale === 'en' ? 'Versioned Base and Variant revision history.' : '带版本记录的基础模板 / 当前页面历史。',
    },
    workflow: {
      title: t('editor.workflow'),
      subtitle: appLocale === 'en' ? 'Navigate Data Review, editorial review and Preview-ready queues.' : '查看数据复核、内容审核和可预览页面。',
    },
  })[activeTool] || { title: '', subtitle: '' };


  const repoBackendBlocked = !isReadOnlyDemoMode && backendHealth?.ok && (
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
    if (isReadOnlyDemoMode) return;
    if (!confirmDiscardUnsaved()) return;
    setEditorDirty(false);
    await adminContentClient.auth.signOut();
    setSession(null);
  };

  if (!isReadOnlyDemoMode && !isAdminBackendConfigured) {
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
          <p className="security-note">{appLocale === 'en' ? `Status: ${backendHealth.repo_access_error || 'configuration incomplete'}. Drafts stay private; only sanitized staging snapshots cross into AquaGuide.` : `当前状态：${backendHealth.repo_access_error || '配置未完成'}。草稿保持私有，只有脱敏后的预发布快照会进入 AquaGuide。`}</p>
        </section>
      </main>
    );
  }
  if (backendHealth && !backendHealth.ok) return <main className="center-message">Repo Admin health check failed closed.</main>;
  if (!session) return <Login onSignedIn={setSession} />;
  if (role && role !== 'admin') return <Forbidden email={session.user.email} onSignOut={signOut} />;

  return (
    <div className="admin-shell workflow-compact">
      <header className="topbar">
        <div className="brand-row">
          <div className="brand-mark small">A</div>
          <div>
            <strong>{t('top.product')}</strong>
            <span>{t('top.section')}</span>
          </div>
        </div>
        <div className="topbar-actions">
          <span className={`connection-dot ${schemaReady && groupSchemaReady && historySchemaReady && dataReviewSchemaReady ? 'ready' : 'warning'}`}></span>
          <span className="topbar-mode-label">{isReadOnlyDemoMode ? (appLocale === 'en' ? 'Read-only demo · no writes' : '只读演示 · 不会写入') : t('top.admin')}</span>
          <span className="admin-email">{session.user.email}</span>
          <button type="button" className={`activity-trigger ${activityOpen ? 'active' : ''}`} onClick={() => {
            setActivityOpen(true);
            setActivityUnread(0);
            window.localStorage.setItem('aquaguide-admin-activity-seen-at', new Date().toISOString());
          }} aria-label={appLocale === 'en' ? 'Open activity center' : '打开操作中心'}>
            <span>{appLocale === 'en' ? 'Activity' : '操作记录'}</span>{activityUnread > 0 ? <b>{Math.min(activityUnread, 99)}</b> : null}
          </button>
          <InterfaceLanguageSwitch onLocaleChange={switchWorkspaceLocale} />
          <button className="ghost-button" type="button" onClick={signOut}>{t('top.signOut')}</button>
        </div>
      </header>

      {isReadOnlyDemoMode ? null : !schemaReady || !groupSchemaReady ? (
        <div className="schema-banner">
          <strong>安全隔离状态：</strong> {isRepoBackend ? '仓库内容存储当前不可写；可以继续预览继承结构，但保存被阻止。' : '当前页 / 基础模板 SEO 数据结构尚未全部应用；可以预览继承结构，但缺失的层级不会写入。'} 不会自动触碰正式环境。
        </div>
      ) : !historySchemaReady ? (
        <div className="schema-banner">
          <strong>版本安全门：</strong> 草稿编辑可用，但版本历史数据结构尚未应用；在历史记录与回滚可验证前正式发布继续锁定。
        </div>
      ) : !dataReviewSchemaReady ? (
        <div className="schema-banner">
          <strong>审核安全门：</strong> migration 007 尚未完整应用；Editorial Review / Data Review 不可用，Publish Readiness 保持 Blocked。
        </div>
      ) : null}

      <section className="workflow-command-center" aria-label={appLocale === 'en' ? 'SEO publishing workflow' : 'SEO 发布流程'} data-current-stage={currentWorkflowStage}>
        <div className="workflow-progress-summary" aria-label={appLocale === 'en' ? `Current stage ${currentWorkflowStage} of 4` : `当前第 ${currentWorkflowStage} 阶段，共 4 阶段`}>
          <span>{appLocale === 'en' ? 'PUBLISH FLOW' : '发布流程'}</span>
          <strong>{currentWorkflowStage}<small>/4</small></strong>
        </div>
        <nav className="workflow-stage-grid" aria-label={appLocale === 'en' ? 'Publishing stages' : '发布阶段'}>
          <button type="button" aria-current={currentWorkflowStage === 1 ? 'step' : undefined} aria-pressed={workflowFilter?.key === 'data:pending'} className={`workflow-stage-card ${currentWorkflowStage > 1 ? 'is-complete' : currentWorkflowStage === 1 ? 'is-current' : 'is-upcoming'} ${workflowFilter?.key === 'data:pending' ? 'filter-selected' : ''}`} onClick={() => applyWorkflowFilter({ key: 'data:pending', type: 'data', status: 'pending', label: appLocale === 'en' ? 'Data Review · Pending' : '数据复核 · 待处理' })}>
            <b>{currentWorkflowStage > 1 ? '✓' : '1'}</b><span><strong>{appLocale === 'en' ? 'Data review' : '数据复核'}</strong></span><em>{workflowOverview.dataReview.pending}</em>
          </button>
          <button type="button" aria-current={currentWorkflowStage === 2 ? 'step' : undefined} aria-pressed={workflowFilter?.key === `${contentLocale}:blocked`} className={`workflow-stage-card ${currentWorkflowStage > 2 ? 'is-complete' : currentWorkflowStage === 2 ? 'is-current' : 'is-upcoming'} ${workflowFilter?.key === `${contentLocale}:blocked` ? 'filter-selected' : ''}`} onClick={() => applyWorkflowFilter({ key: `${contentLocale}:blocked`, type: 'readiness', locale: contentLocale, status: 'blocked', label: `${contentLocale === 'en' ? 'English' : '中文'} · ${appLocale === 'en' ? 'Editing' : '内容编辑'}` })}>
            <b>{currentWorkflowStage > 2 ? '✓' : '2'}</b><span><strong>{appLocale === 'en' ? 'Edit content' : '内容编辑'}</strong></span><em>{workflowOverview.locales[contentLocale]?.blocked || 0}</em>
          </button>
          <button type="button" aria-current={currentWorkflowStage === 3 ? 'step' : undefined} aria-pressed={workflowFilter?.key === `${contentLocale}:ready_for_review`} className={`workflow-stage-card ${currentWorkflowStage > 3 ? 'is-complete' : currentWorkflowStage === 3 ? 'is-current' : 'is-upcoming'} ${workflowFilter?.key === `${contentLocale}:ready_for_review` ? 'filter-selected' : ''}`} onClick={() => applyWorkflowFilter({ key: `${contentLocale}:ready_for_review`, type: 'readiness', locale: contentLocale, status: 'ready_for_review', label: `${contentLocale === 'en' ? 'English' : '中文'} · ${appLocale === 'en' ? 'Awaiting Review' : '待审核'}` })}>
            <b>{currentWorkflowStage > 3 ? '✓' : '3'}</b><span><strong>{appLocale === 'en' ? 'Human review' : '人工审核'}</strong></span><em>{workflowOverview.locales[contentLocale]?.ready_for_review || 0}</em>
          </button>
          <button type="button" aria-current={currentWorkflowStage === 4 ? 'step' : undefined} aria-pressed={workflowFilter?.key === `${contentLocale}:publish_ready`} className={`workflow-stage-card ${currentWorkflowStage === 4 ? 'is-current' : 'is-upcoming'} ${workflowFilter?.key === `${contentLocale}:publish_ready` ? 'filter-selected' : ''}`} onClick={() => applyWorkflowFilter({ key: `${contentLocale}:publish_ready`, type: 'readiness', locale: contentLocale, status: 'publish_ready', label: `${contentLocale === 'en' ? 'English' : '中文'} · ${appLocale === 'en' ? 'Preview-ready' : '可预览'}` })}>
            <b>4</b><span><strong>{appLocale === 'en' ? 'Staging' : '预发布'}</strong></span><em>{workflowOverview.locales[contentLocale]?.publish_ready || 0}</em>
          </button>
        </nav>
        <div className="workflow-current-action" aria-label={appLocale === 'en' ? 'Current workflow action' : '当前流程操作'}>
          <span>{appLocale === 'en' ? `CURRENT · ${currentWorkflowStage}/4` : `当前 · ${currentWorkflowStage}/4`}</span>
          <strong>{primaryWorkflowAction.title}</strong>
          <button type="button" onClick={primaryWorkflowAction.run}>{primaryWorkflowAction.cta}</button>
        </div>
      </section>

      <div ref={setReviewPortalTarget} className="page-review-top-slot" aria-label={appLocale === 'en' ? 'Current page review controls' : '当前页面审核控制'} />

      <div className={`workspace studio-workspace ${compactPreviewOpen ? 'preview-split-open' : ''}`} style={{ '--preview-width': `${previewWidth}px` }}>
        <SpeciesGroupSidebar
          groups={speciesGroups}
          selectedId={selectedId}
          selectedScope={editorScope}
          batchIds={batchIds}
          batchMode={activeTool === 'batch'}
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

        <main className={`editor-area studio-editor-area scope-${editorScope}`}>
          <div className="editor-context-bar">
            <div className="editor-scope-switch" aria-label="Editor scope">
              <button type="button" aria-pressed={editorScope === 'base'} className={editorScope === 'base' ? 'active' : ''} onClick={() => editorScope === 'base' || runEditorNavigation(() => setEditorScope('base'))}>{t('editor.base')}</button>
              <button type="button" aria-pressed={editorScope === 'variant'} className={editorScope === 'variant' ? 'active' : ''} onClick={() => editorScope === 'variant' || runEditorNavigation(() => setEditorScope('variant'))}>{t('editor.currentPage')}</button>
            </div>
            <button type="button" className="compact-preview-toggle" aria-expanded={compactPreviewOpen} onClick={() => setCompactPreviewOpen((value) => !value)}>{appLocale === 'en' ? 'Preview' : '效果预览'}</button>
          </div>

          {editorScope === 'base' ? (
            <section className="editor-scope-context base compact-impact" aria-label={appLocale === 'en' ? 'Base template impact' : '基础模板影响范围'}>
              <div className="editor-scope-context-copy">
                <strong>{appLocale === 'en' ? 'Base template' : '基础模板'} · {selectedGroup?.base_scientific_name}</strong>
                <span>{appLocale === 'en' ? `Shared by ${selectedGroup?.member_count || 0} pages` : `修改会影响同组 ${selectedGroup?.member_count || 0} 个页面`}</span>
              </div>
            </section>
          ) : null}

          {editorScope === 'base' ? (
            <BaseSpeciesSeoEditor
              group={selectedGroup}
              record={selectedGroupPersisted}
              locale={contentLocale}
              schemaReady={groupSchemaReady}
              readOnly={isReadOnlyDemoMode}
              onPreview={(row) => setGroupPreviewRows((current) => ({ ...current, [groupSeoRowKey(row.group_key, row.locale)]: row }))}
              selectedInspectorElement={selectedInspectorElement}
              onInspectorSelect={(key) => handleInspectorSelect(key, 'editor')}
              onDirtyChange={setEditorDirty}
              publishReadinessState={publishReadiness?.state || 'blocked'}
              stagingPublishing={stagingPublishing}
              onPublishStaging={publishSelectedToStaging}
              onOpenReadiness={() => setActiveTool('readiness')}
              onEditBase={() => runEditorNavigation(() => setEditorScope('base'))}
              reviewPortalTarget={reviewPortalTarget}
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
              readOnly={isReadOnlyDemoMode}
              onLivePreviewChange={setLivePreview}
              selectedInspectorElement={selectedInspectorElement}
              onInspectorSelect={(key) => handleInspectorSelect(key, 'editor')}
              onDirtyChange={setEditorDirty}
              publishReadinessState={publishReadiness?.state || 'blocked'}
              stagingPublishing={stagingPublishing}
              onPublishStaging={publishSelectedToStaging}
              onOpenReadiness={() => setActiveTool('readiness')}
              reviewPortalTarget={reviewPortalTarget}
              onSaved={(row) => {
                setSeoRows((current) => ({ ...current, [seoRowKey(row.catalog_key, row.locale)]: row }));
                setRevisionRefreshKey((current) => current + 1);
              }}
            />
          )}

          <details className="advanced-tools-disclosure">
            <summary>
              <span><strong>{appLocale === 'en' ? 'More tools' : '更多工具'}</strong><small>{appLocale === 'en' ? 'Batch, history, translation and diagnostics' : '批量、历史、翻译与诊断工具'}</small></span>
              <em>{appLocale === 'en' ? 'Open' : '展开'}</em>
            </summary>
            <div className="editor-secondary-tools editor-tool-launchers">
            {selectedDataReviewSummary.open > 0 ? (
              <button type="button" className={`editor-tool-row issue ${activeTool === 'dataReview' ? 'active' : ''}`} onClick={() => setActiveTool('dataReview')}>
                <span><strong>{t('editor.sourceReview')}</strong><small>{appLocale === 'en' ? 'Source evidence still requires a human decision' : '仍有需要人工判断的源数据证据'}</small></span>
                <em>{selectedDataReviewSummary.open}</em>
              </button>
            ) : null}
            <button type="button" className={`editor-tool-row readiness ${activeTool === 'readiness' ? 'active' : ''}`} onClick={() => setActiveTool('readiness')}>
              <span><strong>{t('editor.publishCheck')}</strong><small>{appLocale === 'en' ? 'Controlled Preview eligibility' : '受控预览资格检查'}</small></span>
              <em className={publishReadiness?.state || 'blocked'}>{publishReadiness?.state || 'blocked'}</em>
            </button>
            {contentLocale === 'en' ? (
              <button type="button" className={`editor-tool-row ${activeTool === 'translation' ? 'active' : ''}`} onClick={() => setActiveTool('translation')}>
                <span><strong>{t('editor.translation')}</strong><small>{appLocale === 'en' ? 'Chinese source → English Draft' : '中文来源 → 英文草稿'}</small></span><b>›</b>
              </button>
            ) : null}
            {batchGroup && batchMembers.length > 1 ? (
              <button type="button" className={`editor-tool-row ${activeTool === 'batch' ? 'active' : ''}`} onClick={() => setActiveTool('batch')}>
                <span><strong>{t('editor.batchSeo')}</strong><small>{batchMembers.length} {appLocale === 'en' ? 'selected records' : '条已选择记录'}</small></span><b>›</b>
              </button>
            ) : null}
            <button type="button" className={`editor-tool-row ${activeTool === 'bulkReview' ? 'active' : ''}`} onClick={() => setActiveTool('bulkReview')}>
              <span><strong>{appLocale === 'en' ? 'Bulk duplicate review' : '批量审核重复记录'}</strong><small>{appLocale === 'en' ? `${pendingDuplicateReviewCount} duplicate groups waiting` : `${pendingDuplicateReviewCount} 组重复候选待处理`}</small></span><em>{pendingDuplicateReviewCount}</em>
            </button>
            <button type="button" className={`editor-tool-row ${activeTool === 'bulkEditorial' ? 'active' : ''}`} onClick={() => setActiveTool('bulkEditorial')}>
              <span><strong>{appLocale === 'en' ? 'Bulk content review' : '批量内容审核'}</strong><small>{appLocale === 'en' ? 'Submit / approve / return multiple completed pages' : '批量提交 / 批准 / 退回已完成页面'}</small></span><em>{workflowOverview.locales[contentLocale].ready_for_review}</em>
            </button>
            <button type="button" className={`editor-tool-row ${activeTool === 'bulkImport' ? 'active' : ''}`} onClick={() => setActiveTool('bulkImport')}>
              <span><strong>{appLocale === 'en' ? 'SEO template import' : 'SEO 模板导入'}</strong><small>{appLocale === 'en' ? 'Download template → fill in Excel / Numbers → upload' : '下载模板 → Excel / Numbers 回填 → 上传校验'}</small></span><b>›</b>
            </button>
            <button type="button" className={`editor-tool-row ${activeTool === 'history' ? 'active' : ''}`} onClick={() => setActiveTool('history')}>
              <span><strong>{t('editor.history')}</strong><small>Base / Variant revision</small></span><b>›</b>
            </button>
            <button type="button" className={`editor-tool-row ${activeTool === 'workflow' ? 'active' : ''}`} onClick={() => setActiveTool('workflow')}>
              <span><strong>{t('editor.workflow')}</strong><small>{appLocale === 'en' ? 'Data Review / Editorial / Preview-ready' : '数据复核 / 内容审核 / 可预览'}</small></span><b>›</b>
            </button>
            </div>
          </details>


        </main>

        <EditorToolDrawer open={Boolean(activeTool)} title={toolDrawerMeta.title} subtitle={toolDrawerMeta.subtitle} size={activeTool === 'dataReview' ? 'wide' : 'default'} onClose={() => setActiveTool(null)}>
            {activeTool === 'bulkReview' ? (
              <BulkDuplicateReviewPanel
                groups={speciesGroups}
                reviewRows={dataReviewRows}
                seoRows={seoRows}
                groupSeoRows={groupSeoRows}
                locale={contentLocale}
                schemaReady={dataReviewSchemaReady}
                readOnly={isReadOnlyDemoMode}
                onCompleted={(result) => {
                  const reviews = result?.reviews || [];
                  const rows = result?.seo_rows || [];
                  if (reviews.length) setDataReviewRows((current) => ({ ...current, ...Object.fromEntries(reviews.map((row) => [row.issue_key, row])) }));
                  if (rows.length) setSeoRows((current) => ({ ...current, ...Object.fromEntries(rows.map((row) => [seoRowKey(row.catalog_key, row.locale), row])) }));
                  if (rows.length) setRevisionRefreshKey((current) => current + 1);
                }}
              />
            ) : null}
            {activeTool === 'bulkEditorial' ? (
              <BulkEditorialReviewPanel
                species={species}
                groups={speciesGroups}
                seoRows={seoRows}
                groupSeoRows={groupSeoRows}
                workflowOverview={workflowOverview}
                locale={contentLocale}
                importBatch={currentImportBatch}
                schemaReady={schemaReady && groupSchemaReady && dataReviewSchemaReady}
                readOnly={isReadOnlyDemoMode}
                onCompleted={(result) => {
                  const variantRows = result?.species_seo || [];
                  const baseRows = result?.species_seo_groups || [];
                  if (variantRows.length) setSeoRows((current) => ({ ...current, ...Object.fromEntries(variantRows.map((row) => [seoRowKey(row.catalog_key, row.locale), row])) }));
                  if (baseRows.length) setGroupSeoRows((current) => ({ ...current, ...Object.fromEntries(baseRows.map((row) => [groupSeoRowKey(row.group_key, row.locale), row])) }));
                  if (result?.import_batch) upsertImportBatch(result.import_batch);
                  if (variantRows.length || baseRows.length) setRevisionRefreshKey((current) => current + 1);
                }}
              />
            ) : null}
            {activeTool === 'dataReview' ? (
              <DataReviewPanel
                group={selectedGroup}
                reviewRows={dataReviewRows}
                seoRows={seoRows}
                groupSeoRows={groupSeoRows}
                locale={contentLocale}
                schemaReady={dataReviewSchemaReady}
                readOnly={isReadOnlyDemoMode}
                onDefer={() => setActiveTool(null)}
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
              <PublishReadinessPanel readiness={publishReadiness} locale={getLocaleLabel(contentLocale)} readOnly={isReadOnlyDemoMode} onExportPreview={exportPreviewSnapshot} onPublishStaging={publishSelectedToStaging} stagingPublishing={stagingPublishing} repoMode={isRepoBackend} />
            ) : null}
            {activeTool === 'translation' && contentLocale === 'en' ? (
              <TranslationPanel
                species={selectedSpecies}
                group={selectedGroup}
                sourceVariantRow={sourceVariantRow}
                sourceGroupRow={sourceGroupRow}
                targetVariantRow={englishVariantRow}
                targetGroupRow={englishGroupRow}
                readOnly={isReadOnlyDemoMode}
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
                readOnly={isReadOnlyDemoMode}
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
                reviewRows={dataReviewRows}
                locale={contentLocale}
                schemaReady={schemaReady}
                readOnly={isReadOnlyDemoMode}
                onImported={(result) => {
                  const rows = result?.species_seo || [];
                  const baseRows = result?.species_seo_groups || [];
                  if (rows.length) setSeoRows((current) => ({ ...current, ...Object.fromEntries(rows.map((row) => [seoRowKey(row.catalog_key, row.locale), row])) }));
                  if (baseRows.length) setGroupSeoRows((current) => ({ ...current, ...Object.fromEntries(baseRows.map((row) => [groupSeoRowKey(row.group_key, row.locale), row])) }));
                  if (result?.import_batch) upsertImportBatch(result.import_batch);
                  if (rows.length || baseRows.length) setRevisionRefreshKey((current) => current + 1);
                }}
              />
            ) : null}
            {activeTool === 'history' ? (
              <div className="revision-grid drawer-revision-grid">
                <RevisionHistoryPanel
                  resourceType="species_seo_group" resourceKey={selectedGroup?.group_key || ''} locale={contentLocale}
                  schemaReady={historySchemaReady} readOnly={isReadOnlyDemoMode} refreshKey={revisionRefreshKey}
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
                  schemaReady={historySchemaReady} readOnly={isReadOnlyDemoMode} refreshKey={revisionRefreshKey}
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

        <div
          className="preview-resize-handle"
          role="separator"
          aria-orientation="vertical"
          aria-label={appLocale === 'en' ? 'Resize editor and preview' : '调整编辑与预览宽度'}
          tabIndex={compactPreviewOpen ? 0 : -1}
          onPointerDown={(event) => { event.preventDefault(); setPreviewResizing(true); }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') setPreviewWidth((value) => Math.min(560, value + 20));
            if (event.key === 'ArrowRight') setPreviewWidth((value) => Math.max(340, value - 20));
          }}
        ><span /></div>
        <LiveFrontendPreview
          preview={activeLivePreview}
          readiness={publishReadiness}
          readOnly={isReadOnlyDemoMode}
          onGeneratePreview={exportPreviewSnapshot}
          selectedElement={selectedInspectorElement}
          onSelectElement={(key) => handleInspectorSelect(key, 'preview')}
          editorScope={editorScope}
          compactOpen={compactPreviewOpen}
          onCloseCompact={() => setCompactPreviewOpen(false)}
        />
      </div>
      <ActivityCenter
        open={activityOpen}
        refreshKey={activityRefreshKey}
        onClose={() => setActivityOpen(false)}
        readOnly={isReadOnlyDemoMode}
        onLoaded={() => {
          setActivityUnread(0);
          window.localStorage.setItem('aquaguide-admin-activity-seen-at', new Date().toISOString());
        }}
      />
    </div>
  );
}
