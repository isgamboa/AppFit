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
const approved=JSON.parse(fs.readFileSync(new URL('../data/programas/fullbody-aprovado-v1_1.json',import.meta.url),'utf8'));
const id=approved.id;
ok(run('state.customPrograms.length')===1,'approved program preloaded');
ok(run('state.programId')==='refundini','preload does not activate program');
ok(JSON.stringify(run('state.customPrograms[0]'))===JSON.stringify(approved),'all program fields match approved JSON');
ok(run('state.customPrograms[0].sessions.map(t=>state.customPrograms[0].plans[t].ex.length).join(",")')==='8,8,8','three sessions with eight exercises');
ok(approved.days.indexOf(approved.sessions[0])===2&&approved.days.indexOf(approved.sessions[1])===4&&approved.days.indexOf(approved.sessions[2])===6,'Tuesday Thursday Saturday');
ok(approved.plans[approved.sessions[1]].ex[3].nome==='Mergulho assistido nas paralelas','provisional rope exercise resolved as requested');
ok(run('EXDB.some(e=>e.nome==="Mergulho assistido nas paralelas")'),'assisted dips added to catalog');
ok(run('EXDB.find(e=>e.nome==="Mergulho assistido nas paralelas").primeiraSubstituicao')==='','no unsupported substitution invented');
run('state=load();state=load()');ok(run('state.customPrograms.length')===1,'reload does not duplicate program');
run('setTab("programas")');ok($('#view').textContent.includes(approved.nome),'program visible in selector');
$(`[data-activate="${id}"]`).click();ok(run('state.programId')===id,'program can be activated manually');
run('selectedDate="2026-10-20";setTab("hoje")');
ok($$('.ex').length===8,'session A renders all exercises');
ok($('#view').textContent.includes('3–4 RIR'),'general instructions visible');
ok($('#view').textContent.includes('Amplitude confortável'),'exercise observations visible');
run('selectedDate="2026-10-22";setTab("hoje")');ok($('#view').textContent.includes('Mergulho assistido nas paralelas'),'session B displays assisted dips');
run('selectedDate="2026-10-24";setTab("hoje")');ok($('#view').textContent.includes('10–15 por lado'),'session C preserves unilateral reps');
run('state.customPrograms=state.customPrograms.filter(p=>p.id!=='+JSON.stringify(id)+');save();state=load()');
ok(run('state.customPrograms.length')===0,'intentional deletion is respected');
const existing={anchor:'2026-01-05',programId:'saitama',customPrograms:[{id:'my-existing',nome:'Meu treino anterior'}],log:{'2026-01-05':{done:{'A-0':true}}},sessions:{'2026-01-05':{'A-0':{nm:'Puxada frente',sets:[{kg:'60',reps:'10'}]}}},photos:[{id:'photo',img:'data:test'}]};
window.localStorage.setItem(LS,JSON.stringify(existing));run('state=load()');
ok(run('state.customPrograms.length')===2,'preload adds to existing custom programs');
ok(run('state.customPrograms[0].nome')==='Meu treino anterior','existing program preserved');
ok(run('state.programId')==='saitama','existing active program preserved');
ok(run('state.sessions["2026-01-05"]["A-0"].sets[0].kg')==='60','existing load preserved');
ok(run('state.log["2026-01-05"].done["A-0"]')===true,'existing completion preserved');
ok(run('state.photos[0].id')==='photo','existing photos preserved');
run('save();state=load()');ok(run('state.customPrograms.length')===2,'subsequent reload remains idempotent');
const edited={...approved,nome:'Nome editado pelo usuário'};
window.localStorage.setItem(LS,JSON.stringify({...existing,customPrograms:[edited]}));run('state=load()');ok(run('state.customPrograms.length')===1&&run('state.customPrograms[0].nome')===edited.nome,'existing edited copy is not overwritten');
ok(!jsErr,'no JavaScript errors');
console.log(`RESULT: ${pass} passed, ${fail} failed`);if(fail)console.log(fails.join('\n'));dom.window.close();process.exitCode=fail?1:0;
