from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    file = Path(path)
    text = file.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 exact match, got {count}')
    file.write_text(text.replace(old, new, 1))


# Repository contract: favorites need a read model based on stable catalog keys, never DB UUIDs.
replace_once(
    'src/services/repository/aquaguide.repository.ts',
    "export type FavoriteMutation =\n  | { type: 'species'; catalogKey: string; favorite: boolean }\n  | { type: 'care'; catalogKey: string; title: string; favorite: boolean };\n",
    "export type FavoriteMutation =\n  | { type: 'species'; catalogKey: string; favorite: boolean }\n  | { type: 'care'; catalogKey: string; title: string; favorite: boolean };\n\nexport type FavoriteSnapshot = {\n  speciesCatalogKeys: string[];\n  careFavorites: Array<{ catalogKey: string; title: string; favoritedAt: string }>;\n};\n",
    'favorite snapshot type',
)
replace_once(
    'src/services/repository/aquaguide.repository.ts',
    '  removeLivestock(input: LivestockRemovalInput): Promise<Aquarium>;\n  updateFavorite(input: FavoriteMutation): Promise<void>;\n',
    '  removeLivestock(input: LivestockRemovalInput): Promise<Aquarium>;\n  getFavorites(): Promise<FavoriteSnapshot>;\n  updateFavorite(input: FavoriteMutation): Promise<void>;\n',
    'repository favorite read contract',
)

# Local repository preserves the current compatibility-cache semantics.
replace_once(
    'src/services/repository/local-aquaguide.repository.ts',
    '  async updateFavorite(input: FavoriteMutation) {\n',
    "  async getFavorites() {\n    return {\n      speciesCatalogKeys: getSpeciesFavoriteIds(),\n      careFavorites: Object.values(getCareFavorites()).map(item => ({\n        catalogKey: item.id,\n        title: item.title,\n        favoritedAt: item.favoritedAt,\n      })),\n    };\n  }\n\n  async updateFavorite(input: FavoriteMutation) {\n",
    'local favorite read implementation',
)

# API repository reads stable DTOs and keeps DB UUIDs internal.
replace_once(
    'src/services/repository/api-aquaguide.repository.ts',
    "type ApiMemorial = {\n  id: string;\n  speciesCatalogKey: string;\n  memorialDate: string;\n  causeCodes?: DeceasedRecord['causeCodes'];\n  reason?: string;\n  observation?: string;\n  improvement?: string;\n  version?: number;\n};\n",
    "type ApiMemorial = {\n  id: string;\n  speciesCatalogKey: string;\n  memorialDate: string;\n  causeCodes?: DeceasedRecord['causeCodes'];\n  reason?: string;\n  observation?: string;\n  improvement?: string;\n  version?: number;\n};\ntype ApiFavorite = {\n  catalogKey: string;\n  title?: string;\n  favoritedAt: string;\n  version: number;\n};\n",
    'api favorite dto type',
)
replace_once(
    'src/services/repository/api-aquaguide.repository.ts',
    '  async updateFavorite(input: FavoriteMutation) {\n',
    "  async getFavorites() {\n    const [speciesResponse, careResponse] = await Promise.all([\n      apiRequest<{ items: ApiFavorite[] }>('/favorites/species'),\n      apiRequest<{ items: ApiFavorite[] }>('/favorites/care'),\n    ]);\n    return {\n      speciesCatalogKeys: (speciesResponse.items || []).map(item => item.catalogKey),\n      careFavorites: (careResponse.items || [])\n        .filter(item => Boolean(item.catalogKey && item.title))\n        .map(item => ({ catalogKey: item.catalogKey, title: item.title!, favoritedAt: item.favoritedAt })),\n    };\n  }\n\n  async updateFavorite(input: FavoriteMutation) {\n",
    'api favorite read implementation',
)

# API GET routes resolve internal content UUIDs back to stable catalog keys.
replace_once(
    'apps/api/src/routes/user-records.ts',
    "  userRecordsRouter.get(route, asyncRoute(async (request, response) => {\n    const client = userClientFor(request);\n    const { data, error } = await client.from(table).select('*').is('deleted_at', null).order('created_at', { ascending: false });\n    if (error) throwDatabaseError(error, '收藏暂时无法加载。');\n    return sendData(request, response, camelize(data || []));\n  }));\n",
    "  userRecordsRouter.get(route, asyncRoute(async (request, response) => {\n    const client = userClientFor(request);\n    const { data, error } = await client\n      .from(table)\n      .select(`id,${idColumn},created_at,version`)\n      .is('deleted_at', null)\n      .order('created_at', { ascending: true });\n    if (error) throwDatabaseError(error, '收藏暂时无法加载。');\n    const rows = data || [];\n    const contentIds = rows.map(row => row[idColumn]).filter(Boolean);\n    if (contentIds.length === 0) return sendData(request, response, { items: [] });\n\n    const contentTable = type === 'species' ? 'species' : 'care_articles';\n    const contentSelect = type === 'species' ? 'id,catalog_key' : 'id,catalog_key,title';\n    const { data: contentRows, error: contentError } = await client\n      .from(contentTable)\n      .select(contentSelect)\n      .in('id', contentIds)\n      .is('deleted_at', null);\n    if (contentError) throwDatabaseError(contentError, '收藏内容暂时无法加载。');\n    const contentById = new Map((contentRows || []).map(item => [item.id, item]));\n    const items = rows.flatMap(row => {\n      const content = contentById.get(row[idColumn]);\n      if (!content?.catalog_key) return [];\n      return [{\n        catalogKey: content.catalog_key,\n        ...(type === 'care' && 'title' in content ? { title: content.title } : {}),\n        favoritedAt: row.created_at,\n        version: row.version,\n      }];\n    });\n    return sendData(request, response, { items });\n  }));\n",
    'favorite API stable DTO',
)

# Collection hydration now covers all collection-owned cloud records, not memorials only.
replace_once(
    'src/services/collection/collection.service.ts',
    "  getCareFavorites,\n  getSpeciesFavoriteIds,\n  subscribeToFavorites,\n  type CareFavoriteMap,\n",
    "  getCareFavorites,\n  getSpeciesFavoriteIds,\n  setCareFavorites,\n  setSpeciesFavoriteIds,\n  subscribeToFavorites,\n  type CareFavoriteMap,\n",
    'collection favorites mirror imports',
)
replace_once(
    'src/services/collection/collection.service.ts',
    "export const hydrateCollectionMemorials = async (): Promise<CollectionSnapshot> => {\n  const mode = await resolveRepositoryMode();\n  if (mode !== 'cloud') return getCollectionSnapshot();\n  const repository = getAquaGuideRepository(mode);\n  const memorials = await repository.getMemorialRecords();\n  patchLocalAppState({ deceasedRecords: memorials });\n  return getCollectionSnapshot();\n};\n",
    "export const hydrateCollectionData = async (): Promise<CollectionSnapshot> => {\n  const mode = await resolveRepositoryMode();\n  if (mode !== 'cloud') return getCollectionSnapshot();\n  const repository = getAquaGuideRepository(mode);\n  const [memorials, favorites] = await Promise.all([\n    repository.getMemorialRecords(),\n    repository.getFavorites(),\n  ]);\n  patchLocalAppState({ deceasedRecords: memorials });\n  setSpeciesFavoriteIds(favorites.speciesCatalogKeys);\n  setCareFavorites(Object.fromEntries(favorites.careFavorites.map(item => [item.catalogKey, {\n    id: item.catalogKey,\n    title: item.title,\n    favoritedAt: item.favoritedAt,\n  }])));\n  return getCollectionSnapshot();\n};\n\nexport const hydrateCollectionMemorials = hydrateCollectionData;\n",
    'collection full cloud hydration',
)

# Collection direct entry hydrates favorites and uses repository-first deletes.
replace_once(
    'src/pages/Collection.tsx',
    "import { getCollectionSnapshot, hydrateCollectionMemorials, subscribeToCollection } from '../services/collection/collection.service';\nimport { setCompatibilitySelection } from '../services/compatibility/compatibility-selection.service';\nimport { getCareFavorites, getSpeciesFavoriteIds, setSpeciesFavoriteIds, toggleCareFavorite } from '../services/favorites/favorites.service';\n",
    "import { getCollectionSnapshot, hydrateCollectionData, subscribeToCollection } from '../services/collection/collection.service';\nimport { setCompatibilitySelection } from '../services/compatibility/compatibility-selection.service';\nimport { getCurrentAquaGuideRepository } from '../services/repository/repository-provider';\n",
    'Collection cloud imports',
)
replace_once(
    'src/pages/Collection.tsx',
    "    void hydrateCollectionMemorials()\n      .then(next => { if (active) setSnapshot(next); })\n      .catch(() => {\n        if (active && activeTab === 'memorial') showToast(isEn ? 'Could not refresh memorial history.' : '生命纪念暂时无法同步，正在显示本机缓存。', 'error');\n      });\n",
    "    void hydrateCollectionData()\n      .then(next => { if (active) setSnapshot(next); })\n      .catch(() => {\n        if (active && activeTab !== 'achievements') showToast(isEn ? 'Could not refresh collection data.' : '水族册暂时无法同步，正在显示本机缓存。', 'error');\n      });\n",
    'Collection full hydration effect',
)
replace_once(
    'src/pages/Collection.tsx',
    "  const removeFishFavorite = () => {\n    if (!pendingFishRemoval) return;\n    setSpeciesFavoriteIds(snapshot.wishlistIds.filter(id => id !== pendingFishRemoval.id));\n    if (getSpeciesFavoriteIds().includes(pendingFishRemoval.id)) {\n      showToast(isEn ? 'Could not remove this item. Try again.' : '移除失败，请稍后重试。', 'error');\n      return;\n    }\n    setPendingFishRemoval(null);\n    if (deepLink?.module === 'wishlist' && deepLink.itemId === pendingFishRemoval.id) {\n      setSelectedFish(null);\n      clearDeepLinkItem();\n    }\n    showToast(isEn ? 'Removed from species wishlist' : '已从种草图鉴移除');\n  };\n\n  const removeCareFavorite = () => {\n    if (!pendingCareRemoval) return;\n    toggleCareFavorite({ id: pendingCareRemoval.id, title: pendingCareRemoval.title, favoritedAt: new Date().toISOString() });\n    if (getCareFavorites()[pendingCareRemoval.id]) {\n      showToast(isEn ? 'Could not remove this item. Try again.' : '移除失败，请稍后重试。', 'error');\n      return;\n    }\n    setPendingCareRemoval(null);\n    if (deepLink?.module === 'care' && deepLink.itemId === pendingCareRemoval.id) {\n      setSelectedTopic(null);\n      clearDeepLinkItem();\n    }\n    showToast(isEn ? 'Removed from care collection' : '已从养护收藏移除');\n  };\n",
    "  const removeFishFavorite = async () => {\n    if (!pendingFishRemoval) return;\n    const target = pendingFishRemoval;\n    try {\n      const repository = await getCurrentAquaGuideRepository();\n      await repository.updateFavorite({ type: 'species', catalogKey: target.id, favorite: false });\n      setSnapshot(await hydrateCollectionData());\n      setPendingFishRemoval(null);\n      if (deepLink?.module === 'wishlist' && deepLink.itemId === target.id) {\n        setSelectedFish(null);\n        clearDeepLinkItem();\n      }\n      showToast(isEn ? 'Removed from species wishlist' : '已从种草图鉴移除');\n    } catch {\n      showToast(isEn ? 'Could not remove this item. Try again.' : '移除失败，请稍后重试。', 'error');\n    }\n  };\n\n  const removeCareFavorite = async () => {\n    if (!pendingCareRemoval) return;\n    const target = pendingCareRemoval;\n    try {\n      const repository = await getCurrentAquaGuideRepository();\n      await repository.updateFavorite({ type: 'care', catalogKey: target.id, title: target.title, favorite: false });\n      setSnapshot(await hydrateCollectionData());\n      setPendingCareRemoval(null);\n      if (deepLink?.module === 'care' && deepLink.itemId === target.id) {\n        setSelectedTopic(null);\n        clearDeepLinkItem();\n      }\n      showToast(isEn ? 'Removed from care collection' : '已从养护收藏移除');\n    } catch {\n      showToast(isEn ? 'Could not remove this item. Try again.' : '移除失败，请稍后重试。', 'error');\n    }\n  };\n",
    'Collection repository-first deletes',
)

# Encyclopedia hydrates cloud favorites on direct entry and persists heart changes before mirroring local state.
replace_once(
    'src/pages/Encyclopedia.tsx',
    "        const repository = await getCurrentAquaGuideRepository();\n        const aquariums = await repository.getAquariums();\n        if (cancelled) return;\n",
    "        const repository = await getCurrentAquaGuideRepository();\n        const [aquariums, favorites] = await Promise.all([repository.getAquariums(), repository.getFavorites()]);\n        if (cancelled) return;\n",
    'Encyclopedia repository favorite hydrate read',
)
replace_once(
    'src/pages/Encyclopedia.tsx',
    "        setOwnedFishIds(ids);\n        setAvailableAquariums(aquariums);\n        setCurrentAquarium(current || null);\n",
    "        setOwnedFishIds(ids);\n        setAvailableAquariums(aquariums);\n        setCurrentAquarium(current || null);\n        setSpeciesFavoriteIds(favorites.speciesCatalogKeys);\n        setWishlistFishIds(new Set(favorites.speciesCatalogKeys));\n",
    'Encyclopedia favorite hydrate mirror',
)
replace_once(
    'src/pages/Encyclopedia.tsx',
    "  const syncWishlistFishIds = (next: Set<string>) => {\n    setWishlistFishIds(next);\n    setSpeciesFavoriteIds(next);\n  };\n\n",
    '',
    'remove local-only wishlist sync helper',
)
replace_once(
    'src/pages/Encyclopedia.tsx',
    "  const toggleWishlist = (id: string) => {\n    const next = new Set(wishlistFishIds);\n    if (next.has(id)) next.delete(id);\n    else next.add(id);\n    syncWishlistFishIds(next);\n  };\n\n  const handleWishlistToggle = (fish: Fish) => {\n    const wasFavorite = wishlistFishIds.has(fish.id);\n    const next = new Set(wishlistFishIds);\n    if (wasFavorite) next.delete(fish.id);\n    else next.add(fish.id);\n\n    try {\n      setSpeciesFavoriteIds(next);\n      const savedIds = new Set(getSpeciesFavoriteIds());\n      const savedAsExpected = savedIds.has(fish.id) === !wasFavorite;\n      if (!savedAsExpected) throw new Error('收藏状态未能保存');\n      setWishlistFishIds(savedIds);\n      setWishlistFeedback({\n        message: wasFavorite ? t('encyclopedia.wishlistRemoved', { name: fish.name }) : t('encyclopedia.wishlistAdded', { name: fish.name }),\n        added: !wasFavorite,\n      });\n      if (!wasFavorite) {\n        try {\n          posthog.capture('species_favorited', { species_id: fish.id });\n        } catch (e) {}\n      }\n    } catch {\n      setWishlistFishIds(loadWishlistIds());\n      setWishlistFeedback({\n        message: t('encyclopedia.wishlistSaveError'),\n        added: false,\n        error: true,\n      });\n    }\n  };\n",
    "  const handleWishlistToggle = async (fish: Fish) => {\n    const wasFavorite = wishlistFishIds.has(fish.id);\n    try {\n      const repository = await getCurrentAquaGuideRepository();\n      await repository.updateFavorite({ type: 'species', catalogKey: fish.id, favorite: !wasFavorite });\n      const favorites = await repository.getFavorites();\n      setSpeciesFavoriteIds(favorites.speciesCatalogKeys);\n      setWishlistFishIds(new Set(favorites.speciesCatalogKeys));\n      setWishlistFeedback({\n        message: wasFavorite ? t('encyclopedia.wishlistRemoved', { name: fish.name }) : t('encyclopedia.wishlistAdded', { name: fish.name }),\n        added: !wasFavorite,\n      });\n      if (!wasFavorite) {\n        try {\n          posthog.capture('species_favorited', { species_id: fish.id });\n        } catch (e) {}\n      }\n    } catch {\n      setWishlistFishIds(loadWishlistIds());\n      setWishlistFeedback({\n        message: t('encyclopedia.wishlistSaveError'),\n        added: false,\n        error: true,\n      });\n    }\n  };\n",
    'Encyclopedia repository-first favorite mutation',
)
replace_once(
    'src/pages/Encyclopedia.tsx',
    '                        onClick={() => toggleWishlist(selectedFish.id)}\n',
    '                        onClick={() => void handleWishlistToggle(selectedFish)}\n',
    'Encyclopedia detail favorite button',
)

# Care Encyclopedia hydrates and mutates favorites through the repository.
replace_once(
    'src/pages/CareEncyclopedia.tsx',
    "  getCareFavorites,\n  subscribeToFavorites,\n  toggleCareFavorite,\n  type CareFavoriteMap,\n",
    "  getCareFavorites,\n  setCareFavorites,\n  subscribeToFavorites,\n  type CareFavoriteMap,\n",
    'Care favorites imports',
)
replace_once(
    'src/pages/CareEncyclopedia.tsx',
    "  useEffect(() => subscribeToFavorites(() => {\n    setFavorites(getCareFavorites());\n  }), []);\n",
    "  useEffect(() => subscribeToFavorites(() => {\n    setFavorites(getCareFavorites());\n  }), []);\n\n  useEffect(() => {\n    let active = true;\n    void getCurrentAquaGuideRepository()\n      .then(repository => repository.getFavorites())\n      .then(snapshot => {\n        if (!active) return;\n        const next = Object.fromEntries(snapshot.careFavorites.map(item => [item.catalogKey, {\n          id: item.catalogKey,\n          title: item.title,\n          favoritedAt: item.favoritedAt,\n        }]));\n        setCareFavorites(next);\n        setFavorites(next);\n      })\n      .catch(() => undefined);\n    return () => { active = false; };\n  }, []);\n",
    'Care direct favorite hydrate',
)
replace_once(
    'src/pages/CareEncyclopedia.tsx',
    "  const toggleFavorite = (topic: CareTopic, source?: HTMLElement) => {\n    const isAdding = !favorites[topic.id];\n    if (isAdding) launchFavoriteFly(source);\n    const next = toggleCareFavorite({\n      id: topic.id,\n      title: getDisplayTitle(topic),\n      favoritedAt: new Date().toISOString(),\n    });\n    setFavorites(next);\n    showToast(isAdding ? '已收录到水族册' : '已从水族册移除');\n    if (isAdding) {\n      try {\n        posthog.capture('care_article_favorited', { topic_id: topic.id });\n      } catch (e) {}\n    }\n  };\n",
    "  const toggleFavorite = async (topic: CareTopic, source?: HTMLElement) => {\n    const isAdding = !favorites[topic.id];\n    try {\n      const repository = await getCurrentAquaGuideRepository();\n      await repository.updateFavorite({ type: 'care', catalogKey: topic.id, title: getDisplayTitle(topic), favorite: isAdding });\n      const snapshot = await repository.getFavorites();\n      const next = Object.fromEntries(snapshot.careFavorites.map(item => [item.catalogKey, {\n        id: item.catalogKey,\n        title: item.title,\n        favoritedAt: item.favoritedAt,\n      }]));\n      setCareFavorites(next);\n      setFavorites(next);\n      if (isAdding) launchFavoriteFly(source);\n      showToast(isAdding ? '已收录到水族册' : '已从水族册移除');\n      if (isAdding) {\n        try {\n          posthog.capture('care_article_favorited', { topic_id: topic.id });\n        } catch (e) {}\n      }\n    } catch {\n      showToast(isEn ? 'Could not update collection. Try again.' : '收藏没有更新成功，请稍后重试。', 'error');\n    }\n  };\n",
    'Care repository-first favorite mutation',
)

# Add a permanent regression script entry.
replace_once(
    'package.json',
    '    "test:collection-memorial-hydration": "node --import tsx scripts/test-collection-memorial-hydration.ts",\n',
    '    "test:collection-memorial-hydration": "node --import tsx scripts/test-collection-memorial-hydration.ts",\n    "test:favorites-repository": "node --import tsx scripts/test-favorites-repository-boundary.ts",\n',
    'favorites repository test script',
)
