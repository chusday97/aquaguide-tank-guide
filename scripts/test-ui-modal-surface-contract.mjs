import fs from 'node:fs';

const source = fs.readFileSync('src/pages/Aquarium.tsx', 'utf8');

const requireMarker = (marker, message) => {
  if (!source.includes(marker)) throw new Error(message || `Missing marker: ${marker}`);
};
const forbidMarker = (marker, message) => {
  if (source.includes(marker)) throw new Error(message || `Forbidden marker: ${marker}`);
};

requireMarker("'equipment' | 'data' | null", 'Settings panel model must include Data & Backup.');
requireMarker("openAquariumSettings('data')", 'Data & Backup entry must reuse the existing Settings task surface.');
requireMarker('data-settings-storage-panel', 'Settings must render the storage/repository explanation inline.');
requireMarker("activeSettingsPanel !== 'data'", 'Read-only Data panel must not show the Save Settings CTA.');

forbidMarker('isLocalDataOpen', 'Data & Backup must not own a standalone Dialog/state anymore.');
forbidMarker('<Dialog open={isGuideOpen}', 'Pure water-change reference guidance must not return as a standalone Dialog.');
forbidMarker('isRiskReminderOpen', 'Dead All Reminders Dialog/state must not return.');

requireMarker('<Dialog open={Boolean(pendingReminderDelete)}', 'Reminder deletion must keep a destructive confirmation Dialog.');
requireMarker('<Dialog open={!!pendingDeleteAquariumId}', 'Aquarium deletion must keep a destructive confirmation Dialog.');
requireMarker('<Dialog open={isDiagnosisExitConfirmOpen}', 'Unsaved diagnosis exit must keep a confirmation Dialog.');
requireMarker('<Dialog open={isRiskOverrideConfirmOpen}', 'High-risk stocking override must keep an explicit confirmation Dialog.');

console.log('UI modal surface contract passed: read-only Data/Help surfaces are de-modalized while destructive confirmations remain explicit.');
