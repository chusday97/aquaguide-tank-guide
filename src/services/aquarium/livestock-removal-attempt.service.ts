export interface LivestockRemovalAttempt {
  operationId: string;
  submitted: boolean;
}

export const createLivestockRemovalAttempt = (
  randomUuid = () => crypto.randomUUID(),
): LivestockRemovalAttempt => ({
  operationId: `livestock-removal-${randomUuid()}`,
  submitted: false,
});

export const markLivestockRemovalSubmitted = <T extends LivestockRemovalAttempt>(attempt: T): T => ({
  ...attempt,
  submitted: true,
});
