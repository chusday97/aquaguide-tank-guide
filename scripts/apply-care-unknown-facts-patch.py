from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    file = Path(path)
    text = file.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 exact match, got {count}')
    file.write_text(text.replace(old, new, 1))


path = 'src/pages/CareEncyclopedia.tsx'

replace_once(
    path,
    '''const getTankVolumeLiters = (aquarium?: Aquarium | null) => {\n  if (!aquarium?.dimensions) return 0;\n  const length = Number(aquarium.dimensions.length);\n  const width = Number(aquarium.dimensions.width);\n  const height = Number(aquarium.dimensions.height);\n  if (![length, width, height].every(Number.isFinite)) return 0;\n  return Math.round((length * width * height * 0.85) / 1000);\n};\n''',
    '''const getTankVolumeLiters = (aquarium?: Aquarium | null) => {\n  if (!aquarium?.dimensions) return 0;\n  const length = Number(aquarium.dimensions.length);\n  const width = Number(aquarium.dimensions.width);\n  const height = Number(aquarium.dimensions.height);\n  if (![length, width, height].every(value => Number.isFinite(value) && value > 0)) return 0;\n  return Math.round((length * width * height * 0.85) / 1000);\n};\n\nconst formatTankVolumeFact = (aquarium: Aquarium | null | undefined, isEn: boolean) => {\n  const liters = getTankVolumeLiters(aquarium);\n  return liters > 0\n    ? (isEn ? `~${liters}L` : `约 ${liters}L`)\n    : (isEn ? 'Volume unknown' : '容量未记录');\n};\n\nconst formatWaterTypeFact = (aquarium: Aquarium | null | undefined, isEn: boolean) => {\n  if (aquarium?.waterType === 'Saltwater') return isEn ? 'Saltwater' : '海水';\n  if (aquarium?.waterType === 'Freshwater') return isEn ? 'Freshwater' : '淡水';\n  return isEn ? 'Water type unknown' : '水体类型未记录';\n};\n\nconst formatTargetTemperatureFact = (aquarium: Aquarium | null | undefined, isEn: boolean) => {\n  const value = aquarium?.targetTemperature?.trim();\n  return value\n    ? `${value}°C`\n    : (isEn ? 'Target temp unknown' : '目标水温未记录');\n};\n''',
    'Care factual display helpers',
)

replace_once(
    path,
    '''          isEn \n            ? `Water volume: ~${volumeLiters}L · ${aquarium.waterType === 'Saltwater' ? 'Saltwater' : 'Freshwater'} · ${aquarium.targetTemperature || 25}°C`\n            : `当前水体：约 ${volumeLiters}L · ${aquarium.waterType === 'Saltwater' ? '海水' : '淡水'} · ${aquarium.targetTemperature || 25}°C`\n''',
    '''          isEn\n            ? `Water facts: ${formatTankVolumeFact(aquarium, true)} · ${formatWaterTypeFact(aquarium, true)} · ${formatTargetTemperatureFact(aquarium, true)}`\n            : `当前水体：${formatTankVolumeFact(aquarium, false)} · ${formatWaterTypeFact(aquarium, false)} · ${formatTargetTemperatureFact(aquarium, false)}`\n''',
    'Care diagnosis evidence facts',
)

replace_once(
    path,
    '''  const aquariumVolumeLiters = getTankVolumeLiters(activeAquarium);\n  const aquariumSummary = activeAquarium\n    ? (isEn\n        ? `${aquariumVolumeLiters || 'Unset'}L · ${activeAquarium.targetTemperature || 25}°C · ${activeAquarium.waterType === 'Saltwater' ? 'Saltwater' : 'Freshwater'} · ${(activeAquarium.fishes || []).length} species stocked`\n        : `${aquariumVolumeLiters || '未设'}L · ${activeAquarium.targetTemperature || 25}°C · ${activeAquarium.waterType === 'Saltwater' ? '海水' : '淡水'} · 已有 ${(activeAquarium.fishes || []).length} 种生物`)\n    : (isEn ? 'No tank data loaded. Showing general care recommendations.' : '还没有当前鱼缸数据，先显示通用养护推荐');\n''',
    '''  const aquariumSummary = activeAquarium\n    ? (isEn\n        ? `${formatTankVolumeFact(activeAquarium, true)} · ${formatTargetTemperatureFact(activeAquarium, true)} · ${formatWaterTypeFact(activeAquarium, true)} · ${(activeAquarium.fishes || []).length} species stocked`\n        : `${formatTankVolumeFact(activeAquarium, false)} · ${formatTargetTemperatureFact(activeAquarium, false)} · ${formatWaterTypeFact(activeAquarium, false)} · 已有 ${(activeAquarium.fishes || []).length} 种生物`)\n    : (isEn ? 'No tank data loaded. Showing general care recommendations.' : '还没有当前鱼缸数据，先显示通用养护推荐');\n''',
    'Care aquarium summary facts',
)
