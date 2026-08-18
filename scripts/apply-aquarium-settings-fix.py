from pathlib import Path

path = Path('src/pages/Aquarium.tsx')
text = path.read_text()


def replace_once(old: str, new: str, label: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one marker, got {count}')
    text = text.replace(old, new, 1)


replace_once(
    "  const [isSettingsOpen, setIsSettingsOpen] = useState(false);\n",
    "  const [isSettingsOpen, setIsSettingsOpen] = useState(false);\n  const [isSettingsSaving, setIsSettingsSaving] = useState(false);\n",
    'settings saving state',
)

handler_marker = "  const handleRenameSubmit = async () => {\n"
handler = """  const handleSaveAquariumSettings = async () => {
    if (!activeAquarium || isSettingsSaving) return;
    setIsSettingsSaving(true);
    try {
      const repository = await getCurrentAquaGuideRepository();
      const savedAquarium = await repository.saveAquarium({ ...activeAquarium, ...settingsForm });
      setAquariums(current => current.map(aquarium => aquarium.id === savedAquarium.id ? savedAquarium : aquarium));
      markAquariumConfigured();
      setIsSettingsOpen(false);
      showToast(isEn ? 'Aquarium settings saved' : '鱼缸设置已保存');
      try {
        await persistCareTimelineEvent({
          aquariumId: savedAquarium.id,
          eventType: 'settings_updated',
          title: isEn ? 'Updated aquarium settings' : '更新鱼缸设置',
          label: isEn ? 'Environment and equipment settings saved' : '已保存环境与设备配置',
          payload: {},
          occurredAt: new Date().toISOString(),
          sourceType: 'aquarium_settings',
          sourceId: `${savedAquarium.id}:${Date.now()}`,
          isInferred: false,
        });
      } catch (error) {
        showToast(isEn ? 'Settings were saved, but the timeline entry could not be recorded.' : '设置已保存，但设置时间线没有记录成功。', 'error');
      }
    } catch (error) {
      showToast(isEn ? 'Aquarium settings were not saved. Please try again.' : '鱼缸设置没有保存成功，请重试。', 'error');
    } finally {
      setIsSettingsSaving(false);
    }
  };

"""
replace_once(handler_marker, handler + handler_marker, 'settings handler insertion')

replace_once(
    "<Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>",
    "<Dialog open={isSettingsOpen} onOpenChange={(open) => { if (!isSettingsSaving || open) setIsSettingsOpen(open); }}>",
    'settings dialog guard',
)

old_footer = """          <DialogFooter className=\"shrink-0 border-t border-white bg-white/95 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 md:px-6\">
            <Button variant=\"outline\" onClick={() => setIsSettingsOpen(false)} className=\"h-10 min-w-[112px] rounded-full text-sm font-bold\">{isEn ? \"Cancel\" : \"取消\"}</Button>
            <Button onClick={() => {
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
                sourceId: `${activeAquarium.id}:${Date.now()}`,
                isInferred: false,
              }).catch(error => showToast('设置时间线没有保存成功。', 'error'));
              markAquariumConfigured();
              setIsSettingsOpen(false);
            }} className=\"h-10 min-w-[128px] rounded-full bg-accent text-sm font-bold text-white hover:bg-accent/90\">{isEn ? 'Save Settings' : '保存设置'}</Button>
          </DialogFooter>"""
new_footer = """          <DialogFooter className=\"shrink-0 border-t border-white bg-white/95 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 md:px-6\">
            <Button variant=\"outline\" disabled={isSettingsSaving} onClick={() => setIsSettingsOpen(false)} className=\"h-10 min-w-[112px] rounded-full text-sm font-bold\">{isEn ? \"Cancel\" : \"取消\"}</Button>
            <Button
              disabled={isSettingsSaving}
              onClick={() => void handleSaveAquariumSettings()}
              className=\"h-10 min-w-[128px] rounded-full bg-accent text-sm font-bold text-white hover:bg-accent/90 disabled:bg-ink/15 disabled:text-ink/35\"
            >
              {isSettingsSaving && <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" />}
              {isSettingsSaving ? (isEn ? 'Saving…' : '保存中…') : (isEn ? 'Save Settings' : '保存设置')}
            </Button>
          </DialogFooter>"""
replace_once(old_footer, new_footer, 'settings footer')

path.write_text(text)
