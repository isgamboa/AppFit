import {JSDOM, VirtualConsole} from "jsdom";
import fs from "fs";
const html=fs.readFileSync(new URL("../index.html", import.meta.url),"utf-8");
let pass=0,fail=0; const fails=[];
const ok=(c,m)=>{ if(c){pass++;} else {fail++; fails.push(m);} };

const vc=new VirtualConsole();
let jsErr=null;
vc.on("jsdomError",e=>{ if(!/Not implemented/.test(e.message)){ jsErr=e.message; console.log("JSDOM ERROR:",e.message);} });

const ctx=new Proxy({},{get(t,p){
  if(p==="createLinearGradient"||p==="createRadialGradient")return ()=>({addColorStop(){}});
  if(p==="measureText")return ()=>({width:10});
  if(p==="getImageData")return ()=>({data:[]});
  if(p==="canvas")return {width:300,height:150};
  return ()=>{};
}});

const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,virtualConsole:vc,url:"https://local/treino",
  beforeParse(w){
    w.scrollTo=()=>{};w.alert=()=>{};w.confirm=()=>true;
    w.HTMLCanvasElement.prototype.getContext=()=>ctx;
    w.AudioContext=w.webkitAudioContext=function(){return {currentTime:0,destination:{},close(){},
      createOscillator:()=>({connect(){},start(){},stop(){},frequency:{value:0},type:""}),
      createGain:()=>({connect(){},gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}}})};};
    w.devicePixelRatio=2;
    try{Object.defineProperty(w.navigator,"vibrate",{value:()=>true,configurable:true});}catch(e){}
  }});
const {window}=dom, doc=window.document;
const LS="treino_app_v1";
const st=()=>JSON.parse(window.localStorage.getItem(LS)||"{}");
const $=s=>doc.querySelector(s), $$=s=>[...doc.querySelectorAll(s)];
const fire=(el,t)=>el.dispatchEvent(new window.Event(t,{bubbles:true}));
await new Promise(r=>setTimeout(r,80));


const run=code=>window.eval(code);
const program=JSON.parse(fs.readFileSync(new URL('../data/standard-programs/protocol-black.json',import.meta.url)));
const ex=program.weeks.flatMap(w=>w.days.flatMap(d=>d.exercises));
ok(program.durationWeeks===12&&program.weeks.length===12,'12 weeks');
ok(program.weeks.flatMap(w=>w.days).length===72&&ex.length===766,'72 sessions and 766 prescriptions');
ok(new Set(ex.map(e=>e.id)).size===766,'all occurrence identities distinct');
const expected=[[9,9,9,9,9,9],[9,9,9,9,9,10],[11,11,13,12,13,13],[13,13,14,12,13,13],[9,10,10,8,10,11],[8,9,9,8,8,9],[8,9,9,8,8,9],[11,11,12,11,11,11],[11,12,13,10,10,11],[10,12,12,11,12,11],[11,12,12,10,11,13],[11,13,11,13,13,14]];
program.weeks.forEach((w,i)=>ok(JSON.stringify(w.days.map(d=>d.exercises.length))===JSON.stringify(expected[i]),'source table count week '+(i+1)));
ok(ex.every(e=>e.reps==='NO REPS'&&e.restSeconds===90&&JSON.stringify(e.restRangeSeconds)==='[60,90]'),'shared source cells propagated to every row');
ok(new Set(ex.filter(e=>e.groupId).map(e=>e.groupId)).size===51,'51 source bi-sets');
for(const w of program.weeks)for(const d of w.days)for(const gid of new Set(d.exercises.map(e=>e.groupId).filter(Boolean))){const indices=d.exercises.map((e,i)=>e.groupId===gid?i:-1).filter(i=>i>=0);ok(indices.length===2&&indices[1]===indices[0]+1,'bi-set members adjacent and exactly two');}
const abductor=program.weeks[11].days[1].exercises[9];
ok(abductor.sourceName==='Cadeira Abdutora'&&abductor.series===4&&abductor.reps==='NO REPS'&&abductor.seriesSource==='user-confirmed','only blank source series resolved as user requested');
ok(ex.filter(e=>e.seriesSource==='user-confirmed').length===1,'no other source series overridden');
ok(ex.filter(e=>e.technique2).length===99,'all second techniques retained');
ok(program.weeks[5].days.every(d=>d.exercises.every(e=>!e.technique&&!e.technique2)),'week 6 has no invented techniques');
ok(program.weeks[11].days[1].exercises.slice(0,2).every(e=>e.sourceName==='Flexora Unilateral em Pé')&&program.weeks[11].days[1].exercises[0].series===4&&program.weeks[11].days[1].exercises[1].series===2,'duplicate source names keep separate prescriptions');
ok(!/@|IP:|https?:/.test(JSON.stringify(program)),'no PDF hyperlinks or private footers');
ok(program.sources.length===12&&program.sources.every(s=>/^[a-f0-9]{64}$/.test(s.sha256)),'source hashes preserved');
for(const e of ex)ok(run('EXDB.some(c=>c.nome==='+JSON.stringify(e.nome)+'&&c.grupo==='+JSON.stringify(e.grupo)+')'),'source exercise matches catalog');
run('markOnboarded();today=()=>parseYmd("2026-01-05");setTab("programas")');
ok($('[data-activate="protocol_black"]')!==null,'program available for selection');
$('[data-activate="protocol_black"]').click();ok($('#runWeeks').value==='12'&&$('#runWeeks').readOnly,'source duration fixed');$('#runStart').value='2026-01-05';$('#startRun').click();
ok(run('activeRun().schedule.length')===84&&run('activeRun().schedule.filter(d=>!d.plan.rest).length')===72,'84-day calendar with Sunday rests');
ok($$('.ex')[0].textContent.includes('60–90 s')&&$$('.ex')[0].textContent.includes('NO REPS'),'source range and reps visible');
$('[data-act="rest"][data-i="0"]').click();ok($('#sheet').textContent.includes('1:30'),'timer starts at upper source bound');run('closeSheet()');
run('selectedDate="2026-01-19";setTab("hoje")');
ok($$('.technique-group').length===2&&$('.technique-group').textContent.includes('2 + 3'),'week 3 bi-set participants shown');
run('selectedDate="2026-03-24";setTab("hoje")');
ok($$('.ex')[9].querySelectorAll('[data-set="reps"]').length===4,'approved abductor has four set inputs');
ok($$('.ex')[9].textContent.includes('NO REPS'),'no numeric reps invented for abductor');
run('const t=planKeyForDate(curDate());setSet("2026-03-24",t,9,0,"kg","30");setSet("2026-03-24",t,9,0,"reps","17");toggleSetCompletion("2026-03-24",t,9,0,true)');
ok(run('runStatistics(activeRun()).groups.Glúteo.actual')===1,'actual performed reps and completion recorded');
const backup=run('serializeBackup()');run('state=normalizeBackup('+backup+');save();render()');ok(run('serializeBackup()')===backup,'range, manual correction and all histories survive backup round trip');
for(const range of [[90,60],[-1,90],[60,80],[60,'90'],[60,90,120]]){const invalid=JSON.parse(backup);invalid.runs[0].schedule[0].plan.ex[0].restRangeSeconds=range;let rejected=false;try{run('normalizeBackup('+JSON.stringify(invalid)+')')}catch{rejected=true;}ok(rejected,'malformed or incompatible rest range rejected');}
run('selectedDate="2026-03-28";setTab("hoje");const t=planKeyForDate(curDate());for(let i=0;i<dayTotal(t);i++)markExerciseSets("2026-03-28",t,i,true);updateSessionCompletion("2026-03-28",t);save();setTab("run-results")');ok(run('activeRun().status')==='completed','last Saturday completes execution');
ok(!jsErr,'no runtime errors');console.log(`RESULT: ${pass} passed, ${fail} failed`);if(fail)console.log(fails.join('\n'));dom.window.close();process.exitCode=fail?1:0;
