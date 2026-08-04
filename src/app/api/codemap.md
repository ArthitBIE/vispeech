# src/app/api/

## Responsibility

Server-side HTTP API layer (Route Handlers) exposing TTS synthesis, word catalog queries, practice scoring, and practice-session persistence to the client. Mediates between browser and Supabase, encapsulating auth-token forwarding, scoring logic, and schema-version fallbacks.

## Design

- **Route Handlers** (Next.js App Router): one `route.ts` per resource (`/tts`, `/words`, `/score`, `/practice-sessions`), exporting `GET`/`POST`/`PATCH` handlers receiving `NextRequest`.
- **Per-request Supabase client** (Service-Proxy pattern): `createClient` instantiated per request with the client's `Authorization: Bearer <token>` forwarded via `global.headers`; no server-side session storage.
- **Bearer-token extraction**: `req.headers.get("authorization")` → strip `"Bearer "` prefix → token or 401.
- **Strategy pattern**: `/score` delegates weighted visual/audio scoring to `defaultScoringStrategy` from `@/lib/scoring`; `/practice-sessions` delegates result dedup to `dedupeByBestScore` (`@/lib/practice-summary`) and lesson lookup to `findLesson` (`@/lib/lesson`).
- **Defensive degradation (ponytail pattern)**: every handler checks `canConnect` (env present, not placeholder) and implements schema-version fallbacks — `/words` retries without `phonetic` column; `/score` retries `practice_logs` insert without `session_id` on PGRST204; `/practice-sessions` falls back to unscoped recent logs on PGRST204/42703.
- **Runtime config**: `/tts` sets `runtime = "nodejs"` and `dynamic = "force-dynamic"`; `/score` uses `.single()` on a wordId lookup that may miss synthetic ids, resolving via `word?.word || targetText` (`.maybeSingle()` used for potentially-empty rows).

## Flow

1. Client sends authenticated fetch with Bearer token (from `supabase.auth.getSession()`).
2. Handler parses body/query params → validates (400 on invalid JSON/missing fields) → rejects unauthenticated requests (401).
3. Creates per-request Supabase client with forwarded token; `supabase.auth.getUser()` verifies identity server-side (`/score` POST, `/practice-sessions` GET/POST/PATCH).
4. **GET /api/words** → chainable `.eq`/`.ilike`/`.lte` filters (`group`, `search`, `difficulty`) on `words` table → camelCase mapping `{id, text, visemeGroup, difficulty, phonetic}` → `{words}`.
5. **POST /api/tts** → `new EdgeTTS(text, "th-TH-PremwadeeNeural").synthesize()` → binary MP3 `NextResponse` (audio/mpeg, `Cache-Control: public, max-age=3600`).
6. **POST /api/score** → fetch `word` row → `defaultScoringStrategy.score({wordId, targetWord, transcript, mouthOpen, visemeGroup})` → if real DB word + user: lookup `practice_logs` for `attempt_number`, ownership-check `practice_sessions`, upsert log; then upsert `word_accuracy` (new row vs rolling `best_score`/`average_score` update) → `{visual_score, audio_score, total_score, feedback_th}`. Synthetic lesson items are scored without persistence.
7. **GET /api/practice-sessions** → resolve session (explicit `sessionId` owned by user, else latest by `created_at`) → scoped `practice_logs` join `words!inner` (limit 100) → `dedupeByBestScore` → optional `filterByLesson` on `?group=` → `{session, results}`.
8. **POST/PATCH /api/practice-sessions** → insert/update `practice_sessions` row (scoped `.eq("user_id", user.id)` on PATCH) → `{id}`.

## Integration

- Consumed by: `src/components/practice/PracticeWord.tsx` (`/api/tts`, `/api/score`), `src/app/(app)/home/page.tsx` and `src/app/(app)/dashboard/page.tsx` (`/api/words`, `/api/practice-sessions`), `src/app/practice/session/page.tsx` (words + sessions), `src/app/summary/page.tsx` (`/api/practice-sessions`). All calls pass the Supabase session token in `Authorization: Bearer` header.
- Depends on: Supabase tables `words`, `practice_logs`, `word_accuracy`, `practice_sessions` (env `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`); `@/lib/scoring` (`defaultScoringStrategy`), `@/lib/practice-summary` (`dedupeByBestScore`), `@/lib/lesson` (`findLesson`); `edge-tts-universal` (`EdgeTTS`); Next.js `next/server` (`NextRequest`, `NextResponse`).
