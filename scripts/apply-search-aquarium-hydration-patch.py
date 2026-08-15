from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    file = Path(path)
    text = file.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 exact match, got {count}')
    file.write_text(text.replace(old, new, 1))


replace_once(
    'src/pages/Search.tsx',
    "import { loadAppStateFromStorage } from '../services/storage/local-app-state';\n",
    "import { loadAppStateFromStorage, patchLocalAppState, subscribeToAppState } from '../services/storage/local-app-state';\nimport { getCurrentAquaGuideRepository } from '../services/repository/repository-provider';\n",
    'search repository imports',
)

replace_once(
    'src/pages/Search.tsx',
    """  const [selectedSpecies, setSelectedSpecies] = useState<SearchSuggestion | null>(null);
  const normalizedQuery = normalize(query);
  const aquarium = useMemo(() => {
    const state = loadAppStateFromStorage();
    return state.aquariums.find(item => item.id === state.currentAquariumId) || state.aquariums[0] || null;
  }, []);
""",
    """  const [selectedSpecies, setSelectedSpecies] = useState<SearchSuggestion | null>(null);
  const [appState, setAppState] = useState(loadAppStateFromStorage);
  const [syncNotice, setSyncNotice] = useState('');
  const normalizedQuery = normalize(query);
  const aquarium = useMemo(() => (
    appState.aquariums.find(item => item.id === appState.currentAquariumId)
    || appState.aquariums[0]
    || null
  ), [appState]);

  useEffect(() => subscribeToAppState(() => {
    setAppState(loadAppStateFromStorage());
  }), []);

  useEffect(() => {
    let active = true;
    void getCurrentAquaGuideRepository()
      .then(repository => repository.getAquariums())
      .then(aquariums => {
        if (!active) return;
        const cachedState = loadAppStateFromStorage();
        const currentAquariumId = cachedState.currentAquariumId
          && aquariums.some(item => item.id === cachedState.currentAquariumId)
          ? cachedState.currentAquariumId
          : (aquariums[0]?.id || '');
        patchLocalAppState({ aquariums, currentAquariumId });
        setSyncNotice('');
      })
      .catch(() => {
        if (active) setSyncNotice(isEn ? 'Tank data could not sync. Owned counts use this device cache.' : '鱼缸数据暂时无法同步，已拥有数量当前使用本机缓存。');
      });
    return () => { active = false; };
  }, [isEn]);
""",
    'search reactive aquarium hydration',
)

replace_once(
    'src/pages/Search.tsx',
    """      <header>
        <h1 className="text-2xl font-black text-ink md:text-3xl">{t('searchPage.title')}</h1>
      </header>

      <form onSubmit={submit} className="mt-5">
""",
    """      <header>
        <h1 className="text-2xl font-black text-ink md:text-3xl">{t('searchPage.title')}</h1>
      </header>
      {syncNotice && (
        <div role="status" className="mt-3 rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">{syncNotice}</div>
      )}

      <form onSubmit={submit} className="mt-5">
""",
    'search cache disclosure',
)
