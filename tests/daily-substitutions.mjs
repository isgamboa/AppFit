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
run('state.customPrograms=[newCustomProgram()];state.programId=state.customPrograms[0].id;selectedDate="2026-01-05";setTab("hoje")');
const key='2026-01-05';
const tipo=()=>run('planKeyForDate(curDate())');
const planned=run('exAt(planKeyForDate(curDate()),0).nome');
const entry=run('catalogExercise(exAt(planKeyForDate(curDate()),0))');
const selected=()=>run('dayExercise(ymd(curDate()),planKeyForDate(curDate()),0).nome');
const sid=()=>run('daySlotId(ymd(curDate()),planKeyForDate(curDate()),0)');
const fill=(field,val)=>{const input=$('[data-set="'+field+'"][data-i="0"][data-s="0"]');input.value=val;fire(input,'change');};
const pick=name=>{$$('[data-day-choice][data-i="0"]').find(b=>b.dataset.dayChoice===name).click();};
ok($$('[data-day-choice][data-i="0"]').length===2,'two configured substitutions visible');
ok($('.ex a.play').href===entry.urlVideo,'planned exercise uses CSV video URL');
fill('kg','60');fill('reps','10');const originalSid=sid();
$('[data-act="toggle"][data-i="0"]').click();
ok(run('historyStats("2026-01-05").done')===1,'original completion counted');
pick(entry.primeiraSubstituicao);
ok(selected()===entry.primeiraSubstituicao,'first substitution selected');
ok($('.ex a.play').href===run('EXDB.find(e=>e.nome==='+JSON.stringify(entry.primeiraSubstituicao)+').urlVideo'),'substitution video updated');
ok($('[data-set="kg"][data-i="0"]').value==='','original load not copied to substitute');
ok(!$('.ex').classList.contains('done'),'completion not transferred');
const firstSid=sid();ok(firstSid!==originalSid,'exercise-specific session key');
fill('kg','24');fill('reps','12');$('[data-act="toggle"][data-i="0"]').click();
ok(run('historyStats("2026-01-05").done')===1,'replacement completion counted once');
pick(entry.segundaSubstituicao);
ok(selected()===entry.segundaSubstituicao,'second substitution selected');
ok($('[data-set="kg"][data-i="0"]').value==='','second substitute has separate load');
fill('kg','45');fill('reps','8');
pick(entry.primeiraSubstituicao);
ok($('[data-set="kg"][data-i="0"]').value==='24','switching back restores first substitute load');
ok($('[data-set="reps"][data-i="0"]').value==='12','switching back restores reps');
ok($('.ex').classList.contains('done'),'switching back restores completion');
pick('');ok(selected()===planned,'restore planned exercise');
ok($('[data-set="kg"][data-i="0"]').value==='60','original load preserved');
pick(entry.primeiraSubstituicao);
const map=run('progressByName()');
ok(map[planned].maxKg===60,'original progress attributed to original');
ok(map[entry.primeiraSubstituicao].maxKg===24,'substitute progress attributed correctly');
ok(map[entry.segundaSubstituicao].maxKg===45,'second substitute progress attributed correctly');
ok(run('state.customPrograms[0].plans[state.customPrograms[0].sessions[0]].ex[0].nome')===planned,'program unchanged');
run('state=load();render()');ok(selected()===entry.primeiraSubstituicao,'daily choice survives reload');
run('selectedDate="2026-01-12";setTab("hoje")');ok(selected()===planned,'next week retains planned exercise');
run('selectedDate="2026-01-05";setTab("hoje")');
const before=selected();run('selectDayExercise(ymd(curDate()),planKeyForDate(curDate()),0,"Não permitido")');ok(selected()===before,'invalid alternative rejected');
const json=run('syncStateForCloud()');run('applyRemote('+JSON.stringify(json)+')');ok(selected()===before,'choice survives sync restore');
run('preserveHistory();state.customPrograms=[];state.programId="refundini";render()');
ok(selected()===before,'historical substitute survives program deletion');
ok($('[data-set="kg"][data-i="0"]').value==='24','historical load survives program deletion');
ok(run('historyStats("2026-01-05").done')===1,'historical completion survives program deletion');
ok(run('lastSets("another-slot","2026-01-12",'+JSON.stringify(entry.primeiraSubstituicao)+')[0].kg')==='24','last load follows exercise across slots');
ok(run('allTimeBest1RM("another-slot","2026-01-12",'+JSON.stringify(entry.primeiraSubstituicao)+')')>24,'PR follows exercise across slots');
ok(run('ytUrl({nome:"Exercício fora do banco",grupo:"Outro"})').includes('/results?'),'manual exercise retains search fallback');
ok(!jsErr,'no runtime errors');
console.log(`RESULT: ${pass} passed, ${fail} failed`);if(fail)console.log(fails.join('\n'));dom.window.close();process.exitCode=fail?1:0;
