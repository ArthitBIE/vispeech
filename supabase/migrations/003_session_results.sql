-- Practice session results tracking
-- Add session_id to practice_logs for linking logs to sessions
ALTER TABLE practice_logs
ADD COLUMN session_id UUID REFERENCES practice_sessions(id) ON DELETE SET NULL;

CREATE INDEX idx_practice_logs_session_id ON practice_logs(session_id);

-- Add phonetic column to words for pronunciation display
ALTER TABLE words
ADD COLUMN phonetic TEXT;

-- Update demo words with phonetic values
UPDATE words SET phonetic = '/ja:/' WHERE word = 'ยา';
UPDATE words SET phonetic = '/fa:/' WHERE word = 'ฝา';
UPDATE words SET phonetic = '/di:/' WHERE word = 'ดี';
UPDATE words SET phonetic = '/mi:/' WHERE word = 'มี';
UPDATE words SET phonetic = '/du:/' WHERE word = 'ดู';
UPDATE words SET phonetic = '/ra:k/' WHERE word = 'รัก';
UPDATE words SET phonetic = '/fa:k/' WHERE word = 'ฝาก';
UPDATE words SET phonetic = '/ma:/' WHERE word = 'หมา';
UPDATE words SET phonetic = '/ta:/' WHERE word = 'ตา';
UPDATE words SET phonetic = '/sa:m/' WHERE word = 'สาม';
UPDATE words SET phonetic = '/ha:/' WHERE word = 'ห้า';
UPDATE words SET phonetic = '/pa:t/' WHERE word = 'แปด';
UPDATE words SET phonetic = '/fa:/' WHERE word = 'ฟ้า';
UPDATE words SET phonetic = '/fan/' WHERE word = 'ฟัน';
UPDATE words SET phonetic = '/fan/' WHERE word = 'ฝัน';
UPDATE words SET phonetic = '/khop-khun/' WHERE word = 'ขอบคุณ';
UPDATE words SET phonetic = '/sa-wat-dii/' WHERE word = 'สวัสดี';
UPDATE words SET phonetic = '/du:/' WHERE word = 'ดู';
UPDATE words SET phonetic = '/ru:/' WHERE word = 'รู้';
UPDATE words SET phonetic = '/viŋ/' WHERE word = 'วิ่ง';
UPDATE words SET phonetic = '/so:ng/' WHERE word = 'สอง';
UPDATE words SET phonetic = '/hok/' WHERE word = 'หก';
UPDATE words SET phonetic = '/cho:k-dii/' WHERE word = 'โชคดี';
UPDATE words SET phonetic = '/mae:/' WHERE word = 'แม่';
UPDATE words SET phonetic = '/pai/' WHERE word = 'ไป';
UPDATE words SET phonetic = '/ma:/' WHERE word = 'มา';
UPDATE words SET phonetic = '/pho:/' WHERE word = 'พ่อ';
UPDATE words SET phonetic = '/nuŋ/' WHERE word = 'หนึ่ง';
UPDATE words SET phonetic = '/jet/' WHERE word = 'เจ็ด';