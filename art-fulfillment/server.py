"""Private paid art delivery. Public source; generated bundles remain on Render only."""
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
import base64, hashlib, hmac, json, os, time

ROOT=Path(__file__).resolve().parent
ASSETS=ROOT/'private-art'
PRODUCTS={'courtside':'COURTSIDE-POSTER-WALLPAPER.zip','beyond':'BEYOND-POSTER-WALLPAPER.zip','premium':'PREMIUM-ART-ARCHIVE.zip'}
KEY=os.environ.get('ART_TOKEN_KEY','')
MAX_TOKEN_LENGTH=512

def b64url_decode(v):
    if not v or not all(c.isalnum() or c in '-_' for c in v): raise ValueError('invalid base64')
    return base64.urlsafe_b64decode(v+'='*((-len(v))%4))

def verify_token(token,now=None,key=KEY):
    if not isinstance(token,str) or len(token)>MAX_TOKEN_LENGTH or token.count('.')!=1: return None
    if not isinstance(key,str) or len(key)<40:return None
    try:
        body,sig=token.split('.')
        expected=hmac.new(key.encode(),body.encode(),hashlib.sha256).digest()
        received=b64url_decode(sig)
        if not hmac.compare_digest(expected,received): return None
        data=json.loads(b64url_decode(body))
        if type(data)!=dict or data.get('v')!=1: return None
        if data.get('sku') not in PRODUCTS: return None
        exp=data.get('exp')
        if type(exp)!=int: return None
        clock=int(time.time() if now is None else now)
        if exp<=clock or exp>clock+610:return None
        return data['sku']
    except (UnicodeError,ValueError,TypeError,KeyError,OverflowError):
        return None

class Handler(BaseHTTPRequestHandler):
    def log_message(self,fmt,*args):
        # Do not log Checkout identifiers, bearer tokens, IPs or filenames.
        pass
    def send_headers(self,status,ctype='text/plain; charset=utf-8',size=None):
        self.send_response(status)
        self.send_header('Content-Type',ctype)
        self.send_header('Cache-Control','private, no-store, max-age=0')
        self.send_header('Referrer-Policy','no-referrer')
        self.send_header('X-Robots-Tag','noindex, nofollow, noarchive')
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Content-Security-Policy',"default-src 'none'; frame-ancestors 'none'")
        if size is not None:self.send_header('Content-Length',str(size))
        self.end_headers()
    def reply(self,status,msg):
        blob=msg.encode()
        self.send_headers(status,size=len(blob))
        if self.command!='HEAD':self.wfile.write(blob)
    def do_GET(self):
        route=urlsplit(self.path)
        if route.path=='/healthz':
            ready=len(KEY)>=40 and all((ASSETS/f'{x}.zip').is_file() for x in PRODUCTS)
            return self.reply(200 if ready else 503,'ready' if ready else 'not ready')
        if route.path!='/download':return self.reply(404,'Not found')
        if len(self.path)>700:return self.reply(414,'Request too long')
        args=parse_qs(route.query,strict_parsing=False,keep_blank_values=True)
        if set(args)!={'token'} or len(args['token'])!=1:return self.reply(403,'Secure download required')
        sku=verify_token(args['token'][0])
        if sku is None:return self.reply(403,'Download link expired or invalid. Return to your verified purchase page to renew.')
        file=ASSETS/f'{sku}.zip'
        if not file.is_file():return self.reply(503,'Your ZIP is temporarily unavailable. Contact support.')
        size=file.stat().st_size
        filename=PRODUCTS[sku]
        self.send_response(200)
        for key,value in [
          ('Content-Type','application/zip'),('Content-Disposition',f'attachment; filename="{filename}"'),
          ('Content-Length',str(size)),('Cache-Control','private, no-store, max-age=0'),
          ('Referrer-Policy','no-referrer'),('X-Content-Type-Options','nosniff'),
          ('X-Robots-Tag','noindex,nofollow,noarchive'),('Content-Security-Policy',"default-src 'none'; frame-ancestors 'none'")]:
            self.send_header(key,value)
        self.end_headers()
        with file.open('rb') as src:
            while chunk:=src.read(1024*1024):
                try:self.wfile.write(chunk)
                except (ConnectionResetError,BrokenPipeError):break
    def do_HEAD(self):
        route=urlsplit(self.path)
        if route.path=='/healthz':return self.reply(200 if len(KEY)>=40 and all((ASSETS/f'{x}.zip').is_file() for x in PRODUCTS) else 503,'')
        return self.reply(405,'Method not allowed')
    def do_POST(self):
        return self.reply(405,'Method not allowed')

if __name__=='__main__':
    port=int(os.environ.get('PORT','3000'))
    if not 1<=port<=65535:raise SystemExit('PORT invalid')
    if len(KEY)<40:raise SystemExit('ART_TOKEN_KEY is missing')
    if not all((ASSETS/f'{x}.zip').is_file() for x in PRODUCTS):raise SystemExit('ART assets not generated')
    print('CLEARLINE private art fulfillment ready; protected downloads only',flush=True)
    ThreadingHTTPServer(('0.0.0.0',port),Handler).serve_forever()
