import fs from 'node:fs';

const file = 'src/pages/CareEncyclopedia.tsx';
let source = fs.readFileSync(file, 'utf8');

if (source.includes('testId="care-knowledge-decision"')) {
  console.log('Knowledge Result UX already migrated; no product edit needed.');
  process.exit(0);
}

const replaceOnce = (pattern, replacement, label) => {
  const matches = source.match(pattern);
  if (!matches || matches.length !== 1) {
    throw new Error(`${label}: expected exactly one match, got ${matches?.length || 0}`);
  }
  source = source.replace(pattern, replacement);
};

replaceOnce(
  /              <section className="mt-3 rounded-\[18px\] border border-emerald-100 bg-emerald-50\/55 p-3\.5">\n                <div className="text-\[12px\] font-black text-emerald-800">\{detailLead\.label\}<\/div>\n                <p className="mt-1 text-\[14px\] font-black leading-relaxed text-ink">\{detailLead\.text\}<\/p>\n              <\/section>/g,
  `              {meta.guideType === 'knowledge' ? (\n                <section className="mt-3" data-care-knowledge-result>\n                  <DecisionResultSurface\n                    testId="care-knowledge-decision"\n                    isEn={isEn}\n                    tone={meta.urgencyTag === '需要立即处理' ? 'danger' : (meta.urgencyTag === '谨慎操作' || meta.urgencyTag === '建议尽快处理') ? 'warning' : 'info'}\n                    eyebrow={isEn ? 'KEY TAKEAWAY' : '先看结论'}\n                    statusLabel={getUrgencyTagLabel(meta.urgencyTag, isEn)}\n                    title={visibleActions[0]?.title || (isEn ? 'Understand the key constraint first' : '先确认关键限制')}\n                    summary={visibleActions[0]?.description || detailLead.text}\n                    primarySource={careEvidenceSource(getCareActionEvidenceForText(topic, visibleActions[0]?.description || visibleActions[0]?.title || careGuide.summary))}\n                    primaryControl={(\n                      <Button\n                        type="button"\n                        data-care-result-primary\n                        onClick={(event) => handlePrimaryCta(event.currentTarget)}\n                        disabled={isPrimaryDisabled}\n                        className="h-11 w-full rounded-full bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800"\n                      >\n                        {primaryCtaLabel}\n                        <ChevronRight className="ml-1 h-4 w-4" />\n                      </Button>\n                    )}\n                    actions={visibleActions.slice(1, 3).map((item, index) => ({\n                      id: \\`knowledge-follow-up-\\${index}\\`,\n                      title: item.title,\n                      detail: item.description,\n                      source: careEvidenceSource(getCareActionEvidenceForText(topic, item.description || item.title)),\n                    }))}\n                    watchFor={careGuide.warningSigns.slice(0, 2).map(item => item.sign)}\n                    escalateIf={careGuide.warningSigns.slice(0, 2).map(item => item.action)}\n                    avoid={careGuide.avoidActions.slice(0, 2).map(item => item.title)}\n                    sources={careEvidenceSources(careActionEvidence)}\n                  />\n                </section>\n              ) : (\n                <section className="mt-3 rounded-[18px] border border-emerald-100 bg-emerald-50/55 p-3.5">\n                  <div className="text-[12px] font-black text-emerald-800">{detailLead.label}</div>\n                  <p className="mt-1 text-[14px] font-black leading-relaxed text-ink">{detailLead.text}</p>\n                </section>\n              )}`,
  'knowledge lead → shared DecisionResultSurface',
);

replaceOnce(
  /\{meta\.guideType === 'knowledge' && visibleActions\.length > 0 && \(/g,
  "{meta.guideType === 'knowledge' && visibleActions.length > 3 && (",
  'knowledge duplicate key-point condition',
);

replaceOnce(
  /\{visibleActions\.slice\(0, 2\)\.map\(\(item, index\) => \(/g,
  '{visibleActions.slice(3, 5).map((item, index) => (',
  'knowledge duplicate key-point slice',
);

replaceOnce(
  /\{meta\.guideType === 'knowledge' \? \(\n              <div className="text-\[13px\] font-black text-ink">\{isEn \? 'Detailed Description' : '详细说明'\}<\/div>\n            \) : \(/g,
  `{meta.guideType === 'knowledge' ? (\n              <button\n                type="button"\n                data-disclosure-purpose="secondary_explanation"\n                aria-expanded={isDetailExpanded}\n                onClick={() => setIsDetailExpanded(prev => !prev)}\n                className="flex min-h-11 w-full items-center justify-between gap-3 rounded-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"\n              >\n                <span className="text-[13px] font-black text-ink">{isEn ? 'Detailed explanation' : '详细说明'}</span>\n                <span className="rounded-full bg-bg px-2.5 py-1 text-[10px] font-black text-ink/50">\n                  {isDetailExpanded ? (isEn ? 'Collapse' : '收起') : (isEn ? 'Expand' : '展开')}\n                </span>\n              </button>\n            ) : (`,
  'knowledge detailed explanation disclosure',
);

replaceOnce(
  /\{\(meta\.guideType === 'knowledge' \|\| isDetailExpanded\) && \(/g,
  '{isDetailExpanded && (',
  'knowledge detailed explanation default collapsed',
);

fs.writeFileSync(file, source);
console.log('Knowledge Result UX migration applied to CareEncyclopedia.tsx');
