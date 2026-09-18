import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLocalCatalogSnapshot } from '../src/services/catalog/catalog-snapshot.service';

const version = process.env.CATALOG_VERSION || 'local-fish-data-v1';
const root = process.env.CATALOG_OUTPUT_DIR || 'build/catalog/releases';

export const buildCatalogArtifacts = async (outputRoot = root, outputVersion = version) => {
  const snapshot = await buildLocalCatalogSnapshot();
  if (snapshot.manifest.version !== outputVersion) throw new Error(`Catalog version mismatch: ${snapshot.manifest.version} != ${outputVersion}`);
  const releaseDir = join(outputRoot, outputVersion);
  await mkdir(releaseDir, { recursive: true });
  await writeFile(join(releaseDir, 'catalog.snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  await writeFile(join(releaseDir, 'catalog.manifest.json'), `${JSON.stringify(snapshot.manifest, null, 2)}\n`, 'utf8');
  return { releaseDir, snapshot };
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = await buildCatalogArtifacts();
  console.log(`catalog build complete: ${result.snapshot.species.length} species, version ${result.snapshot.manifest.version}, checksum ${result.snapshot.manifest.checksumSha256}`);
}
