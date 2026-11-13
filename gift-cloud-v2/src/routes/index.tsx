import { createFileRoute } from "@tanstack/react-router";
import { Creator } from "@/components/gift/Creator";
import { Seal } from "@/components/gift/Seal";
import { Shell } from "@/components/gift/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "APERTURE Gift Cloud — Send a free moment of light" },
      { name: "description", content: "Create a free digital greeting that opens into a personal letter and one small, meaningful moment. No sign-in, fully private." },
      { property: "og:title", content: "APERTURE Gift Cloud — Send a free moment of light" },
      { property: "og:description", content: "A free digital greeting that opens into a personal letter and one meaningful moment. No sign-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Shell>
      <section className="py-8 text-center animate-rise">
        <Seal className="mx-auto h-40 w-40 animate-float" />
        <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">Give someone a <em className="text-gold-gradient not-italic">moment of light</em>.</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">A free digital greeting that opens into your words and one small act of awareness, joy, love or wonder — then they pass it on.</p>
      </section>
      <Creator />
      <section aria-label="Privacy" className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
        {[["No sign-in", "No accounts, no email."], ["Stays in the link", "Your message is encoded in the link itself — never stored on a server."], ["Truly free", "A digital greeting. No physical item, no payment."]].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-border p-4"><p className="font-medium text-gold">{t}</p><p className="mt-1 text-muted-foreground">{d}</p></div>
        ))}
      </section>
    </Shell>
  );
}