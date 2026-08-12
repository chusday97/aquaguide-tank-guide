from pathlib import Path

path = Path('scripts/apply-core-flow-consolidation-patch.py')
text = path.read_text()
old = '''def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 exact match, got {count}")
    return text.replace(old, new, 1)
'''
new = '''def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if label == "future date derivation" and count == 2:
        head, separator, tail = text.rpartition(old)
        return head + new + tail
    if count != 1:
        raise SystemExit(f"{label}: expected 1 exact match, got {count}")
    return text.replace(old, new, 1)
'''
if text.count(old) != 1:
    raise SystemExit('replace_once helper shape changed; stop rather than patch the wrong code')
path.write_text(text.replace(old, new, 1))
