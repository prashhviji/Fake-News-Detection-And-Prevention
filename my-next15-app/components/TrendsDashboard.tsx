type Datum = { label: string; value: number };

type Props = {
  data: {
    topics: Datum[];
    regions: Datum[];
    sources: Datum[];
  };
};

export default function TrendsDashboard({ data }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white backdrop-blur">
      <div className="mb-4 text-sm text-white/70">Historical misinformation trends</div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <TrendCard title="Topics" items={data.topics} />
        <TrendCard title="Sources" items={data.sources} />
        <TrendCard title="Regions" items={data.regions} />
      </div>
    </div>
  );
}

function TrendCard({ title, items }: { title: string; items: Datum[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="mb-3 text-sm text-white/80">{title}</div>
      <ul className="space-y-2 text-sm">
        {items.map((it) => (
          <li key={it.label} className="flex items-center justify-between gap-3">
            <span className="text-white/80">{it.label}</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white/80"
                  style={{ width: `${Math.min(100, it.value)}%` }}
                />
              </div>
              <span className="w-10 text-right text-white/60">{it.value}%</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


