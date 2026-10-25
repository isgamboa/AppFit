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
run('markOnboarded();today=()=>parseYmd("2026-01-05");startProgramRun("boost_pro_ombro","2026-01-05",4)');
const raw=run('JSON.stringify(state)');
const invalids=[
 s=>s.schemaVersion=3,
 s=>s.runs[0].weekCount=13,
 s=>s.runs[0].schedule[0].plan.ex=[null],
 s=>s.runs[0].schedule[0].date='2026-02-30',
 s=>s.runs[0].schedule[1].date=s.runs[0].schedule[0].date,
 s=>s.runs[0].schedule[0].index=20,
 s=>s.runs[0].baselinePR={Supino:'bad'},
 s=>s.runs[0].endDate='2099-01-01',
 s=>s.sessions={'2026-01-05':{x:{sets:[{kg:{bad:true}}]}}},
 s=>s.customPrograms[0].durationWeeks=0
];
for(const mutate of invalids){const s=JSON.parse(raw);mutate(s);let rejected=false;try{run('normalizeBackup('+JSON.stringify(s)+')')}catch(e){rejected=true;}ok(rejected,'invalid backup rejected');ok(run('JSON.stringify(state)')===raw,'invalid import preserves state');}
run('selectedDate="2026-01-05";setTab("hoje")');
const type=run('planKeyForDate(curDate())');
run('setSet("2026-01-05",'+JSON.stringify(type)+',4,0,"kg","20");setSet("2026-01-05",'+JSON.stringify(type)+',4,0,"reps","30");markExerciseSets("2026-01-05",'+JSON.stringify(type)+',4,true)');
ok(run('runStatistics(activeRun()).prs["Banco de extensão lombar"]')===undefined,'isometric seconds never create a 1RM PR');
ok(run('runStatistics(activeRun()).trained')===1,'completed series count trained day');
ok(run('runStatistics(activeRun()).groups["Posterior de Coxa"].actual')===3,'isometric series still counted');
run('today=()=>parseYmd("2026-01-13");const t=activeRun().schedule[7].plan.tipo;setSet("2026-01-12",t,0,0,"kg","40")');
ok(run('replanProposal(activeRun()).missedDate')==='2026-01-09','sessions with recorded values are protected from replan');
ok(run('runStatistics(activeRun()).trained')===1,'uncompleted entered values do not count as trained day');
const proposal=run('replanProposal(activeRun())');
run('applyReplan(activeRun().id,'+JSON.stringify(proposal)+')');
ok(run('activeRun().schedule[7].date')==='2026-01-12','partial data stays on original date');
const oldId=run('activeRun().id'),oldStats=run('runStatistics(activeRun()).trained');
run('startProgramRun("boost_pro_ombro","2026-01-05",4);const t=activeRun().schedule[0].plan.tipo;markExerciseSets("2026-01-05",t,0,true)');
ok(run('runStatistics(state.runs.find(r=>r.id==='+JSON.stringify(oldId)+')).trained')===oldStats,'overlapping cycles preserve earlier results');
ok(run('Object.keys(state.log["2026-01-05"].runLogs).length')===2,'two cycles on the same date remain separate');
run('selectedDate="2026-01-05";setTab("hoje");document.getElementById("fabTimer").click()');ok($('#sheet').textContent.includes('Descanso'),'global timer works with click event argument');run('closeSheet()');
run('const p=clone(activeRun().schedule[0].plan);p.ex.slice(0,3).forEach(e=>{e.groupId="tri";e.groupType="Tri-set"});window.triPreview=groupHeading(p,0)');ok(run('window.triPreview').includes('1 + 2 + 3'),'tri-set members explicitly listed');
run('startProgramRun("refundini","2026-01-05",2);selectedDate="2026-01-08";setTab("hoje")');ok($('#view').textContent.includes('Fiz o cardio'),'original optional recovery preserved');
run('const base=PROGRAMS.boost_pro_ombro;PROGRAMS.periodic12={...base,id:"periodic12",durationWeeks:12,weekPlans:Object.fromEntries(Array.from({length:12},(_,i)=>[i+1,base.weekPlans[i%4+1]]))};startProgramRun("periodic12","2026-01-05",12)');
ok(run('activeRun().schedule.length')===84,'periodized program supports 84 calendar days');
ok(run('activeRun().schedule.at(-1).sourceWeek')===12,'periodized twelfth week retained');
ok(run('new Set(activeRun().schedule.map(d=>d.plan.tipo)).size')===84,'each periodic day has an independent plan ID');
run('today=()=>parseYmd("2026-01-06");openStartProgram("refundini")');
const countBeforeEmpty=run('state.runs.length');$('#runWeeks').value='';$('#startRun').click();ok(run('state.runs.length')===countBeforeEmpty,'existing weekly program requires an explicit duration');run('closeSheet()');
run('startProgramRun("refundini","2026-01-05",1);today=()=>parseYmd("2026-01-20");selectedDate=null;setTab("hoje")');
ok(run('activeRun().status')==='elapsed','calendar expiry does not silently restart');
ok($('#view').textContent.includes('Prazo do programa encerrado'),'expired run shows statistics');
run('today=()=>parseYmd("2026-01-05");startProgramRun("refundini","2026-01-05",1);selectedDate="2026-01-07";setTab("hoje")');
$('#cycleBtn').click();$('#confirmFlip').click();ok(run('activeRun().schedule[2].plan.sourceTipo')==='C2','original C/D inversion preserved in dated runs');
run('startProgramRun("boost_pro_ombro","2026-01-05",4);selectedDate="2026-01-05";setTab("hoje");const t=planKeyForDate(curDate());setSet("2026-01-05",t,0,0,"kg","50");setSet("2026-01-05",t,0,0,"reps","10");render()');
$('[data-act="swap"][data-i="0"]').click();$('[data-pick="Remada baixa sentado"]').click();
ok($('[data-set="kg"][data-i="0"]').value==='','catalog picker does not transfer loads to another exercise');
$('[data-act="edit"][data-i="0"]').click();
for(const [field,value] of Object.entries({nome:'Exercício próprio',grupo:'Outro',series:'2',reps:'8'}))$('[data-e="'+field+'"][data-i="0"]').value=value;
$('[data-act="saveEdit"][data-i="0"]').click();
ok($$('.ex')[0].querySelectorAll('[data-set="kg"]').length===2,'manual execution edit changes target set count');
ok($('.ex a.play').href.includes('/results?'),'manual exercise uses search instead of stale catalog video');
$('[data-act="edit"][data-i="0"]').click();$('[data-act="resetEx"][data-i="0"]').click();ok($('[data-set="kg"][data-i="0"]').value==='50','restore planned exercise recovers its own original load');
run('state.log["2025-01-01"]={done:{"A-0":true}};state.sessions["2025-01-01"]={"A-0":{nm:"Supino legado",sets:[{kg:"40",reps:"10"}]}};setTab("progresso")');
ok($('#view').textContent.includes('Histórico legado'),'legacy history explicitly identified');$('[data-go="legacy-history"]').click();ok($('#view').textContent.includes('Supino legado'),'legacy records remain readable');ok($('#view').textContent.includes('Não informada'),'legacy set completion not fabricated');
const corrupt='{"schemaVersion":999,"sessions":{"precious":"original"}}';
const broken=new JSDOM(html,{runScripts:'dangerously',url:'https://recovery/',beforeParse(w){w.localStorage.setItem(LS,corrupt);w.localStorage.setItem('treino_onboarded','1');w.scrollTo=()=>{};w.alert=()=>{};}});
ok(broken.window.localStorage.getItem(LS)===corrupt,'invalid boot data is not overwritten');ok(broken.window.trySave()===false&&broken.window.localStorage.getItem(LS)===corrupt,'photo save path cannot overwrite protected originals');ok(broken.window.document.querySelector('#recoverOriginal')!==null,'invalid boot offers original data recovery');
const file=new broken.window.File(['{}'],'valid.json',{type:'application/json'});broken.window.importData({target:{files:[file]}});await new Promise(r=>setTimeout(r,60));
ok(JSON.parse(broken.window.localStorage.getItem(LS)).schemaVersion===2,'explicit valid import recovers safely');broken.window.close();
ok(!jsErr,'no runtime errors');console.log(`RESULT: ${pass} passed, ${fail} failed`);if(fail)console.log(fails.join('\n'));dom.window.close();process.exitCode=fail?1:0;
