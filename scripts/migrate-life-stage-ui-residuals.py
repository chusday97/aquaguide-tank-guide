from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'{label} anchor missing; refusing residual migration')
    return text.replace(old, new, 1)

path = Path('src/pages/Aquarium.tsx')
text = path.read_text()

text = replace_once(
    text,
    "      setSelectedAddFishItems(result.failedItems.map(item => ({\n        fishId: item.fishId,\n        quantity: item.quantity,\n        entryDate: item.entryDate || format(new Date(), 'yyyy-MM-dd'),\n      })));",
    "      setSelectedAddFishItems(result.failedItems.map(item => ({\n        fishId: item.fishId,\n        quantity: item.quantity,\n        entryDate: item.entryDate || format(new Date(), 'yyyy-MM-dd'),\n        lifeStage: item.lifeStage ?? 'unknown',\n      })));",
    'record-existing retry lifeStage',
)

text = replace_once(
    text,
    "    setSelectedAddFishItems(templateFish.map(({ fish, quantity }) => ({ fishId: fish.id, quantity, entryDate })));",
    "    setSelectedAddFishItems(templateFish.map(({ fish, quantity }) => ({ fishId: fish.id, quantity, entryDate, lifeStage: 'unknown' })));",
    'build-template planned addition lifeStage',
)

path.write_text(text)
print('Life-stage residual capture migration prepared')
