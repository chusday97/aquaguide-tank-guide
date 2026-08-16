from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    file = Path(path)
    text = file.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 exact match, got {count}')
    file.write_text(text.replace(old, new, 1))


path = 'src/pages/AIAssistant.tsx'

replace_once(
    path,
    "import { addSpeciesFavorite, getSpeciesFavoriteIds, subscribeToFavorites } from '../services/favorites/favorites.service';\n",
    "import { getSpeciesFavoriteIds, setSpeciesFavoriteIds, subscribeToFavorites } from '../services/favorites/favorites.service';\nimport { getCurrentAquaGuideRepository } from '../services/repository/repository-provider';\n",
    'assistant favorites imports',
)

replace_once(
    path,
    "  const [wishlistFishIds, setWishlistFishIds] = useState<Set<string>>(() => new Set(getSpeciesFavoriteIds()));\n  const scrollRef = useRef<HTMLDivElement>(null);\n",
    "  const [wishlistFishIds, setWishlistFishIds] = useState<Set<string>>(() => new Set(getSpeciesFavoriteIds()));\n  const [favoriteSyncError, setFavoriteSyncError] = useState('');\n  const scrollRef = useRef<HTMLDivElement>(null);\n",
    'assistant favorites error state',
)

replace_once(
    path,
    "  useEffect(() => subscribeToFavorites(() => {\n    setWishlistFishIds(new Set(getSpeciesFavoriteIds()));\n  }), []);\n",
    "  useEffect(() => {\n    let active = true;\n    const refreshLocal = () => {\n      if (active) setWishlistFishIds(new Set(getSpeciesFavoriteIds()));\n    };\n    refreshLocal();\n    const unsubscribe = subscribeToFavorites(refreshLocal);\n\n    void (async () => {\n      try {\n        const repository = await getCurrentAquaGuideRepository();\n        const favorites = await repository.getFavorites();\n        if (!active) return;\n        setSpeciesFavoriteIds(favorites.speciesCatalogKeys);\n        setWishlistFishIds(new Set(favorites.speciesCatalogKeys));\n        setFavoriteSyncError('');\n      } catch (error) {\n        if (!active) return;\n        console.error('Failed to hydrate Assistant favorites', error);\n        setFavoriteSyncError(isEn\n          ? 'Saved species could not be synced. Showing this device cache.'\n          : '收藏暂时无法同步，当前展示此设备缓存。');\n      }\n    })();\n\n    return () => {\n      active = false;\n      unsubscribe();\n    };\n  }, [isEn]);\n",
    'assistant direct favorites hydration',
)

replace_once(
    path,
    "  const addToWishlist = (speciesId: string) => {\n    addSpeciesFavorite(speciesId);\n    setWishlistFishIds(new Set(getSpeciesFavoriteIds()));\n  };\n",
    "  const addToWishlist = async (speciesId: string) => {\n    if (wishlistFishIds.has(speciesId)) return;\n    try {\n      const repository = await getCurrentAquaGuideRepository();\n      await repository.updateFavorite({ type: 'species', catalogKey: speciesId, favorite: true });\n      const favorites = await repository.getFavorites();\n      setSpeciesFavoriteIds(favorites.speciesCatalogKeys);\n      setWishlistFishIds(new Set(favorites.speciesCatalogKeys));\n      setFavoriteSyncError('');\n    } catch (error) {\n      console.error('Failed to save Assistant favorite', error);\n      setFavoriteSyncError(isEn\n        ? 'Species was not saved because the favorite could not be persisted.'\n        : '收藏没有保存成功，本次修改未生效。');\n    }\n  };\n",
    'assistant repository-first favorite write',
)

replace_once(
    path,
    "      </header>\n      \n      <div className=\"flex min-h-[560px] flex-1 flex-col overflow-hidden border border-border bg-white p-3 md:flex-row md:gap-4 md:p-4 lg:min-h-[680px]\">\n",
    "      </header>\n      {favoriteSyncError && (\n        <div role=\"alert\" className=\"mb-3 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800\">\n          {favoriteSyncError}\n        </div>\n      )}\n      \n      <div className=\"flex min-h-[560px] flex-1 flex-col overflow-hidden border border-border bg-white p-3 md:flex-row md:gap-4 md:p-4 lg:min-h-[680px]\">\n",
    'assistant favorite sync disclosure',
)

replace_once(
    path,
    '                                onClick={() => addToWishlist(speciesId)}\n',
    '                                onClick={() => void addToWishlist(speciesId)}\n',
    'assistant async favorite click',
)
