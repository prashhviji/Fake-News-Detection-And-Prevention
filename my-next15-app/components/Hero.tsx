import WarpBeams from "./Warpbeam";

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <WarpBeams />

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-6 text-center text-white">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur">
          Real-time content integrity
        </span>
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
          Sociaguard
        </h1>
        <p className="mt-4 max-w-2xl text-balance text-sm/6 text-white/80 sm:text-base md:text-lg">
          Detect AI‑generated and manipulated content across social platforms with
          confidence. Protect your brand and community with fast, explainable
          verification.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="#get-started"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Get started
          </a>
          <a
            href="#learn-more"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Learn more
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6 opacity-80 sm:grid-cols-4">
          <div className="text-left">
            <div className="text-2xl font-semibold">99.1%</div>
            <div className="text-xs text-white/70">precision (lab)</div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-semibold"><span className="align-top text-sm">&lt;</span>150ms</div>
            <div className="text-xs text-white/70">median latency</div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-semibold">SOC2</div>
            <div className="text-xs text-white/70">in progress</div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-semibold">API</div>
            <div className="text-xs text-white/70">REST + Webhooks</div>
          </div>
        </div>
      </div>
    </section>
  );
}


