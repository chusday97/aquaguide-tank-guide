let catalogPromise;

const loadCatalog = async () => {
  if (!catalogPromise) {
    catalogPromise = import('./catalog.generated.json').then((module) => {
      const rows = module.default || [];
      return new Map(rows.map((row) => [row.catalog_key, row]));
    });
  }
  return catalogPromise;
};

export async function loadProductTruth(catalogKey) {
  if (!catalogKey) return null;
  const catalog = await loadCatalog();
  return catalog.get(catalogKey) || null;
}
