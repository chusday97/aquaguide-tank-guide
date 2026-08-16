import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/pages/CareEncyclopedia.tsx';

const replaceOnce = (before, after) => {
  const content = readFileSync(path, 'utf8');
  const count = content.split(before).length - 1;
  if (count !== 1) throw new Error(`${path}: expected exactly one anchor, found ${count}`);
  writeFileSync(path, content.replace(before, after));
};

replaceOnce(
  `import { InterventionComparisonPanel } from '../components/compatibility/InterventionComparisonPanel';\n`,
  `import { InterventionComparisonPanel } from '../components/compatibility/InterventionComparisonPanel';\nimport { RelocationConfirmationDialog } from '../components/compatibility/RelocationConfirmationDialog';\nimport type { RelocationConfirmationLaunchCandidate } from '../lib/relocationConfirmationEntrypoint';\nimport {\n  createCareRelocationConfirmationController,\n  type CareRelocationConfirmationController,\n} from '../services/care/care-relocation-confirmation.controller';\nimport { applyCareCanonicalAquariums } from '../services/care/care-relocation-canonical-state';\n`,
);

replaceOnce(
  `  const [appState, setAppState] = useState(loadAppStateFromStorage);\n  useEffect(() => subscribeToAppState(() => {\n    setAppState(loadAppStateFromStorage());\n  }), []);\n  const aquariums = appState.aquariums;\n`,
  `  const [appState, setAppState] = useState(loadAppStateFromStorage);\n  const [canonicalAquariums, setCanonicalAquariums] = useState<Aquarium[] | null>(null);\n  useEffect(() => subscribeToAppState(() => {\n    setAppState(loadAppStateFromStorage());\n  }), []);\n  // The local app state is a compatibility mirror. Immediately after a\n  // relocation/reconciliation, a successfully read canonical list takes\n  // precedence until that verified list is persisted back into the mirror.\n  const aquariums = canonicalAquariums ?? appState.aquariums;\n`,
);

replaceOnce(
  `  const [isResultDetailOpen, setIsResultDetailOpen] = useState(false);\n  const [isInterventionComparisonOpen, setIsInterventionComparisonOpen] = useState(false);\n`,
  `  const [isResultDetailOpen, setIsResultDetailOpen] = useState(false);\n  const [isInterventionComparisonOpen, setIsInterventionComparisonOpen] = useState(false);\n  const [relocationController, setRelocationController] = useState<CareRelocationConfirmationController | null>(null);\n`,
);

replaceOnce(
  `  const isTargetReady = !requiresSpeciesScope\n`,
  `  const applyCanonicalCareState = (freshAquariums: Aquarium[]) => {\n    const applied = applyCareCanonicalAquariums({\n      aquariums: freshAquariums,\n      currentAquariumId: diagnosisState.targetAquariumId || appState.currentAquariumId,\n      showCanonicalAquariums: setCanonicalAquariums,\n      persistMirror: patch => patchLocalAppState(patch),\n    });\n    if (applied.mirrorPersisted) {\n      setAppState(applied.mirrorState);\n      // Mirror now contains the exact canonical list, so normal subscriptions can\n      // resume without masking later legitimate local/cross-page state updates.\n      setCanonicalAquariums(null);\n    } else {\n      // Canonical truth is already visible through the direct override. A mirror\n      // failure must not be reclassified as relocation/canonical-read failure.\n      console.warn('AquaGuide Care canonical aquarium mirror sync failed', applied.errorMessage);\n    }\n  };\n\n  const openRelocationConfirmation = (candidate: RelocationConfirmationLaunchCandidate) => {\n    const controller = createCareRelocationConfirmationController({\n      candidate,\n      catalog: fishData,\n      getRepository: getCurrentAquaGuideRepository,\n    });\n    setRelocationController(controller);\n    setIsInterventionComparisonOpen(false);\n  };\n\n  const isTargetReady = !requiresSpeciesScope\n`,
);

replaceOnce(
  `      {decisionSupport && (\n        <InterventionComparisonPanel\n          open={isInterventionComparisonOpen}\n          result={decisionSupport}\n          isEn={isEn}\n          onOpenChange={setIsInterventionComparisonOpen}\n        />\n      )}\n      {/* CARE_CONFLICT_DECISION_SURFACE_END */}\n`,
  `      {decisionSupport && (\n        <InterventionComparisonPanel\n          open={isInterventionComparisonOpen}\n          result={decisionSupport}\n          sourceAquarium={targetAquarium || undefined}\n          isEn={isEn}\n          onOpenChange={setIsInterventionComparisonOpen}\n          onOpenRelocationConfirmation={openRelocationConfirmation}\n        />\n      )}\n\n      {relocationController && (\n        <RelocationConfirmationDialog\n          open={true}\n          request={relocationController.attempt.request}\n          facts={relocationController.attempt.facts}\n          isEn={isEn}\n          onOpenChange={nextOpen => {\n            if (!nextOpen) setRelocationController(null);\n          }}\n          executeFreshRelocation={async request => {\n            if (request.operationId !== relocationController.attempt.operationId) {\n              throw new Error('Relocation confirmation attempt identity changed.');\n            }\n            const result = await relocationController.execute();\n            if (result.status === 'executed') {\n              applyCanonicalCareState(result.postAquariums);\n            }\n            return result;\n          }}\n          onReconcile={async () => {\n            const freshAquariums = await relocationController.reconcile();\n            applyCanonicalCareState(freshAquariums);\n          }}\n        />\n      )}\n      {/* CARE_CONFLICT_DECISION_SURFACE_END */}\n`,
);

console.log('Care relocation confirmation wiring patch applied with unique anchors');
