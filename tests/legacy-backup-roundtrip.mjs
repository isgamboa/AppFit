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
// The optional private fixture is never copied into the repository.
const program=JSON.parse(fs.readFileSync(new URL('../data/programas/fullbody-aprovado-v1_1.json',import.meta.url)));
const synthetic={programId:program.id,customPrograms:[program],log:{},sessions:{},weights:[],activities:[]};
for(const [date,t] of [['2026-10-22',program.sessions[1]],['2026-10-24',program.sessions[2]]]){
 const plan=structuredClone(program.plans[t]),log={done:{},snapshot:plan,exerciseChoices:{}};
 plan.programId=program.id;synthetic.log[date]=log;synthetic.sessions[date]={};
 plan.ex.forEach((e,i)=>{
  const base=t+'-'+e.id,choice=date==='2026-10-24'&&i===5;
  const sid=base+(choice?'~'+encodeURIComponent('Rosca na polia'):'');
  e.baseSid=base;e.sid=sid;log.done[sid]=true;
  if(choice){e.planned=structuredClone(e);e.nome='Rosca na polia';log.exerciseChoices[base]={nome:e.nome,grupo:'Bíceps'};}
  synthetic.sessions[date][sid]={nm:e.nome,gp:e.grupo,sets:Array.from({length:3},()=>({kg:'20',reps:'10'}))};
 });
}
const input=process.env.APPFIT_LEGACY_BACKUP?JSON.parse(fs.readFileSync(process.env.APPFIT_LEGACY_BACKUP)):synthetic;
const importFile=async data=>{window.importData({target:{files:[new window.File([JSON.stringify(data)],'backup.json',{type:'application/json'})]}});await new Promise(r=>setTimeout(r,60));};
run('markOnboarded();today=()=>parseYmd("2026-10-25");setTab("progresso")');
await importFile(input);
ok($('#view').textContent.includes('Configuração pendente'),'legacy import lands on configuration');
run('openStartProgram(state.programId)');
ok($('#includeLegacy').checked,'continuing an old program offers legacy incorporation');
$('#runStart').value='2026-10-19';$('#runWeeks').value='4';fire($('#runStart'),'input');
ok($('#legacyImportPreview').textContent.includes('2 sessão'),'date preview identifies the two imported sessions');
const original=run('JSON.stringify(state)');
$('#startRun').click();
ok(run('activeRun().startDate')==='2026-10-19','requested start applied');
ok(run('runStatistics(activeRun()).trained')===2,'two imported trained days');
ok(run('runStatistics(activeRun()).complete')===2,'two imported complete sessions');
ok(run('Object.values(runStatistics(activeRun()).groups).reduce((n,g)=>n+g.actual,0)')===48,'48 existing sets counted from exercise-level completion');
ok(run('activeRun().legacyImports.length')===2,'original payloads preserved for audit');
ok(run('legacyDates().length')===0,'linked records are no longer duplicated as legacy');
ok(run('legacyImportCandidates(activeRun()).length')===0,'incorporation cannot repeat');
for(const date of ['2026-10-22','2026-10-24']){
 const prior=input.sessions[date];
 for(const record of Object.values(prior)){
  const result=run('JSON.stringify(Object.values(state.sessions['+JSON.stringify(date)+']).find(s=>s.nm==='+JSON.stringify(record.nm)+'))');
  const actual=JSON.parse(result);
  ok(actual.sets.every((set,i)=>set.kg===record.sets[i].kg&&set.reps===record.sets[i].reps),'loads and repetitions preserved: '+record.nm);
 }
}
run('selectedDate="2026-10-24";setTab("hoje")');
ok($('#view').textContent.includes('Rosca na polia'),'replacement retained in daily execution');
ok(run('dayExercise("2026-10-24",planKeyForDate(parseYmd("2026-10-24")),5).nome')==='Rosca na polia','replacement linked to correct slot');
run('selectedDate="2026-10-22";setTab("semana")');
ok($('#view').textContent.includes('100%'),'weekly detail counts imported completion');
const exported=run('serializeBackup()');
await importFile(JSON.parse(exported));
ok(run('runStatistics(activeRun()).trained')===2,'export/reimport preserves results');
ok(run('serializeBackup()')===exported,'round trip preserves complete serialized state');
run('state=normalizeBackup('+original+');startProgramRun(state.programId,"2026-10-19",4,false)');
ok(run('runStatistics(activeRun()).trained')===0,'unchecked incorporation keeps separate records');
run('selectedDate=null;setTab("hoje")');
ok($('#importLegacyRun')!==null,'existing empty execution offers recovery');
$('#importLegacyRun').click();$('#confirmLegacyImport').click();
ok(run('runStatistics(activeRun()).trained')===2,'existing execution recovered without reimport');
// Storage failure rolls back both execution creation and incorporation.
run('state=normalizeBackup('+original+');save();window.realSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error("storage full")};');
let rejected=false;try{run('startProgramRun(state.programId,"2026-10-19",4,true)');}catch{rejected=true;}
ok(rejected,'creation surfaces persistence failure');ok(run('JSON.stringify(state)')===original,'failed persistence leaves previous state intact');
run('Storage.prototype.setItem=window.realSetItem');
// No implicit completion for unmarked or explicitly uncompleted sets.
run('state=normalizeBackup('+original+');for(const l of Object.values(state.log))l.done={};startProgramRun(state.programId,"2026-10-19",4,true)');
ok(run('runStatistics(activeRun()).trained')===0,'unconfirmed old series never fabricated as complete');
ok(run('runStatistics(activeRun()).partial')===2,'unconfirmed recorded data remains partial');
// Explicit series flags take priority over old exercise-level flags.
run('state=normalizeBackup('+original+');Object.values(state.sessions["2026-10-22"])[0].sets[0].done=false;startProgramRun(state.programId,"2026-10-19",4,true)');
ok(run('runStatistics(activeRun()).complete')===1,'explicit incomplete set remains incomplete');
ok(run('countDone("2026-10-22",planKeyForDate(parseYmd("2026-10-22")))')===7,'weekly completion agrees with explicit set flags');
// An existing partial record is protected; other dates may still be incorporated.
run('state=normalizeBackup('+original+');startProgramRun(state.programId,"2026-10-19",4,false);const target=runDay(activeRun(),"2026-10-22");toggleSetCompletion(target.date,target.plan.tipo,0,0,true);incorporateLegacyRecords(activeRun())');
ok(run('activeRun().legacyImports.length')===1,'partial execution not overwritten by legacy records');
ok(run('runStatistics(activeRun()).complete')===1,'nonconflicting day still incorporated');
// Wrong period and unrelated program are never reassigned.
run('state=normalizeBackup('+original+');startProgramRun(state.programId,"2026-11-02",4,true)');
ok(run('legacyDates().length')===2&&run('runStatistics(activeRun()).trained')===0,'outside-period records stay legacy');
run('state=normalizeBackup('+original+');startProgramRun("refundini","2026-10-19",4,true)');
ok(run('legacyDates().length')===2,'unrelated program cannot claim records');
// Preserve the historical session even when a later template changes weekdays.
run('state=normalizeBackup('+original+');state.customPrograms[0].days[4]=state.customPrograms[0].off;state.customPrograms[0].days[3]=state.customPrograms[0].sessions[1];startProgramRun(state.programId,"2026-10-19",4,true)');
ok(run('runStatistics(activeRun()).trained')===2,'historical weekday preserved after template edits');
// Current-schema imports preserve cycle identity; invalid imports are atomic.
const safe=run('serializeBackup()');const invalid=JSON.parse(safe);invalid.runs[0].weekCount=99;
await importFile(invalid);ok(run('serializeBackup()')===safe,'invalid import preserves current execution');
run('window.appDataLoadError="invalid original"');let protectedExport=false;try{run('serializeBackup()');}catch{protectedExport=true;}
ok(protectedExport,'export does not mask original data recovery with default state');
ok(!jsErr,'no runtime errors');console.log(`RESULT: ${pass} passed, ${fail} failed`);if(fail)console.log(fails.join('\n'));dom.window.close();process.exitCode=fail?1:0;
