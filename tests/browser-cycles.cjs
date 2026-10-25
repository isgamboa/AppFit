/* Optional: requires Playwright and Chromium. No external service is contacted. */
const {chromium}=require('playwright');
const http=require('http');const fs=require('fs');const assert=require('node:assert/strict');
(async()=>{
 const server=http.createServer((req,res)=>{if(req.url==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync('index.html'));}else{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const address='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
  for(const mobile of [false,true]){
   const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{assert.match(d.message(),/Importação cancelada/);await d.accept();});
   await page.goto(address);await page.evaluate(()=>{today=()=>parseYmd('2026-01-05');markOnboarded();closeSheet();setTab('programas');});
   await page.locator('[data-activate="boost_pro_ombro"]').click();await page.locator('#runStart').fill('2026-01-05');assert.equal(await page.locator('#runWeeks').inputValue(),'4');await page.locator('#startRun').click();
   assert.equal(await page.locator('.ex').count(),8);assert.equal(await page.locator('.technique-group').count(),1);
   assert.match(await page.locator('.technique-group').innerText(),/3 \+ 4/);if(process.env.CYCLE_SCREENSHOT&&mobile)await page.screenshot({path:process.env.CYCLE_SCREENSHOT,fullPage:false});
   await page.locator('[data-set="kg"][data-i="0"][data-s="0"]').fill('50');await page.locator('[data-set="reps"][data-i="0"][data-s="0"]').fill('10');await page.locator('[data-set-done][data-i="0"][data-s="0"]').check();
   assert.equal(await page.evaluate(()=>runStatistics(activeRun()).groups.Costas.actual),1);
   await page.locator('[data-act="rest"][data-i="2"]').click();assert.match(await page.locator('#sheet').innerText(),/Sem descanso/);await page.evaluate(()=>closeSheet());
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
   await page.evaluate(()=>{today=()=>parseYmd('2026-01-13');selectedDate=null;setTab('hoje');});
   await page.locator('#replanRun').click();assert.match(await page.locator('#sheet').innerText(),/2026-01-12/);await page.locator('#applyReplan').click();assert.equal(await page.evaluate(()=>activeRun().schedule[7].date),'2026-01-13');
   await page.evaluate(()=>{selectedDate=activeRun().schedule.filter(d=>!d.plan.rest).at(-1).date;const now=selectedDate;today=()=>parseYmd(now);setTab('hoje');});
   await page.locator('#finishBtn').click();assert.equal(await page.evaluate(()=>currentTab),'run-results');assert.match(await page.locator('#view').innerText(),/Programa concluído/);assert.equal(await page.locator('.cycle-table tbody tr').count()>0,true);
   const oldId=await page.evaluate(()=>activeRun().id);await page.locator('[data-restart="boost_pro_ombro"]').click();await page.locator('#runStart').fill('2026-02-02');await page.locator('#startRun').click();assert.notEqual(await page.evaluate(()=>activeRun().id),oldId);assert.equal(await page.evaluate(()=>state.runs.length),2);
   await page.reload();assert.equal(await page.evaluate(()=>state.runs.length),2);assert.equal(await page.evaluate(()=>state.schemaVersion),2);
   await page.locator('#settingsBtn').click();await page.locator('#impFile').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"schemaVersion":99}')});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>state.runs.length),2);
   assert.deepEqual(errors,[]);console.log((mobile?'Mobile':'Desktop')+': program setup, bi-set, series, timer, replan, results, restart, reload and invalid import PASS');await context.close();
  }
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
