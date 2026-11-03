#!/usr/bin/env python3
"""Poskladá hru z index.html + css/ + js/ do jedného súboru dist/orbitalne-sektory.html.
Použitie: python3 build.py            -> plný HTML dokument (dá sa otvoriť dvojklikom)
          python3 build.py --artifact -> bez <html>/<head>/<body> obalu (pre zverejnenie v Claude)"""
import re, sys, os
root = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
def css(m):
    return '<style>\n' + open(os.path.join(root, m.group(1)), encoding='utf-8').read() + '</style>'
def js(m):
    return '<script>\n' + open(os.path.join(root, m.group(1)), encoding='utf-8').read() + '</script>'
out = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', css, src)
out = re.sub(r'<script src="(js/[^"]+)"></script>', js, out)
if '--artifact' in sys.argv:
    head = out[out.index('<head>') + 6: out.index('</head>')]
    head = re.sub(r'<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*', '', head)
    body = out[out.index('<body>') + 6: out.rindex('</body>')]
    out = head.strip() + '\n' + body.strip() + '\n'
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
dst = os.path.join(root, 'dist', 'orbitalne-sektory.html')
open(dst, 'w', encoding='utf-8').write(out)
print('built', dst, len(out), 'bytes')
