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


# contracts
path = "packages/contracts/src/business.ts"
text = read(path)
text = replace_once(
    text,
    "export const careEventCreateSchema = z.object({",
    """export const careChecklistProgressSaveSchema = z.object({
  aquariumId: uuidSchema.optional(),
  topicId: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(200),
  actionKeys: z.array(z.string().trim().min(1).max(240)).max(50).default([]),
  legacyActions: z.array(z.string().trim().min(1).max(1000)).max(50).default([]),
}).refine(value => value.actionKeys.length > 0 || value.legacyActions.length > 0, '至少保存一项护理进度');

export const careEventCreateSchema = z.object({""",
    "contract checklist schema",
)
text = replace_once(
    text,
    "export type CareReminderCreateInput = z.infer<typeof careReminderCreateSchema>;\nexport type CareEventCreateInput = z.infer<typeof careEventCreateSchema>;",
    "export type CareReminderCreateInput = z.infer<typeof careReminderCreateSchema>;\nexport type CareChecklistProgressSaveInput = z.infer<typeof careChecklistProgressSaveSchema>;\nexport type CareEventCreateInput = z.infer<typeof careEventCreateSchema>;",
    "contract checklist type",
)
write(path, text)

# database types
path = "src/types/database.ts"
text = read(path)
text = replace_once(
    text,
    "export interface CareEventRecord extends SyncFields {",
    """export interface CareChecklistProgressRecord extends SyncFields {
  id: Uuid;
  ownerId: Uuid;
  aquariumId?: Uuid;
  topicId: string;
  title: string;
  actionKeys: string[];
  legacyActions: string[];
  savedAt: IsoDateTime;
}

export interface CareEventRecord extends SyncFields {""",
    "database checklist record",
)
write(path, text)

# API routes
path = "apps/api/src/routes/user-records.ts"
text = read(path)
text = replace_once(
    text,
    "  careEventCreateSchema,\n  careReminderCreateSchema,",
    "  careChecklistProgressSaveSchema,\n  careEventCreateSchema,\n  careReminderCreateSchema,",
    "api checklist schema import",
)
text = replace_once(
    text,
    "const protectedPrefixes = ['/aquariums/', '/favorites/', '/memorial-records', '/care-reminders', '/care-events'];",
    "const protectedPrefixes = ['/aquariums/', '/favorites/', '/memorial-records', '/care-reminders', '/care-checklist-progress', '/care-events'];",
    "api protected prefix",
)
route_block = """userRecordsRouter.get('/care-checklist-progress', asyncRoute(async (request, response) => {
  const client = userClientFor(request);
  let builder = client
    .from('care_checklist_progress')
    .select('*')
    .is('deleted_at', null)
    .order('saved_at', { ascending: false })
    .limit(100);
  if (request.query.aquariumId) {
    const aquariumId = parseId(String(request.query.aquariumId), '鱼缸标识');
    builder = builder.or(`aquarium_id.eq.${aquariumId},aquarium_id.is.null`);
  }
  const { data, error } = await builder;
  if (error) throwDatabaseError(error, '护理清单进度暂时无法加载。');
  return sendData(request, response, { items: camelize(data || []) });
}));

userRecordsRouter.put('/care-checklist-progress', asyncRoute(async (request, response) => {
  const parsed = careChecklistProgressSaveSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '护理清单进度无效。', parsed.error.flatten());
  const idempotency = await beginIdempotentWrite(request);
  const client = userClientFor(request);
  const userId = authenticatedRequest(request).authUser.id;

  if (idempotency.replay?.resourceId) {
    const { data } = await client
      .from('care_checklist_progress')
      .select('*')
      .eq('id', idempotency.replay.resourceId)
      .maybeSingle();
    if (data) return sendData(request, response, camelize(data));
  }

  const scopeKey = parsed.data.aquariumId || 'global';
  const id = deterministicUuid(`${userId}:care-checklist-progress:${scopeKey}:${parsed.data.topicId}`);
  const { data, error } = await client.from('care_checklist_progress').upsert({
    id,
    owner_id: userId,
    aquarium_id: parsed.data.aquariumId,
    topic_id: parsed.data.topicId,
    title: parsed.data.title,
    action_keys: parsed.data.actionKeys,
    legacy_actions: parsed.data.legacyActions,
    saved_at: new Date().toISOString(),
    deleted_at: null,
  }, { onConflict: 'id' }).select('*').single();
  if (error || !data) throwDatabaseError(error, '护理清单进度没有保存成功。');
  await finishIdempotentWrite(request, idempotency, 'care_checklist_progress', id, 200);
  return sendData(request, response, camelize(data));
}));

"""
text = replace_once(
    text,
    "userRecordsRouter.get('/care-events', asyncRoute(async (request, response) => {",
    route_block + "userRecordsRouter.get('/care-events', asyncRoute(async (request, response) => {",
    "api checklist routes",
)
write(path, text)

print("03-api-contract.py applied")
