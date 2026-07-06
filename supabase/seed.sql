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
