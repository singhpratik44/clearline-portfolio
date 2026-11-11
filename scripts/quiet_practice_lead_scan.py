#!/usr/bin/env python3
"""Quiet Practice weekly public opportunity scan.

Only reads public news/event RSS metadata and posts *unverified* links to a
review issue. Never processes health data, consumer contacts, or sends outreach.
Runs in GitHub Actions with a short-lived GITHUB_TOKEN.
"""
from __future__ import annotations

import datetime as dt
import html
import json
import os
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ISSUE = 38
QUERIES = (
    '"journaling workshop" "Orange County" California',
    '"mindfulness workshop" "Santa Ana" California',
    '"guided reflection" "wellness event" California',
)
UA = "APERTURE-Quiet-Practice-Review/1.0 (+public research, no personal data)"


def request(url: str, token: str | None = None) -> bytes:
    headers = {"User-Agent": UA, "Accept": "application/rss+xml, application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        headers["X-GitHub-Api-Version"] = "2022-11-28"
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=15) as r:
        return r.read(800_000)


def feed_candidates() -> list[dict[str, str]]:
    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=21)
    candidates: dict[str, dict[str, str]] = {}
    for query in QUERIES:
        url = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
            {"q": query, "hl": "en-US", "gl": "US", "ceid": "US:en"}
        )
        try:
            root = ET.fromstring(request(url))
        except Exception as exc:
            print(f"RSS unavailable for query ({type(exc).__name__})", file=sys.stderr)
            continue
        for item in root.findall(".//item")[:20]:
            title = html.unescape((item.findtext("title") or "").strip())
            link = (item.findtext("link") or "").strip()
            pub = (item.findtext("pubDate") or "").strip()
            try:
                from email.utils import parsedate_to_datetime
                date = parsedate_to_datetime(pub).astimezone(dt.timezone.utc)
            except (ValueError, TypeError):
                continue
            if date < cutoff or not title or not link.startswith("https://"):
                continue
            candidates[link] = {"title": title[:160], "url": link, "published": date.date().isoformat()}
    return list(candidates.values())


def main() -> None:
    token = os.getenv("GITHUB_TOKEN")
    repo = os.getenv("GITHUB_REPOSITORY")
    if not token or not repo or "/" not in repo:
        raise SystemExit("GitHub token and repository are required.")
    url = f"https://api.github.com/repos/{repo}/issues/{ISSUE}/comments?per_page=100"
    prior = json.loads(request(url, token)).copy()
    known = "\n".join((comment.get("body") or "") for comment in prior)
    fresh = [c for c in feed_candidates() if c["url"] not in known][:5]
    if not fresh:
        print("No novel public candidate links; no comment posted.")
        return
    lines = [
        "**Automated public-program discovery (unverified)**",
        "",
        "These are public article/event signals only. They are *not* approved prospects, verified buyers, or permission to solicit anyone.",
        "Review the original organization page before any human-approved outreach; never target people by health conditions.",
        "",
    ]
    for c in fresh:
        clean_title = c["title"].replace("[", "").replace("]", "").replace("|", " ")
        lines.append(f"- [{clean_title}]({c['url']}) (published {c['published']})")
    lines.append("")
    lines.append("No outbound email or other promotional post was sent.")
    payload = json.dumps({"body": "\n".join(lines)}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, method="POST", headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": UA,
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req, timeout=15) as response:
        print(f"Posted {len(fresh)} unverified candidate links: HTTP {response.status}")


if __name__ == "__main__":
    main()
