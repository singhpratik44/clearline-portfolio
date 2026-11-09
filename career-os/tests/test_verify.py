"""Regression tests for read-only confirmation and truthful readiness states."""
from __future__ import annotations
from datetime import date
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

BASE = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("career_verify", BASE / "engine" / "verify.py")
verify = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(verify)

EXAMPLE = {
    "id": "example-customer-success", "company": "Example Org",
    "title": "Customer Success Manager", "link": "https://jobs.ashbyhq.com/example/aa11bb22",
    "needs_status": "posting-reviewed", "needs_reviewed_on": "2026-11-09",
    "employer_needs": [
        {"basis": "job-posting", "source_url": "https://jobs.ashbyhq.com/example/aa11bb22",
         "prototype_feature": "Customer health model", "success_metric": "Retention",
         "candidate_fit": "Program leadership, enterprise software skill gap"},
        {"basis": "job-posting", "source_url": "https://jobs.ashbyhq.com/example/aa11bb22",
         "prototype_feature": "Adoption simulation", "success_metric": "Activation",
         "candidate_fit": "Curriculum experience, lacks exact product history"}
    ]
}


class AutoConfirmationTests(unittest.TestCase):
    def test_ashby_confirms_only_exact_job(self):
        def good(url):
            self.assertIn("posting-api", url)
            return 200, json.dumps({"jobs": [{"id": "aa11bb22", "jobUrl": EXAMPLE["link"], "title": EXAMPLE["title"]}]})
        self.assertEqual(verify.live_listing(EXAMPLE, good)["state"], "confirmed")

        def missing(url):
            return 200, json.dumps({"jobs": [{"id": "another", "jobUrl": "https://jobs.ashbyhq.com/example/another"}]})
        self.assertEqual(verify.live_listing(EXAMPLE, missing)["state"], "blocked")

    def test_ashby_does_not_mark_transient_error_closed(self):
        self.assertEqual(verify.live_listing(EXAMPLE, lambda url: (403, ""))["state"], "review")
        self.assertEqual(verify.live_listing(EXAMPLE, lambda url: (500, ""))["state"], "review")
        self.assertEqual(verify.live_listing(EXAMPLE, lambda url: (200, "<html>Enable JS</html>"))["state"], "review")

    def test_lever_confirms_only_matching_id(self):
        ex = dict(EXAMPLE, link="https://jobs.lever.co/example/xyz123")
        self.assertEqual(verify.live_listing(ex, lambda url: (200, json.dumps({"id": "xyz123"})))["state"], "confirmed")
        self.assertEqual(verify.live_listing(ex, lambda url: (200, json.dumps({"id": "different"})))["state"], "review")
        self.assertEqual(verify.live_listing(ex, lambda url: (404, ""))["state"], "blocked")

    def test_unknown_host_is_not_fetched(self):
        ex = dict(EXAMPLE, link="https://private.local/internal")
        def never(url):
            self.fail("Network should not be called for unknown host")
        self.assertEqual(verify.live_listing(ex, never)["state"], "review")

    def test_needs_freshness_and_missing_provenance(self):
        self.assertEqual(verify.needs_check(EXAMPLE, today=date(2026, 11, 10))["state"], "confirmed")
        self.assertEqual(verify.needs_check(EXAMPLE, today=date(2026, 12, 10))["state"], "review")
        example = dict(EXAMPLE, needs_status="needs-reverification")
        self.assertEqual(verify.needs_check(example, today=date(2026, 11, 10))["state"], "review")
        example = dict(EXAMPLE, employer_needs=[])
        self.assertEqual(verify.needs_check(example, today=date(2026, 11, 10))["state"], "review")

    def test_duplicate_job_and_url_are_flagged(self):
        clone = dict(EXAMPLE, id="copy-of-role")
        self.assertEqual(verify.duplicate_keys([EXAMPLE, clone]), {"example-customer-success", "copy-of-role"})
        independent = dict(EXAMPLE, id="distinct", company="Other", title="Program Manager", link="https://jobs.ashbyhq.com/other/zz")
        self.assertEqual(verify.duplicate_keys([EXAMPLE, independent]), set())

    def test_public_demo_must_include_config_identity_and_disclosure(self):
        def good(url):
            return 200, "<html><script>const CONFIG={id:'example-customer-success'};</script>Simulated data</html>"
        self.assertEqual(verify.live_demo(EXAMPLE, good)["state"], "confirmed")
        self.assertEqual(verify.live_demo(EXAMPLE, lambda url: (200, "<script>Other job</script>"))["state"], "blocked")
        self.assertEqual(verify.live_demo(EXAMPLE, lambda url: (404, ""))["state"], "review")

    def test_real_send_never_confirmed_by_public_checks(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "jobs").mkdir()
            (root / "jobs" / "example.json").write_text(json.dumps(EXAMPLE))
            result = verify.verify_all(root, fetch=lambda url: (500, ""), today=date(2026, 11, 10))
            self.assertEqual(result["summary"]["roles_checked"], 1)
            self.assertEqual(result["summary"]["verified_for_review"], 0)
            self.assertEqual(result["jobs"][0]["email_sent"], "unverified")
            self.assertEqual(result["jobs"][0]["application_submitted"], "unverified")
            self.assertFalse(result["jobs"][0]["ready_for_human_outreach_review"])

if __name__ == "__main__":
    unittest.main()
