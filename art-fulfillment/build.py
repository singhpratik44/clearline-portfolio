from pathlib import Path
import random, zipfile, os
import cairosvg

root=Path(__file__).resolve().parent
out=root/"private-art"
(out/"vectors").mkdir(parents=True,exist_ok=True)
(out/"posters").mkdir(exist_ok=True)
(out/"wallpapers").mkdir(exist_ok=True)
art=[
 dict(slug='the-clutch',title='THE CLUTCH',subtitle='CALM IS A COMPETITIVE ADVANTAGE',series='COURTSIDE / 001',bg='#070b12',bg2='#142735',accent='#fa754e',light='#e7d8b9',kind='ball'),
 dict(slug='all-court',title='ALL COURT',subtitle='SEE THE WHOLE GAME',series='COURTSIDE / 002',bg='#101322',bg2='#384f7a',accent='#b5ddfd',light='#f0efe1',kind='court'),
 dict(slug='elevate',title='ELEVATE',subtitle='THE WORK IS THE WONDER',series='COURTSIDE / 003',bg='#2b0d36',bg2='#813f42',accent='#ffb86a',light='#f6eade',kind='flight'),
 dict(slug='quiet-power',title='QUIET POWER',subtitle='STRENGTH DOES NOT NEED TO SHOUT',series='BEYOND / 001',bg='#0d2926',bg2='#205c54',accent='#e9c992',light='#e4e9d9',kind='sun'),
 dict(slug='wonder-is-here',title='WONDER',subtitle='LOOK AGAIN. THE WORLD IS ALIVE.',series='BEYOND / 002',bg='#180d34',bg2='#442b81',accent='#eb9fd3',light='#e8e5ff',kind='orbit'),
 dict(slug='unbroken',title='UNBROKEN',subtitle='BECOME MORE, TOGETHER',series='BEYOND / 003',bg='#101a24',bg2='#294152',accent='#8fe1cd',light='#d7f5ea',kind='mountain'),
]
def svg_for(a,mode='poster'):
  w,h=(1600,2400) if mode=='poster' else (1080,2340)
  rand=random.Random(a['slug']+mode)
  defs=f'''<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{a['bg']}"/><stop offset="1" stop-color="{a['bg2']}"/></linearGradient><radialGradient id="glow"><stop stop-color="{a['accent']}" stop-opacity=".38"/><stop offset="1" stop-color="{a['accent']}" stop-opacity="0"/></radialGradient><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{a['accent']}"/><stop offset=".52" stop-color="{a['light']}"/><stop offset="1" stop-color="{a['accent']}"/></linearGradient><filter id="soft"><feGaussianBlur stdDeviation="50"/></filter><clipPath id="clip"><rect width="{w}" height="{h}"/></clipPath></defs>'''
  p=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{a["title"]} original poster by Clearline">',defs,f'<rect width="{w}" height="{h}" fill="url(#bg)"/>',f'<g clip-path="url(#clip)"><ellipse cx="{w*.75}" cy="{h*.39}" rx="{w*.62}" ry="{h*.41}" fill="url(#glow)"/>']
  for _ in range(130):
    x=rand.randrange(0,w);y=rand.randrange(int(.09*h),int(.83*h));r=rand.choice([1,1,1,2,3])
    p.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{a["light"]}" opacity="{rand.uniform(.08,.36):.2f}"/>')
  cx,cy=w*.53,h*.43
  if a['kind']=='ball':
    p += [f'<circle cx="{cx}" cy="{cy}" r="{w*.38}" fill="none" stroke="{a["accent"]}" stroke-opacity=".15" stroke-width="80"/>',
      f'<circle cx="{cx}" cy="{cy}" r="{w*.29}" fill="none" stroke="url(#metal)" stroke-width="17"/>',
      f'<circle cx="{cx}" cy="{cy}" r="{w*.27}" fill="{a["accent"]}" fill-opacity=".07"/>',
      f'<path d="M {cx-w*.29} {cy} H {cx+w*.29} M {cx} {cy-w*.29} V {cy+w*.29} M {cx-w*.22} {cy-w*.18} Q {cx+w*.23} {cy} {cx-w*.22} {cy+w*.18} M {cx+w*.22} {cy-w*.18} Q {cx-w*.23} {cy} {cx+w*.22} {cy+w*.18}" fill="none" stroke="{a["accent"]}" stroke-width="12" stroke-linecap="round" opacity=".8"/>',
      f'<circle cx="{cx}" cy="{cy}" r="{w*.41}" fill="none" stroke="{a["light"]}" stroke-opacity=".26" stroke-width="2" stroke-dasharray="12 22"/>']
  elif a['kind']=='court':
    for i in range(15):
      x=w*(i-3)/11;p.append(f'<path d="M {x} {h*.17} L {w*.5+(x-w*.5)*1.3} {h*.73}" stroke="{a["accent"]}" stroke-opacity=".13" stroke-width="3"/>')
    p += [f'<rect x="{w*.15}" y="{h*.16}" width="{w*.7}" height="{h*.53}" rx="12" stroke="{a["light"]}" stroke-width="7" fill="none" opacity=".8"/>',
    f'<path d="M {w*.5} {h*.16} V {h*.69} M {w*.15} {h*.43} H {w*.85} M {w*.15} {h*.26} Q {w*.5} {h*.51} {w*.85} {h*.26}" stroke="{a["accent"]}" stroke-width="6" fill="none"/>',
    f'<circle cx="{w*.5}" cy="{h*.43}" r="{w*.19}" stroke="{a["light"]}" stroke-width="6" fill="none"/>']
  elif a['kind']=='flight':
    for i in range(9):
      yy=h*(.19+i*.052);p.append(f'<path d="M {-w*.1} {yy+h*.2} Q {w*.45} {yy-h*.42} {w*1.15} {yy-h*.1}" fill="none" stroke="{a["accent"]}" stroke-width="{20-i*1.5}" opacity="{.13+i*.05}"/>')
    p += [f'<circle cx="{w*.7}" cy="{h*.38}" r="{w*.2}" stroke="{a["light"]}" stroke-width="10" fill="none"/>',
          f'<path d="M {w*.3} {h*.64} L {w*.51} {h*.44} L {w*.64} {h*.51} L {w*.82} {h*.27}" stroke="{a["light"]}" stroke-width="18" fill="none"/>']
  elif a['kind']=='sun':
    for i in range(13):
      r=w*(.13+i*.042);p.append(f'<circle cx="{cx}" cy="{h*.43}" r="{r}" stroke="{a["accent"]}" stroke-width="{10 if i%3==0 else 3}" stroke-opacity="{.57-i*.03}" fill="none"/>')
    p.append(f'<circle cx="{cx}" cy="{h*.43}" r="{w*.13}" fill="url(#metal)"/>')
    p.append(f'<rect x="0" y="{h*.54}" width="{w}" height="{h*.11}" fill="{a["bg"]}" opacity=".87"/>')
  elif a['kind']=='orbit':
    for i in range(7):
      p.append(f'<ellipse cx="{cx}" cy="{h*.41}" rx="{w*(.22+i*.062)}" ry="{h*(.09+i*.043)}" transform="rotate({-29+i*12} {cx} {h*.41})" stroke="{a["accent"] if i%2 else a["light"]}" stroke-width="{3+i%3}" stroke-opacity="{.3+i*.07}" fill="none"/>')
    p.append(f'<circle cx="{cx}" cy="{h*.41}" r="{w*.17}" fill="url(#metal)"/>')
    p.append(f'<circle cx="{cx+w*.3}" cy="{h*.3}" r="{w*.025}" fill="{a["light"]}"/>')
  else:
    for i in range(7):
      p.append(f'<path d="M {-w*.15} {h*(.59+i*.027)} L {w*.26} {h*(.31+i*.023)} L {w*.47} {h*(.51+i*.013)} L {w*.68} {h*(.21+i*.036)} L {w*1.2} {h*(.53+i*.02)}" fill="none" stroke="{a["accent"]}" stroke-width="{23-i*2}" stroke-opacity="{.67-i*.06}" stroke-linejoin="round"/>')
    p.append(f'<circle cx="{w*.7}" cy="{h*.26}" r="{w*.065}" fill="{a["light"]}"/>')
  p += [f'<rect x="0" y="{h*.795}" width="{w}" height="{h*.205}" fill="{a["bg"]}" fill-opacity=".91"/>',
        f'<line x1="{w*.075}" y1="{h*.805}" x2="{w*.925}" y2="{h*.805}" stroke="{a["accent"]}" stroke-opacity=".9" stroke-width="3"/>']
  head_fs=int(w*.037);hero_fs=int(w*(.105 if len(a['title'])>10 else (.125 if len(a['title'])>8 else .15)))
  if a['title']=='WONDER':hero_fs=int(w*.17)
  p += [f'<text x="{w*.074}" y="{h*.066}" fill="{a["light"]}" font-size="{head_fs}" font-weight="600" letter-spacing="{w*.014}" font-family="Arial,sans-serif">APERTURE   /   CLEARLINE</text>',
        f'<text x="{w*.075}" y="{h*.85}" fill="{a["light"]}" font-size="{hero_fs}" font-weight="900" letter-spacing="{-w*.006}" font-family="Arial,sans-serif" textLength="{w*.85}" lengthAdjust="spacingAndGlyphs">{a["title"]}</text>',
        f'<text x="{w*.077}" y="{h*.893}" fill="{a["accent"]}" font-size="{int(w*.025)}" font-weight="700" letter-spacing="{w*.008}" font-family="Arial,sans-serif" textLength="{w*.85}" lengthAdjust="spacingAndGlyphs">{a["subtitle"]}</text>',
        f'<text x="{w*.077}" y="{h*.962}" fill="{a["light"]}" font-size="{int(w*.027)}" opacity=".76" font-family="Arial,sans-serif" letter-spacing="4">{a["series"]}  ·  ORIGINAL ART</text>',
        f'<text x="{w*.93}" y="{h*.963}" text-anchor="end" fill="{a["accent"]}" font-size="{int(w*.033)}" font-weight="bold" font-family="Arial,sans-serif">∞</text>', '</g></svg>']
  return ''.join(p)
license_text="""CLEARLINE ORIGINAL ART / APERTURE COLLECTION 001

Digital files only; no physical poster will be shipped.

Personal-use license: print for your own home, use as personal phone wallpaper, or gift a printed copy to one other person. No commercial reproduction, resale, merchandise, file redistribution or trademark use without express permission.

These are independent original artworks; not affiliated with, sponsored, licensed or endorsed by the NBA, its teams, players or any professional league.

Questions: parry.s.2324@gmail.com
"""
if __name__=='__main__':
  if os.environ.get('ART_BUILD_ENABLED','true')!='true':
    raise SystemExit('Building paid assets disabled')
  for a in art:
    name=a['slug']
    poster=svg_for(a,'poster');phone=svg_for(a,'phone')
    (out/'vectors'/f'{name}-poster.svg').write_text(poster)
    cairosvg.svg2png(bytestring=poster.encode(),write_to=str(out/'posters'/f'{name}-3000x4500.png'),output_width=3000,output_height=4500)
    cairosvg.svg2png(bytestring=phone.encode(),write_to=str(out/'wallpapers'/f'{name}-1440x3120.png'),output_width=1440,output_height=3120)
  groups={'courtside':art[:3],'beyond':art[3:],'premium':art}
  for key,items in groups.items():
    with zipfile.ZipFile(out/f'{key}.zip','w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
      z.writestr('README-LICENSE.txt',license_text)
      for a in items:
        s=a['slug']
        z.write(out/'posters'/f'{s}-3000x4500.png',f'posters/{s}-3000x4500.png')
        z.write(out/'wallpapers'/f'{s}-1440x3120.png',f'wallpapers/{s}-1440x3120.png')
        z.write(out/'vectors'/f'{s}-poster.svg',f'vectors/{s}-poster.svg')
  for key in groups:
    print('Generated paid art bundle',key,(out/f'{key}.zip').stat().st_size)
