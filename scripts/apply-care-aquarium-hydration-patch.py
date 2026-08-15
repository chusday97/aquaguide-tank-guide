from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    file = Path(path)
    text = file.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 exact match, got {count}')
    file.write_text(text.replace(old, new, 1))


replace_once(
    'src/pages/CareEncyclopedia.tsx',
    "import { loadAppStateFromStorage } from '../services/storage/local-app-state';\n",
    "import { loadAppStateFromStorage, patchLocalAppState, subscribeToAppState } from '../services/storage/local-app-state';\n",
    'care app state imports',
)

replace_once(
    'src/pages/CareEncyclopedia.tsx',
    "  const appStateSnapshot = useMemo(() => loadAppStateFromStorage(), []);\n",
    "  const [appStateSnapshot, setAppStateSnapshot] = useState(loadAppStateFromStorage);\n\n  useEffect(() => subscribeToAppState(() => {\n    setAppStateSnapshot(loadAppStateFromStorage());\n  }), []);\n",
    'care reactive aquarium snapshot',
)

replace_once(
    'src/pages/CareEncyclopedia.tsx',
    """  useEffect(() => {
    let active = true;
    void getCurrentAquaGuideRepository()
      .then(repository => repository.getFavorites())
      .then(snapshot => {
        if (!active) return;
        const next = Object.fromEntries(snapshot.careFavorites.map(item => [item.catalogKey, {
          id: item.catalogKey,
          title: item.title,
          favoritedAt: item.favoritedAt,
        }]));
        setCareFavorites(next);
        setFavorites(next);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);
""",
    """  useEffect(() => {
    let active = true;
    void getCurrentAquaGuideRepository()
      .then(async repository => {
        const [favoriteSnapshot, aquariums] = await Promise.all([
          repository.getFavorites(),
          repository.getAquariums(),
        ]);
        return { favoriteSnapshot, aquariums };
      })
      .then(({ favoriteSnapshot, aquariums }) => {
        if (!active) return;
        const cachedState = loadAppStateFromStorage();
        const currentAquariumId = cachedState.currentAquariumId
          && aquariums.some(item => item.id === cachedState.currentAquariumId)
          ? cachedState.currentAquariumId
          : (aquariums[0]?.id || '');
        patchLocalAppState({ aquariums, currentAquariumId });
        const next = Object.fromEntries(favoriteSnapshot.careFavorites.map(item => [item.catalogKey, {
          id: item.catalogKey,
          title: item.title,
          favoritedAt: item.favoritedAt,
        }]));
        setCareFavorites(next);
        setFavorites(next);
      })
      .catch(() => {
        if (active) showToast(isEn ? 'Tank data could not sync. Showing this device cache.' : '鱼缸数据暂时无法同步，当前显示本机缓存。', 'error');
      });
    return () => { active = false; };
  }, []);
""",
    'care direct repository hydration',
)

replace_once(
    'src/pages/CareEncyclopedia.tsx',
    "  const appState = useMemo(() => loadAppStateFromStorage(), []);\n  const aquariums = appState.aquariums;\n",
    "  const [appState, setAppState] = useState(loadAppStateFromStorage);\n  useEffect(() => subscribeToAppState(() => {\n    setAppState(loadAppStateFromStorage());\n  }), []);\n  const aquariums = appState.aquariums;\n",
    'quick diagnosis reactive aquarium state',
)
