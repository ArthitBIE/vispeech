# src/app/api/words/

## Responsibility

HTTP GET endpoint that serves the word list (Thai vocabulary items) to client-side practice and dashboard flows. Acts as a read-only query layer over the Supabase `words` table with optional filters, and as a schema-migration shield that normalizes row shapes before they reach UI consumers.

## Design

- **Per-request Supabase client**: creates a fresh `@supabase/supabase-js` client with the caller's `Authorization: Bearer` token forwarded as a global header — no shared server-side session, per-request auth passthrough.
- **Query-builder filtering**: single base select on `words` (`id, word, viseme_group, difficulty, phonetic`) with optional `eq` (viseme_group), `ilike` (word substring), `lte` (difficulty cap) predicates applied conditionally from `?group`, `?search`, `?difficulty` query params.
- **Graceful column-degradation fallback**: if the primary select fails (assumed `phonetic` column missing pre-migration 003), retries with a narrower projection without `phonetic`, mapping it to `null`.
- **Row-to-DTO mapping**: snake_case DB rows remapped to camelCase response shape (`text`, `visemeGroup`, `difficulty`, `phonetic`).
- **Guard-clause error handling**: early returns for unconfigured env (500), missing token (401), query failure (500).

## Flow

1. Request enters `GET(req)`; reads `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, returns 500 if absent or placeholder.
2. Extracts `Authorization: Bearer <token>` from request header; returns 401 if absent.
3. Builds per-request Supabase client with token in `global.headers`.
4. Parses `group` / `search` / `difficulty` search params, applies matching predicates to the `words` query (ordered by `difficulty`).
5. Executes query. On error: retries without `phonetic`; if fallback also fails, logs and returns 500.
6. Maps rows to `{ id, text, visemeGroup, difficulty, phonetic }` and returns `{ words }` JSON.

## Integration

- Consumed by: `src/app/(app)/home/page.tsx` (word list rendering), `src/app/(app)/dashboard/page.tsx` (practice/accuracy views), `src/app/practice/session/page.tsx` (session word pool) — all fetch with the user's session access token in the Authorization header.
- Depends on: Supabase `words` table (`id, word, viseme_group, difficulty, phonetic`), `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars, caller-supplied Supabase session token.
