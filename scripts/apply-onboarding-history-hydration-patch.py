from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    file = Path(path)
    text = file.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 exact match, got {count}')
    file.write_text(text.replace(old, new, 1))


replace_once(
    'src/services/onboarding/onboarding.service.ts',
    "import { getCareFavorites } from '../favorites/favorites.service';\n",
    "import { getCareFavorites, getSpeciesFavoriteIds, setCareFavorites, setSpeciesFavoriteIds } from '../favorites/favorites.service';\nimport { getCurrentAquaGuideRepository } from '../repository/repository-provider';\n",
    'onboarding repository history imports',
)

replace_once(
    'src/services/onboarding/onboarding.service.ts',
    """export const hydrateOnboardingFromProfile = async () => {
  try {
    if (!await hasSignedInUser()) return getOnboardingState();
    const profile = await apiRequest<ProfilePreferenceResponse>('/profile');
    const local = getOnboardingState();
    const cloud = onboardingPreferenceSchema.safeParse(profile.preferences?.onboarding);
    if (!local && cloud.success) return patchLocalAppState({ onboarding: cloud.data }).onboarding;
    if (local && !cloud.success) queueProfileSync(local);
    return local;
  } catch {
    emitSyncFailure();
    return getOnboardingState();
  }
};
""",
    """export const hydrateOnboardingFromProfile = async () => {
  try {
    if (!await hasSignedInUser()) return getOnboardingState();
    const profile = await apiRequest<ProfilePreferenceResponse>('/profile');
    const local = getOnboardingState();
    const cloud = onboardingPreferenceSchema.safeParse(profile.preferences?.onboarding);
    if (!local && cloud.success) return patchLocalAppState({ onboarding: cloud.data }).onboarding;
    if (local && !cloud.success) {
      queueProfileSync(local);
      return local;
    }
    if (!local && !cloud.success) {
      const repository = await getCurrentAquaGuideRepository();
      const [aquariums, favorites] = await Promise.all([
        repository.getAquariums(),
        repository.getFavorites(),
      ]);
      const cached = loadAppStateFromStorage();
      const currentAquariumId = cached.currentAquariumId
        && aquariums.some(item => item.id === cached.currentAquariumId)
        ? cached.currentAquariumId
        : (aquariums[0]?.id || '');
      patchLocalAppState({ aquariums, currentAquariumId });
      setSpeciesFavoriteIds(favorites.speciesCatalogKeys);
      setCareFavorites(Object.fromEntries(favorites.careFavorites.map(item => [item.catalogKey, {
        id: item.catalogKey,
        title: item.title,
        favoritedAt: item.favoritedAt,
      }])));
    }
    return getOnboardingState();
  } catch {
    emitSyncFailure();
    return getOnboardingState();
  }
};
""",
    'onboarding legacy cloud activity hydration',
)

replace_once(
    'src/services/onboarding/onboarding.service.ts',
    """  const hasSupplementalCareActivity = Object.keys(getCareFavorites()).length > 0
    || getCareReminders().length > 0
""",
    """  const hasSupplementalCareActivity = getSpeciesFavoriteIds().length > 0
    || Object.keys(getCareFavorites()).length > 0
    || getCareReminders().length > 0
""",
    'onboarding species favorites historical activity',
)
