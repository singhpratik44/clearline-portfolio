import unittest
from copy import deepcopy
from pathlib import Path
import json
import sys
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
from refresh_opportunities import refresh, classify, validate_source

SOURCE = json.loads((ROOT / "sources.json").read_text(encoding="utf-8"))
DATE = "2026-11-10T21:00:00+00:00"


class OpportunityRefreshTests(unittest.TestCase):
    def test_catalog_is_bounded_and_all_hosts_are_reviewed(self):
        self.assertEqual(SOURCE["schema_version"], 2)
        self.assertGreaterEqual(len(SOURCE["listings"]), 4)
        for job in SOURCE["listings"]:
            validate_source(job)

    def test_offline_never_claims_active_vacancy(self):
        data = refresh(SOURCE, offline=True, now=DATE)
        self.assertEqual(data["summary"]["confirmed_active"], 0)
        self.assertEqual(data["summary"]["needs_review"], len(SOURCE["listings"]))
        self.assertTrue(all(x["verified_at"] is None for x in data["listings"]))

    def test_exact_ats_match_is_only_confirmed_success(self):
        job = SOURCE["listings"][0]
        response = {"id": job["job_id"], "title": job["title"],
                    "absolute_url": job["official_url"]}
        item = classify(job, transport=lambda board, job_id: response, now=DATE)
        self.assertEqual(item["status"], "confirmed-active")
        self.assertEqual(item["verified_at"], DATE)

    def test_wrong_id_and_title_cannot_pass(self):
        job = SOURCE["listings"][0]
        for response in [
            {"id": job["job_id"] + 1, "title": job["title"],
             "absolute_url": job["official_url"]},
            {"id": job["job_id"], "title": "Different Position",
             "absolute_url": job["official_url"]},
            {"id": job["job_id"], "title": job["title"],
             "absolute_url": "https://attacker.example/job"},
        ]:
            item = classify(job, transport=lambda *_: response, now=DATE)
            self.assertEqual(item["status"], "review-required")
            self.assertIsNone(item["verified_at"])

    def test_404_is_not_a_confirmed_opening(self):
        job = SOURCE["listings"][0]
        def not_found(*_):
            raise HTTPError("https://boards-api.greenhouse.io/test", 404, "Not found", None, None)
        item = classify(job, transport=not_found, now=DATE)
        self.assertEqual(item["status"], "not-found")
        self.assertIsNone(item["verified_at"])

    def test_network_failure_is_review_not_closed(self):
        job = SOURCE["listings"][0]
        def unavailable(*_):
            raise URLError("service timeout")
        item = classify(job, transport=unavailable, now=DATE)
        self.assertEqual(item["status"], "review-required")
        self.assertIsNone(item["verified_at"])

    def test_portals_are_never_marked_individual_active_roles(self):
        for job in SOURCE["listings"]:
            if job["source_type"] in ("manual", "directory"):
                item = classify(job, transport=lambda *_: self.fail("Must not query"), now=DATE)
                self.assertEqual(item["status"], "review-required")

    def test_source_urls_are_allowlisted(self):
        changed = deepcopy(SOURCE["listings"][0])
        changed["official_url"] = "https://attacker.example/phishing"
        with self.assertRaises(ValueError):
            validate_source(changed)
        changed = deepcopy(SOURCE["listings"][0])
        changed["board"] = "somethingelse"
        with self.assertRaises(ValueError):
            validate_source(changed)

    def test_duplicate_ids_are_rejected(self):
        duplicate = deepcopy(SOURCE)
        duplicate["listings"].append(deepcopy(duplicate["listings"][0]))
        with self.assertRaises(ValueError):
            refresh(duplicate, offline=True, now=DATE)


if __name__ == "__main__":
    unittest.main()
