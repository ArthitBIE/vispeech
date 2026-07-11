<!-- generated-by: gsd-doc-writer -->

# API Reference

ViSpeech exposes a REST API under `/api/` for fetching practice words, scoring pronunciation attempts, and recording practice sessions. All endpoints return JSON.

## Authentication

Most endpoints require a Supabase session token passed as a Bearer token in the `Authorization` header.

```
Authorization: Bearer <supabase-access-token>
```

The token is verified against Supabase Auth via `supabase.auth.getUser()`. Requests without a valid token receive a `401 Unauthorized` response.

The API middleware (`src/middleware.ts`) passes all `/api/*` routes through without additional server-side checks; the auth check is performed per-route.

## Endpoints

| Method | Path                  | Auth Required | Description                              |
| ------ | --------------------- | ------------- | ---------------------------------------- |
| GET    | `/api/words`          | Yes           | Fetch practice words with optional filters |
| POST   | `/api/score`          | No (see note) | Score a single pronunciation attempt     |
| POST   | `/api/practice-sessions` | Yes        | Save a completed practice session summary |

> **Note on `/api/score` auth:** If a valid Bearer token is provided, the endpoint additionally logs the attempt to the user's history and updates accuracy records. Unauthenticated requests still return a score result but no data is persisted.

---

### GET /api/words

Fetch practice words from the database. Supports filtering by viseme group and free-text search.

**Query Parameters**

| Parameter | Type   | Required | Description                                                     |
| --------- | ------ | -------- | --------------------------------------------------------------- |
| `group`   | string | No       | Filter by viseme group (e.g., `wide`, `rounded`, `closed`)      |
| `search`  | string | No       | Full-text search (case-insensitive) on the word text             |

**Response `200 OK`**

```json
{
  "words": [
    {
      "id": 1,
      "text": "รัก",
      "visemeGroup": "wide",
      "difficulty": 1
    }
  ]
}
```

**Response `401 Unauthorized`**

```json
{
  "error": "Authentication required"
}
```

**Error Responses**

| Status | Condition                        |
| ------ | -------------------------------- |
| 401    | Missing or invalid Bearer token  |
| 500    | Supabase not configured or query failure |

---

### POST /api/score

Score a single pronunciation attempt. Uses a deterministic heuristic (`DeterministicHeuristicStrategy`) that compares the spoken transcript against the target word and evaluates mouth-open data for visual accuracy.

**Request Body**

```json
{
  "wordId": 1,
  "transcript": "รัก",
  "mouthOpen": 65
}
```

| Field       | Type   | Required | Description                                     |
| ----------- | ------ | -------- | ----------------------------------------------- |
| `wordId`    | number | Yes      | ID of the target word                           |
| `transcript`| string | No       | Speech-to-text transcript of the user's attempt  |
| `mouthOpen` | number | No       | Detected mouth-open percentage (0–100)           |

**Response `200 OK`**

```json
{
  "visual_score": 75,
  "audio_score": 95,
  "total_score": 87,
  "feedback_th": "ยอดเยี่ยม! การออกเสียงและรูปปากของคุณดีมาก"
}
```

| Field          | Type   | Description                                            |
| -------------- | ------ | ------------------------------------------------------ |
| `visual_score` | number | Visual accuracy score (0–100) based on mouth-open data |
| `audio_score`  | number | Audio accuracy score (0–100) based on transcript match |
| `total_score`  | number | Weighted total: `visual × 0.4 + audio × 0.6`          |
| `feedback_th`  | string | Thai-language feedback message based on the score      |

**Error Responses**

| Status | Condition                        |
| ------ | -------------------------------- |
| 400    | Missing required field `wordId`  |
| 500    | Scoring engine or database error |

**Auth-dependent behavior**

When a valid Bearer token is present, the endpoint:

1. Creates a record in `practice_logs` with the per-word attempt number, visual/audio/total scores.
2. Upserts a record in `word_accuracy` tracking best score, average score, total attempts, and last practiced timestamp.

---

### POST /api/practice-sessions

Save a summary of a completed practice session (word list run) to the database.

**Request Body**

```json
{
  "totalAttempts": 10,
  "passedCount": 7,
  "bestScore": 92
}
```

| Field           | Type   | Required | Description                                  |
| --------------- | ------ | -------- | -------------------------------------------- |
| `totalAttempts` | number | Yes      | Total number of words attempted in session   |
| `passedCount`   | number | No       | Number of words passed (score >= threshold)  |
| `bestScore`     | number | No       | Highest single-word score in the session     |

**Response `200 OK`**

```json
{
  "id": 42
}
```

**Response `200 OK` (Supabase not configured)**

When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set or are still placeholders, the endpoint returns a no-op response without error.

```json
{
  "id": null
}
```

**Error Responses**

| Status | Condition                                 |
| ------ | ----------------------------------------- |
| 400    | Missing required field `totalAttempts`    |
| 401    | Missing or invalid Bearer token           |
| 500    | Database insert error                     |

---

## Common Behavior

### Base URL

In development: `http://localhost:3000/api`  
In production: `https://<your-domain>/api`

### Supabase Tables Referenced

| Table               | Endpoint(s)                  | Purpose                          |
| ------------------- | ---------------------------- | --------------------------------- |
| `words`             | GET `/api/words`             | Practice word definitions         |
| `practice_sessions` | POST `/api/practice-sessions`| Session summary records           |
| `practice_logs`     | POST `/api/score`            | Per-word attempt logs             |
| `word_accuracy`     | POST `/api/score`            | Aggregated per-word user accuracy |

### Configuration

All environment variables are documented in [CONFIGURATION.md](./CONFIGURATION.md). The Supabase credentials required by the API are:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous API key

### CORS

ViSpeech is a single-origin Next.js application. No CORS headers are configured. API routes are called from the same origin via relative paths.

### Error Envelope

All error responses follow a consistent shape:

```json
{
  "error": "Human-readable error message"
}
```
