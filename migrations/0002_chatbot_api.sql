-- ====================================================================
-- Chatbot API & AI Settings & Knowledge Base Schema
-- ====================================================================

CREATE TABLE IF NOT EXISTS chat_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chatbot_faqs (
  id TEXT PRIMARY KEY,
  question_th TEXT NOT NULL,
  answer_th TEXT NOT NULL,
  question_en TEXT,
  answer_en TEXT,
  category TEXT DEFAULT 'GENERAL',
  is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed default settings
INSERT OR IGNORE INTO chat_settings (key, value) VALUES
  ('provider', 'cloudflare'),
  ('model', '@cf/meta/llama-3-8b-instruct'),
  ('temperature', '0.4'),
  ('max_tokens', '500'),
  ('enable_d1_grounding', '1'),
  ('gemini_api_key', ''),
  ('openai_api_key', '');

-- Seed some default hotel FAQs for domain grounding
INSERT OR IGNORE INTO chatbot_faqs (id, question_th, answer_th, question_en, answer_en, category) VALUES
  ('faq_pool', 'สระว่ายน้ำเปิดปิดกี่โมง', 'สระว่ายน้ำส่วนกลางเปิดให้บริการทุกวันตั้งแต่เวลา 07:00 - 21:00 น. มีบริการผ้าเช็ดตัวริมสระฟรีครับ', 'What are pool operating hours?', 'The main infinity pool is open daily from 7:00 AM to 9:00 PM. Complimentary pool towels are available.', 'AMENITIES'),
  ('faq_shuttle', 'มีบริการรถรับส่งสนามบินไหม', 'ทางรีสอร์ทมีบริการรถตู้ VIP รับ-ส่งท่าเรืออ่าวธรรมชาติและสนามบินตราด (มีค่าบริการเพิ่มเติม) กรุณาแจ้งแผนกต้อนรับล่วงหน้าอย่างน้อย 24 ชม. ครับ', 'Do you provide airport transfer?', 'We provide private VIP van transfers to Ao Thammachat pier and Trat Airport (surcharge applies). Please book at least 24 hours in advance.', 'SERVICE'),
  ('faq_wifi', 'รหัส Wi-Fi คืออะไร', 'สัญญาณ Wi-Fi ครอบคลุมทั่วทั้งรีสอร์ท ชื่อเครือข่าย @TheHaven_Guest เข้าสู่ระบบด้วยหมายเลขห้องพักและเบอร์โทรศัพท์ที่ใช้จองครับ', 'What is the Wi-Fi password?', 'High-speed Wi-Fi covers the entire resort. Network: @TheHaven_Guest. Login using your room number and booking phone number.', 'SERVICE');
