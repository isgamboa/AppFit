#!/usr/bin/env python3
"""Import the reviewed Protocol Black tables by PDF text coordinates, ignoring links.
Requires PyMuPDF; the missing source series count requires an explicit user value.
"""
import argparse,csv,hashlib,json,re,unicodedata
from pathlib import Path
from urllib.parse import quote_plus
import fitz
ROOT=Path(__file__).resolve().parents[1]
DAYS=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']
EXPECTED=[[9,9,9,9,9,9],[9,9,9,9,9,10],[11,11,13,12,13,13],[13,13,14,12,13,13],[9,10,10,8,10,11],[8,9,9,8,8,9],[8,9,9,8,8,9],[11,11,12,11,11,11],[11,12,13,10,10,11],[10,12,12,11,12,11],[11,12,12,10,11,13],[11,13,11,13,13,14]]
ALIASES={
 'Abs Máquina':'Abdominal máquina','Abs infra':'Abdominal infra','Agachamento Livre':'Agachamento livre',
 'Agachamento Hack':'Agachamento hack','Agachamento Búlgaro':'Agachamento búlgaro',
 'Desenvolvimento com Dumbells':'Desenvolvimento halteres','Dumbell Press Inclinado (30°)':'Supino inclinado halteres 30º',
 'Duplo Bíceps na Polia Alta':'Duplo Bíceps na Polia','Elevação Frontal (com Halteres)':'Elevação frontal halteres',
 'Elevação Frontal (com Anilha)':'Elevação frontal anilha','Elevação Frontal (com Corda)':'Elevação Frontal com Corda',
 'Elevação Lateral Unilateral no Cabo':'Elevação Lateral no Cabo Unilateral',
 'Flexora Unilateral em Pé':'Flexora em pé unilateral','Flexão de Braços':'Flexão de braço',
 'Mesa Flexora':'Mesa flexora (deitado)','Prancha Ventral':'Prancha',
 'Pulldown (com Corda)':'Pulldown com corda','Pulley Frente':'Puxada frente (pulldown)',
 'Pulley Frente Supinado':'Puxada supinada','Pulley Frente com Triângulo':'Pulley Frente Triângulo',
 'Remada Máquina (Fechada)':'Remada Máquina Fechada','Rosca 45°':'Rosca inclinada 45º',
 'Rosca Concentrada na Perna':'Rosca concentrada','Crossover':'Crossover na polia',
 'Tríceps Banco':'Tríceps mergulho no banco','Tríceps Coice':'Tríceps coice (kickback)',
 'Tríceps Pulley com Corda':'Tríceps pulley corda',
}
NEW_GROUPS={
 'Abs Ajoelhado':'Abdômen','Abs Infra na Prancha':'Abdômen','Afundo':'Quadríceps',
 'Agachamento sem Peso':'Quadríceps','Avanço (Passada)':'Quadríceps',
 'Deltoide Posterior Máquina':'Posterior de Ombro','Deltoide Posterior Unilateral na Polia':'Posterior de Ombro',
 'Dumbell Press':'Peito','Elevação Frontal (Alternado)':'Anterior de Ombro',
 'Flexão de Braços Fechada':'Tríceps','Flexão de Braços Fechada (mãos no banco)':'Tríceps',
 'Leg press Unilateral':'Quadríceps','Panturrilha Em Pé (Sem Peso)':'Panturrilha',
 'Panturrilha Em Pé Unilateral':'Panturrilha','Pulldown (com Barra Reta)':'Costas',
 'Remada Baixa com Triângulo':'Costas','Remada Máquina (Aberta/Pronada)':'Costas',
 'Remada Pronada com Halteres':'Costas','Remada Fechada com Halteres':'Costas','Remada Suspensa no Smith':'Costas',
 'Rosca Concentrada no Banco Inclinado':'Bíceps','Rosca Direta na Polia':'Bíceps','Rosca Simultânea':'Bíceps',
 'Rosca Unilateral de Costas Para a Polia':'Bíceps','Stiff na Polia Baixa':'Posterior de Coxa',
 'Tríceps Supinado':'Tríceps','Tríceps Francês com Corda':'Tríceps',
 'Tríceps Pulley com Corda c/ Mãos Juntas':'Tríceps','Tríceps Testa Unilateral':'Tríceps',
 'Tríceps Testa Unilateral na Polia Alta':'Tríceps',
}

def parse_pdf(pdf,week):
 days=[]
 for page in fitz.open(pdf):
  lines=[dict(text=''.join(s['text'] for s in l['spans']).strip(),box=l['bbox']) for b in page.get_text('dict')['blocks'] for l in b.get('lines',[])]
  headers=sorted([l for l in lines if l['text'] in DAYS],key=lambda l:l['box'][1])
  for hi,header in enumerate(headers):
   y0=header['box'][1];y1=headers[hi+1]['box'][1] if hi+1<len(headers) else page.rect.height-30
   chunk=[l for l in lines if y0<l['box'][1]<y1]
   fields={l['text']:l for l in chunk if l['text'] in ['Exercícios','Séries','Repetições','Descanso','Técnica','Técnica 2']}
   assert all(f in fields for f in ['Exercícios','Séries','Repetições','Descanso'])
   left=fields['Exercícios']['box'][0]; seriescenter=sum(fields['Séries']['box'][::2])/2;repsleft=fields['Repetições']['box'][0]
   names=sorted([l for l in chunk if abs(l['box'][0]-left)<1 and l['box'][1]>fields['Exercícios']['box'][3]-1 and l['text']!='Exercícios'],key=lambda l:l['box'][1])
   reps=[l['text'] for l in chunk if l['text']=='NO REPS'];rests=[l['text'] for l in chunk if re.fullmatch(r'60 a 90"',l['text'])]
   assert len(reps)==len(rests)==1,(week,header,reps,rests)
   rows=[]
   for name in names:
    peers=[l for l in chunk if abs(l['box'][1]-name['box'][1])<1]
    sets=[l['text'] for l in peers if l['text'].isdigit() and left+5<l['box'][0]<repsleft]
    assert len(sets)<=1
    techniques=['','']
    for l in peers:
     if l['box'][0]<=fields['Descanso']['box'][2] or l['text'] in ['NO REPS','60 a 90"'] or not l['text']:continue
     if 'Técnica' not in fields:continue
     centers=[sum(fields[f]['box'][::2])/2 for f in ['Técnica','Técnica 2'] if f in fields]
     center=sum(l['box'][::2])/2;index=min(range(len(centers)),key=lambda i:abs(centers[i]-center));assert not techniques[index],(week,name,l)
     techniques[index]=l['text']
    rows.append(dict(sourceName=name['text'],series=int(sets[0]) if sets else None,reps='NO REPS',restSeconds=90,restRangeSeconds=[60,90],technique=techniques[0],technique2=techniques[1]))
   groups=[]
   for l in chunk:
    if l['text'] not in ['Bi-Set','Tri-Set']:continue
    cy=(l['box'][1]+l['box'][3])/2
    centers=[(n['box'][1]+n['box'][3])/2 for n in names]
    indices=sorted(sorted(range(len(names)),key=lambda i:abs(centers[i]-cy))[:2]);assert indices[1]==indices[0]+1
    assert abs((centers[indices[0]]+centers[indices[1]])/2-cy)<1,(week,header,l,indices)
    groups.append(indices)
   days.append(dict(weekday=DAYS.index(header['text']),rows=rows,groups=groups))

 assert [d['weekday'] for d in days]==list(range(1,7))
 assert [len(d['rows']) for d in days]==EXPECTED[week-1], (week,[len(d['rows']) for d in days])
 return days

def normalize(s):return unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().casefold().strip()

def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('pdf_directory',type=Path)
 parser.add_argument('--week12-abductor-sets',type=int,required=True,help='User-confirmed series count absent from week 12 Tuesday')
 args=parser.parse_args()
 if not 1<=args.week12_abductor_sets<=30:parser.error('Series must be between 1 and 30')
 files={}
 for pdf in args.pdf_directory.rglob('Planilha_Protocol_Black_Smartphone_Semana*.pdf'):
  week=int(re.search(r'Semana(\d+)',pdf.name)[1]);assert week not in files;files[week]=pdf
 assert sorted(files)==list(range(1,13)), 'Exactly twelve source PDFs are required'
 csv_path=ROOT/'exports/banco-exercicios-appfit.csv'
 catalog=list(csv.DictReader(csv_path.open(encoding='utf-8-sig',newline='')))
 known={normalize(e['exercicio']):e for e in catalog}
 program=dict(id='protocol_black',nome='Protocol Black',autor='Laércio Refundini',durationWeeks=12,level='Avançado',description='Programa avançado de musculação com variações semanais, técnicas combinadas e seis sessões por semana.',weeks=[],sources=[])
 for week,pdf in sorted(files.items()):
  program['sources'].append(dict(file=pdf.name,sha256=hashlib.sha256(pdf.read_bytes()).hexdigest()))
  days=parse_pdf(pdf,week);output=[]
  for day in days:
   weekday=day['weekday'];exercises=day['rows']
   for i,ex in enumerate(exercises):
    if ex['series'] is None:
     assert (week,weekday,i,ex['sourceName'])==(12,2,9,'Cadeira Abdutora'), 'Unexpected missing source series'
     ex['series']=args.week12_abductor_sets;ex['seriesSource']='user-confirmed'
     ex['obs']='Quantidade de séries ausente na fonte; definida pelo usuário.'
    else:ex['obs']=''
    name=ALIASES.get(ex['sourceName'],ex['sourceName']);entry=known.get(normalize(name))
    if entry is None:
     assert name in NEW_GROUPS, 'Research primary group for '+name
     entry=dict(exercicio=name,grupo_muscular=NEW_GROUPS[name],primeiraSubstituicao='',segundaSubstituicao='',urlVideo='https://www.youtube.com/results?search_query='+quote_plus(name.lower()))
     catalog.append(entry);known[normalize(name)]=entry
    ex.update(id=f'black_w{week}_d{weekday}_e{i+1}',nome=entry['exercicio'],grupo=entry['grupo_muscular'])
    if ex['sourceName']=='Prancha Ventral':ex['durationUnit']='seconds'
    for gi,members in enumerate(day['groups'],1):
     if i in members:ex.update(groupId=f'black_w{week}_d{weekday}_g{gi}',groupType='Bi-set')
   output.append(dict(weekday=weekday,title=f'{DAYS[weekday]} · Semana {week}',exercises=exercises))
  program['weeks'].append(dict(number=week,days=output))
 with csv_path.open('w',encoding='utf-8-sig',newline='') as f:
  writer=csv.DictWriter(f,fieldnames=list(catalog[0]),lineterminator='\n');writer.writeheader();writer.writerows(catalog)
 (ROOT/'data/standard-programs/protocol-black.json').write_text(json.dumps(program,ensure_ascii=False,indent=2)+'\n')
 print('Loaded Protocol Black: 12 weeks, 72 sessions, 766 prescriptions, 51 bi-sets;',len(catalog),'catalog entries')

if __name__=='__main__':main()
