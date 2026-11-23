# MUSE visual system

## Applied visual plugins

**Awesome DESIGN.md:** read the full skill, reference index, and bundled `runwayml/DESIGN.md` study. Applied its image-first editorial hierarchy, single sans-serif family, tight display type, 8px spacing rhythm, minimal borders, 4–8px radii, and zero shadows. This is a static reference study, not a claim about Runway's current live website. No Runway copy, logo, or proprietary imagery is reused.

**Engineering Suite Brand Kit:** read the full `brandkit` skill and generated one compact 2×2 visual-direction board through native image generation using the existing NOVA, AMARA, and LUNA portraits as viewed references. Applied its luxury/editorial restraint, sparse wordmark, repeated palette, generous gutters, and believable website application. No third-party generation credits were purchased.

Board generated successfully: `/workspace/scratch/a53481e443de/generated_images/exec-be6f6c51-4530-4932-b2d1-615743c63d59.png`. It is a conceptual identity board, not a screenshot of the deployed store. Its chalk gallery is a light-surface application of the same system; the production page uses the dark gallery and chalk offer strip below.

## Brand direction

An editorial casting desk for fictional creative characters. The portraits carry the visual interest. MUSE is a clean typographic wordmark; photographic frames supply the visual metaphor. Keep the existing adult identities and truthful AI disclosure.

## Tokens

```css
:root {
  --ink: #15131b;
  --chalk: #f5f2ef;
  --lilac: #c5b4fa;
  --muted-on-ink: #bbb5c5;
  --muted-on-chalk: #625d6b;
  --rule-on-ink: #39343f;
  --rule-on-chalk: #d8d2dc;
  --font: Inter, ui-sans-serif, system-ui, -apple-system,
          BlinkMacSystemFont, "Segoe UI", sans-serif;
  --page-width: 1320px;
  --gutter: clamp(20px, 4vw, 64px);
  --section-gap: clamp(40px, 5vw, 72px);
  --image-gap: 16px;
  --radius: 6px;
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-6: 48px;
  --space-8: 64px;
}
```

- Single font family; no font download required. System fallback is intentional.
- Hero: `clamp(48px, 7vw, 96px)`, weight 400, line-height 1, tracking `-.05em`.
- Wordmark: 24px, weight 500, tracking `-.04em`.
- Character names: 22px, weight 500. Captions/controls: 14–16px, weight 400–500. Body: 16px, line-height 1.45.
- Uppercase labels: 12px, tracking `.06em`.
- Images have 0–6px corners. Buttons have 6px corners and at least 44px height. No pills, shadows, gradients, glow, decorative stars, or stacked feature cards.
- Lilac belongs to the primary action and keyboard focus. The portraits provide all other color.

## Exactly two page sections

### 1. Dark gallery

Small header: MUSE / by APERTURE and one link to the kit. No expanded navigation.

**Headline:** Your next muse.

**One-line support:** AI characters for your next creative project.

Show the real `assets/nova.webp`, `assets/amara.webp`, and `assets/luna.webp` images at large scale in a three-column desktop gallery. Preserve 3:4 portrait proportions, use `object-fit: cover`, and keep faces visible. Captions contain the character name only. No duplicate portrait gallery farther down the page.

On narrow screens use one clear portrait at a time with compact named controls or a simple native horizontal gallery. All names remain reachable without a hidden menu. Avoid autoplay and moving marquees.

Small truthful disclosure: **Fictional adults. AI-generated.**

### 2. Chalk kit strip

**Heading:** MUSE 01 Creator Kit

**One sentence:** Three portraits, character files, 12 scene prompts, a guide and seven captions.

One primary action downloads the existing evaluation archive. Keep the existing $19 license and from-$99 custom inquiry semantics accurate; checkout remains unavailable unless a valid checkout URL is configured. A custom inquiry is not an order. Full license/privacy details may remain in accessible dialogs or direct text links, rather than adding more page sections.

The files remain publicly available for personal evaluation. Payment grants the stated nonexclusive commercial permission; no exclusive ownership, protected download, chatbot, animation, rigging, credits, model-release, testimonial, or earnings claim is added.

## Implementation boundary

Use the three existing portraits and downloadable kit unchanged. Preserve useful keyboard focus and reduced-motion behavior. Keep explanatory/legal detail available on demand, with the main page reduced to the headline, portraits, a short kit description, and clear actions. This document and the generated brand board are the contributions from the two visual plugins; they do not assert a deployment occurred.
