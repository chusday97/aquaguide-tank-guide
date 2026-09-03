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

  const downloadTemplate = () => {
    const lines = [FIELDS.join(',')];
    for (const member of species) {
      const current = seoRows[`${member.catalog_key}::${locale}`] || {};
      const group = speciesGroupByMemberId.get(member.id);
      const resolvedDuplicatePolicy = getResolvedDuplicateSeoPolicy({ species: member, group, reviewRows });
      const values = {
        import_action: '', catalog_key: member.catalog_key, source_name: member.name, scientific_name: member.scientific_name,
        locale, localized_name: current.localized_name || '', seo_title: current.seo_title || '', meta_description: current.meta_description || '',
        h1: current.h1 || '', intro: current.intro || '', image_alt: current.image_alt || '', focus_keyword: current.focus_keyword || '',
        index_strategy: resolvedDuplicatePolicy?.indexStrategy || current.index_strategy || 'noindex',
        canonical_catalog_key: resolvedDuplicatePolicy?.canonicalCatalogKey ?? current.canonical_catalog_key ?? '',
      };
      lines.push(FIELDS.map((field) => csvEscape(values[field])).join(','));
    }
    const blob = new Blob([`\uFEFF${lines.join('\r\n')}\r\n`], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `aquaguide-species-seo-${locale}-template.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
    emitAdminNotice({ status: 'success', title: isUiEnglish ? 'Template downloaded' : '模板已下载', detail: `${species.length} ${isUiEnglish ? 'catalog rows' : '条目录记录'} · ${locale}` });
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
        if (!validTarget) { nextErrors.push(`第 ${row.__row} 行：Canonical 目标必须是同一 Base Species 下的其他页面。`); continue; }
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
        emitAdminNotice({ status: 'success', title: isUiEnglish ? 'CSV validation passed' : 'CSV 校验通过', detail: `${rows.length} ${isUiEnglish ? 'rows read' : '行已读取'} · ${rows.filter((row) => VALID_ACTIONS.has(String(row.import_action || '').trim().toLowerCase())).length} ${isUiEnglish ? 'marked for import' : '行待导入'}` });
      }
    } catch (error) {
      setParsedRows([]);
      const reason = error.message || (isUiEnglish ? 'CSV parsing failed.' : 'CSV 解析失败。');
      setErrors([reason]);
      emitAdminNotice({ status: 'error', title: isUiEnglish ? 'CSV could not be read' : 'CSV 读取失败', detail: reason });
    }
  };

  const importRows = async () => {
    if (readOnly) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Read-only Review' : '当前是只读 Review', detail: isUiEnglish ? 'CSV was not imported.' : '不会执行批量导入。' }); return; }
    if (!schemaReady) { emitAdminNotice({ status: 'error', title: isUiEnglish ? 'Import blocked' : '导入被阻止', detail: isUiEnglish ? 'Variant SEO content store is not ready.' : 'Variant SEO 内容存储尚未就绪。' }); return; }
    if (!parsedRows.length) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Choose a CSV first' : '请先选择 CSV', detail: isUiEnglish ? 'Upload a completed AquaGuide template before importing.' : '请先上传回填后的 AquaGuide 模板。' }); return; }
    const { nextErrors } = validate(parsedRows);
    setErrors(nextErrors);
    if (nextErrors.length) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'Import blocked by CSV validation' : 'CSV 校验未通过', detail: `${nextErrors[0]}${nextErrors.length > 1 ? ` · ${isUiEnglish ? `${nextErrors.length - 1} more issues` : `另有 ${nextErrors.length - 1} 项`}` : ''}`, duration: 7200 }); return; }
    if (!markedRows.length) { emitAdminNotice({ status: 'warning', title: isUiEnglish ? 'No rows marked for import' : '没有标记待导入行', detail: isUiEnglish ? 'Set import_action = update on the rows you want to change.' : '请在需要导入的行填写 import_action = update（或“更新”）。' }); return; }
    const payloads = importPreview.changedPayloads;
    if (!payloads.length) { emitAdminNotice({ status: 'info', title: isUiEnglish ? 'No actual changes' : '没有实际变更', detail: isUiEnglish ? 'Marked rows match the current Draft, so nothing was written.' : '已标记的行与当前 Draft 完全一致，本次不会产生新版本。' }); return; }
    const baseDefaults = defaultGroupSeoForLocale(locale);
    const groupDefaultsByKey = new Map();
    for (const payload of payloads) {
      const member = speciesByKey.get(payload.catalog_key);
      const group = member ? speciesGroupByMemberId.get(member.id) : null;
      if (!group?.group_key || groupDefaultsByKey.has(group.group_key)) continue;
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
    }, {
      kind: 'bulk_import',
      title: `批量导入 ${payloads.length} 条 SEO 内容`,
      detail: `${locale} · CSV 模板导入`,
      metadata: { locale, count: payloads.length, base_candidates: groupDefaultsByKey.size },
    });
    setSaving(false);
    if (error) return;
    onImported?.(data || { species_seo: [], species_seo_groups: [] });
  };

  return (
    <section className="bulk-import-panel">
      <div className="bulk-import-head">
        <div><p className="eyebrow">SEO TEMPLATE IMPORT · {locale}</p><h2>{isUiEnglish ? 'SEO template import' : 'SEO 模板导入'}</h2><p>{isUiEnglish ? 'Download the AquaGuide CSV table (editable in Excel or Numbers), edit only the rows you need, mark them as update, then upload the same file.' : '下载 AquaGuide 表格模板（CSV，可用 Excel / Numbers 编辑），只修改需要处理的行，并在 import_action 填“update / 更新”，再上传同一文件。'}</p></div>
        <button type="button" className="secondary-button" onClick={downloadTemplate}>{isUiEnglish ? 'Download CSV template' : '下载 CSV 模板'}</button>
      </div>
      <div className="bulk-import-steps">
        <div><b>1</b><span>{isUiEnglish ? 'Download' : '下载模板'}</span><small>{isUiEnglish ? `${species.length} catalog rows, ${locale}` : `包含 ${species.length} 条目录记录 · ${locale}`}</small></div>
        <div><b>2</b><span>{isUiEnglish ? 'Fill + mark' : '回填并标记'}</span><small>{isUiEnglish ? 'Set import_action=update only for rows to change' : '只给要更新的行填写 import_action=update'}</small></div>
        <div><b>3</b><span>{isUiEnglish ? 'Upload + validate' : '上传并校验'}</span><small>{isUiEnglish ? 'AquaGuide source-data columns are reference-only' : 'source_name / scientific_name 仅作源数据参考，不会被改写'}</small></div>
      </div>
      <div className="bulk-upload-zone">
        <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={onFile} hidden />
        <button type="button" className="bulk-upload-button" onClick={() => inputRef.current?.click()}>{fileName || (isUiEnglish ? 'Upload completed template' : '上传回填后的模板')}</button>
        <span>{parsedRows.length ? (isUiEnglish ? `${parsedRows.length} rows read · ${markedRows.length} marked for import` : `已读取 ${parsedRows.length} 行 · ${markedRows.length} 行待导入`) : (isUiEnglish ? 'No file selected' : '尚未选择文件')}</span>
      </div>
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
      <div className="bulk-import-footer"><span>{isUiEnglish ? 'Blank editable cells clear the page override and fall back to the Base template where applicable.' : '可编辑字段留空会清除该页面 Override；支持继承的字段会重新使用 Base 模板。'}</span><button type="button" className="primary-button" disabled={saving} onClick={importRows}>{saving ? (isUiEnglish ? 'Importing…' : '正在导入…') : (isUiEnglish ? `Import ${importPreview.changedRows} changed rows` : `导入 ${importPreview.changedRows} 行实际变更`)}</button></div>
    </section>
  );
}
