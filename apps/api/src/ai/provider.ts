import { apiConfig } from '../config';

export type ProviderFailureReason = 'not_configured' | 'timeout' | 'network' | 'invalid_response';

export class ProviderError extends Error {
  constructor(
    public readonly reason: ProviderFailureReason,
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
  }
}

const cleanJsonText = (value: string) => {
  const cleaned = value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  const firstObject = cleaned.indexOf('{');
  const lastObject = cleaned.lastIndexOf('}');
  return firstObject >= 0 && lastObject > firstObject
    ? cleaned.slice(firstObject, lastObject + 1)
    : cleaned;
};

const fetchJsonResponse = async (
  baseUrl: string,
  apiKey: string,
  model: string,
  timeoutMs: number,
  body: Record<string, unknown>,
) => {
  if (!apiKey || !baseUrl || !model) throw new ProviderError('not_configured', 'AI provider is not configured.');
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, ...body }),
        signal: controller.signal,
      });
      if (!response.ok) {
        if (attempt === 0 && (response.status === 429 || response.status >= 500)) continue;
        throw new ProviderError('network', `Provider returned HTTP ${response.status}.`, response.status);
      }
      const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
      const content = payload.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || !content.trim()) throw new ProviderError('invalid_response', 'Provider response did not contain text.');
      try {
        return JSON.parse(cleanJsonText(content)) as unknown;
      } catch {
        throw new ProviderError('invalid_response', 'Provider response was not valid JSON.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new ProviderError('timeout', 'Provider request timed out.');
      } else if (error instanceof ProviderError) {
        lastError = error;
      } else {
        lastError = new ProviderError('network', 'Provider request failed.');
      }
      if (attempt === 1) throw lastError;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError instanceof Error ? lastError : new ProviderError('network', 'Provider request failed.');
};

const supportsVisionJsonMode = (model: string) => /^glm-4\.6v/i.test(model);

const visionRequestBody = (imageDataUrl: string, locale: 'zh-CN' | 'en', model: string, catalogOptions: string) => ({
  stream: false,
  temperature: 0,
  max_tokens: 700,
  ...(supportsVisionJsonMode(model) ? { response_format: { type: 'json_object' as const } } : {}),
  messages: [
    {
      role: 'system',
      content: [
        'Return exactly one JSON object and nothing else.',
        'Inspect only the supplied image pixels.',
        'You are doing closed-set recognition against AQUA_CATALOG, not open-ended species naming.',
        'Every candidate MUST use a catalogKey that appears verbatim in AQUA_CATALOG. Never invent a catalogKey or species outside the catalog.',
        'Copy commonName and scientificName from the selected catalog row; if no catalog row is visually supportable, return an empty candidates array.',
        'Use high confidence only when visible diagnostic features strongly support one catalog identity; otherwise use medium or low.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: (locale === 'en'
            ? 'Choose only from AQUA_CATALOG. Return JSON only: {"candidates":[{"catalogKey":"sp_0000","commonName":"exact catalog name","scientificName":"exact catalog scientific name","confidenceBand":"high|medium|low","visualEvidence":["visible feature"]}]}. Return at most 3 catalog candidates. If the image does not support any listed identity, return {"candidates":[]}. Closely related species, cultivars, variants, blurry images, or multiple subjects must remain medium/low confidence and may return multiple alternatives. Do not diagnose health.'
            : '只能从 AQUA_CATALOG 中选择。只返回 JSON：{"candidates":[{"catalogKey":"sp_0000","commonName":"目录中的准确名称","scientificName":"目录中的准确学名","confidenceBand":"high|medium|low","visualEvidence":["可见特征"]}]}。最多返回 3 个目录候选；若图片不足以支持任何目录物种，返回 {"candidates":[]}。近缘种、品系/变种、图片模糊或多主体时必须降低置信度，并可返回多个备选。不要判断健康或疾病。')
            + `\n\nAQUA_CATALOG (catalogKey|commonName|scientificName|category):\n${catalogOptions}`,
        },
        { type: 'image_url', image_url: { url: imageDataUrl } },
      ],
    },
  ],
});

const shouldUseVisionFallback = (error: unknown) => (
  error instanceof ProviderError
  && (
    error.reason === 'timeout'
    || error.statusCode === 429
    || (typeof error.statusCode === 'number' && error.statusCode >= 500)
    || error.reason === 'invalid_response'
  )
);

export const requestVisionCandidates = async (imageDataUrl: string, locale: 'zh-CN' | 'en', catalogOptions = '') => {
  try {
    const payload = await fetchJsonResponse(
      apiConfig.visionBaseUrl,
      apiConfig.visionApiKey,
      apiConfig.visionModel,
      apiConfig.visionTimeoutMs,
      visionRequestBody(imageDataUrl, locale, apiConfig.visionModel, catalogOptions),
    );
    return { payload, modelName: apiConfig.visionModel };
  } catch (error) {
    const fallbackModel = apiConfig.visionFallbackModel;
    if (!fallbackModel || fallbackModel === apiConfig.visionModel || !shouldUseVisionFallback(error)) throw error;
    const payload = await fetchJsonResponse(
      apiConfig.visionBaseUrl,
      apiConfig.visionApiKey,
      fallbackModel,
      apiConfig.visionTimeoutMs,
      visionRequestBody(imageDataUrl, locale, fallbackModel, catalogOptions),
    );
    return { payload, modelName: fallbackModel };
  }
};

export const requestSymptomObservations = (context: Record<string, unknown>) => fetchJsonResponse(
  apiConfig.aiBaseUrl,
  apiConfig.aiApiKey,
  apiConfig.aiModel,
  apiConfig.aiTimeoutMs,
  {
    temperature: 0,
    max_tokens: 500,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: [
          'You extract aquarium observations into controlled codes. You do not diagnose, rank causes, set urgency, recommend medicine, or invent observations.',
          'Allowed codes: scope, breathing, posture, recent_change, external_signs, activity, feeding.',
          'Return JSON only: {"observations":[{"code":"","value":"","evidence":""}]}.',
        ].join(' '),
      },
      { role: 'user', content: JSON.stringify(context).slice(0, 7000) },
    ],
  },
);
