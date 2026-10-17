import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { uiActionContractIds, uiActionContracts } from '../src/services/navigation/ui-action-contracts';
import { taskRoutes } from '../src/services/navigation/task-routes';

const speciesDialog = readFileSync(resolve('src/components/SpeciesDetailDialog.tsx'), 'utf8');
const aquariumPage = readFileSync(resolve('src/pages/Aquarium.tsx'), 'utf8');
const app = readFileSync(resolve('src/App.tsx'), 'utf8');

if (!uiActionContractIds.has('species.view-tank-risk') || !uiActionContractIds.has('species.open-compatibility')) {
  throw new Error('species risk and compatibility actions must be registered');
}
const risk = uiActionContracts.find(item => item.id === 'species.view-tank-risk');
const compatibility = uiActionContracts.find(item => item.id === 'species.open-compatibility');
if (risk?.kind !== 'expand' || risk.destination !== 'species-detail.risk-summary') throw new Error('risk action contract is incorrect');
if (compatibility?.kind !== 'navigate' || compatibility.destination !== '/compatibility') throw new Error('compatibility action contract is incorrect');
if (taskRoutes.compatibility.with({ speciesIds: ['sp_0001'], source: 'species-detail' }) !== '/compatibility?source=species-detail&species=sp_0001') throw new Error('compatibility route builder is incorrect');
if (!speciesDialog.includes('species.view-tank-risk') || !speciesDialog.includes('data-action-id="species.open-compatibility"')) throw new Error('species actions are missing stable ids');
if (!speciesDialog.includes('Record exit / death') || !speciesDialog.includes('await onRecordDeath(fish')) throw new Error('species memorial action must require the shared confirmed detail flow');
if (!aquariumPage.includes('<SpeciesDetailDialog') || !aquariumPage.includes('repository.saveLivestockMemorial({')) throw new Error('aquarium species detail must use the shared dialog and repository memorial write');
if (aquariumPage.includes('Legacy fish detail modal') || aquariumPage.includes('handleUpdateEntryDate') || aquariumPage.includes('handleUpdateQuantity')) throw new Error('legacy aquarium detail mutation path must not return');
if (!app.includes('path="/compatibility"') || !app.includes('params.get(\'mode\') === \'compatibility\'')) throw new Error('compatibility route or legacy redirect is missing');

console.log('UI action contract tests passed.');
