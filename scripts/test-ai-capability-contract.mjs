import assert from 'node:assert/strict';
import vercelHealth from '../api/health.js';
import { onRequestGet as pagesHealth } from '../functions/api/health.js';

const runVercelHealth = async (env) => {
  const previous = { AI_API_KEY: process.env.AI_API_KEY, DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY, VISION_API_KEY: process.env.VISION_API_KEY, VISION_BASE_URL: process.env.VISION_BASE_URL, VISION_MODEL: process.env.VISION_MODEL };
  Object.assign(process.env, env);
  let payload;
  vercelHealth({ method: 'GET' }, { status: () => ({ json: body => { payload = body; } }), setHeader: () => {} });
  Object.assign(process.env, previous);
  return payload;
};

const placeholder = await runVercelHealth({ AI_API_KEY: 'MY_AI_API_KEY', DEEPSEEK_API_KEY: '', VISION_API_KEY: '', VISION_BASE_URL: '', VISION_MODEL: '' });
assert.equal(placeholder.text.configured, false, 'placeholder keys must not appear configured');
assert.equal(placeholder.vision.mode, 'manual_confirmation');

const textOnly = await runVercelHealth({ AI_API_KEY: 'test-key', DEEPSEEK_API_KEY: '', VISION_API_KEY: '', VISION_BASE_URL: '', VISION_MODEL: '' });
assert.equal(textOnly.text.configured, true);
assert.equal(textOnly.vision.configured, false);

const pagesResponse = await pagesHealth({ env: { AI_API_KEY: 'test-key', VISION_API_KEY: 'vision-key', VISION_BASE_URL: 'https://vision.example', VISION_MODEL: 'vision-model' } });
const pagesPayload = await pagesResponse.json();
assert.equal(pagesPayload.text.configured, true);
assert.deepEqual(pagesPayload.vision, { configured: true, mode: 'model' });

console.log('AI capability contract passed');
