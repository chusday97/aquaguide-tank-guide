import fs from 'node:fs';

const path = 'src/components/SpeciesDetailDialog.tsx';
let source = fs.readFileSync(path, 'utf8');

const replaceExact = (from, to, label) => {
  if (!source.includes(from)) throw new Error(`Missing anchor: ${label}`);
  source = source.replace(from, to);
};

replaceExact(
`    if (displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk' || displayFit.status === 'caution') {
      return inCalculator ? t('encyclopedia.goToCalcBtn') : t('encyclopedia.addToCalcBtn');
    }`,
`    if (displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk' || displayFit.status === 'caution') {
      return t('encyclopedia.goToCalcBtn');
    }`,
'risk primary CTA label',
);

replaceExact(
`    if (displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk' || displayFit.status === 'caution') {
      if (!inCalculator) {
        onAddToCalculator(fish);
        return;
      }
      onGoCalculator?.();
      return;
    }`,
`    if (displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk' || displayFit.status === 'caution') {
      onGoCalculator?.();
      return;
    }`,
'risk primary action behavior',
);

replaceExact(
`  const handleOpenCalculator = () => {
    if (!fish) return;
    if (!inCalculator) {
      onAddToCalculator(fish);
      return;
    }
    onGoCalculator?.();
  };`,
`  const handleOpenCalculator = () => {
    if (!fish) return;
    onGoCalculator?.();
  };`,
'calculator navigation behavior',
);

replaceExact(
`                            <button type="button" data-species-detail-compatibility-action={inCalculator ? 'view-result' : 'add-selection'} onClick={handleOpenCalculator} className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 text-[12px] font-black text-accent">
                              <Calculator className="h-4 w-4" />
                              {inCalculator ? t('encyclopedia.goToCalcBtn') : t('encyclopedia.addToCalcBtn')}
                            </button>`,
`                            <button type="button" data-species-detail-compatibility-action="open-calculator" onClick={handleOpenCalculator} className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 text-[12px] font-black text-accent">
                              <Calculator className="h-4 w-4" />
                              {t('encyclopedia.goToCalcBtn')}
                            </button>`,
'secondary compatibility action',
);

fs.writeFileSync(path, source);
console.log('Applied species detail selection decoupling.');