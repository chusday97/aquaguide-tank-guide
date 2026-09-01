import { ArrowLeft, Database, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const seoAdminUrl = import.meta.env.VITE_SEO_ADMIN_URL
  || (import.meta.env.DEV ? 'http://127.0.0.1:3010/' : '/admin/seo/');

export default function AdminHub() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[100dvh] bg-[#e8efec] p-4 text-ink md:p-8">
      <div className="mx-auto max-w-[1040px]">
        <header className="flex items-center gap-3">
          <button type="button" aria-label="返回 AquaGuide" onClick={() => navigate('/aquarium')} className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white shadow-sm hover:bg-bg">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AquaGuide Admin</div>
            <h1 className="mt-1 text-2xl font-black">管理后台</h1>
          </div>
        </header>

        <p className="mt-6 max-w-[760px] text-sm font-semibold leading-6 text-ink/60">
          SEO 编辑与 Product Truth / 养护内容使用不同的数据权威。请选择要管理的内容类型，避免在错误的后台修改字段。
        </p>

        <main className="mt-6 grid gap-4 md:grid-cols-2">
          <a href={seoAdminUrl} className="group rounded-[26px] border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Search className="h-6 w-6" />
            </div>
            <div className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-emerald-700">SEO Content</div>
            <h2 className="mt-1 text-xl font-black">Species SEO</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-ink/55">
              管理 Title、Meta、H1、Intro、Image Alt、Base / Variant、中文 / English、Review 与发布准备度。
            </p>
            <div className="mt-5 text-sm font-black text-emerald-700">打开 SEO 内容后台 →</div>
          </a>

          <button type="button" onClick={() => navigate('/admin/product-content')} className="group rounded-[26px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Database className="h-6 w-6" />
            </div>
            <div className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-slate-500">Product / Care Content</div>
            <h2 className="mt-1 text-xl font-black">Product Truth 与养护内容</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-ink/55">
              管理业务物种数据、公开 Product Content、养护文章和资源。这里不是 Species SEO 编辑入口。
            </p>
            <div className="mt-5 text-sm font-black text-slate-700">打开业务内容后台 →</div>
          </button>
        </main>

        <section className="mt-5 rounded-[22px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold leading-6 text-amber-950">
          <strong className="font-black">Authority rule：</strong>
          Product Truth 的水温、pH、缸体、难度、图片等不在 SEO 后台修改；SEO Title、Meta、H1、Intro、Alt 等不在 Product Content 后台修改。
        </section>
      </div>
    </div>
  );
}
