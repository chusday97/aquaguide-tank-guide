from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    file = Path(path)
    text = file.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 exact match, got {count}')
    file.write_text(text.replace(old, new, 1))


replace_once(
    'src/services/repository/aquaguide.repository.ts',
    '  saveDiagnosis(record: DiagnosisRecord): Promise<DiagnosisRecord>;\n  saveMemorial(input: MemorialSaveInput): Promise<DeceasedRecord>;\n',
    '  saveDiagnosis(record: DiagnosisRecord): Promise<DiagnosisRecord>;\n  getMemorialRecords(): Promise<DeceasedRecord[]>;\n  saveMemorial(input: MemorialSaveInput): Promise<DeceasedRecord>;\n',
    'repository memorial read contract',
)

replace_once(
    'src/services/repository/local-aquaguide.repository.ts',
    "import type { Aquarium } from '../../types';\n",
    "import type { Aquarium, DeceasedRecord } from '../../types';\n",
    'local memorial type import',
)

replace_once(
    'src/services/repository/local-aquaguide.repository.ts',
    '  async saveMemorial(input: MemorialSaveInput) {\n',
    "  async getMemorialRecords() {\n    return [...(loadAppStateFromStorage().deceasedRecords as DeceasedRecord[])]\n      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());\n  }\n\n  async saveMemorial(input: MemorialSaveInput) {\n",
    'local memorial read implementation',
)

replace_once(
    'src/services/repository/api-aquaguide.repository.ts',
    'type ApiReminder = {\n',
    "type ApiMemorial = {\n  id: string;\n  speciesCatalogKey: string;\n  memorialDate: string;\n  causeCodes?: DeceasedRecord['causeCodes'];\n  reason?: string;\n  observation?: string;\n  improvement?: string;\n  version?: number;\n};\n\ntype ApiReminder = {\n",
    'api memorial payload type',
)

replace_once(
    'src/services/repository/api-aquaguide.repository.ts',
    'const toLegacyAquarium = (record: ApiAquarium): Aquarium => {\n',
    "const toMemorialRecord = (record: ApiMemorial): DeceasedRecord => ({\n  id: record.id,\n  fishId: record.speciesCatalogKey,\n  date: record.memorialDate,\n  causeCodes: record.causeCodes,\n  reason: record.reason,\n  observation: record.observation,\n  improvement: record.improvement,\n  version: record.version,\n});\n\nconst toLegacyAquarium = (record: ApiAquarium): Aquarium => {\n",
    'api memorial mapper',
)

replace_once(
    'src/services/repository/api-aquaguide.repository.ts',
    '  async saveMemorial(input: MemorialSaveInput) {\n',
    "  async getMemorialRecords() {\n    const response = await apiRequest<{ items: ApiMemorial[] }>('/memorial-records?limit=100');\n    return (response.items || []).map(toMemorialRecord);\n  }\n\n  async saveMemorial(input: MemorialSaveInput) {\n",
    'api memorial read implementation',
)

replace_once(
    'src/pages/Aquarium.tsx',
    "        const [repositoryAquariums, repositoryReminders, repositoryEvents] = resolvedMode === 'cloud'\n          ? await Promise.all([repository.getAquariums(), repository.getCareReminders(), repository.getCareEvents()])\n          : [loadAppStateFromStorage().aquariums, await repository.getCareReminders(), await repository.getCareEvents()];\n",
    "        const [repositoryAquariums, repositoryReminders, repositoryEvents, repositoryMemorials] = resolvedMode === 'cloud'\n          ? await Promise.all([repository.getAquariums(), repository.getCareReminders(), repository.getCareEvents(), repository.getMemorialRecords()])\n          : [loadAppStateFromStorage().aquariums, await repository.getCareReminders(), await repository.getCareEvents(), await repository.getMemorialRecords()];\n",
    'Aquarium repository hydration tuple',
)

replace_once(
    'src/pages/Aquarium.tsx',
    '        setCareTimelineEvents(repositoryEvents);\n',
    "        setCareTimelineEvents(repositoryEvents);\n        setDeceasedRecords(repositoryMemorials);\n        if (resolvedMode === 'cloud') patchLocalAppState({ deceasedRecords: repositoryMemorials });\n",
    'Aquarium memorial hydration',
)

replace_once(
    'package.json',
    '    "test:diagnosis-repository": "node --import tsx scripts/test-diagnosis-repository-boundary.ts",\n',
    '    "test:diagnosis-repository": "node --import tsx scripts/test-diagnosis-repository-boundary.ts",\n    "test:memorial-repository": "node --import tsx scripts/test-memorial-repository-boundary.ts",\n',
    'package memorial test script',
)
