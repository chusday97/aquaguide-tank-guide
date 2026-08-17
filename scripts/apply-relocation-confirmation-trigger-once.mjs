import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/components/compatibility/InterventionComparisonPanel.tsx';
let content = readFileSync(path, 'utf8');

const replaceOnce = (before, after) => {
  const count = content.split(before).length - 1;
  if (count !== 1) throw new Error(`expected one anchor, found ${count}: ${before.slice(0, 80)}`);
  content = content.replace(before, after);
};

replaceOnce(
`export type InterventionComparisonPanelProps = {\n  open: boolean;\n  result: TankDecisionSupportResult;\n  isEn?: boolean;\n  onOpenChange: (open: boolean) => void;\n};`,
`export type RelocationConfirmationIntent = {\n  subjectSpeciesId: string;\n  subjectName: string;\n  quantity: number;\n  destinationAquariumId: string;\n  destinationAquariumName: string;\n};\n\nexport type InterventionComparisonPanelProps = {\n  open: boolean;\n  result: TankDecisionSupportResult;\n  isEn?: boolean;\n  onOpenChange: (open: boolean) => void;\n  onRequestRelocationConfirmation?: (intent: RelocationConfirmationIntent) => void;\n};`
);

replaceOnce(
`function DestinationList({ destination, isEn }: { destination?: TankDecisionDestinationEvaluation; isEn: boolean }) {`,
`function DestinationList({\n  destination,\n  option,\n  isEn,\n  onRequestRelocationConfirmation,\n}: {\n  destination?: TankDecisionDestinationEvaluation;\n  option: InterventionChoiceOption;\n  isEn: boolean;\n  onRequestRelocationConfirmation?: (intent: RelocationConfirmationIntent) => void;\n}) {`
);

replaceOnce(
`          {item.failClosedForUnresolvedResidents && <p className="mt-1 text-[9px] font-bold text-sky-700">{isEn ? 'This destination has unresolved residents, so it cannot be formally confirmed yet.' : '该目标缸还有身份未确认的生物，因此暂不能正式确认去向。'}</p>}\n        </div>`,
`          {item.failClosedForUnresolvedResidents && <p className="mt-1 text-[9px] font-bold text-sky-700">{isEn ? 'This destination has unresolved residents, so it cannot be formally confirmed yet.' : '该目标缸还有身份未确认的生物，因此暂不能正式确认去向。'}</p>}\n          {item.status === 'compatible_by_current_evidence' && onRequestRelocationConfirmation && (\n            <button\n              type="button"\n              className="mt-2.5 w-full rounded-[11px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-800 hover:bg-emerald-100"\n              data-open-relocation-confirmation={item.aquariumId}\n              onClick={() => onRequestRelocationConfirmation({\n                subjectSpeciesId: option.subjectSpeciesId,\n                subjectName: option.subjectName,\n                quantity: option.quantity,\n                destinationAquariumId: item.aquariumId,\n                destinationAquariumName: item.aquariumName,\n              })}\n            >\n              {isEn ? 'Open relocation confirmation' : '打开迁移确认'}\n            </button>\n          )}\n        </div>`
);

replaceOnce(
`function ChoiceCard({\n  option,\n  destination,\n  isEn,\n}: {\n  option: InterventionChoiceOption;\n  destination?: TankDecisionDestinationEvaluation;\n  isEn: boolean;\n}) {`,
`function ChoiceCard({\n  option,\n  destination,\n  isEn,\n  onRequestRelocationConfirmation,\n}: {\n  option: InterventionChoiceOption;\n  destination?: TankDecisionDestinationEvaluation;\n  isEn: boolean;\n  onRequestRelocationConfirmation?: (intent: RelocationConfirmationIntent) => void;\n}) {`
);

replaceOnce(
`      <DestinationList destination={destination} isEn={isEn} />`,
`      <DestinationList\n        destination={destination}\n        option={option}\n        isEn={isEn}\n        onRequestRelocationConfirmation={onRequestRelocationConfirmation}\n      />`
);

replaceOnce(
`export function InterventionComparisonPanel({ open, result, isEn = false, onOpenChange }: InterventionComparisonPanelProps) {`,
`export function InterventionComparisonPanel({\n  open,\n  result,\n  isEn = false,\n  onOpenChange,\n  onRequestRelocationConfirmation,\n}: InterventionComparisonPanelProps) {`
);

replaceOnce(
`      <DialogContent className="flex max-h-[90dvh] w-[95vw] max-w-[760px] flex-col overflow-hidden rounded-[24px] border-border bg-bg p-0" data-intervention-panel-readonly="true">`,
`      <DialogContent\n        className="flex max-h-[90dvh] w-[95vw] max-w-[760px] flex-col overflow-hidden rounded-[24px] border-border bg-bg p-0"\n        data-intervention-panel-readonly="true"\n        data-intervention-panel-mutation-free="true"\n      >`
);

replaceOnce(
`              <DialogDescription className="mt-1 text-[12px] font-medium leading-relaxed text-ink/55">{isEn ? 'Each option recomputes the remaining community. This panel is read-only and never moves livestock automatically.' : '每个方案都会重新计算调整后的剩余群落。这个面板只做比较，不会自动移动或删除任何生物。'}</DialogDescription>`,
`              <DialogDescription className="mt-1 text-[12px] font-medium leading-relaxed text-ink/55">{isEn ? 'Each option recomputes the remaining community. Compatible existing-tank destinations may open a separate confirmation step, but this comparison panel never mutates livestock.' : '每个方案都会重新计算调整后的剩余群落。满足当前证据门槛的现有目标缸可以打开独立确认步骤，但这个比较面板本身不会移动或删除任何生物。'}</DialogDescription>`
);

replaceOnce(
`              <div className="mt-3 grid gap-3">{formalChoices.map(option => <ChoiceCard key={option.id} option={option} destination={result.relocationDestinations.find(item => item.subjectSpeciesId === option.subjectSpeciesId)} isEn={isEn} />)}</div>`,
`              <div className="mt-3 grid gap-3">{formalChoices.map(option => <ChoiceCard key={option.id} option={option} destination={result.relocationDestinations.find(item => item.subjectSpeciesId === option.subjectSpeciesId)} isEn={isEn} onRequestRelocationConfirmation={onRequestRelocationConfirmation} />)}</div>`
);

writeFileSync(path, content);
console.log('relocation confirmation trigger patch applied with unique anchors');
