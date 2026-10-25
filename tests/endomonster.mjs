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
const program=JSON.parse(fs.readFileSync(new URL('../data/standard-programs/endomonster.json',import.meta.url)));
const days=program.weeks.flatMap(w=>w.days),ex=days.flatMap(d=>d.exercises);
ok(program.durationWeeks===12&&program.weeks.length===12,'twelve source weeks');
ok(days.length===72&&ex.length===505,'72 source sessions and 505 prescriptions');
ok(new Set(ex.map(e=>e.id)).size===505,'every occurrence has independent identity');
const expected=[[7,7,4,8,6,4],[7,7,4,6,6,4],[7,7,4,6,6,4],[7,7,4,6,6,4],[9,8,6,8,10,4],[9,8,6,8,10,4],[9,8,6,8,9,4],[9,8,6,9,9,5],[8,9,8,8,8,5],[9,8,8,8,9,5],[8,9,8,8,8,5],[8,9,9,9,8,5]];
program.weeks.forEach((w,i)=>ok(JSON.stringify(w.days.map(d=>d.exercises.length))===JSON.stringify(expected[i]),'source table sizes week '+(i+1)));
const groups=[...new Set(ex.map(e=>e.groupId).filter(Boolean))];
ok(groups.filter(id=>ex.find(e=>e.groupId===id).groupType==='Bi-set').length===27,'27 visually verified bi-sets');
ok(groups.filter(id=>ex.find(e=>e.groupId===id).groupType==='Tri-set').length===1,'one visually verified tri-set');
ok(program.weeks[7].days[3].exercises.slice(5,8).every(e=>e.groupType==='Tri-set'),'week 8 Thursday tri-set exact members');
const cardio=ex.filter(e=>e.kind==='cardio');
ok(cardio.length===69&&cardio.reduce((n,e)=>n+e.durationMinutes,0)===3275,'69 cardio blocks and source minutes');
ok(cardio.filter(e=>e.restSeconds===null).length===68&&cardio.filter(e=>e.restSeconds===90).length===1,'missing rests stay unspecified; week 2 Friday 90s retained');
for(const w of [1,2,3])ok(!program.weeks[w].days[3].exercises.some(e=>e.kind==='cardio'),'no invented cardio on Thursday week '+(w+1));
ok(ex.filter(e=>e.technique2==='ISOMETRIA').length===2,'second technique column retained');
ok(program.weeks[9].days[0].exercises[6].technique===''&&program.weeks[9].days[0].exercises[6].technique2==='FALHA CONCÊNTRICA','blank first technique stays blank');
ok(program.weeks[2].days[3].exercises[1].sourceName==='Leg Press 45º (com pés e joelhos juntos)'&&program.weeks[2].days[3].exercises[1].restSeconds===120,'wrapped table cell rebuilt');
ok(!/@|IP:|https?:/.test(JSON.stringify(program)),'no private footers or PDF links included');
ok(program.sources.length===12&&program.sources.every(s=>/^[a-f0-9]{64}$/.test(s.sha256)),'12 source hashes');
run('markOnboarded();today=()=>parseYmd("2026-01-05");setTab("programas")');
ok($('[data-activate="endomonster"]')!==null,'new standard program appears in selection');
$('[data-activate="endomonster"]').click();ok($('#runWeeks').value==='12'&&$('#runWeeks').readOnly,'fixed source duration at start');
$('#runStart').value='2026-01-05';$('#startRun').click();
ok(run('activeRun().schedule.length')===84,'84 calendar days');
ok(run('activeRun().schedule.filter(d=>!d.plan.rest).length')===72,'72 training days and 12 Sunday rests');
ok(run('activeRun().endDate')==='2026-03-29','last calendar date');
run('const t=planKeyForDate(curDate());setSet("2026-01-05",t,6,0,"reps","45");toggleSetCompletion("2026-01-05",t,6,0,true)');
ok($('[data-set="kg"][data-i="6"]').disabled,'cardio load input disabled');
ok($$('.ex')[6].querySelector('.setshead').textContent.includes('min'),'cardio input in minutes');
ok(run('runStatistics(activeRun()).cardio.actualMinutes')===45,'completed cardio minutes counted');
ok(run('runStatistics(activeRun()).cardio.plannedMinutes')===3275,'planned cardio minutes counted');
ok(run('runStatistics(activeRun()).groups.Cardio')===undefined,'cardio excluded from muscle series totals');
ok(run('Object.keys(runStatistics(activeRun()).prs).length')===0,'cardio cannot generate a strength PR');
ok(run('best1RM([{kg:"100",reps:"45",repsUnit:"minutes"},{kg:"100",reps:"10+15s",repsUnit:"mixed"}])')===0,'timed and mixed records excluded from Epley');
run('selectedDate="2026-01-07";setTab("hoje")');
ok($$('.ex')[2].querySelector('.setshead').textContent.includes('seg'),'plank until failure records seconds');
run('selectedDate="2026-02-26";setTab("hoje")');
ok($('.technique-group').textContent.includes('2 + 3'),'week 8 first bi-set displayed');
ok($$('.technique-group')[1].textContent.includes('Tri-set')&&$$('.technique-group')[1].textContent.includes('6 + 7 + 8'),'tri-set names and numbers displayed');
run('selectedDate="2026-03-03";setTab("hoje")');
ok($$('.ex')[3].querySelector('[data-set="reps"]').type==='text','mixed prescription accepts reps and seconds together');
ok($$('.ex')[3].textContent.includes('ISOMETRIA')&&$$('.ex')[3].textContent.includes('FALHA CONCÊNTRICA'),'both technique columns shown');
run('const t=planKeyForDate(curDate());setSet("2026-03-03",t,3,0,"kg","20");setSet("2026-03-03",t,3,0,"reps","10+15s");toggleSetCompletion("2026-03-03",t,3,0,true)');
ok(run('state.sessions["2026-03-03"][daySlotId("2026-03-03",planKeyForDate(curDate()),3)].sets[0].repsUnit')==='mixed','mixed unit stored');
const backup=run('serializeBackup()');run('state=normalizeBackup('+backup+');save();render()');
ok(run('serializeBackup()')===backup,'new units, techniques and program survive backup round trip');
const invalid=JSON.parse(backup);invalid.runs[0].schedule[0].plan.ex[6].durationUnit='weeks';let rejected=false;try{run('normalizeBackup('+JSON.stringify(invalid)+')');}catch{rejected=true;}ok(rejected,'invalid timing metadata rejected before import');
run('selectedDate="2026-03-28";setTab("hoje");const t=planKeyForDate(curDate());for(let i=0;i<dayTotal(t);i++)markExerciseSets("2026-03-28",t,i,true);updateSessionCompletion("2026-03-28",t);save();setTab("run-results")');
ok(run('activeRun().status')==='completed','last Saturday completes program');
ok($('#view').textContent.includes('Cardio')&&$('#view').textContent.includes('3275'),'results separate cardio volume');
ok(!jsErr,'no runtime errors');console.log(`RESULT: ${pass} passed, ${fail} failed`);if(fail)console.log(fails.join('\n'));dom.window.close();process.exitCode=fail?1:0;
