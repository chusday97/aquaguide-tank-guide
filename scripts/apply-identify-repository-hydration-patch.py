from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    file = Path(path)
    text = file.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 exact match, got {count}')
    file.write_text(text.replace(old, new, 1))


replace_once(
    'src/pages/Identify.tsx',
    "import { loadAppStateFromStorage } from '../services/storage/local-app-state';\n",
    "import { loadAppStateFromStorage, patchLocalAppState, subscribeToAppState } from '../services/storage/local-app-state';\n",
    'identify app-state imports',
)
replace_once(
    'src/pages/Identify.tsx',
    "import { getSpeciesFavoriteIds, setSpeciesFavoriteIds } from '../services/favorites/favorites.service';\n",
    "import { getSpeciesFavoriteIds, setSpeciesFavoriteIds, subscribeToFavorites } from '../services/favorites/favorites.service';\nimport { getCurrentAquaGuideRepository } from '../services/repository/repository-provider';\n",
    'identify repository/favorite imports',
)

replace_once(
    'src/pages/Identify.tsx',
    """  const appState = useMemo(() => loadAppStateFromStorage(), []);
  const aquarium = useMemo(() => appState.aquariums.find(item => item.id === appState.currentAquariumId) || appState.aquariums[0] || null, [appState]);
""",
    """  const [appState, setAppState] = useState(loadAppStateFromStorage);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(getSpeciesFavoriteIds()));

  useEffect(() => subscribeToAppState(() => {
    setAppState(loadAppStateFromStorage());
  }), []);

  useEffect(() => subscribeToFavorites(() => {
    setFavoriteIds(new Set(getSpeciesFavoriteIds()));
  }), []);

  useEffect(() => {
    let active = true;
    void getCurrentAquaGuideRepository()
      .then(async repository => {
        const [aquariums, favorites] = await Promise.all([
          repository.getAquariums(),
          repository.getFavorites(),
        ]);
        return { aquariums, favorites };
      })
      .then(({ aquariums, favorites }) => {
        if (!active) return;
        const cachedState = loadAppStateFromStorage();
        const currentAquariumId = cachedState.currentAquariumId
          && aquariums.some(item => item.id === cachedState.currentAquariumId)
          ? cachedState.currentAquariumId
          : (aquariums[0]?.id || '');
        patchLocalAppState({ aquariums, currentAquariumId });
        setSpeciesFavoriteIds(favorites.speciesCatalogKeys);
        setFavoriteIds(new Set(favorites.speciesCatalogKeys));
      })
      .catch(() => {
        if (active) showToast(isEn ? 'Tank and wishlist data could not sync. Showing this device cache.' : '鱼缸和种草数据暂时无法同步，当前显示本机缓存。', 'error');
      });
    return () => { active = false; };
  }, []);

  const aquarium = useMemo(() => appState.aquariums.find(item => item.id === appState.currentAquariumId) || appState.aquariums[0] || null, [appState]);
  const diagnosisAquariumIdRef = useRef(aquarium?.id || '');
""",
    'identify repository hydration',
)

replace_once(
    'src/pages/Identify.tsx',
    """  const cancelDiagnosisSession = () => {
    diagnosisControllerRef.current?.abort();
    diagnosisRequestIdRef.current += 1;
    if (diagnosisDelayRef.current !== null) {
      window.clearTimeout(diagnosisDelayRef.current);
      diagnosisDelayRef.current = null;
    }
    diagnosisLockedRef.current = false;
    setIsDiagnosing(false);
    setPendingAnswer(null);
  };

""",
    """  const cancelDiagnosisSession = () => {
    diagnosisControllerRef.current?.abort();
    diagnosisRequestIdRef.current += 1;
    if (diagnosisDelayRef.current !== null) {
      window.clearTimeout(diagnosisDelayRef.current);
      diagnosisDelayRef.current = null;
    }
    diagnosisLockedRef.current = false;
    setIsDiagnosing(false);
    setPendingAnswer(null);
  };

  useEffect(() => {
    const nextAquariumId = aquarium?.id || '';
    const previousAquariumId = diagnosisAquariumIdRef.current;
    if (previousAquariumId === nextAquariumId) return;
    diagnosisAquariumIdRef.current = nextAquariumId;
    if (stage !== 'describe' && stage !== 'question' && stage !== 'result') return;
    cancelDiagnosisSession();
    setDescription('');
    setAnswers({});
    setAskedQuestionIds([]);
    setQuestionHistory([]);
    setDiagnosis(null);
    setErrorMessage('');
    setPendingAnswer(null);
    setStage(selectedFish ? 'identified' : 'upload');
    showToast(isEn ? 'Tank data changed, so the health check was reset.' : '鱼缸数据已更新，健康诊断已重置，请基于最新鱼缸状态重新开始。');
  }, [aquarium?.id, stage, selectedFish, isEn, showToast]);

""",
    'identify diagnosis tank-change reset',
)

replace_once(
    'src/pages/Identify.tsx',
    """  const toggleWishlist = (fishId: string) => {
    const ids = new Set(getSpeciesFavoriteIds());
    if (ids.has(fishId)) ids.delete(fishId); else ids.add(fishId);
    setSpeciesFavoriteIds(Array.from(ids));
    showToast(ids.has(fishId) ? t('identify.saved') : t('identify.removed'));
  };
""",
    """  const toggleWishlist = async (fishId: string) => {
    const wasFavorite = favoriteIds.has(fishId);
    try {
      const repository = await getCurrentAquaGuideRepository();
      await repository.updateFavorite({ type: 'species', catalogKey: fishId, favorite: !wasFavorite });
      const favorites = await repository.getFavorites();
      setSpeciesFavoriteIds(favorites.speciesCatalogKeys);
      setFavoriteIds(new Set(favorites.speciesCatalogKeys));
      showToast(!wasFavorite ? t('identify.saved') : t('identify.removed'));
    } catch {
      showToast(isEn ? 'Could not update wishlist. Try again.' : '种草状态没有更新成功，请稍后重试。', 'error');
    }
  };
""",
    'identify repository-first wishlist',
)

replace_once(
    'src/pages/Identify.tsx',
    "{getSpeciesFavoriteIds().includes(selectedFish.id) && <span className=\"rounded-full bg-bg px-3 py-1.5 text-ink/58\">{t('identify.alreadySaved')}</span>}",
    "{favoriteIds.has(selectedFish.id) && <span className=\"rounded-full bg-bg px-3 py-1.5 text-ink/58\">{t('identify.alreadySaved')}</span>}",
    'identify selected favorite display',
)
replace_once(
    'src/pages/Identify.tsx',
    "inWishlist={Boolean(detailFish && getSpeciesFavoriteIds().includes(detailFish.id))}",
    "inWishlist={Boolean(detailFish && favoriteIds.has(detailFish.id))}",
    'identify dialog favorite display',
)
