from pathlib import Path
import re


def read(path: str) -> str:
    return Path(path).read_text()


def write(path: str, text: str) -> None:
    Path(path).write_text(text)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)


def sub_once(text: str, pattern: str, replacement: str, label: str) -> str:
    updated, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one regex match, found {count}")
    return updated


# care activity service
path = "src/services/care/care-activity.service.ts"
text = read(path)
text = replace_once(
    text,
    "export type CareSavedChecklist = { id: string; title: string; savedAt: string; actions: string[] };",
    """export type CareSavedChecklist = {
  id: string;
  title: string;
  savedAt: string;
  actionKeys?: string[];
  /** Legacy display-text identities retained only for migration/fallback. */
  actions?: string[];
  aquariumId?: string;
};

export const getCareChecklistActionKey = (topicId: string, actionIndex: number) =>
  `care-checklist:v1:${topicId}:${actionIndex}`;

export const getSavedCareChecklistForContext = (
  records: CareSavedChecklist[],
  topicId: string,
  aquariumId?: string,
) => (
  records.find(item => item.id === topicId && item.aquariumId === aquariumId)
  || records.find(item => item.id === topicId && !item.aquariumId)
);

export const getSavedCareChecklistRestoredActions = (
  record: CareSavedChecklist | undefined,
  topicId: string,
  visibleActions: string[],
) => {
  if (!record) return [];
  const stableKeys = new Set(record.actionKeys || []);
  const legacyActions = record.actions || [];
  return visibleActions.filter((description, index) => (
    stableKeys.has(getCareChecklistActionKey(topicId, index))
    || legacyActions.some(saved => saved === description || saved.endsWith(`：${description}`))
  ));
};""",
    "care saved checklist type",
)
write(path, text)

# repository contract
path = "src/services/repository/aquaguide.repository.ts"
text = read(path)
text = replace_once(
    text,
    "import type { CareReminderRecord } from '../care/care-activity.service';",
    "import type { CareReminderRecord, CareSavedChecklist } from '../care/care-activity.service';",
    "repository care import",
)
text = replace_once(
    text,
    "export type CareTimelineMutation = Omit<CareTimelineRecord, 'id'> & { operationId: string };\n\nexport interface AquaGuideRepository {",
    """export type CareTimelineMutation = Omit<CareTimelineRecord, 'id'> & { operationId: string };

export type CareChecklistProgressMutation = {
  topicId: string;
  title: string;
  actionKeys: string[];
  legacyActions?: string[];
  aquariumId?: string;
};

export interface AquaGuideRepository {""",
    "repository checklist mutation",
)
text = replace_once(
    text,
    "  getCareReminders(): Promise<CareReminderRecord[]>;\n  updateCareReminder(input: CareReminderMutation): Promise<CareReminderRecord | null>;\n  getCareEvents(aquariumId?: string): Promise<CareTimelineRecord[]>;",
    """  getCareReminders(): Promise<CareReminderRecord[]>;
  updateCareReminder(input: CareReminderMutation): Promise<CareReminderRecord | null>;
  getCareChecklistProgress(aquariumId?: string): Promise<CareSavedChecklist[]>;
  saveCareChecklistProgress(input: CareChecklistProgressMutation): Promise<CareSavedChecklist>;
  getCareEvents(aquariumId?: string): Promise<CareTimelineRecord[]>;""",
    "repository checklist methods",
)
write(path, text)

# local repository
path = "src/services/repository/local-aquaguide.repository.ts"
text = read(path)
text = replace_once(
    text,
    "  deleteCareReminder,\n  getCareReminders,\n  rescheduleCareReminder,\n  upsertCareReminder,\n} from '../care/care-activity.service';",
    """  deleteCareReminder,
  getCareReminders,
  getSavedCareChecklists,
  rescheduleCareReminder,
  setSavedCareChecklists,
  upsertCareReminder,
} from '../care/care-activity.service';""",
    "local checklist imports",
)
text = replace_once(
    text,
    "  CareTimelineMutation,\n  CareTimelineRecord,\n  WaterChangeMutation,",
    "  CareTimelineMutation,\n  CareTimelineRecord,\n  CareChecklistProgressMutation,\n  WaterChangeMutation,",
    "local repository checklist type",
)
text = replace_once(
    text,
    "  async getCareEvents(aquariumId?: string) {\n    return (loadAppStateFromStorage().careEvents || []).filter(item => !aquariumId || item.aquariumId === aquariumId);\n  }",
    """  async getCareChecklistProgress(aquariumId?: string) {
    const records = getSavedCareChecklists();
    return aquariumId
      ? records.filter(item => !item.aquariumId || item.aquariumId === aquariumId)
      : records;
  }

  async saveCareChecklistProgress(input: CareChecklistProgressMutation) {
    const record = {
      id: input.topicId,
      title: input.title,
      savedAt: new Date().toISOString(),
      actionKeys: [...input.actionKeys],
      actions: input.legacyActions ? [...input.legacyActions] : undefined,
      aquariumId: input.aquariumId,
    };
    const current = getSavedCareChecklists();
    const next = [
      record,
      ...current.filter(item => !(
        item.id === input.topicId
        && (item.aquariumId || '') === (input.aquariumId || '')
      )),
    ].slice(0, 30);
    setSavedCareChecklists(next);
    return record;
  }

  async getCareEvents(aquariumId?: string) {
    return (loadAppStateFromStorage().careEvents || []).filter(item => !aquariumId || item.aquariumId === aquariumId);
  }""",
    "local checklist methods",
)
write(path, text)

print("01-core.py applied")
