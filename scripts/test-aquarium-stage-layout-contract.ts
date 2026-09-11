import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('src/pages/Aquarium.tsx', 'utf8');
const css = fs.readFileSync('src/styles/aquarium-stage-layout-v4.css', 'utf8');

assert.match(page, /<div className="aquarium-dashboard-tank">[\s\S]*?\{tank\}[\s\S]*?<aside className="aquarium-dashboard-rail"[\s\S]*?\{status\}[\s\S]*?<section[^>]*className="aquarium-dashboard-actions"[\s\S]*?\{actions\}/, 'tank, status and action dock must share one stage container');
assert.match(page, /className="aquarium-tank[^\"]*relative[^\"]*w-full/, 'the visual tank must remain a full-width stage layer');
assert.match(page, /framing="stage-cover"/, 'Aquarium home must use stage-cover camera framing');
assert.match(page, /data-aquarium-stage-intro/, 'stage intro must remain inside the aquarium scene');
assert.match(page, /data-tank-species-entry/, 'livestock entry must remain inside the aquarium scene');

assert.match(css, /@media \(min-width: 960px\)/, 'immersive overlay stage must start by 960px');
assert.match(css, /\.aquarium-dashboard-tank\s*>\s*\.aquarium-tank\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?inset:\s*0;/, 'visual tank must fill the immersive stage');
assert.match(css, /\.aquarium-dashboard-rail\s*\{[\s\S]*?position:\s*absolute;/, 'today action must overlay the stage');
assert.match(css, /\.aquarium-dashboard-actions\s*\{[\s\S]*?position:\s*absolute;/, 'quick actions must be a dock inside the stage');
assert.match(css, /\.aquarium-dashboard\s*>\s*\.aquarium-zone-header[^\{]*\{[\s\S]*?display:\s*none/, 'immersive stage must hide duplicate observe header');
assert.match(css, /\.aquarium-dashboard-actions\s*>\s*\.aquarium-zone-header[^\{]*\{[\s\S]*?display:\s*none/, 'immersive dock must hide duplicate management header');
assert.match(css, /@media \(min-width: 768px\) and \(max-width: 959px\)/, 'tablet fallback must be explicit');

console.log('Aquarium immersive stage layout contract: PASS');
