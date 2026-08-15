from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    file = Path(path)
    text = file.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 exact match, got {count}')
    file.write_text(text.replace(old, new, 1))


replace_once(
    'apps/api/src/routes/user-records.ts',
    """  userRecordsRouter.get(route, asyncRoute(async (request, response) => {
    const client = userClientFor(request);
    const { data, error } = await client
      .from(table)
      .select(`id,${idColumn},created_at,version`)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    if (error) throwDatabaseError(error, '收藏暂时无法加载。');
    const rows = data || [];
    const contentIds = rows.map(row => row[idColumn]).filter(Boolean);
    if (contentIds.length === 0) return sendData(request, response, { items: [] });

    const contentTable = type === 'species' ? 'species' : 'care_articles';
    const contentSelect = type === 'species' ? 'id,catalog_key' : 'id,catalog_key,title';
    const { data: contentRows, error: contentError } = await client
      .from(contentTable)
      .select(contentSelect)
      .in('id', contentIds)
      .is('deleted_at', null);
    if (contentError) throwDatabaseError(contentError, '收藏内容暂时无法加载。');
    const contentById = new Map((contentRows || []).map(item => [item.id, item]));
    const items = rows.flatMap(row => {
      const content = contentById.get(row[idColumn]);
      if (!content?.catalog_key) return [];
      return [{
        catalogKey: content.catalog_key,
        ...(type === 'care' && 'title' in content ? { title: content.title } : {}),
        favoritedAt: row.created_at,
        version: row.version,
      }];
    });
    return sendData(request, response, { items });
  }));
""",
    """  userRecordsRouter.get(route, asyncRoute(async (request, response) => {
    const client = userClientFor(request);
    if (type === 'species') {
      const { data: favoriteRows, error } = await client
        .from('species_favorites')
        .select('species_id,created_at,version')
        .is('deleted_at', null)
        .order('created_at', { ascending: true });
      if (error) throwDatabaseError(error, '收藏暂时无法加载。');
      const speciesIds = (favoriteRows || []).map(row => row.species_id);
      if (speciesIds.length === 0) return sendData(request, response, { items: [] });
      const { data: speciesRows, error: speciesError } = await client
        .from('species')
        .select('id,catalog_key')
        .in('id', speciesIds)
        .is('deleted_at', null);
      if (speciesError) throwDatabaseError(speciesError, '收藏内容暂时无法加载。');
      const speciesById = new Map((speciesRows || []).map(item => [item.id, item]));
      return sendData(request, response, {
        items: (favoriteRows || []).flatMap(row => {
          const content = speciesById.get(row.species_id);
          if (!content?.catalog_key) return [];
          return [{
            catalogKey: content.catalog_key,
            favoritedAt: row.created_at,
            version: row.version,
          }];
        }),
      });
    }

    const { data: favoriteRows, error } = await client
      .from('care_favorites')
      .select('article_id,created_at,version')
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    if (error) throwDatabaseError(error, '收藏暂时无法加载。');
    const articleIds = (favoriteRows || []).map(row => row.article_id);
    if (articleIds.length === 0) return sendData(request, response, { items: [] });
    const { data: articleRows, error: articleError } = await client
      .from('care_articles')
      .select('id,catalog_key,title')
      .in('id', articleIds)
      .is('deleted_at', null);
    if (articleError) throwDatabaseError(articleError, '收藏内容暂时无法加载。');
    const articleById = new Map((articleRows || []).map(item => [item.id, item]));
    return sendData(request, response, {
      items: (favoriteRows || []).flatMap(row => {
        const content = articleById.get(row.article_id);
        if (!content?.catalog_key || !content.title) return [];
        return [{
          catalogKey: content.catalog_key,
          title: content.title,
          favoritedAt: row.created_at,
          version: row.version,
        }];
      }),
    });
  }));
""",
    'typed favorite GET routes',
)

replace_once(
    'src/pages/Encyclopedia.tsx',
    '        onToggleWishlist={toggleWishlist}\n',
    "        onToggleWishlist={(id) => {\n          const fish = fishData.find(item => item.id === id);\n          if (fish) void handleWishlistToggle(fish);\n        }}\n",
    'SpeciesDetailDialog repository favorite handler',
)
