"""APERTURE governed lifecycle: transactional planning, execution evidence and approvals.
No external actions. Execution is deterministic validation only.
"""
import json,hashlib,datetime
from server import append,verify,has_cycle
STAGES=("imported","planned","ready","executed","evidenced","reviewed","completed")
def initialize(db):
 db.executescript("""CREATE TABLE IF NOT EXISTS project_lifecycle(project_id TEXT PRIMARY KEY REFERENCES projects(id), stage TEXT NOT NULL DEFAULT 'imported', plan TEXT, evidence TEXT, review TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE IF NOT EXISTS execution_jobs(id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL REFERENCES projects(id), status TEXT NOT NULL DEFAULT 'queued', kind TEXT NOT NULL DEFAULT 'deterministic_audit', result TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, finished_at TEXT);""")
def ensure(db,pid):
 if not db.execute("SELECT 1 FROM projects WHERE id=?",(pid,)).fetchone():raise ValueError("unknown_project")
 db.execute("INSERT OR IGNORE INTO project_lifecycle(project_id) VALUES(?)",(pid,))
def state(db,pid):
 ensure(db,pid)
 row=db.execute("SELECT stage,plan,evidence,review FROM project_lifecycle WHERE project_id=?",(pid,)).fetchone()
 return {"project_id":pid,"stage":row[0],"plan":json.loads(row[1]) if row[1] else None,"evidence":json.loads(row[2]) if row[2] else None,"review":json.loads(row[3]) if row[3] else None}
def transition(db,pid,action,payload=None):
 payload=payload or {}
 ensure(db,pid)
 current=state(db,pid)
 stage=current["stage"]
 if action=="plan":
  if stage!="imported":raise ValueError("invalid_transition")
  title=payload.get("title","")
  criteria=payload.get("acceptance",[])
  if not isinstance(title,str) or not 3<=len(title)<=160 or not isinstance(criteria,list) or not 1<=len(criteria)<=12 or any(not isinstance(x,str) or not 3<=len(x)<=250 for x in criteria):raise ValueError("invalid_plan")
  db.execute("UPDATE project_lifecycle SET stage='planned',plan=?,updated_at=CURRENT_TIMESTAMP WHERE project_id=?",(json.dumps({"title":title,"acceptance":criteria}),pid))
  next_stage="planned"
 elif action=="ready":
  if stage!="planned":raise ValueError("invalid_transition")
  missing=db.execute("SELECT count(*) FROM dependencies d LEFT JOIN project_lifecycle l ON l.project_id=d.depends_on WHERE d.project_id=? AND COALESCE(l.stage,'imported')!='completed'",(pid,)).fetchone()[0]
  if missing:raise ValueError("dependencies_not_completed")
  db.execute("UPDATE project_lifecycle SET stage='ready' WHERE project_id=?",(pid,))
  next_stage="ready"
 elif action=="execute":
  if stage!="ready":raise ValueError("invalid_transition")
  report={"kind":"deterministic_audit","registry_present":True,"ledger_valid_before":verify(db)["valid"],"external_actions":False}
  if not report["ledger_valid_before"]:raise ValueError("invalid_ledger")
  db.execute("INSERT INTO execution_jobs(project_id,status,kind,result,finished_at) VALUES(?,'completed','deterministic_audit',?,CURRENT_TIMESTAMP)",(pid,json.dumps(report)))
  db.execute("UPDATE project_lifecycle SET stage='executed' WHERE project_id=?",(pid,))
  payload=report;next_stage="executed"
 elif action=="evidence":
  if stage!="executed":raise ValueError("invalid_transition")
  report=db.execute("SELECT result FROM execution_jobs WHERE project_id=? AND status='completed' ORDER BY id DESC LIMIT 1",(pid,)).fetchone()
  if not report:raise ValueError("missing_execution")
  evidence={"worker":json.loads(report[0]),"acceptance":current["plan"]["acceptance"],"assessment":"manual_acceptance_pending"}
  db.execute("UPDATE project_lifecycle SET stage='evidenced',evidence=? WHERE project_id=?",(json.dumps(evidence),pid))
  payload=evidence;next_stage="evidenced"
 elif action=="review":
  if stage!="evidenced":raise ValueError("invalid_transition")
  if payload.get("decision")!="approve" or not isinstance(payload.get("reviewer"),str) or len(payload["reviewer"].strip())<2:raise ValueError("explicit_reviewer_approval_required")
  review={"decision":"approve","reviewer":payload["reviewer"].strip(),"note":str(payload.get("note",""))[:1000]}
  db.execute("UPDATE project_lifecycle SET stage='reviewed',review=? WHERE project_id=?",(json.dumps(review),pid))
  payload=review;next_stage="reviewed"
 elif action=="complete":
  if stage!="reviewed":raise ValueError("invalid_transition")
  db.execute("UPDATE project_lifecycle SET stage='completed' WHERE project_id=?",(pid,))
  next_stage="completed"
 else:raise ValueError("unknown_action")
 append(db,pid,"lifecycle."+action,{"from":stage,"to":next_stage,"details":payload})
 return state(db,pid)
