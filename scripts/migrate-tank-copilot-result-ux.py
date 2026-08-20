from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'{label} anchor missing; refusing Tank Copilot migration')
    return text.replace(old, new, 1)


# Live product surface: keep deterministic Copilot policy intact and migrate only entry + presentation.
aquarium_path = Path('src/pages/Aquarium.tsx')
aquarium = aquarium_path.read_text()

aquarium = replace_once(
    aquarium,
    "import { VisualResultCard } from '../components/visual-results/VisualResultCard';",
    "import { VisualResultCard } from '../components/visual-results/VisualResultCard';\nimport { DecisionResultSurface } from '../components/result/DecisionResultSurface';",
    'DecisionResultSurface import',
)

aquarium = replace_once(
    aquarium,
    "  const openTankBuildCopilot = () => {\n    window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'ai-care' } }));\n  };",
    "  const openTankBuildCopilot = () => {\n    setIsTankCopilotOpen(true);\n  };",
    'live Tank Copilot entry',
)

aquarium = replace_once(
    aquarium,
    '''              {tankCopilotResult ? (\n                <>\n                  <section className="rounded-[20px] border border-emerald-100 bg-emerald-50/70 p-4">''',
    '''              {tankCopilotResult ? (\n                <>\n                  {!tankCopilotNeedsAnswers && (\n                    <DecisionResultSurface\n                      testId="tank-copilot-decision"\n                      isEn={isEn}\n                      tone="info"\n                      eyebrow={isEn ? 'AI ASSISTED' : 'AI 辅助'}\n                      statusLabel={tankCopilotResult.source === 'model'\n                        ? (isEn ? 'AI suggestion · local rules stay authoritative' : 'AI 建议 · 本地规则仍为准')\n                        : (isEn ? 'Local fallback' : '本地回退')}\n                      title={tankCopilotActionView.label}\n                      summary={tankCopilotActionView.description}\n                      primarySource={tankCopilotResult.source === 'model'\n                        ? {\n                            id: 'tank-copilot-model-context',\n                            label: isEn ? 'AI-generated supporting context' : 'AI 生成的辅助解释',\n                            status: 'candidate',\n                          }\n                        : undefined}\n                      primaryControl={(\n                        <Button\n                          type="button"\n                          data-tank-copilot-primary-action\n                          className="h-11 w-full rounded-full bg-accent px-6 text-sm font-black text-white sm:w-auto"\n                          disabled={isTankCopilotPrimaryDisabled}\n                          onClick={handleTankCopilotPrimaryAction}\n                        >\n                          {tankCopilotPrimaryLabel}\n                        </Button>\n                      )}\n                      evidence={[\n                        tankCopilotResult.goalUnderstanding,\n                        tankCopilotResult.planSummary || '',\n                      ]}\n                    >\n                      <p data-tank-copilot-ai-boundary className="rounded-[14px] bg-slate-50 px-3 py-2 text-[10px] font-bold leading-5 text-ink/55">\n                        {isEn\n                          ? 'AI organizes the plan only. Species compatibility, risk level, and whether an addition is allowed remain governed by local product rules.'\n                          : 'AI 只负责整理方案；物种兼容、风险等级与是否允许加入仍以本地规则结果为准。'}\n                      </p>\n                    </DecisionResultSurface>\n                  )}\n                  <section className={`${tankCopilotNeedsAnswers ? '' : 'hidden'} rounded-[20px] border border-emerald-100 bg-emerald-50/70 p-4`}>''',
    'decision-first Copilot result insertion',
)

aquarium = replace_once(
    aquarium,
    '''                    <p className="mt-2 text-sm font-bold leading-relaxed text-ink">\n                      {tankCopilotResult.source === 'model'\n                        ? tankCopilotResult.goalUnderstanding\n                        : 'AI 暂不可用，请查看下方建议。'}\n                    </p>''',
    '''                    <p className="mt-2 text-sm font-bold leading-relaxed text-ink">\n                      {tankCopilotNeedsAnswers\n                        ? (tankCopilotResult.source === 'model'\n                            ? tankCopilotResult.goalUnderstanding\n                            : 'AI 暂不可用，请查看下方建议。')\n                        : null}\n                    </p>''',
    'hide model goal interpretation after result is actionable',
)

aquarium = replace_once(
    aquarium,
    '''                  {!tankCopilotNeedsAnswers && Boolean(tankCopilotResult.planSummary?.trim()) && (\n                    <section className="rounded-[20px] border border-border bg-white p-4">\n                      <div className="text-sm font-black text-ink">{isEn ? 'Recommended Direction' : '推荐方向'}</div>\n                      <div className="mt-3 rounded-[14px] bg-bg px-3 py-2 text-xs font-bold leading-relaxed text-ink/65">\n                        {tankCopilotResult.planSummary}\n                      </div>\n                    </section>\n                  )}\n''',
    '',
    'remove duplicate model plan summary card',
)

aquarium = replace_once(
    aquarium,
    '''                    <div className="text-sm font-black text-ink">{isEn ? 'Next step' : '下一步'}</div>\n                    <div className="mt-3 rounded-[16px] bg-emerald-50 px-3 py-3">\n                      <div className="text-xs font-black text-emerald-700">{isEn ? 'Recommended First' : '建议先做'}</div>\n                      <div className="mt-1 text-sm font-black text-ink">{tankCopilotActionView.label}</div>\n                      <div className="mt-1 text-[11px] font-bold leading-relaxed text-ink/55">\n                        {tankCopilotActionView.description}\n                      </div>\n                    </div>''',
    '''                    <div className="hidden text-sm font-black text-ink">{isEn ? 'Next step' : '下一步'}</div>\n                    <div className="hidden mt-3 rounded-[16px] bg-emerald-50 px-3 py-3">\n                      <div className="text-xs font-black text-emerald-700">{isEn ? 'Recommended First' : '建议先做'}</div>\n                      <div className="mt-1 text-sm font-black text-ink">{tankCopilotActionView.label}</div>\n                      <div className="mt-1 text-[11px] font-bold leading-relaxed text-ink/55">\n                        {tankCopilotActionView.description}\n                      </div>\n                    </div>''',
    'hide duplicate next-action card while preserving blocked disclosure',
)

aquarium = replace_once(
    aquarium,
    '''              className="h-11 rounded-full bg-accent px-6 text-sm font-black text-white"\n              disabled={isTankCopilotPrimaryDisabled}\n              onClick={handleTankCopilotPrimaryAction}''',
    '''              className={`${tankCopilotResult && !tankCopilotNeedsAnswers ? 'hidden' : ''} h-11 rounded-full bg-accent px-6 text-sm font-black text-white`}\n              disabled={isTankCopilotPrimaryDisabled}\n              onClick={handleTankCopilotPrimaryAction}''',
    'hide duplicate footer primary after decision is ready',
)

aquarium_path.write_text(aquarium)


# Permanent static Result UX contract for the live Tank Copilot surface.
contract_path = Path('scripts/test-result-ux-contract.mjs')
contract = contract_path.read_text()
contract = replace_once(
    contract,
    "const identify = fs.readFileSync('src/pages/Identify.tsx', 'utf8');",
    "const identify = fs.readFileSync('src/pages/Identify.tsx', 'utf8');\nconst aquarium = fs.readFileSync('src/pages/Aquarium.tsx', 'utf8');",
    'Aquarium contract source',
)
contract = replace_once(
    contract,
    "\nconsole.log('Result UX V1 contract: PASS');",
    '''\nassert(aquarium.includes("import { DecisionResultSurface } from '../components/result/DecisionResultSurface';"), 'Live Tank Copilot must import the shared decision surface');\nassert(aquarium.includes("const openTankBuildCopilot = () => {\\n    setIsTankCopilotOpen(true);\\n  };"), 'Live Tank Copilot quick action must open the real Copilot dialog');\nassert(aquarium.includes('testId="tank-copilot-decision"'), 'Live Tank Copilot must expose a shared decision-first result');\nassert(aquarium.includes('data-tank-copilot-primary-action'), 'Tank Copilot decision must expose one stable primary-action selector');\nassert(aquarium.includes('data-tank-copilot-ai-boundary'), 'Tank Copilot must expose an explicit AI-vs-local-rule authority boundary');\nassert(aquarium.includes("label: isEn ? 'AI-generated supporting context' : 'AI 生成的辅助解释'"), 'Model-originated Copilot context must be visibly identified as AI-generated');\nassert(aquarium.includes("status: 'candidate'"), 'Model-originated Copilot context must remain candidate evidence, never Verified');\nassert(aquarium.includes('tankCopilotResult.goalUnderstanding') && aquarium.includes("tankCopilotResult.planSummary || ''"), 'Model interpretation and plan summary must move behind shared progressive disclosure');\nassert(!aquarium.includes("isEn ? 'Recommended Direction' : '推荐方向'"), 'Legacy always-visible model plan-summary card must stay removed');\nassert(aquarium.includes("tankCopilotResult && !tankCopilotNeedsAnswers ? 'hidden' : ''"), 'Legacy footer primary must not duplicate the decision-surface primary action');\n\nconsole.log('Result UX V1 contract: PASS');''',
    'Tank Copilot permanent static assertions',
)
contract_path.write_text(contract)

print('Tank Copilot Result UX product migration prepared')
