import { NextResponse } from "next/server";
import { EdgeTTS } from "edge-tts-universal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let text: unknown;
  try {
    ({ text } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (
    typeof text !== "string" ||
    text.trim().length === 0 ||
    text.length > 500
  ) {
    return NextResponse.json({ error: "Invalid text" }, { status: 400 });
  }
  try {
    const tts = new EdgeTTS(text, "th-TH-PremwadeeNeural");
    const result = await tts.synthesize();
    const mp3 = Buffer.from(await result.audio.arrayBuffer());
    return new NextResponse(mp3, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("TTS failed:", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 502 });
  }
}
