import { describe, expect, it } from "vitest";
import { decodeGift, encodeGift, toBase64Url, LIMITS, validateGiftUrl, clean } from "./gift";

const base = { recipient: "Asha", sender: "Pratik", message: "Thank you", feeling: "gratitude", occasion: "" };

describe("gift codec", () => {
  it("round-trips Punjabi, emoji and smart punctuation", () => {
    const g = { ...base, recipient: "ਹਰਪ੍ਰੀਤ", message: "“You’re a star” 🌟✨ — ਧੰਨਵਾਦ" };
    const r = decodeGift("#" + encodeGift(g));
    expect(r).toEqual({ status: "ok", gift: g });
  });
  it("decodes a legacy Render payload", () => {
    const legacy = toBase64Url(JSON.stringify({ recipient: "Mo", sender: "Lee", message: "Hi", feeling: "joy", occasion: "Birthday" }));
    const r = decodeGift(legacy);
    expect(r.status).toBe("ok");
    if (r.status === "ok") expect(r.gift.occasion).toBe("Birthday");
  });
  it("treats missing fragment as empty", () => {
    expect(decodeGift("").status).toBe("empty");
    expect(decodeGift("#").status).toBe("empty");
  });
  it("rejects malformed fragments", () => {
    for (const bad of ["#@@@", "#bm90LWpzb24", "#" + toBase64Url("[1,2]"), "#" + toBase64Url("{}"), "#%E0%A4%A"])
      expect(decodeGift(bad).status).toBe("invalid");
  });
  it("rejects invalid UTF-8", () => {
    expect(decodeGift("#" + btoa("\xff\xfe").replace(/=/g, "")).status).toBe("invalid");
  });
  it("clamps names to 60 and message to 240 code points", () => {
    const r = decodeGift(encodeGift({ ...base, recipient: "a".repeat(100), message: "😀".repeat(300) }));
    if (r.status !== "ok") throw new Error();
    expect(Array.from(r.gift.recipient)).toHaveLength(60);
    expect(Array.from(r.gift.message)).toHaveLength(240);
  });
  it("guards fragment length", () => {
    expect(decodeGift("#" + "A".repeat(LIMITS.fragment + 1))).toEqual({ status: "invalid", reason: "too-long" });
  });
  it("keeps HTML as inert text and strips bidi/control characters", () => {
    const r = decodeGift(encodeGift({ ...base, recipient: "<img src=x onerror=alert(1)>\u202E" }));
    if (r.status !== "ok") throw new Error();
    expect(r.gift.recipient).toBe("<img src=x onerror=alert(1)>");
    expect(clean("a\u0000b", 10)).toBe("ab");
  });
  it("validates gift URLs", () => {
    expect(validateGiftUrl("https://x.dev/gift#" + encodeGift(base))).toBe(true);
    expect(validateGiftUrl("javascript:alert(1)")).toBe(false);
    expect(validateGiftUrl("https://x.dev/other#" + encodeGift(base))).toBe(false);
  });
});
