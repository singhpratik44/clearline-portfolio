import { Link } from "@tanstack/react-router";
import { Mark } from "./Seal";
import { demoMetrics } from "@/lib/gift-service";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg tracking-wide"><Mark className="h-7 w-7" />APERTURE <span className="text-gold">Gift Cloud</span></Link>
        <span className="rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">Preview</span>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-12 space-y-1 text-center text-xs text-muted-foreground">
        <p>Free digital greeting — no physical item. No sign-in, no payment, no tracking.</p>
        <p>Demo counters (this tab only, not saved): {demoMetrics.created} created · {demoMetrics.opened} opened · {demoMetrics.completed} completed</p>
      </footer>
    </div>
  );
}
