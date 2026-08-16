from pathlib import Path

path = Path('scripts/test-care-aquarium-hydration.ts')
text = path.read_text()
old = """// Direct Care entry hydrates collection favorites, canonical aquarium facts, and canonical care events.\nassert.match(care, /const \\[favoriteSnapshot, aquariums, careEvents\\] = await Promise\\.all\\(\\[\\s+repository\\.getFavorites\\(\\),\\s+repository\\.getAquariums\\(\\),\\s+repository\\.getCareEvents\\(\\),\\s+\\]\\)/s);\nassert.match(care, /const currentAquariumId = cachedState\\.currentAquariumId\\s+&& aquariums\\.some\\(item => item\\.id === cachedState\\.currentAquariumId\\)/s);\nassert.match(care, /patchLocalAppState\\(\\{ aquariums, currentAquariumId, careEvents \\}\\);/);\nassert.match(care, /鱼缸数据暂时无法同步，当前显示本机缓存。/);\n"""
new = """// Direct Care entry hydrates every account-level fact the page consumes.\n// Keep this contract capability-based: adding a new canonical read must not fail merely\n// because Promise.all gains another item or a local variable changes shape.\nfor (const canonicalRead of [\n  'repository.getFavorites()',\n  'repository.getAquariums()',\n  'repository.getCareEvents()',\n  'repository.getCareChecklistProgress()',\n]) {\n  assert.ok(care.includes(canonicalRead), `Care direct hydration missing ${canonicalRead}`);\n}\nassert.match(care, /const currentAquariumId = cachedState\\.currentAquariumId\\s+&& aquariums\\.some\\(item => item\\.id === cachedState\\.currentAquariumId\\)/s);\nassert.match(care, /setSavedCareChecklists\\(checklistProgress\\);/);\nassert.match(care, /patchLocalAppState\\(\\{ aquariums, currentAquariumId, careEvents \\}\\);/);\nassert.match(care, /鱼缸数据暂时无法同步，当前显示本机缓存。/);\n"""
if text.count(old) != 1:
    raise SystemExit(f'hydration regression block: expected 1 match, found {text.count(old)}')
text = text.replace(old, new, 1)
text = text.replace(
    "console.log('care aquarium hydration contract passed: direct Care entry hydrates repository aquarium facts and canonical care events');",
    "console.log('care aquarium hydration contract passed: direct Care entry hydrates favorites, aquarium facts, care events, and checklist progress');",
)
path.write_text(text)
print('06-hydration-regression.py applied')
