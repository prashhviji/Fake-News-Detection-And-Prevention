import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINSTON_API_KEY = process.env.WINSTON_API_KEY || "";

export async function POST(req: Request) {
  try {
    if (!WINSTON_API_KEY) {
      return NextResponse.json({ error: "WINSTON_API_KEY not configured" }, { status: 503 });
    }

    const incoming = await req.formData();
    const file = incoming.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    const contentType = (file as any).type || "application/octet-stream";
    if (!allowed.has(contentType)) {
      return NextResponse.json({ error: "Unsupported format. Supported: JPG, PNG, WEBP" }, { status: 400 });
    }

    const filename = (file as any).name || "upload";

    // Upload to tmpfiles.org to obtain a direct URL
    const uploadForm = new FormData();
    uploadForm.append("file", new Blob([await file.arrayBuffer()], { type: contentType }), filename);

    const uploadRes = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: uploadForm,
    });
    if (!uploadRes.ok) {
      const text = await uploadRes.text().catch(() => "");
      return NextResponse.json({ error: "Failed to upload to tmpfiles.org", details: text }, { status: 502 });
    }
    const uploadJson: any = await uploadRes.json().catch(() => ({}));
    if (uploadJson?.status !== "success" || !uploadJson?.data?.url) {
      return NextResponse.json({ error: "Invalid response from tmpfiles.org", raw: uploadJson }, { status: 502 });
    }

    const directUrl = String(uploadJson.data.url).replace("tmpfiles.org/", "tmpfiles.org/dl/");

    // Call Winston AI image detection
    const detectRes = await fetch("https://api.gowinston.ai/v2/image-detection", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WINSTON_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: directUrl, version: "2" }),
    });

    const text = await detectRes.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { error: "Invalid JSON from Winston", raw: text }; }
    return NextResponse.json(data, { status: detectRes.status });
  } catch (err: any) {
    return NextResponse.json({ error: "Proxy error", details: String(err?.message || err) }, { status: 500 });
  }
}


