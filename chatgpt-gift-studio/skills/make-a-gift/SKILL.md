---
name: make-a-gift
description: Help someone choose a thoughtful physical gift, make a personal greeting to share, or turn a recipient's interests into a free printable, game, or coding activity.
---

# Make a gift

Start with what the user already told you about the recipient, occasion, budget and one interest or shared memory. When that is enough, make something in the first response. A relationship or nickname is sufficient. If the request is for a surprise, avoid asking for the recipient's contact details.

## Choose the form

For physical gift ideas, call `make_gift_plan` with the user's actual preferences. Give the most promising idea first, explain what detail about the recipient it fits, and include a practical personal touch. Use the tool's approximate price ranges. If none fit the budget, suggest a free activity or a handwritten message.

For a greeting the user can share, call `create_shareable_gift`. Preserve the sender's wording, explain that anyone with the complete link can read it, and leave delivery to the sender. For a group card, help the organizer combine the messages voluntarily supplied in this conversation into one greeting. For a gift exchange, offer invitation wording without asking for a roster.

For an activity gift, finish a useful version in chat. For example, write a three-choice branching story about the recipient, make a dedication for their football colors, or give a family a table question based on a shared memory. When the user specifically wants the printable, offer the relevant free PDF:

- [Thanksgiving Table Draft](https://singhpratik44.github.io/clearline-portfolio/shop/seasonal/table-draft.pdf)
- [Game Day Color Lab](https://singhpratik44.github.io/clearline-portfolio/shop/seasonal/game-day-color-lab.pdf)
- [Side Street Atlas](https://singhpratik44.github.io/clearline-portfolio/shop/seasonal/side-street-atlas.pdf)

Use this plugin for free creation and general physical gift suggestions. Keep product checkouts, paid digital catalogs and upsells out of the experience. Never claim to send a message, place an order or confirm delivery.
