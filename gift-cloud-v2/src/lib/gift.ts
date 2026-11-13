// Pure, client-side gift payload codec. Compatible with the legacy Render payload
// {recipient,sender,message,feeling,occasion} stored as base64url UTF-8 JSON in the URL fragment.

export const LIMITS = { name: 60, message: 240, occasion: 60, fragment: 2000 } as const;

export const FEELINGS = ["gratitude", "encouragement", "joy", "wonder"] as const;
export type Feeling = (typeof FEELINGS)[number];

export interface GiftPayload {
  recipient: string;
  sender: string;
  message: string;
  feeling: string;
  occasion: string;
}

export const TEMPLATES: Record<Feeling, { label: string; line: string; message: string }> = {
  gratitude: {
    label: "Gratitude",
    line: "For the quiet ways you show up.",
    message: "Thank you for the kindness you give without being asked. It has mattered more than you know.",
  },
  encouragement: {
    label: "Encouragement",
    line: "For the road you're on right now.",
    message: "You are doing better than you think. Keep going — I'm in your corner.",
  },
  joy: {
    label: "Joy",
    line: "For the light you carry into rooms.",
    message: "You make ordinary days feel brighter. I hope today gives some of that back to you.",
  },
  wonder: {
    label: "Wonder",
    line: "For the curiosity that keeps you young.",
    message: "May today surprise you with something beautiful you weren't looking for.",
  },
};

export const ACTIONS = [
  { id: "awareness", title: "Awareness", prompt: "Take three slow breaths and notice one thing you can hear right now." },
  { id: "joy", title: "Joy", prompt: "Recall one small moment from this week that made you smile. Hold it for ten seconds." },
  { id: "love", title: "Love", prompt: "Send a two-word message to someone you miss: “Thinking of you.”" },
  { id: "wonder", title: "Wonder", prompt: "Look up — at the sky, a ceiling, a tree — and find something you've never noticed." },
] as const;

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B\u202A-\u202E\u2066-\u2069]/g;

/** Strip control/bidi-override chars, normalise, trim, clamp to N code points. */
export function clean(value: unknown, max: number, multiline = false): string {
  if (typeof value !== "string") return "";
  let s = value.normalize("NFC").replace(CONTROL, "");
  s = multiline ? s.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
  return Array.from(s.trim()).slice(0, max).join("");
}

export function normalizePayload(raw: unknown): GiftPayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const p: GiftPayload = {
    recipient: clean(r['recipient'], LIMITS.name),
    sender: clean(r['sender'], LIMITS.name),
    message: clean(r['message'], LIMITS.message, true),
    feeling: clean(r['feeling'], 30).toLowerCase(),
    occasion: clean(r['occasion'], LIMITS.occasion),
  };
  if (!p.recipient && !p.message) return null;
  return p;
}

export function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/]*$/.test(b64) || b64.length % 4 === 1) throw new Error("bad base64");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function encodeGift(p: GiftPayload): string {
  const n = normalizePayload(p);
  if (!n) throw new Error("A gift needs a recipient or a message.");
  const frag = toBase64Url(JSON.stringify(n));
  if (frag.length > LIMITS.fragment) throw new Error("Gift is too long to fit in a link.");
  return frag;
}

export type DecodeResult =
  | { status: "empty" }
  | { status: "invalid"; reason: string }
  | { status: "ok"; gift: GiftPayload };

export function decodeGift(hash: string | null | undefined): DecodeResult {
  const frag = (hash ?? "").replace(/^#/, "").trim();
  if (!frag) return { status: "empty" };
  if (frag.length > LIMITS.fragment) return { status: "invalid", reason: "too-long" };
  try {
    const gift = normalizePayload(JSON.parse(fromBase64Url(decodeURIComponent(frag))));
    return gift ? { status: "ok", gift } : { status: "invalid", reason: "shape" };
  } catch {
    return { status: "invalid", reason: "decode" };
  }
}

export function giftUrl(origin: string, p: GiftPayload): string {
  return `${origin.replace(/\/$/, "")}/gift#${encodeGift(p)}`;
}

/** Optional check that a pasted gift link is a well-formed http(s) /gift URL with a valid payload. */
export function validateGiftUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return /^https?:$/.test(u.protocol) && u.pathname.replace(/\/$/, "") === "/gift" && decodeGift(u.hash).status === "ok";
  } catch {
    return false;
  }
}

export function shareText(p: GiftPayload): string {
  // Short on purpose: long text can push the URL out of iMessage previews.
  return p.recipient ? `${p.recipient}, a small gift for you.` : "A small gift for you.";
}

export function feelingInfo(f: string) {
  return (FEELINGS as readonly string[]).includes(f) ? TEMPLATES[f as Feeling] : null;
}
