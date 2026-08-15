from pathlib import Path
import re

path = Path('src/pages/Aquarium.tsx')
text = path.read_text()


def replace_once(old: str, new: str, label: str):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 exact match, got {count}')
    text = text.replace(old, new, 1)


replace_once(
    "} from '../services/care/feeding-state.service';\n",
    "} from '../services/care/feeding-state.service';\n"
    "import {\n"
    "  NO_OBVIOUS_ABNORMALITY_CODE,\n"
    "  OBSERVATION_CHECK_OPTIONS,\n"
    "  OBSERVATION_SOURCE_TYPE,\n"
    "  getLatestObservationStatusForDate,\n"
    "  getObservationNote,\n"
    "  normalizeObservationChecks,\n"
    "  toggleObservationCheck,\n"
    "  type ObservationCheckCode,\n"
    "  type ObservationStatus,\n"
    "} from '../services/care/observation-state.service';\n",
    'observation helper import',
)

replace_once(
    "  const [isObservationOpen, setIsObservationOpen] = useState(false);\n"
    "  const [observationChecks, setObservationChecks] = useState<string[]>([]);\n",
    "  const [isObservationOpen, setIsObservationOpen] = useState(false);\n"
    "  const [isObservationSaving, setIsObservationSaving] = useState(false);\n"
    "  const [observationChecks, setObservationChecks] = useState<ObservationCheckCode[]>([]);\n",
    'observation state',
)

replace_once(
    "  const riskReminderCount = Math.max(1, conflicts.length || todayTaskCount || (healthScore < 85 ? 1 : 0));\n",
    "  const todayObservationStatus = getLatestObservationStatusForDate({\n"
    "    events: careTimelineEvents,\n"
    "    localRecords: observationRecords,\n"
    "    aquariumId: activeAquarium.id,\n"
    "    dateKey: getLocalDateKey(),\n"
    "  });\n"
    "  const riskReminderCount = Math.max(1, conflicts.length || todayTaskCount || (healthScore < 85 ? 1 : 0));\n",
    'today observation derivation',
)

replace_once(
    "      actionText: priorityTaskStatus.observeBreathing || '开始观察',\n",
    "      actionText: todayObservationStatus === 'abnormal'\n"
    "        ? (isEn ? 'Abnormality noted' : '已发现异常')\n"
    "        : todayObservationStatus === 'normal'\n"
    "          ? (isEn ? 'Observed today' : '已观察')\n"
    "          : (isEn ? 'Start observation' : '开始观察'),\n",
    'observation reminder status',
)

marker = "  const recommendedActionCandidates: Array<{\n"
if text.count(marker) != 1:
    raise SystemExit(f'observation handler insertion: expected 1 marker, got {text.count(marker)}')
handler = """  const handleObservationSubmit = async (status: ObservationStatus) => {
    if (!activeId || isObservationSaving) return;
    const occurredAt = new Date().toISOString();
    const selectedChecks = normalizeObservationChecks(status, observationChecks);
    const note = getObservationNote(status, selectedChecks, Boolean(isEn));
    setIsObservationSaving(true);
    try {
      const saved = await persistCareTimelineEvent({
        aquariumId: activeId,
        eventType: 'observation',
        title: status === 'normal'
          ? (isEn ? 'Observation: no obvious abnormality' : '记录观察：未见明显异常')
          : (isEn ? 'Observation: abnormality noticed' : '记录观察：发现异常'),
        label: note,
        payload: { status, checks: selectedChecks, localDate: getLocalDateKey(occurredAt) },
        occurredAt,
        sourceType: OBSERVATION_SOURCE_TYPE,
        sourceId: crypto.randomUUID(),
        isInferred: false,
      });
      const createdRecord: LocalEventRecord = {
        id: saved.sourceId || saved.id,
        aquariumId: activeId,
        createdAt: saved.occurredAt || occurredAt,
        type: 'observation',
        note,
      };
      const nextRecords = [...observationRecords, createdRecord];
      setObservationRecords(nextRecords);
      patchLocalAppState({ observationRecords: nextRecords }, { debounce: true });
      setObservationChecks([]);
      setTankActionMessage(status === 'normal'
        ? (isEn ? `Observation recorded: ${format(new Date(), 'HH:mm')} no obvious abnormality` : `已记录观察：${format(new Date(), 'HH:mm')} 未发现明显呼吸异常`)
        : (isEn ? 'Abnormal observation recorded. Continue with diagnosis.' : '已记录呼吸异常，建议继续完成鱼只异常诊断。'));
      setIsObservationOpen(false);
      if (status === 'abnormal') handleOpenDiagnosisWithType('鱼只异常');
    } catch {
      showToast(isEn ? 'Observation could not be saved. Your selections were kept.' : '观察记录没有保存成功，已保留当前选择。', 'error');
    } finally {
      setIsObservationSaving(false);
    }
  };

"""
text = text.replace(marker, handler + marker, 1)

options_pattern = re.compile(
    r"\{\(isEn \? \['Fish floating at surface', 'Rapid breathing', 'Lying at bottom or hiding', 'Refusing food or abnormal feeding', 'No obvious abnormalities'\] : \['鱼浮在水面', '呼吸明显急促', '趴缸或躲藏', '拒食或抢食异常', '没有明显异常'\]\)\.map\(item => \{\n"
    r"\s*const checked = observationChecks\.includes\(item\);\n"
    r"\s*return \(\n"
    r"\s*<button\n"
    r"\s*key=\{item\}\n"
    r"\s*type=\"button\"\n"
    r"\s*onClick=\{\(\) => setObservationChecks\(prev => prev\.includes\(item\) \? prev\.filter\(value => value !== item\) : \[\.\.\.prev, item\]\)\}\n"
)
replacement = """{OBSERVATION_CHECK_OPTIONS.map(option => {
              const item = isEn ? option.en : option.zh;
              const checked = observationChecks.includes(option.code);
              return (
                <button
                  key={option.code}
                  type=\"button\"
                  onClick={() => setObservationChecks(prev => toggleObservationCheck(prev, option.code))}
"""
text, count = options_pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit(f'observation options: expected 1 match, got {count}')

normal_old = """              onClick={() => {
                setObservationChecks([]);
                markPriorityTask('observeBreathing', '已观察');
                const nextRecords = [
                  ...observationRecords,
                  {
                    id: Math.random().toString(36).substring(2, 9),
                    aquariumId: activeId,
                    createdAt: new Date().toISOString(),
                    type: 'observation',
                    note: '未发现明显呼吸异常',
                  },
                ];
                setObservationRecords(nextRecords);
                patchLocalAppState({ observationRecords: nextRecords }, { debounce: true });
                setTankActionMessage(`已记录观察：${format(new Date(), 'HH:mm')} 未发现明显呼吸异常`);
                setIsObservationOpen(false);
              }}
"""
normal_new = """              disabled={isObservationSaving || observationChecks.some(code => code !== NO_OBVIOUS_ABNORMALITY_CODE)}
              onClick={() => { void handleObservationSubmit('normal'); }}
"""
replace_once(normal_old, normal_new, 'normal observation action')

abnormal_old = """              onClick={() => {
                markPriorityTask('observeBreathing', '已发现异常');
                const nextRecords = [
                  ...observationRecords,
                  {
                    id: Math.random().toString(36).substring(2, 9),
                    aquariumId: activeId,
                    createdAt: new Date().toISOString(),
                    type: 'observation',
                    note: observationChecks.length > 0 ? observationChecks.join('、') : '发现异常',
                  },
                ];
                setObservationRecords(nextRecords);
                patchLocalAppState({ observationRecords: nextRecords }, { debounce: true });
                setTankActionMessage('已记录呼吸异常，建议继续完成鱼只异常诊断。');
                setIsObservationOpen(false);
                handleOpenDiagnosisWithType('鱼只异常');
              }}
"""
abnormal_new = """              disabled={isObservationSaving || observationChecks.includes(NO_OBVIOUS_ABNORMALITY_CODE)}
              onClick={() => { void handleObservationSubmit('abnormal'); }}
"""
replace_once(abnormal_old, abnormal_new, 'abnormal observation action')

path.write_text(text)
