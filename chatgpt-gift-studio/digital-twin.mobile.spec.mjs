import { test, expect } from "@playwright/test";
test("mobile digital twin feedback and reset", async ({ browser }) => {
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.goto(process.env.TARGET_BASE||"https://aperture-gift-studio.onrender.com/",{waitUntil:"domcontentloaded"});
 await expect(page.locator("#digitalTwin")).toBeVisible();
 await page.locator("#twinInterest").selectOption("beauty");
 await page.locator("#runTwin").click();
 await expect(page.locator("#twinOutput")).toBeVisible();
 await expect(page.locator("#twinOutput")).toContainText("Simulated top matches");
 await page.getByRole("button",{name:/More like this for/}).first().click();
 await expect(page.locator("#twinOutput")).toContainText("in-session feedback");
 await page.locator("#resetTwin").click();
 await expect(page.locator("#twinOutput")).toBeHidden();
 await expect(page.locator("#twinStyle")).toHaveValue("practical");
 await expect(page.locator("#twinInterest")).toHaveValue("beauty");
 await page.close();
});
