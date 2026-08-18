import fs from 'node:fs';

const replaceOnce = (path, before, after, label) => {
  const source = fs.readFileSync(path, 'utf8');
  if (!source.includes(before)) throw new Error(`${label}: anchor not found in ${path}`);
  fs.writeFileSync(path, source.replace(before, after));
  console.log(`patched ${label}`);
};

replaceOnce(
  'src/components/aquarium/LivestockRosterDialog.tsx',
  `import { Share2, X } from 'lucide-react';`,
  `import { ArrowLeft, Share2, X } from 'lucide-react';`,
  'livestock return icon',
);

replaceOnce(
  'src/components/aquarium/LivestockRosterDialog.tsx',
  `import { useTranslation } from 'react-i18next';\nimport { QuantityStepper } from '../forms/QuantityStepper';`,
  `import { useTranslation } from 'react-i18next';\nimport { useLocation } from 'react-router-dom';\nimport { useWorkspaceNavigation } from '../layout/WorkspaceNavigationProvider';\nimport type { WorkspaceNavigationContext } from '../../types/navigation';\nimport { QuantityStepper } from '../forms/QuantityStepper';`,
  'livestock navigation imports',
);

replaceOnce(
  'src/components/aquarium/LivestockRosterDialog.tsx',
  `  const { i18n } = useTranslation();\n  const isEn = i18n.language !== 'zh-CN';\n  const [removal, setRemoval] = useState<RemovalDraft | null>(null);`,
  `  const { i18n } = useTranslation();\n  const isEn = i18n.language !== 'zh-CN';\n  const location = useLocation();\n  const { restoreContext } = useWorkspaceNavigation();\n  const workspaceReturnContext = (location.state as { workspaceReturnContext?: WorkspaceNavigationContext } | null)?.workspaceReturnContext;\n  const workspaceReturnLabel = workspaceReturnContext?.route === '/encyclopedia'\n    ? (new URLSearchParams(workspaceReturnContext.query).get('species')\n      ? (isEn ? 'Back to species detail' : '返回物种详情')\n      : new URLSearchParams(workspaceReturnContext.query).get('mode') === 'compatibility'\n        ? (isEn ? 'Back to compatibility' : '返回混养结果')\n        : (isEn ? 'Back to species' : '返回物种页'))\n    : (isEn ? 'Back to previous task' : '返回上一任务');\n  const [removal, setRemoval] = useState<RemovalDraft | null>(null);`,
  'livestock modal return context',
);

replaceOnce(
  'src/components/aquarium/LivestockRosterDialog.tsx',
  `            actions={(\n              editingRecordId ? undefined : (\n                <>\n                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))} aria-label={isEn ? 'Sharing is coming' : '分享功能建设中'} title={isEn ? 'Sharing is coming' : '分享功能建设中'} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-400 shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300">\n                  <Share2 className="h-4 w-4" />\n                </button>\n                                </>\n              )\n            )}`,
  `            actions={(\n              <>\n                {workspaceReturnContext && !editingRecordId && (\n                  <button\n                    type="button"\n                    data-workspace-dialog-return\n                    onClick={() => void restoreContext(workspaceReturnContext)}\n                    aria-label={workspaceReturnLabel}\n                    title={workspaceReturnLabel}\n                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 text-xs font-black text-emerald-800 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"\n                  >\n                    <ArrowLeft className="h-4 w-4" />\n                    <span className="hidden sm:inline">{workspaceReturnLabel}</span>\n                  </button>\n                )}\n                {!editingRecordId && (\n                  <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))} aria-label={isEn ? 'Sharing is coming' : '分享功能建设中'} title={isEn ? 'Sharing is coming' : '分享功能建设中'} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-400 shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300">\n                    <Share2 className="h-4 w-4" />\n                  </button>\n                )}\n              </>\n            )}`,
  'livestock modal-local return action',
);

replaceOnce(
  'src/components/layout/WorkspaceNavigationProvider.tsx',
  `      {workspaceReturnContext && location.pathname === '/aquarium' && (`,
  `      {workspaceReturnContext && location.pathname === '/aquarium' && new URLSearchParams(location.search).get('action') !== 'livestock' && (`,
  'suppress inaccessible duplicate global return behind livestock modal',
);

replaceOnce(
  'scripts/test-ui-interaction-repair-v1.mjs',
  `const navigation = read('src/components/layout/WorkspaceNavigationProvider.tsx');\nconst encyclopedia = read('src/pages/Encyclopedia.tsx');`,
  `const navigation = read('src/components/layout/WorkspaceNavigationProvider.tsx');\nconst roster = read('src/components/aquarium/LivestockRosterDialog.tsx');\nconst encyclopedia = read('src/pages/Encyclopedia.tsx');`,
  'source contract reads roster',
);

replaceOnce(
  'scripts/test-ui-interaction-repair-v1.mjs',
  `assert(navigation.includes('data-workspace-return'), 'Destination must expose an explicit return affordance');\nassert(navigation.includes("isSpecificAquariumTask"), 'Aquarium task routes must be distinguished from the generic Aquarium home');`,
  `assert(navigation.includes('data-workspace-return'), 'Non-modal destinations must expose an explicit return affordance');\nassert(navigation.includes("get('action') !== 'livestock'"), 'Global return must not render behind the livestock modal');\nassert(navigation.includes("isSpecificAquariumTask"), 'Aquarium task routes must be distinguished from the generic Aquarium home');\nassert(roster.includes('data-workspace-dialog-return'), 'Modal task destinations must place their return action inside the active Dialog layer');\nassert(roster.includes('restoreContext(workspaceReturnContext)'), 'Livestock modal return must restore the exact caller context');`,
  'source contract modal return',
);

replaceOnce(
  'scripts/verify-ui-interaction-repair-v1.mjs',
  `    const returnButton = page.locator('[data-workspace-return]');\n    await returnButton.waitFor();\n    assert.match((await returnButton.textContent()) || '', /返回物种详情/, 'Aquarium task must explain that it returns to the species detail, not a generic home.');\n    await returnButton.click();`,
  `    assert.equal(await page.locator('[data-workspace-return]').count(), 0, 'Global return must not sit inert behind the livestock Dialog.');\n    const returnButton = page.locator('[data-workspace-dialog-return]');\n    await returnButton.waitFor();\n    assert.equal(await returnButton.getAttribute('aria-hidden'), null, 'Dialog-local return must remain in the active accessibility tree.');\n    assert.match((await returnButton.getAttribute('aria-label')) || '', /返回物种详情/, 'Aquarium task must explain that it returns to the species detail, not a generic home.');\n    await returnButton.click();`,
  'browser contract uses modal-local return',
);

console.log('PASS: modal-local return fix applied');
