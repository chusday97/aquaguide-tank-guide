from pathlib import Path
import re


def replace_once(path: Path, old: str, new: str, label: str):
    text = path.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 exact match, got {count}')
    path.write_text(text.replace(old, new, 1))


# Repository contract
contract = Path('src/services/repository/aquaguide.repository.ts')
replace_once(
    contract,
    "  updateFavorite(input: FavoriteMutation): Promise<void>;\n  saveDiagnosis(record: DiagnosisRecord): Promise<DiagnosisRecord>;\n",
    "  updateFavorite(input: FavoriteMutation): Promise<void>;\n  getDiagnosisRecords(aquariumId: string): Promise<DiagnosisRecord[]>;\n  saveDiagnosis(record: DiagnosisRecord): Promise<DiagnosisRecord>;\n",
    'repository diagnosis read contract',
)

# Local repository
local_repo = Path('src/services/repository/local-aquaguide.repository.ts')
replace_once(
    local_repo,
    "  async saveDiagnosis(record: DiagnosisRecord) {\n    const current = loadAppStateFromStorage().diagnosisRecords as DiagnosisRecord[];\n    persistDiagnosisRecords(upsertDiagnosisRecord(current, record));\n    return record;\n  }\n",
    "  async getDiagnosisRecords(aquariumId: string) {\n    return (loadAppStateFromStorage().diagnosisRecords as DiagnosisRecord[])\n      .filter(record => record.aquariumId === aquariumId)\n      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());\n  }\n\n  async saveDiagnosis(record: DiagnosisRecord) {\n    const current = loadAppStateFromStorage().diagnosisRecords as DiagnosisRecord[];\n    const next = upsertDiagnosisRecord(current, record);\n    persistDiagnosisRecords(next);\n    return next[0];\n  }\n",
    'local diagnosis repository',
)

# API repository
api_repo = Path('src/services/repository/api-aquaguide.repository.ts')
replace_once(
    api_repo,
    "type ApiDiagnosis = DiagnosisRecord & { id: string; version: number; localDate: string; diagnosisKey: string };\n",
    "type ApiDiagnosis = Omit<DiagnosisRecord, 'diagnosisId' | 'source'> & {\n  id: string;\n  version: number;\n  localDate: string;\n  diagnosisKey: string;\n  sourceType?: string;\n  sourceTitle?: string;\n};\n",
    'api diagnosis type',
)
replace_once(
    api_repo,
    "const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);\n",
    "const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);\n\nconst getLocalDateKey = (value: string) => {\n  const date = new Date(value);\n  if (Number.isNaN(date.getTime())) throw new Error('诊断时间无效。');\n  const year = date.getFullYear();\n  const month = String(date.getMonth() + 1).padStart(2, '0');\n  const day = String(date.getDate()).padStart(2, '0');\n  return `${year}-${month}-${day}`;\n};\n\nconst toDiagnosisRecord = (record: ApiDiagnosis): DiagnosisRecord => {\n  const { diagnosisKey, sourceType, sourceTitle, localDate: _localDate, version: _version, ...rest } = record;\n  const source = sourceType === 'manual' || sourceType === 'care_article' || sourceType === 'home'\n    ? { type: sourceType, title: sourceTitle }\n    : undefined;\n  return { ...rest, id: record.id, diagnosisId: diagnosisKey, source };\n};\n",
    'api diagnosis helpers',
)
old_save = """  async saveDiagnosis(record: DiagnosisRecord) {
    const date = record.createdAt.slice(0, 10);
    const current = await apiRequest<ApiDiagnosis | null>(`/aquariums/${record.aquariumId}/daily-checks/${date}`);
    const saved = await apiRequest<ApiDiagnosis>(`/aquariums/${record.aquariumId}/daily-checks/${date}`, {
      method: 'PUT',
      idempotencyKey: createIdempotencyKey('daily-check'),
      body: {
        diagnosisKey: record.diagnosisId,
        problemType: record.problemType,
        sourceType: record.source?.type,
        sourceTitle: record.source?.title,
        answers: record.answers,
        structuredAnswers: record.structuredAnswers || [],
        resultSummary: record.resultSummary,
        riskLevel: record.riskLevel,
        riskCode: record.riskCode,
        conclusion: record.conclusion,
        keyMetrics: record.keyMetrics || [],
        suggestedActions: record.suggestedActions,
        avoidActions: record.avoidActions || [],
        observeItems: record.observeItems || [],
        missingInfo: record.missingInfo,
        optionalMissingInfo: record.optionalMissingInfo || [],
        nextCheckAt: record.nextCheckAt,
        followUpNotes: record.followUpNotes,
        version: current?.version,
      },
    });
    return { ...record, id: saved.id, diagnosisId: saved.diagnosisKey || record.diagnosisId };
  }
"""
new_save = """  async getDiagnosisRecords(aquariumId: string) {
    if (!isUuid(aquariumId)) throw new Error('云端鱼缸标识无效，请刷新后重试。');
    const result = await apiRequest<{ items: ApiDiagnosis[] }>(`/aquariums/${aquariumId}/diagnoses?limit=50`);
    return (result.items || []).map(toDiagnosisRecord);
  }

  async saveDiagnosis(record: DiagnosisRecord) {
    if (!isUuid(record.aquariumId)) throw new Error('云端鱼缸标识无效，请刷新后重试。');
    const localDate = getLocalDateKey(record.createdAt);
    const body = {
      diagnosisKey: record.diagnosisId,
      problemType: record.problemType,
      sourceType: record.source?.type,
      sourceTitle: record.source?.title,
      answers: record.answers,
      structuredAnswers: record.structuredAnswers || [],
      resultSummary: record.resultSummary,
      riskLevel: record.riskLevel,
      riskCode: record.riskCode,
      conclusion: record.conclusion,
      keyMetrics: record.keyMetrics || [],
      suggestedActions: record.suggestedActions,
      avoidActions: record.avoidActions || [],
      observeItems: record.observeItems || [],
      missingInfo: record.missingInfo,
      optionalMissingInfo: record.optionalMissingInfo || [],
      nextCheckAt: record.nextCheckAt,
      followUpNotes: record.followUpNotes,
    };

    if (record.problemType === '巡检') {
      const current = await apiRequest<ApiDiagnosis | null>(`/aquariums/${record.aquariumId}/daily-checks/${localDate}`);
      const saved = await apiRequest<ApiDiagnosis>(`/aquariums/${record.aquariumId}/daily-checks/${localDate}`, {
        method: 'PUT',
        idempotencyKey: `daily-check:${record.aquariumId}:${localDate}:v${current?.version || 0}`,
        body: { ...body, version: current?.version },
      });
      return toDiagnosisRecord(saved);
    }

    const saved = await apiRequest<ApiDiagnosis>(`/aquariums/${record.aquariumId}/diagnoses/${localDate}`, {
      method: 'POST',
      idempotencyKey: `diagnosis:${record.diagnosisId}`,
      body,
    });
    return toDiagnosisRecord(saved);
  }
"""
replace_once(api_repo, old_save, new_save, 'cloud diagnosis repository')

# API routes
api_routes = Path('apps/api/src/routes/user-records.ts')
text = api_routes.read_text()
marker = "const registerFavoriteRoutes = (type: 'species' | 'care') => {\n"
if text.count(marker) != 1:
    raise SystemExit(f'general diagnosis routes: expected 1 marker, got {text.count(marker)}')
routes = """userRecordsRouter.get('/aquariums/:id/diagnoses', asyncRoute(async (request, response) => {
  const aquariumId = parseId(request.params.id, '鱼缸标识');
  const limit = parseLimit(request.query.limit);
  const client = userClientFor(request);
  const { data, error } = await client.from('diagnosis_records')
    .select('*')
    .eq('aquarium_id', aquariumId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throwDatabaseError(error, '诊断历史暂时无法加载。');
  return sendData(request, response, { items: camelize(data || []) });
}));

userRecordsRouter.post('/aquariums/:id/diagnoses/:localDate', asyncRoute(async (request, response) => {
  const aquariumId = parseId(request.params.id, '鱼缸标识');
  const localDate = isoDateSchema.safeParse(request.params.localDate);
  if (!localDate.success) throw new ApiError(400, 'VALIDATION_ERROR', '诊断日期无效。');
  const parsed = diagnosisSaveSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '诊断结果无效。', parsed.error.flatten());
  if (parsed.data.problemType === '巡检') throw new ApiError(400, 'VALIDATION_ERROR', '每日巡检必须使用巡检保存接口。');
  const idempotency = await beginIdempotentWrite(request);
  const client = userClientFor(request);
  const userId = authenticatedRequest(request).authUser.id;

  if (idempotency.replay?.resourceId) {
    const { data } = await client.from('diagnosis_records').select('*').eq('id', idempotency.replay.resourceId).maybeSingle();
    if (data) return sendData(request, response, camelize(data));
  }

  const { version: _version, ...body } = parsed.data;
  const id = deterministicUuid(`${userId}:diagnosis:${body.diagnosisKey}`);
  const normalized = {
    ...snakeize(body),
    id,
    owner_id: userId,
    aquarium_id: aquariumId,
    local_date: localDate.data,
    problem_type: parsed.data.problemType,
  };
  const { data, error } = await client.from('diagnosis_records').insert(normalized).select('*').single();
  if (error || !data) throwDatabaseError(error, '诊断记录没有保存成功。');
  await finishIdempotentWrite(request, idempotency, 'diagnosis_record', id, 201);
  return sendData(request, response, camelize(data), 201);
}));

"""
api_routes.write_text(text.replace(marker, routes + marker, 1))

# Aquarium page
page = Path('src/pages/Aquarium.tsx')
replace_once(
    page,
    "  const diagnosisAdvanceTimerRef = useRef<number | null>(null);\n  const diagnosisQuestionRefs = useRef<Record<string, HTMLElement | null>>({});\n",
    "  const diagnosisAdvanceTimerRef = useRef<number | null>(null);\n  const diagnosisSaveIdRef = useRef('');\n  const diagnosisQuestionRefs = useRef<Record<string, HTMLElement | null>>({});\n",
    'diagnosis retry id ref',
)
replace_once(
    page,
    "        setCareRemindersState(repositoryReminders);\n        setCareTimelineEvents(repositoryEvents);\n        setActiveId(current => normalized.some(item => item.id === current) ? current : normalized[0]?.id || '');\n",
    "        setCareRemindersState(repositoryReminders);\n        setCareTimelineEvents(repositoryEvents);\n        try {\n          const repositoryDiagnoses = (await Promise.all(\n            repositoryAquariums.map(aquarium => repository.getDiagnosisRecords(aquarium.id)),\n          )).flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());\n          if (!active) return;\n          setDiagnosisRecords(repositoryDiagnoses);\n          if (resolvedMode === 'cloud') patchLocalAppState({ diagnosisRecords: repositoryDiagnoses });\n        } catch {\n          if (active) showToast(isEn ? 'Diagnosis history could not be loaded.' : '诊断历史暂时无法读取。', 'error');\n        }\n        setActiveId(current => normalized.some(item => item.id === current) ? current : normalized[0]?.id || '');\n",
    'diagnosis repository hydration',
)
replace_once(
    page,
    "  const handleRunDiagnosis = async () => {\n    const result = buildStructuredDiagnosis();\n    setDiagnosisResult(result);\n",
    "  const handleRunDiagnosis = async () => {\n    const result = buildStructuredDiagnosis();\n    diagnosisSaveIdRef.current = crypto.randomUUID();\n    setDiagnosisResult(result);\n",
    'diagnosis logical save id',
)
old_handler = """  const handleSaveDiagnosisRecord = (): boolean => {
    if (isDiagnosisRecordSaving) return false;
    const targetAquarium = diagnosisAquarium;
    if (!targetAquarium) return false;
    setIsDiagnosisRecordSaving(true);
    setDiagnosisSaveError('');
    setDiagnosisSaveMessage('');
    const result = diagnosisResult || buildStructuredDiagnosis();
    const problemType: DiagnosisProblemType = isDiagnosisProblemType(diagnosisIssueType) ? diagnosisIssueType : '巡检';
    const activeQuestions = getDiagnosisQuestions(problemType, diagnosisQuizAnswers);
    const structuredAnswers = activeQuestions
      .filter(question => diagnosisQuizAnswers[question.id])
      .map(question => ({
        questionId: question.id,
        question: question.question,
        answer: diagnosisQuizAnswers[question.id],
      }));
    const existingDailyRecord = problemType === '巡检'
      ? findDailyPatrolRecord(diagnosisRecords, targetAquarium.id)
      : undefined;
    const id = existingDailyRecord?.diagnosisId || Math.random().toString(36).substring(2, 10);
    const record: DiagnosisRecord = {
      diagnosisId: id,
      id,
      createdAt: new Date().toISOString(),
      aquariumId: targetAquarium.id,
      source: careDiagnosisContext
        ? { type: 'care_article', title: careDiagnosisContext.title }
        : { type: 'home' },
      problemType,
      answers: diagnosisQuizAnswers,
      structuredAnswers,
      resultSummary: result.verdict,
      riskLevel: result.risk,
      riskCode: result.riskLevel,
      conclusion: result.verdict,
      keyMetrics: result.keyMetrics,
      suggestedActions: result.actions,
      avoidActions: result.avoid,
      observeItems: result.observe,
      missingInfo: result.missing,
      optionalMissingInfo: result.missing,
      nextCheckAt: result.nextCheckAt,
      followUpNotes: careDiagnosisContext ? [`来自百科：${careDiagnosisContext.title}`] : [],
    };
    const nextRecords = upsertDiagnosisRecord(diagnosisRecords, record);
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
  };
"""
new_handler = """  const handleSaveDiagnosisRecord = async (): Promise<boolean> => {
    if (isDiagnosisRecordSaving) return false;
    const targetAquarium = diagnosisAquarium;
    if (!targetAquarium) return false;
    setIsDiagnosisRecordSaving(true);
    setDiagnosisSaveError('');
    setDiagnosisSaveMessage('');
    const result = diagnosisResult || buildStructuredDiagnosis();
    const problemType: DiagnosisProblemType = isDiagnosisProblemType(diagnosisIssueType) ? diagnosisIssueType : '巡检';
    const activeQuestions = getDiagnosisQuestions(problemType, diagnosisQuizAnswers);
    const structuredAnswers = activeQuestions
      .filter(question => diagnosisQuizAnswers[question.id])
      .map(question => ({
        questionId: question.id,
        question: question.question,
        answer: diagnosisQuizAnswers[question.id],
      }));
    const existingDailyRecord = problemType === '巡检'
      ? findDailyPatrolRecord(diagnosisRecords, targetAquarium.id)
      : undefined;
    if (!diagnosisSaveIdRef.current) diagnosisSaveIdRef.current = crypto.randomUUID();
    const id = existingDailyRecord?.diagnosisId || diagnosisSaveIdRef.current;
    const record: DiagnosisRecord = {
      diagnosisId: id,
      id,
      createdAt: new Date().toISOString(),
      aquariumId: targetAquarium.id,
      source: careDiagnosisContext
        ? { type: 'care_article', title: careDiagnosisContext.title }
        : { type: 'home' },
      problemType,
      answers: diagnosisQuizAnswers,
      structuredAnswers,
      resultSummary: result.verdict,
      riskLevel: result.risk,
      riskCode: result.riskLevel,
      conclusion: result.verdict,
      keyMetrics: result.keyMetrics,
      suggestedActions: result.actions,
      avoidActions: result.avoid,
      observeItems: result.observe,
      missingInfo: result.missing,
      optionalMissingInfo: result.missing,
      nextCheckAt: result.nextCheckAt,
      followUpNotes: careDiagnosisContext ? [`来自百科：${careDiagnosisContext.title}`] : [],
    };
    try {
      const repository = await getCurrentAquaGuideRepository();
      const persistedRecord = await repository.saveDiagnosis(record);
      const nextRecords = upsertDiagnosisRecord(diagnosisRecords, persistedRecord);
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
        void persistCareTimelineEvent({
          aquariumId: targetAquarium.id,
          eventType: 'daily_check',
          title: isEn ? 'Completed daily check' : '完成每日检查',
          label: result.verdict,
          payload: { riskLevel: result.riskLevel },
          occurredAt: persistedRecord.createdAt,
          sourceType: 'diagnosis_record',
          sourceId: persistedRecord.id || persistedRecord.diagnosisId,
          isInferred: false,
        }).catch(() => showToast(isEn ? 'The check was saved, but the timeline could not be updated.' : '检查结果已保存，但巡检时间线没有更新成功。', 'error'));
      }
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
  };
"""
replace_once(page, old_handler, new_handler, 'diagnosis page persistence')
replace_once(
    page,
    "  const handleVisualDiagnosisPrimary = () => {\n    const saved = handleSaveDiagnosisRecord();\n",
    "  const handleVisualDiagnosisPrimary = async () => {\n    const saved = await handleSaveDiagnosisRecord();\n",
    'diagnosis primary await',
)

# Package test command
package = Path('package.json')
replace_once(
    package,
    '    "test:observation-canonical": "node --import tsx scripts/test-observation-canonical-state.ts",\n',
    '    "test:observation-canonical": "node --import tsx scripts/test-observation-canonical-state.ts",\n    "test:diagnosis-repository": "node --import tsx scripts/test-diagnosis-repository-boundary.ts",\n',
    'diagnosis package script',
)
