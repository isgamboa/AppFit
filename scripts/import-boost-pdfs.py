#!/usr/bin/env python3
"""Convert the four Boost PRO tables, never extracting or following PDF hyperlinks."""
import argparse,csv,hashlib,json,re,subprocess,unicodedata
from pathlib import Path
from urllib.parse import quote_plus
ROOT=Path(__file__).resolve().parents[1]
normalize=lambda s:unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().casefold().strip()
ALIASES={'Desenvolvimento com Dumbells':'Desenvolvimento halteres','Dumbell Press Reto':'Supino reto halteres','Rosca 45º':'Rosca inclinada 45º','Pulley Frente':'Puxada frente (pulldown)','Pulley Frente Supinado':'Puxada supinada','ABS Máquina':'Abdominal máquina','Crossover':'Crossover na polia','Elevação Pélvica':'Elevação pélvica (hip thrust)','Tríceps Banco':'Tríceps mergulho no banco','Tríceps Coice':'Tríceps coice (kickback)','Mesa Flexora':'Mesa flexora (deitado)','Rosca Punho':'Rosca de punho','Extensão Lombar no Banco Romano':'Banco de extensão lombar','Leg Press 45º':'Leg press 45','Rsoca Scott':'Rosca Scott'}
GROUPS={(1,1):[[2,3]],(1,2):[[1,2],[4,5]],(1,4):[[4,5]],(1,5):[[3,4]],(2,1):[[2,3]],(2,3):[[4,5]],(2,5):[[5,6]],(3,2):[[1,2],[5,6]],(4,2):[[0,1]],(4,4):[[3,4]],(4,5):[[0,1]]}
DAYS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
def muscle(name):
 n=normalize(name)
 if 'triceps' in n:return 'Tríceps'
 if 'rosca' in n or 'biceps' in n:return 'Antebraço' if 'punho' in n or 'inversa' in n else 'Bíceps'
 if 'abs ' in n or 'abdominal' in n:return 'Abdômen'
 if 'panturrilha' in n:return 'Panturrilha'
 if 'adutora' in n:return 'Adutores'
 if 'abdutora' in n or 'pelvica' in n:return 'Glúteo'
 if 'stiff' in n or 'flexora' in n:return 'Posterior de Coxa'
 if 'terra' in n:return 'Lombar'
 if 'agachamento' in n or 'leg press' in n or 'afundo' in n or 'extensora' in n:return 'Quadríceps'
 if 'inverso' in n:return 'Posterior de Ombro'
 if 'encolhimento' in n:return 'Trapézio'
 if 'lateral' in n or 'remada alta' in n:return 'Lateral de Ombro'
 if 'frontal' in n or 'desenvolvimento' in n:return 'Anterior de Ombro'
 if 'supino' in n or 'press ' in n or 'crucifixo' in n:return 'Peito'
 if 'pulley' in n or 'pulldown' in n or 'remada' in n:return 'Costas'
 raise ValueError('Unclassified exercise: '+name)
def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('pdf_directory',type=Path);args=parser.parse_args()
 path=ROOT/'exports/banco-exercicios-appfit.csv';catalog=list(csv.DictReader(path.open(encoding='utf-8-sig',newline='')));known={normalize(r['exercicio']):r for r in catalog}
 p={'id':'boost_pro_ombro','nome':'Boost PRO Ombro','autor':'Thiago Kotolak','durationWeeks':4,'level':'Intermediário / avançado','description':'Hipertrofia com ênfase em ombros, com sessões diferentes em cada semana.','weeks':[],'sources':[]}
 for week in range(1,5):
  pdf=next(args.pdf_directory.rglob(f'Planilha_Boost_PRO_Ombro_Smartphone_Semana{week}.pdf'))
  raw=subprocess.run(['pdftotext','-layout',str(pdf),'-'],capture_output=True,text=True,check=True).stdout
  p['sources'].append({'file':pdf.name,'sha256':hashlib.sha256(pdf.read_bytes()).hexdigest()})
  days={};day=None
  for line in raw.splitlines():
   match=re.search(r'(Segunda|Terça|Quarta|Quinta|Sexta)-feira',line)
   if match:day=DAYS.index(match[1]);days[day]=[];continue
   match=re.match(r'\s*(?:Bi-Set\s+)?(.+?)\s{2,}(\d+)\s+(.+?)\s+(\d+)"\s+(.+?)\s*$',line)
   if not match:continue
   original,sets,reps,rest,tech=match.groups();name=ALIASES.get(original,original);entry=known.get(normalize(name))
   if entry is None:
    entry={'exercicio':name,'grupo_muscular':muscle(name),'primeiraSubstituicao':'','segundaSubstituicao':'','urlVideo':'https://www.youtube.com/results?search_query='+quote_plus(name.lower())};catalog.append(entry);known[normalize(name)]=entry
   index=len(days[day]);ex={'id':f'boost_w{week}_d{day}_e{index+1}','nome':entry['exercicio'],'grupo':entry['grupo_muscular'],'sourceName':original,'series':int(sets),'reps':reps.strip(),'restSeconds':int(rest),'technique':tech.strip(),'obs':''}
   for gi,indices in enumerate(GROUPS.get((week,day),[]),1):
    if index in indices:ex.update(groupId=f'boost_w{week}_d{day}_g{gi}',groupType='Bi-set')
   days[day].append(ex)
  assert [len(days[d]) for d in range(1,6)]==([8,8,9,9,9] if week<3 else [8,9,9,9,9])
  p['weeks'].append({'number':week,'days':[{'weekday':d,'title':f'{DAYS[d]} · Semana {week}','exercises':days[d]} for d in range(1,6)]})
 with path.open('w',encoding='utf-8-sig',newline='') as f:
  writer=csv.DictWriter(f,fieldnames=list(catalog[0]),lineterminator='\n');writer.writeheader();writer.writerows(catalog)
 (ROOT/'data/standard-programs/boost-pro-ombro.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
 print('Loaded 4 weeks, 20 sessions, 174 prescriptions;',len(catalog),'catalog exercises')
if __name__=='__main__':main()
