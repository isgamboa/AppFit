#!/usr/bin/env python3
"""Embed approved custom-program JSON files; --check only verifies the HTML."""
import argparse
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    catalog = {r['exercicio']: r for r in csv.DictReader(
        (ROOT / 'exports/banco-exercicios-appfit.csv').open(encoding='utf-8-sig', newline=''))}
    programs = [json.loads(p.read_text()) for p in sorted((ROOT / 'data/programas').glob('*.json'))]
    ids = set()
    for p in programs:
        assert p['id'] not in ids and p['nome'].strip(), 'Invalid or duplicate program'
        ids.add(p['id'])
        assert p['model'] in ['abc', 'fullbody']
        assert len(p['sessions']) == len(set(p['sessions'])) == 3
        assert len(p['days']) == 7 and p['off'] not in p['sessions']
        assert set(p['days']) == {*p['sessions'], p['off']}
        assert p['plans'][p['off']]['rest'] is True
        exercise_ids = set()
        for session in p['sessions']:
            plan = p['plans'][session]
            assert p['days'].count(session) == 1 and plan['ex']
            assert plan['tipo'] == session
            for ex in plan['ex']:
                assert ex['id'] not in exercise_ids
                exercise_ids.add(ex['id'])
                assert ex['nome'] in catalog and ex['grupo'] == catalog[ex['nome']]['grupo_muscular']
                assert isinstance(ex['series'], int) and 1 <= ex['series'] <= 30
                assert ex['reps'].strip()
    html_path = ROOT / 'index.html'
    html = html_path.read_text()
    start = html.index('const INITIAL_CUSTOM_PROGRAMS=') + len('const INITIAL_CUSTOM_PROGRAMS=')
    end = html.index(';\nfunction seedInitialPrograms', start)
    if args.check:
        assert json.loads(html[start:end]) == programs, 'Program JSON differs from HTML'
        print(f'OK: {len(programs)} approved program(s) validated and matched to HTML')
    else:
        value = json.dumps(programs, ensure_ascii=False, indent=2).replace('<', '\\u003c')
        html_path.write_text(html[:start] + value + html[end:])
        print(f'Loaded {len(programs)} approved program(s)')

if __name__ == '__main__':
    main()
