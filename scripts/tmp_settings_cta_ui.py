from pathlib import Path

def repl(path, old, new):
    p=Path(path); text=p.read_text(); n=text.count(old); assert n==1,(path,n); p.write_text(text.replace(old,new,1))

repl('src/pages/Settings.tsx', '''            ].map(item => {
              const Icon = item.icon;
              return (
                <button key={item.id} type="button" onClick={() => focusSection(item.id)} className="flex min-h-11 w-full items-center gap-3 rounded-[12px] px-3 text-left text-sm font-black text-ink/60 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                  <Icon className="h-4 w-4 shrink-0" /><span className="min-w-0 flex-1">{item.label}</span><ChevronRight className="h-4 w-4 text-ink/20" />
                </button>
              );
            })}''', '''            ].map(item => {
              const Icon = item.icon;
              if (item.id === 'shared-reports') {
                return (
                  <div key={item.id} data-settings-building-nav="sharing" aria-disabled="true" className="flex min-h-11 w-full items-center gap-3 rounded-[12px] px-3 text-left text-sm font-black text-slate-400">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1">{item.label}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-400">{isEn ? 'BUILDING' : '建设中'}</span>
                  </div>
                );
              }
              return (
                <button key={item.id} type="button" onClick={() => focusSection(item.id)} className="flex min-h-11 w-full items-center gap-3 rounded-[12px] px-3 text-left text-sm font-black text-ink/60 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                  <Icon className="h-4 w-4 shrink-0" /><span className="min-w-0 flex-1">{item.label}</span><ChevronRight className="h-4 w-4 text-ink/20" />
                </button>
              );
            })}''')

repl('src/pages/Settings.tsx', '''          <section id="shared-reports" tabIndex={-1} className="scroll-mt-6 rounded-[18px] border border-slate-200 bg-slate-50 p-4 text-slate-500 shadow-none sm:p-5" aria-labelledby="settings-share-title">''', '''          <section id="shared-reports" data-feature-status="building" tabIndex={-1} className="scroll-mt-6 rounded-[18px] border border-slate-200 bg-slate-50 p-4 text-slate-500 shadow-none sm:p-5" aria-labelledby="settings-share-title">''')
repl('src/pages/Settings.tsx', '''            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))} className="mt-4 min-h-11 rounded-full border border-slate-200 bg-slate-100 px-4 text-sm font-black text-slate-400 shadow-none">''', '''            <button type="button" data-building-action="learn" onClick={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))} className="mt-4 min-h-11 rounded-full border border-slate-200 bg-slate-100 px-4 text-sm font-black text-slate-400 shadow-none">''')

repl('scripts/verify-action-kind-runtime.mjs', '''    assert.equal(unnamed, 0, `${route} 存在没有可理解名称的可点击按钮`);
    assert.equal(errors.length, 0, `${route} 页面错误：${errors.join('; ')}`);''', '''    assert.equal(unnamed, 0, `${route} 存在没有可理解名称的可点击按钮`);
    const invalidBuildingActions = await page.locator('[data-feature-status="building"] button:not([data-building-action])').count();
    assert.equal(invalidBuildingActions, 0, `${route} 建设中功能仍暴露了未声明用途的业务按钮`);
    assert.equal(errors.length, 0, `${route} 页面错误：${errors.join('; ')}`);''')

repl('scripts/verify-action-kind-runtime.mjs', '''  const page = await context.newPage();
  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });''', '''  const settingsPage = await context.newPage();
  await settingsPage.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' });
  const sharingBuildingNav = settingsPage.locator('[data-settings-building-nav="sharing"]');
  await sharingBuildingNav.waitFor();
  assert.match((await sharingBuildingNav.innerText()), /分享与隐私/);
  assert.match((await sharingBuildingNav.innerText()), /建设中/);
  assert.equal(await settingsPage.getByRole('button', { name: '分享与隐私', exact: true }).count(), 0, '建设中的分享与隐私不能继续伪装成普通设置导航按钮');
  const sharingSection = settingsPage.locator('#shared-reports');
  assert.equal(await sharingSection.getAttribute('data-feature-status'), 'building', '分享与隐私 section 必须显式声明 building');
  assert.equal(await sharingSection.getByRole('button', { name: '了解功能', exact: true }).getAttribute('data-building-action'), 'learn', 'building surface 只允许明确的元动作');
  await settingsPage.close();

  const page = await context.newPage();
  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });''')
