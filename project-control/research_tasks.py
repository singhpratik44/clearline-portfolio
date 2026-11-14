"""Research-backed project tasks with immutable provenance and explicit acceptance.
All task mutations append to the existing protected event ledger.
"""
import json,hashlib
from pathlib import Path
from server import append
ROOT=Path(__file__).resolve().parent
def initialize(db):
 db.execute("""CREATE TABLE IF NOT EXISTS research_tasks(
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id),
 title TEXT NOT NULL, source_url TEXT NOT NULL, source_title TEXT NOT NULL,
 source_date TEXT, source_provider TEXT NOT NULL, source_evidence TEXT NOT NULL,
 acceptance TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'proposed',
 evidence TEXT, reviewer TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)""")
def seed(db,project_id):
 initialize(db)
 if not db.execute("SELECT 1 FROM projects WHERE id=?",(project_id,)).fetchone():raise ValueError("unknown_project")
 data=json.loads((ROOT/"research-10.json").read_text())
 created=0
 for i,p in enumerate(data["studies"],1):
  tid="research-%02d"%i
  acceptance=[
   "Verify the cited source and record any uncertainty",
   "Map the finding to one measurable APERTURE control-plane behavior",
   "Run a deterministic baseline-versus-change test",
   "Record reproducible evidence and obtain human review before adoption"]
  result=db.execute("""INSERT OR IGNORE INTO research_tasks
   (id,project_id,title,source_url,source_title,source_date,source_provider,source_evidence,acceptance)
   VALUES(?,?,?,?,?,?,?,?,?)""",(tid,project_id,p["feature"],p["url"],p["title"],p.get("date"),p["source"],p.get("evidence","registry-summary; primary paper not independently re-audited"),json.dumps(acceptance)))
  if result.rowcount:
   append(db,project_id,"research.task.imported",{"task_id":tid,"source_url":p["url"],"acceptance":acceptance})
   created+=1
 return created
def list_tasks(db,project_id=None):
 initialize(db)
 sql="SELECT id,project_id,title,source_url,source_title,source_date,source_provider,source_evidence,acceptance,status,evidence,reviewer FROM research_tasks"
 rows=db.execute(sql+(" WHERE project_id=?" if project_id else "")+" ORDER BY id",(project_id,) if project_id else ()).fetchall()
 cols=["id","project_id","title","source_url","source_title","source_date","source_provider","source_evidence","acceptance","status","evidence","reviewer"]
 out=[]
 for row in rows:
  task=dict(zip(cols,row))
  for field in ("acceptance","evidence"):
   if task[field] is not None:task[field]=json.loads(task[field])
  out.append(task)
 return out
def transition(db,tid,action,payload):
 initialize(db)
 row=db.execute("SELECT project_id,status FROM research_tasks WHERE id=?",(tid,)).fetchone()
 if not row:raise ValueError("unknown_task")
 pid,status=row
 if action=="start" and status=="proposed":
  db.execute("UPDATE research_tasks SET status='testing' WHERE id=?",(tid,))
  new="testing";detail={"note":"Test initiated; no external code execution"}
 elif action=="evidence" and status=="testing":
  checks=payload.get("checks")
  if not isinstance(checks,list) or not checks or any(not isinstance(c,dict) or not isinstance(c.get("name"),str) or not isinstance(c.get("passed"),bool) for c in checks):raise ValueError("structured_checks_required")
  if not all(c["passed"] for c in checks):raise ValueError("failed_acceptance_check")
  detail={"checks":checks,"method":payload.get("method","manual"),"note":str(payload.get("note",""))[:1000]}
  db.execute("UPDATE research_tasks SET status='evidenced',evidence=? WHERE id=?",(json.dumps(detail),tid));new="evidenced"
 elif action=="approve" and status=="evidenced":
  reviewer=payload.get("reviewer","")
  if not isinstance(reviewer,str) or len(reviewer.strip())<2:raise ValueError("reviewer_required")
  db.execute("UPDATE research_tasks SET status='approved',reviewer=? WHERE id=?",(reviewer.strip(),tid))
  detail={"reviewer":reviewer.strip(),"decision":"approve"};new="approved"
 else:raise ValueError("invalid_transition")
 append(db,pid,"research.task."+action,{"task_id":tid,"from":status,"to":new,"details":detail})
 return {"task_id":tid,"status":new}
