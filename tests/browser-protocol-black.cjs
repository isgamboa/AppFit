/* Optional: requires Playwright and Chromium. Local HTTP only. */
const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),assert=require('node:assert/strict');
(async()=>{
 const server=http.createServer((req,res)=>{if(req.url==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync('index.html'));}else{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
  for(const width of [390,1280]){
   const context=await browser.newContext({viewport:{width,height:900},acceptDownloads:true}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
   await page.goto('http://127.0.0.1:'+server.address().port);await page.evaluate(()=>{today=()=>parseYmd('2026-01-05');markOnboarded();closeSheet();setTab('programas');});
   await page.locator('[data-activate="protocol_black"]').click();assert.equal(await page.locator('#runWeeks').inputValue(),'12');await page.locator('#runStart').fill('2026-01-05');await page.locator('#startRun').click();
   assert.match(await page.locator('.ex').first().innerText(),/NO REPS/);assert.match(await page.locator('.ex').first().innerText(),/60–90 s/);
   await page.locator('[data-act="rest"][data-i="0"]').click();assert.match(await page.locator('#sheet').innerText(),/1:30/);await page.evaluate(()=>closeSheet());
   await page.evaluate(()=>{selectedDate='2026-01-19';setTab('hoje');});assert.equal(await page.locator('.technique-group').count(),2);assert.match(await page.locator('.technique-group').first().innerText(),/2 \+ 3/);assert.match(await page.locator('.ex').nth(7).innerText(),/Contração de Pico.*Drop-Set/s);
   await page.evaluate(()=>{selectedDate='2026-03-24';setTab('hoje');});const abductor=page.locator('.ex').nth(9);assert.equal(await abductor.locator('[data-set="reps"]').count(),4);assert.match(await abductor.innerText(),/NO REPS/);
   await abductor.locator('[data-set="kg"]').first().fill('30');await abductor.locator('[data-set="reps"]').first().fill('17');await abductor.locator('[data-set-done]').first().check();assert.equal(await page.evaluate(()=>runStatistics(activeRun()).groups.Glúteo.actual),1);
   const downloadEvent=page.waitForEvent('download');await page.evaluate(()=>exportData());const download=await downloadEvent,payload=fs.readFileSync(await download.path());
   await page.evaluate(()=>{state=normalizeBackup({});save();setTab('hoje');});await page.locator('#settingsBtn').click();await page.locator('#impFile').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:payload});await page.waitForFunction(()=>activeRun()?.programId==='protocol_black');await page.reload();
   await page.evaluate(()=>{selectedDate='2026-03-24';setTab('hoje');});assert.equal(await page.locator('.ex').nth(9).locator('[data-set="reps"]').first().inputValue(),'17');assert.match(await page.locator('.ex').nth(9).innerText(),/60–90 s/);
   await page.evaluate(()=>{selectedDate='2026-03-28';setTab('hoje');});await page.locator('#finishBtn').click();assert.match(await page.locator('#view').innerText(),/Programa concluído/);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);console.log(width+': Protocol Black selection, source reps, range timer, bi-set, approved series, backup and completion PASS');await context.close();
  }
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
