#!/usr/bin/env python3
"""APERTURE Research Discovery — public metadata, staged human review only.

No LLM required; no private data; no source automatically enters an approved
commercial plan. Each adapter reports partial failures rather than faking coverage.
Run: python3 commercial-4d/research-discovery.py --output /tmp/aperture-candidates.json
"""
from __future__ import annotations
import argparse
import datetime as dt
import html
import json
import re
import sys
from html.parser import HTMLParser
from urllib.parse import quote, urlencode, urlparse
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

SOURCE_URLS = {
    "arxiv": "https://export.arxiv.org/api/query",
    "openreview": "https://api2.openreview.net/notes/search",
    "icml": "https://proceedings.mlr.press/v306/",
    "neurips": "https://neurips.cc/static/virtual/data/neurips-2026-orals-posters.json",
    "automl": "https://2026.automl.cc/program-overview/",
    "langchain": "https://www.langchain.com/blog/rss.xml",
    "huggingface": "https://huggingface.co/api/daily_papers",
    "paperswithcode": "https://paperswithcode.co/api/v1/papers/search",
    "mlpapersweekly": "https://mlpapersweekly.com/",
}
PUBLICATION_TYPES = {
    "arxiv": "preprint",
    "openreview": "review_platform_submission_unverified",
    "icml": "conference_proceeding",
    "neurips": "official_conference_listing_pending_crosscheck",
    "automl": "official_program_listing_pending_crosscheck",
    "langchain": "industry_blog_not_peer_reviewed",
    "huggingface": "paper_discovery_mirror",
    "paperswithcode": "paper_code_index",
    "mlpapersweekly": "newsletter_discovery_not_peer_reviewed",
}
KEYWORDS = (
    "agent", "forecast", "planning", "enterprise", "resource allocat",
    "operations", "strategy", "constraints", "decision", "governance",
    "multi-agent", "benchmark", "economic", "risk", "evaluation"
)
ATOM = {"a": "http://www.w3.org/2005/Atom"}
MAX_ABSTRACT = 1100


def fetch_bytes(url: str, timeout: int = 18) -> bytes:
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in {
        "export.arxiv.org", "api2.openreview.net", "proceedings.mlr.press",
        "neurips.cc", "2026.automl.cc", "www.langchain.com",
        "huggingface.co", "paperswithcode.co", "mlpapersweekly.com"
    }:
        raise ValueError("Unrecognized research source host")
    req = Request(url, headers={"User-Agent": "APERTURE-Research-Discovery/0.1 (public metadata only)", "Accept": "application/json, application/atom+xml, text/html, application/rss+xml, */*"})
    with urlopen(req, timeout=timeout) as response:
        if response.status != 200:
            raise ValueError("Unexpected HTTP status "+str(response.status))
        body = response.read(2_000_001)
        if len(body) > 2_000_000:
            raise ValueError("Source response exceeds 2 MB")
        return body


def clean(s, max_length: int = MAX_ABSTRACT):
    text = html.unescape(re.sub(r"\s+", " ", str(s or ""))).strip()
    return text[:max_length]


def as_date(s):
    if isinstance(s, (int, float)):
        seconds = s / 1000 if s > 1e11 else s
        try:
            return dt.datetime.fromtimestamp(seconds, tz=dt.timezone.utc).date().isoformat()
        except (OverflowError, OSError, ValueError):
            return None
    if not s:
        return None
    value = str(s)[:10]
    try:
        return dt.date.fromisoformat(value).isoformat()
    except ValueError:
        try:
            from email.utils import parsedate_to_datetime
            return parsedate_to_datetime(str(s)).date().isoformat()
        except (TypeError, ValueError):
            return None


def entry(source, title, url, date=None, abstract="", version=None, **extra):
    title = clean(title, 240)
    if not title or not url or not str(url).startswith("https://"):
        return None
    item = {"source": source, "title": title, "url": str(url)[:750],
            "date": as_date(date), "abstract": clean(abstract),
            "version": clean(version, 30) or None,
            "publication_type": PUBLICATION_TYPES[source],
            "review_status": "unverified", "needs_human_review": True}
    for k, v in extra.items():
        if v is not None:
            item[k] = v
    return item


def parse_arxiv(data):
    root = ET.fromstring(data)
    items = []
    for record in root.findall("a:entry", ATOM):
        url = clean(record.findtext("a:id", default="", namespaces=ATOM), 700)
        ref = re.search(r"(\d{4}\.\d{4,5})(v\d+)?", url)
        if not ref:
            continue
        arxiv_id = ref.group(1)
        version = ref.group(2) or "unversioned_api_result"
        item = entry("arxiv", record.findtext("a:title", default="", namespaces=ATOM),
                     "https://arxiv.org/abs/"+arxiv_id,
                     record.findtext("a:published", default="", namespaces=ATOM),
                     record.findtext("a:summary", default="", namespaces=ATOM),
                     version=version, arxiv_id=arxiv_id,
                     updated_at=as_date(record.findtext("a:updated", default="", namespaces=ATOM)))
        if item:
            items.append(item)
    return items


def field_value(v):
    return v.get("value") if isinstance(v, dict) else v


def parse_openreview(data):
    obj = json.loads(data)
    items = []
    for note in obj.get("notes", [])[:80]:
        fields = note.get("content") or {}
        title = field_value(fields.get("title")) or ""
        abstract = field_value(fields.get("abstract")) or ""
        venue = field_value(fields.get("venue")) or ""
        url = "https://openreview.net/forum?id="+quote(str(note.get("forum") or note.get("id") or ""), safe="")
        item = entry("openreview", title, url, note.get("pdate") or note.get("cdate"),
                     abstract, venue=clean(venue, 120) or None)
        if item:
            items.append(item)
    return items


def parse_huggingface(data):
    obj = json.loads(data)
    if isinstance(obj, dict):
        obj = obj.get("papers") or obj.get("results") or []
    items = []
    for row in obj[:100]:
        paper = row.get("paper") or row
        paper_id = paper.get("id") or paper.get("paperId")
        if not paper_id:
            continue
        item = entry("huggingface", paper.get("title"),
                     "https://huggingface.co/papers/"+quote(str(paper_id), safe="."),
                     paper.get("publishedAt") or row.get("publishedAt") or paper.get("published_at"),
                     paper.get("summary") or paper.get("ai_summary") or "",
                     arxiv_id=str(paper_id) if re.fullmatch(r"\d{4}\.\d{4,5}", str(paper_id)) else None)
        if item:
            items.append(item)
    return items


def parse_paperswithcode(data):
    obj = json.loads(data)
    if isinstance(obj, dict):
        arr = obj.get("results") or obj.get("papers") or obj.get("items") or []
    elif isinstance(obj, list):
        arr = obj
    else:
        arr = []
    items = []
    for row in arr[:100]:
        url = row.get("url") or row.get("paper_url")
        if not url:
            rid = row.get("id") or row.get("arxiv_id")
            url = ("https://paperswithcode.co/paper/"+quote(str(rid), safe="")) if rid else ""
        if url.startswith("/"):
            url = "https://paperswithcode.co"+url
        if not url.startswith("https://"):
            continue
        item = entry("paperswithcode", row.get("title") or row.get("name"), url,
                     row.get("published") or row.get("published_date") or row.get("date"),
                     row.get("abstract") or "", arxiv_id=row.get("arxiv_id") or None)
        if item:
            items.append(item)
    return items


def parse_rss(data):
    root = ET.fromstring(data)
    items = []
    for node in root.findall(".//item")[:80]:
        item = entry("langchain", node.findtext("title"), node.findtext("link"),
                     node.findtext("pubDate"), node.findtext("description"))
        if item:
            items.append(item)
    return items


class AnchorParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.active = None
        self.anchors = []
    def handle_starttag(self, tag, attrs):
        if tag == "a":
            href = dict(attrs).get("href", "")
            self.active = [href, ""]
    def handle_data(self, data):
        if self.active:
            self.active[1] += data
    def handle_endtag(self, tag):
        if tag == "a" and self.active:
            self.anchors.append(tuple(self.active))
            self.active = None


def parse_icml(data):
    p = AnchorParser()
    p.feed(data.decode("utf-8", errors="replace"))
    seen, items = set(), []
    for href, title in p.anchors:
        match = re.search(r"(?:https://proceedings\.mlr\.press)?/v306/([a-z0-9-]+)\.html", href)
        if not match or match.group(1) in seen:
            continue
        seen.add(match.group(1))
        item = entry("icml", title, "https://proceedings.mlr.press/v306/"+match.group(1)+".html",
                     "2026-07-06", "", proceeding_volume="306")
        if item:
            items.append(item)
    return items


def parse_neurips(data):
    obj = json.loads(data)
    items = []
    arr = obj.get("papers") or obj.get("data") or obj.get("results") if isinstance(obj, dict) else obj
    if not isinstance(arr, list):
        return []
    for row in arr[:500]:
        if not isinstance(row, dict):
            continue
        title = row.get("title") or row.get("paper_title")
        paper_id = row.get("paper_id") or row.get("id")
        if not title or not paper_id:
            continue
        item = entry("neurips", title,
                     "https://neurips.cc/virtual/2026/poster/"+quote(str(paper_id), safe=""),
                     None, row.get("abstract") or "")
        if item:
            items.append(item)
    return items


def discover(source):
    if source == "arxiv":
        params={"search_query":'all:"agent planning" OR all:"enterprise agent" OR all:"resource allocation" OR all:"forecasting agent"',
                "start":0, "max_results":70, "sortBy":"submittedDate", "sortOrder":"descending"}
        return parse_arxiv(fetch_bytes(SOURCE_URLS[source]+"?"+urlencode(params)))
    if source == "openreview":
        return parse_openreview(fetch_bytes(SOURCE_URLS[source]+"?"+urlencode({"query":"agent planning", "limit":60})))
    if source == "icml":
        return parse_icml(fetch_bytes(SOURCE_URLS[source]))
    if source == "neurips":
        return parse_neurips(fetch_bytes(SOURCE_URLS[source]))
    if source == "langchain":
        return parse_rss(fetch_bytes(SOURCE_URLS[source]))
    if source == "huggingface":
        return parse_huggingface(fetch_bytes(SOURCE_URLS[source]+"?"+urlencode({"limit":100})))
    if source == "paperswithcode":
        return parse_paperswithcode(fetch_bytes(SOURCE_URLS[source]+"?"+urlencode({"q":"agent planning","mode":"keyword","page_size":30})))
    # These authoritative sites are registered for manual primary-source review;
    # no unverified scraping is falsely presented as a working adapter.
    return None


def relevance(item):
    body=(item["title"]+" "+item.get("abstract", "")).lower()
    score=sum(3 if term in item["title"].lower() else 1 for term in KEYWORDS if term in body)
    return score


def build(window_days=150):
    now=dt.datetime.now(dt.timezone.utc)
    cutoff=(now-dt.timedelta(days=window_days)).date().isoformat()
    out={"schema":"aperture-research-discovery-v1", "generated_at":now.isoformat(),
         "window_days":window_days, "cutoff_date":cutoff,
         "publication_warning":"Discovery metadata only; do not update approved research or operational policy automatically.",
         "sources":{}, "candidates":[]}
    all_items=[]
    for source, url in SOURCE_URLS.items():
        if source in ("automl","mlpapersweekly"):
            out["sources"][source]={"status":"manual_review_only","url":url,"items":0,
                                    "note":"Official source is registered; no parser is claimed."}
            continue
        try:
            found=discover(source)
            if not isinstance(found, list):
                raise ValueError("Adapter did not return a list")
            out["sources"][source]={"status":"fetched","url":url,"items":len(found)}
            for item in found:
                item["relevance"]=relevance(item)
                item["freshness_checked"]=bool(item["date"])
                if item["date"] and item["date"] >= cutoff and item["relevance"]>=3:
                    all_items.append(item)
        except Exception as e:
            out["sources"][source]={"status":"fetch_failed","url":url,"items":0,
                                    "error":clean(type(e).__name__+": "+str(e),300)}
    unique={}
    for item in all_items:
        # Same arXiv may surface from HF/PapersWithCode; preserve origin and use
        # only one canonical discovery row, preferring primary arXiv provenance.
        key=item.get("arxiv_id") or re.sub(r"\W+", "", item["title"].lower())
        if key not in unique or (item["source"]=="arxiv" and unique[key]["source"]!="arxiv"):
            unique[key]=item
    out["candidates"]=sorted(unique.values(),key=lambda x:(-x["relevance"],x["date"] or ""),reverse=False)[:80]
    out["summary"]={"candidates":len(out["candidates"]),"fetched_sources":sum(s["status"]=="fetched" for s in out["sources"].values()),
                    "failed_sources":sum(s["status"]=="fetch_failed" for s in out["sources"].values()),
                    "manual_sources":sum(s["status"]=="manual_review_only" for s in out["sources"].values())}
    return out


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--output",default="commercial-4d/research-candidates.json")
    p.add_argument("--window-days",type=int,default=150)
    args=p.parse_args()
    if not 30<=args.window_days<=365:
        p.error("--window-days must be in [30,365]")
    obj=build(args.window_days)
    from pathlib import Path
    out=Path(args.output)
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps(obj["summary"],sort_keys=True))
    print("Wrote",out,"(review candidates only, no approved research changed)")
    if obj["summary"]["fetched_sources"]==0:
        print("WARNING: All API adapters failed. Review source statuses.",file=sys.stderr)


if __name__=="__main__":
    main()
