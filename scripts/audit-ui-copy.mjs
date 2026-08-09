import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOTS = ['src', 'public'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.html']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'responsive', 'species-image-overrides', 'species-display']);
const CONTENT_DATA_HINTS = [
  '/data/',
  'fishData',
  'careTopicsData',
  'localizeDataAuto',
  '/content/',
];

const patterns = {
  developer_annotation: /AQUAGUIDE_|TODO|FIXME|HACK|DEBUG|_V\d+\b|migration|one-time/i,
  internal_implementation_language: /当前规则|系统规则|本地规则|规则引擎|确定性规则|规则版本|数据版本|DeepSeek|模型回复|本地兜底|fallback|deterministic|rule\s*engine|ruleVersion|sourceLabel|AI INTERPRETATION|关系已检查|判断基线|source\s*[:：]/i,
  construction_or_meta: /功能建设中|建设中|COMING SOON|当前版本|未来.*开放|暂不开放|尚未闭环|开发中|Beta\b/i,
  defensive_or_uncertain: /无法安全确定|无法可靠判断|不会自动|不会替你|不会.*猜|请返回|暂时无法|目前无法|不应该由|只能|仅供|最终判断.*为准|以.*为准/i,
  instructional_overload: /只需要|这里会|系统会|请先|先.*再|点击.*后|选择至少|完善.*后|需要先|为了避免|使用前需要|继续选择|返回修改|重新计算/i,
  status_noise: /已检查|已确认|已读取|已生成|已选择|已完成|当前结论|当前状态|来源|生成时间|计算时间|数据来源/i,
};

function walk(dir, out = []) {
  let entries = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    let stat;
    try { stat = statSync(full); } catch { continue; }
    if (stat.isDirectory()) walk(full, out);
    else if (EXTENSIONS.has(extname(name))) out.push(full);
  }
  return out;
}

const files = ROOTS.flatMap(root => walk(root));
const findings = [];
const allChineseLines = [];

for (const file of files) {
  const rel = relative('.', file).replaceAll('\\\\', '/');
  const isContentData = CONTENT_DATA_HINTS.some(hint => rel.includes(hint));
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((raw, index) => {
    const text = raw.trim();
    if (!text) return;
    const hasChinese = /[\u3400-\u9fff]/.test(text);
    const looksLikeCopy = hasChinese || /['"`][^'"`]{8,}['"`]/.test(text);
    if (!looksLikeCopy) return;

    if (hasChinese) {
      allChineseLines.push({ file: rel, line: index + 1, text, contentData: isContentData });
    }

    const categories = Object.entries(patterns)
      .filter(([, pattern]) => pattern.test(text))
      .map(([name]) => name);
    if (categories.length === 0) return;

    findings.push({
      file: rel,
      line: index + 1,
      text,
      categories,
      contentData: isContentData,
      context: lines.slice(Math.max(0, index - 1), Math.min(lines.length, index + 2)).map(item => item.trim()),
    });
  });
}

const byCategory = {};
for (const finding of findings) {
  for (const category of finding.categories) byCategory[category] = (byCategory[category] || 0) + 1;
}

const byFile = {};
for (const finding of findings) byFile[finding.file] = (byFile[finding.file] || 0) + 1;

const report = {
  generatedAt: new Date().toISOString(),
  scannedFileCount: files.length,
  chineseLineCount: allChineseLines.length,
  suspiciousFindingCount: findings.length,
  byCategory,
  topFiles: Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 40),
  findings,
  allChineseLines,
};

writeFileSync('ui-copy-audit.json', JSON.stringify(report, null, 2));
console.log(`UI_COPY_AUDIT scanned=${files.length} chineseLines=${allChineseLines.length} suspicious=${findings.length}`);
console.log('UI_COPY_AUDIT categories=' + JSON.stringify(byCategory));
console.log('UI_COPY_AUDIT topFiles=' + JSON.stringify(report.topFiles.slice(0, 20)));
