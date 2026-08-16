import type { Aquarium, Fish } from '../types';
import { getLifeType } from '../modules/species/species.service';
import { resolveCanonicalSpeciesId } from '../modules/species/speciesAliases';
import { resolveCatalogSpecies } from '../modules/recommendation/catalog-grounding';

export type TankDecisionResolvedLivestock = {
  species: Fish;
  quantity: number;
  sourceRecordIds: string[];
  sourceSpeciesIds: string[];
};

export type TankDecisionAliasMapping = {
  sourceSpeciesId: string;
  canonicalSpeciesId: string;
};

export type TankDecisionContext = {
  aquariumId: string;
  resolvedLivestock: TankDecisionResolvedLivestock[];
  unresolvedCurrentSpeciesIds: string[];
  nonLivestockSpeciesIds: string[];
  aliasMappings: TankDecisionAliasMapping[];
};

type BuildTankDecisionContextInput = {
  aquarium: Aquarium;
  catalog: Fish[];
};

const normalizeQuantity = (value?: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.max(1, Math.round(parsed)) : 1;
};

export const buildTankDecisionContext = ({
  aquarium,
  catalog,
}: BuildTankDecisionContextInput): TankDecisionContext => {
  const resolvedBySpeciesId = new Map<string, TankDecisionResolvedLivestock>();
  const unresolvedCurrentSpeciesIds = new Set<string>();
  const nonLivestockSpeciesIds = new Set<string>();
  const aliasMappings = new Map<string, TankDecisionAliasMapping>();

  aquarium.fishes.forEach(record => {
    const sourceSpeciesId = String(record.fishId || '').trim();
    if (!sourceSpeciesId) return;

    const canonicalSpeciesId = resolveCanonicalSpeciesId(sourceSpeciesId);
    if (canonicalSpeciesId !== sourceSpeciesId) {
      aliasMappings.set(`${sourceSpeciesId}::${canonicalSpeciesId}`, {
        sourceSpeciesId,
        canonicalSpeciesId,
      });
    }

    const grounded = resolveCatalogSpecies({ speciesId: canonicalSpeciesId }, catalog);
    if (grounded.status !== 'verified' || !grounded.species) {
      unresolvedCurrentSpeciesIds.add(sourceSpeciesId);
      return;
    }

    const lifeType = getLifeType(grounded.species);
    if (lifeType === 'plant' || lifeType === 'hardscape') {
      nonLivestockSpeciesIds.add(grounded.species.id);
      return;
    }

    const existing = resolvedBySpeciesId.get(grounded.species.id);
    const sourceRecordIds = new Set(existing?.sourceRecordIds || []);
    if (record.id) sourceRecordIds.add(record.id);
    const sourceSpeciesIds = new Set(existing?.sourceSpeciesIds || []);
    sourceSpeciesIds.add(sourceSpeciesId);

    resolvedBySpeciesId.set(grounded.species.id, {
      species: grounded.species,
      quantity: (existing?.quantity || 0) + normalizeQuantity(record.quantity),
      sourceRecordIds: Array.from(sourceRecordIds).sort(),
      sourceSpeciesIds: Array.from(sourceSpeciesIds).sort(),
    });
  });

  return {
    aquariumId: aquarium.id,
    resolvedLivestock: Array.from(resolvedBySpeciesId.values())
      .sort((left, right) => left.species.id.localeCompare(right.species.id)),
    unresolvedCurrentSpeciesIds: Array.from(unresolvedCurrentSpeciesIds).sort(),
    nonLivestockSpeciesIds: Array.from(nonLivestockSpeciesIds).sort(),
    aliasMappings: Array.from(aliasMappings.values())
      .sort((left, right) => left.sourceSpeciesId.localeCompare(right.sourceSpeciesId)),
  };
};
