import fs from 'node:fs';

const source = fs.readFileSync('src/pages/CareEncyclopedia.tsx', 'utf8');

const requireMarker = (marker, message) => {
  if (!source.includes(marker)) throw new Error(message || `Missing marker: ${marker}`);
};
const forbidMarker = (marker, message) => {
  if (source.includes(marker)) throw new Error(message || `Forbidden marker: ${marker}`);
};

requireMarker('data-care-browse-surface', 'Care browse/list surface must stay mounted while detail is open so return context is preserved.');
requireMarker('data-care-workspace-detail', 'Long-form Care articles must render as a workspace detail surface.');
requireMarker('data-care-detail-back', 'Care workspace detail must provide an explicit Back action.');
requireMarker('onClick={closeCareDetail}', 'Care workspace Back action must reuse the canonical close/restore path.');
requireMarker('embedded\n          />', 'CareArticleDetail must render in embedded workspace mode.');
requireMarker('embedded = false', 'CareArticleDetail must preserve backward-compatible non-embedded behavior for any other caller.');
requireMarker("const topicId = new URLSearchParams(location.search).get('topic');", 'Care detail deeplink via ?topic= must remain supported.');
requireMarker('  }, [location.search]);', 'Care deeplink synchronization must react only to URL changes, not local selectedTopic changes.');
requireMarker('const searchParams = new URLSearchParams(location.search);\n    setSelectedTopic(null);', 'Close must clear local detail while URL navigation removes any deeplink query.');
requireMarker("if (searchParams.has('topic')) {", 'Deeplink close must return through the URL-aware path.');
requireMarker("navigateToRoute('/care');\n      return;", 'Non-search Care deeplinks must return to the Care route.');
requireMarker('detailNavigationContextRef.current = captureContext(sourceId);', 'Opening Care detail from browse/search must capture return context.');
requireMarker('if (context) void restoreContext(context);', 'Closing Care detail must restore captured browse context.');

forbidMarker('<Dialog open={!!selectedTopic}', 'Long-form Care article browsing must not own a Dialog.');
forbidMarker('<AdaptiveDetailContent>\n          {selectedTopic', 'Care article detail must not remain tied to the Dialog drawer wrapper.');
forbidMarker('[location.search, selectedTopic?.id]', 'Local article selection must not retrigger deeplink synchronization and collapse browse-opened detail.');
forbidMarker('if (!topicId) {\n      if (selectedTopic) setSelectedTopic(null);', 'Missing ?topic= must not close a locally opened browse/recommendation detail.');

// Short transactional overlays are still allowed and must remain explicit.
requireMarker('<Dialog open={!!shareTopic}', 'Generate Care Card remains a short transactional Dialog.');
requireMarker('setReminderSheet(config);', 'Reminder setup remains a short task overlay rather than being removed with article browsing.');

console.log('Care workspace detail contract passed: article browsing is de-modalized, deeplink URL sync is isolated from local browse state, and transactional overlays remain explicit.');
