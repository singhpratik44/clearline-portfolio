import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ACTIONS, decodeGift, feelingInfo, type DecodeResult } from "@/lib/gift";
import { demoMetrics } from "@/lib/gift-service";
import { Creator } from "@/components/gift/Creator";
import { ActionIcon, Seal } from "@/components/gift/Seal";
import { Shell } from "@/components/gift/Shell";

export const Route = createFileRoute("/gift")({
  head: () => ({
    meta: [
      { title: "You've received a gift — APERTURE Gift Cloud" },
      { name: "description", content: "Someone sent you a free digital greeting. Open it to read their letter and share one small moment." },
      { property: "og:title", content: "You've received a gift" },
      { property: "og:description", content: "A free digital greeting is waiting for you. Open it to read the letter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GiftPage,
});

function GiftPage() {
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [stage, setStage] = useState<"sealed" | "opening" | "letter" | "done">("sealed");
  const [action, setAction] = useState<string | null>(null);

  useEffect(() => {
    const read = () => { setResult(decodeGift(window.location.hash)); setStage("sealed"); setAction(null); };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  if (!result) return <Shell><p className="py-20 text-center text-muted-foreground">Unwrapping…</p></Shell>;

  if (result.status !== "ok")
    return (
      <Shell>
        <div className="py-8 text-center animate-rise">
          <Seal className="mx-auto h-28 w-28" />
          <h1 className="mt-4 text-3xl">{result.status === "empty" ? "No gift here yet" : "This gift link couldn't be read"}</h1>
          <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
            {result.status === "empty" ? "Gift links carry their message after a #. Make one for someone now." : "It may have been cut off when copied. Ask the sender to resend it — or make one of your own."}
          </p>
        </div>
        <Creator />
      </Shell>
    );

  const g = result.gift;
  const info = feelingInfo(g.feeling);
  const chosen = ACTIONS.find((a) => a.id === action);

  return (
    <Shell>
      {stage !== "letter" && stage !== "done" ? (
        <div className="py-10 text-center animate-rise">
          <p className="text-sm uppercase tracking-[.25em] text-muted-foreground">A gift for</p>
          <h1 className="mt-2 text-4xl break-words">{g.recipient || "you"}</h1>
          <Seal className="mx-auto mt-6 h-52 w-52" opening={stage === "opening"} />
          <button
            onClick={() => { setStage("opening"); demoMetrics.opened++; setTimeout(() => setStage("letter"), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900); }}
            disabled={stage === "opening"}
            className="btn-gold mt-6 rounded-full px-10 py-4 text-lg font-semibold transition active:scale-[.97]">Open gift</button>
          <p className="mt-4 text-xs text-muted-foreground">Free digital greeting — no physical item.</p>
        </div>
      ) : (
        <div className="space-y-6 py-4">
          <article className="glass rounded-3xl p-6 sm:p-10 animate-rise">
            {info && <p className="text-xs uppercase tracking-[.25em] text-gold">{info.label}{g.occasion ? ` · ${g.occasion}` : ""}</p>}
            <h1 className="mt-3 text-3xl break-words">Dear {g.recipient || "friend"},</h1>
            <p className="mt-4 whitespace-pre-line break-words font-display text-xl leading-relaxed">{g.message || info?.message}</p>
            {g.sender && <p className="mt-6 text-right text-muted-foreground break-words">— {g.sender}</p>}
          </article>

          {stage === "letter" && (
            <section aria-labelledby="act-h" className="animate-rise">
              <h2 id="act-h" className="text-2xl">Choose one small moment</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {ACTIONS.map((a) => (
                  <button key={a.id} onClick={() => setAction(a.id)} aria-pressed={action === a.id}
                    className={`rounded-2xl border p-4 text-left transition active:scale-[.98] ${action === a.id ? "border-ring bg-accent" : "border-border"}`}>
                    <span className="text-gold"><ActionIcon id={a.id} /></span>
                    <span className="mt-2 block font-medium">{a.title}</span>
                  </button>
                ))}
              </div>
              {chosen && (
                <div className="mt-4 rounded-2xl border border-border p-5 animate-rise">
                  <p className="font-display text-lg">{chosen.prompt}</p>
                  <button onClick={() => { setStage("done"); demoMetrics.completed++; }} className="btn-gold mt-4 w-full rounded-full py-3.5 font-semibold">I did it</button>
                </div>
              )}
            </section>
          )}

          {stage === "done" && (
            <>
              <div role="status" className="rounded-2xl border border-ring p-5 text-center animate-rise">
                <p className="font-display text-2xl text-gold-gradient">Moment received.</p>
                <p className="mt-1 text-muted-foreground">You took a breath for {chosen?.title.toLowerCase()}. Now pass the light forward.</p>
              </div>
              <Creator heading="Pass the light forward" />
            </>
          )}
        </div>
      )}
      <p className="mt-6 text-center text-sm"><Link to="/" className="text-muted-foreground underline underline-offset-4">Make your own gift</Link></p>
    </Shell>
  );
}
