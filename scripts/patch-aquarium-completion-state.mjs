import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/pages/Aquarium.tsx';
let source = readFileSync(path, 'utf8');

const replaceExactlyOnce = (from, to, label) => {
  const first = source.indexOf(from);
  const last = source.lastIndexOf(from);
  if (first < 0) throw new Error(`${label}: expected source fragment was not found`);
  if (first !== last) throw new Error(`${label}: source fragment matched more than once`);
  source = source.replace(from, to);
};

replaceExactlyOnce(
  "  const isBasicConfigComplete = hasDimensionConfig && hasWaterConfig && hasEquipmentConfig;",
  "  const isBasicConfigComplete = aquariumSetupStatus === 'complete';",
  'canonical completion',
);

replaceExactlyOnce(
`            <Button onClick={() => {
              const updated = aquariums.map(a => a.id === activeId ? { ...a, ...settingsForm } : a);
              saveAquariums(updated);
              void persistCareTimelineEvent({
                aquariumId: activeAquarium.id,
                eventType: 'settings_updated',
                title: isEn ? 'Updated aquarium settings' : '更新鱼缸设置',
                label: isEn ? 'Environment and equipment settings saved' : '已保存环境与设备配置',
                payload: {},
                occurredAt: new Date().toISOString(),
                sourceType: 'aquarium_settings',
                sourceId: \`${activeAquarium.id}:\${Date.now()}\`,
                isInferred: false,
              }).catch(error => showToast('设置时间线没有保存成功。', 'error'));
              markAquariumConfigured();
              setIsSettingsOpen(false);
            }} className="h-10 min-w-[128px] rounded-full bg-accent text-sm font-bold text-white hover:bg-accent/90">{isEn ? 'Save Settings' : '保存设置'}</Button>`,
`            <Button onClick={async () => {
              const nextAquarium = { ...activeAquarium, ...settingsForm };
              try {
                const repository = await getCurrentAquaGuideRepository();
                const savedAquarium = await repository.saveAquarium(nextAquarium);
                const mirroredAquariums = aquariums.map(a => a.id === activeId ? savedAquarium : a);
                const mirroredState = persistAquariums(mirroredAquariums, savedAquarium.id);
                setAquariums(mirroredState.aquariums);
                markAquariumConfigured();
                setIsSettingsOpen(false);
                void persistCareTimelineEvent({
                  aquariumId: savedAquarium.id,
                  eventType: 'settings_updated',
                  title: isEn ? 'Updated aquarium settings' : '更新鱼缸设置',
                  label: isEn ? 'Environment and equipment settings saved' : '已保存环境与设备配置',
                  payload: {},
                  occurredAt: new Date().toISOString(),
                  sourceType: 'aquarium_settings',
                  sourceId: \`${savedAquarium.id}:\${Date.now()}\`,
                  isInferred: false,
                }).catch(() => showToast('设置时间线没有保存成功。', 'error'));
              } catch {
                showToast(isEn ? 'Aquarium settings could not be saved.' : '鱼缸设置没有保存成功。', 'error');
              }
            }} className="h-10 min-w-[128px] rounded-full bg-accent text-sm font-bold text-white hover:bg-accent/90">{isEn ? 'Save Settings' : '保存设置'}</Button>`,
  'repository-backed settings save',
);

writeFileSync(path, source);
console.log('Aquarium completion and settings persistence patch applied.');
