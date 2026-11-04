#!/usr/bin/env python3
"""Vygeneruje CHANGELOG.md – zoznam zmien po verziách (najnovšia hore), zoskupený podľa hlavných verzií (0.16, 0.15 …).
Zdroj: commity „vX.Y[.Z]: …“ v histórii gitu; novinky sa berú z version.json v danom commite, inak z krátkeho
popisu v README (riadky „- **vX** – …“), inak zo správy commitu. Spusti po každom vydaní:  python3 tools/changelog.py"""
import json, re, subprocess, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
git = lambda *a: subprocess.run(['git', *a], cwd=root, capture_output=True, text=True).stdout
# krátke popisy starých verzií (pred version.json) z README
short = {}
readme = open(os.path.join(root, 'README.md'), encoding='utf-8').read()
for m in re.finditer(r'^- \*\*v(\d+\.\d+(?:\.\d+)?)\*\* – (.+)$', readme, re.M): short[m.group(1)] = m.group(2)
old = os.path.join(root, 'tools', 'changelog-old.txt')
if os.path.exists(old):
    for line in open(old, encoding='utf-8'):
        m = re.match(r'v(\S+)\t(.+)', line.strip())
        if m: short.setdefault(m.group(1), m.group(2))
seen, rows = set(), []
for line in git('log', '--format=%H\t%ad\t%s', '--date=short').splitlines():
    sha, date, subj = line.split('\t', 2)
    m = re.match(r'v(\d+\.\d+(?:\.\d+)?):\s*(.*)', subj)
    if not m or m.group(1) in seen: continue
    v = m.group(1); seen.add(v); notes = []
    try:
        d = json.loads(git('show', sha + ':version.json') or '{}')
        if d.get('version') == v: notes = d.get('notes', [])
    except Exception: pass
    if not notes: notes = [short.get(v, m.group(2))]
    rows.append((v, date, notes))
key = lambda v: tuple(int(x) for x in v.split('.'))
rows.sort(key=lambda r: key(r[0]), reverse=True)
out = ['# Zoznam zmien – Orbitálne Sektory', '', 'Najnovšia verzia je hore. Staršie verzie hry sa dajú spustiť cez výber verzie v spúšťači (pozri README).', '']
group = None
for v, date, notes in rows:
    g = '.'.join(v.split('.')[:2])
    if g != group: out += ['', f'## {g}', '']; group = g
    out.append(f'### v{v} · {date}')
    out += [f'- {n}' for n in notes]
    out.append('')
open(os.path.join(root, 'CHANGELOG.md'), 'w', encoding='utf-8').write('\n'.join(out).replace('\n\n\n', '\n\n'))
print(len(rows), 'versions')
