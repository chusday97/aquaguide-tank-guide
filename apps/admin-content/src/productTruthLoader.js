import catalogUrl from './catalog.generated.json?url';

let catalogPromise;

const loadCatalog = async () => {
  if (!catalogPromise) {
    catalogPromise = fetch(catalogUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`AquaGuide source catalog request failed: ${response.status}`);
        return response.json();
      })
      .then((rows) => new Map((Array.isArray(rows) ? rows : []).map((row) => [row.catalog_key, row])))
      .catch((error) => {
        catalogPromise = undefined;
        throw error;
      });
  }
  return catalogPromise;
};

export async function loadProductTruth(catalogKey) {
  if (!catalogKey) return null;
  const catalog = await loadCatalog();
  return catalog.get(catalogKey) || null;
}
