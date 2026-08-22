import fs from 'node:fs';
import path from 'node:path';

const normalizeId = (id) => {
  const cwd = process.cwd().replace(/\\/g, '/');
  const value = String(id || '').replace(/\\/g, '/').replace(/\?.*$/, '');
  return value.startsWith(`${cwd}/`) ? value.slice(cwd.length + 1) : value;
};

const packageNameFromId = (id) => {
  const marker = '/node_modules/';
  const normalized = String(id || '').replace(/\\/g, '/');
  const index = normalized.lastIndexOf(marker);
  if (index < 0) return '(app)';
  const rest = normalized.slice(index + marker.length);
  const parts = rest.split('/');
  return parts[0]?.startsWith('@') ? `${parts[0]}/${parts[1] || ''}` : parts[0] || '(unknown)';
};

export const bundleAuditPlugin = () => ({
  name: 'aquaguide-bundle-audit',
  generateBundle(_options, bundle) {
    const chunks = [];
    const packageTotals = new Map();
    const moduleTotals = new Map();

    for (const output of Object.values(bundle)) {
      if (output.type !== 'chunk') continue;

      const modules = Object.entries(output.modules)
        .map(([id, info]) => {
          const renderedLength = Number(info.renderedLength || 0);
          const normalizedId = normalizeId(id);
          const packageName = packageNameFromId(id);
          packageTotals.set(packageName, (packageTotals.get(packageName) || 0) + renderedLength);
          moduleTotals.set(normalizedId, (moduleTotals.get(normalizedId) || 0) + renderedLength);
          return {
            id: normalizedId,
            package: packageName,
            renderedLength,
            originalLength: Number(info.originalLength || 0),
          };
        })
        .sort((a, b) => b.renderedLength - a.renderedLength);

      chunks.push({
        fileName: output.fileName,
        name: output.name,
        isEntry: output.isEntry,
        isDynamicEntry: output.isDynamicEntry,
        codeBytes: Buffer.byteLength(output.code),
        moduleCount: modules.length,
        imports: output.imports,
        dynamicImports: output.dynamicImports,
        topModules: modules.slice(0, 25),
      });
    }

    chunks.sort((a, b) => b.codeBytes - a.codeBytes);
    const packages = [...packageTotals.entries()]
      .map(([name, renderedLength]) => ({ name, renderedLength }))
      .sort((a, b) => b.renderedLength - a.renderedLength);
    const modules = [...moduleTotals.entries()]
      .map(([id, renderedLength]) => ({ id, renderedLength }))
      .sort((a, b) => b.renderedLength - a.renderedLength);

    const report = {
      generatedAt: new Date().toISOString(),
      totalChunkCodeBytes: chunks.reduce((sum, chunk) => sum + chunk.codeBytes, 0),
      entryChunks: chunks.filter(chunk => chunk.isEntry),
      dynamicEntryChunks: chunks.filter(chunk => chunk.isDynamicEntry),
      chunks,
      topPackages: packages.slice(0, 30),
      topModules: modules.slice(0, 50),
    };

    const artifactDir = path.resolve('artifacts');
    fs.mkdirSync(artifactDir, { recursive: true });
    fs.writeFileSync(path.join(artifactDir, 'bundle-audit.json'), `${JSON.stringify(report, null, 2)}\n`);

    console.log('\nAquaGuide bundle audit — largest chunks');
    for (const chunk of chunks.slice(0, 12)) {
      console.log(`- ${chunk.fileName}: ${(chunk.codeBytes / 1024).toFixed(1)} KiB${chunk.isEntry ? ' [entry]' : chunk.isDynamicEntry ? ' [dynamic]' : ''}`);
    }
    console.log('AquaGuide bundle audit — largest package contributions');
    for (const pkg of packages.slice(0, 12)) {
      console.log(`- ${pkg.name}: ${(pkg.renderedLength / 1024).toFixed(1)} KiB rendered`);
    }
  },
});
