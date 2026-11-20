from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
studio=(root/'game-studio.html').read_text()
lab=(root/'learning-lab.html').read_text()
ledger=json.loads((root/'build-ledger.json').read_text())
assert 'href="game-studio.html"' in lab
assert 'sandbox="allow-scripts"' in studio
assert 'allow-same-origin' not in studio
assert 'frame.srcdoc=' in studio
assert 'localStorage.setItem' in studio and 'localStorage.getItem' in studio
assert 'new Blob(' in studio and 'URL.createObjectURL' in studio
assert '<scr${"ipt"}>' in studio, 'Embedded script must not terminate parent script'
assert len(ledger['agents'])>=4
assert all(agent['checks'] for agent in ledger['agents'])
assert all(build['evidence'] for build in ledger['builds'])
print('PASS: game studio wiring, sandbox, persistence, export, and tracked build gates')
