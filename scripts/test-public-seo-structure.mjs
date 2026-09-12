import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = relativeFile => fs.readFileSync(path.join(root, relativeFile), 'utf8');

const publicPages = [
  ['src/pages/MarketingLanding.tsx', ['SeoPageShell', 'SeoCapabilityCard', 'SeoRelatedLinks', 'SeoSourceFooter']],
  ['src/pages/CategoryLanding.tsx', ['SeoPageShell', 'SeoBreadcrumbs', 'SeoCapabilityCard', 'SeoSourceFooter']],
  ['src/pages/SpeciesLanding.tsx', ['SeoPageShell', 'SeoHero', 'SeoDataRail', 'SeoCapabilityCard', 'SeoSourceFooter']],
  ['src/pages/CareGuideLanding.tsx', ['SeoPageShell', 'SeoBreadcrumbs', 'SeoSourceFooter']],
];

const publicShell = read('src/components/seo/PublicSeoShell.tsx');
assert.match(publicShell, /PublicSeoLoading/, 'Public Shell must provide a dedicated loading skeleton');
assert.match(publicShell, /aria-busy="true"/, 'Public loading state must expose busy status');
assert.match(publicShell, /seo-public-loading__crumbs" aria-hidden="true"/, 'Loading skeleton decoration must be hidden from assistive technology');
assert.match(publicShell, /seo-public-loading__media" aria-hidden="true"/, 'Loading media decoration must be hidden from assistive technology');
assert.match(publicShell, /seo-public-loading__copy" aria-hidden="true"/, 'Loading copy decoration must be hidden from assistive technology');
assert.match(read('src/styles/seo-system.css'), /seo-public-loading__media/, 'Public loading skeleton must have a stable media frame');
const publicRoutesApp = read('src/App.tsx');
assert.match(publicRoutesApp, /<Suspense fallback=\{<PublicSeoLoading \/>\}>/, 'Public routes must use the SEO loading skeleton');

for (const [relativeFile, requiredPieces] of publicPages) {
  const source = read(relativeFile);
  assert.match(source, /<h1\b/, `${relativeFile} must define a visible H1`);
  assert.match(source, /setSeoDocument/, `${relativeFile} must use the shared SEO document service`);
  for (const piece of requiredPieces) {
    assert.match(source, new RegExp(`\\b${piece}\\b`), `${relativeFile} is missing ${piece}`);
  }
}

const species = read('src/pages/SpeciesLanding.tsx');
const publicFavorites = read('src/services/favorites/public-species-favorites.service.ts');
const app = read('src/App.tsx');
assert.match(app, /function PublicSeoRoutes\(\)[\s\S]*?window\.scrollTo\(\{ top: 0, left: 0, behavior: 'auto' \}\)/, 'Public routes must reset scroll position on route changes');
assert.match(app, /document\.getElementById\(sectionId\)\?\.scrollIntoView/, 'Public routes must restore direct chapter hash navigation');
const assetFallback = read('src/components/seo/SeoAssetFallback.tsx');
for (const relativeFile of ['src/pages/MarketingLanding.tsx', 'src/pages/CategoryLanding.tsx', 'src/pages/SpeciesLanding.tsx']) {
  assert.match(read(relativeFile), /SeoAssetFallback/, `${relativeFile} must use the shared public asset fallback`);
}
assert.match(assetFallback, /role="img"/, 'Shared asset fallback must expose a meaningful image role');
assert.match(assetFallback, /图片暂不可用|label/, 'Shared asset fallback must expose a readable label');
const resilientImage = read('src/components/common/ResilientImage.tsx');
const globalStyles = read('src/index.css');
assert.match(resilientImage, /fallbackFailed/, 'ResilientImage must keep a terminal fallback state after the fallback asset fails');
assert.match(resilientImage, /resilient-image-terminal-fallback/, 'ResilientImage must render a readable terminal fallback');
assert.match(globalStyles, /\.resilient-image-terminal-fallback/, 'Terminal image fallback must have stable layout styling');
assert.doesNotMatch(species, /getCurrentAquaGuideRepository|repository-provider/, 'Public Species must not read the app repository for favorites or aquarium state');
assert.match(species, /togglePublicSpeciesFavorite/, 'Public Species must use isolated local favorites without auth or Supabase reads');
assert.doesNotMatch(species, /toggleSpeciesFavorite/, 'Public Species must not use the app-wide favorites service');
assert.match(species, /getPublicSpeciesFavoriteIds|subscribeToPublicSpeciesFavorites/, 'Public Species must read only the isolated favorites key');
assert.match(species, /public-species-favorites\.service/, 'Public Species must import the isolated favorites service');
assert.doesNotMatch(publicFavorites, /loadAppStateFromStorage|patchLocalAppState|aquarium_app_state_v1|repository-provider/, 'Public favorites must not depend on app state or repository services');
assert.match(species, /import \{ setSeoDocument \} from ['"]\.\.\/services\/seo\/seo-document\.service['"]/, 'Species must use the shared SEO document service');
assert.doesNotMatch(species, /const setMeta|const setCanonical/, 'Species must not keep a second metadata writer');
assert.match(species, /profile\.editorial\?\.(overview|habitat|feeding|maintenance)/, 'Species must render published editorial conditionally');
assert.match(species, /groupVariants\.length > 1/, 'Species must keep Base/Variant content conditional');
assert.match(species, /profile\.faq\.length > 0/, 'Species must keep FAQ fail-closed');
assert.match(species, /lifeAnswers\.map/, 'Species must render life answers from published evidence');
assert.match(species, /new IntersectionObserver/, 'Species chapter navigation must track the visible section');
assert.match(species, /aria-current=\{activeChapter === item\.id \? 'location'/, 'Species chapter navigation must expose the active section');
assert.match(species, /<section id="overview" className="seo-section"/, 'Species overview chapter must target the data rail section');
assert.doesNotMatch(species, /<SeoHero id="overview">/, 'Species Hero must not claim the overview chapter anchor');
assert.ok(species.includes("...(profile.variants.length > 1 ? ['variants'] : []),\n      'tool',"), 'Species chapter observer must include the AquaGuide capability section');
assert.ok(species.includes("...(profile.faq.length > 0 ? ['faq'] : []),\n      'related',"), 'Species chapter observer must include the related-links section');

const guide = read('src/pages/CareGuideLanding.tsx');
for (const phrase of ['先看核心结论', '再看分步操作', '最后做后续观察', '资料状态']) {
  assert.ok(guide.includes(phrase), `Guide preparation state is missing ${phrase}`);
}

const marketing = read('src/pages/MarketingLanding.tsx');
assert.match(marketing, /marketingSpeciesAsset \? <ResilientImage[\s\S]*?物种图片暂不可用/, 'Marketing Hero must have a visible image fallback');
assert.match(marketing, /to="\/category\/shrimp-snails-crabs"/, 'Marketing must link to the public category landing');
assert.match(marketing, /to="\/aquarium"/, 'Marketing must link to the aquarium app entry');

const category = read('src/pages/CategoryLanding.tsx');
assert.match(category, /to=\{species\.href\}/, 'Category species cards must use the published species href');
assert.match(category, /href="\/aquarium"/, 'Category must link to the aquarium app entry');
assert.match(category, /featuredBaseSpecies\.length > 1 \? 'md:grid-cols-2'/, 'Category must use two columns only when multiple species are published');
assert.match(category, /featuredBaseSpecies\.length === 1 \? 'max-w-\[760px\]'/, 'Category must compact a single published species card');

assert.match(species, /to=\{variantPath\(variant\.id\)\}/, 'Species variant cards must use the variant route');
assert.match(species, /taskRoutes\.encyclopedia\.compatibilitySpecies\(fish\.id, 'species-profile'\)/, 'Species capability card must preserve the species tool target');
assert.match(species, /\{ label: labels\.back, href: '\/' \}/, 'Species breadcrumb must stay inside the public shell');
assert.doesNotMatch(species, /label: labels\.back, href: '\/encyclopedia'/, 'Species breadcrumb must not point to the app encyclopedia');
assert.match(species, /const breadcrumbCategory = baseSpecies\.category/, 'Species public breadcrumb must use the published category name');
assert.match(species, /<SectionHeading id="stats-title" number=\{sectionNumber\('overview'\)\} eyebrow=\{labels\.overview\} title=\{labels\.overview\}/, 'Species data rail must use the shared section heading');

const publishedProfile = read('src/data/publishedSpeciesProfile.ts');
assert.match(publishedProfile, /categoryHrefFor\(species\.category\) \?/, 'Species related category links must be conditional on a public route');
assert.doesNotMatch(publishedProfile, /return `\/encyclopedia\?category=/, 'Published Species data must not create an app-only category link');

console.log('Public SEO structure checks passed: all page types have a stable content skeleton and conditional content gates.');
