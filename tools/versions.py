#!/usr/bin/env python3
"""Vygeneruje versions.json – zoznam vydaných verzií hry pre výber verzie v spúšťačoch.
Verzia = commit, ktorého správa začína „vX.Y[.Z]:“ (od v0.5). Spúšťač stiahne hru z
https://github.com/<repo>/archive/<sha>.zip. Spusti po každom vydaní:  python3 tools/versions.py
SKIP = verzie, ktoré menili iba spúšťače (hra je rovnaká ako predchádzajúca)."""
import json, re, subprocess, os
SKIP = {'0.8.1', '0.8.2'}
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
log = subprocess.run(['git', 'log', '--format=%H\t%ad\t%aI\t%s', '--date=short'], cwd=root, capture_output=True, text=True, check=True).stdout
out, seen = [], set()
for line in log.splitlines():
    sha, date, iso, subj = line.split('\t', 3)   # iso = presný čas vydania (ISO 8601 s časovým pásmom)
    m = re.match(r'v(\d+\.\d+(?:\.\d+)?):\s*(.*)', subj)
    if not m: continue
    v = m.group(1)
    if v in seen or v in SKIP: continue
    if tuple(int(x) for x in v.split('.')) < (0, 5): continue
    seen.add(v); out.append({'version': v, 'date': date, 'time': iso, 'sha': sha, 'title': m.group(2)[:90]})
# jedna verzia = jeden riadok (spúšťač pre Mac ho číta bez JSON knižnice)
rows = ',\n'.join('  ' + json.dumps(x, ensure_ascii=False) for x in out)
open(os.path.join(root, 'versions.json'), 'w', encoding='utf-8').write('{"note":"Generuje tools/versions.py - needituj rucne.","versions":[\n' + rows + '\n]}\n')
print(len(out), 'versions')
