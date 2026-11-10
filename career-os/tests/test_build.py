"""Tests that protect APERTURE's build, evidence labels and sending boundary."""
import importlib.util
import json
import re
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("builder", SOURCE / "engine" / "build.py")
builder = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(builder)

SAMPLE = {
    "id": "test-director", "company": "Sample Org", "title": "Program Director",
    "location": "Remote", "link": "https://example.org/jobs/123",
    "thesis": "Improve execution and measurement with documented safeguards.",
    "requirements": ["Program outcomes", "Stakeholder coordination", "Budget stewardship"],
    "phases": [["Establish baseline", "Baseline evidence register"],
               ["Pilot change", "Pilot experiment and process map"],
               ["Review outcomes", "Leadership outcomes report"]],
    "source": "Candidate-supplied example, not independently verified",
    "status": "Example only — verify current opening"
}

class BuildTests(unittest.TestCase):
    def test_escape_keeps_user_html_inside_script_data(self):
        record = dict(SAMPLE)
        record["title"] = '</script><script>alert("unsafe")</script>'
        config = builder.validate(record, "test.json")
        shell = '<!doctype html><html><body><script>const CONFIG=__CONFIG_JSON__;</script></body></html>'
        output = builder.build_html(shell, config)
        self.assertEqual(output.count("</script>"), 1)
        self.assertNotIn('</script><script>alert("unsafe")</script>', output)
        self.assertIn(r"\u003c/script\u003e", output)

    def test_links_are_https_only(self):
        for url in ["javascript:alert(1)", "http://example.org", "https://user:pass@example.com/"]:
            record = dict(SAMPLE, link=url)
            with self.assertRaises(builder.InvalidJob):
                builder.validate(record, "test.json")

    def test_build_creates_site_email_manifest_and_registry(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / "jobs").mkdir()
            (root / "engine").mkdir()
            shutil.copy(SOURCE / "engine" / "prototype_shell.html", root / "engine" / "prototype_shell.html")
            (root / "jobs" / "sample.json").write_text(json.dumps(SAMPLE))
            registry = builder.build_all(root)
            self.assertEqual(registry["count"], 1)
            site = (root / "demos" / "test-director" / "index.html").read_text()
            self.assertIn("Program Director", site)
            self.assertIn("Illustrative", site)
            self.assertNotIn("__CONFIG_JSON__", site)
            self.assertEqual(site.count("<script>"), 1)
            self.assertEqual(site.count("</script>"), 1)
            self.assertEqual(site.count("</html>"), 1)
            self.assertTrue(site.rstrip().endswith("</body></html>"))
            self.assertEqual(site[site.index("</script>") + len("</script>"):], "</body></html>")
            self.assertTrue((root / "demos" / "test-director" / "outreach.md").exists())
            email = (root / "demos" / "test-director" / "outreach.md").read_text()
            self.assertIn("NOT SENT", email)
            self.assertIn("VERIFY", email.upper())
            self.assertIn("test-director", (root / "registry.html").read_text())
            self.assertTrue((root / "manifest.json").exists())

    def test_rejects_raw_script_leak_after_page_footer(self):
        shell = (SOURCE / "engine" / "prototype_shell.html").read_text()
        good = builder.validate(SAMPLE, "test.json")
        malformed = shell + "console.log('should not appear');</script></body></html>"
        with self.assertRaisesRegex(RuntimeError, "Malformed prototype shell"):
            builder.build_html(malformed, good)

    def test_generated_javascript_parses_if_node_available(self):
        if not shutil.which("node"):
            self.skipTest("Node not installed")
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / "jobs").mkdir()
            (root / "engine").mkdir()
            shutil.copy(SOURCE / "engine" / "prototype_shell.html", root / "engine" / "prototype_shell.html")
            (root / "jobs" / "sample.json").write_text(json.dumps(SAMPLE))
            builder.build_all(root)
            site = (root / "demos" / "test-director" / "index.html").read_text()
            scripts = re.findall(r"<script>([\s\S]*?)</script>", site)
            self.assertEqual(len(scripts), 1)
            proc = subprocess.run(["node", "--check"], input=scripts[0], text=True, capture_output=True)
            self.assertEqual(proc.returncode, 0, proc.stderr)

    def test_employer_needs_require_source_and_tailored_traceability(self):
        record = dict(SAMPLE, needs_status="posting-reviewed", needs_reviewed_on="2026-11-09")
        with self.assertRaisesRegex(builder.InvalidJob, "at least two"):
            builder.validate(record, "test.json")
        need = {
            "need": "Keep school customers engaged",
            "basis": "job-posting",
            "source_url": "https://example.org/jobs/123",
            "prototype_feature": "Role-specific retention monitor",
            "success_metric": "Customer retention",
            "candidate_fit": "STEM program leadership is transferable; direct SaaS ownership unverified",
            "open_question": "What is the baseline retention rate?"
        }
        record["employer_needs"] = [need, dict(need, need="Improve school onboarding", prototype_feature="Onboarding curriculum planner")]
        valid = builder.validate(record, "test.json")
        self.assertEqual(valid["needs_status"], "posting-reviewed")
        self.assertEqual(len(valid["employer_needs"]), 2)
        email = builder.write_outreach(valid, "career-os/demos/test-director/")
        self.assertIn("Keep school customers engaged", email)
        self.assertIn("Role-specific retention monitor", email)
        record["employer_needs"][0]["source_url"] = "javascript:alert(1)"
        with self.assertRaises(builder.InvalidJob):
            builder.validate(record, "test.json")

    def test_unreviewed_needs_do_not_claim_verified_employer_fit(self):
        job = builder.validate(SAMPLE, "test.json")
        email = builder.write_outreach(job, "career-os/demos/test-director/")
        self.assertIn("not been independently confirmed", email)
        self.assertEqual(job["needs_status"], "not-reviewed")

    def test_all_repository_specs_validate(self):
        specs = sorted((SOURCE / "jobs").glob("*.json"))
        self.assertGreaterEqual(len(specs), 2)
        for path in specs:
            raw = json.loads(path.read_text())
            if raw.get("schema_version") == 1 and raw.get("status") == "research_only_not_application_ready":
                self.assertEqual(raw["prototype"]["state"], "not_built")
                continue
            builder.validate(raw, path.name)

if __name__ == "__main__":
    unittest.main()
