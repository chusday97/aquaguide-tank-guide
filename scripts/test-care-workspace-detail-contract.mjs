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
requireMarker('if (!topicId) {\n      if (selectedTopic) setSelectedTopic(null);', 'When ?topic= disappears, route state must close the detail instead of leaving a stale article open.');
requireMarker('const searchParams = new URLSearchParams(location.search);', 'Care detail close must inspect the current URL before mutating local detail state.');
requireMarker("if (searchParams.has('topic')) {", 'Deeplink close must clear/navigate the URL before local detail state can be rehydrated from the stale query.');
requireMarker("navigateToRoute('/care');\n      return;", 'Non-search Care deeplinks must return to the Care route.');
requireMarker('detailNavigationContextRef.current = captureContext(sourceId);', 'Opening Care detail from browse/search must capture return context.');
requireMarker('if (context) void restoreContext(context);', 'Closing Care detail must restore captured browse context.');

forbidMarker('<Dialog open={!!selectedTopic}', 'Long-form Care article browsing must not own a Dialog.');
forbidMarker('<AdaptiveDetailContent>\n          {selectedTopic', 'Care article detail must not remain tied to the Dialog drawer wrapper.');
forbidMarker("const closeCareDetail = () => {\n    setSelectedTopic(null);\n    if (new URLSearchParams(location.search).has('topic'))", 'Do not clear local detail state before removing the deeplink query; that reopens the article on the next effect.');

// Short transactional overlays are still allowed and must remain explicit.
requireMarker('<Dialog open={!!shareTopic}', 'Generate Care Card remains a short transactional Dialog.');
requireMarker('setReminderSheet(config);', 'Reminder setup remains a short task overlay rather than being removed with article browsing.');

console.log('Care workspace detail contract passed: long-form article browsing is de-modalized, URL-driven close is stable, and transactional overlays remain explicit.');
