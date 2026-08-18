import fs from 'node:fs';

const appPath = 'src/App.tsx';
const aquariumPath = 'src/pages/Aquarium.tsx';

let app = fs.readFileSync(appPath, 'utf8');
let aquarium = fs.readFileSync(aquariumPath, 'utf8');
let changed = false;

if (!app.includes('const isAquariumWorkspace = location.pathname === \'/aquarium\';')) {
  const stateAnchor = `function MobileAppShell() {
  const { navigateToRoute } = useWorkspaceNavigation();
  const { t } = useTranslation();
  return (`;
  const stateReplacement = `function MobileAppShell() {
  const { navigateToRoute } = useWorkspaceNavigation();
  const { t } = useTranslation();
  const location = useLocation();
  const isAquariumWorkspace = location.pathname === '/aquarium';
  return (`;
  if (!app.includes(stateAnchor)) throw new Error('MobileAppShell state anchor changed; refusing broad rewrite.');
  app = app.replace(stateAnchor, stateReplacement);

  const headerStart = `        <header data-shell="mobile-header" className="flex shrink-0 items-center justify-end gap-1 border-b border-ink/5 bg-white/92 px-3 pb-2 pt-[calc(8px+env(safe-area-inset-top))] backdrop-blur-md">`;
  const headerStartReplacement = `        {!isAquariumWorkspace && (\n          <header data-shell="mobile-header" className="flex shrink-0 items-center justify-end gap-1 border-b border-ink/5 bg-white/92 px-3 pb-2 pt-[calc(8px+env(safe-area-inset-top))] backdrop-blur-md">`;
  if (!app.includes(headerStart)) throw new Error('Mobile utility header anchor changed; refusing broad rewrite.');
  app = app.replace(headerStart, headerStartReplacement);

  const headerEnd = `        </header>
        <main className="app-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-[calc(88px+env(safe-area-inset-bottom))] pt-3">`;
  const headerEndReplacement = `          </header>
        )}
        <main className="app-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-[calc(88px+env(safe-area-inset-bottom))] pt-3">`;
  if (!app.includes(headerEnd)) throw new Error('Mobile utility header closing anchor changed; refusing broad rewrite.');
  app = app.replace(headerEnd, headerEndReplacement);
  changed = true;
}

if (!aquarium.includes('data-mobile-aquarium-utility="search"')) {
  const menuAnchor = `              {isMobileMoreOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[80] w-[240px] rounded-[18px] border border-white/80 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)] ring-1 ring-ink/5">
                  {isEditingName ? (`;
  const menuReplacement = `              {isMobileMoreOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[80] w-[240px] rounded-[18px] border border-white/80 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)] ring-1 ring-ink/5">
                  <div className="mb-2 grid grid-cols-3 gap-1.5 border-b border-border/60 pb-2" aria-label={isEn ? 'App utilities' : '应用工具'}>
                    <button type="button" data-mobile-aquarium-utility="search" onClick={() => { setIsMobileMoreOpen(false); navigateToRoute('/search'); }} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-[12px] text-[10px] font-black text-ink/58 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
                      <Search className="h-4 w-4" /><span>{isEn ? 'Search' : '搜索'}</span>
                    </button>
                    <button type="button" data-mobile-aquarium-utility="identify" onClick={() => { setIsMobileMoreOpen(false); navigateToRoute('/identify'); }} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-[12px] text-[10px] font-black text-ink/58 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
                      <Sparkles className="h-4 w-4" /><span>{isEn ? 'Identify' : '识别'}</span>
                    </button>
                    <button type="button" data-mobile-aquarium-utility="settings" onClick={() => { setIsMobileMoreOpen(false); navigateToRoute('/settings'); }} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-[12px] text-[10px] font-black text-ink/58 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
                      <Settings className="h-4 w-4" /><span>{isEn ? 'Settings' : '设置'}</span>
                    </button>
                  </div>
                  {isEditingName ? (`;
  if (!aquarium.includes(menuAnchor)) throw new Error('Aquarium mobile more-menu anchor changed; refusing broad rewrite.');
  aquarium = aquarium.replace(menuAnchor, menuReplacement);
  changed = true;
}

if (changed) {
  fs.writeFileSync(appPath, app);
  fs.writeFileSync(aquariumPath, aquarium);
  console.log('Applied single-header mobile Aquarium shell migration.');
} else {
  console.log('Mobile Aquarium shell migration already applied.');
}
