from pathlib import Path
import json
import re


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 exact match, got {count}")
    return text.replace(old, new, 1)


# Compatibility: explicit record failure state and stable feedback.
path = Path("src/components/CompatibilityRiskCalculator.tsx")
text = path.read_text()
text = replace_once(
    text,
    "  const [feedback, setFeedback] = useState('');\n  const [isRecording, setIsRecording] = useState(false);",
    "  const [feedback, setFeedback] = useState('');\n  const [recordError, setRecordError] = useState('');\n  const [isRecording, setIsRecording] = useState(false);",
    "compatibility recordError state",
)
text = replace_once(
    text,
    "    setCautionConfirmed(false);\n    setFeedback('');\n    setAiResult(null);",
    "    setCautionConfirmed(false);\n    setFeedback('');\n    setRecordError('');\n    setAiResult(null);",
    "compatibility reset error",
)
pattern = re.compile(r"  const recordActualStocking = async \(\) => \{.*?\n  \};\n\n  const canEvaluate", re.S)
replacement = """  const recordActualStocking = async () => {
    if (!onAddToAquarium || candidateSpecies.length === 0 || !resultStatus || isRecording) return;
    if (resultStatus === 'not_recommended' || resultStatus === 'insufficient_data') return;
    if (resultStatus === 'caution' && !cautionConfirmed) {
      setCautionConfirmed(true);
      return;
    }
    setIsRecording(true);
    setRecordError('');
    try {
      const response = await onAddToAquarium(candidateSpecies.map(fish => ({
        fishId: fish.id,
        quantity: Math.max(1, quantities[fish.id] || 1),
      })));
      const feedbackMessage = response && typeof response === 'object' ? response.message : undefined;
      setFeedback(feedbackMessage || (isEn ? 'Recorded in the aquarium.' : '已记录到鱼缸。'));
    } catch {
      setRecordError(isEn ? 'Could not save the livestock record. Try again.' : '入缸记录没有保存成功，请重试。');
    } finally {
      setIsRecording(false);
    }
  };

  const canEvaluate"""
text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit(f"compatibility recordActualStocking replacement count={count}")
text = replace_once(
    text,
    '            {feedback && <div className="rounded-[14px] bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-800">{feedback}</div>}',
    '            {feedback && <div className="rounded-[14px] bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-800">{feedback}</div>}\n            {recordError && <div role="alert" className="rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-black text-red-800">{recordError}</div>}',
    "compatibility error render",
)
path.write_text(text)


# Aquarium: water/date boundaries and diagnosis persistence states.
path = Path("src/pages/Aquarium.tsx")
text = path.read_text()
text = replace_once(
    text,
    "import { persistAquariums } from '../services/aquarium/aquarium-state.service';",
    "import { persistAquariums } from '../services/aquarium/aquarium-state.service';\nimport { applyWaterChangeHistory, isFutureWaterChangeDate, toggleWaterChangeDate } from '../services/aquarium/water-change.service';",
    "water service import",
)
text = replace_once(
    text,
    "  const [diagnosisSaveMessage, setDiagnosisSaveMessage] = useState('');\n  const [isDiagnosisRecordSaved, setIsDiagnosisRecordSaved] = useState(false);",
    "  const [diagnosisSaveMessage, setDiagnosisSaveMessage] = useState('');\n  const [diagnosisSaveError, setDiagnosisSaveError] = useState('');\n  const [isDiagnosisRecordSaving, setIsDiagnosisRecordSaving] = useState(false);\n  const [isDiagnosisRecordSaved, setIsDiagnosisRecordSaved] = useState(false);",
    "diagnosis save states",
)
text = replace_once(
    text,
    "  const [selectedWaterChangeDate, setSelectedWaterChangeDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));\n  const [waterChangeFeedback, setWaterChangeFeedback] = useState('');",
    "  const [selectedWaterChangeDate, setSelectedWaterChangeDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));\n  const [waterChangeFeedback, setWaterChangeFeedback] = useState('');\n  const [waterChangeError, setWaterChangeError] = useState('');\n  const [isWaterChangeSaving, setIsWaterChangeSaving] = useState(false);",
    "water save states",
)

pattern = re.compile(r"  const handleTankWaterChange = async \(\) => \{.*?\n  \};\n\n  const handleDailyActionPrimary", re.S)
replacement = """  const handleTankWaterChange = async (): Promise<boolean> => {
    if (!activeAquarium || isWaterChangeSaving) return false;
    const now = new Date().toISOString();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const history = activeAquarium.waterChangeHistory || [];
    const hasTodayRecord = history.includes(todayStr);
    const newHistory = toggleWaterChangeDate(history, todayStr);
    const nextAquarium = applyWaterChangeHistory(activeAquarium, newHistory);

    setIsWaterChangeSaving(true);
    setWaterChangeError('');
    setWaterChangeFeedback('');
    try {
      saveAquariums(aquariums.map(aquarium => aquarium.id === activeId ? nextAquarium : aquarium));
      try {
        if (hasTodayRecord) {
          await removeCareTimelineEventBySource(activeAquarium.id, 'water_change_day', todayStr);
          await persistCareTimelineEvent({
            aquariumId: activeAquarium.id,
            eventType: 'water_change',
            title: isEn ? "Undid today's water-change record" : '撤回今日换水记录',
            payload: { reversed: true },
            occurredAt: now,
            sourceType: 'water_change_reversal',
            sourceId: todayStr,
            isInferred: false,
          });
        } else {
          await persistCareTimelineEvent({
            aquariumId: activeAquarium.id,
            eventType: 'water_change',
            title: isEn ? 'Logged water change' : '记录换水',
            payload: {},
            occurredAt: now,
            sourceType: 'water_change_day',
            sourceId: todayStr,
            isInferred: false,
          });
        }
      } catch {
        showToast(isEn ? 'Water change was saved, but the timeline could not be updated.' : '换水已保存，但养护时间线没有更新成功。', 'error');
      }
      setTankActionMessage(hasTodayRecord
        ? (isEn ? "Recalled today's water change record" : '已撤回今日换水记录')
        : (isEn ? `Logged water change: ${format(new Date(), 'yyyy-MM-dd HH:mm')}` : `已记录换水：${format(new Date(), 'yyyy-MM-dd HH:mm')}`));
      return true;
    } catch {
      const message = isEn ? 'Could not save the water-change record. Try again.' : '换水记录没有保存成功，请重试。';
      setWaterChangeError(message);
      showToast(message, 'error');
      return false;
    } finally {
      setIsWaterChangeSaving(false);
    }
  };

  const handleDailyActionPrimary"""
text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit(f"handleTankWaterChange replacement count={count}")

pattern = re.compile(r"  const handleToggleWaterChangeDate = \(dateStr: string\) => \{.*?\n  \};\n\n  const getConflicts", re.S)
replacement = """  const handleToggleWaterChangeDate = (dateStr: string): boolean => {
    if (!activeAquarium || isFutureWaterChangeDate(dateStr)) return false;
    const newHistory = toggleWaterChangeDate(activeAquarium.waterChangeHistory || [], dateStr);
    const nextAquarium = applyWaterChangeHistory(activeAquarium, newHistory);
    saveAquariums(aquariums.map(aquarium => aquarium.id === activeId ? nextAquarium : aquarium));
    return true;
  };

  const getConflicts"""
text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit(f"handleToggleWaterChangeDate replacement count={count}")

text = text.replace(
    "    setDiagnosisSaveMessage('');\n    setIsDiagnosisRecordSaved(false);",
    "    setDiagnosisSaveMessage('');\n    setDiagnosisSaveError('');\n    setIsDiagnosisRecordSaving(false);\n    setIsDiagnosisRecordSaved(false);",
)

text = replace_once(
    text,
    "  const handleSaveDiagnosisRecord = () => {\n    const targetAquarium = diagnosisAquarium;\n    if (!targetAquarium) return;",
    "  const handleSaveDiagnosisRecord = (): boolean => {\n    if (isDiagnosisRecordSaving) return false;\n    const targetAquarium = diagnosisAquarium;\n    if (!targetAquarium) return false;\n    setIsDiagnosisRecordSaving(true);\n    setDiagnosisSaveError('');\n    setDiagnosisSaveMessage('');",
    "diagnosis save handler start",
)
pattern = re.compile(r"    const nextRecords = upsertDiagnosisRecord\(diagnosisRecords, record\);.*?    if \(problemType === '巡检'\) \{\n      trackSessionEvent\('daily_check_completed'.*?\n    \}\n  \};", re.S)
replacement = """    const nextRecords = upsertDiagnosisRecord(diagnosisRecords, record);
    try {
      const persistedRecords = persistDiagnosisRecords(nextRecords);
      setDiagnosisRecords(persistedRecords);
      setDiagnosisSaveMessage(problemType === '巡检'
        ? existingDailyRecord ? '已更新今天的检查记录。' : '已保存今天的检查记录。'
        : '已保存本次诊断记录。');
      setIsDiagnosisRecordSaved(true);
      showToast(problemType === '巡检'
        ? existingDailyRecord ? '已更新今天的检查记录' : '已保存今天的检查记录'
        : '已保存本次诊断');
      if (problemType === '巡检') {
        trackSessionEvent('daily_check_completed', { action: existingDailyRecord ? 'update' : 'complete', status: result.riskLevel, entry: 'aquarium' });
      }
      void persistCareTimelineEvent({
        aquariumId: targetAquarium.id,
        eventType: 'daily_check',
        title: problemType === '巡检' ? (isEn ? 'Completed daily check' : '完成每日检查') : (isEn ? `Completed ${problemType}` : `完成${problemType}`),
        label: result.verdict,
        payload: { riskLevel: result.riskLevel },
        occurredAt: record.createdAt,
        sourceType: 'diagnosis_record',
        sourceId: id,
        isInferred: false,
      }).catch(() => showToast(isEn ? 'The check was saved, but the timeline could not be updated.' : '检查结果已保存，但巡检时间线没有更新成功。', 'error'));
      return true;
    } catch {
      const message = isEn ? 'Could not save the check result. Try again.' : '检查结果没有保存成功，请重试。';
      setDiagnosisSaveError(message);
      setIsDiagnosisRecordSaved(false);
      showToast(message, 'error');
      return false;
    } finally {
      setIsDiagnosisRecordSaving(false);
    }
  };"""
text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit(f"diagnosis persistence replacement count={count}")

text = replace_once(
    text,
    "  const handleVisualDiagnosisPrimary = () => {\n    handleSaveDiagnosisRecord();\n    if (diagnosisIssueType === '巡检' && dailyCheckArticles[0] && structuredDiagnosis) {",
    "  const handleVisualDiagnosisPrimary = () => {\n    const saved = handleSaveDiagnosisRecord();\n    if (!saved) return;\n    if (diagnosisIssueType === '巡检' && dailyCheckArticles[0] && structuredDiagnosis) {",
    "diagnosis post-save guard",
)

text = replace_once(
    text,
    "          setSelectedWaterChangeDate(format(new Date(), 'yyyy-MM-dd'));\n          setWaterChangeFeedback('');",
    "          setSelectedWaterChangeDate(format(new Date(), 'yyyy-MM-dd'));\n          setWaterChangeFeedback('');\n          setWaterChangeError('');",
    "calendar open reset",
)
text = replace_once(
    text,
    '                {waterChangeFeedback && (\n                  <div className="mt-3 rounded-[14px] bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-800">\n                    {waterChangeFeedback}\n                  </div>\n                )}',
    '                {waterChangeFeedback && (\n                  <div className="mt-3 rounded-[14px] bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-800">\n                    {waterChangeFeedback}\n                  </div>\n                )}\n                {waterChangeError && (\n                  <div role="alert" className="mt-3 rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-800">\n                    {waterChangeError}\n                  </div>\n                )}',
    "water error render",
)
text = replace_once(
    text,
    '                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label={isEn ? \'Next month\' : \'下个月\'} onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>',
    '                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label={isEn ? \'Next month\' : \'下个月\'} disabled={startOfMonth(addMonths(calendarMonth, 1)) > startOfMonth(new Date())} onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>',
    "future month guard",
)
text = replace_once(
    text,
    "                    const isFuture = date > new Date() && !isToday;",
    "                    const isFuture = isFutureWaterChangeDate(dateStr);",
    "future date derivation",
)
text = replace_once(
    text,
    '                        type="button"\n                        onClick={() => {\n                          setSelectedWaterChangeDate(dateStr);\n                          setWaterChangeFeedback(\'\');\n                        }}',
    '                        type="button"\n                        disabled={isFuture}\n                        onClick={() => {\n                          setSelectedWaterChangeDate(dateStr);\n                          setWaterChangeFeedback(\'\');\n                          setWaterChangeError(\'\');\n                        }}',
    "future date button guard",
)

pattern = re.compile(r"            <Button\n              className=\{`min-h-11 rounded-full text-sm font-bold text-white \$\{selectedWaterDateHasRecord \? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-700 hover:bg-emerald-800'\}`\}\n              onClick=\{\(\) => \{.*?              \{selectedWaterDateHasRecord \? \(isEn \? 'Remove Log' : '取消这天记录'\) : \(isEn \? 'Log Water Change' : '记录这天换水'\)\}\n            </Button>", re.S)
replacement = """            <Button
              disabled={isWaterChangeSaving || isFutureWaterChangeDate(selectedWaterChangeDate)}
              className={`min-h-11 rounded-full text-sm font-bold text-white ${selectedWaterDateHasRecord ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-700 hover:bg-emerald-800'}`}
              onClick={() => {
                if (isWaterChangeSaving || isFutureWaterChangeDate(selectedWaterChangeDate)) {
                  setWaterChangeError(isEn ? 'Only today or past water changes can be recorded.' : '只能记录今天或过去实际发生的换水。');
                  return;
                }
                const wasRecorded = selectedWaterDateHasRecord;
                setIsWaterChangeSaving(true);
                setWaterChangeError('');
                setWaterChangeFeedback('');
                try {
                  const saved = handleToggleWaterChangeDate(selectedWaterChangeDate);
                  if (!saved) {
                    setWaterChangeError(isEn ? 'Could not save the water-change record. Try again.' : '换水记录没有保存成功，请重试。');
                    return;
                  }
                  setWaterChangeFeedback(wasRecorded
                    ? `已取消 ${format(new Date(selectedWaterChangeDate), 'yyyy/MM/dd')} 的换水记录。`
                    : `已记录换水，下次建议约 ${shortestCycle} 天后。`
                  );
                } catch {
                  setWaterChangeError(isEn ? 'Could not save the water-change record. Try again.' : '换水记录没有保存成功，请重试。');
                } finally {
                  setIsWaterChangeSaving(false);
                }
              }}
            >
              {isWaterChangeSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isWaterChangeSaving
                ? (isEn ? 'Saving…' : '保存中…')
                : selectedWaterDateHasRecord
                  ? (isEn ? 'Remove Log' : '取消这天记录')
                  : (isEn ? 'Log Water Change' : '记录这天换水')}
            </Button>"""
text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit(f"water footer replacement count={count}")

text = replace_once(
    text,
    '                {diagnosisSaveMessage && (\n                  <div className="rounded-[12px] bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700">\n                    {diagnosisSaveMessage}\n                  </div>\n                )}',
    '                {diagnosisSaveMessage && (\n                  <div className="rounded-[12px] bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700">\n                    {diagnosisSaveMessage}\n                  </div>\n                )}\n                {diagnosisSaveError && (\n                  <div role="alert" className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-black text-red-700">\n                    {diagnosisSaveError}\n                  </div>\n                )}',
    "diagnosis error render",
)
path.write_text(text)


# Register executable consolidated eval commands.
package_path = Path("package.json")
package = json.loads(package_path.read_text())
scripts = package["scripts"]
scripts["test:core-flow-state-eval-v1"] = "tsx scripts/test-core-flow-state-eval-v1.ts"
scripts["test:core-flow-state-eval-v2"] = "tsx scripts/test-core-flow-state-eval-v2.ts"
scripts["test:core-flow-state-eval"] = "npm run test:core-flow-state-eval-v1 && npm run test:core-flow-state-eval-v2"
package_path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n")
