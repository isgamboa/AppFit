#!/usr/bin/env python3
"""Check embedded standard-program data and update embedded cycle engine source."""
import argparse,csv,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--check',action='store_true');args=p.parse_args()
html_path=ROOT/'index.html';html=html_path.read_text();source=(ROOT/'src/cycles.js').read_text()
a=html.index('const STANDARD_PROGRAM_DATA=')+len('const STANDARD_PROGRAM_DATA=');b=html.index(';\n/* Programs and dated executions.',a)
data=[json.loads(p.read_text()) for p in sorted((ROOT/'data/standard-programs').glob('*.json'))]
catalog={r['exercicio'] for r in csv.DictReader((ROOT/'exports/banco-exercicios-appfit.csv').open(encoding='utf-8-sig',newline=''))}
program_names=set()
for program in data:
 assert program['id'] not in program_names and program['id'] not in {'refundini','saitama','ramondino','arnold','cbum'}
 program_names.add(program['id'])
 assert [w['number'] for w in program['weeks']]==list(range(1,program['durationWeeks']+1))
 program_ids=set()
 assert 1<=program['durationWeeks']<=12 and len(program['weeks'])==program['durationWeeks']
 for week in program['weeks']:
  assert len({d['weekday'] for d in week['days']})==len(week['days']) and all(0<=d['weekday']<=6 for d in week['days'])
  for day in week['days']:
   groups={}
   for i,ex in enumerate(day['exercises']):
    if ex.get('groupId'):groups.setdefault(ex['groupId'],[]).append((i,ex.get('groupType')))
   for members in groups.values():
    expected={'Bi-set':2,'Tri-set':3}.get(members[0][1])
    assert expected and len(members)==expected and all(t==members[0][1] for i,t in members) and [i for i,t in members]==list(range(members[0][0],members[0][0]+expected))
   ids=set()
   for ex in day['exercises']:
    assert ex['id'] not in ids and ex['id'] not in program_ids and ex['nome'] in catalog and ex['grupo'] and ex['series']>0 and ex['restSeconds']>=0;ids.add(ex['id']);program_ids.add(ex['id'])
if args.check:
 assert json.loads(html[a:b])==data,'Program source differs from HTML'
 assert source in html,'Cycle engine source differs from HTML'
 print('OK: cycle engine and standard-program data match sources')
else:
 old_start=html.index('/* Programs and dated executions.');old_end=html.index('\nfor(const data of STANDARD_PROGRAM_DATA)',old_start)
 html=html[:old_start]+source+html[old_end:]
 a=html.index('const STANDARD_PROGRAM_DATA=')+len('const STANDARD_PROGRAM_DATA=');b=html.index(';\n/* Programs and dated executions.',a)
 html=html[:a]+json.dumps(data,ensure_ascii=False,indent=2).replace('<','\\u003c')+html[b:]
 html_path.write_text(html);print('Updated embedded engine and program data')
