// Integration seam for a future backend (e.g. the production MCP tools make_gift_plan /
// create_shareable_gift). The preview uses the local, client-only implementation; nothing leaves the browser.
import { giftUrl, TEMPLATES, type Feeling, type GiftPayload } from "./gift";

export interface GiftService {
  makeGiftPlan(input: { feeling: Feeling; recipient: string }): Promise<{ message: string }>;
  createShareableGift(payload: GiftPayload, origin: string): Promise<{ url: string }>;
}

export const localGiftService: GiftService = {
  async makeGiftPlan({ feeling }) {
    return { message: TEMPLATES[feeling].message };
  },
  async createShareableGift(payload, origin) {
    return { url: giftUrl(origin, payload) };
  },
};

// In-memory demo counters: reset on reload, never persisted or sent anywhere.
export const demoMetrics = { created: 0, opened: 0, completed: 0 };
