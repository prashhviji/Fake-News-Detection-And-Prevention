import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINSTON_API_KEY = process.env.WINSTON_API_KEY || "";

export async function POST(req: Request) {
  try {
    if (!WINSTON_API_KEY) {
      return NextResponse.json({ error: "WINSTON_API_KEY not configured" }, { status: 503 });
    }

    const body = await req.json().catch(() => null) as any;
    const text = body?.text;
    const version = body?.version || "latest";
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }
    if (text.trim().length < 300) {
      return NextResponse.json({ error: `Text too short (${text.trim().length}). Minimum required: 300 characters` }, { status: 400 });
    }

    const detectRes = await fetch("https://api.gowinston.ai/v2/ai-content-detection", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WINSTON_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text.trim(), version }),
    });

    const raw = await detectRes.text();
    let data: any;
    try { data = JSON.parse(raw); } catch { data = { error: "Invalid JSON from Winston", raw }; }
    return NextResponse.json(data, { status: detectRes.status });
  } catch (err: any) {
    return NextResponse.json({ error: "Proxy error", details: String(err?.message || err) }, { status: 500 });
  }
}


