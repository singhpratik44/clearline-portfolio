# CODE THE GAME — digital course fulfillment (2026-11-10)

## What is live

This is a **self-paced, written** digital product. **No coding sessions, tutors, teacher calls, videos, or appointments** are included.

- Roblox Creator (6 Luau lessons), $19 — `prod_VbaAJSxwnYrumg`; Payment Link `plink_1UaMzwRuy3ohymOHZIIbzLch`.
- Minecraft Coding (6 MakeCode JavaScript lessons), $29 — `prod_VbaAfbbzoprGEU`; Payment Link `plink_1UaMzzRuy3ohymOHA5BER4Bn`. **Requires Minecraft Education, not regular Java/Bedrock.**
- Indie Game Developer (8 Godot 4 lessons), $39 — `prod_VbaA2YADwsagss`; Payment Link `plink_1UaN01Ruy3ohymOHbvmJnVr2`.
- Bundle (all 20 lessons), $59 — `prod_VbaAGOPZJJnVBM`; Payment Link `plink_1UaN02Ruy3ohymOHkctYwfmd`.

Production Stripe account: Clearline Code. Live card payment links, one-time purchases, automatic Stripe Tax **disabled** because the merchant said they do not currently collect sales tax. That statement is not a determination of tax obligations.

## Delivery architecture

- Landing page: `/code-the-game/`.
- Reader: `/code-the-game/learn/`.
- Encrypted course content: `/code-the-game/packs/{roblox,minecraft,indie}.json`.
- Each course pack is compressed JSON encrypted with **AES-256-GCM** and per-course random keys. The public repository contains only ciphertext, nonce, and reader code; **never commit unlock keys to this repository.**
- Each Stripe Payment Link is configured to redirect after successful checkout to a reader URL with the corresponding key(s) in the URL **fragment**. Bundle link carries all three keys. The fragment is not sent in the HTTP request to GitHub Pages.
- Reader uses WebCrypto to decrypt and DecompressionStream to read gzip JSON. It shows setup prerequisites, lessons, example code, step-by-step work, challenges, review questions and capstone rubric. Completed checkbox state stays in local browser storage. Buyer can export plaintext JSON and print for offline use.

**Security limitation:** The Stripe redirect URL is a **reusable bearer link**, not an authenticated, buyer-specific entitlement. Anyone who obtains the link can access/decrypt the same course; there is no revocation, link expiry, accounts, automated email replay or login. A user who loses their access link must contact the merchant for manual recovery. This is a low-cost MVP, not anti-sharing DRM. To scale to 1,000 buyers, replace shared links with verified Checkout Session or Stripe webhook entitlements and per-customer secure delivery on a backend; use secret API keys and webhook signing secrets only in a managed secret store.

## Prerequisites and buyer disclosures

1. Roblox Studio installed on Windows or macOS; free Roblox account subject to Roblox's own policies.
2. Minecraft Education license/account, Code Builder and Microsoft MakeCode; **not** standard Java/Bedrock. A separate license may be required.
3. Godot 4.x desktop editor.
4. Text-based self-paced materials and code samples, not video classes or instructor time. No publishing outcome guarantee.
5. Independent educational resources, no endorsement by game companies; minors should use products subject to applicable platform/account and parental requirements.

## Validation performed

- 3 JSON course bundles generated and decrypted with AES-256-GCM using their respective keys before publication.
- All 3 published ciphertext files read back through GitHub with exact byte lengths, FNV-1a and Adler-32 matches to source files.
- Reader JavaScript parsed without syntax errors.
- All four live Stripe payment links read back as active with successful-payment redirect configured; bundle link includes three course unlock keys.
- Stripe products updated to accurately say written, self-paced and no live instruction.

## Must still test manually before sending significant paid traffic

- Open the *actual* GitHub Pages storefront and course reader in desktop and mobile browser and verify the URLs are published. GitHub source commits alone do not prove live Pages deployment.
- Complete a genuine low-value purchase or Stripe-supported test checkout end-to-end, verify the redirect, all lessons, and bundle unlock across browsers. Be aware real live-mode charges and refunds can incur fees.
- Verify Stripe receipt/customer support details, refund policy, refund/access revocation workflow and purchase dispute handling.
- Verify scripts in their corresponding Roblox Studio, Minecraft Education, and Godot app versions. Source/snippet review is **not** full engine-based testing.
- Arrange a manual paid-customer recovery process. Do not claim automated email delivery.
- If marketing to minors, follow relevant privacy, parental consent, advertising and platform rules.

## Official reference documentation

- https://create.roblox.com/docs/scripting
- https://create.roblox.com/docs/scripting/events
- https://minecraft.makecode.com/setup/minecraft-education-edition
- https://minecraft.makecode.com/reference/player/on-chat-command
- https://minecraft.makecode.com/reference/agent
- https://docs.godotengine.org/en/stable/tutorials/2d/2d_movement.html
