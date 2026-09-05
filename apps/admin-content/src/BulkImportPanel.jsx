import { useMemo, useRef, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { useAppLanguage } from './AppLanguage.jsx';
import { speciesGroupByMemberId } from './speciesGroups.js';
import { buildSpeciesSeoRouteMeta, INDEX_STRATEGIES } from './seoRouteContract.js';
import { getResolvedDuplicateSeoPolicy } from './publishReadiness.js';
import { defaultGroupSeoForLocale } from './seoInheritance.js';
import { emitAdminNotice } from './AdminNoticeViewport.jsx';
import { inspectSourceIdentity } from './sourceIdentity.js';

const FIELDS = [
  'import_action', 'catalog_key', 'source_name', 'scientific_name', 'locale', 'localized_name',
  'seo_title', 'meta_description', 'h1', 'intro', 'image_alt', 'focus_keyword', 'index_strategy', 'canonical_catalog_key',
];
const EDITABLE = ['localized_name', 'seo_title', 'meta_description', 'h1', 'intro', 'image_alt', 'focus_keyword', 'index_strategy', 'canonical_catalog_key'];
const FIELD_LABELS = { localized_name: 'English name', seo_title: 'SEO Title', meta_description: 'Meta Description', h1: 'H1', intro: 'Intro', image_alt: 'Image Alt', focus_keyword: 'Focus Keyword', index_strategy: 'Index strategy', canonical_catalog_key: 'Canonical target' };
const normalizeComparable = (value) => String(value ?? '').trim();
const VALID_ACTIONS = new Set(['update', '更新', 'yes', '1']);
const VALID_STRATEGIES = new Set(INDEX_STRATEGIES.map((item) => item.value));

const TEMPLATE_GUIDE = {
  import_action: '填写说明：只有真正要导入的内容行填写 update / 更新；说明、空白、示例行保持其他文字或留空，不会导入',
  catalog_key: '必填：已有物种 ID，例如 sp_0436；必须与 AquaGuide 目录一致',
  source_name: '参考字段：中文名称，可留空；上传时不会写回源数据',
  scientific_name: '参考字段：完整学名，可留空；源记录学名不完整时系统会阻止导入',
  locale: '必填：zh-CN 或 en；必须与当前下载模板的语言一致',
  localized_name: '仅英文必填：英文常用名；中文请留空',
  seo_title: '建议填写：搜索结果标题；避免测试/验收字样，建议清晰包含物种名与用途',
  meta_description: '建议填写：搜索摘要；自然描述饲养重点，不写内部流程或测试信息',
  h1: '必填：页面主标题；每页一个清晰 H1',
  intro: '必填：页面简介正文；可写饲养特点、环境与注意事项',
  image_alt: '必填：图片替代文本；描述物种，不堆关键词',
  focus_keyword: '建议填写：一个主要搜索词，例如 孔雀鱼 饲养 / guppy care',
  index_strategy: '必填：noindex / index / canonical_to_sibling；首批或未审核内容建议 noindex',
  canonical_catalog_key: '仅 canonical_to_sibling 必填：同一基础物种下的主页面 catalog_key；其他策略留空',
};

const TEMPLATE_FORMATS = {
  import_action: '格式：update 或 更新', catalog_key: '格式：sp_0000', source_name: '文本', scientific_name: '完整属名 + 种名；不要以 var. / subsp. / ssp. 结尾',
  locale: 'zh-CN | en', localized_name: '英文文本', seo_title: '纯文本', meta_description: '纯文本', h1: '纯文本', intro: '纯文本', image_alt: '纯文本',
  focus_keyword: '1 个主关键词/短语', index_strategy: 'noindex | index | canonical_to_sibling', canonical_catalog_key: '空白或 sp_0000',
};

function blankTemplateRow(locale) {
  return Object.fromEntries(FIELDS.map((field) => [field, field === 'locale' ? locale : field === 'index_strategy' ? 'noindex' : '']));
}

function templateExampleRows(locale) {
  const isEnglish = locale === 'en';
  return [
    { import_action: '示例 1 · 普通页面（不会导入）', catalog_key: 'sp_0436', source_name: '孔雀鱼', scientific_name: 'Poecilia reticulata', locale, localized_name: isEnglish ? 'Guppy' : '', seo_title: isEnglish ? 'Guppy Care Guide | AquaGuide' : '孔雀鱼饲养指南 | AquaGuide', meta_description: isEnglish ? 'Guppy care guide covering water, tank setup and everyday care.' : '了解孔雀鱼的水温、鱼缸环境与日常饲养重点。', h1: isEnglish ? 'Guppy Care Guide' : '孔雀鱼饲养指南', intro: isEnglish ? 'A practical introduction to guppy care, setup and everyday needs.' : '孔雀鱼是常见入门观赏鱼，适合在稳定水质与合适空间中饲养。', image_alt: isEnglish ? 'Guppy aquarium profile' : '孔雀鱼水族图鉴', focus_keyword: isEnglish ? 'guppy care' : '孔雀鱼 饲养', index_strategy: 'noindex', canonical_catalog_key: '' },
    { import_action: '示例 2 · 独立收录页（不会导入）', catalog_key: 'sp_0431', source_name: '红绿灯', scientific_name: 'Paracheirodon innesi', locale, localized_name: isEnglish ? 'Neon Tetra' : '', seo_title: isEnglish ? 'Neon Tetra Care Guide | AquaGuide' : '红绿灯饲养指南 | AquaGuide', meta_description: isEnglish ? 'Neon Tetra care guide with water parameters, group size and tank setup.' : '红绿灯饲养指南：水温、水质、群游与鱼缸环境建议。', h1: isEnglish ? 'Neon Tetra Care Guide' : '红绿灯饲养指南', intro: isEnglish ? 'Use index only after both languages and review requirements are complete.' : '只有双语内容与审核条件都满足后，才使用 index 独立收录。', image_alt: isEnglish ? 'Neon Tetra aquarium profile' : '红绿灯水族图鉴', focus_keyword: isEnglish ? 'neon tetra care' : '红绿灯 饲养', index_strategy: 'index', canonical_catalog_key: '' },
    { import_action: '示例 3 · 重复页指向主页面（不会导入）', catalog_key: 'sp_0031', source_name: '蓝丝绒米虾', scientific_name: 'Neocaridina davidi var. Blue', locale, localized_name: isEnglish ? 'Blue Velvet Shrimp' : '', seo_title: isEnglish ? 'Blue Velvet Shrimp Care Guide | AquaGuide' : '蓝丝绒米虾饲养指南 | AquaGuide', meta_description: isEnglish ? 'Example of a reviewed duplicate page that points to its canonical sibling.' : '示例：经人工确认的重复页面，通过 Canonical 指向同组主页面。', h1: isEnglish ? 'Blue Velvet Shrimp Care Guide' : '蓝丝绒米虾饲养指南', intro: isEnglish ? 'Use canonical_to_sibling only after duplicate review has confirmed the canonical page.' : '只有重复复核已确认主页面后，才使用 canonical_to_sibling。', image_alt: isEnglish ? 'Blue Velvet Shrimp aquarium profile' : '蓝丝绒米虾水族图鉴', focus_keyword: isEnglish ? 'blue velvet shrimp care' : '蓝丝绒米虾 饲养', index_strategy: 'canonical_to_sibling', canonical_catalog_key: 'sp_0030' },
  ];
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const source = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += char;
  }
  if (cell.length || row.length) { row.push(cell.replace(/\r$/, '')); rows.push(row); }
  const headers = (rows.shift() || []).map((item) => item.trim());
  if (!headers.length) throw new Error('CSV 没有表头。');
  return rows.filter((item) => item.some((value) => String(value).trim())).map((values, index) => ({
    __row: index + 2,
    ...Object.fromEntries(headers.map((header, column) => [header, values[column] ?? ''])),
  }));
}

export default function BulkImportPanel({ species = [], seoRows = {}, reviewRows = {}, locale = 'zh-CN', schemaReady, readOnly, onImported }) {
  const { appLocale } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const speciesByKey = useMemo(() => new Map(species.map((item) => [item.catalog_key, item])), [species]);
  const markedRows = useMemo(() => parsedRows.filter((row) => VALID_ACTIONS.has(String(row.import_action || '').trim().toLowerCase())), [parsedRows]);

  const importPreview = useMemo(() => {
    if (!parsedRows.length) return { rows: [], changedPayloads: [], changedRows: 0, clearedFields: 0 };
    const { nextErrors, payloads } = validate(parsedRows);
    if (nextErrors.length) return { rows: [], changedPayloads: [], changedRows: 0, clearedFields: 0 };
    const rows = payloads.map((payload) => {
      const current = seoRows[`${payload.catalog_key}::${payload.locale}`] || {};
      const changes = EDITABLE.flatMap((field) => {
        const before = normalizeComparable(current[field]);
        const after = normalizeComparable(payload[field]);
        if (before === after) return [];
        return [{ field, before, after, kind: before && !after ? 'clear' : 'change' }];
      });
      return { payload, member: speciesByKey.get(payload.catalog_key), changes };
    });
    const changed = rows.filter((item) => item.changes.length);
    return {
      rows,
      changedPayloads: changed.map((item) => item.payload),
      changedRows: changed.length,
      clearedFields: changed.reduce((sum, item) => sum + item.changes.filter((change) => change.kind === 'clear').length, 0),
    };
  }, [parsedRows, seoRows, speciesByKey, reviewRows, locale]);

  const preflight = useMemo(() => {
    const loaded = parsedRows.length > 0;
    const marked = markedRows.length;
    const issueCount = errors.length;
    const changed = importPreview.changedRows;
    const skipped = Math.max(marked - changed, 0);
    const ready = loaded && marked > 0 && issueCount === 0 && changed > 0 && schemaReady && !readOnly;
    return { loaded, marked, issueCount, changed, skipped, cleared: importPreview.clearedFields, ready };
  }, [parsedRows.length, markedRows.length, errors.length, importPreview.changedRows, importPreview.clearedFields, schemaReady, readOnly]);

  const downloadTemplate = () => {
    const rows = [
      TEMPLATE_GUIDE,
      TEMPLATE_FORMATS,
      ...Array.from({ length: 20 }, () => blankTemplateRow(locale)),
      ...templateExampleRows(locale),
    ];
    const lines = [FIELDS.join(','), ...rows.map((row) => FIELDS.map((field) => csvEscape(row[field])).join(','))];
    const blob = new Blob([`\uFEFF${lines.join('\r\n')}\r\n`], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `aquaguide-species-seo-${locale}-template.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
    emitAdminNotice({ status: 'success', title: isUiEnglish ? 'Blank template downloaded' : '空白模板已下载', detail: isUiEnglish ? `Field guide + 20 blank rows + 3 examples · ${locale}` : `字段说明 + 20 行空白填写区 + 3 个典型案例 · ${locale}` });
  };

  function validate(rows) {
    const nextErrors = [];
    const payloads = [];
    for (const row of rows) {
      if (!VALID_ACTIONS.has(String(row.import_action || '').trim().toLowerCase())) continue;
      const key = String(row.catalog_key || '').trim();
      const member = speciesByKey.get(key);
      if (!member) { nextErrors.push(`第 ${row.__row} 行：catalog_key ${key || '为空'} 不存在。`); continue; }
      const sourceIdentity = inspectSourceIdentity(member);
      if (!sourceIdentity.clean) {
        nextErrors.push(`第 ${row.__row} 行：${key} 的源数据学名不完整（${member.scientific_name || '为空'}），请先修正 AquaGuide 源记录。`);
        continue;
      }
      const rowLocale = String(row.locale || locale).trim();
      if (rowLocale !== locale) { nextErrors.push(`第 ${row.__row} 行：locale 必须是当前模板语言 ${locale}。`); continue; }
      const strategy = String(row.index_strategy || 'noindex').trim();
      if (!VALID_STRATEGIES.has(strategy)) { nextErrors.push(`第 ${row.__row} 行：index_strategy 无效。`); continue; }
      const canonicalKey = String(row.canonical_catalog_key || '').trim();
      const group = speciesGroupByMemberId.get(member.id);
      const resolvedDuplicatePolicy = getResolvedDuplicateSeoPolicy({ species: member, group, reviewRows });
      if (resolvedDuplicatePolicy && (strategy !== resolvedDuplicatePolicy.indexStrategy || canonicalKey !== resolvedDuplicatePolicy.canonicalCatalogKey)) {
        const expected = resolvedDuplicatePolicy.isCanonical
          ? 'index（独立主页面）'
          : `canonical_to_sibling → ${resolvedDuplicatePolicy.canonicalCatalogKey}`;
        nextErrors.push(`第 ${row.__row} 行：${key} 已完成人工重复复核，SEO 策略必须保持 ${expected}。`);
        continue;
      }
      if (strategy === 'canonical_to_sibling') {
        const validTarget = canonicalKey && canonicalKey !== key && group?.members?.some((item) => item.catalog_key === canonicalKey);
        if (!validTarget) { nextErrors.push(`第 ${row.__row} 行：Canonical 目标必须是同一基础物种下的其他页面。`); continue; }
      }
      const routeMeta = buildSpeciesSeoRouteMeta({ member, group, locale: rowLocale, indexStrategy: strategy, canonicalCatalogKey: canonicalKey });
      payloads.push({
        catalog_key: key,
        locale: rowLocale,
        localized_name: rowLocale === 'en' ? String(row.localized_name || '').trim() : '',
        seo_title: String(row.seo_title || '').trim(), meta_description: String(row.meta_description || '').trim(),
        h1: String(row.h1 || '').trim(), intro: String(row.intro || '').trim(), image_alt: String(row.image_alt || '').trim(),
        focus_keyword: String(row.focus_keyword || '').trim(), index_strategy: strategy,
        canonical_catalog_key: strategy === 'canonical_to_sibling' ? canonicalKey : '', canonical_path: routeMeta.canonicalPath,
        status: 'draft', review_state: 'editing',
      });
    }
    return { nextErrors, payloads };
  }

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const rows = parseCsv(await file.text());
      const missing = FIELDS.filter((field) => !Object.hasOwn(rows[0] || {}, field));
      if (missing.length) throw new Error(`模板缺少字段：${missing.join(', ')}`);
      const result = validate(rows);
      setParsedRows(rows);
      setErrors(result.nextErrors);
      if (result.nextErrors.length) {
        emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'CSV needs fixes before import' : 'CSV 需要修正后才能导入', detail: `${result.nextErrors[0]}${result.nextErrors.length > 1 ? ` · ${isUiEnglish ? `${result.nextErrors.length - 1} more issues` : `另有 ${result.nextErrors.length - 1} 项`}` : ''}`, duration: 7200 });
      } else {
        emitAdminNotice({ status: 'success', title: isUiEnglish ? 'CSV validation passed' : 'CSV 校验通过', detail: `${rows.filter((row) => VALID_ACTIONS.has(String(row.import_action || '').trim().toLowerCase())).length} ${isUiEnglish ? 'data rows marked for import' : '行内容已标记待导入'} · ${locale}` });
      }
    } catch (error) {
      setParsedRows([]);
      const reason = error.message || (isUiEnglish ? 'CSV parsing failed.' : 'CSV 解析失败。');
      setErrors([reason]);
      emitAdminNotice({ status: 'error', title: isUiEnglish ? 'CSV could not be read' : 'CSV 读取失败', detail: reason });
    }
  };

  const importRows = async () => {
    if (readOnly) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Read-only demo' : '当前是只读演示', detail: isUiEnglish ? 'CSV was not imported.' : '不会执行批量导入。' }); return; }
    if (!schemaReady) { emitAdminNotice({ status: 'error', title: isUiEnglish ? 'Import blocked' : '导入被阻止', detail: isUiEnglish ? 'Variant SEO content store is not ready.' : '当前页 SEO 内容存储尚未就绪。' }); return; }
    if (!parsedRows.length) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Choose a CSV first' : '请先选择 CSV', detail: isUiEnglish ? 'Upload a completed AquaGuide template before importing.' : '请先上传回填后的 AquaGuide 模板。' }); return; }
    const { nextErrors } = validate(parsedRows);
    setErrors(nextErrors);
    if (nextErrors.length) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Import blocked by CSV validation' : 'CSV 校验未通过', detail: `${nextErrors[0]}${nextErrors.length > 1 ? ` · ${isUiEnglish ? `${nextErrors.length - 1} more issues` : `另有 ${nextErrors.length - 1} 项`}` : ''}`, duration: 7200 }); return; }
    if (!markedRows.length) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'No rows marked for import' : '没有标记待导入行', detail: isUiEnglish ? 'Set import_action = update on the rows you want to change.' : '请在需要导入的行填写 import_action = update（或“更新”）。' }); return; }
    const payloads = importPreview.changedPayloads;
    if (!payloads.length) { emitAdminNotice({ status: 'info', title: isUiEnglish ? 'No actual changes' : '没有实际变更', detail: isUiEnglish ? 'Marked rows match the current Draft, so nothing was written.' : '已标记的行与当前草稿完全一致，本次不会产生新版本。' }); return; }
    const baseDefaults = defaultGroupSeoForLocale(locale);
    const groupDefaultsByKey = new Map();
    const batchGroupKeys = new Set();
    for (const payload of payloads) {
      const member = speciesByKey.get(payload.catalog_key);
      const group = member ? speciesGroupByMemberId.get(member.id) : null;
      if (!group?.group_key) continue;
      batchGroupKeys.add(group.group_key);
      if (groupDefaultsByKey.has(group.group_key)) continue;
      groupDefaultsByKey.set(group.group_key, {
        group_key: group.group_key,
        locale,
        seo_title_template: baseDefaults.seoTitleTemplate,
        meta_description_template: baseDefaults.metaDescriptionTemplate,
        h1_template: baseDefaults.h1Template,
        shared_intro: baseDefaults.sharedIntro,
        status: 'draft',
        review_state: 'editing',
      });
    }
    setSaving(true);
    const { data, error } = await adminContentClient.rpc('import_species_seo_bulk', {
      p_species_rows: payloads,
      p_group_defaults: [...groupDefaultsByKey.values()],
      p_group_keys: [...batchGroupKeys],
      p_batch_filename: fileName || `aquaguide-species-seo-${locale}.csv`,
      p_batch_source: 'seo_csv_import',
    }, {
      kind: 'bulk_import',
      title: `批量导入 ${payloads.length} 条 SEO 内容`,
      detail: `${locale} · ${fileName || 'CSV 模板导入'}`,
      metadata: { locale, count: payloads.length, base_candidates: groupDefaultsByKey.size, filename: fileName || '', source: 'seo_csv_import' },
    });
    setSaving(false);
    if (error) return;
    const batch = data?.import_batch;
    if (batch?.batch_id) {
      emitAdminNotice({
        status: 'success',
        title: isUiEnglish ? 'Draft batch created' : '草稿批次已创建',
        detail: `${batch.batch_id} · ${batch.page_count || payloads.length} ${isUiEnglish ? 'pages' : '个页面'} · ${batch.locale}`,
        duration: 6500,
      });
    }
    onImported?.(data || { species_seo: [], species_seo_groups: [], import_batch: null });
  };

  return (
    <section className="bulk-import-panel">
      <div className="bulk-import-head">
        <div><p className="eyebrow">SEO TEMPLATE IMPORT · {locale}</p><h2>{isUiEnglish ? 'SEO template import' : 'SEO 模板导入'}</h2><p>{isUiEnglish ? 'Download a blank, uploadable CSV with field guidance and three examples. Fill only the blank rows you need, set import_action=update, then upload the same file.' : '下载可直接上传的空白 CSV：上方写明每个字段怎么填和格式要求，下方提供 3 个典型案例。只填写需要的空白行，并在 import_action 填 update / 更新。'}</p></div>
        <button type="button" className="secondary-button" onClick={downloadTemplate}>{isUiEnglish ? 'Download CSV template' : '下载 CSV 模板'}</button>
      </div>
      <div className="bulk-import-steps">
        <div><b>1</b><span>{isUiEnglish ? 'Download' : '下载模板'}</span><small>{isUiEnglish ? `Field guide + blank rows · ${locale}` : `字段说明 + 空白填写区 · ${locale}`}</small></div>
        <div><b>2</b><span>{isUiEnglish ? 'Fill + mark' : '回填并标记'}</span><small>{isUiEnglish ? 'Set import_action=update only for rows to change' : '只给要更新的行填写 import_action=update'}</small></div>
        <div><b>3</b><span>{isUiEnglish ? 'Preflight + diff' : '预检查并看 Diff'}</span><small>{isUiEnglish ? 'Fix row issues and confirm the actual field changes' : '先处理行级问题，再确认实际字段变更'}</small></div>
        <div><b>4</b><span>{isUiEnglish ? 'Create Draft' : '创建草稿'}</span><small>{isUiEnglish ? 'Writes only after every preflight gate passes' : '全部预检查通过后才会真正写入'}</small></div>
      </div>
      <div className="bulk-upload-zone">
        <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={onFile} hidden />
        <button type="button" className="bulk-upload-button" onClick={() => inputRef.current?.click()}>{fileName || (isUiEnglish ? 'Upload completed template' : '上传回填后的模板')}</button>
        <span>{parsedRows.length ? (isUiEnglish ? `Template loaded · ${markedRows.length} data rows marked for import` : `模板已读取 · ${markedRows.length} 行内容待导入`) : (isUiEnglish ? 'No file selected' : '尚未选择文件')}</span>
      </div>
      {parsedRows.length ? (
        <section className={`bulk-import-preflight ${errors.length ? 'blocked' : preflight.ready ? 'ready' : 'waiting'}`} aria-label={isUiEnglish ? 'Import preflight report' : '导入预检查结果'}>
          <div className="bulk-import-preflight-head">
            <div><strong>{isUiEnglish ? 'Preflight report' : '预检查结果'}</strong><small>{fileName || (isUiEnglish ? 'Uploaded CSV' : '已上传 CSV')}</small></div>
            <span>{errors.length ? (isUiEnglish ? `${errors.length} issues` : `${errors.length} 个问题`) : preflight.ready ? (isUiEnglish ? 'Ready to create Draft' : '可以创建草稿') : (isUiEnglish ? 'Needs attention' : '需要处理')}</span>
          </div>
          <div className="bulk-import-preflight-stats">
            <div><span>{isUiEnglish ? 'Marked rows' : '标记导入'}</span><strong>{preflight.marked}</strong></div>
            <div><span>{isUiEnglish ? 'Will change' : '实际变更'}</span><strong>{preflight.changed}</strong></div>
            <div><span>{isUiEnglish ? 'No-op skipped' : '无变化跳过'}</span><strong>{preflight.skipped}</strong></div>
            <div><span>{isUiEnglish ? 'Fields cleared' : '清空字段'}</span><strong>{preflight.cleared}</strong></div>
          </div>
          {errors.length ? (
            <div className="bulk-import-issue-list">
              <strong>{isUiEnglish ? 'Fix these rows before importing' : '请先修正以下问题'}</strong>
              <ol>{errors.slice(0, 12).map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}</ol>
              {errors.length > 12 ? <small>{isUiEnglish ? `+ ${errors.length - 12} more issues` : `另有 ${errors.length - 12} 个问题`}</small> : null}
            </div>
          ) : !markedRows.length ? (
            <p className="bulk-import-preflight-note">{isUiEnglish ? 'No data rows are marked. Set import_action=update only on rows you intend to change.' : '当前没有标记待导入的数据行。只在真正要修改的行填写 import_action=update / 更新。'}</p>
          ) : !importPreview.changedRows ? (
            <p className="bulk-import-preflight-note">{isUiEnglish ? 'All marked rows match the current Draft. No new revision will be created.' : '所有已标记行都与当前草稿一致，本次不会创建新版本。'}</p>
          ) : readOnly ? (
            <p className="bulk-import-preflight-note">{isUiEnglish ? 'This is a read-only demo. Preview the diff here, but Draft creation is disabled.' : '当前是只读演示，可以检查 Diff，但不会创建草稿。'}</p>
          ) : !schemaReady ? (
            <p className="bulk-import-preflight-note">{isUiEnglish ? 'The content store is not ready, so Draft creation remains blocked.' : '内容存储尚未就绪，因此暂时不能创建草稿。'}</p>
          ) : (
            <p className="bulk-import-preflight-note success">{isUiEnglish ? 'Validation passed. Review the field-level diff below, then create Drafts.' : '校验已通过。请继续检查下方字段级 Diff，确认后再创建草稿。'}</p>
          )}
        </section>
      ) : null}
      {markedRows.length && !errors.length ? (
        <div className="bulk-import-preview">
          <div className="bulk-import-preview-head">
            <div><strong>{isUiEnglish ? 'Import change preview' : '导入变更预览'}</strong><small>{isUiEnglish ? `${markedRows.length} marked · ${importPreview.changedRows} will change · ${importPreview.clearedFields} fields cleared` : `标记 ${markedRows.length} 行 · 实际修改 ${importPreview.changedRows} 行 · 清空 ${importPreview.clearedFields} 个字段`}</small></div>
            {markedRows.length !== importPreview.changedRows ? <span>{isUiEnglish ? `${markedRows.length - importPreview.changedRows} no-op rows skipped` : `跳过 ${markedRows.length - importPreview.changedRows} 行无变化内容`}</span> : null}
          </div>
          <div className="bulk-import-preview-list">
            {importPreview.rows.slice(0, 20).map((item) => (
              <div className={`bulk-import-preview-row ${item.changes.length ? '' : 'no-change'}`} key={item.payload.catalog_key}>
                <div><strong>{item.member?.name || item.payload.catalog_key}</strong><small>{item.payload.catalog_key}</small></div>
                <div className="bulk-import-change-tags">
                  {item.changes.length ? item.changes.map((change) => <span className={change.kind === 'clear' ? 'clear' : ''} key={change.field}>{FIELD_LABELS[change.field] || change.field}{change.kind === 'clear' ? (isUiEnglish ? ' · clear' : ' · 清空') : ''}</span>) : <span className="no-change-tag">{isUiEnglish ? 'No change' : '无变化'}</span>}
                </div>
              </div>
            ))}
            {importPreview.rows.length > 20 ? <small className="bulk-import-preview-more">{isUiEnglish ? `+ ${importPreview.rows.length - 20} more marked rows` : `另有 ${importPreview.rows.length - 20} 行已标记内容`}</small> : null}
          </div>
        </div>
      ) : null}
      <div className="bulk-import-footer"><span>{isUiEnglish ? 'Blank editable cells clear the page override and fall back to the Base template where applicable.' : '可编辑字段留空会清除该页面自定义内容；支持继承的字段会重新使用基础模板。'}</span><button type="button" className="primary-button" disabled={saving || !preflight.ready} onClick={importRows}>{saving ? (isUiEnglish ? 'Creating Drafts…' : '正在创建草稿…') : (isUiEnglish ? `Create Drafts · ${importPreview.changedRows} rows` : `创建草稿 · ${importPreview.changedRows} 行`)}</button></div>
    </section>
  );
}
