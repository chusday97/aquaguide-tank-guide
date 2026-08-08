import { Activity, CalendarClock, CheckCircle2, Droplets, Fish, Settings, Utensils, Waves } from 'lucide-react';
import type { CareReminderRecord } from '../../services/care/care-activity.service';
import type { CareTimelineItem } from '../../services/care/care-timeline.service';
import { SurfaceHeader } from '../common/SurfaceHeader';

type Props = {
  aquariumName: string;
  items: CareTimelineItem[];
  reminders: CareReminderRecord[];
  isEn: boolean;
  onBack: () => void;
  onCreateRecurrence: (type: 'feeding' | 'water_change' | 'general', days: number) => void;
  onChangeRecurrence: (reminder: CareReminderRecord, enabled: boolean, days?: number) => void;
};

const iconFor = (eventType: CareTimelineItem['eventType']) => {
  if (eventType === 'water_change') return <Droplets className="h-4 w-4" />;
  if (eventType === 'feeding') return <Utensils className="h-4 w-4" />;
  if (eventType === 'species_added' || eventType === 'species_removed' || eventType === 'life_stage_updated') return <Fish className="h-4 w-4" />;
  if (eventType === 'settings_updated' || eventType === 'aquarium_created') return <Settings className="h-4 w-4" />;
  if (eventType === 'daily_check') return <Activity className="h-4 w-4" />;
  return <CheckCircle2 className="h-4 w-4" />;
};

const formatDateTime = (value: string, isEn: boolean) => new Intl.DateTimeFormat(isEn ? 'en' : 'zh-CN', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
}).format(new Date(value));

export function AquariumTimeline({
  aquariumName,
  items,
  reminders,
  isEn,
  onBack,
  onCreateRecurrence,
  onChangeRecurrence,
}: Props) {
  const activeRecurring = reminders.filter(item => !item.completedAt && item.repeatEnabled);
  const presets = [
    { type: 'feeding' as const, label: isEn ? 'Feeding' : '喂食', days: [1, 2, 3], icon: <Utensils className="h-4 w-4" /> },
    { type: 'water_change' as const, label: isEn ? 'Water change' : '换水', days: [3, 7, 14], icon: <Droplets className="h-4 w-4" /> },
    { type: 'general' as const, label: isEn ? 'General care' : '通用养护', days: [1, 3, 7], icon: <Waves className="h-4 w-4" /> },
  ];

  return (
    <div className="page-frame-wide min-w-0 overflow-x-hidden">
      <section className="overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-sm">
        <SurfaceHeader
          title={isEn ? 'Aquarium timeline' : '鱼缸记录'}
          description={`${aquariumName} · ${isEn ? 'from setup to today' : '从建缸到今天'}`}
          onBack={onBack}
          backLabel={isEn ? 'Back to My Aquarium' : '返回我的鱼缸'}
        />
        <div className="grid min-w-0 gap-4 bg-[#FBFAF6] p-3 md:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)] md:p-5">
          <section className="min-w-0 rounded-[22px] border border-border bg-white p-4" aria-labelledby="timeline-events-title">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 id="timeline-events-title" className="text-base font-black text-ink">{isEn ? 'Activity history' : '操作时间线'}</h2>
                <p className="mt-1 text-xs font-semibold text-ink/48">{isEn ? 'Newest records appear first.' : '最新记录显示在最前面。'}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">{items.length}</span>
            </div>
            {items.length > 0 ? (
              <ol className="mt-4 grid gap-0">
                {items.map((item, index) => (
                  <li key={item.id} className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-3 pb-4 last:pb-0">
                    {index < items.length - 1 && <span className="absolute left-[21px] top-10 h-[calc(100%-24px)] w-px bg-emerald-100" aria-hidden="true" />}
                    <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">{iconFor(item.eventType)}</span>
                    <div className="min-w-0 rounded-2xl bg-bg px-3 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 text-sm font-black text-ink">{item.title}</div>
                        {item.isInferred && <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-black text-ink/45">{isEn ? 'From older records' : '由旧记录整理'}</span>}
                      </div>
                      {item.label && <p className="mt-1 break-words text-xs font-semibold leading-5 text-ink/58">{item.label}</p>}
                      <time className="mt-1.5 block text-[10px] font-bold text-ink/38" dateTime={item.occurredAt}>{formatDateTime(item.occurredAt, isEn)}</time>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm font-bold text-ink/45">{isEn ? 'No aquarium activity yet.' : '还没有鱼缸操作记录。'}</div>
            )}
          </section>

          <aside className="min-w-0 rounded-[22px] border border-border bg-white p-4" aria-labelledby="recurring-care-title">
            <div className="flex items-center gap-2 text-emerald-800"><CalendarClock className="h-5 w-5" /><h2 id="recurring-care-title" className="text-base font-black text-ink">{isEn ? 'Recurring care' : '循环养护'}</h2></div>
            <p className="mt-1 text-xs font-semibold leading-5 text-ink/48">{isEn ? 'Optional in-app reminders only. No system notifications.' : '可选的应用内提醒，不会申请系统通知权限。'}</p>
            <div className="mt-4 grid gap-3">
              {presets.map(preset => (
                <div key={preset.type} className="rounded-2xl bg-bg p-3">
                  <div className="flex items-center gap-2 text-sm font-black text-ink"><span className="text-emerald-700">{preset.icon}</span>{preset.label}</div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {preset.days.map(days => (
                      <button key={days} type="button" onClick={() => onCreateRecurrence(preset.type, days)} className="min-h-11 rounded-full border border-border bg-white px-2 text-xs font-black text-emerald-800 hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">{days} {isEn ? 'days' : '天'}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {activeRecurring.length > 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <h3 className="text-xs font-black text-ink/55">{isEn ? 'Active cycles' : '已开启循环'}</h3>
                <div className="mt-2 grid gap-2">
                  {activeRecurring.map(reminder => (
                    <div key={reminder.id} className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 px-3 py-3">
                      <div className="min-w-0"><div className="truncate text-xs font-black text-ink">{reminder.title}</div><div className="mt-0.5 text-[10px] font-bold text-ink/42">{isEn ? `Every ${reminder.repeatIntervalDays} days` : `每 ${reminder.repeatIntervalDays} 天`}</div></div>
                      <button type="button" onClick={() => onChangeRecurrence(reminder, false)} className="min-h-11 shrink-0 rounded-full border border-border px-3 text-xs font-black text-ink/58 hover:bg-bg">{isEn ? 'Turn off' : '关闭循环'}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
