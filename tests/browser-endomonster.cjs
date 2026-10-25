/* Optional integration check: Playwright + Chromium; local HTTP only. */
const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),assert=require('node:assert/strict');
(async()=>{
 const server=http.createServer((req,res)=>{if(req.url==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync('index.html'));}else{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
  for(const width of [390,1280]){
   const context=await browser.newContext({viewport:{width,height:900},acceptDownloads:true});const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
   await page.goto('http://127.0.0.1:'+server.address().port);
   await page.evaluate(()=>{today=()=>parseYmd('2026-01-05');markOnboarded();closeSheet();setTab('programas');});
   await page.locator('[data-activate="endomonster"]').click();assert.equal(await page.locator('#runWeeks').inputValue(),'12');await page.locator('#runStart').fill('2026-01-05');await page.locator('#startRun').click();
   const cardio=page.locator('.ex').nth(6);assert.match(await cardio.locator('.setshead').innerText(),/min/i);assert.equal(await cardio.locator('[data-set="kg"]').isDisabled(),true);
   await cardio.locator('[data-set="reps"]').fill('45');await cardio.locator('[data-set-done]').check();assert.equal(await page.evaluate(()=>runStatistics(activeRun()).cardio.actualMinutes),45);
   await page.evaluate(()=>{selectedDate='2026-02-26';setTab('hoje');});const tri=page.locator('.technique-group').nth(1);assert.match(await tri.innerText(),/Tri-set.*6 \+ 7 \+ 8/);assert.match(await tri.innerText(),/Desenvolvimento halteres.*Elevação Lateral.*Elevação Frontal/s);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.evaluate(()=>{selectedDate='2026-03-03';setTab('hoje');});const mixed=page.locator('.ex').nth(3);assert.match(await mixed.innerText(),/ISOMETRIA/);await mixed.locator('[data-set="kg"]').first().fill('20');await mixed.locator('[data-set="reps"]').first().fill('10+15s');await mixed.locator('[data-set-done]').first().check();
   assert.equal(await page.evaluate(()=>runStatistics(activeRun()).prs['Crucifixo Reto']),undefined);
   const downloadEvent=page.waitForEvent('download');await page.evaluate(()=>exportData());const download=await downloadEvent;const payload=fs.readFileSync(await download.path());
   await page.evaluate(()=>{state=normalizeBackup({});save();setTab('hoje');});await page.locator('#settingsBtn').click();await page.locator('#impFile').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:payload});await page.waitForFunction(()=>activeRun()?.programId==='endomonster');
   await page.reload();assert.equal(await page.evaluate(()=>runStatistics(activeRun()).cardio.actualMinutes),45);await page.evaluate(()=>{selectedDate='2026-03-03';setTab('hoje');});assert.equal(await page.locator('.ex').nth(3).locator('[data-set="reps"]').first().inputValue(),'10+15s');
   await page.evaluate(()=>{selectedDate='2026-03-28';setTab('hoje');});await page.locator('#finishBtn').click();assert.match(await page.locator('#view').innerText(),/Programa concluído/);assert.match(await page.locator('#view').innerText(),/3275/);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);console.log(width+': Endomonster start, cardio, tri-set, mixed prescription, export/import, reload and results PASS');await context.close();
  }
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
