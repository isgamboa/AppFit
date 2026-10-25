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
ok($$('.navbtn').length===5,'five navigation tabs');
ok(!$('[data-tab="dieta"]'),'no diet navigation');
ok(!$('#view').textContent.includes('Água'),'no water dashboard');
for(const name of ['viewDieta','dietS','dietDay','dietConsumed','addWater','fmtWater','openTargets','addMeal','openFoodPicker','openNewFood'])ok(run('typeof '+name)==='undefined','removed function '+name);
ok(!run('Object.prototype.hasOwnProperty.call(state,"diet")'),'no initial diet state');
const names=run('ACTS.map(a=>a[0])');
for(const name of ['Muay Thai','Boxe','Basquete','Ciclismo','Natação'])ok(!names.includes(name),'no new registration for '+name);
for(const name of ['Padel','Remo olímpico'])ok(names.includes(name),'activity available '+name);
ok(run('actKcal("Padel",30,"moderado")')===225,'padel 75kg 30min');
ok(run('actKcal("Remo olímpico",30,"moderado")')===263,'rowing 75kg 30min');
run('state.weights=[{date:"2026-10-25",kg:80}]');
ok(run('actKcal("Remo olímpico",30,"moderado")')===280,'rowing uses recorded weight');
ok(run('actKcal("Remo olímpico",60,"moderado")')===560,'rowing scales with duration');
ok(run('actKcal("Padel",60,"leve")')<run('actKcal("Padel",60,"moderado")'),'light intensity lower kcal');
ok(run('actKcal("Padel",60,"intenso")')>run('actKcal("Padel",60,"moderado")'),'high intensity higher kcal');
run('setTab("atividades");openActivity()');
$('[data-ap="Padel"]').click();
$('#aDur').value='30';fire($('#aDur'),'input');
ok($('#aOut').textContent.includes('240'),'padel live calorie estimate');
ok($('#sheet').textContent.includes('sem MET específico validado'),'padel approximation explained');
$('#aInt').value='intenso';fire($('#aInt'),'change');
$('[data-ap="Remo olímpico"]').click();
ok($('#aInt').value==='intenso','intensity preserved between activity selections');
ok($('#aDur').value==='30','duration preserved');
ok(!!$('#aDist'),'rowing allows distance');
$('#aInt').value='moderado';fire($('#aInt'),'change');$('#aDist').value='5';$('#aSave').click();
ok(run('state.activities.at(-1).type')==='Remo olímpico','rowing registered');
ok(run('state.activities.at(-1).kcal')===280,'calorie estimate saved');
ok(run('state.activities.at(-1).dist')===5,'rowing distance saved');
ok($('#view').textContent.includes('280 kcal'),'rowing calories displayed in history');
const legacy={...JSON.parse(window.localStorage.getItem(LS)),diet:{targets:{water:2000,kcal:2000},log:{today:{water:500}}},activities:[{id:'old',type:'Ciclismo',date:'2026-10-20',dur:60,kcal:500,dist:20}],sessions:{'2026-10-20':{'A-0':{nm:'Supino',sets:[{kg:'60',reps:'10'}]}}}};
window.localStorage.setItem(LS,JSON.stringify(legacy));run('state=load();save()');
ok(!('diet' in JSON.parse(window.localStorage.getItem(LS))),'load removes legacy diet and water');
ok(run('state.activities[0].type')==='Ciclismo','legacy activities retained');
ok(run('state.sessions["2026-10-20"]["A-0"].sets[0].kg')==='60','workout records retained');
run('setTab("atividades")');ok($('#view').textContent.includes('Ciclismo'),'legacy activity history visible');
const file=new window.File([JSON.stringify(legacy)],'legacy.json',{type:'application/json'});window.importData({target:{files:[file]}});await new Promise(r=>setTimeout(r,50));
ok(!run('Object.prototype.hasOwnProperty.call(state,"diet")'),'backup import does not restore diet');
ok(run('state.activities[0].kcal')===500,'import preserves historical calories');
run('applyRemote('+JSON.stringify(JSON.stringify(legacy))+')');
ok(!run('Object.prototype.hasOwnProperty.call(state,"diet")'),'remote sync does not restore diet');
ok(!JSON.parse(run('syncStateForCloud()')).diet,'no diet in cloud payload');
ok(run('state.sessions["2026-10-20"]["A-0"].sets[0].kg')==='60','remote restore preserves strength records');
for(const tab of ['hoje','semana','corpo','atividades','progresso','programas','notas']){window.setTab(tab);ok($('#view').innerHTML.length>50,'remaining screen '+tab);ok(!/Dieta|Água|TMB/.test($('#view').textContent),'no removed feature on '+tab);}
ok(!jsErr,'no JavaScript runtime errors');
console.log(`RESULT: ${pass} passed, ${fail} failed`);if(fail)console.log(fails.join('\n'));dom.window.close();process.exitCode=fail?1:0;
