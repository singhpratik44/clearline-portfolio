import base64, hashlib, hmac, json, unittest, time, zipfile
from pathlib import Path
from server import verify_token, PRODUCTS, ASSETS
KEY='unit-test-token-constant-not-for-production-123456789'
def make(sku='courtside',exp=None):
    payload={'v':1,'sku':sku,'exp':int(time.time())+500 if exp is None else exp}
    data=base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip('=')
    sig=base64.urlsafe_b64encode(hmac.new(KEY.encode(),data.encode(),hashlib.sha256).digest()).decode().rstrip('=')
    return data+'.'+sig
class ArtTests(unittest.TestCase):
    def test_signature(self):
        self.assertEqual(verify_token(make(),key=KEY),'courtside')
        self.assertEqual(verify_token(make('premium'),key=KEY),'premium')
    def test_invalid(self):
        token=make()
        for item in ['','bad','x.y',token+'.x',token[:-1]+'A',make('unknown'),make(exp=int(time.time())-20),make(exp=int(time.time())+7000)]:
            self.assertIsNone(verify_token(item,key=KEY),item[:35])
        self.assertIsNone(verify_token(token,key='bad'))
    def test_files(self):
        for sku in PRODUCTS:
            path=ASSETS/f'{sku}.zip'
            self.assertTrue(path.is_file(),str(path))
            with zipfile.ZipFile(path) as z:
                files=z.namelist()
                expected=18 if sku=='premium' else 9
                self.assertEqual(len(files),expected+1)
                self.assertEqual(len([x for x in files if x.endswith('.png')]),expected//3*2)
                self.assertTrue(all(not x.startswith('/') and '..' not in x for x in files))
                self.assertGreater(path.stat().st_size,500000)
if __name__=='__main__':unittest.main()
