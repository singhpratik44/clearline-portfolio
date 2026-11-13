export function Seal({ className = "", opening = false }: { className?: string; opening?: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="A gift box tied with a golden ribbon">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--gold-soft)" /><stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
        <radialGradient id="halo"><stop offset="0" stopColor="var(--gold)" stopOpacity=".45" /><stop offset="1" stopColor="var(--gold)" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="100" cy="110" r="90" fill="url(#halo)" className="animate-shimmer" />
      <rect x="45" y="90" width="110" height="80" rx="10" fill="var(--emerald-deep)" stroke="url(#g)" strokeWidth="2" />
      <rect x="94" y="90" width="12" height="80" fill="url(#g)" />
      <g className={opening ? "animate-lid" : ""} style={{ transformOrigin: "100px 80px" }}>
        <rect x="38" y="70" width="124" height="24" rx="6" fill="var(--card)" stroke="url(#g)" strokeWidth="2" />
        <rect x="94" y="70" width="12" height="24" fill="url(#g)" />
        <path d="M100 70c-18-26-44-20-36-4 6 10 24 6 36 4zm0 0c18-26 44-20 36-4-6 10-24 6-36 4z" fill="none" stroke="url(#g)" strokeWidth="5" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path key={a} d="M16 4 L21 13" stroke="var(--gold)" strokeWidth="1.5" transform={`rotate(${a} 16 16)`} />
      ))}
    </svg>
  );
}

export function ActionIcon({ id }: { id: string }) {
  const p: Record<string, React.ReactNode> = {
    awareness: <><circle cx="12" cy="12" r="3" /><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /></>,
    joy: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" /></>,
    love: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
    wonder: <path d="M12 3l2 6 6 .5-4.7 3.8 1.6 6.2L12 16l-4.9 3.5 1.6-6.2L4 9.5 10 9z" />,
  };
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p[id]}</svg>
  );
}
