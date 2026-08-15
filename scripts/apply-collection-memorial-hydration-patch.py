from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    file = Path(path)
    text = file.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 exact match, got {count}')
    file.write_text(text.replace(old, new, 1))


replace_once(
    'src/services/collection/collection.service.ts',
    "  loadAppStateFromStorage,\n  subscribeToAppState,\n  type LocalAppState,\n} from '../storage/local-app-state';\n",
    "  loadAppStateFromStorage,\n  patchLocalAppState,\n  subscribeToAppState,\n  type LocalAppState,\n} from '../storage/local-app-state';\n",
    'collection local patch import',
)
replace_once(
    'src/services/collection/collection.service.ts',
    "import { taskRoutes } from '../navigation/task-routes';\n",
    "import { taskRoutes } from '../navigation/task-routes';\nimport { getAquaGuideRepository, resolveRepositoryMode } from '../repository/repository-provider';\n",
    'collection repository import',
)
replace_once(
    'src/services/collection/collection.service.ts',
    'export const subscribeToCollection = (listener: () => void) => {\n',
    "export const hydrateCollectionMemorials = async (): Promise<CollectionSnapshot> => {\n  const mode = await resolveRepositoryMode();\n  if (mode !== 'cloud') return getCollectionSnapshot();\n  const repository = getAquaGuideRepository(mode);\n  const memorials = await repository.getMemorialRecords();\n  patchLocalAppState({ deceasedRecords: memorials });\n  return getCollectionSnapshot();\n};\n\nexport const subscribeToCollection = (listener: () => void) => {\n",
    'collection memorial hydrate function',
)

replace_once(
    'src/pages/Collection.tsx',
    "import { getCollectionSnapshot, subscribeToCollection } from '../services/collection/collection.service';\n",
    "import { getCollectionSnapshot, hydrateCollectionMemorials, subscribeToCollection } from '../services/collection/collection.service';\n",
    'Collection hydrate import',
)
replace_once(
    'src/pages/Collection.tsx',
    "  useEffect(() => subscribeToCollection(() => {\n    setSnapshot(getCollectionSnapshot());\n  }), []);\n\n",
    "  useEffect(() => subscribeToCollection(() => {\n    setSnapshot(getCollectionSnapshot());\n  }), []);\n\n  useEffect(() => {\n    let active = true;\n    void hydrateCollectionMemorials()\n      .then(next => { if (active) setSnapshot(next); })\n      .catch(() => {\n        if (active && activeTab === 'memorial') showToast(isEn ? 'Could not refresh memorial history.' : '生命纪念暂时无法同步，正在显示本机缓存。', 'error');\n      });\n    return () => { active = false; };\n  }, [activeTab, isEn, showToast]);\n\n",
    'Collection direct hydrate effect',
)

replace_once(
    'src/pages/MemorialDetail.tsx',
    "import { getCollectionSnapshot, subscribeToCollection } from '../services/collection/collection.service';\n",
    "import { getCollectionSnapshot, hydrateCollectionMemorials, subscribeToCollection } from '../services/collection/collection.service';\n",
    'MemorialDetail hydrate import',
)
replace_once(
    'src/pages/MemorialDetail.tsx',
    "  const [record, setRecord] = useState<MemorialItem | null>(() => (\n    getCollectionSnapshot().memorials.find(item => item.id === recordId) || null\n  ));\n",
    "  const [record, setRecord] = useState<MemorialItem | null>(() => (\n    getCollectionSnapshot().memorials.find(item => item.id === recordId) || null\n  ));\n  const [isMemorialHydrating, setIsMemorialHydrating] = useState(true);\n",
    'MemorialDetail hydration state',
)
replace_once(
    'src/pages/MemorialDetail.tsx',
    "  useEffect(() => subscribeToCollection(() => {\n    const next = getCollectionSnapshot().memorials.find(item => item.id === recordId) || null;\n    setRecord(next);\n    if (next && !dirty) setDraft(createDraft(next));\n  }), [dirty, recordId]);\n\n",
    "  useEffect(() => subscribeToCollection(() => {\n    const next = getCollectionSnapshot().memorials.find(item => item.id === recordId) || null;\n    setRecord(next);\n    if (next && !dirty) setDraft(createDraft(next));\n  }), [dirty, recordId]);\n\n  useEffect(() => {\n    let active = true;\n    setIsMemorialHydrating(true);\n    void hydrateCollectionMemorials()\n      .then(snapshot => {\n        if (!active) return;\n        const next = snapshot.memorials.find(item => item.id === recordId) || null;\n        setRecord(next);\n        if (next) setDraft(createDraft(next));\n      })\n      .catch(() => {\n        if (active) showToast(isEn ? 'Could not refresh this memorial.' : '这条生命纪念暂时无法从云端刷新。', 'error');\n      })\n      .finally(() => { if (active) setIsMemorialHydrating(false); });\n    return () => { active = false; };\n  }, [isEn, recordId, showToast]);\n\n",
    'MemorialDetail direct hydrate effect',
)
replace_once(
    'src/pages/MemorialDetail.tsx',
    '  if (!record) {\n',
    "  if (isMemorialHydrating && !record) {\n    return (\n      <main className=\"page-frame mx-auto w-full max-w-[980px] pb-24\">\n        <section className=\"mt-4 rounded-[24px] border border-slate-200 bg-white px-5 py-14 text-center\">\n          <HeartHandshake className=\"mx-auto h-9 w-9 animate-pulse text-emerald-700/40\" />\n          <h1 className=\"mt-4 text-xl font-black text-ink\">{isEn ? 'Loading memorial' : '正在加载生命纪念'}</h1>\n        </section>\n      </main>\n    );\n  }\n\n  if (!record) {\n",
    'MemorialDetail loading state',
)
replace_once(
    'package.json',
    '    "test:memorial-repository": "node --import tsx scripts/test-memorial-repository-boundary.ts",\n',
    '    "test:memorial-repository": "node --import tsx scripts/test-memorial-repository-boundary.ts",\n    "test:collection-memorial-hydration": "node --import tsx scripts/test-collection-memorial-hydration.ts",\n',
    'collection memorial test script',
)
