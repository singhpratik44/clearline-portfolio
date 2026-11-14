import sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import server, lifecycle
class LifecycleTest(unittest.TestCase):
 def test_full_lifecycle(self):
  with tempfile.TemporaryDirectory() as tmp:
   server.DB=Path(tmp)/"test.sqlite3"
   with server.connect() as db:
    server.import_registry(db)
    lifecycle.initialize(db)
    pid=db.execute("SELECT id FROM projects LIMIT 1").fetchone()[0]
    for action,payload,expected in [
      ("plan",{"title":"APERTURE project audit","acceptance":["Evidence verified"]},"planned"),
      ("ready",{},"ready"),("execute",{},"executed"),("evidence",{},"evidenced"),
      ("review",{"decision":"approve","reviewer":"Project Owner"},"reviewed"),
      ("complete",{},"completed")]:
     db.execute("BEGIN IMMEDIATE")
     state=lifecycle.transition(db,pid,action,payload)
     db.commit()
     self.assertEqual(state["stage"],expected)
    self.assertTrue(server.verify(db)["valid"])
    self.assertEqual(db.execute("SELECT count(*) FROM execution_jobs WHERE project_id=?",(pid,)).fetchone()[0],1)
 def test_cannot_skip_review(self):
  with tempfile.TemporaryDirectory() as tmp:
   server.DB=Path(tmp)/"test.sqlite3"
   with server.connect() as db:
    server.import_registry(db)
    lifecycle.initialize(db)
    pid=db.execute("SELECT id FROM projects LIMIT 1").fetchone()[0]
    with self.assertRaises(ValueError):lifecycle.transition(db,pid,"complete")
if __name__=="__main__":unittest.main()
