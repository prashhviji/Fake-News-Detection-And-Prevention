type Props = {
  reasons: string[];
  sources: { name: string; url: string }[];
};

export default function ExplainPanel({ reasons, sources }: Props) {
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-5 text-white backdrop-blur">
      <div className="mb-4 text-sm text-white/70">Why this score?</div>
      {reasons.length === 0 ? (
        <div className="text-sm text-white/60">
          Submit content to see an explainable breakdown across textual, visual, and source signals.
        </div>
      ) : (
        <ul className="space-y-2 text-sm text-white/90">
          {reasons.map((r, i) => (
            <li key={i} className="rounded-lg border border-white/10 bg-black/30 p-3">
              {r}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 text-sm text-white/70">Sources</div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {(sources.length ? sources : [
          { name: "Google Fact Check", url: "https://toolbox.google.com/factcheck/explorer" },
          { name: "PolitiFact", url: "https://www.politifact.com/" },
          { name: "Snopes", url: "https://www.snopes.com/" },
        ]).map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/90 hover:bg-white/10"
          >
            {s.name}
          </a>
        ))}
      </div>
    </div>
  );
}


