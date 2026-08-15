from pathlib import Path

service_path = Path('src/services/collection/collection.service.ts')
service_text = service_path.read_text()
old = 'export const hydrateCollectionMemorials = hydrateCollectionData;'
new = 'export const hydrateCollectionMemorials = async (): Promise<CollectionSnapshot> => hydrateCollectionData();'
count = service_text.count(old)
if count != 1:
    raise SystemExit(f'memorial hydration wrapper: expected 1 exact match, got {count}')
service_path.write_text(service_text.replace(old, new, 1))

page_path = Path('src/pages/Collection.tsx')
page_text = page_path.read_text()
old_import = "import { getCollectionSnapshot, hydrateCollectionData, subscribeToCollection } from '../services/collection/collection.service';"
new_import = "import { getCollectionSnapshot, hydrateCollectionData, hydrateCollectionMemorials, subscribeToCollection } from '../services/collection/collection.service';"
if page_text.count(old_import) != 1:
    raise SystemExit('Collection memorial import: expected exactly one match')
page_text = page_text.replace(old_import, new_import, 1)
old_call = '    void hydrateCollectionData()\n'
new_call = '    void hydrateCollectionMemorials()\n'
if page_text.count(old_call) != 1:
    raise SystemExit(f'Collection direct memorial hydration call: expected 1 exact match, got {page_text.count(old_call)}')
page_path.write_text(page_text.replace(old_call, new_call, 1))
