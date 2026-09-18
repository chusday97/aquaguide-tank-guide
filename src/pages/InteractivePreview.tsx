import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { activateInteractivePreview, getPreviewRoute, type PreviewModule } from '../services/preview/preview-session.service';

const normalizeModule = (value: string | null): PreviewModule => (
  value === 'encyclopedia' || value === 'care' || value === 'collection' ? value : 'aquarium'
);

export default function InteractivePreview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const module = normalizeModule(searchParams.get('module'));

  useEffect(() => {
    activateInteractivePreview(module);
    navigate(getPreviewRoute(module), { replace: true });
  }, [module, navigate]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#dfe8e5] px-6 text-center text-ink">
      <div className="rounded-[28px] border border-white/80 bg-white/80 px-7 py-8 shadow-sm backdrop-blur-xl" data-preview-ready="false">
        <p className="text-[11px] font-black tracking-[0.16em] text-emerald-700">AQUAGUIDE · FORMAL PREVIEW</p>
        <h1 className="mt-3 font-serif text-2xl font-black text-emerald-950">正在打开正式页面</h1>
        <p className="mt-2 text-sm font-semibold text-ink/55">演示数据仅保存在当前预览端口，不会写入生产鱼缸。</p>
        <p className="mt-4 text-[10px] font-black tracking-[0.08em] text-ink/40">{__AQUAGUIDE_PREVIEW_METADATA__.branch} · {__AQUAGUIDE_PREVIEW_METADATA__.sha}</p>
      </div>
    </main>
  );
}
