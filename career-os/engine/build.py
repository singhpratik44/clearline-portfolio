#!/usr/bin/env python3
"""APERTURE Career OS: deterministic, evidence-labeled multi-job prototype builder.

Inputs: career-os/jobs/*.json
Outputs: career-os/demos/<job-id>/index.html, outreach.md, build-report.json,
         career-os/manifest.json, career-os/registry.html
No network, credentials, background messaging, or employer-system access.
"""
from __future__ import annotations
import argparse
import hashlib
import html
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
JOBS = ROOT / "jobs"
SHELL = ROOT / "engine" / "prototype_shell.html"
OUT = ROOT / "demos"
MANIFEST = ROOT / "manifest.json"
REGISTRY = ROOT / "registry.html"
BUILD_VERSION = "8.1.0"

class InvalidJob(ValueError):
    pass

def slug(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value[:64] or "job"

def text_field(obj, name: str, required: bool = False, limit: int = 1200) -> str:
    value = obj.get(name, "")
    if not isinstance(value, str):
        raise InvalidJob(f"{name} must be text")
    value = value.strip()
    if required and not value:
        raise InvalidJob(f"{name} is required")
    if len(value) > limit:
        raise InvalidJob(f"{name} exceeds {limit} characters")
    return value

def link_field(raw: str, label: str) -> str:
    if not raw:
        return ""
    parts = urlsplit(raw)
    if parts.scheme != "https" or not parts.netloc or parts.username or parts.password:
        raise InvalidJob(f"{label} must be an HTTPS URL without embedded credentials")
    return raw

def validate(raw: dict, filename: str) -> dict:
    if not isinstance(raw, dict):
        raise InvalidJob(f"{filename}: expected JSON object")
    company = text_field(raw, "company", True, 160)
    title = text_field(raw, "title", True, 160)
    job_id = text_field(raw, "id", False, 64) or slug(company + "-" + title)
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,63}", job_id):
        raise InvalidJob(f"{filename}: id must be lowercase kebab-case")
    kind = text_field(raw, "type", False, 30).lower() or "ops"
    if kind not in {"partnerships", "education", "customer", "ops"}:
        raise InvalidJob(f"{filename}: unknown role type {kind}")
    source = text_field(raw, "source", False, 400) or "Candidate-provided role details, unverified"
    status = text_field(raw, "status", False, 200) or "Example — confirm job is active"
    link = link_field(text_field(raw, "link", False, 1200), "link")
    req = raw.get("requirements", [])
    if not isinstance(req, list) or len(req) < 2 or len(req) > 15:
        raise InvalidJob(f"{filename}: requirements must have 2–15 items")
    for r in req:
        if not isinstance(r, str) or not r.strip() or len(r) > 320:
            raise InvalidJob(f"{filename}: invalid requirement")
    phases = raw.get("phases", [])
    if not isinstance(phases, list) or len(phases) != 3:
        raise InvalidJob(f"{filename}: phases must have 3 [action, deliverable] pairs")
    for pair in phases:
        if not isinstance(pair, list) or len(pair) != 2 or any(not isinstance(z, str) or not z.strip() or len(z) > 260 for z in pair):
            raise InvalidJob(f"{filename}: invalid phases pair")
    references = raw.get("references", [])
    if not isinstance(references, list) or len(references) > 12:
        raise InvalidJob(f"{filename}: references must be a list of 0–12 entries")
    checked_refs = []
    for ref in references:
        if not isinstance(ref, dict):
            raise InvalidJob(f"{filename}: reference must be object")
        label = text_field(ref, "label", True, 160)
        url = link_field(text_field(ref, "url", True, 1200), "reference URL")
        checked_refs.append({"label": label, "url": url})
    needs_status = text_field(raw, "needs_status", False, 40) or "not-reviewed"
    if needs_status not in {"not-reviewed", "posting-reviewed", "needs-reverification"}:
        raise InvalidJob(f"{filename}: invalid needs_status")
    needs = raw.get("employer_needs", [])
    if not isinstance(needs, list) or len(needs) > 6:
        raise InvalidJob(f"{filename}: employer_needs must have no more than six entries")
    checked_needs = []
    for n in needs:
        if not isinstance(n, dict):
            raise InvalidJob(f"{filename}: employer_needs items must be objects")
        basis = text_field(n, "basis", True, 25)
        if basis not in {"job-posting", "official-site", "hypothesis"}:
            raise InvalidJob(f"{filename}: invalid need evidence basis")
        url = link_field(text_field(n, "source_url", False, 1200), "needs source URL")
        if basis != "hypothesis" and not url:
            raise InvalidJob(f"{filename}: a source URL is required for source-backed needs")
        checked_needs.append({
            "need": text_field(n, "need", True, 280),
            "basis": basis, "source_url": url,
            "prototype_feature": text_field(n, "prototype_feature", True, 280),
            "success_metric": text_field(n, "success_metric", True, 200),
            "candidate_fit": text_field(n, "candidate_fit", True, 280),
            "open_question": text_field(n, "open_question", False, 280),
        })
    if needs_status == "posting-reviewed" and (
        len(checked_needs) < 2 or
        not any(n["basis"] == "job-posting" for n in checked_needs)
    ):
        raise InvalidJob(f"{filename}: posting-reviewed needs require at least two needs and a sourced job-posting need")
    reviewed_on = text_field(raw, "needs_reviewed_on", False, 10)
    if reviewed_on and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", reviewed_on):
        raise InvalidJob(f"{filename}: needs_reviewed_on must be YYYY-MM-DD")
    if needs_status == "posting-reviewed" and not reviewed_on:
        raise InvalidJob(f"{filename}: needs_reviewed_on required for posting-reviewed status")
    role = {
        "id": job_id,
        "type": kind,
        "company": company,
        "title": title,
        "location": text_field(raw, "location", False, 150),
        "link": link,
        "thesis": text_field(raw, "thesis", True, 1200),
        "headline": text_field(raw, "headline", False, 150) or "Execute with evidence, not assumptions",
        "requirements": [r.strip() for r in req],
        "phases": [[s.strip() for s in p] for p in phases],
        "source": source,
        "status": status,
        "references": checked_refs,
        "needs_status": needs_status,
        "needs_reviewed_on": reviewed_on,
        "employer_needs": checked_needs,
        "verification": "Job opening, commercial claims, and role requirements require independent validation.",
    }
    return role

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def safe_script_json(data: dict) -> str:
    # Prevent script-breakout, HTML character escapes, and U+2028/U+2029 ambiguity.
    raw = json.dumps(data, ensure_ascii=True, separators=(",", ":"), sort_keys=True)
    return raw.replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")

def build_html(template: str, job: dict) -> str:
    if template.count("__CONFIG_JSON__") != 1:
        raise RuntimeError("Expected exactly one configuration placeholder")
    if (template.count("<script>") != 1 or
        template.count("</script>") != 1 or
        template.count("</html>") != 1 or
        not template.rstrip().endswith("</body></html>")):
        raise RuntimeError("Malformed prototype shell: leaked script or duplicate HTML footer")
    built = template.replace("__CONFIG_JSON__", safe_script_json(job))
    if built.count("</script>") != 1 or not built.rstrip().endswith("</body></html>"):
        raise RuntimeError("Invalid generated HTML structure")
    return built

def write_outreach(job: dict, relative_url: str) -> str:
    sourced = [n for n in job["employer_needs"] if n["basis"] != "hypothesis"]
    if sourced and job["needs_status"] == "posting-reviewed":
        need = sourced[0]
        fit_sentence = (
            f"A priority from the published posting is: {need['need']}. "
            f"I designed the work sample around {need['prototype_feature']}, "
            f"with {need['success_metric']} as the proposed measure of success. "
            "These are candidate proposals, not evidence of results at your organization.\n\n"
        )
    else:
        fit_sentence = (
            "The employer's current priorities have not been independently confirmed. "
            "I would validate these before recommending any intervention.\n\n"
        )
    return (
        f"# DRAFT ONLY — {job['company']} | {job['title']}\n\n"
        "**State:** NOT SENT — confirm hiring contact, vacancy, and demo URL before sending.\n\n"
        "**To:** [VERIFIED HIRING CONTACT — REQUIRED]\n\n"
        f"**Subject:** {job['company']} | {job['title']} — Operating Work Sample\n\n"
        "Dear Hiring Team,\n\n"
        f"I am interested in the {job['title']} opportunity at {job['company']}. "
        "I built a working, role-specific operating prototype to demonstrate how I would "
        "prioritize the role's key requirements, evaluate tradeoffs, and establish a measurable 90-day execution cadence.\n\n"
        + fit_sentence +
        "The work sample includes editable scenarios, financial and execution charts, an "
        "assumptions register, and a 30–60–90-day plan. All example values are simulated; "
        "none are represented as the employer's actual results.\n\n"
        f"**Demo (verify link first):** https://singhpratik44.github.io/clearline-portfolio/{relative_url}\n\n"
        "My background includes multi-location STEM education operations, revenue growth, "
        "team leadership, and school partnerships. I'd welcome a brief conversation about "
        "how I could apply these capabilities to your team's priorities.\n\n"
        "Best regards,\n\nPratik Singh\n\n"
        "Portfolio: https://singhpratik44.github.io/clearline-portfolio/\n\n"
        "**Approval gate:** recipient, claims, linked demo, resume, and send action require human review.\n"
    )

def registry_html(entries: list[dict]) -> str:
    cards = []
    for e in entries:
        name = html.escape(e["company"] + " · " + e["title"])
        status = html.escape(e["status"])
        loc = html.escape(e["location"])
        job_id = e["id"]
        cards.append(
            f'<article class="job"><div class="meta">ROLE WORK SAMPLE · {status}</div>'
            f'<h2>{name}</h2><p>{loc or "Location unspecified"} · Hypothetical scenario model</p>'
            f'<div class="actions"><a href="demos/{job_id}/">Open demo</a>'
            f'<a href="demos/{job_id}/outreach.md">Review outreach</a>'
            f'<a href="demos/{job_id}/build-report.json">Build report</a></div></article>'
        )
    return (
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" '
        'content="width=device-width,initial-scale=1"><title>APERTURE | Published job work samples</title>'
        '<style>body{font-family:system-ui,Arial;background:#edf2f5;color:#182b3b;margin:0}'
        'header{background:#13283a;color:white;padding:36px max(22px,6vw)}'
        'h1{font-size:clamp(25px,4vw,42px);letter-spacing:-.05em;margin:5px 0}'
        'main{max-width:1150px;margin:32px auto;padding:0 22px}'
        '.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(285px,1fr));gap:18px}'
        '.job{background:white;border:1px solid #dbe3e8;border-radius:10px;padding:24px}'
        '.job h2{font-size:19px;margin:10px 0}.job p{color:#62798a;font-size:13px}'
        '.meta{font-size:10px;font-weight:800;color:#277484;letter-spacing:.12em}'
        '.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}'
        'a{color:#075e75;text-decoration:none;font-size:12px;font-weight:750}'
        'a:hover{text-decoration:underline}.notice{font-size:12px;color:#647988;max-width:850px}'
        '</style></head><body><header><div>APERTURE / CAREER OS</div><h1>Published operating work samples.</h1>'
        '<p>Auto-built from versioned job specifications. No employer access or sponsorship implied.</p>'
        '<a style="color:#a8e8e9" href="./">Open Prototype Factory</a></header><main>'
        '<p class="notice">All metrics are simulations, not employer financials. Application availability and job descriptions require independent validation. Draft outreach is never automatically sent.</p>'
        '<div class="grid">' + "".join(cards) + '</div></main></body></html>'
    )

def build_all(root: Path = ROOT) -> dict:
    jobs_dir, out_dir = root / "jobs", root / "demos"
    template = (root / "engine" / "prototype_shell.html").read_text(encoding="utf-8")
    out_dir.mkdir(parents=True, exist_ok=True)
    inputs = sorted(jobs_dir.glob("*.json"))
    if not inputs:
        raise InvalidJob("No career-os/jobs/*.json files found")
    seen = set()
    records = []
    for path in inputs:
        raw_bytes = path.read_bytes()
        role = validate(json.loads(raw_bytes), path.name)
        if role["id"] in seen:
            raise InvalidJob(f"Duplicate job id {role['id']}")
        seen.add(role["id"])
        rel = f"career-os/demos/{role['id']}/"
        demo_dir = out_dir / role["id"]
        demo_dir.mkdir(parents=True, exist_ok=True)
        website = build_html(template, role)
        (demo_dir / "index.html").write_text(website, encoding="utf-8")
        outreach = write_outreach(role, rel)
        (demo_dir / "outreach.md").write_text(outreach, encoding="utf-8")
        report = {
            "job_id": role["id"], "build_version": BUILD_VERSION,
            "source_json_sha256": sha(raw_bytes), "site_sha256": sha(website.encode()),
            "role_source": role["source"], "vacancy_status": role["status"],
            "rights_status": "Unverified — no employer system access",
            "financial_status": "All numerical scenarios hypothetical",
            "email_status": "DRAFT ONLY, not sent",
            "employer_needs_status": role["needs_status"],
            "employer_needs_count": len(role["employer_needs"]),
            "needs_reviewed_on": role["needs_reviewed_on"],
            "outreach_gate": "Needs review, vacancy confirmation, URL check, recipient verification, and user approval required",
            "verification_checks": ["input_schema", "https_link_policy", "script_escape", "assumption_disclosure", "needs_traceability"],
            "demo_path": rel,
        }
        (demo_dir / "build-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        records.append({
            "id": role["id"], "type": role["type"], "company": role["company"], "title": role["title"],
            "status": role["status"], "location": role["location"],
            "site": rel, "job_link": role["link"], "source": role["source"],
            "build_sha256": report["site_sha256"], "email_status": "Draft only",
            "needs_status": role["needs_status"], "needs_count": len(role["employer_needs"]),
        })
    manifest = {"version": BUILD_VERSION, "count": len(records), "jobs": records,
                "assurance": "Demonstrations are built and syntax-tested; actual job status and Pages serving need separate checks."}
    (root / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    (root / "registry.html").write_text(registry_html(records), encoding="utf-8")
    return manifest

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=str(ROOT), help="career-os directory")
    args = parser.parse_args()
    output = build_all(Path(args.root).resolve())
    print("APERTURE: built", output["count"], "role prototypes:", ", ".join(j["id"] for j in output["jobs"]))
