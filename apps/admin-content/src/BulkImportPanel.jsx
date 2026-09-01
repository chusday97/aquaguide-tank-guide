import { useMemo, useRef, useState } from 'react';
import { adminContentClient } from './adminBackend.js';
import { useAppLanguage } from './AppLanguage.jsx';
import { speciesGroupByMemberId } from './speciesGroups.js';
import { buildSpeciesSeoRouteMeta, INDEX_STRATEGIES } from './seoRouteContract.js';

const FIELDS = [
  'import_action', 'catalog_key', 'source_name', 'scientific_name', 'locale', 'localized_name',
  'seo_title', 'meta_description', 'h1', 'intro', 'image_alt', 'focus_keyword', 'index_strategy', 'canonical_catalog_key',
];
const EDITABLE = ['localized_name', 'seo_title', 'meta_description', 'h1', 'intro', 'image_alt', 'focus_keyword', 'index_strategy', 'canonical_catalog_key'];
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

export default function BulkImportPanel({ species = [], seoRows = {}, locale = 'zh-CN', schemaReady, readOnly, onImported }) {
  const { appLocale } = useAppLanguage();
  const isUiEnglish = appLocale === 'en';
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const speciesByKey = useMemo(() => new Map(species.map((item) => [item.catalog_key, item])), [species]);
  const markedRows = useMemo(() => parsedRows.filter((row) => VALID_ACTIONS.has(String(row.import_action || '').trim().toLowerCase())), [parsedRows]);

  const downloadTemplate = () => {
    const lines = [FIELDS.join(',')];
    for (const member of species) {
      const current = seoRows[`${member.catalog_key}::${locale}`] || {};
      const values = {
        import_action: '', catalog_key: member.catalog_key, source_name: member.name, scientific_name: member.scientific_name,
        locale, localized_name: current.localized_name || '', seo_title: current.seo_title || '', meta_description: current.meta_description || '',
        h1: current.h1 || '', intro: current.intro || '', image_alt: current.image_alt || '', focus_keyword: current.focus_keyword || '',
        index_strategy: current.index_strategy || 'noindex', canonical_catalog_key: current.canonical_catalog_key || '',
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
  };

  const validate = (rows) => {
    const nextErrors = [];
    const payloads = [];
    for (const row of rows) {
      if (!VALID_ACTIONS.has(String(row.import_action || '').trim().toLowerCase())) continue;
      const key = String(row.catalog_key || '').trim();
      const member = speciesByKey.get(key);
      if (!member) { nextErrors.push(`第 ${row.__row} 行：catalog_key ${key || '为空'} 不存在。`); continue; }
      const rowLocale = String(row.locale || locale).trim();
      if (rowLocale !== locale) { nextErrors.push(`第 ${row.__row} 行：locale 必须是当前模板语言 ${locale}。`); continue; }
      const strategy = String(row.index_strategy || 'noindex').trim();
      if (!VALID_STRATEGIES.has(strategy)) { nextErrors.push(`第 ${row.__row} 行：index_strategy 无效。`); continue; }
      const canonicalKey = String(row.canonical_catalog_key || '').trim();
      const group = speciesGroupByMemberId.get(member.id);
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
  };

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setMessage('');
    try {
      const rows = parseCsv(await file.text());
      const missing = FIELDS.filter((field) => !Object.hasOwn(rows[0] || {}, field));
      if (missing.length) throw new Error(`模板缺少字段：${missing.join(', ')}`);
      const result = validate(rows);
      setParsedRows(rows);
      setErrors(result.nextErrors);
    } catch (error) {
      setParsedRows([]);
      setErrors([error.message || 'CSV 解析失败。']);
    }
  };

  const importRows = async () => {
    if (readOnly || !schemaReady || !parsedRows.length) return;
    const { nextErrors, payloads } = validate(parsedRows);
    setErrors(nextErrors);
    if (nextErrors.length) return;
    if (!payloads.length) { setMessage(isUiEnglish ? 'Mark rows with import_action = update first.' : '请先在需要导入的行填写 import_action = update（或“更新”）。'); return; }
    setSaving(true);
    setMessage('');
    const { data, error } = await adminContentClient
      .from('species_seo')
      .upsert(payloads, { onConflict: 'catalog_key,locale' })
      .activity({ kind: 'bulk_import', title: `批量导入 ${payloads.length} 条 SEO 内容`, detail: `${locale} · CSV 模板导入`, metadata: { locale, count: payloads.length } })
      .select('*');
    setSaving(false);
    if (error) { setMessage(`${isUiEnglish ? 'Import failed' : '导入失败'}：${error.message}`); return; }
    setMessage(isUiEnglish ? `${data.length} Draft rows imported. Review state was reset to Editing where content changed.` : `已导入 ${data.length} 条 Draft；内容发生变化的页面已自动回到“编辑中”。`);
    onImported?.(data || []);
  };

  return (
    <section className="bulk-import-panel">
      <div className="bulk-import-head">
        <div><p className="eyebrow">CSV BULK IMPORT · {locale}</p><h2>{isUiEnglish ? 'Bulk import SEO content' : '批量导入 SEO 内容'}</h2><p>{isUiEnglish ? 'Download the AquaGuide CSV table (editable in Excel or Numbers), edit only the rows you need, mark them as update, then upload the same file.' : '下载 AquaGuide 表格模板（CSV，可用 Excel / Numbers 编辑），只修改需要处理的行，并在 import_action 填“update / 更新”，再上传同一文件。'}</p></div>
        <button type="button" className="secondary-button" onClick={downloadTemplate}>{isUiEnglish ? 'Download template' : '下载模板'}</button>
      </div>
      <div className="bulk-import-steps">
        <div><b>1</b><span>{isUiEnglish ? 'Download' : '下载模板'}</span><small>{isUiEnglish ? `${species.length} catalog rows, ${locale}` : `包含 ${species.length} 条目录记录 · ${locale}`}</small></div>
        <div><b>2</b><span>{isUiEnglish ? 'Fill + mark' : '回填并标记'}</span><small>{isUiEnglish ? 'Set import_action=update only for rows to change' : '只给要更新的行填写 import_action=update'}</small></div>
        <div><b>3</b><span>{isUiEnglish ? 'Upload + validate' : '上传并校验'}</span><small>{isUiEnglish ? 'Product Truth columns are reference-only' : 'source_name / scientific_name 只读参考，不会写回 Product Truth'}</small></div>
      </div>
      <div className="bulk-upload-zone">
        <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={onFile} hidden />
        <button type="button" className="bulk-upload-button" onClick={() => inputRef.current?.click()}>{fileName || (isUiEnglish ? 'Choose completed CSV' : '选择回填后的 CSV')}</button>
        <span>{parsedRows.length ? (isUiEnglish ? `${parsedRows.length} rows read · ${markedRows.length} marked for import` : `已读取 ${parsedRows.length} 行 · ${markedRows.length} 行待导入`) : (isUiEnglish ? 'No file selected' : '尚未选择文件')}</span>
      </div>
      {errors.length ? <div className="bulk-import-errors"><strong>{isUiEnglish ? 'Fix these rows before importing' : '导入前需要修正'}</strong>{errors.slice(0, 8).map((item) => <p key={item}>{item}</p>)}{errors.length > 8 ? <small>{isUiEnglish ? `${errors.length - 8} more errors` : `另有 ${errors.length - 8} 项错误`}</small> : null}</div> : null}
      {markedRows.length && !errors.length ? <div className="bulk-import-ready"><strong>{isUiEnglish ? 'Ready to import' : '可以导入'}</strong><span>{isUiEnglish ? `${markedRows.length} rows will be written as Drafts.` : `${markedRows.length} 行会写入 Draft；未标记行不会被改动。`}</span></div> : null}
      <div className="bulk-import-footer"><span>{message || (isUiEnglish ? 'Blank editable cells clear the page override and fall back to the Base template where applicable.' : '可编辑字段留空会清除该页面 Override；支持继承的字段会重新使用 Base 模板。')}</span><button type="button" className="primary-button" disabled={readOnly || !schemaReady || saving || !markedRows.length || errors.length > 0} onClick={importRows}>{saving ? (isUiEnglish ? 'Importing…' : '正在导入…') : (isUiEnglish ? `Import ${markedRows.length} rows` : `导入 ${markedRows.length} 行`)}</button></div>
    </section>
  );
}
