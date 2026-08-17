-- Seed missing lesson words for easy2, conversation (remainder), and conversation2.
-- Idempotent: WHERE NOT EXISTS guards prevent duplicates.

-- easy (คำศัพท์ง่าย) — 1 missing word
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'นั่ง', 'ปากเปิดกว้าง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'นั่ง');

-- easy2 (คำศัพท์ง่าย 2) — 8 missing words (รัก already seeded in 005)
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เดิน', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เดิน');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'พูด', 'ปากห่อกลม', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'พูด');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฟัง', 'ฟันแตะริมฝีปาก', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฟัง');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'อ่าน', 'ปากเปิดกว้าง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'อ่าน');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เขียน', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เขียน');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ดื่ม', 'ปากห่อกลม', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ดื่ม');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'หิว', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'หิว');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เจ็บ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เจ็บ');

-- conversation (บทสนทนา) — 5 missing words (first 5 seeded in 004)
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'คุณเป็นยังไงบ้าง', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'คุณเป็นยังไงบ้าง');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฉันสบายดี', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฉันสบายดี');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ยินดีที่ได้รู้จัก', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ยินดีที่ได้รู้จัก');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ขอบคุณมากนะครับ', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ขอบคุณมากนะครับ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'แล้วเจอกันใหม่', 'ทักทาย', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'แล้วเจอกันใหม่');

-- conversation2 (บทสนทนา 2) — all 10 words
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ขอน้ำหน่อยได้ไหม', 'ปากเปิดกว้าง', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ขอน้ำหน่อยได้ไหม');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'หิวข้าวมาก', 'ปากเปิดกว้าง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'หิวข้าวมาก');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'อาหารอร่อยมาก', 'ปากเปิดกว้าง', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'อาหารอร่อยมาก');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฉันไม่เข้าใจ', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฉันไม่เข้าใจ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'พูดช้าลงได้ไหม', 'ปากห่อกลม', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'พูดช้าลงได้ไหม');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ช่วยด้วยได้ไหม', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ช่วยด้วยได้ไหม');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฉันรักคุณ', 'ปากเปิดกว้าง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฉันรักคุณ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'วันนี้อากาศดี', 'ปากเปิดกว้าง', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'วันนี้อากาศดี');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฉันอยู่ที่บ้าน', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฉันอยู่ที่บ้าน');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เจ็บตรงนี้ครับ', 'ปากเปิดกลาง', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เจ็บตรงนี้ครับ');
