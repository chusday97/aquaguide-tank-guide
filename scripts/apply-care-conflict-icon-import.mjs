import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../src/pages/CareEncyclopedia.tsx', import.meta.url);
let source = await readFile(path, 'utf8');
const before = "import { AlertTriangle, Baby, Check, ChevronDown, ChevronRight, Copy, Droplets, ExternalLink, Fish, Heart, HelpCircle, Loader2, Maximize2, Search, Settings, Stethoscope, Waves } from 'lucide-react';";
const after = "import { AlertTriangle, Baby, Check, ChevronDown, ChevronRight, Copy, Droplets, ExternalLink, Fish, Heart, HelpCircle, Loader2, Maximize2, Search, Settings, ShieldAlert, Stethoscope, Waves } from 'lucide-react';";
const first = source.indexOf(before);
if (first < 0) throw new Error('Care lucide import anchor not found');
if (source.indexOf(before, first + before.length) >= 0) throw new Error('Care lucide import anchor is not unique');
source = source.slice(0, first) + after + source.slice(first + before.length);
await writeFile(path, source, 'utf8');
console.log('Care ShieldAlert icon import added');
