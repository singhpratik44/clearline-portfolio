#!/usr/bin/env python3
"""Refresh APERTURE Sports' curated opportunities with strict, read-only source gates.

No untrusted URLs, applicant data, accounts, email, or submissions.
Exact employer Greenhouse ATS IDs are checked; portals and non-ATS listings
are never mislabeled confirmed. Errors mean REVIEW, not "open" or "closed".
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
TRUSTED_BOARDS = {"monumentalsports", "goldenstate", "thefloridapanthers"}
ALLOWED_HOSTS = {
    "job-boards.greenhouse.io",
    "workforcenow.adp.com",
    "www.teamworkonline.com",
    "careers.nba.com"
}
STATUS = {"confirmed-active", "not-found", "review-required"}
MAX_LISTINGS = 25


def normalized_title(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def validate_source(record: dict) -> None:
    from urllib.parse import urlsplit
    if not isinstance(record, dict) or not isinstance(record.get("id"), str):
        raise ValueError("Invalid opportunity entry")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", record["id"]):
        raise ValueError("Invalid entry identifier")
    for field in ["title", "employer", "category", "location", "official_url"]:
        if not isinstance(record.get(field), str) or not record[field].strip():
            raise ValueError("Missing required source field: " + field)
    url = urlsplit(record["official_url"])
    if url.scheme != "https" or url.username or url.password or url.hostname not in ALLOWED_HOSTS:
        raise ValueError("Source URL must use a vetted HTTPS hostname")
    source = record.get("source_type")
    if source == "greenhouse":
        board = record.get("board")
        jobid = record.get("job_id")
        if board not in TRUSTED_BOARDS or not isinstance(jobid, int) or jobid <= 0:
            raise ValueError("Unapproved greenhouse board or job ID")
        if url.hostname != "job-boards.greenhouse.io":
            raise ValueError("Employer application must link to approved Greenhouse host")
        if url.path.rstrip("/") != f"/{board}/jobs/{jobid}":
            raise ValueError("Application URL and ATS job ID do not match")
    elif source not in {"manual", "directory"}:
        raise ValueError("Unsupported source type")
    if not isinstance(record.get("requirements"), list):
        raise ValueError("Requirements must be a list")
    if not isinstance(record.get("skill_tags"), list):
        raise ValueError("Skill tags must be a list")


def fetch_greenhouse(board: str, job_id: int, *, timeout: int = 12) -> dict:
    """Only curated board/ID pairs are accepted; no arbitrary URL fetch."""
    if board not in TRUSTED_BOARDS or type(job_id) is not int or job_id <= 0:
        raise ValueError("Invalid ATS identity")
    url = f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs/{job_id}"
    request = Request(url, headers={"User-Agent": "APERTURE-Sports-ReadOnly/2.0", "Accept": "application/json"})
    with urlopen(request, timeout=timeout) as response:
        if response.status != 200:
            raise URLError("Unexpected ATS status")
        data = response.read(750_000)
    payload = json.loads(data.decode("utf-8"))
    if not isinstance(payload, dict):
        raise ValueError("Unexpected ATS response")
    return payload


def classify(record: dict, *, offline=False, transport=fetch_greenhouse, now=None) -> dict:
    validate_source(record)
    item = {
        k: v for k, v in record.items()
        if k not in {"status", "checked_at", "verified_at", "verification_note"}
    }
    now = now or datetime.now(timezone.utc).isoformat(timespec="seconds")
    item.update(status="review-required", checked_at=now, verified_at=None,
                verification_note="Not independently confirmed; open official source and recheck before applying.")
    if item["source_type"] != "greenhouse":
        item["verification_note"] = "Official portal or directory only; not an individually confirmed active opening."
        return item
    if offline:
        item["verification_note"] = "Offline build: ATS availability not checked."
        return item
    try:
        response = transport(item["board"], item["job_id"])
    except HTTPError as error:
        if error.code == 404:
            item["status"] = "not-found"
            item["verification_note"] = "Exact requisition not returned by employer ATS (404); do not apply without rechecking."
        else:
            item["verification_note"] = "ATS check inconclusive (HTTP error); status requires review."
        return item
    except (URLError, OSError, TimeoutError, ValueError, json.JSONDecodeError):
        item["verification_note"] = "ATS unavailable or response invalid; status requires review."
        return item
    if (
        response.get("id") == item["job_id"]
        and normalized_title(str(response.get("title", ""))) == normalized_title(item["title"])
        and isinstance(response.get("absolute_url"), str)
        and "greenhouse.io" in response["absolute_url"]
    ):
        item["status"] = "confirmed-active"
        item["verified_at"] = now
        item["verification_note"] = "Exact requisition ID and title matched employer's public structured ATS at the indicated time; may change."
    else:
        item["verification_note"] = "Employer ATS identity or title did not match; manual review required."
    return item


def refresh(source: dict, *, offline=False, transport=fetch_greenhouse, now=None) -> dict:
    if source.get("schema_version") != 2 or not isinstance(source.get("listings"), list):
        raise ValueError("Invalid source catalog")
    records = source["listings"]
    if not 1 <= len(records) <= MAX_LISTINGS:
        raise ValueError("Catalog exceeds bounds")
    seen = set()
    out = []
    for record in records:
        candidate = classify(record, offline=offline, transport=transport, now=now)
        if candidate["id"] in seen:
            raise ValueError("Duplicate opportunity identifier")
        seen.add(candidate["id"])
        out.append(candidate)
    return {
        "schema_version": 2,
        "generated_at": now or datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "method": "Exact public ATS ID/title checks where available; all other links marked REVIEW",
        "notice": "Public research only. Check official posting again; APERTURE does not apply or contact employers.",
        "summary": {
            "total": len(out),
            "confirmed_active": sum(x["status"] == "confirmed-active" for x in out),
            "needs_review": sum(x["status"] == "review-required" for x in out),
            "not_found": sum(x["status"] == "not-found" for x in out),
        },
        "listings": out
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=ROOT / "sources.json")
    parser.add_argument("--output", type=Path, default=ROOT / "opportunities.json")
    parser.add_argument("--offline", action="store_true",
                        help="Generate cautious review-required records without calling external APIs")
    args = parser.parse_args()
    payload = json.loads(args.source.read_text(encoding="utf-8"))
    outcome = refresh(payload, offline=args.offline)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(outcome, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("APERTURE Sports opportunities:", json.dumps(outcome["summary"], sort_keys=True))


if __name__ == "__main__":
    main()
