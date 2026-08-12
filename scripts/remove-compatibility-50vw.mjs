import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/components/CompatibilityRiskCalculator.tsx';
const text = readFileSync(path, 'utf8');
const before = 'fixed bottom-0 right-0 top-0 z-[80] grid h-[100dvh] w-full content-start gap-4 overflow-y-auto rounded-none border-l border-emerald-100 bg-white p-4 shadow-[-24px_0_60px_rgba(15,23,42,0.18)] animate-in slide-in-from-right-full duration-200 sm:w-[50vw] sm:min-w-0 sm:max-w-none sm:rounded-l-[28px] md:p-5';
const after = 'fixed bottom-0 right-0 top-0 z-[80] grid h-[100dvh] w-full content-start gap-4 overflow-y-auto rounded-none border-l border-emerald-100 bg-white p-4 shadow-[-24px_0_60px_rgba(15,23,42,0.18)] animate-in slide-in-from-right-full duration-200 sm:min-w-0 sm:rounded-l-[24px] md:p-5';
if (!text.includes(before)) throw new Error('Expected legacy compatibility drawer class not found');
const next = text.replace(before, after);
if (next.includes('sm:w-[50vw]')) throw new Error('Legacy 50vw compatibility width still present');
writeFileSync(path, next);
console.log('Compatibility drawer no longer carries a 50vw utility width.');
