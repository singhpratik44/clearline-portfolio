import importlib.util
import json
import pathlib
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
PATH=ROOT/"commercial-4d"/"research-discovery.py"
SPEC=importlib.util.spec_from_file_location("aperture_research_discovery",PATH)
M=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(M)

class ResearchDiscoveryTests(unittest.TestCase):
    def test_atom_exposes_versions_dates_and_abstract(self):
        xml=b"""<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
          <entry><id>http://arxiv.org/abs/2610.14800v2</id><title>Enterprise agents and planning</title>
          <published>2026-10-10T09:00:00Z</published><updated>2026-10-12T09:00:00Z</updated>
          <summary>Testable resource constraints.</summary></entry></feed>"""
        x=M.parse_arxiv(xml)
        self.assertEqual(len(x),1)
        self.assertEqual(x[0]["version"],"v2")
        self.assertEqual(x[0]["date"],"2026-10-10")
        self.assertEqual(x[0]["updated_at"],"2026-10-12")
        self.assertTrue(x[0]["needs_human_review"])
        self.assertEqual(x[0]["publication_type"],"preprint")

    def test_openreview_venue_is_not_misreported_as_acceptance(self):
        blob=json.dumps({"notes":[{"id":"abc123","content":{"title":{"value":"Planning agents"},"abstract":{"value":"Test abstract."},"venue":{"value":"Submitted"}},"pdate":1790900000000}]}).encode()
        x=M.parse_openreview(blob)
        self.assertEqual(x[0]["review_status"],"unverified")
        self.assertIn("openreview.net/forum?id=abc123",x[0]["url"])
        self.assertEqual(x[0]["venue"],"Submitted")

    def test_hf_and_paperswithcode_remain_discovery_sources(self):
        blob=json.dumps([{"paper":{"id":"2610.14800","title":"Enterprise Planning Agents","publishedAt":"2026-10-11","summary":"Signals."}}]).encode()
        x=M.parse_huggingface(blob)
        self.assertEqual(x[0]["arxiv_id"],"2610.14800")
        self.assertEqual(x[0]["publication_type"],"paper_discovery_mirror")
        pc=json.dumps({"results":[{"id":"sample","title":"Test Agent Plan","url":"https://paperswithcode.co/paper/sample","published":"2026-10-12"}]}).encode()
        y=M.parse_paperswithcode(pc)
        self.assertEqual(y[0]["date"],"2026-10-12")
        self.assertTrue(y[0]["needs_human_review"])

    def test_rss_and_icml_publication_class(self):
        feed=b"<rss><channel><item><title>Agent evaluations</title><link>https://www.langchain.com/blog/test</link><pubDate>Mon, 09 Nov 2026 10:00:00 GMT</pubDate><description>Eval design</description></item></channel></rss>"
        x=M.parse_rss(feed)
        self.assertEqual(x[0]["date"],"2026-11-09")
        self.assertIn("not_peer_reviewed",x[0]["publication_type"])
        p=M.parse_icml(b'<html><a href="/v306/liu26az.html">CoPE: A Framework for Optimizing Coordination</a></html>')
        self.assertEqual(len(p),1)
        self.assertEqual(p[0]["publication_type"],"conference_proceeding")

    def test_whitelist_prevents_arbitrary_network_fetch(self):
        with self.assertRaises(ValueError):
            M.fetch_bytes("http://example.com")
        with self.assertRaises(ValueError):
            M.fetch_bytes("https://mail.google.com/mail/u/0/")
        with self.assertRaises(ValueError):
            M.fetch_bytes("https://arxiv.org/private")

    def test_undated_not_treated_as_recent(self):
        self.assertIsNone(M.as_date(None))
        self.assertIsNone(M.as_date("a mystery"))
        self.assertEqual(M.as_date("2026-10-28T18:00:00Z"),"2026-10-28")

if __name__=="__main__":
    unittest.main()
