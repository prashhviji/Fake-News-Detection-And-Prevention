"use client";

import { useRef, useState } from "react";

type Props = {
  onSubmit: (payload: { type: "text" | "url" | "image" | "video"; text?: string; url?: string; file?: File }) => void;
};

export default function SubmissionForm({ onSubmit }: Props) {
  const [mode, setMode] = useState<"text" | "url" | "image" | "video">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function submit() {
    if (mode === "text" && text.trim()) onSubmit({ type: "text", text });
    else if (mode === "url" && url.trim()) onSubmit({ type: "url", url });
    else if ((mode === "image" || mode === "video") && fileInputRef.current?.files?.[0]) {
      onSubmit({ type: mode, file: fileInputRef.current.files[0] });
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex overflow-hidden rounded-full border border-white/15 bg-white/5 p-1 text-xs">
          {(["text", "url", "image", "video"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-3 py-1.5 transition-colors ${mode === m ? "bg-white text-black" : "text-white/80 hover:bg-white/10"}`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="text-xs text-white/60">Submit text, URL, image, or video for verification.</div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        {mode === "text" && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text to verify..."
            className="min-h-[120px] w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white placeholder-white/40 outline-none ring-0 focus:border-white/30"
          />
        )}

        {mode === "url" && (
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a URL (post, article, video)..."
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white placeholder-white/40 outline-none ring-0 focus:border-white/30"
          />
        )}

        {(mode === "image" || mode === "video") && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              ref={fileInputRef}
              type="file"
              accept={mode === "image" ? "image/*" : "video/*"}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-white/90"
            />
          </div>
        )}

        <div className="flex items-end">
          <button
            onClick={submit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Verify
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 5L20 12L13 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-white/60">
        We never store your uploads. By verifying, you agree to basic usage analytics.
      </div>
    </div>
  );
}


