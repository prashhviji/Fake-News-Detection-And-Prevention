import WarpBeams from "./Warpbeam";

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <WarpBeams />

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[36rem] rounded-full bg-fuchsia-400/15 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center px-6 py-24 text-center text-white">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur">
          AI content verification
        </span>

        <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            Sociaguard
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-sm/6 text-white/80 sm:mt-5 sm:text-base md:text-lg">
          Detect AI‑generated and manipulated content across social platforms.
          Real‑time signals, clear explanations, and tooling built for trust & safety teams.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row">
          <a
            href="/verify"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Post for verification
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:translate-x-0.5">
              <path d="M13 5L20 12L13 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </a>
          <a
            href="#learn-more"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/10"
          >
            View demo
          </a>
        </div>
        <div className="mt-3 text-xs text-white/70">
          No credit card required
        </div>

        <div className="mt-12 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur">
            <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-xl font-semibold">99.1%</div>
            <div className="text-xs text-white/70">precision (lab)</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur">
            <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-xl font-semibold"><span className="align-top text-[10px]">&lt;</span>150ms</div>
            <div className="text-xs text-white/70">median latency</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur">
            <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2a10 10 0 00-7.07 17.07L12 22l7.07-2.93A10 10 0 0012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-xl font-semibold">SOC2</div>
            <div className="text-xs text-white/70">in progress</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur">
            <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12h8M12 8v8M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-xl font-semibold">API</div>
            <div className="text-xs text-white/70">REST + Webhooks</div>
          </div>
        </div>

        <a href="#learn-more" className="mt-10 inline-flex items-center gap-2 text-xs text-white/60 hover:text-white/80">
          Scroll to learn more
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M19 12l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  );
}


