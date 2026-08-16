from pathlib import Path


def read(path: str) -> str:
    return Path(path).read_text(encoding='utf-8')


def write(path: str, value: str) -> None:
    Path(path).write_text(value, encoding='utf-8')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, found {count}')
    return text.replace(old, new, 1)


# 1) Frontend database type.
path = 'src/types/database.ts'
text = read(path)
text = replace_once(
    text,
    "  | 'care_plan_completed';",
    "  | 'care_plan_completed'\n  | 'care_operation_completed';",
    'CareEventType enum',
)
write(path, text)

# 2) Shared API contract.
path = 'packages/contracts/src/business.ts'
text = read(path)
text = replace_once(
    text,
    "'daily_check', 'checklist_completed', 'care_plan_completed'])",
    "'daily_check', 'checklist_completed', 'care_plan_completed', 'care_operation_completed'])",
    'careEventCreateSchema enum',
)
write(path, text)

# 3) Canonical event -> legacy compatibility mirror helpers.
path = 'src/services/care/care-activity.service.ts'
text = read(path)
anchor = "export type CareCompletedOperation = { id: string; title: string; label: string; aquariumId?: string; completedAt: string };\n"
insert = anchor + """\ntype CareOperationEventLike = {\n  aquariumId?: string;\n  eventType: string;\n  title: string;\n  label?: string;\n  occurredAt: string;\n  sourceType?: string;\n  sourceId?: string;\n};\n\nexport const getCompletedCareOperationsFromEvents = (\n  events: CareOperationEventLike[],\n  aquariumId?: string,\n): CareCompletedOperation[] => {\n  const seen = new Set<string>();\n  return [...events]\n    .filter(event => event.eventType === 'care_operation_completed'\n      && event.sourceType === 'care_operation'\n      && Boolean(event.sourceId)\n      && (!aquariumId || event.aquariumId === aquariumId))\n    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())\n    .flatMap(event => {\n      const sourceId = event.sourceId!;\n      const identity = `${event.aquariumId || 'global'}:${sourceId}`;\n      if (seen.has(identity)) return [];\n      seen.add(identity);\n      return [{\n        id: sourceId,\n        title: event.title,\n        label: event.label || event.title,\n        aquariumId: event.aquariumId,\n        completedAt: event.occurredAt,\n      }];\n    });\n};\n"""
text = replace_once(text, anchor, insert, 'care operation helper insertion')
write(path, text)

# 4) Care page: hydrate canonical care events, scope completion by tank, write repository-first.
path = 'src/pages/CareEncyclopedia.tsx'
text = read(path)
text = replace_once(
    text,
    "  getCompletedCareOperations,\n  getSavedCareChecklists,",
    "  getCompletedCareOperations,\n  getCompletedCareOperationsFromEvents,\n  getSavedCareChecklists,",
    'Care activity import',
)
text = replace_once(
    text,
    "import { getCurrentAquaGuideRepository } from '../services/repository/repository-provider';",
    "import { getAquaGuideRepository, getCurrentAquaGuideRepository, resolveRepositoryMode } from '../services/repository/repository-provider';",
    'repository provider import',
)
old_hydrate = """    void getCurrentAquaGuideRepository()\n      .then(async repository => {\n        const [favoriteSnapshot, aquariums] = await Promise.all([\n          repository.getFavorites(),\n          repository.getAquariums(),\n        ]);\n        return { favoriteSnapshot, aquariums };\n      })\n      .then(({ favoriteSnapshot, aquariums }) => {"""
new_hydrate = """    void resolveRepositoryMode()\n      .then(async mode => {\n        const repository = getAquaGuideRepository(mode);\n        const [favoriteSnapshot, aquariums, careEvents] = await Promise.all([\n          repository.getFavorites(),\n          repository.getAquariums(),\n          repository.getCareEvents(),\n        ]);\n        return { favoriteSnapshot, aquariums, careEvents, mode };\n      })\n      .then(({ favoriteSnapshot, aquariums, careEvents, mode }) => {"""
text = replace_once(text, old_hydrate, new_hydrate, 'Care hydrate repository boundary')
text = replace_once(
    text,
    "        patchLocalAppState({ aquariums, currentAquariumId });",
    "        if (mode === 'cloud') {\n          setCompletedCareOperations(getCompletedCareOperationsFromEvents(careEvents));\n        }\n        patchLocalAppState({ aquariums, currentAquariumId, careEvents });",
    'Care hydrate app-state patch',
)
text = replace_once(
    text,
    "    setIsOperationCompleted(getCompletedCareOperations().some(item => item.id === topic.id));\n",
    "",
    'remove local-only completion state',
)
text = replace_once(
    text,
    "  }, [onRestoreActions, topic.id]);\n  const primaryCtaLabel",
    """  }, [onRestoreActions, topic.id]);\n\n  useEffect(() => {\n    const syncOperationCompletion = () => {\n      if (!activeAquarium?.id) {\n        setIsOperationCompleted(false);\n        return;\n      }\n      const state = loadAppStateFromStorage();\n      const canonical = getCompletedCareOperationsFromEvents(state.careEvents || [], activeAquarium.id);\n      const legacy = getCompletedCareOperations();\n      setIsOperationCompleted(\n        canonical.some(item => item.id === topic.id)\n        || (!state.cloudMigrationConfirmed && legacy.some(item => item.id === topic.id\n          && (!item.aquariumId || item.aquariumId === activeAquarium.id))),\n      );\n    };\n    syncOperationCompletion();\n    return subscribeToAppState(syncOperationCompletion);\n  }, [activeAquarium?.id, topic.id]);\n\n  const primaryCtaLabel""",
    'Care completion state subscription',
)

start = text.index("  const markOperationCompleted = (label: string) => {")
end = text.index("\n\n  const saveChecklist = () => {", start)
new_function = """  const markOperationCompleted = async (label: string) => {\n    if (!activeAquarium?.id) {\n      setCtaFeedback(isEn ? 'Select or create a tank before recording this operation.' : '请先创建或选择鱼缸，再记录这次操作。');\n      window.setTimeout(() => setCtaFeedback(''), 2500);\n      return;\n    }\n    const occurredAt = new Date().toISOString();\n    try {\n      const mode = await resolveRepositoryMode();\n      const repository = getAquaGuideRepository(mode);\n      await repository.saveCareEvent({\n        aquariumId: activeAquarium.id,\n        eventType: 'care_operation_completed',\n        title: isEn ? `Completed care operation: ${getDisplayTitle(topic)}` : `完成养护操作：${getDisplayTitle(topic)}`,\n        label,\n        payload: {\n          topicId: topic.id,\n          operationKind: isNewFishAcclimationTopic(topic) ? 'acclimation' : isFilterGuide ? 'cleaning' : 'procedure',\n        },\n        occurredAt,\n        sourceType: 'care_operation',\n        sourceId: topic.id,\n        isInferred: false,\n        operationId: `care-operation:v1:${activeAquarium.id}:${topic.id}`,\n      });\n      const events = await repository.getCareEvents();\n      if (mode === 'cloud') {\n        setCompletedCareOperations(getCompletedCareOperationsFromEvents(events));\n      } else {\n        const completed = getCompletedCareOperations();\n        setCompletedCareOperations([\n          { id: topic.id, title: getDisplayTitle(topic), label, aquariumId: activeAquarium.id, completedAt: occurredAt },\n          ...completed.filter(item => item.id !== topic.id || (Boolean(item.aquariumId) && item.aquariumId !== activeAquarium.id)),\n        ].slice(0, 50));\n      }\n      patchLocalAppState({ careEvents: events });\n      setIsOperationCompleted(true);\n      setCtaFeedback(\n        isNewFishAcclimationTopic(topic)\n          ? (isEn ? 'Acclimation recorded' : '已记录本次过水操作')\n          : isFilterGuide\n            ? (isEn ? 'Cleaning recorded' : '已记录本次清洗操作')\n            : (isEn ? 'Operation recorded' : '已记录本次养护操作'),\n      );\n    } catch (error) {\n      setCtaFeedback(isEn ? 'Could not save the operation. Try again.' : '操作记录保存失败，请重试。');\n    }\n    window.setTimeout(() => setCtaFeedback(''), 2500);\n  };"""
text = text[:start] + new_function + text[end:]
text = text.replace("        markOperationCompleted(", "        void markOperationCompleted(")
text = text.replace("      markOperationCompleted(\n", "      void markOperationCompleted(\n")
write(path, text)

print('Canonical care operation patch applied successfully')
