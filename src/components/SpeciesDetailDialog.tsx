import { getLifeType } from '../modules/species/species.service';
import { NonAnimalSpeciesDetailDialog } from './NonAnimalSpeciesDetailDialog';
import { SpeciesDetailDialog as SpeciesDetailDialogLegacy } from './SpeciesDetailDialogLegacy';
import type { SpeciesDetailDialogProps } from './SpeciesDetailDialog.types';

export function SpeciesDetailDialog(props: SpeciesDetailDialogProps) {
  const lifeType = props.fish ? getLifeType(props.fish) : null;

  if (lifeType === 'plant' || lifeType === 'hardscape') {
    return <NonAnimalSpeciesDetailDialog {...props} />;
  }

  return <SpeciesDetailDialogLegacy {...props} />;
}
