export type IdentificationFlowStage =
  | 'upload'
  | 'candidates'
  | 'identified'
  | 'describe'
  | 'question'
  | 'result';

export const isIdentificationStage = (stage: IdentificationFlowStage) => (
  stage === 'upload' || stage === 'candidates' || stage === 'identified'
);

export const shouldProtectDiagnosisDraft = (stage: IdentificationFlowStage, description: string) => (
  Boolean(description.trim()) && (stage === 'describe' || stage === 'question')
);
