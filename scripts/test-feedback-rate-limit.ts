import assert from 'node:assert/strict';
import { FeedbackRateLimiter } from '../apps/api/src/feedback-rate-limit';

const limiter = new FeedbackRateLimiter({
  windowMs: 1_000,
  maxSubmissions: 2,
  maxKeys: 2,
});

assert.equal(limiter.check('user-a', 0), true);
assert.equal(limiter.check('user-a', 100), true);
assert.equal(limiter.check('user-a', 200), false);
assert.equal(limiter.check('user-b', 200), true);
assert.equal(limiter.check('user-a', 1_001), true, 'expired submissions must not block a new window');
assert.equal(limiter.check('user-c', 1_002), true, 'a bounded limiter must continue accepting new keys');
assert.equal(limiter.check('user-b', 1_003), true, 'evicted or expired keys must start a fresh window');

console.log('feedback rate limiter verified: isolation, limits, expiry and bounded capacity');
