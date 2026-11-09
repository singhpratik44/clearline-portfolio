#!/usr/bin/env python3
"""APERTURE Career OS: conservative, read-only verification of role and live demo.

No mail credentials, job submissions, applicant personal data, or auto-send.
A website/ATS HTTP response is evidence of public availability, NOT hiring approval.
"""
from __future__ import annotations

import argparse
from datetime import date, datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://singhpratik44.github.io/clearline-portfolio/"
MAX_BYTES = 2_000_000
USER_AGENT = "APERTURE-Career-OS-ReadOnlyVerifier/1.0 (public job and site checks)"
ALLOWED_ATS = {"jobs.lever.co", "jobs.ashbyhq.com"}
NEEDS_MAX_AGE_DAYS = 14


def stamp():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def item(state, reason, url=""):
    return {"state": state, "reason": reason, "url": url}


def safe_get(url, opener=urlopen):
    """Only fetch HTTPS URLs on a short allowlist, never arbitrary user-supplied hosts."""
    parsed = urlparse(url)
    allowed = ALLOWED_ATS | {"api.lever.co", "api.ashbyhq.com", "singhpratik44.github.io"}
    if parsed.scheme != "https" or parsed.hostname not in allowed or parsed.username or parsed.password:
        raise ValueError("Host not allowlisted for network verification")
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json,text/html"})
    try:
        with opener(request, timeout=12) as response:
            # urllib handles redirects: check that the final host is still allowlisted.
            final = urlparse(response.geturl())
            if final.scheme != "https" or final.hostname not in allowed:
                raise ValueError("Redirect left allowed public hosts")
            body = response.read(MAX_BYTES + 1)
            if len(body) > MAX_BYTES:
                raise ValueError("Response too large")
            return response.status, body.decode("utf-8", errors="replace")
    except HTTPError as exc:
        return exc.code, ""


def live_listing(job, fetch=safe_get):
    url = job.get("link", "")
    if not url:
        return item("review", "No employer job requisition URL provided")
    parts = urlparse(url)
    if parts.hostname not in ALLOWED_ATS:
        return item("review", "ATS not yet supported by verified listing adapter; manually inspect the official posting", url)
    segments = [s for s in parts.path.split("/") if s]
    if len(segments) < 2:
        return item("review", "Job URL does not contain a concrete requisition ID", url)
    employer, job_id = segments[0], segments[1]
    try:
        if parts.hostname == "jobs.lever.co":
            endpoint = f"https://api.lever.co/v0/postings/{employer}/{job_id}"
            status, body = fetch(endpoint)
            if status in {404, 410}:
                return item("blocked", "Employer's public Lever posting API no longer lists this requisition", url)
            if status != 200:
                return item("review", f"Lever posting API returned {status}; not treated as closed", url)
            doc = json.loads(body)
            if isinstance(doc, dict) and str(doc.get("id", "")).lower() == job_id.lower():
                return item("confirmed", "Exact requisition ID found in employer Lever API; eligibility and hiring status still need human review", url)
            return item("review", "Lever response did not identify the exact job", url)

        if parts.hostname == "jobs.ashbyhq.com":
            endpoint = f"https://api.ashbyhq.com/posting-api/job-board/{employer}"
            status, body = fetch(endpoint)
            if status != 200:
                return item("review", f"Ashby public job board API returned {status}; not treated as closed", url)
            doc = json.loads(body)
            postings = doc.get("jobs") if isinstance(doc, dict) else None
            if not isinstance(postings, list):
                return item("review", "Ashby response did not return a structured jobs list", url)
            matches = []
            for posting in postings:
                if not isinstance(posting, dict):
                    continue
                urls = [str(posting.get(k, "")) for k in ("jobUrl", "applyUrl", "jobPostingUrl", "url")]
                if any(job_id.lower() in u.lower() for u in urls) or job_id.lower() == str(posting.get("id", "")).lower():
                    matches.append(posting)
            if len(matches) == 1:
                return item("confirmed", "Exact requisition ID found in current employer Ashby job board API; not proof an application was filed", url)
            if not matches:
                return item("blocked", "Exact job requisition ID absent from current employer Ashby jobs list", url)
            return item("review", "Ambiguous duplicate requisition IDs in Ashby board", url)
    except (ValueError, URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
        return item("review", f"ATS verification unavailable ({type(exc).__name__}); do not assert vacancy open or closed", url)
    return item("review", "No verification adapter for this ATS", url)


def needs_check(job, today=None):
    today = today or date.today()
    needs = job.get("employer_needs", [])
    state = job.get("needs_status", "not-reviewed")
    if state != "posting-reviewed" or len(needs) < 2:
        return item("review", "Employer-needs analysis not independently completed or requires reverification")
    try:
        reviewed = date.fromisoformat(job.get("needs_reviewed_on", ""))
        age = (today - reviewed).days
    except (TypeError, ValueError):
        return item("review", "Needs review date absent or invalid")
    if age < 0 or age > NEEDS_MAX_AGE_DAYS:
        return item("review", f"Needs evidence is {age} days old, outside the 14-day confirmation window")
    sourced = [n for n in needs if n.get("basis") == "job-posting" and n.get("source_url")]
    if not sourced:
        return item("review", "No job-posting-backed employer need")
    if any(not n.get("prototype_feature") or not n.get("success_metric") or not n.get("candidate_fit") for n in needs):
        return item("review", "Needs-to-prototype traceability is incomplete")
    return item("confirmed", f"{len(sourced)} posting-backed needs with traceable proposed features; external content still requires review")


def local_artifacts(root, job):
    demo = root / "demos" / job["id"]
    html_file, report_file, draft_file = (demo / n for n in ("index.html", "build-report.json", "outreach.md"))
    if not all(p.is_file() for p in (html_file, report_file, draft_file)):
        return item("blocked", "Generated demo, build report or outreach draft missing")
    try:
        html_body = html_file.read_bytes()
        report = json.loads(report_file.read_text(encoding="utf-8"))
        draft = draft_file.read_text(encoding="utf-8")
        actual_sha = hashlib.sha256(html_body).hexdigest()
        if actual_sha != report.get("site_sha256"):
            return item("blocked", "Local demo SHA-256 differs from generated build-report checksum")
        if job["id"] not in html_body.decode("utf-8") or b"__CONFIG_JSON__" in html_body:
            return item("blocked", "Generated HTML is missing correct role identity or includes unresolved placeholder")
        if "DRAFT ONLY" not in draft or "NOT SENT" not in draft:
            return item("blocked", "Outreach draft is missing NOT SENT guardrail")
    except (UnicodeError, OSError, ValueError, json.JSONDecodeError):
        return item("blocked", "Unable to parse locally generated demo or report")
    return item("confirmed", "Local demo checksum, role identity, build report and unsent outreach draft verified")


def live_demo(job, fetch=safe_get):
    link = SITE + f"career-os/demos/{job['id']}/"
    try:
        status, body = fetch(link)
        if status != 200:
            return item("review", f"Deployed Pages returned HTTP {status}; may lag GitHub build", link)
        if job["id"] not in body or "__CONFIG_JSON__" in body or "<script>" not in body:
            return item("blocked", "Public page loaded but its job identity, script or configuration was invalid", link)
        if "not employer data" not in body.lower() and "simulated" not in body.lower():
            return item("blocked", "Public demo does not disclose simulated data", link)
        return item("confirmed", "Public GitHub Pages HTML reachable with correct role identity and simulation disclosure", link)
    except (ValueError, URLError, TimeoutError, OSError):
        return item("review", "Could not reach public GitHub Pages demo; do not assume deployment success", link)


def duplicate_keys(jobs):
    found = {}
    result = set()
    for job in jobs:
        link = job.get("link", "").lower().rstrip("/")
        key = (job.get("company", "").lower().strip(), job.get("title", "").lower().strip())
        for candidate in [("role", key), ("link", link) if link else None]:
            if candidate is None:
                continue
            if candidate in found:
                result.add(job["id"])
                result.add(found[candidate])
            else:
                found[candidate] = job["id"]
    return result


def verify_all(root=ROOT, fetch=safe_get, today=None):
    job_files = sorted((root / "jobs").glob("*.json"))
    jobs = [json.loads(p.read_text(encoding="utf-8")) for p in job_files]
    duplicates = duplicate_keys(jobs)
    entries = []
    for job in jobs:
        job_id = job["id"]
        local = local_artifacts(root, job)
        live = live_demo(job, fetch=fetch)
        needs = needs_check(job, today=today)
        posting = live_listing(job, fetch=fetch)
        dedupe = item("blocked", "Role or application URL duplicates another local specification") if job_id in duplicates else item("confirmed", "No duplicate job specification found")
        # Sending requires a verified recipient and explicit approval in connected Gmail;
        # this stateless public checker has neither, and MUST never report sent.
        communication = item("review", "Sender, recipient, Gmail Sent confirmation and ATS submission require connected account verification")
        ready = all(x["state"] == "confirmed" for x in (posting, live, needs, local, dedupe))
        entries.append({
            "id": job_id, "company": job["company"], "title": job["title"],
            "posting": posting, "employer_needs": needs, "local_build": local,
            "published_demo": live, "deduplication": dedupe, "outreach": communication,
            "ready_for_human_outreach_review": ready,
            "email_sent": "unverified", "application_submitted": "unverified"
        })
    return {
        "schema_version": 1, "generated_at": stamp(),
        "method": "Independent public ATS API and GitHub Pages checks; no private accounts accessed",
        "automation": "read-only; does not email, apply, or attest human approval",
        "summary": {
            "roles_checked": len(entries),
            "verified_for_review": sum(x["ready_for_human_outreach_review"] for x in entries),
            "posting_blocked": sum(x["posting"]["state"] == "blocked" for x in entries),
            "needs_review": sum(x["employer_needs"]["state"] != "confirmed" for x in entries),
            "demo_not_confirmed": sum(x["published_demo"]["state"] != "confirmed" for x in entries)
        },
        "jobs": entries,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=str(ROOT), help="career-os directory")
    parser.add_argument("--output", default="verification.json", help="output relative to career-os directory")
    parser.add_argument("--offline", action="store_true", help="avoid all HTTP checks and mark live confirmations as requiring review")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    if args.offline:
        def offline(url):
            raise URLError("offline verification requested")
        report = verify_all(root, fetch=offline)
    else:
        report = verify_all(root)
    output = root / args.output
    output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
