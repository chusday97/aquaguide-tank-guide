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


# Care page
path = "src/pages/CareEncyclopedia.tsx"
text = read(path)
text = replace_once(
    text,
    "  getCompletedCareOperations,\n  getCompletedCareOperationsFromEvents,\n  getSavedCareChecklists,\n  setCompletedCareOperations,\n  setSavedCareChecklists,\n} from '../services/care/care-activity.service';",
    """  getCompletedCareOperations,
  getCompletedCareOperationsFromEvents,
  getCareChecklistActionKey,
  getSavedCareChecklistForContext,
  getSavedCareChecklistRestoredActions,
  getSavedCareChecklists,
  setCompletedCareOperations,
  setSavedCareChecklists,
  subscribeToCareActivity,
} from '../services/care/care-activity.service';""",
    "care page checklist imports",
)
text = sub_once(
    text,
    r"      \.then\(async mode => \{\n        const repository = getAquaGuideRepository\(mode\);\n        const \[favoriteSnapshot, aquariums, careEvents\] = await Promise\.all\(\[\n          repository\.getFavorites\(\),\n          repository\.getAquariums\(\),\n          repository\.getCareEvents\(\),\n        \]\);\n        return \{ favoriteSnapshot, aquariums, careEvents, mode \};\n      \}\)\n      \.then\(\(\{ favoriteSnapshot, aquariums, careEvents, mode \}\) => \{",
    """      .then(async mode => {
        const repository = getAquaGuideRepository(mode);
        const localChecklistProgress = getSavedCareChecklists();
        let [favoriteSnapshot, aquariums, careEvents, checklistProgress] = await Promise.all([
          repository.getFavorites(),
          repository.getAquariums(),
          repository.getCareEvents(),
          repository.getCareChecklistProgress(),
        ]);
        if (mode === 'cloud' && localChecklistProgress.length > 0) {
          const canonicalKeys = new Set(checklistProgress.map(item => `${item.aquariumId || 'global'}:${item.id}`));
          const migratable = localChecklistProgress.filter(item => {
            const scopeValid = !item.aquariumId || aquariums.some(aquarium => aquarium.id === item.aquariumId);
            return scopeValid
              && ((item.actionKeys?.length || 0) > 0 || (item.actions?.length || 0) > 0)
              && !canonicalKeys.has(`${item.aquariumId || 'global'}:${item.id}`);
          });
          if (migratable.length > 0) {
            await Promise.all(migratable.map(item => {
              const legacyTopic = careTopicsData.find(topic => topic.id === item.id);
              const legacyVisibleActions = legacyTopic ? buildCareGuide(legacyTopic).todayActions : [];
              const legacyActionKeys = item.actionKeys?.length
                ? item.actionKeys
                : legacyVisibleActions.flatMap((action, index) =>
                    (item.actions || []).some(saved => saved === action.description || saved.endsWith(`：${action.description}`))
                      ? [getCareChecklistActionKey(item.id, index)]
                      : []
                  );
              return repository.saveCareChecklistProgress({
                topicId: item.id,
                title: item.title,
                actionKeys: legacyActionKeys,
                legacyActions: (item.actions || [])
                  .filter(action => typeof action === 'string' && action.trim().length > 0 && action.length <= 1000)
                  .slice(0, 50),
                aquariumId: item.aquariumId,
              });
            }));
            checklistProgress = await repository.getCareChecklistProgress();
          }
        }
        return { favoriteSnapshot, aquariums, careEvents, checklistProgress, mode };
      })
      .then(({ favoriteSnapshot, aquariums, careEvents, checklistProgress, mode }) => {""",
    "care page hydrate fetch",
)
text = replace_once(
    text,
    "        if (mode === 'cloud') {\n          setCompletedCareOperations(getCompletedCareOperationsFromEvents(careEvents));\n        }\n        patchLocalAppState({ aquariums, currentAquariumId, careEvents });",
    """        if (mode === 'cloud') {
          setCompletedCareOperations(getCompletedCareOperationsFromEvents(careEvents));
        }
        setSavedCareChecklists(checklistProgress);
        patchLocalAppState({ aquariums, currentAquariumId, careEvents });""",
    "care page hydrate mirror",
)
text = replace_once(
    text,
    "  const [isChecklistSaved, setIsChecklistSaved] = useState(false);\n  const [isOperationCompleted, setIsOperationCompleted] = useState(false);",
    "  const [isChecklistSaved, setIsChecklistSaved] = useState(false);\n  const [isChecklistSaving, setIsChecklistSaving] = useState(false);\n  const [isOperationCompleted, setIsOperationCompleted] = useState(false);",
    "care checklist saving state",
)
text = sub_once(
    text,
    r"  useEffect\(\(\) => \{\n    setIsDiagnosisStarted\(false\);\n    setIsDetailExpanded\(false\);\n    setCtaFeedback\(''\);\n    const savedChecklist = getSavedCareChecklists\(\)\.find\(item => item\.id === topic\.id\);\n    const restoredActions = savedChecklist\n      \? visibleActions\n          \.map\(action => action\.description\)\n          \.filter\(description => savedChecklist\.actions\.some\(saved => saved === description \|\| saved\.endsWith\(`：\$\{description\}`\)\)\)\n      : \[\];\n    setIsChecklistSaved\(restoredActions\.length > 0\);\n    onRestoreActions\?\.\(restoredActions\);\n  \}, \[onRestoreActions, topic\.id\]\);",
    """  useEffect(() => {
    setIsDiagnosisStarted(false);
    setIsDetailExpanded(false);
    setCtaFeedback('');
    const syncChecklistProgress = () => {
      const savedChecklist = getSavedCareChecklistForContext(
        getSavedCareChecklists(),
        topic.id,
        activeAquarium?.id,
      );
      const restoredActions = getSavedCareChecklistRestoredActions(
        savedChecklist,
        topic.id,
        visibleActions.map(action => action.description),
      );
      const isScopedSave = !activeAquarium?.id || savedChecklist?.aquariumId === activeAquarium.id;
      setIsChecklistSaved(restoredActions.length > 0 && isScopedSave);
      onRestoreActions?.(restoredActions);
    };
    syncChecklistProgress();
    return subscribeToCareActivity(syncChecklistProgress);
  }, [activeAquarium?.id, onRestoreActions, topic.id]);""",
    "care checklist restore",
)
text = replace_once(
    text,
    "    || (meta.guideType === 'careChecklist' && (isChecklistSaved || completedVisibleActions === 0))",
    "    || (meta.guideType === 'careChecklist' && (isChecklistSaving || isChecklistSaved || completedVisibleActions === 0))",
    "care checklist disabled while saving",
)
text = sub_once(
    text,
    r"  const saveChecklist = \(\) => \{.*?\n  \};\n\n  const handleSecondaryCta",
    """  const saveChecklist = async () => {
    if (isChecklistSaving || completedVisibleActions === 0) return;
    const actionKeys = visibleActions.flatMap((action, index) =>
      checkedActions.includes(action.description)
        ? [getCareChecklistActionKey(topic.id, index)]
        : []
    );
    setIsChecklistSaving(true);
    try {
      const repository = await getCurrentAquaGuideRepository();
      await repository.saveCareChecklistProgress({
        topicId: topic.id,
        title: getDisplayTitle(topic),
        actionKeys,
        aquariumId: activeAquarium?.id,
      });
      const checklistProgress = await repository.getCareChecklistProgress();
      setSavedCareChecklists(checklistProgress);
      setIsChecklistSaved(true);
      setCtaFeedback(
        isEn
          ? `${completedVisibleActions} completed item${completedVisibleActions === 1 ? '' : 's'} saved`
          : `已保存 ${completedVisibleActions} 项完成记录`
      );
    } catch (error) {
      setCtaFeedback(isEn ? 'Could not save the checklist. Try again.' : '护理清单保存失败，请重试。');
    } finally {
      setIsChecklistSaving(false);
      window.setTimeout(() => setCtaFeedback(''), 1800);
    }
  };

  const handleSecondaryCta""",
    "care checklist save",
)
text = replace_once(
    text,
    "    if (meta.guideType === 'careChecklist') {\n      saveChecklist();\n      return;\n    }",
    "    if (meta.guideType === 'careChecklist') {\n      void saveChecklist();\n      return;\n    }",
    "care checklist CTA",
)
write(path, text)

print("04-care-page.py applied")
