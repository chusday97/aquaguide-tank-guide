import fs from 'node:fs';

const replaceOnce = (path, before, after, label) => {
  const source = fs.readFileSync(path, 'utf8');
  if (!source.includes(before)) {
    throw new Error(`${label}: anchor not found in ${path}`);
  }
  const next = source.replace(before, after);
  fs.writeFileSync(path, next);
  console.log(`patched ${label}`);
};

// 1) Adaptive detail surfaces: keep normal reading drawers compact, but allow dense entity details to opt into a wide desktop panel and true full-screen mobile surface.
replaceOnce(
  'src/components/common/AdaptiveDetailContent.tsx',
  `type AdaptiveDetailContentProps = ComponentProps<typeof DialogContent>;\n\nexport function AdaptiveDetailContent({ className, style, ...props }: AdaptiveDetailContentProps) {\n  const { isPhoneLayout } = useLayoutMode();\n  const desktopWidth = 'min(var(--adaptive-surface-width, var(--surface-reading-width, 520px)), calc(100vw - var(--desktop-sidebar-width, 280px) - 48px))';`,
  `type AdaptiveDetailContentProps = ComponentProps<typeof DialogContent> & {\n  desktopSize?: 'reading' | 'wide';\n};\n\nexport function AdaptiveDetailContent({ className, style, desktopSize = 'reading', ...props }: AdaptiveDetailContentProps) {\n  const { isPhoneLayout } = useLayoutMode();\n  const desktopFallbackWidth = desktopSize === 'wide' ? '860px' : 'var(--surface-reading-width, 520px)';\n  const desktopWidth = \`min(var(--adaptive-surface-width, \${desktopFallbackWidth}), calc(100vw - var(--desktop-sidebar-width, 280px) - 48px))\`;`,
  'adaptive detail semantic width',
);
replaceOnce(
  'src/components/common/AdaptiveDetailContent.tsx',
  `        isPhoneLayout\n          ? 'bottom-0 left-1/2 top-auto h-[92dvh] max-h-[92dvh] !w-full !max-w-[430px] -translate-x-1/2 translate-y-0 rounded-b-none rounded-t-[28px]'\n          : 'bottom-0 left-auto right-0 top-0 h-[100dvh] max-h-[100dvh] min-w-0 translate-x-0 translate-y-0 rounded-none rounded-l-[24px] data-open:zoom-in-100 data-closed:zoom-out-100 data-open:slide-in-from-right-full data-closed:slide-out-to-right-full',`,
  `        isPhoneLayout\n          ? desktopSize === 'wide'\n            ? 'inset-0 h-[100dvh] max-h-[100dvh] !w-screen !max-w-none translate-x-0 translate-y-0 rounded-none'\n            : 'bottom-0 left-1/2 top-auto h-[92dvh] max-h-[92dvh] !w-full !max-w-[430px] -translate-x-1/2 translate-y-0 rounded-b-none rounded-t-[28px]'\n          : 'bottom-0 left-auto right-0 top-0 h-[100dvh] max-h-[100dvh] min-w-0 translate-x-0 translate-y-0 rounded-none rounded-l-[24px] data-open:zoom-in-100 data-closed:zoom-out-100 data-open:slide-in-from-right-full data-closed:slide-out-to-right-full',`,
  'adaptive detail phone full-screen wide mode',
);
replaceOnce(
  'src/components/SpeciesDetailDialog.tsx',
  `<AdaptiveDetailContent showCloseButton={false} finalFocus={finalFocusElement ? () => finalFocusElement : undefined}>`,
  `<AdaptiveDetailContent desktopSize="wide" data-detail-kind="species" showCloseButton={false} finalFocus={finalFocusElement ? () => finalFocusElement : undefined}>`,
  'species detail wide surface',
);

// 2) Livestock state wizard: a real default is a valid selection. Do not force a fake change just to reach review.
replaceOnce(
  'src/components/aquarium/LivestockBatchCard.tsx',
  `  const hasUnsavedChanges = hasPendingSelection || JSON.stringify(draft) !== JSON.stringify(record);`,
  `  const hasDraftChanges = JSON.stringify(draft) !== JSON.stringify(record);\n  const hasUnsavedChanges = hasPendingSelection || hasDraftChanges;`,
  'livestock draft-change state',
);
replaceOnce(
  'src/components/aquarium/LivestockBatchCard.tsx',
  `              ) : taskStep === 2 ? (\n                <button type="button" onClick={prepareReview} disabled={!hasPendingSelection} className="min-h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white disabled:opacity-50">{isEn ? 'Review changes' : '核对修改'}</button>\n              ) : (\n                <button type="button" onClick={() => void save()} disabled={isSaving || JSON.stringify(draft) === JSON.stringify(record)} className="min-h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white disabled:opacity-50">{isSaving ? t('livestock.saving') : t('livestock.saveChanges')}</button>\n              )}`,
  `              ) : taskStep === 2 ? (\n                <button type="button" onClick={prepareReview} disabled={!selectedSourceBatch} data-livestock-review-default-valid className="min-h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white disabled:opacity-50">{isEn ? 'Review state' : '核对体态'}</button>\n              ) : (\n                <button\n                  type="button"\n                  data-livestock-finish-mode={hasDraftChanges ? 'save' : 'done'}\n                  onClick={() => hasDraftChanges ? void save() : onEditingChange(false)}\n                  disabled={isSaving}\n                  className="min-h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white disabled:opacity-50"\n                >\n                  {isSaving ? t('livestock.saving') : hasDraftChanges ? t('livestock.saveChanges') : (isEn ? 'Done' : '完成')}\n                </button>\n              )}`,
  'livestock valid-default review and done path',
);

// 3) Compatibility: verdict must dominate, details become progressive disclosure, AI explanation is inline instead of a second modal.
replaceOnce(
  'src/components/CompatibilityRiskCalculator.tsx',
  `import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';\n`,
  ``,
  'remove compatibility explanation dialog import',
);
replaceOnce(
  'src/components/CompatibilityRiskCalculator.tsx',
  `  const meta = resultStatus ? statusMeta(resultStatus, isEn) : null;\n\n  const readiness =`,
  `  const meta = resultStatus ? statusMeta(resultStatus, isEn) : null;\n  const verdictCue = resultStatus === 'not_recommended'\n    ? { symbol: '×', eyebrow: isEn ? 'DANGER' : '危险', metric: isEn ? \`\${blockingPairs.length} blocked pair\${blockingPairs.length === 1 ? '' : 's'}\` : \`\${blockingPairs.length} 组明确冲突\` }\n    : resultStatus === 'caution'\n      ? { symbol: '!', eyebrow: isEn ? 'CAUTION' : '谨慎', metric: isEn ? \`\${cautionPairs.length} caution pair\${cautionPairs.length === 1 ? '' : 's'}\` : \`\${cautionPairs.length} 组需留意\` }\n      : resultStatus === 'insufficient_data'\n        ? { symbol: '?', eyebrow: isEn ? 'UNKNOWN' : '待确认', metric: isEn ? 'Evidence incomplete' : '信息不足 ≠ 安全' }\n        : resultStatus === 'compatible'\n          ? { symbol: '✓', eyebrow: isEn ? 'COMPATIBLE' : '可混养', metric: isEn ? \`\${relevantPairs.length} pair\${relevantPairs.length === 1 ? '' : 's'} checked\` : \`已检查 \${relevantPairs.length} 组关系\` }\n          : null;\n\n  const readiness =`,
  'compatibility verdict cue',
);
replaceOnce(
  'src/components/CompatibilityRiskCalculator.tsx',
  `            <div className={\`rounded-[20px] border p-4 \${meta.box}\`}>\n              <div className={\`flex items-start gap-3 \${meta.text}\`}>\n                <span className="mt-0.5">{meta.icon}</span>\n                <div>\n                  <div className={\`font-black \${resultStatus === 'not_recommended' ? 'text-[26px] leading-tight' : 'text-[20px]'}\`}>{meta.label}</div>\n                  <p className="mt-1 text-[12px] font-bold leading-5 opacity-85">{meta.description}</p>\n                </div>\n              </div>\n            </div>`,
  `            <div data-compatibility-verdict={resultStatus} className={\`rounded-[22px] border p-4 sm:p-5 \${meta.box}\`}>\n              <div className={\`flex items-center gap-4 \${meta.text}\`}>\n                <div data-verdict-symbol={verdictCue?.symbol} aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/85 text-[34px] font-black leading-none shadow-sm">\n                  {verdictCue?.symbol}\n                </div>\n                <div className="min-w-0 flex-1">\n                  <div className="text-[10px] font-black tracking-[0.18em] opacity-70">{verdictCue?.eyebrow}</div>\n                  <div className={\`mt-0.5 font-black \${resultStatus === 'not_recommended' ? 'text-[30px] leading-tight' : 'text-[25px] leading-tight'}\`}>{meta.label}</div>\n                  <div className="mt-2 inline-flex rounded-full bg-white/75 px-2.5 py-1 text-[10px] font-black">{verdictCue?.metric}</div>\n                </div>\n              </div>\n              <details className="mt-3 border-t border-current/10 pt-3">\n                <summary className="cursor-pointer text-[11px] font-black opacity-80">{isEn ? 'Why this result' : '展开判断依据'}</summary>\n                <p className="mt-2 text-[11px] font-bold leading-5 opacity-80">{meta.description}</p>\n              </details>\n            </div>`,
  'compatibility result-first hierarchy',
);
replaceOnce(
  'src/components/CompatibilityRiskCalculator.tsx',
  `      <Dialog open={aiOpen} onOpenChange={setAiOpen}>\n        <DialogContent className="w-[92vw] max-w-[560px] rounded-[24px] border-violet-100 bg-white p-0">\n          <DialogHeader className="border-b border-violet-100 bg-violet-50/70 px-5 py-4 text-left">\n            <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-violet-700"><Sparkles className="h-3.5 w-3.5" />{isEn ? 'AI INTERPRETATION' : 'AI 建议'}</div>\n            <DialogTitle className="mt-2 text-[20px] font-black text-ink">{isEn ? 'Why this result, and what can I change?' : '为什么会这样？我具体可以怎么改？'}</DialogTitle>\n          </DialogHeader>\n          <div className="max-h-[62dvh] overflow-y-auto px-5 py-4">\n            {aiLoading && <div className="flex min-h-[180px] items-center justify-center gap-2 text-sm font-black text-violet-700"><Loader2 className="h-5 w-5 animate-spin" />{isEn ? 'Generating suggestions…' : '正在生成建议…'}</div>}\n            {!aiLoading && aiResult && (\n              <div className="grid gap-3">\n                <div className={\`rounded-[16px] px-3 py-2 text-[11px] font-black \${aiResult.source === 'model' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}\`}>\n                  {aiResult.source === 'model' ? (isEn ? 'AI generated' : 'AI 已生成') : (isEn ? 'AI unavailable. Please try again later.' : 'AI 暂不可用，请稍后再试')}\n                </div>\n                <div className="rounded-[16px] bg-violet-50 p-3">\n                  <div className="text-[11px] font-black text-violet-800">{isEn ? 'Overview' : '建议概览'}</div>\n                  <p className="mt-1 text-[13px] font-bold leading-6 text-ink">{aiResult.summary}</p>\n                </div>\n                {aiResult.reasons.length > 0 && (\n                  <section>\n                    <div className="text-[12px] font-black text-ink">{isEn ? 'Why' : '为什么'}</div>\n                    <div className="mt-2 grid gap-2">\n                      {aiResult.reasons.slice(0, 4).map((item, index) => (\n                        <div key={\`\${item.title}-\${index}\`} className="rounded-[14px] border border-border bg-white p-3">\n                          <div className="text-[11px] font-black text-ink">{item.title}</div>\n                          <p className="mt-1 text-[11px] font-semibold leading-5 text-ink/58">{item.detail}</p>\n                        </div>\n                      ))}\n                    </div>\n                  </section>\n                )}\n                {aiResult.suggestions.length > 0 && (\n                  <section>\n                    <div className="text-[12px] font-black text-ink">{isEn ? 'Adjustment options' : '调整建议'}</div>\n                    <div className="mt-2 grid gap-2">\n                      {aiResult.suggestions.slice(0, 4).map((item, index) => (\n                        <div key={\`\${item.title}-\${index}\`} className="rounded-[14px] bg-emerald-50 px-3 py-2">\n                          <div className="text-[11px] font-black text-emerald-800">{item.title}</div>\n                          <p className="mt-1 text-[11px] font-semibold leading-5 text-emerald-950/70">{item.detail}</p>\n                        </div>\n                      ))}\n                    </div>\n                  </section>\n                )}\n                <div className="rounded-[14px] bg-slate-50 px-3 py-2 text-[10px] font-bold leading-5 text-ink/45">{isEn ? 'Check the advice against actual water conditions and livestock behavior.' : '请结合实际水质和生物状态判断。'}</div>\n              </div>\n            )}\n          </div>\n          <DialogFooter className="border-t border-border px-5 py-4">\n            <Button type="button" variant="outline" onClick={() => setAiOpen(false)} className="h-11 w-full rounded-full text-sm font-black">{isEn ? 'Close' : '关闭'}</Button>\n          </DialogFooter>\n        </DialogContent>\n      </Dialog>`,
  `      {aiOpen && (\n        <section data-ai-advice-inline className="rounded-[22px] border border-violet-100 bg-violet-50/55 p-4 sm:p-5">\n          <div className="flex items-start justify-between gap-3">\n            <div>\n              <div className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.16em] text-violet-700"><Sparkles className="h-3.5 w-3.5" />{isEn ? 'AI INTERPRETATION' : 'AI 建议'}</div>\n              <h3 className="mt-1 text-[16px] font-black text-ink">{isEn ? 'Why this result, and what can I change?' : '为什么会这样？我具体可以怎么改？'}</h3>\n            </div>\n            <button type="button" onClick={() => setAiOpen(false)} aria-label={isEn ? 'Collapse AI advice' : '收起 AI 建议'} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink/45 hover:text-ink"><X className="h-4 w-4" /></button>\n          </div>\n          {aiLoading && <div className="mt-4 flex min-h-[110px] items-center justify-center gap-2 text-sm font-black text-violet-700"><Loader2 className="h-5 w-5 animate-spin" />{isEn ? 'Generating suggestions…' : '正在生成建议…'}</div>}\n          {!aiLoading && aiResult && (\n            <div className="mt-4 grid gap-3">\n              <div className={\`w-fit rounded-full px-3 py-1 text-[10px] font-black \${aiResult.source === 'model' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}\`}>\n                {aiResult.source === 'model' ? (isEn ? 'AI generated' : 'AI 已生成') : (isEn ? 'AI unavailable. Please try again later.' : 'AI 暂不可用，请稍后再试')}\n              </div>\n              <p className="text-[13px] font-bold leading-6 text-ink">{aiResult.summary}</p>\n              {aiResult.reasons.length > 0 && (\n                <details className="rounded-[16px] bg-white p-3">\n                  <summary className="cursor-pointer text-[11px] font-black text-ink">{isEn ? 'Why' : '查看原因'}</summary>\n                  <div className="mt-2 grid gap-2">{aiResult.reasons.slice(0, 4).map((item, index) => <div key={\`\${item.title}-\${index}\`}><div className="text-[11px] font-black text-ink">{item.title}</div><p className="mt-0.5 text-[11px] font-semibold leading-5 text-ink/58">{item.detail}</p></div>)}</div>\n                </details>\n              )}\n              {aiResult.suggestions.length > 0 && (\n                <div className="grid gap-2 sm:grid-cols-2">{aiResult.suggestions.slice(0, 4).map((item, index) => <div key={\`\${item.title}-\${index}\`} className="rounded-[14px] bg-emerald-50 px-3 py-2"><div className="text-[11px] font-black text-emerald-800">{item.title}</div><p className="mt-1 text-[11px] font-semibold leading-5 text-emerald-950/70">{item.detail}</p></div>)}</div>\n              )}\n              <div className="text-[10px] font-bold leading-5 text-ink/45">{isEn ? 'Check the advice against actual water conditions and livestock behavior.' : '请结合实际水质和生物状态判断。'}</div>\n            </div>\n          )}\n        </section>\n      )}`,
  'inline compatibility AI explanation',
);

// 4) Route continuity: specific Aquarium tasks carry the exact caller route/query/hash/scroll and expose a reversible return affordance.
replaceOnce(
  'src/components/layout/WorkspaceNavigationProvider.tsx',
  `type WorkspaceNavigationValue = {\n  navigateToRoute: (path: string) => void;`,
  `type NavigateToRouteOptions = {\n  returnContext?: WorkspaceNavigationContext;\n};\n\ntype WorkspaceNavigationValue = {\n  navigateToRoute: (path: string, options?: NavigateToRouteOptions) => void;`,
  'navigation route options',
);
replaceOnce(
  'src/components/layout/WorkspaceNavigationProvider.tsx',
  `  const navigateToRoute = useCallback((path: string) => {\n    if (/^\\/login(?:[/?#]|$)/.test(path)) {`,
  `  const navigateToRoute = useCallback((path: string, options: NavigateToRouteOptions = {}) => {\n    if (/^\\/login(?:[/?#]|$)/.test(path)) {`,
  'navigation route signature',
);
replaceOnce(
  'src/components/layout/WorkspaceNavigationProvider.tsx',
  `    if (!canNavigate(path)) return;\n    navigate(path);\n  }, [canNavigate, navigate, showFeaturePreview]);`,
  `    if (!canNavigate(path)) return;\n    const isSpecificAquariumTask = /^\\/aquarium\\?[^#]*\\baction=/.test(path);\n    const autoReturnContext = isSpecificAquariumTask && location.pathname !== '/aquarium'\n      ? {\n          route: location.pathname,\n          query: location.search,\n          hash: location.hash,\n          scrollTop: getScrollTop(),\n        } satisfies WorkspaceNavigationContext\n      : undefined;\n    const workspaceReturnContext = options.returnContext ?? autoReturnContext;\n    navigate(path, workspaceReturnContext ? { state: { workspaceReturnContext } } : undefined);\n  }, [canNavigate, location.hash, location.pathname, location.search, navigate, showFeaturePreview]);`,
  'navigation task return capture',
);
replaceOnce(
  'src/components/layout/WorkspaceNavigationProvider.tsx',
  `  return (\n    <WorkspaceNavigationContextValue.Provider value={value}>\n      {children}\n      {featurePreview && (`,
  `  const workspaceReturnContext = (location.state as { workspaceReturnContext?: WorkspaceNavigationContext } | null)?.workspaceReturnContext;\n  const workspaceReturnLabel = workspaceReturnContext?.route === '/encyclopedia'\n    ? (new URLSearchParams(workspaceReturnContext.query).get('species')\n      ? (isEnglishUi() ? 'Back to species detail' : '返回物种详情')\n      : new URLSearchParams(workspaceReturnContext.query).get('mode') === 'compatibility'\n        ? (isEnglishUi() ? 'Back to compatibility' : '返回混养结果')\n        : (isEnglishUi() ? 'Back to species' : '返回物种页'))\n    : (isEnglishUi() ? 'Back to previous task' : '返回上一任务');\n\n  return (\n    <WorkspaceNavigationContextValue.Provider value={value}>\n      {children}\n      {workspaceReturnContext && location.pathname === '/aquarium' && (\n        <button\n          type="button"\n          data-workspace-return\n          onClick={() => void restoreContext(workspaceReturnContext)}\n          className="fixed left-3 top-[68px] z-[96] inline-flex min-h-10 items-center gap-1.5 rounded-full border border-emerald-100 bg-white/95 px-3 text-xs font-black text-emerald-800 shadow-md backdrop-blur md:left-[calc(var(--desktop-sidebar-width,280px)+20px)]"\n        >\n          <span aria-hidden="true">←</span>{workspaceReturnLabel}\n        </button>\n      )}\n      {featurePreview && (`,
  'navigation return affordance',
);

// 5) Encyclopedia entity detail becomes route-addressable. Browser Back/return can restore the exact detail instead of a generic section home.
replaceOnce(
  'src/pages/Encyclopedia.tsx',
  `      if (params.get('source') === 'search') navigate(-1);\n      else if (params.get('source') === 'daily-discovery' && location.state?.dailyDiscoveryReturn && Number(window.history.state?.idx) > 0) navigate(-1);\n      else navigateToRoute('/encyclopedia');\n      return;`,
  `      if (params.get('source') === 'search') navigate(-1);\n      else if (params.get('source') === 'daily-discovery' && location.state?.dailyDiscoveryReturn && Number(window.history.state?.idx) > 0) navigate(-1);\n      else if (params.get('source') === 'atlas-detail' && Number(window.history.state?.idx) > 0) navigate(-1);\n      else {\n        params.delete('species');\n        if (params.get('source') === 'atlas-detail') params.delete('source');\n        const nextQuery = params.toString();\n        navigate(\`${location.pathname}\${nextQuery ? \`?\${nextQuery}\` : ''}\${location.hash}\`, { replace: true });\n      }\n      return;`,
  'encyclopedia close preserves route',
);
replaceOnce(
  'src/pages/Encyclopedia.tsx',
  `  const openSpeciesDetail = (fish: Fish, sourceId?: string) => {\n    detailNavigationContextRef.current = captureContext(sourceId);\n    setSelectedFish(fish);\n  };`,
  `  const openSpeciesDetail = (fish: Fish, sourceId?: string) => {\n    detailNavigationContextRef.current = captureContext(sourceId);\n    setSelectedFish(fish);\n    const params = new URLSearchParams(location.search);\n    params.set('species', fish.id);\n    if (!params.get('source')) params.set('source', 'atlas-detail');\n    const target = \`${location.pathname}?\${params.toString()}\${location.hash}\`;\n    if (\`${location.pathname}\${location.search}\${location.hash}\` !== target) navigate(target);\n  };`,
  'encyclopedia detail addressable route',
);
replaceOnce(
  'src/pages/Encyclopedia.tsx',
  `    if (!speciesId) {\n      closingDetailRef.current = false;\n      return;\n    }`,
  `    if (!speciesId) {\n      closingDetailRef.current = false;\n      if (selectedFish) setSelectedFish(null);\n      if (selectedGroup) setSelectedGroup(null);\n      return;\n    }`,
  'encyclopedia browser-back closes detail',
);
replaceOnce(
  'src/pages/Encyclopedia.tsx',
  `        onViewInTank={() => {\n          closeAtlasDetail(false);\n          navigateToRoute(taskRoutes.aquarium.livestock);\n        }}`,
  `        onViewInTank={() => {\n          const returnContext = captureContext();\n          closeAtlasDetail(false);\n          navigateToRoute(taskRoutes.aquarium.livestock, { returnContext });\n        }}`,
  'species detail view-tank return context',
);

console.log('UI interaction repair migration completed');
