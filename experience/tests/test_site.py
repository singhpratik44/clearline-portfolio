#!/usr/bin/env python3
"""Chromium interaction tests using injected local assets (no external navigation)."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SCREENSHOT_DESKTOP = ROOT / "preview-desktop.png"
SCREENSHOT_MOBILE = ROOT / "preview-mobile.png"
CONTENT = (ROOT / 'content.js').read_text().replace('export const experiences =', 'const experiences =')
COMPONENT = (ROOT / 'experience-layer.js').read_text().replace("import { experiences } from './content.js';", '').replace('export function createExperienceLayer', 'function createExperienceLayer')
STYLE = (ROOT / 'styles.css').read_text()


def mount(page, initial='awareness'):
    """Load the original CSS and exact module source with module syntax transformed for about:blank."""
    page.goto('about:blank')
    page.set_content('<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><a class="skip-link" href="#experience-layer">Skip to experiences</a><div id="experience-layer"></div></body></html>')
    page.add_style_tag(content=STYLE)
    page.add_script_tag(content=CONTENT + '\n' + COMPONENT + '\nwindow.layer = createExperienceLayer(document.getElementById("experience-layer"), { initialExperience: ' + repr(initial) + ', syncURL:false });')
    page.locator('#ael-step-heading').wait_for()


def main():
    with sync_playwright() as p:
        launch = {'headless': True, 'args': ['--no-sandbox']}
        if Path('/usr/bin/chromium').exists():
            launch['executable_path'] = '/usr/bin/chromium'
        browser = p.chromium.launch(**launch)
        errors = []
        desktop = browser.new_page(viewport={'width': 1440, 'height': 940}, device_scale_factor=1)
        desktop.on('pageerror', lambda err: errors.append(str(err)))
        mount(desktop)
        assert desktop.locator('.ael-path').count() == 4
        assert desktop.locator('#ael-step-heading').inner_text() == 'Arrive right here.'
        desktop.screenshot(path=str(SCREENSHOT_DESKTOP), full_page=True)

        for exp, first in [('awareness', 'Arrive right here.'), ('joy', 'Find one bright detail.'),
                           ('love', 'Choose where care goes.'), ('wonder', 'Follow a spark.')]:
            desktop.locator(f'.ael-path[data-id="{exp}"]').click()
            assert desktop.locator('#ael-step-heading').inner_text() == first
            assert desktop.locator('[role="progressbar"]').get_attribute('aria-valuenow') == '25'
            for step in range(3):
                desktop.locator('[data-action="next"]').click()
                assert desktop.locator('[role="progressbar"]').get_attribute('aria-valuenow') == str((step + 2) * 25)
            desktop.locator('[data-action="next"]').click()
            assert desktop.locator('#ael-complete-heading').is_visible()

        desktop.locator('.ael-path[data-id="awareness"]').click()
        desktop.locator('[data-action="choice"][data-value="1"]').click()
        assert desktop.locator('[data-action="choice"][data-value="1"]').get_attribute('aria-pressed') == 'true'
        desktop.locator('[data-action="next"]').click()
        desktop.locator('[data-action="breath"]').click()
        assert desktop.locator('[data-action="breath"]').get_attribute('aria-pressed') == 'false'
        desktop.locator('[data-action="quiet"]').click()
        assert desktop.locator('.ael.is-quiet').count() == 1
        desktop.locator('[data-action="quiet"]').click()
        assert desktop.locator('.ael.is-quiet').count() == 0

        desktop.locator('.ael-path[data-id="wonder"]').click()
        first_idea = desktop.locator('.ael-idea-text').inner_text()
        desktop.locator('[data-action="new-idea"]').click()
        assert first_idea != desktop.locator('.ael-idea-text').inner_text()
        desktop.locator('.ael-path[data-id="joy"]').click()
        desktop.locator('[data-action="next"]').click()
        desktop.locator('#ael-private-note').fill('My secret journal <not shared>')
        desktop.locator('[data-action="next"]').click()
        desktop.locator('[data-action="back"]').click()
        assert desktop.locator('#ael-private-note').input_value() == 'My secret journal <not shared>'
        desktop.locator('[data-action="share"]').click()
        link = desktop.locator('#ael-share-url').input_value()
        assert 'experience=joy' in link
        assert 'My secret' not in link
        assert desktop.locator('.ael-share-note').is_visible()
        desktop.locator('[data-action="clear-notes"]').click()
        assert desktop.locator('#ael-private-note').input_value() == ''
        mount(desktop, 'joy')
        desktop.locator('[data-action="next"]').click()
        assert desktop.locator('#ael-private-note').input_value() == ''

        for width, height in [(320, 720), (375, 812), (390, 844), (768, 1024)]:
            mobile = browser.new_page(viewport={'width': width, 'height': height}, device_scale_factor=1)
            mobile.on('pageerror', lambda err: errors.append(str(err)))
            mount(mobile, 'love')
            assert mobile.locator('#ael-step-heading').inner_text() == 'Choose where care goes.'
            assert mobile.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'horizontal overflow at {width}px'
            assert mobile.locator('[data-action="next"]').is_visible()
            if width == 390:
                mobile.screenshot(path=str(SCREENSHOT_MOBILE), full_page=True)
            mobile.close()
        assert errors == [], f'Browser JavaScript errors: {errors}'
        desktop.emulate_media(reduced_motion='reduce')
        desktop.locator('.ael-path[data-id="awareness"]').click()
        desktop.locator('[data-action="next"]').click()
        assert desktop.locator('.ael-breath-orb').evaluate('(el) => getComputedStyle(el).animationName') == 'none'
        desktop.evaluate('window.layer.destroy()')
        assert desktop.locator('.ael').count() == 0
        browser.close()
    print('PASS — 4 paths × 4 steps, completion, choices, breathing, ideas, quiet mode, private notes, share links, and 4 responsive widths.')
    print('Chromium tested the original CSS/JS in an injected about:blank page; navigation to local HTTP was blocked by browser policy.')
    print('DESKTOP SCREENSHOT', SCREENSHOT_DESKTOP)
    print('MOBILE SCREENSHOT', SCREENSHOT_MOBILE)


if __name__ == '__main__':
    main()