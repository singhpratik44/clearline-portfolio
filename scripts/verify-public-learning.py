#!/usr/bin/env python3
"""Check published APERTURE routes without mistaking custom 404 HTML for success."""
import argparse
import urllib.error
import urllib.request
import sys

BASE = 'https://singhpratik44.github.io/clearline-portfolio/'
ROUTES = {
    '': ('APERTURE',),
    'learning-lab.html': ('Interactive Learning Lab', 'id="course"'),
    'game-studio.html': ('APERTURE Game Studio', 'id="preview"'),
    'curriculum.html': ('curriculum',),
}
def check(route, tokens, base):
    url = base.rstrip('/') + '/' + route
    req = urllib.request.Request(url, headers={'User-Agent': 'APERTURE-Public-Smoke/1.0', 'Cache-Control': 'no-cache'})
    with urllib.request.urlopen(req, timeout=20) as response:
        body = response.read().decode('utf-8', errors='replace')
        status = response.status
    if status != 200 or 'APERTURE / ROUTE NOT FOUND' in body or '<h1>Lost signal.' in body:
        raise AssertionError(f'{route or "home"}: status {status}, unexpected 404 content')
    missing = [token for token in tokens if token.lower() not in body.lower()]
    if missing:
        raise AssertionError(f'{route or "home"}: missing content markers {missing}')
    print(f'PASS {url} HTTP {status}')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', default=BASE)
    args = parser.parse_args()
    failures = 0
    for route, tokens in ROUTES.items():
        try:
            check(route, tokens, args.base)
        except (urllib.error.URLError, AssertionError, TimeoutError) as exc:
            failures += 1
            print(f'FAIL {route or "home"}: {exc}', file=sys.stderr)
    sys.exit(1 if failures else 0)
