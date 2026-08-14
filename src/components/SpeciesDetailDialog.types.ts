import type { Aquarium, Fish, MemorialCauseCode } from '../types';

export type SpeciesDetailSource = 'atlas' | 'aquarium';

export type SpeciesDetailDialogProps = {
  fish: Fish | null;
  open: boolean;
  source: SpeciesDetailSource;
  aquariumContext?: Aquarium | null;
  imageSrc: string;
  owned: boolean;
  inCalculator: boolean;
  inWishlist: boolean;
  detailFeedback?: string;
  finalFocusElement?: HTMLElement | null;
  onOpenChange: (open: boolean) => void;
  onSelectSpecies?: (fish: Fish) => void;
  onAddToTank?: (fish: Fish) => void;
  onAddToCalculator: (fish: Fish) => void;
  onToggleWishlist: (fishId: string) => void;
  onGoCalculator?: () => void;
  onViewInTank?: () => void;
  onOpenTankSettings?: (panel: 'size' | 'parameters' | 'equipment') => void;
  onRecordDeath?: (
    fish: Fish,
    input: {
      date: string;
      causeCodes: MemorialCauseCode[];
      reason?: string;
      batchId?: string;
      operationId: string;
    },
  ) => void | Promise<void>;
};
