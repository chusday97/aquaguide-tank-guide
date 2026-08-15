import { readFileSync, writeFileSync } from 'node:fs';

const replaceExactlyOnce = (path, from, to, label) => {
  let source = readFileSync(path, 'utf8');
  const first = source.indexOf(from);
  const last = source.lastIndexOf(from);
  if (first < 0) throw new Error(`${label}: expected source fragment was not found in ${path}`);
  if (first !== last) throw new Error(`${label}: source fragment matched more than once in ${path}`);
  source = source.replace(from, to);
  writeFileSync(path, source);
};

replaceExactlyOnce(
  'src/services/repository/local-aquaguide.repository.ts',
[
  '  async saveAquarium(aquarium: Aquarium) {',
  '    const state = loadAppStateFromStorage();',
  '    const exists = state.aquariums.some(item => item.id === aquarium.id);',
  '    const aquariums = exists',
  '      ? state.aquariums.map(item => item.id === aquarium.id ? aquarium : item)',
  '      : [...state.aquariums, aquarium];',
  '    return persistAquariums(aquariums, aquarium.id).aquariums.find(item => item.id === aquarium.id)!;',
  '  }',
  '',
  '  async removeLivestock(input: LivestockRemovalInput) {',
].join('\n'),
[
  '  async saveAquarium(aquarium: Aquarium) {',
  '    const state = loadAppStateFromStorage();',
  '    const exists = state.aquariums.some(item => item.id === aquarium.id);',
  '    const aquariums = exists',
  '      ? state.aquariums.map(item => item.id === aquarium.id ? aquarium : item)',
  '      : [...state.aquariums, aquarium];',
  '    return persistAquariums(aquariums, aquarium.id).aquariums.find(item => item.id === aquarium.id)!;',
  '  }',
  '',
  '  async deleteAquarium(aquariumId: string) {',
  '    const state = loadAppStateFromStorage();',
  '    if (!state.aquariums.some(item => item.id === aquariumId)) return;',
  '    const remaining = state.aquariums.filter(item => item.id !== aquariumId);',
  "    if (remaining.length === 0) throw new Error('至少需要保留一个鱼缸。');",
  '    const nextActiveId = state.currentAquariumId && remaining.some(item => item.id === state.currentAquariumId)',
  '      ? state.currentAquariumId',
  '      : remaining[0].id;',
  '    persistAquariums(remaining, nextActiveId);',
  '  }',
  '',
  '  async removeLivestock(input: LivestockRemovalInput) {',
].join('\n'),
  'local repository deleteAquarium',
);

replaceExactlyOnce(
  'src/services/repository/api-aquaguide.repository.ts',
[
  '    saved = await apiRequest<ApiAquarium>(`/aquariums/${saved.id}`);',
  '    return this.rememberAquarium(saved);',
  '  }',
  '',
  '  async removeLivestock(input: LivestockRemovalInput) {',
].join('\n'),
[
  '    saved = await apiRequest<ApiAquarium>(`/aquariums/${saved.id}`);',
  '    return this.rememberAquarium(saved);',
  '  }',
  '',
  '  async deleteAquarium(aquariumId: string) {',
  "    if (!isUuid(aquariumId)) throw new Error('云端鱼缸标识无效，请刷新后重试。');",
  '    let version = this.aquariumVersions.get(aquariumId);',
  '    if (!version) {',
  '      const current = await apiRequest<ApiAquarium>(`/aquariums/${aquariumId}`);',
  '      this.rememberAquarium(current);',
  '      version = current.version;',
  '    }',
  '    await apiRequest(`/aquariums/${aquariumId}?version=${version}`, {',
  "      method: 'DELETE',",
  '      idempotencyKey: `aquarium-delete:${aquariumId}:v${version}`,',
  '    });',
  '    this.aquariumVersions.delete(aquariumId);',
  '  }',
  '',
  '  async removeLivestock(input: LivestockRemovalInput) {',
].join('\n'),
  'api repository deleteAquarium',
);

replaceExactlyOnce(
  'src/pages/Aquarium.tsx',
  "  const [pendingDeleteAquariumId, setPendingDeleteAquariumId] = useState<string | null>(null);",
  [
    "  const [pendingDeleteAquariumId, setPendingDeleteAquariumId] = useState<string | null>(null);",
    '  const [isDeletingAquarium, setIsDeletingAquarium] = useState(false);',
  ].join('\n'),
  'aquarium deletion pending state',
);

replaceExactlyOnce(
  'src/pages/Aquarium.tsx',
[
  '  const confirmDeleteAquarium = () => {',
  '    if (!pendingDeleteAquariumId || aquariums.length <= 1) return;',
  '    const updated = aquariums.filter(a => a.id !== pendingDeleteAquariumId);',
  '    saveAquariums(updated);',
  '    if (activeId === pendingDeleteAquariumId) {',
  "      setActiveId(updated[0]?.id || '');",
  '    }',
  '    setPendingDeleteAquariumId(null);',
  '  };',
].join('\n'),
[
  '  const confirmDeleteAquarium = async () => {',
  '    const aquariumId = pendingDeleteAquariumId;',
  '    if (!aquariumId || aquariums.length <= 1 || isDeletingAquarium) return;',
  '    setIsDeletingAquarium(true);',
  '    try {',
  '      const repository = await getCurrentAquaGuideRepository();',
  '      await repository.deleteAquarium(aquariumId);',
  '      const updated = aquariums.filter(aquarium => aquarium.id !== aquariumId);',
  "      const nextActiveId = activeId === aquariumId ? updated[0]?.id || '' : activeId;",
  '      let mirroredAquariums = updated;',
  '      let mirroredActiveId = nextActiveId;',
  '      let mirrorFailed = false;',
  '      try {',
  '        const mirrored = persistAquariums(updated, nextActiveId);',
  '        mirroredAquariums = mirrored.aquariums;',
  '        mirroredActiveId = mirrored.currentAquariumId;',
  '      } catch {',
  '        mirrorFailed = true;',
  '      }',
  '      setAquariums(mirroredAquariums);',
  '      setActiveId(mirroredActiveId);',
  '      setPendingDeleteAquariumId(null);',
  '      showToast(mirrorFailed',
  "        ? (isEn ? 'Aquarium deleted, but the local cache could not be refreshed.' : '鱼缸已删除，但本地缓存未能刷新；重新打开后会以云端数据为准。')",
  "        : (isEn ? 'Aquarium deleted.' : '鱼缸已删除。'),",
  "        mirrorFailed ? 'error' : 'success');",
  '    } catch {',
  "      showToast(isEn ? 'Aquarium could not be deleted.' : '鱼缸没有删除成功，请刷新后重试。', 'error');",
  '    } finally {',
  '      setIsDeletingAquarium(false);',
  '    }',
  '  };',
].join('\n'),
  'repository-backed aquarium deletion',
);

console.log('Repository-backed aquarium deletion patch applied.');
