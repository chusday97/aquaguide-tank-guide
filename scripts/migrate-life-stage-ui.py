from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'{label} anchor missing; refusing migration')
    return text.replace(old, new, 1)

# 1) Existing livestock batch editor: expose the full five-stage contract.
card_path = Path('src/components/aquarium/LivestockBatchCard.tsx')
card = card_path.read_text()
card = replace_once(
    card,
    "const lifeStageOptions: LifeStage[] = ['unknown', 'juvenile', 'adult'];",
    "const lifeStageOptions: LifeStage[] = ['unknown', 'fry', 'juvenile', 'subadult', 'adult'];",
    'batch-card life-stage options',
)
card = replace_once(
    card,
    "  if (summary.juvenile) parts.push(t('livestock.summaryJuvenile', { count: summary.juvenile }));\n  if (summary.adult) parts.push(t('livestock.summaryAdult', { count: summary.adult }));",
    "  if (summary.fry) parts.push(t('livestock.summaryFry', { count: summary.fry }));\n  if (summary.juvenile) parts.push(t('livestock.summaryJuvenile', { count: summary.juvenile }));\n  if (summary.subadult) parts.push(t('livestock.summarySubadult', { count: summary.subadult }));\n  if (summary.adult) parts.push(t('livestock.summaryAdult', { count: summary.adult }));",
    'batch-card stage summary',
)
card = replace_once(
    card,
    "    icon: option === 'unknown'\n      ? <CircleHelp className=\"h-5 w-5\" />\n      : option === 'juvenile'\n        ? <Baby className=\"h-5 w-5\" />\n        : <FishIcon className=\"h-5 w-5\" />,
",
    "    icon: option === 'unknown'\n      ? <CircleHelp className=\"h-5 w-5\" />\n      : option === 'fry' || option === 'juvenile'\n        ? <Baby className=\"h-5 w-5\" />\n        : <FishIcon className=\"h-5 w-5\" />,
",
    'batch-card stage icons',
)
card_path.write_text(card)

# 2) Batch summaries and observations: stop collapsing fry into juvenile.
service_path = Path('src/services/aquarium/species-batches.service.ts')
service = service_path.read_text()
service = replace_once(
    service,
    "    total: count(() => true),\n    juvenile: count(batch => batch.lifeStage === 'juvenile'),\n    adult: count(batch => batch.lifeStage === 'adult'),",
    "    total: count(() => true),\n    fry: count(batch => batch.lifeStage === 'fry'),\n    juvenile: count(batch => batch.lifeStage === 'juvenile'),\n    subadult: count(batch => batch.lifeStage === 'subadult'),\n    adult: count(batch => batch.lifeStage === 'adult'),",
    'batch summary counts',
)
service = replace_once(
    service,
    "  if (summary.juvenile) parts.push(isEn ? `${summary.juvenile} juvenile` : `幼年 ${summary.juvenile}`);\n  if (summary.adult) parts.push(isEn ? `${summary.adult} adult` : `成年 ${summary.adult}`);",
    "  if (summary.fry) parts.push(isEn ? `${summary.fry} fry` : `鱼苗 ${summary.fry}`);\n  if (summary.juvenile) parts.push(isEn ? `${summary.juvenile} juvenile` : `幼年 ${summary.juvenile}`);\n  if (summary.subadult) parts.push(isEn ? `${summary.subadult} subadult` : `亚成 ${summary.subadult}`);\n  if (summary.adult) parts.push(isEn ? `${summary.adult} adult` : `成年 ${summary.adult}`);",
    'batch context life-stage labels',
)
service = replace_once(
    service,
    "  if (summary.recovery) return isEn ? 'Watch appetite and energy while keeping water conditions stable.' : '观察食欲与活动量，保持水质稳定。';\n  if (summary.juvenile) return isEn ? 'Check feeding access, growth, and whether larger tank mates are chasing them.' : '观察鱼苗是否吃得到、生长正常，以及是否被大鱼追咬。';\n  return '';",
    "  if (summary.recovery) return isEn ? 'Watch appetite and energy while keeping water conditions stable.' : '观察食欲与活动量，保持水质稳定。';\n  if (summary.fry) return isEn ? 'Check fry feeding access, shelter, growth, and whether larger tank mates are chasing or swallowing them.' : '观察鱼苗是否吃得到、是否有足够躲避空间、生长是否正常，以及是否被较大个体追逐或吞食。';\n  if (summary.juvenile) return isEn ? 'Check juvenile feeding access, growth, and whether larger tank mates are chasing them.' : '观察幼年个体是否吃得到、生长正常，以及是否被较大个体追咬。';\n  if (summary.subadult) return isEn ? 'Check subadult growth, feeding competition, and whether territorial pressure is increasing.' : '观察亚成个体的生长、进食竞争，以及领地压力是否增加。';\n  return '';",
    'batch observation stage split',
)
service_path.write_text(service)

# 3) Bilingual labels for all five stages.
i18n_path = Path('src/i18n/index.ts')
i18n = i18n_path.read_text()
i18n = replace_once(
    i18n,
    "        summaryTotal: '共 {{count}} 条/只',\n        summaryJuvenile: '幼年 {{count}}',\n        summaryAdult: '成年 {{count}}',",
    "        summaryTotal: '共 {{count}} 条/只',\n        summaryFry: '鱼苗 {{count}}',\n        summaryJuvenile: '幼年 {{count}}',\n        summarySubadult: '亚成 {{count}}',\n        summaryAdult: '成年 {{count}}',",
    'Chinese stage summaries',
)
i18n = replace_once(
    i18n,
    "        lifeStage: { unknown: '未确认', juvenile: '幼年', adult: '成年' },",
    "        lifeStage: { unknown: '未确认', fry: '鱼苗', juvenile: '幼年', subadult: '亚成', adult: '成年' },",
    'Chinese life-stage labels',
)
i18n = replace_once(
    i18n,
    "        summaryTotal: '{{count}} total',\n        summaryJuvenile: '{{count}} juvenile',\n        summaryAdult: '{{count}} adult',",
    "        summaryTotal: '{{count}} total',\n        summaryFry: 'Fry {{count}}',\n        summaryJuvenile: '{{count}} juvenile',\n        summarySubadult: 'Subadult {{count}}',\n        summaryAdult: '{{count}} adult',",
    'English stage summaries',
)
i18n = replace_once(
    i18n,
    "        lifeStage: { unknown: 'Unknown', juvenile: 'Juvenile', adult: 'Adult' },",
    "        lifeStage: { unknown: 'Unknown', fry: 'Fry', juvenile: 'Juvenile', subadult: 'Subadult', adult: 'Adult' },",
    'English life-stage labels',
)
i18n_path.write_text(i18n)

# 4) Planned-addition dialog: collect lifeStage before review/write.
aquarium_path = Path('src/pages/Aquarium.tsx')
aquarium = aquarium_path.read_text()
aquarium = replace_once(
    aquarium,
    "import { Aquarium, AquariumFish, Fish, type SpeciesAdditionIntent } from '../types';",
    "import { Aquarium, AquariumFish, Fish, type LifeStage, type SpeciesAdditionIntent } from '../types';",
    'Aquarium LifeStage import',
)
aquarium = replace_once(
    aquarium,
    "type SelectedAddFishItem = { fishId: string; quantity: number; entryDate: string };",
    "type SelectedAddFishItem = { fishId: string; quantity: number; entryDate: string; lifeStage: LifeStage };",
    'selected-add draft type',
)
aquarium = replace_once(
    aquarium,
    "const updateSelectedAddFishItem = (fishId: string, patch: Partial<{ quantity: number; entryDate: string }>) => {",
    "const updateSelectedAddFishItem = (fishId: string, patch: Partial<{ quantity: number; entryDate: string; lifeStage: LifeStage }>) => {",
    'selected-add updater type',
)
aquarium = replace_once(
    aquarium,
    "      ? [{ fishId: selectedFish.id, quantity: 1, entryDate: format(new Date(), 'yyyy-MM-dd') }]\n      : []);",
    "      ? [{ fishId: selectedFish.id, quantity: 1, entryDate: format(new Date(), 'yyyy-MM-dd'), lifeStage: 'unknown' }]\n      : []);",
    'preselected add-fish default stage',
)
aquarium = replace_once(
    aquarium,
    "      return [...prev, { fishId: fish.id, quantity: 1, entryDate: format(new Date(), 'yyyy-MM-dd') }];",
    "      return [...prev, { fishId: fish.id, quantity: 1, entryDate: format(new Date(), 'yyyy-MM-dd'), lifeStage: 'unknown' }];",
    'toggle add-fish default stage',
)
aquarium = replace_once(
    aquarium,
    "    .filter((item): item is { fishId: string; quantity: number; entryDate: string; fish: Fish } => Boolean(item));",
    "    .filter((item): item is { fishId: string; quantity: number; entryDate: string; lifeStage: LifeStage; fish: Fish } => Boolean(item));",
    'selected-add details stage type',
)
aquarium = replace_once(
    aquarium,
    "        quantity: Math.max(1, item.quantity || 1),\n        entryDate: item.entryDate || format(new Date(), 'yyyy-MM-dd'),",
    "        quantity: Math.max(1, item.quantity || 1),\n        entryDate: item.entryDate || format(new Date(), 'yyyy-MM-dd'),\n        lifeStage: item.lifeStage,",
    'normalized planned-addition stage',
)
quantity_anchor = '''                            <div className="rounded-[14px] bg-white p-2">
                              <Label className="text-[10px] font-black text-ink/48">{isEn ? "Quantity" : "数量"}</Label>'''
stage_control = '''                            <div className="rounded-[14px] bg-white p-2">
                              <Label className="text-[10px] font-black text-ink/48">{isEn ? 'Life Stage' : '生长阶段'}</Label>
                              <select
                                data-add-fish-life-stage={item.fishId}
                                value={item.lifeStage}
                                onChange={(event) => updateSelectedAddFishItem(item.fishId, { lifeStage: event.target.value as LifeStage })}
                                className="mt-1 h-10 w-full rounded-xl border border-border bg-bg px-3 text-[12px] font-black text-ink outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                aria-label={isEn ? `${getSpeciesNameLocalized(item.fish, true)} life stage` : `${item.fish.name} 生长阶段`}
                              >
                                {(['unknown', 'fry', 'juvenile', 'subadult', 'adult'] as LifeStage[]).map(stage => (
                                  <option key={stage} value={stage}>{t(`livestock.lifeStage.${stage}`)}</option>
                                ))}
                              </select>
                            </div>
                            <div className="rounded-[14px] bg-white p-2">
                              <Label className="text-[10px] font-black text-ink/48">{isEn ? "Quantity" : "数量"}</Label>'''
aquarium = replace_once(aquarium, quantity_anchor, stage_control, 'planned-addition stage control')
aquarium = aquarium.replace(
    "Confirm quantity and entry date before adding.",
    "Confirm life stage, quantity and entry date before adding.",
)
aquarium = aquarium.replace(
    "确认每种生物的数量和入缸日期后再添加。",
    "确认每种生物的生长阶段、数量和入缸日期后再添加。",
)
aquarium_path.write_text(aquarium)

required = {
    'src/components/aquarium/LivestockBatchCard.tsx': [
        "const lifeStageOptions: LifeStage[] = ['unknown', 'fry', 'juvenile', 'subadult', 'adult'];",
        "summaryFry",
        "summarySubadult",
    ],
    'src/services/aquarium/species-batches.service.ts': [
        "fry: count(batch => batch.lifeStage === 'fry')",
        "subadult: count(batch => batch.lifeStage === 'subadult')",
        'summary.fry',
        'summary.subadult',
    ],
    'src/i18n/index.ts': [
        "summaryFry: '鱼苗 {{count}}'",
        "summarySubadult: '亚成 {{count}}'",
        "summaryFry: 'Fry {{count}}'",
        "summarySubadult: 'Subadult {{count}}'",
    ],
    'src/pages/Aquarium.tsx': [
        "type SelectedAddFishItem = { fishId: string; quantity: number; entryDate: string; lifeStage: LifeStage };",
        "data-add-fish-life-stage={item.fishId}",
        "(['unknown', 'fry', 'juvenile', 'subadult', 'adult'] as LifeStage[]).map",
        "lifeStage: item.lifeStage",
    ],
}
for filename, needles in required.items():
    text = Path(filename).read_text()
    for needle in needles:
        if needle not in text:
            raise SystemExit(f'{filename} missing required life-stage UI contract: {needle}')

print('Life-stage capture UI migration prepared')
