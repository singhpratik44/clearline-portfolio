# Browser smoke test: python3 tests/e2e/smoke.py [base_url]  (default http://localhost:8080)
import asyncio, re, sys
from playwright.async_api import async_playwright, expect
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        ctx = await b.new_context(viewport={"width": 375, "height": 812}, permissions=["clipboard-read", "clipboard-write"])
        page = await ctx.new_page()
        errs = []; page.on("pageerror", lambda e: errs.append(str(e)))
        await page.goto(BASE + "/gift")
        await expect(page.get_by_role("heading", name="No gift here yet")).to_be_visible()
        await page.goto(BASE + "/gift#@@bad")
        await expect(page.get_by_role("heading", name="This gift link couldn't be read")).to_be_visible()
        await page.goto(BASE + "/")
        await page.get_by_role("textbox", name="For", exact=True).fill("ਹਰਪ੍ਰੀਤ <b>x</b>")
        await page.get_by_role("textbox", name="From", exact=True).fill("Pratik")
        for _ in range(20):
            await page.get_by_role("button", name="Create gift link").click()
            if await page.get_by_label("Gift link").count(): break
            await page.wait_for_timeout(250)
        url = await page.get_by_label("Gift link").input_value()
        assert "/gift#" in url, url
        await page.screenshot(path="/tmp/smoke_create.png")
        await page.goto(url)
        await page.get_by_role("button", name="Open gift").click()
        await page.screenshot(path="/tmp/smoke_letter.png"); await expect(page.get_by_text("Dear ਹਰਪ੍ਰੀਤ <b>x</b>,")).to_be_visible()
        await page.get_by_role("button", name="Wonder", exact=True).click()
        await page.get_by_role("button", name="I did it").click()
        await expect(page.get_by_text("Moment received.")).to_be_visible()
        await expect(page.get_by_role("heading", name="Pass the light forward")).to_be_visible()
        await page.screenshot(path="/tmp/smoke_done.png")
        w = await page.evaluate("document.documentElement.scrollWidth")
        assert w <= 375, f"horizontal overflow {w}"
        assert not errs, errs
        print("SMOKE OK")
        await b.close()
asyncio.run(main())
