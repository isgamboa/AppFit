import fs from 'node:fs';
let pass=0;function ok(c,m){if(!c)throw Error(m);pass++;}
const p=JSON.parse(fs.readFileSync(new URL('../data/standard-programs/boost-pro-ombro.json',import.meta.url),'utf8'));
ok(p.durationWeeks===4&&p.weeks.length===4,'four weeks');
const days=p.weeks.flatMap(w=>w.days),ex=days.flatMap(d=>d.exercises);
ok(days.length===20,'twenty sessions');ok(ex.length===174,'174 prescriptions');ok(new Set(ex.map(e=>e.id)).size===174,'separate identity per occurrence');
for(let i=0;i<4;i++)ok(p.weeks[i].days.reduce((n,d)=>n+d.exercises.length,0)===(i<2?43:44),'week row count matches PDF');
const groups=new Set(ex.filter(e=>e.groupId).map(e=>e.groupId));ok(groups.size===13,'thirteen visually verified bi-sets');
for(const id of groups){const members=ex.filter(e=>e.groupId===id);ok(members.length===2&&members.every(e=>e.groupType==='Bi-set'),'group has exactly two members');}
const repeated=p.weeks[2].days[1].exercises.filter(e=>e.sourceName==='Elevação Lateral');ok(repeated.length===2&&repeated[0].id!==repeated[1].id&&repeated[0].technique!==repeated[1].technique,'same-name prescriptions are not collapsed');
ok(ex.some(e=>e.restSeconds===0)&&ex.some(e=>e.reps==='30s'),'zero rest and seconds preserved');
ok(ex.some(e=>e.reps==='12/8/8/6')&&ex.some(e=>e.reps==='4+8+12'),'compound repetition prescriptions preserved');
ok(!JSON.stringify(p).includes('http'),'no PDF exercise or technique links embedded');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');const a=html.indexOf('const EXDB=')+'const EXDB='.length,b=html.indexOf(';\nconst DB_GROUPS=',a);const catalog=JSON.parse(html.slice(a,b));
ok(catalog.length===153,'catalog size after canonical matching');
for(const e of catalog.slice(94)){ok(Boolean(e.grupo),'new exercise has primary group');const u=new URL(e.urlVideo);ok(u.origin==='https://www.youtube.com'&&u.pathname==='/results'&&u.searchParams.get('search_query')===e.nome.toLowerCase(),'new exercise uses search by its own name');}
for(const e of ex)ok(catalog.some(c=>c.nome===e.nome&&c.grupo===e.grupo),'prescription matches catalog');
console.log(`RESULT: ${pass} passed, 0 failed`);
