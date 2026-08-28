import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from './supabase.js';
import SpeciesGroupSidebar from './SpeciesGroupSidebar.jsx';
import BatchSeoEditor from './BatchSeoEditor.jsx';
import { catalogSpecies, speciesGroups, speciesGroupByMemberId } from './speciesGroups.js';

const isReviewMode = import.meta.env.VITE_ADMIN_REVIEW_MODE === 'true';

const emptySeo = {
  seoTitle: '',
  metaDescription: '',
  h1: '',
  intro: '',
  imageAlt: '',
  canonicalPath: '',
  focusKeyword: '',
  status: 'draft',
};

const fromSeoRow = (row, species) => ({
  seoTitle: row?.seo_title || `${species?.name || ''} Care Guide | AquaGuide`,
  metaDescription: row?.meta_description || '',
  h1: row?.h1 || `${species?.name || ''} Care Guide`,
  intro: row?.intro || '',
  imageAlt: row?.image_alt || '',
  canonicalPath: row?.canonical_path || `/species/${species?.catalog_key || ''}`,
  focusKeyword: row?.focus_keyword || species?.name || '',
  status: row?.status || 'draft',
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

function SeoEditor({ species, record, schemaReady, readOnly = false, onSaved }) {
  const [form, setForm] = useState(emptySeo);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(fromSeoRow(record, species));
  }, [record, species]);

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

  const save = async () => {
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
      locale: 'zh-CN',
      seo_title: form.seoTitle.trim(),
      meta_description: form.metaDescription.trim(),
      h1: form.h1.trim(),
      intro: form.intro.trim(),
      image_alt: form.imageAlt.trim(),
      canonical_path: form.canonicalPath.trim(),
      focus_keyword: form.focusKeyword.trim(),
      status: form.status,
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
          <p className="eyebrow">SPECIES SEO</p>
          <h2>{species.name}</h2>
          <p className="scientific-name">{species.scientific_name}</p>
        </div>
        <div className="editor-statuses">
          <span className={`status-pill ${species.status}`}>Species: {species.status}</span>
          <span className={`status-pill ${form.status}`}>SEO: {form.status}</span>
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
            <label>
              SEO Title <span>{form.seoTitle.length}/60</span>
              <input value={form.seoTitle} maxLength={120} onChange={(event) => update('seoTitle', event.target.value)} />
            </label>
            <label>
              Meta Description <span>{form.metaDescription.length}/160</span>
              <textarea rows="3" value={form.metaDescription} maxLength={320} onChange={(event) => update('metaDescription', event.target.value)} />
            </label>
            <label>
              页面 H1
              <input value={form.h1} onChange={(event) => update('h1', event.target.value)} />
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
            <label>
              SEO Intro
              <textarea rows="7" value={form.intro} onChange={(event) => update('intro', event.target.value)} />
            </label>
            <label>
              Hero Image Alt
              <input value={form.imageAlt} onChange={(event) => update('imageAlt', event.target.value)} />
            </label>
            <label>
              Canonical Path
              <input value={form.canonicalPath} onChange={(event) => update('canonicalPath', event.target.value)} />
            </label>
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
              <div className="preview-domain">aquaguide · {form.canonicalPath || `/species/${species.catalog_key}`}</div>
              <div className="preview-title">{form.seoTitle || species.name}</div>
              <div className="preview-description">{form.metaDescription || '尚未填写 Meta Description。'}</div>
            </div>
            <div className="seo-checks">
              <div><span className={form.seoTitle.length > 0 && form.seoTitle.length <= 60 ? 'check good' : 'check'}>•</span> Title {form.seoTitle.length > 60 ? '过长' : form.seoTitle ? '已填写' : '缺失'}</div>
              <div><span className={form.metaDescription.length > 0 && form.metaDescription.length <= 160 ? 'check good' : 'check'}>•</span> Description {form.metaDescription.length > 160 ? '过长' : form.metaDescription ? '已填写' : '缺失'}</div>
              <div><span className={form.h1 ? 'check good' : 'check'}>•</span> H1 {form.h1 ? '已填写' : '缺失'}</div>
              <div><span className={form.imageAlt ? 'check good' : 'check'}>•</span> Image Alt {form.imageAlt ? '已填写' : '缺失'}</div>
            </div>
          </div>
        </aside>
      </div>

      <div className="editor-footer">
        <div>
          {!schemaReady ? <span className="warning-text">Schema 未应用：保存会被阻止</span> : null}
          {message ? <span className="save-message">{message}</span> : null}
        </div>
        <div className="footer-actions">
          <select value={form.status} onChange={(event) => update('status', event.target.value)} aria-label="SEO status">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button className="primary-button compact" type="button" onClick={save} disabled={saving || readOnly}>{readOnly ? '只读预览' : saving ? '保存中…' : '保存 SEO'}</button>
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
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [batchIds, setBatchIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schemaReady, setSchemaReady] = useState(true);

  useEffect(() => {
    if (isReviewMode) {
      setSession({ user: { id: 'review-only', email: 'review@aquaguide.local' } });
      setRole('admin');
      setSpecies(catalogSpecies);
      setSelectedId(catalogSpecies[0]?.id || null);
      setSchemaReady(false);
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
        .select('*')
        .is('deleted_at', null);

      if (seoError) {
        setSchemaReady(false);
      } else {
        setSchemaReady(true);
        setSeoRows(Object.fromEntries((seoData || []).map((row) => [row.catalog_key, row])));
      }
      setLoading(false);
    };

    loadAdminData();
  }, [session]);

  const selectedSpecies = species.find((item) => item.id === selectedId) || null;
  const batchMembers = batchIds.map((id) => species.find((item) => item.id === id)).filter(Boolean);
  const batchGroup = batchMembers.length ? speciesGroupByMemberId.get(batchMembers[0].id) : null;

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
        <div className="topbar-actions">
          <span className={`connection-dot ${schemaReady ? 'ready' : 'warning'}`}></span>
          <span>{isReviewMode ? 'Read-only UI review' : schemaReady ? 'SEO schema ready' : 'SEO schema pending'}</span>
          <span className="admin-email">{session.user.email}</span>
          <button className="ghost-button" type="button" onClick={signOut}>退出</button>
        </div>
      </header>

      {isReviewMode ? (
        <div className="schema-banner">
          <strong>只读 UI Review：</strong> 当前远程预览不连接任何 Supabase 写入环境。可以搜索 486 条 Species、体验编辑器和 Google Preview，但保存被硬禁用。
        </div>
      ) : !schemaReady ? (
        <div className="schema-banner">
          <strong>安全隔离状态：</strong> 这个分支包含 `species_seo` migration，但当前数据库尚未应用，所以可以预览编辑器，不能写入 SEO。不会自动触碰 Production。
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
          {batchGroup && batchMembers.length > 1 ? (
            <BatchSeoEditor
              group={batchGroup}
              members={batchMembers}
              existingRows={seoRows}
              schemaReady={schemaReady}
              readOnly={isReviewMode}
              onClear={() => setBatchIds([])}
              onSaved={(rows) => setSeoRows((current) => ({
                ...current,
                ...Object.fromEntries(rows.map((row) => [row.catalog_key, row])),
              }))}
            />
          ) : null}
          <SeoEditor
            species={selectedSpecies}
            record={selectedSpecies ? seoRows[selectedSpecies.catalog_key] : null}
            schemaReady={schemaReady}
            readOnly={isReviewMode}
            onSaved={(row) => setSeoRows((current) => ({ ...current, [row.catalog_key]: row }))}
          />
        </main>
      </div>
    </div>
  );
}
