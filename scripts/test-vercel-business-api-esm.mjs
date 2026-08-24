import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { readdirSync, statSync } from 'node:fs';
import ts from 'typescript';

const root = process.cwd();
const roots = ['apps/api/src', 'packages/contracts/src', 'packages/domain-rules/src'];
const files = ['api/v1/[...path].ts'];

const walk = dir => {
  for (const name of readdirSync(join(root, dir))) {
    const path = join(dir, name);
    const stat = statSync(join(root, path));
    if (stat.isDirectory()) walk(path);
    else if (path.endsWith('.ts')) files.push(path);
  }
};
for (const dir of roots) walk(dir);

const runtimeExtensions = /\.(?:js|mjs|cjs|json|node)$/;
const violations = [];
for (const file of files) {
  const source = readFileSync(join(root, file), 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const inspectSpecifier = (node, specifier, typeOnly = false) => {
    if (typeOnly || !specifier.startsWith('.')) return;
    if (!runtimeExtensions.test(specifier)) {
      violations.push(`${relative(root, join(root, file))}: ${specifier}`);
    }
  };

  for (const statement of sf.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      inspectSpecifier(statement, statement.moduleSpecifier.text, statement.importClause?.isTypeOnly === true);
    }
    if (ts.isExportDeclaration(statement) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
      inspectSpecifier(statement, statement.moduleSpecifier.text, statement.isTypeOnly === true);
    }
  }
}

assert.deepEqual(
  violations,
  [],
  `Vercel business API runtime imports must use explicit deployed extensions:\n${violations.join('\n')}`,
);
console.log(`Vercel business API ESM contract PASS (${files.length} TS files)`);
