#!/usr/bin/env python3
"""Deterministic smoke checks for APERTURE learning lab."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
lab=(root/'learning-lab.html').read_text()
catalog=(root/'curriculum.html').read_text()
assert 'href="learning-lab.html"' in catalog, 'Catalog launch link missing'
assert (root/'learning-lab.html').is_file()
assert 'localStorage.setItem' in lab and 'localStorage.getItem' in lab
assert "data[key()]={answer:$('answer').value,done:true}" in lab
assert "$('heading').textContent=c[3][li]" in lab, 'Lesson title index regression'
assert "c[4][li]" in lab and "c[5][li]" in lab
assert 'aria-live="polite"' in lab
ids=set(re.findall(r'id="([^"]+)"',lab))
refs=set(re.findall(r"\$\('([^']+)'\)",lab))
assert refs <= ids, f'Unresolved DOM ids: {refs-ids}'
courses=re.findall(r"^\['(scratch|makecode|javascript|python|automation|app|engineering|robotics|decision|capstone|basketball|creator)'",lab,re.M)
assert len(courses)==12 and len(set(courses))==12, f'Expected 12 unique pathways, got {courses}'
print('PASS: catalog launch, 12 pathways, DOM refs, lesson indexing, persistence, completion and accessibility hooks')
