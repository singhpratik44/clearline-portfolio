"""Run: python3 -m unittest discover -s project-control -p 'test_*.py'"""
import os,sys,tempfile,unittest,sqlite3
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import server
class Lifecycle(unittest.TestCase):
 def test_import_dependency_review_verify_and_immutability(self):
  with tempfile.TemporaryDirectory() as tmp:
   server.DB=Path(tmp)/"projects.db"
   with server.connect() as db:
    server.import_registry(db)
    count=db.execute("SELECT count(*) FROM projects").fetchone()[0]
    self.assertEqual(count,23)
    self.assertTrue(server.verify(db)["valid"])
    ids=[x[0] for x in db.execute("SELECT id FROM projects ORDER BY id LIMIT 2")]
    a,b=ids
    db.execute("BEGIN IMMEDIATE")
    self.assertFalse(server.has_cycle(db,a,b))
    db.execute("INSERT INTO dependencies VALUES(?,?)",(a,b))
    server.append(db,a,"dependency.added",{"depends_on":b})
    db.commit()
    self.assertTrue(server.has_cycle(db,b,a))
    db.execute("BEGIN IMMEDIATE")
    server.append(db,a,"review.requested",{"approval":"pending","release":"blocked"})
    db.commit()
    self.assertTrue(server.verify(db)["valid"])
    self.assertEqual(db.execute("SELECT count(*) FROM events").fetchone()[0],25)
    with self.assertRaises(sqlite3.DatabaseError):db.execute("DELETE FROM events WHERE seq=1")
    with self.assertRaises(sqlite3.DatabaseError):db.execute("UPDATE events SET kind='forged' WHERE seq=1")
    self.assertEqual(db.execute("SELECT stage FROM projects WHERE id=?",(a,)).fetchone()[0],"imported")
if __name__=="__main__":unittest.main()
