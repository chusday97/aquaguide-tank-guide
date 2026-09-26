import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfileForFish } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import type { Aquarium } from '../src/types';
const byId=(id:string)=>{const fish=fishData.find(item=>item.id===id);assert.ok(fish,'missing '+id);return fish;};
const tank=(temperature:number,length=220,width=70,height=60):Aquarium=>({id:'batch3',name:'batch3',fishes:[],dimensions:{length:String(length),width:String(width),height:String(height)},waterType:'Freshwater',targetTemperature:String(temperature),equipment:{filter:'桶滤',heater:true,oxygen:true,light:'普通灯'}});
for(const id of ['sp_0181','sp_0139','sp_0140','sp_0120','sp_0138']){assert.ok(getReviewedSpeciesKnowledgeForFish(byId(id)),id+' knowledge missing');assert.ok(getReviewedCompatibilityProfileForFish(byId(id)),id+' profile missing');}
const elephant=getReviewedCompatibilityProfileForFish(byId('sp_0181'))!; assert.ok(!elephant.behaviorTraits.includes('territorial'),'conspecific territoriality must not become universal territorial trait');
const elephantSmall=evaluateTankCompatibility({tank:tank(25,90,35,40),candidateSpecies:byId('sp_0181'),candidateQuantity:1});assert.notEqual(elephantSmall.status,'compatible');assert.ok([...elephantSmall.warningRules,...elephantSmall.blockingRules].some(r=>/tank_(volume|length)|volume_too_small|space/.test(r.code)));
const pacu=evaluateTankCompatibility({tank:tank(26,320,100,80),existingSpecies:[{species:byId('sp_0431'),record:{quantity:10}}],candidateSpecies:byId('sp_0139'),candidateQuantity:1});assert.equal(pacu.status,'not_recommended');assert.ok(pacu.blockingRules.some(r=>r.code==='predation_risk'));
const piranha=evaluateTankCompatibility({tank:tank(25),existingSpecies:[{species:byId('sp_0431'),record:{quantity:10}}],candidateSpecies:byId('sp_0140'),candidateQuantity:1});assert.equal(piranha.status,'not_recommended');assert.ok(piranha.blockingRules.some(r=>r.code==='solitary_species_conflict'||r.code==='predation_risk'));
const knife=evaluateTankCompatibility({tank:tank(25,200,70,60),existingSpecies:[{species:byId('sp_0431'),record:{quantity:10}}],candidateSpecies:byId('sp_0120'),candidateQuantity:1});assert.equal(knife.status,'not_recommended');assert.ok(knife.blockingRules.some(r=>r.code==='predation_risk'));
const leporinus=evaluateTankCompatibility({tank:tank(25,220,70,60),candidateSpecies:byId('sp_0138'),candidateQuantity:1});assert.ok(!leporinus.warningRules.some(r=>r.code.includes('group')),'single Leporinus path must remain valid; 6+ is an alternative group path, not universal minimum');
assert.equal(getReviewedSpeciesKnowledgeForFish(byId('sp_0138'))?.spaceAndGrowth?.minTankLengthCm,210);
console.log('priority compatibility knowledge batch3 passed: space, predation, solitary and non-overgeneralization rules');
