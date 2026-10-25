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
run('today=()=>parseYmd("2026-01-05")');
ok(run('state.schemaVersion')===2,'state migrated to schema 2');
ok($('#view').textContent.includes('Configuração pendente'),'old active program requires configuration');
ok(run('state.runs.length')===0,'migration does not invent historical runs');
let rejected=false;try{run('startProgramRun("boost_pro_ombro","2026-01-06",4)')}catch(e){rejected=true;}ok(rejected,'start must be Monday');
rejected=false;try{run('startProgramRun("boost_pro_ombro","2026-01-05",12)')}catch(e){rejected=true;}ok(rejected,'fixed program duration enforced');
run('startProgramRun("boost_pro_ombro","2026-01-05",4);selectedDate="2026-01-05";setTab("hoje")');
const firstId=run('activeRun().id');
ok(run('activeRun().schedule.length')===28,'four complete calendar weeks');
ok(run('activeRun().schedule.filter(d=>!d.plan.rest).length')===20,'twenty training days');
ok(run('activeRun().schedule.reduce((n,d)=>n+(d.plan.rest?0:d.plan.ex.length),0)')===174,'174 prescriptions');
ok(run('activeRun().schedule[0].plan.ex[0].nome')!==run('activeRun().schedule[7].plan.ex[0].nome'),'exercises vary across weeks');
ok($$('.technique-group').length===1,'Monday bi-set group shown');
ok($('.technique-group').textContent.includes('3 + 4'),'group members explicit');
ok($$('.set-complete').length>0,'per-set completion controls');
run('selectedDate="2026-01-06";setTab("hoje")');ok($$('.technique-group').length===2,'two independent bi-sets');
run('openTimer(0)');ok($('#sheet').textContent.includes('Sem descanso'),'zero rest respected');run('closeSheet();openTimer(90)');ok($('#tNum').textContent==='1:30','prescribed 90 second timer');run('closeSheet()');
run('selectedDate="2026-01-09";setTab("hoje")');
$('#finishBtn').click();ok(run('runCompletion(activeRun(),activeRun().schedule[4]).complete'),'quick completion marks every series');
run('today=()=>parseYmd("2026-01-13")');
const proposal=run('replanProposal(activeRun())');ok(proposal.missedDate==='2026-01-12','most recent unstarted missed session');ok(proposal.delta===1,'one day shift');
run('applyReplan(activeRun().id,'+JSON.stringify(proposal)+')');
ok(run('activeRun().schedule[7].date')==='2026-01-13','missed session now today');
ok(run('activeRun().schedule[8].date')==='2026-01-14','following session shifted');
ok(run('activeRun().schedule[4].date')==='2026-01-09','completed session not moved');
ok(run('activeRun().endDate')==='2026-02-02','calendar prolonged');
run('selectedDate="2026-01-13";setTab("hoje")');
const type=run('planKeyForDate(curDate())');
run('setSet("2026-01-13",'+JSON.stringify(type)+',0,0,"kg","50");setSet("2026-01-13",'+JSON.stringify(type)+',0,0,"reps","10")');
$('.set-complete').click();ok(run('runStatistics(activeRun()).partial')===1,'partial session counted');
ok(run('runStatistics(activeRun()).groups.Costas.actual')===1,'one actual series counted');
ok(run('runStatistics(activeRun()).prs["Remada Curvada"].after')>50,'PR calculated from completed sets');
const saved=run('JSON.stringify(state)');
rejected=false;try{run('normalizeBackup({schemaVersion:99})')}catch(e){rejected=true;}ok(rejected,'future backup rejected');ok(run('JSON.stringify(state)')===saved,'failed validation does not change current state');
run('selectedDate=activeRun().schedule.filter(d=>!d.plan.rest).at(-1).date;const lastDate=selectedDate;today=()=>parseYmd(lastDate);setTab("hoje")');
$('#finishBtn').click();ok(run('activeRun().status')==='completed','final session completes program');ok(run('currentTab')==='run-results','results open automatically');ok($('#view').textContent.includes('Reiniciar programa'),'restart available on results');
const oldStats=run('runStatistics(activeRun())');
run('startProgramRun("boost_pro_ombro","2026-02-02",4)');
ok(run('state.runs.length')===2,'restart creates a separate run');
ok(run('activeRun().id')!==firstId,'run identity changes');
ok(run('runStatistics(state.runs[0]).complete')===oldStats.complete,'earlier run results retained');
run('const manual=newCustomProgram();manual.durationWeeks=12;state.customPrograms.push(manual);startProgramRun(manual.id,"2026-02-02",12)');
ok(run('activeRun().schedule.length')===84,'manual programs support twelve weeks');
ok(run('activeRun().schedule.filter(d=>!d.plan.rest).length')===36,'manual weekly schedule repeats');
const beforeReload=run('activeRun().id');run('state=normalizeBackup(JSON.parse(JSON.stringify(state)))');ok(run('activeRun().id')===beforeReload,'versioned round-trip preserves active run');
const legacy={programId:'refundini',sessions:{'2025-01-06':{'A-0':{nm:'Puxada frente',sets:[{kg:'60',reps:'10'}]}}},log:{'2025-01-06':{done:{'A-0':true}}}};
const migrated=run('normalizeBackup('+JSON.stringify(legacy)+')');ok(migrated.activeRunId===null&&migrated.runs.length===0,'legacy records unassigned to cycles');ok(migrated.sessions['2025-01-06']['A-0'].sets[0].kg==='60','legacy loads preserved');
const countBefore=run('state.runs.length');window.applyRemote(JSON.stringify({schemaVersion:99}));ok(run('state.runs.length')===countBefore,'invalid remote does not overwrite current state');
ok(!jsErr,'no JavaScript errors');
console.log(`RESULT: ${pass} passed, ${fail} failed`);if(fail)console.log(fails.join('\n'));dom.window.close();process.exitCode=fail?1:0;
