# Storefront implementation

| Plugin | Contribution |
| --- | --- |
| Frontend Design Premium | The upstream frontend-design skill informed the printable-sheet stack in perspective and the use of the two actual activity types for the hero diagrams. Frontend Design Premium informed keyboard-accessible controls, a live caption, reserved feedback space, shared runtime tokens and reduced motion. |
| Ad Copywriter | The landing-page copy skill informed the sample-to-preview-to-purchase sequence, specific feature and benefit copy, the three-step purchase guide, price-labelled calls to action and a five-question FAQ. |
| 3DJ Studio | The storefront includes the separately authored staircase model viewer as an activity visitors can try below the two product offers. |

The two original storefront samples give immediate reasons for correct and incorrect choices. Public product preview links precede the purchase actions. Household-use license limits and the one-time price appear before checkout.

## Verification

- `node --check app.js` passed.
- Node VM interaction assertions passed for switching between deck modes, selection and feedback for both samples, and closing the mobile menu with a link or Escape.
- Standard-library HTML parsing verified unique IDs, linked section targets, labelled groups and the presence of referenced local files.
- A local Chromium launch failed because this execution environment blocked Chromium's process singleton socket. No visual or keyboard browser pass is implied by the Node VM assertions.
