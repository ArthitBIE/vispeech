---
phase: 1
plan: 2
type: data
wave: 2
depends_on: [1]
files_modified:
  - src/lib/supabase/client.ts
  - src/lib/supabase/server.ts
  - supabase/migrations/001_schema.sql
  - supabase/seed.sql
autonomous: true
requirements: [SCHE-01, SCHE-02, SCHE-03, SCHE-04, SCHE-05, SCHE-06, SCHE-07, SCHE-08]
---

<objective>
Create Supabase client utilities for browser and server contexts, define the database schema with RLS policies, and include seed data for 30 Thai practice words across 7 viseme groups.
</objective>

<tasks>
<task>
<type>create</type>
<action>Create Supabase browser client utility</action>
<files>src/lib/supabase/client.ts</files>
<read_first>none</read_first>
<details>
Create a browser-side Supabase client that reads environment variables.

Directory: create src/lib/supabase/ directory first.

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Export a single initialized supabase client instance.
Add a guard: if env vars are missing, log a warning and export a stub client.
</details>
<verify>File exports a supabase client</verify>
<acceptance_criteria>Browser Supabase client created with env-based config</acceptance_criteria>
</task>

<task>
<type>create</type>
<action>Create Supabase server client utility</action>
<files>src/lib/supabase/server.ts</files>
<read_first>src/lib/supabase/client.ts</read_first>
<details>
Create a server-side Supabase client factory.

For MVP, this is a simple wrapper. Export a createServerClient function that reads env vars and returns a Supabase client.

If @supabase/ssr is not installed, use the standard createClient from @supabase/supabase-js and add a comment noting this is a simplified server client for MVP.
</details>
<verify>File exports createServerClient function</verify>
<acceptance_criteria>Server Supabase client factory created</acceptance_criteria>
</task>

<task>
<type>create</type>
<action>Create database schema migration with RLS</action>
<files>supabase/migrations/001_schema.sql</files>
<read_first>none</read_first>
<details>
```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Words table: stores Thai practice words with their viseme group
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL,
  viseme_group TEXT NOT NULL,
  audio_url TEXT,
  difficulty INTEGER DEFAULT 1
);

-- Practice logs: records each practice attempt
CREATE TABLE practice_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  visual_score INTEGER NOT NULL DEFAULT 0,
  audio_score INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Word accuracy: per-user per-word accuracy summary
CREATE TABLE word_accuracy (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  best_score INTEGER NOT NULL DEFAULT 0,
  average_score FLOAT NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, word_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_accuracy ENABLE ROW LEVEL SECURITY;

-- Words: all authenticated users can read
CREATE POLICY "Anyone can read words"
  ON words FOR SELECT
  TO authenticated
  USING (true);

-- Practice logs: users manage their own
CREATE POLICY "Users can insert own practice logs"
  ON practice_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own practice logs"
  ON practice_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Word accuracy: users manage their own
CREATE POLICY "Users can insert own word accuracy"
  ON word_accuracy FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own word accuracy"
  ON word_accuracy FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own word accuracy"
  ON word_accuracy FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Create the supabase/migrations/ directory.
</details>
<verify>SQL file contains all 3 tables, RLS, and 7 policies</verify>
<acceptance_criteria>Schema migration created with proper tables, RLS, and policies</acceptance_criteria>
</task>

<task>
<type>create</type>
<action>Create seed data for 30 Thai words</action>
<files>supabase/seed.sql</files>
<read_first>supabase/migrations/001_schema.sql</read_first>
<details>
```sql
-- Seed data: 30 Thai practice words in 7 viseme groups

-- 1. ริมฝีปากปิด (Lip closure)
INSERT INTO words (word, viseme_group, difficulty) VALUES
  ('แม่', 'ริมฝีปากปิด', 1),
  ('ไป', 'ริมฝีปากปิด', 1),
  ('มา', 'ริมฝีปากปิด', 1),
  ('พ่อ', 'ริมฝีปากปิด', 1);

-- 2. ปากเปิดกว้าง (Wide open mouth)
INSERT INTO words (word, viseme_group, difficulty) VALUES
  ('รัก', 'ปากเปิดกว้าง', 2),
  ('ฝาก', 'ปากเปิดกว้าง', 2),
  ('หมา', 'ปากเปิดกว้าง', 1),
  ('ตา', 'ปากเปิดกว้าง', 1);

-- 3. ปากห่อกลม (Rounded mouth)
INSERT INTO words (word, viseme_group, difficulty) VALUES
  ('ดู', 'ปากห่อกลม', 1),
  ('รู้', 'ปากห่อกลม', 2),
  ('วิ่ง', 'ปากห่อกลม', 2);

-- 4. ฟันแตะริมฝีปาก (Teeth on lip)
INSERT INTO words (word, viseme_group, difficulty) VALUES
  ('ฝัน', 'ฟันแตะริมฝีปาก', 2),
  ('ฟัน', 'ฟันแตะริมฝีปาก', 1),
  ('ฟ้า', 'ฟันแตะริมฝีปาก', 1);

-- 5. ปากเปิดกลาง (Mid-open mouth)
INSERT INTO words (word, viseme_group, difficulty) VALUES
  ('เก่ง', 'ปากเปิดกลาง', 2),
  ('แดง', 'ปากเปิดกลาง', 1),
  ('เด็ก', 'ปากเปิดกลาง', 1);

-- 6. ทักทาย/ใช้บ่อย (Greetings/common)
INSERT INTO words (word, viseme_group, difficulty) VALUES
  ('สวัสดี', 'ทักทาย', 1),
  ('ขอบคุณ', 'ทักทาย', 1),
  ('ดี', 'ทักทาย', 1),
  ('โชคดี', 'ทักทาย', 1),
  ('ขอโทษ', 'ทักทาย', 1);

-- 7. ตัวเลข (Numbers)
INSERT INTO words (word, viseme_group, difficulty) VALUES
  ('หนึ่ง', 'ตัวเลข', 2),
  ('สอง', 'ตัวเลข', 1),
  ('สาม', 'ตัวเลข', 1),
  ('สี่', 'ตัวเลข', 1),
  ('ห้า', 'ตัวเลข', 1);

-- Fill remaining slots to reach 30 words
INSERT INTO words (word, viseme_group, difficulty) VALUES
  ('นอน', 'ริมฝีปากปิด', 1),
  ('กิน', 'ปากเปิดกลาง', 1),
  ('หก', 'ตัวเลข', 2),
  ('เจ็ด', 'ตัวเลข', 2),
  ('แปด', 'ตัวเลข', 2);
```
</details>
<verify>Count: 30 words across 7 viseme groups</verify>
<acceptance_criteria>30 Thai words seeded in correct viseme groups</acceptance_criteria>
</task>
</tasks>

<verification>
- SQL syntax valid (can be verified with supabase db lint or manual review)
- 3 tables: words, practice_logs, word_accuracy
- RLS enabled on all 3 tables
- 7 RLS policies total
- 30 seed words match the 7 specified viseme groups
- Foreign keys reference auth.users and words correctly
</verification>

<success_criteria>
- Migration file with schema + RLS + policies created
- Seed file with 30 Thai words created
- Supabase browser client created
- Supabase server client factory created
</success_criteria>
