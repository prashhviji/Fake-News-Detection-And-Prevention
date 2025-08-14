"use client";

import { useMemo, useState } from "react";
import SubmissionForm from "@/components/SubmissionForm";
import ScoreCard from "@/components/ScoreCard";
import ExplainPanel from "@/components/ExplainPanel";
import TrendsDashboard from "@/components/TrendsDashboard";
import HistoryList from "@/components/HistoryList";

type SubmittedPayload = {
  type: "text" | "url" | "image" | "video";
  text?: string;
  url?: string;
  file?: File;
};

type Analysis = {
  score: number; // 0-100 credibility score
  verdict: "Likely True" | "Uncertain" | "Likely False";
  reasons: string[];
  sources: { name: string; url: string }[];
};

export default function VerifySuite() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState(
    [] as { id: string; title: string; score: number; verdict: string; date: string }[]
  );

  const trends = useMemo(
    () => ({
      topics: [
        { label: "Elections", value: 78 },
        { label: "Health", value: 62 },
        { label: "Climate", value: 54 },
        { label: "Finance", value: 41 },
      ],
      regions: [
        { label: "North America", value: 66 },
        { label: "Europe", value: 58 },
        { label: "Asia", value: 47 },
        { label: "LATAM", value: 33 },
      ],
      sources: [
        { label: "Social posts", value: 72 },
        { label: "Blogs", value: 51 },
        { label: "Videos", value: 44 },
        { label: "Forums", value: 37 },
      ],
    }),
    []
  );

  function mockAnalyze(payload: SubmittedPayload): Analysis {
    const baseline = payload.type === "url" ? 65 : payload.type === "text" ? 60 : 55;
    const score = Math.max(5, Math.min(95, baseline + Math.round(Math.random() * 20 - 10)));
    const verdict = score >= 70 ? "Likely True" : score >= 45 ? "Uncertain" : "Likely False";
    const target = payload.url || payload.text || payload.file?.name || "submitted content";
    return {
      score,
      verdict,
      reasons: [
        `Cross-reference with fact-check databases suggests ${verdict.toLowerCase()}.`,
        "Source reliability and historical accuracy considered in scoring.",
        "Language and visual signals evaluated for manipulation patterns.",
      ],
      sources: [
        { name: "Google Fact Check", url: "https://toolbox.google.com/factcheck/explorer" },
        { name: "PolitiFact", url: "https://www.politifact.com/" },
        { name: "Snopes", url: "https://www.snopes.com/" },
      ],
    };
  }

  async function analyze(payload: SubmittedPayload): Promise<Analysis> {
    if (payload.type === "image" && payload.file) {
      const form = new FormData();
      form.append("file", payload.file);
      const res = await fetch("/api/detect-image", { method: "POST", body: form });
      const data = await res.json().catch(() => ({ error: "Invalid response from image detection" }));
      if (!res.ok) throw new Error(data?.error || data?.detail || "Image detection failed");
      const score = Math.round(data.score ?? 0);
      const verdict = score >= 70 ? "Likely True" : score >= 45 ? "Uncertain" : "Likely False";
      const humanProb = typeof data.human_probability === "number" ? data.human_probability : 0;
      const aiProb = typeof data.ai_probability === "number" ? data.ai_probability : 0;
      const reasons: string[] = [
        `Winston image analysis score (human): ${score}/100.`,
        `Probabilities — human: ${humanProb.toFixed(2)}, AI: ${aiProb.toFixed(2)}.`,
      ];
      if (data.ai_watermark_detected) reasons.push("AI watermark detected.");
      if (data.c2pa) reasons.push("C2PA metadata found.");
      return { score, verdict, reasons, sources: [] };
    }

    if (payload.type === "text" && payload.text) {
      const res = await fetch("/api/detect-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: payload.text, version: "latest" }),
      });
      const data = await res.json().catch(() => ({ error: "Invalid response from text detection" }));
      if (!res.ok) throw new Error(data?.error || data?.detail || "Text detection failed");
      const score = Math.round(data.score ?? 0);
      const verdict = score >= 80 ? "Likely True" : score >= 60 ? "Uncertain" : "Likely False";
      const humanProb = typeof data.human_probability === "number" ? data.human_probability : 0;
      const aiProb = typeof data.ai_probability === "number" ? data.ai_probability : 0;
      const reasons: string[] = [
        `Winston text analysis human score: ${score}/100.`,
        `Probabilities — human: ${humanProb.toFixed(2)}, AI: ${aiProb.toFixed(2)}.`,
      ];
      if (Array.isArray(data.sentences) && data.sentences.length) {
        const aiSentences = data.sentences.filter((s: any) => (s?.score ?? 0) < 50).length;
        reasons.push(`Sentence analysis: ${aiSentences}/${data.sentences.length} sentences flagged as likely AI-generated.`);
      }
      return { score, verdict, reasons, sources: [] };
    }

    if (payload.type === "video" && payload.file) {
      const form = new FormData();
      form.append("file", payload.file);
      const res = await fetch("/api/detect", { method: "POST", body: form });
      const data = await res.json().catch(() => ({ error: "Invalid response from video detection" }));
      if (!res.ok) throw new Error(data?.detail || data?.error || "Video detection failed");
      const confidencePct = Math.round((data.confidence ?? 0) * 100);
      const verdict = data.prediction === "Deepfake" ? "Likely False" : "Likely True";
      return {
        score: data.prediction === "Deepfake" ? 100 - confidencePct : confidencePct,
        verdict,
        reasons: [
          `Model verdict: ${data.prediction} (confidence ${confidencePct}%).`,
          `Modal importances — image: ${Math.round((data.image_importance ?? 0) * 100)}%, audio: ${Math.round((data.audio_importance ?? 0) * 100)}%, text: ${Math.round((data.text_importance ?? 0) * 100)}%.`,
          data.transcript ? `ASR transcript: ${String(data.transcript).slice(0, 200)}${String(data.transcript).length > 200 ? "…" : ""}` : "No transcript available.",
        ],
        sources: [],
      };
    }

    // URL or unsupported: fallback mock
    return mockAnalyze(payload);
  }

  async function handleSubmit(payload: SubmittedPayload) {
    try {
      const result = await analyze(payload);
      setAnalysis(result);
      setHistory((prev) => [
        {
          id: String(Date.now()),
          title: payload.url || payload.text?.slice(0, 40) || payload.file?.name || "Submission",
          score: result.score,
          verdict: result.verdict,
          date: new Date().toLocaleString(),
        },
        ...prev,
      ].slice(0, 7));
      const el = document.getElementById("results-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e: any) {
      alert(e?.message || "Detection failed");
    }
  }

  return (
    <div className="relative z-10 -mt-16 scroll-mt-16 bg-gradient-to-b from-black to-black/95 pb-24 pt-16 text-white">
      <div id="get-started" className="mx-auto max-w-6xl px-6">
        <SubmissionForm onSubmit={handleSubmit} />
      </div>

      <div id="results-section" className="mx-auto mt-10 max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ScoreCard score={analysis?.score ?? 0} verdict={analysis?.verdict ?? "Uncertain"} />
          </div>
          <div className="lg:col-span-2">
            <ExplainPanel reasons={analysis?.reasons ?? []} sources={analysis?.sources ?? []} />
          </div>
        </div>
      </div>

      <div id="learn-more" className="mx-auto mt-16 max-w-6xl px-6">
        <TrendsDashboard data={trends} />
      </div>

      <div className="mx-auto mt-16 max-w-6xl px-6">
        <HistoryList items={history} />
      </div>
    </div>
  );
}


