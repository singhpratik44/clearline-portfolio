# AI GIRLS by APERTURE — Design context

## Purpose and register

A single public storefront for MUSE 01, an original fictional adult AI character collection. The page helps creative buyers inspect the actual kit, understand the commercial license and continue to hosted Stripe checkout. It is a marketing and commerce landing page, not an authenticated application or companion service.

## North star

An editorial casting desk: strong image-led character art, considered fashion-magazine typography, clear creative materials and one honest purchase. The signature is the oversized MUSE collection word over a selectable full-height portrait, followed by an inspectable cast and a tangible layered kit composition.

## Audience and voice

English-speaking visual creators, writers and small brand teams exploring fictional character concepts. Speak concretely about files, creative uses and purchase rights. Avoid fabricated endorsements, scarcity, conversion figures and promises of repeatable AI identity. Every depicted character is fictional and aged 25 or older.

## Runtime token owner

The `:root` block of `styles.css` is the canonical runtime token source. This document records intent and naming; values are not generated through additional adapters. Shared buttons, modal dialogs, type and spacing all derive from that stylesheet.

| Token | Value | Purpose |
| --- | --- | --- |
| ink | #1b1920 | Plum-black text and hero background |
| paper | #eee9e5 | Neutral product canvas and light type |
| paper-deep | #e2dbd7 | Creator kit surface |
| muted | #625d64 | Secondary body copy on light surfaces |
| line | #c8c0c3 | Dividers and understated structure |
| silver | #becfce | Nova and hero accent |
| iris | #b5a5cc | Custom concept accent |
| clay | #ca8f79 | Amara palette reference |
| focus | #775089 | Keyboard focus and text-link emphasis |

## Typography

Georgia is the display face, using restrained italic contrast to distinguish the creative invitation from practical content. Helvetica Neue / Helvetica / Arial carries body and action text. Courier New carries compact factual labels. All are system stacks, avoiding external font downloads and layout shifts.

## Layout

Desktop hero: split editorial copy and large portrait. Collection: three image-first columns, real style filters. Kit: stacked art preview and contents with purchase details. Custom service: visually distinct dark section, quote inquiry only. FAQ uses native disclosure semantics. Mobile follows the same content order with generous image space and a working navigation toggle; imagery reserves geometry.

## Interaction contracts

- Three hero selector buttons update the portrait, caption, alt text and pressed state.
- Four style filter buttons show the matching fixed catalog and announce result counts.
- Character previews use native modal dialogs with names, descriptions, Escape, inert backgrounds and focus restoration.
- The main purchase button stays disabled and explains unavailability until a valid HTTPS Stripe checkout URL is supplied in root-owned `config.js`.
- Purchase opens a license-summary dialog. A checkbox enables continuation to Stripe; no charge occurs within this website.
- Free download is explicitly personal evaluation. Payment licenses commercial use; public assets are not presented as a protected content unlock.
- Custom work opens a prefilled email inquiry and is never described as an accepted order.
- No analytics, account system, local storage, advertising scripts or site-set cookies.

## Accessibility and stability

Native controls, visible focus, screen-reader status, real labels and links, native details and dialogs, touch-sized main controls, reduced-motion override, documented scrollbar tokens, reserved image ratios. No autoplay, scroll hijacking, browser alert/confirm/prompt, or hover-only essential information. Character overlay labels remain visible on mobile and all previews have text buttons.

## Assets and integration ownership

Root provides `assets/nova.png`, `assets/amara.png`, `assets/luna.png`, `config.js`, the download ZIP, final license terms, checkout URLs and deployment. The UI owns `index.html`, `styles.css` and `app.js`. Portrait files are not created by frontend code. No rigged models, live chat, automatic generation or paid API functions are implied.

## Verification scope

Verify hero switching, gallery filters, modal close/Escape/focus, checkout unavailable/available states and consent gate, download target, custom mailto, keyboard and narrow-screen layout. Actual Stripe payment, generated files and hosting configuration require root verification. No test purchase or spending is part of UI verification.
