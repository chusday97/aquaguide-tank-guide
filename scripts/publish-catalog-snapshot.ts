import { buildCatalogArtifacts } from './build-catalog-snapshot';

const outputRoot = process.env.CATALOG_PENDING_DIR || 'build/catalog-pending/releases';
const result = await buildCatalogArtifacts(outputRoot);
console.log(`catalog publish artifact ready (upload intentionally skipped): ${result.releaseDir}`);
