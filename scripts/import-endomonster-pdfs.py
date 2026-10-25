#!/usr/bin/env python3
"""Transcribe the 12 reviewed Endomonster PDFs; never extract/follow PDF links."""
import argparse
import csv
import hashlib
import json
import re
import subprocess
import unicodedata
from pathlib import Path
from urllib.parse import quote_plus

ROOT = Path(__file__).resolve().parents[1]
DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
EXPECTED = [
    [7,7,4,8,6,4], [7,7,4,6,6,4], [7,7,4,6,6,4], [7,7,4,6,6,4],
    [9,8,6,8,10,4], [9,8,6,8,10,4], [9,8,6,8,9,4], [9,8,6,9,9,5],
    [8,9,8,8,8,5], [9,8,8,8,9,5], [8,9,8,8,8,5], [8,9,9,9,8,5],
]
# Zero-based exercise positions, verified against the visual table borders.
GROUPS = {
    (5,1):[[5,6]], (5,4):[[5,6]], (5,5):[[4,5],[7,8]],
    (6,1):[[4,5]], (6,4):[[4,5]], (6,5):[[4,5],[7,8]],
    (7,1):[[1,2]], (7,2):[[5,6]], (7,4):[[2,3]],
    (8,1):[[2,3]], (8,2):[[1,2]], (8,4):[[1,2],[5,6,7]],
    (9,2):[[5,6]], (9,4):[[2,3]],
    (10,1):[[5,6]], (10,4):[[0,1]], (10,5):[[5,6]],
    (11,2):[[6,7]], (11,4):[[2,3]], (11,6):[[0,1]],
    (12,1):[[0,1],[3,4]], (12,3):[[1,2]], (12,5):[[0,1],[3,4]],
}
ALIASES = {
    'Pulley Frente':'Puxada frente (pulldown)', 'Crossover':'Crossover na polia',
    'Rosca Direta com Barra W':'Rosca direta barra W',
    'Supino Reto com Halteres':'Supino reto halteres',
    'Abdominal Supra Máquina':'Abdominal máquina', 'Adbominal Infra Solo':'ABS Infra Solo',
    'Prancha Isométrica':'Prancha', 'Desenvolvimento com Halteres':'Desenvolvimento halteres',
    'Mesa Flexora':'Mesa flexora (deitado)', 'Leg Press 45º':'Leg press 45',
    'Abdominal Supra Cabo':'ABS Supra no Cabo', 'Abdominal Infra Declinado':'ABS Infra Declinado',
    'Abdominal Supra Solo':'Abdominal supra (crunch)',
    'Rosca 45º':'Rosca inclinada 45º', 'Rosca Martelo com Corda':'Rosca Martelo Corda',
    'Tríceps Pulley Corda':'Tríceps pulley corda', 'Tríceps Coice':'Tríceps coice (kickback)',
    'Tríceps Banco':'Tríceps mergulho no banco', 'Rosca Punho':'Rosca de punho',
    'Elevação Pélvica':'Elevação pélvica (hip thrust)',
    'Crucifixo Inverso na Máquina':'Crucifixo inverso máquina',
    'Pulley Frente Romana':'Pulley Frente Barra Romana',
    'Elevação Frontal (com Barra)':'Elevação Frontal com Barra',
    'Elevação Frontal Com Anilha':'Elevação frontal anilha',
    'Remada Cavalinho':'Remada cavalinho (T-bar)',
}
# Explicit primary groups for additions; researched against the public exercise
# reference documented in data/standard-programs/README.md. No guessed equipment.
NEW_GROUPS = {
    'Levantamento Terra Sumô':'Posterior de Coxa', 'Rosca Spider':'Bíceps', 'Pulley Costas':'Costas', 'Supino Inclinado com Halteres':'Peito', 'Supino Reto no Smith':'Peito',
    'Cardio (Aeróbio)':'Cardio', 'Agachamento':'Quadríceps',
    'Elevação Frontal com Corda':'Anterior de Ombro', 'Tríceps Testa':'Tríceps',
    'Elevação Frontal no Banco 45º':'Anterior de Ombro', 'Remada Máquina Fechada':'Costas',
    'Leg Press 45º (com pés e joelhos juntos)':'Quadríceps',
    'Extensão Lombar':'Lombar', 'Remada Alta na Polia':'Lateral de Ombro',
    'Abdominal Oblíquo na Polia Alta':'Abdômen', 'Panturrilha no Leg Press 45º':'Panturrilha',
    'Crucifixo Máquina':'Peito', 'Pulldown':'Costas', 'Abdominal Supra Declinado':'Abdômen',
    'Panturrilha em Pé':'Panturrilha', 'Elevação Lateral no Banco 45º':'Lateral de Ombro',
    'Tríceps Pulley Inverso':'Tríceps', 'Desenvolvimento com Barra (em pé)':'Anterior de Ombro',
    'Crucifixo no Cross':'Peito', 'Bíceps na Polia Alta':'Bíceps',
    'Tríceps Pulley Unilateral':'Tríceps', 'Leg Press':'Quadríceps',
    'Stiff (com pés juntos)':'Posterior de Coxa', 'Remada Curvada na Polia':'Costas',
    'Rosca 21 na Polia':'Bíceps', 'Leg Press (com pés e joelhos juntos)':'Quadríceps',
    'Abdominal Oblíquo Solo':'Abdômen', 'Tríceps Pulley Inverso Unilateral':'Tríceps',
    'Encolhimento na Polia':'Trapézio', 'Elevação Lateral (Sentado)':'Lateral de Ombro',
}

def normalize(s):
    return unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().casefold().strip()


def parse_pdf(pdf, week):
    raw = subprocess.run(['pdftotext', '-layout', str(pdf), '-'], capture_output=True, text=True, check=True).stdout
    days = {}; day = None; tech_boundary = None; pending = None
    for line in raw.splitlines():
        match = re.search(r'(Segunda|Terça|Quarta|Quinta|Sexta)-feira|Sábado', line)
        if match:
            day = DAYS.index(match[1] or 'Sábado'); days[day] = []; continue
        headers = list(re.finditer(r'Técnica(?: 2)?', line))
        if headers:
            tech_boundary = sum(m.start()+len(m[0])/2 for m in headers)/2 if len(headers)==2 else None
            continue
        # The only wrapped name in the supplied tables (week 3, Thursday).
        if line.strip() == 'Leg Press 45º (com pés e joelhos':
            assert week==3 and day==4
            pending = 'Leg Press 45º (com pés e joelhos juntos)'; continue
        if line.strip() == 'juntos)': continue
        if pending and re.match(r'^\s*\d+\s+\d+\s+\d+\s+seg', line):
            line = pending+'  '+line.strip(); pending = None
        match = re.match(r'^\s*(?:TRI-SET\s+)?(.+?)\s{2,}(\d+)\s+(.+?)\s+(\d+)\s+seg(?:\s{2,}(.*?))?\s*$', line)
        if match:
            name, sets, reps, rest, technique = match.groups()
            assert not name.isdigit() and reps.strip(), (week, day, line)
            techniques = re.split(r'\s{2,}', technique) if technique else []
            assert len(techniques)<=2, (week, day, line)
            if len(techniques)==1 and tech_boundary is not None and match.start(5)>=tech_boundary:
                techniques.insert(0, '')
            row = dict(sourceName=name, series=int(sets), reps=reps.strip(), restSeconds=int(rest),
                       technique=techniques[0] if techniques else '', technique2=techniques[1] if len(techniques)>1 else '')
        else:
            match = re.match(r'^\s*(Cardio \(Aeróbio\))\s+(1)\s+(\d+)min\s*$', line)
            if not match:
                assert not re.search(r'\d+\s+seg|\d+min', line), (week, day, line)
                continue
            name, sets, minutes = match.groups()
            row = dict(sourceName=name, series=int(sets), reps=minutes+'min', restSeconds=None, technique='', technique2='')
        if row['sourceName']=='Cardio (Aeróbio)':
            row.update(kind='cardio', durationUnit='minutes', durationMinutes=int(re.search(r'\d+', row['reps'])[0]))
        elif row['sourceName']=='Prancha Isométrica': row['durationUnit']='seconds'
        elif re.search(r'\d+\s*\+\s*\d+\s*s',row['reps']): row['durationUnit']='mixed'
        assert day is not None
        days[day].append(row)
    assert pending is None
    assert sorted(days)==list(range(1,7))
    assert [len(days[d]) for d in range(1,7)]==EXPECTED[week-1], (week, {d:len(x) for d,x in days.items()})
    return days


def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('pdf_directory',type=Path);args=parser.parse_args()
    files={}
    for pdf in args.pdf_directory.rglob('Planilha_Endomonster_Smartphone_Semana*.pdf'):
        week=int(re.search(r'Semana(\d+)',pdf.name)[1]);assert week not in files;files[week]=pdf
    assert sorted(files)==list(range(1,13)), 'Expected exactly weeks 1–12'
    catalog_path=ROOT/'exports/banco-exercicios-appfit.csv'
    catalog=list(csv.DictReader(catalog_path.open(encoding='utf-8-sig',newline='')))
    known={normalize(r['exercicio']):r for r in catalog}
    # Correct an earlier generic-name classification, not a change to saved runs.
    known[normalize('Remada Unilateral')]['grupo_muscular']='Costas'
    program=dict(id='endomonster',nome='Endomonster',autor='Thiago Kotolak',durationWeeks=12,
                 level='Intermediário',description='Musculação e cardio com variações diárias ao longo de 12 semanas, de segunda a sábado.',weeks=[],sources=[])
    for week,pdf in sorted(files.items()):
        program['sources'].append(dict(file=pdf.name,sha256=hashlib.sha256(pdf.read_bytes()).hexdigest()))
        days=parse_pdf(pdf,week);output=[]
        for day,rows in days.items():
            for i,row in enumerate(rows):
                original=row['sourceName'];name=ALIASES.get(original,original);entry=known.get(normalize(name))
                if entry is None:
                    assert name in NEW_GROUPS, 'Research required for: '+name
                    entry=dict(exercicio=name,grupo_muscular=NEW_GROUPS[name],primeiraSubstituicao='',segundaSubstituicao='',urlVideo='https://www.youtube.com/results?search_query='+quote_plus(name.lower()))
                    known[normalize(name)]=entry;catalog.append(entry)
                row.update(id=f'endo_w{week}_d{day}_e{i+1}',nome=entry['exercicio'],grupo=entry['grupo_muscular'],obs='')
                for gi,indices in enumerate(GROUPS.get((week,day),[]),1):
                    if i in indices:row.update(groupId=f'endo_w{week}_d{day}_g{gi}',groupType='Tri-set' if len(indices)==3 else 'Bi-set')
            output.append(dict(weekday=day,title=f'{DAYS[day]} · Semana {week}',exercises=rows))
        program['weeks'].append(dict(number=week,days=output))
    # Synchronize the corrected group in templates; saved executions stay frozen.
    boost_path=ROOT/'data/standard-programs/boost-pro-ombro.json';boost=json.loads(boost_path.read_text())
    for week in boost['weeks']:
        for day in week['days']:
            for ex in day['exercises']:
                if ex['nome']=='Remada Unilateral':ex['grupo']='Costas'
    with catalog_path.open('w',encoding='utf-8-sig',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=list(catalog[0]),lineterminator='\n');writer.writeheader();writer.writerows(catalog)
    boost_path.write_text(json.dumps(boost,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'data/standard-programs/endomonster.json').write_text(json.dumps(program,ensure_ascii=False,indent=2)+'\n')
    exercises=[e for w in program['weeks'] for d in w['days'] for e in d['exercises']]
    print('Loaded 12 weeks, 72 sessions,',len(exercises),'prescriptions,',sum(e.get('kind')=='cardio' for e in exercises),'cardio blocks;',len(catalog),'catalog entries')

if __name__=='__main__': main()
