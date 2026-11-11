# CODE THE GAME — Stripe read-only checkout configuration audit

Audit date: 2026-11-10 (Pacific). Source: connected Clearline Code Stripe account, live mode, read-only Payment Link retrieval. **No charges or link modifications performed.** Never record or copy private URL fragments.

| Product | Link ID | Live active | Completion type | Destination path | Fragment pathway names | Automatic Stripe Tax |
|---|---|---|---|---|---|---|
| Roblox Creator | plink_1UaMzwRuy3ohymOHZIIbzLch | Yes | redirect | /clearline-portfolio/code-the-game/learn/ | roblox | Disabled |
| Minecraft Coding | plink_1UaMzzRuy3ohymOHA5BER4Bn | Yes | redirect | /clearline-portfolio/code-the-game/learn/ | minecraft | Disabled |
| Indie Game Developer | plink_1UaN01Ruy3ohymOHbvmJnVr2 | Yes | redirect | /clearline-portfolio/code-the-game/learn/ | indie | Disabled |
| Complete Bundle | plink_1UaN02Ruy3ohymOHkctYwfmd | Yes | redirect | /clearline-portfolio/code-the-game/learn/ | roblox, minecraft, indie | Disabled |

## What this proves
All four live Stripe Payment Links are active and configured to redirect to the existing reader path. Their fragment parameter *names* match the reader's expected pathways. The bundle contains all three pathway parameters. No bearer tokens are included in this report.

## What it does NOT prove
- A buyer's actual successful redirect, decryption or lesson delivery
- That the keys decrypt the current encrypted packs
- That course code executes in Roblox Studio, Minecraft Education or Godot
- That the current tax configuration satisfies legal obligations
- That payment confirmation or customer service is reliable

## Next safe validation
1. Verify reader client-side behavior using isolated nonproduction encrypted fixtures and browser automation.
2. Check browser support and failure-state messaging.
3. Run manual real-payment fulfillment only after explicit purchase approval or a supported safe sandbox configuration.
4. Do not publish bearer URLs, key values, checkout receipts or customer identifiers.
