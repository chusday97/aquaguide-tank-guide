import fs from 'node:fs';

const replaceExact = (source, before, after, label) => {
  const count = source.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  }
  return source.replace(before, after);
};

const update = (path, transform) => {
  const before = fs.readFileSync(path, 'utf8');
  const after = transform(before);
  if (before === after) throw new Error(`${path}: migration produced no change`);
  fs.writeFileSync(path, after);
};

update('src/pages/Encyclopedia.tsx', source => replaceExact(
  source,
  `    setCalculatorSpeciesIds(prev => prev.includes(fish.id) ? prev : [...prev, fish.id]);\n    closeAtlasDetail(false);\n    setViewMode('compatibility');\n    navigateToRoute(taskRoutes.encyclopedia.compatibility);\n  };`,
  `    setCalculatorSpeciesIds(prev => prev.includes(fish.id) ? prev : [...prev, fish.id]);\n  };`,
  'Encyclopedia compatibility selection must not navigate',
));

update('src/components/SpeciesDetailDialog.tsx', source => {
  let next = source;
  next = replaceExact(
    next,
    `    if (displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk') return t('encyclopedia.viewRiskAndAlternatives');\n    if (displayFit.status === 'caution') return t('encyclopedia.viewRiskAndAdd');\n    return t('encyclopedia.btnCompleteSetup');\n  }, [aquariumContext, displayFit, owned, source, t]);`,
    `    if (displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk' || displayFit.status === 'caution') {\n      return inCalculator ? t('encyclopedia.goToCalcBtn') : t('encyclopedia.addToCalcBtn');\n    }\n    return t('encyclopedia.btnCompleteSetup');\n  }, [aquariumContext, displayFit, inCalculator, owned, source, t]);`,
    'Species detail risk CTA must expose explicit selection intent',
  );

  next = replaceExact(
    next,
    `    if (displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk' || displayFit.status === 'caution') {\n      if (!inCalculator) onAddToCalculator(fish);\n      onGoCalculator?.();\n      return;\n    }`,
    `    if (displayFit.status === 'unsuitable' || displayFit.status === 'conflictRisk' || displayFit.status === 'caution') {\n      if (!inCalculator) {\n        onAddToCalculator(fish);\n        return;\n      }\n      onGoCalculator?.();\n      return;\n    }`,
    'Risk primary action must add before navigating',
  );

  next = replaceExact(
    next,
    `  const handleOpenCalculator = () => {\n    if (!fish) return;\n    if (!inCalculator) onAddToCalculator(fish);\n    onGoCalculator?.();\n  };`,
    `  const handleOpenCalculator = () => {\n    if (!fish) return;\n    if (!inCalculator) {\n      onAddToCalculator(fish);\n      return;\n    }\n    onGoCalculator?.();\n  };`,
    'Compatibility CTA must not add and navigate in one click',
  );

  next = replaceExact(
    next,
    `                            <button type="button" onClick={handleOpenCalculator} className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 text-[12px] font-black text-accent">\n                              <Calculator className="h-4 w-4" />\n                              {inCalculator ? t('encyclopedia.goToCalcBtn') : t('encyclopedia.compatibilityCalc')}\n                            </button>`,
    `                            <button type="button" data-species-detail-compatibility-action={inCalculator ? 'view-result' : 'add-selection'} onClick={handleOpenCalculator} className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 text-[12px] font-black text-accent">\n                              <Calculator className="h-4 w-4" />\n                              {inCalculator ? t('encyclopedia.goToCalcBtn') : t('encyclopedia.addToCalcBtn')}\n                            </button>`,
    'Species detail compatibility button must expose a two-state intent',
  );

  return next;
});

console.log('Applied UI intent decoupling: browse is read-only; selection and navigation are separate actions.');