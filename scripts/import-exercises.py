#!/usr/bin/env python3
"""Load the CSV catalog into the standalone HTML, or verify with --check."""
import argparse
import csv
import json
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
COLUMNS = ['exercicio', 'grupo_muscular', 'primeiraSubstituicao',
           'segundaSubstituicao', 'urlVideo']
START = 'const EXDB='
END = '\nconst DB_GROUPS='


def load_catalog(path):
    with path.open(encoding='utf-8-sig', newline='') as source:
        reader = csv.DictReader(source)
        if reader.fieldnames != COLUMNS:
            raise ValueError(f'Expected CSV columns: {COLUMNS}')
        rows = list(reader)
    if not rows:
        raise ValueError('Empty exercise catalog')
    names = set()
    for line, row in enumerate(rows, 2):
        if set(row) != set(COLUMNS) or any(v is None for v in row.values()):
            raise ValueError(f'Invalid CSV row {line}')
        for field in ['exercicio', 'grupo_muscular', 'primeiraSubstituicao', 'urlVideo']:
            if not row[field].strip():
                raise ValueError(f'Missing {field} on row {line}')
        if row['exercicio'] in names:
            raise ValueError(f'Duplicate exercise: {row["exercicio"]}')
        names.add(row['exercicio'])
        url = urlsplit(row['urlVideo'])
        if url.scheme != 'https' or not url.hostname or url.username or url.password:
            raise ValueError(f'Invalid HTTPS video URL on row {line}')
    for row in rows:
        for field in ['primeiraSubstituicao', 'segundaSubstituicao']:
            if row[field] and row[field] not in names:
                raise ValueError(f'Unknown substitution: {row[field]}')
    return [dict(nome=row['exercicio'], grupo=row['grupo_muscular'],
                 **{field: row[field] for field in COLUMNS[2:]}) for row in rows]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    catalog = load_catalog(ROOT / 'exports/banco-exercicios-appfit.csv')
    html_path = ROOT / 'index.html'
    html = html_path.read_text(encoding='utf-8')
    start = html.index(START) + len(START)
    end = html.index(END, start)
    # Escape '<' so CSV text cannot terminate the enclosing HTML script element.
    payload = json.dumps(catalog, ensure_ascii=False, indent=2).replace('<', '\\u003c')
    if args.check:
        embedded = json.loads(html[start:end].strip().removesuffix(';'))
        if embedded != catalog:
            raise SystemExit('Embedded catalog differs from CSV; run scripts/import-exercises.py')
        print(f'OK: all five fields match the CSV for {len(catalog)} exercises')
    else:
        html_path.write_text(html[:start] + payload + ';' + html[end:], encoding='utf-8')
        print(f'Loaded {len(catalog)} exercises into index.html')


if __name__ == '__main__':
    main()
