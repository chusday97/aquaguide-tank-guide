import { readFileSync, writeFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const write = (path, content) => writeFileSync(path, content, 'utf8');

{
  const path = 'src/components/layout/WorkspaceNavigationProvider.tsx';
  let source = read(path);
  const from = "      if (/^\\/login(?:[/?#]|$)/.test(href)) return 'auth';";
  const to = "      if (/^\\/login(?:[/?#]|$)/.test(href) || /^(登录|去登录|Sign in|Log in)$/i.test(text) || /云端同步|Cloud sync/i.test(text)) return 'auth';";
  if (!source.includes(from)) throw new Error('auth feature matcher not found');
  source = source.replace(from, to);
  write(path, source);
}

{
  const path = 'src/pages/CareEncyclopedia.tsx';
  let source = read(path);
  const pattern = /const getRecommendationReasonLocalized = \(reason: string, isEn = false\) => \{[\s\S]*?\n\};\n\nconst getCareImage/;
  if (!pattern.test(source)) throw new Error('recommendation localization block not found');
  source = source.replace(pattern, `const getRecommendationReasonLocalized = (reason: string, isEn = false) => {\n  if (!isEn) return reason;\n  const map: Record<string, string> = {\n    '最近添加了新生物': 'New livestock added',\n    '新缸优先检查水质稳定情况': 'New tank: check water stability',\n    '有生物处于繁殖阶段': 'Breeding stage detected',\n    '过滤设备尚未设置': 'Filter not set',\n    '还没有换水记录': 'No water-change record',\n    '暂无鱼缸数据': 'No tank data',\n    '日常喂食和残饵管理会影响水质稳定。': 'Feeding and leftovers affect water stability.',\n  };\n  return map[reason] || reason;\n};\n\nconst getCareImage`);
  write(path, source);
}
