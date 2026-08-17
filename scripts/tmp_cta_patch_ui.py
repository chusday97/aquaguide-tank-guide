from pathlib import Path

def repl(path, old, new):
    p=Path(path); text=p.read_text(); n=text.count(old); assert n==1,(path,n); p.write_text(text.replace(old,new,1))

repl('src/pages/CollectionHub.tsx','''  remainingCount,
  moreLabel,
  children,
}: {
  id: CollectionModule;
  title: string;
  count: string;
  icon: ReactNode;
  tone: string;
  remainingCount: number;
  moreLabel: string;
  children: ReactNode;
}) {''','''  remainingCount,
  moreLabel,
  building = false,
  children,
}: {
  id: CollectionModule;
  title: string;
  count: string;
  icon: ReactNode;
  tone: string;
  remainingCount: number;
  moreLabel: string;
  building?: boolean;
  children: ReactNode;
}) {''')

repl('src/pages/CollectionHub.tsx','''    <section
      data-collection-module={id}
      className={`flex min-h-[326px] min-w-0 flex-col rounded-[24px] border p-4 text-left ${id === 'achievements' ? 'border-slate-200 bg-slate-50 text-slate-500 shadow-none' : 'border-white/90 bg-white shadow-sm'}`}
    >
      <button
        type="button"
        onClick={openModule}
        className="group flex w-full items-center gap-3 rounded-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        aria-label={`${title}，${count}`}
      >
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] ${tone}`}>{icon}</span>
        <span className="min-w-0 flex-1 text-[17px] font-black text-ink">
          {title}
          <span className="ml-2 text-[13px] text-ink/45">· {count}</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink/25 transition-transform group-hover:translate-x-0.5" />
      </button>''','''    <section
      data-collection-module={id}
      data-feature-status={building ? 'building' : undefined}
      className={`flex min-h-[326px] min-w-0 flex-col rounded-[24px] border p-4 text-left ${id === 'achievements' ? 'border-slate-200 bg-slate-50 text-slate-500 shadow-none' : 'border-white/90 bg-white shadow-sm'}`}
    >
      {building ? (
        <div className="flex w-full items-center gap-3 rounded-[16px] text-left" aria-label={`${title}，${count}`}>
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] ${tone}`}>{icon}</span>
          <span className="min-w-0 flex-1 text-[17px] font-black text-ink">
            {title}
            <span className="ml-2 text-[13px] text-ink/45">· {count}</span>
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={openModule}
          className="group flex w-full items-center gap-3 rounded-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          aria-label={`${title}，${count}`}
        >
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] ${tone}`}>{icon}</span>
          <span className="min-w-0 flex-1 text-[17px] font-black text-ink">
            {title}
            <span className="ml-2 text-[13px] text-ink/45">· {count}</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-ink/25 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}''')
repl('src/pages/CollectionHub.tsx','''      {remainingCount > 0 && (
        <button''','''      {!building && remainingCount > 0 && (
        <button''')
repl('src/pages/CollectionHub.tsx','''          remainingCount={0}
          moreLabel=""
        >''','''          remainingCount={0}
          moreLabel=""
          building
        >''')

repl('scripts/verify-collection-hub-previews.mjs','''  const achievementCopy = await desktop.locator('[data-collection-module="achievements"]').textContent();
  assert.ok(achievementCopy?.includes('成就勋章') && achievementCopy.includes('建设中') && achievementCopy.includes('暂未开放'), '轨道末端的成就模块必须保持建设中状态');''','''  const achievementModule = desktop.locator('[data-collection-module="achievements"]');
  const achievementCopy = await achievementModule.textContent();
  assert.ok(achievementCopy?.includes('成就勋章') && achievementCopy.includes('建设中') && achievementCopy.includes('暂未开放'), '轨道末端的成就模块必须保持建设中状态');
  assert.equal(await achievementModule.getAttribute('data-feature-status'), 'building', '建设中模块必须显式声明 feature status');
  assert.equal(await achievementModule.locator('button').count(), 0, '暂未开放的成就模块不能伪装成可执行按钮');''')
