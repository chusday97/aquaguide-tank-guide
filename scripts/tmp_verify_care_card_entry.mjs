import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const baseUrl=process.env.AQUAGUIDE_PREVIEW_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900}});
await context.addInitScript(()=>localStorage.setItem('aquaguide_locale','zh-CN'));
try{
 const page=await context.newPage();
 await page.goto(`${baseUrl}/care?topic=guide_safe_water_change`,{waitUntil:'domcontentloaded',timeout:60000});
 await page.getByRole('dialog').waitFor({timeout:15000});
 const entry=page.getByRole('button',{name:'生成养护卡',exact:true});
 assert.equal(await entry.count(),1,'养护卡生成器存在，但文章详情没有可达的生成养护卡入口');
 await entry.click();
 const card=page.getByRole('dialog').filter({hasText:'生成养护卡'});
 await card.waitFor({timeout:5000});
 assert.equal(await card.getByRole('button',{name:'复制文字',exact:true}).count(),1,'养护卡 Dialog 必须暴露真实复制动作');
}finally{await context.close();await browser.close();}
