-- Original demo words (30 Thai practice words in 7 viseme groups).
-- Idempotent: uses WHERE NOT EXISTS guards so this migration can be re-run
-- safely. 5 of these words overlap with 004_lesson_words.sql; the other 5
-- (นอน, กิน, หก, เจ็ด, แปด) are unique to this file.

-- 1. ริมฝีปากปิด (Lip closure)
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'แม่', 'ริมฝีปากปิด', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'แม่');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ไป', 'ริมฝีปากปิด', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ไป');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'มา', 'ริมฝีปากปิด', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'มา');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'พ่อ', 'ริมฝีปากปิด', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'พ่อ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'นอน', 'ริมฝีปากปิด', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'นอน');

-- 2. ปากเปิดกว้าง (Wide open mouth)
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'รัก', 'ปากเปิดกว้าง', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'รัก');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฝาก', 'ปากเปิดกว้าง', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฝาก');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'หมา', 'ปากเปิดกว้าง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'หมา');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ตา', 'ปากเปิดกว้าง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ตา');

-- 3. ปากห่อกลม (Rounded mouth)
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ดู', 'ปากห่อกลม', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ดู');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'รู้', 'ปากห่อกลม', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'รู้');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'วิ่ง', 'ปากห่อกลม', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'วิ่ง');

-- 4. ฟันแตะริมฝีปาก (Teeth on lip)
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฝัน', 'ฟันแตะริมฝีปาก', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฝัน');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฟัน', 'ฟันแตะริมฝีปาก', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฟัน');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ฟ้า', 'ฟันแตะริมฝีปาก', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ฟ้า');

-- 5. ปากเปิดกลาง (Mid-open mouth)
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เก่ง', 'ปากเปิดกลาง', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เก่ง');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'แดง', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'แดง');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เด็ก', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เด็ก');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'กิน', 'ปากเปิดกลาง', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'กิน');

-- 6. ทักทาย/ใช้บ่อย (Greetings/common)
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'สวัสดี', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'สวัสดี');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ขอบคุณ', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ขอบคุณ');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ดี', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ดี');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'โชคดี', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'โชคดี');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ขอโทษ', 'ทักทาย', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ขอโทษ');

-- 7. ตัวเลข (Numbers)
INSERT INTO words (word, viseme_group, difficulty)
SELECT 'หนึ่ง', 'ตัวเลข', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'หนึ่ง');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'สอง', 'ตัวเลข', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'สอง');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'สาม', 'ตัวเลข', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'สาม');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'สี่', 'ตัวเลข', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'สี่');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'ห้า', 'ตัวเลข', 1 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'ห้า');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'หก', 'ตัวเลข', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'หก');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'เจ็ด', 'ตัวเลข', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'เจ็ด');

INSERT INTO words (word, viseme_group, difficulty)
SELECT 'แปด', 'ตัวเลข', 2 WHERE NOT EXISTS (SELECT 1 FROM words WHERE word = 'แปด');
