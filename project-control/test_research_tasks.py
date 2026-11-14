import sys,tempfile,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import server,research_tasks
class ResearchLifecycle(unittest.TestCase):
 def test_import_provenance_evidence_review_and_ledger(self):
  with tempfile.TemporaryDirectory() as tmp:
   server.DB=Path(tmp)/"research.sqlite3"
   with server.connect() as db:
    server.import_registry(db)
    pid=db.execute("SELECT id FROM projects LIMIT 1").fetchone()[0]
    db.execute("BEGIN IMMEDIATE")
    self.assertEqual(research_tasks.seed(db,pid),10)
    db.commit()
    db.execute("BEGIN IMMEDIATE")
    self.assertEqual(research_tasks.seed(db,pid),0)
    db.commit()
    tasks=research_tasks.list_tasks(db,pid)
    self.assertEqual(len(tasks),10)
    self.assertTrue(all(t["source_url"].startswith("https://") and len(t["acceptance"])>=3 for t in tasks))
    tid=tasks[0]["id"]
    with self.assertRaises(ValueError):research_tasks.transition(db,tid,"approve",{"reviewer":"Owner"})
    db.execute("BEGIN IMMEDIATE")
    self.assertEqual(research_tasks.transition(db,tid,"start",{})["status"],"testing")
    db.commit()
    with self.assertRaises(ValueError):research_tasks.transition(db,tid,"evidence",{"checks":[{"name":"reproducible test","passed":False}]})
    db.execute("BEGIN IMMEDIATE")
    self.assertEqual(research_tasks.transition(db,tid,"evidence",{"checks":[{"name":"reproducible test","passed":True}],"method":"manual-attestation"})["status"],"evidenced")
    db.commit()
    db.execute("BEGIN IMMEDIATE")
    self.assertEqual(research_tasks.transition(db,tid,"approve",{"reviewer":"Project Owner"})["status"],"approved")
    db.commit()
    self.assertTrue(server.verify(db)["valid"])
    self.assertEqual(db.execute("SELECT count(*) FROM events WHERE kind LIKE 'research.%'").fetchone()[0],13)
if __name__=="__main__":unittest.main()
