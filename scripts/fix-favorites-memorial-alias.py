from pathlib import Path

path = Path('src/services/collection/collection.service.ts')
text = path.read_text()
old = 'export const hydrateCollectionMemorials = hydrateCollectionData;'
new = 'export const hydrateCollectionMemorials = async (): Promise<CollectionSnapshot> => hydrateCollectionData();'
count = text.count(old)
if count != 1:
    raise SystemExit(f'memorial hydration wrapper: expected 1 exact match, got {count}')
path.write_text(text.replace(old, new, 1))
