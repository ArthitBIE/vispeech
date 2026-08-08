# src/app/api/tts/

## Responsibility

Server-side TTS (Text-to-Speech) endpoint. Converts Thai text into an MP3 audio payload via a wrapper around Microsoft Edge's neural TTS voices. Acts as a server-side fallback for the client-side Web Speech API (`speechSynthesis`) when no Thai voice is installed.

## Design

- **Route handler**: `POST /api/tts` (Next.js App Router route handler), no `export const config` — explicitly `runtime = "nodejs"` (synthesize needs Node APIs like `Buffer`) and `dynamic = "force-dynamic"` (never statically evaluated).
- **edge-tts-universal wrapper**: `EdgeTTS` class instantiated per request with fixed voice `th-TH-PremwadeeNeural`; `synthesize()` returns a result whose `audio` is a streamed `ArrayBuffer` payload.
- **Binary response pattern**: audio bytes re-encoded to `Buffer` and returned as `NextResponse` with `Content-Type: audio/mpeg` and `Cache-Control: public, max-age=3600` (1h browser/CDN cache).
- **Input validation**: JSON body destructured to `text`; rejects non-string, blank, or >500-char input with 400. Malformed JSON → 400. Synthesis failure → 502.

## Flow

1. Client `fetch("/api/tts", { method: "POST", body: JSON.stringify({ text }) })` → `POST(req)`.
2. `await req.json()` destructures `text` (catch → `{ error: "Invalid JSON" }` 400).
3. Validate: `typeof text !== "string" || trim empty || length > 500` → 400.
4. `new EdgeTTS(text, "th-TH-PremwadeeNeural")` → `await tts.synthesize()` → `await result.audio.arrayBuffer()` → `Buffer.from(...)`.
5. Return `NextResponse(mp3)` with `audio/mpeg` + cache headers; any throw → `console.error("TTS failed")` → 502.
6. Consumer decodes response to `Blob`, plays via `Audio` element.

## Integration

- Consumed by: `src/components/practice/PracticeWord.tsx` (a `useEffect` keyed on the word fetches `/api/tts` → blob → object URL → `<audio controls>`; there is no `speakThai` fallback in this component); referenced in `src/components/codemap.md` and `src/app/api/codemap.md` (POST /api/tts entry).
- Depends on: `edge-tts-universal` (`EdgeTTS` class), Next.js `NextResponse`/`Request`, Node `Buffer` (nodejs runtime). No Supabase auth — open endpoint (no `Authorization` check, unlike `/api/score` and `/api/practice-sessions`).
