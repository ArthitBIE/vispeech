# src/app/api/score/

## Responsibility

POST-only scoring endpoint: accepts a practice attempt (word, transcript, mouth-open signal), computes visual/audio/total scores via the shared scoring strategy, and persists results to `practice_logs` and `word_accuracy` for authenticated users. Also scores synthetic (non-DB) lesson items without persistence.

## Design

- **Score submission endpoint**: single `POST` handler (`route.ts`) receiving JSON from practice clients.
- **Strategy pattern**: delegates scoring to `defaultScoringStrategy` (`DeterministicHeuristicStrategy` from `@/lib/scoring`) — pure, deterministic, no DB reads inside the strategy.
- **Upsert on `word_accuracy`**: read-then-write (`.maybeSingle()` → update weighted running average/best or insert row).
- **Append-only `practice_logs`**: per-user per-word attempt numbering (latest `attempt_number` + 1).
- **Synthetic-ID bypass**: `wordId` not resolving to a `words` row (or no `wordId`) → score returned, no persistence. Guarded by `canConnect` (env missing/placeholder → in-memory client `null`).
- **Per-request Supabase client**: created with `Authorization: Bearer <token>` from request header.
- **Graceful degradation**: session-link insert retried without `session_id` on PGRST204 (DB schema drift); `session_id` only set after ownership check.

## Flow

1. `POST` parses body: `wordId`, `transcript`, `mouthOpen`, `sessionId`, `targetText`, `visemeGroup`; 400 if neither `wordId` nor `targetText`.
2. Builds per-request Supabase client from env + Bearer token (or `null` if env is placeholder/missing).
3. If `supabase && wordId`: `.from("words").select("word, viseme_group").eq("id", wordId).single()` → `word` (null for synthetic ids).
4. Resolves `targetWord = word.word || targetText`; calls `defaultScoringStrategy.score({ wordId, targetWord, transcript, mouthOpen, visemeGroup })` → `ScoreResult`.
5. If `supabase && word`: `auth.getUser()` → user; if present:
   - Read max `attempt_number` from `practice_logs` for (user, word); increment.
   - If `sessionId`: ownership check via `practice_sessions` `.maybeSingle()` filtered by user; insert `practice_logs` row (retry without `session_id` on PGRST204).
   - `word_accuracy` upsert: existing row → update `best_score` (max), weighted `average_score`, `total_attempts + 1`, `last_practiced_at`; else insert with attempt 1.
6. Responds `{ visual_score, audio_score, total_score, feedback_th }`; catch-all → 500.

## Integration

- Consumed by: practice clients — `src/app/practice/session/page.tsx` (via `fetch` POST to `/api/score` with Bearer token); scores surface in session summaries and word stats.
- Depends on: `@/lib/scoring` (`defaultScoringStrategy`); Supabase tables `words`, `practice_logs`, `word_accuracy`, `practice_sessions`; env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; client-provided `Authorization: Bearer` JWT.
