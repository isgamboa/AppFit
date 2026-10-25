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

// --- boot ---
ok(!jsErr, "no JS errors on boot ("+jsErr+")");
ok($("#view") && $("#view").innerHTML.length>200, "Hoje view renders");
ok($$(".navbtn").length===5, "5 tabs present");
ok(typeof window.setTab==="function", "globals reachable (setTab)");


const run=code=>window.eval(code);
// Isolate editor tests from preloaded user programs (covered in seeded-programs.mjs).
run('today=()=>parseYmd("2026-01-06");state.customPrograms=[]');
run('openCustom()');
ok(!!$('#customSave'), 'editor opens');
$('#customName').value='ABC pessoal';
$('#customSave').click();
ok(run('state.customPrograms.length')===1,'program saved');
const id=run('state.customPrograms[0].id');
$(`[data-activate="${id}"]`).click();$("#runStart").value="2026-01-05";$("#startRun").click();
ok(run('actProg().id')===id,'program activated');
ok(run('new Set(actProg().days.filter(t=>t!==actProg().off)).size')===3,'three sessions');
run('setTab("programas")');
$(`[data-custom-copy="${id}"]`).click();
ok(run('state.customPrograms.length')===2,'duplicate saved');
ok(run('state.customPrograms[0].sessions.every(t=>!state.customPrograms[1].sessions.includes(t))'),'duplicate sessions isolated');
run('openCustom(state.programId)');
$('#customName').value='';$('#customSave').click();
ok(run('state.customPrograms[0].nome')==='ABC pessoal','invalid draft does not overwrite');
$('#customName').value='ABC atualizado';
const first=run('customDraft.plans[customDraft.sessions[0]].ex[0].id');
$('[data-ex-move="0"][data-dir="1"]').click();
ok(run('customDraft.plans[customDraft.sessions[0]].ex[1].id')===first,'reorder keeps identity');
$('#customSave').click();
run('const t=activeRun().schedule[0].plan.tipo;setSet("2026-01-05",t,0,0,"kg","60");setSet("2026-01-05",t,0,0,"reps","10");dayLog("2026-01-05",t).done[slotId(t,0)]=true;save()');
ok(run('historyStats("2026-01-05").done')===1,'completion captured');
const historicalName=run('readDayLog("2026-01-05",activeRun().schedule[0].plan.tipo).snapshot.ex[0].nome');
run('setTab("programas")');
window.confirm=()=>true;
$(`[data-custom-delete="${id}"]`).click();
ok(run('state.customPrograms.length')===1,'delete program');
ok(run('historyStats("2026-01-05").done')===1,'history survives deletion');
ok(run('PLN(planKeyForDate(parseYmd("2026-01-05"))).ex[0].nome')===historicalName,'past calendar preserves exercise');
ok(run('Object.keys(progressByName()).includes('+JSON.stringify(historicalName)+')'),'load history survives deletion');
run('openCustom()');$('#customModel').value='fullbody';fire($('#customModel'),'change');
ok(run('customDraft.model')==='fullbody','fullbody model selectable');
for(let session=0;session<3;session++){
 for(let day=0;day<7;day++){
  const select=$$('[data-custom-day]')[session];select.value=String(day);fire(select,'change');
  ok(select.value===String(day),'session '+session+' accepts day '+day);
  ok(new Set($$('[data-custom-day]').map(el=>el.value)).size===3,'session days remain distinct');
 }
}
const selectedDays=$$('[data-custom-day]').map(el=>el.value).join(',');
$('#customName').value='Nome preservado';
window.confirm=()=>false;
$('#customModel').value='abc';fire($('#customModel'),'change');
ok($('#customModel').value==='abc','model selection does not depend on native confirm');
ok($('#customName').value==='Nome preservado','model change preserves program name');
ok($$('[data-custom-day]').map(el=>el.value).join(',')===selectedDays,'model change preserves chosen days');
$('#customModel').value='fullbody';fire($('#customModel'),'change');
for(let i=0;i<$('#customExercise').options.length;i++){
 $('#customExercise').value=String(i);fire($('#customExercise'),'change');
 ok($('#customExercise').value===String(i),'exercise option '+i+' selectable');
}

ok(run('customDraft.sessions.every(t=>customDraft.plans[t].ex.some(e=>e.grupo==="Costas")&&customDraft.plans[t].ex.some(e=>e.grupo==="Peito"))'),'fullbody covers multiple groups each day');
$('#customName').value='<img src=x onerror=alert(1)>';$('#customSave').click();
ok(!$('#view img'),'program name escaped');
ok(st().customPrograms.length===2,'custom programs persisted');
run('state=load()');ok(run('state.customPrograms.length')===2,'reload preserves programs');
const cloud=run('syncStateForCloud()');ok(JSON.parse(cloud).customPrograms.length===2,'sync payload includes programs');
run('applyRemote('+JSON.stringify(cloud)+')');ok(run('state.customPrograms.length')===2,'remote restore preserves programs');
for(const t of ['hoje','semana','corpo','atividades','progresso','programas']){window.setTab(t);ok($('#view').innerHTML.length>50,'tab '+t);}
ok(!jsErr,'no runtime errors');
console.log(`RESULT: ${pass} passed, ${fail} failed`);if(fail)console.log(fails.join('\n'));
dom.window.close();process.exitCode=fail?1:0;
