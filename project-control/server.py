"""APERTURE protected project database + append-only event store.
Run locally: APERTURE_ADMIN_TOKEN=<random-long-secret> python3 project-control/server.py
Python stdlib only. Not exposed by static GitHub Pages.
"""
import os,json,sqlite3,hashlib,hmac,datetime,uuid
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from pathlib import Path

ROOT=Path(__file__).resolve().parent
DB=Path(os.environ.get("APERTURE_DB_PATH",str(ROOT/"private.sqlite3")))
TOKEN=os.environ.get("APERTURE_ADMIN_TOKEN","")
HOST=os.environ.get("APERTURE_HOST","127.0.0.1")
PORT=int(os.environ.get("APERTURE_PORT","8787"))
def stamp():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def canon(x):return json.dumps(x,sort_keys=True,separators=(",",":"))
def connect():
 db=sqlite3.connect(DB,timeout=10,isolation_level=None)
 db.execute("PRAGMA journal_mode=WAL")
 db.execute("PRAGMA foreign_keys=ON")
 db.executescript("""CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY, name TEXT NOT NULL, domain TEXT NOT NULL, stage TEXT NOT NULL DEFAULT 'imported', source TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 0);
 CREATE TABLE IF NOT EXISTS events(seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT UNIQUE NOT NULL, project_id TEXT NOT NULL REFERENCES projects(id), kind TEXT NOT NULL, payload TEXT NOT NULL, timestamp TEXT NOT NULL, previous_hash TEXT NOT NULL, hash TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS dependencies(project_id TEXT NOT NULL REFERENCES projects(id), depends_on TEXT NOT NULL REFERENCES projects(id), PRIMARY KEY(project_id,depends_on));
 CREATE TRIGGER IF NOT EXISTS prevent_event_update BEFORE UPDATE ON events BEGIN SELECT RAISE(ABORT,'immutable events'); END;
 CREATE TRIGGER IF NOT EXISTS prevent_event_delete BEFORE DELETE ON events BEGIN SELECT RAISE(ABORT,'immutable events'); END;""")
 return db
def append(db,pid,kind,payload):
 prev=db.execute("SELECT hash FROM events ORDER BY seq DESC LIMIT 1").fetchone()
 previous=prev[0] if prev else "GENESIS"
 event={"id":str(uuid.uuid4()),"project_id":pid,"kind":kind,"payload":payload,"timestamp":stamp(),"previous_hash":previous}
 digest=hashlib.sha256(canon(event).encode()).hexdigest()
 db.execute("INSERT INTO events(id,project_id,kind,payload,timestamp,previous_hash,hash) VALUES(?,?,?,?,?,?,?)",(event["id"],pid,kind,canon(payload),event["timestamp"],previous,digest))
 return {"event":event,"hash":digest}
def import_registry(db):
 registry=json.loads((ROOT/"portfolio-import.json").read_text())
 db.execute("BEGIN IMMEDIATE")
 try:
  for p in registry["projects"]:
   db.execute("INSERT OR IGNORE INTO projects(id,name,domain,stage,source) VALUES(?,?,?,?,?)",(p["id"],p["name"],p["domain"],"imported",p["source"]))
   if db.execute("SELECT 1 FROM events WHERE project_id=? LIMIT 1",(p["id"],)).fetchone() is None:append(db,p["id"],"project.imported",{"name":p["name"],"source":p["source"]})
  db.commit()
 except:db.rollback();raise
def verify(db):
 previous="GENESIS";n=0
 for seq,eid,pid,kind,payload,timestamp,prev,digest in db.execute("SELECT seq,id,project_id,kind,payload,timestamp,previous_hash,hash FROM events ORDER BY seq"):
  e={"id":eid,"project_id":pid,"kind":kind,"payload":json.loads(payload),"timestamp":timestamp,"previous_hash":prev}
  if prev!=previous or hashlib.sha256(canon(e).encode()).hexdigest()!=digest:return {"valid":False,"at":seq}
  previous=digest;n+=1
 return {"valid":True,"events":n,"head":previous}
def has_cycle(db,project,depends):
 graph={}
 for a,b in db.execute("SELECT project_id,depends_on FROM dependencies"):graph.setdefault(a,[]).append(b)
 graph.setdefault(project,[]).append(depends)
 visiting=set();visited=set()
 def walk(x):
  if x in visiting:return True
  if x in visited:return False
  visiting.add(x)
  for y in graph.get(x,[]):
   if walk(y):return True
  visiting.remove(x);visited.add(x);return False
 return any(walk(x) for x in graph)
class Handler(BaseHTTPRequestHandler):
 def send(self,code,obj):
  data=canon(obj).encode();self.send_response(code);self.send_header("Content-Type","application/json");self.send_header("Cache-Control","no-store");self.send_header("X-Content-Type-Options","nosniff");self.send_header("Content-Length",str(len(data)));self.end_headers();self.wfile.write(data)
 def authorized(self):
  supplied=self.headers.get("Authorization","").removeprefix("Bearer ")
  return bool(TOKEN and len(TOKEN)>=32 and hmac.compare_digest(supplied,TOKEN))
 def do_GET(self):
  if self.path=='/control-plane':
   data=(ROOT/'index.html').read_bytes();self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);return
  if self.path=='/portfolio-import.json':
   data=(ROOT/'portfolio-import.json').read_bytes();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);return
  if not self.authorized():return self.send(401,{"error":"unauthorized"})
  with connect() as db:
   if self.path.startswith('/lifecycle/'):
    from lifecycle import initialize,state
    initialize(db)
    pid=self.path.split('/')[-1]
    try:return self.send(200,state(db,pid))
    except ValueError:return self.send(404,{'error':'unknown_project'})
   if self.path=="/health":return self.send(200,{"status":"ready","storage":"sqlite"})
   if self.path=="/projects":return self.send(200,{"projects":[dict(zip(("id","name","domain","stage","source","version"),row)) for row in db.execute("SELECT id,name,domain,stage,source,version FROM projects ORDER BY domain,name")]})
   if self.path=="/ledger/verify":return self.send(200,verify(db))
   if self.path=="/events":return self.send(200,{"events":[dict(zip(("seq","id","project_id","kind","payload","timestamp","previous_hash","hash"),row)) for row in db.execute("SELECT * FROM events ORDER BY seq DESC LIMIT 100")]})
  self.send(404,{"error":"not_found"})
 def do_POST(self):
  if not self.authorized():return self.send(401,{"error":"unauthorized"})
  try:
   size=int(self.headers.get("Content-Length","0"))
   if not 0<size<=16384:return self.send(413,{"error":"invalid_size"})
   body=json.loads(self.rfile.read(size))
   if not isinstance(body,dict):return self.send(400,{"error":"invalid_payload"})
   with connect() as db:
    if self.path=='/lifecycle':
     from lifecycle import initialize
     initialize(db)
    db.execute("BEGIN IMMEDIATE")
    try:
     if self.path=='/lifecycle':
      from lifecycle import transition
      pid=body.get('project_id');action=body.get('action');payload=body.get('payload',{})
      if not isinstance(pid,str) or not isinstance(action,str) or not isinstance(payload,dict):return self.abort(db,400,'invalid_request')
      try:event=transition(db,pid,action,payload)
      except ValueError as err:return self.abort(db,409,str(err))
      db.commit();return self.send(201,event)
     if self.path=="/dependencies":
      pid,dep=body.get("project_id"),body.get("depends_on")
      if not isinstance(pid,str) or not isinstance(dep,str) or pid==dep or not db.execute("SELECT 1 FROM projects WHERE id=?",(pid,)).fetchone() or not db.execute("SELECT 1 FROM projects WHERE id=?",(dep,)).fetchone():return self.abort(db,400,"invalid_project")
      if has_cycle(db,pid,dep):return self.abort(db,409,"dependency_cycle")
      result=db.execute("INSERT OR IGNORE INTO dependencies VALUES(?,?)",(pid,dep))
      if not result.rowcount:return self.abort(db,409,"duplicate_dependency")
      event=append(db,pid,"dependency.added",{"depends_on":dep})
     elif self.path=="/review":
      pid=body.get("project_id")
      if not isinstance(pid,str) or not db.execute("SELECT 1 FROM projects WHERE id=?",(pid,)).fetchone():return self.abort(db,400,"invalid_project")
      event=append(db,pid,"review.requested",{"release":"blocked","approval":"pending"})
     else:return self.abort(db,404,"not_found")
     db.commit();return self.send(201,event)
    except:db.rollback();raise
  except (ValueError,TypeError,json.JSONDecodeError):return self.send(400,{"error":"invalid_json"})
 def abort(self,db,code,error):db.rollback();self.send(code,{"error":error})
if __name__=="__main__":
 if len(TOKEN)<32:raise SystemExit("Set APERTURE_ADMIN_TOKEN to at least 32 random characters.")
 DB.parent.mkdir(parents=True,exist_ok=True)
 with connect() as db:import_registry(db)
 print("APERTURE protected project API listening",HOST,PORT)
 ThreadingHTTPServer((HOST,PORT),Handler).serve_forever()
