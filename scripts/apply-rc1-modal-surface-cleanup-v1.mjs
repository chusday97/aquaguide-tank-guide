import fs from 'node:fs';

const path = 'src/pages/Aquarium.tsx';
let source = fs.readFileSync(path, 'utf8');

const replaceExact = (before, after, label) => {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  source = source.replace(before, after);
};

replaceExact(
  "  const [activeSettingsPanel, setActiveSettingsPanel] = useState<'size' | 'parameters' | 'substrate' | 'plants' | 'lighting' | 'equipment' | null>(null);\n",
  "  const [activeSettingsPanel, setActiveSettingsPanel] = useState<'size' | 'parameters' | 'substrate' | 'plants' | 'lighting' | 'equipment' | 'data' | null>(null);\n",
  'Add Data & Backup to the shared Settings panel model',
);

replaceExact("  const [isLocalDataOpen, setIsLocalDataOpen] = useState(false);\n", '', 'Remove standalone Data dialog state');
replaceExact("  const [isGuideOpen, setIsGuideOpen] = useState(false);\n", '', 'Remove dead Guide dialog state');
replaceExact("  const [isRiskReminderOpen, setIsRiskReminderOpen] = useState(false);\n", '', 'Remove dead All Reminders dialog state');

replaceExact(
`  const openLocalDataManager = () => {
    setLocalDataText('');
    setLocalDataMessage('');
    setIsLocalDataOpen(true);
  };`,
`  const openLocalDataManager = () => {
    setLocalDataText('');
    setLocalDataMessage('');
    openAquariumSettings('data');
  };`,
  'Route Data & Backup into Settings',
);

replaceExact(
`  }> = [
    {
      id: 'size',`,
`  }> = [
    {
      id: 'data',
      title: isEn ? 'Data & Backup' : '数据与备份',
      summary: repositoryMode === 'cloud'
        ? (isEn ? 'Cloud sync · cloud remains source of truth' : '云端同步 · 云端仍是事实源')
        : (isEn ? 'Local storage · this browser only' : '本机存储 · 仅当前浏览器'),
      configured: true,
    },
    {
      id: 'size',`,
  'Expose Data & Backup in Settings list',
);

replaceExact(
`  const renderSettingsPanel = (panel: NonNullable<typeof activeSettingsPanel>) => {
    if (panel === 'size') {`,
`  const renderSettingsPanel = (panel: NonNullable<typeof activeSettingsPanel>) => {
    if (panel === 'data') {
      return (
        <ConfigSection
          title={isEn ? 'Data & Backup' : '数据与备份'}
          subtitle={repositoryMode === 'cloud'
            ? (isEn
              ? 'Cloud sync is active. Cloud aquarium data remains the source of truth.'
              : '当前已启用云端同步，云端鱼缸数据仍是事实源。')
            : (isEn
              ? 'This aquarium is currently stored in this browser.'
              : '当前鱼缸数据保存在这个浏览器中。')}
        >
          <div data-settings-storage-panel className="grid gap-3">
            <div className="rounded-[18px] border border-emerald-100 bg-emerald-50/70 p-4">
              <div className="flex items-center gap-2 text-[14px] font-black text-emerald-800">
                <Info className="h-4 w-4" />
                {t('aquarium.dataSavingDetailTitle1')}
              </div>
              <p className="mt-2 text-[12px] font-medium leading-relaxed text-ink/64">{t('aquarium.dataSavingDetailDesc1')}</p>
            </div>
            <div className="rounded-[18px] border border-amber-100 bg-amber-50/70 p-4">
              <div className="text-[14px] font-black text-amber-900">{t('aquarium.dataSavingDetailTitle2')}</div>
              <p className="mt-2 text-[12px] font-medium leading-relaxed text-ink/64">{t('aquarium.dataSavingDetailDesc2')}</p>
            </div>
          </div>
        </ConfigSection>
      );
    }
    if (panel === 'size') {`,
  'Render Data & Backup inside Settings',
);

const removeBetween = (start, end, label) => {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0) throw new Error(`${label}: anchors not found (${startIndex}, ${endIndex})`);
  if (source.indexOf(start, startIndex + 1) >= 0) throw new Error(`${label}: start anchor is not unique`);
  source = `${source.slice(0, startIndex)}${source.slice(endIndex)}`;
};

removeBetween(
  '      <Dialog open={isLocalDataOpen} onOpenChange={setIsLocalDataOpen}>',
  '      <Dialog open={isTankPreviewOpen} onOpenChange={setIsTankPreviewOpen}>',
  'Remove standalone Data & Backup Dialog',
);

removeBetween(
  '      {/* Guide Modal */}\n      <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>',
  '      {/* Legacy fish detail modal is intentionally disabled; aquarium entries now use SpeciesDetailDialog. */}',
  'Remove dead Guide Dialog',
);

removeBetween(
  '      <Dialog open={isRiskReminderOpen} onOpenChange={setIsRiskReminderOpen}>',
  '      <Dialog open={isObservationOpen} onOpenChange={setIsObservationOpen}>',
  'Remove dead All Reminders Dialog',
);

replaceExact(
  `{isEn ? "Cancel" : "取消"}</Button>`,
  `{activeSettingsPanel === 'data' ? (isEn ? 'Close' : '关闭') : (isEn ? 'Cancel' : '取消')}</Button>`,
  'Use close semantics for read-only Data panel',
);

const saveButtonPattern = /            <Button\n              disabled=\{isSettingsSaving\}\n              onClick=\{\(\) => void handleSaveAquariumSettings\(\)\}[\s\S]*?            <\/Button>/;
const saveButtonMatch = source.match(saveButtonPattern);
if (!saveButtonMatch) throw new Error('Settings save button anchor not found');
source = source.replace(saveButtonPattern, `            {activeSettingsPanel !== 'data' && (\n${saveButtonMatch[0]}\n            )}`);

fs.writeFileSync(path, source);
console.log('Applied RC1 modal surface cleanup: Data & Backup now reuses Settings; dead reference dialogs removed.');
