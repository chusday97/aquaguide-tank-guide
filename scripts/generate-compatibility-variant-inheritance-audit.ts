import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCompatibilityVariantInheritanceAudit } from '../src/services/compatibility/compatibility-variant-inheritance-audit.service';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'docs/compatibility_variant_inheritance_audit.json');
mkdirSync(dirname(out), { recursive: true });
const audit = buildCompatibilityVariantInheritanceAudit();
writeFileSync(out, JSON.stringify(audit, null, 2) + '\n');
console.log(JSON.stringify(audit.summary, null, 2));
