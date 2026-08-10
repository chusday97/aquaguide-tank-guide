import { readFileSync, writeFileSync } from 'node:fs';
{
  const path = 'src/pages/Aquarium.tsx';
  let s = readFileSync(path, 'utf8');
  s = s.replace("description: `打开 ${tankCopilotAllowedCandidates.length} 个的候选，不写入真实鱼缸。`,", "description: isEn ? `View ${tankCopilotAllowedCandidates.length} candidates suitable for the current aquarium.` : `查看 ${tankCopilotAllowedCandidates.length} 个适合当前鱼缸的候选。`,");
  writeFileSync(path, s, 'utf8');
}
{
  const path = 'src/pages/CareEncyclopedia.tsx';
  let s = readFileSync(path, 'utf8');
  s = s.replace(`                  <div className="mt-0.5 text-[11px] font-bold text-ink/45">\n                    {''}\n                  </div>\n`, '');
  writeFileSync(path, s, 'utf8');
}
console.log('Final polish applied');
