import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type AssetRecord = {
  id: string;
  sourceKind: 'project-owned' | 'user-owned';
  sourcePath: string;
  width: number;
  height: number;
  sha256: string;
  usages: Array<{
    purpose: 'hero' | 'variant-card';
    maxCssWidth: number;
    status: 'needs_review' | 'approved' | 'blocked';
    confirmedBy: string | null;
    confirmedAt: string | null;
  }>;
  review: { conclusion: string };
};

const root = process.cwd();
const manifest = JSON.parse(await readFile(resolve(root, 'docs/species-seo-asset-source-manifest.json'), 'utf8')) as {
  policy: { sourceKinds: string[] };
  assets: AssetRecord[];
};

const hashFile = async (path: string) => createHash('sha256').update(await readFile(resolve(root, path))).digest('hex');

for (const asset of manifest.assets) {
  assert.ok(manifest.policy.sourceKinds.includes(asset.sourceKind), `${asset.id} has an unapproved source kind`);
  assert.equal(await hashFile(asset.sourcePath), asset.sha256, `${asset.id} source hash changed`);
  assert.equal(asset.review.conclusion, 'approved', `${asset.id} must record the confirmed review conclusion`);
  for (const usage of asset.usages) {
    assert.equal(usage.status, 'approved', `${asset.id} ${usage.purpose} must record the confirmed usage status`);
    assert.equal(usage.confirmedBy, 'project-owner');
    assert.equal(usage.confirmedAt, '2026-09-01');
    assert.ok(usage.maxCssWidth * 2 <= asset.width, `${asset.id} ${usage.purpose} exceeds 2x-safe CSS width`);
  }
}

console.log('SEO asset candidates passed: project-owned sources, hashes, 2x-safe display widths and fail-closed human-review gates are verified.');
