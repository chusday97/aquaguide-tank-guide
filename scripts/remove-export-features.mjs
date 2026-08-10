import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const write = (path, content) => fs.writeFileSync(path, content);
const fail = (message) => { throw new Error(message); };

const replaceRequired = (path, from, to, min = 1) => {
  let content = read(path);
  const count = content.split(from).length - 1;
  if (count < min) fail(`${path}: expected at least ${min} occurrence(s) of ${JSON.stringify(from.slice(0, 80))}, found ${count}`);
  content = content.split(from).join(to);
  write(path, content);
};

const removeBetween = (path, startMarker, endMarker) => {
  let content = read(path);
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) fail(`${path}: unable to remove range between markers`);
  content = content.slice(0, start) + content.slice(end);
  write(path, content);
};

const scanBalancedCurlyEnd = (content, startIndex) => {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = startIndex; i < content.length; i += 1) {
    const ch = content[i];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
};

const removeConstFunction = (path, marker) => {
  let content = read(path);
  const start = content.indexOf(marker);
  if (start < 0) fail(`${path}: function marker not found: ${marker}`);
  const brace = content.indexOf('{', start + marker.length - 1);
  const endBrace = scanBalancedCurlyEnd(content, brace);
  if (brace < 0 || endBrace < 0) fail(`${path}: could not balance function: ${marker}`);
  let end = endBrace;
  while (content[end] === ';' || content[end] === '\r' || content[end] === '\n') end += 1;
  content = content.slice(0, start) + content.slice(end);
  write(path, content);
};

const removeBalancedExpression = (path, marker) => {
  let content = read(path);
  const start = content.indexOf(marker);
  if (start < 0) fail(`${path}: balanced expression marker not found: ${marker}`);
  const brace = content.indexOf('{', start);
  const endBrace = scanBalancedCurlyEnd(content, brace);
  if (brace < 0 || endBrace < 0) fail(`${path}: could not balance expression: ${marker}`);
  let end = endBrace;
  while (content[end] === '\r' || content[end] === '\n') end += 1;
  content = content.slice(0, start) + content.slice(end);
  write(path, content);
};

const removeButtonContaining = (path, needle) => {
  let content = read(path);
  let removed = 0;
  while (true) {
    const needleIndex = content.indexOf(needle);
    if (needleIndex < 0) break;
    const start = content.lastIndexOf('<button', needleIndex);
    const endTag = content.indexOf('</button>', needleIndex);
    if (start < 0 || endTag < 0) fail(`${path}: could not remove button containing ${needle}`);
    let end = endTag + '</button>'.length;
    while (content[end] === '\r' || content[end] === '\n') end += 1;
    content = content.slice(0, start) + content.slice(end);
    removed += 1;
  }
  write(path, content);
  return removed;
};

const removeJsxElement = (path, startMarker, closingTag) => {
  let content = read(path);
  const start = content.indexOf(startMarker);
  if (start < 0) fail(`${path}: JSX marker not found: ${startMarker}`);
  const endTag = content.indexOf(closingTag, start);
  if (endTag < 0) fail(`${path}: JSX closing tag not found: ${closingTag}`);
  let end = endTag + closingTag.length;
  while (content[end] === '\r' || content[end] === '\n') end += 1;
  content = content.slice(0, start) + content.slice(end);
  write(path, content);
};

// Feature registry: export is removed, not "building".
replaceRequired('src/config/features.ts',
  "export type FeatureKey = 'auth' | 'achievements' | 'imageExport' | 'sharing';",
  "export type FeatureKey = 'auth' | 'achievements' | 'sharing';");
replaceRequired('src/config/features.ts',
`  imageExport: {\n    status: 'building',\n    title: { zh: '图片导出', en: 'Image export' },\n    description: { zh: '将卡片保存为图片。', en: 'Save cards as images.' },\n  },\n`, '');
replaceRequired('src/config/features.ts',
  "  value === 'auth' || value === 'achievements' || value === 'imageExport' || value === 'sharing'",
  "  value === 'auth' || value === 'achievements' || value === 'sharing'");
replaceRequired('src/components/layout/WorkspaceNavigationProvider.tsx',
  "      else if (/image|export|download|导出|图片/i.test(feature)) showFeaturePreview('imageExport');\n",
  '');

// Status summary: remove score/plan export controls.
replaceRequired('src/components/product/StatusSummaryCard.tsx',
  "import { AlertTriangle, CalendarDays, Check, CheckCircle2, ChevronDown, Clock3, Download, Trash2 } from 'lucide-react';",
  "import { AlertTriangle, CalendarDays, Check, CheckCircle2, ChevronDown, Clock3, Trash2 } from 'lucide-react';");
replaceRequired('src/components/product/StatusSummaryCard.tsx', "  onDownloadHealth?: () => void;\n", '');
replaceRequired('src/components/product/StatusSummaryCard.tsx', "  onDownloadCarePlan?: () => void;\n", '');
replaceRequired('src/components/product/StatusSummaryCard.tsx', "  onDownloadHealth,\n", '');
replaceRequired('src/components/product/StatusSummaryCard.tsx', "  onDownloadCarePlan,\n", '');
removeBetween('src/components/product/StatusSummaryCard.tsx',
  '          {onDownloadHealth && (\n',
  '          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm">');
removeBetween('src/components/product/StatusSummaryCard.tsx',
  '            {onDownloadCarePlan && (\n',
  '            {hasOverflowCarePlans && (\n');
replaceRequired('src/components/product/StatusSummaryCard.tsx',
  "  const { t, i18n } = useTranslation();\n  const isEn = Boolean(i18n.language?.startsWith('en'));\n",
  "  const { t } = useTranslation();\n");

// Livestock panel: sharing stays building, export actions disappear.
replaceRequired('src/components/aquarium/LivestockRosterDialog.tsx',
  "import { Download, Share2, X } from 'lucide-react';",
  "import { Share2, X } from 'lucide-react';");
for (const line of [
  '  onDownloadArchive: () => void;\n',
  '  onDownloadMilestone?: () => void;\n',
  '  onCreateShare: () => void;\n',
  '  isCreatingShare?: boolean;\n',
  '  onDownloadArchive,\n',
  '  onDownloadMilestone,\n',
  '  onCreateShare,\n',
  '  isCreatingShare = false,\n',
]) replaceRequired('src/components/aquarium/LivestockRosterDialog.tsx', line, '');
removeBalancedExpression('src/components/aquarium/LivestockRosterDialog.tsx',
  '              {startedAtConfirmed && aquariumAgeDays >= 100 && onDownloadMilestone && (');
const livestockExportButtons = removeButtonContaining('src/components/aquarium/LivestockRosterDialog.tsx', "feature: 'image-export'");
if (livestockExportButtons < 1) fail('LivestockRosterDialog: expected at least one export button');

// Species detail: remove image/print card export implementation and UI.
replaceRequired('src/components/SpeciesDetailDialog.tsx',
  'import { AlertTriangle, Box, Calculator, CheckCircle2, ChevronLeft, ChevronRight, Download, Flame, Heart, HeartOff, Info, Printer, Share2, Skull, SlidersHorizontal, Thermometer, Waves, X } from \'lucide-react\';',
  'import { AlertTriangle, Box, Calculator, CheckCircle2, ChevronLeft, ChevronRight, Flame, Heart, HeartOff, Info, Share2, Skull, SlidersHorizontal, Thermometer, Waves, X } from \'lucide-react\';');
for (const line of [
  "  const [isExportOpen, setIsExportOpen] = useState(false);\n",
  "  const [isExportingCard, setIsExportingCard] = useState(false);\n",
  "  const [exportError, setExportError] = useState('');\n",
  "  const exportCardRef = useRef<HTMLDivElement | null>(null);\n",
]) replaceRequired('src/components/SpeciesDetailDialog.tsx', line, '');
removeBetween('src/components/SpeciesDetailDialog.tsx',
  '  const renderExportCard = async () => {',
  '  const handleRecordDeath = async () => {');
const speciesExportButtons = removeButtonContaining('src/components/SpeciesDetailDialog.tsx', "feature: 'image-export'");
if (speciesExportButtons < 1) fail('SpeciesDetailDialog: expected export button(s)');
removeBalancedExpression('src/components/SpeciesDetailDialog.tsx', '      {isExportOpen && (');

// Care page: remove image saving implementation. Sharing/copy remains gated as a separate future feature.
replaceRequired('src/pages/CareEncyclopedia.tsx',
  "import type { CSSProperties, ReactNode, RefObject } from 'react';",
  "import type { CSSProperties, ReactNode } from 'react';");
replaceRequired('src/pages/CareEncyclopedia.tsx',
  'import { AlertTriangle, Baby, Check, ChevronDown, ChevronRight, Copy, Download, Droplets, ExternalLink, Fish, Heart, HelpCircle, Loader2, Maximize2, Search, Settings, Stethoscope, Waves } from \'lucide-react\';',
  'import { AlertTriangle, Baby, Check, ChevronDown, ChevronRight, Copy, Droplets, ExternalLink, Fish, Heart, HelpCircle, Loader2, Maximize2, Search, Settings, Stethoscope, Waves } from \'lucide-react\';');
for (const line of [
  "  const [isSavingShareCard, setIsSavingShareCard] = useState(false);\n",
  "  const [shareMessage, setShareMessage] = useState('');\n",
  "  const careCardRef = useRef<HTMLDivElement | null>(null);\n",
]) replaceRequired('src/pages/CareEncyclopedia.tsx', line, '');
removeConstFunction('src/pages/CareEncyclopedia.tsx', '  const saveShareCard = async (topic: CareTopic) => {');
replaceRequired('src/pages/CareEncyclopedia.tsx', "          setShareMessage('');\n", '');
replaceRequired('src/pages/CareEncyclopedia.tsx', '<CareShareCardPreview topic={shareTopic} cardRef={careCardRef} />', '<CareShareCardPreview topic={shareTopic} />');
replaceRequired('src/pages/CareEncyclopedia.tsx', '(shareMessage || copyMessage)', 'copyMessage');
replaceRequired('src/pages/CareEncyclopedia.tsx', '{shareMessage || copyMessage}', '{copyMessage}');
replaceRequired('src/pages/CareEncyclopedia.tsx',
`function CareShareCardPreview({\n  topic,\n  cardRef,\n}: {\n  topic: CareTopic;\n  cardRef: RefObject<HTMLDivElement | null>;\n}) {`,
`function CareShareCardPreview({ topic }: { topic: CareTopic }) {`);
replaceRequired('src/pages/CareEncyclopedia.tsx', '      ref={cardRef}\n', '');
const careExportButtons = removeButtonContaining('src/pages/CareEncyclopedia.tsx', "feature: 'image-export'");
if (careExportButtons < 1) fail('CareEncyclopedia: expected image export button');

// Aquarium main page: remove export center, artifact generation, diagnosis/card export entry points, and dead share creation coupled to export center.
replaceRequired('src/pages/Aquarium.tsx', ', CheckCircle2, Download, MoreHorizontal', ', CheckCircle2, MoreHorizontal');
replaceRequired('src/pages/Aquarium.tsx', '  exportLocalAppState,\n', '');
replaceRequired('src/pages/Aquarium.tsx', "import { ExportArtifactDialog, type ExportArtifactContent } from '../components/export/ExportArtifactDialog';\n", '');
replaceRequired('src/pages/Aquarium.tsx', "import { AquariumExportCenter, type ExportCenterItem } from '../components/export/AquariumExportCenter';\n", '');
removeBetween('src/pages/Aquarium.tsx',
  "import {\n  buildAquariumArchiveArtifact,",
  "import { createAquariumShareReport } from '../services/share/aquarium-share-report.service';\n");
replaceRequired('src/pages/Aquarium.tsx', "import { createAquariumShareReport } from '../services/share/aquarium-share-report.service';\n", '');
replaceRequired('src/pages/Aquarium.tsx', "import { AquaGuideApiError } from '../services/api/api-client';\n", '');
for (const line of [
  '  const [exportArtifact, setExportArtifact] = useState<ExportArtifactContent | null>(null);\n',
  '  const [isCreatingShare, setIsCreatingShare] = useState(false);\n',
  "  const [shareUrl, setShareUrl] = useState('');\n",
]) replaceRequired('src/pages/Aquarium.tsx', line, '');
removeConstFunction('src/pages/Aquarium.tsx', '  const handleExportLocalData = () => {');
removeBetween('src/pages/Aquarium.tsx',
  '  const artifactHealthStatus = isEn\n',
  '  const confirmAquariumStartedAt = async (startedAt: string) => {');
removeConstFunction('src/pages/Aquarium.tsx', '  const createPrivateShare = async () => {');

// Remove the direct ?action=exports surface.
{
  const path = 'src/pages/Aquarium.tsx';
  let content = read(path);
  const startMarker = "  const isExportCenterOpen = new URLSearchParams(routeLocation.search).get('action') === 'exports';\n";
  const start = content.indexOf(startMarker);
  const ifStart = content.indexOf('  if (isExportCenterOpen) {', start);
  if (start < 0 || ifStart < 0) fail('Aquarium: export center branch not found');
  const brace = content.indexOf('{', ifStart);
  const endBrace = scanBalancedCurlyEnd(content, brace);
  if (endBrace < 0) fail('Aquarium: export center branch could not be balanced');
  let end = endBrace;
  while (content[end] === '\r' || content[end] === '\n') end += 1;
  content = content.slice(0, start) + content.slice(end);
  write(path, content);
}
for (const line of [
  "          onDownloadHealth={() => openExportArtifact(buildHealthScoreArtifact(artifactContext))}\n",
  "          onDownloadCarePlan={() => openExportArtifact(buildWeeklyCareArtifact(artifactContext))}\n",
  "        onDownloadArchive={() => openExportArtifact(buildAquariumArchiveArtifact(artifactContext))}\n",
  "        onCreateShare={() => void createPrivateShare()}\n",
  "        isCreatingShare={isCreatingShare}\n",
]) replaceRequired('src/pages/Aquarium.tsx', line, '');
// Multi-line milestone prop.
removeBetween('src/pages/Aquarium.tsx',
  '        onDownloadMilestone={aquariumAgeDays >= 100 && activeAquarium.startedAtConfirmedAt\n',
  '        onCreateShare={() => void createPrivateShare()}\n');
// onCreateShare line was consumed by the range above, so remove the remaining creating-share prop if still present.
{
  let content = read('src/pages/Aquarium.tsx');
  content = content.replace('        isCreatingShare={isCreatingShare}\n', '');
  write('src/pages/Aquarium.tsx', content);
}
const aquariumExportButtons = removeButtonContaining('src/pages/Aquarium.tsx', 'openExportArtifact(');
if (aquariumExportButtons < 1) fail('Aquarium: expected diagnosis export button');
// Remove any rendered export dialog and now-dead share result dialog.
{
  let content = read('src/pages/Aquarium.tsx');
  content = content.replace(/\n\s*<ExportArtifactDialog[\s\S]*?\/>(?=\n)/g, '\n');
  write('src/pages/Aquarium.tsx', content);
}
removeJsxElement('src/pages/Aquarium.tsx', '      <Dialog open={Boolean(shareUrl)}', '</Dialog>');

// Local storage export API itself is removed. Import/restore may remain independently.
replaceRequired('src/services/storage/local-app-state.ts',
  'export const exportLocalAppState = () => JSON.stringify(loadAppStateFromStorage(), null, 2);\n\n',
  '');

// Export-specific files/tests are removed entirely.
for (const target of [
  'src/components/export',
  'src/services/export',
  'scripts/test-aquarium-artifacts.ts',
]) fs.rmSync(target, { recursive: true, force: true });

// Share contract is about privacy/sanitization, not PNG filename export behavior.
replaceRequired('scripts/test-share-report-contract.ts', "import { safeExportFileName } from '../src/services/export/png-export.service';\n", '');
replaceRequired('scripts/test-share-report-contract.ts', "assert.equal(safeExportFileName('AquaGuide-客厅/主缸:*?.png'), 'AquaGuide-客厅-主缸-.png');\n", '');
replaceRequired('scripts/test-share-report-contract.ts', "assert.equal(safeExportFileName('  '), 'AquaGuide-export.png');\n\n", '');

// Package surface: remove export test and html2canvas dependency; add a regression guard.
{
  const pkg = JSON.parse(read('package.json'));
  delete pkg.scripts['test:aquarium-artifacts'];
  pkg.scripts['test:no-export-features'] = 'node scripts/verify-no-export-features.mjs';
  delete pkg.dependencies.html2canvas;
  write('package.json', JSON.stringify(pkg, null, 2) + '\n');
}

write('scripts/verify-no-export-features.mjs', `import fs from 'node:fs';\nimport path from 'node:path';\n\nconst roots = ['src', 'scripts', 'package.json', 'HANDOFF.md'];\nconst forbidden = [\n  'imageExport',\n  "feature: 'image-export'",\n  'AquariumExportCenter',\n  'ExportArtifactDialog',\n  'openExportArtifact',\n  'buildHealthScoreArtifact',\n  'buildDiagnosisArtifact',\n  'buildWeeklyCareArtifact',\n  'buildAquariumArchiveArtifact',\n  'buildHundredDayArtifact',\n  'buildStarterChecklistArtifact',\n  'exportLocalAppState',\n  'html2canvas',\n  '下载诊断结果图',\n  '导出评分',\n  '导出计划',\n  '导出 · 建设中',\n  '保存图片 · 建设中',\n  'Print card',\n  'Export species card',\n];\nconst files = [];\nconst walk = (target) => {\n  if (!fs.existsSync(target)) return;\n  const stat = fs.statSync(target);\n  if (stat.isDirectory()) {\n    for (const name of fs.readdirSync(target)) walk(path.join(target, name));\n  } else if (/\\.(ts|tsx|js|mjs|json|md)$/.test(target) || target === 'package.json') files.push(target);\n};\nroots.forEach(walk);\nconst failures = [];\nfor (const file of files) {\n  const text = fs.readFileSync(file, 'utf8');\n  for (const token of forbidden) if (text.includes(token)) failures.push(file + ': ' + token);\n}\nfor (const deletedPath of ['src/components/export', 'src/services/export', 'scripts/test-aquarium-artifacts.ts']) {\n  if (fs.existsSync(deletedPath)) failures.push('still exists: ' + deletedPath);\n}\nconst pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));\nif (pkg.dependencies?.html2canvas) failures.push('html2canvas dependency still present');\nif (pkg.scripts?.['test:aquarium-artifacts']) failures.push('test:aquarium-artifacts script still present');\nif (failures.length) {\n  console.error('Export removal regression failed:');\n  failures.forEach(item => console.error('- ' + item));\n  process.exit(1);\n}\nconsole.log('No export product surfaces remain.');\n`);

// Handoff becomes the source of truth: export is removed, sharing remains building.
replaceRequired('HANDOFF.md',
  '- 当前建设中功能统一为：云端同步/登录、成就勋章、图片导出、分享与隐私。建设中是显式 feature state，不能再依靠按钮文字或 DOM 正则猜测。',
  '- 当前建设中功能统一为：云端同步/登录、成就勋章、分享与隐私。图片、卡片、打印、报告及本地数据导出已从当前产品移除，不再作为建设中入口展示。建设中是显式 feature state，不能再依靠按钮文字或 DOM 正则猜测。');
replaceRequired('HANDOFF.md',
  '- 分享/导出在转 live 之前不得保留 icon-only 绕过入口，不得一边在 Settings 标注建设中、一边仍调用 navigator.share/clipboard/PNG/print。',
  '- 分享在转 live 之前不得保留 icon-only 绕过入口，不得一边在 Settings 标注建设中、一边仍调用 navigator.share/clipboard。\n- 2026-08-10 产品范围收缩：移除全部导出入口、导出中心、物种/诊断/评分/养护计划/纪念卡导出、PNG/打印实现和本地数据导出 API；分享仍保持 building。');

console.log('Export feature removal migration applied.');
