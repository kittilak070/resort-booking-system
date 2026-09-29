-- ====================================================================
-- Initial Seed Data: The Haven Serene Resort & Villas
-- Compatible with Cloudflare D1 (SQLite)
-- ====================================================================

-- 1. Insert Initial Rooms
INSERT OR IGNORE INTO rooms (
    id, room_number, name_th, name_en, room_type, type_name_th, type_name_en, 
    capacity, bed_type, size_sqm, base_price, weekend_price, 
    description_th, description_en, status, rating, review_count
) VALUES
(
    'room-pv-101', 'VILLA 101', 'Grand Oceanfront Pool Villa', 'Grand Oceanfront Pool Villa', 'POOL_VILLA', 
    'พูลวิลล่าริมทะเลส่วนตัว', 'Private Oceanfront Pool Villa', 4, '1 King Bed + 2 Twin Beds', 145, 6500, 7900,
    'พูลวิลล่าส่วนตัวพร้อมสระว่ายน้ำระบบเกลือ infinity pool วิวทะเลพาโนรามา 180 องศา ระเบียงอาบแดดส่วนตัว และอ่างจากุซซี่กลางแจ้ง',
    'Ultra-luxurious private pool villa with saltwater infinity pool, 180-degree panoramic ocean views, sundeck, and outdoor jacuzzi.',
    'VACANT_CLEAN', 4.9, 38
),
(
    'room-pv-102', 'VILLA 102', 'Sunset Horizon Pool Villa', 'Sunset Horizon Pool Villa', 'POOL_VILLA', 
    'พูลวิลล่าชมพระอาทิตย์ตก', 'Romantic Sunset Pool Villa', 2, '1 King Bed (Super King)', 110, 5200, 6400,
    'วิลล่าสำหรับคู่รัก จุดชมพระอาทิตย์ตกที่สวยที่สุดในรีสอร์ท พร้อมสระว่ายน้ำส่วนตัวและศาลาริมน้ำสำหรับดินเนอร์ใต้แสงเทียน',
    'Intimate villa designed for couples featuring breathtaking golden sunset views, private plunge pool, and candlelit waterside pavilion.',
    'VACANT_CLEAN', 4.8, 29
),
(
    'room-bf-201', 'SUITE 201', 'Beachfront Panorama Suite', 'Beachfront Panorama Suite', 'BEACHFRONT_SUITE', 
    'สวีทติดชายหาดส่วนตัว', 'Beachfront Panorama Suite', 2, '1 King Bed', 75, 3800, 4600,
    'ก้าวเท้าสัมผัสผืนทรายเพียง 10 ก้าวจากระเบียงห้องพัก ห้องสวีทกว้างขวางตกแต่งด้วยไม้สักธรรมชาติ ผ่อนคลายกับเสียงคลื่นตลอดวัน',
    'Step directly onto soft white sand just 10 steps from your private teakwood balcony. Unwind with soothing ocean sound.',
    'OCCUPIED', 4.7, 42
),
(
    'room-bf-202', 'SUITE 202', 'Azure Beachfront Suite', 'Azure Beachfront Suite', 'BEACHFRONT_SUITE', 
    'สวีทติดชายหาดส่วนตัว', 'Azure Beachfront Suite', 3, '1 King Bed + 1 Daybed', 80, 4000, 4800,
    'ห้องสวีทติดหาด พร้อม Daybed ขนาดใหญ่บนระเบียง เหมาะสำหรับการพักผ่อนแบบครอบครัวเล็กหรือเพื่อนสนิท',
    'Spacious beachfront suite featuring an oversized shaded daybed balcony, ideal for small families or close friends.',
    'VACANT_DIRTY', 4.6, 24
),
(
    'room-gb-301', 'BUNGALOW 301', 'Tropical Garden Sanctuary Bungalow', 'Tropical Garden Sanctuary Bungalow', 'GARDEN_BUNGALOW', 
    'บังกะโลสวนร่มรื่นทรอปิคอล', 'Tropical Garden Sanctuary Bungalow', 2, '1 Queen Bed', 55, 2400, 2900,
    'สัมผัสธรรมชาติอันเงียบสงบ ล้อมรอบด้วยแมกไม้เมืองร้อนและสวนดอกไม้ สดชื่น เป็นส่วนตัว เหมาะสำหรับการพักผ่อนตัดขาดจากความวุ่นวาย',
    'Immerse in lush botanical flora and tropical greenery. Peaceful, private, and complete retreat away from the city hustle.',
    'CLEANING', 4.5, 31
),
(
    'room-dl-401', 'DELUXE 401', 'Modern Deluxe Sea & Mountain View', 'Modern Deluxe Sea & Mountain View', 'DELUXE_ROOM', 
    'ห้องดีลักซ์วิวทะเลและภูเขา', 'Modern Deluxe Sea & Mountain View', 2, '2 Twin Beds หรือ 1 King Bed', 48, 1900, 2300,
    'ห้องพักชั้นบนมองเห็นทัศนียภาพทั้งภูเขาและทะเล ตกแต่งสไตล์มินิมอลโมเดิร์น ครบครันด้วยฟังก์ชันการพักผ่อนที่ลงตัว',
    'Upper floor deluxe room with captivating panoramic mountain and ocean views, minimalist styling and full modern amenities.',
    'VACANT_CLEAN', 4.6, 19
);

-- 2. Insert Room Images
INSERT OR IGNORE INTO room_images (id, room_id, image_url, display_order) VALUES
('img-1', 'room-pv-101', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', 1),
('img-2', 'room-pv-101', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', 2),
('img-3', 'room-pv-102', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', 1),
('img-4', 'room-bf-201', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 1),
('img-5', 'room-bf-202', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', 1),
('img-6', 'room-gb-301', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80', 1),
('img-7', 'room-dl-401', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80', 1);

-- 3. Insert Add-ons
INSERT OR IGNORE INTO add_ons (id, name_th, name_en, price, unit, description, icon) VALUES
('addon-bbq', 'ชุดเตาปิ้งย่างบาร์บีคิวซีฟู้ดพรีเมียม', 'Premium Seafood BBQ Grill Set', 890, 'ชุด', 'พร้อมเตาปิ้งย่าง ถ่าน กุ้งแม่น้ำ ปลาหมึก หอยเชลล์ เสิร์ฟตรงถึงหน้าวิลล่า', 'Flame'),
('addon-floating-bf', 'เซ็ต Floating Breakfast ถ่ายรูปลอยน้ำ', 'Instagrammable Floating Breakfast Set', 650, 'เซ็ต (สำหรับ 2 ท่าน)', 'อาหารเช้าลอยน้ำในถาดหวายรูปหัวใจ ครัวซองต์ ผลไม้สด น้ำส้ม และกาแฟ', 'Coffee'),
('addon-extra-bed', 'เตียงเสริมพร้อมเซ็ตเครื่องนอนและอาหารเช้า', 'Extra Bed with Bedding & Breakfast', 600, 'เตียง/คืน', 'เตียงพับคุณภาพสูงพร้อมฟูกหนานุ่มและคูปองอาหารเช้าสำหรับ 1 ท่าน', 'BedDouble'),
('addon-kayak', 'บริการเช่าเรือคายัค & ซับบอร์ด (Paddle Board)', 'Kayak & Stand-up Paddle Board Rental', 350, 'ลำ/2 ชั่วโมง', 'พร้อมเสื้อชูชีพและอุปกรณ์พาย สนุกกับกิจกรรมทางน้ำหน้าหาดรีสอร์ท', 'Waves');

-- 4. Insert Promo Codes
INSERT OR IGNORE INTO promo_codes (code, description, discount_type, discount_value, min_spend) VALUES
('HAVEN10', 'ส่วนลด 10% สำหรับการจองครั้งแรก', 'PERCENT', 10, 2000),
('SUMMER500', 'ลดทันที 500 บาท เมื่อจองครบ 3,000 บาท', 'FIXED', 500, 3000),
('VIP20', 'โปรโมชันพิเศษสมาชิก VIP ลด 20%', 'PERCENT', 20, 5000);

-- 5. Insert Minibar Inventory
INSERT OR IGNORE INTO minibar_items (id, name_th, name_en, category, price, unit) VALUES
('mb-01', 'เบียร์สิงห์ (กระป๋อง 330ml)', 'Singha Beer (330ml Can)', 'BEVERAGE', 120, 'กระป๋อง'),
('mb-02', 'เบียร์ไฮเนเก้น (กระป๋อง 330ml)', 'Heineken Beer (330ml Can)', 'BEVERAGE', 140, 'กระป๋อง'),
('mb-03', 'ไวน์แดงอิตาลี Chianti Classico (750ml)', 'Italian Chianti Classico Red Wine (750ml)', 'BEVERAGE', 950, 'ขวด'),
('mb-04', 'น้ำแร่มีฟอง San Pellegrino (500ml)', 'San Pellegrino Sparkling Water (500ml)', 'BEVERAGE', 90, 'ขวด'),
('mb-05', 'น้ำแร่นำเข้า Evian (500ml)', 'Evian Natural Mineral Water (500ml)', 'BEVERAGE', 70, 'ขวด'),
('mb-06', 'ถั่วรวมอบเกลือพรีเมียม (Premium Mixed Nuts)', 'Premium Roasted Mixed Nuts', 'SNACK', 80, 'กระปุก'),
('mb-07', 'มะพร้าวอบกรอบสูตรชาววัง (Thai Coconut Chips)', 'Thai Crispy Coconut Chips', 'SNACK', 60, 'ซอง'),
('mb-08', 'ชุดอโรมาเธอราพี & สปา The Haven Luxury', 'The Haven Luxury Aroma Spa Kit', 'AMENITY', 350, 'เซ็ต');

-- 6. Insert Initial Reviews
INSERT OR IGNORE INTO reviews (id, room_id, guest_name, rating, cleanliness_rating, comment, stay_date) VALUES
('rev-01', 'room-pv-101', 'คุณธนกฤต มงคลสุข', 5, 5, 'สระว่ายน้ำสวยมาก วิวทะเล 180 องศาไม่มีอะไรมาบดบัง อาหารเช้าแบบ Floating Breakfast อร่อยและถ่ายรูปสวยมาก พนักงานบริการเป็นกันเองสุดๆ', '2026-09-20'),
('rev-02', 'room-pv-101', 'Sarah Jenkins', 5, 5, 'Absolutely spectacular oceanfront villa! The salt-water pool was spotless and the sunset was pure magic. Will definitely return next year.', '2026-09-15'),
('rev-03', 'room-pv-102', 'คุณภัทรินทร์ ชัยเวช', 5, 5, 'พาแฟนมาฉลองครบรอบ 3 ปี บรรยากาศโรแมนติกมาก พระอาทิตย์ตกหน้าห้องสวยจนลืมหายใจ บริการเตาบาร์บีคิวก็ยอดเยี่ยมครับ', '2026-09-24');
