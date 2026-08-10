import { readFileSync, writeFileSync } from 'node:fs';
const edit = (path, fn) => { const s = readFileSync(path, 'utf8'); writeFileSync(path, fn(s), 'utf8'); };

edit('src/pages/AIAssistant.tsx', s => s.replace(/content:\s*error instanceof Error \? error\.message : '[^'\n]*'/, "content: isEn ? 'AI is temporarily unavailable. Please try again later.' : 'AI 暂不可用，请稍后再试。'"));

edit('src/pages/Settings.tsx', s => s.replace("setFeedbackError(error instanceof Error ? error.message : (isEn ? 'Your feedback could not be submitted. Try again later.' : '反馈暂时没有提交成功，请稍后重试。'));", "setFeedbackError(isEn ? 'Your feedback could not be submitted. Try again later.' : '反馈暂时没有提交成功，请稍后重试。');"));

edit('src/pages/CareEncyclopedia.tsx', s => s
  .replace("setCtaFeedback(error instanceof Error ? error.message : (isEn ? 'Failed to save reminder' : '提醒保存失败'));", "setCtaFeedback(isEn ? 'Could not save the reminder. Try again.' : '提醒保存失败，请重试。');")
  .replace("setCtaFeedback(error instanceof Error ? error.message : (isEn ? 'Failed to save operation record' : '操作记录保存失败'));", "setCtaFeedback(isEn ? 'Could not save the operation. Try again.' : '操作记录保存失败，请重试。');")
  .replace("setCtaFeedback(error instanceof Error ? error.message : (isEn ? 'Failed to save care checklist' : '护理清单保存失败'));", "setCtaFeedback(isEn ? 'Could not save the checklist. Try again.' : '护理清单保存失败，请重试。');"));

edit('src/pages/Identify.tsx', s => s
  .replace("const message = error instanceof Error ? error.message : t('identify.recognitionFailed');", "const message = t('identify.recognitionFailed');")
  .replace("const message = error instanceof Error ? error.message : t('identify.diagnosisFailed');", "const message = t('identify.diagnosisFailed');"));

edit('src/pages/AdminContent.tsx', s => s.replace("const errorMessage = (error: unknown) => error instanceof Error ? error.message : '操作没有完成，请稍后重试。';", "const errorMessage = (_error: unknown) => '操作没有完成，请稍后重试。';"));

edit('src/components/aquarium/LivestockRosterDialog.tsx', s => s
  .replace("setRemoveError(error instanceof Error ? error.message : '移出失败，请稍后重试。');", "setRemoveError('移出失败，请稍后重试。');")
  .replace("setStartedAtError(error instanceof Error ? error.message : '日期保存失败，请重试。')", "setStartedAtError('日期保存失败，请重试。')"));

edit('src/components/SpeciesDetailDialog.tsx', s => s
  .replace("setDeathError(error instanceof Error ? error.message : (t('encyclopedia.freshwater') === '淡水' ? '保存失败，请稍后重试。' : 'Save failed, please try again later.'));", "setDeathError(t('encyclopedia.freshwater') === '淡水' ? '保存失败，请稍后重试。' : 'Save failed, please try again later.');")
  .replace("setExportError(error instanceof Error ? error.message : (isEn ? 'Save failed. Please try again.' : '保存失败，请稍后重试。'));", "setExportError(isEn ? 'Save failed. Please try again.' : '保存失败，请稍后重试。');")
  .replace("setExportError(error instanceof Error ? error.message : (isEn ? 'Print failed. Please try again.' : '打印失败，请稍后重试。'));", "setExportError(isEn ? 'Print failed. Please try again.' : '打印失败，请稍后重试。');"));

console.log('User-facing error copy follow-up applied');
