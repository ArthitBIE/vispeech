-- Seed all lesson words that are missing from the words table
-- Idempotent: uses WHERE NOT EXISTS guards to avoid duplicates with seed.sql

-- easy (คำศัพท์ง่าย) — missing 3 of 5
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ยา', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ยา');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฝา', 'ฟันแตะริมฝีปาก', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฝา');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'มี', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'มี');

-- vowels (เสียงสระ) — all 32 items
-- Single vowels (สระเดี่ยว) — 18
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'อะ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'อะ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'อา', 'ปากเปิดกว้าง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'อา');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'อิ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'อิ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'อี', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'อี');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'อึ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'อึ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'อือ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'อือ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'อุ', 'ปากห่อกลม', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'อุ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'อู', 'ปากห่อกลม', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'อู');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เอะ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เอะ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เอ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เอ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'แอะ', 'ปากเปิดกว้าง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'แอะ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'แอ', 'ปากเปิดกว้าง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'แอ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'โอะ', 'ปากห่อกลม', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'โอะ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'โอ', 'ปากห่อกลม', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'โอ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เอาะ', 'ปากห่อกลม', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เอาะ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ออ', 'ปากห่อกลม', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ออ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เออะ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เออะ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เออ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เออ');

-- Diphthongs (สระประสม) — 6
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เอียะ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เอียะ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เอีย', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เอีย');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เอือะ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เอือะ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เอือ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เอือ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'อัวะ', 'ปากห่อกลม', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'อัวะ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'อัว', 'ปากห่อกลม', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'อัว');

-- Special vowels (สระเกิน) — 8
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'อำ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'อำ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ใอ', 'ปากเปิดกว้าง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ใอ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ไอ', 'ปากเปิดกว้าง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ไอ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เอา', 'ปากเปิดกว้าง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เอา');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฤ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฤ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฤๅ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฤๅ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฦ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฦ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฦๅ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฦๅ');

-- conversation (บทสนทนา) — all 5 items
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'สวัสดีครับ', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'สวัสดีครับ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ขอบคุณค่ะ', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ขอบคุณค่ะ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฉันชื่อสมชาย', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฉันชื่อสมชาย');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ขอโทษนะ', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ขอโทษนะ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ลาก่อนนะ', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ลาก่อนนะ');