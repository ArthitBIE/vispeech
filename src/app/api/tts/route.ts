import { NextResponse } from "next/server";
import { Communicate } from "edge-tts-universal";

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
    const communicate = new Communicate(text, {
      voice: "th-TH-PremwadeeNeural",
    });

    // Stream audio chunks as they arrive from Edge TTS, reducing
    // time-to-first-byte vs buffering the entire result.
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of communicate.stream()) {
            if (chunk.type === "audio" && chunk.data) {
              controller.enqueue(chunk.data);
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
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
