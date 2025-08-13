type Props = {
  score: number;
  verdict: string;
};

export default function ScoreCard({ score, verdict }: Props) {
  const hue = Math.round((score / 100) * 120); // 0=red,120=green
  const color = `hsl(${hue} 80% 55%)`;
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-5 text-white backdrop-blur">
      <div className="text-sm text-white/70">AI credibility score</div>
      <div className="mt-2 flex items-end gap-3">
        <div className="text-5xl font-semibold" style={{ color }}>
          {score}
        </div>
        <div className="mb-1 text-sm text-white/70">/ 100</div>
      </div>
      <div className="mt-1 text-sm text-white/90">{verdict}</div>

      <div className="mt-5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 text-xs text-white/70">
        <li className="rounded-lg border border-white/10 bg-black/30 p-3">
          Text
          <div className="mt-1 text-white">NLP + claim matching</div>
        </li>
        <li className="rounded-lg border border-white/10 bg-black/30 p-3">
          Image
          <div className="mt-1 text-white">Reverse search + EXIF</div>
        </li>
        <li className="rounded-lg border border-white/10 bg-black/30 p-3">
          Video
          <div className="mt-1 text-white">Keyframes + captions</div>
        </li>
        <li className="rounded-lg border border-white/10 bg-black/30 p-3">
          Source
          <div className="mt-1 text-white">Reputation graph</div>
        </li>
      </ul>
    </div>
  );
}


