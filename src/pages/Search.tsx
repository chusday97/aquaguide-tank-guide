import { BookOpenCheck, Camera, Fish, Search as SearchIcon } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fishData } from '../data/fishData';
import { careTopicsData } from '../data/careTopicsData';
import { ResilientImage } from '../components/common/ResilientImage';
import { getSpeciesVisualSources } from '../lib/speciesVisual';
import { getCareVisualSources } from '../lib/careVisual';
import { useWorkspaceNavigation } from '../components/layout/WorkspaceNavigationProvider';
import { englishTranslations } from '../i18n/localizeData';
import { autoTranslations } from '../i18n/localizeDataAuto';
import { careTranslations } from '../i18n/localizeCareDataAuto';
import { SearchAutocomplete } from '../components/search/SearchAutocomplete';
import {
  getSearchSuggestions,
  type SearchSuggestion,
} from '../services/search/search-suggestions.service';
import { loadAppStateFromStorage } from '../services/storage/local-app-state';

const getSpeciesNameLocalized = (species: any, isEn = false): string => {
  if (!species) return '';
  if (!isEn) return species.name || '';
  if (species.scientificName) return species.scientificName;
  const id = species.id || '';
  if (autoTranslations[id]?.name) return autoTranslations[id].name;
  if (englishTranslations[id]?.name) return englishTranslations[id].name;
  return species.name || '';
};

const normalize = (value: string) => value.trim().toLocaleLowerCase();
const originalValue = (record: object, key: string) => String((record as Record<string, unknown>)[key] ?? '');
const getSpeciesSearchResults = (value: string) => {
  const normalizedQuery = normalize(value);
  if (!normalizedQuery) return [];
  return fishData.filter(fish => normalize([
    fish.name,
    fish.scientificName,
    fish.category,
    fish.description,
    originalValue(fish, '_originalName'),
    originalValue(fish, '_originalCategory'),
    originalValue(fish, '_originalDescription'),
    englishTranslations[fish.id]?.name,
    englishTranslations[fish.id]?.description,
    autoTranslations[fish.id]?.name,
    autoTranslations[fish.id]?.description,
  ].join(' ')).includes(normalizedQuery));
};

export default function SearchPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const { navigateToRoute } = useWorkspaceNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [draft, setDraft] = useState(query);
  const [selectedSpecies, setSelectedSpecies] = useState<SearchSuggestion | null>(null);
  const [showAllSpecies, setShowAllSpecies] = useState(false);
  const normalizedQuery = normalize(query);
  const aquarium = useMemo(() => {
    const state = loadAppStateFromStorage();
    return state.aquariums.find(item => item.id === state.currentAquariumId) || state.aquariums[0] || null;
  }, []);
  const ownedQuantityBySpeciesId = useMemo(() => new Map(
    (aquarium?.fishes || []).map(item => [item.fishId, item.quantity]),
  ), [aquarium]);
  const suggestionResult = useMemo(() => getSearchSuggestions({
    query: draft,
    locale: isEn ? 'en' : 'zh-CN',
    scope: 'global',
    species: fishData,
    careTopics: careTopicsData,
    ownedQuantityBySpeciesId,
  }), [draft, isEn, ownedQuantityBySpeciesId]);
  const draftSpeciesMatchCount = useMemo(() => getSpeciesSearchResults(draft).length, [draft]);

  useEffect(() => {
    const sourceId = sessionStorage.getItem('aquaguide_search_return_focus');
    if (!sourceId) return;
    window.requestAnimationFrame(() => {
      const target = document.getElementById(sourceId);
      target?.scrollIntoView({ block: 'center' });
      target?.focus({ preventScroll: true });
      sessionStorage.removeItem('aquaguide_search_return_focus');
    });
  }, []);

  const openSearchResult = (path: string, sourceId: string) => {
    sessionStorage.setItem('aquaguide_search_return_focus', sourceId);
    navigateToRoute(path);
  };

  const allSpeciesResults = useMemo(() => getSpeciesSearchResults(query), [query]);
  const speciesResults = showAllSpecies ? allSpeciesResults : allSpeciesResults.slice(0, 18);
  const allCareResults = useMemo(() => normalizedQuery
    ? careTopicsData.filter(topic => normalize([
      topic.title,
      topic.category,
      topic.summary,
      ...topic.keywords,
      originalValue(topic, '_originalTitle'),
      originalValue(topic, '_originalCategory'),
      originalValue(topic, '_originalSummary'),
      careTranslations[topic.id]?.title,
      careTranslations[topic.id]?.summary,
      ...(careTranslations[topic.id]?.keywords || []),
    ].join(' ')).includes(normalizedQuery))
    : [], [normalizedQuery]);
  const careResults = allCareResults.slice(0, 12);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = draft.trim();
    setShowAllSpecies(false);
    setSearchParams(next ? { q: next } : {});
  };

  const submitValue = (value: string) => {
    const next = value.trim();
    setShowAllSpecies(false);
    setSearchParams(next ? { q: next } : {});
  };

  const showAllSpeciesResults = () => {
    const next = draft.trim();
    if (!next) return;
    setSearchParams({ q: next });
    setShowAllSpecies(true);
  };

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.kind === 'species') {
      setDraft(suggestion.query);
      setSelectedSpecies(suggestion);
      return;
    }
    if (suggestion.kind === 'care' && suggestion.targetId) {
      openSearchResult(`/care?topic=${encodeURIComponent(suggestion.targetId)}&source=search`, `search-care-${suggestion.targetId}`);
      return;
    }
    setDraft(suggestion.query);
    setSelectedSpecies(null);
    submitValue(suggestion.query);
  };

  return (
    <div className="search-v2-page mx-auto w-full max-w-6xl px-1 py-2 md:px-8 md:py-8">
      <header className="search-v2-header">
        <h1 className="text-2xl font-black text-ink md:text-3xl">{t('searchPage.title')}</h1>
        {normalizedQuery && (
          <p className="search-v2-summary" aria-live="polite">
            <span>{t('searchPage.species')} <strong>{allSpeciesResults.length}</strong></span>
            <span aria-hidden="true">·</span>
            <span>{t('searchPage.care')} <strong>{allCareResults.length}</strong></span>
          </p>
        )}
      </header>

      <form onSubmit={submit} className="search-v2-command mt-5">
        <SearchAutocomplete
          value={draft}
          suggestions={suggestionResult.suggestions}
          selectedSpecies={selectedSpecies}
          placeholder={t('searchPage.placeholder')}
          inputLabel={t('searchPage.placeholder')}
          submitLabel={t('searchPage.submit')}
          viewDetailsLabel={t('searchPage.viewDetails')}
          reselectLabel={t('searchPage.chooseAgain')}
          speciesGroupLabel={t('searchPage.speciesCandidates')}
          careGroupLabel={t('searchPage.careCandidates')}
          relatedGroupLabel={t('searchPage.relatedSearches')}
          filterGroupLabel={t('searchPage.filterSuggestions')}
          ownedLabel={quantity => t('searchPage.ownedQuantity', { count: quantity })}
          totalSpeciesMatches={draftSpeciesMatchCount}
          viewAllSpeciesLabel={count => t('searchPage.viewAllSpecies', { count })}
          onValueChange={value => {
            setDraft(value);
            setSelectedSpecies(null);
            setShowAllSpecies(false);
          }}
          onSelectSuggestion={selectSuggestion}
          onSubmit={submitValue}
          onViewSelected={suggestion => suggestion.targetId && openSearchResult(`/encyclopedia?species=${encodeURIComponent(suggestion.targetId)}&source=search`, `search-species-${suggestion.targetId}`)}
          onReselect={() => setSelectedSpecies(null)}
          onViewAllSpecies={showAllSpeciesResults}
        />
      </form>

      {!normalizedQuery && (
        <div className="search-v2-empty mt-5 rounded-[24px] border border-dashed border-emerald-200 bg-emerald-50/55 p-6 text-center">
          <SearchIcon className="mx-auto h-7 w-7 text-emerald-700" />
          <p className="mt-3 text-sm font-black text-ink">{t('searchPage.emptyPrompt')}</p>
          <button type="button" onClick={() => navigateToRoute('/identify')} className="mt-4 inline-flex h-11 items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 text-sm font-black text-emerald-800"><Camera className="h-4 w-4" />{t('identify.entry')}</button>
        </div>
      )}

      {normalizedQuery && speciesResults.length + careResults.length === 0 && (
        <div className="search-v2-empty mt-5 rounded-[24px] bg-white p-7 text-center shadow-sm">
          <p className="text-sm font-black text-ink">{t('searchPage.noResults')}</p>
          <button type="button" onClick={() => navigateToRoute('/identify')} className="mt-4 h-11 rounded-2xl bg-emerald-700 px-4 text-sm font-black text-white">{t('searchPage.tryPhoto')}</button>
        </div>
      )}

      <div className="search-v2-results">
        {speciesResults.length > 0 && (
          <section className="search-v2-section search-v2-species-section" aria-labelledby="species-results-title">
            <div className="search-v2-section-heading">
              <div>
                <span className="search-v2-section-kicker"><Fish className="h-4 w-4" />{t('searchPage.species')}</span>
                <h2 id="species-results-title">{t('searchPage.species')}</h2>
              </div>
              <span className="search-v2-count" aria-label={`${allSpeciesResults.length}`}>{allSpeciesResults.length}</span>
            </div>
            <div className="search-v2-species-grid">
              {speciesResults.map(fish => (
                <button
                  key={fish.id}
                  id={`search-species-${fish.id}`}
                  type="button"
                  onClick={() => openSearchResult(`/encyclopedia?species=${encodeURIComponent(fish.id)}&source=search`, `search-species-${fish.id}`)}
                  className="search-v2-result-card search-v2-species-card"
                >
                  <span className="search-v2-species-image"><ResilientImage src={getSpeciesVisualSources(fish).thumbnail} alt={getSpeciesNameLocalized(fish, isEn)} className="h-full w-full object-contain p-2" /></span>
                  <span className="search-v2-result-copy">
                    <span className="search-v2-result-title">{getSpeciesNameLocalized(fish, isEn)}</span>
                    <span className="search-v2-result-meta">{fish.scientificName}</span>
                    <span className="search-v2-result-action"><Fish className="h-3.5 w-3.5" />{t('searchPage.viewDetails')}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {careResults.length > 0 && (
          <section className="search-v2-section search-v2-care-section" aria-labelledby="care-results-title">
            <div className="search-v2-section-heading">
              <div>
                <span className="search-v2-section-kicker"><BookOpenCheck className="h-4 w-4" />{t('searchPage.care')}</span>
                <h2 id="care-results-title">{t('searchPage.care')}</h2>
              </div>
              <span className="search-v2-count" aria-label={`${allCareResults.length}`}>{allCareResults.length}</span>
            </div>
            <div className="search-v2-care-grid">
              {careResults.map(topic => (
                <button
                  key={topic.id}
                  id={`search-care-${topic.id}`}
                  type="button"
                  onClick={() => openSearchResult(`/care?topic=${encodeURIComponent(topic.id)}&source=search`, `search-care-${topic.id}`)}
                  className="search-v2-result-card search-v2-care-card"
                >
                  <span className="search-v2-care-image"><ResilientImage src={getCareVisualSources(topic.imageUrl).thumbnail} alt={topic.title} className="h-full w-full object-cover" /></span>
                  <span className="search-v2-result-copy">
                    <span className="search-v2-result-title">{topic.title}</span>
                    <span className="search-v2-care-summary">{topic.summary}</span>
                    <span className="search-v2-result-action"><BookOpenCheck className="h-3.5 w-3.5" />{t('searchPage.openCare')}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
