from pathlib import Path
import re
for path in Path('src').rglob('*'):
    if path.suffix not in {'.ts', '.tsx'}:
        continue
    for i, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        if any(token in line for token in ["navigate('/aquarium", "navigate('/care", "navigate('/encyclopedia", "navigate('/collection", "navigateToRoute('/aquarium", "navigateToRoute('/care", "navigateToRoute('/encyclopedia", "navigateToRoute('/collection"]):
            print(f'{path}:{i}: {line.strip()}')
