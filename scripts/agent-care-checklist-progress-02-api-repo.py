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


# API repository
path = "src/services/repository/api-aquaguide.repository.ts"
text = read(path)
text = replace_once(
    text,
    "import type { CareReminderRecord } from '../care/care-activity.service';",
    "import type { CareReminderRecord, CareSavedChecklist } from '../care/care-activity.service';",
    "api repository care import",
)
text = replace_once(
    text,
    "  CareTimelineMutation,\n  CareTimelineRecord,\n  WaterChangeMutation,",
    "  CareTimelineMutation,\n  CareTimelineRecord,\n  CareChecklistProgressMutation,\n  WaterChangeMutation,",
    "api repository checklist type",
)
text = replace_once(
    text,
    "type ApiCareEvent = CareTimelineRecord & { version: number };",
    """type ApiCareEvent = CareTimelineRecord & { version: number };
type ApiCareChecklistProgress = {
  id: string;
  aquariumId?: string;
  topicId: string;
  title: string;
  actionKeys: string[];
  legacyActions?: string[];
  savedAt: string;
  version: number;
};""",
    "api checklist response type",
)
text = replace_once(
    text,
    """  async getCareEvents(aquariumId?: string) {
    const query = aquariumId ? `?aquariumId=${encodeURIComponent(aquariumId)}` : '';
    const result = await apiRequest<{ items: ApiCareEvent[] }>(`/care-events${query}`);
    return result.items;
  }""",
    """  async getCareChecklistProgress(aquariumId?: string): Promise<CareSavedChecklist[]> {
    if (aquariumId && !isUuid(aquariumId)) throw new Error('云端鱼缸标识无效，请刷新后重试。');
    const query = aquariumId ? `?aquariumId=${encodeURIComponent(aquariumId)}` : '';
    const result = await apiRequest<{ items: ApiCareChecklistProgress[] }>(`/care-checklist-progress${query}`);
    return (result.items || []).map(item => ({
      id: item.topicId,
      title: item.title,
      savedAt: item.savedAt,
      actionKeys: item.actionKeys || [],
      actions: item.legacyActions || undefined,
      aquariumId: item.aquariumId,
    }));
  }

  async saveCareChecklistProgress(input: CareChecklistProgressMutation): Promise<CareSavedChecklist> {
    if (input.aquariumId && !isUuid(input.aquariumId)) throw new Error('云端鱼缸标识无效，请刷新后重试。');
    const saved = await apiRequest<ApiCareChecklistProgress>('/care-checklist-progress', {
      method: 'PUT',
      idempotencyKey: createIdempotencyKey('care-checklist-progress'),
      body: {
        aquariumId: input.aquariumId,
        topicId: input.topicId,
        title: input.title,
        actionKeys: input.actionKeys,
        legacyActions: input.legacyActions,
      },
    });
    return {
      id: saved.topicId,
      title: saved.title,
      savedAt: saved.savedAt,
      actionKeys: saved.actionKeys || [],
      actions: saved.legacyActions || undefined,
      aquariumId: saved.aquariumId,
    };
  }

  async getCareEvents(aquariumId?: string) {
    const query = aquariumId ? `?aquariumId=${encodeURIComponent(aquariumId)}` : '';
    const result = await apiRequest<{ items: ApiCareEvent[] }>(`/care-events${query}`);
    return result.items;
  }""",
    "api checklist methods",
)
write(path, text)

print("02-api-repo.py applied")
