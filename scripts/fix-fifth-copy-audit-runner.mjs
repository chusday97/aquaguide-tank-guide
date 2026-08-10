import { readFileSync, writeFileSync } from 'node:fs';

const path = 'scripts/apply-fifth-copy-audit.mjs';
const lines = readFileSync(path, 'utf8').split('\n');
const patternIndex = lines.findIndex(line => line.includes('const pattern = new RegExp'));
const replaceIndex = lines.findIndex(line => line.includes('block = block.replace(pattern'));
if (patternIndex < 0 || replaceIndex < 0) throw new Error('Could not patch replacement helper');
lines[patternIndex] = "  const pattern = new RegExp(`(\\\\n\\\\s{8}${key}:\\\\s*)[^\\\\n]*,`);";
lines[replaceIndex] = "  block = block.replace(pattern, `$1${quote(value)},`);";
writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Patched fifth audit helper to replace complete i18n lines.');
