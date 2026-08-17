from pathlib import Path

path = Path('HANDOFF-2026-08-17.md')
text = path.read_text()
old = "### Evidence Batch 3 — Channa argus × Rhodeus ocellatus direct pair — guarded branch PASS\n\nUsage-first selector"
new = "### Evidence Batch 3 — Channa argus × Rhodeus ocellatus direct pair — 已合入 main\n\nPR #82 `Expand reviewed compatibility evidence batch 3` 已 squash merge，merge commit：`19ef8d62f731b1d6a95049359659cafde8de66fe`。最终 Product Golden Path **#572 / run 32042182281** 在 head `95c52fcc61f3252c706294aeb6a5dcda005ab96d` + base `fe82042b0648b43b01bed120d2ca04dca7ec63e9` 上验证：contracts / typecheck / build / GP-001～GP-005 全 PASS。\n\nUsage-first selector"
count = text.count(old)
if count != 1:
    raise SystemExit(f'Batch 3 merge anchor: expected exactly one, found {count}')
text = text.replace(old, new, 1)
old2 = "Guard Run **32041864463** 已 PASS：exact-anchor patch / product registry / compatibility evidence regression / compatibility scorecard / TypeScript 全绿，临时 workflow/script 已自删除。"
new2 = old2 + " Handoff sync Run **32042035371** 同样 PASS 并自删除临时 tooling。"
count2 = text.count(old2)
if count2 != 1:
    raise SystemExit(f'Batch 3 guard anchor: expected exactly one, found {count2}')
text = text.replace(old2, new2, 1)
path.write_text(text)
