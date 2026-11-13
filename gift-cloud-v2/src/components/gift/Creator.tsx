import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FEELINGS, LIMITS, TEMPLATES, encodeGift, shareText, type Feeling, type GiftPayload } from "@/lib/gift";
import { demoMetrics, localGiftService } from "@/lib/gift-service";

const field = "w-full rounded-xl bg-input/30 border border-input px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none";

export function Creator({ defaultSender = "", heading = "Create a gift" }: { defaultSender?: string; heading?: string }) {
  const navigate = useNavigate();
  const [feeling, setFeeling] = useState<Feeling>("gratitude");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState(defaultSender);
  const [message, setMessage] = useState(TEMPLATES.gratitude.message);
  const [edited, setEdited] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const payload = (): GiftPayload => ({ recipient, sender, message, feeling, occasion: "" });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!recipient.trim()) return setError("Add who the gift is for.");
    try {
      const { url } = await localGiftService.createShareableGift(payload(), window.location.origin);
      demoMetrics.created++;
      setUrl(url);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function testGift() {
    const hash = encodeGift({ recipient: "ਹਰਪ੍ਰੀਤ (Test)", sender: "APERTURE", message: "“A small light, passed hand to hand.” ✨", feeling: "wonder", occasion: "Test gift" });
    navigate({ to: "/gift", hash });
  }

  const count = Array.from(message).length;

  return (
    <section aria-labelledby="create-h" className="glass rounded-3xl p-5 sm:p-8 animate-rise">
      <h2 id="create-h" className="text-2xl sm:text-3xl">{heading}</h2>
      {url ? (
        <ShareBox url={url} text={shareText(payload())} onReset={() => setUrl(null)} />
      ) : (
        <form onSubmit={create} className="mt-5 space-y-5" noValidate>
          <fieldset>
            <legend className="mb-2 text-sm text-muted-foreground">Choose a feeling</legend>
            <div className="grid grid-cols-2 gap-2">
              {FEELINGS.map((f) => (
                <label key={f} className={`cursor-pointer rounded-xl border p-3 transition active:scale-[.98] ${feeling === f ? "border-ring bg-accent" : "border-border"}`}>
                  <input type="radio" name="feeling" value={f} checked={feeling === f} className="sr-only"
                    onChange={() => { setFeeling(f); if (!edited) setMessage(TEMPLATES[f].message); }} />
                  <span className="block font-medium">{TEMPLATES[f].label}</span>
                  <span className="block text-xs text-muted-foreground">{TEMPLATES[f].line}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-1 block text-sm">For</span>
              <input className={field} value={recipient} maxLength={LIMITS.name * 2} onChange={(e) => setRecipient(e.target.value)} placeholder="Their name" autoComplete="off" />
            </label>
            <label className="block"><span className="mb-1 block text-sm">From</span>
              <input className={field} value={sender} maxLength={LIMITS.name * 2} onChange={(e) => setSender(e.target.value)} placeholder="Your name (optional)" autoComplete="off" />
            </label>
          </div>
          <label className="block"><span className="mb-1 flex justify-between text-sm"><span>Message</span><span className={count > LIMITS.message ? "text-destructive" : "text-muted-foreground"}>{count}/{LIMITS.message}</span></span>
            <textarea className={`${field} min-h-28`} value={message} onChange={(e) => { setMessage(e.target.value); setEdited(true); }} />
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" className="btn-gold flex-1 rounded-full px-6 py-3.5 font-semibold transition active:scale-[.98]">Create gift link</button>
            <button type="button" onClick={testGift} className="rounded-full border border-border px-6 py-3.5 transition hover:bg-accent">Test gift</button>
          </div>
          <p className="text-xs text-muted-foreground">Free digital greeting — no physical item, no payment. Your words live only inside the link; nothing is sent to a server.</p>
        </form>
      )}
    </section>
  );
}

export function ShareBox({ url, text, onReset }: { url: string; text: string; onReset: () => void }) {
  const [status, setStatus] = useState("");
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  async function copy() {
    try { await navigator.clipboard.writeText(url); setStatus("Link copied."); }
    catch {
      const el = document.getElementById("gift-url") as HTMLInputElement | null;
      el?.select(); setStatus("Select and copy the link above.");
    }
  }
  async function share() {
    try { await navigator.share({ title: "A gift for you", text, url }); setStatus("Shared."); }
    catch (e) { if ((e as Error).name !== "AbortError") copy(); }
  }

  return (
    <div className="mt-5 space-y-4 animate-rise">
      <p className="text-muted-foreground">Your gift is ready. Send it however you like.</p>
      <input id="gift-url" readOnly value={url} aria-label="Gift link" onFocus={(e) => e.target.select()} className={`${field} font-mono text-xs`} />
      <div className="flex flex-col gap-2 sm:flex-row">
        {canShare && <button onClick={share} className="btn-gold flex-1 rounded-full px-6 py-3.5 font-semibold">Share</button>}
        <button onClick={copy} className={`${canShare ? "border border-border" : "btn-gold"} flex-1 rounded-full px-6 py-3.5 font-semibold`}>Copy link</button>
        <a href={url} className="flex-1 rounded-full border border-border px-6 py-3.5 text-center">Preview</a>
      </div>
      <p aria-live="polite" className="min-h-5 text-sm text-gold">{status}</p>
      <button onClick={onReset} className="text-sm text-muted-foreground underline underline-offset-4">Make another</button>
    </div>
  );
}
