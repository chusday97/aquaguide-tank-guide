import { readFile, writeFile } from 'node:fs/promises';

const path = 'src/pages/Aquarium.tsx';
const source = await readFile(path, 'utf8');
const search = `      setSelectedAddFishItems(result.failedItems
        .filter(isVerifiedExistingLivestockItem)
        .map(item => ({
          fishId: item.fishId,
          quantity: item.quantity,
          entryDate: item.entryDate || format(new Date(), 'yyyy-MM-dd'),
        })));
`;
const replacement = `      setSelectedAddFishItems(result.failedItems.flatMap(item => (
        isVerifiedExistingLivestockItem(item)
          ? [{
              fishId: item.fishId,
              quantity: item.quantity,
              entryDate: item.entryDate || format(new Date(), 'yyyy-MM-dd'),
            }]
          : []
      )));
`;
const count = source.split(search).length - 1;
if (count !== 1) throw new Error(`Expected exactly one verified retry block, found ${count}`);
await writeFile(path, source.replace(search, replacement), 'utf8');
console.log('verified failures retry through catalog selection; unresolved failures keep raw identity only');
