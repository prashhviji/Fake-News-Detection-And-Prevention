type Item = { id: string; title: string; score: number; verdict: string; date: string };

export default function HistoryList({ items }: { items: Item[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white backdrop-blur">
      <div className="mb-4 text-sm text-white/70">Fact-check history</div>
      {items.length === 0 ? (
        <div className="text-sm text-white/60">Submissions you verify will appear here.</div>
      ) : (
        <ul className="divide-y divide-white/10 text-sm">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-white/90">{it.title}</div>
                <div className="text-xs text-white/60">{it.date}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/80">
                  {it.verdict}
                </span>
                <span className="text-white">{it.score}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


