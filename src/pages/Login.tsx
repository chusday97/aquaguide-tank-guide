import { Cloud, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


export default function Login() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#dfe8e5] px-4 py-8 text-ink">
      <main className="w-full max-w-[460px] rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_24px_70px_rgba(27,77,62,0.14)]">
        <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-800 text-white"><Cloud className="h-6 w-6" /></span>
        <div className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-800">{isEn ? 'COMING SOON' : '功能建设中'}</div>
        <h1 className="mt-3 text-[24px] font-black">{isEn ? 'AquaGuide cloud sync' : 'AquaGuide 云端同步'}</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-ink/55">
          {isEn ? 'Sign-in will later sync tanks, species, favorites and care history across devices. For now, AquaGuide continues to save your working data on this device.' : '未来登录后可跨设备同步鱼缸、物种、收藏和养护记录。当前版本继续使用本设备数据，暂不开放未完全闭环的登录与迁移流程。'}
        </p>
        <button type="button" onClick={() => navigate('/aquarium', { replace: true })} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-800 px-4 text-sm font-black text-white">
          <ChevronLeft className="h-4 w-4" />{isEn ? 'Back to my tank' : '返回我的鱼缸'}
        </button>
      </main>
    </div>
  );
}
