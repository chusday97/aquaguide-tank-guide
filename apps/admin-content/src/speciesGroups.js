import generated from './species-groups.generated.json';

export const speciesGroupStats = generated.stats;
export const speciesGroups = generated.groups;
export const catalogSpecies = speciesGroups.flatMap((group) => group.members);

export const speciesGroupByKey = new Map(
  speciesGroups.map((group) => [group.group_key, group]),
);

export const speciesGroupByMemberId = new Map();
for (const group of speciesGroups) {
  for (const member of group.members) {
    speciesGroupByMemberId.set(member.id, group);
  }
}

export const speciesCategories = [...new Set(
  speciesGroups.map((group) => group.primary_category).filter(Boolean),
)].sort((a, b) => a.localeCompare(b, 'zh-CN'));
