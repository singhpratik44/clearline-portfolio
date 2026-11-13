# APERTURE Experience Layer v2

A production-oriented, mobile-first, **no-account**, dependency-free web experience built around **Awareness, Joy, Love, and Wonder**. The four paths contain four optional steps each, including interactive activities, reflection, and completion.

## Preview locally

Run from the extracted folder:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). Requires no build, package manager, API key, account, or analytics service. Module imports normally require an HTTP server; do not open `index.html` by double-clicking it with `file://` in browsers that block module loading.

## Files

- `index.html` — static, SEO-aware entry point
- `styles.css` — responsive and reduced-motion-aware design system
- `content.js` — content registry for the four experiences
- `experience-layer.js` — reusable, event-driven experience module
- `assets/favicon.svg` — original vector favicon
- `tests/test_site.py` — browser smoke and interaction tests

## Use in another APERTURE project

Include the stylesheet, add a container, and import the module:

```html
<link rel="stylesheet" href="/experience/styles.css">
<div id="moment-compass"></div>
<script type="module">
  import { createExperienceLayer } from '/experience/experience-layer.js';
  const layer = createExperienceLayer(document.querySelector('#moment-compass'), {
    initialExperience: 'joy',
    syncURL: false, // avoid changing routes in host apps
    // onChange: state => updateYourOwnLocalUI(state)
  });
  // layer.chooseExperience('wonder'); layer.setQuiet(true); layer.destroy();
</script>
```

`onChange` is optional and local to the embedding app; the component itself makes **no network calls**. For a more compact embedded design, adapt CSS scopes or mount the module on a dedicated route.

## UX and privacy

- Four paths, four steps each. Every activity is optional.
- Selectable grounding cues, a pausable visual breath guide (not medical guidance), written reflections, idea rotation, and final reflections.
- Private notes are kept **only in memory** while the page is open. They are not put in URLs, clipboard, browser storage, or network messages. Reloading or choosing **Clear my private notes** deletes them.
- Quiet mode removes ambient decorative effects and pauses motion.
- Accessible buttons, visible focus, labeled fields, status announcements, semantic progress, and reduced-motion support.
- Share a public URL with `?experience=awareness|joy|love|wonder`, but no personal note content; on localhost a warning explains that the URL is not public.
- No sign-in, cookies, analytics, external fonts, tracking pixels, or third-party scripts.
- Local content only, not a health evaluation, treatment, or spiritual prescription.

## Test

Install Playwright if needed (`pip install playwright && python -m playwright install chromium`). Then run `python tests/test_site.py`; it uses Playwright and Chromium to check all four paths, share/privacy behavior, and mobile layout. In browser-policy-restricted environments, the script injects the exact original CSS/JS sources into an `about:blank` document instead of navigating to localhost. This tests interactive browser behavior but does not establish that public hosting has worked.

## Publish

Upload all files together to a static host. GitHub Pages works unchanged as a folder such as `/experience/` because assets use relative URLs. Publishing to an existing repository requires a separate Git commit and successful public deployment verification. This package does **not** claim that has happened.