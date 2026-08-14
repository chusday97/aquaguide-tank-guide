import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, Heart, HeartOff, Info, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { fishData } from '../data/fishData';
import { getCareTaxonomyPath, getLifeType, getSpeciesRoleLabel } from '../modules/species/species.service';
import { evaluateSpeciesForAquarium, getCurrentLivestockForAquarium } from '../lib/speciesFitEngine';
import { getSpeciesDisplayImage, getSpeciesImageClass, getSpeciesImageSurfaceClass } from '../lib/speciesVisual';
import { AdaptiveDetailContent } from './common/AdaptiveDetailContent';
import { ResilientImage } from './common/ResilientImage';
import { SurfaceHeader } from './common/SurfaceHeader';
import type { SpeciesDetailDialogProps } from './SpeciesDetailDialog.types';

const getStatusCopy = (status: ReturnType<typeof evaluateSpeciesForAquarium>['status'], isEn: boolean) => {
  if (status === 'suitable') return {
    title: isEn ? 'Fits the current tank' : '当前条件基本适合',
    tone: 'border-emerald-100 bg-emerald-50/85',
    icon: CheckCircle2,
  };
  if (status === 'unsuitable') return {
    title: isEn ? 'Current conditions do not fit' : '当前条件不适合',
    tone: 'border-red-100 bg-red-50/85',
    icon: AlertTriangle,
  };
  if (status === 'adjustable') return {
    title: isEn ? 'Check these conditions first' : '加入前需要确认',
    tone: 'border-amber-100 bg-amber-50/85',
    icon: AlertTriangle,
  };
  return {
    title: isEn ? 'Tank context is incomplete' : '鱼缸信息还不完整',
    tone: 'border-sky-100 bg-sky-50/85',
    icon: Info,
  };
};

export function NonAnimalSpeciesDetailDialog({
  fish,
  open,
  source,
  aquariumContext,
  imageSrc,
  owned,
  inWishlist,
  detailFeedback,
  finalFocusElement,
  onOpenChange,
  onAddToTank,
  onToggleWishlist,
  onViewInTank,
  onOpenTankSettings,
}: SpeciesDetailDialogProps) {
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const lifeType = fish ? getLifeType(fish) : null;
  const isPlant = lifeType === 'plant';
  const isHardscape = lifeType === 'hardscape';
  const taxonomy = fish ? getCareTaxonomyPath(fish) : null;
  const role = fish ? getSpeciesRoleLabel(fish, isEn) : '';
  const currentLivestock = useMemo(
    () => getCurrentLivestockForAquarium(aquariumContext, fishData),
    [aquariumContext],
  );
  const fit = useMemo(
    () => fish ? evaluateSpeciesForAquarium(fish, aquariumContext, currentLivestock) : null,
    [aquariumContext, currentLivestock, fish],
  );

  if (!fish || (!isPlant && !isHardscape) || !fit) return null;

  const statusCopy = getStatusCopy(fit.status, isEn);
  const StatusIcon = statusCopy.icon;
  const resolvedImage = imageSrc || getSpeciesDisplayImage(fish);
  const importantItems = [
    ...fit.hardBlocks,
    ...fit.warnings,
    ...fit.confirmations,
    ...fit.matchedItems,
  ].filter((item, index, items) => items.findIndex(other => other.type === item.type) === index).slice(0, 4);

  const plantInputs = fish.feedingProfile?.recommendedFoods || fish.diet || (isEn ? 'No structured care input recorded' : '暂无结构化养护输入');
  const plantRoutine = fish.feedingProfile?.feedingFrequency || (isEn ? 'Follow growth and water-condition changes' : '根据生长状态和水质变化调整');
  const plantApplication = fish.feedingProfile?.portionRule || (isEn ? 'Start conservatively and observe response' : '从保守用量开始并观察状态');
  const plantAvoid = fish.feedingProfile?.avoidFoods || (isEn ? 'Avoid abrupt parameter changes and overdosing' : '避免水质骤变和过量添加');

  const environmentItems = isPlant
    ? [
        { label: isEn ? 'Temperature' : '水温', value: fish.waterTemperature },
        { label: isEn ? 'Water' : '水体', value: taxonomy?.waterType || fish.category },
        { label: isEn ? 'Role' : '造景定位', value: role },
        { label: isEn ? 'Care cycle' : '养护周期', value: isEn ? `Review about every ${fish.waterChangeCycle} days` : `约每 ${fish.waterChangeCycle} 天结合换水检查` },
      ]
    : [
        { label: isEn ? 'Type' : '类型', value: fish.category },
        { label: isEn ? 'Role' : '造景用途', value: role },
        { label: isEn ? 'Livestock load' : '活体负载', value: isEn ? 'Not counted' : '不计入' },
        { label: isEn ? 'Placement' : '摆放', value: isEn ? 'Check stability and edges' : '确认稳定性与尖锐边缘' },
      ];

  const mainActionLabel = owned
    ? (source === 'aquarium' ? (isEn ? 'View in tank' : '查看缸内记录') : (isEn ? 'Go to my tank' : '前往我的鱼缸'))
    : !aquariumContext
      ? (isEn ? 'Select a tank first' : '先选择鱼缸')
      : fit.status === 'unsuitable'
        ? (isEn ? 'Review tank conditions' : '查看需要调整的条件')
        : (isEn ? 'Add to current tank' : '加入当前鱼缸');

  const handleMainAction = () => {
    if (owned) {
      onViewInTank?.();
      return;
    }
    if (!aquariumContext || fit.status === 'unsuitable') {
      onOpenTankSettings?.('parameters');
      return;
    }
    onAddToTank?.(fish);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AdaptiveDetailContent showCloseButton={false} finalFocus={finalFocusElement ? () => finalFocusElement : undefined}>
        <div className="flex min-h-0 flex-1 flex-col bg-white" data-species-detail-life-type={lifeType}>
          <SurfaceHeader
            className="modalHeader species-detail-header"
            title={isPlant ? (isEn ? 'Plant profile' : '水草档案') : (isEn ? 'Hardscape profile' : '造景档案')}
            onClose={() => onOpenChange(false)}
            closeLabel={isEn ? 'Close' : '关闭'}
          />

          <div className="modalBody app-scrollbar-hidden p-0">
            <div className="p-3 min-[760px]:p-5">
              <section className="overflow-hidden rounded-[24px] border border-border bg-gradient-to-br from-white via-sky-50/45 to-emerald-50/55 shadow-sm">
                <div className="grid min-w-0 grid-cols-1 min-[760px]:grid-cols-[minmax(250px,0.9fr)_minmax(0,1.1fr)]">
                  <div className="min-w-0 p-2 min-[760px]:p-4">
                    <div className={`flex h-[150px] items-center justify-center rounded-[18px] border border-border/70 min-[760px]:h-[300px] ${getSpeciesImageSurfaceClass(fish)} p-3`}>
                      <ResilientImage src={resolvedImage} alt={fish.name} className={`h-full w-full object-contain ${getSpeciesImageClass(fish)}`} />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-col p-3 min-[760px]:justify-center min-[760px]:p-6">
                    <DialogTitle className="break-words font-serif text-[21px] font-bold italic leading-tight text-ink min-[760px]:text-[30px]">{fish.name}</DialogTitle>
                    <DialogDescription className="mt-0.5 text-[11px] font-medium text-ink/55">{fish.scientificName}</DialogDescription>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {[taxonomy?.variety, role].filter(Boolean).map(tag => <span key={tag} className="rounded-full border border-border bg-white px-2 py-1 text-[10px] font-bold text-ink/60">{tag}</span>)}
                    </div>

                    <section className="mt-3 rounded-[16px] border border-emerald-100 bg-emerald-50/65 p-3" data-non-livestock-care-summary>
                      <h3 className="text-[11px] font-black text-emerald-950">{isPlant ? (isEn ? 'Care at a glance' : '养护速览') : (isEn ? 'Placement at a glance' : '摆放速览')}</h3>
                      {isPlant ? (
                        <div className="mt-2 grid gap-2 text-[10px] font-semibold leading-4 text-ink/62 sm:grid-cols-2">
                          <div className="rounded-[10px] bg-white/85 px-2.5 py-2"><strong className="block text-ink/78">{isEn ? 'Inputs' : '养护输入'}</strong>{plantInputs}</div>
                          <div className="rounded-[10px] bg-white/85 px-2.5 py-2"><strong className="block text-ink/78">{isEn ? 'Routine' : '维护频率'}</strong>{plantRoutine}</div>
                          <div className="rounded-[10px] bg-white/85 px-2.5 py-2"><strong className="block text-ink/78">{isEn ? 'Application' : '用量提示'}</strong>{plantApplication}</div>
                          <div className="rounded-[10px] bg-white/85 px-2.5 py-2"><strong className="block text-ink/78">{isEn ? 'Avoid' : '避免'}</strong>{plantAvoid}</div>
                        </div>
                      ) : (
                        <p className="mt-2 text-[11px] font-semibold leading-relaxed text-ink/66">{fish.description || (isEn ? 'Confirm material, edges, and placement stability before adding.' : '加入前确认材质、水质影响、尖锐边缘和摆放稳定性。')}</p>
                      )}
                    </section>

                    <div className={`mt-3 rounded-[16px] border p-3 ${statusCopy.tone}`} data-non-livestock-fit-status={fit.status}>
                      <div className="flex items-start gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white"><StatusIcon className="h-4 w-4" /></span>
                        <div className="min-w-0">
                          <div className="text-[10px] font-black uppercase tracking-[0.12em] text-ink/42">{isEn ? 'Fits my tank?' : '适合我的鱼缸吗？'}</div>
                          <p className="mt-0.5 text-[15px] font-black text-ink">{statusCopy.title}</p>
                          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-ink/62">{fit.reasonSummary}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-3 rounded-[18px] border border-border bg-white p-3" aria-label={isEn ? 'Environment summary' : '环境摘要'}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[13px] font-black text-ink">{isPlant ? (isEn ? 'Growing conditions' : '生长条件') : (isEn ? 'Placement conditions' : '摆放条件')}</h3>
                    <p className="mt-0.5 text-[10px] font-semibold text-ink/45">{isPlant ? (isEn ? 'Plant-specific conditions, not livestock stocking limits' : '这里只展示水草养护条件，不套用活体缸容规则') : (isEn ? 'Hardscape is not counted as livestock' : '硬景不计入活体密度或混养关系')}</p>
                  </div>
                  <Waves className="h-5 w-5 shrink-0 text-sky-600" />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 min-[760px]:grid-cols-4">
                  {environmentItems.map(item => (
                    <div key={item.label} className="min-w-0 rounded-[13px] bg-bg p-2.5">
                      <div className="text-[9px] font-black text-ink/40">{item.label}</div>
                      <div className="mt-1 break-words text-[11px] font-black leading-4 text-ink/72">{item.value || (isEn ? 'Not recorded' : '未记录')}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-3 rounded-[18px] border border-border bg-white p-3" aria-label={isEn ? 'Fit evidence' : '适配依据'}>
                <h3 className="text-[13px] font-black text-ink">{isEn ? 'What the fit check used' : '本次适配依据'}</h3>
                <div className="mt-2 grid gap-2">
                  {importantItems.map(item => (
                    <div key={item.type} className="rounded-[12px] bg-bg px-3 py-2">
                      <div className="text-[11px] font-black text-ink">{item.title}</div>
                      <p className="mt-0.5 text-[10px] font-semibold leading-relaxed text-ink/58">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => onToggleWishlist(fish.id)} aria-pressed={inWishlist} className={`flex min-h-11 items-center gap-2 rounded-full border px-3 text-[11px] font-black ${inWishlist ? 'border-rose-100 bg-rose-50 text-rose-700' : 'border-border bg-white text-ink/60'}`}>
                  {inWishlist ? <Heart className="h-4 w-4 fill-current" /> : <HeartOff className="h-4 w-4" />}
                  {inWishlist ? (isEn ? 'Saved' : '已收藏') : (isEn ? 'Save' : '收藏')}
                </button>
              </div>

              {detailFeedback && <div className="mt-3 rounded-[14px] border border-emerald-100 bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-800">{detailFeedback}</div>}
            </div>
          </div>

          <div className="modalFooter shrink-0 border-t border-border bg-white/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 min-[760px]:px-6">
            <Button className="min-h-12 w-full rounded-full bg-accent px-4 text-sm font-black text-white hover:bg-accent/90" onClick={handleMainAction}>{mainActionLabel}</Button>
          </div>
        </div>
      </AdaptiveDetailContent>
    </Dialog>
  );
}
