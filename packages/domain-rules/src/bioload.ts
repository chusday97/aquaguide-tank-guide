export type BioloadBodySize = 'Small' | 'Medium' | 'Large' | string | undefined;
export type BioloadScreeningPressure = 'low' | 'elevated' | 'high' | 'unknown';

export type BioloadScreeningItem = {
  size?: BioloadBodySize;
  quantity?: number;
};
const quantityOf = (value?: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 1;
};

export const estimateBioloadUnits = (size: BioloadBodySize, quantity = 1) => {
  const base = size === 'Large' ? 8 : size === 'Medium' ? 4 : 1.5;
  return base * quantityOf(quantity);
};

export const assessBioloadScreening = (
  items: BioloadScreeningItem[],
  effectiveVolumeLiters?: number | null,
): { units: number; ratio: number | null; pressure: BioloadScreeningPressure } => {
  const volume = Number(effectiveVolumeLiters);
  const units = items.reduce((sum, item) => sum + estimateBioloadUnits(item.size, item.quantity), 0);
  if (!Number.isFinite(volume) || volume <= 0) return { units, ratio: null, pressure: 'unknown' };

  const ratio = units / volume;
  return {
    units,
    ratio,
    pressure: ratio >= 0.9 ? 'high' : ratio >= 0.7 ? 'elevated' : 'low',
  };
};
