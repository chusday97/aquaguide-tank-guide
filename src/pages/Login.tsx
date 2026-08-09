import { Cloud, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#dfe8e5] px-4 py-8 text-ink">
      <main className="w-full max-w-[480px] rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_24px_70px_rgba(27,77,62,0.14)]">
        <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-50 text-emerald-800"><Cloud className="h-6 w-6" /></span>
        <div className="mt-5 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">{isEn ? 'Under construction' : '功能建设中'}</div>
        <h1 className="mt-3 text-[24px] font-black leading-tight text-ink">{isEn ? 'AquaGuide cloud sync' : 'AquaGuide 云端同步'}</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-ink/58">{isEn ? 'When this feature is ready, signing in will sync aquariums, favorites, care history and share links across devices. For now, AquaGuide keeps your working data on this device and does not expose the unfinished sign-in flow.' : '功能完成后，登录会用于跨设备同步鱼缸、收藏、养护记录和分享链接。当前版本继续使用本设备数据，不开放尚未闭环的正式登录流程。'}</p>
        <button type="button" onClick={() => navigate(-1)} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-800 px-5 text-sm font-black text-white hover:bg-emerald-900"><ChevronLeft className="h-4 w-4" />{isEn ? 'Go back' : '返回'}</button>
      </main>
    </div>
  );
}
