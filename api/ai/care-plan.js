const aiBaseUrl = (process.env.AI_BASE_URL || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
const aiModel = process.env.AI_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';
const aiRequestTimeoutMs = Number(process.env.AI_TIMEOUT_MS || 20_000);

const isConfiguredApiKey = (apiKey) => Boolean(
  apiKey
  && apiKey !== 'MY_DEEPSEEK_API_KEY'
  && apiKey !== 'MY_AI_API_KEY'
);

const apiKey = [process.env.AI_API_KEY, process.env.DEEPSEEK_API_KEY].find(isConfiguredApiKey) || '';

export const config = {
  maxDuration: 30,
};

const fetchWithTimeout = async (url, options, timeoutMs = aiRequestTimeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const parseJsonObject = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text || '').match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI response is not valid JSON');
    return JSON.parse(match[0]);
  }
};

const cleanStringArray = (value, limit = 8) => (
  Array.isArray(value)
    ? value.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim()).slice(0, limit)
    : []
);

const normalizePlan = (raw, locale) => {
  const isEn = String(locale || '').toLowerCase().startsWith('en');
  const allowedWhen = new Set(['today', 'this_week', 'ongoing', 'watch']);
  const confidence = raw?.confidence === 'personalized' ? 'personalized' : 'provisional';
  const tasks = Array.isArray(raw?.tasks)
    ? raw.tasks.slice(0, 10).map((item, index) => ({
      id: typeof item?.id === 'string' && item.id.trim() ? item.id.trim() : `task-${index + 1}`,
      when: allowedWhen.has(item?.when) ? item.when : 'ongoing',
      title: typeof item?.title === 'string' ? item.title.trim() : '',
      detail: typeof item?.detail === 'string' ? item.detail.trim() : '',
      why: typeof item?.why === 'string' ? item.why.trim() : '',
      evidence: cleanStringArray(item?.evidence, 4),
      confidence: item?.confidence === 'high' ? 'high' : item?.confidence === 'medium' ? 'medium' : 'low',
    })).filter(item => item.title)
    : [];

  return {
    confidence,
    summary: typeof raw?.summary === 'string' && raw.summary.trim()
      ? raw.summary.trim()
      : (isEn ? 'A provisional care plan was created from the information currently available.' : '已根据当前已知信息生成一份暂定养护计划。'),
    knownFacts: cleanStringArray(raw?.knownFacts, 10),
    tasks,
    unknowns: cleanStringArray(raw?.unknowns, 8),
    nextQuestion: typeof raw?.nextQuestion === 'string' ? raw.nextQuestion.trim() : '',
    aiRole: isEn
      ? 'AI organizes the known facts, prioritizes actions, explains why they matter, and asks one high-value follow-up question.'
      : 'AI 负责整理已知信息、给行动排优先级、解释原因，并只追问一个最有价值的问题。',
    ruleRole: isEn
      ? 'Stored tank facts and explicit safety constraints remain the source of truth; AI must not override them.'
      : '已保存的鱼缸事实和明确的安全约束仍是事实来源，AI 不允许覆盖它们。',
    disclaimer: isEn
      ? 'This is aquarium care guidance, not a disease diagnosis or medication prescription.'
      : '这是鱼缸养护与风险分诊建议，不是疾病诊断或用药处方。',
  };
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!isConfiguredApiKey(apiKey)) {
    return res.status(503).json({ ok: false, error: 'AI provider is not configured', failureReason: 'not_configured' });
  }

  const context = req.body?.context && typeof req.body.context === 'object' ? req.body.context : {};
  const locale = typeof context.locale === 'string' ? context.locale : 'zh-CN';
  const isEn = locale.toLowerCase().startsWith('en');
  const userDescription = typeof context.userDescription === 'string' ? context.userDescription.trim() : '';
  const aquariumSnapshot = context.aquariumSnapshot && typeof context.aquariumSnapshot === 'object' ? context.aquariumSnapshot : {};
  const existingReminders = Array.isArray(context.existingReminders) ? context.existingReminders.slice(0, 8) : [];
  const ruleFacts = Array.isArray(context.ruleFacts) ? context.ruleFacts.slice(0, 12) : [];
  const missingInformation = cleanStringArray(context.missingInformation, 10);

  const hasStoredFacts = Object.values(aquariumSnapshot).some(value => value !== null && value !== undefined && value !== '' && (!(Array.isArray(value)) || value.length > 0));
  if (!userDescription && !hasStoredFacts) {
    return res.status(400).json({ ok: false, error: isEn ? 'Describe your tank first.' : '请先描述一下你的鱼缸。' });
  }

  const compactContext = JSON.stringify({
    locale,
    userDescription,
    aquariumSnapshot,
    existingReminders,
    ruleFacts,
    missingInformation,
  }, null, 2).slice(0, 16000);

  const system = isEn
    ? [
      'You are AquaGuide Care Plan Copilot.',
      'Your job is to turn partial aquarium information into a useful provisional care plan without forcing the user to complete every field first.',
      'Treat aquariumSnapshot, ruleFacts, and existingReminders as factual inputs. Treat userDescription as user-provided information, not verified measurements.',
      'Never override explicit ruleFacts or safety constraints. Never invent a measured water value, livestock species, tank volume, equipment, or completed action.',
      'Missing information must reduce confidence, not block the plan. Always produce useful actions from known facts first, then ask exactly one highest-value follow-up question if needed.',
      'When volume, species, cycling status, or water parameters are unknown, avoid exact dosing, exact feeding quantities, exact stocking numbers, or confident disease claims.',
      'Do not diagnose disease and do not prescribe medication. For urgent warning signs, prioritize checking water quality, temperature, oxygenation, recent changes, and qualified help when appropriate.',
      'Return valid JSON only. No Markdown.',
    ].join('\n')
    : [
      '你是 AquaGuide 的 AI 养护计划 Copilot。',
      '你的任务是把不完整的鱼缸信息整理成一份有用的暂定养护计划，而不是要求用户先把所有字段填完。',
      'aquariumSnapshot、ruleFacts、existingReminders 是事实输入；userDescription 是用户自述信息，不等于已经检测验证的数据。',
      '不得覆盖 ruleFacts 或明确安全约束；不得编造水质检测值、生物种类、鱼缸容量、设备或已经完成的动作。',
      '信息缺失只能降低置信度，不能阻止生成计划。必须先根据已知事实给出能做的行动；如果还需要信息，只追问一个最有价值的问题。',
      '当容量、鱼种、开缸阶段或水质参数未知时，不要给精确药量、精确投喂量、精确加鱼数量，也不要下确定疾病结论。',
      '不能诊断疾病，不能自动给用药处方。遇到紧急异常，应优先建议检查水质、温度、溶氧、近期变化，并在必要时寻求专业帮助。',
      '只返回合法 JSON，不要 Markdown，不要代码块。',
    ].join('\n');

  const schemaExample = {
    confidence: 'provisional | personalized',
    summary: isEn ? 'One sentence explaining the current plan.' : '一句话说明当前计划。',
    knownFacts: [isEn ? '30 L freshwater tank (stored fact)' : '30L 淡水缸（已保存事实）'],
    tasks: [
      {
        id: 'check-water',
        when: 'today | this_week | ongoing | watch',
        title: isEn ? 'Check ammonia and nitrite' : '检查氨和亚硝酸盐',
        detail: isEn ? 'What to do, without inventing a measurement.' : '具体怎么做，但不能编造检测结果。',
        why: isEn ? 'Why this is prioritized.' : '为什么优先做这件事。',
        evidence: [isEn ? 'User says the tank is two weeks old' : '用户自述开缸约两周'],
        confidence: 'low | medium | high',
      },
    ],
    unknowns: [isEn ? 'Ammonia value is unknown' : '氨检测值未知'],
    nextQuestion: isEn ? 'Ask exactly one highest-value question.' : '只追问一个最有价值的问题。',
  };

  const user = [
    isEn ? 'Create a progressive aquarium care plan from this context.' : '请基于下面信息生成渐进式鱼缸养护计划。',
    isEn ? 'Return exactly this JSON shape:' : '必须返回这个 JSON 结构：',
    JSON.stringify(schemaExample, null, 2),
    '',
    'context:',
    compactContext,
  ].join('\n');

  try {
    const upstream = await fetchWithTimeout(`${aiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        max_tokens: 1300,
        stream: false,
        thinking: { type: 'disabled' },
      }),
    });

    const responseText = await upstream.text();
    if (!upstream.ok) {
      return res.status(502).json({
        ok: false,
        error: `AI request failed: ${responseText.slice(0, 260)}`,
        failureReason: upstream.status === 429 ? 'rate_limited' : 'provider_error',
      });
    }

    const payload = JSON.parse(responseText);
    const content = payload?.choices?.[0]?.message?.content || '';
    const parsed = parseJsonObject(content);
    const plan = normalizePlan(parsed, locale);

    return res.status(200).json({
      ok: true,
      task: 'care_plan_personalization',
      source: 'rules_plus_ai',
      model: payload?.model || aiModel,
      generatedAt: new Date().toISOString(),
      data: plan,
    });
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    console.error('AquaGuide care plan AI error:', error);
    return res.status(timedOut ? 504 : 500).json({
      ok: false,
      error: timedOut ? 'AI request timed out' : 'AI care plan generation failed',
      failureReason: timedOut ? 'timeout' : 'unknown',
    });
  }
}
