import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { localCompatibilityAdminStore } from '../src/services/admin/local-compatibility-admin.store';

const root = resolve(import.meta.dirname, '..');
const snapshotPath = resolve(root, 'public/runtime-authority.json');
const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
const compatibility = await localCompatibilityAdminStore.getBootstrap();

snapshot.generatedAt = new Date().toISOString();
snapshot.compatibility = {
  authority: 'reviewed-git',
  profiles: compatibility.profiles,
  pairRules: compatibility.pairRules,
  counts: {
    profiles: compatibility.profiles.length,
    pairRules: compatibility.pairRules.length,
  },
};

writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(JSON.stringify({
  output: snapshotPath,
  profiles: compatibility.profiles.length,
  pairRules: compatibility.pairRules.length,
}, null, 2));
