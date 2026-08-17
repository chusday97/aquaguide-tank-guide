import fs from 'node:fs';

const path = 'src/lib/tankCompatibilityEngine.ts';
let source = fs.readFileSync(path, 'utf8');

const replaceExact = (from, to, expected = 1) => {
  const count = source.split(from).length - 1;
  if (count !== expected) {
    throw new Error(`Expected ${expected} exact match(es), found ${count}: ${from.slice(0, 120)}`);
  }
  source = source.replace(from, to);
};

replaceExact(
  "import { getReviewedCompatibilityProfile, getReviewedPairRule } from '../data/compatibilityEvidence';",
  "import { getReviewedCompatibilityProfile, getReviewedPairRule, type ReviewedPairRule } from '../data/compatibilityEvidence';",
);

const helperAnchor = `const dedupeRules = (rules: TankCompatibilityRule[]) => {\n  const seen = new Set<string>();\n  return rules.filter(rule => {\n    const key = \`\${rule.code}::\${rule.title}::\${rule.evidence}\`;\n    if (seen.has(key)) return false;\n    seen.add(key);\n    return true;\n  });\n};\n`;

const helper = `${helperAnchor}\nconst formatReviewedPairRuleEvidence = (rule: ReviewedPairRule) => rule.basis === 'pair_rule'\n  ? \`\${rule.reason} 该结论有直接配对或捕食风险实验支持；实验条件不等于家庭水族箱长期同缸，因此不外推为“已观察到长期同缸捕食”。\`\n  : \`\${rule.reason} 此结论根据两种生物各自的已审核行为资料推断，并非直接配对实验。\`;\n`;
replaceExact(helperAnchor, helper);

replaceExact(
  '`${reviewedPairRule.reason} 此结论根据两种生物各自的已审核行为资料推断，并非直接配对实验。`',
  'formatReviewedPairRuleEvidence(reviewedPairRule)',
);
replaceExact(
  '`${pairRule.reason} 此结论根据两种生物各自的已审核行为资料推断，并非直接配对实验。`',
  'formatReviewedPairRuleEvidence(pairRule)',
);

fs.writeFileSync(path, source);
console.log('pair evidence provenance exact-anchor patch applied');
