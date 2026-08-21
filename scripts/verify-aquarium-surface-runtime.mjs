import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.AQUAGUIDE_URL || process.env.AQUAGUIDE_PREVIEW_URL || process.env.PREVIEW_URL || 'http://127.0.0.1:4317';
const today = new Date().toISOString().slice(0,10);
const state = {
  version: 1,
  currentAquariumId: 'tank-a',
  aquariums: [
    { id:'tank-a', name:'Surface Tank A', fishes:[{id:'stock-1',fishId:'sp_0439',quantity:5,entryDate:today}], dimensions:{length:'60',width:'40',height:'40'}, waterType:'Freshwater', targetTemperature:'25', substrate:'水草泥', plants:['sp_0076'], hardscape:[], equipment:{filter:'瀑布过滤',heater:true,oxygen:false,light:'水草灯'} },
    { id:'tank-b', name:'Surface Tank B', fishes:[], dimensions:{length:'45',width:'30',height:'30'}, waterType:'Freshwater', targetTemperature:'25', substrate:'河沙', plants:[], hardscape:[], equipment:{filter:'海绵过滤',heater:true,oxygen:false,light:'基础灯'} },
  ],
  wishlist: [], dismissedRecommendations: [], diagnosisRecords: [], compatibilityRecords: [], deceasedRecords: [], feedingRecords: [], observationRecords: [], riskReminderState: {},
  onboarding:{version:1,status:'completed',goal:'build_tank',viewedSpecies:true,aquariumConfigured:true,taskCardDismissed:true}, updatedAt:new Date().toISOString()
};
const seed = p => p.addInitScript(saved => { localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved)); localStorage.setItem('aquaguide_locale','zh-CN'); }, state);
const box = async l => { const b = await l.boundingBox(); assert.ok(b); return b; };
const visibleOverlayCount = p => p.locator('[data-slot="dialog-overlay"]:visible').count();
const openSurface = (p,s) => p.locator(`[data-dialog-surface="${s}"][data-open]`).last();

async function fresh(width){ const p=await browser.newPage({viewport:{width,height:900},locale:'zh-CN'}); await seed(p); await p.goto(baseUrl+'/aquarium',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(500); return p; }
async function assertDesktopRail(p,s,maxWidth){ const l=openSurface(p,s); await l.waitFor({state:'visible'}); const b=await box(l); assert.ok(Math.abs((b.x+b.width)-1440)<3 || p.viewportSize().width!==1440); assert.ok(b.width<=maxWidth+2); assert.ok(b.height>=895); assert.equal(await visibleOverlayCount(p),0); assert.equal(await p.evaluate(()=>document.body.classList.contains('modal-open')),false); }

const browser=await chromium.launch({headless:true});
try {
  for(const width of [1440,1024]){
    const p=await fresh(width);
    await p.locator('[data-tank-primary-action="settings"]').click();
    const task=openSurface(p,'task'); await task.waitFor({state:'visible'}); const tb=await box(task);
    assert.ok(tb.width<=762, `${width} task too wide ${tb.width}`); assert.ok(Math.abs(tb.x+tb.width-width)<3); assert.ok(tb.height>=895); assert.equal(await visibleOverlayCount(p),0); assert.equal(await p.evaluate(()=>document.body.classList.contains('modal-open')),false);
    await p.locator('[data-tank-primary-action="add"]').click(); await p.waitForTimeout(150);
    const openTasks=await p.locator('[data-dialog-surface="task"][data-open]').count(); assert.equal(openTasks, 1, `${width}px primary task flows must replace the current rail instead of stacking`);
    await p.close();
  }
  {
    const p=await fresh(390); await p.locator('[data-tank-primary-action="settings"]').click(); const task=openSurface(p,'task'); await task.waitFor({state:'visible'}); const b=await box(task); assert.ok(Math.abs(b.x) < 3, `mobile task sheet must stay fully on-screen: ${JSON.stringify(b)}`); assert.ok(Math.abs(b.y+b.height-900)<3); assert.ok(b.height>650&&b.height<840); assert.ok(await visibleOverlayCount(p)>=1); assert.equal(await p.evaluate(()=>document.body.classList.contains('modal-open')),true); await p.close();
  }
  {
    const p=await fresh(1440); await p.locator('[data-tank-primary-action="fullscreen"]').click(); const media=openSurface(p,'media'); await media.waitFor({state:'visible'}); const b=await box(media); assert.ok(b.x>0&&b.y>=0&&b.x+b.width<=1440); assert.ok(await visibleOverlayCount(p)>=1); assert.equal(await p.evaluate(()=>document.body.classList.contains('modal-open')),true); assert.ok(Math.abs((b.x + b.width / 2) - 720) < 4 && Math.abs((b.y + b.height / 2) - 450) < 4, `media surface must stay centered: ${JSON.stringify(b)}`); await p.close();
  }
  {
    const p=await fresh(390);
    await p.getByRole('button',{name:'更多鱼缸操作'}).click();
    await p.getByRole('button',{name:'删除鱼缸'}).click();
    const blocking=openSurface(p,'blocking'); await blocking.waitFor({state:'visible'}); const b=await box(blocking);
    assert.ok(b.width<=360, `mobile blocking too wide ${b.width}`);
    assert.ok(Math.abs((b.x+b.width/2)-195)<4, `mobile blocking not centered ${JSON.stringify(b)}`);
    assert.ok(Math.abs((b.y+b.height/2)-450)<5, `mobile blocking not vertically centered ${JSON.stringify(b)}`);
    assert.ok(await visibleOverlayCount(p)>=1); assert.equal(await p.evaluate(()=>document.body.classList.contains('modal-open')),true);
     await p.close();
  }
  {
    const p=await fresh(1440); await p.locator('[data-tank-species-entry]').click();
    await openSurface(p,'task').waitFor({state:'visible'});
    await p.locator('[data-livestock-open-profile]').first().click();
    const detail=openSurface(p,'detail'); await detail.waitFor({state:'visible'}); const b=await box(detail);
    assert.ok(b.width>=478&&b.width<=602); assert.ok(Math.abs(b.x+b.width-1440)<3);
    assert.equal(await p.locator('[data-dialog-surface="task"][data-open]').count(),0,'roster task must close before detail opens');
    assert.equal(await visibleOverlayCount(p),0); assert.equal(await p.evaluate(()=>document.body.classList.contains('modal-open')),false);
     await p.close();
  }
  {
    const p=await fresh(390); await p.locator('[data-tank-species-entry]').click();
    await openSurface(p,'task').waitFor({state:'visible'});
    await p.locator('[data-livestock-open-profile]').first().click();
    const detail=openSurface(p,'detail'); await detail.waitFor({state:'visible'}); await p.waitForTimeout(350); const b=await box(detail);
    assert.ok(Math.abs(b.x)<3, `mobile detail x must be 0: ${JSON.stringify(b)}`);
    assert.ok(Math.abs(b.y+b.height-900)<3, `mobile detail must touch bottom: ${JSON.stringify(b)}`);
    assert.ok(b.height>520&&b.height<760, `mobile detail height wrong: ${b.height}`);
    assert.equal(await p.locator('[data-dialog-surface="task"][data-open]').count(),0,'mobile roster task must close before detail opens');
    assert.ok(await visibleOverlayCount(p)>=1); assert.equal(await p.evaluate(()=>document.body.classList.contains('modal-open')),true);
     await p.close();
  }
  console.log('Aquarium surface runtime matrix: PASS');
} finally { await browser.close(); }
