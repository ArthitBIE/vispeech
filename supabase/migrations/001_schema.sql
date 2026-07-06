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
