import assert from 'node:assert/strict';
import fs from 'node:fs';

const shell = fs.readFileSync('src/styles/ui-v2-shell.css', 'utf8');

assert.equal(
  /\.phone-shell-active\s+header(?!\[data-shell="mobile-header"\])(?:\s|\{|:)/.test(shell),
  false,
  'mobile shell CSS must not style arbitrary page headers',
);
assert.ok(
  shell.includes('.phone-shell-active header[data-shell="mobile-header"]'),
  'mobile shell header styles must be scoped to data-shell="mobile-header"',
);

console.log('Mobile shell header scope contract PASS');
