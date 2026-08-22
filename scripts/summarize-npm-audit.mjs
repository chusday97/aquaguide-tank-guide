#!/usr/bin/env node

import fs from 'node:fs';

const [prodPath, allPath] = process.argv.slice(2);

if (!prodPath || !allPath) {
  console.error('Usage: node scripts/summarize-npm-audit.mjs <prod-audit.json> <all-audit.json>');
  process.exit(2);
}

function readAudit(path) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    console.error(`Failed to read audit JSON from ${path}:`, error.message);
    process.exit(2);
  }

  if (!parsed || parsed.auditReportVersion !== 2 || typeof parsed.vulnerabilities !== 'object') {
    console.error(`Unsupported npm audit payload in ${path}.`);
    process.exit(2);
  }

  return parsed;
}

function normalizeFix(fixAvailable) {
  if (fixAvailable === false || fixAvailable == null) return 'none';
  if (fixAvailable === true) return 'available';
  if (typeof fixAvailable === 'object') {
    const major = fixAvailable.isSemVerMajor ? ' major' : '';
    return `${fixAvailable.name ?? 'package'}@${fixAvailable.version ?? '?'}${major}`;
  }
  return String(fixAvailable);
}

function advisoryIds(via) {
  return (via ?? [])
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => entry.source ?? entry.url ?? entry.title)
    .filter(Boolean);
}

function summarize(report) {
  const rows = Object.values(report.vulnerabilities ?? {})
    .map((vuln) => ({
      name: vuln.name,
      severity: vuln.severity,
      direct: Boolean(vuln.isDirect),
      range: vuln.range,
      fix: normalizeFix(vuln.fixAvailable),
      effects: vuln.effects ?? [],
      nodes: vuln.nodes ?? [],
      viaPackages: (vuln.via ?? []).filter((entry) => typeof entry === 'string'),
      advisories: advisoryIds(vuln.via),
    }))
    .sort((a, b) => {
      const weight = { critical: 4, high: 3, moderate: 2, low: 1, info: 0 };
      return (weight[b.severity] ?? -1) - (weight[a.severity] ?? -1) || a.name.localeCompare(b.name);
    });

  return {
    metadata: report.metadata?.vulnerabilities ?? {},
    rows,
  };
}

const prod = summarize(readAudit(prodPath));
const all = summarize(readAudit(allPath));
const prodNames = new Set(prod.rows.map((row) => row.name));

console.log('=== AquaGuide dependency release-baseline audit ===');
console.log('Production audit counts:', JSON.stringify(prod.metadata));
console.log('Full audit counts:', JSON.stringify(all.metadata));
console.log('');

console.log('--- Production dependency findings ---');
if (prod.rows.length === 0) {
  console.log('No production dependency findings.');
}
for (const row of prod.rows) {
  console.log(JSON.stringify(row));
}

console.log('');
console.log('--- Dev-only / omitted-from-production findings ---');
const devOnly = all.rows.filter((row) => !prodNames.has(row.name));
if (devOnly.length === 0) {
  console.log('No additional dev-only findings.');
}
for (const row of devOnly) {
  console.log(JSON.stringify(row));
}

const summary = {
  generatedAt: new Date().toISOString(),
  productionCounts: prod.metadata,
  fullCounts: all.metadata,
  production: prod.rows,
  devOnly,
};

fs.writeFileSync('dependency-audit-summary.json', `${JSON.stringify(summary, null, 2)}\n`);
