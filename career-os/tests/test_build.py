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
        output = builder.build_html('const CONFIG=__CONFIG_JSON__;', config)
        self.assertNotIn("</script>", output)
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
            self.assertTrue((root / "demos" / "test-director" / "outreach.md").exists())
            email = (root / "demos" / "test-director" / "outreach.md").read_text()
            self.assertIn("NOT SENT", email)
            self.assertIn("VERIFY", email.upper())
            self.assertIn("test-director", (root / "registry.html").read_text())
            self.assertTrue((root / "manifest.json").exists())

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

    def test_all_repository_specs_validate(self):
        specs = sorted((SOURCE / "jobs").glob("*.json"))
        self.assertGreaterEqual(len(specs), 2)
        for path in specs:
            builder.validate(json.loads(path.read_text()), path.name)

if __name__ == "__main__":
    unittest.main()
