/* Programs and dated executions. Embedded into index.html for offline use. */
function validISODate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=parseYmd(value);return !Number.isNaN(+d)&&ymd(d)===value;}
function validWeekCount(n){return Number.isInteger(n)&&n>=1&&n<=12;}
function normalizeBackup(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('O backup deve conter um objeto de dados.');
  if(raw.schemaVersion!=null&&(!Number.isInteger(raw.schemaVersion)||raw.schemaVersion<1||raw.schemaVersion>2))throw Error('Versão de backup não suportada.');
  const s=removeRetiredData(Object.assign({},clone(defaultState),clone(raw)));
  for(const key of ['log','sessions','overrides'])if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key]))throw Error('Formato inválido: '+key);
  for(const key of ['weights','measures','photos','activities','customPrograms'])if(!Array.isArray(s[key]))throw Error('Formato inválido: '+key);
  for(const [key,field] of [['weights','kg'],['measures',null],['photos',null],['activities',null]]){
    s[key].forEach((record,index)=>{
      if(!record||typeof record!=='object'||Array.isArray(record)||!validISODate(record.date))throw Error('Registro inválido em '+key);
      if(record.id==null)record.id='migrated_'+key+'_'+index+'_'+record.date;
      if(typeof record.id!=='string'||!/^[-_a-zA-Z0-9]+$/.test(record.id))throw Error('Identificador inválido em '+key);
      if(field){record[field]=Number(record[field]);if(!Number.isFinite(record[field])||record[field]<=0)throw Error('Peso inválido.');}
      if(key==='photos'&&typeof record.img!=='string')throw Error('Foto inválida.');
      if(key==='measures'){if(!record.vals||typeof record.vals!=='object'||Array.isArray(record.vals))throw Error('Medidas inválidas.');for(const name of Object.keys(record.vals)){record.vals[name]=Number(record.vals[name]);if(!Number.isFinite(record.vals[name])||record.vals[name]<=0)throw Error('Valor de medida inválido.');}}
      if(key==='activities'){if(typeof record.type!=='string')throw Error('Atividade inválida.');for(const name of ['dur','dist','kcal']){record[name]=Number(record[name]||0);if(!Number.isFinite(record[name])||record[name]<0)throw Error('Valor de atividade inválido.');}}
    });
  }
  for(const p of s.customPrograms){
    if(!p||typeof p.id!=='string'||!/^[-_a-zA-Z0-9]+$/.test(p.id)||['__proto__','constructor','prototype'].includes(p.id)||typeof p.nome!=='string'||!Array.isArray(p.sessions)||p.sessions.length!==3||!Array.isArray(p.days)||p.days.length!==7||!p.plans)throw Error('Programa personalizado incompleto.');
    if(p.durationWeeks!=null&&!validWeekCount(p.durationWeeks))throw Error('Duração inválida em '+p.nome);
    if(new Set(p.sessions).size!==3||!p.off||p.sessions.includes(p.off)||p.days.some(t=>t!==p.off&&!p.sessions.includes(t)))throw Error('Calendário inválido em '+p.nome);
    for(const t of p.sessions){if(!p.plans[t]||!Array.isArray(p.plans[t].ex)||!p.plans[t].ex.length||p.days.filter(x=>x===t).length!==1)throw Error('Sessão inválida em '+p.nome);for(const e of p.plans[t].ex)if(!e||typeof e.nome!=='string'||typeof e.grupo!=='string'||!(parseInt(e.series)>0))throw Error('Exercício inválido em '+p.nome);}
  }
  for(const [date,record] of Object.entries(s.log))if(!validISODate(date)||!record||typeof record!=='object'||Array.isArray(record))throw Error('Registro de treino inválido.');
  for(const root of Object.values(s.log)){
    if(root.runLogs!=null&&(!root.runLogs||typeof root.runLogs!=='object'||Array.isArray(root.runLogs)))throw Error('Histórico de execuções inválido.');
    for(const record of [root,...Object.values(root.runLogs||{})]){
      if(!record||typeof record!=='object'||Array.isArray(record))throw Error('Registro de execução inválido.');
      if(record.done!=null&&(!record.done||typeof record.done!=='object'||Array.isArray(record.done)))throw Error('Marcações inválidas.');
      if(record.snapshot&&(!Array.isArray(record.snapshot.ex)||record.snapshot.ex.some(e=>!e||typeof e.nome!=='string'||typeof e.grupo!=='string')))throw Error('Cópia de sessão inválida.');
    }
  }
  for(const [date,records] of Object.entries(s.sessions)){if(!validISODate(date)||!records||typeof records!=='object'||Array.isArray(records))throw Error('Data de sessão inválida.');for(const r of Object.values(records))if(!r||!Array.isArray(r.sets)||r.sets.some(x=>!x||typeof x!=='object'||Array.isArray(x)||x.done!=null&&typeof x.done!=='boolean'||['kg','reps'].some(k=>x[k]!=null&&!['number','string'].includes(typeof x[k]))))throw Error('Séries inválidas no backup.');}
  if(typeof s.programId!=='string'||!/^[-_a-zA-Z0-9]+$/.test(s.programId)||['__proto__','constructor','prototype'].includes(s.programId))throw Error('Programa selecionado inválido.');
  if(s.settings!=null&&(typeof s.settings!=='object'||Array.isArray(s.settings)))throw Error('Configurações inválidas.');
  s.settings=Object.assign({},defaultState.settings,s.settings||{});
  s.runs=s.runs==null?[]:s.runs;if(!Array.isArray(s.runs))throw Error('Lista de execuções inválida.');
  const ids=new Set();
  for(const r of s.runs){
    if(!r||typeof r.id!=='string'||!/^[-_a-zA-Z0-9]+$/.test(r.id)||['__proto__','constructor','prototype'].includes(r.id)||ids.has(r.id)||!validISODate(r.startDate)||!validWeekCount(r.weekCount)||!Array.isArray(r.schedule)||r.schedule.length!==r.weekCount*7||!['active','paused','elapsed','completed'].includes(r.status))throw Error('Execução de programa inválida.');ids.add(r.id);
    if(typeof r.programId!=='string'||!/^[-_a-zA-Z0-9]+$/.test(r.programId)||['__proto__','constructor','prototype'].includes(r.programId)||typeof r.programName!=='string'||parseYmd(r.startDate).getDay()!==1||!validISODate(r.endDate))throw Error('Identificação de execução inválida.');
    if(r.baselinePR&&Object.values(r.baselinePR).some(n=>typeof n!=='number'||!Number.isFinite(n)||n<0))throw Error('Referência de PR inválida.');
    r.adjustments=r.adjustments==null?[]:r.adjustments;if(!Array.isArray(r.adjustments))throw Error('Replanejamentos inválidos.');r.baselinePR=r.baselinePR||{};
    if(r.endDate!==r.schedule.map(d=>d.date).sort().at(-1))throw Error('Término incompatível com o calendário.');
    const dates=new Set(),planIds=new Set();
    for(const [index,day] of r.schedule.entries()){if(day.index!==index||!Number.isInteger(day.sourceWeek)||day.sourceWeek<1||day.sourceWeek>r.weekCount||!Number.isInteger(day.sourceWeekday)||day.sourceWeekday<0||day.sourceWeekday>6)throw Error('Ordem de planejamento inválida.');if(!validISODate(day.date)||dates.has(day.date)||!day.plan||typeof day.plan.tipo!=='string'||!day.plan.tipo.startsWith('CYCLE_'+r.id+'_')||planIds.has(day.plan.tipo)||!Array.isArray(day.plan.ex)||day.plan.runId!==r.id)throw Error('Planejamento de execução inválido.');if(!day.plan.ex.length||day.plan.ex.some(e=>!e||typeof e.nome!=='string'||typeof e.grupo!=='string'||!day.plan.rest&&(!(parseInt(e.series)>0)||parseInt(e.series)>30)||e.restSeconds!=null&&(typeof e.restSeconds!=='number'||!Number.isFinite(e.restSeconds)||e.restSeconds<0)))throw Error('Prescrição inválida no planejamento.');dates.add(day.date);planIds.add(day.plan.tipo);}
  }
  if(raw.schemaVersion!==2){s.activeRunId=null;s.runs=[];}else if(s.activeRunId!=null&&!ids.has(s.activeRunId))throw Error('Execução ativa não encontrada.');
  if(s.activeRunId)s.programId=s.runs.find(r=>r.id===s.activeRunId).programId;
  s.schemaVersion=2;s.activeRunId=s.activeRunId||null;
  return seedInitialPrograms(s);
}
function activeRun(){return (state.runs||[]).find(r=>r.id===state.activeRunId&&r.programId===state.programId)||null;}
function runDay(run,date){return run&&run.schedule.find(d=>d.date===date);}
function runForTipo(tipo){for(const r of state.runs||[])if(r.schedule.some(d=>d.plan.tipo===tipo))return r;return null;}
function readDayLog(k,tipo){
  const r=tipo?runForTipo(tipo):activeRun();const root=state.log[k];
  return r?(root&&root.runLogs&&root.runLogs[r.id]||null):root||null;
}
function allDateLogs(k){const root=state.log[k];return root?[...(root.snapshot||root.done?[root]:[]),...Object.values(root.runLogs||{})]:[];}
function archivedProgram(id){
  const r=(state.runs||[]).filter(r=>r.programId===id).at(-1);if(!r)return null;const plans={},weekPlans={};
  for(const d of r.schedule){plans[d.plan.tipo]=d.plan;weekPlans[d.sourceWeek]=weekPlans[d.sourceWeek]||{};weekPlans[d.sourceWeek][d.sourceWeekday]=d.plan;}
  return {id,nome:r.programName,notes:r.programNotes||'',autor:'Programa arquivado',emoji:'📅',desc:'Execução preservada após exclusão do modelo.',periodized:true,durationWeeks:r.weekCount,plans,weekPlans,cycle:false,keyForDate:d=>weekPlans[1][d.getDay()].tipo};
}
function programById(id){return customCatalog()[id]||PROGRAMS[id]||archivedProgram(id);}
function baselineRecords(startDate){const out={};for(const [date,sessions] of Object.entries(state.sessions)){if(date>ymd(today()))continue;for(const [sid,s] of Object.entries(sessions)){const name=exerciseSessionName(sid,s);out[name]=Math.max(out[name]||0,best1RM(s.runId?(s.sets||[]).filter(x=>x.done):s.sets));}}return out;}
function startProgramRun(id,startDate,count){
  if(window.appDataLoadError)throw Error('Importe um backup válido antes de iniciar um programa.');
  const p=programById(id),n=Number(count);
  if(!p)throw Error('Programa não encontrado.');if(!validISODate(startDate)||parseYmd(startDate).getDay()!==1)throw Error('Escolha uma segunda-feira válida para o início.');
  if(!validWeekCount(n)||p.periodized&&n!==p.durationWeeks)throw Error('Informe uma duração válida entre 1 e 12 semanas.');
  preserveHistory();
  const run={id:uid(),programId:id,programName:p.nome,programNotes:p.notes||'',startDate,weekCount:n,status:'active',createdAt:Date.now(),schedule:[],adjustments:[],baselinePR:baselineRecords(startDate)};
  for(let i=0;i<n*7;i++){
    const date=ymd(addDays(parseYmd(startDate),i)),wd=parseYmd(date).getDay(),week=Math.floor(i/7)+1;
    let source;
    if(p.periodized)source=p.weekPlans[week][wd];
    else if(id==='refundini'){const key=wd===1?'A':wd===2?'B':wd===3?(week%2?'C1':'C2'):wd===4?'REC':wd===5?(week%2?'D1':'D2'):wd===6?'E':'OFF';source=p.plans[key];}
    else source=p.plans[p.keyForDate(parseYmd(date))];
    if(!source)throw Error('Sessão ausente na semana '+week);
    const plan=clone(source),sourceTipo=plan.tipo;plan.tipo='CYCLE_'+run.id+'_'+i;plan.t=plan.tipo;plan.runId=run.id;plan.weekNumber=week;plan.sourceTipo=sourceTipo;
    plan.ex=plan.ex.map((e,j)=>{const ex={...e,...((state.overrides[sourceTipo]||{})[e.id||j]||{})};delete ex.sid;delete ex.baseSid;delete ex.planned;return ex;});
    run.schedule.push({index:i,sourceWeek:week,sourceWeekday:wd,originalDate:date,date,plan});
  }
  run.nominalEnd=run.schedule.at(-1).date;run.endDate=run.nominalEnd;
  const old=activeRun();if(old&&old.status==='active')old.status='paused';
  state.runs=state.runs||[];state.runs.push(run);state.activeRunId=run.id;state.programId=id;state.schemaVersion=2;
  const custom=(state.customPrograms||[]).find(x=>x.id===id);if(custom)custom.durationWeeks=n;
  save();return run;
}
function runCompletion(run,day){
  const l=readDayLog(day.date,day.plan.tipo);const ex=day.plan.ex||[];
  if(day.plan.rest)return {complete:false,partial:false,done:0,total:0};
  let done=0,total=0,hasWork=false;
  ex.forEach((e,i)=>{const sid=daySlotId(day.date,day.plan.tipo,i),s=(state.sessions[day.date]||{})[sid];const count=seriesCount(day.plan.tipo,i,day.date)||3;total+=count;done+=(s&&s.sets||[]).slice(0,count).filter(x=>x.done).length;if(l&&l.done&&l.done[sid]||s&&(s.sets||[]).some(x=>x.done||x.kg||x.reps))hasWork=true;});
  return {complete:total>0&&done>=total,partial:hasWork&&done<total,done,total,hasWork};
}
function replanProposal(run,date=ymd(today())){
  if(!run||run.status==='completed')return null;
  const missed=run.schedule.filter(d=>!d.plan.rest&&d.date<date&&!runCompletion(run,d).hasWork).sort((a,b)=>b.date.localeCompare(a.date));
  if(!missed.length)return null;
  const chosen=missed[0],delta=Math.round((parseYmd(date)-parseYmd(chosen.date))/86400000),changes=[];
  for(const day of run.schedule){if(day.index<chosen.index||!day.plan.rest&&runCompletion(run,day).hasWork)continue;changes.push({index:day.index,oldDate:day.date,date:ymd(addDays(parseYmd(day.date),delta))});}
  const mapped=run.schedule.map(d=>changes.find(c=>c.index===d.index)?.date||d.date);
  if(new Set(mapped).size!==mapped.length)throw Error('O replanejamento conflita com uma sessão já registrada.');
  return {from:chosen.index,missedDate:chosen.date,targetDate:date,delta,changes,newEnd:mapped.slice().sort().at(-1)};
}
function applyReplan(id,expected,date=ymd(today())){
  const run=(state.runs||[]).find(r=>r.id===id),proposal=replanProposal(run,date);
  if(!proposal||JSON.stringify(proposal)!==JSON.stringify(expected))throw Error('O planejamento mudou. Abra a prévia novamente.');
  for(const c of proposal.changes)run.schedule[c.index].date=c.date;
  run.endDate=proposal.newEnd;run.status='active';run.adjustments.push({...proposal,appliedAt:Date.now()});save();return run;
}
function previewReplan(){
  const run=activeRun();let proposal;try{proposal=replanProposal(run);}catch(e){alert(e.message);return;}
  if(!proposal){alert('Nenhuma sessão perdida sem registros está disponível para retomar. Sessões parciais não são deslocadas.');return;}
  openSheet(`<h3>Retomar a última sessão perdida</h3><p>A sessão de <b>${esc(proposal.missedDate)}</b> passa para <b>${esc(proposal.targetDate)}</b>.</p><p>O restante não realizado será deslocado em ${proposal.delta} dia(s), incluindo os descansos. Datas já realizadas permanecem iguais.</p><p>Novo término: <b>${esc(proposal.newEnd)}</b>.</p><details><summary>Conferir as ${proposal.changes.length} datas alteradas</summary><table class="cycle-table"><thead><tr><th>Sessão</th><th>Antes</th><th>Depois</th></tr></thead><tbody>${proposal.changes.map(c=>`<tr><td>${esc(run.schedule[c.index].plan.titulo)}</td><td>${esc(c.oldDate)}</td><td>${esc(c.date)}</td></tr>`).join('')}</tbody></table></details><button class="btn primary block" id="applyReplan">Confirmar replanejamento</button><button class="btn ghost block" onclick="closeSheet()">Cancelar</button>`);
  document.getElementById('applyReplan').onclick=()=>{try{applyReplan(run.id,proposal);closeSheet();selectedDate=null;setTab('hoje');}catch(e){alert(e.message);}};
}
function openStartProgram(id,forceNew=false){
  const p=programById(id);if(!p)return;const previous=(state.runs||[]).filter(r=>r.programId===id&&r.status!=='completed').at(-1);
  openSheet(`<h3>${forceNew?'Reiniciar':'Iniciar'} programa</h3><p>${esc(p.nome)}</p><label class="fld"><span>Data de início (segunda-feira)</span><input id="runStart" type="date" value="${ymd(mondayOf(today()))}"></label><label class="fld"><span>Quantidade de semanas (1 a 12)</span><input id="runWeeks" type="number" min="1" max="12" step="1" value="${p.durationWeeks||''}" ${p.periodized?'readonly':''} required></label>${p.periodized?'<p class="hint">Duração definida pelas semanas deste programa padrão.</p>':''}<p class="hint">Uma nova execução mantém os históricos anteriores. A programação avança pelo calendário.</p><button class="btn primary block" id="startRun">Confirmar início</button>${previous&&!forceNew?`<button class="btn ghost block" id="resumeRun">Continuar execução de ${esc(previous.startDate)}</button>`:''}<button class="btn ghost block" onclick="closeSheet()">Cancelar</button>`);
  document.getElementById('startRun').onclick=()=>{try{startProgramRun(id,document.getElementById('runStart').value,Number(document.getElementById('runWeeks').value));closeSheet();selectedDate=null;setTab('hoje');}catch(e){alert(e.message);}};
  const resume=document.getElementById('resumeRun');if(resume)resume.onclick=()=>{const old=activeRun();if(old&&old.id!==previous.id&&old.status==='active')old.status='paused';state.activeRunId=previous.id;state.programId=id;previous.status='active';save();closeSheet();selectedDate=null;setTab('hoje');};
}
function pendingProgramView(){
  if(window.appDataLoadError)return `<div class="card"><h3>Não foi possível carregar os dados</h3><p>${esc(window.appDataLoadError)}</p><p>Os dados originais permanecem no navegador. Exporte uma cópia para recuperação ou importe um backup válido em Ajustes.</p><button class="btn primary" id="recoverOriginal">Salvar dados originais</button></div>`;
  return `<div class="card"><h3>Configuração pendente</h3><p>Defina a data de início e a quantidade de semanas para iniciar ou continuar este programa. Os registros anteriores permanecem como histórico legado.</p><button class="btn primary" data-configure="${esc(state.programId)}">Configurar programa</button><button class="btn ghost" data-go="programas">Selecionar outro</button></div>`;
}
function cycleBanner(){
  const r=activeRun();if(!r)return '';
  const d=runDay(r,ymd(curDate())),week=d?d.sourceWeek:null;
  return `<div class="card"><b>${esc(r.programName)}</b><div class="hint">${week?'Semana '+week+' de '+r.weekCount+' · ':''}${esc(r.startDate)} a ${esc(r.endDate)}</div><div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px"><button class="btn ghost" id="replanRun">Retomar a última sessão perdida</button><button class="btn ghost" data-run-results="${r.id}">Estatísticas do programa</button></div></div>`;
}
function groupHeading(plan,i){const e=plan.ex[i];if(!e.groupId)return '';const members=plan.ex.map((x,j)=>({x,j})).filter(o=>o.x.groupId===e.groupId);if(members[0].j!==i)return '';return `<div class="technique-group"><b>${esc(e.groupType||'Grupo combinado')} · exercícios ${members.map(o=>o.j+1).join(' + ')}</b><div>${members.map(o=>esc(o.x.nome)).join(' → ')}</div><div class="hint">Execute os exercícios deste grupo em sequência, respeitando o descanso de cada prescrição.</div></div>`;}
function isTimedExercise(ex){return /isometria/i.test(ex.technique||'')||/^\s*\d+(?:[–-]\d+)?\s*s\s*$/i.test(ex.reps||'');}
function persistDayChoice(k,tipo,i,choice){
  const planned=exAt(tipo,i);snapshotDay(k,tipo);const l=dayLog(k,tipo),base=slotId(tipo,i);l.exerciseChoices=l.exerciseChoices||{};
  if(choice)l.exerciseChoices[base]=clone(choice);else delete l.exerciseChoices[base];
  const snap=l.snapshot.ex.find(e=>(e.baseSid||e.sid)===base);if(snap)Object.assign(snap,dayExercise(k,tipo,i),{planned:clone(planned),baseSid:base,sid:daySlotId(k,tipo,i)});
  if(countDone(k,tipo)!==dayTotal(tipo))delete l.end;save();render();
}
function markExerciseSets(k,tipo,i,done){
  snapshotDay(k,tipo);const sid=daySlotId(k,tipo,i);state.sessions[k]=state.sessions[k]||{};const old=state.sessions[k][sid]||{sets:[]};const count=seriesCount(tipo,i,k)||3;
  while(old.sets.length<count)old.sets.push({kg:'',reps:''});old.sets.slice(0,count).forEach(s=>s.done=done);const ex=dayExercise(k,tipo,i);old.sets.forEach(set=>set.repsUnit=isTimedExercise(ex)?'seconds':'reps');old.nm=ex.nome;old.gp=ex.grupo;old.runId=runForTipo(tipo)?.id||null;state.sessions[k][sid]=old;dayLog(k,tipo).done[sid]=done;
}
function updateSessionCompletion(k,tipo){
  const l=dayLog(k,tipo),dn=countDone(k,tipo),tot=dayTotal(tipo);
  const owner=runForTipo(tipo);const hasDone=Object.values(state.sessions[k]||{}).some(s=>(!owner||s.runId===owner.id)&&(s.sets||[]).some(x=>x.done));
  if(hasDone&&!l.start)l.start=Date.now();if(!hasDone){delete l.start;delete l.end;}
  if(dn===tot&&tot>0){if(!l.end)l.end=Date.now();}else delete l.end;
  const run=runForTipo(tipo);if(!run)return false;if(run.status==='completed'&&dn<tot){run.status='active';delete run.finishedAt;delete run.finishedOn;}
  const last=run.schedule.filter(d=>!d.plan.rest).sort((a,b)=>b.date.localeCompare(a.date))[0];
  if(last&&last.date===k&&runCompletion(run,last).complete){run.status='completed';run.finishedAt=Date.now();run.finishedOn=k;selectedRunResultId=run.id;return true;}return false;
}
function toggleSetCompletion(k,tipo,i,j,done){
  snapshotDay(k,tipo);const sid=daySlotId(k,tipo,i);state.sessions[k]=state.sessions[k]||{};const r=state.sessions[k][sid]||{sets:[]};while(r.sets.length<=(j))r.sets.push({kg:'',reps:''});r.sets[j].done=done;
  const ex=dayExercise(k,tipo,i);r.sets.forEach(set=>set.repsUnit=isTimedExercise(ex)?'seconds':'reps');r.nm=ex.nome;r.gp=ex.grupo;r.runId=runForTipo(tipo)?.id||null;state.sessions[k][sid]=r;
  const n=seriesCount(tipo,i,k)||3;dayLog(k,tipo).done[sid]=r.sets.slice(0,n).filter(x=>x.done).length===n;
  const completed=updateSessionCompletion(k,tipo);save();if(completed){closeSheet();setTab('run-results');}else{render();if(done&&state.settings.autoRest)openTimer(ex.restSeconds);}
}
function runStatistics(run){
  const sessions=run.schedule.filter(d=>!d.plan.rest),groups={},prs={},actualByName={};let complete=0,partial=0,trained=0,missed=0;
  for(const day of sessions){const c=runCompletion(run,day);if(c.complete)complete++;if(c.partial)partial++;if(c.done>0)trained++;if(day.date<ymd(today())&&!c.hasWork)missed++;
    for(const e of day.plan.ex){const g=groups[e.grupo]||(groups[e.grupo]={planned:0,actual:0});g.planned+=parseInt(e.series)||0;}}
  for(const day of Object.values(state.sessions))for(const s of Object.values(day)){if(s.runId!==run.id)continue;const done=(s.sets||[]).filter(x=>x.done);const g=groups[s.gp]||(groups[s.gp]={planned:0,actual:0});g.actual+=done.length;if(done.length){actualByName[s.nm]=Math.max(actualByName[s.nm]||0,best1RM(done));}}
  for(const [name,value] of Object.entries(actualByName))if(value>(run.baselinePR&&run.baselinePR[name]||0))prs[name]={before:run.baselinePR&&run.baselinePR[name]||0,after:value};
  return {planned:sessions.length,trained,complete,partial,missed,groups,prs};
}
function viewRunResults(id){
  const r=(state.runs||[]).find(x=>x.id===(id||selectedRunResultId))||activeRun();if(!r)return pendingProgramView();const s=runStatistics(r);const duration=Math.round((parseYmd(r.endDate)-parseYmd(r.startDate))/86400000)+1;
  return `<div class="hero"><h1>${r.status==='completed'?'Programa concluído':r.status==='elapsed'?'Prazo do programa encerrado':'Estatísticas do programa'}</h1><p>${esc(r.programName)}</p><p>Calendário: ${esc(r.startDate)} a ${esc(r.endDate)}</p>${r.finishedOn?`<p>Última sessão concluída em ${esc(r.finishedOn)}</p>`:''}</div><div class="stats"><div class="stat"><div class="v">${s.trained}/${s.planned}</div><div class="k">Dias treinados / planejados</div></div><div class="stat"><div class="v">${s.complete}</div><div class="k">Sessões completas</div></div><div class="stat"><div class="v">${s.partial}</div><div class="k">Sessões parciais / com registros</div></div><div class="stat"><div class="v">${Math.round(s.trained/s.planned*100)||0}%</div><div class="k">Adesão</div></div></div><div class="card"><p>${s.missed} sessões passadas sem realização. ${s.planned-s.trained} sessões sem séries concluídas no total.</p><p>Duração original: ${r.weekCount} semanas (${r.weekCount*7} dias). Calendário atual: ${duration} dias. Prolongamento: ${duration-r.weekCount*7} dias.</p><h3>Séries por grupo muscular</h3><table class="cycle-table"><thead><tr><th>Grupo principal</th><th>Planejadas</th><th>Realizadas</th></tr></thead><tbody>${Object.entries(s.groups).map(([name,g])=>`<tr><td>${esc(name)}</td><td>${g.planned}</td><td>${g.actual}</td></tr>`).join('')}</tbody></table><p class="hint">Um dia treinado exige ao menos uma série marcada como concluída. Uma série conta apenas quando marcada como concluída. O volume usa o grupo principal do exercício, sem duplicar músculos auxiliares.</p><h3>Exercícios com novo PR: ${Object.keys(s.prs).length}</h3>${Object.entries(s.prs).map(([name,p])=>`<p><b>${esc(name)}</b>: 1RM estimado ${p.before.toFixed(1)} → ${p.after.toFixed(1)} kg${p.before===0?' (primeira referência)':''}</p>`).join('')||'<p>Nenhum novo PR com séries concluídas e carga/repetições numéricas.</p>'}<p class="hint">PR de 1RM estimado pela fórmula de Epley, comparado ao histórico disponível no início desta execução. Dados legados não são atribuídos automaticamente a um ciclo.</p></div><div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn primary" data-restart="${esc(r.programId)}">Reiniciar programa</button><button class="btn ghost" data-go="programas">Selecionar outro programa</button>${r.status!=='completed'&&r.id===state.activeRunId?'<button class="btn ghost" id="replanRun">Retomar a última sessão perdida</button>':''}</div>`;
}
let selectedRunResultId=null;
function legacyDates(){const known=new Set((state.runs||[]).map(r=>r.id));return [...new Set([...Object.keys(state.log),...Object.keys(state.sessions)])].filter(k=>{const root=state.log[k];return !!(root&&(root.snapshot||Object.keys(root.done||{}).length))||Object.values(state.sessions[k]||{}).some(s=>!s.runId||!known.has(s.runId));}).sort().reverse();}
function legacyHistorySummary(){const dates=legacyDates();return dates.length?`<div class="card"><h3>Histórico legado</h3><p>${dates.length} dia(s) de registros anteriores sem vínculo confirmado com uma execução. Esses dados permanecem preservados, sem atribuir datas ou duração a um ciclo.</p><button class="btn ghost" data-go="legacy-history">Consultar registros legados</button></div>`:'';}
function viewLegacyHistory(){
 const known=new Set((state.runs||[]).map(r=>r.id));
 return `<div class="hero"><h1>Histórico legado</h1><p>Consulta dos dados originais. Séries antigas sem confirmação individual não são atribuídas às novas execuções.</p></div>`+legacyDates().map(k=>{
  const root=state.log[k],records=Object.entries(state.sessions[k]||{}).filter(([sid,s])=>!s.runId||!known.has(s.runId));
  return `<details class="card"><summary>${esc(k)} · ${records.length} exercício(s) com séries registradas</summary>${root&&root.done?`<p>Marcações antigas de exercício concluído: ${Object.values(root.done).filter(Boolean).length}.</p>`:''}${records.map(([sid,s])=>`<h3>${esc(s.nm||'Exercício '+sid)}</h3><table class="cycle-table"><thead><tr><th>Série</th><th>kg</th><th>Reps / segundos</th><th>Conclusão</th></tr></thead><tbody>${s.sets.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.kg||'—')}</td><td>${esc(x.reps||'—')}${x.repsUnit==='seconds'?' s':''}</td><td>${x.done===true?'Concluída':x.done===false?'Não marcada':'Não informada'}</td></tr>`).join('')}</tbody></table>`).join('')}</details>`;
 }).join('')+`<button class="btn ghost" data-go="progresso">Voltar ao progresso</button>`;
}
function executionHistoryView(){return (state.runs||[]).length?`<div class="section-title">Execuções e resultados</div>`+state.runs.slice().reverse().map(r=>`<div class="card"><b>${esc(r.programName)}</b><p>${esc(r.startDate)} · ${r.weekCount} semanas · ${esc(({active:'Em andamento',paused:'Pausado',elapsed:'Prazo encerrado',completed:'Concluído'})[r.status])}</p><button class="btn ghost" data-run-results="${r.id}">Ver estatísticas</button></div>`).join(''):'';}
function previewVariationFlip(){
  const r=activeRun();if(!r||r.programId!=='refundini')return;
  const choices={C1:'C2',C2:'C1',D1:'D2',D2:'D1'};
  const eligible=()=>r.schedule.filter(d=>d.date>=ymd(today())&&choices[d.plan.sourceTipo]&&!runCompletion(r,d).hasWork);
  openSheet(`<h3>Inverter variações C/D</h3><p>C1/C2 e D1/D2 serão invertidos em ${eligible().length} sessões de hoje em diante, sem registros. Datas e sessões já realizadas não mudam. Ajustes não executados dessas sessões serão redefinidos.</p><button class="btn primary block" id="confirmFlip">Confirmar inversão</button><button class="btn ghost block" onclick="closeSheet()">Cancelar</button>`);
  document.getElementById('confirmFlip').onclick=()=>{
    if(activeRun()?.id!==r.id)return;
    const changed=eligible();for(const d of changed){const key=choices[d.plan.sourceTipo],old=d.plan;d.plan={...clone(PLANS[key]),tipo:old.tipo,t:old.tipo,runId:r.id,weekNumber:old.weekNumber,sourceTipo:key};delete state.overrides[old.tipo];const root=state.log[d.date];if(root&&root.runLogs)delete root.runLogs[r.id];}
    r.adjustments.push({kind:'variation-flip',at:Date.now(),dates:changed.map(d=>d.date)});save();closeSheet();render();
  };
}
function bindCycles(){
  const cycleButton=document.getElementById('cycleBtn'),r=activeRun();if(cycleButton){cycleButton.style.display=r&&r.programId==='refundini'&&r.status==='active'?'':'none';cycleButton.onclick=previewVariationFlip;}
  document.querySelectorAll('[data-configure]').forEach(b=>b.onclick=()=>openStartProgram(b.dataset.configure));
  document.querySelectorAll('[data-restart]').forEach(b=>b.onclick=()=>openStartProgram(b.dataset.restart,true));
  document.querySelectorAll('[data-run-results]').forEach(b=>b.onclick=()=>{selectedRunResultId=b.dataset.runResults;setTab('run-results');});
  const replan=document.getElementById('replanRun');if(replan)replan.onclick=previewReplan;
  const recover=document.getElementById('recoverOriginal');if(recover)recover.onclick=()=>{const text=localStorage.getItem(LS_KEY)||'{}',a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download='appfit-dados-originais.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);};
  document.querySelectorAll('[data-set-done]').forEach(c=>c.onchange=()=>{const k=ymd(curDate());toggleSetCompletion(k,planKeyForDate(curDate()),+c.dataset.i,+c.dataset.s,c.checked);});
}
