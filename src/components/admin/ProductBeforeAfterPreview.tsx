import type { SpeciesAdminInput } from '../../services/admin/content-admin.service';
import type { ContentImpactResult } from '../../services/admin/content-impact.service';

const difficultyLabel = { Easy: '容易', Medium: '中等', Hard: '困难' } as const;
const temperamentLabel = { Peaceful: '温和', Territorial: '领地性', Aggressive: '攻击性' } as const;
const sizeLabel = { Small: '小型', Medium: '中型', Large: '大型' } as const;

type PreviewField = {
  key: keyof SpeciesAdminInput;
  label: string;
  value: (item: SpeciesAdminInput) => string;
  wide?: boolean;
  onlyWhenChanged?: boolean;
};

const previewFields: PreviewField[] = [
  { key: 'category', label: '分类', value: item => item.category || '—' },
  { key: 'difficulty', label: '饲养难度', value: item => difficultyLabel[item.difficulty] },
  { key: 'waterTemperatureText', label: '水温', value: item => item.waterTemperatureText || '—' },
  { key: 'phLevelText', label: 'pH', value: item => item.phLevelText || '—' },
  { key: 'tankSizeText', label: '建议缸体', value: item => item.tankSizeText || '—' },
  { key: 'waterChangeCycleDays', label: '换水周期', value: item => `约 ${item.waterChangeCycleDays} 天` },
  { key: 'temperament', label: '性情', value: item => temperamentLabel[item.temperament] },
  { key: 'sizeClass', label: '体型', value: item => sizeLabel[item.sizeClass] },
  { key: 'housingMode', label: '混养倾向', value: item => item.housingMode || '未设置' },
];
const detailFields: PreviewField[] = [
  { key: 'diet', label: '喂养说明', value: item => item.diet || '—', wide: true },
  { key: 'housingReason', label: '混养说明', value: item => item.housingReason || '未设置', wide: true },
  { key: 'waterTemperatureMinC', label: '最低温度', value: item => item.waterTemperatureMinC == null ? '—' : `${item.waterTemperatureMinC}°C`, onlyWhenChanged: true },
  { key: 'waterTemperatureMaxC', label: '最高温度', value: item => item.waterTemperatureMaxC == null ? '—' : `${item.waterTemperatureMaxC}°C`, onlyWhenChanged: true },
  { key: 'phMin', label: '最低 pH', value: item => item.phMin == null ? '—' : String(item.phMin), onlyWhenChanged: true },
  { key: 'phMax', label: '最高 pH', value: item => item.phMax == null ? '—' : String(item.phMax), onlyWhenChanged: true },
  { key: 'minTankLiters', label: '最低缸体容量', value: item => item.minTankLiters == null ? '—' : `${item.minTankLiters} L`, onlyWhenChanged: true },
];

function FieldGrid({ item, changedFields }: { item: SpeciesAdminInput; changedFields: Set<string> }) {
  const fields = [...previewFields, ...detailFields].filter(field => !field.onlyWhenChanged || changedFields.has(field.key));
  return <div className="mt-4 grid grid-cols-2 gap-2">{fields.map(field => (
    <div
      key={field.key}
      data-preview-field={field.key}
      className={`${field.wide ? 'col-span-2' : ''} rounded-[12px] border px-3 py-2.5 ${changedFields.has(field.key) ? 'border-amber-300 bg-amber-50' : 'border-border bg-bg/55'}`}
    >
      <div className="text-[10px] font-black text-ink/40">{field.label}</div>
      <div className="mt-1 whitespace-pre-wrap break-words text-xs font-black leading-5 text-ink/80">{field.value(item)}</div>
    </div>
  ))}</div>;
}
function PreviewCard({ item, title, changedFields, empty = false }: {
  item: SpeciesAdminInput;
  title: string;
  changedFields: Set<string>;
  empty?: boolean;
}) {
  return (
    <article className="min-w-0 rounded-[18px] border border-border bg-white p-4 shadow-sm">
      <div className="text-[11px] font-black uppercase tracking-[0.08em] text-ink/40">{title}</div>
      {empty ? (
        <div className="mt-5 rounded-[14px] border border-dashed border-border bg-bg px-4 py-8 text-center text-sm font-black text-ink/40">当前没有已发布版本</div>
      ) : (
        <>
          <h4 className={`mt-3 break-words text-xl font-black ${changedFields.has('name') ? 'rounded bg-amber-100 px-1.5 py-0.5' : ''}`}>{item.name || '未命名物种'}</h4>
          <div className={`mt-1 break-words text-xs font-bold italic text-ink/45 ${changedFields.has('scientificName') ? 'rounded bg-amber-100 px-1 py-0.5' : ''}`}>{item.scientificName || '—'}</div>
          <FieldGrid item={item} changedFields={changedFields} />
        </>
      )}
    </article>
  );
}

export default function ProductBeforeAfterPreview({ before, after, impact }: {
  before: SpeciesAdminInput | null;
  after: SpeciesAdminInput;
  impact: ContentImpactResult | null;
}) {
  const criticalChanges = impact?.changes.filter(change => change.kind === 'decision_critical_product') || [];
  if (!criticalChanges.length) return null;
  const changedFields = new Set(criticalChanges.map(change => change.field));
  const emptyBefore = !before;
  const beforeItem = before || after;

  return (
    <section data-testid="product-before-after-preview" className="mb-5 rounded-[18px] border border-emerald-200 bg-emerald-50/45 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-sm font-black">Encyclopedia Before / After</div>
          <p className="mt-1 text-xs font-bold leading-5 text-ink/48">对照当前已发布版本与准备发布版本；黄色区域是本次决策关键变化。</p>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-800">{criticalChanges.length} 项关键变化</span>
      </div>
      <div className="mt-3 grid min-w-0 gap-3 xl:grid-cols-2">
        <PreviewCard item={beforeItem} title="当前已发布" changedFields={changedFields} empty={emptyBefore} />
        <PreviewCard item={after} title="准备发布" changedFields={changedFields} />
      </div>
      <p className="mt-3 text-[11px] font-bold leading-5 text-ink/50">这里只预览当前已接入 Product authority 的 Encyclopedia 数据。Aquarium / Compatibility / SEO 若在 Impact 中标为“需单独复核”，不会在这里假装已经验证。</p>
    </section>
  );
}
