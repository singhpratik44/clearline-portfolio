# Portrait framing — AI Headshot Generator photo critique

Inspected all three actual 1086×1448 PNGs. Verdict: use the supplied portraits with presentation-only crops. Preserve every source file.

| Character | Card ratio | object-position | Decision |
|---|---|---|---|
| Nova | 3 / 4 | 50% 18% | Keep the silver jacket and clear teal separation. |
| Amara | 3 / 4 | 52% 16% | Preserve headroom; slightly right anchors the face if a wider crop is used. |
| Luna | 3 / 4 | 52% 18% | Keep the hand and chin together; avoid a tight square crop. |

Use object-fit:cover. At the native 3:4 ratio there is no crop: the positions become meaningful only if the card aspect ratio changes. For 4:5 cards retain these positions; do not crop to a face-only thumbnail. Names belong below the photograph on a solid surface, never across eyes or hands. At small widths retain a 3:4 card in a horizontal snap gallery rather than compressing three tiny faces into a row. No face, skin, body, age, lighting or source-image alteration was performed.

```css
.muse-portrait{aspect-ratio:3/4;object-fit:cover;object-position:var(--portrait-position,50% 18%)}
[data-character=nova]{--portrait-position:50% 18%}
[data-character=amara]{--portrait-position:52% 16%}
[data-character=luna]{--portrait-position:52% 18%}
```
