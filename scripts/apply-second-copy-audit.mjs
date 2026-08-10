import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const roots = ['src', 'public'];
const textExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.md']);

const replacements = [
  ['你的专属水族助手', '管理你的鱼缸状态'],
  ['根据你的记录生成建议', '根据鱼缸数据提供建议'],
  ['AI 会帮助你分析问题', 'AI 可帮助分析鱼缸问题'],
  ['你的智能水族管理伙伴', '帮你记录和管理鱼缸状态'],
  ['为了 AI 分析，请完善以下信息', '完善信息后，可以获得更准确的建议'],
  ['距离解锁 AI 还差 2 项', '补充 2 项信息，提升建议准确度'],
  ['系统会根据这些数据判断风险', '用于生成更适合你的养护建议'],
  ['请填写所有必要参数', '补充缺少的信息'],
  ['AI 不是专业医生，仅供参考', '建议结合实际水质和观察情况判断'],
  ['AI 分析完成', '分析完成'],
  ['暂无数据，请稍后重试', '暂时没有记录'],
  ['系统未找到相关信息', '没有找到相关内容'],
  ['请求异常', '暂时无法加载，请稍后再试'],

  ['系统正在持续观察你的鱼缸状态', ''],
  ['正在调用模型生成结果', ''],
  ['DeepSeek 已连接', ''],
  ['AI 服务正常运行', ''],
  ['开始你的养鱼旅程吧', ''],
  ['AI Ready', ''],
  ['Complete Profile', ''],
  ['这些信息用于 AI 和规则计算', ''],
  ['缺失字段检查', ''],
  ['保存成功，数据已同步', ''],
  ['基于规则和 AI 模型生成', ''],
  ['模型可能产生错误结果', ''],
  ['本次回答来自 AI', ''],
  ['加载失败 Error 500', ''],

  ['// AQUAGUIDE_PRODUCT_UX_CLOSURE_V1\n', ''],
  ['// AQUAGUIDE_PRODUCT_UX_CLOSURE_V2\n', ''],
];

const changedFiles = [];
const hitCounts = new Map(replacements.map(([from]) => [from, 0]));

const walk = dir => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path);
      continue;
    }
    if (!textExtensions.has(extname(path))) continue;

    const original = readFileSync(path, 'utf8');
    let next = original;
    for (const [from, to] of replacements) {
      if (!next.includes(from)) continue;
      const count = next.split(from).length - 1;
      hitCounts.set(from, (hitCounts.get(from) || 0) + count);
      next = next.split(from).join(to);
    }
    if (next !== original) {
      writeFileSync(path, next, 'utf8');
      changedFiles.push(path);
    }
  }
};

for (const root of roots) walk(root);

console.log(`Second copy audit changed ${changedFiles.length} file(s).`);
for (const path of changedFiles) console.log(`- ${path}`);
console.log('Matched copy entries:');
for (const [text, count] of hitCounts) {
  if (count > 0) console.log(`${count}x ${JSON.stringify(text)}`);
}
